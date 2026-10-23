/* Modo carrera. Usa el jugador de THE ROOKIE y los clubes de la base. */
const STATS_CARRERA = [
    ["velocidad", "velocidad", "Velocidad"],
    ["tiro", "tiro", "Tiro"],
    ["rebote", "fuerza", "Fuerza"],
    ["pase", "control", "Control"],
    ["defensa", "defensa", "Defensa"]
];

const ENTRENO_CARRERA = {
    tiro: { titulo: "Tiro al aro", detalle: "20 puntos suben el tiro", juego: "tiro" },
    pase: { titulo: "Pase relámpago", detalle: "8 pases suben el control", juego: "pase" },
    dribling: { titulo: "Dribling", detalle: "200 puntos suben la velocidad", juego: "dribling" },
    memoria: { titulo: "Memoria", detalle: "Sube el tiro del partido", juego: "memoria" },
    simon: { titulo: "Simón", detalle: "Sube el control del pase", juego: "simon" },
    defensa: { titulo: "Defensa", detalle: "Tapá el aro", juego: "defensa" },
    reflejos: { titulo: "Reflejos", detalle: "Reacción en la cancha", juego: "reflejos" }
};

const TWEETS_CARRERA = {
    bien: [
        { u: "EL ELEGIDO", h: "@ElElegido23", t: "Metió una buena. Cuando quiera, lo vemos en serio." },
        { u: "VOZ NBA", h: "@VozNBA", t: "El pibe tiene algo. En playoffs se ven los hombres." },
        { u: "HINCHA DEL BARRIO", h: "@HinchaDelBarrio", t: "Es nuestro. Del barrio a la liga grande." }
    ],
    mal: [
        { u: "EL ELEGIDO", h: "@ElElegido23", t: "¿Ese es el futuro? A su edad yo ya era titular." },
        { u: "VOZ NBA", h: "@VozNBA", t: "Noche para el olvido. Hoy fue un cono." },
        { u: "HINCHA DEL BARRIO", h: "@HinchaDelBarrio", t: "El próximo la mete. El barrio no abandona." }
    ],
    neutro: [
        { u: "EL ELEGIDO", h: "@ElElegido23", t: "Partido correcto. Correcto no gana anillos." },
        { u: "VOZ NBA", h: "@VozNBA", t: "Ni fu ni fa. La regularidad hace al ídolo." },
        { u: "HINCHA DEL BARRIO", h: "@HinchaDelBarrio", t: "Partido parejo. Seguimos sumando." }
    ]
};

let sorteoTimer = null;

function asegurarCarrera() {
    if (!state.carrera || typeof state.carrera !== "object") {
        state.carrera = {
            paso: "portada",
            momento: 0,
            xp: 40,
            forma: 70,
            usados: [],
            jugados: [],
            espera: null,
            resultado: null,
            evento: null,
            localHecha: false,
            draftListo: false,
            historial: []
        };
    }
    const c = state.carrera;
    c.usados = c.usados || [];
    c.jugados = c.jugados || [];
    c.historial = c.historial || [];
    c.rivalesSerie = c.rivalesSerie || {};
    c.xp = Number(c.xp) || 0;
    c.forma = c.forma == null ? 70 : Number(c.forma);
    c.momento = c.momento || 0;
    c.paso = c.paso || "portada";
    if (!state.rival) state.rival = { nombre: "EL ELEGIDO", puntos: 18, titulos: 0 };
    if (!state.stats && state.posicion && typeof BASES !== "undefined") {
        state.stats = Object.assign({}, BASES[state.posicion]);
    }
    return c;
}

function campoStat(clave) {
    const fila = STATS_CARRERA.find((item) => item[0] === clave);
    return fila ? fila[1] : clave;
}

function nombreStat(clave) {
    const fila = STATS_CARRERA.find((item) => item[0] === clave);
    return fila ? fila[2] : clave;
}

function valorStat(clave) {
    if (!state.stats) return 50;
    return Number(state.stats[campoStat(clave)]) || 50;
}

function grlCarrera() {
    if (!state.stats) return 46;
    const s = state.stats;
    return Math.round(((Number(s.velocidad) || 0) + (Number(s.tiro) || 0) + (Number(s.fuerza) || 0) + (Number(s.control) || 0) + (Number(s.defensa) || 0)) / 5);
}

function reflejarCalibre() {
    const media = grlCarrera();
    const actual = Number(state.calibre) || 46;
    const techo = state.tipo === "profesional" || typeof techoCalibre !== "function" ? 99 : techoCalibre(state.edad);
    if (actual >= techo) return;
    state.calibre = Math.min(techo, Math.max(actual, media));
}

function clubesLiga(liga) {
    return (equipos || []).filter((eq) => eq.liga === liga);
}

function clubesSorteo() {
    const liga = clubesLiga("LNB");
    const techo = (Number(state.calibre) || 46) + 8;
    const cerca = liga.filter((eq) => Number(eq.minima) <= techo);
    if (cerca.length) return cerca;
    return liga.slice().sort((a, b) => Number(a.minima) - Number(b.minima)).slice(0, 5);
}

const COSTO_XP = 5;

function probCarrera(clave) {
    const forma = Number(state.carrera.forma) || 70;
    const hincha = Number(state.hinchada) || 50;
    const base = 8 + valorStat(clave) * 0.82 + (forma - 50) * 0.08 + (hincha - 50) * 0.04;
    return clamp(Math.round(base), 8, 96);
}

function tweetsCarrera(tipo) {
    const pool = TWEETS_CARRERA[tipo] || TWEETS_CARRERA.neutro;
    const otro = pool[1 + Math.floor(Math.random() * (pool.length - 1))];
    return [pool[0], otro];
}

function elegirEvento(pool, prefijo) {
    const c = state.carrera;
    const libres = pool.map((_, i) => i).filter((i) => !c.usados.includes(prefijo + i));
    const lista = libres.length ? libres : pool.map((_, i) => i);
    const idx = lista[Math.floor(Math.random() * lista.length)];
    c.usados.push(prefijo + idx);
    return pool[idx];
}

function debuts() {
    return [
        { t: "LLEGADA AL CLUB", d: "Primer día. El vestuario te mide de arriba abajo.", op: [
            { t: "Romperla en la práctica", fx: () => { state.carrera.xp += 8; state.carrera.forma = clamp(state.carrera.forma - 5, 0, 100); return { det: "+8 XP. El DT anotó tu nombre.", out: "bien" }; } },
            { t: "Perfil bajo", fx: () => { sumarHinchada(6); state.carrera.xp += 4; return { det: "+6 hinchada, +4 XP.", out: "neutro" }; } }
        ] },
        { t: "DEBUT", d: "Primer partido oficial. La cancha del barrio está llena.", op: [
            { t: "Jugar para la hinchada", fx: () => { sumarHinchada(12); state.puntosCarrera += 20; state.carrera.xp += 8; return { det: "+20 pts, +8 XP. Corearon tu nombre.", out: "bien" }; } },
            { t: "Cuidarte", fx: () => { state.puntosCarrera += 10; state.carrera.xp += 6; return { det: "+10 pts, +6 XP. Partido correcto.", out: "neutro" }; } }
        ] },
        { t: "CLÁSICO LOCAL", d: "Se juega con los dientes apretados. Varias posesiones, y en cada una decidís vos.", partido: true },
        { t: "SEMANA LARGA", d: "Tres partidos en siete días. El cuerpo avisa.", op: [
            { t: "Gym de tiro", fx: () => { const sube = subirCampo("tiro", 1); state.carrera.forma = clamp(state.carrera.forma - 8, 0, 100); return { det: sube ? "Tiro +" + sube + ". Las piernas pesan." : "El cuerpo no da más este año. Las piernas pesan.", out: "neutro" }; } },
            { t: "Descansar", fx: () => { state.carrera.forma = clamp(state.carrera.forma + 14, 0, 100); return { det: "Llegás fresco.", out: "neutro" }; } }
        ] },
        { t: "CIERRE DEL AÑO", d: "Último partido antes del draft. Hay scouts en la tribuna.", partido: true }
    ];
}

