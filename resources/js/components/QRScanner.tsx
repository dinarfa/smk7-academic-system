import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
    onScan: (data: string) => void;
    onError?: (error: string) => void;
    className?: string;
}

export default function QRScanner({ onScan, onError, className = '' }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<number | null>(null);
    const scanningRef = useRef(false);
    const lastScanRef = useRef<number>(0);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Start camera automatically when component mounts.
        void startCamera();
        return () => stopCamera();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startCamera = async () => {
        if (isScanning || scanningRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
                setIsScanning(true);
                scanningRef.current = true;
                frameRef.current = requestAnimationFrame(scanQR);
            }
        } catch (err) {
            const errorMessage = 'Camera access denied or not available';
            setError(errorMessage);
            onError?.(errorMessage);
        }
    };

    const stopCamera = () => {
        scanningRef.current = false;

        if (frameRef.current !== null) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }

        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setIsScanning(false);
            videoRef.current.srcObject = null;
        }
    };

    const scanQR = () => {
        if (!videoRef.current || !canvasRef.current || !scanningRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            frameRef.current = requestAnimationFrame(scanQR);
            return;
        }

        if (video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA || video.videoWidth === 0 || video.videoHeight === 0) {
            frameRef.current = requestAnimationFrame(scanQR);
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        // Debounce duplicate rapid reads: ignore scans that happen within 1.5s
        const now = Date.now();
        if (code && now - lastScanRef.current > 1500) {
            lastScanRef.current = now;
            onScan(code.data);
            stopCamera();
            return;
        }

        frameRef.current = requestAnimationFrame(scanQR);
    };

    return (
        <div className={`qr-scanner ${className}`}>
            <div className="relative overflow-hidden rounded-lg bg-black/40">
                <video
                    ref={videoRef}
                    className="w-full max-w-md mx-auto block object-cover"
                    playsInline
                    muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Corner guides */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40">
                        <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-md" />
                        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-scan" />
                    </div>
                    {/* subtle corner markers */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40">
                        <div className="absolute -left-3 -top-3 w-6 h-6 border-t-4 border-l-4 border-white/70" />
                        <div className="absolute right-[-12px] -top-3 w-6 h-6 border-t-4 border-r-4 border-white/70" />
                        <div className="absolute -left-3 bottom-[-12px] w-6 h-6 border-b-4 border-l-4 border-white/70" />
                        <div className="absolute right-[-12px] bottom-[-12px] w-6 h-6 border-b-4 border-r-4 border-white/70" />
                    </div>
                </div>

                {/* scanning badge */}
                {isScanning && (
                    <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs text-white">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Scanning...
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            <div className="mt-3 flex justify-center">
                <button
                    onClick={isScanning ? stopCamera : startCamera}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    {isScanning ? 'Stop Scanning' : 'Start Camera'}
                </button>
            </div>

            <style>{`.animate-scan { animation: scan-line 2s linear infinite; } @keyframes scan-line { 0% { transform: translateY(-60%); } 50% { transform: translateY(60%);} 100% { transform: translateY(-60%);} }`}</style>
        </div>
    );
}