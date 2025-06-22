"use client"
import {Id} from "@/convex/_generated/dataModel";
import {useRouter} from "next/navigation";
import {useUser} from "@clerk/clerk-react";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {toast} from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreHorizontal, Trash} from "lucide-react";
import {Skeleton} from "@/components/ui/skeleton";

interface MenuProps {
    goalId: Id<"goals">;
}

const Menu = ({goalId}: MenuProps) => {
    const router = useRouter();
    const {user} = useUser();

    const archive = useMutation(api.goals.archive);

    const onArchive = () => {
        const promise = archive({id: goalId});

        toast.promise(promise, {
            loading: "Moving goal to trash...",
            success: "Goal moved to trash!",
            error: "Failed to archive goal.",
        });

        router.push(`/calendar/${new Date().getFullYear()}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="sm"
                    variant="ghost"
                >
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-60"
                align="end"
                alignOffset={8}
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
    );
};

Menu.Skeleton = function MenuSkeleton() {
    return (
        <Skeleton className="h-8 w-8"/>
    )
}

export default Menu;