function personales() {
    return [
        { t: "DÍA LIBRE", d: "Mañana hay partido. El cuerpo pide una cosa y la cabeza otra.", op: [
            { t: "Gym extra de tiro", fx: () => { const sube = subirCampo("tiro", 1); state.carrera.forma = clamp(state.carrera.forma - 8, 0, 100); return { det: sube ? "Tiro +" + sube + ". Las piernas pesan." : "El cuerpo no da más este año. Las piernas pesan.", out: "neutro" }; } },
            { t: "Descansar", fx: () => { state.carrera.forma = clamp(state.carrera.forma + 14, 0, 100); sumarHinchada(3); return { det: "Forma arriba. La gente banca.", out: "neutro" }; } }
        ] },
        { t: "NOCHE DE CLÁSICO", d: "El Elegido dijo que tu equipo no existe.", op: [
            { t: "Estudiar video", fx: () => { state.carrera.xp += 8; state.carrera.forma = clamp(state.carrera.forma - 5, 0, 100); return { det: "+8 XP. Le encontraste la maña.", out: "neutro" }; } },
            { t: "Dormir", fx: () => { state.carrera.forma = clamp(state.carrera.forma + 10, 0, 100); return { det: "Fresco para el salto inicial.", out: "neutro" }; } }
        ] },
        { t: "PEDIDO DEL DT", d: "Quiere que labures el físico esta semana.", op: [
            { t: "Meterle a la fuerza", fx: () => { const sube = subirCampo("rebote", 1); state.carrera.forma = clamp(state.carrera.forma - 6, 0, 100); return { det: sube ? "Fuerza +" + sube + "." : "El cuerpo no da más este año.", out: "neutro" }; } },
            { t: "Guardarte", fx: () => { state.carrera.forma = clamp(state.carrera.forma + 8, 0, 100); return { det: "Llegás entero al partido.", out: "neutro" }; } }
        ] },
        { t: "MICRÓFONO", d: "Te entrevistan a la salida. Todo el país mira.", op: [
            { t: "Hablar como ídolo", fx: () => { sumarHinchada(10); state.rival.puntos += 4; return { det: "+10 hinchada. El Elegido tomó nota.", out: "bien" }; } },
            { t: "Perfil bajo", fx: () => { state.carrera.forma = clamp(state.carrera.forma + 6, 0, 100); state.carrera.xp += 4; return { det: "+4 XP. Sin titulares.", out: "neutro" }; } }
        ] },
        { t: "LA RODILLA", d: "Molestia. El médico no se decide.", op: [
            { t: "Jugar igual", fx: () => { state.carrera.forma = clamp(state.carrera.forma - 12, 0, 100); state.carrera.xp += 8; sumarHinchada(5); return { det: "+8 XP. El dolor pasa, la historia queda.", out: "bien" }; } },
            { t: "Parar una semana", fx: () => { state.carrera.forma = clamp(state.carrera.forma + 18, 0, 100); sumarHinchada(-4); return { det: "Te recuperás. Algunos dudan.", out: "mal" }; } }
        ] },
        { t: "PIBES EN LA PUERTA", d: "Te esperan para una foto a la salida.", op: [
            { t: "Quedarte con todos", fx: () => { sumarHinchada(10); state.carrera.xp += 2; return { det: "+10 hinchada. Ídolo del barrio.", out: "bien" }; } },
            { t: "Irte rápido", fx: () => { sumarHinchada(-6); state.carrera.forma = clamp(state.carrera.forma + 6, 0, 100); return { det: "Descansaste. La prensa no perdona.", out: "mal" }; } }
        ] }
    ];
}

const SITUACIONES_CARRERA = {
    ataque: [
        { t: "ABAJO POR UNO", d: "Quedan 8 segundos y la pelota es tuya." },
        { t: "DOBLE MARCA", d: "Dos defensores encima en el perímetro." },
        { t: "PICK AND ROLL", d: "La cortina es perfecta. La defensa duda." },
        { t: "TRANSICIÓN", d: "Salís con la pelota hacia el aro rival." },
        { t: "POSTE BAJO", d: "Te la dan de espaldas, con el cuerpo pegado." },
        { t: "ÚLTIMA BOLEADA", d: "El partido se define en esta posesión." },
        { t: "MANO CALIENTE", d: "Metiste los últimos tres. El estadio pide otra." },
        { t: "ZONA RIVAL", d: "Nadie encuentra el hueco. Alguien tiene que crearlo." }
    ],
    defensa: [
        { t: "PARCIAL EN CONTRA", d: "Van 8 a 0. Hay que frenarlo atrás." },
        { t: "PELOTA BOYANDO", d: "El tiro no entra. El tablero es de quien salte." },
        { t: "CERRAR EL PARTIDO", d: "Arriba por tres. Faltan dos minutos." },
        { t: "UNO CONTRA UNO", d: "Tu marca baja la cabeza y va al aro." },
        { t: "LÍNEA DE PASE", d: "El base busca al tirador abierto." },
        { t: "BOMBA RIVAL", d: "Te salen a un triple. Hay que contestar." }
    ]
};

function unaDe(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

function mezclarCarrera(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = copia[i];
        copia[i] = copia[j];
        copia[j] = tmp;
    }
    return copia;
}

function armarOpciones(lado) {
    if (lado === "ataque") {
        const cuarto = Math.random() < 0.5
            ? unaDe([{ t: "Pelear el rebote", stat: "rebote" }, { t: "Cargar el tablero", stat: "rebote" }])
            : unaDe([{ t: "Aguantar el contacto", stat: "defensa" }, { t: "Proteger la pelota", stat: "defensa" }]);
        return mezclarCarrera([
            unaDe([{ t: "Tirar", stat: "tiro" }, { t: "Tirar de tres", stat: "tiro" }, { t: "Floater", stat: "tiro" }]),
            unaDe([{ t: "Pasar", stat: "pase" }, { t: "Doblar el pase", stat: "pase" }, { t: "Buscar al compañero", stat: "pase" }]),
            unaDe([{ t: "Tratar de penetrar", stat: "velocidad" }, { t: "Ir al aro", stat: "velocidad" }, { t: "Romper la marca", stat: "velocidad" }]),
            cuarto
        ]);
    }
    const cuarto = Math.random() < 0.5
        ? unaDe([{ t: "Contestar el tiro", stat: "tiro" }, { t: "Salir a la bomba", stat: "tiro" }])
        : unaDe([{ t: "Negar el pase", stat: "pase" }, { t: "Leer el pase", stat: "pase" }]);
    return mezclarCarrera([
        unaDe([{ t: "Defender", stat: "defensa" }, { t: "Cerrar la marca", stat: "defensa" }]),
        unaDe([{ t: "Tomar el rebote", stat: "rebote" }, { t: "Cerrar el tablero", stat: "rebote" }]),
        unaDe([{ t: "Robar en velocidad", stat: "velocidad" }, { t: "Presión alta", stat: "velocidad" }]),
        cuarto
    ]);
}

const PISO_MARCADOR = 50;
const PUNTOS_JUGADA = 15;

function firmaPartido() {
    const c = state.carrera;
    return (c.paso || "") + ":" + (c.momento || 0) + ":" + (state.temporada || 1);
}

function tramoRival() {
    const c = state.carrera || {};
    if (c.paso === "debut") return "debut";
    return "temp-" + (state.temporada || 1);
}

function esAperturaPartido() {
    const c = state.carrera || {};
    return (c.paso === "debut" && Number(c.momento) === 2) || (c.paso === "temporada" && Number(c.momento) === 1);
}

function esCierrePartido() {
    const c = state.carrera || {};
    return (c.paso === "debut" && Number(c.momento) === 4) || (c.paso === "temporada" && Number(c.momento) === 4);
}

