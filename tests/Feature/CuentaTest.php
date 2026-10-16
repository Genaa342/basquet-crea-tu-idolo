<?php

namespace Tests\Feature;

use App\Models\Jugador;
use App\Models\User;
use App\Support\Estrellas;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CuentaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (config('database.default') !== 'sqlite' || config('database.connections.sqlite.database') !== ':memory:') {
            $this->fail('Las pruebas tienen que usar sqlite en memoria.');
        }
    }

    public function test_el_invitado_no_puede_guardar_sin_cuenta(): void
    {
        $this->postJson('/api/guardar.php', $this->ficha('Calle'))
            ->assertUnauthorized()
            ->assertJson(['ok' => false]);

        $this->assertNull(Jugador::query()->where('nombre', 'Calle')->first());
    }

    public function test_google_sin_claves_vuelve_al_juego(): void
    {
        $this->get('/auth/google')->assertRedirect('/?google=falta');
    }

    public function test_la_sesion_de_invitado_no_trae_usuario(): void
    {
        $this->getJson('/api/sesion')
            ->assertOk()
            ->assertJsonPath('user', null)
            ->assertJsonPath('google', false);
    }

    public function test_una_carrera_ajena_no_se_pisa_y_el_manager_nace_despues_del_retiro(): void
    {
        $dueno = User::factory()->create();
        $otro = User::factory()->create();

        $alta = $this->actingAs($dueno)->postJson('/api/guardar.php', $this->ficha('Titular'));
        $alta->assertOk();
        $id = $alta->json('id');

        $this->actingAs($otro)
            ->postJson('/api/guardar.php', $this->ficha('Titular', ['id' => $id]))
            ->assertForbidden();

        $this->actingAs($dueno)
            ->postJson('/api/guardar.php', $this->ficha('Suplente'))
            ->assertStatus(422);

        $this->actingAs($dueno)
            ->postJson('/api/manager/nuevo')
            ->assertForbidden();

        $this->actingAs($dueno)
            ->postJson('/api/guardar.php', $this->ficha('Titular', ['id' => $id, 'retirado' => true, 'fase' => 'retiro']))
            ->assertOk();

        $this->assertTrue(Jugador::query()->find($id)->retiro);

        $this->actingAs($dueno)
            ->postJson('/api/guardar.php', $this->ficha('Segundo'))
            ->assertStatus(422);

        $this->actingAs($dueno)->postJson('/api/manager')->assertOk();
        $this->assertTrue($dueno->fresh()->es_manager);

        $segundo = $this->actingAs($dueno)->postJson('/api/guardar.php', $this->ficha('Segundo'));
        $segundo->assertOk();
        $this->assertNotSame($id, $segundo->json('id'));

        $this->actingAs($dueno)
            ->getJson('/api/carrera/'.$id)
            ->assertOk()
            ->assertJsonPath('ficha.retirado', true)
            ->assertJsonPath('ficha.nombre', 'Titular');

        $this->actingAs($otro)
            ->getJson('/api/carrera/'.$id)
            ->assertNotFound();
    }

    public function test_el_manager_tiene_varias_carreras_y_el_mercado_respeta_el_nivel(): void
    {
        $user = User::factory()->create();
        $primero = $this->actingAs($user)->postJson('/api/guardar.php', $this->ficha('Novato', [
            'retirado' => true,
            'fase' => 'retiro',
            'calibre' => 46,
            'partidos' => 2,
            'partidas' => 5,
        ]));
        $primero->assertOk();

        $this->actingAs($user)->postJson('/api/manager')->assertOk();
        $this->actingAs($user)->postJson('/api/manager/fichar', ['id' => 'ncaa-1'])->assertStatus(422);

        $this->actingAs($user)->postJson('/api/guardar.php', $this->ficha('Novato', [
            'id' => $primero->json('id'),
            'retirado' => true,
            'fase' => 'retiro',
            'calibre' => 54,
            'partidos' => 2,
            'partidas' => 5,
        ]))->assertOk();

        $fichaje = $this->actingAs($user)->postJson('/api/manager/fichar', ['id' => 'ncaa-1']);
        $fichaje->assertOk();
        $this->assertSame('Cameron Boozer', $fichaje->json('ficha.nombre'));
        $this->assertSame(22.5, $fichaje->json('ficha.ppgPrevio'));

        $this->actingAs($user)->postJson('/api/manager/fichar', ['id' => 'nba-1'])->assertStatus(422);
        $this->actingAs($user)->postJson('/api/manager/fichar', ['id' => 'ncaa-1'])->assertStatus(422);

        $segundo = $this->actingAs($user)->postJson('/api/guardar.php', $this->ficha('Estrella'));
        $segundo->assertOk();
        $this->assertNotSame($fichaje->json('id'), $segundo->json('id'));

        $sesion = $this->actingAs($user)->getJson('/api/sesion');
        $sesion->assertOk();
        $sesion->assertJsonPath('user.manager', true);
        $sesion->assertJsonPath('historial.carreras', 3);
        $this->assertGreaterThanOrEqual(5, $sesion->json('historial.partidas'));

        $this->getJson('/api/estrellas')
            ->assertOk()
            ->assertJsonCount(75);

        $this->assertCount(25, array_filter(Estrellas::todas(), fn ($fila) => $fila['liga'] === 'NBA'));
        $this->assertCount(25, array_filter(Estrellas::todas(), fn ($fila) => $fila['liga'] === 'NCAA'));
        $this->assertCount(25, array_filter(Estrellas::todas(), fn ($fila) => $fila['liga'] === 'LNB'));
    }

    public function test_cerrar_cuenta_borra_el_perfil_y_las_carreras(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->postJson('/api/guardar.php', $this->ficha('Cierra'))->assertOk();

        $this->actingAs($user)->postJson('/api/cuenta/cerrar')->assertOk();

        $this->assertGuest();
        $this->assertNull(User::query()->find($user->id));
        $this->assertSame(0, Jugador::query()->where('nombre', 'Cierra')->count());
    }

    public function test_sin_retiro_no_hay_manager(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson('/api/guardar.php', $this->ficha('Activo'))
            ->assertOk();

        $this->actingAs($user)
            ->postJson('/api/manager')
            ->assertStatus(422);
    }

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    private function ficha(string $nombre, array $extra = []): array
    {
        return array_merge([
            'nombre' => $nombre,
            'posicion' => 'SG',
            'calibre' => 46,
            'fase' => 'lobby',
            'stats' => [
                'velocidad' => 75,
                'tiro' => 85,
                'fuerza' => 45,
                'control' => 60,
                'defensa' => 55,
            ],
        ], $extra);
    }
}
