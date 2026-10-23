const BASES = {
    PG: { velocidad: 48, tiro: 36, fuerza: 30, control: 50, defensa: 34 },
    SG: { velocidad: 44, tiro: 48, fuerza: 32, control: 36, defensa: 34 },
    SF: { velocidad: 42, tiro: 40, fuerza: 40, control: 34, defensa: 42 },
    PF: { velocidad: 34, tiro: 32, fuerza: 50, control: 30, defensa: 44 },
    C:  { velocidad: 28, tiro: 30, fuerza: 52, control: 26, defensa: 48 }
};

const POSICIONES = {
    PG: "Base",
    SG: "Escolta",
    SF: "Alero",
    PF: "Ala-pívot",
    C: "Pívot"
};

const HABILIDADES = [
    "TIRADOR CLAVE",
    "PLAYMAKER",
    "DEFENSOR PERIMETRAL",
    "LÍDER DE EQUIPO"
];

const TROFEOS_BASE = [
    "CAMPEÓN NBA",
    "MVP FINALES",
    "MVP TEMPORADA",
    "ALL-STAR",
    "MEJOR DEFENSOR",
    "ANILLO DE CAMPEÓN"
];

const CITA = "EL TALENTO TE LLEVA LEJOS, EL TRABAJO TE HACE GRANDE";

const FRASES = {
    inicio: [
        ["El talento gana partidos. El trabajo en equipo y la inteligencia ganan campeonatos.", "Michael Jordan", "como", "Cómo jugar"],
        ["No midas el día por la cosecha. Midelo por las semillas que plantaste.", "Robert Louis Stevenson", "empezar", "Armar jugador"],
        ["La excelencia es un hábito, no un acto.", "Aristóteles", "como", "Cómo jugar"]
    ],
    como: [
        ["El fracaso no es fatal. Lo fatal es no querer cambiar.", "John Wooden", "empezar", "Armar jugador"],
        ["Jugá cada partido como si fuera el último.", "Michael Jordan", "empezar", "Armar jugador"]
    ],
    armar: [
        ["Sé el que entrenó cuando nadie miraba.", "Michael Jordan", "jugar", "Entrar al lobby"],
        ["La disciplina es el puente entre la meta y el logro.", "Jim Rohn", "jugar", "Entrar al lobby"]
    ],
    lobby: [
        ["Lo que no está en la ficha, no pasó.", "Gregg Popovich", "cuenta", "Tu cuenta"],
        ["Los campeones se hacen cuando nadie mira.", "Michael Jordan", "cuenta", "Tu historial"],
        ["Un líder no nace. Se construye con cada partido.", "Phil Jackson", "entrenar", "Entrenar"]
    ],
    entrenar: [
        ["El sudor de hoy es el calibre de mañana.", "John Wooden", "lobby", "Ver la ficha"],
        ["No practiques hasta que salga bien. Practicá hasta que no salga mal.", "John Wooden", "lobby", "Ver la ficha"]
    ],
    ofertas: [
        ["La oportunidad baila con quien está en la cancha.", "Phil Jackson", "entrenar", "Subir el calibre"],
        ["No esperes el llamado. Entrená para merecerlo.", "Gregg Popovich", "entrenar", "Ir al gimnasio"]
    ],
    cuenta: [
        ["El que enseña también crece.", "Phil Jackson", "mercado", "Mercado de jugadores"],
        ["Tu nombre queda en los que formaste.", "John Wooden", "mercado", "Administrar el plantel"]
    ],
    mercado: [
        ["Primero el novato. Después, los que ya saben.", "Gregg Popovich", "cuenta", "Volver a la cuenta"],
        ["Un buen manager pone el ego en el banco.", "Phil Jackson", "cuenta", "Tu plantel"]
    ],
    retiro: [
        ["El final de una carrera puede ser el principio de otra.", "Phil Jackson", "ser-manager", "Seguir de manager"],
        ["No es el fin del camino. Es un cambio de banco.", "Gregg Popovich", "ser-manager", "Seguir de manager"]
    ]
};

let equipos = [];
let estrellas = [];
let state = estadoInicial();
let authModo = "entrar";
let authMalos = [];
let quitarFlecha = null;
let borrador = { nombre: "", correo: "", clave: "", codigo: "" };

function estadoInicial() {
    return {
        fase: "crear",
        paso: "inicio",
        error: "",
        flash: "",
        nombre: "",
        posicion: "",
        tez: "#a96f48",
        cabello: "h1",
        edad: 19,
        altura: 196,
        peso: 90,
        ciudad: "Buenos Aires, Argentina",
        dorsal: 11,
        origen: "draft",
        campus: "",
        estiloId: "",
        habilidades: [],
        conferencia: "",
        equipoId: null,
        calibre: 46,
        stats: null,
        quimica: 58,
        trayectoria: [],
        trofeos: TROFEOS_BASE.map((nombre) => ({ nombre, cantidad: 0 })),
        id: null,
        cobradas: [],
        hinchada: 58,
        puntosCarrera: 0,
        asistenciasCarrera: 0,
        titulos: 0,
        traidor: false,
        mercenario: false,
        rival: { nombre: "EL ELEGIDO", puntos: 18, titulos: 0 },
        rivalClubId: null,
        turno: 0,
        temporada: 1,
        calendario: [],
        plusSalario: 0,
        esperando: null,
        extra: false,
        partidos: 0,
        partidas: 0,
        victorias: 0,
        renegocioEn: null,
        retirado: false,
        tipo: "novato",
        dificultad: "baja",
        estrellaId: null,
        ligaOrigen: null,
        clubOrigen: null,
        ppgPrevio: null,
        rpgPrevio: null,
        apgPrevio: null,
        notaPrevia: "",
        ligaMercado: "NCAA",
        confirmarCierre: false,
        revision: 0,
        crecimiento: { edad: 19, usado: 0 },
        carrera: null,
        cuenta: { google: false, user: null, jugadores: [], historial: { carreras: 0, partidas: 0, partidos: 0, victorias: 0 } }
    };
}

function estilosDe(pos) {
    const catalogo = {
        PG: [
            { id: "armador", titulo: "Armador", corto: "Control +8 · Velocidad +4", texto: "Dirijo el equipo y encuentro al libre.", tags: ["PASE", "VISIÓN", "LIDERAZGO"], ajuste: { control: 8, velocidad: 4, tiro: -2 } },
            { id: "base-anotador", titulo: "Base anotador", corto: "Tiro +8 · Velocidad +4", texto: "Busco mi tiro y también organizo.", tags: ["TIRO", "VELOCIDAD", "PASE"], ajuste: { tiro: 8, velocidad: 4, control: -2 } }
        ],
        SG: [
            { id: "tirador", titulo: "Tirador", corto: "Tiro +10", texto: "Vivo del tiro de afuera.", tags: ["TIRO", "RANGO", "CLUTCH"], ajuste: { tiro: 10, defensa: -2, fuerza: -2 } },
            { id: "escolta", titulo: "Escolta", corto: "Defensa +6 · Tiro +4", texto: "Anoto y marco al peligro del otro equipo.", tags: ["DEFENSA", "TIRO", "VELOCIDAD"], ajuste: { defensa: 6, tiro: 4, velocidad: 2 } }
        ],
        SF: [
            { id: "alero", titulo: "Alero", corto: "Tiro +6 · Velocidad +4", texto: "Corto, tiro y puedo jugar de los dos lados.", tags: ["TIRO", "CORTE", "VERSATILIDAD"], ajuste: { tiro: 6, velocidad: 4, fuerza: 2 } },
            { id: "alero-defensa", titulo: "Alero defensor", corto: "Defensa +8 · Fuerza +4", texto: "Me pegan al mejor del otro equipo.", tags: ["DEFENSA", "FUERZA", "VERSATILIDAD"], ajuste: { defensa: 8, fuerza: 4, tiro: -2 } }
        ],
        PF: [
            { id: "ala", titulo: "Ala-pívot", corto: "Fuerza +8 · Defensa +4", texto: "Reboteo y cierro la pintura.", tags: ["REBOTE", "FUERZA", "DEFENSA"], ajuste: { fuerza: 8, defensa: 4, velocidad: -2 } },
            { id: "ala-abierta", titulo: "Ala abierta", corto: "Tiro +6 · Fuerza +4", texto: "Abro la cancha y peleo el tablero.", tags: ["TIRO", "REBOTE", "FUERZA"], ajuste: { tiro: 6, fuerza: 4, control: 2 } }
        ],
        C: [
            { id: "pivot", titulo: "Pívot", corto: "Fuerza +8 · Defensa +4", texto: "La pintura es mía.", tags: ["PINTURA", "REBOTE", "FUERZA"], ajuste: { fuerza: 8, defensa: 4, velocidad: -4 } },
            { id: "protector", titulo: "Protector", corto: "Defensa +10 · Fuerza +4", texto: "Tapón y rebote en cada posesión.", tags: ["TAPÓN", "REBOTE", "DEFENSA"], ajuste: { defensa: 10, fuerza: 4, tiro: -4 } }
        ]
    };
    return catalogo[pos] ? catalogo[pos].slice() : [];
}

