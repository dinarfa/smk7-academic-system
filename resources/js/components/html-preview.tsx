import DOMPurify from 'dompurify';
import katex from 'katex';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type HtmlPreviewProps = {
    content: string;
    className?: string;
};

function renderMathInElement(element: HTMLElement): void {
    // Block math: $$...$$
    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
    );

    const textNodes: Text[] = [];
    while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text);
    }

    for (const node of textNodes) {
        const text = node.textContent ?? '';
        // Skip if parent is already a katex element or code/pre
        const parent = node.parentElement;
        if (
            !parent ||
            parent.closest('.katex') ||
            parent.closest('pre') ||
            parent.closest('code')
        ) {
            continue;
        }

        // Split by block math $$...$$ and inline math $...$
        const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g);
        if (parts.length <= 1) continue;

        const fragment = document.createDocumentFragment();
        for (const part of parts) {
            if (part.startsWith('$$') && part.endsWith('$$')) {
                const latex = part.slice(2, -2).trim();
                const span = document.createElement('span');
                span.className = 'katex-block my-2 block text-center';
                try {
                    katex.render(latex, span, {
                        displayMode: true,
                        throwOnError: false,
                        trust: false,
                    });
                } catch {
                    span.textContent = part;
                }
                fragment.appendChild(span);
            } else if (
                part.startsWith('$') &&
                part.endsWith('$') &&
                part.length > 2
            ) {
                const latex = part.slice(1, -1).trim();
                const span = document.createElement('span');
                span.className = 'katex-inline';
                try {
                    katex.render(latex, span, {
                        displayMode: false,
                        throwOnError: false,
                        trust: false,
                    });
                } catch {
                    span.textContent = part;
                }
                fragment.appendChild(span);
            } else {
                fragment.appendChild(document.createTextNode(part));
            }
        }

        parent.replaceChild(fragment, node);
    }
}

export default function HtmlPreview({ content, className }: HtmlPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const sanitizedContent = DOMPurify.sanitize(content, {
        ADD_TAGS: ['img'],
        ADD_ATTR: ['src', 'alt', 'width', 'height', 'style'],
    });

    useEffect(() => {
        if (!containerRef.current) return;
        renderMathInElement(containerRef.current);
    }, [sanitizedContent]);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG') {
                const img = target as HTMLImageElement;
                setZoomImage(img.src);
            }
        },
        [],
    );

    return (
        <>
            <div
                ref={containerRef}
                onClick={handleClick}
                className={[
                    'prose prose-sm max-w-none dark:prose-invert',
                    'prose-img:rounded-md prose-img:border prose-img:max-h-64 prose-img:object-contain prose-img:cursor-pointer',
                    'prose-table:border prose-table:border-collapse',
                    'prose-th:border prose-th:border-border prose-th:bg-muted prose-th:px-3 prose-th:py-2',
                    'prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-2',
                    'overflow-x-auto',
                    className ?? '',
                ]
                    .filter(Boolean)
                    .join(' ')}
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />

            <Dialog
                open={!!zoomImage}
                onOpenChange={(open) => {
                    if (!open) setZoomImage(null);
                }}
            >
                <DialogContent className="max-w-3xl border-0 bg-transparent p-0 shadow-none">
                    {zoomImage && (
                        <img
                            src={zoomImage}
                            alt="Preview"
                            className="mx-auto max-h-[80vh] rounded-lg object-contain"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
