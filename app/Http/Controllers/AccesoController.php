<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\CorreoBienvenida;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Throwable;

class AccesoController extends Controller
{
    public function entrar(Request $request): JsonResponse
    {
        // Entra con el usuario que se inventó, o con el email si la cuenta es de antes.
        [$campo, $clave] = $this->identificador($request);
        $this->exigirIdentificador($campo, $clave);
        $request->validate([
            'password' => ['required', 'string', 'max:64'],
        ], [
            'password.required' => 'Escribí tu contraseña.',
        ]);

        $usuario = $this->buscarCuenta($clave);

        if (! $usuario || ! Auth::attempt(['email' => $usuario->email, 'password' => $request->input('password')], true)) {
            throw ValidationException::withMessages([
                $campo => $usuario && $usuario->google_id
                    ? 'Esa cuenta entra con Google.'
                    : ($campo === 'email' ? 'Email o contraseña incorrectos.' : 'Usuario o contraseña incorrectos.'),
            ]);
        }

        $request->session()->regenerate();

        return response()->json(['ok' => true]);
    }

    public function registrar(Request $request, CorreoBienvenida $correo): JsonResponse
    {
        // Usuario y contraseña propios: no hace falta un email ni una cuenta entregada.
        if ($request->filled('usuario')) {
            return $this->registrarConUsuario($request);
        }

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
            $correo->enviar($usuario->name, $usuario->email);
        } catch (Throwable) {
            $salio = false;
            $aviso = 'La cuenta quedó creada, pero el correo no salió.';
        }

