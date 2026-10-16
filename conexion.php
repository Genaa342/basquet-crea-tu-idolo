<?php
// Datos de conexión — ajustá el nombre de la base si es distinto
$host = "localhost";
$usuario = "root";
$contrasena = "";
$base_datos = "basquet_crea_tu_idolo"; // cambiá esto por el nombre real de tu base

$conexion = new mysqli($host, $usuario, $contrasena, $base_datos);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$conexion->set_charset("utf8mb4");
?>
