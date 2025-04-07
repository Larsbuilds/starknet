import { MongoDBService } from '../src/services/mongodb';

async function testConnection() {
    console.log('Testing MongoDB connection...');
    
    try {
        const mongoService = MongoDBService.getInstance();
        await mongoService.connect();
        
        console.log('Successfully connected to MongoDB!');
        console.log('Database:', process.env.MONGODB_DB);
        
        // Create test collections if they don't exist
        const db = mongoService['db'];
        if (db) {
            await db.createCollection('contract_events');
            await db.createCollection('health_checks');
            console.log('Collections created/verified:');
            console.log('- contract_events');
            console.log('- health_checks');
        }
        
        await mongoService.disconnect();
        console.log('Connection test completed successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

testConnection()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Unexpected error:', error);
        process.exit(1);
    }); 