function esc(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

function hashTexto(texto) {
    return Array.from(String(texto)).reduce((acc, c) => (acc * 33 + c.charCodeAt(0)) >>> 0, 7);
}

function luma(hex) {
    const c = (hex || "#000000").replace("#", "");
    if (c.length < 6) return 0;
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function equipoActual() {
    return equipos.find((eq) => Number(eq.id) === Number(state.equipoId)) || null;
}

function clubPorId(id) {
    return equipos.find((eq) => Number(eq.id) === Number(id)) || null;
}

function estiloActual() {
    const propio = estilosDe(state.posicion).find((item) => item.id === state.estiloId);
    if (propio) return propio;
    const viejos = {
        ritmo: { titulo: "Estilo de juego", tags: ["VERSATILIDAD", "DEFENSA"] },
        base: { titulo: "Base / Escolta", tags: ["PASE", "TIRO"] },
        alero: { titulo: "Alero", tags: ["TIRO", "DEFENSA"] },
        ala: { titulo: "Ala-pívot", tags: ["REBOTE", "FUERZA"] },
        pivot: { titulo: "Pívot", tags: ["TAPÓN", "REBOTE"] }
    };
    const viejo = viejos[state.estiloId];
    if (!viejo) return null;
    return { id: state.estiloId, titulo: viejo.titulo, corto: "", texto: "", tags: viejo.tags, ajuste: {} };
}

function hexA(hex, alpha) {
    const c = (hex || "#000000").replace("#", "");
    if (c.length < 6) return "rgba(0,0,0," + alpha + ")";
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return "rgba(" + r + "," + g + "," + b + "," + alpha + ")";
}

function coloresMarca(eq) {
    const fondo = luma(eq.color_primario) < 170 ? eq.color_primario : (eq.color_secundario || "#111111");
    const tinta = luma(fondo) > 150 ? "#141414" : "#f4f4f4";
    return { fondo, tinta };
}

function marcaLogo(eq) {
    if (!eq) {
        return `<div class="logo-circulo"><b class="monograma calle">CALLE</b></div>`;
    }
    if (eq.logo) {
        return `<div class="logo-circulo"><img src="${esc(eq.logo)}" alt=""></div>`;
    }
    const marca = coloresMarca(eq);
    const sigla = String(eq.abreviatura || "??").slice(0, 4);
    return `<div class="logo-circulo"><b class="monograma" style="background:${esc(marca.fondo)};color:${esc(marca.tinta)}">${esc(sigla)}</b></div>`;
}

function etiquetaClub(eq) {
    if (!eq) {
        if (state.clubOrigen) {
            return (state.ligaOrigen ? state.ligaOrigen + " · " : "") + state.clubOrigen;
        }
        return "La calle";
    }
    const liga = eq.liga === "LNB" ? "Liga Nacional" : eq.liga;
    return liga + " · " + eq.nombre;
}

function aplicarTema() {
    const eq = equipoActual();
    const enCalle = state.fase === "crear" || !eq;
    const root = document.documentElement;
    let borde = "#d0d0d0";
    let tinta = "#1c1c22";
    let img = "assets/fondo-calle.jpg";
    let top = "rgba(16,16,18,0.20)";
    let bot = "rgba(8,8,10,0.62)";
    let wash = "rgba(0,0,0,0)";
    if (!enCalle) {
        const primario = eq.color_primario;
        const secundario = eq.color_secundario;
        borde = luma(primario) > 90 ? primario : (luma(secundario) > 90 ? secundario : "#e8b923");
        tinta = luma(primario) < 140 ? primario : "#071633";
        img = eq.fondo || "assets/fondo-calle.jpg";
        top = "rgba(6,14,32,0.34)";
        bot = "rgba(4,8,20,0.62)";
        wash = hexA(tinta, 0.16);
    }
    root.style.setProperty("--gold", borde);
    root.style.setProperty("--navy", tinta);
    root.style.setProperty("--bar", borde);
    root.style.setProperty("--fondo", "url('/" + img.replace(/^\/+/, "") + "?v=4')");
    root.style.setProperty("--velo-top", top);
    root.style.setProperty("--velo-bot", bot);
    root.style.setProperty("--wash", wash);
}

function ovr() {
    const s = state.stats;
    if (!s) return 0;
    return Math.round((s.tiro + s.velocidad + s.fuerza + s.control + s.defensa) / 5);
}

function numerosVisibles() {
    if (!(state.partidos > 0)) return `<p class="nota">Sin partidos todavía. Los promedios aparecen cuando jugás.</p>`;
    const box = boxScore();
    return `<p class="nums">${box.ppg}<small>PTS</small> ${box.reb}<small>REB</small> ${box.ast}<small>AST</small></p>`;
}

function boxScore() {
    const s = state.stats || BASES.PG;
    return {
        ppg: (s.tiro / 12 + s.control / 40).toFixed(1),
        reb: (s.fuerza / 16).toFixed(1),
        ast: (s.control / 14).toFixed(1),
        stl: (s.defensa / 38).toFixed(1),
        blk: (s.fuerza / 48).toFixed(1)
    };
}

function rol() {
    const media = ovr();
    if (media >= 90) return ["ESTRELLA PRINCIPAL", "Líder en la cancha, genera juego para todos."];
    if (media >= 80) return ["TITULAR", "Ya sos parte del quinteto. El equipo cuenta con vos."];
    if (media >= 74) return ["ROTACION", "Entrás desde el banco y cambiás el ritmo."];
    if (media >= 64) return ["PROMESA", "El cuerpo ya responde. El juego grande está más adelante."];
    if (media >= 50) return ["PROSPECTO", "Ya no sos un pibe. Cada temporada te acerca al equipo grande."];
    return ["PIBE", "Tenés " + (state.edad || 19) + " años. El nivel llega con las temporadas."];
}

function salarioValor() {
    if (!state.equipoId) return 0;
    const eq = equipoActual();
    const piso = eq ? Number(eq.minima) / 50 : 0;
    return piso + 1.2 + ovr() / 18 + (state.plusSalario || 0);
}

function salario() {
    return salarioValor().toFixed(1);
}

function guardarLocal() {
    localStorage.setItem("rookie-jugador", JSON.stringify(state));
}

function cargarLocal() {
    try {
        const guardado = JSON.parse(localStorage.getItem("rookie-jugador") || "null");
        if (!guardado || !guardado.nombre) return;
        const fasesJuego = ["carrera", "retiro", "ficha", "hub", "lobby", "entrenar", "ofertas", "cuenta", "manager", "mercado", "modocarrera"];
        if (fasesJuego.includes(guardado.fase)) {
            state = Object.assign(estadoInicial(), guardado);
        }
    } catch (error) {
        state = estadoInicial();
    }
}

function migrar() {
    if (state.fase === "hub" || state.fase === "carrera") state.fase = "lobby";
    if (state.fase === "retiro" && !state.retirado) state.fase = "lobby";
    const seguir = ["lobby", "entrenar", "ofertas", "ficha", "retiro", "cuenta", "manager", "mercado", "modocarrera"];
    if (!seguir.includes(state.fase)) return;
    if (!state.stats && state.posicion) state.stats = Object.assign({}, BASES[state.posicion]);
    if (state.hinchada == null) state.hinchada = state.quimica || 58;
    if (!state.rival) state.rival = { nombre: "EL ELEGIDO", puntos: 18, titulos: 0 };
    if (!state.trofeos || !state.trofeos.length) {
        state.trofeos = TROFEOS_BASE.map((nombre) => ({ nombre, cantidad: 0 }));
    }
    state.habilidades = state.habilidades || [];
    state.cobradas = state.cobradas || [];
    state.trayectoria = state.trayectoria || [];
    state.turno = state.turno || 0;
    state.temporada = state.temporada || 1;
    state.puntosCarrera = state.puntosCarrera || 0;
    state.asistenciasCarrera = state.asistenciasCarrera || 0;
    state.titulos = state.titulos || 0;
    state.plusSalario = state.plusSalario || 0;
    state.calendario = state.calendario || [];
    if (state.calibre == null) state.calibre = state.equipoId ? 72 : 46;
    state.partidos = state.partidos || 0;
    state.partidas = state.partidas || state.partidos || 0;
    state.victorias = state.victorias || 0;
    state.retirado = !!state.retirado;
    state.tipo = state.tipo || "novato";
    state.dificultad = state.dificultad || "baja";
    state.ligaMercado = state.ligaMercado || "NCAA";
    state.confirmarCierre = !!state.confirmarCierre;
    if (!state.cuenta) state.cuenta = { google: false, user: null, jugadores: [], historial: { carreras: 0, partidas: 0, partidos: 0, victorias: 0 } };
    if (!state.cuenta.historial) state.cuenta.historial = { carreras: 0, partidas: 0, partidos: 0, victorias: 0 };
    if (state.fase === "manager") state.fase = "mercado";
    if (state.fase === "ficha") state.fase = "lobby";
}

function validarArmar() {
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 ]{2,14}$/.test(state.nombre.trim())) {
        return "Escribí un nombre de 2 a 14 letras.";
    }
    if (!state.posicion) return "Elegí una posición.";
    if (!state.estiloId) return "Elegí un estilo. Después no se puede cambiar.";
    if (state.habilidades.length !== 2) return "Elegí exactamente 2 habilidades.";
    return "";
}

function elegirRival() {
    const mio = equipoActual();
    if (!mio) return null;
    const pool = equipos
        .filter((eq) => eq.liga === mio.liga && Number(eq.id) !== Number(mio.id))
        .sort((a, b) => Math.abs(Number(a.minima) - Number(mio.minima)) - Math.abs(Number(b.minima) - Number(mio.minima)));
    if (!pool.length) return null;
    return pool[hashTexto((state.nombre || "x") + "rival") % Math.min(4, pool.length)];
}

function pisoDe(liga) {
    const nums = equipos
        .filter((eq) => !liga || eq.liga === liga)
        .map((eq) => Number(eq.minima))
        .filter((n) => n > 0);
    return nums.length ? Math.min.apply(null, nums) : null;
}

function equiposAlAlcance() {
    const calibre = state.calibre || 46;
    const lista = equipos
        .filter((eq) => Number(eq.minima) <= calibre && Number(eq.id) !== Number(state.equipoId))
        .sort((a, b) => Number(b.minima) - Number(a.minima));
    const techo = lista.filter((eq) => Number(eq.minima) >= calibre - 12);
    const pool = (techo.length ? techo : lista).slice(0, 8);
    if (!pool.length) return [];
    const indice = hashTexto(state.nombre + "-" + (state.partidos || 0) + "-" + (state.victorias || 0)) % pool.length;
    const primero = pool[indice];
    const segundo = pool.find((eq) => eq.liga !== primero.liga && Number(eq.id) !== Number(primero.id))
        || pool[(indice + 1) % pool.length];
    return segundo && Number(segundo.id) !== Number(primero.id) ? [primero, segundo] : [primero];
}

function calendarioBase() {
    return [
        { tipo: "mini", titulo: "EL BARRIO", juego: "reflejos", calle: true },
        { tipo: "oferta", titulo: "LLEGO UNA OFERTA" },
        { tipo: "mini", titulo: "PARTIDO CLAVE", juego: "memoria" },
        { tipo: "oferta", titulo: "TE BUSCAN" },
        { tipo: "stat", titulo: "PRETEMPORADA" },
        { tipo: "choice", titulo: "LA HINCHADA", clave: "debut" },
        { tipo: "rival", titulo: "EL CLASICO" },
        { tipo: "mini", titulo: "LA FINAL", juego: "defensa", copa: true },
        { tipo: "oferta", titulo: "EL GRAN SALTO" },
        { tipo: "retiro", titulo: "EL RETIRO" }
    ];
}

function eventosExtra() {
    return [
        { tipo: "stat", titulo: "PRETEMPORADA", anio: true },
        { tipo: "oferta", titulo: "OTRA OFERTA" },
        { tipo: "mini", titulo: "LA COPA", juego: "memoria", allstar: true },
        { tipo: "retiro", titulo: "EL RETIRO", forzado: true }
    ];
}

function asegurarCalendario() {
    if (state.fase !== "carrera" && state.fase !== "ficha") return;
    if (!equipos.length) return;
    if (!state.rivalClubId && state.equipoId) {
        const rival = elegirRival();
        state.rivalClubId = rival ? Number(rival.id) : null;
    }
    if (!state.calendario || !state.calendario.length) {
        state.calendario = calendarioBase();
        state.turno = 0;
    }
    if (!state.trayectoria.length) {
        const eq = equipoActual();
        if (eq) {
            state.trayectoria = [{
                nombre: eq.nombre,
                detalle: "(NBA) | ACTUALIDAD",
                cuando: "2026 - ACTUALIDAD",
                logo: eq.logo
            }];
        }
    }
}

function eventoActual() {
    return (state.calendario || [])[state.turno] || null;
}

function nombreClub(id, fallback) {
    const club = clubPorId(id);
    return club ? club.nombre : fallback;
}

function opcionesDe(ev) {
    if (ev.clave === "debut") {
        return [
            {
                t: "Jugar para la hinchada",
                efecto: { hinchada: 12, puntos: 28, ast: 8 },
                eco: "La gente coreó tu nombre."
            },
            {
                t: "Priorizar el contrato",
                efecto: { hinchada: -8, puntos: 16, ast: 4, plata: 1.4 },
                eco: "El agente sonrió. La platea, menos."
            }
        ];
    }
    return [
        {
            t: "Soy de este equipo",
            efecto: { hinchada: 14, puntos: 10, ast: 3 },
            eco: "Hablaste como ídolo, no como pase."
        },
        {
            t: "Juego donde me paguen",
            efecto: { hinchada: -12, puntos: 6, ast: 2, plata: 2, mercenario: true },
            eco: "La frase quedó. Mercenario, dijeron."
        }
    ];
}

function ligaDe(eq) {
    return eq ? eq.liga : "CALLE";
}

function textoDe(ev) {
    const eq = equipoActual();
    const club = eq ? eq.nombre : "la calle";
    const rivalClub = nombreClub(state.rivalClubId, "el otro aro");
    const ofertas = ev.tipo === "oferta" ? equiposAlAlcance() : [];
    if (ev.tipo === "stat") {
        return eq
            ? "El cuerpo técnico te deja un solo trabajo. Lo que elijas queda en la ficha para toda la temporada."
            : "Entrenás solo en la vereda. Elegí un solo trabajo. El calibre sube igual.";
    }
    if (ev.clave === "debut") {
        return eq
            ? "Primera noche en " + club + ". La hinchada quiere un nombre propio y tu agente ya habla de plata."
            : "En la calle no hay contrato. Jugar para la gente sube la hinchada. Cuidarte sube un poco el bolsillo.";
    }
    if (ev.tipo === "oferta") {
        if (!ofertas.length) {
            return "Tu calibre es " + state.calibre + ". Los clubes piden más. Otro partido bien jugado abre la próxima puerta.";
        }
        const mejor = ofertas[0];
        return "Tu calibre es " + state.calibre + ". " + mejor.nombre + " (" + mejor.liga + ") pide " + mejor.minima + ". La NBA recién llama desde 78.";
    }
    if (ev.clave === "conferencia") {
        return "Te paran en la conferencia. El Elegido juega en " + rivalClub + " y ya suma " + state.rival.puntos + " puntos. Te preguntan de qué lado estás.";
    }
    if (ev.tipo === "mini" && ev.calle) {
        return "El aro está en la vereda. No tenés club. Si ganás este partido, tu calibre sube y alguien puede llamar.";
    }
    if (ev.tipo === "mini" && ev.copa) {
        const nombre = eq && eq.liga === "NBA" ? "Finales NBA" : (eq && eq.liga === "LNB" ? "La final de la Liga Nacional" : (eq ? "La final universitaria" : "El último partido de la calle"));
        return nombre + ". Un título o nada. El Elegido también está. Defendé el aro.";
    }
    if (ev.tipo === "mini" && ev.allstar) {
        return "La copa se define en un partido corto. Si ganás, el All-Star deja de ser un rumor.";
    }
    if (ev.tipo === "mini") {
        return "Partido clave. El Elegido va " + state.rival.puntos + " puntos. Acá se juega el calibre, no el discurso.";
    }
    if (ev.tipo === "rival") {
        if (!eq) return "El Elegido ya tiene club. Vos todavía estás en la calle. Quedarte también es una decisión.";
        return rivalClub + " es el clásico de tu liga. Firmar ahí es de traidor. Quedarte es de ídolo.";
    }
    if (ev.forzado) {
        return "El cuerpo dijo basta. Esta vez el retiro no se negocia.";
    }
    return "Tenés " + state.edad + " años. Podés colgar los botines o pedir una temporada más.";
}

function aplicarEfecto(efecto) {
    if (!efecto) return;
    if (efecto.hinchada) state.hinchada = clamp(state.hinchada + efecto.hinchada, 0, 100);
    if (efecto.puntos) state.puntosCarrera += efecto.puntos;
    if (efecto.ast) state.asistenciasCarrera += efecto.ast;
    if (efecto.plata) state.plusSalario += efecto.plata;
    if (efecto.mercenario) state.mercenario = true;
    state.quimica = state.hinchada;
}

function cerrarParada() {
    const ultima = state.trayectoria[state.trayectoria.length - 1];
    const anterior = equipoActual();
    if (!ultima) return;
    ultima.detalle = anterior ? "(" + anterior.liga + ")" : ultima.detalle;
    ultima.cuando = "2026";
}

