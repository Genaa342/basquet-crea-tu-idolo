<?php

namespace Tests\Feature;

use App\Models\Puntaje;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PuntajeTest extends TestCase
{
    use RefreshDatabase;

    public function test_el_ranking_exige_cuenta_y_se_queda_con_el_mejor(): void
    {
        $this->postJson('/api/minijuego/puntaje?game=runner', ['score' => 90000])
            ->assertUnauthorized();
        $this->assertSame(0, Puntaje::query()->count());

        $uno = User::factory()->create(['name' => 'Luka Doncic']);
        $this->actingAs($uno)
            ->postJson('/api/minijuego/puntaje?game=runner', ['name' => 'Tramposo', 'score' => 40])
            ->assertOk()
            ->assertJsonPath('0.name', 'Luka Doncic')
            ->assertJsonPath('0.score', 40);

        $this->actingAs($uno)
            ->postJson('/api/minijuego/puntaje?game=runner', ['score' => 12])
            ->assertOk()
            ->assertJsonPath('0.score', 40);

        $dos = User::factory()->create(['name' => 'Teo']);
        $this->actingAs($dos)
            ->postJson('/api/minijuego/puntaje?game=runner', ['score' => 80])
            ->assertOk()
            ->assertJsonPath('0.name', 'Teo')
            ->assertJsonPath('0.score', 80)
            ->assertJsonPath('1.name', 'Luka Doncic');

        $this->assertSame(2, Puntaje::query()->count());
    }
}
