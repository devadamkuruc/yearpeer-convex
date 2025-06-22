"use client"

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
    onChange: (color: string) => void;
    children: React.ReactNode;
    asChild?: boolean;
    defaultColor?: string;
}

export const ColorPicker = ({
                                onChange,
                                children,
                                asChild,
                                defaultColor = "transparent"
                            }: ColorPickerProps) => {
    const [selectedColor, setSelectedColor] = useState(defaultColor);
    const [isOpen, setIsOpen] = useState(false);

    // 12 predefined colors
    const colors = [
        "#ef4444", // Red
        "#f97316", // Orange
        "#f59e0b", // Amber
        "#eab308", // Yellow
        "#84cc16", // Lime
        "#22c55e", // Green
        "#3b82f6", // Blue
        "#6366f1", // Indigo
        "#8b5cf6", // Violet
        "#a855f7", // Purple
        "#ec4899", // Pink
        "#6b7280", // Gray
    ];

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        onChange(color);
        setIsOpen(false);
    };

    const handleRemoveColor = () => {
        setSelectedColor("transparent");
        onChange("transparent");
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild={asChild}>
                {children}
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3" align="start">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Pick a color</h4>
                        {selectedColor !== "transparent" && (
                            <button
                                onClick={handleRemoveColor}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 transition-colors"
                            >
                                <X className="h-3 w-3" />
                                Remove
                            </button>
                        )}
                    </div>

                    {/* Color Grid - 6 colors per row, 2 rows */}
                    <div className="grid grid-cols-6 gap-2">
                        {colors.map((color) => (
                            <button
                                key={color}
                                onClick={() => handleColorSelect(color)}
                                className={cn(
                                    "w-8 h-8 rounded-lg border-2 transition-all duration-200 hover:scale-110 relative",
                                    selectedColor === color
                                        ? "border-gray-900 dark:border-gray-100 shadow-lg"
                                        : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                                )}
                                style={{ backgroundColor: color }}
                                title={color}
                            >
                                {selectedColor === color && (
                                    <Check className="h-4 w-4 text-white absolute inset-0 m-auto drop-shadow-lg" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Show selected color hex */}
                    {selectedColor !== "transparent" && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                <div
                                    className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
                                    style={{ backgroundColor: selectedColor }}
                                />
                                <span className="font-mono">{selectedColor.toUpperCase()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};