"use client"

import {Button} from "@/components/ui/button"
import Link from "next/link";

const Error = () => {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
            <h2 className="text-xl font-medium">Something went wrong!</h2>
            <Button asChild>
                <Link href={`/calendar/${new Date().getFullYear()}`}>
                    Go back
                </Link>
            </Button>
        </div>
    )
}

export default Error;