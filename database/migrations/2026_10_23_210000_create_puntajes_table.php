<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('puntajes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('juego', 24);
            $table->string('nombre', 24);
            $table->unsignedInteger('puntaje');
            $table->timestamps();
            $table->unique(['user_id', 'juego']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('puntajes');
    }
};
