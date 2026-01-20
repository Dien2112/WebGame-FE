import React, { useState } from 'react';
import RetroConsole from '@/components/games/RetroConsole';
import GameDetailsPanel from '@/components/games/GameDetailsPanel';

export default function Games() {
    const [selectedGame, setSelectedGame] = useState(null);
    const [gameStats, setGameStats] = useState({ score: 0, time: 0 });

    // Callback from RetroConsole when a game is highlighted/launched
    const handleGameSelect = (game, stats) => {
        setSelectedGame(game);
        if (stats) setGameStats(stats);
    };

    return (
        <div className="p-4 flex justify-center w-full items-start">
            <RetroConsole onGameSelect={handleGameSelect} />
            <GameDetailsPanel game={selectedGame} runtimeStats={gameStats} />
        </div>
    );
}
