# Testing Guide for Whiplano Starknet

This guide provides comprehensive information about testing the Whiplano Starknet project. It covers different types of tests, how to run them, and best practices for writing new tests.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Environment](#testing-environment)
- [Best Practices](#best-practices)

## Prerequisites

Before running tests, ensure you have:

1. Node.js and npm installed
2. Project dependencies installed (`npm install`)
3. Environment variables set up (copy `.env.example` to `.env`)
4. MongoDB instance running (for integration tests)
5. Python virtual environment activated (for Starknet contract testing)
6. Scarb installed (for Cairo tests)

## Test Structure

The project contains multiple types of tests:

```
whiplano-starknet/
├── src/
│   └── tests/           # Native Cairo contract tests
├── test/
│   ├── unit/           # TypeScript unit tests
│   ├── integration/    # TypeScript integration tests
│   └── utils/          # Testing utilities and helpers
```

### Cairo Contract Tests
- Located in `src/tests/`
- Written in Cairo language
- Test smart contract logic directly
- Run on Cairo VM
- Use Cairo's native testing framework

### TypeScript Tests
- Located in `test/`
- Written in TypeScript
- Test contract interactions and backend functionality
- Use Hardhat and Mocha frameworks

### Unit Tests
- Located in `test/unit/`
- Focus on testing individual components in isolation
- Fast execution and no external dependencies

### Integration Tests
- Located in `test/integration/`
- Test interactions between multiple components
- May require external services (MongoDB, Starknet node)

## Running Tests

### Available Test Commands

```bash
# Run all Hardhat tests (smart contract tests)
npm run test:hardhat

# Run all MongoDB-related tests
npm run test:mongodb

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run test data generation script
npm run test:data

# Run Cairo tests
scarb test
```

### Running Specific Tests

To run a specific test file:
```bash
# For TypeScript tests
npx mocha -r ts-node/register 'test/**/<filename>.test.ts'

# For Cairo tests
scarb test <test_file_name>
```

## Writing Tests

### Cairo Test Example

```cairo
#[cfg(test)]
mod tests {
    use super::WhiplanoContract;
    use starknet::ContractAddress;
    use starknet::test_utils::{get_contract_address, set_contract_address};

    #[test]
    #[available_gas(999999)]
    fn test_contract_initialization() {
        let owner = ContractAddress::from(123);
        let initial_api_key = 456;
        
        let contract = WhiplanoContract::unsafe_new_contract_state();
        WhiplanoContract::constructor(ref contract, owner, initial_api_key);
        
        assert(contract.get_api_key() == initial_api_key, 'API key should match initial value');
    }
}
```

### TypeScript Test Example

```typescript
import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('Component Name', () => {
  it('should perform expected behavior', async () => {
    // Arrange
    const input = 'test';

    // Act
    const result = await someFunction(input);

    // Assert
    expect(result).to.equal(expectedOutput);
  });
});
```

### Integration Test Example

```typescript
import { expect } from 'chai';
import { describe, it, before, after } from 'mocha';

describe('Integration Flow', () => {
  before(async () => {
    // Setup test environment
    await setupTestDb();
  });

  after(async () => {
    // Cleanup
    await cleanupTestDb();
  });

  it('should complete the entire flow', async () => {
    // Test implementation
  });
});
```

## Testing Environment

### Smart Contract Testing
- Uses Hardhat with Starknet plugin
- Supports multiple networks (devnet, testnet, mainnet)
- Configuration in `hardhat.config.ts`
- Native Cairo tests in `src/tests/`

### Backend Testing
- Uses Mocha test framework
- Chai for assertions
- TypeScript support via ts-node
- MongoDB for data persistence tests

## Best Practices

1. **Test Organization**
   - Keep test files close to the code they're testing
   - Use descriptive test names
   - Follow the AAA pattern (Arrange, Act, Assert)
   - Place Cairo tests in `src/tests/`
   - Place TypeScript tests in `test/`

2. **Test Isolation**
   - Each test should be independent
   - Clean up after tests
   - Use before/after hooks appropriately

3. **Mocking and Stubs**
   - Mock external services in unit tests
   - Use test doubles when appropriate
   - Keep integration tests realistic

4. **Contract Testing**
   - Test contract deployment
   - Verify contract interactions
   - Test both success and failure cases
   - Check event emissions
   - Use native Cairo tests for low-level contract logic
   - Use Hardhat tests for contract interactions

5. **Database Testing**
   - Use a separate test database
   - Clean up after tests
   - Test migrations and schemas

6. **CI/CD Considerations**
   - All tests should pass in CI
   - Keep unit tests fast
   - Separate slow integration tests

## Troubleshooting

Common issues and solutions:

1. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access

2. **Starknet Contract Testing**
   - Verify Python virtual environment
   - Check network configuration
   - Ensure sufficient test ETH for transactions
   - For Cairo tests, ensure Scarb is properly installed

3. **Test Timeouts**
   - Increase timeout for long-running tests
   - Consider optimizing test performance
   - Split large test suites

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Add appropriate documentation
3. Ensure all tests pass locally
4. Update this guide if needed
5. Place Cairo tests in `src/tests/`
6. Place TypeScript tests in `test/`

## Resources

- [Mocha Documentation](https://mochajs.org/)
- [Chai Documentation](https://www.chaijs.com/)
- [Starknet Testing Guide](https://docs.starknet.io/documentation/tools/testing/)
- [Hardhat Testing Guide](https://hardhat.org/hardhat-runner/docs/guides/test-contracts)
- [Cairo Testing Documentation](https://cairo-book.github.io/ch10-00-testing.html) 