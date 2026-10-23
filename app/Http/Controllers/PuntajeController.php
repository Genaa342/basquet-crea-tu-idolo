<?php

namespace App\Http\Controllers;

use App\Models\Puntaje;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PuntajeController extends Controller
{
    public function ver(Request $request): JsonResponse
    {
        $juego = $this->juego($request);
        if ($juego === null) {
            return response()->json(['error' => 'Juego desconocido'], 400);
        }

        $filas = Puntaje::query()
            ->where('juego', $juego)
            ->orderByDesc('puntaje')
            ->orderBy('id')
            ->limit(10)
            ->get();

        return response()->json($filas->map(fn (Puntaje $fila) => [
            'name' => $fila->nombre,
            'score' => (int) $fila->puntaje,
        ])->values());
    }

    public function guardar(Request $request): JsonResponse
    {
        $usuario = $request->user();
        if (! $usuario) {
            return response()->json(['error' => 'Entrá con tu cuenta para guardar el puntaje.'], 401);
        }

        $juego = $this->juego($request);
        if ($juego === null) {
            return response()->json(['error' => 'Juego desconocido'], 400);
        }

        $puntaje = filter_var($request->json('score'), FILTER_VALIDATE_INT);
        if ($puntaje === false || $puntaje < 0 || $puntaje > 100000) {
            return response()->json(['error' => 'Puntaje fuera de rango'], 422);
        }

        $fila = Puntaje::query()->firstOrNew([
            'user_id' => $usuario->id,
            'juego' => $juego,
        ]);
        if (! $fila->exists || $puntaje > (int) $fila->puntaje) {
            $fila->nombre = mb_substr($usuario->name, 0, 18);
            $fila->puntaje = $puntaje;
            $fila->save();
        }

        return $this->ver($request);
    }

    private function juego(Request $request): ?string
    {
        $juego = (string) $request->query('game', 'runner');

        return in_array($juego, ['runner', 'dribbling'], true) ? $juego : null;
    }
}
