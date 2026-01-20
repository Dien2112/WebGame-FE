import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, X, Users, UserCheck, Search, UserPlus, UserMinus, ChevronLeft, ChevronRight } from "lucide-react";
import { debounce } from "@/lib/utils";

export default function Friends() {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState("friends"); // "friends", "requests", "find"

    // Data States
    const [friendsData, setFriendsData] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });
    const [requests, setRequests] = useState([]);
    const [searchData, setSearchData] = useState({ data: [], pagination: { page: 1, totalPages: 1 } });

    // UI States
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState("");
    const [useMockData, setUseMockData] = useState(true); // Toggle for mock data

    // Add Friend dropdown states
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const dropdownRef = useRef(null);

    // Pagination States
    const [friendsPage, setFriendsPage] = useState(1);
    const [searchPage, setSearchPage] = useState(1);

    const fetchFriends = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const res = await api.get(`/api/friends?page=${page}&limit=9`);
            // Backend returns { data, pagination }
            // If backend hasn't been updated yet/cached, might return array. Handle both.
            if (Array.isArray(res)) {
                setFriendsData({ data: res, pagination: { page: 1, totalPages: 1 } });
            } else {
                setFriendsData(res);
            }
        } catch (err) {
            console.error("Failed to fetch friends", err);
            setError("Failed to load friends");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await api.get('/api/friends/invitation'); // Correct endpoint
            setRequests(res || []);
        } catch (err) {
            console.error("Failed to fetch requests", err);
        }
    }, []);

    const searchUsers = useCallback(async (query, page = 1) => {
        if (!query.trim()) {
            setSearchData({ data: [], pagination: { page: 1, totalPages: 1 } });
            return;
        }
        try {
            setLoading(true);
            const res = await api.get(`/api/friends/search?q=${encodeURIComponent(query)}&page=${page}&limit=10`);
            setSearchData(res); // Expecting { data, pagination }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced search
    const debouncedSearch = useCallback(debounce((query, page) => {
        searchUsers(query, page);
    }, 500), []);

    // Initial Load
    useEffect(() => {
        if (activeTab === "friends") fetchFriends(friendsPage);
        if (activeTab === "requests") fetchRequests();
        if (activeTab === "find") searchUsers(searchQuery, searchPage);
    }, [activeTab, friendsPage, searchPage, token]);

    // Handle Search Input
    const handleSearchInput = (e) => {
        const val = e.target.value;
        setSearchQuery(val);
        setSearchPage(1); // Reset to page 1 on new search
        debouncedSearch(val, 1);
    };

    // Actions
    const handleSendRequest = async (userId) => {
        try {
            await api.post(`/api/friends/invite/${userId}`);
            // Update UI to show 'Sent' or refresh?
            // For simplicity, just refresh search (or optimistically update)
            searchUsers(searchQuery, searchPage);
            // Optionally show toast
        } catch (err) {
            alert(err.message || "Failed to send request");
        }
    };

    const handleAccept = async (invitationId) => {
        try {
            await api.post(`/api/friends/invitation/${invitationId}`);
            fetchRequests(); // Refresh list
            fetchFriends(friendsPage); // Refresh friends in background
        } catch (err) {
            alert("Failed to accept");
        }
    };

    const handleReject = async (invitationId) => {
        try {
            await api.delete(`/api/friends/invitation/${invitationId}`);
            fetchRequests();
        } catch (err) {
            alert("Failed to reject");
        }
    };

    const handleRemoveFriend = async (friendId) => {
        if (!confirm("Are you sure you want to remove this friend?")) return;
        try {
            await api.delete(`/api/friends/${friendId}`);
            fetchFriends(friendsPage);
        } catch (err) {
            alert("Failed to remove friend");
        }
    };

    const renderPagination = (pagination, setPage) => {
        if (!pagination || pagination.totalPages <= 1) return null;
        return (
            <div className="flex justify-center gap-2 mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPage(p => p - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="py-2 text-sm text-gray-500">
                    Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-2xl font-bold">Social</h3>
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
                        My Friends
                        <span className="ml-1 text-sm bg-gray-100 px-2 rounded-full">{friendsData.pagination?.total || friendsData.data.length || 0}</span>
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
                        Requests
                        {requests.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                {requests.length}
                            </span>
                        )}
                    </div>
                </button>
                <button
                    onClick={() => setActiveTab("find")}
                    className={`px-4 py-2 font-medium transition-colors relative ${activeTab === "find"
                        ? "text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Find Friends
                    </div>
                </button>
            </div>

            {/* Content: Friends */}
            {activeTab === "friends" && (
                <div className="space-y-4">
                    {loading && friendsData.data.length === 0 ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : friendsData.data.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>You have no friends yet.</p>
                            <Button variant="link" onClick={() => setActiveTab("find")}>Find new friends</Button>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {friendsData.data.map((item) => (
                                <Card key={item.id || item.friendship_id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                                            {item.avatar ? (
                                                <img src={item.avatar} alt={item.username} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="font-semibold text-lg text-white uppercase">{item.username[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{item.username}</p>
                                            <p className="text-xs text-muted-foreground">{item.email}</p>
                                            <span className={`text-[10px] ${item.is_online ? 'text-green-500' : 'text-gray-400'}`}>
                                                {item.is_online ? 'Online' : 'Offline'}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleRemoveFriend(item.id)}
                                        >
                                            <UserMinus className="h-4 w-4" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                    {renderPagination(friendsData.pagination, setFriendsPage)}
                </div>
            )}

            {/* Content: Requests */}
            {activeTab === "requests" && (
                <div className="space-y-4">
                    {requests.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No pending requests.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {requests.map((request) => (
                                <Card key={request.invitation_id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="flex items-center gap-4 p-4">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center overflow-hidden">
                                            {request.user.avatar ? (
                                                <img src={request.user.avatar} alt={request.user.username} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="font-semibold text-lg text-white uppercase">{request.user.username[0]}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{request.user.username}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" className="bg-green-500 hover:bg-green-600 h-7 text-xs" onClick={() => handleAccept(request.invitation_id)}>
                                                    Accept
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => handleReject(request.invitation_id)}>
                                                    Reject
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Content: Find Friends */}
            {activeTab === "find" && (
                <div className="space-y-6">
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search by username or email..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={handleSearchInput}
                        />
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center">Searching...</div>
                        ) : searchData.data.length === 0 && searchQuery ? (
                            <div className="text-center text-muted-foreground">No users found.</div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {searchData.data.map((user) => (
                                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                                        <CardContent className="flex items-center gap-4 p-4">
                                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                                                ) : (
                                                    <span className="font-semibold text-lg text-gray-500 uppercase">{user.username[0]}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{user.username}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                {user.relationship === 'friend' ? (
                                                    <Button size="sm" variant="outline" className="mt-2 w-full h-8 text-xs text-green-600" disabled>
                                                        <Check className="h-3 w-3 mr-2" /> Friend
                                                    </Button>
                                                ) : user.relationship === 'sent' ? (
                                                    <Button size="sm" variant="secondary" className="mt-2 w-full h-8 text-xs" disabled>
                                                        <UserCheck className="h-3 w-3 mr-2" /> Request Sent
                                                    </Button>
                                                ) : user.relationship === 'received' ? (
                                                    <Button size="sm" className="mt-2 w-full h-8 text-xs bg-green-500 hover:bg-green-600" onClick={() => handleAccept(user.id)}>
                                                        <UserPlus className="h-3 w-3 mr-2" /> Accept Request
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" className="mt-2 w-full h-8 text-xs" onClick={() => handleSendRequest(user.id)}>
                                                        <UserPlus className="h-3 w-3 mr-2" /> Add Friend
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                        {renderPagination(searchData.pagination, setSearchPage)}
                    </div>
                </div>
            )}
        </div>
    );
}
