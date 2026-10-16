<?php
require dirname(__DIR__) . '/conexion.php';

header('Content-Type: application/json; charset=utf-8');

$resultado = $conexion->query(
    "SELECT id, nombre, abreviatura, ciudad, conferencia, division,
            color_primario, color_secundario, liga, minima
     FROM equipos
     ORDER BY liga, minima DESC, nombre"
);

$fondos = [
    'NBA' => 'assets/fondo-8bit.jpg',
    'NCAA' => 'assets/fondo-ncaa.jpg',
    'LNB' => 'assets/fondo-lnb.jpg',
];
$base = dirname(__DIR__);
$equipos = [];
while ($fila = $resultado->fetch_assoc()) {
    $codigo = strtolower($fila['abreviatura']);
    $extension = $codigo === 'mia' ? 'gif' : 'png';
    $logo = 'assets/logos/' . $codigo . '.' . $extension;
    $fila['logo'] = is_file($base . '/' . $logo) ? $logo : null;
    $fila['minima'] = (int) $fila['minima'];
    $propio = 'assets/fondos/' . strtolower($fila['liga']) . '-' . $codigo . '.png';
    if (is_file($base . '/' . $propio)) {
        $fila['fondo'] = $propio;
    } else {
        $generico = $fondos[$fila['liga']] ?? 'assets/fondo-calle.jpg';
        $fila['fondo'] = is_file($base . '/' . $generico) ? $generico : 'assets/fondo-calle.jpg';
    }
    $equipos[] = $fila;
}

echo json_encode($equipos, JSON_UNESCAPED_UNICODE);
