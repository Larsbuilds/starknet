import { starknet } from "hardhat";
import { DEPLOYMENT_STAGES, DeploymentConfig } from "../config/deployment";
import dotenv from "dotenv";

dotenv.config();

async function deployContract(config: DeploymentConfig) {
  console.log(`Starting deployment for stage: ${config.description}`);
  console.log('Features to be deployed:', config.features);
  
  if (config.maxUsers) {
    console.log(`Maximum users allowed: ${config.maxUsers}`);
  }

  try {
    const account = await starknet.getAccountFromAddress(
      process.env.ACCOUNT_ADDRESS || "",
      process.env.PRIVATE_KEY || "",
      "OpenZeppelin"
    );

    const contractFactory = await starknet.getContractFactory("WhiplanoContract");
    
    // Deploy with appropriate constructor arguments based on stage
    const constructorArgs = {
      owner: account.address,
      initial_api_key: process.env.INITIAL_API_KEY || "0x0",
      max_users: config.maxUsers || 0,
      is_limited: config.isLimited ? 1 : 0
    };

    console.log('Deploying contract with arguments:', constructorArgs);
    
    const contract = await contractFactory.deploy(account, constructorArgs);
    console.log('Contract deployed successfully!');
    console.log('Contract address:', contract.address);
    console.log('Transaction hash:', contract.deployTransactionHash);

    return contract;
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

async function main() {
  const stage = process.env.DEPLOYMENT_STAGE || 'testnet';
  const config = DEPLOYMENT_STAGES[stage];

  if (!config) {
    throw new Error(`Invalid deployment stage: ${stage}`);
  }

  console.log(`\n=== Starting ${stage.toUpperCase()} Deployment ===\n`);
  
  // Verify environment variables
  if (!process.env.ACCOUNT_ADDRESS || !process.env.PRIVATE_KEY) {
    throw new Error('Missing required environment variables: ACCOUNT_ADDRESS and PRIVATE_KEY');
  }

  if (stage !== 'testnet' && !process.env.INITIAL_API_KEY) {
    throw new Error('INITIAL_API_KEY is required for non-testnet deployments');
  }

  const contract = await deployContract(config);
  
  console.log(`\n=== ${stage.toUpperCase()} Deployment Complete ===\n`);
  console.log('Next steps:');
  console.log('1. Verify contract on StarkScan');
  console.log('2. Update .env with new contract address');
  console.log('3. Start the indexer and health monitor');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 