const cancha = document.getElementById("cancha");
const objetivo = document.getElementById("objetivo");
const comenzar = document.getElementById("comenzar");

const tiempoTexto = document.getElementById("tiempo");
const aciertosTexto = document.getElementById("aciertos");
const promedioTexto = document.getElementById("promedio");
const vidasTexto = document.getElementById("vidas");
const mensaje = document.getElementById("mensaje");
const resultado = document.getElementById("resultado");

const modalDerrota = document.getElementById("modalDerrota");
const modalStats = document.getElementById("modalStats");
const cerrarModal = document.getElementById("cerrarModal");

let jugando = false;
let tiempo = 30;
let aciertos = 0;
let vidas = 3;
let tiemposReaccion = [];
let momentoObjetivo = 0;
let intervalo;

function moverObjetivo() {
    const margen = 45;

    const x = margen + Math.random() * (cancha.clientWidth - margen * 2);
    const y = margen + Math.random() * (cancha.clientHeight - margen * 2);

    objetivo.style.left = x + "px";
    objetivo.style.top = y + "px";
    objetivo.style.display = "block";

    momentoObjetivo = performance.now();
}

function comenzarJuego() {
    jugando = true;
    tiempo = 30;
    aciertos = 0;
    vidas = 3;
    tiemposReaccion = [];

    tiempoTexto.textContent = tiempo;
    aciertosTexto.textContent = aciertos;
    promedioTexto.textContent = "-";
    vidasTexto.textContent = vidas;
    resultado.textContent = "";
    mensaje.textContent = "¡Rápido! Hacé clic en la pelota.";

    comenzar.disabled = true;
    comenzar.textContent = "Jugando...";

    moverObjetivo();

    intervalo = setInterval(() => {
        tiempo--;
        tiempoTexto.textContent = tiempo;

        if (tiempo <= 0) {
            terminarJuego(false);
        }
    }, 1000);
}

function acertar(e) {
    e.stopPropagation();
    if (!jugando) return;

    const reaccion = performance.now() - momentoObjetivo;
    tiemposReaccion.push(reaccion);
    aciertos++;

    aciertosTexto.textContent = aciertos;

    const promedio = tiemposReaccion.reduce((a, b) => a + b, 0)
        / tiemposReaccion.length;

    promedioTexto.textContent = Math.round(promedio) + " ms";

    moverObjetivo();
}

function fallar() {
    if (!jugando) return;

    vidas--;
    vidasTexto.textContent = vidas;
    mensaje.textContent = "¡Fallaste! Te quedan " + vidas + " vidas.";

    if (vidas <= 0) {
        terminarJuego(true);
    }
}

function terminarJuego(perdiste) {
    if (window.rookieSumar) rookieSumar("reflejos", !perdiste, { aciertos: aciertos });
    jugando = false;
    clearInterval(intervalo);
    objetivo.style.display = "none";

    comenzar.disabled = false;
    comenzar.textContent = "Jugar de nuevo";

    if (perdiste) {
        mensaje.textContent = "💀 ¡Perdiste! Te quedaste sin vidas.";
    } else {
        mensaje.textContent = "¡Partida terminada!";
    }

    if (tiemposReaccion.length > 0) {
        const promedio = tiemposReaccion.reduce((a, b) => a + b, 0)
            / tiemposReaccion.length;

        resultado.textContent =
            `🏁 ${aciertos} aciertos · ${Math.round(promedio)} ms de reacción promedio`;
    } else {
        resultado.textContent = "No conseguiste ningún acierto.";
    }
}

objetivo.addEventListener("click", acertar);
cancha.addEventListener("click", fallar);
comenzar.addEventListener("click", comenzarJuego);