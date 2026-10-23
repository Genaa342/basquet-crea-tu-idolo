<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\CorreoBienvenida;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AccesoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (config('database.default') !== 'sqlite' || config('database.connections.sqlite.database') !== ':memory:') {
            $this->fail('Las pruebas tienen que usar sqlite en memoria.');
        }
    }

    public function test_el_mensaje_de_bienvenida_no_lleva_la_clave(): void
    {
        $mensaje = (new CorreoBienvenida)->mensaje('Luka');

        $this->assertStringNotContainsString('cancha-9', $mensaje['texto']);
        $this->assertStringNotContainsString('cancha-9', $mensaje['html']);
        $this->assertStringContainsString('la contraseña que elegiste', $mensaje['texto']);
        $this->assertStringContainsString('Gracias por crear tu cuenta', $mensaje['texto']);
        $this->assertStringContainsString('Michael Jordan', $mensaje['texto']);
        $this->assertStringContainsString('John Wooden', $mensaje['html']);
    }

    public function test_el_alta_entra_y_prepara_el_correo_con_la_clave(): void
    {
        $correo = new class extends CorreoBienvenida
        {
            public array $enviados = [];

            public function enviar(string $nombre, string $email): void
            {
                $this->enviados[] = [$nombre, $email];
            }
        };
        $this->app->instance(CorreoBienvenida::class, $correo);

        $this->postJson('/auth/registrar', [
            'nombre' => 'Luka',
            'email' => 'luka@example.com',
            'password' => 'cancha-9',
        ])->assertOk()->assertJsonPath('correo', true);

        $this->assertAuthenticated();
        $usuario = User::query()->where('email', 'luka@example.com')->first();
        $this->assertNotNull($usuario);
        $this->assertTrue(Hash::check('cancha-9', $usuario->password));
        $this->assertSame([['Luka', 'luka@example.com']], $correo->enviados);

        $this->postJson('/auth/salir')->assertOk()->assertJson(['ok' => true]);
        $this->assertGuest();

        $this->postJson('/auth/entrar', [
            'email' => 'luka@example.com',
            'password' => 'cancha-9',
        ])->assertOk();
        $this->assertAuthenticated();
    }

    public function test_si_el_correo_falla_la_cuenta_queda_creada(): void
    {
        $this->app->instance(CorreoBienvenida::class, new class extends CorreoBienvenida
        {
            public function enviar(string $nombre, string $email): void
            {
                throw new \RuntimeException('smtp caido');
            }
        });

        $this->postJson('/auth/registrar', [
            'nombre' => 'Nico',
            'email' => 'nico@example.com',
            'password' => 'tablero',
        ])->assertOk()->assertJsonPath('correo', false);

        $this->assertAuthenticated();
        $this->assertNotNull(User::query()->where('email', 'nico@example.com')->first());
    }

    public function test_un_usuario_nuevo_entra_sin_pedir_una_cuenta(): void
    {
        $this->postJson('/auth/registrar', [
            'usuario' => 'Franco',
            'password' => 'cancha-9',
        ])->assertOk()->assertJsonPath('correo', true);

        $this->assertAuthenticated();
        $cuenta = User::query()->where('usuario', 'franco')->first();
        $this->assertNotNull($cuenta);
        $this->assertSame('Franco', $cuenta->name);
        $this->assertNull($this->getJson('/api/sesion')->json('user.email'));
        $this->assertSame('franco', $this->getJson('/api/sesion')->json('user.usuario'));

        $this->postJson('/auth/salir')->assertOk();
        $this->assertGuest();

        $this->postJson('/auth/entrar', [
            'usuario' => 'Franco',
            'password' => 'cancha-9',
        ])->assertOk();

        $this->postJson('/auth/salir')->assertOk();

        $this->postJson('/auth/entrar', [
            'usuario' => 'franco',
            'password' => 'otra',
        ])->assertStatus(422)
            ->assertJsonPath('errors.usuario.0', 'Usuario o contraseña incorrectos.');

        $this->postJson('/auth/registrar', [
            'usuario' => 'FRANCO',
            'password' => 'cancha-9',
        ])->assertStatus(422)
            ->assertJsonPath('errors.usuario.0', 'Ese usuario ya existe. Entrá con tu contraseña.');

        $this->postJson('/auth/registrar', [
            'usuario' => 'ab',
            'password' => 'cancha-9',
        ])->assertStatus(422);
    }

    public function test_un_email_repetido_o_una_clave_corta_no_crea_cuenta(): void
    {
        User::factory()->create(['email' => 'luka@example.com']);

        $this->postJson('/auth/registrar', [
            'nombre' => 'Luka',
            'email' => 'luka@example.com',
            'password' => 'cancha-9',
        ])->assertStatus(422);

        $this->postJson('/auth/registrar', [
            'nombre' => 'Ana',
            'email' => 'ana@example.com',
            'password' => '123',
        ])->assertStatus(422);

        $this->assertGuest();
        $this->assertNull(User::query()->where('email', 'ana@example.com')->first());
    }

    public function test_la_cuenta_de_google_no_entra_con_una_clave_inventada(): void
    {
        User::factory()->create([
            'email' => 'google@example.com',
            'google_id' => 'abc',
            'password' => 'otra-clave',
        ]);

        $this->postJson('/auth/entrar', [
            'email' => 'google@example.com',
            'password' => 'no-es',
        ])->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Esa cuenta entra con Google.');
    }

    public function test_equivocarse_de_clave_no_bloquea_el_registro(): void
    {
        User::factory()->create([
            'email' => 'luka@example.com',
            'password' => 'cancha-9',
        ]);

        for ($i = 0; $i < 8; $i++) {
            $this->postJson('/auth/entrar', [
                'email' => 'luka@example.com',
                'password' => 'mala',
            ])->assertStatus(422);
        }

        $bloqueado = $this->postJson('/auth/entrar', [
            'email' => 'luka@example.com',
            'password' => 'mala',
        ]);
        $bloqueado->assertStatus(429);
        $this->assertStringNotContainsString('exception', $bloqueado->getContent());
        $this->assertStringNotContainsString('vendor', $bloqueado->getContent());
        $bloqueado->assertJsonPath('errors.email.0', 'Demasiados intentos. Esperá un minuto y probá de nuevo.');

        $this->postJson('/auth/registrar', [
            'nombre' => 'Ana',
            'email' => 'ana@example.com',
            'password' => 'cancha-9',
        ])->assertOk();
    }

    public function test_se_puede_elegir_una_contrasena_nueva_sin_correo(): void
    {
        $usuario = User::factory()->create([
            'email' => 'luka@example.com',
            'password' => 'cancha-9',
        ]);

        $pedido = $this->postJson('/auth/olvide', ['email' => 'luka@example.com']);
        $pedido->assertOk()->assertJsonPath('correo', false);
        $codigo = $pedido->json('codigo');
        $this->assertSame(6, strlen((string) $codigo));

        $this->postJson('/auth/olvide', ['email' => 'nadie@example.com'])
            ->assertOk()
            ->assertJsonPath('codigo', null);

        $this->postJson('/auth/restablecer', [
            'email' => 'luka@example.com',
            'codigo' => '000000',
            'password' => 'tablero',
        ])->assertStatus(422);

        $this->postJson('/auth/restablecer', [
            'email' => 'luka@example.com',
            'codigo' => $codigo,
            'password' => 'tablero',
        ])->assertOk();

        $this->assertTrue(Hash::check('tablero', $usuario->fresh()->password));
        $this->assertAuthenticated();
    }

    public function test_la_contrasena_se_cambia_dentro_de_la_cuenta(): void
    {
        $usuario = User::factory()->create([
            'email' => 'luka@example.com',
            'password' => 'cancha-9',
        ]);

        $this->actingAs($usuario)->postJson('/auth/clave', [
            'actual' => 'no-es',
            'password' => 'tablero',
        ])->assertStatus(422);

        $this->actingAs($usuario)->postJson('/auth/clave', [
            'actual' => 'cancha-9',
            'password' => 'tablero',
        ])->assertOk();

        $this->assertTrue(Hash::check('tablero', $usuario->fresh()->password));
    }
}
