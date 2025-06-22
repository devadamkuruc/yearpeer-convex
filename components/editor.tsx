"use client"

import "@blocknote/core/fonts/inter.css";
import {
    BlockNoteView,
} from "@blocknote/mantine";
import {useCreateBlockNote} from "@blocknote/react";
import {useTheme} from "next-themes";
import {useEdgeStore} from "@/lib/edgestore";
import "@blocknote/mantine/style.css";

interface EditorProps {
    initialContent?: string;
    onChange: (content: string) => void;
}

const Editor = ({
                           initialContent,
                           onChange
                       }: EditorProps) => {
    const {resolvedTheme} = useTheme();
    const {edgestore} = useEdgeStore();

    const handleUpload = async (file: File) => {
        const response = await edgestore.publicFiles.upload({
            file
        });
        return response.url;
    }

    const editor = useCreateBlockNote({
        initialContent: initialContent ? JSON.parse(initialContent) : undefined,
        uploadFile: handleUpload
    });

    return (
        <div className="pl-[57px] mt-15">
            <BlockNoteView
                editor={editor}
                onChange={() => {
                    if (onChange) {
                        onChange(JSON.stringify(editor.document));
                    }
                }}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                data-theming-css-variables-demo/>
        </div>
    )
}

export default Editor;