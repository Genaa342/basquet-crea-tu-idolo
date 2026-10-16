const BASES = {
    PG: { velocidad: 80, tiro: 65, fuerza: 40, control: 85, defensa: 60 },
    SG: { velocidad: 75, tiro: 85, fuerza: 45, control: 60, defensa: 55 },
    SF: { velocidad: 70, tiro: 70, fuerza: 60, control: 55, defensa: 65 },
    PF: { velocidad: 55, tiro: 55, fuerza: 80, control: 45, defensa: 70 },
    C:  { velocidad: 45, tiro: 45, fuerza: 90, control: 35, defensa: 80 }
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

let equipos = [];
let state = estadoInicial();

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
        victorias: 0,
        renegocioEn: null,
        retirado: false,
        cuenta: { google: false, user: null, jugadores: [] }
    };
}

function estilosDe(pos) {
    const comun = {
        id: "ritmo",
        titulo: "Estilo de juego",
        corto: "Pick and roll, movimiento y defensa.",
        texto: "Rápido, inteligente y competitivo. Me encanta el pick and roll, el movimiento de balón y la defensa agresiva. Busco siempre la mejor opción para el equipo.",
        tags: ["PICK AND ROLL", "VERSATILIDAD", "DEFENSA", "IQ BÁSQUET"]
    };
    const base = {
        id: "base",
        titulo: "Base / Escolta",
        corto: "Organizo, creo y también finalizo.",
        texto: "Juego como un base moderno. Organizo, creo oportunidades y también finalizo. Mi capacidad de tiro y visión me permite hacer jugar al equipo en cualquier situación.",
        tags: ["PASE", "VISIÓN", "TIRO", "LIDERAZGO"]
    };
    if (pos === "PG" || pos === "SG") return [base, comun];
    if (pos === "SF") {
        return [comun, {
            id: "alero",
            titulo: "Alero",
            corto: "Corto, tiro y defiendo al mejor.",
            texto: "Corto, tiro y defiendo al mejor del otro equipo. Puedo jugar adentro y afuera.",
            tags: ["TIRO", "DEFENSA", "VERSATILIDAD"]
        }];
    }
    if (pos === "PF") {
        return [comun, {
            id: "ala",
            titulo: "Ala-pívot",
            corto: "Rebote, tapón y fuerza.",
            texto: "Reboteo, cierro el aro y abro la cancha cuando el equipo lo necesita.",
            tags: ["REBOTE", "DEFENSA", "FUERZA"]
        }];
    }
    return [comun, {
        id: "pivot",
        titulo: "Pívot",
        corto: "Pintura, tapón y rebote.",
        texto: "Protejo la pintura. Tapón, rebote y presencia en cada posesión.",
        tags: ["TAPÓN", "REBOTE", "DEFENSA"]
    }];
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
    return estilosDe(state.posicion).find((item) => item.id === state.estiloId) || null;
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
        return `<div class="logo-circulo"><b class="monograma" style="background:#2a2a2e;color:#f4f4f4">ARO</b></div>`;
    }
    if (eq.logo) {
        return `<div class="logo-circulo"><img src="${esc(eq.logo)}" alt=""></div>`;
    }
    const marca = coloresMarca(eq);
    const sigla = String(eq.abreviatura || "??").slice(0, 4);
    return `<div class="logo-circulo"><b class="monograma" style="background:${esc(marca.fondo)};color:${esc(marca.tinta)}">${esc(sigla)}</b></div>`;
}

function etiquetaClub(eq) {
    if (!eq) return "La calle";
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
        top = "rgba(6,14,32,0.50)";
        bot = "rgba(4,8,20,0.78)";
        wash = hexA(tinta, 0.34);
    }
    root.style.setProperty("--gold", borde);
    root.style.setProperty("--navy", tinta);
    root.style.setProperty("--bar", borde);
    root.style.setProperty("--fondo", "url('/" + img.replace(/^\/+/, "") + "')");
    root.style.setProperty("--velo-top", top);
    root.style.setProperty("--velo-bot", bot);
    root.style.setProperty("--wash", wash);
}

