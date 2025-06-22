"use client"

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

interface DatePickerProps {
    date?: number; // timestamp
    onDateChange: (date: number | undefined) => void;
    placeholder?: string;
    disabled?: (date: Date) => boolean;
    children?: React.ReactNode;
    asChild?: boolean;
    showRemove?: boolean;
    removeText?: string;
    className?: string;
    excludeGoalId?: string; // Exclude current goal from conflicts
    pickerType?: 'start' | 'end'; // NEW: Specify if this is start or end date picker
    startDate?: number; // NEW: For end date picker, provide the start date OR for start date picker, provide the end date
}

export const DatePicker = ({
                               date,
                               onDateChange,
                               placeholder = "Pick a date",
                               disabled,
                               children,
                               asChild,
                               showRemove = false,
                               removeText = "Remove date",
                               className,
                               excludeGoalId,
                               pickerType,
                               startDate
                           }: DatePickerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // Get current year to fetch goals
    const currentYear = new Date().getFullYear();
    const allGoals = useQuery(api.goals.getByYear, { year: currentYear });

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            onDateChange(selectedDate.getTime());
        }
        setIsOpen(false);
    };

    const handleRemoveDate = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDateChange(undefined);
        setIsOpen(false);
    };

    // Helper to check if a date has existing goals
    const hasGoalsOnDate = (checkDate: Date): boolean => {
        if (!allGoals) return false;

        return allGoals.some(goal => {
            // Exclude current goal from conflict check
            if (excludeGoalId && goal._id === excludeGoalId) return false;

            const startDate = goal.startDate ? new Date(goal.startDate) : null;
            const endDate = goal.endDate ? new Date(goal.endDate) : null;

            // Check if date matches start, end, or is within span
            const matchesStart = startDate &&
                startDate.getFullYear() === checkDate.getFullYear() &&
                startDate.getMonth() === checkDate.getMonth() &&
                startDate.getDate() === checkDate.getDate();

            const matchesEnd = endDate &&
                endDate.getFullYear() === checkDate.getFullYear() &&
                endDate.getMonth() === checkDate.getMonth() &&
                endDate.getDate() === checkDate.getDate();

            const withinSpan = startDate && endDate &&
                checkDate > startDate && checkDate < endDate;

            return matchesStart || matchesEnd || withinSpan;
        });
    };

    // Helper to check if selecting an end date would create a conflict
    const wouldCreateRangeConflict = (startDate: Date, endDate: Date): boolean => {
        if (!allGoals) return false;

        return allGoals.some(goal => {
            // Exclude current goal from conflict check
            if (excludeGoalId && goal._id === excludeGoalId) return false;

            const goalStart = goal.startDate ? new Date(goal.startDate) : null;
            const goalEnd = goal.endDate ? new Date(goal.endDate) : null;

            if (!goalStart && !goalEnd) return false;

            // Check various overlap scenarios between our proposed range and existing goal
            if (goalStart && goalEnd) {
                // Goal has both start and end dates - check for any overlap
                return !(endDate < goalStart || startDate > goalEnd);
            } else if (goalStart) {
                // Goal has only start date - check if it falls within our range
                return startDate <= goalStart && goalStart <= endDate;
            } else if (goalEnd) {
                // Goal has only end date - check if it falls within our range
                return startDate <= goalEnd && goalEnd <= endDate;
            }

            return false;
        });
    };

    // Enhanced disabled logic for intelligent range selection
    const combinedDisabled = (checkDate: Date): boolean => {
        // First check the original disabled prop
        if (disabled && disabled(checkDate)) return true;

        // Check for direct goal conflicts on this specific date
        if (hasGoalsOnDate(checkDate)) return true;

        // Smart range validation for END date picker
        if (pickerType === 'end' && startDate) {
            const selectedStartDate = new Date(startDate);

            // For end date picker, check if range from start to this date would conflict
            if (checkDate >= selectedStartDate) {
                if (wouldCreateRangeConflict(selectedStartDate, checkDate)) {
                    return true;
                }
            }
        }

        // Smart range validation for START date picker
        if (pickerType === 'start' && startDate) {
            const selectedEndDate = new Date(startDate); // For start picker, startDate prop is actually the end date

            // For start date picker, check if range from this date to end would conflict
            if (checkDate <= selectedEndDate) {
                if (wouldCreateRangeConflict(checkDate, selectedEndDate)) {
                    return true;
                }
            }
        }

        return false;
    };

    // Custom modifiers for styling dates with goals
    const modifiers = {
        hasGoals: (checkDate: Date) => hasGoalsOnDate(checkDate)
    };

    const modifiersStyles = {
        hasGoals: {
            backgroundColor: '#8b5cf6', // violet-500 - beautiful purple
            color: 'white',
            fontWeight: '600',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(139, 92, 246, 0.25)', // subtle purple shadow
            transform: 'scale(0.95)', // slightly smaller to show it's unavailable
            opacity: '0.9'
        }
    };

    // If children are provided, use them as the trigger
    if (children) {
        return (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild={asChild}>
                    {children}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3 border-b">
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <div className="w-3 h-3 rounded-md bg-violet-500 border border-violet-600"></div>
                            Dates with existing goals
                        </div>
                    </div>
                    <CalendarComponent
                        mode="single"
                        selected={date ? new Date(date) : undefined}
                        onSelect={handleDateSelect}
                        disabled={combinedDisabled}
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        initialFocus
                    />
                    {showRemove && date && (
                        <div className="p-3 border-t">
                            <Button
                                onClick={handleRemoveDate}
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                            >
                                {removeText}
                            </Button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        );
    }

    // Default button trigger
    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(new Date(date), "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3 border-b">
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md bg-violet-500 border border-violet-600"></div>
                        Dates with existing goals
                    </p>
                </div>
                <CalendarComponent
                    mode="single"
                    selected={date ? new Date(date) : undefined}
                    onSelect={handleDateSelect}
                    disabled={combinedDisabled}
                    modifiers={modifiers}
                    modifiersStyles={modifiersStyles}
                    initialFocus
                />
                {showRemove && date && (
                    <div className="p-3 border-t">
                        <Button
                            onClick={handleRemoveDate}
                            variant="outline"
                            size="sm"
                            className="w-full text-xs"
                        >
                            {removeText}
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};