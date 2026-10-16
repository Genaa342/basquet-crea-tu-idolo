<?php
require 'conexion.php';

$nombre = trim($_GET["nombre"] ?? "") !== "" ? $_GET["nombre"] : "Jugador";

// Colores por defecto (si no se eligió equipo o el id no existe)
$colorPrimario = '#f59e0b';
$colorSecundario = '#b96f35';
$equipoNombre = null;
$equipoId = isset($_GET['equipo']) ? intval($_GET['equipo']) : null;

if ($equipoId) {
    $stmt = $pdo->prepare(
        "SELECT nombre, color_primario, color_secundario FROM equipos WHERE id = ?"
    );
    $stmt->execute([$equipoId]);
    $equipo = $stmt->fetch();

    if ($equipo) {
        $colorPrimario = $equipo['color_primario'];
        $colorSecundario = $equipo['color_secundario'];
        $equipoNombre = $equipo['nombre'];
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reflejos - Básquet</title>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="css/estilos.css">
    <link rel="stylesheet" href="../css/mini-fit.css">
    <script src="../js/mini-fit.js"></script>

    <style>
        :root {
            --color-primario: <?php echo htmlspecialchars($colorPrimario); ?>;
            --color-secundario: <?php echo htmlspecialchars($colorSecundario); ?>;
        }
    </style>
</head>
<body>
    <main class="contenedor">
        <h1>🏀 Desafío de Reflejos</h1>
        <p class="subtitulo">
            Jugador: <strong><?php echo htmlspecialchars($nombre); ?></strong>
            <?php if ($equipoNombre): ?>
                · Equipo: <strong><?php echo htmlspecialchars($equipoNombre); ?></strong>
            <?php endif; ?>
        </p>

        <section class="panel">
            <div>⏱️ Tiempo: <span id="tiempo">30</span>s</div>
            <div>🎯 Aciertos: <span id="aciertos">0</span></div>
            <div>⚡ Promedio: <span id="promedio">-</span></div>
            <div>❤️ Vidas: <span id="vidas">3</span></div>
        </section>

        <div id="cancha">
            <div id="aro"></div>
            <button id="objetivo" aria-label="Objetivo">🏀</button>
        </div>

        <p id="mensaje">Presioná comenzar y hacé clic en la pelota lo más rápido posible.</p>
        <button id="comenzar">Comenzar</button>
        <div id="resultado"></div>
    </main>

    <div id="modalDerrota" class="oculto">
        <div class="modal-contenido">
            <h2>😡 ¡Tu entrenador está furioso!</h2>
            <p>No agarraste los rebotes y eso enfadó a tu entrenador.</p>
            <p id="modalStats"></p>
            <button id="cerrarModal">Reintentar</button>
        </div>
    </div>

    <script src="js/juego.js"></script>
</body>
</html>