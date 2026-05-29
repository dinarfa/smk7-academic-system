import DOMPurify from 'dompurify';
import { useEffect, useRef, useState } from 'react';

interface QRDisplayProps {
    qrSvg: string;
    endTime: string;
    sessionType: string;
    onExpire?: () => void;
}

export default function QRDisplay({
    qrSvg,
    endTime,
    sessionType,
    onExpire,
}: QRDisplayProps) {
    const [timeRemaining, setTimeRemaining] = useState('');
    const expiredRef = useRef(false);

    useEffect(() => {
        expiredRef.current = false;

        const updateTimer = () => {
            const now = new Date();
            const end = new Date(endTime);
            const diff = end.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining('EXPIRED');

                if (!expiredRef.current) {
                    expiredRef.current = true;
                    onExpire?.();
                }

                return;
            }

            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeRemaining(
                `${minutes}:${seconds.toString().padStart(2, '0')}`,
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [endTime, onExpire]);

    const isExpired = timeRemaining === 'EXPIRED';

    return (
        <div className="qr-display text-center">
            <div className="inline-block rounded-lg border-2 border-gray-200 bg-white p-6 shadow-lg">
                <div
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(qrSvg),
                    }}
                    className="mx-auto h-64 w-64"
                />
            </div>

            <div className="mt-4">
                <div
                    className={`text-3xl font-bold ${isExpired ? 'text-red-600' : 'text-blue-600'}`}
                >
                    {timeRemaining}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                    {sessionType} session
                </div>
            </div>

            {isExpired && (
                <div className="mt-4 rounded border border-red-400 bg-red-100 p-3 text-red-700">
                    This QR code has expired. Generate a new one.
                </div>
            )}
        </div>
    );
}
