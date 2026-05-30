<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get the authenticated student's profile.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('schoolClass');

        return response()->json([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'school_class' => $user->schoolClass ? [
                    'id' => $user->schoolClass->id,
                    'name' => $user->schoolClass->name,
                    'code' => $user->schoolClass->code,
                    'academic_year' => $user->schoolClass->academic_year,
                ] : null,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Update the authenticated student's profile.
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . auth()->id(),
        ]);

        $user = $request->user();
        $user->update($request->only('name', 'email'));

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
            ],
        ]);
    }
}