        return response()->json([
            'ok' => true,
            'correo' => $salio,
            'aviso' => $aviso,
        ]);
    }

    public function olvide(Request $request, CorreoBienvenida $correo): JsonResponse
    {
        // El código de recuperación sale por el usuario o por el email, el que haya usado para entrar.
        [$campo, $clave] = $this->identificador($request);
        $this->exigirIdentificador($campo, $clave);

        $aviso = 'Si esa cuenta existe, te mandamos un código. Revisá el correo.';
        $usuario = $this->buscarCuenta($clave);
        $codigoVisible = null;
        $salio = false;

        if ($usuario) {
            $codigo = (string) random_int(100000, 999999);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $usuario->email],
                ['token' => Hash::make($codigo), 'created_at' => now()]
            );

            try {
                $correo->enviarCodigo($usuario->name, $usuario->email, $codigo);
                $salio = true;
            } catch (Throwable) {
                $salio = false;
                if (! app()->isProduction()) {
                    $codigoVisible = $codigo;
                    $aviso = 'No pude enviar el correo. Usá este código para elegir la contraseña nueva.';
                } else {
                    $aviso = 'No pude enviar el código. Probá de nuevo más tarde.';
                }
            }
        }

        return response()->json([
            'ok' => true,
            'correo' => $salio,
            'aviso' => $aviso,
            'codigo' => $codigoVisible,
        ]);
    }

    public function restablecer(Request $request): JsonResponse
    {
        [$campo, $clave] = $this->identificador($request);
        $this->exigirIdentificador($campo, $clave);
        $datos = $request->validate([
            'codigo' => ['required', 'string', 'max:12'],
            'password' => ['required', 'string', 'min:6', 'max:64'],
        ], [
            'codigo.required' => 'Escribí el código.',
            'password.required' => 'Elegí una contraseña.',
            'password.min' => 'La contraseña necesita al menos 6 caracteres.',
        ]);

        $usuario = $this->buscarCuenta($clave);
        $fila = DB::table('password_reset_tokens')->where('email', $usuario ? $usuario->email : $clave)->first();
        $vigente = $fila && $fila->created_at && now()->diffInMinutes($fila->created_at, true) <= 30;
        if (! $usuario || ! $fila || ! $vigente || ! Hash::check($datos['codigo'], $fila->token)) {
            throw ValidationException::withMessages([
                'codigo' => 'Ese código no sirve o ya venció.',
            ]);
        }

        $usuario->password = $datos['password'];
        $usuario->save();
        DB::table('password_reset_tokens')->where('email', $usuario->email)->delete();

        Auth::login($usuario, true);
        $request->session()->regenerate();

        return response()->json(['ok' => true]);
    }

    public function clave(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'actual' => ['required', 'string', 'max:64'],
            'password' => ['required', 'string', 'min:6', 'max:64'],
        ], [
            'actual.required' => 'Escribí la contraseña actual.',
            'password.required' => 'Elegí una contraseña nueva.',
            'password.min' => 'La contraseña necesita al menos 6 caracteres.',
        ]);

        $usuario = $request->user();
        if (! $usuario->password || ! Hash::check($datos['actual'], $usuario->password)) {
            throw ValidationException::withMessages([
                'actual' => $usuario->google_id
                    ? 'Esta cuenta entra con Google. Desde la portada usá Olvidé mi contraseña.'
                    : 'La contraseña actual no coincide.',
            ]);
        }

        $usuario->password = $datos['password'];
        $usuario->save();

        return response()->json(['ok' => true]);
    }

    /**
     * Separa el campo que escribió la persona: usuario inventado, o email de una cuenta anterior.
     *
     * @return array{0: string, 1: string}
     */
    private function identificador(Request $request): array
    {
        $usuario = trim((string) $request->input('usuario'));
        $email = trim((string) $request->input('email'));
        if ($email !== '' && $usuario === '') {
            return ['email', $email];
        }

        return ['usuario', $usuario !== '' ? $usuario : $email];
    }

    private function exigirIdentificador(string $campo, string $clave): void
    {
        if ($clave === '') {
            throw ValidationException::withMessages([
                $campo => $campo === 'email' ? 'Escribí tu email.' : 'Escribí tu usuario.',
            ]);
        }

        if ($campo === 'email' && ! filter_var($clave, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'email' => 'Ese email no parece válido.',
            ]);
        }
    }

    private function buscarCuenta(string $clave): ?User
    {
        $clave = trim($clave);
        if ($clave === '') {
            return null;
        }

        if (str_contains($clave, '@')) {
            return User::query()->where('email', $clave)->first();
        }

        return User::query()->where('usuario', mb_strtolower($clave))->first();
    }

    private function registrarConUsuario(Request $request): JsonResponse
    {
        $visible = trim((string) $request->input('usuario'));
        $request->merge(['usuario' => mb_strtolower($visible)]);

        $datos = $request->validate([
            'usuario' => ['required', 'string', 'min:3', 'max:20', 'regex:/^[\p{L}\p{N}._-]+$/u', 'unique:users,usuario'],
            'password' => ['required', 'string', 'min:6', 'max:64'],
        ], [
            'usuario.required' => 'Elegí un usuario.',
            'usuario.min' => 'El usuario necesita al menos 3 caracteres.',
            'usuario.max' => 'El usuario puede tener hasta 20 caracteres.',
            'usuario.regex' => 'El usuario usa letras, números, punto, guion o guion bajo.',
            'usuario.unique' => 'Ese usuario ya existe. Entrá con tu contraseña.',
            'password.required' => 'Elegí una contraseña.',
            'password.min' => 'La contraseña necesita al menos 6 caracteres.',
        ]);

        $usuario = new User;
        $usuario->name = $visible;
        $usuario->usuario = $datos['usuario'];
        // El email interno solo completa la columna. Quien juega entra con el usuario.
        $usuario->email = $datos['usuario'].'@cuentas.therookie.local';
        $usuario->password = $datos['password'];
        $usuario->email_verified_at = now();
        $usuario->save();

        Auth::login($usuario, true);
        $request->session()->regenerate();

        return response()->json([
            'ok' => true,
            'correo' => true,
            'aviso' => '',
        ]);
    }
}
