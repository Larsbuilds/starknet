const { MongoClient } = require('mongodb');
require('dotenv').config();

interface ContractEvent {
    eventType: string;
    contractAddress: string;
    blockNumber: number;
    transactionHash: string;
    data: any;
    timestamp: Date;
}

interface HealthCheck {
    timestamp: Date;
    status: string;
    details: {
        contractStatus: string;
        networkStatus: string;
        lastBlock: number;
        userCount: number;
    };
}

class MongoDBService {
    private static instance: MongoDBService;
    private client: typeof MongoClient | null = null;
    private db: any = null;

    private constructor() {}

    static getInstance(): MongoDBService {
        if (!MongoDBService.instance) {
            MongoDBService.instance = new MongoDBService();
        }
        return MongoDBService.instance;
    }

    async connect() {
        if (!this.client) {
            try {
                const uri = process.env.MONGODB_URI;
                if (!uri) {
                    throw new Error('MongoDB URI is not configured. Please check your .env file.');
                }

                this.client = new MongoClient(uri);
                await this.client.connect();
                const dbName = process.env.MONGODB_DB || 'StarknetDB';
                this.db = this.client.db(dbName);
                console.log('Connected to MongoDB');

                // Test the connection
                await this.db.command({ ping: 1 });
                console.log('MongoDB connection verified');
            } catch (error) {
                this.client = null;
                this.db = null;
                console.error('Error connecting to MongoDB:', error);
                throw error;
            }
        }
        return this.db;
    }

    async disconnect() {
        if (this.client) {
            try {
                await this.client.close();
                this.client = null;
                this.db = null;
                console.log('Disconnected from MongoDB');
            } catch (error) {
                console.error('Error disconnecting from MongoDB:', error);
                throw error;
            }
        }
    }

    async saveContractEvent(event: ContractEvent) {
        if (!this.db) throw new Error('Not connected to MongoDB');
        event.timestamp = new Date(event.timestamp);
        return this.db.collection('contract_events').insertOne(event);
    }

    private async retryWithBackoff<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        initialDelay: number = 1000
    ): Promise<T> {
        let lastError: Error | null = null;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error: any) {
                lastError = error;
                if (i < maxRetries - 1) {
                    const delay = initialDelay * Math.pow(2, i);
                    console.warn(`Retry attempt ${i + 1} failed. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw lastError || new Error('Operation failed after all retry attempts');
    }

    async saveContractEvents(events: ContractEvent[]): Promise<void> {
        if (!this.db) throw new Error('Not connected to MongoDB');
        
        // Convert timestamps to Date objects
        events.forEach(event => {
            event.timestamp = new Date(event.timestamp);
        });
        
        // Validate events before insertion
        const validEvents = events.filter(event => event.eventType);
        const invalidEvents = events.filter(event => !event.eventType);
        
        if (validEvents.length === 0) {
            throw new Error('No valid events to save');
        }

        try {
            await this.retryWithBackoff(async () => {
                await this.db.collection('contract_events').insertMany(validEvents, { ordered: false });
            });
        } catch (error: any) {
            console.error(`Failed to save events after all retry attempts: ${error.message}`);
            
            // Verify all valid events were saved
            const savedEvents = await this.db.collection('contract_events')
                .find({ eventType: { $in: validEvents.map(e => e.eventType) } })
                .sort({ timestamp: -1 })
                .limit(validEvents.length)
                .toArray();
                
            if (savedEvents.length < validEvents.length) {
                // Some valid events weren't saved, try to save them individually
                const unsavedEvents = validEvents.filter(event => 
                    !savedEvents.some((saved: ContractEvent) => saved.eventType === event.eventType)
                );
                
                for (const event of unsavedEvents) {
                    try {
                        await this.retryWithBackoff(async () => {
                            await this.db.collection('contract_events').insertOne(event);
                        });
                    } catch (err: any) {
                        console.error(`Failed to save individual event: ${err.message}`);
                    }
                }
            }
        }

        if (invalidEvents.length > 0) {
            console.warn(`Failed to save ${invalidEvents.length} invalid events`);
        }
    }

    async getRecentEvents(limit: number = 10): Promise<ContractEvent[]> {
        if (!this.db) throw new Error('Not connected to MongoDB');
        if (limit <= 0) throw new Error('Limit must be positive');
        
        return this.db.collection('contract_events')
            .find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
    }

    async saveHealthCheck(healthCheck: HealthCheck) {
        if (!this.db) throw new Error('Not connected to MongoDB');
        healthCheck.timestamp = new Date(healthCheck.timestamp);
        return this.db.collection('health_checks').insertOne(healthCheck);
    }

    async saveHealthChecks(healthChecks: HealthCheck[]): Promise<void> {
        if (!this.db) throw new Error('Not connected to MongoDB');
        
        // Convert timestamps to Date objects
        healthChecks.forEach(check => {
            check.timestamp = new Date(check.timestamp);
        });
        
        // Validate health checks before insertion
        const validChecks = healthChecks.filter(check => check.status);
        const invalidChecks = healthChecks.filter(check => !check.status);
        
        if (validChecks.length === 0) {
            throw new Error('No valid health checks to save');
        }

        try {
            await this.retryWithBackoff(async () => {
                await this.db.collection('health_checks').insertMany(validChecks, { ordered: true });
            });
        } catch (error: any) {
            console.error(`Failed to save health checks after all retry attempts: ${error.message}`);
            
            // Get all valid checks that should have been saved
            const validTimestamps = validChecks.map(check => check.timestamp);
            
            // Verify if all valid checks were saved
            const savedChecks = await this.db.collection('health_checks')
                .find({ 
                    timestamp: { $in: validTimestamps }
                })
                .sort({ timestamp: -1 })
                .toArray();
                
            if (savedChecks.length < validChecks.length) {
                // Not all checks were saved, try to save them individually
                const unsavedChecks = validChecks.filter(check => 
                    !savedChecks.some((saved: HealthCheck) => saved.timestamp.getTime() === check.timestamp.getTime())
                );
                
                for (const check of unsavedChecks) {
                    try {
                        await this.retryWithBackoff(async () => {
                            await this.db.collection('health_checks').insertOne(check);
                        });
                    } catch (err: any) {
                        console.error(`Failed to save individual health check: ${err.message}`);
                    }
                }
            }
        }

        if (invalidChecks.length > 0) {
            console.warn(`Failed to save ${invalidChecks.length} invalid health checks`);
        }
    }

    async getHealthHistory(limit: number = 10): Promise<HealthCheck[]> {
        if (!this.db) throw new Error('Not connected to MongoDB');
        if (limit <= 0) throw new Error('Limit must be positive');
        
        return this.db.collection('health_checks')
            .find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
    }

    async getEventStatistics() {
        if (!this.db) throw new Error('Not connected to MongoDB');
        
        const stats = await this.db.collection('contract_events')
            .aggregate([
                {
                    $group: {
                        _id: '$eventType',
                        count: { $sum: 1 },
                        lastOccurrence: { $max: '$timestamp' }
                    }
                }
            ]).toArray();

        const result: { [key: string]: number } = {};
        stats.forEach((stat: any) => {
            result[stat._id] = stat.count;
        });
        
        return result;
    }
}

module.exports = { MongoDBService }; 