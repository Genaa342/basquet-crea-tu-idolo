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

    public function test_el_mensaje_de_bienvenida_lleva_la_clave_y_frases(): void
    {
        $mensaje = (new CorreoBienvenida)->mensaje('Luka', 'cancha-9');

        $this->assertStringContainsString('cancha-9', $mensaje['texto']);
        $this->assertStringContainsString('cancha-9', $mensaje['html']);
        $this->assertStringContainsString('Gracias por crear tu cuenta', $mensaje['texto']);
        $this->assertStringContainsString('Michael Jordan', $mensaje['texto']);
        $this->assertStringContainsString('John Wooden', $mensaje['html']);
    }

    public function test_el_alta_entra_y_prepara_el_correo_con_la_clave(): void
    {
        $correo = new class extends CorreoBienvenida
        {
            public array $enviados = [];

            public function enviar(string $nombre, string $email, string $clave): void
            {
                $this->enviados[] = [$nombre, $email, $clave];
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
        $this->assertSame([['Luka', 'luka@example.com', 'cancha-9']], $correo->enviados);

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
            public function enviar(string $nombre, string $email, string $clave): void
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
}
