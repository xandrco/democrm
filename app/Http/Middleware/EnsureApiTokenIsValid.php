<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureApiTokenIsValid
{
    /**
     * Проверка действительности API токена и авторизации пользователя
     *
     * @param Request $request
     * @param Closure $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('sanctum')->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Вы не авторизованы',
            ], 401);
        }

        $request->setUserResolver(function () {
            return Auth::guard('sanctum')->user();
        });

        return $next($request);
    }
} 