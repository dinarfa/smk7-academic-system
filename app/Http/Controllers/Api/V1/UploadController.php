<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpg,jpeg,png,gif,webp|max:5120',
        ]);

        $file = $request->file('image');
        $filename = Str::uuid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('uploads/images', $filename, 'public');

        return response()->json([
            'url' => '/storage/'.$path,
        ]);
    }
}
