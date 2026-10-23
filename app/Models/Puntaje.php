<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Puntaje extends Model
{
    protected $table = 'puntajes';

    protected $fillable = ['user_id', 'juego', 'nombre', 'puntaje'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
