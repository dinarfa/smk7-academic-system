<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuditLogController extends Controller
{
    /**
     * Display all audit logs.
     */
    public function index(Request $request): Response
    {
        $query = AuditLog::query()
            ->with(['admin:id,name,email', 'targetUser:id,name,email']);

        if ($request->filled('filter_action')) {
            $query->where('action', $request->input('filter_action'));
        }

        if ($request->filled('filter_admin_id')) {
            $query->where('admin_id', $request->input('filter_admin_id'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('description', 'like', "%{$search}%");
        }

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->input('start_date'));
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->input('end_date'));
        }

        $logs = $query->latest()->paginate(25)->withQueryString();

        // Get unique admins who have audit logs for the filter dropdown
        $admins = User::query()
            ->select(['id', 'name'])
            ->whereHas('auditLogsPerformed')
            ->orderBy('name')
            ->get();

        // Get unique action types for the filter dropdown
        $actions = AuditLog::query()
            ->select('action')
            ->distinct()
            ->pluck('action');

        return Inertia::render('admin/audit-logs/index', [
            'logs' => $logs->through(fn (AuditLog $log): array => [
                'id' => $log->id,
                'admin_name' => $log->admin->name,
                'admin_email' => $log->admin->email,
                'target_user_name' => $log->targetUser?->name,
                'target_user_email' => $log->targetUser?->email,
                'action' => $log->action,
                'description' => $log->description,
                'created_at' => $log->created_at?->toIso8601String(),
            ])->values(),
            'admins' => $admins,
            'actions' => $actions,
            'filters' => [
                'filter_action' => $request->input('filter_action'),
                'filter_admin_id' => $request->input('filter_admin_id'),
                'search' => $request->input('search'),
                'start_date' => $request->input('start_date'),
                'end_date' => $request->input('end_date'),
            ],
        ]);
    }

    /**
     * Show audit log details.
     */
    public function show(AuditLog $log): Response
    {
        $log->load(['admin:id,name,email', 'targetUser:id,name,email']);

        return Inertia::render('admin/audit-logs/show', [
            'log' => [
                'id' => $log->id,
                'admin_name' => $log->admin->name,
                'admin_email' => $log->admin->email,
                'target_user_name' => $log->targetUser?->name,
                'target_user_email' => $log->targetUser?->email,
                'action' => $log->action,
                'model_type' => $log->model_type,
                'model_id' => $log->model_id,
                'description' => $log->description,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'created_at' => $log->created_at?->toIso8601String(),
            ],
        ]);
    }
}
