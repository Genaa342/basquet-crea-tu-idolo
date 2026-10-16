<?php
require 'conexion.php';

$nombre = "Jugador";

$stmt = $pdo->query(
    "SELECT id, nombre, abreviatura, conferencia, color_primario, color_secundario
     FROM equipos
     ORDER BY conferencia, nombre"
);
$equipos = $stmt->fetchAll();
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
</head>
<body>
    <main class="contenedor inicio">
        <div class="inicio-logo">🏀</div>

        <h1>Desafío de Reflejos</h1>
        <p class="inicio-subtitulo">¡Bienvenido, <strong><?php echo htmlspecialchars($nombre); ?></strong>!</p>

        <p class="inicio-texto">
            Poné a prueba tus reflejos en la cancha. Hacé clic en la pelota lo más
            rápido posible, sumá aciertos y cuidá tus vidas antes de que se acabe
            el tiempo.
        </p>

        <ul class="inicio-lista">
            <li>⏱️ 30 segundos por partida</li>
            <li>🎯 Sumá aciertos y bajá tu tiempo de reacción</li>
            <li>❤️ 3 vidas, no falles el rebote</li>
        </ul>

        <form action="index.php" method="get" class="form-equipo">
            <label for="equipo">Elegí tu equipo</label>
            <select name="equipo" id="equipo" onchange="previsualizar(this)">
                <?php foreach ($equipos as $eq): ?>
                    <option
                        value="<?php echo (int) $eq['id']; ?>"
                        data-primario="<?php echo htmlspecialchars($eq['color_primario']); ?>"
                        data-secundario="<?php echo htmlspecialchars($eq['color_secundario']); ?>"
                    >
                        <?php echo htmlspecialchars($eq['nombre']); ?> (<?php echo htmlspecialchars($eq['abreviatura']); ?>)
                    </option>
                <?php endforeach; ?>
            </select>

            <div id="previaEquipo" class="previa-equipo"></div>

            <button type="submit" class="boton-jugar">Jugar</button>
        </form>
    </main>

    <script>
        function previsualizar(select) {
            const opcion = select.options[select.selectedIndex];
            const primario = opcion.dataset.primario;
            const secundario = opcion.dataset.secundario;

            document.documentElement.style.setProperty('--color-primario', primario);
            document.documentElement.style.setProperty('--color-secundario', secundario);

            const previa = document.getElementById('previaEquipo');
            previa.style.background = `linear-gradient(90deg, ${primario} 50%, ${secundario} 50%)`;
        }

        window.addEventListener('DOMContentLoaded', () => {
            previsualizar(document.getElementById('equipo'));
        });
    </script>
</body>
</html>