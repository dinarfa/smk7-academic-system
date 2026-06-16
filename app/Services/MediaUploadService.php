<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class MediaUploadService
{
    /**
     * Upload gambar ke storage.
     * Kompres otomatis jika ukuran > 1MB.
     *
     * @return array{url: string, path: string, width: int, height: int}
     */
    public function uploadImage(UploadedFile $file, string $directory): array
    {
        $path = $file->store($directory, 'public');

        // Kompres jika > 1MB
        if ($file->getSize() > 1_048_576) {
            $this->compressImage(Storage::disk('public')->path($path));
        }

        // Ambil dimensi setelah kompres
        $absolutePath = Storage::disk('public')->path($path);
        [$width, $height] = getimagesize($absolutePath);

        return [
            'url' => asset('storage/' . $path),
            'path' => $path,
            'width' => $width,
            'height' => $height,
        ];
    }

    /**
     * Hapus file dari storage.
     */
    public function deleteImage(string $path): bool
    {
        return Storage::disk('public')->delete($path);
    }

    /**
     * Kompres gambar menggunakan GD library.
     * Target: ~80% kualitas, max 1920px di sisi terpanjang.
     */
    private function compressImage(string $absolutePath): void
    {
        $imageInfo = getimagesize($absolutePath);
        if ($imageInfo === false) {
            return;
        }

        $mime = $imageInfo['mime'];
        $source = match ($mime) {
            'image/jpeg' => imagecreatefromjpeg($absolutePath),
            'image/png' => imagecreatefrompng($absolutePath),
            'image/webp' => imagecreatefromwebp($absolutePath),
            default => null,
        };

        if ($source === null) {
            return;
        }

        $origWidth = imagesx($source);
        $origHeight = imagesy($source);

        // Resize jika melebihi 1920px
        $maxDim = 1920;
        $ratio = min($maxDim / $origWidth, $maxDim / $origHeight, 1);
        $newWidth = (int) ($origWidth * $ratio);
        $newHeight = (int) ($origHeight * $ratio);

        $resized = imagecreatetruecolor($newWidth, $newHeight);

        // Pertahankan transparansi untuk PNG/WebP
        if ($mime === 'image/png' || $mime === 'image/webp') {
            imagealphablending($resized, false);
            imagesavealpha($resized, true);
        }

        imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);

        // Simpan dengan kompresi
        match ($mime) {
            'image/jpeg' => imagejpeg($resized, $absolutePath, 80),
            'image/png' => imagepng($resized, $absolutePath, 6),
            'image/webp' => imagewebp($resized, $absolutePath, 80),
        };

        imagedestroy($source);
        imagedestroy($resized);
    }
}