function ovr() {
    const s = state.stats;
    if (!s) return 0;
    return Math.round((s.tiro + s.velocidad + s.fuerza + s.control + s.defensa) / 5);
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
    if (media >= 72) return ["ROTACION", "Entrás desde el banco y cambiás el ritmo."];
    return ["PROSPECTO", "Recién llegado. Cada entrenamiento suma."];
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
        const fasesJuego = ["carrera", "retiro", "ficha", "hub", "lobby", "entrenar", "ofertas", "cuenta", "manager"];
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
    const seguir = ["lobby", "entrenar", "ofertas", "ficha", "retiro", "cuenta", "manager"];
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
    state.victorias = state.victorias || 0;
    state.retirado = !!state.retirado;
    if (!state.cuenta) state.cuenta = { google: false, user: null, jugadores: [] };
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
        state.stats[clave] = Math.min(99, state.stats[clave] + 4);
        if (ev.anio) state.edad += 1;
        state.calibre = Math.min(99, (state.calibre || 46) + 2);
        state.flash = etiquetaStat(clave) + " +4. Calibre " + state.calibre + ".";
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
        state.flash = "Una temporada más. El cuerpo avisa, pero todavía saltás.";
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

function linkJuego(juego) {
    const eq = equipoActual();
    const nombre = encodeURIComponent(state.nombre.trim());
    const equipo = eq ? eq.id : "";
    if (juego === "reflejos") return "reflejos/index.php?equipo=" + equipo + "&nombre=" + nombre;
    if (juego === "memoria") return "Juegodememoria.html";
    if (juego === "simon") return "Simondice.html";
    return "defensa.html";
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
        return `<a class="btn eleccion" data-juego="${esc(ev.juego)}" href="${esc(linkJuego(ev.juego))}">${etiquetaJuego(ev)}</a>`;
    }
    if (ev.forzado) {
        return `<button class="btn eleccion" data-op="0">Me retiro</button>`;
    }
    return `<button class="btn eleccion" data-op="0">Me retiro</button>
            <button class="btn ghost eleccion" data-op="1">Un año más</button>`;
}

function fijarStats() {
    state.stats = Object.assign({}, BASES[state.posicion]);
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
    state.tez = "#a96f48";
    state.cabello = "h1";
    state.edad = 19;
    state.altura = 196;
    state.peso = 90;
    state.dorsal = 11;
    state.ciudad = "Buenos Aires, Argentina";
    state.origen = "calle";
    state.equipoId = null;
    state.conferencia = "";
    state.calibre = 46;
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
    state.retirado = false;
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
        state.flash = "La ficha quedó en este teléfono. La base no respondió.";
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
        retirado: !!state.retirado
    };
}

async function persistir() {
    guardarLocal();
    if (!state.id) return;
    try {
        const res = await apiFetch("/api/guardar.php", {
            method: "POST",
            body: JSON.stringify(payload())
        });
        if (res.datos && res.datos.ok && res.datos.id) state.id = res.datos.id;
        else if (res.datos && res.datos.error) state.flash = res.datos.error;
        guardarLocal();
    } catch (falla) {
        /* La carrera sigue en el teléfono. */
    }
}

function cobrarRecompensa() {
    const crudo = localStorage.getItem("rookie-recompensa");
    if (!crudo || !state.stats) return;
    let premio;
    try { premio = JSON.parse(crudo); } catch (error) { return; }
    if (!premio || state.cobradas.includes(premio.id)) {
        localStorage.removeItem("rookie-recompensa");
        return;
    }
    state.cobradas.push(premio.id);
    localStorage.removeItem("rookie-recompensa");
    if (!state.nombre || state.fase === "crear") {
        persistir();
        return;
    }
    if (state.esperando === "partido") cobrarPrima(!!premio.gano);
    else cobrarEntreno(!!premio.gano, premio.juego);
}

