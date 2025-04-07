import { config } from "dotenv";
import { starknet } from "hardhat";
import { expect } from "chai";
import { run } from "hardhat";

config();

async function main() {
    console.log("Starting StarkNet contract tests...");

    // Start StarkNet Devnet
    console.log("Starting StarkNet Devnet...");
    const devnet = await starknet.devnet.start();
    console.log("StarkNet Devnet started successfully");

    try {
        // Run unit tests
        console.log("\nRunning unit tests...");
        await run("test", { testFiles: ["test/unit/whiplano_contract_test.cairo"] });

        // Run integration tests
        console.log("\nRunning integration tests...");
        await run("test", { testFiles: ["test/integration/whiplano_integration_test.cairo"] });

        console.log("\nAll tests completed successfully!");
    } catch (error) {
        console.error("Tests failed:", error);
        process.exit(1);
    } finally {
        // Stop StarkNet Devnet
        console.log("\nStopping StarkNet Devnet...");
        await starknet.devnet.stop();
        console.log("StarkNet Devnet stopped");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 