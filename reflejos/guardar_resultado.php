<?php
// Este archivo queda preparado para conectar el juego con MySQL.
// Por ahora recibe los datos y devuelve una respuesta simple.

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $aciertos = intval($_POST["aciertos"] ?? 0);
    $promedio = intval($_POST["promedio"] ?? 0);

    echo "Resultado recibido: $aciertos aciertos, $promedio ms.";
} else {
    echo "Esperando un resultado.";
}