function firmar(eq, modo) {
    if (!eq) return;
    const anterior = equipoActual();
    if (anterior) cerrarParada();
    state.equipoId = Number(eq.id);
    state.conferencia = eq.conferencia;
    state.trayectoria.push({
        nombre: eq.nombre,
        detalle: "(" + eq.liga + ")" + (modo === "rival" ? " | CLASICO" : " | FICHAJE"),
        cuando: "2026 - ACTUALIDAD",
        logo: eq.logo
    });
    if (modo === "rival") {
        state.traidor = true;
        state.hinchada = clamp(state.hinchada - 35, 0, 100);
        state.plusSalario += 4;
        state.puntosCarrera += 6;
        state.flash = "Firmaste con el clásico. Para la hinchada sos un traidor.";
    } else if (!anterior) {
        state.hinchada = 64;
        state.puntosCarrera += 8;
        state.flash = "Primer club: " + eq.nombre + ". Calibre " + state.calibre + ".";
    } else if (Number(eq.minima) >= Number(anterior.minima) + 6) {
        state.hinchada = clamp(state.hinchada - 6, 0, 100);
        state.plusSalario += eq.liga === "NBA" ? 4 : 1.2;
        state.puntosCarrera += 10;
        state.flash = "Diste el salto a " + eq.nombre + ".";
    } else {
        state.mercenario = true;
        state.hinchada = clamp(state.hinchada - 22, 0, 100);
        state.plusSalario += 2;
        state.puntosCarrera += 8;
        state.flash = "Firmaste por plata. Te van a decir mercenario.";
    }
    state.quimica = state.hinchada;
    state.rival.puntos += 10;
    const rival = elegirRival();
    state.rivalClubId = rival ? Number(rival.id) : null;
}

function quedarse(eco, puntos) {
    state.hinchada = clamp(state.hinchada + 12, 0, 100);
    state.quimica = state.hinchada;
    state.puntosCarrera += puntos;
    state.asistenciasCarrera += 3;
    state.flash = eco;
    state.rival.puntos += 9;
}

function avanzar() {
    state.turno += 1;
    state.quimica = state.hinchada;
    if (!eventoActual()) state.fase = "retiro";
    persistir();
}

function aplicarOpcion(indice) {
    const ev = eventoActual();
    if (!ev) {
        state.fase = "retiro";
        render();
        return;
    }
    if (ev.tipo === "stat") {
        const clave = ["tiro", "velocidad", "defensa"][indice];
        const sube = aplicarSubida(clave, 1);
        sumarCalibre(1);
        if (ev.anio) {
            state.edad += 1;
            state.flash = (sube ? etiquetaStat(clave) + " +" + sube + ". " : "") + madurar();
        } else {
            state.flash = sube ? etiquetaStat(clave) + " +" + sube + ". Calibre " + state.calibre + "." : textoTope();
        }
        state.rival.puntos += 8;
        avanzar();
        render();
        return;
    }
    if (ev.tipo === "oferta") {
        quedarse(state.equipoId ? "Te quedaste. Eso vale más que el contrato." : "Seguís en la calle. El calibre manda.", 8);
        avanzar();
        render();
        return;
    }
    if (ev.tipo === "rival") {
        if (indice === 0) firmar(clubPorId(state.rivalClubId), "rival");
        else {
            state.hinchada = clamp(state.hinchada + 16, 0, 100);
            state.quimica = state.hinchada;
            state.puntosCarrera += 14;
            state.asistenciasCarrera += 4;
            state.flash = "Rechazaste al clásico. La hinchada no lo olvida.";
            state.rival.puntos += 12;
        }
        avanzar();
        render();
        return;
    }
    if (ev.tipo === "retiro") {
        if (indice === 0 || ev.forzado) {
            state.fase = "retiro";
            state.flash = "";
            persistir();
            render();
            return;
        }
        state.extra = true;
        state.edad += 1;
        state.temporada += 1;
        state.calendario = state.calendario.concat(eventosExtra());
        state.flash = "Una temporada más. " + madurar();
        avanzar();
        render();
        return;
    }
    const op = opcionesDe(ev)[indice];
    aplicarEfecto(op.efecto);
    state.flash = op.eco;
    state.rival.puntos += 11;
    avanzar();
    render();
}

function etiquetaStat(clave) {
    return { tiro: "Tiro", velocidad: "Velocidad", defensa: "Defensa" }[clave] || clave;
}

const ENTRENOS = [
    { id: "tiro", titulo: "Tiro al aro", stat: "Tiro", detalle: "20 puntos en 30 segundos" },
    { id: "pase", titulo: "Pase relámpago", stat: "Control", detalle: "8 pases sin que te lo roben" },
    { id: "dribling", titulo: "Dribling", stat: "Velocidad", detalle: "200 puntos en la pista" },
    { id: "reflejos", titulo: "Reflejos", stat: "Velocidad", detalle: "Tocá la pelota a tiempo" },
    { id: "memoria", titulo: "Memoria", stat: "Tiro", detalle: "Encontrá las parejas" },
    { id: "simon", titulo: "Simón", stat: "Control", detalle: "Repetí la secuencia" },
    { id: "defensa", titulo: "Defensa", stat: "Defensa", detalle: "Tapá el aro" }
];

function linkJuego(juego, modo) {
    const eq = equipoActual();
    const nombre = encodeURIComponent(state.nombre.trim());
    const equipo = eq ? eq.id : "";
    const marca = "modo=" + (modo === "partido" ? "partido" : modo === "carrera" ? "carrera" : "entreno")
        + "&dificultad=" + encodeURIComponent(state.dificultad || "baja");
    if (juego === "tiro") return "/minijuegos/tiro/?" + marca;
    if (juego === "pase") return "/minijuegos/pase/?" + marca;
    if (juego === "dribling") return "/minijuegos/dribling/?" + marca;
    if (juego === "reflejos") return "reflejos/index.php?equipo=" + equipo + "&nombre=" + nombre + "&" + marca;
    if (juego === "memoria") return "Juegodememoria.html?" + marca;
    if (juego === "simon") return "Simondice.html?" + marca;
    return "defensa.html?" + marca;
}

function etiquetaJuego(ev) {
    if (ev.calle) return "Jugar en la calle";
    if (ev.juego === "reflejos") return "Jugar la final";
    if (ev.juego === "memoria") return "Jugar el partido";
    if (ev.juego === "simon") return "Jugar el desafío";
    return "Jugar la final";
}

function botonesDe(ev) {
    if (ev.tipo === "stat") {
        return ["Subir tiro", "Subir velocidad", "Subir defensa"].map((texto, i) =>
            `<button class="btn eleccion" data-op="${i}">${texto}</button>`
        ).join("");
    }
    if (ev.tipo === "oferta") {
        const lista = equiposAlAlcance();
        const quedarme = state.equipoId ? "Quedarme en el club" : "Seguir en la calle";
        const botones = lista.map((eq) =>
            `<button class="btn eleccion" data-club="${eq.id}">${esc(eq.nombre)} · ${esc(eq.liga)} ${eq.minima}</button>`
        ).join("");
        return botones + `<button class="btn ghost eleccion" data-op="1">${quedarme}</button>`;
    }
    if (ev.tipo === "rival") {
        if (!state.equipoId || !state.rivalClubId) {
            return `<button class="btn eleccion" data-op="1">Seguir en la calle</button>`;
        }
        const rivalClub = nombreClub(state.rivalClubId, "el clásico");
        return `<button class="btn eleccion" data-op="0">Firmar con ${esc(rivalClub)}</button>
                <button class="btn ghost eleccion" data-op="1">Rechazar. Soy de acá</button>`;
    }
    if (ev.tipo === "mini") {
        const modo = ev.calle ? "entreno" : "partido";
        return `<a class="btn eleccion" data-juego="${esc(ev.juego)}" data-modo="${modo}" href="${esc(linkJuego(ev.juego, modo))}">${etiquetaJuego(ev)}</a>`;
    }
    if (ev.forzado) {
        return `<button class="btn eleccion" data-op="0">Me retiro</button>`;
    }
    return `<button class="btn eleccion" data-op="0">Me retiro</button>
            <button class="btn ghost eleccion" data-op="1">Un año más</button>`;
}

function fijarStats() {
    const base = Object.assign({}, BASES[state.posicion] || BASES.PG);
    const ajuste = (estiloActual() && estiloActual().ajuste) || {};
    Object.keys(ajuste).forEach((campo) => {
        base[campo] = clamp((Number(base[campo]) || 0) + Number(ajuste[campo] || 0), 24, 99);
    });
    state.stats = base;
}

async function comenzarAJugar() {
    const campo = document.querySelector("#nombre");
    if (campo) state.nombre = campo.value;
    const error = validarArmar();
    if (error) {
        state.error = error;
        render();
        return;
    }
    const respaldo = JSON.parse(JSON.stringify(state));
    const cuerpo = { PG: [188, 82], SG: [196, 90], SF: [203, 98], PF: [208, 107], C: [213, 115] }[state.posicion] || [196, 90];
    const campoCiudad = document.querySelector("#ciudad");
    const campoDorsal = document.querySelector("#dorsal");
    if (campoCiudad) state.ciudad = campoCiudad.value.trim();
    if (campoDorsal) state.dorsal = campoDorsal.value;
    state.tez = "#a96f48";
    state.cabello = "h1";
    state.edad = 19;
    state.altura = cuerpo[0];
    state.peso = cuerpo[1];
    state.dorsal = String(state.dorsal || "11").replace(/\D/g, "").slice(0, 2) || "11";
    state.ciudad = state.ciudad || "Buenos Aires";
    state.origen = "calle";
    state.equipoId = null;
    state.conferencia = "";
    state.calibre = 46;
    state.crecimiento = { edad: 19, usado: 0 };
    fijarStats();
    state.quimica = 58;
    state.hinchada = 58;
    state.puntosCarrera = 0;
    state.asistenciasCarrera = 0;
    state.titulos = 0;
    state.traidor = false;
    state.mercenario = false;
    state.plusSalario = 0;
    state.extra = false;
    state.esperando = null;
    state.flash = "";
    state.turno = 0;
    state.temporada = 1;
    state.rival = { nombre: "EL ELEGIDO", puntos: 18, titulos: 0 };
    state.rivalClubId = null;
    state.trofeos = TROFEOS_BASE.map((nombre) => ({ nombre, cantidad: 0 }));
    state.trayectoria = [];
    state.calendario = [];
    state.partidos = 0;
    state.victorias = 0;
    state.renegocioEn = null;
    state.id = null;
    state.revision = 0;
    state.retirado = false;
    state.carrera = null;
    state.fase = "lobby";
    state.paso = "inicio";
    state.error = "";
    state.flash = "";
    guardarLocal();
    render();
    try {
        const res = await apiFetch("/api/guardar.php", {
            method: "POST",
            body: JSON.stringify(payload())
        });
        if (res.datos && res.datos.ok) {
            state.id = res.datos.id;
            if (res.datos.revision) state.revision = res.datos.revision;
            guardarLocal();
        } else if (res.status === 422 || res.status === 403) {
            state = respaldo;
            state.fase = "crear";
            state.paso = "armar";
            state.error = (res.datos && res.datos.error) || "No pude crear el jugador.";
            guardarLocal();
            render();
        } else {
            state.flash = "La ficha quedó en este teléfono.";
            render();
        }
    } catch (falla) {
        state.flash = "No pude guardar en la cuenta. Quedó en este teléfono.";
        render();
    }
}

function payload() {
    return {
        id: state.id,
        nombre: state.nombre.trim(),
        posicion: state.posicion,
        equipoId: state.equipoId,
        stats: state.stats,
        tez: state.tez,
        cabello: state.cabello,
        edad: state.edad,
        altura: state.altura,
        peso: state.peso,
        ciudad: state.ciudad,
        dorsal: state.dorsal,
        origen: state.origen,
        campus: state.campus,
        estiloId: state.estiloId,
        habilidades: state.habilidades,
        quimica: state.quimica,
        trayectoria: state.trayectoria,
        trofeos: state.trofeos,
        cobradas: state.cobradas,
        hinchada: state.hinchada,
        puntosCarrera: state.puntosCarrera,
        asistenciasCarrera: state.asistenciasCarrera,
        titulos: state.titulos,
        traidor: state.traidor,
        mercenario: state.mercenario,
        rival: state.rival,
        rivalClubId: state.rivalClubId,
        turno: state.turno,
        temporada: state.temporada,
        calendario: state.calendario,
        plusSalario: state.plusSalario,
        calibre: state.calibre,
        partidos: state.partidos,
        victorias: state.victorias,
        fase: state.fase,
        revision: state.revision || 0,
        crecimiento: state.crecimiento || { edad: state.edad || 19, usado: 0 },
        retirado: !!state.retirado,
        partidas: state.partidas || 0,
        tipo: state.tipo || "novato",
        dificultad: state.dificultad || "baja",
        estrellaId: state.estrellaId || null,
        ligaOrigen: state.ligaOrigen || null,
        clubOrigen: state.clubOrigen || null,
        ppgPrevio: state.ppgPrevio,
        rpgPrevio: state.rpgPrevio,
        apgPrevio: state.apgPrevio,
        notaPrevia: state.notaPrevia || "",
        carrera: state.carrera || null
    };
}

let guardando = false;
let guardarOtra = false;