function subirStat(juego, cuanto) {
    const mapa = { reflejos: "velocidad", simon: "control", memoria: "tiro", defensa: "defensa" };
    const clave = mapa[juego];
    if (!clave || !state.stats) return "";
    state.stats[clave] = Math.min(99, state.stats[clave] + cuanto);
    if (juego === "defensa" && cuanto >= 3) sumarTrofeo("MEJOR DEFENSOR");
    return { velocidad: "Velocidad", control: "Control", tiro: "Tiro", defensa: "Defensa" }[clave];
}

function cobrarEntreno(gano, juego) {
    state.esperando = null;
    const sube = gano ? 3 : 1;
    const nombre = subirStat(juego, sube) || "Habilidad";
    state.calibre = Math.min(99, (state.calibre || 46) + (gano ? 10 : 4));
    state.flash = nombre + " +" + sube + ". Calibre " + state.calibre + ".";
    state.fase = "lobby";
    persistir();
    render();
}

function cobrarPrima(gano) {
    state.esperando = null;
    state.partidos = (state.partidos || 0) + 1;
    if (gano) {
        state.victorias = (state.victorias || 0) + 1;
        const prima = (state.equipoId ? 0.4 : 0.15) + (state.calibre || 46) / 200;
        state.plusSalario += prima;
        state.hinchada = clamp(state.hinchada + 8, 0, 100);
        state.puntosCarrera += 16;
        state.calibre = Math.min(99, (state.calibre || 46) + 2);
        state.flash = state.equipoId
            ? "Prima: US$ " + prima.toFixed(1) + "M. El sueldo queda en US$ " + salario() + "M."
            : "Te vieron en la calle. Esa prima entra cuando firmes.";
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
        state.flash += " Temporada " + state.temporada + ".";
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
        if (!ofertas.length) return "Estás en la calle. Entrená para subir el calibre. Un club llama desde 54. La NBA, desde 78.";
        return "Hay ofertas para tu calibre " + state.calibre + ". Podés firmar y empezar la carrera.";
    }
    return "Contrato con " + eq.nombre + ". " + (ofertas.length ? "Hay un club mejor mirándote. " : "") + "Si ganás el partido, cobrás prima.";
}

