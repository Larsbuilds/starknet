/// <reference types="mocha" />
/// <reference types="chai" />

const { expect } = require('chai');
const { MongoDBService } = require('../../src/services/mongodb');
const { generateTestEvent, generateTestHealthCheck, cleanupTestData } = require('../utils/test-helpers');

describe('MongoDB Service Unit Tests', function() {
    this.timeout(10000); // Increase timeout for all tests in this suite
    let mongoService: any;

    // Connect once before all tests
    before(async () => {
        mongoService = MongoDBService.getInstance();
        await mongoService.connect();
    });

    // Clean up and disconnect after all tests
    after(async () => {
        if (mongoService.db) {
            await cleanupTestData();
            await mongoService.disconnect();
        }
    });

    // Clean data before each test
    beforeEach(async function() {
        this.timeout(5000); // Increase timeout for cleanup operations
        if (!mongoService.db) {
            await mongoService.connect();
        }
        await cleanupTestData();
    });

    describe('Connection Management', () => {
        it('should maintain singleton instance', () => {
            const instance1 = MongoDBService.getInstance();
            const instance2 = MongoDBService.getInstance();
            expect(instance1).to.equal(instance2);
        });

        it('should connect to MongoDB successfully', async () => {
            expect(mongoService.db).to.not.be.null;
        });
    });

    describe('Contract Events', () => {
        it('should save and retrieve a contract event', async () => {
            const testEvent = generateTestEvent('TestEvent', { test: 'data' });
            await mongoService.saveContractEvent(testEvent);

            const events = await mongoService.getRecentEvents(1);
            expect(events).to.have.lengthOf(1);
            expect(events[0].eventType).to.equal('TestEvent');
            expect(events[0].data.test).to.equal('data');
        });

        it('should retrieve events in reverse chronological order', async () => {
            const events = [
                generateTestEvent('Event1', { data: 1 }),
                generateTestEvent('Event2', { data: 2 }),
                generateTestEvent('Event3', { data: 3 })
            ];

            // Add delays between insertions to ensure different timestamps
            for (const event of events) {
                await mongoService.saveContractEvent(event);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const retrievedEvents = await mongoService.getRecentEvents(3);
            expect(retrievedEvents).to.have.lengthOf(3);
            // Most recent event (Event3) should be first
            expect(retrievedEvents[0].eventType).to.equal('Event3');
            // Second most recent event (Event2) should be second
            expect(retrievedEvents[1].eventType).to.equal('Event2');
            // Oldest event (Event1) should be last
            expect(retrievedEvents[2].eventType).to.equal('Event1');
        });

        it('should respect the limit parameter when retrieving events', async () => {
            const events = [
                generateTestEvent('Event1', { data: 1 }),
                generateTestEvent('Event2', { data: 2 }),
                generateTestEvent('Event3', { data: 3 })
            ];

            for (const event of events) {
                await mongoService.saveContractEvent(event);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const retrievedEvents = await mongoService.getRecentEvents(2);
            expect(retrievedEvents).to.have.lengthOf(2);
            // Most recent event (Event3) should be first
            expect(retrievedEvents[0].eventType).to.equal('Event3');
            // Second most recent event (Event2) should be second
            expect(retrievedEvents[1].eventType).to.equal('Event2');
        });
    });

    describe('Health Checks', () => {
        it('should save and retrieve a health check', async () => {
            const healthCheck = generateTestHealthCheck('healthy');
            await mongoService.saveHealthCheck(healthCheck);

            const checks = await mongoService.getHealthHistory(1);
            expect(checks).to.have.lengthOf(1);
            expect(checks[0].status).to.equal('healthy');
            expect(checks[0].details.contractStatus).to.equal('active');
        });

        it('should retrieve health checks in reverse chronological order', async () => {
            const checks = [
                generateTestHealthCheck('healthy'),
                generateTestHealthCheck('degraded'),
                generateTestHealthCheck('healthy')
            ];

            for (const check of checks) {
                await mongoService.saveHealthCheck(check);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            const retrievedChecks = await mongoService.getHealthHistory(3);
            expect(retrievedChecks).to.have.lengthOf(3);
            // Most recent health check should be first
            expect(retrievedChecks[0].status).to.equal('healthy');
            // Second most recent health check should be second
            expect(retrievedChecks[1].status).to.equal('degraded');
            // Oldest health check should be last
            expect(retrievedChecks[2].status).to.equal('healthy');
        });
    });

    describe('Event Statistics', () => {
        it('should generate correct event statistics', async () => {
            const events = [
                generateTestEvent('TypeA', { data: 1 }),
                generateTestEvent('TypeA', { data: 2 }),
                generateTestEvent('TypeB', { data: 3 })
            ];

            for (const event of events) {
                await mongoService.saveContractEvent(event);
            }

            const stats = await mongoService.getEventStatistics();
            expect(stats.TypeA).to.equal(2);
            expect(stats.TypeB).to.equal(1);
        });
    });

    describe('Performance Tests', () => {
        it('should handle event operations within acceptable time limits', async () => {
            const startTime = Date.now();
            const testEvent = generateTestEvent('PerformanceTest');
            await mongoService.saveContractEvent(testEvent);
            const saveTime = Date.now() - startTime;
            expect(saveTime).to.be.lessThan(1000, 'Event save operation took too long');

            const retrieveStart = Date.now();
            await mongoService.getRecentEvents(1);
            const retrieveTime = Date.now() - retrieveStart;
            expect(retrieveTime).to.be.lessThan(500, 'Event retrieval operation took too long');
        });

        it('should handle health check operations within acceptable time limits', async () => {
            const startTime = Date.now();
            const healthCheck = generateTestHealthCheck('healthy');
            await mongoService.saveHealthCheck(healthCheck);
            const saveTime = Date.now() - startTime;
            expect(saveTime).to.be.lessThan(1000, 'Health check save operation took too long');

            const retrieveStart = Date.now();
            await mongoService.getHealthHistory(1);
            const retrieveTime = Date.now() - retrieveStart;
            expect(retrieveTime).to.be.lessThan(500, 'Health check retrieval operation took too long');
        });

        it('should handle bulk operations efficiently', async () => {
            const startTime = Date.now();
            const events = Array(100).fill(null).map((_, i) => 
                generateTestEvent(`BulkTest${i}`)
            );
            
            for (const event of events) {
                await mongoService.saveContractEvent(event);
            }
            const bulkSaveTime = Date.now() - startTime;
            expect(bulkSaveTime).to.be.lessThan(6000, 'Bulk event save operations took too long');

            const retrieveStart = Date.now();
            await mongoService.getRecentEvents(100);
            const bulkRetrieveTime = Date.now() - retrieveStart;
            expect(bulkRetrieveTime).to.be.lessThan(1000, 'Bulk event retrieval took too long');
        });
    });
}); 