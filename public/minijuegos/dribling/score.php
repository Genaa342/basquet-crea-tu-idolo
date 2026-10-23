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
const MAX_STORED  = 50;      // cuántos puntajes se guardan
const MAX_SCORE   = 100000;  // tope de cordura contra valores absurdos
const NAME_LEN    = 12;

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
    $body = json_decode(file_get_contents('php://input') ?: '', true);
    if (!is_array($body)) {
        respond(400, ['error' => 'JSON inválido']);
    }

    $name = trim(strip_tags((string)($body['name'] ?? '')));
    $name = mb_substr($name, 0, NAME_LEN);
    $score = filter_var($body['score'] ?? null, FILTER_VALIDATE_INT);

    if ($name === '') {
        $name = 'Anónimo';
    }
    if ($score === false || $score < 0 || $score > MAX_SCORE) {
        respond(422, ['error' => 'Puntaje fuera de rango']);
    }

    flock($handle, LOCK_EX);
    $scores = readScores($handle);
    $scores[] = ['name' => $name, 'score' => $score, 'date' => date('c')];
    usort($scores, fn($a, $b) => $b['score'] <=> $a['score']);
    $scores = array_slice($scores, 0, MAX_STORED);

    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, json_encode($scores, JSON_UNESCAPED_UNICODE));
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);

    respond(201, array_slice($scores, 0, 10));
}

fclose($handle);
respond(405, ['error' => 'Método no permitido']);
