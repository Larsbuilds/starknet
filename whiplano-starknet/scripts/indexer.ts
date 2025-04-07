import { config } from "dotenv";
import { starknet } from "hardhat";
import { MongoDBService } from "../src/services/mongodb";

config();

async function main() {
    console.log("Starting Whiplano contract indexer...");

    // Initialize MongoDB
    const mongoService = MongoDBService.getInstance();
    await mongoService.connect();

    try {
        // Get contract address from environment
        const contractAddress = process.env.CONTRACT_ADDRESS;
        if (!contractAddress) {
            throw new Error("CONTRACT_ADDRESS environment variable is not set");
        }

        // Get contract instance
        const contract = await starknet.getContractFromAddress(contractAddress);

        // Listen for events
        console.log("Listening for contract events...");
        contract.on("ApiKeyUpdated", async (event) => {
            console.log("ApiKeyUpdated event detected");
            await mongoService.saveContractEvent({
                eventType: "ApiKeyUpdated",
                contractAddress,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                data: {
                    oldKey: event.oldKey,
                    newKey: event.newKey
                },
                timestamp: new Date()
            });
        });

        contract.on("UsersBatchUpdated", async (event) => {
            console.log("UsersBatchUpdated event detected");
            await mongoService.saveContractEvent({
                eventType: "UsersBatchUpdated",
                contractAddress,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                data: {
                    batchId: event.batchId,
                    addedUsers: event.addedUsers,
                    removedUsers: event.removedUsers
                },
                timestamp: new Date()
            });
        });

        contract.on("LimitChanged", async (event) => {
            console.log("LimitChanged event detected");
            await mongoService.saveContractEvent({
                eventType: "LimitChanged",
                contractAddress,
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash,
                data: {
                    oldLimit: event.oldLimit,
                    newLimit: event.newLimit
                },
                timestamp: new Date()
            });
        });

        // Keep the process running
        process.on('SIGINT', async () => {
            console.log("Shutting down indexer...");
            await mongoService.disconnect();
            process.exit(0);
        });

    } catch (error) {
        console.error("Error in indexer:", error);
        await mongoService.disconnect();
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 