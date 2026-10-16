<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Jugador extends Model
{
    public $timestamps = false;

    protected $table = 'jugadores';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'retiro' => 'boolean',
            'fecha_creacion' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fichaLista(): array
    {
        $ficha = json_decode($this->ficha ?: '{}', true);
        if (! is_array($ficha)) {
            $ficha = [];
        }
        $ficha['id'] = $this->id;
        $ficha['nombre'] = $ficha['nombre'] ?? $this->nombre;
        $ficha['posicion'] = $ficha['posicion'] ?? $this->posicion;
        $ficha['retirado'] = (bool) $this->retiro;
        if ($this->retiro) {
            $ficha['fase'] = 'retiro';
        }

        return $ficha;
    }
}