function rondaTemporada() {
    const c = state.carrera || {};
    const momento = Number(c.momento) || 0;
    if (c.paso !== "temporada" || momento < 1 || momento > 4) return 0;
    return momento;
}

function nombreRonda(momento) {
    return ["", "PRIMERA RONDA", "SEMIFINALES", "FINAL DE CONFERENCIA", "FINALES DEL MUNDO"][Number(momento)] || "";
}

function anotarRivalApertura(id) {
    if (!esAperturaPartido() || !id) return;
    const c = asegurarCarrera();
    c.rivalesApertura = c.rivalesApertura || {};
    c.rivalesApertura[tramoRival()] = Number(id);
}

function serieRivales() {
    const c = asegurarCarrera();
    c.rivalesSerie = c.rivalesSerie || {};
    const clave = tramoRival();
    if (!c.rivalesSerie[clave]) c.rivalesSerie[clave] = [];
    return c.rivalesSerie[clave];
}

function anotarRivalSerie(id) {
    if (!rondaTemporada() || !id) return;
    const lista = serieRivales();
    const n = Number(id);
    if (lista.indexOf(n) === -1) lista.push(n);
}

function candidatosRonda(liga, mio, ronda, usados) {
    const misma = liga.filter((eq) => String(eq.conferencia) === String(mio.conferencia));
    const contraria = liga.filter((eq) => String(eq.conferencia) !== String(mio.conferencia));
    const base = ronda < 4 ? misma : contraria;
    const frescos = base.filter((eq) => usados.indexOf(Number(eq.id)) === -1);
    if (frescos.length) return frescos;
    const resto = liga.filter((eq) => usados.indexOf(Number(eq.id)) === -1);
    return resto.length ? resto : (base.length ? base : liga);
}

function rivalDelPartido() {
    const mio = typeof equipoActual === "function" ? equipoActual() : null;
    if (!mio) return null;
    const liga = (equipos || []).filter((eq) => eq.liga === mio.liga && Number(eq.id) !== Number(mio.id));
    if (!liga.length) return null;
    const c = asegurarCarrera();
    const ronda = rondaTemporada();
    if (ronda) {
        const candidatos = candidatosRonda(liga, mio, ronda, serieRivales().map(Number));
        const rival = candidatos[Math.floor(Math.random() * candidatos.length)];
        if (rival) anotarRivalSerie(rival.id);
        anotarRivalApertura(rival && rival.id);
        return rival;
    }
    c.rivalesApertura = c.rivalesApertura || {};
    const vetado = esCierrePartido() ? Number(c.rivalesApertura[tramoRival()]) : 0;
    let candidatos = liga;
    if (vetado) {
        const sinEse = liga.filter((eq) => Number(eq.id) !== vetado);
        if (sinEse.length) candidatos = sinEse;
    }
    const rival = candidatos[Math.floor(Math.random() * candidatos.length)];
    anotarRivalApertura(rival.id);
    return rival;
}

function relatoJugada(stat, gano, lado) {
    const bien = {
        tiro: ["La pelota tocó el nylon.", "El defensor llegó tarde.", "Se fue limpia."],
        pase: ["El compañero la clavó.", "Encontraste al libre.", "El pase partió la defensa."],
        velocidad: ["Lo dejaste parado.", "Llegaste al aro.", "La penetración terminó adentro."],
        rebote: ["La agarraste arriba.", "El tablero fue tuyo.", "Hubo segunda jugada."],
        defensa: ["Le robaste la pelota.", "Cerraste el tiro.", "No lo dejaste girar."]
    };
    const mal = {
        tiro: ["Se fue larga.", "El tapón llegó justo.", "El aro la escupió."],
        pase: ["El pase se fue afuera.", "El rival la leyó.", "Nadie llegó."],
        velocidad: ["Te cortaron el camino.", "El defensor no mordió la finta.", "Te quedaste en el aire."],
        rebote: ["Te la ganaron arriba.", "Llegaste tarde al tablero.", "Se fue larga y no alcanzaste."],
        defensa: ["Te pasó como si nada.", "El tiro entró igual.", "Llegaste un paso tarde."]
    };
    const pool = (gano ? bien : mal)[stat] || (lado === "defensa" ? (gano ? bien.defensa : mal.defensa) : (gano ? bien.tiro : mal.tiro));
    return pool[Math.floor(Math.random() * pool.length)];
}

function nuevaPosesion(lado) {
    const pool = SITUACIONES_CARRERA[lado];
    const sit = pool[Math.floor(Math.random() * pool.length)];
    return { t: sit.t, d: sit.d, lado: lado, opciones: armarOpciones(lado) };
}

function asegurarPartido() {
    const c = asegurarCarrera();
    const firma = firmaPartido();
    if (c.partido && c.partido.firma === firma && c.partido.posesiones && c.partido.indice < c.partido.posesiones.length) {
        if (c.partido.nuestros == null) c.partido.nuestros = PISO_MARCADOR + (c.partido.aciertos || 0) * PUNTOS_JUGADA;
        if (c.partido.ellos == null) c.partido.ellos = PISO_MARCADOR + (c.partido.fallos || 0) * PUNTOS_JUGADA;
        if ((c.partido.nuestros || 0) < PISO_MARCADOR) c.partido.nuestros = PISO_MARCADOR;
        if ((c.partido.ellos || 0) < PISO_MARCADOR) c.partido.ellos = PISO_MARCADOR;
        if (!c.partido.rivalId) {
            const rival = rivalDelPartido();
            c.partido.rivalId = rival ? Number(rival.id) : null;
        }
        anotarRivalApertura(c.partido.rivalId);
        anotarRivalSerie(c.partido.rivalId);
        return c.partido;
    }
    const final = c.paso === "temporada" && Number(c.momento) === 4;
    const rival = rivalDelPartido();
    const total = c.paso === "debut" ? 3 : (final ? 5 : 4);
    const posesiones = [];
    for (let i = 0; i < total; i++) {
        const lado = i === 0 ? "ataque" : (i === 1 ? "defensa" : (Math.random() < 0.55 ? "ataque" : "defensa"));
        posesiones.push(nuevaPosesion(lado));
    }
    c.partido = {
        firma: firma,
        posesiones: posesiones,
        indice: 0,
        aciertos: 0,
        fallos: 0,
        final: final,
        lineas: [],
        nuestros: PISO_MARCADOR,
        ellos: PISO_MARCADOR,
        eco: null,
        rivalId: rival ? Number(rival.id) : null,
        grlInicio: grlCarrera(),
        paso: c.paso,
        momento: c.momento,
        temporada: state.temporada
    };
    guardarLocal();
    return c.partido;
}

function eventoActualCarrera() {
    const c = asegurarCarrera();
    if (c.evento && c.evento.momento === c.momento && c.evento.temporada === state.temporada && c.evento.paso === c.paso) {
        return c.evento;
    }
    let evento;
    if (c.paso === "debut") {
        evento = { tipo: "debut", ev: debuts()[c.momento] || debuts()[0] };
    } else if (c.momento === 0) {
        evento = { tipo: "personal", ev: elegirEvento(personales(), "p") };
    } else {
        evento = { tipo: "partido", ev: { t: nombreRonda(c.momento) || "PARTIDO", d: "Varias posesiones. En cada una elegís.", partido: true }, final: Number(c.momento) === 4 };
    }
    evento.momento = c.momento;
    evento.temporada = state.temporada;
    evento.paso = c.paso;
    c.evento = evento;
    return evento;
}

function subirCampo(clave, cuanto) {
    if (!state.stats || typeof aplicarSubida !== "function") return 0;
    return aplicarSubida(campoStat(clave), cuanto);
}

function sumarHinchada(delta) {
    state.hinchada = clamp((Number(state.hinchada) || 0) + delta, 0, 100);
    state.quimica = state.hinchada;
}

