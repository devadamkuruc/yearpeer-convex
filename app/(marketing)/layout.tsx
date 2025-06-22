import React from 'react';
import {Navbar} from "@/app/(marketing)/_components/navbar";

const MarketingLayout = ({children}: {children: React.ReactNode}) => {
    return (
        <div className="h-full dark:bg-zinc-900">
            <Navbar />
            <main className="h-full pt-40">
                {children}
            </main>
        </div>
    );
};

export default MarketingLayout;