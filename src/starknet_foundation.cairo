#[starknet::contract]
mod contract {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::ContractAddressZeroable;
    use starknet::storage_access::StorageAccess;
    use starknet::storage_access::StorageBaseAddress;
    use starknet::ContractAddressZeroableTrait;

    #[storage]
    struct Storage {
        starknet_foundation_api_key: felt252,
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
    fn constructor(ref self: ContractState, initial_api_key: felt252) {
        self.starknet_foundation_api_key.write(initial_api_key);
    }

    #[external(v0)]
    fn update_api_key(ref self: ContractState, new_api_key: felt252) {
        let old_key = self.starknet_foundation_api_key.read();
        self.starknet_foundation_api_key.write(new_api_key);
        self.emit(ApiKeyUpdated { old_key, new_key });
    }

    #[external(v0)]
    fn get_api_key(self: @ContractState) -> felt252 {
        self.starknet_foundation_api_key.read()
    }
} 