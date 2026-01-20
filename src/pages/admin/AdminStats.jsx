import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Mock data for statistics
const mockStats = {
    accounts: {
        total: 1234,
        active: 892,
        newThisMonth: 156,
        banned: 12,
    },
    totalPlays: {
        total: 45678,
        today: 1234,
        thisWeek: 8765,
        thisMonth: 32456,
    },
    hotGames: [
        { id: "snake", name: "Snake", icon: "🐍", plays: 12500, trend: "+15%" },
        { id: "caro5", name: "Caro (5 in a row)", icon: "⚫", plays: 9800, trend: "+8%" },
        { id: "candycrush", name: "Candy Crush", icon: "🍬", plays: 8700, trend: "+22%" },
        { id: "memory", name: "Memory Game", icon: "🃏", plays: 6500, trend: "+5%" },
        { id: "tictactoe", name: "Tic Tac Toe", icon: "⭕", plays: 4200, trend: "-3%" },
        { id: "caro4", name: "Caro (4 in a row)", icon: "🔴", plays: 2800, trend: "+12%" },
        { id: "paint", name: "Paint", icon: "🎨", plays: 1178, trend: "+2%" },
    ],
    recentActivity: [
        { user: "GamerPro123", action: "played Snake", time: "2 minutes ago", score: 1520 },
        { user: "NinjaPlayer", action: "played Caro 5", time: "5 minutes ago", score: null },
        { user: "DragonMaster", action: "played Candy Crush", time: "8 minutes ago", score: 8900 },
        { user: "PixelWarrior", action: "registered", time: "15 minutes ago", score: null },
        { user: "ShadowHunter", action: "played Memory", time: "20 minutes ago", score: 45 },
    ],
};

export default function AdminStats() {
    const [timeFilter, setTimeFilter] = useState("all");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">System Statistics</h3>
                <div className="flex gap-2">
                    <Button 
                        variant={timeFilter === "today" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setTimeFilter("today")}
                    >
                        Today
                    </Button>
                    <Button 
                        variant={timeFilter === "week" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setTimeFilter("week")}
                    >
                        This Week
                    </Button>
                    <Button 
                        variant={timeFilter === "month" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setTimeFilter("month")}
                    >
                        This Month
                    </Button>
                    <Button 
                        variant={timeFilter === "all" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setTimeFilter("all")}
                    >
                        All Time
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                            <p className="text-3xl font-bold">{mockStats.accounts.total.toLocaleString()}</p>
                        </div>
                        <span className="text-4xl">👥</span>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs">
                        <span className="text-green-600">Active: {mockStats.accounts.active}</span>
                        <span className="text-red-600">Banned: {mockStats.accounts.banned}</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">New This Month</p>
                            <p className="text-3xl font-bold text-green-600">+{mockStats.accounts.newThisMonth}</p>
                        </div>
                        <span className="text-4xl">📈</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">New user registrations</p>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
                            <p className="text-3xl font-bold">{mockStats.totalPlays.total.toLocaleString()}</p>
                        </div>
                        <span className="text-4xl">🎮</span>
                    </div>
                    <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                        <span>Today: {mockStats.totalPlays.today.toLocaleString()}</span>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Plays This Week</p>
                            <p className="text-3xl font-bold text-blue-600">{mockStats.totalPlays.thisWeek.toLocaleString()}</p>
                        </div>
                        <span className="text-4xl">📊</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Game sessions this week</p>
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
                        {mockStats.hotGames.map((game, index) => (
                            <div 
                                key={game.id} 
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold w-6 ${
                                        index === 0 ? "text-yellow-500" : 
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
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                        game.trend.startsWith("+") 
                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" 
                                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                    }`}>
                                        {game.trend}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Activity */}
                <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        ⏱️ Recent Activity
                    </h4>
                    <div className="space-y-3">
                        {mockStats.recentActivity.map((activity, index) => (
                            <div 
                                key={index} 
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-semibold">
                                        {activity.user.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{activity.user}</p>
                                        <p className="text-xs text-muted-foreground">{activity.action}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {activity.score && (
                                        <p className="text-sm font-semibold text-primary">
                                            Score: {activity.score.toLocaleString()}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                                </div>
                            </div>
                        ))}
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
                        <p className="text-3xl font-bold text-blue-600">{mockStats.accounts.total}</p>
                        <p className="text-sm text-muted-foreground">Total Accounts</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950">
                        <p className="text-3xl font-bold text-green-600">{mockStats.accounts.active}</p>
                        <p className="text-sm text-muted-foreground">Active Users</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950">
                        <p className="text-3xl font-bold text-amber-600">{mockStats.accounts.newThisMonth}</p>
                        <p className="text-sm text-muted-foreground">New This Month</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-950">
                        <p className="text-3xl font-bold text-red-600">{mockStats.accounts.banned}</p>
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
                    {mockStats.hotGames.map((game) => {
                        const percentage = (game.plays / mockStats.hotGames[0].plays) * 100;
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
