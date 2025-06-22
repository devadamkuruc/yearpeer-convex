"use client"

import {useScrollTop} from "@/hooks/use-scroll-top";
import {cn} from "@/lib/utils";
import Logo from "@/app/(marketing)/_components/logo";
import {ModeToggle} from "@/components/mode-toggle";
import {useConvexAuth} from "convex/react";
import {SignInButton, UserButton} from "@clerk/clerk-react";
import {Button} from "@/components/ui/button";
import {Spinner} from "@/components/spinner";
import Link from "next/link";
import { useEffect, useState } from "react";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const Navbar = () => {
    const {isAuthenticated, isLoading} = useConvexAuth();
    const scrolled = useScrollTop();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const currentYear = new Date().getFullYear();

    return (
        <div className={cn(
            "z-50 bg-background dark:bg-zinc-900 fixed top-0 flex items-center w-full p-6",
            scrolled && "border-b shadow-sm"
        )}>
            <Logo/>
            <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
                {!isMounted || isLoading ? (
                    <Spinner/>
                ) : (
                    <>
                        {!isAuthenticated && (
                            <>
                                <SignInButton mode="modal">
                                    <Button variant="ghost" size="sm">
                                        Log in
                                    </Button>
                                </SignInButton>
                                <SignInButton mode="modal">
                                    <Button size="sm">
                                        Get Yearpeer free
                                    </Button>
                                </SignInButton>
                            </>
                        )}
                        {isAuthenticated && (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href={`/calendar/${currentYear}`}>
                                        Enter Yearpeer
                                    </Link>
                                </Button>
                                <UserButton />
                            </>
                        )}
                    </>
                )}
                <ModeToggle/>
            </div>
        </div>
    )
}