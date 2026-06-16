import katex from 'katex';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

type MathInputProps = {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    onInsert?: () => void;
};

const SHORTCUTS = [
    { label: 'a/b', latex: '\\frac{}{}' },
    { label: 'sqrt', latex: '\\sqrt{}' },
    { label: 'x²', latex: '^{}' },
    { label: 'x_n', latex: '_{}' },
    { label: 'int', latex: '\\int' },
    { label: 'sum', latex: '\\sum' },
    { label: 'pi', latex: '\\pi' },
    { label: 'theta', latex: '\\theta' },
    { label: 'infty', latex: '\\infty' },
    { label: 'neq', latex: '\\neq' },
    { label: 'leq', latex: '\\leq' },
    { label: 'geq', latex: '\\geq' },
];

export default function MathInput({
    value,
    onChange,
    label,
    onInsert,
}: MathInputProps) {
    const previewRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (!previewRef.current) return;

        if (!value.trim()) {
            previewRef.current.innerHTML =
                '<span class="text-muted-foreground text-sm italic">Preview akan muncul di sini</span>';
            return;
        }

        try {
            katex.render(value, previewRef.current, {
                displayMode: true,
                throwOnError: false,
                trust: false,
            });
        } catch {
            previewRef.current.innerHTML =
                '<span class="text-destructive text-sm">LaTeX tidak valid</span>';
        }
    }, [value]);

    const insertShortcut = (latex: string) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            onChange(value + latex);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.slice(0, start) + latex + value.slice(end);
        onChange(newValue);

        // Focus and set cursor position after React re-renders
        requestAnimationFrame(() => {
            textarea.focus();
            const cursorPos =
                start +
                (latex.includes('{}') ? latex.indexOf('{}') + 1 : latex.length);
            textarea.setSelectionRange(cursorPos, cursorPos);
        });
    };

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <textarea
                ref={textareaRef}
                className="w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                rows={3}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Masukkan LaTeX, contoh: \frac{a}{b}"
            />
            <div className="flex flex-wrap gap-1">
                {SHORTCUTS.map((s) => (
                    <Button
                        key={s.latex}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => insertShortcut(s.latex)}
                    >
                        {s.label}
                    </Button>
                ))}
            </div>
            <div className="rounded-md border border-input bg-muted/30 p-3">
                <p className="mb-1 text-xs text-muted-foreground">Preview:</p>
                <div ref={previewRef} className="overflow-x-auto" />
            </div>
            {onInsert && (
                <Button type="button" size="sm" onClick={onInsert}>
                    Sisipkan Math
                </Button>
            )}
        </div>
    );
}