async function engancharCarrera() {
    const res = await apiFetch("/api/sesion");
    const jugadores = (res.datos && res.datos.jugadores) || [];
    const mismo = jugadores.find((jugador) => !jugador.retiro && jugador.nombre === state.nombre.trim());
    if (!mismo) return false;
    const ficha = await apiFetch("/api/carrera/" + mismo.id);
    if (!ficha.datos || !ficha.datos.ok || !ficha.datos.ficha) return false;
    state.id = mismo.id;
    state.revision = ficha.datos.ficha.revision || 0;
    return true;
}

async function persistir() {
    guardarLocal();
    if (!state.nombre) return;
    if (guardando) {
        guardarOtra = true;
        return;
    }
    guardando = true;
    try {
        const res = await apiFetch("/api/guardar.php", {
            method: "POST",
            body: JSON.stringify(payload())
        });
        if (res.status === 409 && res.datos && res.datos.ficha) {
            state.conflicto = {
                revision: res.datos.revision,
                ficha: res.datos.ficha
            };
            state.flash = "Hay otra partida más nueva en la cuenta. Elegí cuál queda.";
            render();
        } else if (!state.id && res.status === 422 && /carrera activa|otro jugador/i.test((res.datos && res.datos.error) || "")) {
            if (await engancharCarrera()) guardarOtra = true;
            else {
                state.flash = res.datos.error;
                render();
            }
        } else if (res.datos && res.datos.ok && res.datos.id) {
            state.id = res.datos.id;
            if (res.datos.revision) state.revision = res.datos.revision;
            state.conflicto = null;
        } else if (res.datos && res.datos.error) {
            state.flash = res.datos.error;
            render();
        }
        guardarLocal();
    } catch (falla) {
        if (!state.id) {
            state.flash = "La ficha sigue en este teléfono. La vuelvo a guardar cuando haya conexión.";
            render();
        }
    } finally {
        guardando = false;
        if (guardarOtra) {
            guardarOtra = false;
            persistir();
        }
    }
}

function premiosGuardados() {
    let lista = [];
    try { lista = JSON.parse(localStorage.getItem("rookie-recompensas") || "[]"); } catch (error) { lista = []; }
    if (!Array.isArray(lista)) lista = [];
    if (!lista.length) {
        try {
            const uno = JSON.parse(localStorage.getItem("rookie-recompensa") || "null");
            if (uno) lista = [uno];
        } catch (error) { lista = []; }
    }
    return lista;
}

function cobrarRecompensa() {
    const lista = premiosGuardados();
    if (!lista.length || !state.stats) return;
    if (!state.nombre || state.fase === "crear") return;
    localStorage.removeItem("rookie-recompensas");
    localStorage.removeItem("rookie-recompensa");
    lista.forEach((premio) => {
        if (!premio || state.cobradas.includes(premio.id)) return;
        state.cobradas.push(premio.id);
        if (state.esperando === "partido") cobrarPrima(!!premio.gano);
        else if (state.esperando === "carrera") cobrarEntrenoCarrera(!!premio.gano, premio.juego);
        else cobrarEntreno(!!premio.gano, premio.juego);
    });
}

function aplicarSubida(campo, cuanto) {
    if (!state.stats || !campo || cuanto <= 0) return 0;
    const actual = Number(state.stats[campo]) || 0;
    if (actual >= 99) return 0;
    const sube = Math.min(cuanto, 99 - actual);
    state.stats[campo] = actual + sube;
    return sube;
}

function sumarCalibre(n) {
    if (n <= 0) return 0;
    const actual = Number(state.calibre) || 46;
    if (actual >= 99) return 0;
    const sube = Math.min(n, 99 - actual);
    state.calibre = actual + sube;
    return sube;
}

function madurar() {
    if (state.stats) {
        ["velocidad", "tiro", "fuerza", "control", "defensa"].forEach((campo) => {
            const actual = Number(state.stats[campo]) || 0;
            if (actual < 99) state.stats[campo] = Math.min(99, actual + 2);
        });
    }
    const cal = Number(state.calibre) || 46;
    if (cal < 99) state.calibre = Math.min(99, cal + 2);
    if (typeof reflejarCalibre === "function") reflejarCalibre();
    return "Cumpliste un año. Las habilidades suman.";
}

function textoTope() {
    return "Esa habilidad ya está en 99.";
}

function textoCrecimiento() {
    return "";
}

function subirStat(juego, cuanto) {
    const mapa = {
        reflejos: "velocidad",
        simon: "control",
        memoria: "tiro",
        defensa: "defensa",
        tiro: "tiro",
        pase: "control",
        dribling: "velocidad"
    };
    const clave = mapa[juego];
    if (!clave || !state.stats) return { nombre: "", sube: 0 };
    const antes = Number(state.stats[clave]) || 0;
    const sube = aplicarSubida(clave, cuanto);
    if (clave === "defensa" && antes < 80 && state.stats.defensa >= 80) sumarTrofeo("MEJOR DEFENSOR");
    const nombre = { velocidad: "Velocidad", control: "Control", tiro: "Tiro", defensa: "Defensa" }[clave] || "";
    return { nombre: nombre, sube: sube };
}

function pasoCalibre(gano) {
    return gano ? 1 : 0;
}

function nivelManager() {
    const lista = (state.cuenta && state.cuenta.jugadores) || [];
    let maximo = 0;
    lista.forEach((jugador) => {
        maximo = Math.max(maximo, Number(jugador.calibre) || 0);
    });
    if (state.nombre) maximo = Math.max(maximo, Number(state.calibre) || 0);
    if (!maximo) return 1;
    return 1 + Math.max(0, Math.floor((maximo - 46) / 8));
}

function avisoNivel() {
    const user = state.cuenta && state.cuenta.user;
    if (!user || !user.manager) return "";
    user.nivel = nivelManager();
    return " Manager nivel " + user.nivel + ".";
}

function cobrarEntreno(gano, juego) {
    state.esperando = null;
    state.partidas = (state.partidas || 0) + 1;
    const resultado = gano ? subirStat(juego, 2) : { nombre: "", sube: 0 };
    const cal = sumarCalibre(pasoCalibre(gano));
    if (!gano) {
        state.flash = "No llegaste a la meta. El calibre sigue en " + state.calibre + ".";
    } else if (!resultado.sube && !cal) {
        state.flash = textoTope();
    } else {
        const habilidad = resultado.sube ? resultado.nombre + " +" + resultado.sube + ". " : "Esa habilidad ya está en 99. ";
        state.flash = habilidad + "Calibre " + state.calibre + (cal ? " (+" + cal + ")." : ".") + avisoNivel();
    }
    state.fase = "entrenar";
    persistir();
    render();
}

function cobrarPrima(gano) {
    state.esperando = null;
    state.partidos = (state.partidos || 0) + 1;
    state.partidas = (state.partidas || 0) + 1;
    if (gano) {
        state.victorias = (state.victorias || 0) + 1;
        const prima = (state.equipoId ? 0.4 : 0.15) + (state.calibre || 46) / 200;
        state.plusSalario += prima;
        state.hinchada = clamp(state.hinchada + 8, 0, 100);
        state.puntosCarrera += 16;
        sumarCalibre(1);
        state.flash = state.equipoId
            ? "Prima: US$ " + prima.toFixed(1) + "M. El sueldo queda en US$ " + salario() + "M." + avisoNivel()
            : "Te vieron en la calle. Esa prima entra cuando firmes." + avisoNivel();
        if (state.equipoId && state.victorias % 4 === 0) {
            state.plusSalario += 0.4;
            state.flash += " Renovación del contrato.";
        }
    } else {
        state.hinchada = clamp(state.hinchada - 4, 0, 100);
        state.puntosCarrera += 4;
        state.flash = "Sin prima. El partido se escapó.";
    }
    if (state.partidos % 10 === 0) {
        state.temporada += 1;
        state.edad += 1;
        state.flash += " Temporada " + state.temporada + ". " + madurar();
    }
    state.quimica = state.hinchada;
    state.fase = "lobby";
    persistir();
    render();
}

function juegoPartido() {
    return ["reflejos", "memoria", "simon", "defensa"][(state.partidos || 0) % 4];
}

function textoLobby() {
    const eq = equipoActual();
    const ofertas = equiposAlAlcance();
    if (!eq) {
        if (!ofertas.length) {
            const piso = pisoDe();
            const nba = pisoDe("NBA");
            return "Estás en la calle. Entrená para subir el calibre. Un club llama desde " + (piso || 54) + ". La NBA, desde " + (nba || 78) + ".";
        }
        return "Hay ofertas para tu calibre " + state.calibre + ". Podés firmar y empezar la carrera.";
    }
    return "Contrato con " + eq.nombre + "." + (ofertas.length ? " Hay un club mejor mirándote." : "");
}

function resolverMinijuego(gano) {
    const ev = eventoActual();
    state.esperando = null;
    if (gano) {
        state.hinchada = clamp(state.hinchada + 12, 0, 100);
        state.puntosCarrera += ev && ev.copa ? 32 : 26;
        state.asistenciasCarrera += 6;
        state.flash = "Ganaste.";
        if (ev && ev.copa) {
            const liga = ligaDe(equipoActual());
            if (liga === "NBA") {
                sumarTrofeo("CAMPEÓN NBA");
                sumarTrofeo("ANILLO DE CAMPEÓN");
                if (ovr() >= 80) sumarTrofeo("MVP FINALES");
            } else if (liga === "LNB") {
                sumarTrofeo("CAMPEÓN LNB");
            } else if (liga === "NCAA") {
                sumarTrofeo("CAMPEÓN NCAA");
            }
            if (liga !== "CALLE") state.titulos += 1;
            state.flash = liga === "NBA" ? "Campeón de la NBA." : "Ganaste la final.";
        }
        if (ev && ev.allstar) {
            sumarTrofeo("ALL-STAR");
            state.flash = "All-Star. Tu nombre entró en la lista.";
        }
        state.rival.puntos += 8;
    } else {
        state.hinchada = clamp(state.hinchada - 8, 0, 100);
        state.rival.puntos += 20;
        if (ev && ev.copa) state.rival.titulos += 1;
        state.flash = "Se escapó el partido.";
    }
    const cal = sumarCalibre(gano ? 1 : 0);
    state.flash += cal ? " Calibre " + state.calibre + " (+" + cal + ")." : " El calibre sigue en " + state.calibre + ".";
    state.quimica = state.hinchada;
    avanzar();
}

function sumarTrofeo(nombre) {
    let trofeo = state.trofeos.find((item) => item.nombre === nombre);
    if (!trofeo) {
        trofeo = { nombre, cantidad: 0 };
        state.trofeos.push(trofeo);
    }
    trofeo.cantidad += 1;
}

function puntajeCarrera() {
    return ovr() * 10 + state.hinchada + state.titulos * 40 + state.puntosCarrera + (state.traidor ? -30 : 15);
}

function fraseLeyenda() {
    const yo = state.puntosCarrera;
    const el = state.rival.puntos;
    if (state.traidor) {
        return "Te fuiste con plata y con la hinchada en contra. El Elegido se quedó con el respeto.";
    }
    if (state.titulos > state.rival.titulos && yo >= el) {
        return "Superaste a El Elegido. Tu nombre queda al lado de las leyendas del aro.";
    }
    if (state.titulos > 0) {
        return "Te fuiste con anillo. El Elegido cerró con " + el + " puntos y " + state.rival.titulos + " títulos.";
    }
    if (yo > el) return "Le ganaste el mano a mano en puntos, pero el anillo quedó lejos.";
    return "El Elegido cerró arriba: " + el + " puntos y " + state.rival.titulos + " títulos. Tu historia quedó a un paso.";
}

function clubesTexto() {
    const unicos = [];
    state.trayectoria.forEach((parada) => {
        if (parada.nombre && !unicos.includes(parada.nombre)) unicos.push(parada.nombre);
    });
    if (!unicos.length) return "No llegaste a vestir una camiseta.";
    if (unicos.length === 1) return "Todo el camino lo hiciste en " + unicos[0] + ".";
    return "Pasaste por " + unicos.join(", ") + ".";
}

function cabeza(derecha) {
    return `<div class="top"><b class="brand">THE ROOKIE</b><div class="paso">${derecha}</div></div>`;
}

function fraseBtn(clave, hueco) {
    const lista = FRASES[clave] || FRASES.inicio;
    const semilla = hashTexto(clave + "|" + (state.nombre || "") + "|" + (state.partidas || 0));
    let frase = lista[semilla % lista.length];
    const esManager = state.cuenta && state.cuenta.user && state.cuenta.user.manager;
    if (clave === "cuenta" && !esManager) {
        frase = ["El que entrena cuando nadie mira, llega.", "John Wooden", "entrenar", "Volver a entrenar"];
    }
    if (!(state.cuenta && state.cuenta.user) && frase[2] === "empezar") {
        frase = [frase[0], frase[1], "portada", "Entrá para armar"];
    }
    const boton = `<button class="cita-ir" data-accion="${esc(frase[2])}"><span class="cita">"${esc(frase[0])}"</span><small>${esc(frase[1])} · ${esc(frase[3])}</small></button>`;
    if (hueco === false) return boton;
    return `<div class="hueco">${boton}</div>`;
}

