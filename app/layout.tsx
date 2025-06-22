import type {Metadata} from "next";
import "./globals.css";
import {ThemeProvider} from "@/components/providers/theme-provider";
import ConvexClientProvider from "@/components/providers/convex-provider";
import {EdgeStoreProvider} from "@/lib/edgestore";
import {ClerkProvider} from "@clerk/nextjs";
import {ToasterProvider} from "@/components/providers/toaster-provider";
import {ModalProvider} from "@/components/providers/modal-provider";

export const metadata: Metadata = {
    title: "Yearpeer",
    description: "Think in a big picture.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`min-h-screen antialiased`}>
        <ClerkProvider>
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
        </ClerkProvider>
        </body>
        </html>
    );
}