function anotarClub(eq, detalle) {
    if (!eq) return;
    const anterior = equipoActual();
    state.trayectoria = state.trayectoria || [];
    if (anterior && state.trayectoria.length) {
        const ultima = state.trayectoria[state.trayectoria.length - 1];
        if (ultima && String(ultima.cuando || "").indexOf("ACTUAL") !== -1) {
            ultima.detalle = "(" + anterior.liga + ")";
            ultima.cuando = String(state.edad || 19);
        }
    }
    state.equipoId = Number(eq.id);
    state.conferencia = eq.conferencia || "";
    state.trayectoria.push({
        nombre: eq.nombre,
        detalle: "(" + eq.liga + ") | " + detalle,
        cuando: String(state.edad || 19) + " - ACTUALIDAD",
        logo: eq.logo || null
    });
    state.carrera.historial.push(eq.nombre);
    if (typeof elegirRival === "function" && typeof clubPorId === "function") {
        const actual = state.rivalClubId ? clubPorId(state.rivalClubId) : null;
        if (!actual || actual.liga !== eq.liga || Number(actual.id) === Number(eq.id)) {
            const rival = elegirRival();
            state.rivalClubId = rival ? Number(rival.id) : null;
        }
    }
}

function guardarPaso(paso, titulo, detalle, tipo, extra) {
    const c = state.carrera;
    c.resultado = { titulo: titulo, detalle: detalle, tweets: tweetsCarrera(tipo), pend: paso };
    if (extra) Object.assign(c.resultado, extra);
    c.paso = "resultado";
    c.evento = null;
    state.flash = "";
    reflejarCalibre();
    persistir();
}

function resolverOpcion(op, pend, final) {
    state.rival.puntos += 9;
    if (op.fx) {
        const r = op.fx();
        guardarPaso(pend, op.t, r.det, r.out);
        return;
    }
    const clave = op.st || op.stat;
    jugarMomento(clave, !!final, pend);
}

function jugarMomento(clave, final, pend) {
    const chance = probCarrera(clave);
    const gano = Math.random() * 100 < chance;
    const sube = subirCampo(clave, gano ? 1 : 0);
    const marca = sube ? nombreStat(clave) + " +" + sube : "sin subida: techo del año";
    const mult = final ? 1.5 : 1;
    state.partidos = (state.partidos || 0) + 1;
    state.partidas = (state.partidas || 0) + 1;
    state.carrera.forma = clamp(state.carrera.forma - (4 + Math.random() * 4), 0, 100);
    state.rival.puntos += Math.round(8 + Math.random() * 6);
    let detalle;
    let tipo;
    if (gano) {
        const pts = Math.round((20 + Math.random() * 10) * mult);
        const xp = Math.round((8 + Math.random() * 5) * mult);
        state.puntosCarrera += pts;
        state.carrera.xp += xp;
        state.victorias = (state.victorias || 0) + 1;
        sumarHinchada(final ? 10 : 6);
        if (final) {
            state.titulos = (state.titulos || 0) + 1;
            const eq = equipoActual();
            if (typeof sumarTrofeo === "function") {
                sumarTrofeo(eq && eq.liga === "NBA" ? "CAMPEÓN NBA" : "ANILLO DE CAMPEÓN");
            }
            detalle = "Entró. +" + pts + " pts, +" + xp + " XP. " + marca + ". Título de liga.";
        } else {
            detalle = "Entró. +" + pts + " pts, +" + xp + " XP. " + marca + ".";
        }
        tipo = "bien";
    } else {
        state.puntosCarrera += 4;
        state.carrera.xp += 3;
        sumarHinchada(-4);
        detalle = "No entró. " + marca + ". El equipo te banca.";
        tipo = "mal";
    }
    reflejarCalibre();
    guardarPaso(pend, gano ? (final ? "Campeones" : "Entró") : "No entró", "Media " + grlCarrera() + ". " + nombreStat(clave) + " · " + chance + "% · " + detalle, tipo);
}

function resolverPosesion(indice) {
    const c = asegurarCarrera();
    const p = c.partido;
    if (!p || !p.posesiones || p.eco) return;
    const pos = p.posesiones[p.indice];
    if (!pos || !pos.opciones || !pos.opciones[indice]) return;
    const op = pos.opciones[indice];
    const chance = probCarrera(op.stat);
    const gano = Math.random() * 100 < chance;
    const sube = subirCampo(op.stat, gano ? 1 : 0);
    const marca = sube ? nombreStat(op.stat) + " +" + sube : nombreStat(op.stat) + " al techo del año";
    reflejarCalibre();
    const ptsNos = gano ? PUNTOS_JUGADA : 0;
    const ptsEllos = gano ? 0 : PUNTOS_JUGADA;
    p.nuestros = (p.nuestros || 0) + ptsNos;
    p.ellos = (p.ellos || 0) + ptsEllos;
    state.puntosCarrera = (state.puntosCarrera || 0) + ptsNos;
    c.xp += gano ? 2 : 1;
    if (gano) p.aciertos += 1;
    else p.fallos += 1;
    const texto = relatoJugada(op.stat, gano, pos.lado);
    const titulo = gano ? (pos.lado === "defensa" ? "La paraste" : "Entró") : (pos.lado === "defensa" ? "Se te fue" : "No entró");
    p.lineas.push(op.t + ": " + texto + " " + marca + ".");
    p.eco = {
        ok: gano,
        titulo: titulo,
        jugada: op.t,
        texto: texto,
        stat: marca,
        chance: chance,
        puntos: ptsNos
    };
}

function sigueOvertime(p) {
    return !!p && p.indice + 1 >= p.posesiones.length && (p.nuestros || 0) === (p.ellos || 0);
}

function abrirOvertime() {
    const p = asegurarCarrera().partido;
    if (!p) return;
    p.overtimes = (Number(p.overtimes) || 0) + 1;
    p.lineas.push("Overtime " + p.overtimes + ".");
    p.posesiones.push(nuevaPosesion("ataque"));
    p.posesiones.push(nuevaPosesion("defensa"));
}

function etiquetaPartido(p) {
    if (p.overtimes && p.indice >= p.posesiones.length - 2) {
        const n = Math.min(2, p.indice - (p.posesiones.length - 2) + 1);
        return "OVERTIME " + p.overtimes + " · " + n + "/2";
    }
    return (p.indice + 1) + "/" + p.posesiones.length;
}

function seguirJugada() {
    const c = asegurarCarrera();
    const p = c.partido;
    if (!p || !p.eco) return;
    p.eco = null;
    p.indice += 1;
    if (p.indice >= p.posesiones.length) cerrarPartido();
}

