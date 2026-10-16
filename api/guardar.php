<?php
require dirname(__DIR__) . '/conexion.php';

header('Content-Type: application/json; charset=utf-8');

$conexion->query("ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS ficha MEDIUMTEXT NULL");
$conexion->query("ALTER TABLE jugadores ADD COLUMN IF NOT EXISTS equipo_id INT NULL");

$datos = json_decode(file_get_contents('php://input'), true);
if (!is_array($datos)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'No llegaron los datos del jugador.']);
    exit;
}

$nombre = trim($datos['nombre'] ?? '');
$posicion = $datos['posicion'] ?? '';
$posiciones = ['PG', 'SG', 'SF', 'PF', 'C'];
$stats = $datos['stats'] ?? [];

if ($nombre === '' || !in_array($posicion, $posiciones, true)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Completá el nombre y elegí una posición.']);
    exit;
}

$velocidad = (int) ($stats['velocidad'] ?? 50);
$tiro = (int) ($stats['tiro'] ?? 50);
$fuerza = (int) ($stats['fuerza'] ?? 50);
$control = (int) ($stats['control'] ?? 50);
$defensa = (int) ($stats['defensa'] ?? 50);
$equipoId = !empty($datos['equipoId']) ? (int) $datos['equipoId'] : null;
$ficha = json_encode($datos, JSON_UNESCAPED_UNICODE);
$id = isset($datos['id']) ? (int) $datos['id'] : 0;

if ($id > 0) {
    $stmt = $conexion->prepare(
        "UPDATE jugadores
         SET nombre = ?, posicion = ?, velocidad = ?, tiro = ?, rebote = ?, pase = ?, defensa = ?,
             ficha = ?, equipo_id = ?
         WHERE id = ?"
    );
    $stmt->bind_param(
        'ssiiiiisii',
        $nombre,
        $posicion,
        $velocidad,
        $tiro,
        $fuerza,
        $control,
        $defensa,
        $ficha,
        $equipoId,
        $id
    );
    $ok = $stmt->execute();
    $stmt->close();
} else {
    $stmt = $conexion->prepare(
        "INSERT INTO jugadores
            (nombre, posicion, velocidad, tiro, rebote, pase, defensa, ficha, equipo_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param(
        'ssiiiiisi',
        $nombre,
        $posicion,
        $velocidad,
        $tiro,
        $fuerza,
        $control,
        $defensa,
        $ficha,
        $equipoId
    );
    $ok = $stmt->execute();
    $id = $stmt->insert_id;
    $stmt->close();
}

if (!$ok) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo guardar el jugador.']);
    exit;
}

echo json_encode(['ok' => true, 'id' => $id], JSON_UNESCAPED_UNICODE);
