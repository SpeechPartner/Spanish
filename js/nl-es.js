// Nederlands -> Spaans, op zinsniveau.
// Het woordenboek geeft per woord een Spaanse vorm, maar die is niet altijd de juiste grammaticale vorm
// (vervoegde werkwoorden, verkeerd geslacht, geen lidwoord- of bezittelijke-regels). Deze module bouwt
// zinnen op met de juiste werkwoordsvorm, lidwoorden, bezittelijke voornaamwoorden, ser/estar en
// vraagzinnen. Zinnen die hij niet met zekerheid kan bouwen, geeft hij als null terug.
var NL_ES = (function () {

  // ---- Werkwoorden. Nederlandse vormen -> infinitief (NL). Spaanse vormen: yo, tú, él, nosotros, ustedes, ellos.
  var VERB = {
    hebben:    { es: "tener",    p: ["tengo", "tienes", "tiene", "tenemos", "tienen", "tienen"] },
    wonen:     { es: "vivir",    p: ["vivo", "vives", "vive", "vivimos", "viven", "viven"] },
    houden:    { es: "gustar",   special: "gustar" },
    vinden:    { es: "gustar",   special: "gustar" },
    begrijpen: { es: "entender", p: ["entiendo", "entiendes", "entiende", "entendemos", "entienden", "entienden"] },
    kunnen:    { es: "poder",    p: ["puedo", "puedes", "puede", "podemos", "pueden", "pueden"], modal: true },
    mogen:     { es: "poder",    p: ["tengo permiso para", "tienes permiso para", "tiene permiso para", "tenemos permiso para", "tienen permiso para", "tienen permiso para"], modal: true },
    zou:       { es: "deber cond", p: ["debería", "deberías", "debería", "deberíamos", "deberían", "deberían"], modal: true },
    willen:    { es: "querer",   p: ["quiero", "quieres", "quiere", "queremos", "quieren", "quieren"], modal: true },
    moeten:    { es: "tener que", p: ["tengo que", "tienes que", "tiene que", "tenemos que", "tienen que", "tienen que"], modal: true },
    gaan:      { es: "ir",       p: ["voy", "vas", "va", "vamos", "van", "van"] },
    zijn:      { es: "ser",      p: ["soy", "eres", "es", "somos", "son", "son"], copula: true },
    worden:    { es: "ponerse", p: ["me pongo", "te pones", "se pone", "nos ponemos", "se ponen", "se ponen"], copula: true },
    blijven:   { es: "quedarse", p: ["me quedo", "te quedas", "se queda", "nos quedamos", "se quedan", "se quedan"] },
    laten:     { es: "dejar", p: ["dejo", "dejas", "deja", "dejamos", "dejan", "dejan"] },
    heten:     { es: "llamarse", p: ["me llamo", "te llamas", "se llama", "nos llamamos", "se llaman", "se llaman"], reflexive: true },
    spelen:    { es: "jugar",    p: ["juego", "juegas", "juega", "jugamos", "juegan", "juegan"] },
    eten:      { es: "comer",    p: ["como", "comes", "come", "comemos", "comen", "comen"] },
    drinken:   { es: "beber",    p: ["bebo", "bebes", "bebe", "bebemos", "beben", "beben"] },
    spreken:   { es: "hablar",   p: ["hablo", "hablas", "habla", "hablamos", "hablan", "hablan"] },
    werken:    { es: "trabajar", p: ["trabajo", "trabajas", "trabaja", "trabajamos", "trabajan", "trabajan"] },
    leren:     { es: "aprender", p: ["aprendo", "aprendes", "aprende", "aprendemos", "aprenden", "aprenden"] },
    lezen:     { es: "leer",     p: ["leo", "lees", "lee", "leemos", "leen", "leen"] },
    kijken:    { es: "mirar", prepObj: "naar",    p: ["miro", "miras", "mira", "miramos", "miran", "miran"] },
    weten:     { es: "saber",    p: ["sé", "sabes", "sabe", "sabemos", "saben", "saben"] },
    komen:     { es: "venir",    p: ["vengo", "vienes", "viene", "venimos", "vienen", "vienen"] },
    zien:      { es: "ver",      p: ["veo", "ves", "ve", "vemos", "ven", "ven"] },
    doen:      { es: "hacer",    p: ["hago", "haces", "hace", "hacemos", "hacen", "hacen"] },
    zeggen:    { es: "decir",    p: ["digo", "dices", "dice", "decimos", "dicen", "dicen"] },
    luisteren: { es: "escuchar", prepObj: "naar", p: ["escucho", "escuchas", "escucha", "escuchamos", "escuchan", "escuchan"] },
    openen:    { es: "abrir",    p: ["abro", "abres", "abre", "abrimos", "abren", "abren"] },
    sluiten:   { es: "cerrar",   p: ["cierro", "cierras", "cierra", "cerramos", "cierran", "cierran"] },
    wachten:   { es: "esperar", prepObj: "op",  p: ["espero", "esperas", "espera", "esperamos", "esperan", "esperan"] },
    verwijderen: { es: "quitar", p: ["quito", "quitas", "quita", "quitamos", "quitan", "quitan"] },
    nemen:     { es: "tomar",    p: ["tomo", "tomas", "toma", "tomamos", "toman", "toman"] },
    pakken:    { es: "tomar",    p: ["tomo", "tomas", "toma", "tomamos", "toman", "toman"] },
    brengen:   { es: "traer", io: true,    p: ["traigo", "traes", "trae", "traemos", "traen", "traen"] },
    sturen:    { es: "enviar",   io: true, p: ["envío", "envías", "envía", "enviamos", "envían", "envían"] },
    tonen:     { es: "mostrar",  io: true, p: ["muestro", "muestras", "muestra", "mostramos", "muestran", "muestran"] },
    geven:     { es: "dar", io: true,      p: ["doy", "das", "da", "damos", "dan", "dan"] },
    helpen:    { es: "ayudar",   p: ["ayudo", "ayudas", "ayuda", "ayudamos", "ayudan", "ayudan"] },
  };

  // Nederlandse vervoegingen -> infinitief
  var FORM = {
    open: "openen", opent: "openen", sluit: "sluiten", sluit_: "sluiten", wacht: "wachten", wacht_: "wachten", verwijder: "verwijderen", verwijdert: "verwijderen",
    neem: "nemen", neemt: "nemen", pak: "pakken", pakt: "pakken", breng: "brengen", brengt: "brengen", geef: "geven", geeft: "geven", stuur: "sturen", stuurt: "sturen", toon: "tonen", toont: "tonen",
    heb: "hebben", hebt: "hebben", heeft: "hebben",
    woon: "wonen", woont: "wonen",
    hou: "houden", houdt: "houden",
    vind: "vinden", vindt: "vinden",
    begrijp: "begrijpen", begrijpt: "begrijpen",
    kan: "kunnen", kunt: "kunnen",
    mag: "mogen", mogt: "mogen", zou: "zou", zouden: "zou",
    wil: "willen", wilt: "willen",
    moet: "moeten", moeten: "moeten",
    ga: "gaan", gaat: "gaan",
    ben: "zijn", bent: "zijn", is: "zijn", zijn: "zijn",
    word: "worden", wordt: "worden", worden: "worden", blijf: "blijven", blijft: "blijven", blijven: "blijven", laat: "laten", laten: "laten",
    heet: "heten", heten: "heten",
    speel: "spelen", speelt: "spelen",
    eet: "eten", eten: "eten",
    drink: "drinken", drinkt: "drinken",
    spreek: "spreken", spreekt: "spreken",
    werk: "werken", werkt: "werken",
    leer: "leren", leert: "leren",
    lees: "lezen", leest: "lezen",
    kijk: "kijken", kijkt: "kijken",
    weet: "weten", weten: "weten",
    kom: "komen", komt: "komen",
    zie: "zien", ziet: "zien",
    doe: "doen", doet: "doen",
    zeg: "zeggen", zegt: "zeggen",
    luister: "luisteren", luistert: "luisteren",
    help: "helpen", helpt: "helpen"
  };
  var SINGULAR_FORMS = { heeft: 1, woont: 1, houdt: 1, vindt: 1, begrijpt: 1, kunt: 1, wilt: 1, gaat: 1, is: 1, heet: 1,
    speelt: 1, eet: 1, drinkt: 1, spreekt: 1, werkt: 1, leert: 1, leest: 1, kijkt: 1, weet: 1, komt: 1, ziet: 1, doet: 1,
    zegt: 1, luistert: 1, helpt: 1, hebt: 0, bent: 0, mogt: 0, moet: 1, mag: 1, kan: 1, wil: 1, ben: 0, ga: 0, hou: 0, heb: 0 };

  // ---- Voornaamwoorden: Spaans persoonsnummer en Spaanse vorm
  var SUBJ = {
    ik: { p: 0 }, je: { p: 1 }, jij: { p: 1 }, u: { p: 2 },
    hij: { p: 2, g: "m" },
    wij: { p: 3 }, we: { p: 3 }, jullie: { p: 4 }, ze: { p: 5 }
  };
  var PRON_ES = ["yo", "tú", "él", "nosotros", "ustedes", "ellos"];
  var ISUBJ = { 0: "yo", 1: "tú", 2: "él", 3: "nosotros", 4: "ustedes", 5: "ellos" };
  // Objectvorm -> Spaanse clitic
  var OBJ = { mij: "me", me: "me", je: "te", jou: "te", hem: "lo", het: "lo", haar: "la", ons: "nos", jullie: "os", hen: "les", ze: "las" };
  // Aanwijzend en bezittelijk
  var DEM = { dit: "este", dat: "ese" };
  var POSS = {
    mijn: "mi", je: "tu", jouw: "tu", zijn: "su", haar: "su", ons: "nuestro", onze: "nuestro", uw: "su", jullie: "su", hun: "su"
  };
  var PREP = {
    in: "en", op: "en", aan: "a", naar: "a", bij: "con", met: "con", voor: "para", van: "de", uit: "de", over: "sobre",
    zonder: "sin", om: "para", door: "por", tegen: "contra"
  };

  var TIME = { morgen: "mañana", vandaag: "hoy", gisteren: "ayer", nu: "ahora", altijd: "siempre", nooit: "nunca",
    ook: "también", heel: "muy", erg: "muy", veel: "mucho", weinig: "poco", al: "ya", nog: "todavía", zo: "así",
    thuis: "en casa", hier: "aquí", daar: "allí", buiten: "afuera", binnen: "adentro", vaak: "a menudo" };

  var PROPER = { amsterdam: "Ámsterdam", nederland: "los Países Bajos", spanje: "España", engeland: "Inglaterra",
    duitsland: "Alemania", frankrijk: "Francia", belgië: "Bélgica", belgie: "Bélgica", rotterdam: "Róterdam",
    spaans: "español", nederlands: "neerlandés", engels: "inglés", frans: "francés" };

  // Woorden die met estar gebruikt worden (tijdelijke toestand); de rest met ser
  var ESTAR_ADJ = { moe: 1, ziek: 1, blij: 1, boos: 1, verdrietig: 1, bezig: 1, klaar: 1, nerveus: 1, gestrest: 1,
    rustig: 1, verliefd: 1, verkouden: 1, bang: 1, druk: 1, ongerust: 1 };
  var ESTAR_ES = { cansado: 1, enfermo: 1, contento: 1, enojado: 1, enfadado: 1, triste: 1, ocupado: 1, listo: 1,
    nervioso: 1, estresado: 1, tranquilo: 1, enamorado: 1, resfriado: 1, asustado: 1, preocupado: 1, lleno: 1 };
  var LOCATION_NL = { thuis: 1, hier: 1, daar: 1, buiten: 1, binnen: 1, in: 1, op: 1, bij: 1, aan: 1, naar: 1, uit: 1, achter: 1, naast: 1 };
  var NOT_NOUN = { ik: 1, je: 1, jij: 1, u: 1, hij: 1, zij: 1, ze: 1, wij: 1, we: 1, jullie: 1, het: 1, de: 1, een: 1, geen: 1,
    niet: 1, en: 1, of: 1, maar: 1, dat: 1, dit: 1, die: 1, mijn: 1, je_: 1 };
  var PROFESSION_ES = { profesor: 1, estudiante: 1, médico: 1, enfermera: 1, maestro: 1, camarero: 1, policía: 1, abogado: 1 };

  // Spaans geslacht (heuristiek voor woorden uit het woordenboek)
  var MASC_A = { mapa: 1, día: 1, problema: 1, tema: 1, sistema: 1, programa: 1, idioma: 1, planeta: 1, clima: 1, sofá: 1,
    pijama: 1, drama: 1, poema: 1, dilema: 1, telegrama: 1 };
  var FEM_O = { mano: 1, radio: 1, foto: 1, moto: 1, flor: 1, sal: 1 };
  var FEM_E = { madre: 1, fuente: 1, base: 1, costumbre: 1, hermana_: 0, leche: 1, noche: 1, clase: 1, calle: 1, parte: 1, gente: 1, llave: 1, nariz: 1, tarde: 1, ciudad: 1,
    verdad: 1, carne: 1, suerte: 1, muerte: 1, fiebre: 1, sangre: 1, sede: 1, señal: 1, serie: 1, mente: 1, lección: 1,
    cárcel: 1, imagen: 1, canción: 1, estación: 1, cocina: 1, nación: 1, vez: 1, luz: 1, paz: 1, voz: 1, crisis: 1 };
  var STRESSED_A = { agua: 1, hambre: 1, alma: 1, arma: 1, águila: 1, área: 1, hacha: 1, ascua: 1 };
  var PLURAL_ES = { deberes: 1, gafas: 1, vacaciones: 1, pantalones: 1, tijeras: 1 };

  function esc(s) { return String(s); }

  // el/la uit de PDF-lijst (Collins Spanish); eigen tabellen hierboven winnen
  var ESG = null;
  function esGenData(w) {
    if (!ESG) { ESG = {}; if (typeof ZIN_GENDER !== "undefined" && ZIN_GENDER.es) ZIN_GENDER.es.split("|").forEach(function (p) { var i = p.indexOf("="); if (i > 0) ESG[p.slice(0, i)] = p.slice(i + 1); }); }
    return ESG[w] || null;
  }

  function isFem(w) {
    if (MASC_A[w]) return false;
    if (FEM_O[w]) return true;
    if (FEM_E[w]) return true;
    var pg = esGenData(w);
    if (pg) return pg === "f";
    if (/(ción|sión|dad|tad|tud|umbre|itud|ión)$/.test(w)) return true;
    if (/a$/.test(w)) return true;
    if (/(z)$/.test(w)) return true;
    return false;
  }
  function artFor(w, plural, def) {
    if (def) {
      if (plural) return isFem(w) ? "las" : "los";
      if (STRESSED_A[w] && isFem(w)) return "el";
      return isFem(w) ? "la" : "el";
    }
    if (plural) return isFem(w) ? "unas" : "unos";
    if (STRESSED_A[w] && isFem(w)) return "un";
    return isFem(w) ? "una" : "un";
  }
  function pluralOf(w) {
    if (PLURAL_ES[w]) return w;
    if (/(s)$/.test(w)) return w;
    if (/[aeiouáéíóú]$/.test(w)) return w + "s";
    if (/z$/.test(w)) return w.slice(0, -1) + "ces";
    return w + "es";
  }
  function adjFor(adj, fem, plural) {
    var base = adj;
    if (/o$/.test(base)) base = base.slice(0, -1) + (fem ? "a" : "o");
    if (plural) base = /[aeiou]$/.test(base) ? base + "s" : base + "es";
    return base;
  }
  function lower(s) { return s.toLowerCase().replace(/[?!.,]/g, ""); }

  // ---- Zelfstandig naamwoord uit het woordenboek (enkelvoud of meervoud), of null
  // Gecontroleerde bijvoeglijke naamwoorden, ook de verbogen vormen (voorrang op het woordenboek)
  var ADJ = {
    groot: "grande", grote: "grande", klein: "pequeño", kleine: "pequeño", mooi: "bonito", mooie: "bonito",
    koud: "frío", warm: "caliente", nieuw: "nuevo", nieuwe: "nuevo", oud: "viejo", oude: "viejo",
    jong: "joven", goed: "bueno", goede: "bueno", slecht: "malo", snel: "rápido", langzaam: "lento",
    lekker: "rico", leuk: "divertido", moeilijk: "difícil", makkelijk: "fácil", duur: "caro", goedkoop: "barato",
    gelukkig: "feliz", rustig: "tranquilo", druk: "ocupado", belangrijk: "importante", aardig: "simpático",
    vriendelijk: "amable", rijk: "rico", arm: "pobre", lang: "largo", hoog: "alto", blij: "contento", ziek: "enfermo",
    moe: "cansado", boos: "enfadado", bang: "asustado", verdrietig: "triste", vrolijk: "alegre", zwak: "débil"
  };
  // Bijvoeglijk naamwoord uit de vaste lijst of het woordenboek; Nederlandse verbuiging wordt ook herkend
  function adjOf(nl, dict) {
    if (ADJ[nl] !== undefined) return ADJ[nl];
    if (dict[nl] !== undefined && !/\s/.test(dict[nl])) return dict[nl];
    if (/e$/.test(nl) && nl.length > 4 && dict[nl.slice(0, -1)] !== undefined && !/\s/.test(dict[nl.slice(0, -1)])) return dict[nl.slice(0, -1)];
    return null;
  }
  // Vrouwelijke vorm van een nationaliteit: español -> española, inglés -> inglesa
  function natFem(v) {
    if (/és$/.test(v)) return v.slice(0, -2) + "esa";
    if (/ol$/.test(v)) return v + "a";
    return v;
  }
  var NL_NOUN_FIX = { kaart: "mapa", kaarten: "mapas", menukaart: "menú", spijskaart: "menú" };
  function nounEs(nl, dict) {
    if (NOT_NOUN[nl]) return null;
    var v = NL_NOUN_FIX[nl] || dict[nl];
    if (v !== undefined && !/\s/.test(v)) return { es: v, plural: !!PLURAL_ES[v] || (/en$/.test(nl) && /s$/.test(v)) };
    if (/en$/.test(nl) && dict[nl.slice(0, -2)] !== undefined && !/\s/.test(dict[nl.slice(0, -2)])) {
      return { es: dict[nl.slice(0, -2)], plural: true };
    }
    return null;
  }

  // ---- Bouw een naamgroep: [lidwoord/aanwijzend/bezittelijk] [bijvoeglijk]? zelfstandig naamwoord
  // Geeft { s: "...", plural, fem, def } of null
  function np(toks, i, dict, opts) {
    var det = null, def = false, plural = false, ref = null, j = i;
    var t = toks[j];
    if (t === undefined) return null;
    if (t === "de" || t === "het") { def = true; det = "art"; j++; }
    else if (t === "een") { det = "ind"; j++; }
    else if (t === "dit" || t === "dat" || t === "die") { det = t; j++; }
    else if (POSS[t] !== undefined) { det = "poss:" + t; j++; }
    var rest = toks.slice(j);
    if (!rest.length) return null;
    var nw = rest[0];
    // Eigennamen en plaatsen
    if (PROPER[nw] !== undefined) return { s: PROPER[nw], plural: false, fem: false, def: false, end: j + 1, proper: true };
    var nn = nounEs(nw, dict);
    var adjEs = null, adjEnd = 0;
    if (!nn && rest.length >= 2 && adjOf(nw, dict)) {
      // bijvoeglijk naamwoord voor het zelfstandig naamwoord: "grote stad" -> "ciudad grande"
      var nn2 = nounEs(rest[1], dict);
      if (nn2) { adjEs = adjOf(nw, dict); nn = nn2; adjEnd = 1; }
    }
    if (!nn) return null;
    var es = nn.es;
    var fem = isFem(es);
    plural = nn.plural;
    if (opts && opts.plural !== undefined) plural = opts.plural;
    var out = [];
    if (det === "art") out.push(artFor(es, plural, true));
    else if (det === "ind") out.push(artFor(es, plural, false));
    else if (det === "dit") out.push(fem ? (plural ? "estas" : "esta") : (plural ? "estos" : "este"));
    else if (det === "dat" || det === "die") out.push(fem ? (plural ? "esas" : "esa") : (plural ? "esos" : "ese"));
    else if (det && det.indexOf("poss:") === 0) out.push(POSS[det.slice(5)] + (plural ? "s" : ""));
    var noun = plural ? pluralOf(es) : es;
    out.push(noun);
    if (adjEs) out.push(adjFor(adjEs, fem, plural));
    return { s: out.join(" "), plural: plural, fem: fem, def: def, end: j + 1 + adjEnd, es: es };
  }

  // ---- Werkwoorden afleiden uit het woordenboek: elk Nederlands werkwoord waarvan het Spaanse equivalent in de
  // werkwoordenlijst staat, krijgt automatisch zijn vormen (regelmatige Nederlandse vervoeging).
  var AUTO_SKIP = /^(ben|bent|is|zijn|heb|hebt|heeft|hebben|ga|gaat|gaan|kan|kun|kunt|kunnen|mag|mogen|wil|wilt|willen|moet|moeten|zal|zul|zullen|zou|zouden|word|wordt|worden|blijf|blijft|blijven|laat|laten|lat)$/;
  function autoVerb(w, dict, force) {
    if (FORM[w] || VERB[w] || AUTO_SKIP.test(w) || typeof ZINC === "undefined" || !ZINC.VERB || !ZINC.esForm) return;
    var cands = [], st = w.replace(/t$/, "");
    [w, st].forEach(function (b) {
      if (/en$/.test(b)) cands.push(b);
      cands.push(b + "en");
      if (/(aa|ee|oo|uu)[^aeiou]$/.test(b)) cands.push(b.replace(/(aa|ee|oo|uu)([^aeiou])$/, function (m, v, c) { return v.charAt(0) + c + "en"; }));
      if (/([^aeiou])\1$/.test(b)) cands.push(b.slice(0, -1) + "en");
      if (/[^aeiou][aeiou][^aeiou]$/.test(b)) cands.push(b + b.slice(-1) + "en");
      if (/f$/.test(b)) cands.push(b.slice(0, -1) + "ven");
      if (/s$/.test(b)) cands.push(b.slice(0, -1) + "zen");
    });
    for (var i = 0; i < cands.length; i++) {
      var inf = cands[i], lem = dict[inf];
      if (!lem || /\s/.test(lem) || !/(ar|er|ir)$/.test(lem) || !ZINC.VERB[lem] || ZINC.esIsRefl && ZINC.esIsRefl(lem)) continue;
      var stem = inf.slice(0, -2).replace(/(aa|ee|oo|uu)([^aeiou])$/, function (m, v, c) { return v.charAt(0) + c; });
      // stam moet bij het getoonde woord passen: infinitief, ik-vorm of jij/hij-vorm
      var stems = [inf.slice(0, -2), stem, stem.replace(/(.)\1$/, "$1"), stem.replace(/v$/, "f").replace(/z$/, "s"), inf.slice(0, -2).replace(/([^aeiou])([aeiou])([^aeiou])$/, "$1$2$2$3")];
      var okForm = w === inf || stems.indexOf(w) >= 0 || stems.some(function (x) { return x + "t" === w; });
      if (!okForm) continue;
      if (!force && dict[w] !== undefined && w !== inf && [0, 1, 2, 3, 5].map(function (k) { return ZINC.esForm(lem, "pres", k); }).indexOf(dict[w]) < 0) continue;
      var pp = [0, 1, 2, 3, 4, 5].map(function (k) { return ZINC.esForm(lem, "pres", k === 4 ? 5 : k) || ""; });
      if (pp.some(function (x) { return !x; })) continue;
      if (!VERB[inf]) VERB[inf] = { es: lem, p: pp };
      FORM[inf] = inf;
      stems.forEach(function (x) { if (!FORM[x]) FORM[x] = inf; if (!FORM[x + "t"]) { FORM[x + "t"] = inf; SINGULAR_FORMS[x + "t"] = 1; } });
      return;
    }
  }

  // ---- Hoofdfunctie
  // Verleden tijd: Nederlandse vormen -> infinitief; de Spaanse vorm wordt in buildVerb gekozen
  var NL_PAST = {
    hebben: ["had", "hadden", "gehad", "h"], wonen: ["woonde", "woonden", "gewoond", "h"], kunnen: ["kon", "konden", null, "h"], willen: ["wilde", "wilden", null, "h"],
    moeten: ["moest", "moesten", null, "h"], gaan: ["ging", "gingen", "gegaan", "z"], spelen: ["speelde", "speelden", "gespeeld", "h"], eten: ["at", "aten", "gegeten", "h"],
    drinken: ["dronk", "dronken", "gedronken", "h"], spreken: ["sprak", "spraken", "gesproken", "h"], werken: ["werkte", "werkten", "gewerkt", "h"],
    leren: ["leerde", "leerden", "geleerd", "h"], lezen: ["las", "lazen", "gelezen", "h"], kijken: ["keek", "keken", "gekeken", "h"], weten: ["wist", "wisten", "geweten", "h"],
    komen: ["kwam", "kwamen", "gekomen", "z"], zien: ["zag", "zagen", "gezien", "h"], doen: ["deed", "deden", "gedaan", "h"], zeggen: ["zei", "zeiden", "gezegd", "h"],
    luisteren: ["luisterde", "luisterden", "geluisterd", "h"], openen: ["opende", "openden", "geopend", "h"], helpen: ["hielp", "hielpen", "geholpen", "h"],
    begrijpen: ["begreep", "begrepen", "begrepen", "h"], nemen: ["nam", "namen", "genomen", "h"], geven: ["gaf", "gaven", "gegeven", "h"], brengen: ["bracht", "brachten", "gebracht", "h"],
    sturen: ["stuurde", "stuurden", "gestuurd", "h"]
  };
  var NL_OVT = {}, NL_PP = {}, PAST_MODE = null;
  Object.keys(NL_PAST).forEach(function (l) {
    var d = NL_PAST[l];
    NL_OVT[d[0]] = l; NL_OVT[d[1]] = l;
    if (d[2]) NL_PP[d[2]] = l;
  });
  var AUX_H = { heb: 1, hebt: 1, heeft: 1, hebben: 1 }, AUX_Z = { ben: 1, bent: 1, is: 1, zijn: 1 };
  function presTokenOf(lem) {
    var keys = Object.keys(FORM);
    for (var k = 0; k < keys.length; k++) if (FORM[keys[k]] === lem && !/_$/.test(keys[k])) return keys[k];
    return lem;
  }
  function pastRewrite(toks) {
    PAST_MODE = null;
    var clean = toks.map(function (t) { return t.replace(/[.,!?]/g, ""); });
    for (var i = 0; i < clean.length; i++) {
      if (NL_OVT[clean[i]] !== undefined && !FORM[clean[i]]) {
        var l = NL_OVT[clean[i]], out = toks.slice();
        out[i] = presTokenOf(l) + toks[i].slice(clean[i].length);
        PAST_MODE = { lem: l, kind: "ovt" };
        return out;
      }
    }
    for (var a = 0; a < clean.length; a++) {
      if (!AUX_H[clean[a]] && !AUX_Z[clean[a]]) continue;
      for (var b = a + 1; b < clean.length; b++) {
        var pl = NL_PP[clean[b]];
        if (pl === undefined) continue;
        if ((NL_PAST[pl][3] === "h") !== !!AUX_H[clean[a]]) continue;
        var o2 = toks.slice();
        var tailPunct = toks[b].slice(clean[b].length);
        o2[a] = presTokenOf(pl) + toks[a].slice(clean[a].length);
        o2.splice(b, 1);
        if (tailPunct && o2.length) o2[o2.length - 1] = o2[o2.length - 1].replace(/[.,!?]+$/, "") + tailPunct;
        PAST_MODE = { lem: pl, kind: "perf" };
        return o2;
      }
    }
    return toks;
  }
  var HABER_ES = ["he", "has", "ha", "hemos", "han", "han"];
  function pastConj(lem, v, p) {
    var zp = [0, 1, 2, 3, 5, 5][p];
    if (PAST_MODE.kind === "perf") {
      if (lem === "moeten" || !v.es || typeof ZINC === "undefined" || !ZINC.esPP) return null;
      var pp = null; try { pp = ZINC.esPP(v.es); } catch (e) { pp = null; }
      return pp ? HABER_ES[p] + " " + pp : null;
    }
    if (lem === "moeten") return ["tuve que", "tuviste que", "tuvo que", "tuvimos que", "tuvieron que", "tuvieron que"][p];
    if (typeof ZINC === "undefined" || !ZINC.esForm) return null;
    var f = null; try { f = ZINC.esForm(v.es, "pret", zp); } catch (e) { f = null; }
    return f;
  }

  function translate(text, dict, gen) {
    if (!text || !dict) return null;
    var raw = lower(String(text).trim());
    var q = /\?\s*$/.test(String(text).trim());
    var toks = raw.split(/\s+/).filter(Boolean);
    if (!toks.length) return null;
    toks = pastRewrite(toks);
    toks.forEach(function (tk, ti) { autoVerb(tk.replace(/[.,!?]/g, ""), dict, ti === 0 || SUBJ[toks[ti - 1]] !== undefined || SUBJ[toks[ti + 1]] !== undefined); });
    var fem = gen === "f";

    // Vaste zinnen en vaste vragen
    var key = toks.join(" ");
    var FIXED = {
      "hoe laat is het": "¿Qué hora es?",
      "hoe laat is het?": "¿Qué hora es?",
      "wat is je naam": "¿Cómo te llamas?",
      "hoe heet je": "¿Cómo te llamas?",
      "hoe gaat het": "¿Cómo estás?",
      "hoe gaat het met je": "¿Cómo estás?",
      "hoe gaat het met jou": "¿Cómo estás?",
      "goedemorgen": "Buenos días.",
      "goedemiddag": "Buenas tardes.",
      "goedenavond": "Buenas noches.",
      "dank je": "Gracias.",
      "dank je wel": "Muchas gracias.",
      "tot ziens": "Hasta luego.",
      "ik begrijp het niet": "No lo entiendo.",
      "ik begrijp het niet.": "No lo entiendo.",
      "ik weet het niet": "No lo sé.",
      "dat weet ik niet": "No lo sé.",
      "mag ik een koffie": "¿Puedo tomar un café?",
      "mag ik een koffie?": "¿Puedo tomar un café?",
      "kan ik je helpen": "¿Puedo ayudarte?",
      "kan ik je helpen?": "¿Puedo ayudarte?",
      "je hebt gelijk": "Tienes razón.",
      "ik heb gelijk": "Tengo razón.",
      "je hebt geen gelijk": "No tienes razón.",
      "het is koud": "Hace frío.",
      "het is warm": "Hace calor.",
      "het is heel warm": "Hace mucho calor.",
      "het is koud vandaag": "Hace frío hoy.",
      "het is warm vandaag": "Hace calor hoy.",
      "het is heel koud": "Hace mucho frío.",
      "er is geen brood": "No hay pan.",
      "ik kom uit nederland": "Vengo de los Países Bajos.",
      "ik kom uit spanje": "Vengo de España.",
      "ik ben vandaag moe": "Estoy cansado hoy.",
      "ik ben erg blij": "Estoy muy contento."
    };
    if (FIXED[key] !== undefined) return FIXED[key];

    // Gebiedende wijs: "help mij ..." (tú-vorm, voornaamwoord aan het werkwoord)
    if (!PAST_MODE && VERB[FORM[toks[0]]] && (toks[0] === "help" || toks[0] === "luister" || toks[0] === "kijk" || toks[0] === "zeg" || toks[0] === "kom" || toks[0] === "eet" || toks[0] === "drink")) {
      var lemmaI = FORM[toks[0]], vI = VERB[lemmaI];
      if (vI && vI.p && toks[1] && OBJ[toks[1]] !== undefined) {
        var imp = vI.p[2].replace(/ .*/, "");              // tú-gebiedende = 3e persoon enkelvoud
        var rest1 = toks.slice(2);
        var tail = rest1.length ? clauseTail(rest1, dict) : null;
        if (tail === null && rest1.length) return null;
        var impAcc = { ayuda: "ayúda", escucha: "escúcha", mira: "míra", come: "cóme", bebe: "bébe", habla: "hábla", dice: "di", viene: "ven" };
        var impTxt = (impAcc[imp] || imp) + OBJ[toks[1]];
        return cap(impTxt + (tail ? " " + tail : "") + ".");
      }
      return null;
    }

    // Vragen die met een vraagwoord beginnen
    var WH = { waar: "dónde", wanneer: "cuándo", hoe: "cómo", wat: "qué", wie: "quién", waarom: "por qué", welke: "cuál", hoeveel: "cuánto" };
    if (WH[toks[0]] !== undefined) {
      var whEs = WH[toks[0]];
      var restQ = toks.slice(1);
      if (restQ[0] === "laat" && restQ[1] === "is" && restQ[2] === "het") return "¿Qué hora es?";
      if (restQ[0] === "heet" && restQ[1] === "je") return "¿Cómo te llamas?";
      if (restQ[0] === "is" && restQ[1] === "je" && restQ[2] === "naam") return "¿Cómo te llamas?";
      if (restQ[0] === "heet" && (restQ[1] === "hij" || restQ[1] === "zij")) return "¿Cómo se llama?";
      if (restQ.length && FORM[restQ[0]]) {
        var lemQ = FORM[restQ[0]], vQ = VERB[lemQ];
        if (!vQ || !vQ.p) return null;
        var subjQ = restQ[1];
        var s2 = subjQ && SUBJ[subjQ] ? SUBJ[subjQ] : null;
        var persQ = s2 ? s2.p : null;
        if (persQ === null) {
          // WH + werkwoord + zelfstandig naamwoord (bijv. "waar is het station")
          var npQ = np(restQ, 1, dict);
          if (!npQ) return null;
          var isLoc = whEs === "dónde" || locationLike(toks.slice(2));
          var verbQ = vQ.copula ? (isLoc ? (npQ.plural ? "están" : "está") : (npQ.plural ? "son" : "es")) : (vQ.p[2] || "");
          return qwrap(whEs + " " + verbQ + " " + npQ.s);
        }
        // WH + werkwoord + onderwerp (bijv. "waar woon je")
        var conjQ = vQ.p[persQ];
        if (PAST_MODE && lemQ === PAST_MODE.lem) { conjQ = pastConj(lemQ, vQ, persQ); if (!conjQ) return null; }
        var tailQ = restQ.slice(2);
        var tailTxt = tailQ.length ? clauseTail(tailQ, dict) : "";
        if (tailQ.length && tailTxt === null) return null;
        return qwrap(whEs + " " + conjQ + (tailTxt ? " " + tailTxt : ""));
      }
      return null;
    }

    // Ja/nee-vragen met omgekeerde volgorde: "heb je een hond?", "ben je moe?", "kan ik je helpen?"
    if (FORM[toks[0]] && SUBJ[toks[1]] !== undefined) {
      var lemY = FORM[toks[0]], vY = VERB[lemY];
      if (!vY) return null;
      var sY = SUBJ[toks[1]];
      var restY = toks.slice(2);
      if (vY.modal && restY[0] && restY[0] === "je") {
        // "kan ik je helpen": modaal + onderwerp + objectvoornaamwoord + infinitief
        return null;
      }
      var core = buildVerb(lemY, vY, sY, restY, dict, fem, true);
      if (core === null) return null;
      return qwrap(core);
    }

    // "er is / er zijn" (bestaan): hay
    if (toks[0] === "er" && (toks[1] === "is" || toks[1] === "zijn")) {
      var exNeg = toks.indexOf("geen") >= 0;
      var exRest = toks.slice(2).filter(function (w) { return w !== "geen"; });
      var exNp = exRest.length ? np(exRest, 0, dict) : null;
      if (!exNp || exNp.end !== exRest.length) return null;
      return cap((exNeg ? "no hay " : "hay ") + exNp.s.replace(/^(un|una|unos|unas) /, "") + ".");
    }
    // Mededelingen: [onderwerp] [ontkenning?] [werkwoord] [rest]
    var verbIdx = -1;
    for (var i = 0; i < toks.length; i++) { if (FORM[toks[i]] || VERB[toks[i]]) { verbIdx = i; break; } }
    if (verbIdx < 0) return null;
    var subjToks = toks.slice(0, verbIdx), lem = FORM[toks[verbIdx]] || toks[verbIdx];
    var v = VERB[lem];
    if (!v) return null;
    var subjText = subjToks.join(" ");
    var subjInfo = null, subjEs = null, subjPlural = false, subjFem = false;
    if (subjToks.length === 1 && (subjToks[0] === "dat" || subjToks[0] === "dit")) {
      subjEs = subjToks[0] === "dat" ? "eso" : "esto";
      subjInfo = { p: 2, g: "m" };
      subjEs = null;
      var demEs = subjToks[0] === "dat" ? "eso" : "esto";
      var restDem = toks.slice(verbIdx + 1);
      var dsent = buildVerb(lem, v, subjInfo, restDem, dict, fem, false, null);
      if (dsent === null) return null;
      if (dsent.indexOf("muy") === 0 && false) return null;
      return cap(demEs + " " + dsent.replace(/^(\S+)/, "$1").replace(/\.$/, "") + ".").replace(/\.\.$/, ".");
    }
    if (subjToks.length === 1 && subjToks[0] === "zij") {
      var sing = SINGULAR_FORMS[toks[verbIdx]] === 1;
      subjInfo = sing ? { p: 2, g: "f" } : { p: 5, g: "m" };
    } else if (subjToks.length === 1 && SUBJ[subjToks[0]] !== undefined) {
      subjInfo = SUBJ[subjToks[0]];
    } else if (subjToks.length === 0) {
      subjInfo = null;
    } else {
      var npS = np(subjToks, 0, dict);
      if (!npS || npS.end !== subjToks.length) return null;
      subjEs = npS.s; subjPlural = npS.plural; subjFem = npS.fem;
      subjInfo = { p: subjPlural ? 5 : 2, g: subjFem ? "f" : "m", noun: true };
    }
    var restD = toks.slice(verbIdx + 1);
    var sentence = buildVerb(lem, v, subjInfo, restD, dict, fem, false, subjEs);
    if (sentence === null) return null;
    if (subjEs && !v.special && !v.reflexive && sentence.indexOf("me ") !== 0) sentence = subjEs + " " + sentence;
    var outS = sentence.replace(/\s+/g, " ").trim().replace(/\s([.,?!])/g, "$1");
    return q ? qwrap(outS) : cap(outS);
  }

  // Zelfstandig naamwoord zonder lidwoord na een voorzetsel krijgt in het Spaans een lidwoord (naar school -> a la escuela)
  function bareNoun(words, i, dict) {
    var nn = nounEs(words[i], dict);
    if (!nn) return null;
    var es = nn.es, plural = nn.plural;
    return { s: artFor(es, plural, true) + " " + (plural ? pluralOf(es) : es), plural: plural, end: i + 1 };
  }
  function contract(prep, s) {
    if (prep === "a" && /^el /.test(s)) return "al " + s.slice(3);
    if (prep === "de" && /^el /.test(s)) return "del " + s.slice(3);
    return prep + " " + s;
  }

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function qwrap(s) { return "¿" + cap(String(s).replace(/\.$/, "").replace(/\?$/, "")) + "?"; }
  var NUM = { een: "una", één: "una", twee: "dos", drie: "tres", vier: "cuatro", vijf: "cinco", zes: "seis", zeven: "siete",
    acht: "ocho", negen: "nueve", tien: "diez", elf: "once", twaalf: "doce" };
  var QTY = { veel: "mucho", weinig: "poco", meer: "más" };

  function locationLike(words) {
    return words.some(function (w) { return LOCATION_NL[w] !== undefined; }) ||
      (words[0] && LOCATION_NL[words[0]] !== undefined);
  }

  // Bouwt het werkwoordsdeel en de rest van de zin. subjInfo: { p, g } of null (onderwerp weglaten)
  function buildVerb(lem, v, subjInfo, rest, dict, fem, inverted, subjEs) {
    var p = subjInfo ? subjInfo.p : 2;
    var g = subjInfo && subjInfo.g ? subjInfo.g : (fem ? "f" : "m");
    var neg = rest.indexOf("niet") >= 0;
    var restN = rest.filter(function (w) { return w !== "niet"; });
    var noSubj = subjInfo === null;
    var prefix = neg ? "no " : "";

    // Gustar-constructie: "ik hou van X", "ik vind X leuk"
    if (v.special === "gustar") {
      var obj = null;
      if (lem === "houden" && restN[0] === "van") obj = restN.slice(1);
      else if (lem === "vinden") {
        var lk = restN.indexOf("leuk");
        if (lk > 0) obj = restN.slice(0, lk);
        else if (lk === 0) obj = null;
      }
      if (!obj || !obj.length) return null;
      if (lem === "houden" && obj.length === 1 && OBJ[obj[0]] !== undefined && obj[0] !== "het") {
        var lvC = { me: "me", mij: "me", je: "te", jou: "te", hem: "lo", haar: "la", ons: "nos", jullie: "os", hen: "los", ze: "las" }[obj[0]];
        return prefix + lvC + " " + VERB.willen.p[p] + ".";
      }
      if (obj.length === 1 && VERB[obj[0]] && VERB[obj[0]].p) return (neg ? "no " : "") + "me gusta " + VERB[obj[0]].es + ".";
      var sub = obj.length === 1 && DEM[obj[0]] ? (obj[0] === "dit" ? "esto" : "eso") : null;
      var subjEsObj = sub;
      if (!sub) {
        var npO = np(obj, 0, dict);
        if (!npO || npO.end !== obj.length) return null;
        subjEsObj = npO.s;
        var pl = npO.plural;
        var gust = pl ? "gustan" : "gusta";
        if (!/^(los|las|el|la|un|una|unos|unas|esta|este|estas|estos|ese|esa|esos|esas|mi|mis|tu|tus|su|sus|nuestro|nuestra|nuestros|nuestras) /.test(subjEsObj)) {
          subjEsObj = artFor(npO.es, pl, true) + " " + subjEsObj;
        }
        return (neg ? "no " : "") + "me " + gust + " " + subjEsObj + ".";
      }
      return prefix + "me gusta " + sub + ".";
    }

    // Vaste werkwoordstructuren
    var conj;
    if (v.reflexive) {
      // "ik heet Abel" -> "me llamo Abel"
      var rPers = [0, 1, 2, 3, 4, 5].indexOf(p);
      var rf = v.p[p] || v.p[2];
      var nameTxt = restN.length ? restN.join(" ") : "";
      if (!nameTxt) return null;
      var pn = nameTxt.split(" ").map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(" ");
      return prefix + rf + " " + pn + ".";
    }
    conj = v.p ? v.p[p] : null;
    if (conj && PAST_MODE && lem === PAST_MODE.lem) conj = pastConj(lem, v, p);
    if (!conj) return null;
    if (lem === "worden") {
      var rw = buildCopula(restN, subjInfo, dict, fem, neg, noSubj, subjEs, inverted);
      if (!rw) return null;
      var pre = neg ? "no " : "", body = rw.slice(pre.length).split(" ");
      body[0] = conj; return pre + body.join(" ");
    }
    if (lem === "blijven" && restN.length) {
      var tl = clauseTail(restN, dict);
      if (tl) return (neg ? "no " : "") + conj + " " + tl + ".";
    }
    if (lem === "zijn" || v.copula) return buildCopula(restN, subjInfo, dict, fem, neg, noSubj, subjEs, inverted);

    // Modale werkwoorden met infinitief of zelfstandig naamwoord
    if (v.modal || lem === "gaan") {
      var infOrNp = restN.slice();
      if (lem === "zou") { if (infOrNp[0] !== "moeten") return null; infOrNp.shift(); }
      // "mag ik een koffie"
      if (lem === "mogen" && infOrNp.length && !(VERB[infOrNp[infOrNp.length - 1]] && VERB[infOrNp[infOrNp.length - 1]].p)) {
        var rN = np(infOrNp, 0, dict) || (infOrNp.length === 1 && nounEs(infOrNp[0], dict) ? { s: nounEs(infOrNp[0], dict).es, end: 1 } : null);
        if (!rN || rN.end !== infOrNp.length) return null;
        return prefix + "puedo tomar " + rN.s + ".";
      }
      // modaal + infinitief (laatste woord is een werkwoord uit de tabel)
      var last = infOrNp[infOrNp.length - 1];
      var infLemma = last && VERB[last] ? last : null;
      if (infOrNp.length >= 1 && FORM[infOrNp[0]] && VERB[FORM[infOrNp[0]]]) return null;
      if (infLemma && VERB[infLemma] && VERB[infLemma].p) {
        var infEs = VERB[infLemma].es;
        var objWords = infOrNp.slice(0, -1);
        var clitic = "";
        if (objWords.length === 1 && OBJ[objWords[0]] !== undefined) clitic = OBJ[objWords[0]];
        else if (objWords.length) return null;
        if (lem === "gaan") {
          return prefix + conj + " a " + (clitic ? clitic : "") + (clitic ? infEs.replace(/$/, "") : infEs) + ".";
        }
        var pre = lem === "moeten" ? "tener que " : "";
        if (lem === "moeten") return prefix + conj + " " + (clitic ? clitic + infEs : infEs) + ".";
        return prefix + conj + " " + (clitic ? infEs.replace(/$/, "") + clitic : infEs) + ".";
      }
      if (lem === "gaan") {
        var locE = restN.length ? clauseTail(restN, dict) : null;
        if (locE === null) return null;
        return prefix + conj + (locE ? " " + locE : "") + ".";
      }
      var restObj = clauseTail(restN, dict);
      if (restObj === null) return null;
      return prefix + conj + (restObj ? " " + restObj : "") + ".";
    }

    // Meewerkend voorwerp: "ik geef je het boek" -> "te doy el libro"
    if (v.io && restN.length > 1 && OBJ[restN[0]] !== undefined && restN[0] !== "het") {
      var ioMap = { mij: "me", me: "me", je: "te", jou: "te", hem: "le", haar: "le", ons: "nos", jullie: "les", hen: "les", ze: "les" };
      var ioCl = ioMap[restN[0]];
      var ioRest = restN.slice(1);
      if (ioCl && !(OBJ[ioRest[0]] !== undefined && ioRest.length === 1)) {
        var ioN = np(ioRest, 0, dict);
        if (ioN) {
          var ioT = ioRest.slice(ioN.end), ioTail = ioT.length ? clauseTail(ioT, dict) : "";
          if (ioTail === null) return null;
          return prefix + ioCl + " " + conj + " " + ioN.s + (ioTail ? " " + ioTail : "") + ".";
        }
      }
    }
    // Werkwoord + voorzetsel dat in het Spaans een rechtstreeks voorwerp is: kijken naar, luisteren naar, wachten op
    if (v.prepObj && restN[0] === v.prepObj && restN.length > 1) {
      var po = restN.slice(1), poClit = "", poObj = "", poEnd = 0;
      if (OBJ[po[0]] !== undefined && po[0] !== "het") { poClit = OBJ[po[0]]; poEnd = 1; }
      else {
        var poN = np(po, 0, dict);
        if (poN) { poObj = poN.s; poEnd = poN.end; }
        else {
          var poB = nounEs(po[0], dict);
          if (!poB) return null;
          poObj = poB.plural ? pluralOf(poB.es) : poB.es; poEnd = 1;
        }
        if (/^(el|la|los|las) (madre|padre|hermano|hermana|amigo|amiga|profesor|profesora|médico|médica|hijo|hija|niño|niña|hombre|mujer) /.test(poObj + " ") || /^(el|la) (hombre|mujer)$/.test(poObj)) poObj = "a " + poObj;
      }
      var poRest = po.slice(poEnd), poTail = poRest.length ? clauseTail(poRest, dict) : "";
      if (poTail === null) return null;
      return prefix + (poClit ? poClit + " " : "") + conj + (poObj ? " " + poObj : "") + (poTail ? " " + poTail : "") + ".";
    }

    // Gewone werkwoorden: object en bijwoorden
    var tail = clauseTail(restN, dict, true);
    if (tail === null) return null;
    var tailParts = tail.split("|");
    var clitTxt = tailParts[0];
    var restTxt = tailParts[1] || "";
    var objectSpan = clitTxt ? clitTxt + " " : "";
    if (lem === "hebben" && restN[0] === "geen") {
      var rg = np(restN, 1, dict);
      if (!rg) return null;
      return prefix + "no " + conj.replace(/^no /, "") + " " + rg.s.replace(/^(un|una|unos|unas|el|la|los|las) /, "") + ".";
    }
    if (neg) {
      return "no " + conj + (restTxt ? " " + restTxt : "") + ".";
    }
    return (objectSpan ? (objectSpan) : "") + conj + (restTxt ? " " + restTxt : "") + ".";
  }

  // Object en bijwoorden/voorzetsels. Geeft "clitic|rest" terug (clitic = objectvoornaamwoord voor het werkwoord)
  // Tijden in het Nederlands naar Spaans: "half twaalf" = 11:30 = "las once y media";
  // "kwart over drie" = "las tres y cuarto"; "kwart voor drie" = "las dos menos cuarto"; "vijf over tien" = "las diez y cinco".
  var NUMV = { een: 1, "één": 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10, elf: 11, twaalf: 12 };
  var ESNUM = ["", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce"];
  function hourEs(h) {
    h = ((h + 11) % 12) + 1;           // 0 -> 12, 13 -> 1
    return h === 1 ? "la una" : "las " + ESNUM[h];
  }
  // Geeft {es, n} terug als er op positie i een tijd staat, anders null. n = aantal woorden dat verwerkt is.
  function timeEs(words, i) {
    var at = words[i] === "om" ? 1 : 0, j = i + at, t = words[j], pre = at ? "a " : "";
    if (t === undefined) return null;
    if (t === "half" && NUMV[words[j + 1]] !== undefined) return { es: pre + hourEs(NUMV[words[j + 1]] - 1) + " y media", n: at + 2 };
    if (t === "kwart" && NUMV[words[j + 2]] !== undefined) {
      if (words[j + 1] === "over") return { es: pre + hourEs(NUMV[words[j + 2]]) + " y cuarto", n: at + 3 };
      if (words[j + 1] === "voor") return { es: pre + hourEs(NUMV[words[j + 2]] - 1) + " menos cuarto", n: at + 3 };
    }
    if ((t === "vijf" || t === "tien") && (words[j + 1] === "over" || words[j + 1] === "voor") && NUMV[words[j + 2]] !== undefined) {
      var mins = t === "vijf" ? "cinco" : "diez";
      if (words[j + 1] === "over") return { es: pre + hourEs(NUMV[words[j + 2]]) + " y " + mins, n: at + 3 };
      return { es: pre + hourEs(NUMV[words[j + 2]] - 1) + " menos " + mins, n: at + 3 };
    }
    if (NUMV[t] !== undefined && words[j + 1] === "uur") return { es: pre + hourEs(NUMV[t]), n: at + 2 };
    return null;
  }

  function clauseTail(words, dict, withClitic) {
    var out = [], clit = "";
    var i = 0;
    while (i < words.length) {
      var w = words[i];
      var tm = (w === "om" || w === "half" || w === "kwart" || w === "vijf" || w === "tien") ? timeEs(words, i) : null;
      if (tm) { out.push(tm.es); i += tm.n; continue; }
      if (w === "om" && NUM[words[i + 1]] && words[i + 2] === "uur") { out.push("a las " + NUM[words[i + 1]]); i += 3; continue; }
      if (w === "veel" || w === "weinig") {
        var qn = nounEs(words[i + 1] || "", dict);
        if (qn) {
          var qAdj = QTY[w];
          out.push(adjFor(qAdj, isFem(qn.es), qn.plural) + " " + (qn.plural ? pluralOf(qn.es) : qn.es)); i += 2; continue;
        }
      }
      if (w === "geen") {
        var rg = np(words, i + 1, dict);
        if (!rg) return null;
        out.push("ningún"); out.push(rg.s.replace(/^(un|una|unos|unas|el|la|los|las) /, ""));
        i = rg.end; continue;
      }
      if (OBJ[w] !== undefined && withClitic && out.length === 0 && (w === "het" || w === "hem" || w === "haar" || w === "mij" || w === "me" || w === "jou" || w === "je" || w === "ons" || w === "jullie" || w === "hen")) {
        // alleen het als lijdend voorwerp zonder zelfstandig naamwoord erachter
        if (i === words.length - 1 || PREP[words[i + 1]] !== undefined || TIME[words[i + 1]] !== undefined) { clit = OBJ[w]; i++; continue; }
      }
      if (OBJ[w] !== undefined && i === words.length - 1 && w !== "het") { out.push(OBJ[w]); i++; continue; }
      if (w === "het" && i === words.length - 1) { clit = "lo"; i++; continue; }
      if (DEM[w] !== undefined && i === words.length - 1) { out.push(w === "dit" ? "esto" : "eso"); i++; continue; }
      if (PREP[w] !== undefined) {
        var prep = PREP[w];
        var t = words[i + 1];
        if (w === "naar" && (t === "huis")) { out.push("a casa"); i += 2; continue; }
        if (w === "in" && (t === "huis")) { out.push("en casa"); i += 2; continue; }
        if (w === "van" && (t === "de" || t === "het")) { prep = "de"; }
        var npP = np(words, i + 1, dict);
        if (npP && !npP.proper && ["de", "het", "een", "dit", "dat", "die", "mijn", "je", "zijn", "haar", "ons", "onze", "jouw", "uw", "jullie", "hun"].indexOf(words[i + 1]) < 0) {
          npP = bareNoun(words, i + 1, dict);
        }
        if (w === "van" && npP && (words[i + 1] === "de" || words[i + 1] === "het")) {
          // "van de" + zelfstandig naamwoord: "de" met contractie "del" bij "de" (mannelijk)
          var s = npP.s;
          if (/^el /.test(s)) { out.push(s.replace(/^el /, "del ")); i = npP.end; continue; }
          out.push("de " + s); i = npP.end; continue;
        }
        if (w === "in" && npP && npP.proper) { out.push("en " + npP.s); i = npP.end; continue; }
        if (!npP) {
          if (LOCATION_NL[t] || TIME[t]) { out.push(prep + " " + (TIME[t] || t)); i += 2; continue; }
          return null;
        }
        out.push(contract(prep, npP.s)); i = npP.end; continue;
      }
      if (TIME[w] !== undefined) { out.push(TIME[w]); i++; continue; }
      var npO = np(words, i, dict);
      if (npO) { out.push(npO.s); i = npO.end; continue; }
      var d = dict[w];
      if (d !== undefined && !/\s/.test(d)) { out.push(d); i++; continue; }
      return null;
    }
    var joined = out.join(" ");
    if (withClitic) return clit + "|" + joined;
    return joined;
  }

  // Zijn-zinnen (ser/estar + naamwoord, bijvoeglijk naamwoord of plaats)
  function buildCopula(restN, subjInfo, dict, fem, neg, noSubj, subjEs, inverted) {
    var prefix = neg ? "no " : "";
    var p = subjInfo ? subjInfo.p : 2;
    var g = subjInfo && subjInfo.g ? subjInfo.g : (fem ? "f" : "m");
    var plural = subjInfo && subjInfo.noun ? (p === 5) : (p === 3 || p === 4 || p === 5);
    var conj = VERB.zijn.p[p];
    var words = restN.slice();
    if (!words.length) return null;
    var fF = g === "f";
    // plaats of toestand: "ik ben thuis", "ik ben in Amsterdam", "ik ben moe"
    var first = words[0];
    if (LOCATION_NL[first] !== undefined || (first === "in" || first === "op" || first === "bij")) {
      var tail = clauseTail(words, dict);
      if (tail === null) return null;
      var estarConj = ESTAR_FORM[p];
      return prefix + estarConj + (tail ? " " + tail : "") + ".";
    }
    if (words.length === 1 && PROPER[first] !== undefined && ["spaans", "nederlands", "engels", "frans"].indexOf(first) >= 0) {
      return prefix + conj + " " + (fF ? natFem(PROPER[first]) : PROPER[first]) + (plural ? "" : "") + ".";
    }
    // "is mijn vader", "is de leraar": naamgroep na ser
    if (POSS[first] !== undefined || first === "de" || first === "het" || first === "een") {
      var npC = np(words, 0, dict);
      if (npC && npC.end === words.length) return prefix + conj + " " + npC.s + ".";
    }
    // eerst het woord zelf
    if (words.length === 1 && ESTAR_ADJ[first]) {
      var esAdj = dict[first];
      if (esAdj === undefined) return null;
      var ad = adjFor(esAdj, fF, plural);
      return prefix + ESTAR_FORM[p] + " " + ad + ".";
    }
    // bijvoeglijk naamwoord of naamwoord zonder lidwoord
    if (words.length === 1 && (ADJ[first] !== undefined || dict[first] !== undefined)) {
      var w0 = adjOf(first, dict) || dict[first];
      if (ESTAR_ES[w0]) return prefix + ESTAR_FORM[p] + " " + adjFor(w0, fF, plural) + ".";
      if (/o$|a$|e$|ísimo$|al$|ble$|il$|ar$/.test(w0) && !/a$/.test(w0.replace(/a$/, "")) && !isNounLike(w0)) {
        return prefix + conj + " " + adjFor(w0, fF, plural) + ".";
      }
      var nounE = dict[first];
      var fm = isFem(nounE);
      if (PROFESSION_ES[nounE]) return prefix + conj + " " + nounE + ".";
      return prefix + conj + " " + (plural ? pluralOf(nounE) : nounE) + ".";
    }
    // "ik ben een leraar" / "ik ben een nieuwe student"
    if (words[0] === "een" && words.length === 2 && dict[words[1]] !== undefined) {
      var nWord = dict[words[1]];
      if (PROFESSION_ES[nWord] || PROFESSION_ES[nWord.replace(/a$/, "o")] || true) {
        return prefix + conj + " " + (plural ? pluralOf(nWord) : nWord) + ".";
      }
    }
    if (words[0] === "een" && words.length >= 2) {
      var nn = nounEs(words[1], dict);
      if (nn && words.length === 2) return prefix + conj + " " + (nn.plural ? pluralOf(nn.es) : nn.es) + ".";
    }
    // Eigen bijvoeglijk naamwoord met "heel/erg/heel erg"
    var inten = words[0] === "heel" || words[0] === "erg" ? "muy " : "";
    var rest2 = inten ? words.slice(1) : words;
    if (rest2.length === 1 && dict[rest2[0]] !== undefined) {
      var ad2 = dict[rest2[0]];
      if (ESTAR_ES[ad2]) return prefix + ESTAR_FORM[p] + " " + inten + adjFor(ad2, fF, plural) + ".";
      return prefix + conj + " " + inten + adjFor(ad2, fF, plural) + ".";
    }
    // Plaatsen met "in"/"op"/"bij" + naam
    return null;
  }
  function isNounLike(w) { return /ción$|dad$|ista$/.test(w); }

  // estar, persoon 0..5 (yo, tú, él, nosotros, ustedes, ellos)
  var ESTAR_FORM = ["estoy", "estás", "está", "estamos", "están", "están"];

  // Vertrekken: "de bus gaat om half twaalf" betekent "sale a las once y media", niet "va a".
  var VERTREK_NL = /\b(bus|bussen|trein|treinen|tram|metro|vliegtuig|vliegtuigen|boot|veerboot)\b/;
  function translateVertrek(text, dict, gen) {
    // "Hoe laat ...?" is een vraag naar de tijd: vertaal als "Wanneer ...?" en zet er "¿A qué hora ...?" van
    var hl = /^(\s*)hoe laat\s+(.+)$/i.exec(String(text || ""));
    if (hl && !/^(is het|is het\?)\s*$/i.test(hl[2].trim())) {
      var o2 = translate(hl[1] + "Wanneer " + hl[2], dict, gen);
      if (o2 && /^¿Cuándo /.test(o2)) return o2.replace(/^¿Cuándo /, "¿A qué hora ");
      return null;
    }
    var out = translate(text, dict, gen);
    if (out && VERTREK_NL.test(lower(String(text))) && /\bgaat om\b/.test(lower(String(text))) && /^(El|La) [^ ]+ va a /.test(out)) {
      out = out.replace(/^((El|La) [^ ]+) va a /, "$1 sale a ");
    }
    return out;
  }
  // Begint de zin met een bekend werkwoord (en niet met een voornaamwoord)? Dan is het een bevel.
  function verbFirst(text) {
    var tk = String(text || "").trim().split(/\s+/), w = (tk[0] || "").toLowerCase().replace(/[^a-zë]/g, "");
    if (tk[1] && OBJ[tk[1].toLowerCase().replace(/[^a-zë]/g, "")] !== undefined && /^(help|luister|kijk|zeg|kom|eet|drink)$/.test(w)) return false;   // "help me": eigen tak hierboven
    return !!(w && FORM[w] && VERB[FORM[w]] && !/^(ben|bent|is|zijn|heb|hebt|heeft|kan|kunt|wil|wilt|moet|mag|ga|gaat|weet|woon|woont|heet|hou|houdt|vind|vindt|begrijp|begrijpt)$/.test(w));
  }
  return { translate: translateVertrek, verbFirst: verbFirst };
})();
