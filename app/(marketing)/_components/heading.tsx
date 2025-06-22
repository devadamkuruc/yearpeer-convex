"use client"

import {Button} from "@/components/ui/button";
import {ArrowRight} from "lucide-react";
import {useConvexAuth} from "convex/react";
import {Spinner} from "@/components/spinner";
import Link from "next/link";
import {SignInButton} from "@clerk/clerk-react";

export const dynamic = 'force-dynamic'

export const Heading = () => {
    const {isLoading, isAuthenticated} = useConvexAuth();

    return (
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl md-6xl font-bold">
                <span className="underline">Yearpeer</span>, the Only Calendar for Big Picture Thinking
            </h1>
            <h3 className="text-base sm:text-xl md:text-2xl font-medium">
                Cut through the daily noise. Begin with the big picture, keep your long-term goals in focus, and boost
                your productivity
            </h3>
            {isLoading && (
                <div className="w-full flex items-center justify-center">
                    <Spinner size="lg"/>
                </div>
            )}
            {isAuthenticated && !isLoading && (
                <Button asChild>
                    <Link href={`/calendar/${new Date().getFullYear()}`}>
                        Enter Yearpeer
                        <ArrowRight className="h-4 w-4 ml-2"/>
                    </Link>
                </Button>
            )}
            {!isAuthenticated && !isLoading && (
                <SignInButton mode="modal">
                    <Button>
                        Get Yearpeer free
                        <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                </SignInButton>
            )}

        </div>
    )
}