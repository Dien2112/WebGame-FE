import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminStats() {
    const [timeFilter, setTimeFilter] = useState("all");
    const [stats, setStats] = useState(null);
    const [activity, setActivity] = useState([]);
    const [activityPage, setActivityPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activityLoading, setActivityLoading] = useState(false);

    useEffect(() => {
        fetchOverview();
    }, []);

    useEffect(() => {
        fetchActivity(activityPage);
    }, [activityPage]);

    const fetchOverview = async () => {
        try {
            const res = await api.get('/api/stats/overview');
            setStats(res);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
            setLoading(false);
        }
    };

    const fetchActivity = async (page) => {
        setActivityLoading(true);
        try {
            const res = await api.get(`/api/stats/activity?page=${page}&limit=5`);
            setActivity(res.data);
        } catch (error) {
            console.error("Failed to fetch activity", error);
        } finally {
            setActivityLoading(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    if (!stats) return <div>Failed to load statistics.</div>;

    // Filter logic for plays card (UI only for now, as API returns all)
    // If we want backend filter, we need query param for overview. 
    // Given the endpoint returns structure { total, today, thisWeek, thisMonth }, we can just pick the right one.
    const getFilteredPlays = () => {
        if (timeFilter === 'today') return stats.totalPlays.today;
        if (timeFilter === 'week') return stats.totalPlays.thisWeek;
        if (timeFilter === 'month') return stats.totalPlays.thisMonth;
        return stats.totalPlays.total;
    };

    const displayPlays = getFilteredPlays();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">System Statistics</h3>
                <div className="flex gap-2">
                    {['today', 'week', 'month', 'all'].map(f => (
                        <Button
                            key={f}
                            variant={timeFilter === f ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTimeFilter(f)}
                            className="capitalize"
                        >
                            {f === 'all' ? 'All Time' : f}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                            <p className="text-3xl font-bold">{stats.accounts.total.toLocaleString()}</p>
                        </div>
                        <span className="text-4xl">👥</span>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs">
                        <span className="text-green-600">Active: {stats.accounts.active}</span>
                        <span className="text-red-600">Banned: {stats.accounts.banned}</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                            <p className="text-3xl font-bold text-green-600">+{stats.accounts.newThisMonth}</p>
                        </div>
                        <span className="text-4xl">📈</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">New user registrations</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
                            <p className="text-3xl font-bold">{stats.totalPlays.total.toLocaleString()}</p>
                        </div>
                        <span className="text-4xl">🎮</span>
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                        <span>Today: {stats.totalPlays.today.toLocaleString()}</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Filtered Plays</p>
                            <p className="text-3xl font-bold text-blue-600">{displayPlays.toLocaleString()}</p>
                        </div>
                        <span className="text-4xl">📊</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Game sessions ({timeFilter})</p>
                </Card>
            </div>

            {/* Hot Games & Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Hot Games Ranking */}
                <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        🔥 Hot Games Ranking
                    </h4>
                    <div className="space-y-3">
                        {stats.hotGames.map((game, index) => (
                            <div
                                key={game.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold w-6 ${index === 0 ? "text-yellow-500" :
                                            index === 1 ? "text-gray-400" :
                                                index === 2 ? "text-amber-600" : "text-muted-foreground"
                                        }`}>
                                        #{index + 1}
                                    </span>
                                    <span className="text-2xl">{game.icon}</span>
                                    <span className="font-medium">{game.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-semibold">
                                        {game.plays.toLocaleString()} plays
                                    </span>
                                    {/* Trend removed as backend doesn't support yet */}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold flex items-center gap-2">
                            ⏱️ Recent Activity
                        </h4>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline" size="icon" className="h-8 w-8"
                                disabled={activityPage <= 1 || activityLoading}
                                onClick={() => setActivityPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm w-4 text-center">{activityPage}</span>
                            <Button
                                variant="outline" size="icon" className="h-8 w-8"
                                disabled={activity.length < 5 || activityLoading} // Simple check: if < limit, likely last page
                                onClick={() => setActivityPage(p => p + 1)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 min-h-[300px]">
                        {activityLoading ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
                        ) : activity.map((act, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold uppercase">
                                        {act.user.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{act.user}</p>
                                        <p className="text-xs text-muted-foreground">{act.action}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {act.score !== null && (
                                        <p className="text-sm font-semibold text-primary">
                                            Score: {act.score.toLocaleString()}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">{formatTimeAgo(act.time)}</p>
                                </div>
                            </div>
                        ))}
                        {!activityLoading && activity.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">No recent activity</div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Account Statistics Detail */}
            <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    📋 Account Statistics
                </h4>
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                        <p className="text-3xl font-bold text-blue-600">{stats.accounts.total}</p>
                        <p className="text-sm text-muted-foreground">Total Accounts</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                        <p className="text-3xl font-bold text-green-600">{stats.accounts.active}</p>
                        <p className="text-sm text-muted-foreground">Active Users</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950">
                        <p className="text-3xl font-bold text-amber-600">{stats.accounts.newThisMonth}</p>
                        <p className="text-sm text-muted-foreground">New This Month</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
                        <p className="text-3xl font-bold text-red-600">{stats.accounts.banned}</p>
                        <p className="text-sm text-muted-foreground">Banned Accounts</p>
                    </div>
                </div>
            </Card>

            {/* Play Statistics by Game */}
            <Card className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🎯 Play Count by Game
                </h4>
                <div className="space-y-4">
                    {stats.hotGames.map((game) => {
                        const maxPlays = stats.hotGames[0]?.plays || 1;
                        const percentage = (game.plays / maxPlays) * 100;
                        return (
                            <div key={game.id} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span>{game.icon}</span>
                                        <span className="font-medium">{game.name}</span>
                                    </span>
                                    <span className="text-muted-foreground">
                                        {game.plays.toLocaleString()} plays
                                    </span>
                                </div>
                                <div className="h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-primary transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
