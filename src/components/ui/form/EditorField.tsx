import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Heading1,
    Heading2,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Underline as UnderlineIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

interface EditorFieldProps {
    content: string;
    onContentChange: (content: string) => void;
    contentClassName?: string;
    className?: string;
    error?: string;
}

export function EditorField({ content, onContentChange, contentClassName, className, error }: EditorFieldProps) {
    const hasError = error != undefined && error != '';

    const editor = useEditor({
        onUpdate: ({ editor }) => {
            onContentChange(editor.getHTML());
        },
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5],
                },
                bulletList: {
                    HTMLAttributes: {
                        class: 'list-disc list-outside pl-5',
                    },
                },
                orderedList: {
                    HTMLAttributes: {
                        class: 'list-decimal list-outside pl-5',
                    },
                },
            }),
            Placeholder.configure({
                placeholder: 'Write something amazing...',
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:text-blue-700 underline',
                },
            }),
        ],
        content: content,
    });

    if (!editor) {
        return null;
    }

    return (
        <div>
            <div
                className={cn('rounded-xl border-2', className, {
                    'border-red-500': hasError,
                })}
            >
                <header className="flex flex-wrap gap-2 border-b p-2">
                    <button
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <Bold size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <Italic size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={editor.isActive('underline') ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <UnderlineIcon size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor.isActive('heading', { level: 1 }) ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <Heading1 size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <Heading2 size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive('bulletList') ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <List size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive('orderedList') ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <ListOrdered size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={editor.isActive({ textAlign: 'left' }) ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <AlignLeft size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={editor.isActive({ textAlign: 'center' }) ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <AlignCenter size={16} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={editor.isActive({ textAlign: 'right' }) ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <AlignRight size={16} />
                    </button>
                    <button
                        onClick={() => {
                            const url = window.prompt('Enter the URL');
                            if (url) {
                                editor.chain().focus().setLink({ href: url }).run();
                            }
                        }}
                        className={editor.isActive('link') ? 'rounded bg-gray-200 p-1' : 'p-1'}
                    >
                        <LinkIcon size={16} />
                    </button>
                </header>
                <section
                    className={cn('min-h-[300px] rounded-xl bg-gray-100', {
                        contentClassName,
                    })}
                >
                    <EditorContent editor={editor} />
                </section>
            </div>
            {hasError && <small className="pl-1 text-red-500">{error}</small>}
        </div>
    );
}
