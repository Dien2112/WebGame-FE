import React from 'react';
import { COLORS } from '@/game-logic/utils/constants';

const ColorPicker = ({ selectedColorIndex, onColorSelect, onClearAll }) => {
    const [customColor, setCustomColor] = React.useState('#FF00FF');
    const colorInputRef = React.useRef(null);

    // Available colors for painting
    const colorPalette = [
        { color: COLORS.OFF, name: 'Eraser', isEraser: true },
        { color: COLORS.BLACK, name: 'Black' },
        { color: '#6B7280', name: 'Gray' },
        { color: '#991B1B', name: 'Dark Red' },
        { color: COLORS.RED, name: 'Red' },
        { color: '#F97316', name: 'Orange' },
        { color: COLORS.YELLOW, name: 'Yellow' },
        { color: '#10B981', name: 'Green' },
        { color: '#06B6D4', name: 'Cyan' },
        { color: COLORS.BLUE, name: 'Blue' },
        { color: COLORS.PURPLE, name: 'Purple' },

        // Row 2
        { color: '#FFFFFF', name: 'White' },
        { color: '#9CA3AF', name: 'Light Gray' },
        { color: '#92400E', name: 'Brown' },
        { color: '#FCA5A5', name: 'Pink' },
        { color: '#FCD34D', name: 'Gold' },
        { color: '#FEF3C7', name: 'Cream' },
        { color: '#BEF264', name: 'Lime' },
        { color: '#A5F3FC', name: 'Light Cyan' },
        { color: '#93C5FD', name: 'Light Blue' },
        { color: '#DDD6FE', name: 'Lavender' },
    ];

    const handleColorWheelClick = () => {
        colorInputRef.current?.click();
    };

    const handleCustomColorChange = (e) => {
        const newColor = e.target.value;
        setCustomColor(newColor);
        // Select the custom color (index 21 - after all preset colors)
        onColorSelect(21, newColor);
    };

    return (
        <div className="w-full max-w-[320px] mx-auto mb-4 bg-gray-800 rounded-xl p-4">
            <div className="grid grid-cols-11 gap-3 mb-3">
                {colorPalette.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onColorSelect(index)}
                        className={`
                            w-7 h-7 rounded-full transition-all duration-200 flex items-center justify-center
                            ${selectedColorIndex === index
                                ? 'scale-110'
                                : 'hover:scale-105'
                            }
                        `}
                        style={{
                            backgroundColor: item.isEraser ? '#E5E7EB' : item.color,
                            border: item.color === COLORS.OFF || item.color === '#FFFFFF'
                                ? '2px solid #4B5563'
                                : selectedColorIndex === index
                                    ? '3px solid #06B6D4'
                                    : 'none'
                        }}
                        title={item.name}
                    >
                        {item.isEraser && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4 text-gray-600"
                            >
                                <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" />
                                <path d="M22 21H7" />
                                <path d="m5 11 9 9" />
                            </svg>
                        )}
                    </button>
                ))}

                {/* Color Wheel - Custom Color Picker */}
                <button
                    onClick={handleColorWheelClick}
                    className={`
                        w-7 h-7 rounded-full transition-all duration-200 flex items-center justify-center relative overflow-hidden
                        ${selectedColorIndex === 21
                            ? 'scale-110'
                            : 'hover:scale-105'
                        }
                    `}
                    style={{
                        background: 'conic-gradient(from 0deg, red, yellow, lime, cyan, blue, magenta, red)',
                        border: '2px solid #4B5563'
                    }}
                    title="Pick Custom Color"
                >
                    <input
                        ref={colorInputRef}
                        type="color"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        className="absolute opacity-0 w-0 h-0"
                    />
                </button>

                {/* Custom Color Preview */}
                <button
                    onClick={() => onColorSelect(21, customColor)}
                    className={`
                        w-7 h-7 rounded-full transition-all duration-200
                        ${selectedColorIndex === 21
                            ? 'scale-110'
                            : 'hover:scale-105'
                        }
                    `}
                    style={{
                        backgroundColor: customColor,
                        border: selectedColorIndex === 21 ? '3px solid #06B6D4' : '2px solid #4B5563'
                    }}
                    title={`Custom Color: ${customColor}`}
                />
            </div>

            <button
                onClick={onClearAll}
                className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 font-mono text-xs uppercase tracking-wider py-1.5 rounded-md transition-colors duration-200 border border-gray-600"
            >
                Clear All
            </button>

            <div className="text-center text-gray-400 text-xs font-mono uppercase tracking-wider mt-2">
                Colors
            </div>
        </div>
    );
};

export default ColorPicker;
