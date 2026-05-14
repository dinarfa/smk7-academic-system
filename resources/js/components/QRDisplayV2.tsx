import { useEffect, useRef, useState } from 'react';

interface QRDisplayProps {
    qrSvg: string;
    startTime?: string;
    endTime: string;
    sessionType: string;
    onExpire?: () => void;
}

export default function QRDisplayV2({ qrSvg, startTime, endTime, sessionType, onExpire }: QRDisplayProps) {
    const [timeRemaining, setTimeRemaining] = useState('');
    const [percent, setPercent] = useState(100);
    const expiredRef = useRef(false);

    useEffect(() => {
        expiredRef.current = false;

        const updateTimer = () => {
            const now = new Date();
            const end = new Date(endTime);
            const start = startTime ? new Date(startTime) : new Date(now.getTime() - 5 * 60000);
            const total = Math.max(1, end.getTime() - start.getTime());
            const remaining = end.getTime() - now.getTime();

            if (remaining <= 0) {
                setTimeRemaining('KADALUARSA');
                setPercent(0);

                if (!expiredRef.current) {
                    expiredRef.current = true;
                    onExpire?.();
                }

                return;
            }

            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);

            const p = Math.max(0, Math.min(100, Math.round((remaining / total) * 100)));
            setPercent(p);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 500);

        return () => clearInterval(interval);
    }, [startTime, endTime, onExpire]);

    const isExpired = timeRemaining === 'KADALUARSA';

    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - percent / 100);

    return (
        <div className="flex flex-col items-center">
            <div className="inline-flex items-center justify-center rounded-2xl border border-white/60 bg-white/80 p-5 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50">
                <div
                    className="[&_svg]:h-full [&_svg]:w-full"
                    style={{ width: 200, height: 200 }}
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
            </div>

            <div className="mt-4 flex flex-col items-center gap-1">
                <div className="relative">
                    <svg className="h-20 w-20" viewBox="0 0 100 100">
                        <g transform="translate(50,50)">
                            <circle r={radius} fill="transparent" stroke="rgba(0,0,0,0.06)" strokeWidth="6" />
                            <circle
                                r={radius}
                                fill="transparent"
                                stroke={isExpired ? '#ef4444' : '#2563eb'}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ transition: 'stroke-dashoffset 0.35s linear' }}
                                transform="rotate(-90)"
                            />
                        </g>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-extrabold tabular-nums ${isExpired ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
                            {isExpired ? 'KADALUARSA' : timeRemaining}
                        </span>
                    </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{sessionType}</p>
            </div>

            {isExpired && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    QR sudah kadaluarsa. Silakan buka sesi baru.
                </div>
            )}
        </div>
    );
}