function lineaNumeros(ppg, rpg, apg) {
    const partes = [];
    if (ppg != null && ppg !== "") partes.push(Number(ppg).toFixed(1) + " PTS");
    if (rpg != null && rpg !== "") partes.push(Number(rpg).toFixed(1) + " REB");
    if (apg != null && apg !== "") partes.push(Number(apg).toFixed(1) + " AST");
    return partes.join(" · ");
}

function textoDificultad(dificultad) {
    if (dificultad === "alta") return "Alta";
    if (dificultad === "media") return "Media";
    return "Fácil";
}

function ligaAbierta(liga) {
    const pide = liga === "NBA" ? 6 : (liga === "LNB" ? 4 : 2);
    const user = state.cuenta && state.cuenta.user;
    if (!user || !user.manager) return false;
    return nivelManager() >= pide;
}

function bloqueFicha() {
    const estilo = estiloActual();
    const [nombreRol, detalleRol] = rol();
    const s = state.stats || BASES[state.posicion] || BASES.PG;
    const skills = [
        ["CALIBRE", state.calibre || 46],
        ["TIRO", s.tiro],
        ["VELOCIDAD", s.velocidad],
        ["FUERZA", s.fuerza],
        ["CONTROL", s.control],
        ["DEFENSA", s.defensa]
    ];
    const htmlSkills = skills.map(([nombre, valor]) =>
        `<div class="statline"><span>${nombre}</span><b class="num">${valor}</b></div>`
    ).join("");
    const ganadas = state.trofeos.filter((trofeo) => trofeo.cantidad > 0);
    const copas = (ganadas.length ? ganadas : state.trofeos.slice(0, 4)).map((trofeo) =>
        `<div class="trofeo"><span>${esc(trofeo.nombre)}</span><b class="num">x${trofeo.cantidad}</b></div>`
    ).join("");
    const tags = (estilo ? [estilo.titulo].concat(estilo.tags) : []).concat(state.habilidades)
        .map((tag) => `<i>${esc(tag)}</i>`).join("");
    const previa = lineaNumeros(state.ppgPrevio, state.rpgPrevio, state.apgPrevio) || state.notaPrevia;
    const antes = state.tipo === "profesional" && previa
        ? `<p class="nota">Antes de contratarte${state.clubOrigen ? ", en " + esc(state.clubOrigen) : ""}: ${esc(previa)}.</p>`
        : "";
    const crecimiento = textoCrecimiento();
    return `<div class="caja"><h2>ATRIBUTOS</h2><div class="attrs">${htmlSkills}</div>${crecimiento ? `<p class="nota">${esc(crecimiento)}</p>` : ""}</div>
        <div class="caja"><h2>ROL · ${state.equipoId ? "US$ " + salario() + "M" : "SIN CONTRATO"}</h2><strong class="gold">${esc(nombreRol)}</strong><p class="nota">${esc(detalleRol)}</p><div class="tags">${tags}</div></div>
        <div class="caja"><h2>VITRINA</h2><div class="copas">${copas}</div>${ganadas.length ? "" : `<p class="nota">La vitrina espera el primer título.</p>`}</div>
        ${antes}`;
}

function historialVisible() {
    const cuenta = state.cuenta || {};
    if (cuenta.user && cuenta.historial) return cuenta.historial;
    return {
        carreras: state.nombre ? 1 : 0,
        partidas: state.partidas || 0,
        partidos: state.partidos || 0,
        victorias: state.victorias || 0
    };
}

function botonGoogle() {
    if (!state.cuenta || !state.cuenta.google) return "";
    return `<a class="btn ghost google" href="/auth/google"><span class="logo-google" aria-hidden="true"><svg viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg></span>Entrar con Google</a>`;
}

function identidadCuenta(user) {
    if (!user) return "";
    return user.usuario || user.email || "";
}

function cuerpoIdentidad() {
    const escrito = borrador.correo.trim();
    if (escrito.indexOf("@") !== -1) return { email: escrito };
    return { usuario: escrito };
}

function formularioAcceso() {
    const rojo = (id) => authMalos.indexOf(id) !== -1 ? " malo" : "";
    // Recuperar la clave: sirve el usuario inventado o el email de una cuenta anterior.
    if (authModo === "olvido") {
        return `<div class="login">
            <input class="campo${rojo("correo")}" id="correo" type="text" maxlength="190" autocomplete="username" placeholder="Usuario o email" value="${esc(borrador.correo)}">
            <button class="btn" type="button" data-accion="pedir-codigo">Mandar código</button>
            <button class="btn ghost" type="button" data-accion="modo-entrar">Volver a entrar</button>
        </div>`;
    }
    if (authModo === "codigo") {
        return `<div class="login">
            <input class="campo${rojo("correo")}" id="correo" type="text" maxlength="190" autocomplete="username" placeholder="Usuario o email" value="${esc(borrador.correo)}">
            <input class="campo${rojo("codigo")}" id="codigo" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="Código" value="${esc(borrador.codigo)}">
            <input class="campo${rojo("clave")}" id="clave" type="password" maxlength="64" autocomplete="new-password" placeholder="Contraseña nueva" value="${esc(borrador.clave)}">
            <button class="btn" type="button" data-accion="restablecer">Guardar contraseña</button>
            <button class="btn ghost" type="button" data-accion="modo-entrar">Volver a entrar</button>
        </div>`;
    }
    // Portada: la persona crea su usuario y su contraseña. No hace falta una cuenta entregada.
    return `<div class="login">
        <p class="nota">Elegí un usuario y una contraseña. La cuenta queda creada al instante.</p>
        <input class="campo${rojo("correo")}" id="correo" type="text" maxlength="190" autocomplete="username" placeholder="Usuario" value="${esc(borrador.correo)}">
        <input class="campo${rojo("clave")}" id="clave" type="password" maxlength="64" autocomplete="current-password" placeholder="Contraseña" value="${esc(borrador.clave)}">
        <button class="btn" type="button" data-accion="crear-correo">Crear cuenta</button>
        <button class="btn ghost" type="button" data-accion="entrar-correo">Entrar</button>
        <button class="btn ghost" type="button" data-accion="modo-olvido">Olvidé mi contraseña</button>
        ${botonGoogle()}
    </div>`;
}

function pantallaInicio() {
    const cuenta = state.cuenta || { google: false, user: null };
    const saludo = cuenta.user ? `<p class="nota">${esc(cuenta.user.nombre)}${identidadCuenta(cuenta.user) ? " · " + esc(identidadCuenta(cuenta.user)) : ""}</p>` : "";
    const acceso = cuenta.user ? "" : formularioAcceso();
    return `<section class="screen">
        ${cabeza("8 BIT")}
        <div class="body">
            <div class="home-centro">
                ${fraseBtn("inicio", false)}
                <p class="lead">Arrancás en la vereda, sin club. El calibre abre la NBA.</p>
                <h1>CAMINO A LA<br><span>LEYENDA</span></h1>
                <p class="cita">"No es solo un juego, es mi vida"</p>
                ${saludo}
                ${acceso}
                ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
            </div>
        </div>
        <div class="actions columna">
            ${cuenta.user ? `<button class="btn" data-accion="empezar">Comenzar</button>` : ""}
            <button class="btn ghost" data-accion="como">¿Cómo jugar?</button>
        </div>
    </section>`;
}

function pantallaComo() {
    return `<section class="screen">
        ${cabeza("GUIA")}
        <div class="body">
            <h1>COMO<br><span>JUGAR</span></h1>
            <div class="opciones">
                <div class="caja"><h2>01 ARMAR</h2><p class="lead">Nombre, puesto, estilo y dos habilidades. Arrancás en la calle.</p></div>
                <div class="caja"><h2>02 ENTRENO</h2><p class="lead">Si cumplís la meta, esa habilidad sube. Podés seguir mejorando.</p></div>
                <div class="caja"><h2>03 CARRERA</h2><p class="lead">Sorteo en la LNB, año local y draft. En el partido elegís tirar, pasar o penetrar.</p></div>
                <div class="caja"><h2>04 OFERTAS</h2><p class="lead">Un club llama cuando tu calibre llega a su piso. La NBA es la liga más alta.</p></div>
            </div>
            ${fraseBtn("como")}
        </div>
        <div class="actions">
            ${(state.cuenta && state.cuenta.user) ? `<button class="btn" data-accion="empezar">Armar jugador</button>` : `<button class="btn" data-accion="portada">Entrá para armar</button>`}
        </div>
    </section>`;
}

function pantallaArmar() {
    const estilos = state.posicion ? estilosDe(state.posicion) : [];
    if (state.estiloId && !estilos.some((item) => item.id === state.estiloId)) state.estiloId = "";
    const elegido = estilos.find((item) => item.id === state.estiloId);
    const botonesPos = Object.entries(POSICIONES).map(([codigo]) =>
        `<button class="opcion ${state.posicion === codigo ? "sel" : ""}" data-set="posicion" data-valor="${codigo}"><strong>${codigo}</strong></button>`
    ).join("");
    const botonesEstilo = estilos.map((estilo) =>
        `<button class="opcion ${state.estiloId === estilo.id ? "sel" : ""}" data-set="estiloId" data-valor="${estilo.id}"><strong>${esc(estilo.titulo)}</strong><span>${esc(estilo.corto)}</span></button>`
    ).join("");
    const botonesHab = HABILIDADES.map((nombre) =>
        `<button class="chip ${state.habilidades.includes(nombre) ? "sel" : ""}" data-hab="${esc(nombre)}">${esc(nombre)}</button>`
    ).join("");
    return `<section class="screen">
        ${cabeza("ARMAR")}
        <div class="body">
            <h1>ARMA TU<br><span>JUGADOR</span></h1>
            <input class="campo" id="nombre" maxlength="14" autocomplete="off" value="${esc(state.nombre)}" placeholder="Tu nombre">
            <input class="campo" id="ciudad" maxlength="40" autocomplete="off" value="${esc(state.ciudad || "")}" placeholder="Ciudad">
            <input class="campo" id="dorsal" inputmode="numeric" maxlength="2" autocomplete="off" value="${esc(state.dorsal || 11)}" placeholder="Dorsal">
            <div class="pos-row">${botonesPos}</div>
            <p class="nota">${state.posicion ? esc(POSICIONES[state.posicion]) : "Elegí tu puesto."} Arrancás con 19 años.</p>
            <h2>COMO JUEGO</h2>
            ${estilos.length ? `<div class="opciones">${botonesEstilo}</div><p class="nota">${esc(elegido ? elegido.texto + " No se puede cambiar después." : "Elegí un estilo de este puesto. No se puede cambiar después.")}</p>` : `<p class="nota">Elegí un puesto para ver tus estilos.</p>`}
            <h2>HABILIDADES ${state.habilidades.length}/2</h2>
            <div class="chips">${botonesHab}</div>
            <p class="aviso ${state.error ? "on" : ""}">${esc(state.error)}</p>
            ${fraseBtn("armar")}
        </div>
        <div class="actions">
            <button class="btn ghost" data-accion="inicio">Volver</button>
            <button class="btn" data-accion="jugar">Jugar</button>
        </div>
    </section>`;
}

function hud() {
    const sueldo = state.equipoId ? salario() : "SIN";
    return `<div class="hud">
        <div><span>HINCHADA</span><b>${state.hinchada}</b></div>
        <div><span>CALIBRE</span><b>${state.calibre || 46}</b></div>
        <div><span>SUELDO</span><b>${sueldo}</b></div>
        <div><span>PARTIDOS</span><b>${state.partidos || 0}</b></div>
    </div>`;
}

function pantallaLobby() {
    const eq = equipoActual();
    const box = boxScore();
    const ofertas = equiposAlAlcance();
    return `<section class="screen">
        ${cabeza(`<button class="link" data-accion="cuenta">CUENTA</button>`)}
        <div class="body">
            <div class="ficha-top">
                <div class="ovr">${state.calibre || 46}<small>CAL</small></div>
                <div>
                    <div class="nombre-jugador">${esc(state.nombre.trim())} · ${esc(state.dorsal)}</div>
                    <p class="subficha">${esc(POSICIONES[state.posicion] || "")} · ${esc(etiquetaClub(eq))} · ${state.edad} años<br>${esc(state.ciudad)} · ${(state.altura / 100).toFixed(2)} m · ${state.peso} kg</p>
                </div>
                ${marcaLogo(eq)}
            </div>
            ${hud()}
            ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
            <p class="lead">${esc(textoLobby())}</p>
            ${numerosVisibles()}
            ${bloqueFicha()}
            ${fraseBtn("lobby")}
        </div>
        <div class="actions columna">
            <button class="btn" data-accion="entrenar">Entrenar</button>
            <button class="btn" data-accion="ofertas">Ofertas${ofertas.length ? " · " + ofertas.length : ""}</button>
            <button class="btn" data-accion="modocarrera">Modo carrera</button>
        </div>
    </section>`;
}

function pantallaEntrenar() {
    const lista = ENTRENOS.map((juego) =>
        `<a class="opcion" data-juego="${esc(juego.id)}" data-modo="entreno" href="${esc(linkJuego(juego.id, "entreno"))}"><strong>${esc(juego.titulo)}</strong><span>${esc(juego.stat)} · ${esc(juego.detalle)}</span></a>`
    ).join("");
    return `<section class="screen">
        ${cabeza("GYM")}
        <div class="body">
            <h1>ENTRENAR</h1>
            <p class="lead">${esc(state.nombre || "Tu jugador")} · dificultad ${esc(textoDificultad(state.dificultad))}. Si cumplís la meta, esa habilidad sube 2. Si no llegás, no sube.</p>
            ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
            <div class="opciones">${lista}</div>
            ${fraseBtn("entrenar")}
        </div>
        <div class="actions columna">
            <button class="btn ghost" data-accion="lobby">Volver</button>
        </div>
    </section>`;
}

