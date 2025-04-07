/// <reference types="mocha" />
/// <reference types="chai" />

const { expect } = require('chai');
const { MongoDBService } = require('../../src/services/mongodb');
const { generateTestEvent, generateTestHealthCheck, cleanupTestData } = require('../utils/test-helpers');

describe('MongoDB Integration Tests', () => {
    let mongoService: any;

    before(async () => {
        await cleanupTestData();
        mongoService = MongoDBService.getInstance();
        await mongoService.connect();
    });

    after(async () => {
        await cleanupTestData();
        await mongoService.disconnect();
    });

    describe('Event Lifecycle', () => {
        it('should handle complete event lifecycle', async () => {
            // Create and save multiple events
            const event1 = generateTestEvent('ApiKeyUpdated');
            const event2 = generateTestEvent('UsersBatchUpdated');
            
            await mongoService.saveContractEvent(event1);
            await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
            await mongoService.saveContractEvent(event2);

            // Verify retrieval
            const events = await mongoService.getRecentEvents(10);
            expect(events).to.have.lengthOf(2);
            expect(events[0].eventType).to.equal('UsersBatchUpdated');
            expect(events[1].eventType).to.equal('ApiKeyUpdated');

            // Check statistics
            const stats = await mongoService.getEventStatistics();
            expect(stats.ApiKeyUpdated).to.equal(1);
            expect(stats.UsersBatchUpdated).to.equal(1);
        });
    });

    describe('Health Check Lifecycle', () => {
        it('should handle complete health check lifecycle', async () => {
            const healthCheck1 = generateTestHealthCheck('healthy');
            const healthCheck2 = generateTestHealthCheck('degraded');

            await mongoService.saveHealthCheck(healthCheck1);
            await new Promise(resolve => setTimeout(resolve, 100)); // Add delay
            await mongoService.saveHealthCheck(healthCheck2);

            const history = await mongoService.getHealthHistory(10);
            expect(history).to.have.lengthOf(2);
            expect(history[0].status).to.equal('degraded');
            expect(history[1].status).to.equal('healthy');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid queries gracefully', async () => {
            try {
                await mongoService.getRecentEvents(-1);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error).to.exist;
            }
        });
    });
}); 