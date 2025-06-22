"use client"

import {Id} from "@/convex/_generated/dataModel";
import {useMutation, useQuery} from "convex/react";
import {api} from "@/convex/_generated/api";
import Toolbar from "@/components/toolbar";
import {use} from "react";
import dynamic from "next/dynamic";
import {useMemo} from "react";

interface GoalIdPageProps {
    params: Promise<{
        goalId: Id<"goals">;
    }>;
}

const GoalIdPage = ({params}: GoalIdPageProps) => {
    const {goalId} = use(params);

    const Editor = useMemo(() => dynamic(() => import("@/components/editor"), {ssr: false}), [])

    const goal = useQuery(api.goals.getById, {
        goalId,
    });

    const update = useMutation(api.goals.update);

    const onChange = (content: string) => {
        update({
            id: goalId,
            content
        })
    }

    if (goal === undefined) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    if (goal === null) {
        return (
            <div>
                Not found
            </div>
        )
    }

    return (
        <div className="pb-40">
            <div className="md:max-w-3xl lg:max-w-4xl mx-auto mt-20">
                <Toolbar initialData={goal}/>
                <Editor
                    onChange={onChange}
                    initialContent={goal.content}
                />
            </div>
        </div>
    );
};

export default GoalIdPage;