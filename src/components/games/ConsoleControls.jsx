import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, CornerDownLeft, Undo2, HelpCircle } from 'lucide-react';
import { BUTTONS } from '@/game-logic/utils/constants';

const ConsoleControls = ({ onButtonPress, showVertical = false }) => {
    return (
        <div className="flex flex-col items-center gap-2 mt-4 p-3 bg-gray-200 rounded-xl shadow-lg border-t-2 border-white/50 border-b-4 border-black/20 w-fit mx-auto min-w-[200px]">

            {/* Directional Controls */}
            <div className="flex justify-center w-full px-2 items-center">
                {showVertical ? (
                    <div className="flex flex-col items-center gap-1">
                        {/* UP */}
                        <ControlButton
                            onClick={() => onButtonPress(BUTTONS.UP)}
                            label="UP"
                            icon={<ArrowUp size={16} />}
                            color="bg-slate-700 hover:bg-slate-600"
                        />
                        {/* L - Do - R */}
                        <div className="flex items-center gap-1">
                            <ControlButton
                                onClick={() => onButtonPress(BUTTONS.LEFT)}
                                label="LEFT"
                                icon={<ArrowLeft size={16} />}
                                color="bg-slate-700 hover:bg-slate-600"
                            />
                            <ControlButton
                                onClick={() => onButtonPress(BUTTONS.DOWN)}
                                label="DOWN"
                                icon={<ArrowDown size={16} />}
                                color="bg-slate-700 hover:bg-slate-600"
                            />
                            <ControlButton
                                onClick={() => onButtonPress(BUTTONS.RIGHT)}
                                label="RIGHT"
                                icon={<ArrowRight size={16} />}
                                color="bg-slate-700 hover:bg-slate-600"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between w-full px-4 gap-8">
                        <ControlButton
                            onClick={() => onButtonPress(BUTTONS.LEFT)}
                            label="LEFT"
                            icon={<ArrowLeft size={16} />}
                            color="bg-slate-700 hover:bg-slate-600"
                        />
                        <ControlButton
                            onClick={() => onButtonPress(BUTTONS.RIGHT)}
                            label="RIGHT"
                            icon={<ArrowRight size={16} />}
                            color="bg-slate-700 hover:bg-slate-600"
                        />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-2 mt-2">
                <ActionButton
                    onClick={() => onButtonPress(BUTTONS.BACK)}
                    label="BACK"
                    icon={<Undo2 size={14} />}
                    variant="yellow" // B button
                />
                <ActionButton
                    onClick={() => onButtonPress(BUTTONS.ENTER)}
                    label="ENTER"
                    icon={<CornerDownLeft size={14} />}
                    variant="red" // A button
                />
                <ActionButton
                    onClick={() => onButtonPress(BUTTONS.HELP)}
                    label="HELP"
                    icon={<HelpCircle size={14} />}
                    variant="blue" // Select/Start
                />
            </div>
        </div>
    );
};

// Sub-components for styling consistency

const ControlButton = ({ onClick, icon, label, color }) => (
    <div className="flex flex-col items-center gap-0.5">
        <button
            onClick={onClick}
            className={`w-9 h-9 rounded-md ${color} text-white shadow-[0_2px_0_rgb(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center border border-white/20`}
        >
            {icon}
        </button>
        <span className="text-[7px] font-bold text-gray-500 tracking-wider font-mono uppercase scale-90">{label}</span>
    </div>
);

const ActionButton = ({ onClick, icon, label, variant }) => {
    const colors = {
        red: "bg-red-500 hover:bg-red-400 text-white",
        yellow: "bg-yellow-400 hover:bg-yellow-300 text-black",
        blue: "bg-blue-500 hover:bg-blue-400 text-white"
    };

    return (
        <div className="flex flex-col items-center gap-0.5 transform translate-y-1">
            <button
                onClick={onClick}
                className={`w-8 h-8 rounded-full ${colors[variant]} shadow-[0_2px_0_rgb(0,0,0,0.3)] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center border border-white/20`}
            >
                {icon}
            </button>
            <span className="text-[7px] font-bold text-gray-500 tracking-wider font-mono uppercase scale-90">{label}</span>
        </div>
    );
};

export default ConsoleControls;
