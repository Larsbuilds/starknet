# Whiplano StarkNet Quick Start Guide

## Environment Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Deployment Commands

### Development (Testnet)
```bash
# Set environment
export DEPLOYMENT_STAGE=testnet
export STARKNET_NETWORK=alpha-goerli

# Deploy
npm run deploy

# Start services
npm run start
```

### Testnet Production
```bash
# Set environment
export DEPLOYMENT_STAGE=testnet_prod
export STARKNET_NETWORK=alpha-goerli
export INITIAL_API_KEY=your_api_key

# Deploy
npm run deploy

# Start services
npm run start
```

### Mainnet Limited
```bash
# Set environment
export DEPLOYMENT_STAGE=mainnet_limited
export STARKNET_NETWORK=alpha-mainnet
export INITIAL_API_KEY=your_api_key

# Deploy
npm run deploy

# Start services
npm run start
```

### Mainnet Full
```bash
# Set environment
export DEPLOYMENT_STAGE=mainnet_full
export STARKNET_NETWORK=alpha-mainnet
export INITIAL_API_KEY=your_api_key

# Deploy
npm run deploy

# Start services
npm run start
```

## Common Operations

### Check Health Status
```bash
curl http://localhost:3000/health
```

### View Last Health Check
```bash
curl http://localhost:3000/health/last
```

### Compile Contract
```bash
npm run compile
```

### Run Tests
```bash
npm run test
```

## Troubleshooting

### Deployment Issues
1. Check network connection
2. Verify account balance
3. Confirm environment variables
4. Check contract compilation

### Health Monitoring Issues
1. Verify service is running
2. Check network connectivity
3. Confirm contract address
4. Review logs

### Event Indexing Issues
1. Check health status
2. Verify contract events
3. Review network status
4. Check logs

## Emergency Procedures

### Stop Services
```bash
# Find process IDs
ps aux | grep "node"

# Kill processes
kill <PID>
```

### Rollback Deployment
```bash
# Set previous deployment stage
export DEPLOYMENT_STAGE=previous_stage

# Redeploy
npm run deploy
```

## Support
For immediate assistance:
1. Check documentation
2. Review logs
3. Contact support team 