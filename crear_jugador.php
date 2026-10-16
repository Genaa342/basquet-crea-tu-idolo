<?php
require_once "conexion.php";

$error = "";
$exito = false;

// Stats base según posición
$stats_por_posicion = [
    "PG" => ["velocidad" => 80, "tiro" => 65, "rebote" => 40, "pase" => 85, "defensa" => 60],
    "SG" => ["velocidad" => 75, "tiro" => 85, "rebote" => 45, "pase" => 60, "defensa" => 55],
    "SF" => ["velocidad" => 70, "tiro" => 70, "rebote" => 60, "pase" => 55, "defensa" => 65],
    "PF" => ["velocidad" => 55, "tiro" => 55, "rebote" => 80, "pase" => 45, "defensa" => 70],
    "C"  => ["velocidad" => 45, "tiro" => 45, "rebote" => 90, "pase" => 35, "defensa" => 80],
];

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
            $jugador_creado = [
                "nombre" => $nombre,
                "posicion" => $posicion,
                "stats" => $stats
            ];
        } else {
            $error = "Hubo un error al guardar el jugador.";
        }

        $stmt->close();
    }
}

$conexion->close();
?>
<?php header("Location: jugar.php"); exit; ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>THE ROOKIE | Crear Jugador</title>

    <link rel="stylesheet" href="style.css">

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
            <a href="pagina_principal.html#inicio">INICIO</a>
            <a href="pagina_principal.html#carrera">CARRERA</a>
            <a href="pagina_principal.html#ranking">RANKING</a>
            <a href="pagina_principal.html#como-jugar">COMO JUGAR</a>
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

                    <h2>¡BIENVENIDO,<br><span><?= htmlspecialchars($jugador_creado["nombre"]) ?></span>!</h2>
                    <p>Posición: <?= htmlspecialchars($jugador_creado["posicion"]) ?></p>

                    <div class="stats-container" style="margin-top: 20px;">
                        <?php foreach ($jugador_creado["stats"] as $nombre_stat => $valor): ?>
                            <div>
                                <div class="stat-header">
                                    <span><?= ucfirst($nombre_stat) ?></span>
                                    <strong><?= $valor ?></strong>
                                </div>
                                <div class="bar">
                                    <div style="width: <?= $valor ?>%;"></div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>

                    <div class="buttons">
                        <a href="pagina_principal.html" class="btn primary">IR AL INICIO</a>
                    </div>

                <?php else: ?>

                    <h2>CREÁ TU<br><span>JUGADOR</span></h2>
                    <p>Elegí tu nombre y tu posición. Tus estadísticas iniciales van a depender de la posición que elijas.</p>

                    <?php if ($error): ?>
                        <p style="color:#ff5555; margin-bottom: 15px;"><?= htmlspecialchars($error) ?></p>
                    <?php endif; ?>

                    <form method="POST" action="">

                        <label for="nombre" style="font-size: 11px; color:#aaa;">NOMBRE</label><br>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            maxlength="50"
                            required
                            style="width:100%; padding:12px; margin:8px 0 20px; background:#14161d; border:1px solid #272a33; color:white; font-family:'Inter', sans-serif;"
                        >

                        <p style="font-size: 11px; color:#aaa; margin-bottom: 10px;">POSICIÓN</p>

                        <div class="positions">
                            <label class="position">
                                <input type="radio" name="posicion" value="PG" required style="display:none;">
                                <strong>PG</strong>
                                <span>BASE</span>
                            </label>
                            <label class="position">
                                <input type="radio" name="posicion" value="SG" style="display:none;">
                                <strong>SG</strong>
                                <span>ESCOLTA</span>
                            </label>
                            <label class="position">
                                <input type="radio" name="posicion" value="SF" style="display:none;">
                                <strong>SF</strong>
                                <span>ALERO</span>
                            </label>
                            <label class="position">
                                <input type="radio" name="posicion" value="PF" style="display:none;">
                                <strong>PF</strong>
                                <span>ALA-PIVOT</span>
                            </label>
                            <label class="position">
                                <input type="radio" name="posicion" value="C" style="display:none;">
                                <strong>C</strong>
                                <span>PIVOT</span>
                            </label>
                        </div>

                        <div class="buttons">
                            <button type="submit" class="btn primary">CREAR JUGADOR</button>
                        </div>

                    </form>

                <?php endif; ?>

            </div>

        </section>
    </main>

</body>
</html>
