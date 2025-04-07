use starknet::ContractAddress;
use starknet::get_caller_address;
use array::ArrayTrait;
use option::OptionTrait;
use traits::Into;

#[starknet::contract]
mod contract {
    use super::{ContractAddress, get_caller_address, ArrayTrait, OptionTrait, Into};

    #[storage]
    struct Storage {
        // Core state
        owner: ContractAddress,
        api_key: felt252,
        is_limited: bool,
        
        // Efficient user management using bitmaps
        user_bitmap: LegacyMap<u32, u256>,  // Each u256 can store 256 users
        user_count: u32,
        max_users: u32,
        
        // Batch operation tracking
        last_batch_id: u32,
        pending_batch: BatchData
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        ApiKeyUpdated: ApiKeyUpdated,
        UsersBatchUpdated: UsersBatchUpdated,
        LimitChanged: LimitChanged
    }

    #[derive(Drop, starknet::Event)]
    struct ApiKeyUpdated {
        old_key: felt252,
        new_key: felt252
    }

    #[derive(Drop, starknet::Event)]
    struct UsersBatchUpdated {
        batch_id: u32,
        added_users: Array<ContractAddress>,
        removed_users: Array<ContractAddress>
    }

    #[derive(Drop, starknet::Event)]
    struct LimitChanged {
        old_limit: u32,
        new_limit: u32
    }

    #[derive(Drop, Serde)]
    struct BatchData {
        added_users: Array<ContractAddress>,
        removed_users: Array<ContractAddress>
    }

