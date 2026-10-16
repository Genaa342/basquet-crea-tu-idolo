<?php

namespace App\Support;

/**
 * 25 figuras por liga, con la línea que tenían antes de que el manager las firme.
 * NBA: ESPN NBA Rank 2026 (1-10) y Locked On Top 100 del 30 sep 2026 (11-25), club de ese listado.
 * NCAA: Bleacher Report, 18 mar 2026, top 25 del torneo. Promedios publicados ahí.
 * LNB: temporada 2025-26 (MVP, quinteto ideal y líderes de laliganacional.com.ar / Wikipedia).
 * Si un rubro no estaba publicado, queda en null y no se inventa.
 */
class Estrellas
{
    public static function nivelDeCalibre(int $calibre): int
    {
        return 1 + max(0, intdiv(max(0, $calibre - 46), 8));
    }

    public static function nivelRequerido(string $liga): int
    {
        return match ($liga) {
            'NCAA' => 2,
            'LNB' => 4,
            'NBA' => 6,
            default => 99,
        };
    }

    public static function porId(string $id): ?array
    {
        foreach (self::todas() as $estrella) {
            if ($estrella['id'] === $id) {
                return $estrella;
            }
        }

        return null;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public static function todas(): array
    {
        return array_merge(self::nba(), self::ncaa(), self::lnb());
    }

    /**
     * @param  array<string, mixed>  $estrella
     * @return array<string, mixed>
     */
    public static function fichaInicial(array $estrella): array
    {
        return [
            'nombre' => $estrella['nombre'],
            'posicion' => $estrella['posicion'],
            'calibre' => $estrella['calibre'],
            'fase' => 'lobby',
            'stats' => self::stats($estrella['posicion'], (int) $estrella['calibre']),
            'edad' => 24,
            'altura' => 198,
            'peso' => 96,
            'ciudad' => $estrella['club'],
            'dorsal' => $estrella['puesto'],
            'origen' => 'profesional',
            'tipo' => 'profesional',
            'estrellaId' => $estrella['id'],
            'ligaOrigen' => $estrella['liga'],
            'clubOrigen' => $estrella['club'],
            'dificultad' => $estrella['dificultad'],
            'ppgPrevio' => $estrella['ppg'],
            'rpgPrevio' => $estrella['rpg'],
            'apgPrevio' => $estrella['apg'],
            'notaPrevia' => $estrella['nota'],
            'estiloId' => self::estilo($estrella['posicion']),
            'habilidades' => self::habilidades($estrella['posicion']),
            'hinchada' => 70,
            'quimica' => 70,
            'partidos' => 0,
            'partidas' => 0,
            'victorias' => 0,
            'puntosCarrera' => 0,
            'asistenciasCarrera' => 0,
            'titulos' => 0,
            'retirado' => false,
            'trofeos' => [
                ['nombre' => 'CAMPEÓN NBA', 'cantidad' => 0],
                ['nombre' => 'MVP FINALES', 'cantidad' => 0],
                ['nombre' => 'MVP TEMPORADA', 'cantidad' => 0],
                ['nombre' => 'ALL-STAR', 'cantidad' => 0],
                ['nombre' => 'MEJOR DEFENSOR', 'cantidad' => 0],
                ['nombre' => 'ANILLO DE CAMPEÓN', 'cantidad' => 0],
            ],
            'trayectoria' => [[
                'nombre' => $estrella['club'],
                'liga' => $estrella['liga'],
            ]],
            'rival' => ['nombre' => 'EL ELEGIDO', 'puntos' => 18, 'titulos' => 0],
        ];
    }

    /**
     * @return array{velocidad: int, tiro: int, fuerza: int, control: int, defensa: int}
     */
    public static function stats(string $posicion, int $calibre): array
    {
        $bases = [
            'PG' => ['velocidad' => 80, 'tiro' => 65, 'fuerza' => 40, 'control' => 85, 'defensa' => 60],
            'SG' => ['velocidad' => 75, 'tiro' => 85, 'fuerza' => 45, 'control' => 60, 'defensa' => 55],
            'SF' => ['velocidad' => 70, 'tiro' => 70, 'fuerza' => 60, 'control' => 55, 'defensa' => 65],
            'PF' => ['velocidad' => 55, 'tiro' => 55, 'fuerza' => 80, 'control' => 45, 'defensa' => 70],
            'C' => ['velocidad' => 45, 'tiro' => 45, 'fuerza' => 90, 'control' => 35, 'defensa' => 80],
        ];
        $base = $bases[$posicion] ?? $bases['SF'];
        $media = array_sum($base) / 5;
        $factor = $media > 0 ? $calibre / $media : 1;
        $stats = [];
        foreach ($base as $clave => $valor) {
            $stats[$clave] = max(20, min(99, (int) round($valor * $factor)));
        }

        return $stats;
    }

    private static function estilo(string $posicion): string
    {
        return match ($posicion) {
            'PG', 'SG' => 'base',
            'SF' => 'alero',
            'PF' => 'ala',
            default => 'pivot',
        };
    }

    /**
     * @return list<string>
     */
    private static function habilidades(string $posicion): array
    {
        return match ($posicion) {
            'PG' => ['PLAYMAKER', 'LÍDER DE EQUIPO'],
            'SG' => ['TIRADOR CLAVE', 'PLAYMAKER'],
            'SF' => ['TIRADOR CLAVE', 'DEFENSOR PERIMETRAL'],
            'PF' => ['DEFENSOR PERIMETRAL', 'LÍDER DE EQUIPO'],
            default => ['DEFENSOR PERIMETRAL', 'LÍDER DE EQUIPO'],
        };
    }

    /**
     * @param  array{0: string, 1: string, 2: string, 3: string, 4?: float|null, 5?: float|null, 6?: float|null, 7?: string|null}  $fila
     * @return array<string, mixed>
     */
    private static function fila(string $liga, string $dificultad, int $puesto, int $calibre, array $fila): array
    {
        return [
            'id' => strtolower($liga).'-'.$puesto,
            'liga' => $liga,
            'dificultad' => $dificultad,
            'puesto' => $puesto,
            'calibre' => $calibre,
            'nombre' => $fila[0],
            'club' => $fila[1],
            'posicion' => $fila[2],
            'nota' => $fila[3],
            'ppg' => $fila[4] ?? null,
            'rpg' => $fila[5] ?? null,
            'apg' => $fila[6] ?? null,
        ];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function nba(): array
    {
        $filas = [
            ['Nikola Jokic', 'Denver Nuggets', 'C', 'ESPN NBA Rank 2026', 27.7, 12.9, 10.7],
            ['Victor Wembanyama', 'San Antonio Spurs', 'C', 'ESPN NBA Rank 2026', 25.0, 11.5, null],
            ['Shai Gilgeous-Alexander', 'Oklahoma City Thunder', 'SG', 'ESPN NBA Rank 2026', null, null, null],
            ['Luka Doncic', 'Los Angeles Lakers', 'PG', 'ESPN NBA Rank 2026', null, null, null],
            ['Giannis Antetokounmpo', 'Miami Heat', 'PF', 'Locked On, 30 sep 2026', null, null, null],
            ['Jalen Brunson', 'New York Knicks', 'PG', 'ESPN NBA Rank 2026', null, null, null],
            ['Anthony Edwards', 'Minnesota Timberwolves', 'SG', 'ESPN NBA Rank 2026', null, null, null],
            ['Cade Cunningham', 'Detroit Pistons', 'PG', 'ESPN NBA Rank 2026', null, null, null],
            ['Jayson Tatum', 'Boston Celtics', 'SF', 'ESPN NBA Rank 2026', null, null, null],
            ['Donovan Mitchell', 'Cleveland Cavaliers', 'SG', 'ESPN NBA Rank 2026', null, null, null],
            ['Tyrese Maxey', 'Philadelphia 76ers', 'SG', 'Locked On Top 100, 2026', null, null, null],
            ['Kawhi Leonard', 'Toronto Raptors', 'SF', 'Locked On Top 100, 2026', null, null, null],
            ['Scottie Barnes', 'Toronto Raptors', 'PF', 'Locked On Top 100, 2026', null, null, null],
            ['Tyrese Haliburton', 'Indiana Pacers', 'PG', 'Locked On Top 100, 2026', null, null, null],
            ['Karl-Anthony Towns', 'New York Knicks', 'C', 'Locked On Top 100, 2026', null, null, null],
            ['Stephen Curry', 'Golden State Warriors', 'PG', 'Locked On Top 100, 2026', null, null, null],
            ['Kevin Durant', 'Houston Rockets', 'SF', 'Locked On Top 100, 2026', null, null, null],
            ['Pascal Siakam', 'Indiana Pacers', 'PF', 'Locked On Top 100, 2026', null, null, null],
            ['Jaylen Brown', 'Philadelphia 76ers', 'SF', 'Locked On Top 100, 2026', null, null, null],
            ['Jamal Murray', 'Denver Nuggets', 'PG', 'Locked On Top 100, 2026', null, null, null],
            ['Jalen Johnson', 'Atlanta Hawks', 'PF', 'Locked On Top 100, 2026', null, null, null],
            ['Jalen Williams', 'Oklahoma City Thunder', 'SF', 'Locked On Top 100, 2026', null, null, null],
            ['Chet Holmgren', 'Oklahoma City Thunder', 'C', 'Locked On Top 100, 2026', null, null, null],
            ['OG Anunoby', 'New York Knicks', 'SF', 'Locked On Top 100, 2026', null, null, null],
            ['LeBron James', 'Philadelphia 76ers', 'SF', 'Locked On Top 100, 2026', null, null, null],
        ];

        return self::armar('NBA', 'alta', 97, $filas);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function ncaa(): array
    {
        $filas = [
            ['Cameron Boozer', 'Duke', 'PF', 'Bleacher Report, marzo 2026', 22.5, 10.2, 4.2],
            ['AJ Dybantsa', 'BYU', 'SF', 'Bleacher Report, marzo 2026', 25.3, 6.7, 3.8],
            ['Yaxel Lendeborg', 'Michigan', 'PF', 'Bleacher Report, marzo 2026', 14.4, 7.0, 3.3],
            ['Darius Acuff Jr.', 'Arkansas', 'PG', 'Bleacher Report, marzo 2026', 22.9, 3.2, 6.5],
            ['Keaton Wagler', 'Illinois', 'SG', 'Bleacher Report, marzo 2026', 17.9, 4.8, 4.4],
            ['Jeremy Fears Jr.', 'Michigan State', 'PG', 'Bleacher Report, marzo 2026', 15.7, null, 9.2],
            ['Joshua Jefferson', 'Iowa State', 'PF', 'Bleacher Report, marzo 2026', 16.9, 7.6, 4.9],
            ['Braden Smith', 'Purdue', 'PG', 'Bleacher Report, marzo 2026', 14.0, null, 9.1],
            ['Kingston Flemings', 'Houston', 'PG', 'Bleacher Report, marzo 2026', 16.4, null, 5.3],
            ['Thomas Haugh', 'Florida', 'SF', 'Bleacher Report, marzo 2026', 17.1, 6.2, 2.0],
            ['Christian Anderson', 'Texas Tech', 'PG', 'Bleacher Report, marzo 2026', 18.9, null, 7.6],
            ['Tyler Tanner', 'Vanderbilt', 'PG', 'Bleacher Report, marzo 2026', 19.2, 3.5, 5.3],
            ['Jaden Bradley', 'Arizona', 'PG', 'Bleacher Report, marzo 2026', 13.3, 3.6, 4.5],
            ['Bruce Thornton', 'Ohio State', 'SG', 'Bleacher Report, marzo 2026', 20.2, 5.1, null],
            ['Darryn Peterson', 'Kansas', 'SG', 'Bleacher Report, marzo 2026', 19.8, null, null],
            ['Labaron Philon Jr.', 'Alabama', 'PG', 'Bleacher Report, marzo 2026', 21.7, null, 4.7],
            ['Graham Ike', 'Gonzaga', 'C', 'Bleacher Report, marzo 2026', 19.7, null, null],
            ['Zuby Ejiofor', 'St. John\'s', 'PF', 'Bleacher Report, marzo 2026', 16.3, 7.1, 3.5],
            ['Milan Momcilovic', 'Iowa State', 'SF', 'Bleacher Report, marzo 2026', 17.1, null, null],
            ['Bennett Stirtz', 'Iowa', 'PG', 'Bleacher Report, marzo 2026', 20.0, null, 4.5],
            ['Brayden Burries', 'Arizona', 'SG', 'Bleacher Report, marzo 2026', 15.9, null, null],
            ['Alex Karaban', 'UConn', 'SF', 'Bleacher Report, marzo 2026', 12.6, 5.2, 2.3],
            ['Ja\'Kobi Gillespie', 'Tennessee', 'PG', 'Bleacher Report, marzo 2026', 18.0, null, 5.5],
            ['Nick Boyd', 'Wisconsin', 'PG', 'Bleacher Report, marzo 2026', null, null, null],
            ['Aday Mara', 'Michigan', 'C', 'Bleacher Report, marzo 2026', 11.6, 6.9, 2.3],
        ];

        return self::armar('NCAA', 'baja', 84, $filas);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private static function lnb(): array
    {
        $filas = [
            ['Ty Sabin', 'Obras', 'SG', 'Líder de puntos 2025-26', 18.5, 3.1, 1.7],
            ['Francisco Cáffaro', 'Boca Juniors', 'C', 'MVP de la fase regular 2025-26', 14.6, 9.0, 0.9],
            ['Will Vorhees', 'Oberá', 'PF', 'Quinteto ideal 2025-26', 15.8, 6.1, 1.6],
            ['Thomas Cooper', 'Racing', 'SF', 'Tercero en puntos, fase regular', 16.2, null, null],
            ['Agustín Brocal', 'Racing', 'SG', 'Top 5 de puntos, fase regular', 15.7, null, null],
            ['Leonardo Lema', 'Quimsa', 'PF', 'Quinteto ideal 2025-26', 12.4, 7.7, null],
            ['Francisco Conrradi', 'Independiente de Oliva', 'PG', 'Quinteto ideal 2025-26', 12.2, 4.9, 4.6],
            ['Lucas Pérez', 'San Lorenzo', 'PG', 'Líder de asistencias, Wikipedia 2025-26', null, null, 4.7],
            ['Franco Balbi', 'La Unión', 'PG', 'Líder de asistencias de la fase regular', null, null, 4.9],
            ['Leandro Vildoza', 'Instituto', 'PG', 'Entre los mejores asistidores 2025-26', null, null, 4.7],
            ['Lucas Andújar', 'Oberá', 'PG', 'Top de asistencias de la fase regular', null, null, 4.5],
            ['Fortunato Rolfi', 'Independiente de Oliva', 'PG', 'Top de asistencias de la fase regular', null, null, 4.4],
            ['Eric Flor', 'Platense', 'PG', 'Top de asistencias de la fase regular', null, null, 4.3],
            ['Manuel Rodríguez', 'Racing', 'C', 'Top 5 de rebotes de la fase regular', null, 7.3, null],
            ['Sebastián Carrasco', 'Gimnasia (CR)', 'PG', 'MVP de las finales 2025-26', null, null, null],
            ['Marcos Delía', 'Racing', 'C', 'Plantel Liga Nacional 2026-27', null, null, null],
            ['Bryan Carabalí', 'Atenas', 'C', 'Entre los más altos de la 2026-27', null, null, null],
            ['Nakye Sanders', 'Atenas', 'C', 'Líder de tapones al corte 2025-26', null, null, null],
            ['Lucas Faggiano', 'Boca Juniors', 'SG', 'Figura de Boca en 2025-26', null, null, null],
            ['Michael Smith', 'Boca Juniors', 'PF', 'Figura de Boca en 2025-26', null, null, null],
            ['Alejandro Diez', 'Ferro', 'SG', 'Entre los máximos goleadores activos', null, null, null],
            ['Leonel Schattmann', 'San Lorenzo', 'SG', 'Máximo anotador activo hacia 2026-27', null, null, null],
            ['Nicolás Aguirre', 'San Lorenzo', 'SG', 'Entre los máximos goleadores activos', null, null, null],
            ['Marcos Mata', 'San Lorenzo', 'SF', 'Entre los máximos goleadores activos', null, null, null],
            ['Víctor Fernández', 'Oberá', 'PG', 'Plantel Liga Nacional 2026-27', null, null, null],
        ];
        $salida = [];
        foreach ($filas as $indice => $fila) {
            $salida[] = self::fila('LNB', 'media', $indice + 1, 78 - $indice, $fila);
        }

        return $salida;
    }

    /**
     * @param  list<array<int, mixed>>  $filas
     * @return list<array<string, mixed>>
     */
    private static function armar(string $liga, string $dificultad, int $calibreTope, array $filas): array
    {
        $salida = [];
        foreach ($filas as $indice => $fila) {
            $salida[] = self::fila($liga, $dificultad, $indice + 1, $calibreTope - $indice, $fila);
        }

        return $salida;
    }
}
