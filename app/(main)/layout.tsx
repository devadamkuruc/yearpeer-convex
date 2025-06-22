"use client"

import {useConvexAuth} from "convex/react";
import {Spinner} from "@/components/spinner";
import {redirect} from "next/navigation";
import {Navigation} from "@/app/(main)/_components/navigation";
import {SearchCommand} from "@/components/search-command";

const MainLayout = ({children}: { children: React.ReactNode }) => {
    const {isAuthenticated, isLoading} = useConvexAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg"/>
            </div>
        )
    }

    if (!isAuthenticated) {
        return redirect("/")
    }

    return (
        <div className="min-h-screen flex dark:bg-zinc-900">
            <Navigation />
            <main className="flex-1 h-full overflow-y-auto">
                <SearchCommand />
                {children}
            </main>
        </div>
    );
};

export default MainLayout;