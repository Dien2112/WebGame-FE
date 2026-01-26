
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, X } from "lucide-react";

export default function AdminGames() {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGame, setSelectedGame] = useState(null);
    const [configForm, setConfigForm] = useState({});
    const [dialogOpen, setDialogOpen] = useState(false);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            const res = await api.get('/api/games');
            const list = res.data || res;
            setGames(list);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch games", error);
            setLoading(false);
        }
    };

    const handleToggleStatus = async (game) => {
        try {
            await api.post(`/api/games/${game.id}/status`);
            setGames(games.map(g => g.id === game.id ? { ...g, is_active: !g.is_active } : g));
        } catch (error) {
            console.error("Failed to toggle status", error);
        }
    };

    const openConfig = (game) => {
        setSelectedGame(game);
        setConfigForm(game.config || {});
        setDialogOpen(true);
    };

    const validateConfig = (game, config) => {
        const code = game.internal_id || game.type;
        const size = parseInt(config.size);
        const speed = config.speed ? parseInt(config.speed) : undefined;
        const time = config.time ? parseInt(config.time) : undefined;

        if (code === 'SNAKE') {
            if (size < 10 || size > 20) return "Snake size must be between 10 and 20.";
            if (speed && (speed < 1 || speed > 8)) return "Speed must be between 1 and 8.";
        }

        if (code === 'CARO4') {
            if (size < 5 || size > 20) return "Caro (4x4) size must be between 5 and 20.";
        }

        if (code === 'CARO5') {
            if (size < 7 || size > 20) return "Caro (5x5) size must be between 7 and 20.";
        }

        if (code === 'MEM') {
            if (size < 2 || size > 4) return "Memory size must be between 2 and 4 (e.g., 2x2, 4x4).";
            if ((size * size) % 2 !== 0) return "Memory game must have an even number of tiles (size x size must be even).";
            if (time && (time < 30 || time > 120)) return "Time limit must be between 30 and 120 seconds.";
        }

        if (code === 'LINE') {
            if (size < 4 || size > 5) return "Line size must be between 4 and 5.";
            if (time && (time < 30 || time > 120)) return "Time limit must be between 30 and 120 seconds.";
        }

        return null;
    };

    const handleSaveConfig = async () => {
        if (!selectedGame) return;

        const error = validateConfig(selectedGame, configForm);
        if (error) {
            alert(error);
            return;
        }

        try {
            await api.post(`/api/games/${selectedGame.id}/config`, { config: configForm });
            setDialogOpen(false);
            fetchGames();
        } catch (error) {
            console.error("Failed to save config", error);
            alert("Failed to save configuration");
        }
    };

    const renderConfigInputs = () => {
        if (!selectedGame) return null;
        const code = selectedGame.internal_id || selectedGame.type;

        if (code === 'SNAKE') {
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Board Size (10 - 20)</Label>
                        <Input
                            type="number"
                            min={10} max={20}
                            value={configForm.size || 20}
                            onChange={e => setConfigForm({ ...configForm, size: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Speed (1-8)</Label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min={1} max={8} step={1}
                                value={configForm.speed || 4}
                                onChange={(e) => setConfigForm({ ...configForm, speed: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <span className="w-8 text-center font-bold">{configForm.speed || 4}</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (code === 'CARO4' || code === 'CARO5') {
            const min = code === 'CARO4' ? 5 : 7;
            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Board Size ({min} - 20)</Label>
                        <Input
                            type="number"
                            min={min} max={20}
                            value={configForm.size || 15}
                            onChange={e => setConfigForm({ ...configForm, size: parseInt(e.target.value) })}
                        />
                    </div>
                </div>
            );
        }

        if (code === 'MEM') {
            const minSize = 2;
            const maxSize = 4;

            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Board Size ({minSize} - {maxSize}, Even Total Tiles)</Label>
                        <Input
                            type="number"
                            min={minSize} max={maxSize}
                            value={configForm.size || 4}
                            onChange={e => setConfigForm({ ...configForm, size: parseInt(e.target.value) })}
                        />
                        <p className="text-xs text-muted-foreground">Example: 4x4=16 (Even). 3x3=9 (Odd - Invalid).</p>
                    </div>
                    <div className="space-y-2">
                        <Label>Time Limit (30 - 120s)</Label>
                        <Input
                            type="number"
                            min={30} max={120}
                            value={configForm.time || 60}
                            onChange={e => setConfigForm({ ...configForm, time: parseInt(e.target.value) })}
                        />
                    </div>
                </div>
            );
        }

        if (code === 'LINE') {
            const minSize = 4;
            const maxSize = 5;

            return (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Board Size ({minSize} - {maxSize})</Label>
                        <Input
                            type="number"
                            min={minSize} max={maxSize}
                            value={configForm.size || 5}
                            onChange={e => setConfigForm({ ...configForm, size: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Time Limit (30 - 120s)</Label>
                        <Input
                            type="number"
                            min={30} max={120}
                            value={configForm.time || 60}
                            onChange={e => setConfigForm({ ...configForm, time: parseInt(e.target.value) })}
                        />
                    </div>
                </div>
            );
        }

        return <div className="text-muted-foreground italic">No configuration available for this game.</div>;
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Game Management</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {games.map(game => (
                    <Card key={game.id} className={!game.is_active ? 'opacity-75 bg-muted/50' : ''}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle>{game.name}</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor={`switch-${game.id}`} className="text-xs font-normal text-muted-foreground">
                                        {game.is_active ? 'On' : 'Off'}
                                    </Label>
                                    <input
                                        id={`switch-${game.id}`}
                                        type="checkbox"
                                        checked={game.is_active}
                                        onChange={() => handleToggleStatus(game)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <CardDescription>ID: {game.internal_id || game.type}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-muted-foreground">
                                    {game.is_active ? 'Active' : 'Disabled'}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => openConfig(game)}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configure
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {dialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-background border rounded-lg shadow-lg w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <div className="space-y-1">
                                <h4 className="text-lg font-semibold leading-none tracking-tight">Configure {selectedGame?.name}</h4>
                                <p className="text-sm text-muted-foreground">Update settings for this game.</p>
                            </div>
                            <button onClick={() => setDialogOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="py-4">
                            {renderConfigInputs()}
                        </div>

                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveConfig}>Save Changes</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