function cerrarPartido() {
    const c = asegurarCarrera();
    const p = c.partido;
    if (!p) return;
    p.nuestros = Math.max(PISO_MARCADOR, Number(p.nuestros) || 0);
    p.ellos = Math.max(PISO_MARCADOR, Number(p.ellos) || 0);
    if ((p.nuestros || 0) === (p.ellos || 0)) {
        abrirOvertime();
        return;
    }
    const gano = (p.nuestros || 0) > (p.ellos || 0);
    const marcador = (p.nuestros || 0) + "-" + (p.ellos || 0);
    const delta = grlCarrera() - (Number(p.grlInicio) || grlCarrera());
    const extra = delta > 0 ? " (+" + delta + ")" : "";
    const pend = p.paso === "debut" ? (p.momento < 4 ? "debut" : "draftnba") : "avanzar";
    const eraFinal = !!p.final;
    const ot = Number(p.overtimes) || 0;
    const textoOt = ot ? " Overtime" + (ot > 1 ? "s: " + ot + "." : ".") : "";
    state.partidos = (state.partidos || 0) + 1;
    state.partidas = (state.partidas || 0) + 1;
    c.forma = clamp(c.forma - (6 + Math.random() * 6), 0, 100);
    state.rival.puntos += Math.round(6 + Math.random() * 8);
    let titulo;
    let detalle;
    let tipo;
    if (gano) {
        state.victorias = (state.victorias || 0) + 1;
        const xp = eraFinal ? 10 : 6;
        c.xp += xp;
        sumarHinchada(eraFinal ? 10 : 6);
        if (eraFinal) {
            state.titulos = (state.titulos || 0) + 1;
            const eq = equipoActual();
            if (typeof sumarTrofeo === "function") {
                sumarTrofeo(eq && eq.liga === "NBA" ? "CAMPEÓN NBA" : "ANILLO DE CAMPEÓN");
            }
        }
        titulo = eraFinal ? "Campeones" : "Ganaron";
        detalle = "Cerraron " + marcador + "." + textoOt + " Media " + grlCarrera() + extra + ". +" + xp + " XP." + (eraFinal ? " Título de liga." : "");
        tipo = "bien";
    } else {
        c.xp += 3;
        sumarHinchada(-4);
        titulo = "Derrota";
        detalle = "Cerraron " + marcador + "." + textoOt + " Media " + grlCarrera() + extra + ". La cancha igual te hizo subir.";
        tipo = "mal";
    }
    const cierre = {
        marcador: { nuestros: p.nuestros || 0, ellos: p.ellos || 0, rivalId: p.rivalId || null },
        jugadas: (p.lineas || []).slice()
    };
    c.partido = null;
    reflejarCalibre();
    guardarPaso(pend, titulo, detalle, tipo, cierre);
}

function ofertasCarrera() {
    const eq = equipoActual();
    const g = grlCarrera();
    const pool = eq && eq.liga === "NBA" ? clubesLiga("NBA") : (equipos || []);
    return pool
        .filter((club) => Number(club.id) !== Number(state.equipoId) && g >= Number(club.minima))
        .sort((a, b) => Number(b.minima) - Number(a.minima))
        .slice(0, 3);
}

function draftNBA() {
    const g = grlCarrera();
    const nba = clubesLiga("NBA");
    const aptos = nba.filter((club) => g >= Number(club.minima)).sort((a, b) => Number(b.minima) - Number(a.minima));
    if (aptos.length) return aptos.slice(0, 3);
    return nba.slice().sort((a, b) => Number(a.minima) - Number(b.minima)).slice(0, 3);
}

function siguienteTemporada() {
    const c = state.carrera;
    state.temporada = (Number(state.temporada) || 1) + 1;
    state.edad = (Number(state.edad) || 19) + 1;
    if (typeof madurar === "function") state.flash = "Temporada " + state.temporada + ". " + madurar();
    c.momento = 0;
    c.usados = [];
    c.jugados = [];
    c.espera = null;
    c.evento = null;
    c.forma = clamp(c.forma + 15, 0, 100);
    c.partido = null;
    c.ofertaEntreno = null;
    c.paso = (state.temporada > 15 || state.edad >= 38) ? "leyenda" : "temporada";
    persistir();
}

function seguirResultado() {
    const c = asegurarCarrera();
    const pend = c.resultado ? c.resultado.pend : "temporada";
    c.resultado = null;
    if (pend === "debut") {
        if (c.momento < 4) {
            c.momento += 1;
            c.paso = "debut";
        } else {
            c.localHecha = true;
            c.paso = "draftnba";
            c.momento = 0;
        }
    } else if (pend === "avanzar") {
        if (c.momento < 4) {
            c.momento += 1;
            c.paso = "temporada";
        } else {
            c.jugados = [];
            c.espera = null;
            c.paso = "offentreno";
        }
    } else if (pend === "draftnba") {
        c.localHecha = true;
        c.paso = "draftnba";
    } else if (pend === "temporada") {
        c.momento = 0;
        c.paso = "temporada";
    } else if (pend === "sigtemp") {
        siguienteTemporada();
    } else if (pend === "leyenda") {
        c.paso = "leyenda";
    }
    c.evento = null;
    persistir();
}

function leyendaCarrera() {
    const puntos = state.puntosCarrera || 0;
    const rival = state.rival ? state.rival.puntos : 0;
    const titulos = state.titulos || 0;
    const score = grlCarrera() * 10 + (state.hinchada || 0) + titulos * 40 + puntos;
    if (titulos >= 3 && puntos >= rival) {
        return ["Leyenda del aro", "Más títulos y más puntos que El Elegido (" + rival + ").", score];
    }
    if (titulos > 0) {
        return ["Campeón", "Te fuiste con " + titulos + " título(s). El Elegido cerró con " + rival + " pts.", score];
    }
    if (puntos > rival) {
        return ["Goleador", "Más puntos que El Elegido, sin el anillo.", score];
    }
    return ["Buen paso", "El Elegido cerró con " + rival + " pts. Quedaste cerca.", score];
}

function tableroCarrera(editable) {
    const c = state.carrera;
    const eq = equipoActual();
    const filas = STATS_CARRERA.map(([clave, , label]) => {
        const valor = valorStat(clave);
        const controles = editable
            ? `<div class="chips"><button class="chip" data-mc="stat" data-stat="${clave}" data-d="-1">−</button><button class="chip sel" data-mc="stat" data-stat="${clave}" data-d="1">+1 · ${COSTO_XP} XP</button></div>`
            : "";
        return `<div class="statline"><span>${label}</span><b class="num">${valor}</b></div><div class="mc-bar"><i style="width:${valor}%"></i></div>${controles}`;
    }).join("");
    return `<div class="caja">
        <div class="ficha-top">
            <div class="ovr">${state.calibre || 46}<small>CAL</small></div>
            <div>
                <div class="nombre-jugador">${esc(state.nombre || "Rookie")} · ${esc(state.dorsal || "")}</div>
                <p class="subficha">${eq ? esc(eq.nombre) + " · " + esc(eq.liga) : "Sin club"} · temp ${state.temporada || 1} · media ${grlCarrera()}</p>
            </div>
            ${eq && typeof marcaLogo === "function" ? marcaLogo(eq) : ""}
        </div>
        <div class="hud">
            <div><span>XP</span><b>${c.xp}</b></div>
            <div><span>FORMA</span><b>${Math.round(c.forma)}</b></div>
            <div><span>HINCHA</span><b>${state.hinchada}</b></div>
            <div><span>TITULOS</span><b>${state.titulos || 0}</b></div>
        </div>
        ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
        ${typeof textoCrecimiento === "function" ? `<p class="nota">${esc(textoCrecimiento())}</p>` : ""}
        ${filas}
    </div>`;
}

function marcoCarrera(paso, cuerpo, acciones) {
    return `<section class="screen">
        ${cabeza(`<button class="link" data-accion="lobby">LOBBY</button>`)}
        <div class="body">
            <p class="nota">${esc(paso)}</p>
            ${cuerpo}
        </div>
        <div class="actions columna">${acciones}<button class="btn ghost" data-accion="lobby">Volver al lobby</button></div>
    </section>`;
}

function pantallaPortada() {
    const eq = equipoActual();
    const c = state.carrera;
    let lead = "Un año en la liga local, draft y temporadas. En el partido hay varias posesiones: tirar, pasar o penetrar. La chance sale de tus stats. La media es el promedio.";
    let boton = "Ir al sorteo de la LNB";
    if (c.paso !== "portada" && c.paso !== "draft") {
        boton = "Seguir la carrera";
        lead = "La temporada quedó guardada en tu cuenta.";
    } else if (eq && eq.liga === "NBA") {
        boton = "Seguir en " + eq.nombre;
        lead = "Ya estás en la NBA. La temporada sigue con este club.";
    } else if (eq && !c.localHecha) {
        boton = "Arrancar el año en " + eq.nombre;
        lead = "El primer año es en " + eq.nombre + " (" + eq.liga + "). Después viene el draft.";
    } else if (eq) {
        boton = "Seguir la temporada";
    }
    return marcoCarrera("MODO CARRERA", `
        <h1>TU<br><span>TEMPORADA</span></h1>
        <p class="lead">${esc(lead)}</p>
        <div class="caja">
            <div class="statline"><span>Jugador</span><b>${esc(state.nombre || "—")}</b></div>
            <div class="statline"><span>Media</span><b class="num">${grlCarrera()}</b></div>
            <div class="statline"><span>Club</span><b>${esc(eq ? eq.nombre : "Calle")}</b></div>
            <div class="statline"><span>El Elegido</span><b class="num">${state.rival ? state.rival.puntos : 0}</b></div>
        </div>
    `, `<button class="btn" data-mc="empezar">${esc(boton)}</button>`);
}

