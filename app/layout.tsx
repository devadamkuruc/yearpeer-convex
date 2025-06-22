import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/providers/theme-provider";
import {ConvexClientProvider} from "@/components/providers/convex-provider";
import {ModalProvider} from "@/components/providers/modal-provider";
import {EdgeStoreProvider} from "@/lib/edgestore";
import {ToasterProvider} from "@/components/providers/toaster-provider";

export const metadata: Metadata = {
    title: "Yearpeer",
    description: "Think in a big picture.",
    icons: {
        icon: [
            {
                media: "(prefers-color-scheme: light)",
                url: "/favicon.svg",
                href: "/favicon.svg",
            },
            {
                media: "(prefers-color-scheme: dark)",
                url: "/favicon-dark.svg",
                href: "/favicon-dark.svg",
            }
        ]
    }
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body
            className={`min-h-screen antialiased`}
        >
        <ConvexClientProvider>
            <EdgeStoreProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                    storageKey="yearpeer-theme"
                >
                    <ToasterProvider />
                    <ModalProvider/>
                    {children}
                </ThemeProvider>
            </EdgeStoreProvider>
        </ConvexClientProvider>
        </body>
        </html>
    );
}
