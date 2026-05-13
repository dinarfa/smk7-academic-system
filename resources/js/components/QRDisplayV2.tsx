import { useEffect, useState } from 'react';

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

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const end = new Date(endTime);
            const start = startTime ? new Date(startTime) : new Date(now.getTime() - 5 * 60000);
            const total = Math.max(1, end.getTime() - start.getTime());
            const remaining = end.getTime() - now.getTime();

            if (remaining <= 0) {
                setTimeRemaining('KADALUARSA');
                setPercent(0);
                onExpire?.();
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
        <div className="qr-display text-center">
            <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-lg">
                <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                    <div dangerouslySetInnerHTML={{ __html: qrSvg }} className="w-56 h-56" />

                    <svg className="absolute w-40 h-40" viewBox="0 0 100 100">
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
                </div>
            </div>

            <div className="mt-4">
                <div className={`text-3xl font-bold ${isExpired ? 'text-red-600' : 'text-sky-600'}`}>
                    {isExpired ? 'KADALUARSA' : timeRemaining}
                </div>
                <div className="text-sm text-gray-600 mt-1">{sessionType}</div>
            </div>

            {isExpired && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">QR sudah kadaluarsa. Silakan buka sesi baru.</div>
            )}
        </div>
    );
}
