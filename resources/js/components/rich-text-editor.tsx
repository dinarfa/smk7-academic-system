import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import MathInput from '@/components/math-input';
import HtmlPreview from '@/components/html-preview';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    ImagePlus,
    Table2,
    Sigma,
    Eye,
    EyeOff,
    ChevronDown,
} from 'lucide-react';

type RichTextEditorProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    label?: string;
};

function ToolbarButton({
    active,
    onClick,
    title,
    children,
}: {
    active?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted ${
                active
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground'
            }`}
        >
            {children}
        </button>
    );
}

function ToolbarSeparator() {
    return <div className="mx-1 h-6 w-px bg-border" />;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Ketik di sini...',
    error,
    label,
}: RichTextEditorProps) {
    const [showPreview, setShowPreview] = useState(false);
    const [showMathPopover, setShowMathPopover] = useState(false);
    const [mathValue, setMathValue] = useState('');
    const [showTableMenu, setShowTableMenu] = useState(false);
    const tableMenuRef = useRef<HTMLDivElement>(null);
    const mathPopoverRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Underline,
            Image.configure({
                inline: false,
                allowBase64: false,
                HTMLAttributes: {
                    class: 'max-h-64 rounded-md border object-contain',
                },
            }),
            Table.configure({
                resizable: false,
                HTMLAttributes: {
                    class: 'border-collapse border border-border',
                },
            }),
            TableRow,
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-border px-3 py-2',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-border bg-muted px-3 py-2 font-medium',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
        ],
        content: value,
        onUpdate: ({ editor: ed }) => {
            onChange(ed.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none dark:prose-invert min-h-[200px] p-3 focus:outline-none',
            },
        },
    });

    // Sync external value changes (e.g., form reset)
    useEffect(() => {
        if (!editor) return;
        const currentHTML = editor.getHTML();
        if (value !== currentHTML && value !== editor.getHTML()) {
            editor.commands.setContent(value, { emitUpdate: false });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Close menus on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                tableMenuRef.current &&
                !tableMenuRef.current.contains(e.target as Node)
            ) {
                setShowTableMenu(false);
            }
            if (
                mathPopoverRef.current &&
                !mathPopoverRef.current.contains(e.target as Node)
            ) {
                setShowMathPopover(false);
            }
        }

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Paste handler for images
    const handlePaste = useCallback(
        (e: React.ClipboardEvent) => {
            const items = Array.from(e.clipboardData.items);
            const imageItem = items.find((item) =>
                item.type.startsWith('image/'),
            );
            if (!imageItem) return;

            e.preventDefault();
            const file = imageItem.getAsFile();
            if (!file) return;

            uploadAndInsertImage(file);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [editor],
    );

    const uploadAndInsertImage = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/v1/upload/image', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
            });

            if (!response.ok) throw new Error('Upload gagal');

            const data = await response.json();
            editor
                ?.chain()
                .focus()
                .setImage({ src: data.url })
                .run();
        } catch {
            alert('Gagal mengunggah gambar. Silakan coba lagi.');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadAndInsertImage(file);
        }
        // Reset input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const insertTable = (rows: number, cols: number) => {
        editor
            ?.chain()
            .focus()
            .insertTable({ rows, cols, withHeaderRow: true })
            .run();
        setShowTableMenu(false);
    };

    const insertMath = () => {
        if (!mathValue.trim()) return;

        editor
            ?.chain()
            .focus()
            .insertContent(`$$${mathValue}$$`)
            .run();
        setMathValue('');
        setShowMathPopover(false);
    };

    if (!editor) {
        return (
            <div className="rounded-md border border-input bg-muted/30 p-4 text-sm text-muted-foreground">
                Memuat editor...
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {label && <Label>{label}</Label>}
            <div
                className={`overflow-hidden rounded-md border ${
                    error ? 'border-destructive' : 'border-input'
                } focus-within:ring-2 focus-within:ring-ring`}
            >
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-gray-50 px-2 py-1.5 dark:bg-muted/50">
                    <ToolbarButton
                        active={editor.isActive('bold')}
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        title="Bold"
                    >
                        <Bold className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('italic')}
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        title="Italic"
                    >
                        <Italic className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('underline')}
                        onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                        title="Underline"
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarSeparator />

                    <ToolbarButton
                        active={editor.isActive('bulletList')}
                        onClick={() =>
                            editor.chain().focus().toggleBulletList().run()
                        }
                        title="Daftar Bullet"
                    >
                        <List className="h-4 w-4" />
                    </ToolbarButton>
                    <ToolbarButton
                        active={editor.isActive('orderedList')}
                        onClick={() =>
                            editor.chain().focus().toggleOrderedList().run()
                        }
                        title="Daftar Bernomor"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </ToolbarButton>

                    <ToolbarSeparator />

                    {/* Insert Image */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                    <ToolbarButton
                        onClick={() => fileInputRef.current?.click()}
                        title="Sisipkan Gambar"
                    >
                        <ImagePlus className="h-4 w-4" />
                    </ToolbarButton>

                    {/* Insert Table */}
                    <div className="relative" ref={tableMenuRef}>
                        <ToolbarButton
                            onClick={() => setShowTableMenu(!showTableMenu)}
                            title="Sisipkan Tabel"
                        >
                            <span className="inline-flex items-center gap-0.5">
                                <Table2 className="h-4 w-4" />
                                <ChevronDown className="h-3 w-3" />
                            </span>
                        </ToolbarButton>
                        {showTableMenu && (
                            <div className="absolute left-0 top-full z-50 mt-1 rounded-md border border-input bg-background p-2 shadow-md">
                                <p className="mb-2 text-xs text-muted-foreground">
                                    Pilih ukuran tabel:
                                </p>
                                <div className="grid gap-1">
                                    {[2, 3, 4, 5, 6].map((rows) => (
                                        <div
                                            key={rows}
                                            className="flex gap-1"
                                        >
                                            {[2, 3, 4, 5, 6].map((cols) => (
                                                <button
                                                    key={cols}
                                                    type="button"
                                                    className="h-6 w-6 rounded border border-input text-xs hover:bg-muted"
                                                    onClick={() =>
                                                        insertTable(rows, cols)
                                                    }
                                                    title={`${rows} x ${cols}`}
                                                >
                                                    {rows}x{cols}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Insert Math */}
                    <div className="relative" ref={mathPopoverRef}>
                        <ToolbarButton
                            active={showMathPopover}
                            onClick={() =>
                                setShowMathPopover(!showMathPopover)
                            }
                            title="Sisipkan Math (LaTeX)"
                        >
                            <Sigma className="h-4 w-4" />
                        </ToolbarButton>
                        {showMathPopover && (
                            <div className="absolute left-0 top-full z-50 mt-1 w-80 rounded-md border border-input bg-background p-3 shadow-md">
                                <MathInput
                                    value={mathValue}
                                    onChange={setMathValue}
                                    label="Formula Math"
                                    onInsert={insertMath}
                                />
                            </div>
                        )}
                    </div>

                    <ToolbarSeparator />

                    {/* Preview Toggle */}
                    <ToolbarButton
                        active={showPreview}
                        onClick={() => setShowPreview(!showPreview)}
                        title={showPreview ? 'Sembunyikan Preview' : 'Tampilkan Preview'}
                    >
                        {showPreview ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </ToolbarButton>
                </div>

                {/* Editor / Preview */}
                {showPreview ? (
                    <div className="min-h-[200px] overflow-auto p-3">
                        <HtmlPreview content={value} />
                    </div>
                ) : (
                    <div onPaste={handlePaste}>
                        <EditorContent editor={editor} />
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
