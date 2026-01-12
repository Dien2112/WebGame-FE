import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MOCK_FRIENDS, MOCK_FRIEND_REQUESTS, MOCK_USERS_SEARCH } from "@/lib/mockData";
import { UserPlus, UserMinus, Check, X, Users, UserCheck, Search } from "lucide-react";

export default function Friends() {
    const { token } = useAuth();
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [activeTab, setActiveTab] = useState("friends"); // "friends" or "requests"
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [useMockData, setUseMockData] = useState(true); // Toggle for mock data

    // Add Friend dropdown states
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [token]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowAddFriend(false);
                setSearchQuery("");
                setSearchResults([]);
            }
        };

        if (showAddFriend) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showAddFriend]);

    const fetchData = async () => {
        try {
            if (useMockData) {
                // Use mock data for development
                setTimeout(() => {
                    setFriends(MOCK_FRIENDS);
                    setFriendRequests(MOCK_FRIEND_REQUESTS);
                    setLoading(false);
                }, 500); // Simulate API delay
            } else {
                const [friendsData, requestsData] = await Promise.all([
                    api.get('/api/friends'),
                    api.get('/api/friends/requests')
                ]);
                setFriends(friendsData);
                setFriendRequests(requestsData);
                setLoading(false);
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading friends...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    const pendingCount = friendRequests.filter(req => req.status === 'pending').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Friends</h3>

                {/* Add Friend Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <Button
                        className="gap-2"
                        onClick={() => setShowAddFriend(!showAddFriend)}
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Friend
                    </Button>

                    {/* Dropdown */}
                    {showAddFriend && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                            {/* Search Input */}
                            <div className="p-4 border-b">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Tìm kiếm theo tên hoặc email..."
                                        className="pl-10"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Search Results */}
                            <div className="max-h-96 overflow-y-auto">
                                {searchQuery.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Nhập tên hoặc email để tìm kiếm</p>
                                    </div>
                                ) : MOCK_USERS_SEARCH.filter(user =>
                                    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    user.email.toLowerCase().includes(searchQuery.toLowerCase())
                                ).length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Không tìm thấy người dùng</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {MOCK_USERS_SEARCH
                                            .filter(user =>
                                                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                user.email.toLowerCase().includes(searchQuery.toLowerCase())
                                            )
                                            .map((user) => (
                                                <div key={user.user_id} className="p-3 hover:bg-gray-50 flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                        {user.avatar_url ? (
                                                            <img
                                                                src={user.avatar_url}
                                                                alt={user.username}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="font-semibold text-white uppercase">
                                                                {user.username[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{user.username}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                    </div>
                                                    {user.is_friend ? (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            disabled
                                                            className="flex-shrink-0"
                                                        >
                                                            <Check className="h-3 w-3 mr-1" />
                                                            Bạn bè
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            className="flex-shrink-0"
                                                        >
                                                            <UserPlus className="h-3 w-3 mr-1" />
                                                            Gửi lời mời kết bạn
                                                        </Button>
                                                    )}
                                                </div>
                                            ))
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setActiveTab("friends")}
                    className={`px-4 py-2 font-medium transition-colors relative ${activeTab === "friends"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Bạn bè
                        <span className="ml-1 text-sm">({friends.length})</span>
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("requests")}
                    className={`px-4 py-2 font-medium transition-colors relative ${activeTab === "requests"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Lời mời kết bạn
                        {pendingCount > 0 && (
                            <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </div>
                </button>
            </div>

            {/* Friends List */}
            {activeTab === "friends" && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {friends.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Chưa có bạn bè nào.</p>
                        </div>
                    ) : (
                        friends.map((item) => (
                            <Card key={item.friendship_id} className="hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                                        {item.friend.avatar_url ? (
                                            <img
                                                src={item.friend.avatar_url}
                                                alt={item.friend.username}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="font-semibold text-lg text-white uppercase">
                                                {item.friend.username[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.friend.username}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.friend.email}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                    >
                                        <UserMinus className="h-4 w-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Friend Requests */}
            {activeTab === "requests" && (
                <div className="space-y-4">
                    {friendRequests.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Không có lời mời kết bạn nào.</p>
                        </div>
                    ) : (
                        friendRequests.map((request) => (
                            <Card key={request.request_id} className="hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center overflow-hidden">
                                        {request.sender.avatar_url ? (
                                            <img
                                                src={request.sender.avatar_url}
                                                alt={request.sender.username}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="font-semibold text-lg text-white uppercase">
                                                {request.sender.username[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{request.sender.username}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {request.sender.email}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="gap-1 bg-green-500 hover:bg-green-600"
                                        >
                                            <Check className="h-4 w-4" />
                                            Chấp nhận
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                                        >
                                            <X className="h-4 w-4" />
                                            Từ chối
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
