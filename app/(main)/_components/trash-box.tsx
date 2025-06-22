"use client"

import {useParams, useRouter} from "next/navigation";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {useState} from "react";
import {Id} from "@/convex/_generated/dataModel";
import {toast} from "sonner";
import {Spinner} from "@/components/spinner";
import {Search, Trash, Undo} from "lucide-react";
import {Input} from "@/components/ui/input";
import ConfirmModal from "@/components/modals/confirm-modal";

const TrashBox = () => {
    const router = useRouter();
    const params = useParams();
    const goals = useQuery(api.goals.getTrash);
    const restore = useMutation(api.goals.restore);
    const remove = useMutation(api.goals.remove);

    const [search, setSearch] = useState("");

    const filteredGoals = goals?.filter((goal) => {
        return goal.title.toLowerCase().includes(search.toLowerCase());
    })

    const onClick = (goalId: string) => {
        router.push(`/goals/${goalId}`);
    };

    const onRestore = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        goalId: Id<"goals">
    ) => {
        event.stopPropagation();
        const promise = restore({id: goalId});

        toast.promise(promise, {
            loading: "Restoring goal...",
            success: "Goal restored!",
            error: "Failed to restore goal.",
        });
    };

    const onRemove = (
        goalId: Id<"goals">
    ) => {
        const promise = remove({id: goalId});

        toast.promise(promise, {
            loading: "Deleting goal...",
            success: "Goal deleted!",
            error: "Failed to delete goal.",
        });

        if (params.goalId === goalId) {
            router.push("/goals");
        }
    };

    if (goals === undefined) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <Spinner size="lg"/>
            </div>
        );
    }

    return (
        <div className="text-sm">
            <div className="flex items-center gap-x-1 p-2">
                <Search className="h-4 w-4"/>
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-7 px-2 focus-visible:ring-transparent bg-secondary"
                    placeholder="Filter by page title..."
                />
            </div>
            <div className="mt-2 px-1 pb-1">
                <p className="hidden last:block text-xs text-center text-muted-foreground pb-2">
                    No goals found.
                </p>
                {filteredGoals?.map((goal) => (
                    <div
                        key={goal._id}
                        role="button"
                        onClick={() => onClick(goal._id)}
                        className="text-sm rounded-sm w-full hover:bg-primary/5 flex items-center text-primary justify-between"
                    >
                        <div className="flex items-center">
                            <div className="ml-2 mr-2 h-2.5 w-2.5 rounded-full"
                                 style={{
                                     background: goal.color
                                 }}
                            />
                            <span className="truncate pl-2">
                                {goal.title}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <div
                                onClick={(e) => onRestore(e, goal._id)}
                                role="button"
                                className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                            >
                                <Undo className="h-4 w-4 text-muted-foreground"/>
                            </div>
                            <ConfirmModal onConfirm={() => onRemove(goal._id)}>
                                <div
                                    role="button"
                                    className="rounded-sm p-2 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                                >
                                    <Trash className="h-4 w-4 text-muted-foreground"/>
                                </div>
                            </ConfirmModal>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrashBox;