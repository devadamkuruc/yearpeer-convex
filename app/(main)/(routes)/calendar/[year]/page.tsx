"use client"

import {use} from 'react';
import {MonthCard} from "@/app/(main)/_components/month-card";
import {useQuery, useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

interface YearPageProps {
    params: Promise<{
        year: string;
    }>;
}

const YearPage = ({params}: YearPageProps) => {
    const resolvedParams = use(params);
    const year = parseInt(resolvedParams.year, 10);
    const router = useRouter();

    // Date selection state
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

    // Fetch goals for this year
    const goals = useQuery(api.goals.getByYear, { year });
    const createGoal = useMutation(api.goals.create);

    if (isNaN(year)) {
        return <div className="min-h-screen flex items-center justify-center">Invalid year</div>;
    }

    if (goals === undefined) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const handleDateClick = async (clickedDate: Date) => {
        // Check if date already has goals
        const existingGoalsOnDate = goals?.filter(goal => {
            const startDate = goal.startDate ? new Date(goal.startDate) : null;
            const endDate = goal.endDate ? new Date(goal.endDate) : null;

            // Check if clicked date matches start, end, or is within span
            const matchesStart = startDate &&
                startDate.getFullYear() === clickedDate.getFullYear() &&
                startDate.getMonth() === clickedDate.getMonth() &&
                startDate.getDate() === clickedDate.getDate();

            const matchesEnd = endDate &&
                endDate.getFullYear() === clickedDate.getFullYear() &&
                endDate.getMonth() === clickedDate.getMonth() &&
                endDate.getDate() === clickedDate.getDate();

            const withinSpan = startDate && endDate &&
                clickedDate > startDate && clickedDate < endDate;

            return matchesStart || matchesEnd || withinSpan;
        }) || [];

        if (existingGoalsOnDate.length > 0) {
            toast.error("This date already has a goal assigned");
            return;
        }

        if (!selectedStartDate) {
            // First click - set start date
            setSelectedStartDate(clickedDate);
            setSelectedEndDate(null);
        } else if (!selectedEndDate) {
            // Second click - check if range overlaps with existing goals
            const startDate = selectedStartDate;
            const endDate = clickedDate;

            // Ensure start date is before end date
            const actualStartDate = startDate <= endDate ? startDate : endDate;
            const actualEndDate = startDate <= endDate ? endDate : startDate;

            // Check for overlaps in the entire range
            const hasOverlap = goals?.some(goal => {
                const goalStart = goal.startDate ? new Date(goal.startDate) : null;
                const goalEnd = goal.endDate ? new Date(goal.endDate) : null;

                if (!goalStart && !goalEnd) return false;

                // Check various overlap scenarios
                if (goalStart && goalEnd) {
                    // Goal has both start and end dates
                    return !(actualEndDate < goalStart || actualStartDate > goalEnd);
                } else if (goalStart) {
                    // Goal has only start date
                    return actualStartDate <= goalStart && actualEndDate >= goalStart;
                } else if (goalEnd) {
                    // Goal has only end date
                    return actualStartDate <= goalEnd && actualEndDate >= goalEnd;
                }

                return false;
            });

            if (hasOverlap) {
                toast.error("Selected date range overlaps with existing goal");
                setSelectedStartDate(null);
                setSelectedEndDate(null);
                return;
            }

            setSelectedEndDate(actualEndDate);

            try {
                const goalId = await createGoal({
                    title: "Untitled",
                    startDate: actualStartDate.getTime(),
                    endDate: actualEndDate.getTime(),
                });

                toast.success("Goal created! Redirecting to edit...");
                router.push(`/goals/${goalId}`);
            } catch (error) {
                toast.error("Failed to create goal");
                console.error("Error creating goal:", error);
            }
        } else {
            // Third click - reset and start new selection
            setSelectedStartDate(clickedDate);
            setSelectedEndDate(null);
        }
    };

    const monthRows: readonly number[][] = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [8, 9, 10, 11]
    ] as const;

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-10 mx-auto">
            <div className="w-full space-y-3 space-x-5">
                {monthRows.map((row: readonly number[], rowIndex: number) => (
                    <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-14">
                        {row.map((monthIndex: number) => (
                            <MonthCard
                                year={year}
                                key={monthIndex}
                                month={monthIndex}
                                goals={goals}
                                selectedStartDate={selectedStartDate}
                                selectedEndDate={selectedEndDate}
                                onDateClick={handleDateClick}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YearPage;