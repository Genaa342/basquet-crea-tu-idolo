<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('jugadores')) {
            Schema::create('jugadores', function (Blueprint $table) {
                $table->id();
                $table->string('nombre', 60);
                $table->string('posicion', 8);
                $table->integer('velocidad')->default(50);
                $table->integer('tiro')->default(50);
                $table->integer('rebote')->default(50);
                $table->integer('pase')->default(50);
                $table->integer('defensa')->default(50);
                $table->timestamp('fecha_creacion')->useCurrent();
                $table->mediumText('ficha')->nullable();
                $table->unsignedInteger('equipo_id')->nullable();
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
                $table->boolean('retiro')->default(false);
            });

            return;
        }

        if (! Schema::hasColumn('jugadores', 'ficha')) {
            Schema::table('jugadores', function (Blueprint $table) {
                $table->mediumText('ficha')->nullable();
            });
        }
        if (! Schema::hasColumn('jugadores', 'equipo_id')) {
            Schema::table('jugadores', function (Blueprint $table) {
                $table->unsignedInteger('equipo_id')->nullable();
            });
        }
        if (! Schema::hasColumn('jugadores', 'user_id')) {
            Schema::table('jugadores', function (Blueprint $table) {
                $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            });
        }
        if (! Schema::hasColumn('jugadores', 'retiro')) {
            Schema::table('jugadores', function (Blueprint $table) {
                $table->boolean('retiro')->default(false);
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('jugadores')) {
            return;
        }
        if (Schema::hasColumn('jugadores', 'user_id')) {
            Schema::table('jugadores', function (Blueprint $table) {
                $table->dropConstrainedForeignId('user_id');
            });
        }
        if (Schema::hasColumn('jugadores', 'retiro')) {
            Schema::table('jugadores', function (Blueprint $table) {
                $table->dropColumn('retiro');
            });
        }
    }
};