function pantallaDraft() {
    const liga = clubesSorteo();
    const eq = equipoActual();
    if (!clubesLiga("LNB").length) {
        return marcoCarrera("LIGA LOCAL", `<h1>SIN<br><span>CLUBES</span></h1><p class="lead">No hay equipos de la LNB en la base. Revisá que la tabla equipos esté cargada.</p>`, "");
    }
    if (eq && state.carrera.draftListo) {
        return marcoCarrera("LIGA LOCAL", `
            ${tableroCarrera(false)}
            <h1>${esc(eq.nombre)}</h1>
            <p class="lead">${esc(eq.ciudad || "")} · ${esc(eq.liga)}. Entrás al proyecto juvenil. El piso de ${eq.minima} es para los fichajes, no para este sorteo.</p>
        `, `<button class="btn" data-mc="debut">Arrancar el año</button>`);
    }
    return marcoCarrera("SORTEO", `
        <h1>CLUB<br><span>DE ORIGEN</span></h1>
        <p class="lead">El sorteo elige entre ${liga.length} clubes de la LNB a los que tu calibre puede llegar.</p>
        <div class="draft-nombre" id="draftName">???</div>
    `, `<button class="btn" data-mc="sortear">Sortear club</button>`);
}

function pantallaDecision(tag, ev, modo) {
    const ops = (ev.op || []).map((op, i) => {
        const clave = op.st || op.stat;
        const extra = clave ? `<span class="sub">${esc(nombreStat(clave))} ${valorStat(clave)} · ${probCarrera(clave)}%</span>` : "";
        const attr = modo === "debut" ? `data-debut="${i}"` : (clave ? `data-jugada="${clave}"` : `data-personal="${i}"`);
        return `<button class="btn ${i === 0 ? "" : "ghost"}" data-mc="opcion" ${attr}>${esc(op.t)}${extra}</button>`;
    }).join("");
    return marcoCarrera(tag, `
        ${tableroCarrera(false)}
        <h1>${esc(ev.t)}</h1>
        <p class="lead">${esc(ev.d)}</p>
    `, ops);
}

function pantallaDraftNBA() {
    const lista = draftNBA();
    const botones = lista.map((club, i) =>
        `<button class="btn ${i === 0 ? "" : "ghost"}" data-mc="pick" data-club="${club.id}">${esc(club.nombre)}<span class="sub">${esc(club.liga)} · pide ${club.minima}</span></button>`
    ).join("");
    const vacio = lista.length ? "" : `<p class="lead">No hay equipos NBA en la base.</p>`;
    return marcoCarrera("DRAFT", `
        ${tableroCarrera(false)}
        <h1>ELEGÍ<br><span>TU DESTINO</span></h1>
        <p class="lead">Tu media es ${grlCarrera()}. Estos clubes de la NBA te toman. El tablero pasa a usar sus colores.</p>
        ${vacio}
    `, botones);
}

function juegoEntrenoRandom() {
    const juegos = ["reflejos", "memoria", "simon", "defensa"];
    return juegos[Math.floor(Math.random() * juegos.length)];
}

function asegurarOfertaEntreno() {
    const c = asegurarCarrera();
    if (c.ofertaEntreno && ENTRENO_CARRERA[c.ofertaEntreno]) return c.ofertaEntreno;
    c.ofertaEntreno = juegoEntrenoRandom();
    guardarLocal();
    return c.ofertaEntreno;
}

function htmlMarcador(nuestros, ellos, rivalId) {
    const local = typeof equipoActual === "function" ? equipoActual() : null;
    const rival = rivalId && typeof clubPorId === "function" ? clubPorId(rivalId) : null;
    const corto = (eq, fallback) => {
        if (!eq) return fallback;
        const largo = String(eq.nombre || "");
        return largo.length > 16 && eq.abreviatura ? eq.abreviatura : (largo || fallback);
    };
    const cruce = (local ? local.nombre : "Vos") + " vs " + (rival ? rival.nombre : "Rival");
    return `<div class="marcador">
        <div class="lado">${typeof marcaLogo === "function" ? marcaLogo(local) : ""}<b>${esc(corto(local, "VOS"))}</b></div>
        <div class="pts"><b>${nuestros}</b><small>-</small><b>${ellos}</b></div>
        <div class="lado">${typeof marcaLogo === "function" ? marcaLogo(rival) : ""}<b>${esc(corto(rival, "RIVAL"))}</b></div>
    </div>
    <p class="nota">${esc(cruce)}</p>`;
}

function pantallaEco(p) {
    const eco = p.eco;
    const ultima = p.indice + 1 >= p.posesiones.length;
    const alargue = sigueOvertime(p);
    const clase = eco.ok ? "eco-ok" : "eco-mal";
    const aviso = alargue
        ? `<p class="nota">${p.overtimes ? "Siguen empatados. Otro overtime: dos jugadas más." : "Empate. Overtime: dos jugadas más."}</p>`
        : "";
    const boton = alargue ? "Overtime" : (ultima ? "Ver el cierre" : "Siguiente jugada");
    return marcoCarrera("EN JUEGO · " + etiquetaPartido(p), `
        <p class="en-juego">${p.overtimes ? "OVERTIME" : "EN JUEGO"}</p>
        ${htmlMarcador(p.nuestros || 0, p.ellos || 0, p.rivalId)}
        <div class="resultado-jugada ${clase}">
            <b>${esc(eco.titulo)}</b>
            <p>Elegiste ${esc(eco.jugada)}. ${esc(eco.texto)}</p>
        </div>
        ${aviso}
        <div class="caja">
            <div class="statline"><span>${esc(eco.stat.split(" ")[0])}</span><b>${esc(eco.stat)}</b></div>
            <div class="statline"><span>Chance</span><b class="num">${eco.chance}%</b></div>
            <div class="statline"><span>Tablero</span><b class="num">${p.nuestros || 0} - ${p.ellos || 0}</b></div>
        </div>
    `, `<button class="btn" data-mc="seguir-jugada">${boton}</button>`);
}

function pantallaPartido() {
    const c = asegurarCarrera();
    const p = asegurarPartido();
    if (p.eco) return pantallaEco(p);
    const pos = p.posesiones[p.indice];
    if (!pos) return pantallaResultadoCarrera();
    const ops = pos.opciones.map((op, i) => {
        const extra = `<span class="sub">${esc(nombreStat(op.stat))} ${valorStat(op.stat)} · ${probCarrera(op.stat)}%</span>`;
        return `<button class="btn ${i === 0 ? "" : "ghost"}" data-mc="posesion" data-i="${i}">${esc(op.t)}${extra}</button>`;
    }).join("");
    const enOt = p.overtimes && p.indice >= p.posesiones.length - 2;
    const ronda = p.paso === "temporada" ? nombreRonda(p.momento) : "";
    const marca = enOt ? ("OVERTIME " + p.overtimes) : (ronda || (p.paso === "debut" && c.evento && c.evento.ev ? c.evento.ev.t : (p.final ? "FINAL" : "PARTIDO")));
    const leadOt = enOt && p.indice === p.posesiones.length - 2
        ? (p.overtimes > 1 ? "Siguen empatados. " : "Empate. ") + "Overtime: dos jugadas para definir."
        : "";
    const leadRonda = !enOt && ronda && p.indice === 0
        ? (Number(p.momento) === 4 ? "Finales del mundo. El rival es de la otra conferencia. " : "El rival es de tu conferencia. ")
        : "";
    return marcoCarrera("EN JUEGO · " + marca + " · " + (ronda ? Number(p.momento) + "/4 · " : "") + etiquetaPartido(p), `
        <p class="en-juego">${enOt ? "OVERTIME" : (ronda || (p.final ? "FINAL" : "EN JUEGO"))}</p>
        ${htmlMarcador(p.nuestros || 0, p.ellos || 0, p.rivalId)}
        <h1>${esc(pos.t)}</h1>
        <p class="lead">${leadOt ? esc(leadOt) : ""}${leadRonda ? esc(leadRonda) : ""}${esc(pos.d)} La chance sale de tu stat.</p>
    `, ops);
}

