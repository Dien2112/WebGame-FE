import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight } from "lucide-react";
// import { MOCK_RANKINGS, MOCK_FRIENDS_RANKINGS } from "@/lib/mockRankingData"; // Removed

export default function Ranking() {
    const { token } = useAuth();
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState("global"); // 'global' | 'friends'
    const [selectedGame, setSelectedGame] = useState(""); // '' = all games
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 10;

    const [games, setGames] = useState([{ value: "", label: "All Games" }]);

    useEffect(() => {
        const fetchGamesList = async () => {
            try {
                const res = await api.get('/api/games');
                const gamesArray = res.data || res;
                // Filter active and map to options
                const activeGames = Array.isArray(gamesArray) ? gamesArray.filter(g => g.is_active).map(g => ({
                    value: g.id, // Integer ID
                    label: g.name
                })) : [];
                activeGames.unshift({ value: "", label: "All Games" });
                setGames(activeGames);
            } catch (err) {
                console.error("Failed to fetch games for filter", err);
            }
        };
        fetchGamesList();
    }, []);

    useEffect(() => {
        if (token) {
            setCurrentPage(1);
        }
    }, [token, activeTab, selectedGame]);

    useEffect(() => {
        if (token) {
            fetchRankings();
        }
    }, [token, activeTab, selectedGame, currentPage]);

    const fetchRankings = async () => {
        setLoading(true);
        try {
            // Real API Call
            const params = new URLSearchParams({
                type: activeTab,
                page: currentPage,
                limit: PAGE_SIZE,
                ...(selectedGame && { game: selectedGame })
            });
            const data = await api.get(`/api/rankings?${params}`);

            // Handle response - can be array or object with data/total
            if (Array.isArray(data)) {
                setRankings(data);
                // If we get less than PAGE_SIZE, we're on the last page
                if (data.length < PAGE_SIZE) {
                    setTotalPages(currentPage);
                } else {
                    // Assume there might be more pages
                    setTotalPages(currentPage + 1);
                }
            } else {
                setRankings(data.data || data.rankings || []);
                const total = data.total || data.totalCount || 0;
                setTotalCount(total);
                setTotalPages(Math.ceil(total / PAGE_SIZE) || 1);
            }
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };



    const getMedalEmoji = (rank) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return rank;
    };

    const getWinRate = (wins, total) => {
        if (!total) return "0%";
        return `${((wins / total) * 100).toFixed(1)}%`;
    };

    if (loading && rankings.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading rankings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-3xl font-bold tracking-tight">🏆 Leaderboard</h3>
                    <p className="text-muted-foreground mt-1">
                        Compete with players and climb the ranks
                    </p>
                </div>
            </div>



            {/* Tabs and Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Tabs */}
                <div className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                    <button
                        onClick={() => setActiveTab("global")}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "global"
                            ? "bg-background text-foreground shadow-sm"
                            : "hover:bg-background/50"
                            }`}
                    >
                        🌍 Global
                    </button>
                    <button
                        onClick={() => setActiveTab("friends")}
                        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${activeTab === "friends"
                            ? "bg-background text-foreground shadow-sm"
                            : "hover:bg-background/50"
                            }`}
                    >
                        👥 Friends
                    </button>
                </div>

                {/* Game Filter */}
                <select
                    value={selectedGame}
                    onChange={(e) => setSelectedGame(e.target.value)}
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    {games.map((game) => (
                        <option key={game.value} value={game.value}>
                            {game.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                    <p className="font-medium">⚠️ Error loading rankings</p>
                    <p className="text-sm mt-1">{error}</p>
                </div>
            )}

            {/* Rankings Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        </div>
                    ) : rankings.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">🎮</div>
                            <p className="text-lg font-medium text-muted-foreground">No rankings yet</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                {activeTab === "friends"
                                    ? "Add friends and start playing together!"
                                    : "Be the first to play and set a record!"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b bg-muted/50">
                                    <tr>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-16">
                                            Rank
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                                            Player
                                        </th>
                                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden sm:table-cell">
                                            Game
                                        </th>
                                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground">
                                            Matches
                                        </th>
                                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground hidden md:table-cell">
                                            Wins
                                        </th>
                                        <th className="h-12 px-4 text-center align-middle font-medium text-muted-foreground hidden md:table-cell">
                                            Win Rate
                                        </th>
                                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                                            Score
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankings.map((player, index) => {
                                        const rank = index + 1;
                                        const isTopThree = rank <= 3;

                                        return (
                                            <tr
                                                key={`${player.username}-${player.game_name}-${index}`}
                                                className={`border-b transition-colors hover:bg-muted/50 ${isTopThree ? "bg-primary/5" : ""
                                                    }`}
                                            >
                                                <td className="p-4 align-middle">
                                                    <div className={`text-center font-bold ${rank === 1 ? "text-yellow-500 text-xl" :
                                                        rank === 2 ? "text-gray-400 text-lg" :
                                                            rank === 3 ? "text-amber-600 text-lg" :
                                                                "text-muted-foreground"
                                                        }`}>
                                                        {getMedalEmoji(rank)}
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10">
                                                            <AvatarImage src={player.avatar_url} alt={player.username} />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                                                {player.username[0]?.toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium leading-none">{player.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 align-middle hidden sm:table-cell">
                                                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                                                        {player.game_name}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-center">
                                                    <span className="font-medium">{player.total_games}</span>
                                                </td>
                                                <td className="p-4 align-middle text-center hidden md:table-cell">
                                                    <span className="font-medium text-green-600 dark:text-green-400">
                                                        {player.wins}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-center hidden md:table-cell">
                                                    <span className="text-sm text-muted-foreground">
                                                        {getWinRate(player.wins, player.total_games)}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle text-right">
                                                    <span className="font-bold text-primary text-lg">
                                                        {player.total_score.toLocaleString()}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {rankings.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1 || loading}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages || loading}
                        onClick={() => setCurrentPage((p) => p + 1)}
                    >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Footer Info */}
            {rankings.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * PAGE_SIZE) + 1} - {((currentPage - 1) * PAGE_SIZE) + rankings.length}
                    {totalCount > 0 && ` of ${totalCount}`}
                    {rankings.length === 1 ? " player" : " players"}
                    {selectedGame && ` in ${games.find(g => g.value === selectedGame)?.label}`}
                </div>
            )}
        </div>
    );
}