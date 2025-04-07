# Starknet Foundation API Documentation

## Contract Interface

### Constructor

```cairo
fn constructor(ref self: ContractState, initial_api_key: felt252)
```

Initializes the contract with an initial API key.

#### Parameters
- `initial_api_key: felt252` - The initial API key to set

#### Returns
- None

#### Events Emitted
- None

#### Example
```cairo
// Deploy contract with initial API key
constructor(123)
```

### Update API Key

```cairo
fn update_api_key(ref self: ContractState, new_api_key: felt252)
```

Updates the stored API key to a new value.

#### Parameters
- `new_api_key: felt252` - The new API key to set

#### Returns
- None

#### Events Emitted
- `ApiKeyUpdated`
  - `old_key: felt252` - Previous API key
  - `new_key: felt252` - New API key

#### Example
```cairo
// Update API key
update_api_key(456)
```

### Get API Key

```cairo
fn get_api_key(self: @ContractState) -> felt252
```

Retrieves the current API key.

#### Parameters
- None

#### Returns
- `felt252` - The current API key

#### Events Emitted
- None

#### Example
```cairo
// Get current API key
let current_key = get_api_key()
```

## Events

### ApiKeyUpdated

```cairo
struct ApiKeyUpdated {
    old_key: felt252,
    new_key: felt252,
}
```

Emitted when the API key is updated.

#### Fields
- `old_key: felt252` - The previous API key
- `new_key: felt252` - The new API key

## Error Handling

Currently, the contract does not implement explicit error handling. Future versions will include proper error messages and handling for various scenarios.

## Best Practices

1. Always verify the return value of `get_api_key`
2. Monitor `ApiKeyUpdated` events for any unauthorized changes
3. Keep API keys secure and never expose them in public transactions
4. Implement proper access control in your implementation

## Rate Limiting

There are currently no rate limits on API calls. Consider implementing rate limiting in your application layer.

## Versioning

The contract uses semantic versioning. Current version: v0.1.0

## Examples

### Complete Usage Example

```cairo
// Deploy contract
let contract = deploy_contract(123);

// Update API key
contract.update_api_key(456);

// Get current API key
let current_key = contract.get_api_key();
assert(current_key == 456, 'Key update failed');
``` 