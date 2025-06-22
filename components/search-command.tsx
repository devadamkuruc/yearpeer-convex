"use client"

import {useUser} from "@clerk/clerk-react";
import {useRouter} from "next/navigation";
import {useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import {useSearch} from "@/hooks/use-search";
import {useEffect, useState} from "react";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";

export const SearchCommand = () => {
    const {user} = useUser();
    const router = useRouter();
    const goals = useQuery(api.goals.getSearch);
    const [isMounted, setIsMounted] = useState(false);

    const toggle = useSearch((store) => store.toggle);
    const isOpen = useSearch((store) => store.isOpen);
    const onClose = useSearch((store) => store.onClose);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggle();
            }
        }

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [toggle]);

    const onSelect = (id: string) => {
        router.push(`/goals/${id}`);
        onClose();
    }

    if (!isMounted) {
        return null;
    }

    return (
        <CommandDialog open={isOpen} onOpenChange={onClose}>
            <CommandInput
                placeholder={`Search ${user?.fullName}'s Yotion...`}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Goals">
                    {goals?.map((goal) => (
                        <CommandItem
                            key={goal._id}
                            value={`${goal._id}-${goal.title}`}
                            title={goal.title}
                            onSelect={onSelect}
                        >
                            {goal.color && (
                                <div className="ml-2 mr-2 h-2.5 w-2.5 rounded-full"
                                     style={{
                                         background: goal.color
                                     }}
                                />
                            )}
                            <span>
                                {goal.title}
                            </span>
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}