import React, { useState } from 'react';
import RetroConsole from '@/components/games/RetroConsole';
import GameDetailsPanel from '@/components/games/GameDetailsPanel';

export default function Games() {
    const [selectedGame, setSelectedGame] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Callback from RetroConsole when a game is highlighted/launched
    const handleGameSelect = ({ game, isPlaying }) => {
        setSelectedGame(game);
        setIsPlaying(isPlaying);
    };

    return (
        <div className="p-4 flex justify-center w-full items-start">
            <RetroConsole onGameSelect={handleGameSelect} />
            <GameDetailsPanel game={selectedGame} isPlaying={isPlaying} />
        </div>
    );
}
