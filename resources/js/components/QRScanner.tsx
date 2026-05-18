import jsQR from 'jsqr';
import { useCallback, useEffect, useRef, useState } from 'react';

interface QRScannerProps {
    onScan: (data: string) => void;
    onError?: (error: string) => void;
    className?: string;
}

export default function QRScanner({
    onScan,
    onError,
    className = '',
}: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const frameRef = useRef<number | null>(null);

    const scanningRef = useRef(false);
    const scanLockRef = useRef(false);

    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scanQRRef = useRef<() => void>(() => { });
    const stopCamera = useCallback(() => {
        scanningRef.current = false;

        if (frameRef.current !== null) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }

        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;

            stream.getTracks().forEach(track => track.stop());

            videoRef.current.srcObject = null;
        }

        queueMicrotask(() => {
            setIsScanning(false);
        });
    }, []);
    const scanQR = useCallback(() => {
        if (!videoRef.current || !canvasRef.current || !scanningRef.current) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            requestAnimationFrame(scanQRRef.current)

            return;
        }

        if (
            video.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA ||
            video.videoWidth === 0 ||
            video.videoHeight === 0
        ) {
            frameRef.current = requestAnimationFrame(scanQRRef.current);

            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        const code = jsQR(
            imageData.data,
            imageData.width,
            imageData.height
        );

        // React-safe debounce without Date.now/performance.now
        if (code && !scanLockRef.current) {
            scanLockRef.current = true;

            onScan(code.data);

            stopCamera();

            window.setTimeout(() => {
                scanLockRef.current = false;
            }, 1500);

            return;
        }

        frameRef.current = requestAnimationFrame(scanQRRef.current);
    }, [onScan, stopCamera]);

    useEffect(() => {
        scanQRRef.current = scanQR;
    }, [scanQR]);

    const startCamera = useCallback(async () => {
        if (scanningRef.current) {
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                },
            });

            if (!videoRef.current) {
                return;
            }

            videoRef.current.srcObject = stream;

            await videoRef.current.play();

            scanningRef.current = true;

            frameRef.current = requestAnimationFrame(scanQRRef.current);

            queueMicrotask(() => {
                setIsScanning(true);
            });
        } catch (error) {
            const errorMessage =
                'Camera access denied or camera not available';

            console.error(error);

            queueMicrotask(() => {
                setError(errorMessage);
            });

            onError?.(errorMessage);
        }
    }, [onError]);

    useEffect(() => {
        let mounted = true;

        const init = async () => {
            if (!mounted) {
                return;
            }

            await startCamera();
        };

        void init();

        return () => {
            mounted = false;
            stopCamera();
        };
    }, [startCamera, stopCamera]);

    return (
        <div className={`qr-scanner ${className}`}>
            <div className="relative overflow-hidden rounded-2xl bg-black/40 backdrop-blur-xl">
                <video
                    ref={videoRef}
                    className="mx-auto block w-full max-w-md object-cover"
                    playsInline
                    muted
                />

                <canvas ref={canvasRef} className="hidden" />

                {/* Scanner Overlay */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute left-1/2 top-1/2 h-40 w-64 -translate-x-1/2 -translate-y-1/2">
                        <div className="absolute inset-0 rounded-xl border-2 border-dashed border-white/30" />

                        <div className="animate-scan absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
                    </div>

                    {/* Corner markers */}
                    <div className="absolute left-1/2 top-1/2 h-40 w-64 -translate-x-1/2 -translate-y-1/2">
                        <div className="absolute -left-3 -top-3 h-6 w-6 border-l-4 border-t-4 border-white/80" />
                        <div className="absolute -top-3 right-[-12px] h-6 w-6 border-r-4 border-t-4 border-white/80" />
                        <div className="absolute -left-3 bottom-[-12px] h-6 w-6 border-b-4 border-l-4 border-white/80" />
                        <div className="absolute bottom-[-12px] right-[-12px] h-6 w-6 border-b-4 border-r-4 border-white/80" />
                    </div>
                </div>

                {isScanning && (
                    <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white backdrop-blur-md">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        Scanning...
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-3 rounded-lg border border-red-400 bg-red-100 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="mt-4 flex justify-center">
                <button
                    onClick={() => {
                        if (isScanning) {
                            stopCamera();
                        } else {
                            void startCamera();
                        }
                    }}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-white transition-all duration-300 hover:scale-[1.02] hover:bg-blue-700"
                >
                    {isScanning ? 'Stop Scanning' : 'Start Camera'}
                </button>
            </div>

            <style>{`
                .animate-scan {
                    animation: scan-line 2s linear infinite;
                }

                @keyframes scan-line {
                    0% {
                        transform: translateY(-60%);
                    }
                    50% {
                        transform: translateY(60%);
                    }
                    100% {
                        transform: translateY(-60%);
                    }
                }
            `}</style>
        </div>
    );
}
