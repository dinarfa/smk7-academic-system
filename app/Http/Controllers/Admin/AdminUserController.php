<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminUserController extends Controller
{
    /**
     * Display all users.
     */
    public function index(Request $request): Response
    {
        $users = User::query()
            ->select(['id', 'name', 'email', 'role', 'created_at', 'updated_at'])
            ->paginate(15);

        return Inertia::render('admin/users/index', [
            'users' => $users,
        ]);
    }

    /**
     * Show form to reset password for a user.
     */
    public function showResetForm(User $user): Response
    {
        return Inertia::render('admin/users/reset-password', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
            ],
        ]);
    }

    /**
     * Reset password for a user.
     */
    public function resetPassword(Request $request, User $user)
    {
        Gate::authorize('update', $user);

        $validated = $request->validate([
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user->update(['password' => Hash::make($validated['password'])]);

        // Log the audit
        AuditLog::create([
            'admin_id' => $request->user()->id,
            'target_user_id' => $user->id,
            'action' => 'password_reset',
            'model_type' => User::class,
            'model_id' => $user->id,
            'description' => "Admin reset password for user: {$user->name} ({$user->email})",
        ]);

        return redirect()->route('admin.users.index')->with('success', "Password reset successfully for {$user->name}");
    }

    /**
     * Show user details.
     */
    public function show(User $user): Response
    {
        return Inertia::render('admin/users/show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'created_at' => $user->created_at?->toIso8601String(),
                'updated_at' => $user->updated_at?->toIso8601String(),
            ],
            'auditLogs' => $user->auditLogsAsTarget()
                ->with('admin:id,name,email')
                ->latest()
                ->take(20)
                ->get()
                ->map(fn (AuditLog $log): array => [
                    'id' => $log->id,
                    'admin_name' => $log->admin->name,
                    'action' => $log->action,
                    'description' => $log->description,
                    'created_at' => $log->created_at?->toIso8601String(),
                ]),
        ]);
    }
}
