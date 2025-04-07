# Testing Guide

## Prerequisites

Before running tests, ensure you have:
- Node.js and npm installed
- Cairo and Scarb installed
- MongoDB running locally
- All dependencies installed (`npm install`)

## Test Structure

The project has several test suites:
- Hardhat tests (`test/hardhat/`)
- Cairo tests (`test/cairo/`)
- MongoDB tests (`test/mongodb/`)
- Unit tests (`test/unit/`)
- Integration tests (`test/integration/`)

## Running Tests

1. Hardhat Tests:
```bash
npm run test:hardhat
```

2. Cairo Tests:
```bash
scarb test
```

3. MongoDB Tests:
```bash
npm run test:mongodb
```

4. Unit Tests:
```bash
npm run test:unit
```

5. Integration Tests:
```bash
npm run test:integration
```

6. Generate Test Data:
```bash
npm run test:data
```

## Writing Tests

1. Hardhat Tests:
   - Place in `test/hardhat/`
   - Use `describe` and `it` blocks
   - Import contract artifacts from `starknet-artifacts/`

2. Cairo Tests:
   - Place in `test/cairo/`
   - Use `#[test]` attribute
   - Import contract modules

3. MongoDB Tests:
   - Place in `test/mongodb/`
   - Use MongoDB test utilities
   - Clean up after tests

## Testing Environment

- Tests run against a local StarkNet node
- MongoDB runs locally
- Environment variables in `.env.test`

## Best Practices

1. Isolate tests
2. Clean up resources
3. Use meaningful test names
4. Document test requirements
5. Handle edge cases

## Troubleshooting

1. If tests fail:
   - Check MongoDB connection
   - Verify StarkNet node
   - Check environment variables
   - Review test logs

2. Common Issues:
   - Connection timeouts
   - Resource cleanup
   - Environment setup

## Test Results

All tests should pass before merging:
- Hardhat: 20 tests
- Cairo: 2 tests
- MongoDB: 20 tests
- Unit: 17 tests
- Integration: 3 tests 