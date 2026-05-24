<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $allowedRoles = collect($roles)
            ->flatMap(fn (string $role): array => array_map('trim', explode(',', $role)))
            ->filter()
            ->map(fn (string $value): UserRole => UserRole::tryFrom($value))
            ->filter();

        if (! $user || $allowedRoles->doesntContain($user->role)) {
            abort(403);
        }

        return $next($request);
    }
}
