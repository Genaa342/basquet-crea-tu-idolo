<?php

use App\Http\Controllers\AccesoController;
use App\Http\Controllers\CarreraController;
use App\Http\Controllers\EquipoController;
use App\Http\Controllers\GoogleController;
use App\Http\Controllers\JuegoController;
use App\Http\Controllers\ManagerController;
use Illuminate\Support\Facades\Route;

Route::get('/', [JuegoController::class, 'index']);
Route::get('/jugar.php', [JuegoController::class, 'index']);

Route::get('/api/equipos.php', [EquipoController::class, 'index']);
Route::get('/api/estrellas', [ManagerController::class, 'mercado']);
Route::post('/api/guardar.php', [CarreraController::class, 'guardar']);
Route::get('/api/sesion', [CarreraController::class, 'sesion']);

Route::get('/auth/google', [GoogleController::class, 'redirect']);
Route::get('/auth/google/callback', [GoogleController::class, 'callback']);
Route::post('/auth/entrar', [AccesoController::class, 'entrar'])->middleware('throttle:8,1');
Route::post('/auth/registrar', [AccesoController::class, 'registrar'])->middleware('throttle:8,1');
Route::post('/auth/salir', [GoogleController::class, 'salir']);

Route::middleware('auth')->group(function () {
    Route::get('/api/carrera/{id}', [CarreraController::class, 'ver'])->whereNumber('id');
    Route::post('/api/cuenta/cerrar', [CarreraController::class, 'cerrar']);
    Route::post('/api/manager', [ManagerController::class, 'activar']);
    Route::post('/api/manager/nuevo', [ManagerController::class, 'nuevo']);
    Route::post('/api/manager/fichar', [ManagerController::class, 'fichar']);
});
