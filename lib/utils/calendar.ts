const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
] as const;

export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year: number, month: number): number => {
    return new Date(year, month, 1).getDay();
};

export const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
};

export const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
};

export const getMonthName = (month: number): string => {
    return MONTH_NAMES[month] || 'Invalid Month';
};

// Simplified version - only current month days
export const generateMonthDays = (year: number, month: number) => {
    const days = [];
    const daysInMonth = getDaysInMonth(year, month);

    // Only generate days for the current month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);

        days.push({
            date,
            dayNumber: day,
            isCurrentMonth: true,
            isToday: isToday(date),
            isWeekend: isWeekend(date)
        });
    }

    return days;
};

// Helper function to generate complete month data
export const generateMonthData = (year: number, month: number) => {
    return {
        year,
        month,
        monthName: getMonthName(month),
        days: generateMonthDays(year, month),
        firstDayOfWeek: getFirstDayOfMonth(year, month) // You might need this for grid positioning
    };
};