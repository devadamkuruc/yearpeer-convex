"use client"

import {Calendar, ChevronsLeft, MenuIcon, PlusCircle, Search, Settings, Trash} from "lucide-react";
import {ComponentRef, useEffect, useRef, useState, useCallback} from "react"; // Add useCallback
import {useMediaQuery} from "usehooks-ts";
import {useParams, usePathname, useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {UserItem} from "@/app/(main)/_components/user-item";
import {api} from "@/convex/_generated/api";
import {useMutation} from "convex/react";
import {toast} from "sonner";
import Item from "@/app/(main)/_components/item";
import {GoalsList} from "@/app/(main)/_components/goals-list";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import TrashBox from "@/app/(main)/_components/trash-box";
import {useSearch} from "@/hooks/use-search";
import {useSettings} from "@/hooks/use-settings";
import Navbar from "@/app/(main)/_components/navbar";

export const Navigation = () => {
    const search = useSearch();
    const settings = useSettings();
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const isMobile = useMediaQuery("(max-width: 768px)");
    const create = useMutation(api.goals.create);

    const isResizingRef = useRef(false);
    const sidebarRef = useRef<ComponentRef<"aside">>(null);
    const navbarRef = useRef<ComponentRef<"div">>(null);
    const [isResetting, setIsResetting] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(isMobile);

    // Wrap resetWidth in useCallback
    const resetWidth = useCallback(() => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(false);
            setIsResetting(true);

            sidebarRef.current.style.width = isMobile ? "100%" : "240px";
            navbarRef.current.style.setProperty("width", isMobile ? "0" : "calc(100% - 240px");
            navbarRef.current.style.setProperty("left", isMobile ? "100%" : "240px");

            setTimeout(() => setIsResetting(false), 300);
        }
    }, [isMobile]);

    // Wrap collapse in useCallback too
    const collapse = useCallback(() => {
        if (sidebarRef.current && navbarRef.current) {
            setIsCollapsed(true);
            setIsResetting(true);

            sidebarRef.current.style.width = "0";
            navbarRef.current.style.setProperty("width", "100%");
            navbarRef.current.style.setProperty("left", "0");

            setTimeout(() => setIsResetting(false), 300);
        }
    }, []);

    useEffect(() => {
        if (isMobile) {
            collapse();
        } else {
            resetWidth();
        }
    }, [isMobile, resetWidth, collapse]) // Now include the dependencies

    useEffect(() => {
        if (isMobile) {
            collapse()
        }
    }, [pathname, isMobile, collapse]);

    // Rest of your component stays the same...
    const handleMouseDown = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        event.preventDefault();
        event.stopPropagation();

        isResizingRef.current = true;
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    }

    const handleMouseMove = (event: MouseEvent) => {
        if (!isResizingRef.current) return;
        let newWidth = event.clientX;

        if (newWidth < 240) newWidth = 240;
        if (newWidth > 480) newWidth = 480;

        if (sidebarRef.current && navbarRef.current) {
            sidebarRef.current.style.width = `${newWidth}px`;
            navbarRef.current.style.setProperty("left", `${newWidth}px`);
            navbarRef.current.style.setProperty("width", `calc(100% - ${newWidth}px)`);
        }
    }

    const handleMouseUp = () => {
        isResizingRef.current = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
    }

    const handleCreate = () => {
        const promise = create({title: "Untitled"})
            .then((goalId) => router.push(`/goals/${goalId}`));

        toast.promise(promise, {
            loading: "Creating a new goal...",
            success: "New goal created!",
            error: "Failed to creating new goal.",
        })
    }

    const handleCalendarClick = () => {
        const currentYear = new Date().getFullYear();
        router.push(`/calendar/${currentYear}`);
    };

    return (
        <>
            <aside
                ref={sidebarRef}
                className={cn(
                    "group/sidebar min-h-screen bg-zinc-100 dark:bg-zinc-950 overflow-y-auto relative  flex w-60 flex-col z-[99999]",
                    isResetting && "transition-all ease-in-out duration-300",
                    isMobile && "w-0"
                )}
            >
                <div
                    onClick={collapse}
                    role="button"
                    className={cn(
                        "h-6 w-6 rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition",
                        isMobile && "opacity-100"
                    )}
                >
                    <ChevronsLeft className="h-6 w-6 text-muted-foreground"/>
                </div>

                <div>
                    <UserItem/>
                    <Item
                        label="Search"
                        icon={Search}
                        isSearch
                        onClick={search.onOpen}
                    />
                    <Item
                        label="Calendar"
                        icon={Calendar}
                        onClick={handleCalendarClick}
                    />
                    <Item
                        label="Settings"
                        icon={Settings}
                        onClick={settings.onOpen}
                    />
                    <Item
                        onClick={handleCreate}
                        label="New goal"
                        icon={PlusCircle}
                    />
                </div>
                <div className="mt-4">
                    <GoalsList />
                    <Popover>
                        <PopoverTrigger className="w-full mt-4">
                            <Item
                                label="Trash"
                                icon={Trash}
                            />
                        </PopoverTrigger>
                        <PopoverContent
                            side={isMobile ? "bottom" : "right"}
                            className="p-0 w-72"
                        >
                            <TrashBox/>
                        </PopoverContent>
                    </Popover>
                </div>

                <div
                    onMouseDown={handleMouseDown}
                    onClick={resetWidth}
                    className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize absolute h-full w-1 bg-primary/10 right-0 top-0"
                />
            </aside>
            <div
                ref={navbarRef}
                className={cn(
                    "absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]",
                    isResetting && "transition-all ease-in-out duration-300",
                    isMobile && "left-0 w-full"
                )}
            >
                {!!params.goalId ? (
                    <Navbar
                        isCollapsed={isCollapsed}
                        onResetWidth={resetWidth}
                    />
                ) : (
                    <nav className="bg-transparent px-3 py-2 w-full">
                        {isCollapsed &&
                            <MenuIcon onClick={resetWidth} role="button" className="h-6 w-6 text-muted-foreground"/>}
                    </nav>
                )}
            </div>
        </>
    )
}