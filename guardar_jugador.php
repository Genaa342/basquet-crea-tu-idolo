<?php
require_once "conexion.php";

// Stats base según posición
$stats_por_posicion = [
    "PG" => ["velocidad" => 80, "tiro" => 65, "rebote" => 40, "pase" => 85, "defensa" => 60],
    "SG" => ["velocidad" => 75, "tiro" => 85, "rebote" => 45, "pase" => 60, "defensa" => 55],
    "SF" => ["velocidad" => 70, "tiro" => 70, "rebote" => 60, "pase" => 55, "defensa" => 65],
    "PF" => ["velocidad" => 55, "tiro" => 55, "rebote" => 80, "pase" => 45, "defensa" => 70],
    "C"  => ["velocidad" => 45, "tiro" => 45, "rebote" => 90, "pase" => 35, "defensa" => 80],
];

$error = "";
$exito = false;

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nombre = trim($_POST["nombre"] ?? "");
    $posicion = $_POST["posicion"] ?? "";

    if ($nombre === "" || !isset($stats_por_posicion[$posicion])) {
        $error = "Completá el nombre y elegí una posición válida.";
    } else {
        $stats = $stats_por_posicion[$posicion];

        $stmt = $conexion->prepare(
            "INSERT INTO jugadores (nombre, posicion, velocidad, tiro, rebote, pase, defensa)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param(
            "ssiiiii",
            $nombre,
            $posicion,
            $stats["velocidad"],
            $stats["tiro"],
            $stats["rebote"],
            $stats["pase"],
            $stats["defensa"]
        );

        if ($stmt->execute()) {
            $exito = true;
            $jugador = [
                "nombre" => $nombre,
                "posicion" => $posicion,
                "stats" => $stats
            ];
        } else {
            $error = "Hubo un error al guardar el jugador.";
        }

        $stmt->close();
    }
} else {
    // Si alguien entra directo sin enviar el formulario, lo mandamos de vuelta
    header("Location: crear_jugador.html");
    exit;
}

$conexion->close();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>THE ROOKIE | Jugador Creado</title>

    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="jugador.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com/" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
</head>
<body>

    <!-- FONDO -->
    <div class="background"></div>

    <!-- NAVBAR -->
    <header class="navbar">
        <div class="logo">
            <span>THE</span>
            <strong>ROOKIE</strong>
        </div>

        <nav>
            <a href="página_principal.html#inicio">INICIO</a>
            <a href="página_principal.html#carrera">CARRERA</a>
            <a href="página_principal.html#ranking">RANKING</a>
            <a href="página_principal.html#como-jugar">COMO JUGAR</a>
        </nav>

        <div class="user">
            <div class="user-icon">🏀</div>
            <span>INVITADO</span>
        </div>
    </header>

    <main>
        <section class="player-section">

            <div class="player-image">
                <div class="silhouette">🏀</div>
            </div>

            <div class="player-info">

                <?php if ($exito): ?>

                    <p class="small-title">JUGADOR CREADO</p>
                    <h2>BIENVENIDO,<br><span><?= htmlspecialchars($jugador["nombre"]) ?></span></h2>
                    <p>Posición: <?= htmlspecialchars($jugador["posicion"]) ?></p>

                    <div class="stats-container result-stats">
                        <?php foreach ($jugador["stats"] as $nombre_stat => $valor): ?>
                            <div>
                                <div class="stat-header">
                                    <span><?= strtoupper($nombre_stat) ?></span>
                                    <strong><?= $valor ?></strong>
                                </div>
                                <div class="bar">
                                    <div style="width: <?= $valor ?>%;"></div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="buttons">
                        <a href="página_principal.html" class="btn primary">IR AL INICIO</a>
                    </div>

                <?php else: ?>

                    <p class="small-title">ERROR</p>
                    <h2>ALGO<br><span>FALLÓ</span></h2>
                    <p class="form-error"><?= htmlspecialchars($error) ?></p>

                    <div class="buttons">
                        <a href="crear_jugador.html" class="btn primary">VOLVER A INTENTAR</a>
                    </div>

                <?php endif; ?>

            </div>

        </section>
    </main>

</body>
</html>
