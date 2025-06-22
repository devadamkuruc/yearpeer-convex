"use client"
import {Id} from "@/convex/_generated/dataModel";
import {useRouter} from "next/navigation";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import ConfirmModal from "@/components/modals/confirm-modal";

interface BannerProps {
    goalId: Id<"goals">;
}

const Banner = ({goalId}: BannerProps) => {
    const router = useRouter();

    const remove = useMutation(api.goals.remove);
    const restore = useMutation(api.goals.restore);

    const onRemove = () => {
        const promise = remove({id: goalId});

        toast.promise(promise, {
            loading: "Deleting a goal...",
            success: "Goal deleted!",
            error: "Failed to delete a goal.",
        });

        router.push(`/calendar/${new Date().getFullYear()}`);
    };

    const onRestore = () => {
        const promise = restore({id: goalId});

        toast.promise(promise, {
            loading: "Restoring a goal...",
            success: "Goal restored!",
            error: "Failed to restore a goal.",
        });
    };

    return (
        <div className="w-full bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
            <p>This page is in the Trash.</p>
            <Button
                size="sm"
                onClick={onRestore}
                variant="outline"
                className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
            >
                Restore page
            </Button>
            <ConfirmModal onConfirm={onRemove}>
                <Button
                    size="sm"
                    variant="outline"
                    className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
                >
                    Permanently delete
                </Button>
            </ConfirmModal>
        </div>
    );
};

export default Banner;