import { useEffect, useState } from 'react';

interface QRDisplayProps {
    qrSvg: string;
    endTime: string;
    sessionType: string;
    onExpire?: () => void;
}

export default function QRDisplay({ qrSvg, endTime, sessionType, onExpire }: QRDisplayProps) {
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        const updateTimer = () => {
            const now = new Date();
            const end = new Date(endTime);
            const diff = end.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining('EXPIRED');
                onExpire?.();
                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [endTime, onExpire]);

    const isExpired = timeRemaining === 'EXPIRED';

    return (
        <div className="qr-display text-center">
            <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-lg shadow-lg">
                <div
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                    className="w-64 h-64 mx-auto"
                />
            </div>

            <div className="mt-4">
                <div className={`text-3xl font-bold ${isExpired ? 'text-red-600' : 'text-blue-600'}`}>
                    {timeRemaining}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                    {sessionType} session
                </div>
            </div>

            {isExpired && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    This QR code has expired. Generate a new one.
                </div>
            )}
        </div>
    );
}