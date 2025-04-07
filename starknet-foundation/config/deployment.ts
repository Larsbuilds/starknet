export interface DeploymentConfig {
  network: 'alpha-goerli' | 'alpha-mainnet';
  maxUsers?: number;
  features: string[];
  isLimited: boolean;
  description: string;
}

export const DEPLOYMENT_STAGES: Record<string, DeploymentConfig> = {
  testnet: {
    network: 'alpha-goerli',
    features: ['basic-contract', 'event-indexing', 'health-monitoring'],
    isLimited: true,
    description: 'Initial testnet deployment for development and testing'
  },
  testnet_prod: {
    network: 'alpha-goerli',
    maxUsers: 100,
    features: ['basic-contract', 'event-indexing', 'health-monitoring', 'user-authentication'],
    isLimited: true,
    description: 'Testnet deployment with real users'
  },
  mainnet_limited: {
    network: 'alpha-mainnet',
    maxUsers: 1000,
    features: ['basic-contract', 'event-indexing', 'health-monitoring', 'user-authentication'],
    isLimited: true,
    description: 'Limited mainnet deployment with controlled user base'
  },
  mainnet_full: {
    network: 'alpha-mainnet',
    features: ['basic-contract', 'event-indexing', 'health-monitoring', 'user-authentication', 'full-features'],
    isLimited: false,
    description: 'Full mainnet deployment with all features'
  }
}; 