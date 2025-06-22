"use client"

import { LucideIcon, MoreHorizontal, Plus, Trash} from "lucide-react";
import {Id} from "@/convex/_generated/dataModel";
import {cn} from "@/lib/utils";
import {Skeleton} from "@/components/ui/skeleton";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {useUser} from "@clerk/clerk-react";

interface ItemProps {
    id?: Id<"goals">
    goalColor?: string;
    active?: boolean;
    expanded?: boolean;
    isSearch?: boolean;
    onExpand?: () => void;
    label: string;
    onClick?: () => void;
    icon?: LucideIcon;
}

const Item = ({
                  id,
                  goalColor,
                  active,
                  expanded,
                  isSearch,
                  onExpand,
                  label,
                  onClick,
                  icon: Icon
              }: ItemProps) => {
    const {user} = useUser();
    const router = useRouter();
    const create = useMutation(api.goals.create);
    const archive = useMutation(api.goals.archive);

    const onArchive = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        if(!id) return;
        const promise = archive({id})
            .then(() => router.push(`/calendar/${new Date().getFullYear()}`));

        toast.promise(promise, {
            loading: "Moving to trash...",
            success: "Goal moved to trash!",
            error: "Failed to archive goal.!",
        })
    }

    const onCreate = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        if (!id) return;

        const promise = create({title: "Untitled"})
            .then((goalId) => {
                if (!expanded) {
                    onExpand?.();
                }
                router.push(`/goals/${goalId}`);
            });

        toast.promise(promise, {
            loading: "Creating a new goal...",
            success: "New goal created!",
            error: "Failed to creating new goal.",
        })
    }

    return (
        <div
            onClick={onClick}
            role="button"
            className={cn(
                "group min-h-[27px] text-sm py-1 pl-3 pr-3 w-full hover:bg-primary/5 flex items-center text-zinc-900 dark:text-muted-foreground font-medium",
                active && "bg-primary/5 text-primary"
            )}
        >
            {id && (
                <div className={cn(
                    "ml-1.5 mr-3.5 h-3.5 w-3.5 rounded-full border border-1 border-muted-foreground",
                    goalColor && goalColor !== "transparent" && "border-none"
                )}
                     style={{
                         background: goalColor
                     }}
                />
            )}

            {Icon && (
                <Icon
                    className="shrink-0 h-[18px] mr-2 text-muted-foreground"
                />
            )}

            <span className="truncate">
                {label}
            </span>
            {isSearch && (
                <kbd
                    className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            )}
            {!!id && (
                <div className="ml-auto flex items-center gap-x-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                role="button"
                                className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
                            >
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground"/>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-60"
                            align="start"
                            side="right"
                            forceMount
                        >
                            <DropdownMenuItem onClick={onArchive}>
                                <Trash className="h-4 w-4 mr-2"/>
                                Delete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <div className="text-xs text-muted-foreground p-2">
                                Last edited by: {user?.fullName}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <div
                        className="opacity-0 group-hover:opacity-100 h-full ml-auto rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600"
                        role="button"
                        onClick={onCreate}
                    >
                        <Plus className="h-4 w-4 text-muted-foreground"/>
                    </div>
                </div>
            )}
        </div>
    );
};

Item.Skeleton = function ItemSkeleton() {
    return (
        <div
            className="flex gap-x-2 pl-3 py-[3px]"
        >
            <Skeleton className="h-4 w-4"/>
            <Skeleton className="h-4 w-[30%]"/>
        </div>
    )
}

export default Item;