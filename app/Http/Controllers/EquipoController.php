<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class EquipoController extends Controller
{
    public function index(): JsonResponse
    {
        $filas = DB::table('equipos')
            ->select('id', 'nombre', 'abreviatura', 'ciudad', 'conferencia', 'division', 'color_primario', 'color_secundario', 'liga', 'minima')
            ->orderBy('liga')
            ->orderByDesc('minima')
            ->orderBy('nombre')
            ->get();

        $fondos = [
            'NBA' => 'assets/fondo-8bit.jpg',
            'NCAA' => 'assets/fondo-ncaa.jpg',
            'LNB' => 'assets/fondo-lnb.jpg',
        ];

        $equipos = $filas->map(function ($fila) use ($fondos) {
            $codigo = strtolower($fila->abreviatura);
            $extension = $codigo === 'mia' ? 'gif' : 'png';
            $logo = 'assets/logos/'.$codigo.'.'.$extension;
            $propio = 'assets/fondos/'.strtolower((string) $fila->liga).'-'.$codigo.'.png';
            $generico = $fondos[$fila->liga] ?? 'assets/fondo-calle.jpg';
            $fondo = is_file(public_path($propio)) ? $propio : (is_file(public_path($generico)) ? $generico : 'assets/fondo-calle.jpg');

            return [
                'id' => $fila->id,
                'nombre' => $fila->nombre,
                'abreviatura' => $fila->abreviatura,
                'ciudad' => $fila->ciudad,
                'conferencia' => $fila->conferencia,
                'division' => $fila->division,
                'color_primario' => $fila->color_primario,
                'color_secundario' => $fila->color_secundario,
                'liga' => $fila->liga,
                'minima' => (int) $fila->minima,
                'logo' => is_file(public_path($logo)) ? $logo : null,
                'fondo' => $fondo,
            ];
        })->values();

        return response()->json($equipos);
    }
}