function pantallaOfertas() {
    const lista = equiposAlAlcance();
    const nba = pisoDe("NBA");
    let lead = "Tu calibre es " + (state.calibre || 46) + ". Ningún club te llama todavía. Entrená y volvé. La NBA abre en " + (nba || 78) + ".";
    if (!equipos.length) lead = "No pude leer los clubes. Volvé al lobby e intentá de nuevo.";
    else if (lista.length) lead = "Tu calibre es " + state.calibre + ". " + lista[0].nombre + " (" + lista[0].liga + ") pide " + lista[0].minima + ".";
    const botones = lista.map((eq) =>
        `<button class="btn eleccion" data-club="${eq.id}">${esc(eq.nombre)} · ${esc(eq.liga)} ${eq.minima}</button>`
    ).join("");
    const renegociar = state.equipoId && state.renegocioEn !== state.partidos
        ? `<button class="btn ghost" data-accion="renegociar">Renegociar sueldo</button>`
        : "";
    return `<section class="screen">
        ${cabeza("CLUBES")}
        <div class="body">
            <h1>OFERTAS</h1>
            <p class="lead">${esc(lead)}</p>
            ${fraseBtn("ofertas")}
        </div>
        <div class="actions columna">
            ${botones}
            ${renegociar}
            <button class="btn ghost" data-accion="lobby">Volver al lobby</button>
        </div>
    </section>`;
}

function pantallaCarrera() {
    const ev = eventoActual();
    if (!ev) return pantallaLobby();
    const eq = equipoActual();
    const box = boxScore();
    return `<section class="screen">
        ${cabeza(`<button class="link" data-accion="ficha">FICHA</button>`)}
        <div class="body">
            <div class="ficha-top">
                <div class="ovr">${ovr()}<small>${esc(state.posicion)}</small></div>
                <div>
                    <div class="nombre-jugador">${esc(state.nombre.trim())}</div>
                    <p class="subficha">${esc(POSICIONES[state.posicion] || "")} · ${esc(etiquetaClub(eq))} · ${state.edad} años</p>
                </div>
                ${marcaLogo(eq)}
            </div>
            ${hud()}
            ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
            <h1>${esc(ev.titulo)}</h1>
            <p class="lead">${esc(textoDe(ev))}</p>
            <p class="nums">${box.ppg}<small>PTS</small> ${box.ast}<small>AST</small></p>
        </div>
        <div class="actions columna">${botonesDe(ev)}</div>
    </section>`;
}

function pantallaFicha() {
    const eq = equipoActual();
    const estilo = estiloActual();
    const [nombreRol] = rol();
    const box = boxScore();
    const s = state.stats || BASES.PG;
    const skills = [
        ["CALIBRE", state.calibre || 46],
        ["TIRO", s.tiro],
        ["VELOCIDAD", s.velocidad],
        ["FUERZA", s.fuerza],
        ["CONTROL", s.control],
        ["DEFENSA", s.defensa]
    ];
    const htmlSkills = skills.map(([nombre, valor]) =>
        `<div class="statline"><span>${nombre}</span><b class="num">${valor}</b></div>`
    ).join("");
    const copas = state.trofeos.map((trofeo) =>
        `<div class="trofeo"><span>${esc(trofeo.nombre)}</span><b class="num">x${trofeo.cantidad}</b></div>`
    ).join("");
    const tags = (estilo ? [estilo.titulo].concat(estilo.tags) : []).concat(state.habilidades)
        .map((tag) => `<i>${esc(tag)}</i>`).join("");
    const frase = eq && eq.abreviatura === "GSW" ? " · DUB NATION" : "";
    return `<section class="screen ficha">
        ${cabeza("FICHA")}
        <div class="body">
            <div class="ficha-top">
                <div class="ovr">${ovr()}<small>${esc(state.posicion)}</small></div>
                <div>
                    <div class="nombre-jugador">${esc(state.nombre.trim())} · ${esc(state.dorsal)}</div>
                    <p class="subficha">${esc(etiquetaClub(eq))}${frase}<br>${esc(state.ciudad)} · ${state.edad} años · ${(state.altura / 100).toFixed(2)} m · ${state.peso} kg</p>
                </div>
                ${marcaLogo(eq)}
            </div>
            <p class="nums">${box.ppg}<small>PTS</small> ${box.reb}<small>REB</small> ${box.ast}<small>AST</small></p>
            <div class="caja"><h2>ATRIBUTOS</h2><div class="attrs">${htmlSkills}</div></div>
            <div class="caja"><h2>ROL · ${state.equipoId ? "US$ " + salario() + "M" : "SIN CONTRATO"}</h2><strong class="gold">${esc(nombreRol)}</strong><div class="tags">${tags}</div></div>
            <div class="caja"><h2>VITRINA</h2><div class="copas">${copas}</div></div>
            <p class="cita">"${CITA}"</p>
        </div>
        <div class="actions">
            <button class="btn" data-accion="lobby">Volver</button>
        </div>
    </section>`;
}

function pantallaRetiro() {
    const marca = state.traidor ? "Traidor" : (state.mercenario ? "Mercenario" : "Ídolo");
    const aviso = state.confirmarCierre
        ? `<p class="flash">Cerrar la cuenta borra tu perfil y todas las carreras.</p>`
        : `<p class="lead">La carrera de jugador terminó. ¿Cerrás la cuenta o seguís de manager?</p>`;
    return `<section class="screen">
        ${cabeza("FIN")}
        <div class="body">
            <h1>EL<br><span>RETIRO</span></h1>
            <p class="lead">${esc(clubesTexto())}</p>
            <p class="nums">${puntajeCarrera()}<small>SCORE</small></p>
            <div class="caja">
                <div class="statline"><span>Puntos</span><b class="num">${state.puntosCarrera}</b></div>
                <div class="statline"><span>Asistencias</span><b class="num">${state.asistenciasCarrera}</b></div>
                <div class="statline"><span>Títulos</span><b class="num">${state.titulos}</b></div>
                <div class="statline"><span>Hinchada</span><b class="num">${state.hinchada}</b></div>
                <div class="statline"><span>El Elegido</span><b class="num">${state.rival.puntos} pts</b></div>
                <div class="statline"><span>Calibre</span><b class="num">${state.calibre || 46}</b></div>
                <div class="statline"><span>Marca</span><b class="num">${esc(marca)}</b></div>
                <div class="statline"><span>Partidas</span><b class="num">${state.partidas || 0}</b></div>
            </div>
            ${state.stats ? bloqueFicha() : ""}
            <p class="cita">${esc(fraseLeyenda())}</p>
            ${aviso}
            ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
            ${fraseBtn("retiro")}
        </div>
        <div class="actions columna">
            ${botonesRetiro()}
        </div>
    </section>`;
}

function botonesRetiro() {
    const cuenta = state.cuenta || { google: false, user: null, jugadores: [] };
    const user = cuenta.user;
    const seguir = `<button class="btn" data-accion="ser-manager">Seguir de manager</button>`;
    if (user && state.confirmarCierre) {
        return `<p class="nota">Escribí ${esc(identidadCuenta(user))} para borrar la cuenta y todas las carreras.</p>
            <input class="campo" id="cierre-email" type="text" maxlength="190" autocomplete="off" placeholder="${user.usuario ? "Usuario de la cuenta" : "Email de la cuenta"}">
            <button class="btn" data-accion="cerrar-cuenta">Sí, cerrar cuenta</button>
            <button class="btn ghost" data-accion="cuenta">No, volver</button>`;
    }
    if (user) {
        const plantel = user.manager ? `<button class="btn ghost" data-accion="cuenta">Administrar plantel</button>` : "";
        return `${seguir}
            ${plantel}
            <button class="btn ghost" data-accion="preguntar-cierre">Cerrar cuenta</button>`;
    }
    const google = cuenta.google ? botonGoogle() : "";
    return `${seguir}
        ${google}
        <button class="btn ghost" data-accion="cerrar-local">Cerrar esta partida</button>`;
}

function pantallaCuenta() {
    const cuenta = state.cuenta || { google: false, user: null, jugadores: [], historial: {} };
    const user = cuenta.user;
    const historia = historialVisible();
    const avatar = user && user.avatar
        ? `<img src="${esc(user.avatar)}" alt="">`
        : `<b class="monograma">${esc((user && user.nombre || "TU").slice(0, 2).toUpperCase())}</b>`;
    let lead = "Creá un usuario y una contraseña, o entrá si ya tenés cuenta.";
    if (user && user.manager) {
        lead = "Manager nivel " + (user.nivel || nivelManager()) + ". El calibre de tu jugador te sube. NCAA en 2, LNB en 4, NBA en 6.";
    } else if (user) {
        lead = "Podés tener más de una carrera. Cuando te retires, esta cuenta puede seguir como manager.";
    }
    const filas = (cuenta.jugadores || []).map((jugador) => {
        const marca = jugador.retiro ? "RETIRO" : "ACTIVO";
        const entrenar = jugador.retiro ? "" : `<button class="btn" data-entrenar="${jugador.id}">Entrenar</button>`;
        const partido = jugador.retiro ? "" : `<button class="btn ghost" data-carrera="${jugador.id}">Carrera</button>`;
        return `<div class="caja fila-jugador">
            <button class="opcion" data-jugador="${jugador.id}"><strong>${esc(jugador.nombre)} · ${esc(jugador.posicion)}</strong><span>${esc(marca)} · calibre ${jugador.calibre || 46}${jugador.liga ? " · " + esc(jugador.liga) : ""} · ${jugador.partidas || 0} partidas</span></button>
            <div class="fila-acciones">${entrenar}${partido}</div>
        </div>`;
    }).join("");
    const entrar = !user ? `<button class="btn" data-accion="portada">Entrar o crear cuenta</button>` : "";
    const salir = user ? `<button class="btn ghost" data-accion="salir">Cerrar sesión</button>` : "";
    const cambiarClave = user && state.mostrarClave
        ? `<input class="campo" id="clave-actual" type="password" maxlength="64" autocomplete="current-password" placeholder="Contraseña actual">
            <input class="campo" id="clave-nueva" type="password" maxlength="64" autocomplete="new-password" placeholder="Contraseña nueva">
            <button class="btn" data-accion="guardar-clave">Guardar contraseña</button>`
        : (user ? `<button class="btn ghost" data-accion="mostrar-clave">Cambiar contraseña</button>` : "");
    const mercado = user && user.manager ? `<button class="btn" data-accion="mercado">Mercado</button><button class="btn" data-accion="nuevo">Nueva estrella</button>` : "";
    const otra = user ? `<button class="btn" data-accion="nueva-carrera">Nueva carrera</button>` : "";
    const retirar = state.nombre && !state.retirado ? `<button class="btn ghost" data-accion="retirar">Colgar los botines</button>` : "";
    return `<section class="screen">
        ${cabeza("CUENTA")}
        <div class="body">
            <h1>TU<br><span>CUENTA</span></h1>
            <div class="perfil">${avatar}<div><strong class="gold">${esc(user ? user.nombre : "Invitado")}</strong><p class="nota">${esc(user ? (identidadCuenta(user) || "Cuenta lista") : "Este teléfono")}</p></div></div>
            <div class="caja">
                <h2>THE ROOKIE</h2>
                <div class="statline"><span>Veces que jugaste</span><b class="num">${historia.partidas || 0}</b></div>
                <div class="statline"><span>Carreras</span><b class="num">${historia.carreras || 0}</b></div>
                <div class="statline"><span>Partidos</span><b class="num">${historia.partidos || 0}</b></div>
                <div class="statline"><span>Victorias</span><b class="num">${historia.victorias || 0}</b></div>
            </div>
            <p class="lead">${esc(lead)}</p>
            ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
            ${filas || `<p class="nota">Todavía no hay jugadores guardados en la cuenta.</p>`}
            ${fraseBtn("cuenta")}
        </div>
        <div class="actions columna">
            ${otra}
            ${mercado}
            ${entrar}
            ${cambiarClave}
            ${retirar}
            ${salir}
            <button class="btn ghost" data-accion="lobby">Volver</button>
        </div>
    </section>`;
}

function juegoDe(jugador) {
    return ["reflejos", "memoria", "simon", "defensa"][(jugador.partidos || 0) % 4];
}

