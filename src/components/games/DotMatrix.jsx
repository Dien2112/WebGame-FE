import React from 'react';
import { GRID_SIZE, COLORS } from '@/game-logic/utils/constants';

const DotMatrix = ({ matrix, onDotClick }) => {
    // Ensure matrix is valid, fallback to empty if not
    const safeMatrix = matrix && matrix.length === GRID_SIZE ? matrix : Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(COLORS.OFF));

    return (
        <div
            className="grid gap-[1px] p-1.5 w-full max-w-[260px] mx-auto bg-slate-50 rounded-xl"
            style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                aspectRatio: '1/1',
            }}
        >
            {safeMatrix.map((row, rIndex) => (
                row.map((color, cIndex) => (
                    <div
                        key={`${rIndex}-${cIndex}`}
                        onClick={() => onDotClick && onDotClick(rIndex, cIndex)}
                        className={`rounded-full w-full h-full transition-colors duration-100 ${onDotClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                        style={{
                            backgroundColor: color,
                            boxShadow: color !== COLORS.OFF ? `0 0 4px ${color}, inset 0 0 2px rgba(255,255,255,0.5)` : 'inset 0 1px 3px rgba(0,0,0,0.5)'
                        }}
                    />
                ))
            ))}
        </div>
    );
};

export default DotMatrix;
