"use client"

import { useEditor, EditorContent, type Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Toolbar } from "./editor-toolbar"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit.configure({
        // Explicitly enable all features used in the toolbar to ensure types are picked up
        bold: true,
        italic: true,
        bulletList: true,
        orderedList: true,
        heading: {
          levels: [2], // Only allow H2 as per toolbar
        },
        codeBlock: true,
        blockquote: true,
        history: true, // For undo/redo
        horizontalRule: true,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert prose-sm sm:prose-base max-w-none rounded-md border min-h-[150px] border-input bg-background px-3 py-2 focus:outline-none",
      },
    },
    onUpdate({ editor: updatedEditor }) {
      onChange(updatedEditor.getHTML())
    },
  })

  return (
    <div className="flex flex-col justify-stretch gap-2">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}