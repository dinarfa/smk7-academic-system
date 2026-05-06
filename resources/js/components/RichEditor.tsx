import { useMemo, useRef, useState, useEffect } from 'react';
import JoditEditor from 'jodit-react';

type RichEditorProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    height?: number;
};

export default function RichEditor({ value, onChange, placeholder, height = 300 }: RichEditorProps) {
    const editor = useRef(null);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    setIsDark(document.documentElement.classList.contains('dark'));
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const config = useMemo(
        () => ({
            theme: isDark ? 'dark' : 'default',
            readonly: false,
            placeholder: placeholder || 'Ketik di sini...',
            enableDragAndDropFileToEditor: true,
            uploader: {
                insertImageAsBase64URI: true,
            },
            height: height,
            toolbarButtonSize: 'small' as const,
            buttons: [
                'bold', 'italic', 'underline', 'strikethrough', '|',
                'superscript', 'subscript', '|',
                'ul', 'ol', '|',
                'outdent', 'indent', '|',
                'font', 'fontsize', 'brush', 'paragraph', '|',
                'image', 'table', 'link', '|',
                'align', 'undo', 'redo', '|',
                'hr', 'eraser', 'copyformat', '|',
                'fullsize', 'preview'
            ],
            removeButtons: ['source', 'about', 'print', 'file', 'video'],
            showXPathInStatusbar: false,
            showCharsCounter: false,
            showWordsCounter: false,
            toolbarAdaptive: true,
        }),
        [placeholder, isDark, height]
    );

    return (
        <div className="rich-editor-wrapper">
            <JoditEditor
                ref={editor}
                value={value}
                config={config}
                onBlur={newContent => onChange(newContent)}
            // onChange={newContent => {}} // We use onBlur for performance to avoid constant re-renders
            />
        </div>
    );
}
