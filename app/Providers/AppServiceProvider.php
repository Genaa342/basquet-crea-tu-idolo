<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $aviso = function (Request $request, array $headers) {
            return response()->json([
                'ok' => false,
                'message' => 'Demasiados intentos. Esperá un minuto y probá de nuevo.',
                'errors' => [
                    'email' => ['Demasiados intentos. Esperá un minuto y probá de nuevo.'],
                ],
            ], 429, $headers);
        };

        RateLimiter::for('entrar', function (Request $request) use ($aviso) {
            // La misma cubeta sirve para un usuario nuevo y para el email de una cuenta vieja.
            $email = strtolower(trim((string) ($request->input('usuario') ?: $request->input('email'))));

            return [
                Limit::perMinute(8)->by($request->ip().'|entrar|'.$email)->response($aviso),
                Limit::perMinute(20)->by('entrar|'.$email)->response($aviso),
            ];
        });

        RateLimiter::for('registrar', function (Request $request) use ($aviso) {
            return Limit::perMinute(8)->by($request->ip().'|registrar')->response($aviso);
        });

        RateLimiter::for('olvide', function (Request $request) use ($aviso) {
            $email = strtolower(trim((string) ($request->input('usuario') ?: $request->input('email'))));

            return Limit::perMinute(5)->by($request->ip().'|olvide|'.$email)->response($aviso);
        });

        RateLimiter::for('restablecer', function (Request $request) use ($aviso) {
            $email = strtolower(trim((string) ($request->input('usuario') ?: $request->input('email'))));

            return Limit::perMinute(8)->by($request->ip().'|restablecer|'.$email)->response($aviso);
        });
    }
}
