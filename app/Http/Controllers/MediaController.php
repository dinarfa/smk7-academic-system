<?php

namespace App\Http\Controllers;

use App\Services\MediaUploadService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MediaController extends Controller
{
    public function __construct(
        private readonly MediaUploadService $mediaService,
    ) {}

    /**
     * Upload gambar.
     * Mendukung JPG, PNG, GIF, WebP. Maksimal 2MB.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:2048', 'mimes:jpg,jpeg,png,gif,webp'],
        ]);

        $result = $this->mediaService->uploadImage(
            $request->file('image'),
            'uploads'
        );

        return response()->json([
            'message' => 'Gambar berhasil diunggah.',
            'data' => $result,
        ], 201);
    }
}
