import { RpcProvider } from 'starknet';
import dotenv from 'dotenv';

dotenv.config();

interface HealthStatus {
  timestamp: string;
  network: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latency: number;
    lastBlock: number;
  };
  contract: {
    status: 'healthy' | 'unhealthy';
    address: string;
    lastEvent: string | null;
  };
  indexer: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastPoll: string;
    eventsProcessed: number;
  };
  apiKey: {
    status: 'healthy' | 'unhealthy';
    lastUpdate: string | null;
  };
}

export class HealthMonitor {
  private provider: RpcProvider;
  private contractAddress: string;
  private lastHealthCheck: HealthStatus | null = null;
  private eventsProcessed: number = 0;
  private lastEventTime: string | null = null;

  constructor() {
    const NETWORK_URL = process.env.STARKNET_NETWORK === 'alpha-goerli' 
      ? 'https://alpha4.starknet.io' 
      : 'http://localhost:5050';
    
    this.provider = new RpcProvider({ nodeUrl: NETWORK_URL });
    this.contractAddress = process.env.CONTRACT_ADDRESS || '';
  }

  async checkNetworkHealth(): Promise<HealthStatus['network']> {
    try {
      const startTime = Date.now();
      const block = await this.provider.getBlockHashAndNumber();
      const latency = Date.now() - startTime;

      return {
        status: latency < 1000 ? 'healthy' : 'degraded',
        latency,
        lastBlock: block.block_number
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        latency: -1,
        lastBlock: -1
      };
    }
  }

  async checkContractHealth(): Promise<HealthStatus['contract']> {
    try {
      const events = await this.provider.getEvents({
        address: this.contractAddress,
        keys: ['0x1'],
        from_block: { block_number: 0 },
        to_block: 'latest',
        page_size: 1
      });

      return {
        status: 'healthy',
        address: this.contractAddress,
        lastEvent: events.events[0]?.transaction_hash || null
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        address: this.contractAddress,
        lastEvent: null
      };
    }
  }

  getIndexerHealth(): HealthStatus['indexer'] {
    return {
      status: this.eventsProcessed > 0 ? 'healthy' : 'degraded',
      lastPoll: new Date().toISOString(),
      eventsProcessed: this.eventsProcessed
    };
  }

  getApiKeyHealth(): HealthStatus['apiKey'] {
    return {
      status: this.lastEventTime ? 'healthy' : 'unhealthy',
      lastUpdate: this.lastEventTime
    };
  }

  async checkHealth(): Promise<HealthStatus> {
    const [network, contract] = await Promise.all([
      this.checkNetworkHealth(),
      this.checkContractHealth()
    ]);

    const healthStatus: HealthStatus = {
      timestamp: new Date().toISOString(),
      network,
      contract,
      indexer: this.getIndexerHealth(),
      apiKey: this.getApiKeyHealth()
    };

    this.lastHealthCheck = healthStatus;
    return healthStatus;
  }

  updateEventStats(eventTime: string) {
    this.eventsProcessed++;
    this.lastEventTime = eventTime;
  }

  getLastHealthCheck(): HealthStatus | null {
    return this.lastHealthCheck;
  }
} 