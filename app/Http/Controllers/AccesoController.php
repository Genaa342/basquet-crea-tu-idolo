<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\CorreoBienvenida;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Throwable;

class AccesoController extends Controller
{
    public function entrar(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'email' => ['required', 'email', 'max:190'],
            'password' => ['required', 'string', 'max:64'],
        ], [
            'email.required' => 'Escribí tu email.',
            'email.email' => 'Ese email no parece válido.',
            'password.required' => 'Escribí tu contraseña.',
        ]);

        $usuario = User::query()->where('email', $datos['email'])->first();

        if (! Auth::attempt(['email' => $datos['email'], 'password' => $datos['password']], true)) {
            throw ValidationException::withMessages([
                'email' => $usuario && $usuario->google_id
                    ? 'Esa cuenta entra con Google.'
                    : 'Email o contraseña incorrectos.',
            ]);
        }

        $request->session()->regenerate();

        return response()->json(['ok' => true]);
    }

    public function registrar(Request $request, CorreoBienvenida $correo): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'min:2', 'max:60'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'max:64'],
        ], [
            'nombre.required' => 'Escribí tu nombre.',
            'nombre.min' => 'El nombre necesita al menos 2 letras.',
            'email.required' => 'Escribí tu email.',
            'email.email' => 'Ese email no parece válido.',
            'email.unique' => 'Ese email ya tiene cuenta. Entrá con tu contraseña.',
            'password.required' => 'Elegí una contraseña.',
            'password.min' => 'La contraseña necesita al menos 6 caracteres.',
        ]);

        $usuario = new User;
        $usuario->name = trim($datos['nombre']);
        $usuario->email = $datos['email'];
        $usuario->password = $datos['password'];
        $usuario->email_verified_at = now();
        $usuario->save();

        Auth::login($usuario, true);
        $request->session()->regenerate();

        $salio = true;
        $aviso = '';
        try {
            $correo->enviar($usuario->name, $usuario->email, $datos['password']);
        } catch (Throwable) {
            $salio = false;
            $aviso = 'La cuenta quedó creada, pero el correo no salió. Revisá el SMTP del servidor.';
        }

        return response()->json([
            'ok' => true,
            'correo' => $salio,
            'aviso' => $aviso,
        ]);
    }
}
