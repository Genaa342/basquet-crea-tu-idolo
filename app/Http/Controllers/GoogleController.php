<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! config('services.google.client_id') || ! config('services.google.client_secret')) {
            return redirect('/?google=falta');
        }

        return Socialite::driver('google')
            ->scopes(['openid', 'profile', 'email'])
            ->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $google = Socialite::driver('google')->user();
        } catch (\Throwable) {
            return redirect('/?google=error');
        }

        $email = $google->getEmail();
        if (! $email) {
            return redirect('/?google=error');
        }

        $user = User::query()
            ->where(function ($consulta) use ($google, $email) {
                $consulta->where('google_id', $google->getId())
                    ->orWhere('email', $email);
            })
            ->first();

        if (! $user) {
            $user = new User;
            $user->password = Str::random(40);
        }

        $user->fill([
            'google_id' => $google->getId(),
            'name' => $google->getName() ?: 'Jugador',
            'email' => $email,
            'avatar' => $google->getAvatar(),
            'email_verified_at' => $user->email_verified_at ?: now(),
        ]);

        try {
            $user->save();
        } catch (\Throwable) {
            return redirect('/?google=error');
        }

        Auth::login($user, true);

        return redirect('/?google=ok');
    }

    public function salir(Request $request): JsonResponse|RedirectResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json(['ok' => true]);
        }

        return redirect('/');
    }
}
