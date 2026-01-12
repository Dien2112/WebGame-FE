// Mock data for development and testing

export const MOCK_FRIENDS = [
    {
        friendship_id: 1,
        friend: {
            user_id: 101,
            username: "GamerPro123",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPro123",
            email: "gamer@example.com"
        },
        status: "accepted",
        created_at: "2024-01-15T10:30:00Z"
    },
    {
        friendship_id: 2,
        friend: {
            user_id: 102,
            username: "NinjaPlayer",
            avatar_url: null,
            email: "ninja@example.com"
        },
        status: "accepted",
        created_at: "2024-01-14T08:20:00Z"
    },
    {
        friendship_id: 3,
        friend: {
            user_id: 103,
            username: "DragonMaster",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=DragonMaster",
            email: "dragon@example.com"
        },
        status: "accepted",
        created_at: "2024-01-13T15:45:00Z"
    },
    {
        friendship_id: 4,
        friend: {
            user_id: 104,
            username: "PixelWarrior",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=PixelWarrior",
            email: "pixel@example.com"
        },
        status: "pending",
        created_at: "2024-01-12T12:00:00Z"
    },
    {
        friendship_id: 5,
        friend: {
            user_id: 105,
            username: "ShadowHunter",
            avatar_url: null,
            email: "shadow@example.com"
        },
        status: "accepted",
        created_at: "2024-01-11T09:30:00Z"
    },
    {
        friendship_id: 6,
        friend: {
            user_id: 106,
            username: "CyberKnight",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=CyberKnight",
            email: "cyber@example.com"
        },
        status: "accepted",
        created_at: "2024-01-10T14:20:00Z"
    }
];

export const MOCK_FRIEND_REQUESTS = [
    {
        request_id: 1,
        sender: {
            user_id: 201,
            username: "NewPlayer99",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=NewPlayer99",
            email: "newplayer@example.com"
        },
        status: "pending",
        created_at: "2024-01-16T14:30:00Z"
    },
    {
        request_id: 2,
        sender: {
            user_id: 202,
            username: "ProGamer2024",
            avatar_url: null,
            email: "progamer@example.com"
        },
        status: "pending",
        created_at: "2024-01-16T10:15:00Z"
    }
];

export const MOCK_USERS_SEARCH = [
    {
        user_id: 301,
        username: "StarPlayer",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=StarPlayer",
        email: "star@example.com",
        is_friend: false
    },
    {
        user_id: 302,
        username: "MoonWalker",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=MoonWalker",
        email: "moon@example.com",
        is_friend: false
    },
    {
        user_id: 303,
        username: "SunRiser",
        avatar_url: null,
        email: "sun@example.com",
        is_friend: true
    }
];
