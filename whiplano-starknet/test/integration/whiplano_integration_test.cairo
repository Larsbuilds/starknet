#[cfg(test)]
mod tests {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::testing::set_caller_address;
    use array::ArrayTrait;
    use super::WhiplanoContract;
    use super::WhiplanoContract::{
        ContractState,
        Storage,
        BatchData
    };

    #[test]
    #[available_gas(999999)]
    fn test_complete_workflow() {
        // Setup
        let owner = ContractAddress::from(123_u32);
        let user1 = ContractAddress::from(1_u32);
        let user2 = ContractAddress::from(2_u32);
        let user3 = ContractAddress::from(3_u32);
        let initial_api_key = 456_felt252;
        let new_api_key = 789_felt252;
        let initial_limit = 3_u32;
        let new_limit = 5_u32;

        // Deploy contract
        let mut state = ContractState::new();
        WhiplanoContract::constructor(
            ref state,
            owner,
            initial_api_key,
            initial_limit,
            true
        );

        // Verify initial state
        assert(state.owner.read() == owner, 'Owner not set correctly');
        assert(state.whiplano_api_key.read() == initial_api_key, 'API key not set correctly');
        assert(state.max_users.read() == initial_limit, 'Max users not set correctly');
        assert(state.is_limited.read(), 'Is limited not set correctly');
        assert(state.user_count.read() == 0, 'User count not initialized to 0');

        // Test API key update
        set_caller_address(owner);
        WhiplanoContract::update_api_key(ref state, new_api_key);
        assert(state.whiplano_api_key.read() == new_api_key, 'API key not updated');

        // Test batch user addition
        let mut users_to_add = ArrayTrait::new();
        users_to_add.append(user1);
        users_to_add.append(user2);
        users_to_add.append(user3);

        let mut users_to_remove = ArrayTrait::new();
        WhiplanoContract::batch_update_users(ref state, users_to_add, users_to_remove);

        assert(state.user_count.read() == 3, 'User count not updated correctly');
        assert(WhiplanoContract::is_user_allowed(@state, user1), 'User1 not added');
        assert(WhiplanoContract::is_user_allowed(@state, user2), 'User2 not added');
        assert(WhiplanoContract::is_user_allowed(@state, user3), 'User3 not added');

        // Test user limit update
        WhiplanoContract::update_user_limit(ref state, new_limit);
        assert(state.max_users.read() == new_limit, 'User limit not updated');

        // Test batch user removal
        let mut users_to_add = ArrayTrait::new();
        let mut users_to_remove = ArrayTrait::new();
        users_to_remove.append(user2);
        users_to_remove.append(user3);

        WhiplanoContract::batch_update_users(ref state, users_to_add, users_to_remove);

        assert(state.user_count.read() == 1, 'User count not updated correctly after removal');
        assert(WhiplanoContract::is_user_allowed(@state, user1), 'User1 should still be allowed');
        assert(!WhiplanoContract::is_user_allowed(@state, user2), 'User2 should be removed');
        assert(!WhiplanoContract::is_user_allowed(@state, user3), 'User3 should be removed');
    }

    #[test]
    #[available_gas(999999)]
    fn test_edge_cases() {
        let owner = ContractAddress::from(123_u32);
        let non_owner = ContractAddress::from(456_u32);
        let user = ContractAddress::from(1_u32);

        // Deploy contract
        let mut state = ContractState::new();
        WhiplanoContract::constructor(
            ref state,
            owner,
            456_felt252,
            1_u32,
            true
        );

        // Test non-owner operations
        set_caller_address(non_owner);
        
        // Try to update API key
        let result = WhiplanoContract::update_api_key(ref state, 789_felt252);
        assert(result.is_err(), 'Non-owner should not be able to update API key');

        // Try to update users
        let mut users_to_add = ArrayTrait::new();
        users_to_add.append(user);
        let mut users_to_remove = ArrayTrait::new();
        let result = WhiplanoContract::batch_update_users(ref state, users_to_add, users_to_remove);
        assert(result.is_err(), 'Non-owner should not be able to update users');

        // Try to update user limit
        let result = WhiplanoContract::update_user_limit(ref state, 2_u32);
        assert(result.is_err(), 'Non-owner should not be able to update user limit');

        // Test empty batch operations
        set_caller_address(owner);
        let mut empty_add = ArrayTrait::new();
        let mut empty_remove = ArrayTrait::new();
        WhiplanoContract::batch_update_users(ref state, empty_add, empty_remove);
        assert(state.user_count.read() == 0, 'Empty batch should not change user count');
    }

    #[test]
    #[available_gas(999999)]
    fn test_bitmap_efficiency() {
        let owner = ContractAddress::from(123_u32);
        let mut users = ArrayTrait::new();
        
        // Create 512 users (2 full bitmaps)
        let mut i = 0;
        loop {
            if i >= 512 {
                break;
            }
            users.append(ContractAddress::from(i as u32));
            i += 1;
        }

        // Deploy contract with high limit
        let mut state = ContractState::new();
        WhiplanoContract::constructor(
            ref state,
            owner,
            456_felt252,
            1000_u32,
            true
        );

        // Test batch addition of all users
        set_caller_address(owner);
        let mut users_to_remove = ArrayTrait::new();
        WhiplanoContract::batch_update_users(ref state, users, users_to_remove);

        assert(state.user_count.read() == 512, 'All users should be added');
        
        // Verify random users are in bitmap
        assert(WhiplanoContract::is_user_allowed(@state, ContractAddress::from(0_u32)), 'User 0 should be allowed');
        assert(WhiplanoContract::is_user_allowed(@state, ContractAddress::from(255_u32)), 'User 255 should be allowed');
        assert(WhiplanoContract::is_user_allowed(@state, ContractAddress::from(511_u32)), 'User 511 should be allowed');
    }
} 