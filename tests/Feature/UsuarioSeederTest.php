<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\UsuarioSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UsuarioSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (config('database.default') !== 'sqlite' || config('database.connections.sqlite.database') !== ':memory:') {
            $this->fail('Las pruebas tienen que usar sqlite en memoria.');
        }
    }

    public function test_el_seeder_deja_cuentas_para_ver_cada_etapa(): void
    {
        $this->seed(UsuarioSeeder::class);

        $admin = User::query()->where('email', 'admin@therookie.test')->first();
        $this->assertNotNull($admin);
        $this->assertTrue($admin->es_manager);
        $this->assertTrue(password_verify('cancha-admin', $admin->password));

        $sesion = $this->actingAs($admin)->getJson('/api/sesion');
        $sesion->assertOk();
        $sesion->assertJsonPath('user.manager', true);
        $sesion->assertJsonPath('user.nivel', 7);
        $sesion->assertJsonPath('historial.carreras', 5);
        $sesion->assertJsonPath('activa.nombre', 'Mateo Ruiz');
        $this->assertTrue(collect($sesion->json('jugadores'))->contains(fn ($fila) => $fila['liga'] === 'NBA'));
        $this->assertTrue(collect($sesion->json('jugadores'))->contains(fn ($fila) => $fila['liga'] === 'LNB'));
        $this->assertTrue(collect($sesion->json('jugadores'))->contains(fn ($fila) => $fila['liga'] === 'NCAA'));
        $this->assertTrue(collect($sesion->json('jugadores'))->contains(fn ($fila) => $fila['retiro'] === true));

        $this->postJson('/auth/entrar', [
            'email' => 'novato@therookie.test',
            'password' => 'cancha-novato',
        ])->assertOk();

        $novato = User::query()->where('email', 'novato@therookie.test')->first();
        $this->assertFalse($novato->es_manager);
        $this->assertSame(1, $novato->jugadores()->count());

        $retiro = User::query()->where('email', 'retiro@therookie.test')->first();
        $this->assertFalse($retiro->es_manager);
        $this->assertTrue((bool) $retiro->jugadores()->first()->retiro);

        $ncaa = $this->actingAs(User::query()->where('email', 'ncaa@therookie.test')->first())
            ->getJson('/api/sesion');
        $ncaa->assertJsonPath('user.nivel', 2);

        $lnb = $this->actingAs(User::query()->where('email', 'lnb@therookie.test')->first())
            ->getJson('/api/sesion');
        $lnb->assertJsonPath('user.nivel', 4);

        $this->seed(UsuarioSeeder::class);
        $this->assertSame(1, User::query()->where('email', 'admin@therookie.test')->count());
        $this->assertSame(5, $admin->fresh()->jugadores()->count());
    }
}
