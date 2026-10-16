<?php

namespace App\Http\Controllers;

use App\Support\Estrellas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ManagerController extends Controller
{
    public function activar(Request $request): JsonResponse
    {
        $user = $request->user();
        $tieneRetiro = $user->jugadores()->where('retiro', true)->exists();
        if (! $tieneRetiro) {
            return response()->json(['ok' => false, 'error' => 'Primero tenés que terminar una carrera.'], 422);
        }

        $user->es_manager = true;
        $user->save();

        return response()->json(['ok' => true]);
    }

    public function nuevo(Request $request): JsonResponse
    {
        if (! $request->user()->es_manager) {
            return response()->json(['ok' => false, 'error' => 'Solo un manager puede crear otro jugador.'], 403);
        }

        return response()->json(['ok' => true]);
    }

    public function mercado(): JsonResponse
    {
        return response()->json(Estrellas::todas());
    }

    public function fichar(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->es_manager) {
            return response()->json(['ok' => false, 'error' => 'Solo un manager puede fichar profesionales.'], 403);
        }

        $estrella = Estrellas::porId((string) $request->json('id'));
        if (! $estrella) {
            return response()->json(['ok' => false, 'error' => 'Ese jugador no está en el mercado.'], 404);
        }

        $calibre = 0;
        $plantel = $user->jugadores()->get();
        foreach ($plantel as $jugador) {
            $ficha = json_decode($jugador->ficha ?: '{}', true);
            $calibre = max($calibre, (int) (is_array($ficha) ? ($ficha['calibre'] ?? 0) : 0));
        }
        $nivel = Estrellas::nivelDeCalibre($calibre);
        $pide = Estrellas::nivelRequerido($estrella['liga']);
        if ($nivel < $pide) {
            return response()->json([
                'ok' => false,
                'error' => 'Tu nivel de manager es '.$nivel.'. '.$estrella['liga'].' abre en el nivel '.$pide.'.',
            ], 422);
        }

        $ya = $plantel->contains(function ($jugador) use ($estrella) {
            $ficha = json_decode($jugador->ficha ?: '{}', true);

            return is_array($ficha) && ($ficha['estrellaId'] ?? null) === $estrella['id'];
        });
        if ($ya) {
            return response()->json(['ok' => false, 'error' => 'Ese jugador ya está en tu plantel.'], 422);
        }

        $datos = Estrellas::fichaInicial($estrella);
        $stats = $datos['stats'];
        $jugador = $user->jugadores()->create([
            'nombre' => $datos['nombre'],
            'posicion' => $datos['posicion'],
            'velocidad' => $stats['velocidad'],
            'tiro' => $stats['tiro'],
            'rebote' => $stats['fuerza'],
            'pase' => $stats['control'],
            'defensa' => $stats['defensa'],
            'retiro' => false,
        ]);
        $datos['id'] = $jugador->id;
        $jugador->ficha = json_encode($datos, JSON_UNESCAPED_UNICODE);
        $jugador->save();

        return response()->json(['ok' => true, 'id' => $jugador->id, 'ficha' => $jugador->fichaLista()]);
    }
}
