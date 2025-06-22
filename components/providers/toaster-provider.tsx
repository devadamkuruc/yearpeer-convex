"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export const ToasterProvider = () => {
    const { resolvedTheme } = useTheme();

    return (
        <Toaster
            position="bottom-center"
            theme={resolvedTheme as "light" | "dark"}
        />
    );
};