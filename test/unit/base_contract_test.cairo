use starknet_foundation::starknet_foundation::contract::ContractState;
use starknet_foundation::starknet_foundation::contract::ApiKeyUpdated;
use starknet_foundation::starknet_foundation::contract::Event;

#[test]
fn test_contract_initialization() {
    let initial_api_key = 123;
    let mut state = ContractState::default();
    state.constructor(initial_api_key);
    assert(state.starknet_foundation_api_key.read() == initial_api_key, 'API key not set correctly');
}

#[test]
fn test_update_api_key() {
    let initial_api_key = 123;
    let new_api_key = 456;
    let mut state = ContractState::default();
    state.constructor(initial_api_key);
    state.update_api_key(new_api_key);
    assert(state.starknet_foundation_api_key.read() == new_api_key, 'API key not updated');
} 