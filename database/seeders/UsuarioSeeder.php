<?php

namespace Database\Seeders;

use App\Models\Jugador;
use App\Models\User;
use App\Support\Estrellas;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        $this->cuenta('Admin Rookie', 'admin@therookie.test', 'cancha-admin', true, [
            $this->carrera('Iván Soto', 'SG', 64, [
                'partidas' => 8,
                'partidos' => 36,
                'victorias' => 21,
                'edad' => 34,
                'hinchada' => 80,
                'ciudad' => 'Córdoba, Argentina',
            ], true),
            $this->estrella('ncaa-1', 4, 14, 9),
            $this->estrella('lnb-1', 5, 22, 13),
            $this->estrella('nba-1', 6, 28, 20),
            $this->carrera('Mateo Ruiz', 'PG', 50, [
                'partidas' => 4,
                'partidos' => 6,
                'victorias' => 3,
            ]),
        ]);

        $this->cuenta('Lola Núñez', 'novato@therookie.test', 'cancha-novato', false, [
            $this->carrera('Lola Núñez', 'PG', 46, ['partidas' => 1]),
        ]);

        $this->cuenta('Teo Vargas', 'oferta@therookie.test', 'cancha-oferta', false, [
            $this->carrera('Teo Vargas', 'SF', 60, [
                'partidas' => 3,
                'partidos' => 9,
                'victorias' => 5,
                'edad' => 20,
            ]),
        ]);

        $this->cuenta('Ramiro Paz', 'retiro@therookie.test', 'cancha-retiro', false, [
            $this->carrera('Ramiro Paz', 'PF', 68, [
                'partidas' => 11,
                'partidos' => 48,
                'victorias' => 27,
                'edad' => 35,
                'hinchada' => 74,
            ], true),
        ]);

        $this->cuenta('Elena Paz', 'ncaa@therookie.test', 'cancha-ncaa', true, [
            $this->carrera('Elena Paz', 'SF', 52, [
                'partidas' => 6,
                'partidos' => 20,
                'victorias' => 11,
                'edad' => 32,
            ], true),
            $this->carrera('Elena Paz', 'SF', 58, [
                'partidas' => 2,
                'partidos' => 4,
                'victorias' => 2,
                'edad' => 21,
            ]),
        ]);

        $this->cuenta('Bruno Díaz', 'lnb@therookie.test', 'cancha-lnb', true, [
            $this->carrera('Bruno Díaz', 'PF', 66, [
                'partidas' => 7,
                'partidos' => 30,
                'victorias' => 16,
                'edad' => 33,
            ], true),
            $this->carrera('Bruno Díaz', 'PF', 74, [
                'partidas' => 3,
                'partidos' => 12,
                'victorias' => 8,
                'edad' => 24,
            ]),
        ]);
    }

    /**
     * @param  list<array{ficha: array<string, mixed>, retiro: bool, club: ?string}>  $carreras
     */
    private function cuenta(string $nombre, string $email, string $clave, bool $manager, array $carreras): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $nombre,
                'password' => $clave,
                'email_verified_at' => now(),
                'es_manager' => $manager,
                'google_id' => null,
            ]
        );
        $user->jugadores()->delete();

        foreach ($carreras as $carrera) {
            $this->guardar($user, $carrera['ficha'], $carrera['retiro'], $carrera['club']);
        }
    }

    /**
     * @param  array<string, mixed>  $extra
     * @return array{ficha: array<string, mixed>, retiro: bool, club: ?string}
     */
    private function carrera(string $nombre, string $posicion, int $calibre, array $extra = [], bool $retiro = false): array
    {
        $estilo = match ($posicion) {
            'PG', 'SG' => 'base',
            'SF' => 'ritmo',
            'PF' => 'ritmo',
            default => 'ritmo',
        };
        $habilidades = match ($posicion) {
            'PG' => ['PLAYMAKER', 'LÍDER DE EQUIPO'],
            'SG' => ['TIRADOR CLAVE', 'PLAYMAKER'],
            'SF' => ['TIRADOR CLAVE', 'DEFENSOR PERIMETRAL'],
            'PF' => ['DEFENSOR PERIMETRAL', 'LÍDER DE EQUIPO'],
            default => ['DEFENSOR PERIMETRAL', 'LÍDER DE EQUIPO'],
        };
        $ficha = array_merge([
            'nombre' => $nombre,
            'posicion' => $posicion,
            'calibre' => $calibre,
            'fase' => $retiro ? 'retiro' : 'lobby',
            'stats' => Estrellas::stats($posicion, $calibre),
            'edad' => 19,
            'altura' => 196,
            'peso' => 90,
            'ciudad' => 'Buenos Aires, Argentina',
            'dorsal' => 11,
            'origen' => 'calle',
            'tipo' => 'novato',
            'dificultad' => 'baja',
            'estiloId' => $estilo,
            'habilidades' => $habilidades,
            'hinchada' => 58,
            'quimica' => 58,
            'partidos' => 0,
            'partidas' => 1,
            'victorias' => 0,
            'puntosCarrera' => 0,
            'asistenciasCarrera' => 0,
            'titulos' => 0,
            'retirado' => $retiro,
            'trofeos' => [
                ['nombre' => 'CAMPEÓN NBA', 'cantidad' => 0],
                ['nombre' => 'MVP FINALES', 'cantidad' => 0],
                ['nombre' => 'MVP TEMPORADA', 'cantidad' => 0],
                ['nombre' => 'ALL-STAR', 'cantidad' => 0],
                ['nombre' => 'MEJOR DEFENSOR', 'cantidad' => 0],
                ['nombre' => 'ANILLO DE CAMPEÓN', 'cantidad' => 0],
            ],
            'trayectoria' => [],
            'rival' => ['nombre' => 'EL ELEGIDO', 'puntos' => 18, 'titulos' => 0],
        ], $extra);
        $ficha['retirado'] = $retiro;
        $ficha['fase'] = $retiro ? 'retiro' : 'lobby';

        return ['ficha' => $ficha, 'retiro' => $retiro, 'club' => null];
    }

    /**
     * @return array{ficha: array<string, mixed>, retiro: bool, club: ?string}
     */
    private function estrella(string $id, int $partidas, int $partidos, int $victorias): array
    {
        $estrella = Estrellas::porId($id);
        if (! $estrella) {
            throw new \RuntimeException('No existe la estrella '.$id);
        }
        $ficha = Estrellas::fichaInicial($estrella);
        $ficha['partidas'] = $partidas;
        $ficha['partidos'] = $partidos;
        $ficha['victorias'] = $victorias;

        return ['ficha' => $ficha, 'retiro' => false, 'club' => $estrella['club']];
    }

    /**
     * @param  array<string, mixed>  $ficha
     */
    private function guardar(User $user, array $ficha, bool $retiro, ?string $club): void
    {
        $stats = is_array($ficha['stats'] ?? null) ? $ficha['stats'] : [];
        $equipoId = $this->equipoId($club);
        $ficha['equipoId'] = $equipoId;
        $jugador = new Jugador;
        $jugador->user_id = $user->id;
        $jugador->nombre = (string) $ficha['nombre'];
        $jugador->posicion = (string) $ficha['posicion'];
        $jugador->velocidad = (int) ($stats['velocidad'] ?? 50);
        $jugador->tiro = (int) ($stats['tiro'] ?? 50);
        $jugador->rebote = (int) ($stats['fuerza'] ?? 50);
        $jugador->pase = (int) ($stats['control'] ?? 50);
        $jugador->defensa = (int) ($stats['defensa'] ?? 50);
        $jugador->equipo_id = $equipoId;
        $jugador->retiro = $retiro;
        $jugador->ficha = json_encode($ficha, JSON_UNESCAPED_UNICODE);
        $jugador->save();
    }

    private function equipoId(?string $nombre): ?int
    {
        if (! $nombre || ! Schema::hasTable('equipos')) {
            return null;
        }
        $id = DB::table('equipos')->where('nombre', $nombre)->value('id');

        return $id ? (int) $id : null;
    }
}
