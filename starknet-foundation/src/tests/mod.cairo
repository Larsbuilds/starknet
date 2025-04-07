use starknet_foundation::BaseContract;
use starknet::ContractAddress;
use starknet::test_utils::{get_contract_address, set_contract_address};

#[test]
#[available_gas(999999)]
fn test_contract_initialization() {
    let owner = ContractAddress::from(123);
    let initial_api_key = 456;
    
    let mut contract = BaseContract::unsafe_new_contract_state();
    BaseContract::constructor(ref contract, owner, initial_api_key);
    
    assert(contract.get_api_key() == initial_api_key, 'API key should match initial value');
}

#[test]
#[available_gas(999999)]
fn test_update_api_key() {
    let owner = ContractAddress::from(123);
    let initial_api_key = 456;
    let new_api_key = 789;
    
    let mut contract = BaseContract::unsafe_new_contract_state();
    BaseContract::constructor(ref contract, owner, initial_api_key);
    
    set_contract_address(owner);
    contract.update_api_key(new_api_key);
    
    assert(contract.get_api_key() == new_api_key, 'API key should be updated');
} 