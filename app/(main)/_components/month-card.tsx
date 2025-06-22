"use client"

import {generateMonthData} from "@/lib/utils/calendar";
import {useMemo} from "react";
import {cn} from "@/lib/utils";
import {Doc} from "@/convex/_generated/dataModel";

interface MonthCardProps {
    year: number;
    month: number;
    goals: Doc<"goals">[];
    selectedStartDate?: Date | null;
    selectedEndDate?: Date | null;
    onDateClick?: (date: Date) => void;
}

interface GoalOnDate {
    goal: Doc<"goals">;
    type: 'start' | 'end' | 'span';
}

export const MonthCard = ({year, month, goals, selectedStartDate, selectedEndDate, onDateClick}: MonthCardProps) => {
    const monthData = useMemo(() => {
        return generateMonthData(year, month);
    }, [year, month]);

    // Filter goals to include all goals with dates (colored and uncolored)
    const allGoalsWithDates = useMemo(() => {
        return goals.filter(goal => goal.startDate || goal.endDate);
    }, [goals]);

    // Create a map of date strings to goals
    const goalsByDate = useMemo(() => {
        const dateMap = new Map<string, GoalOnDate[]>();

        allGoalsWithDates.forEach(goal => {
            const startDate = goal.startDate ? new Date(goal.startDate) : null;
            const endDate = goal.endDate ? new Date(goal.endDate) : null;

            // Get all dates in this month
            monthData.days.forEach(day => {
                const currentDate = day.date;
                const dateKey = currentDate.toDateString();

                const goalsOnDate: GoalOnDate[] = dateMap.get(dateKey) || [];

                // Check if this date has a goal
                if (startDate &&
                    startDate.getFullYear() === currentDate.getFullYear() &&
                    startDate.getMonth() === currentDate.getMonth() &&
                    startDate.getDate() === currentDate.getDate()) {
                    goalsOnDate.push({ goal, type: 'start' });
                }

                if (endDate &&
                    endDate.getFullYear() === currentDate.getFullYear() &&
                    endDate.getMonth() === currentDate.getMonth() &&
                    endDate.getDate() === currentDate.getDate() &&
                    (!startDate || startDate.getTime() !== endDate.getTime())) {
                    goalsOnDate.push({ goal, type: 'end' });
                }

                // Check if this date is within a goal span
                if (startDate && endDate &&
                    currentDate > startDate && currentDate < endDate) {
                    // Only add if not already added as start or end
                    const hasStartOrEnd = goalsOnDate.some(g => g.goal._id === goal._id);
                    if (!hasStartOrEnd) {
                        goalsOnDate.push({ goal, type: 'span' });
                    }
                }

                if (goalsOnDate.length > 0) {
                    dateMap.set(dateKey, goalsOnDate);
                }
            });
        });

        return dateMap;
    }, [allGoalsWithDates, monthData.days]);

    const renderGoalBackground = (goalsOnDate: GoalOnDate[]) => {
        if (goalsOnDate.length === 0) return {};

        if (goalsOnDate.length === 1) {
            // Single goal - only fill background if it has a color
            const goal = goalsOnDate[0].goal;
            if (goal.color === "transparent") return {};
            return { backgroundColor: goal.color };
        }

        // Multiple goals - only include goals with actual colors
        const colorsWithGoals = goalsOnDate
            .filter(({goal}) => goal.color !== "transparent")
            .map(({goal}) => goal.color);

        if (colorsWithGoals.length === 0) return {};
        if (colorsWithGoals.length === 1) {
            return { backgroundColor: colorsWithGoals[0] };
        }

        // Multiple goals with colors - create gradient background
        if (colorsWithGoals.length === 2) {
            return {
                background: `linear-gradient(45deg, ${colorsWithGoals[0]} 50%, ${colorsWithGoals[1]} 50%)`
            };
        } else if (colorsWithGoals.length === 3) {
            return {
                background: `linear-gradient(120deg, ${colorsWithGoals[0]} 33.33%, ${colorsWithGoals[1]} 33.33% 66.66%, ${colorsWithGoals[2]} 66.66%)`
            };
        } else {
            return {
                background: `linear-gradient(90deg, ${colorsWithGoals[0]} 25%, ${colorsWithGoals[1]} 25% 50%, ${colorsWithGoals[2]} 50% 75%, ${colorsWithGoals[3]} 75%)`
            };
        }
    };

    // Helper function to check if date is in selected range
    const isDateInRange = (date: Date) => {
        if (!selectedStartDate || !selectedEndDate) return false;
        const startTime = selectedStartDate.getTime();
        const endTime = selectedEndDate.getTime();
        const dateTime = date.getTime();

        const minTime = Math.min(startTime, endTime);
        const maxTime = Math.max(startTime, endTime);

        return dateTime >= minTime && dateTime <= maxTime;
    };

    // Helper function to check if date is selected start or end
    const getSelectionType = (date: Date) => {
        if (selectedStartDate && date.getTime() === selectedStartDate.getTime()) return 'start';
        if (selectedEndDate && date.getTime() === selectedEndDate.getTime()) return 'end';
        return null;
    };

    const checkHasUncoloredOnly = (goalsOnDate: GoalOnDate[]): boolean => {
        if (goalsOnDate.length === 0) return false;
        const coloredGoals = goalsOnDate.filter(({goal}) => goal.color && goal.color !== "transparent");
        const uncoloredGoals = goalsOnDate.filter(({goal}) => !goal.color || goal.color === "transparent");
        return coloredGoals.length === 0 && uncoloredGoals.length > 0;
    };

    return (
        <div>
            {/* Month header */}
            <div className="flex w-full justify-center mb-2 font-medium text-zinc-950 dark:text-zinc-200">
                {monthData.monthName}
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-medium text-zinc-400 py-1"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first day of the month */}
                {Array.from({ length: monthData.firstDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
                ))}
                {/* Actual month days */}
                {monthData.days.map((day, index) => {
                    const dateKey = day.date.toDateString();
                    const goalsOnDate = goalsByDate.get(dateKey) || [];
                    const goalBackground = renderGoalBackground(goalsOnDate);
                    const hasGoals = goalsOnDate.length > 0;
                    const hasUncoloredOnly = checkHasUncoloredOnly(goalsOnDate);
                    const inRange = isDateInRange(day.date);
                    const selectionType = getSelectionType(day.date);

                    const handleClick = () => {
                        if (onDateClick) {
                            onDateClick(day.date);
                        }
                    };

                    return (
                        <div
                            key={`${day.date.getTime()}-${index}`}
                            onClick={handleClick}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center text-sm rounded-lg transition-all cursor-pointer",
                                // Today styling
                                day.isToday && !hasGoals && "bg-white/10",
                                day.isToday && hasGoals && "ring-2 ring-white/30",
                                // Colored goals styling
                                hasGoals && !hasUncoloredOnly ? "text-white font-medium shadow-lg hover:opacity-80 hover:ring-2 hover:ring-white/30" : "text-zinc-900 dark:text-zinc-200",
                                // Uncolored goals styling (gray ring + subtle background)
                                hasUncoloredOnly && "bg-gray-500/10 border border-2 border-gray-400/50 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-gray-500/20 hover:border-gray-400/70",
                                // Selection range styling
                                inRange && !hasGoals && "bg-blue-500/30 text-white",
                                selectionType === 'start' && "ring-2 ring-blue-400",
                                selectionType === 'end' && "ring-2 ring-blue-400",
                                // No goals styling
                                !hasGoals && !inRange && "hover:bg-white/10 dark:hover:bg-white/10"
                            )}
                            style={hasGoals && !hasUncoloredOnly ? goalBackground : undefined}
                            title={
                                hasGoals
                                    ? hasUncoloredOnly
                                        ? `${goalsOnDate.map(g => g.goal.title).join(', ')} (click to assign color)`
                                        : goalsOnDate.map(g => g.goal.title).join(', ')
                                    : selectionType
                                        ? `${selectionType === 'start' ? 'Start' : 'End'} date`
                                        : inRange
                                            ? 'In selected range'
                                            : 'Click to select date'
                            }
                        >
                            <span className={cn("text-sm", day.isToday && "font-bold")}>
                                {day.dayNumber}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};