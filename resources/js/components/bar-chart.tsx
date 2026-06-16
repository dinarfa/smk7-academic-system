import { cn } from '@/lib/utils';

type BarChartData = {
    label: string;
    value: number;
    color?: string;
};

type BarChartProps = {
    data: BarChartData[];
    title?: string;
    className?: string;
};

const defaultColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-emerald-500',
    'bg-blue-500',
];

export function BarChart({ data, title, className }: BarChartProps) {
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className={cn('space-y-3', className)}>
            {title && (
                <h3 className="text-sm font-medium text-foreground">{title}</h3>
            )}
            <div className="space-y-2">
                {data.map((item, index) => {
                    const widthPercent = (item.value / maxValue) * 100;
                    const color =
                        item.color ?? defaultColors[index % defaultColors.length];

                    return (
                        <div
                            key={item.label}
                            className="flex items-center gap-3"
                        >
                            <span className="w-16 shrink-0 text-right text-sm text-muted-foreground">
                                {item.label}
                            </span>
                            <div className="relative h-6 flex-1 overflow-hidden rounded bg-muted">
                                <div
                                    className={cn(
                                        'absolute inset-y-0 left-0 rounded transition-all duration-500',
                                        color,
                                    )}
                                    style={{
                                        width: `${widthPercent}%`,
                                    }}
                                />
                            </div>
                            <span className="w-10 shrink-0 text-sm font-medium text-foreground">
                                {item.value}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
