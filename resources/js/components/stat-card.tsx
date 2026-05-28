import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type StatCardProps = {
    icon: LucideIcon;
    label: string;
    value: number | string;
};

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 pt-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-2xl font-semibold tracking-tight">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}