function pantallaOff() {
    const c = state.carrera;
    const ofertas = `<button class="btn" data-mc="ofertas">Ver ofertas · media ${grlCarrera()}</button>`;
    if (c.jugados.length > 0) {
        const salto = c.jugados.indexOf("omitido") !== -1;
        const lead = salto
            ? "Saltaste el entrenamiento. Igual podés gastar el XP: cada punto del tablero sale " + COSTO_XP + " XP."
            : "Ya entrenaste esta pretemporada. Cada punto del tablero sale " + COSTO_XP + " XP. Después mirá las ofertas.";
        return marcoCarrera("PRETEMPORADA", `
            ${tableroCarrera(true)}
            <h1>ENTRENO<br><span>LISTO</span></h1>
            <p class="lead">${esc(lead)}</p>
        `, ofertas);
    }
    if (c.espera && ENTRENO_CARRERA[c.espera]) {
        const ent = ENTRENO_CARRERA[c.espera];
        return marcoCarrera("PRETEMPORADA", `
            ${tableroCarrera(true)}
            <h1>SEGUÍ<br><span>EL ENTRENO</span></h1>
            <p class="lead">Quedaste a mitad de ${esc(ent.titulo)}. ${esc(ent.detalle)}. Si ganás, esa habilidad sube 2, dentro del techo de tu edad. Si no llegás, no sube.</p>
        `, `<a class="btn" data-juego="${esc(ent.juego)}" data-modo="carrera" href="${esc(linkJuego(ent.juego, "carrera"))}">Seguir<span class="sub">${esc(ent.titulo)}</span></a>
            <button class="btn ghost" data-mc="omitir">Omitir este entreno</button>
            ${ofertas}`);
    }
    const lista = Object.keys(ENTRENO_CARRERA).map((id) => {
        const ent = ENTRENO_CARRERA[id];
        return `<a class="opcion" data-juego="${esc(ent.juego)}" data-modo="carrera" href="${esc(linkJuego(ent.juego, "carrera"))}"><strong>${esc(ent.titulo)}</strong><span>${esc(ent.detalle)}</span></a>`;
    }).join("");
    return marcoCarrera("PRETEMPORADA", `
        ${tableroCarrera(true)}
        <h1>ENTRENAR</h1>
        <p class="lead">Elegí el minijuego de esta pretemporada. Si ganás, esa habilidad sube 2. Si no llegás, no sube. ${esc(typeof textoCrecimiento === "function" ? textoCrecimiento() : "El techo sube con los años.")}</p>
        <div class="opciones">${lista}</div>
    `, ofertas);
}

function pantallaOfertasCarrera() {
    const lista = ofertasCarrera();
    const eq = equipoActual();
    const botones = lista.map((club) =>
        `<button class="btn" data-mc="firma" data-club="${club.id}">${esc(club.nombre)}<span class="sub">${esc(club.liga)} · pide ${club.minima}</span></button>`
    ).join("");
    const vacio = lista.length ? "" : `<p class="lead">Nadie llega a tu media ${grlCarrera()}. Entrená y volvé. La NBA abre en 78.</p>`;
    const retiro = (state.edad || 0) >= 33 ? `<button class="btn ghost" data-mc="jubilar">Retirarme</button>` : "";
    const quedar = eq ? `<button class="btn ghost" data-mc="quedar">Quedarme en ${esc(eq.nombre)}</button>` : "";
    return marcoCarrera("MERCADO", `
        ${tableroCarrera(false)}
        <h1>OFERTAS</h1>
        <p class="lead">Tu media es ${grlCarrera()}. ${eq && eq.liga === "NBA" ? "En la NBA ya no se vuelve a la liga local." : "Podés subir de liga si el club te da el mínimo."}</p>
        ${vacio}
    `, `${botones}${quedar}${retiro}`);
}

function pantallaResultadoCarrera() {
    const r = state.carrera.resultado || { titulo: "Listo", detalle: "", tweets: [] };
    const tablero = r.marcador
        ? htmlMarcador(r.marcador.nuestros, r.marcador.ellos, r.marcador.rivalId)
        : tableroCarrera(false);
    const jugadas = (r.jugadas || []).map((linea) => `<p class="nota">${esc(linea)}</p>`).join("");
    const tw = (r.tweets || []).map((t) =>
        `<div class="tweet"><b>${esc(t.u)}</b><span>${esc(t.h)}</span><p>${esc(t.t)}</p></div>`
    ).join("");
    return marcoCarrera("RESULTADO", `
        ${tablero}
        <div class="resultado-jugada">
            <b>${esc(r.titulo)}</b>
            <p>${esc(r.detalle)}</p>
        </div>
        ${jugadas}
        ${tw}
    `, `<button class="btn" data-mc="seguir">Continuar</button>`);
}

function pantallaLeyenda() {
    const [titulo, texto, score] = leyendaCarrera();
    const eq = equipoActual();
    const filas = [
        ["Temporadas", state.temporada || 1],
        ["Puntos", state.puntosCarrera || 0],
        ["Títulos", state.titulos || 0],
        ["Partidos", state.partidos || 0],
        ["Victorias", state.victorias || 0],
        ["Media", grlCarrera()],
        ["El Elegido", (state.rival ? state.rival.puntos : 0) + " pts"],
        ["Score", score]
    ].map(([k, v]) => `<div class="statline"><span>${k}</span><b class="num">${v}</b></div>`).join("");
    return marcoCarrera("RETIRO", `
        <h1>${esc(titulo)}</h1>
        <p class="lead">${esc(texto)} ${eq ? "Último club: " + esc(eq.nombre) + "." : ""} Colgar los botines abre el camino de manager.</p>
        <div class="caja">${filas}</div>
    `, `<button class="btn" data-accion="retirar">Colgar los botines</button>`);
}

function pantallaModoCarrera() {
    const c = asegurarCarrera();
    if (!state.nombre || !state.stats) {
        return marcoCarrera("MODO CARRERA", `<h1>SIN<br><span>JUGADOR</span></h1><p class="lead">Armá tu jugador en el lobby antes de entrar a la temporada.</p>`, "");
    }
    if (c.paso === "portada") return pantallaPortada();
    if (c.paso === "draft") return pantallaDraft();
    if (c.paso === "debut") {
        const actual = eventoActualCarrera();
        if (actual.ev && actual.ev.partido) return pantallaPartido();
        const eq = equipoActual();
        return pantallaDecision("LIGA LOCAL · " + (c.momento + 1) + "/5" + (eq ? " · " + eq.nombre : ""), actual.ev, "debut");
    }
    if (c.paso === "draftnba") return pantallaDraftNBA();
    if (c.paso === "temporada") {
        if (c.momento > 0) return pantallaPartido();
        const actual = eventoActualCarrera();
        return pantallaDecision("TEMP " + (state.temporada || 1) + " · PERSONAL", actual.ev, actual.tipo);
    }
    if (c.paso === "offentreno") return pantallaOff();
    if (c.paso === "ofertas") return pantallaOfertasCarrera();
    if (c.paso === "resultado") return pantallaResultadoCarrera();
    if (c.paso === "leyenda") return pantallaLeyenda();
    c.paso = "portada";
    return pantallaPortada();
}

