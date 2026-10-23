<?php

use App\Http\Controllers\AccesoController;
use App\Http\Controllers\CarreraController;
use App\Http\Controllers\EquipoController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\JuegoController;
use App\Http\Controllers\ManagerController;
use App\Http\Controllers\PuntajeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [JuegoController::class, 'index']);
Route::get('/jugar.php', [JuegoController::class, 'index']);

Route::get('/api/equipos.php', [EquipoController::class, 'index']);
Route::get('/api/estrellas', [ManagerController::class, 'mercado']);
Route::post('/api/guardar.php', [CarreraController::class, 'guardar']);
Route::get('/api/sesion', [CarreraController::class, 'sesion']);

Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);
Route::post('/auth/entrar', [AccesoController::class, 'entrar'])->middleware('throttle:entrar');
Route::post('/auth/registrar', [AccesoController::class, 'registrar'])->middleware('throttle:registrar');
Route::post('/auth/olvide', [AccesoController::class, 'olvide'])->middleware('throttle:olvide');
Route::post('/auth/restablecer', [AccesoController::class, 'restablecer'])->middleware('throttle:restablecer');
Route::post('/auth/clave', [AccesoController::class, 'clave'])->middleware('auth');
Route::post('/auth/salir', [GoogleController::class, 'salir']);
Route::get('/api/minijuego/puntaje', [PuntajeController::class, 'ver']);
Route::post('/api/minijuego/puntaje', [PuntajeController::class, 'guardar']);

Route::middleware('auth')->group(function () {
    Route::get('/api/carrera/{id}', [CarreraController::class, 'ver'])->whereNumber('id');
    Route::post('/api/cuenta/cerrar', [CarreraController::class, 'cerrar']);
    Route::post('/api/manager', [ManagerController::class, 'activar']);
    Route::post('/api/manager/nuevo', [ManagerController::class, 'nuevo']);
    Route::post('/api/manager/fichar', [ManagerController::class, 'fichar']);
});
