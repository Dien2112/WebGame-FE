import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Note: Avatar component is not created yet, I will create a simple one or just use img tag for now to avoid errors if I didn't create it.
// I'll stick to img/div for now.

export default function Friends() {
    const { token } = useAuth();
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchFriends();
    }, [token]);

    const fetchFriends = async () => {
        try {
            const data = await api.get('/api/friends');
            setFriends(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading friends...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">Friends</h3>
                <Button disabled>Add Friend</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {friends.length === 0 ? (
                    <p>No friends found.</p>
                ) : (
                    friends.map((item) => (
                        <Card key={item.friendship_id}>
                            <CardContent className="flex items-center gap-4 p-4">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    {item.friend.avatar_url ? (
                                        <img src={item.friend.avatar_url} alt={item.friend.username} className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="font-semibold text-lg uppercase">{item.friend.username[0]}</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{item.friend.username}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{item.status}</p>
                                </div>
                                <Button variant="outline" size="sm" disabled>Unfriend</Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
