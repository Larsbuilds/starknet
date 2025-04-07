namespace TestData {
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

    const mongodb = require('../src/services/mongodb');

    async function insertTestData() {
        console.log('Inserting test data into MongoDB...');
        
        try {
            const mongoService = mongodb.MongoDBService.getInstance();
            await mongoService.connect();
            
            // Insert test contract events
            const testEvents: ContractEvent[] = [
                {
                    eventType: 'ApiKeyUpdated',
                    contractAddress: '0x123...abc',
                    blockNumber: 1000,
                    transactionHash: '0xabc...123',
                    data: {
                        oldKey: 'old_key_123',
                        newKey: 'new_key_456'
                    },
                    timestamp: new Date()
                },
                {
                    eventType: 'UsersBatchUpdated',
                    contractAddress: '0x123...abc',
                    blockNumber: 1001,
                    transactionHash: '0xdef...456',
                    data: {
                        batchId: 1,
                        addedUsers: ['0x111', '0x222'],
                        removedUsers: []
                    },
                    timestamp: new Date()
                },
                {
                    eventType: 'LimitChanged',
                    contractAddress: '0x123...abc',
                    blockNumber: 1002,
                    transactionHash: '0xghi...789',
                    data: {
                        oldLimit: 100,
                        newLimit: 200
                    },
                    timestamp: new Date()
                }
            ];

            for (const event of testEvents) {
                await mongoService.saveContractEvent(event);
            }
            console.log('Test contract events inserted successfully');

            // Insert test health checks
            const testHealthChecks: HealthCheck[] = [
                {
                    timestamp: new Date(),
                    status: 'healthy',
                    details: {
                        contractStatus: 'operational',
                        networkStatus: 'connected',
                        lastBlock: 1000,
                        userCount: 50
                    }
                },
                {
                    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
                    status: 'healthy',
                    details: {
                        contractStatus: 'operational',
                        networkStatus: 'connected',
                        lastBlock: 999,
                        userCount: 48
                    }
                }
            ];

            for (const check of testHealthChecks) {
                await mongoService.saveHealthCheck(check);
            }
            console.log('Test health checks inserted successfully');

            // Query and display the test data
            console.log('\nRetrieving recent events:');
            const recentEvents = await mongoService.getRecentEvents(5);
            console.log(JSON.stringify(recentEvents, null, 2));

            console.log('\nRetrieving health history:');
            const healthHistory = await mongoService.getHealthHistory(5);
            console.log(JSON.stringify(healthHistory, null, 2));

            console.log('\nRetrieving event statistics:');
            const eventStats = await mongoService.getEventStatistics();
            console.log(JSON.stringify(eventStats, null, 2));

            await mongoService.disconnect();
            console.log('\nTest data operations completed successfully!');
        } catch (error) {
            console.error('Error during test data operations:', error);
            process.exit(1);
        }
    }

    insertTestData()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Unexpected error:', error);
            process.exit(1);
        });
} 