use starknet::ContractAddress;
use starknet::get_caller_address;

#[starknet::contract]
mod contract {
    use super::{ContractAddress, get_caller_address};

    #[storage]
    struct Storage {
        owner: ContractAddress,
        whiplano_api_key: felt252,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ApiKeyUpdated: ApiKeyUpdated,
    }

    #[derive(Drop, starknet::Event)]
    struct ApiKeyUpdated {
        old_key: felt252,
        new_key: felt252,
    }

    #[constructor]
    pub fn constructor(ref self: ContractState, owner: ContractAddress, initial_api_key: felt252) {
        self.owner.write(owner);
        self.whiplano_api_key.write(initial_api_key);
    }

    #[external(v0)]
    pub fn update_api_key(ref self: ContractState, new_api_key: felt252) {
        let caller = get_caller_address();
        assert(caller == self.owner.read(), 'not owner');
        
        let old_key = self.whiplano_api_key.read();
        self.whiplano_api_key.write(new_api_key);
        
        self.emit(ApiKeyUpdated { old_key, new_key: new_api_key });
    }

    #[external(v0)]
    pub fn get_api_key(self: @ContractState) -> felt252 {
        self.whiplano_api_key.read()
    }

    // Test interface trait
    #[generate_trait]
    pub impl TestImpl of TestTrait {
        fn create_contract() -> ContractState {
            unsafe_new_contract_state()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::contract;
    use starknet::ContractAddress;
    use starknet::testing::set_caller_address;

    fn create_contract_address(value: felt252) -> ContractAddress {
        value.try_into().unwrap()
    }

    #[test]
    #[available_gas(999999)]
    fn test_contract_initialization() {
        let owner = create_contract_address(123);
        let initial_api_key = 456;
        
        let mut contract = contract::unsafe_new_contract_state();
        contract::constructor(ref contract, owner, initial_api_key);
        
        assert(contract::get_api_key(@contract) == initial_api_key, 'wrong key');
    }

    #[test]
    #[available_gas(999999)]
    fn test_update_api_key() {
        let owner = create_contract_address(123);
        let initial_api_key = 456;
        let new_api_key = 789;
        
        let mut contract = contract::unsafe_new_contract_state();
        contract::constructor(ref contract, owner, initial_api_key);
        
        set_caller_address(owner);
        contract::update_api_key(ref contract, new_api_key);
        
        assert(contract::get_api_key(@contract) == new_api_key, 'wrong key');
    }
} 