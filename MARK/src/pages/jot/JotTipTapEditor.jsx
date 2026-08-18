import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Underline } from '@tiptap/extension-underline'
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { FontFamily } from '@tiptap/extension-font-family'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import TipTapToolbar from './TipTapToolbar'

export default function JotTipTapEditor({ content, onChange, isDark = false }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: 'Write your Notion-style note here...' })
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none min-h-[260px] p-4 text-sm font-medium leading-relaxed rounded-b-2xl ${
          isDark
            ? 'prose-invert text-slate-100 bg-slate-900/90'
            : 'text-slate-800 bg-white/90'
        }`
      }
    }
  })

  // Sync content when external note prop changes
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentHtml = editor.getHTML()
      if (currentHtml !== content) {
        editor.commands.setContent(content || '', false)
      }
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs font-medium">
        Initializing TipTap Notion Editor...
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden flex flex-col transition-colors ${
      isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200/90 bg-white'
    }`}>
      {/* Notion Floating & Sticky Formatting Toolbar */}
      <TipTapToolbar editor={editor} />

      {/* Main TipTap Rich Text Area */}
      <EditorContent editor={editor} />
    </div>
  )
}
