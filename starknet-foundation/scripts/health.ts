import { config } from "dotenv";
import { starknet } from "hardhat";
import express from "express";
import { MongoDBService } from "../src/services/mongodb";

config();

const app = express();
const port = process.env.HEALTH_PORT || 3000;

async function checkContractHealth(contractAddress: string): Promise<string> {
    try {
        const contract = await starknet.getContractFromAddress(contractAddress);
        const apiKey = await contract.get_api_key();
        const userCount = await contract.get_user_count();
        const maxUsers = await contract.get_max_users();
        const isLimited = await contract.is_limited();

        return JSON.stringify({
            status: "healthy",
            apiKey: apiKey,
            userCount: userCount,
            maxUsers: maxUsers,
            isLimited: isLimited
        });
    } catch (error) {
        return JSON.stringify({
            status: "unhealthy",
            error: error.message
        });
    }
}

async function checkNetworkHealth(): Promise<string> {
    try {
        const provider = starknet.getProvider();
        const blockNumber = await provider.getBlockNumber();
        const chainId = await provider.getChainId();

        return JSON.stringify({
            status: "healthy",
            blockNumber: blockNumber,
            chainId: chainId
        });
    } catch (error) {
        return JSON.stringify({
            status: "unhealthy",
            error: error.message
        });
    }
}

async function performHealthCheck() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("CONTRACT_ADDRESS environment variable is not set");
    }

    const mongoService = MongoDBService.getInstance();
    await mongoService.connect();

    try {
        const contractHealth = await checkContractHealth(contractAddress);
        const networkHealth = await checkNetworkHealth();

        const healthCheck = {
            timestamp: new Date(),
            status: "healthy",
            details: {
                contractStatus: contractHealth,
                networkStatus: networkHealth,
                lastBlock: JSON.parse(networkHealth).blockNumber,
                userCount: JSON.parse(contractHealth).userCount
            }
        };

        await mongoService.saveHealthCheck(healthCheck);
        return healthCheck;
    } finally {
        await mongoService.disconnect();
    }
}

// Health check endpoint
app.get("/health", async (req, res) => {
    try {
        const healthCheck = await performHealthCheck();
        res.json(healthCheck);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
});

// Recent events endpoint
app.get("/events", async (req, res) => {
    const mongoService = MongoDBService.getInstance();
    await mongoService.connect();

    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const events = await mongoService.getRecentEvents(limit);
        res.json(events);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    } finally {
        await mongoService.disconnect();
    }
});

// Event stats endpoint
app.get("/stats", async (req, res) => {
    const mongoService = MongoDBService.getInstance();
    await mongoService.connect();

    try {
        const stats = await mongoService.getEventStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message
        });
    } finally {
        await mongoService.disconnect();
    }
});

// Start server
app.listen(port, () => {
    console.log(`Health monitoring server running on port ${port}`);
}); 