#[cfg(test)]
mod tests {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::testing::set_caller_address;
    use array::ArrayTrait;
    use super::BaseContract;
    use super::BaseContract::{
        ContractState,
        Storage,
        BatchData
    };

    #[test]
    #[available_gas(999999)]
    fn test_constructor() {
        let owner = ContractAddress::from(123_u32);
        let initial_api_key = 456_felt252;
        let max_users = 100_u32;
        let is_limited = true;

        let mut state = ContractState::new();
        BaseContract::constructor(
            ref state,
            owner,
            initial_api_key,
            max_users,
            is_limited
        );

        assert(state.owner.read() == owner, 'Owner not set correctly');
        assert(state.whiplano_api_key.read() == initial_api_key, 'API key not set correctly');
        assert(state.max_users.read() == max_users, 'Max users not set correctly');
        assert(state.is_limited.read() == is_limited, 'Is limited not set correctly');
        assert(state.user_count.read() == 0, 'User count not initialized to 0');
    }

    #[test]
    #[available_gas(999999)]
    fn test_update_api_key() {
        let owner = ContractAddress::from(123_u32);
        let initial_api_key = 456_felt252;
        let new_api_key = 789_felt252;

        let mut state = ContractState::new();
        BaseContract::constructor(
            ref state,
            owner,
            initial_api_key,
            100_u32,
            true
        );

        set_caller_address(owner);
        BaseContract::update_api_key(ref state, new_api_key);

        assert(state.whiplano_api_key.read() == new_api_key, 'API key not updated');
    }

    #[test]
    #[available_gas(999999)]
    fn test_batch_update_users() {
        let owner = ContractAddress::from(123_u32);
        let user1 = ContractAddress::from(1_u32);
        let user2 = ContractAddress::from(2_u32);
        let user3 = ContractAddress::from(3_u32);

        let mut state = ContractState::new();
        BaseContract::constructor(
            ref state,
            owner,
            456_felt252,
            100_u32,
            true
        );

        set_caller_address(owner);
        let mut users_to_add = ArrayTrait::new();
        users_to_add.append(user1);
        users_to_add.append(user2);
        users_to_add.append(user3);

        let mut users_to_remove = ArrayTrait::new();
        BaseContract::batch_update_users(ref state, users_to_add, users_to_remove);

        assert(state.user_count.read() == 3, 'User count not updated correctly');
        assert(BaseContract::is_user_allowed(@state, user1), 'User1 not added');
        assert(BaseContract::is_user_allowed(@state, user2), 'User2 not added');
        assert(BaseContract::is_user_allowed(@state, user3), 'User3 not added');
    }

    #[test]
    #[available_gas(999999)]
    fn test_user_limit() {
        let owner = ContractAddress::from(123_u32);
        let max_users = 2_u32;

        let mut state = ContractState::new();
        BaseContract::constructor(
            ref state,
            owner,
            456_felt252,
            max_users,
            true
        );

        set_caller_address(owner);
        let mut users_to_add = ArrayTrait::new();
        users_to_add.append(ContractAddress::from(1_u32));
        users_to_add.append(ContractAddress::from(2_u32));

        let mut users_to_remove = ArrayTrait::new();
        BaseContract::batch_update_users(ref state, users_to_add, users_to_remove);

        // Try to add one more user
        let mut users_to_add = ArrayTrait::new();
        users_to_add.append(ContractAddress::from(3_u32));
        let mut users_to_remove = ArrayTrait::new();

        let result = BaseContract::batch_update_users(ref state, users_to_add, users_to_remove);
        assert(result.is_err(), 'Should fail when exceeding user limit');
    }

    #[test]
    #[available_gas(999999)]
    fn test_update_user_limit() {
        let owner = ContractAddress::from(123_u32);
        let initial_limit = 100_u32;
        let new_limit = 200_u32;

        let mut state = ContractState::new();
        BaseContract::constructor(
            ref state,
            owner,
            456_felt252,
            initial_limit,
            true
        );

        set_caller_address(owner);
        BaseContract::update_user_limit(ref state, new_limit);

        assert(state.max_users.read() == new_limit, 'User limit not updated');
    }

    #[test]
    #[available_gas(999999)]
    fn test_bitmap_operations() {
        let owner = ContractAddress::from(123_u32);
        let user = ContractAddress::from(1_u32);

        let mut state = ContractState::new();
        BaseContract::constructor(
            ref state,
            owner,
            456_felt252,
            100_u32,
            true
        );

        // Test bitmap operations
        assert(!BaseContract::is_user_allowed(@state, user), 'User should not be in bitmap initially');
        
        set_caller_address(owner);
        let mut users_to_add = ArrayTrait::new();
        users_to_add.append(user);
        let mut users_to_remove = ArrayTrait::new();
        BaseContract::batch_update_users(ref state, users_to_add, users_to_remove);

        assert(BaseContract::is_user_allowed(@state, user), 'User should be in bitmap after addition');
    }
} 