function pantallaMercado() {
    const liga = state.ligaMercado || "NCAA";
    const nivel = nivelManager();
    const abierta = ligaAbierta(liga);
    const pide = liga === "NBA" ? 6 : (liga === "LNB" ? 4 : 2);
    const chips = ["NCAA", "LNB", "NBA"].map((nombre) =>
        `<button class="chip ${liga === nombre ? "sel" : ""}" data-set="ligaMercado" data-valor="${nombre}">${nombre}</button>`
    ).join("");
    const lista = estrellas.filter((estrella) => estrella.liga === liga).map((estrella) => {
        const linea = lineaNumeros(estrella.ppg, estrella.rpg, estrella.apg) || estrella.nota;
        const traba = abierta ? "" : " bloqueado";
        return `<button class="opcion${traba}" data-fichar="${esc(estrella.id)}" ${abierta ? "" : "disabled"}><strong>${estrella.puesto}. ${esc(estrella.nombre)} · ${estrella.calibre}</strong><span>${esc(estrella.club)} · ${esc(estrella.posicion)} · ${esc(textoDificultad(estrella.dificultad))}</span><span>${esc(linea)}</span></button>`;
    }).join("");
    const aviso = abierta
        ? "Te contratan con la línea que ya traían. Después los entrenás junto con tus estrellas."
        : "Esta liga abre en nivel " + pide + ". Hoy estás en nivel " + nivel + ". Subí el calibre de tu novato.";
    return `<section class="screen">
        ${cabeza("MERCADO")}
        <div class="body">
            <h1>TE<br><span>CONTRATAN</span></h1>
            <p class="lead">Manager nivel ${nivel}. ${esc(aviso)}</p>
            ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
            <div class="chips">${chips}</div>
            <div class="opciones">${lista || `<p class="nota">No pude leer el mercado.</p>`}</div>
            ${fraseBtn("mercado")}
        </div>
        <div class="actions columna">
            <button class="btn" data-accion="nuevo">Crear estrella</button>
            <button class="btn ghost" data-accion="cuenta">Volver a la cuenta</button>
        </div>
    </section>`;
}

function contenido() {
    if (state.fase === "mercado" || state.fase === "manager") return pantallaMercado();
    if (state.fase === "cuenta") return pantallaCuenta();
    if (state.fase === "ficha") return pantallaLobby();
    if (state.retirado) return pantallaRetiro();
    if (state.fase === "modocarrera") return pantallaModoCarrera();
    if (state.fase === "entrenar") return pantallaEntrenar();
    if (state.fase === "ofertas") return pantallaOfertas();
    if (state.fase === "lobby" || state.fase === "carrera" || state.fase === "retiro") return pantallaLobby();
    if (state.paso === "armar") return pantallaArmar();
    if (state.paso === "como") return pantallaComo();
    return pantallaInicio();
}

function render() {
    aplicarTema();
    const app = document.getElementById("app");
    app.innerHTML = contenido();
    if (state.conflicto) {
        const cuerpo = app.querySelector(".body");
        if (cuerpo) {
            const aviso = document.createElement("div");
            aviso.className = "caja";
            aviso.innerHTML = `<p class="flash">Hay otra partida más nueva en la cuenta.</p>
                <button class="btn" type="button" data-accion="quedarme">Quedarme con esta</button>
                <button class="btn ghost" type="button" data-accion="cargar-servidor">Cargar la de la cuenta</button>`;
            cuerpo.prepend(aviso);
        }
    }
    if (app.querySelector(".body")) {
        const flecha = document.createElement("i");
        flecha.className = "flecha-baja";
        flecha.hidden = true;
        flecha.setAttribute("aria-hidden", "true");
        flecha.innerHTML = '<svg viewBox="0 0 7 4" width="28" height="16"><rect x="0" y="0" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/><rect x="1" y="1" width="1" height="1"/><rect x="5" y="1" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/><rect x="4" y="2" width="1" height="1"/><rect x="3" y="3" width="1" height="1"/></svg>';
        app.appendChild(flecha);
    }
    ligar();
    vigilarScroll();
}

function vigilarScroll() {
    if (quitarFlecha) quitarFlecha();
    quitarFlecha = null;
    const body = document.querySelector("#app .body");
    const flecha = document.querySelector("#app .flecha-baja");
    const app = document.getElementById("app");
    if (!body || !flecha || !app) return;
    const mover = () => {
        const sobra = body.scrollHeight - body.clientHeight - body.scrollTop;
        const mostrar = sobra > 16;
        flecha.hidden = !mostrar;
        if (!mostrar) return;
        const caja = body.getBoundingClientRect();
        const marco = app.getBoundingClientRect();
        flecha.style.left = Math.round(caja.left + caja.width / 2 - marco.left - 14) + "px";
        flecha.style.top = Math.round(caja.bottom - marco.top - 26) + "px";
    };
    body.addEventListener("scroll", mover, { passive: true });
    window.addEventListener("resize", mover);
    quitarFlecha = () => window.removeEventListener("resize", mover);
    mover();
    requestAnimationFrame(mover);
}

function ligar() {
    const raiz = document.getElementById("app");
    const nombre = raiz.querySelector("#nombre");
    if (nombre) {
        nombre.addEventListener("input", () => {
            state.nombre = nombre.value;
            state.error = "";
        });
    }
    const ciudad = raiz.querySelector("#ciudad");
    const dorsal = raiz.querySelector("#dorsal");
    if (ciudad) ciudad.addEventListener("input", () => { state.ciudad = ciudad.value; });
    if (dorsal) dorsal.addEventListener("input", () => { state.dorsal = dorsal.value.replace(/\D/g, "").slice(0, 2); dorsal.value = state.dorsal; });
    raiz.querySelectorAll("#alta-nombre, #correo, #clave, #codigo").forEach((campo) => {
        campo.addEventListener("input", () => {
            leerBorrador();
            campo.classList.remove("malo");
            authMalos = authMalos.filter((id) => id !== campo.id);
        });
    });
    raiz.querySelectorAll("[data-accion]").forEach((nodo) => {
        nodo.addEventListener("click", async () => {
            const accion = nodo.dataset.accion;
            if (accion === "empezar") {
                if (!exigeCuenta()) return;
                state.fase = "crear";
                state.paso = "armar";
                state.error = "";
                render();
            }
            if (accion === "como") {
                state.paso = "como";
                state.error = "";
                render();
            }
            if (accion === "inicio" || accion === "portada") {
                state.fase = "";
                state.paso = "inicio";
                state.retirado = false;
                state.error = "";
                if (accion === "portada") state.flash = "";
                render();
            }
            if (accion === "modo-alta" || accion === "modo-entrar" || accion === "modo-olvido") {
                leerBorrador();
                authModo = accion === "modo-alta" ? "alta" : (accion === "modo-olvido" ? "olvido" : "entrar");
                authMalos = [];
                state.flash = "";
                render();
            }
            if (accion === "pedir-codigo") {
                leerBorrador();
                await pedirCodigo();
            }
            if (accion === "restablecer") {
                leerBorrador();
                await restablecerClave();
            }
            if (accion === "mostrar-clave") {
                state.mostrarClave = true;
                state.flash = "";
                render();
            }
            if (accion === "guardar-clave") {
                await cambiarClave();
            }
            if (accion === "quedarme") {
                if (state.conflicto) state.revision = state.conflicto.revision || state.revision;
                state.conflicto = null;
                state.flash = "Guardé esta partida en la cuenta.";
                await persistir();
                render();
            }
            if (accion === "cargar-servidor") {
                const ficha = state.conflicto && state.conflicto.ficha;
                state.conflicto = null;
                if (ficha) aplicarFicha(ficha);
                state.flash = "Cargué la partida de la cuenta.";
                render();
            }
            if (accion === "entrar-correo" || accion === "crear-correo") {
                leerBorrador();
                await enviarAcceso(accion === "crear-correo");
            }
            if (accion === "jugar") {
                if (!exigeCuenta()) return;
                comenzarAJugar();
            }
            if (accion === "ficha") {
                state.fase = "ficha";
                guardarLocal();
                render();
            }
            if (accion === "lobby" || accion === "volver-carrera") {
                state.flash = "";
                if (!state.nombre) {
                    state.fase = "crear";
                    state.paso = "inicio";
                } else if (state.retirado) {
                    state.fase = "retiro";
                } else {
                    state.fase = "lobby";
                }
                persistir();
                render();
            }
            if (accion === "entrenar") {
                if (!state.nombre || !state.stats || state.retirado) {
                    state.flash = "Armá tu jugador antes de entrenar.";
                    render();
                    return;
                }
                state.fase = "entrenar";
                state.flash = "";
                guardarLocal();
                render();
                return;
            }
            if (accion === "modocarrera") {
                if (!state.nombre) {
                    state.flash = "Armá tu jugador antes de entrar al modo carrera.";
                    render();
                    return;
                }
                entrarModoCarrera();
            }
            if (accion === "ofertas") {
                state.fase = "ofertas";
                state.flash = "";
                render();
            }
            if (accion === "renegociar") {
                if (state.equipoId && state.renegocioEn !== state.partidos) {
                    const sube = state.hinchada >= 70 ? 0.6 : 0.3;
                    state.plusSalario += sube;
                    state.renegocioEn = state.partidos;
                    state.flash = "Renovaste. El sueldo sube US$ " + sube.toFixed(1) + "M.";
                }
                state.fase = "lobby";
                persistir();
                render();
            }
            if (accion === "otra-vez") {
                const cuenta = state.cuenta;
                localStorage.removeItem("rookie-jugador");
                localStorage.removeItem("rookie-recompensa");
                state = estadoInicial();
                state.cuenta = cuenta;
                render();
            }
            if (accion === "cuenta") {
                state.confirmarCierre = false;
                await refrescarCuenta();
                state.fase = "cuenta";
                state.flash = "";
                guardarLocal();
                render();
            }
            if (accion === "retirar") {
                state.retirado = true;
                state.fase = "retiro";
                state.flash = "Colgaste los botines.";
                await persistir();
                render();
            }
            if (accion === "ser-manager") {
                if (!state.cuenta || !state.cuenta.user) {
                    state.flash = "Para seguir de manager tenés que entrar con tu cuenta.";
                    render();
                    return;
                }
                const res = await apiFetch("/api/manager", { method: "POST", body: "{}" });
                if (res.datos && res.datos.ok) {
                    state.cuenta.user.manager = true;
                    await refrescarCuenta();
                    const hayVivo = (state.cuenta.jugadores || []).some((jugador) => !jugador.retiro);
                    if (!hayVivo) {
                        const listo = await prepararNuevo();
                        if (!listo) return;
                        state.flash = "Sos manager nivel " + nivelManager() + ". Armá a tu novato y subile el calibre.";
                        render();
                        return;
                    }
                    state.fase = "cuenta";
                    state.flash = "Seguís de manager. Elegí a quién entrenar.";
                } else {
                    state.flash = (res.datos && res.datos.error) || "Primero tenés que terminar una carrera.";
                }
                guardarLocal();
                render();
            }
            if (accion === "manager" || accion === "mercado") {
                if (!state.cuenta || !state.cuenta.user || !state.cuenta.user.manager) {
                    state.flash = "El mercado abre cuando seguís de manager.";
                    state.fase = "cuenta";
                    render();
                    return;
                }
                await refrescarCuenta();
                state.fase = "mercado";
                state.flash = "";
                guardarLocal();
                render();
            }
            if (accion === "preguntar-cierre") {
                state.confirmarCierre = true;
                state.flash = "";
                render();
            }
            if (accion === "cerrar-cuenta") {
                const escrito = (document.getElementById("cierre-email") || {}).value || "";
                const user = state.cuenta && state.cuenta.user;
                const identidad = identidadCuenta(user);
                if (escrito.trim().toLowerCase() !== identidad.toLowerCase()) {
                    state.flash = user && user.usuario ? "Escribí el usuario de la cuenta para cerrarla." : "Escribí el email de la cuenta para cerrarla.";
                    render();
                    return;
                }
                const res = await apiFetch("/api/cuenta/cerrar", { method: "POST", body: "{}" });
                if (!res.datos || !res.datos.ok) {
                    state.flash = (res.datos && res.datos.error) || "No pude cerrar la cuenta.";
                    render();
                    return;
                }
                localStorage.removeItem("rookie-jugador");
                localStorage.removeItem("rookie-recompensa");
                location.href = "/jugar.php";
            }
            if (accion === "cerrar-local") {
                const cuenta = state.cuenta;
                localStorage.removeItem("rookie-jugador");
                localStorage.removeItem("rookie-recompensa");
                state = estadoInicial();
                state.cuenta = cuenta;
                state.flash = "Partida cerrada en este teléfono.";
                render();
            }
            if (accion === "nuevo") {
                await prepararNuevo();
            }
            if (accion === "nueva-carrera") {
                if (!exigeCuenta()) return;
                empezarOtraCarrera();
            }
            if (accion === "volver-manager") {
                state.fase = "cuenta";
                state.flash = "";
                guardarLocal();
                render();
            }
            if (accion === "salir") {
                borrador = { nombre: "", correo: "", clave: "", codigo: "" };
                authModo = "entrar";
                try {
                    await apiFetch("/auth/salir", { method: "POST", body: "{}" });
                } catch (falla) { /* Volvemos a la portada igual. */ }
                try {
                    const guardado = JSON.parse(localStorage.getItem("rookie-jugador") || "null");
                    if (guardado) {
                        guardado.fase = "";
                        guardado.paso = "inicio";
                        guardado.retirado = false;
                        localStorage.setItem("rookie-jugador", JSON.stringify(guardado));
                    }
                } catch (falla) { /* Sin partida en este teléfono. */ }
                location.href = "/";
            }
        });
    });
    raiz.querySelectorAll("[data-set]").forEach((nodo) => {
        nodo.addEventListener("click", () => {
            state[nodo.dataset.set] = nodo.dataset.valor;
            if (nodo.dataset.set === "posicion" && !estilosDe(state.posicion).some((item) => item.id === state.estiloId)) {
                state.estiloId = "";
            }
            state.error = "";
            render();
        });
    });
    raiz.querySelectorAll("[data-hab]").forEach((nodo) => {
        nodo.addEventListener("click", () => {
            const nombreHab = nodo.dataset.hab;
            if (state.habilidades.includes(nombreHab)) {
                state.habilidades = state.habilidades.filter((item) => item !== nombreHab);
            } else if (state.habilidades.length < 2) {
                state.habilidades = state.habilidades.concat(nombreHab);
            } else {
                state.error = "Solo podés llevar 2 habilidades.";
            }
            render();
        });
    });
    raiz.querySelectorAll("[data-club]").forEach((nodo) => {
        nodo.addEventListener("click", () => {
            firmar(clubPorId(nodo.dataset.club), "oferta");
            state.renegocioEn = state.partidos;
            state.fase = "lobby";
            persistir();
            render();
        });
    });
    raiz.querySelectorAll("[data-op]").forEach((nodo) => {
        nodo.addEventListener("click", () => aplicarOpcion(Number(nodo.dataset.op)));
    });
    raiz.querySelectorAll("[data-jugador]").forEach((nodo) => {
        nodo.addEventListener("click", async () => {
            await abrirJugador(nodo.dataset.jugador, "lobby");
        });
    });
    raiz.querySelectorAll("[data-entrenar]").forEach((nodo) => {
        nodo.addEventListener("click", async () => {
            await abrirJugador(nodo.dataset.entrenar, "entrenar");
        });
    });
    raiz.querySelectorAll("[data-carrera]").forEach((nodo) => {
        nodo.addEventListener("click", async () => {
            await abrirJugador(nodo.dataset.carrera, "modocarrera");
        });
    });
    raiz.querySelectorAll("[data-fichar]").forEach((nodo) => {
        nodo.addEventListener("click", async () => {
            if (nodo.disabled) return;
            const res = await apiFetch("/api/manager/fichar", {
                method: "POST",
                body: JSON.stringify({ id: nodo.dataset.fichar })
            });
            if (res.datos && res.datos.ok) {
                await refrescarCuenta();
                state.flash = "Firmó con vos. Entrenalo desde la cuenta.";
                state.fase = "cuenta";
            } else {
                state.flash = (res.datos && res.datos.error) || "No pude fichar a ese jugador.";
            }
            guardarLocal();
            render();
        });
    });
    raiz.querySelectorAll("[data-juego]").forEach((nodo) => {
        nodo.addEventListener("click", () => {
            const modo = nodo.dataset.modo || nodo.dataset.juego;
            state.esperando = modo;
            if (modo === "carrera") {
                if (state.carrera) state.carrera.espera = nodo.dataset.juego;
                state.fase = "modocarrera";
            } else if (modo === "entreno") {
                state.fase = "entrenar";
            } else {
                state.fase = "lobby";
            }
            state.flash = "";
            guardarLocal();
        });
    });
    if (typeof ligarModoCarrera === "function") ligarModoCarrera(raiz);
}

