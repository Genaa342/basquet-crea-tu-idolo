CREATE TABLE IF NOT EXISTS jugadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    posicion VARCHAR(2) NOT NULL,      -- PG, SG, SF, PF, C
    velocidad INT NOT NULL,
    tiro INT NOT NULL,
    rebote INT NOT NULL,
    pase INT NOT NULL,
    defensa INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