    #[constructor]
    pub fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        initial_api_key: felt252,
        max_users: u32,
        is_limited: bool
    ) {
        self.owner.write(owner);
        self.api_key.write(initial_api_key);
        self.max_users.write(max_users);
        self.is_limited.write(is_limited);
        self.user_count.write(0);
        self.last_batch_id.write(0);
        
        // Initialize empty batch
        let empty_batch = BatchData {
            added_users: ArrayTrait::new(),
            removed_users: ArrayTrait::new()
        };
        self.pending_batch.write(empty_batch);
    }

    // Efficient user bitmap operations
    fn get_bitmap_index_and_mask(user: ContractAddress) -> (u32, u256) {
        let user_index = user.into();
        let bitmap_index = user_index / 256;
        let bit_position = user_index % 256;
        let mask = 1_u256 << bit_position;
        (bitmap_index, mask)
    }

    fn is_user_in_bitmap(self: @ContractState, user: ContractAddress) -> bool {
        let (bitmap_index, mask) = get_bitmap_index_and_mask(user);
        let bitmap = self.user_bitmap.read(bitmap_index);
        (bitmap & mask) != 0_u256
    }

    fn set_user_in_bitmap(ref self: ContractState, user: ContractAddress, value: bool) {
        let (bitmap_index, mask) = get_bitmap_index_and_mask(user);
        let current_bitmap = self.user_bitmap.read(bitmap_index);
        let new_bitmap = if value {
            current_bitmap | mask
        } else {
            current_bitmap & !mask
        };
        self.user_bitmap.write(bitmap_index, new_bitmap);
    }

    #[external(v0)]
    pub fn update_api_key(ref self: ContractState, new_api_key: felt252) {
        let caller = get_caller_address();
        assert(caller == self.owner.read(), 'Only owner can update API key');
        
        let old_key = self.api_key.read();
        self.api_key.write(new_api_key);
        
        self.emit(ApiKeyUpdated { old_key, new_key: new_api_key });
    }

    #[external(v0)]
    pub fn batch_update_users(
        ref self: ContractState,
        users_to_add: Array<ContractAddress>,
        users_to_remove: Array<ContractAddress>
    ) {
        let caller = get_caller_address();
        assert(caller == self.owner.read(), 'Only owner can update users');
        
        if self.is_limited.read() {
            let current_count = self.user_count.read();
            let max_users = self.max_users.read();
            let new_users = users_to_add.len();
            assert(current_count + new_users <= max_users, 'User limit would be exceeded');
        }

        // Process additions
        let mut added_count = 0;
        let mut i = 0;
        loop {
            if i >= users_to_add.len() {
                break;
            }
            let user = users_to_add[i];
            if !is_user_in_bitmap(@self, user) {
                set_user_in_bitmap(ref self, user, true);
                added_count += 1;
            }
            i += 1;
        }

        // Process removals
        let mut removed_count = 0;
        let mut i = 0;
        loop {
            if i >= users_to_remove.len() {
                break;
            }
            let user = users_to_remove[i];
            if is_user_in_bitmap(@self, user) {
                set_user_in_bitmap(ref self, user, false);
                removed_count += 1;
            }
            i += 1;
        }

        // Update user count in a single write
        self.user_count.write(self.user_count.read() + added_count - removed_count);

        // Emit batch event
        let batch_id = self.last_batch_id.read() + 1;
        self.last_batch_id.write(batch_id);
        self.emit(UsersBatchUpdated { batch_id, added_users: users_to_add, removed_users: users_to_remove });
    }

    #[external(v0)]
    pub fn update_user_limit(ref self: ContractState, new_limit: u32) {
        let caller = get_caller_address();
        assert(caller == self.owner.read(), 'Only owner can update user limit');
        
        let old_limit = self.max_users.read();
        self.max_users.write(new_limit);
        self.emit(LimitChanged { old_limit, new_limit });
    }

    #[view]
    pub fn get_api_key(self: @ContractState) -> felt252 {
        self.api_key.read()
    }

    #[view]
    pub fn is_user_allowed(self: @ContractState, user: ContractAddress) -> bool {
        is_user_in_bitmap(@self, user)
    }

    #[view]
    pub fn get_user_count(self: @ContractState) -> u32 {
        self.user_count.read()
    }

    #[view]
    pub fn get_max_users(self: @ContractState) -> u32 {
        self.max_users.read()
    }

    #[view]
    pub fn is_limited(self: @ContractState) -> bool {
        self.is_limited.read()
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
    use array::ArrayTrait;

    fn create_contract_address(value: felt252) -> ContractAddress {
        value.try_into().unwrap()
    }

    #[test]
    #[available_gas(999999)]
    fn test_contract_initialization() {
        let owner = create_contract_address(123);
        let initial_api_key = 456;
        let max_users = 1000;
        let is_limited = true;
        
        let mut contract = contract::unsafe_new_contract_state();
        contract::constructor(ref contract, owner, initial_api_key, max_users, is_limited);
        
        assert(contract::get_api_key(@contract) == initial_api_key, 'wrong key');
        assert(contract::get_max_users(@contract) == max_users, 'wrong max users');
        assert(contract::is_limited(@contract) == is_limited, 'wrong limit status');
        assert(contract::get_user_count(@contract) == 0, 'wrong initial user count');
    }

    #[test]
    #[available_gas(999999)]
    fn test_update_api_key() {
        let owner = create_contract_address(123);
        let initial_api_key = 456;
        let new_api_key = 789;
        let max_users = 1000;
        let is_limited = true;
        
        let mut contract = contract::unsafe_new_contract_state();
        contract::constructor(ref contract, owner, initial_api_key, max_users, is_limited);
        
        set_caller_address(owner);
        contract::update_api_key(ref contract, new_api_key);
        
        assert(contract::get_api_key(@contract) == new_api_key, 'wrong key');
    }

    #[test]
    #[available_gas(999999)]
    fn test_batch_update_users() {
        let owner = create_contract_address(123);
        let initial_api_key = 456;
        let max_users = 1000;
        let is_limited = true;
        
        let mut contract = contract::unsafe_new_contract_state();
        contract::constructor(ref contract, owner, initial_api_key, max_users, is_limited);
        
        set_caller_address(owner);
        
        let mut users_to_add = ArrayTrait::new();
        users_to_add.append(create_contract_address(1));
        users_to_add.append(create_contract_address(2));
        
        let mut users_to_remove = ArrayTrait::new();
        users_to_remove.append(create_contract_address(3));
        
        contract::batch_update_users(ref contract, users_to_add, users_to_remove);
        
        assert(contract::get_user_count(@contract) == 2, 'wrong user count');
        assert(contract::is_user_allowed(@contract, create_contract_address(1)), 'user 1 not allowed');
        assert(contract::is_user_allowed(@contract, create_contract_address(2)), 'user 2 not allowed');
        assert(!contract::is_user_allowed(@contract, create_contract_address(3)), 'user 3 should not be allowed');
    }

    #[test]
    #[available_gas(999999)]
    fn test_update_user_limit() {
        let owner = create_contract_address(123);
        let initial_api_key = 456;
        let max_users = 1000;
        let is_limited = true;
        let new_limit = 2000;
        
        let mut contract = contract::unsafe_new_contract_state();
        contract::constructor(ref contract, owner, initial_api_key, max_users, is_limited);
        
        set_caller_address(owner);
        contract::update_user_limit(ref contract, new_limit);
        
        assert(contract::get_max_users(@contract) == new_limit, 'wrong max users');
    }
} 