function entrarModoCarrera() {
    const c = asegurarCarrera();
    if (!c.paso) c.paso = "portada";
    state.fase = "modocarrera";
    state.flash = "";
    persistir();
    render();
}

function empezarCarrera() {
    const c = asegurarCarrera();
    const eq = equipoActual();
    if (c.paso && c.paso !== "portada" && c.paso !== "draft") {
        state.fase = "modocarrera";
        return;
    }
    c.evento = null;
    c.partido = null;
    if (!eq) {
        c.paso = "draft";
        c.draftListo = false;
        return;
    }
    if (!c.localHecha && eq.liga !== "NBA") {
        c.paso = "debut";
        c.momento = 0;
        return;
    }
    c.localHecha = true;
    c.paso = "temporada";
    c.momento = 0;
}

function sortearClub() {
    if (sorteoTimer) return;
    const liga = clubesSorteo();
    if (!liga.length) {
        state.flash = "No hay clubes de la LNB a la altura de tu calibre.";
        render();
        return;
    }
    let n = 0;
    sorteoTimer = setInterval(() => {
        const nodo = document.getElementById("draftName");
        if (!nodo) {
            clearInterval(sorteoTimer);
            sorteoTimer = null;
            return;
        }
        nodo.textContent = liga[Math.floor(Math.random() * liga.length)].nombre.toUpperCase();
        n += 1;
        if (n <= 14) return;
        clearInterval(sorteoTimer);
        sorteoTimer = null;
        const club = liga[Math.floor(Math.random() * liga.length)];
        anotarClub(club, "SORTEO");
        state.carrera.draftListo = true;
        state.carrera.paso = "draft";
        state.hinchada = Math.max(Number(state.hinchada) || 0, 60);
        state.quimica = state.hinchada;
        state.flash = "";
        persistir();
        render();
    }, 80);
}

function cobrarEntrenoCarrera(gano, juego) {
    const c = asegurarCarrera();
    const mapa = {
        memoria: "tiro",
        simon: "pase",
        defensa: "defensa",
        reflejos: "velocidad",
        tiro: "tiro",
        pase: "pase",
        dribling: "velocidad"
    };
    const clave = mapa[juego];
    const sube = clave ? subirCampo(clave, gano ? 2 : 0) : 0;
    const xp = gano ? 12 : 6;
    c.xp += xp;
    if (juego && c.jugados.indexOf(juego) === -1) c.jugados.push(juego);
    c.espera = null;
    c.ofertaEntreno = null;
    c.paso = "offentreno";
    state.esperando = null;
    state.fase = "modocarrera";
    reflejarCalibre();
    const nombre = ENTRENO_CARRERA[juego] ? ENTRENO_CARRERA[juego].titulo : "Entrenamiento";
    const stat = clave && sube ? nombreStat(clave) + " +" + sube + ". " : (gano && clave ? "Esa habilidad está en el techo del año. " : "");
    state.flash = nombre + ": " + (gano ? "victoria" : "sin subida") + ". " + stat + "Calibre " + (state.calibre || 46) + ". +" + xp + " XP.";
    persistir();
}

function ligarModoCarrera(raiz) {
    if (state.fase !== "modocarrera") return;
    raiz.querySelectorAll("[data-mc]").forEach((nodo) => {
        nodo.addEventListener("click", () => {
            const c = asegurarCarrera();
            const acc = nodo.dataset.mc;
            if (acc === "empezar") empezarCarrera();
            if (acc === "sortear") {
                sortearClub();
                return;
            }
            if (acc === "debut") {
                c.paso = "debut";
                c.momento = 0;
                c.evento = null;
                c.partido = null;
                state.flash = "";
            }
            if (acc === "ofertas") {
                c.paso = "ofertas";
                state.flash = "";
            }
            if (acc === "omitir") {
                c.espera = null;
                c.ofertaEntreno = null;
                if (c.jugados.indexOf("omitido") === -1) c.jugados.push("omitido");
                state.flash = "Entrenamiento omitido.";
            }
            if (acc === "seguir") seguirResultado();
            if (acc === "quedar") {
                sumarHinchada(8);
                state.rival.puntos += 9;
                guardarPaso("sigtemp", "Te quedaste", "+8 hinchada. La gente lo valora.", "neutro");
                render();
                return;
            }
            if (acc === "jubilar") {
                guardarPaso("leyenda", "El retiro", "Colgás los botines con " + (state.edad || 19) + " años.", "neutro");
                render();
                return;
            }
            if (acc === "posesion") {
                resolverPosesion(Number(nodo.dataset.i));
                persistir();
                render();
                return;
            }
            if (acc === "seguir-jugada") {
                seguirJugada();
                persistir();
                render();
                return;
            }
            if (acc === "opcion") {
                const actual = c.evento || eventoActualCarrera();
                if (nodo.dataset.debut != null) {
                    const ev = debuts()[c.momento] || {};
                    const op = ev.op && ev.op[Number(nodo.dataset.debut)];
                    if (!op) {
                        render();
                        return;
                    }
                    const pend = c.momento < 4 ? "debut" : "draftnba";
                    if (op.fx) resolverOpcion(op, pend, false);
                    else jugarMomento(op.st || op.stat, false, pend);
                    render();
                    return;
                }
                if (nodo.dataset.personal != null) {
                    const viva = personales().find((ev) => actual.ev && ev.t === actual.ev.t);
                    const op = ((viva || actual.ev).op || [])[Number(nodo.dataset.personal)];
                    if (!op) {
                        render();
                        return;
                    }
                    resolverOpcion(op, "avanzar", false);
                    render();
                    return;
                }
                if (nodo.dataset.jugada) {
                    jugarMomento(nodo.dataset.jugada, !!actual.final, "avanzar");
                    render();
                    return;
                }
            }
            if (acc === "pick" || acc === "firma") {
                const club = clubPorId(nodo.dataset.club);
                if (!club) return;
                const anterior = equipoActual();
                const salto = !anterior || club.liga !== anterior.liga;
                anotarClub(club, acc === "pick" ? "DRAFT" : "FICHAJE");
                if (acc === "pick") {
                    c.localHecha = true;
                    state.temporada = 1;
                    c.momento = 0;
                    c.usados = [];
                    c.jugados = [];
                    state.hinchada = 60;
                    state.quimica = 60;
                    guardarPaso("temporada", "Drafteado por " + club.nombre, "Arranca la NBA con los colores del club.", "bien");
                } else {
                    c.xp += 10;
                    if (salto) state.hinchada = 55;
                    else sumarHinchada(4);
                    state.rival.puntos += 9;
                    guardarPaso("sigtemp", "Fichaje: " + club.nombre, club.liga + " · +10 XP.", "bien");
                }
                render();
                return;
            }
            if (acc === "stat") {
                const clave = nodo.dataset.stat;
                const delta = Number(nodo.dataset.d);
                const campo = campoStat(clave);
                const actual = Number(state.stats[campo]) || 50;
                if (delta > 0 && c.xp >= COSTO_XP) {
                    const sube = typeof aplicarSubida === "function" ? aplicarSubida(campo, 1) : 0;
                    if (!sube) {
                        state.flash = typeof textoTope === "function" ? textoTope() : "Esa habilidad está en el techo de tu edad.";
                    } else {
                        c.xp -= COSTO_XP;
                        reflejarCalibre();
                        state.flash = nombreStat(clave) + " +" + sube + ". Media " + grlCarrera() + ".";
                    }
                } else if (delta < 0 && actual > 24) {
                    c.xp += COSTO_XP;
                    state.stats[campo] = actual - 1;
                    reflejarCalibre();
                    state.flash = nombreStat(clave) + " -1. +" + COSTO_XP + " XP.";
                } else {
                    state.flash = "Sin XP o el stat está al límite.";
                }
            }
            persistir();
            render();
        });
    });
}
