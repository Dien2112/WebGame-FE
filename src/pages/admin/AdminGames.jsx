import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameConfig } from "@/context/GameConfigContext";

export default function AdminGames() {
    const { games, toggleGame, updateBoardSize, resetToDefault } = useGameConfig();
    const [editingGame, setEditingGame] = useState(null);
    const [tempSize, setTempSize] = useState({ width: 0, height: 0 });

    const startEditing = (game) => {
        setEditingGame(game.id);
        setTempSize({ ...game.boardSize });
    };

    const cancelEditing = () => {
        setEditingGame(null);
        setTempSize({ width: 0, height: 0 });
    };

    const saveSize = (gameId) => {
        const game = games.find(g => g.id === gameId);

        // Validate size
        if (tempSize.width < game.minSize.width || tempSize.width > game.maxSize.width ||
            tempSize.height < game.minSize.height || tempSize.height > game.maxSize.height) {
            alert(`Size must be between ${game.minSize.width}x${game.minSize.height} and ${game.maxSize.width}x${game.maxSize.height}`);
            return;
        }

        // Special validation for memory game (must have even total cards)
        if (gameId === "memory" && (tempSize.width * tempSize.height) % 2 !== 0) {
            alert("Memory game must have an even number of total cards");
            return;
        }

        updateBoardSize(gameId, { ...tempSize });
        setEditingGame(null);
    };

    return (
        <div>
            <h3 className="text-2xl font-bold mb-2">Game Management</h3>
            <p className="text-muted-foreground mb-6">Enable/disable games and configure board sizes</p>

            <div className="grid gap-4">
                {games.map((game) => (
                    <div
                        key={game.id}
                        className={`p-4 border rounded-lg transition-all ${
                            game.enabled
                                ? "bg-card border-border"
                                : "bg-muted/50 border-muted opacity-60"
                        }`}
                    >
                        <div className="flex items-start justify-between">
                            {/* Game Info */}
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{game.icon}</span>
                                <div>
                                    <h4 className="font-semibold text-lg flex items-center gap-2">
                                        {game.name}
                                        {!game.enabled && (
                                            <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                                                Disabled
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">{game.description}</p>
                                </div>
                            </div>

                            {/* Enable/Disable Toggle */}
                            <Button
                                variant={game.enabled ? "destructive" : "default"}
                                size="sm"
                                onClick={() => toggleGame(game.id)}
                            >
                                {game.enabled ? "Disable" : "Enable"}
                            </Button>
                        </div>

                        {/* Board Size Configuration */}
                        <div className="mt-4 pt-4 border-t">
                            {game.hasBoardSize ? (
                                <div className="flex items-center gap-4">
                                    <Label className="text-sm font-medium min-w-[80px]">Board Size:</Label>

                                    {editingGame === game.id ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                value={tempSize.width}
                                                onChange={(e) => setTempSize({ ...tempSize, width: parseInt(e.target.value) || 0 })}
                                                className="w-20 h-8"
                                                min={game.minSize.width}
                                                max={game.maxSize.width}
                                            />
                                            <span className="text-muted-foreground">×</span>
                                            <Input
                                                type="number"
                                                value={tempSize.height}
                                                onChange={(e) => setTempSize({ ...tempSize, height: parseInt(e.target.value) || 0 })}
                                                className="w-20 h-8"
                                                min={game.minSize.height}
                                                max={game.maxSize.height}
                                            />
                                            <Button size="sm" variant="outline" onClick={() => saveSize(game.id)}>
                                                Save
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                                                {game.boardSize.width} × {game.boardSize.height}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                (min: {game.minSize.width}×{game.minSize.height}, max: {game.maxSize.width}×{game.maxSize.height})
                                            </span>
                                            <Button size="sm" variant="ghost" onClick={() => startEditing(game)}>
                                                Edit
                                            </Button>
                                        </div>
                                    )}

                                    {game.note && (
                                        <span className="text-xs text-amber-600 dark:text-amber-400">
                                            ⚠️ {game.note}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Label className="text-sm font-medium min-w-[80px]">Board Size:</Label>
                                    <span className="text-sm text-muted-foreground italic">
                                        {game.id === "tictactoe"
                                            ? "Fixed 3×3 (cannot be changed)"
                                            : "Not applicable for this game"
                                        }
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold mb-2">Summary</h4>
                        <div className="flex gap-6 text-sm">
                            <span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    {games.filter(g => g.enabled).length}
                                </span> games enabled
                            </span>
                            <span>
                                <span className="font-medium text-red-600 dark:text-red-400">
                                    {games.filter(g => !g.enabled).length}
                                </span> games disabled
                            </span>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetToDefault}>
                        Reset to Default
                    </Button>
                </div>
            </div>
        </div>
    );
}
