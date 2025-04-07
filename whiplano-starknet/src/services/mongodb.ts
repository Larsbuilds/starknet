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
    private client: MongoClient | null = null;
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
            const username = process.env.MONGODB_USERNAME;
            const password = process.env.MONGODB_PASSWORD;
            const cluster = process.env.MONGODB_CLUSTER;
            const dbName = process.env.MONGODB_DB || 'StarknetDB';

            if (!username || !password || !cluster) {
                throw new Error('MongoDB configuration is incomplete. Please check your .env file.');
            }

            const uri = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${dbName}?retryWrites=true&w=majority`;
            
            try {
                this.client = new MongoClient(uri);
                await this.client.connect();
                this.db = this.client.db(dbName);
                console.log('Connected to MongoDB');
            } catch (error) {
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