"use client"

// import "@blocknote/core/fonts/inter.css";
// import {
//     BlockNoteView,
// } from "@blocknote/mantine";
// import {useCreateBlockNote} from "@blocknote/react";
// import {useTheme} from "next-themes";
// import {useEdgeStore} from "@/lib/edgestore";
// import "@blocknote/mantine/style.css";

interface EditorProps {
    initialContent?: string;
    onChange: (content: string) => void;
}

const Editor = ({
                    initialContent,
                    onChange
                }: EditorProps) => {
    // Temporarily disable BlockNote
    return (
        <div className="pl-[57px] mt-15">
            <div className="p-4 border rounded">
                <p>Editor temporarily disabled for build testing</p>
                <textarea
                    defaultValue={initialContent ? JSON.parse(initialContent) : ""}
                    onChange={(e) => onChange(JSON.stringify(e.target.value))}
                    className="w-full h-64 p-2 border rounded"
                />
            </div>
        </div>
    )
}

export default Editor;