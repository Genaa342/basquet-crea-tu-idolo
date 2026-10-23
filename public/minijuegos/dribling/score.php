<?php
// Ranking de Dribbling Hoops.
// GET  -> devuelve el top 10 en JSON (?game=dribbling por defecto, o ?game=runner).
// POST -> guarda {"name": "...", "score": 123}.
// Requisito: la carpeta api/ debe tener permisos de escritura para PHP.

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

// Un archivo de ranking por juego: api/score.php?game=runner
const GAMES = ['dribbling' => 'scores.json', 'runner' => 'scores-runner.json'];

function respond(int $status, $data): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function readScores($handle): array
{
    rewind($handle);
    $raw  = stream_get_contents($handle);
    $list = json_decode($raw ?: '[]', true);
    return is_array($list) ? $list : [];
}

$game = $_GET['game'] ?? 'dribbling';
if (!isset(GAMES[$game])) {
    respond(400, ['error' => 'Juego desconocido']);
}

$handle = fopen(__DIR__ . '/' . GAMES[$game], 'c+');
if ($handle === false) {
    respond(500, ['error' => 'No se pudo abrir el archivo de puntajes']);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    flock($handle, LOCK_SH);
    $scores = readScores($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    respond(200, array_slice($scores, 0, 10));
}

if ($method === 'POST') {
    fclose($handle);
    respond(403, ['error' => 'El ranking se guarda con la cuenta, desde el juego.']);
}

fclose($handle);
respond(405, ['error' => 'Método no permitido']);
