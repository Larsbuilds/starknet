import { RpcProvider } from 'starknet';
import dotenv from 'dotenv';
import { HealthMonitor } from './health';

dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const NETWORK_URL = process.env.STARKNET_NETWORK === 'alpha-goerli' 
  ? 'https://alpha4.starknet.io' 
  : 'http://localhost:5050';

async function main() {
  console.log('Starting event indexer...');
  
  const provider = new RpcProvider({ nodeUrl: NETWORK_URL });
  const healthMonitor = new HealthMonitor();
  
  // Run health check every minute
  setInterval(async () => {
    const health = await healthMonitor.checkHealth();
    console.log('Health Status:', JSON.stringify(health, null, 2));
  }, 60000);

  // Poll for events every 10 seconds
  setInterval(async () => {
    try {
      const events = await provider.getEvents({
        address: CONTRACT_ADDRESS,
        keys: ['0x1'], // This is the event key for ApiKeyUpdated in our contract
        from_block: { block_number: 0 },
        to_block: 'latest'
      });

      events.events.forEach(event => {
        console.log('New ApiKeyUpdated event detected:');
        console.log('Block:', event.block_number);
        console.log('Transaction:', event.transaction_hash);
        console.log('Old Key:', event.data[0]);
        console.log('New Key:', event.data[1]);
        console.log('---');

        // Update health monitor with event stats
        healthMonitor.updateEventStats(new Date().toISOString());
      });
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, 10000);

  console.log('Event indexer is running. Press Ctrl+C to stop.');
}

main().catch(console.error); 