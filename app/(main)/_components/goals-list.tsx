"use client"

import {useParams, useRouter} from "next/navigation";
import {useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import Item from "./item";
import {cn} from "@/lib/utils";

export const GoalsList = () => {
    const router = useRouter();
    const params = useParams();

    const goals = useQuery(api.goals.getSidebar);

    const onRedirect = (goalId: string) => {
        router.push(`/goals/${goalId}`);
    }

    if (goals === undefined) {
        return (
            <>
                <Item.Skeleton/>
                <Item.Skeleton/>
            </>
        )
    }

    return (
        <>
            {goals.map((goal) => (
                <div key={goal._id}>
                    <Item
                        id={goal._id}
                        onClick={() => onRedirect(goal._id)}
                        label={goal.title}
                        goalColor={goal.color}
                        active={params.documentId === goal._id}

                    />
                </div>
            ))}
        </>
    )
}