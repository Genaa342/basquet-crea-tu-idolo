(function () {
    document.documentElement.classList.add("mini-fit");
    var meta = document.querySelector('meta[name="viewport"]');
    if (meta) meta.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");

    var enCurso = false;

    window.rookieSumar = function (juego, gano, extra) {
        localStorage.setItem("rookie-recompensa", JSON.stringify({
            id: juego + "-" + Date.now(),
            juego: juego,
            gano: !!gano,
            extra: extra || null
        }));
    };

    window.rookieMarcar = function (activo) {
        enCurso = !!activo;
    };

    function modoPartido() {
        return new URLSearchParams(location.search).get("modo") === "partido";
    }

    function destino() {
        return (location.pathname.indexOf("/reflejos/") !== -1 ? "../" : "") + "jugar.php";
    }

    function irAlLobby() {
        enCurso = false;
        location.href = destino();
    }

    function preguntar() {
        var capa = document.querySelector(".mini-salir");
        if (!capa) return;
        var partido = modoPartido();
        capa.querySelector("p").textContent = partido
            ? "¿Abandonás el partido?"
            : "¿Abandonás el entrenamiento?";
        capa.querySelector(".no").textContent = partido
            ? "No, seguir jugando"
            : "No, seguir entrenando";
        capa.hidden = false;
    }

    function ponerSalir() {
        if (!document.body || document.querySelector(".mini-volver")) return;
        var salir = document.createElement("button");
        salir.type = "button";
        salir.className = "mini-volver";
        salir.textContent = "SALIR";
        salir.addEventListener("click", function () {
            if (enCurso) preguntar();
            else irAlLobby();
        });

        var capa = document.createElement("div");
        capa.className = "mini-salir";
        capa.hidden = true;
        capa.innerHTML = '<div class="mini-salir-panel" role="dialog" aria-modal="true">'
            + '<p>¿Abandonás el entrenamiento?</p>'
            + '<button type="button" class="si">Sí</button>'
            + '<button type="button" class="no">No, seguir entrenando</button>'
            + '</div>';
        capa.querySelector(".si").addEventListener("click", irAlLobby);
        capa.querySelector(".no").addEventListener("click", function () {
            capa.hidden = true;
        });
        capa.addEventListener("click", function (evento) {
            if (evento.target === capa) capa.hidden = true;
        });

        document.body.prepend(salir);
        document.body.appendChild(capa);
        ponerFlecha();
    }

    function ponerFlecha() {
        var vieja = document.querySelector(".flecha-baja");
        if (vieja) vieja.remove();
        var candidatos = [
            document.querySelector("#start-screen"),
            document.querySelector(".overlay .panel"),
            document.querySelector(".game-wrapper"),
            document.querySelector(".game-container"),
            document.querySelector(".contenedor")
        ];
        var nodo = null;
        for (var i = 0; i < candidatos.length; i++) {
            var item = candidatos[i];
            if (!item) continue;
            var estilo = getComputedStyle(item);
            var puede = estilo.overflowY === "auto" || estilo.overflowY === "scroll" || estilo.overflowY === "overlay";
            if (puede && item.scrollHeight > item.clientHeight + 16) {
                nodo = item;
                break;
            }
        }
        if (!nodo) return;
        var flecha = document.createElement("i");
        flecha.className = "flecha-baja";
        flecha.setAttribute("aria-hidden", "true");
        flecha.innerHTML = '<svg viewBox="0 0 7 4" width="28" height="16"><rect x="0" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="1" y="1" width="1" height="1"/><rect x="5" y="1" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/></svg>';
        document.body.appendChild(flecha);
        var mover = function () {
            var sobra = nodo.scrollHeight - nodo.clientHeight - nodo.scrollTop;
            var caja = nodo.getBoundingClientRect();
            flecha.hidden = sobra <= 16;
            flecha.style.left = Math.round(caja.left + caja.width / 2 - 14) + "px";
            flecha.style.top = Math.round(caja.bottom - 26) + "px";
        };
        nodo.addEventListener("scroll", mover, { passive: true });
        window.addEventListener("resize", mover);
        mover();
    }

    if (document.body) ponerSalir();
    else document.addEventListener("DOMContentLoaded", ponerSalir);
})();
