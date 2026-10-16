(function () {
    document.documentElement.classList.add("mini-fit");

    window.rookieSumar = function (juego, gano, extra) {
        localStorage.setItem("rookie-recompensa", JSON.stringify({
            id: juego + "-" + Date.now(),
            juego: juego,
            gano: !!gano,
            extra: extra || null
        }));
    };

    var volver = document.createElement("a");
    volver.className = "mini-volver";
    volver.href = (location.pathname.indexOf("/reflejos/") !== -1 ? "../" : "") + "jugar.php";
    volver.textContent = "VOLVER";
    document.body.prepend(volver);
})();
