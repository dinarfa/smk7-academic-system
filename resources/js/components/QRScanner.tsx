import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface QRScannerProps {
    onScan: (data: string) => void;
    onError?: (error: string) => void;
}

export default function QRScanner({ onScan, onError }: QRScannerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Use back camera on mobile
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                setIsScanning(true);
                scanQR();
            }
        } catch (err) {
            const errorMessage = 'Camera access denied or not available';
            setError(errorMessage);
            onError?.(errorMessage);
        }
    };

    const stopCamera = () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setIsScanning(false);
        }
    };

    const scanQR = () => {
        if (!videoRef.current || !canvasRef.current || !isScanning) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // Scan for QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
            onScan(code.data);
            stopCamera();
        } else {
            // Continue scanning
            requestAnimationFrame(scanQR);
        }
    };

    return (
        <div className="qr-scanner">
            <div className="relative">
                <video
                    ref={videoRef}
                    className="w-full max-w-md mx-auto border rounded-lg"
                    playsInline
                    muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanning overlay */}
                {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-blue-500 rounded-lg opacity-50">
                            <div className="w-full h-full border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            <div className="mt-4 text-center">
                <button
                    onClick={isScanning ? stopCamera : startCamera}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {isScanning ? 'Stop Scanning' : 'Start Scanning'}
                </button>
            </div>
        </div>
    );
}