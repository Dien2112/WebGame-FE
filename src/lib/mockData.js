// Mock data for development and testing
// This data structure matches the backend response after JOIN with users table

// Current user ID for reference (simulating logged-in user)
const CURRENT_USER_ID = "550e8400-e29b-41d4-a716-446655440000";

// MOCK_FRIENDS: List of accepted friendships
// Backend endpoint: GET /api/friends
// Returns friendships where status = 'accepted' and current user is either requester or receiver
export const MOCK_FRIENDS = [
    {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        requester_id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
        receiver_id: CURRENT_USER_ID,
        status: "accepted",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:35:00Z",
        // Friend info (from users table JOIN)
        friend_info: {
            id: "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
            username: "GamerPro123",
            email: "gamer@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPro123",
            role: "user"
        }
    },
    {
        id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        requester_id: CURRENT_USER_ID,
        receiver_id: "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
        status: "accepted",
        created_at: "2024-01-14T08:20:00Z",
        updated_at: "2024-01-14T08:25:00Z",
        friend_info: {
            id: "b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e",
            username: "NinjaPlayer",
            email: "ninja@example.com",
            avatar_url: null,
            role: "user"
        }
    },
    {
        id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        requester_id: "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
        receiver_id: CURRENT_USER_ID,
        status: "accepted",
        created_at: "2024-01-13T15:45:00Z",
        updated_at: "2024-01-13T15:50:00Z",
        friend_info: {
            id: "c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f",
            username: "DragonMaster",
            email: "dragon@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=DragonMaster",
            role: "user"
        }
    },
    {
        id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        requester_id: CURRENT_USER_ID,
        receiver_id: "d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a",
        status: "accepted",
        created_at: "2024-01-12T12:00:00Z",
        updated_at: "2024-01-12T12:05:00Z",
        friend_info: {
            id: "d4e5f6a7-b8c9-4d5e-1f2a-3b4c5d6e7f8a",
            username: "PixelWarrior",
            email: "pixel@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=PixelWarrior",
            role: "user"
        }
    },
    {
        id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        requester_id: "e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b",
        receiver_id: CURRENT_USER_ID,
        status: "accepted",
        created_at: "2024-01-11T09:30:00Z",
        updated_at: "2024-01-11T09:35:00Z",
        friend_info: {
            id: "e5f6a7b8-c9d0-4e5f-2a3b-4c5d6e7f8a9b",
            username: "ShadowHunter",
            email: "shadow@example.com",
            avatar_url: null,
            role: "user"
        }
    },
    {
        id: "1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed",
        requester_id: CURRENT_USER_ID,
        receiver_id: "f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c",
        status: "accepted",
        created_at: "2024-01-10T14:20:00Z",
        updated_at: "2024-01-10T14:25:00Z",
        friend_info: {
            id: "f6a7b8c9-d0e1-4f5a-3b4c-5d6e7f8a9b0c",
            username: "CyberKnight",
            email: "cyber@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=CyberKnight",
            role: "user"
        }
    }
];

// MOCK_FRIEND_REQUESTS: Pending friend requests received by current user
// Backend endpoint: GET /api/friends/requests
// Returns friendships where status = 'pending' and receiver_id = current_user_id
export const MOCK_FRIEND_REQUESTS = [
    {
        id: "2c5ea4c0-4067-11e9-8bad-9b1deb4d3b7d",
        requester_id: "a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d",
        receiver_id: CURRENT_USER_ID,
        status: "pending",
        created_at: "2024-01-16T14:30:00Z",
        updated_at: "2024-01-16T14:30:00Z",
        // Requester info (from users table JOIN)
        requester_info: {
            id: "a7b8c9d0-e1f2-4a5b-4c5d-6e7f8a9b0c1d",
            username: "NewPlayer99",
            email: "newplayer@example.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=NewPlayer99",
            role: "user"
        }
    },
    {
        id: "5f9c8d7e-6b5a-4c3d-2e1f-0a9b8c7d6e5f",
        requester_id: "b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e",
        receiver_id: CURRENT_USER_ID,
        status: "pending",
        created_at: "2024-01-16T10:15:00Z",
        updated_at: "2024-01-16T10:15:00Z",
        requester_info: {
            id: "b8c9d0e1-f2a3-4b5c-5d6e-7f8a9b0c1d2e",
            username: "ProGamer2024",
            email: "progamer@example.com",
            avatar_url: null,
            role: "user"
        }
    }
];

// MOCK_USERS_SEARCH: Search results for adding new friends
// Backend endpoint: GET /api/users/search?q=query
// Returns users matching search query (excluding current user and existing friends)
export const MOCK_USERS_SEARCH = [
    {
        id: "c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f",
        username: "StarPlayer",
        email: "star@example.com",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=StarPlayer",
        role: "user",
        is_friend: false // Helper flag to show if already friends
    },
    {
        id: "d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a",
        username: "MoonWalker",
        email: "moon@example.com",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=MoonWalker",
        role: "user",
        is_friend: false
    },
    {
        id: "e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b",
        username: "SunRiser",
        email: "sun@example.com",
        avatar_url: null,
        role: "user",
        is_friend: true // Already friends with this user
    }
];
