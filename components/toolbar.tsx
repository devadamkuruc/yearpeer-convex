"use client"

import {Doc} from "@/convex/_generated/dataModel";
import {Calendar, Palette} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ComponentRef, useRef, useState} from "react";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import TextareaAutosize from "react-textarea-autosize";
import {ColorPicker} from "@/components/color-picker";
import {DatePicker} from "@/components/date-picker";
import { format } from "date-fns";
import { toast } from "sonner";

interface ToolbarProps {
    initialData: Doc<"goals">;
    preview?: boolean;
}

const Toolbar = ({initialData, preview}: ToolbarProps) => {
    const inputRef = useRef<ComponentRef<"textarea">>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialData.title);

    const update = useMutation(api.goals.update);
    const removeStartDate = useMutation(api.goals.removeStartDate);
    const removeEndDate = useMutation(api.goals.removeEndDate);

    const enableInput = () => {
        if (preview) return;

        setIsEditing(true);
        setTimeout(() => {
            setValue(initialData.title);
            inputRef.current?.focus();
        }, 0);
    };

    const disableInput = () => setIsEditing(false);

    const onInput = (value: string) => {
        setValue(value);
        update({
            id: initialData._id,
            title: value || "Untitled",
        });
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter") {
            event.preventDefault();
            disableInput();
        }
    };

    const onColorSelect = (color: string) => {
        update({
            id: initialData._id,
            color,
        });
    };

    // Updated with error handling
    const onStartDateChange = async (startDate: number | undefined) => {
        if(startDate) {
            const promise = update({
                id: initialData._id,
                startDate,
            });

            toast.promise(promise, {
                loading: "Updating start date...",
                success: "Start date updated successfully.",
                error: "Failed to update a start date.",
            });
        } else {
            const promise = removeStartDate({
                id: initialData._id,
            });

            toast.promise(promise, {
                loading: "Removing start date...",
                success: "Start date removed successfully.",
                error: "Failed to remove a start date.",
            });
        }

    };

    // Updated with error handling
    const onEndDateChange = async (endDate: number | undefined) => {
       if(endDate) {
            const promise = update({
               id: initialData._id,
               endDate,
           });

           toast.promise(promise, {
               loading: "Updating end date...",
               success: "End date updated successfully.",
               error: "Failed to update a end date.",
           });
        } else {
            const promise = removeEndDate({
                id: initialData._id,
            });

            toast.promise(promise, {
                loading: "Removing end date...",
                success: "End date removed successfully.",
                error: "Failed to remove a end date.",
            });
        }
    };

    const formatDateRange = () => {
        if (initialData.startDate && initialData.endDate) {
            const startFormatted = format(new Date(initialData.startDate), "PPP");
            const endFormatted = format(new Date(initialData.endDate), "PPP");

            if (initialData.startDate === initialData.endDate) {
                return startFormatted; // Same date, show once
            }
            return `${startFormatted} - ${endFormatted}`;
        } else if (initialData.startDate) {
            return `From ${format(new Date(initialData.startDate), "PPP")}`;
        } else if (initialData.endDate) {
            return `Until ${format(new Date(initialData.endDate), "PPP")}`;
        }
        return "";
    };

    const hasDate = initialData.startDate || initialData.endDate;

    return (
        <div className="pl-[54px] group relative">
            {!!initialData.color && preview && (
                <div className="ml-2 mr-3.5 h-2.5 w-2.5 rounded-full border border-1 border-muted-foreground"
                     style={{
                         background: initialData.color
                     }}
                />
            )}

            <div className="grid grid-cols-[theme(spacing.14)_1fr] grid-rows-[1fr_1fr_auto] items-start">
                <div className="row-start-1 col-start-2 opacity-0 group-hover:opacity-100 flex items-center gap-x-1 py-4">
                    {!preview && (
                        <ColorPicker asChild onChange={onColorSelect}>
                            <Button
                                className="text-muted-foreground text-xs"
                                variant="outline"
                                size="sm">
                                <Palette className="h-4 w-4 mr-2"/>
                                {!initialData.color ? "Add color" : "Edit color"}
                            </Button>
                        </ColorPicker>
                    )}

                    {!preview && (
                        <DatePicker
                            date={initialData.startDate}
                            onDateChange={onStartDateChange}
                            showRemove={!!initialData.startDate}
                            removeText="Remove start date"
                            excludeGoalId={initialData._id}
                            pickerType="start"
                            startDate={initialData.endDate} // Pass end date as context for start picker
                            asChild
                        >
                            <Button
                                className="text-muted-foreground text-xs"
                                variant="outline"
                                size="sm"
                            >
                                <Calendar className="h-4 w-4 mr-2"/>
                                {initialData.startDate ? "Edit start date" : "Add start date"}
                            </Button>
                        </DatePicker>
                    )}

                    {!preview && (
                        <DatePicker
                            date={initialData.endDate}
                            onDateChange={onEndDateChange}
                            showRemove={!!initialData.endDate}
                            removeText="Remove end date"
                            disabled={(date) =>
                                initialData.startDate ? date < new Date(initialData.startDate) : false
                            }
                            excludeGoalId={initialData._id}
                            pickerType="end"
                            startDate={initialData.startDate}
                            asChild
                        >
                            <Button
                                className="text-muted-foreground text-xs"
                                variant="outline"
                                size="sm"
                            >
                                <Calendar className="h-4 w-4 mr-2"/>
                                {initialData.endDate ? "Edit end date" : "Add end date"}
                            </Button>
                        </DatePicker>
                    )}
                </div>

                {initialData.color && initialData.color !== "transparent" && !preview && (
                    <div className="col-start-1 row-start-2 mt-3.5 ml-2 h-6 w-6 rounded-full"
                         style={{
                             background: initialData.color
                         }}
                    />
                )}

                {isEditing && !preview ? (
                    <TextareaAutosize
                        ref={inputRef}
                        onBlur={disableInput}
                        onKeyDown={onKeyDown}
                        value={value}
                        onChange={(e) => onInput(e.target.value)}
                        className="col-start-2 row-start-2 text-5xl bg-transparent font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] resize-none"
                    />
                ) : (
                    <div
                        onClick={enableInput}
                        className="col-start-2 row-start-2 text-5xl font-bold break-words outline-none text-[#3F3F3F] dark:text-[#CFCFCF] cursor-text"
                    >
                        {initialData.title}
                    </div>
                )}

                {/* Date Display */}
                {hasDate && (
                    <div className="col-start-2 row-start-3 text-sm text-muted-foreground mt-2">
                        {formatDateRange()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Toolbar;