function exigeCuenta() {
    if (state.cuenta && state.cuenta.user) return true;
    state.flash = "Entrá con tu cuenta para jugar.";
    state.fase = "";
    state.paso = "inicio";
    state.retirado = false;
    render();
    return false;
}

function leerBorrador() {
    const nombre = document.getElementById("alta-nombre");
    const correo = document.getElementById("correo");
    const clave = document.getElementById("clave");
    const codigo = document.getElementById("codigo");
    if (nombre) borrador.nombre = nombre.value;
    if (correo) borrador.correo = correo.value;
    if (clave) borrador.clave = clave.value;
    if (codigo) borrador.codigo = codigo.value;
}

async function enviarAcceso(alta) {
    // Crear manda el usuario nuevo. Entrar manda usuario, o email si la cuenta vieja lo usa.
    const cuerpo = { password: borrador.clave };
    if (alta) cuerpo.usuario = borrador.correo.trim();
    else Object.assign(cuerpo, cuerpoIdentidad());
    let res;
    try {
        res = await apiFetch(alta ? "/auth/registrar" : "/auth/entrar", {
            method: "POST",
            body: JSON.stringify(cuerpo)
        });
    } catch (falla) {
        state.flash = "No hay conexión.";
        render();
        return;
    }
    if (!res.okHttp || !res.datos || !res.datos.ok) {
        state.flash = textoError(res, alta ? "No pude crear la cuenta." : "No pude entrar.");
        authMalos = alta ? [] : malosDe(res);
        render();
        return;
    }
    authMalos = [];
    borrador.clave = "";
    const marca = alta ? (res.datos.correo ? "correo" : "correo-no") : "ok";
    location.href = "/?ingreso=" + marca;
}

async function pedirCodigo() {
    let res;
    try {
        res = await apiFetch("/auth/olvide", {
            method: "POST",
            body: JSON.stringify(cuerpoIdentidad())
        });
    } catch (falla) {
        state.flash = "No hay conexión.";
        render();
        return;
    }
    if (!res.okHttp || !res.datos || !res.datos.ok) {
        state.flash = textoError(res, "No pude pedir el código.");
        authMalos = malosDe(res);
        render();
        return;
    }
    authModo = "codigo";
    if (res.datos.codigo) borrador.codigo = String(res.datos.codigo);
    state.flash = res.datos.aviso || "Si esa cuenta existe, te mandamos un código.";
    render();
}

async function restablecerClave() {
    let res;
    try {
        res = await apiFetch("/auth/restablecer", {
            method: "POST",
            body: JSON.stringify(Object.assign(cuerpoIdentidad(), {
                codigo: String(borrador.codigo || "").trim(),
                password: borrador.clave
            }))
        });
    } catch (falla) {
        state.flash = "No hay conexión.";
        render();
        return;
    }
    if (!res.okHttp || !res.datos || !res.datos.ok) {
        state.flash = textoError(res, "No pude cambiar la contraseña.");
        authMalos = malosDe(res);
        render();
        return;
    }
    borrador.clave = "";
    borrador.codigo = "";
    location.href = "/?ingreso=ok";
}

async function cambiarClave() {
    const actual = document.getElementById("clave-actual");
    const nueva = document.getElementById("clave-nueva");
    let res;
    try {
        res = await apiFetch("/auth/clave", {
            method: "POST",
            body: JSON.stringify({
                actual: actual ? actual.value : "",
                password: nueva ? nueva.value : ""
            })
        });
    } catch (falla) {
        state.flash = "No hay conexión.";
        render();
        return;
    }
    if (!res.okHttp || !res.datos || !res.datos.ok) {
        state.flash = textoError(res, "No pude cambiar la contraseña.");
        render();
        return;
    }
    state.mostrarClave = false;
    state.flash = "Contraseña actualizada.";
    render();
}

function malosDe(res) {
    const errors = (res && res.datos && res.datos.errors) || {};
    const lista = [];
    if (errors.email || errors.usuario) lista.push("correo");
    if (errors.password || errors.actual) lista.push("clave");
    if (errors.codigo) lista.push("codigo");
    const avisoCampo = errors.usuario || errors.email;
    const aviso = Array.isArray(avisoCampo) ? String(avisoCampo[0] || "") : "";
    if (/incorrectos|entra con Google/i.test(aviso) && lista.indexOf("clave") === -1) lista.push("clave");
    return lista;
}

function textoError(res, fallback) {
    const datos = (res && res.datos) || {};
    if (datos.error) return datos.error;
    if (datos.errors) {
        const primero = Object.values(datos.errors)[0];
        if (Array.isArray(primero) && primero[0]) return String(primero[0]);
    }
    if (datos.message) return datos.message;
    return fallback;
}

function tokenCsrf() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute("content") : "";
}

async function apiFetch(url, opciones) {
    const opts = opciones || {};
    const headers = {
        "Accept": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": tokenCsrf()
    };
    if (opts.body) headers["Content-Type"] = "application/json";
    const respuesta = await fetch(url, {
        method: opts.method || "GET",
        headers: headers,
        body: opts.body,
        credentials: "same-origin"
    });
    const datos = await respuesta.json().catch(() => ({}));
    return { okHttp: respuesta.ok, status: respuesta.status, datos: datos };
}

async function abrirJugador(id, destino) {
    const res = await apiFetch("/api/carrera/" + id);
    if (!res.datos || !res.datos.ok) {
        state.flash = (res.datos && res.datos.error) || "No pude abrir ese jugador.";
        render();
        return;
    }
    aplicarFicha(res.datos.ficha);
    if (!state.retirado && destino) state.fase = destino;
    guardarLocal();
    render();
    return true;
}

function aplicarFicha(ficha) {
    const cuenta = state.cuenta;
    const flash = state.flash;
    state = Object.assign(estadoInicial(), ficha || {});
    state.cuenta = cuenta || { google: false, user: null, jugadores: [] };
    state.flash = flash || "";
    if (state.retirado) state.fase = "retiro";
    migrar();
    guardarLocal();
}

async function refrescarCuenta() {
    try {
        const res = await apiFetch("/api/sesion");
        const datos = res.datos || {};
        if (!res.okHttp || !datos || Array.isArray(datos)) return;
        state.cuenta = {
            google: !!datos.google,
            user: datos.user || null,
            jugadores: datos.jugadores || [],
            historial: datos.historial || { carreras: 0, partidas: 0, partidos: 0, victorias: 0 }
        };
    } catch (falla) { /* Seguimos con la cuenta que ya teníamos. */ }
}

function empezarOtraCarrera() {
    const cuenta = state.cuenta;
    state = estadoInicial();
    state.cuenta = cuenta;
    state.fase = "crear";
    state.paso = "armar";
    state.id = null;
    state.revision = 0;
    state.flash = "Armá el jugador de la nueva carrera.";
    guardarLocal();
    render();
}

async function prepararNuevo() {
    const res = await apiFetch("/api/manager/nuevo", { method: "POST", body: "{}" });
    if (!res.datos || !res.datos.ok) {
        state.flash = (res.datos && res.datos.error) || "Solo un manager puede crear otro jugador.";
        render();
        return false;
    }
    const cuenta = state.cuenta;
    state = estadoInicial();
    state.cuenta = cuenta;
    state.fase = "crear";
    state.paso = "armar";
    state.id = null;
    state.tipo = "novato";
    state.dificultad = "baja";
    state.calibre = 46;
    state.flash = "Novato nuevo. Su calibre es el tuyo como manager.";
    guardarLocal();
    render();
    return true;
}

async function sincronizarCuenta() {
    state.cuenta = { google: false, user: null, jugadores: [] };
    let datos = {};
    try {
        const res = await apiFetch("/api/sesion");
        datos = res.datos || {};
    } catch (falla) {
        return;
    }
    if (!datos || Array.isArray(datos)) return;
    state.cuenta = {
        google: !!datos.google,
        user: datos.user || null,
        jugadores: datos.jugadores || [],
        historial: datos.historial || { carreras: 0, partidas: 0, partidos: 0, victorias: 0 }
    };
    const params = new URLSearchParams(location.search);
    const marca = params.get("google");
    const ingreso = params.get("ingreso");
    if (marca || ingreso) history.replaceState({}, "", location.pathname);
    if (marca === "falta") state.flash = "El ingreso con Google no está disponible.";
    if (marca === "error") state.flash = "Google no pudo completar el ingreso.";
    if (marca === "ok" && state.nombre) {
        try {
            const guardado = await apiFetch("/api/guardar.php", {
                method: "POST",
                body: JSON.stringify(payload())
            });
            if (guardado.datos && guardado.datos.ok) {
                state.id = guardado.datos.id;
                state.flash = "Carrera guardada en tu cuenta.";
            } else if (guardado.datos && guardado.datos.error) {
                state.flash = guardado.datos.error;
            }
        } catch (falla) {
            state.flash = "No pude guardar la carrera en la cuenta.";
        }
        await refrescarCuenta();
        guardarLocal();
        return;
    }
    if (!state.nombre && datos.activa) {
        aplicarFicha(datos.activa);
        if (marca === "ok" || ingreso === "ok" || ingreso === "correo" || ingreso === "correo-no") {
            state.flash = "Cargué tu carrera.";
        }
    }
    if (!state.flash && (ingreso === "correo" || ingreso === "correo-no")) {
        state.flash = "Cuenta creada.";
    }
    if (!state.flash && ingreso === "ok") state.flash = "Entraste.";
}

async function arrancar() {
    cargarLocal();
    migrar();
    const [res, mercado] = await Promise.all([
        apiFetch("/api/equipos.php").catch(() => null),
        apiFetch("/api/estrellas").catch(() => null),
        sincronizarCuenta()
    ]);
    if (!res || !res.okHttp || !Array.isArray(res.datos)) {
        equipos = [];
        state.error = "No pude leer los clubes. Volvé a intentar.";
    } else {
        equipos = res.datos;
    }
    estrellas = mercado && Array.isArray(mercado.datos) ? mercado.datos : [];
    if (!state.cuenta || !state.cuenta.user) {
        const cuenta = state.cuenta;
        const flash = state.flash;
        state = estadoInicial();
        state.cuenta = cuenta || state.cuenta;
        state.flash = flash;
        state.fase = "";
        state.paso = "inicio";
    }
    asegurarCalendario();
    cobrarRecompensa();
    render();
}

arrancar();
