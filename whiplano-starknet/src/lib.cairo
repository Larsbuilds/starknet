#[starknet::contract]
mod WhiplanoContract {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

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
    fn constructor(ref self: ContractState, owner: ContractAddress, initial_api_key: felt252) {
        self.owner.write(owner);
        self.whiplano_api_key.write(initial_api_key);
    }

    #[external(v0)]
    fn update_api_key(ref self: ContractState, new_api_key: felt252) {
        let caller = get_caller_address();
        assert(caller == self.owner.read(), 'Only owner can update API key');
        
        let old_key = self.whiplano_api_key.read();
        self.whiplano_api_key.write(new_api_key);
        
        self.emit(ApiKeyUpdated { old_key, new_key: new_api_key });
    }

    #[view]
    fn get_api_key(self: @ContractState) -> felt252 {
        self.whiplano_api_key.read()
    }
} 