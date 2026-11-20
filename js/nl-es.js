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
    terugkomen:{ es: "volver",   p: ["vuelvo", "vuelves", "vuelve", "volvemos", "vuelven", "vuelven"] },
    voelen:    { es: "sentir",   p: ["siento", "sientes", "siente", "sentimos", "sienten", "sienten"] },
    aankomen:  { es: "llegar",   p: ["llego", "llegas", "llega", "llegamos", "llegan", "llegan"] },
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
    terugkom: "terugkomen", terugkomt: "terugkomen", terugkomen: "terugkomen", voelt: "voelen", voel: "voelen", voelen: "voelen",
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
    kom: "komen", komt: "komen", aankom: "aankomen", aankomt: "aankomen", aankomen: "aankomen",
    zie: "zien", ziet: "zien",
    doe: "doen", doet: "doen",
    zeg: "zeggen", zegt: "zeggen",
    luister: "luisteren", luistert: "luisteren",
    help: "helpen", helpt: "helpen"
  };

  // Extra werkwoorden (Nederlands -> Spaans), vormen uit de woordenlijsten; ik-vorm en hij-vorm koppelen aan het infinitief
  var EXTRA_VERBS = [["strijken", "strijk", "strijkt", "planchar", ["plancho", "planchas", "plancha", "planchamos", "planchan", "planchan"]], ["snijden", "snijd", "snijdt", "cortar", ["corto", "cortas", "corta", "cortamos", "cortan", "cortan"]], ["fietsen", "fiets", "fietst", "ir en bici", ["voy en bici", "vas en bici", "va en bici", "vamos en bici", "van en bici", "van en bici"]], ["douchen", "douche", "doucht", "ducharse", ["me ducho", "te duchas", "se ducha", "nos duchamos", "se duchan", "se duchan"]], ["halen", "haal", "haalt", "recoger", ["recojo", "recoges", "recoge", "recogemos", "recogen", "recogen"]], ["leggen", "leg", "legt", "poner", ["pongo", "pones", "pone", "ponemos", "ponen", "ponen"]], ["tekenen", "teken", "tekent", "dibujar", ["dibujo", "dibujas", "dibuja", "dibujamos", "dibujan", "dibujan"]], ["sporten", "sport", "sport", "hacer deporte", ["hago deporte", "haces deporte", "hace deporte", "hacemos deporte", "hacen deporte", "hacen deporte"]], ["onthouden", "onthoud", "onthoudt", "recordar", ["recuerdo", "recuerdas", "recuerda", "recordamos", "recuerdan", "recuerdan"]], ["geloven", "geloof", "gelooft", "creer", ["creo", "crees", "cree", "creemos", "creen", "creen"]], ["veranderen", "verander", "verandert", "cambiar", ["cambio", "cambias", "cambia", "cambiamos", "cambian", "cambian"]], ["wisselen", "wissel", "wisselt", "cambiar", ["cambio", "cambias", "cambia", "cambiamos", "cambian", "cambian"]], ["kiezen", "kies", "kiest", "elegir", ["elijo", "eliges", "elige", "elegimos", "eligen", "eligen"]], ["beslissen", "beslis", "beslist", "decidir", ["decido", "decides", "decide", "decidimos", "deciden", "deciden"]], ["huilen", "huil", "huilt", "llorar", ["lloro", "lloras", "llora", "lloramos", "lloran", "lloran"]], ["lachen", "lach", "lacht", "reír", ["río", "ríes", "ríe", "reímos", "ríen", "ríen"]], ["glimlachen", "glimlach", "glimlacht", "sonreír", ["sonrío", "sonríes", "sonríe", "sonreímos", "sonríen", "sonríen"]], ["slepen", "sleep", "sleept", "arrastrar", ["arrastro", "arrastras", "arrastra", "arrastramos", "arrastran", "arrastran"]], ["vallen", "val", "valt", "caer", ["caigo", "caes", "cae", "caemos", "caen", "caen"]], ["staan", "sta", "staat", "estar de pie", ["estoy de pie", "estás de pie", "está de pie", "estamos de pie", "están de pie", "están de pie"]], ["liggen", "lig", "ligt", "estar tumbado", ["estoy tumbado", "estás tumbado", "está tumbado", "estamos tumbados", "están tumbados", "están tumbados"]], ["zitten", "zit", "zit", "estar sentado", ["estoy sentado", "estás sentado", "está sentado", "estamos sentados", "están sentados", "están sentados"]], ["hangen", "hang", "hangt", "colgar", ["cuelgo", "cuelgas", "cuelga", "colgamos", "cuelgan", "cuelgan"]], ["regenen", "regen", "regent", "llover", ["llueve", "llueve", "llueve", "llueve", "llueve", "llueve"]], ["sneeuwen", "sneeuw", "sneeuwt", "nevar", ["nieva", "nieva", "nieva", "nieva", "nieva", "nieva"]], ["waaien", "waai", "waait", "soplar", ["sopla", "sopla", "sopla", "sopla", "sopla", "sopla"]], ["schijnen", "schijn", "schijnt", "brillar", ["brillo", "brillas", "brilla", "brillamos", "brillan", "brillan"]], ["bestaan", "besta", "bestaat", "existir", ["existo", "existes", "existe", "existimos", "existen", "existen"]], ["proeven", "proef", "proeft", "probar", ["pruebo", "pruebas", "prueba", "probamos", "prueban", "prueban"]], ["regelen", "regel", "regelt", "arreglar", ["arreglo", "arreglas", "arregla", "arreglamos", "arreglan", "arreglan"]], ["trouwen", "trouw", "trouwt", "casarse", ["me caso", "te casas", "se casa", "nos casamos", "se casan", "se casan"]], ["scheiden", "scheid", "scheidt", "separarse", ["me separo", "te separas", "se separa", "nos separamos", "se separan", "se separan"]], ["ruiken", "ruik", "ruikt", "oler", ["huelo", "hueles", "huele", "olemos", "huelen", "huelen"]]];
  // Scheidbare werkwoorden: stam = deeltje + ik-vorm (uitstap), 3sg = deeltje + hij-vorm (uitstapt); sepRewrite voegt ze samen
  EXTRA_VERBS.push(["uitstappen", "uitstap", "uitstapt", "bajar", ["bajo", "bajas", "baja", "bajamos", "bajan", "bajan"]]);
  EXTRA_VERBS.push(["instappen", "instap", "instapt", "subir", ["subo", "subes", "sube", "subimos", "suben", "suben"]]);
  EXTRA_VERBS.push(["afslaan", "afsla", "afslaat", "doblar", ["doblo", "doblas", "dobla", "doblamos", "doblan", "doblan"]]);
  EXTRA_VERBS.push(["oversteken", "oversteek", "oversteekt", "cruzar", ["cruzo", "cruzas", "cruza", "cruzamos", "cruzan", "cruzan"]]);
  EXTRA_VERBS.push(["opruimen", "opruim", "opruimt", "ordenar", ["ordeno", "ordenas", "ordena", "ordenamos", "ordenan", "ordenan"]]);
  EXTRA_VERBS.push(["uitleggen", "uitleg", "uitlegt", "explicar", ["explico", "explicas", "explica", "explicamos", "explican", "explican"]]);
  EXTRA_VERBS.push(["uitgaan", "uitga", "uitgaat", "salir", ["salgo", "sales", "sale", "salimos", "salen", "salen"]]);
  EXTRA_VERBS.push(["schoonmaken", "schoonmaak", "schoonmaakt", "limpiar", ["limpio", "limpias", "limpia", "limpiamos", "limpian", "limpian"]]);
  EXTRA_VERBS.push(["overstappen", "overstap", "overstapt", "transbordar", ["transbordo", "transbordas", "transborda", "transbordamos", "transbordan", "transbordan"]]);
  EXTRA_VERBS.push(["terugbellen", "terugbel", "terugbelt", "rellamar", ["rellamo", "rellamas", "rellama", "rellamamos", "rellaman", "rellaman"]]);
  EXTRA_VERBS.push(["omdraaien", "omdraai", "omdraait", "girar", ["giro", "giras", "gira", "giramos", "giran", "giran"]]);
  // Wederkerend: "me levanto" (opstaan); een vast werkwoord zonder extra subject-pronomen (zoals heten)
  EXTRA_VERBS.push(["wassen", "wass", "wast", "lavar", ["lavo", "lavas", "lava", "lavamos", "lavan", "lavan"]]);
  EXTRA_VERBS.push(["gebeuren", "gebeur", "gebeurt", "pasar", ["paso", "pasas", "pasa", "pasamos", "pasan", "pasan"]]);
  EXTRA_VERBS.push(["opstaan", "opsta", "opstaat", "levantarse", ["me levanto", "te levantas", "se levanta", "nos levantamos", "se levantan", "se levantan"]]);
  // "thuiskomen" is in het Spaans "llegar a casa"; de infinitief na "wil" werkt via dezelfde vormen
  EXTRA_VERBS.push(["thuiskomen", "thuiskom", "thuiskomt", "llegar a casa", ["llego a casa", "llegas a casa", "llega a casa", "llegamos a casa", "llegan a casa", "llegan a casa"]]);
  EXTRA_VERBS.forEach(function (x) {
    var inf = x[0];
    if (!VERB[inf]) VERB[inf] = { es: x[3], p: x[4] };
    if (!FORM[inf]) FORM[inf] = inf;
    if (!FORM[x[1]]) FORM[x[1]] = inf;
    if (!FORM[x[2]]) FORM[x[2]] = inf;
  });
  if (!FORM.ga) FORM.ga = "gaan";
  if (!FORM.gaat) FORM.gaat = "gaan";
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

  var TIME = { elkedag: "todos los días", elkeweek: "cada semana", elkeochtend: "cada mañana", elkemiddag: "cada tarde", elkeavond: "todas las noches", morgen: "mañana", vandaag: "hoy", gisteren: "ayer", nu: "ahora", altijd: "siempre", nooit: "nunca",
    ook: "también", heel: "muy", erg: "muy", veel: "mucho", weinig: "poco", al: "ya", nog: "todavía", zo: "así",
    thuis: "en casa", hier: "aquí", daar: "allí", buiten: "afuera", binnen: "adentro", vaak: "a menudo" };

  var PROPER = { amsterdam: "Ámsterdam", nederland: "los Países Bajos", spanje: "España", engeland: "Inglaterra",
    duitsland: "Alemania", frankrijk: "Francia", belgië: "Bélgica", belgie: "Bélgica", rotterdam: "Róterdam",
    spaans: "español", nederlands: "neerlandés", engels: "inglés", frans: "francés" , berlijn: "Berlín", brussel: "Bruselas", wenen: "Viena", praag: "Praga", athene: "Atenas", moskou: "Moscú", lissabon: "Lisboa", rome: "Roma", parijs: "París", londen: "Londres", ierland: "Irlanda", schotland: "Escocia", polen: "Polonia", zweden: "Suecia", noorwegen: "Noruega", denemarken: "Dinamarca", oostenrijk: "Austria", zwitserland: "Suiza", griekenland: "Grecia", turkije: "Turquía", marokko: "Marruecos"};

  // Woorden die met estar gebruikt worden (tijdelijke toestand); de rest met ser
  var ESTAR_ADJ = { moe: 1, ziek: 1, blij: 1, boos: 1, verdrietig: 1, bezig: 1, klaar: 1, nerveus: 1, gestrest: 1,
    rustig: 1, verliefd: 1, verkouden: 1, bang: 1, druk: 1, ongerust: 1, open: 1, gesloten: 1, dicht: 1, vol: 1, leeg: 1, kapot: 1 };
  var ESTAR_ES = { cansado: 1, enfermo: 1, contento: 1, enojado: 1, enfadado: 1, triste: 1, ocupado: 1, listo: 1,
    nervioso: 1, estresado: 1, tranquilo: 1, enamorado: 1, resfriado: 1, asustado: 1, preocupado: 1, lleno: 1, abierto: 1, cerrado: 1, vacío: 1, roto: 1 };
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
    if (/\s/.test(w)) w = w.split(" ")[0];   // "parada de autobús": het eerste woord bepaalt het geslacht
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
  // Meervoud zonder eigen geslachtsregel ("sillas"): het geslacht komt van het enkelvoud ("silla")
  function singFem(w) {
    if (!/\s/.test(w) && !esGenData(w)) {
      var cand = [w.replace(/es$/, ""), w.replace(/s$/, ""), w.replace(/ses$/, "z"), w.replace(/es$/, "e")];
      for (var i = 0; i < cand.length; i++) if (cand[i] !== w && esGenData(cand[i])) return esGenData(cand[i]) === "f";
    }
    return isFem(w);
  }
  function artFor(w, plural, def) {
    if (def) {
      if (plural) return singFem(w) ? "las" : "los";
      if (STRESSED_A[w] && isFem(w)) return "el";
      return isFem(w) ? "la" : "el";
    }
    if (plural) return isFem(w) ? "unas" : "unos";
    if (STRESSED_A[w] && isFem(w)) return "un";
    return isFem(w) ? "una" : "un";
  }
  function pluralOf(w) {
    if (/\s/.test(w)) { var wp = w.split(" "); wp[0] = pluralOf(wp[0]); return wp.join(" "); }
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
    // Nederlands meervoud (boeken, kaartjes, winkels, huizen): het woordenboek geeft soms een werkwoord ("boeken" = sacar) of niets
    var verbLike = v !== undefined && /^[a-záéíóúñ]+(ar|er|ir|ír)$/.test(v);
    if (!NL_NOUN_FIX[nl] && (v === undefined || verbLike)) {
      var sg = [];
      if (/en$/.test(nl)) { var b0 = nl.slice(0, -2); sg.push(b0, b0.replace(/([^aeiou])\1$/, "$1"), b0.replace(/(.)(?=[^aeiou]$)/, "$1").replace(/z$/, "s"), b0.replace(/v$/, "f"), b0.replace(/(a|e|o|u)([^aeiou])$/, "$1$1$2")); }
      if (/s$/.test(nl)) sg.push(nl.slice(0, -1));
      if (/'s$/.test(nl)) sg.push(nl.slice(0, -2));
      for (var si = 0; si < sg.length; si++) {
        var sv = dict[sg[si]];
        if (sv !== undefined && !/\s/.test(sv) && !/^[a-záéíóúñ]+(ar|ir|ír)$/.test(sv) && !NOT_NOUN[sg[si]]) return { es: sv, plural: true };
      }
    }
    if (v !== undefined && !/\s/.test(v)) {
      var plNl = false;
      if (/[^s]s$/.test(nl) && /s$/.test(v)) { var d1 = dict[nl.slice(0, -1)]; plNl = d1 !== undefined && (v === d1 + "s" || v === d1 + "es"); }
      return { es: v, plural: !!PLURAL_ES[v] || plNl || (/en$/.test(nl) && /s$/.test(v)) };
    }
    // Samenstelling als "parada de autobús" (bushalte): zelfstandig naamwoord + de + zelfstandig naamwoord
    if (v !== undefined && /^[a-záéíóúñ]+ (de|del|de la) [a-záéíóúñ]+$/.test(v)) return { es: v, plural: false };
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
    if (CAPS[nw] && !det) { var cn = nounEs(nw, dict); if (cn) return { s: cn.es.charAt(0).toUpperCase() + cn.es.slice(1), plural: false, fem: false, def: false, end: j + 1, proper: true }; }
    if (NAMES[nw] && !det) return { s: NAMES[nw], plural: false, fem: false, def: false, end: j + 1, proper: true, name: true };
    var nn = nounEs(nw, dict);
    var adjEs = null, adjEnd = 0;
    if (!nn && rest.length >= 2 && adjOf(nw, dict)) {
      // bijvoeglijk naamwoord voor het zelfstandig naamwoord: "grote stad" -> "ciudad grande"
      var nn2 = nounEs(rest[1], dict);
      if (nn2) { adjEs = adjOf(nw, dict); nn = nn2; adjEnd = 1; }
    }
    if (!nn) return null;
    var es = nn.es;
    var fem = singFem(es);
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
  var AUTO_OV = { missen: "perder", terugvinden: "encontrar", vinden: "encontrar", winnen: "ganar", proberen: "intentar" };   // woordenboek geeft hier een samengestelde of andere betekenis
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
      var inf = cands[i], lem = AUTO_OV[inf] || dict[inf];
      if (!lem || /\s/.test(lem) || !/(ar|er|ir|ír)$/.test(lem) || !ZINC.VERB[lem] || ZINC.esIsRefl && ZINC.esIsRefl(lem)) continue;
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
    zijn: ["was", "waren", "geweest", "z"], hebben: ["had", "hadden", "gehad", "h"], wonen: ["woonde", "woonden", "gewoond", "h"], kunnen: ["kon", "konden", null, "h"], willen: ["wilde", "wilden", null, "h"],
    moeten: ["moest", "moesten", null, "h"], gaan: ["ging", "gingen", "gegaan", "z"], spelen: ["speelde", "speelden", "gespeeld", "h"], eten: ["at", "aten", "gegeten", "h"],
    drinken: ["dronk", "dronken", "gedronken", "h"], spreken: ["sprak", "spraken", "gesproken", "h"], werken: ["werkte", "werkten", "gewerkt", "h"],
    leren: ["leerde", "leerden", "geleerd", "h"], lezen: ["las", "lazen", "gelezen", "h"], kijken: ["keek", "keken", "gekeken", "h"], weten: ["wist", "wisten", "geweten", "h"],
    komen: ["kwam", "kwamen", "gekomen", "z"], zien: ["zag", "zagen", "gezien", "h"], doen: ["deed", "deden", "gedaan", "h"], zeggen: ["zei", "zeiden", "gezegd", "h"],
    luisteren: ["luisterde", "luisterden", "geluisterd", "h"], openen: ["opende", "openden", "geopend", "h"], helpen: ["hielp", "hielpen", "geholpen", "h"],
    begrijpen: ["begreep", "begrepen", "begrepen", "h"], nemen: ["nam", "namen", "genomen", "h"], geven: ["gaf", "gaven", "gegeven", "h"], brengen: ["bracht", "brachten", "gebracht", "h"],
    sturen: ["stuurde", "stuurden", "gestuurd", "h"], missen: ["miste", "misten", "gemist", "h"],
    terugkomen: ["kwam terug", "kwamen terug", "teruggekomen", "z"], voelen: ["voelde", "voelden", "gevoeld", "h"],
    kopen: ["kocht", "kochten", "gekocht", "h"], maken: ["maakte", "maakten", "gemaakt", "h"], terugvinden: ["terugvond", "terugvonden", "teruggevonden", "h"],
    schrijven: ["schreef", "schreven", "geschreven", "h"], slapen: ["sliep", "sliepen", "geslapen", "h"], betalen: ["betaalde", "betaalden", "betaald", "h"],
    bellen: ["belde", "belden", "gebeld", "h"], vragen: ["vroeg", "vroegen", "gevraagd", "h"], halen: ["haalde", "haalden", "gehaald", "h"],
    krijgen: ["kreeg", "kregen", "gekregen", "h"], denken: ["dacht", "dachten", "gedacht", "h"], horen: ["hoorde", "hoorden", "gehoord", "h"],
    rijden: ["reed", "reden", "gereden", "hz"], lopen: ["liep", "liepen", "gelopen", "hz"], winnen: ["won", "wonnen", "gewonnen", "h"],
    vergeten: ["vergat", "vergaten", "vergeten", "h"], bestellen: ["bestelde", "bestelden", "besteld", "h"], proberen: ["probeerde", "probeerden", "geprobeerd", "h"],
    praten: ["praatte", "praatten", "gepraat", "h"], wachten: ["wachtte", "wachtten", "gewacht", "h"], reizen: ["reisde", "reisden", "gereisd", "hz"],
    spelen2: null
  };
  delete NL_PAST.spelen2;
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
  // "vinden" = gustar bij een mening ("ik vind het leuk"), maar encontrar bij "ik vind het boek" / "ik heb het gevonden"
  var VIND_MENING = /^(leuk|lekker|mooi|fijn|goed|slecht|prima|gek|raar|grappig|interessant|belangrijk|moeilijk|makkelijk|duur|goedkoop|saai|lelijk|erg|geweldig|top|niets|niks|van|dat|dit|zo|te|ook|ervan|daarvan|wat|hoe|moeilijk|makkelijk|interessant|saai|geweldig)$/;
  function vindRewrite(toks) {
    var cl = toks.map(function (t) { return t.replace(/[.,!?]/g, ""); });
    if (cl.some(function (w) { return VIND_MENING.test(w); })) return toks;
    var out = toks.slice(), changed = false;
    cl.forEach(function (w, i) {
      var rest = cl.slice(i + 1).filter(function (x) { return x !== "het"; }).length;
      var r = w === "gevonden" ? "teruggevonden" : (/^(vind|vindt|vinden)$/.test(w) && rest > 0 ? "terug" + w : null);
      if (r) { out[i] = r + toks[i].slice(w.length); changed = true; }
    });
    return changed ? out : toks;
  }
  function pastRewrite(toks) {
    PAST_MODE = null;
    toks = vindRewrite(toks);
    var clean = toks.map(function (t) { return t.replace(/[.,!?]/g, ""); });
    // "was" + lidwoord + één zelfstandig naamwoord (eventueel met een tijdsbepaling) = wassen in de tegenwoordige tijd ("ik was de auto vandaag")
    var wIdx = clean.indexOf("was");
    var wDet = wIdx + 1;
    while (wIdx >= 0 && /^(vandaag|elkedag|morgen|nu)$/.test(clean[wDet] || "")) wDet++;
    if (wIdx >= 0 && /^(de|het|een|mijn|jouw|zijn|haar|onze|uw)$/.test(clean[wDet] || "")) {
      var restW = clean.slice(wDet + 1).filter(function (w) { return !/^(vandaag|elkedag|morgen|nu)$/.test(w); });
      if (restW.length === 1) { var outW = toks.slice(); outW[wIdx] = "wast" + toks[wIdx].slice(clean[wIdx].length); return outW; }
    }
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
        if (NL_PAST[pl][3] !== "hz" && (NL_PAST[pl][3] === "h") !== !!AUX_H[clean[a]]) continue;
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

  // "de bus komt aan" = llega (aankomen); "hoe kom ik bij/naar het station" = ¿cómo llego a ...?
  function aankomenRewrite(toks) {
    var KOM = { kom: "aankom", komt: "aankomt", komen: "aankomen" };
    var iK = -1, i;
    for (i = 0; i < toks.length; i++) { var t0 = toks[i].replace(/[.,!?]/g, ""); if (KOM[t0] !== undefined) { iK = i; break; } }
    if (iK < 0) return toks;
    var out = toks.slice(), j = out.lastIndexOf("aan");
    if (j > iK && j === out.length - 1) {                       // ... komt ... aan
      out[iK] = KOM[out[iK].replace(/[.,!?]/g, "")];
      out.splice(j, 1);
      return out;
    }
    var nx = out.slice(iK + 1).filter(function (w) { return !SUBJ[w.replace(/[.,!?]/g, "")] && w !== "ik"; })[0];
    if (out[0] === "hoe" && iK === 1 && /^(bij|naar|daar|er|hier|thuis)/.test(String(nx || "").replace(/[.,!?]/g, ""))) {
      out[iK] = KOM[out[iK].replace(/[.,!?]/g, "")];
      for (i = iK + 1; i < out.length; i++) if (out[i] === "bij") out[i] = "naar";
      var ti = out.indexOf("thuis"); if (ti > 0) out.splice(ti, 1, "naar", "huis");   // "aankomen thuis" = llegar a casa
    }
    return out;
  }

  // Scheidbaar werkwoord met het deeltje achteraan ("Ik stap vandaag uit", "Hij stapt elke dag uit"): deeltje voor de stam, zodat het werkwoord uit EXTRA_VERBS gevonden wordt
  var SEP_DEEL = [["uit", ["stap", "stapt", "ga", "gaat", "leg", "legt"]], ["in", ["stap", "stapt"]], ["af", ["sla", "slaat"]], ["over", ["steek", "steekt", "stap", "stapt"]], ["op", ["ruim", "ruimt", "sta", "staat"]], ["terug", ["kom", "komt", "bel", "belt"]], ["schoon", ["maak", "maakt"]], ["om", ["draai", "draait"]]];
  var SEP_TIJD = { vandaag: 1, morgen: 1, nu: 1, elke: 1, dag: 1, elkedag: 1, elkeweek: 1, elkemiddag: 1, elkeochtend: 1, vanochtend: 1, vanavond: 1, altijd: 1, vaak: 1, nooit: 1, soms: 1 };
  function sepRewrite(toks) {
    if (toks.length < 2) return toks;
    var out = toks.slice(), last = out[out.length - 1].replace(/[.,!?]/g, "");
    var deel = SEP_DEEL.filter(function (d) { return d[0] === last; })[0];
    if (!deel) return toks;
    for (var k = out.length - 2; k >= 0; k--) {
      var w = out[k].replace(/[.,!?]/g, "");
      if (deel[1].indexOf(w) >= 0) {
        // tussen het werkwoord en het deeltje mag alleen een tijdsbepaling staan (geen voorwerp: "stap de bus uit")
        var tussen = out.slice(k + 1, out.length - 1).every(function (x) { return SEP_TIJD[x.replace(/[.,!?]/g, "")]; });
        if (!tussen) return toks;
        out[k] = last + w;
        out.pop();
        return out;
      }
    }
    return toks;
  }

  // Persoonlijke "a" op het eind: alleen als een werkwoord uit A_PERSONAL_V en een persoonlijk onderwerp (ik, je, we...) in de Nederlandse zin staan
  // "Ik wil naar huis" = "Ik wil naar huis gaan" (Quiero ir a casa): modaal werkwoord + naar zonder tweede werkwoord
  // "mag naar buiten" = "mag uitgaan" (salir); alleen bij een modaal, zodat "ik ga naar buiten" ongemoeid blijft
  function buitenNaarUit(text) {
    return /\b(mag|mogen|moet|moeten|wil|willen|kan|kunnen)\b/i.test(text) ? String(text).replace(/\bnaar buiten\b/gi, "uitgaan") : text;
  }
  function modalNaar(text) {
    var m = /^(.*?\b(?:wil|wilt|willen|kan|kun|kunt|kunnen|moet|moeten|mag|mogen)\b(?: (?:je|jij|u|ik|we|wij|jullie|hij|zij|ze|graag|nu|echt|even))*) naar (.+?)([.?!]*)$/i.exec(String(text).trim());
    if (!m) return text;
    var last = m[2].split(" ").pop().toLowerCase();
    if (/en$/.test(last) && !/^(buiten|boven|binnen|beneden|achteren|voren|bijen|steden)$/.test(last) && !/^(de|het|een)$/.test(m[2].split(" ")[0]) || /(^| )gaan( |$)/.test(m[2])) return text;
    return m[1] + " naar " + m[2] + " gaan" + m[3];
  }
  var A_SUBJ = /^(ik|je|jij|u|we|wij|jullie|hij|zij|ze)$/;
  var NAMES = {}, CAPS = {};   // voornamen in de huidige zin (hoofdletter, niet in het woordenboek)
  function findNames(text, dict) {
    NAMES = {}; CAPS = {};
    var raw = String(text).replace(/[¿¡]/g, "").split(/\s+/).filter(Boolean);
    raw.forEach(function (w, i) {
      var c = w.replace(/[.,!?;:]+$/g, ""), lc = c.toLowerCase();
      if (i > 0 && /^[A-ZÀ-Þ][a-zà-ÿ'-]+$/.test(c) && dict[lc] !== undefined && !/\s/.test(dict[lc]) && PROPER[lc] === undefined && !FORM[lc] && /^(Parijs|Londen|Berlijn|Rome|Brussel|Lissabon|Amsterdam|Rotterdam|Barcelona|Madrid|Sevilla|Valencia|Wenen|Praag|Athene|Moskou|Peking|Tokio|Nederland|Spanje|Duitsland|Frankrijk|Engeland|Italië|Portugal|België|Europa|Amerika|Afrika|Azië|Mexico|Argentinië|Colombia|Chili|Peru|Cuba|Marokko|Turkije|Griekenland|Zwitserland|Oostenrijk|Polen|Zweden|Noorwegen|Denemarken|Ierland|Schotland)$/.test(c)) CAPS[lc] = true;
      if (!/^[A-ZÀ-Þ][a-zà-ÿ'-]+$/.test(c) || dict[lc] !== undefined || PROPER[lc] !== undefined || FORM[lc] || NL_PP[lc] || POSS[lc] !== undefined || /^(ik|je|jij|u|we|wij|jullie|hij|zij|ze|het|de|een|dit|dat|die|wat|waar|wie|hoe|wanneer|waarom|welke|is|zijn|ben|heb|ga|kan|mag|wil|moet|doe|zie|ken|bel|help|hou|mijn|jouw|uw|ons|onze|nee|ja)$/.test(lc)) return;
      if (i === 0 && !(raw[1] && (FORM[raw[1].toLowerCase()] || NL_PP[raw[1].toLowerCase()]))) return;
      NAMES[lc] = c;
    });
  }
  // Vaste dingen uit meerdere woorden worden vóór het vertalen één woord, zodat de regels ze als geheel zien
  var PHRASE_1W = [
    [/\b(elke|iedere) dag\b/gi, "elkedag"], [/\b(elke|iedere) week\b/gi, "elkeweek"],
    [/\belke ochtend\b/gi, "elkeochtend"], [/\belke middag\b/gi, "elkemiddag"],
    [/\belke avond\b/gi, "elkeavond"], [/\belke nacht\b/gi, "elkeavond"],
    // "kom je terug" / "ik kom morgen terug" -> terugkomen (vuelvo, vuelves ...)
    [/\b(kom|komt|komen)\s+((?:je|jij|u|ik|hij|zij|ze|we|wij|jullie)\s+)?terug\b/gi, function (m, v, subj) { return "terug" + v.toLowerCase() + (subj ? " " + subj.trim() : ""); }],
    // "ik voel me moe" = "ik ben moe" (Spaans: estoy cansado); "hoe voel je je?" = "hoe ben je?"
    // "hoe voel jij je" = "hoe gaat het" (Spaans: ¿cómo estás?)
    [/\bhoe voel(?:t)? (?:jij|je|u|jullie|hij|zij|ze|we|wij) (?:je|zich|jou|me|mij|ons|jullie)\b/gi, "hoe gaat het"],
    // "ik voel me moe" = "ik ben moe" (Spaans: estoy cansado); "ik voel me goed" blijft de vaste zin "Me siento bien"
    [/\b(ik|je|jij|u|hij|zij|ze|we|wij|jullie)\s+voel(?:t)?\s+(?:me|mij|je|jou|zich|ons|u)\s+(?!goed\b)/gi, function (m, subj) { return subj + " " + ({ ik: "ben", je: "ben", jij: "ben", u: "bent", hij: "is", zij: "is", ze: "zijn", we: "zijn", wij: "zijn", jullie: "zijn" })[subj.toLowerCase()] + " "; }]
  ];
  function phrases1w(text) {
    var t = String(text);
    PHRASE_1W.forEach(function (p) { t = t.replace(p[0], p[1]); });
    return t;
  }
  function translate(text, dict, gen) {
    // Homoniemen met vaste zin (stem, vak): dezelfde tabel als in zin-in.js
    var hk = String(text || "").toLowerCase().replace(/[.!?]+$/, "").replace(/\s+/g, " ").trim();
    var HM = { "ik geef mijn stem": "Doy mi voto.", "zijn stem is mooi": "Su voz es bonita.", "ik hoor zijn stem": "Oigo su voz.", "ik strijk de was": "Plancho la ropa.", "de stem van de zanger is mooi": "La voz del cantante es bonita.", "het vak is vol": "El compartimento está lleno.", "ik heb wiskunde als vak": "Tengo matemáticas como asignatura.", "wiskunde is een leuk vak": "Matemáticas es una asignatura divertida." };
    if (HM.hasOwnProperty(hk)) return HM[hk];
    // "dag" op zichzelf is de begroeting (adiós); in een zin is het het zelfstandig naamwoord (día)
    if (typeof text === "string" && /^\s*dag\s*[.!]*\s*$/i.test(text)) return "Adiós.";
    // hopen-zinnen ("hoop dat …", "hoop op …") kan het Spaans nog niet goed bouwen: liever niets dan onzin
    if (typeof text === "string" && /^\s*(ik|hij|zij|wij|jij) hoop(t|en)? (dat|op) /i.test(text)) return null;
    // Weersituatie met tijdsbepaling achteraan ("Het regent vandaag"): de weerzin uit zin-in.js (ZIN) vertalen, daarna de tijdsbepaling
    // Weerwerkwoord met een persoonsvorm als onderwerp ("Ik regent vandaag") is geen Nederlands: liever niets dan onzin
    if (typeof text === "string" && /^\s*(ik|jij|hij|zij|wij|jullie)\s+(regent|sneeuwt|waait|hagelt|onweert|vriest|dooit)\b/i.test(text)) return null;
    // Smaakzin: "de soep smaakt lekker" = "de soep is lekker" (Spaans: es rica), ook met een tijdsbepaling
    // "die broek is niet mijn smaak" = "ese pantalón no es mi estilo" (smaak = voorkeur)
    var smZ = /^\s*(die|dit|dat|deze) (broek|jurk) is niet mijn smaak\s*[.!?]*\s*$/i.exec(String(text || ""));
    if (smZ) return { broek: "Ese pantalón no es mi estilo.", jurk: "Ese vestido no es mi estilo." }[smZ[2].toLowerCase()];
    // "de soep smaakt (vandaag) naar tomaat" = la sopa sabe a tomate; "de soep gaat lekker smaken" = la sopa va a saber bien
    var smN = /^\s*(.+?) smaakt (?:(vandaag|elke dag) )?naar (\w+)\s*[.!?]*\s*$/i.exec(String(text || ""));
    var smG = /^\s*(.+?) gaat lekker smaken(?: (vandaag|elke dag))?\s*[.!?]*\s*$/i.exec(String(text || ""));
    var ESTIJD = { vandaag: "hoy", "elke dag": "todos los días" };
    if (smN || smG) {
      var mm = smN || smG, subjN = mm[1];
      var subjEsN = translate(subjN + " is goed.", dict, gen);
      if (!subjEsN) return null;
      subjEsN = subjEsN.replace(/\s+(es|está)\s+\S+\.$/, "");
      var tEs = ESTIJD[(smN ? mm[2] : mm[2]) || ""] || "";
      if (smN) {
        var nES = dict[mm[3].toLowerCase()];
        if (!nES) return null;
        return subjEsN + " sabe a " + nES + (tEs ? " " + tEs : "") + ".";
      }
      return subjEsN + " va a saber bien" + (tEs ? " " + tEs : "") + ".";
    }
var smk = /^\s*(.+?) smaakt (?:(vandaag|elke dag|morgen|nu) )?(lekker|goed|zout|zoet|bitter|zuur)(?: (vandaag|elke dag|morgen|nu))?\s*[.!?]*\s*$/i.exec(String(text || ""));
    if (smk) smk = [smk[0], smk[1], smk[3], smk[2] || smk[4] || ""];
    if (smk && smk[1].split(" ").length <= 2 && (/^(de|het|dit|dat|deze|die|mijn|jouw|zijn|haar)\b/i.test(smk[1]))) {
      // alleen lekker/goed: voor zout e.d. geeft het Spaans nog een verkeerd woord ("sal"), dus dan liever niets
      if (!/^(lekker|goed)$/i.test(smk[2])) return null;
      return translate(smk[1] + " is " + smk[2] + (smk[3] ? " " + smk[3] : "") + ".", dict, gen);
    }
    var wtm = /^\s*(het (?:regent|sneeuwt|waait|hagelt|onweert|vriest|dooit|gebeurt|gaat (?:regenen|sneeuwen|waaien|gebeuren)))(?:\s+(vandaag|elke dag|morgen|nu))?\s*[.!?]*\s*$/i.exec(String(text || ""));
    if (wtm && typeof ZIN !== "undefined") {
      var wb = ZIN.translate(wtm[1] + ".", "nl", "es", gen);
      var wtj = wtm[2] ? { vandaag: "hoy", "elke dag": "todos los días", morgen: "mañana", nu: "ahora" }[wtm[2].toLowerCase()] : null;
      if (typeof wb === "string" && !wtm[2]) return wb;
      if (typeof wb === "string" && wtj) return wb.replace(/[.!?]+$/, "") + " " + wtj + ".";
    }
    text = phrases1w(text);
    findNames(text, dict);
    text = buitenNaarUit(modalNaar(text));
    var r = translateCore(text, dict, gen);
    if (!r) {
      var mg = /^\s*ik wil graag(?: (.+?))?\s*[.!?]*\s*$/i.exec(String(text));
      if (mg) {
        var inner = translateCore("ik wil" + (mg[1] ? " " + mg[1] : ""), dict, gen);
        if (typeof inner === "string") return inner.replace(/[.!?]+$/, "") + ", por favor.";
      }
    }
    if (!r || typeof r !== "string") return r;
    var tk = String(text).toLowerCase().replace(/[.,!?¿¡]/g, " ").split(/\s+/).filter(Boolean);
    var verbHit = tk.some(function (w) { var l = FORM[w] || NL_PP[w] || NL_OVT[w]; return l && A_PERSONAL_V[l]; });
    if (!verbHit || !tk.some(function (w) { return A_SUBJ.test(w); })) return r;
    var nmK = Object.keys(NAMES);
    for (var ni = 0; ni < nmK.length; ni++) {
      var rxN = new RegExp("(^|[¿ ])(" + NAMES[nmK[ni]] + ")(?![A-Za-zÀ-ÿ])");
      var mN = rxN.exec(r);
      if (mN) {
        var beforeN = r.slice(0, mN.index + mN[1].length);
        if (beforeN.trim() && beforeN.trim() !== "¿" && !/(^|\s)(a|de|con|para|en|por|sin|sobre|desde|hasta|entre)\s*$/i.test(beforeN)) r = beforeN + "a " + r.slice(mN.index + mN[1].length);
      }
    }
    var m = /(^|[¿ ])((?:el|la|los|las|mi|mis|tu|tus|su|sus|nuestro|nuestra|nuestros|nuestras|un|una|unos|unas|este|esta|estos|estas|ese|esa|esos|esas) (?:[a-záéíóúñ]+ )?(?:padre|madre|padres|hermano|hermana|hermanos|hermanas|hijo|hija|hijos|hijas|amigo|amiga|amigos|amigas|chico|chica|chicos|chicas|niño|niña|niños|niñas|hombre|mujer|hombres|mujeres|médico|médica|profesor|profesora|maestro|maestra|jefe|jefa|abuelo|abuela|esposo|esposa|marido|vecino|vecina|policía|camarero|camarera|señor|señora|doctor|doctora|colega|compañero|compañera|tío|tía|primo|prima|bebé|persona|personas|novio|novia|vecinos|colegas|compañeros|profesores|médicos))(?![a-záéíóúñ])/.exec(r);
    if (!m || m.index === 0 && !/^¿/.test(r) && m[1] === "") {
      return r;
    }
    var before = r.slice(0, m.index + m[1].length);
    if (/(^|\s)(a|al|de|del|con|para|en|por|sin|sobre|desde|hasta|entre)\s*$/i.test(before) || before.trim() === "" || before.trim() === "¿") return r;
    var det = m[2].split(" ")[0].toLowerCase();
    var fixed = det === "el" ? "al " + m[2].slice(3) : "a " + m[2];
    return before + fixed + r.slice(m.index + m[1].length + m[2].length);
  }

  function translateCore(text, dict, gen) {
    if (!text || !dict) return null;
    var raw = lower(String(text).trim());
    var q = /\?\s*$/.test(String(text).trim());
    var toks = raw.split(/\s+/).filter(Boolean);
    if (!toks.length) return null;
    toks = pastRewrite(toks);
    toks = aankomenRewrite(toks);
    toks = sepRewrite(toks);
    toks.forEach(function (tk, ti) { autoVerb(tk.replace(/[.,!?]/g, ""), dict, ti === 0 || SUBJ[toks[ti - 1]] !== undefined || SUBJ[toks[ti + 1]] !== undefined); });
    var fem = gen === "f";

    // "Wat vind je ervan?" / "Wat vind je van het boek?" = ¿Qué te parece (el libro)?
    var mWv = /^wat vind(?:t)? (je|jij|u) (ervan|daarvan|daar van|er van|van .+)$/.exec(toks.join(" ").replace(/[.,!?]/g, ""));
    if (mWv) {
      var wvD = mWv[1] === "u" ? "le" : "te";
      if (/^(ervan|daarvan|daar van|er van)$/.test(mWv[2])) return "¿Qué " + wvD + " parece?";
      var wvN = np(mWv[2].split(" ").slice(1), 0, dict);
      if (wvN && wvN.end === mWv[2].split(" ").length - 1) {
        var wvS = /^(los|las|el|la|un|una|unos|unas|esta|este|estas|estos|ese|esa|esos|esas|mi|mis|tu|tus|su|sus|nuestro|nuestra|nuestros|nuestras) /.test(wvN.s) ? wvN.s : artFor(wvN.es, wvN.plural, true) + " " + wvN.s;
        return "¿Qué " + wvD + (wvN.plural ? " parecen " : " parece ") + wvS + "?";
      }
    }
    // "Waar ga je naartoe?" = ¿Adónde vas?
    var mAd = /^waar (ga|gaat|gaan) (je|jij|u|hij|zij|ze|we|wij|jullie)? ?(naartoe|heen)$/.exec(toks.join(" ").replace(/[.,!?]/g, ""));
    if (mAd) {
      var adP = { ga: "voy", gaat: "va", gaan: "vamos" }, adS = mAd[2] || "";
      var adV = adS === "je" || adS === "jij" ? "vas" : adS === "u" || adS === "hij" || adS === "zij" ? "va" : adS === "we" || adS === "wij" ? "vamos" : adS === "jullie" || adS === "ze" ? "van" : adP[mAd[1]];
      return "¿Adónde " + adV + "?";
    }
    // Vaste zinnen en vaste vragen
    var key = toks.join(" ");
    var FIXED = {
      "hoe laat is het": "¿Qué hora es?",
      "hoe laat is het?": "¿Qué hora es?",
      "wat is je naam": "¿Cómo te llamas?",
      "hoe heet je": "¿Cómo te llamas?",
      "hoe gaat het": "¿Cómo estás?",
      "hoe gaat het vandaag": "¿Cómo estás hoy?",
      "hoe gaat het vandaag?": "¿Cómo estás hoy?",
      "hoe gaat het met je vandaag": "¿Cómo estás hoy?",
      "hoe gaat het met je vandaag?": "¿Cómo estás hoy?",
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
      "ik ben erg blij": "Estoy muy contento.",
      "ik voel me goed": "Estoy bien.",
      "ik voel me goed.": "Estoy bien.",
      "ik mag": "Puedo.",
      "ik mag.": "Puedo.",
      "hij mag": "Puede.",
      "hij mag.": "Puede.",
      "ik ga": "Voy.",
      "ik ga.": "Voy.",
      "hij gaat": "Va.",
      "hij gaat.": "Va."
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
      // "Wat kost dit?" / "Hoeveel kost het?" = ¿Cuánto cuesta ...?
      if ((toks[0] === "wat" || toks[0] === "hoeveel") && (toks[1] === "kost" || toks[1] === "kosten") && toks.length >= 3) {
        var pr = toks.slice(2).map(function (w) { return w.replace(/[.,!?]/g, ""); }), prX = null;
        if (pr.length === 1 && DEM[pr[0]]) prX = { s: pr[0] === "dit" ? "esto" : "eso", plural: false };
        else if (pr.length === 1 && pr[0] === "het") prX = { s: "", plural: false };
        else { var prN = np(pr, 0, dict); if (prN && prN.end === pr.length) prX = { s: prN.s, plural: prN.plural }; }
        if (prX) return qwrap("cuánto " + (prX.plural ? "cuestan" : "cuesta") + (prX.s ? " " + prX.s : ""));
      }
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
        // Vraagwoord + modaal/gaan/zijn + onderwerp + rest: eerst de gewone zin bouwen (met infinitief, ser/estar), dan de vraag eromheen
        if ((vQ.modal || lemQ === "gaan" || lemQ === "zijn" || vQ.copula) && restQ.length > 2 && !PAST_MODE) {
          var coreQ = null;
          try { coreQ = buildVerb(lemQ, vQ, s2, restQ.slice(2), dict, fem, true); } catch (e) { coreQ = null; }
          if (coreQ) return qwrap(whEs + " " + coreQ.replace(/\.$/, ""));
        }
        var conjQ = vQ.p[persQ];
        if (lemQ === "zijn" && whEs === "dónde" && !PAST_MODE) conjQ = ESTAR_FORM[persQ] || conjQ;   // "waar ben je" = ¿dónde estás?
        if (PAST_MODE && lemQ === PAST_MODE.lem) { conjQ = pastConj(lemQ, vQ, persQ); if (!conjQ) return null; }
        var tailQ = restQ.slice(2);
        var tailTxt = tailQ.length ? clauseTail(tailQ, dict) : "";
        if (tailQ.length && tailTxt === null) return null;
        return qwrap(whEs + " " + conjQ + (tailTxt ? " " + tailTxt : ""));
      }
      return null;
    }

    // Ja/nee-vraag met zelfstandig naamwoord als onderwerp: "is het station ver?", "is de winkel open?"
    if ((toks[0] === "is" || toks[0] === "zijn") && SUBJ[toks[1]] === undefined && toks.length >= 3) {
      var npJ = np(toks, 1, dict);
      if (npJ && npJ.end < toks.length) {
        var coreJ = null;
        try { coreJ = buildVerb("zijn", VERB.zijn, { p: npJ.plural ? 5 : 2, g: npJ.fem ? "f" : "m", noun: true }, toks.slice(npJ.end), dict, fem, false, npJ.s); } catch (e) { coreJ = null; }
        if (coreJ) return qwrap(npJ.s + " " + coreJ.replace(/\.$/, ""));
      }
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
  // Infinitiefgroep voor een modaal werkwoord: "brood eten" -> "comer pan", "het eten" -> "comerlo", "hier werken" -> "trabajar aquí".
  // Eerst als zin met "ik" opbouwen (bestaande regels), dan de persoonsvorm door de infinitief vervangen.
  function infinitivePhrase(infLemma, objWords, dict, fem) {
    var vI = VERB[infLemma];
    if (infLemma === "zijn" && objWords.length) {
      // "er zijn", "hier zijn", "thuis zijn": estar + plaats
      var LOC1 = { er: "allí", daar: "allí", hier: "aquí", thuis: "en casa" };
      if (objWords.length === 1 && LOC1[objWords[0]]) return "estar " + LOC1[objWords[0]];
      if (locationLike(objWords)) { var lt = clauseTail(objWords, dict); return lt ? "estar " + lt : null; }
      return null;
    }
    if (!vI || !vI.p || vI.special || vI.reflexive || vI.copula || vI.modal) return null;
    var S;
    try { S = buildVerb(infLemma, vI, { p: 0, g: fem ? "f" : "m" }, objWords, dict, fem, false, null); } catch (e) { S = null; }
    if (!S) return null;
    var tk = S.replace(/\.$/, "").split(" "), conjI = vI.p[0], ix = tk.indexOf(conjI);
    if (ix < 0 || ix > 2) return null;
    var cl = tk.slice(0, ix);
    if (cl.some(function (w) { return !/^(me|te|lo|la|los|las|le|les|nos|os|se)$/.test(w); })) return null;
    var out = [vI.es + cl.join("")].concat(tk.slice(ix + 1));
    return out.join(" ").trim();
  }
  // Persoonlijke "a": veo a mi padre, ayudo al hombre (alleen bij personen als lijdend voorwerp)
  var A_PERSONAL_V = { zien: 1, bellen: 1, opbellen: 1, helpen: 1, kennen: 1, ontmoeten: 1, zoeken: 1, horen: 1, bezoeken: 1, missen: 1, uitnodigen: 1, vinden: 1, liefhebben: 1, kussen: 1, vragen: 1, verwachten: 1, ophalen: 1, halen: 1, luisteren: 1 };
  var PERSON_ES = /^(padre|madre|padres|hermano|hermana|hermanos|hermanas|hijo|hija|hijos|hijas|amigo|amiga|amigos|amigas|chico|chica|chicos|chicas|niño|niña|niños|niñas|hombre|mujer|hombres|mujeres|médico|médica|profesor|profesora|maestro|maestra|jefe|jefa|abuelo|abuela|esposo|esposa|marido|vecino|vecina|policía|camarero|camarera|señor|señora|doctor|doctora|colega|compañero|compañera|tío|tía|primo|prima|bebé|persona|personas|novio|novia|vecinos|colegas|compañeros|profesores|médicos)$/;
  function personalA(obj) {
    var m = /^(el|la|los|las|mi|mis|tu|tus|su|sus|nuestro|nuestra|nuestros|nuestras|un|una|unos|unas|este|esta|estos|estas|ese|esa|esos|esas) (.+)$/.exec(obj);
    if (!m) return obj;
    var words = m[2].split(" ");
    if (!words.some(function (w) { return PERSON_ES.test(w); })) return obj;
    return m[1] === "el" ? "al " + m[2] : "a " + obj;
  }
  var VIND_ADJ = { leuk: "gusta", lekker: "rico", goed: "bien", slecht: "mal", mooi: "bonito", lelijk: "feo", prima: "bien", gek: "raro", raar: "raro", interessant: "interesante", moeilijk: "difícil", makkelijk: "fácil", duur: "caro", goedkoop: "barato", saai: "aburrido", geweldig: "genial" };
  function buildVerb(lem, v, subjInfo, rest, dict, fem, inverted, subjEs) {
    var p = subjInfo ? subjInfo.p : 2;
    var g = subjInfo && subjInfo.g ? subjInfo.g : (fem ? "f" : "m");
    var neg = rest.indexOf("niet") >= 0;
    var restN = rest.filter(function (w) { return w !== "niet"; });
    var noSubj = subjInfo === null;
    var prefix = neg ? "no " : "";

    // Gustar-constructie: "ik hou van X", "ik vind X leuk"
    if (v.special === "gustar") {
      var obj = null, datC = ["me", "te", "le", "nos", "os", "les"][p] || "me", adjOp = null;
      if (lem === "houden" && restN[0] === "van") obj = restN.slice(1);
      else if (lem === "vinden") {
        var ak = -1;
        for (var ai = 0; ai < restN.length; ai++) if (VIND_ADJ[restN[ai]] !== undefined) { ak = ai; break; }
        if (ak < 0) return null;
        adjOp = restN[ak];
        obj = restN.slice(0, ak);
        var inten = "";
        if (obj.length && /^(erg|heel|best|zeer)$/.test(obj[obj.length - 1])) { inten = "muy "; obj = obj.slice(0, -1); }
        if (restN.slice(ak + 1).length) return null;
        if (adjOp !== "leuk") {
          var adjEs = VIND_ADJ[adjOp];
          if (adjOp === "lekker") {   // eten: está rico (niet "me parece rico")
            if (!obj.length || obj.length === 1 && (obj[0] === "het" || DEM[obj[0]])) return prefix + "está " + inten + "rico.";
            var npL = np(obj, 0, dict);
            if (!npL || npL.end !== obj.length) return null;
            var adjL = npL.fem ? "rica" : "rico";
            if (npL.plural) adjL += "s";
            var artL = /^(los|las|el|la|un|una|unos|unas|esta|este|estas|estos|ese|esa|esos|esas|mi|mis|tu|tus|su|sus) /.test(npL.s) ? npL.s : artFor(npL.es, npL.plural, true) + " " + npL.s;
            return artL + " " + prefix + (npL.plural ? "están " : "está ") + inten + adjL + ".";
          }
          if (!obj.length || obj.length === 1 && (obj[0] === "het" || DEM[obj[0]])) return prefix + datC + " parece " + inten + adjEs + ".";
          var npA = np(obj, 0, dict);
          if (!npA || npA.end !== obj.length) return null;
          var plA = npA.plural, adjF = adjEs;
          if (/o$/.test(adjEs) && npA.fem) adjF = adjEs.slice(0, -1) + "a";
          if (plA) adjF = /[aeiou]$/.test(adjF) ? adjF + "s" : adjF + "es";
          var artA = /^(los|las|el|la|un|una|unos|unas|esta|este|estas|estos|ese|esa|esos|esas|mi|mis|tu|tus|su|sus|nuestro|nuestra|nuestros|nuestras) /.test(npA.s) ? npA.s : artFor(npA.es, plA, true) + " " + npA.s;
          return artA + " " + prefix + datC + " " + (plA ? "parecen " : "parece ") + inten + adjF + ".";
        }
        if (!obj.length || obj.length === 1 && obj[0] === "het") return prefix + datC + " gusta" + ".";
      }
      if (!obj || !obj.length) return null;
      if (lem === "houden" && obj.length === 1 && OBJ[obj[0]] !== undefined && obj[0] !== "het") {
        var lvC = { me: "me", mij: "me", je: "te", jou: "te", hem: "lo", haar: "la", ons: "nos", jullie: "os", hen: "los", ze: "las" }[obj[0]];
        return prefix + lvC + " " + VERB.willen.p[p] + ".";
      }
      if (obj.length === 1 && VERB[obj[0]] && VERB[obj[0]].p) return (neg ? "no " : "") + datC + " gusta " + VERB[obj[0]].es + ".";
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
        return (neg ? "no " : "") + datC + " " + gust + " " + subjEsObj + ".";
      }
      return prefix + datC + " gusta " + sub + ".";
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
      // ziek worden = enfermarse, moe worden = cansarse (zelfstandig wederkerend werkwoord)
      var WREFL = { ziek: ["me enfermo", "te enfermas", "se enferma", "nos enfermamos", "os enfermáis", "se enferman"], moe: ["me canso", "te cansas", "se cansa", "nos cansamos", "os cansáis", "se cansan"] };
      var wAdj = restN.filter(function (w) { return !/^(vandaag|elkedag|morgen|nu)$/.test(w); });
      var wTij = restN.filter(function (w) { return /^(vandaag|elkedag|morgen|nu)$/.test(w); })[0];
      if (wAdj.length === 1 && WREFL[wAdj[0]]) {
        var wTEs = { vandaag: "hoy", elkedag: "todos los días", morgen: "mañana", nu: "ahora" }[wTij] || "";
        return prefix + WREFL[wAdj[0]][p] + (wTEs ? " " + wTEs : "") + ".";
      }
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
      if (infOrNp.length >= 1 && FORM[infOrNp[0]] && FORM[infOrNp[0]] !== infOrNp[0] && VERB[FORM[infOrNp[0]]]) return null;
      // "ik wil ziek zijn": estar bij een plaats/toestand uit ESTAR_ADJ, anders ser; het bijvoeglijk naamwoord blijft in de mannelijke enkelvoudsvorm
      if (infLemma === "zijn" && infOrNp.length === 2 && infOrNp[0] !== "zijn") {
        var adjZ = infOrNp[0], adjEsZ = adjOf(adjZ, dict) || dict[adjZ];
        if (!adjEsZ) return null;
        return prefix + conj + " " + (ESTAR_ADJ[adjZ] ? "estar" : "ser") + " " + adjFor(adjEsZ, false, false) + ".";
      }
      // "ik wil ziek worden" = quiero enfermarme; "ik wil naar buiten mogen" (uitgaan mogen) = quiero poder salir
      if (infLemma === "worden" && infOrNp.length === 2 && (infOrNp[0] === "ziek" || infOrNp[0] === "moe")) {
        return prefix + conj + " " + (infOrNp[0] === "ziek" ? "enfermarme" : "cansarme") + ".";
      }
      if (infLemma === "mogen" && infOrNp.length === 2 && infOrNp[0] === "uitgaan") return prefix + conj + " poder salir.";
      // "ik wil het boek vinden" = quiero encontrar el libro (zoeken, niet "me gusta")
      if (infLemma === "vinden" && infOrNp.length >= 2) {
        var npVi = np(infOrNp.slice(0, -1), 0, dict);
        if (npVi && npVi.end === infOrNp.length - 1) return prefix + conj + " encontrar " + npVi.s + ".";
      }
      // modaal + modaal + infinitief: "ik wil moeten werken" = quiero tener que trabajar
      if (infLemma && infOrNp.length === 2 && VERB[infOrNp[0]] && VERB[infOrNp[0]].modal && VERB[infLemma] && VERB[infLemma].p) {
        var modES = { moeten: "tener que", mogen: "poder" }[infOrNp[0]];
        if (!modES) return null;
        return prefix + conj + " " + modES + " " + VERB[infLemma].es + ".";
      }
      if (infLemma && VERB[infLemma] && VERB[infLemma].p) {
        var infEs = VERB[infLemma].es;
        var objWords = infOrNp.slice(0, -1);
        var clitic = "";
        if (objWords.length === 1 && OBJ[objWords[0]] !== undefined) clitic = OBJ[objWords[0]];
        else if (objWords.length) {
          // modaal + voorwerp/bijwoord + infinitief: "ik wil brood eten", "ik moet hier werken"
          var ip = infinitivePhrase(infLemma, objWords, dict, fem);
          if (!ip) return null;
          if (lem === "gaan") return prefix + conj + " a " + ip + ".";
          return prefix + conj + " " + ip + ".";
        }
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
    // tijdsbepaling vooraan of achteraan ("hij is vandaag ziek", "hij is ziek vandaag"): eerst zonder, daarna erachter
    var TIJD_COP = { "vandaag": "hoy", "morgen": "mañana", "nu": "ahora", "gisteren": "ayer", "elkedag": "todos los días" };
    for (var ti = 0; ti < words.length; ti++) {
      var tw = words[ti], tlen = 0, tes = null;
      if (TIJD_COP[tw] !== undefined) { tes = TIJD_COP[tw]; tlen = 1; }
      else if (tw === "elke" && words[ti + 1] === "dag") { tes = "todos los días"; tlen = 2; }
      if (tes && words.length > tlen) {
        var rest = words.slice(0, ti).concat(words.slice(ti + tlen));
        var outT = buildCopula(rest, subjInfo, dict, fem, neg, noSubj, subjEs, inverted);
        if (!outT) return null;
        return outT.replace(/\.$/, "") + " " + tes + ".";
      }
    }
    var first = words[0];
    if (LOCATION_NL[first] !== undefined || (first === "in" || first === "op" || first === "bij")) {
      var tail = clauseTail(words, dict);
      if (tail === null) return null;
      // verleden tijd van zijn met een plaats: "ik was thuis" = "estuve en casa" (preterito van estar)
      var ESTAR_PRET = ["estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron"];
      var estarConj = (PAST_MODE && PAST_MODE.lem === "zijn") ? ESTAR_PRET[p] : ESTAR_FORM[p];
      return prefix + estarConj + (tail ? " " + tail : "") + ".";
    }
    // verleden tijd van zijn zonder plaats: nog niet gebouwd, liever niets dan een verkeerde tijd
    if (PAST_MODE && PAST_MODE.lem === "zijn") return null;
    if (words.length === 1 && PROPER[first] !== undefined && ["spaans", "nederlands", "engels", "frans"].indexOf(first) >= 0) {
      return prefix + conj + " " + (fF ? natFem(PROPER[first]) : PROPER[first]) + (plural ? "" : "") + ".";
    }
    // "is mijn vader", "is de leraar": naamgroep na ser
    if (POSS[first] !== undefined || first === "de" || first === "het" || first === "een") {
      var npC = np(words, 0, dict);
      if (npC && npC.end === words.length) return prefix + conj + " " + npC.s + ".";
    }
    // plaats-bijwoorden: "het station is dichtbij" = está cerca (niet es)
    var ESTAR_ADV = { dichtbij: "cerca", vlakbij: "cerca", ver: "lejos", overal: "en todas partes" };
    if (words.length === 1 && ESTAR_ADV[first]) return prefix + ESTAR_FORM[p] + " " + ESTAR_ADV[first] + ".";
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
      var fm = singFem(nounE);
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
