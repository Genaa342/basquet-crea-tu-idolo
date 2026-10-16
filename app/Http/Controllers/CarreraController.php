<?php

namespace App\Http\Controllers;

use App\Models\Jugador;
use App\Models\User;
use App\Support\Estrellas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CarreraController extends Controller
{
    public function sesion(Request $request): JsonResponse
    {
        $user = $request->user();
        $jugadores = [];
        $activa = null;

        if ($user) {
            $filas = $user->jugadores()->orderByDesc('id')->get();
            $jugadores = $filas->map(fn (Jugador $jugador) => $this->resumen($jugador))->all();
            $viva = $filas->first(fn (Jugador $jugador) => ! $jugador->retiro);
            $mostrar = $viva ?: $filas->first();
            $activa = $mostrar ? $mostrar->fichaLista() : null;
        }

        $partidas = 0;
        $partidos = 0;
        $victorias = 0;
        $calibre = 0;
        foreach ($jugadores as $fila) {
            $partidas += (int) $fila['partidas'];
            $partidos += (int) $fila['partidos'];
            $victorias += (int) $fila['victorias'];
            $calibre = max($calibre, (int) $fila['calibre']);
        }

        return response()->json([
            'google' => filled(config('services.google.client_id')),
            'user' => $user ? [
                'nombre' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'manager' => (bool) $user->es_manager,
                'nivel' => $user->es_manager ? Estrellas::nivelDeCalibre($calibre) : 0,
            ] : null,
            'jugadores' => $jugadores,
            'activa' => $activa,
            'historial' => [
                'carreras' => count($jugadores),
                'partidas' => $partidas,
                'partidos' => $partidos,
                'victorias' => $victorias,
            ],
        ]);
    }

    public function cerrar(Request $request): JsonResponse
    {
        $user = $request->user();
        $id = $user->id;
        $user->jugadores()->delete();
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        User::query()->whereKey($id)->delete();

        return response()->json(['ok' => true]);
    }

    public function ver(Request $request, int $id): JsonResponse
    {
        $jugador = $request->user()->jugadores()->find($id);
        if (! $jugador) {
            return response()->json(['ok' => false, 'error' => 'No encuentro ese jugador.'], 404);
        }

        return response()->json(['ok' => true, 'ficha' => $jugador->fichaLista()]);
    }

    public function guardar(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['ok' => false, 'error' => 'Entrá con tu cuenta para jugar.'], 401);
        }

        $datos = $request->json()->all();
        if (! is_array($datos) || $datos === []) {
            return response()->json(['ok' => false, 'error' => 'No llegaron los datos del jugador.'], 422);
        }

        $nombre = trim((string) ($datos['nombre'] ?? ''));
        $posicion = (string) ($datos['posicion'] ?? '');
        if ($nombre === '' || ! in_array($posicion, ['PG', 'SG', 'SF', 'PF', 'C'], true)) {
            return response()->json(['ok' => false, 'error' => 'Completá el nombre y elegí una posición.'], 422);
        }

        $stats = is_array($datos['stats'] ?? null) ? $datos['stats'] : [];
        $id = (int) ($datos['id'] ?? 0);
        $retiro = ! empty($datos['retirado']) || ($datos['fase'] ?? '') === 'retiro';
        $jugador = $id > 0 ? Jugador::find($id) : null;

        if ($jugador && $jugador->user_id && (! $user || (int) $jugador->user_id !== (int) $user->id)) {
            return response()->json(['ok' => false, 'error' => 'Esa carrera pertenece a otra cuenta.'], 403);
        }
        if (! $jugador) {
            $id = 0;
            if (! $user->es_manager) {
                if ($user->jugadores()->where('retiro', false)->exists()) {
                    return response()->json(['ok' => false, 'error' => 'Ya tenés una carrera activa.'], 422);
                }
                if ($user->jugadores()->exists()) {
                    return response()->json(['ok' => false, 'error' => 'Pasá a manager para crear otro jugador.'], 422);
                }
            }
        }

        $attrs = [
            'nombre' => $nombre,
            'posicion' => $posicion,
            'velocidad' => (int) ($stats['velocidad'] ?? 50),
            'tiro' => (int) ($stats['tiro'] ?? 50),
            'rebote' => (int) ($stats['fuerza'] ?? 50),
            'pase' => (int) ($stats['control'] ?? 50),
            'defensa' => (int) ($stats['defensa'] ?? 50),
            'equipo_id' => ! empty($datos['equipoId']) ? (int) $datos['equipoId'] : null,
            'retiro' => $retiro,
            'user_id' => $user->id,
        ];

        if ($jugador) {
            $jugador->fill($attrs);
        } else {
            $jugador = new Jugador($attrs);
        }
        $datos['id'] = $jugador->id ?: 0;
        $datos['retirado'] = $retiro;
        $jugador->ficha = json_encode($datos, JSON_UNESCAPED_UNICODE);
        $jugador->save();
        $datos['id'] = $jugador->id;
        $jugador->ficha = json_encode($datos, JSON_UNESCAPED_UNICODE);
        $jugador->save();

        return response()->json(['ok' => true, 'id' => $jugador->id]);
    }

    /**
     * @return array<string, mixed>
     */
    private function resumen(Jugador $jugador): array
    {
        $ficha = json_decode($jugador->ficha ?: '{}', true);
        if (! is_array($ficha)) {
            $ficha = [];
        }

        return [
            'id' => $jugador->id,
            'nombre' => $jugador->nombre,
            'posicion' => $jugador->posicion,
            'retiro' => (bool) $jugador->retiro,
            'calibre' => (int) ($ficha['calibre'] ?? 46),
            'partidos' => (int) ($ficha['partidos'] ?? 0),
            'partidas' => (int) ($ficha['partidas'] ?? ($ficha['partidos'] ?? 0)),
            'victorias' => (int) ($ficha['victorias'] ?? 0),
            'liga' => $ficha['ligaOrigen'] ?? null,
            'tipo' => $ficha['tipo'] ?? 'novato',
            'estrellaId' => $ficha['estrellaId'] ?? null,
            'dificultad' => $ficha['dificultad'] ?? 'baja',
            'club' => $ficha['clubOrigen'] ?? null,
        ];
    }
}
