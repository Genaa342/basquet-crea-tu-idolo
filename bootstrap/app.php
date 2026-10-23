<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ThrottleRequestsException $e, Request $request) {
            if (! $request->expectsJson() && ! $request->is('api/*') && ! $request->is('auth/*')) {
                return null;
            }

            return response()->json([
                'ok' => false,
                'message' => 'Demasiados intentos. Esperá un minuto y probá de nuevo.',
                'errors' => [
                    'email' => ['Demasiados intentos. Esperá un minuto y probá de nuevo.'],
                ],
            ], 429);
        });
    })->create();
