const { MongoDBService } = require('../../src/services/mongodb');

let lastTimestamp = Date.now();

function getUniqueTimestamp() {
  lastTimestamp += 1;
  return new Date(lastTimestamp);
}

function generateTestEvent(eventType: string, data: any = {}) {
  const timestamp = getUniqueTimestamp();
  console.log('Generating test event:', { type: eventType, timestamp });
  return {
    eventType,
    contractAddress: '0x1234567890abcdef',
    blockNumber: Math.floor(Math.random() * 1000000),
    transactionHash: '0x' + Math.random().toString(16).slice(2),
    timestamp,
    data
  };
}

function generateTestHealthCheck(status: string) {
  const timestamp = getUniqueTimestamp();
  console.log('Generating test health check:', { status, timestamp });
  return {
    timestamp,
    status,
    details: {
      contractStatus: 'active',
      networkStatus: 'connected',
      lastBlock: Math.floor(Math.random() * 1000000),
      userCount: Math.floor(Math.random() * 100)
    }
  };
}

async function cleanupTestData() {
  const mongoService = MongoDBService.getInstance();
  await mongoService.connect();
  
  // Clear test collections
  await mongoService.db.collection('contract_events').deleteMany({});
  await mongoService.db.collection('health_checks').deleteMany({});
  
  await mongoService.disconnect();
}

module.exports = {
  generateTestEvent,
  generateTestHealthCheck,
  cleanupTestData
}; 