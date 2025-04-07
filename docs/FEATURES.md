# StarkNet Foundation Features

## Contract Features

- `update_api_key`: Update the StarkNet Foundation API key
- `get_api_key`: Retrieve the current API key

## Storage Structure

```cairo
struct Storage {
    starknet_foundation_api_key: felt252,
}
```

## Events

- `ApiKeyUpdated`: Emitted when the API key is updated
  - `old_key`: The previous API key
  - `new_key`: The new API key 