function resolverMinijuego(gano) {
    const ev = eventoActual();
    state.esperando = null;
    if (gano) {
        state.hinchada = clamp(state.hinchada + 12, 0, 100);
        state.puntosCarrera += ev && ev.copa ? 32 : 26;
        state.asistenciasCarrera += 6;
        state.flash = "Ganaste. Calibre " + ((state.calibre || 46) + 10) + ".";
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
            state.flash = (liga === "NBA" ? "Campeón de la NBA." : "Ganaste la final.") + " Calibre " + ((state.calibre || 46) + 10) + ".";
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
        state.flash = "Se escapó el partido. Calibre " + ((state.calibre || 46) + 4) + ".";
    }
    state.calibre = Math.min(99, (state.calibre || 46) + (gano ? 10 : 4));
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

function pantallaInicio() {
    const cuenta = state.cuenta || { google: false, user: null };
    const entrar = !cuenta.user && cuenta.google
        ? `<a class="btn ghost" href="/auth/google">Entrar con Google</a>`
        : "";
    const salir = cuenta.user
        ? `<button class="btn ghost" data-accion="salir">Salir</button>`
        : "";
    const saludo = cuenta.user ? `<p class="nota">${esc(cuenta.user.nombre)}</p>` : "";
    return `<section class="screen">
        ${cabeza("8 BIT")}
        <div class="body">
            <div class="home-centro">
                <p class="lead">Arrancás en la vereda, sin club. El calibre abre la NBA.</p>
                <h1>CAMINO A LA<br><span>LEYENDA</span></h1>
                <p class="cita">"No es solo un juego, es mi vida"</p>
                ${saludo}
                ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
            </div>
        </div>
        <div class="actions columna">
            <button class="btn" data-accion="empezar">Comenzar</button>
            <button class="btn ghost" data-accion="como">¿Cómo jugar?</button>
            ${entrar}
            ${salir}
        </div>
    </section>`;
}

function pantallaComo() {
    return `<section class="screen">
        ${cabeza("GUIA")}
        <div class="body">
            <h1>COMO<br><span>JUGAR</span></h1>
            <div class="opciones">
                <div class="caja"><h2>01 ARMAS</h2><p class="lead">Nombre, puesto, estilo y dos habilidades. Sin equipo.</p></div>
                <div class="caja"><h2>02 LOBBY</h2><p class="lead">Entrenás, mirás la ficha y esperás. La carrera no se cierra.</p></div>
                <div class="caja"><h2>03 OFERTAS</h2><p class="lead">Un club llama si tu calibre llega a su piso. Podés cambiar y cobrar más.</p></div>
                <div class="caja"><h2>04 PARTIDO</h2><p class="lead">Si ganás, hay prima. Cada tanto el contrato se renueva.</p></div>
            </div>
        </div>
        <div class="actions">
            <button class="btn" data-accion="empezar">Armar jugador</button>
        </div>
    </section>`;
}

function pantallaArmar() {
    const estilos = state.posicion ? estilosDe(state.posicion) : [];
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
            <div class="pos-row">${botonesPos}</div>
            <p class="nota">${state.posicion ? esc(POSICIONES[state.posicion]) : "Elegí tu puesto. Arrancás en la calle, sin club."}</p>
            <h2>COMO JUEGO</h2>
            ${estilos.length ? `<div class="opciones">${botonesEstilo}</div><p class="nota">No se puede cambiar después.</p>` : `<p class="nota">Elegí un puesto para ver tu estilo.</p>`}
            <h2>HABILIDADES ${state.habilidades.length}/2</h2>
            <div class="chips">${botonesHab}</div>
            <p class="aviso ${state.error ? "on" : ""}">${esc(state.error)}</p>
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
    const juego = juegoPartido();
    return `<section class="screen">
        ${cabeza(`<button class="link" data-accion="cuenta">CUENTA</button><button class="link" data-accion="ficha">FICHA</button>`)}
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
            <p class="lead">${esc(textoLobby())}</p>
            <p class="nums">${box.ppg}<small>PTS</small> ${box.reb}<small>REB</small> ${box.ast}<small>AST</small></p>
        </div>
        <div class="actions columna">
            <button class="btn" data-accion="entrenar">Entrenar</button>
            <button class="btn" data-accion="ofertas">Ofertas${ofertas.length ? " · " + ofertas.length : ""}</button>
            <a class="btn" data-juego="${esc(juego)}" data-modo="partido" href="${esc(linkJuego(juego))}">Jugar partido</a>
        </div>
    </section>`;
}

function pantallaEntrenar() {
    const juegos = [
        ["reflejos", "Reflejos", "Velocidad"],
        ["simon", "Simón", "Control"],
        ["memoria", "Memoria", "Tiro"],
        ["defensa", "Defensa", "Defensa"]
    ];
    const botones = juegos.map(([juego, titulo, detalle]) =>
        `<a class="btn eleccion" data-juego="${juego}" href="${esc(linkJuego(juego))}">${titulo}<span class="sub">${detalle}</span></a>`
    ).join("");
    return `<section class="screen">
        ${cabeza("GYM")}
        <div class="body">
            <h1>ENTRENAR</h1>
            <p class="lead">Ganar suma 3 a la habilidad y 10 de calibre. Perder suma 1 y 4.</p>
        </div>
        <div class="actions columna">
            ${botones}
            <button class="btn ghost" data-accion="lobby">Volver</button>
        </div>
    </section>`;
}

function pantallaOfertas() {
    const lista = equiposAlAlcance();
    let lead = "Tu calibre es " + (state.calibre || 46) + ". Ningún club te llama todavía. Entrená y volvé. La NBA abre en 78.";
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
                <div class="statline"><span>Salario</span><b class="num">US$ ${salario()}M</b></div>
            </div>
            <p class="cita">${esc(fraseLeyenda())}</p>
        </div>
        <div class="actions columna">
            ${botonesRetiro()}
        </div>
    </section>`;
}

function botonesRetiro() {
    const cuenta = state.cuenta || { google: false, user: null, jugadores: [] };
    const user = cuenta.user;
    if (user && user.manager) {
        return `<button class="btn" data-accion="manager">Mis jugadores</button>
            <button class="btn ghost" data-accion="nuevo">Nuevo jugador</button>`;
    }
    if (user) {
        return `<button class="btn" data-accion="ser-manager">Ser manager</button>`;
    }
    const google = cuenta.google
        ? `<a class="btn" href="/auth/google">Guardar con Google</a>`
        : "";
    return `${google}<button class="btn" data-accion="otra-vez">Jugar de nuevo</button>`;
}

function pantallaCuenta() {
    const cuenta = state.cuenta || { google: false, user: null, jugadores: [] };
    const user = cuenta.user;
    let lead = "Google todavía no está configurado. La carrera sigue en este teléfono.";
    let extra = "";
    if (user) {
        lead = user.nombre + (user.manager ? " · Manager" : "");
        extra = user.manager ? `<button class="btn" data-accion="manager">Mis jugadores</button>` : "";
        extra += `<button class="btn ghost" data-accion="salir">Salir</button>`;
    } else if (cuenta.google) {
        lead = "Entrá con Google para guardar esta carrera en tu cuenta.";
        extra = `<a class="btn" href="/auth/google">Guardar con Google</a>`;
    }
    return `<section class="screen">
        ${cabeza("CUENTA")}
        <div class="body recorte">
            <h1>TU<br><span>CUENTA</span></h1>
            <p class="lead">${esc(lead)}</p>
            ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
            <p class="nota">Colgar los botines cierra esta carrera. Después podés ser manager y crear otro jugador.</p>
        </div>
        <div class="actions columna">
            ${extra}
            <button class="btn ghost" data-accion="retirar">Colgar los botines</button>
            <button class="btn ghost" data-accion="lobby">Volver</button>
        </div>
    </section>`;
}

function pantallaManager() {
    const cuenta = state.cuenta || { jugadores: [] };
    const lista = (cuenta.jugadores || []).map((jugador) =>
        `<button class="btn eleccion" data-jugador="${jugador.id}">${esc(jugador.nombre)} · ${esc(jugador.posicion)}${jugador.retiro ? " · RETIRO" : ""}</button>`
    ).join("");
    return `<section class="screen">
        ${cabeza("MANAGER")}
        <div class="body recorte">
            <h1>MIS<br><span>JUGADORES</span></h1>
            ${state.flash ? `<p class="flash">${esc(state.flash)}</p>` : ""}
            ${lista || `<p class="lead">Todavía no hay jugadores en esta cuenta.</p>`}
        </div>
        <div class="actions columna">
            <button class="btn" data-accion="nuevo">Nuevo jugador</button>
            <button class="btn ghost" data-accion="volver-manager">Volver</button>
        </div>
    </section>`;
}

function contenido() {
    if (state.fase === "manager") return pantallaManager();
    if (state.fase === "cuenta") return pantallaCuenta();
    if (state.fase === "ficha") return pantallaFicha();
    if (state.retirado) return pantallaRetiro();
    if (state.fase === "entrenar") return pantallaEntrenar();
    if (state.fase === "ofertas") return pantallaOfertas();
    if (state.fase === "lobby" || state.fase === "carrera" || state.fase === "retiro") return pantallaLobby();
    if (state.paso === "armar") return pantallaArmar();
    if (state.paso === "como") return pantallaComo();
    return pantallaInicio();
}

function render() {
    aplicarTema();
    document.getElementById("app").innerHTML = contenido();
    ligar();
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
    raiz.querySelectorAll("[data-accion]").forEach((nodo) => {
        nodo.addEventListener("click", async () => {
            const accion = nodo.dataset.accion;
            if (accion === "empezar") {
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
            if (accion === "inicio") {
                state.paso = "inicio";
                state.error = "";
                render();
            }
            if (accion === "jugar") comenzarAJugar();
            if (accion === "ficha") {
                state.fase = "ficha";
                guardarLocal();
                render();
            }
            if (accion === "lobby" || accion === "volver-carrera") {
                state.fase = "lobby";
                state.flash = "";
                guardarLocal();
                render();
            }
            if (accion === "entrenar") {
                state.fase = "entrenar";
                state.flash = "";
                render();
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
                const res = await apiFetch("/api/manager", { method: "POST", body: "{}" });
                if (res.datos && res.datos.ok) {
                    if (state.cuenta && state.cuenta.user) state.cuenta.user.manager = true;
                    await refrescarCuenta();
                    state.fase = "manager";
                    state.flash = "Ahora sos manager. Podés crear otro jugador.";
                } else {
                    state.flash = (res.datos && res.datos.error) || "Primero tenés que terminar una carrera.";
                }
                guardarLocal();
                render();
            }
            if (accion === "manager") {
                await refrescarCuenta();
                state.fase = "manager";
                state.flash = "";
                guardarLocal();
                render();
            }
            if (accion === "nuevo") {
                await prepararNuevo();
            }
            if (accion === "volver-manager") {
                state.fase = state.retirado ? "retiro" : "lobby";
                state.flash = "";
                guardarLocal();
                render();
            }
            if (accion === "salir") {
                try {
                    await apiFetch("/auth/salir", { method: "POST", body: "{}" });
                } catch (falla) { /* Volvemos al juego igual. */ }
                location.href = "/jugar.php";
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
            const res = await apiFetch("/api/carrera/" + nodo.dataset.jugador);
            if (res.datos && res.datos.ok) {
                aplicarFicha(res.datos.ficha);
                render();
            } else {
                state.flash = (res.datos && res.datos.error) || "No pude abrir ese jugador.";
                render();
            }
        });
    });
    raiz.querySelectorAll("[data-juego]").forEach((nodo) => {
        nodo.addEventListener("click", () => {
            state.esperando = nodo.dataset.modo || nodo.dataset.juego;
            state.fase = "lobby";
            state.flash = "";
            guardarLocal();
        });
    });
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
            jugadores: datos.jugadores || []
        };
    } catch (falla) { /* Seguimos con la cuenta que ya teníamos. */ }
}

async function prepararNuevo() {
    const res = await apiFetch("/api/manager/nuevo", { method: "POST", body: "{}" });
    if (!res.datos || !res.datos.ok) {
        state.flash = (res.datos && res.datos.error) || "Solo un manager puede crear otro jugador.";
        render();
        return;
    }
    const cuenta = state.cuenta;
    state = estadoInicial();
    state.cuenta = cuenta;
    state.fase = "crear";
    state.paso = "armar";
    state.id = null;
    guardarLocal();
    render();
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
        jugadores: datos.jugadores || []
    };
    const params = new URLSearchParams(location.search);
    const marca = params.get("google");
    if (marca) history.replaceState({}, "", "/jugar.php");
    if (marca === "falta") state.flash = "Google no está configurado en el servidor.";
    if (marca === "error") state.flash = "Google no pudo completar el ingreso.";
    if (marca === "ok" && state.nombre) {
        try {
            const guardado = await apiFetch("/api/guardar.php", {
                method: "POST",
                body: JSON.stringify(payload())
            });
            if (guardado.datos && guardado.datos.ok) {
                state.id = guardado.datos.id;
                state.flash = "Carrera guardada en tu cuenta de Google.";
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
        if (marca === "ok") state.flash = "Cargué tu carrera.";
    }
}

async function arrancar() {
    cargarLocal();
    migrar();
    try {
        const res = await apiFetch("/api/equipos.php");
        equipos = Array.isArray(res.datos) ? res.datos : [];
        if (!res.okHttp) {
            equipos = [];
            state.error = "No pude leer los equipos. Revisá que la base siga encendida.";
        }
    } catch (falla) {
        equipos = [];
        state.error = "No pude leer los equipos. Revisá que la base siga encendida.";
    }
    await sincronizarCuenta();
    asegurarCalendario();
    cobrarRecompensa();
    render();
}

arrancar();
