// Spaans -> Nederlands, op zinsniveau (partnerzinnen).
// Werkwoordsvormen, onderwerp, lidwoorden, bezittelijke voornaamwoorden, ontkenning en vraagzinnen worden
// met regels opgebouwd. Het woordenboek levert alleen losse woorden. Lukt een zin niet met zekerheid,
// dan geeft translate() null terug.
var ES_NL = (function () {

  function nf(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ñ/g, "n");
  }

  // Werkwoorden: spaanse vormen (yo, tú, él, nosotros, ustedes/ellos) en nederlandse vormen
  // d = [ik, je (2e persoon enkelvoud), hij/zij (3e enkelvoud), wij/jullie/zij (meervoud)]
  var VERBS = {
    tener:     { es: ["tengo", "tienes", "tiene", "tenemos", "tienen"], d: ["heb", "hebt", "heeft", "hebben"], inf: "hebben" },
    ser:       { es: ["soy", "eres", "es", "somos", "son"], d: ["ben", "bent", "is", "zijn"], inf: "zijn", copula: true },
    estar:     { es: ["estoy", "estas", "esta", "estamos", "estan"], d: ["ben", "bent", "is", "zijn"], inf: "zijn", copula: true },
    ir:        { es: ["voy", "vas", "va", "vamos", "van"], d: ["ga", "gaat", "gaat", "gaan"], inf: "gaan", motion: true },
    querer:    { es: ["quiero", "quieres", "quiere", "queremos", "quieren"], d: ["wil", "wilt", "wil", "willen"], inf: "willen", modal: true },
    poder:     { es: ["puedo", "puedes", "puede", "podemos", "pueden"], d: ["kan", "kunt", "kan", "kunnen"], inf: "kunnen", modal: true },
    vivir:     { es: ["vivo", "vives", "vive", "vivimos", "viven"], d: ["woon", "woont", "woont", "wonen"], inf: "wonen" },
    hablar:    { es: ["hablo", "hablas", "habla", "hablamos", "hablan"], d: ["spreek", "spreekt", "spreekt", "spreken"], inf: "spreken" },
    trabajar:  { es: ["trabajo", "trabajas", "trabaja", "trabajamos", "trabajan"], d: ["werk", "werkt", "werkt", "werken"], inf: "werken" },
    estudiar:  { es: ["estudio", "estudias", "estudia", "estudiamos", "estudian"], d: ["studeer", "studeert", "studeert", "studeren"], inf: "studeren" },
    comer:     { es: ["como", "comes", "come", "comemos", "comen"], d: ["eet", "eet", "eet", "eten"], inf: "eten" },
    partir:    { es: ["parto", "partes", "parte", "partimos", "parten"], d: ["vertrek", "vertrekt", "vertrekt", "vertrekken"], inf: "vertrekken" },
    preguntar: { es: ["pregunto", "preguntas", "pregunta", "preguntamos", "preguntan"], d: ["vraag", "vraagt", "vraagt", "vragen"], inf: "vragen" },
    aprender:  { es: ["aprendo", "aprendes", "aprende", "aprendemos", "aprenden"], d: ["leer", "leert", "leert", "leren"], inf: "leren" },
    reservar:  { es: ["reservo", "reservas", "reserva", "reservamos", "reservan"], d: ["boek", "boekt", "boekt", "boeken"], inf: "boeken" },
    pintar:    { es: ["pinto", "pintas", "pinta", "pintamos", "pintan"], d: ["schilder", "schildert", "schildert", "schilderen"], inf: "schilderen" },
    pasear:    { es: ["paseo", "paseas", "pasea", "paseamos", "pasean"], d: ["wandel", "wandelt", "wandelt", "wandelen"], inf: "wandelen" },
    arreglar:  { es: ["arreglo", "arreglas", "arregla", "arreglamos", "arreglan"], d: ["repareer", "repareert", "repareert", "repareren"], inf: "repareren" },
    terminar:  { es: ["termino", "terminas", "termina", "terminamos", "terminan"], d: ["maak", "maakt", "maakt", "maken"], inf: "afmaken", prt: "af" },
    explicar:  { es: ["explico", "explicas", "explica", "explicamos", "explican"], d: ["leg", "legt", "legt", "leggen"], inf: "uitleggen", prt: "uit" },
    llevar:    { es: ["llevo", "llevas", "lleva", "llevamos", "llevan"], d: ["neem", "neemt", "neemt", "nemen"], inf: "meenemen", prt: "mee" },
    coger:     { es: ["cojo", "coges", "coge", "cogemos", "cogen"], d: ["neem", "neemt", "neemt", "nemen"], inf: "nemen" },
    pedir:     { es: ["pido", "pides", "pide", "pedimos", "piden"], d: ["bestel", "bestelt", "bestelt", "bestellen"], inf: "bestellen" },
    cerrar:    { es: ["cierro", "cierras", "cierra", "cerramos", "cierran"], d: ["sluit", "sluit", "sluit", "sluiten"], inf: "sluiten" },
    caminar:   { es: ["camino", "caminas", "camina", "caminamos", "caminan"], d: ["loop", "loopt", "loopt", "lopen"], inf: "lopen" },
    volver:    { es: ["vuelvo", "vuelves", "vuelve", "volvemos", "vuelven"], d: ["kom", "komt", "komt", "komen"], inf: "terugkomen", prt: "terug" },
    regresar:  { es: ["regreso", "regresas", "regresa", "regresamos", "regresan"], d: ["ga", "gaat", "gaat", "gaan"], inf: "teruggaan", prt: "terug" },
    // prt: scheidbaar deel, komt achteraan de zin ("de trein komt om acht uur aan")
    llegar:    { es: ["llego", "llegas", "llega", "llegamos", "llegan"], d: ["kom", "komt", "komt", "komen"], inf: "aankomen", prt: "aan" },
    empezar:   { es: ["empiezo", "empiezas", "empieza", "empezamos", "empiezan"], d: ["begin", "begint", "begint", "beginnen"], inf: "beginnen" },
    // Wederkerend in het Spaans, gewoon in het Nederlands. Alleen met het voornaamwoord ervoor ("me levanto"): translateNL
    // plakt "me levanto" aan elkaar tot "melevanto", zodat "levanto la mano" (ik steek mijn hand op) hier niet onder valt.
    levantarse:  { es: ["melevanto", "televantas", "selevanta", "noslevantamos", "selevantan"], d: ["sta", "staat", "staat", "staan"], inf: "opstaan", prt: "op", refl: 1 },
    ducharse:    { es: ["meducho", "teduchas", "seducha", "nosduchamos", "seduchan"], d: ["douche", "douchet", "douchet", "douchen"], inf: "douchen", refl: 1 },
    acostarse:   { es: ["meacuesto", "teacuestas", "seacuesta", "nosacostamos", "seacuestan"], d: ["ga", "gaat", "gaat", "gaan"], inf: "naar bed gaan", prt: "naar bed", refl: 1 },
    despertarse: { es: ["medespierto", "tedespiertas", "sedespierta", "nosdespertamos", "sedespiertan"], d: ["word", "wordt", "wordt", "worden"], inf: "wakker worden", prt: "wakker", refl: 1 },
    sentarse:    { es: ["mesiento", "tesientas", "sesienta", "nossentamos", "sesientan"], d: ["ga", "gaat", "gaat", "gaan"], inf: "gaan zitten", prt: "zitten", refl: 1 },
    quedarse:    { es: ["mequedo", "tequedas", "sequeda", "nosquedamos", "sequedan"], d: ["blijf", "blijft", "blijft", "blijven"], inf: "blijven", refl: 1 },
    irse:        { es: ["mevoy", "tevas", "seva", "nosvamos", "sevan"], d: ["ga", "gaat", "gaat", "gaan"], inf: "weggaan", prt: "weg", refl: 1 },
    beber:     { es: ["bebo", "bebes", "bebe", "bebemos", "beben"], d: ["drink", "drinkt", "drinkt", "drinken"], inf: "drinken" },
    cocinar:   { es: ["cocino", "cocinas", "cocina", "cocinamos", "cocinan"], d: ["kook", "kookt", "kookt", "koken"], inf: "koken" },
    leer:      { es: ["leo", "lees", "lee", "leemos", "leen"], d: ["lees", "leest", "leest", "lezen"], inf: "lezen" },
    ver:       { es: ["veo", "ves", "ve", "vemos", "ven"], d: ["zie", "ziet", "ziet", "zien"], inf: "zien" },
    venir:     { es: ["vengo", "vienes", "viene", "venimos", "vienen"], d: ["kom", "komt", "komt", "komen"], inf: "komen" },
    hacer:     { es: ["hago", "haces", "hace", "hacemos", "hacen"], d: ["doe", "doet", "doet", "doen"], inf: "doen" },
    decir:     { es: ["digo", "dices", "dice", "decimos", "dicen"], d: ["zeg", "zegt", "zegt", "zeggen"], inf: "zeggen" },
    ayudar:    { es: ["ayudo", "ayudas", "ayuda", "ayudamos", "ayudan"], d: ["help", "helpt", "helpt", "helpen"], inf: "helpen" },
    escuchar:  { es: ["escucho", "escuchas", "escucha", "escuchamos", "escuchan"], d: ["luister", "luistert", "luistert", "luisteren"], inf: "luisteren" },
    saber:     { es: ["se", "sabes", "sabe", "sabemos", "saben"], d: ["weet", "weet", "weet", "weten"], inf: "weten" },
    entender:  { es: ["entiendo", "entiendes", "entiende", "entendemos", "entienden"], d: ["begrijp", "begrijpt", "begrijpt", "begrijpen"], inf: "begrijpen" },
    aprender:  { es: ["aprendo", "aprendes", "aprende", "aprendemos", "aprenden"], d: ["leer", "leert", "leert", "leren"], inf: "leren" },
    mirar:     { es: ["miro", "miras", "mira", "miramos", "miran"], d: ["kijk", "kijkt", "kijkt", "kijken"], inf: "kijken" },
    jugar:     { es: ["juego", "juegas", "juega", "jugamos", "juegan"], d: ["speel", "speelt", "speelt", "spelen"], inf: "spelen" },
    costar:    { es: ["cuesto", "cuestas", "cuesta", "costamos", "cuestan"], d: ["kost", "kost", "kost", "kosten"], inf: "kosten" },
    necesitar: { es: ["necesito", "necesitas", "necesita", "necesitamos", "necesitan"], d: ["heb", "hebt", "heeft", "hebben"], inf: "hebben", need: true },
    repetir:   { es: ["repito", "repites", "repite", "repetimos", "repiten"], d: ["herhaal", "herhaalt", "herhaalt", "herhalen"], inf: "herhalen" },
    comprar:   { es: ["compro", "compras", "compra", "compramos", "compran"], d: ["koop", "koopt", "koopt", "kopen"], inf: "kopen" },
    buscar:    { es: ["busco", "buscas", "busca", "buscamos", "buscan"], d: ["zoek", "zoekt", "zoekt", "zoeken"], inf: "zoeken" },
    escribir:  { es: ["escribo", "escribes", "escribe", "escribimos", "escriben"], d: ["schrijf", "schrijft", "schrijft", "schrijven"], inf: "schrijven" },
    dormir:    { es: ["duermo", "duermes", "duerme", "dormimos", "duermen"], d: ["slaap", "slaapt", "slaapt", "slapen"], inf: "slapen" },
    pagar:     { es: ["pago", "pagas", "paga", "pagamos", "pagan"], d: ["betaal", "betaalt", "betaalt", "betalen"], inf: "betalen" },
    tomar:     { es: ["tomo", "tomas", "toma", "tomamos", "toman"], d: ["neem", "neemt", "neemt", "nemen"], inf: "nemen" },
    abrir:     { es: ["abro", "abres", "abre", "abrimos", "abren"], d: ["open", "opent", "opent", "openen"], inf: "openen" },
    encontrar: { es: ["encuentro", "encuentras", "encuentra", "encontramos", "encuentran"], d: ["vind", "vindt", "vindt", "vinden"], inf: "vinden" },
    ganar:     { es: ["gano", "ganas", "gana", "ganamos", "ganan"], d: ["win", "wint", "wint", "winnen"], inf: "winnen" },
    intentar:  { es: ["intento", "intentas", "intenta", "intentamos", "intentan"], d: ["probeer", "probeert", "probeert", "proberen"], inf: "proberen" },
    perder:    { es: ["pierdo", "pierdes", "pierde", "perdemos", "pierden"], d: ["verlies", "verliest", "verliest", "verliezen"], inf: "verliezen" },
    oir:       { es: ["oigo", "oyes", "oye", "oimos", "oyen"], d: ["hoor", "hoort", "hoort", "horen"], inf: "horen" },
    conocer:   { es: ["conozco", "conoces", "conoce", "conocemos", "conocen"], d: ["ken", "kent", "kent", "kennen"], inf: "kennen" },
    llamar:    { es: ["llamo", "llamas", "llama", "llamamos", "llaman"], d: ["bel", "belt", "belt", "bellen"], inf: "bellen" },
    probar:    { es: ["pruebo", "pruebas", "prueba", "probamos", "prueban"], d: ["probeer", "probeert", "probeert", "proberen"], inf: "proberen" },
    deber:     { es: ["debo", "debes", "debe", "debemos", "deben"], d: ["moet", "moet", "moet", "moeten"], inf: "moeten", modal: true },
    deberia:   { es: ["debería", "deberías", "debería", "deberíamos", "deberían"], d: ["zou", "zou", "zou", "zouden"], inf: "moeten", modal: true },
    mogen:     { es: [], d: ["mag", "mag", "mag", "mogen"], inf: "mogen", modal: true }
  };
  // Vorm -> werkwoord en persoon (0 yo, 1 tú, 2 él/ella/usted, 3 nosotros, 4 ustedes, 5 ellos/ellas)
  var FORM = {};
  Object.keys(VERBS).forEach(function (k) {
    VERBS[k].es.forEach(function (f, i) {
      var key = nf(f);
      if (FORM[key] === undefined) FORM[key] = { v: k, p: i };
    });
  });
  // Verleden tijd van "ir" (fui, fuiste, fue, fuimos, fueron -> ging/gingen)
  var PAST_GO = { fui: 0, fuiste: 1, fue: 2, fuimos: 3, fueron: 4 };
  var PAST_NL = ["ging", "ging", "ging", "gingen", "gingen"];
  // Verleden tijd: [enkelvoud, meervoud, voltooid deelwoord, hulpwerkwoord]
  var PAST_D = {
    tener: ["had", "hadden", "gehad", "h"], ser: ["was", "waren", "geweest", "z"], estar: ["was", "waren", "geweest", "z"], ir: ["ging", "gingen", "gegaan", "z"],
    querer: ["wilde", "wilden", "gewild", "h"], poder: ["kon", "konden", "gekund", "h"], vivir: ["woonde", "woonden", "gewoond", "h"],
    hablar: ["sprak", "spraken", "gesproken", "h"], trabajar: ["werkte", "werkten", "gewerkt", "h"], estudiar: ["studeerde", "studeerden", "gestudeerd", "h"],
    comer: ["at", "aten", "gegeten", "h"], partir: ["vertrok", "vertrokken", "vertrokken", "z"], beber: ["dronk", "dronken", "gedronken", "h"],
    cocinar: ["kookte", "kookten", "gekookt", "h"], leer: ["las", "lazen", "gelezen", "h"], ver: ["zag", "zagen", "gezien", "h"],
    venir: ["kwam", "kwamen", "gekomen", "z"], hacer: ["deed", "deden", "gedaan", "h"], decir: ["zei", "zeiden", "gezegd", "h"],
    ayudar: ["hielp", "hielpen", "geholpen", "h"], escuchar: ["luisterde", "luisterden", "geluisterd", "h"], saber: ["wist", "wisten", "geweten", "h"],
    entender: ["begreep", "begrepen", "begrepen", "h"], aprender: ["leerde", "leerden", "geleerd", "h"], mirar: ["keek", "keken", "gekeken", "h"],
    jugar: ["speelde", "speelden", "gespeeld", "h"], costar: ["kostte", "kostten", "gekost", "h"], repetir: ["herhaalde", "herhaalden", "herhaald", "h"],
    deber: ["moest", "moesten", "gemoeten", "h"],
    comprar: ["kocht", "kochten", "gekocht", "h"], buscar: ["zocht", "zochten", "gezocht", "h"], escribir: ["schreef", "schreven", "geschreven", "h"],
    dormir: ["sliep", "sliepen", "geslapen", "h"], pagar: ["betaalde", "betaalden", "betaald", "h"], tomar: ["nam", "namen", "genomen", "h"], abrir: ["opende", "openden", "geopend", "h"],
    encontrar: ["vond", "vonden", "gevonden", "h"], ganar: ["won", "wonnen", "gewonnen", "h"], intentar: ["probeerde", "probeerden", "geprobeerd", "h"],
    probar: ["probeerde", "probeerden", "geprobeerd", "h"], perder: ["verloor", "verloren", "verloren", "h"], oir: ["hoorde", "hoorden", "gehoord", "h"], llamar: ["belde", "belden", "gebeld", "h"], conocer: ["kende", "kenden", "gekend", "h"]
  };
  var AUX_H = ["heb", "hebt", "heeft", "hebben", "hebben"], AUX_Z = ["ben", "bent", "is", "zijn", "zijn"];
  var HABER_P = { he: 0, has: 1, ha: 2, hemos: 3, han: 4 };
  // Spaanse verleden vormen uit de zinnenmotor (pas bij de eerste zin opgebouwd)
  var PASTES = null, PPES = null;
  function buildPast() {
    if (PASTES) return;
    PASTES = {}; PPES = {};
    if (typeof ZINC === "undefined" || !ZINC.esForm) return;
    Object.keys(PAST_D).forEach(function (lem) {
      if (lem === "ir" || lem === "ser" || lem === "deber") { if (lem === "deber") { /* wel */ } else return; }
      [["pret", "pret"], ["imp", "imp"]].forEach(function (tt) {
        [[0, 0], [1, 1], [2, 2], [3, 3], [5, 4]].forEach(function (pm) {
          var f = null; try { f = ZINC.esForm(lem, tt[0], pm[0]); } catch (e) { f = null; }
          var fk = f ? nf(f) + (/ó$/.test(f) ? "§" : "") : null;
          if (f && PASTES[fk] === undefined && !FORM[fk] && PAST_GO[fk] === undefined) PASTES[fk] = { v: lem, p: pm[1] };
        });
      });
      var pp = null; try { pp = ZINC.esPP(lem); } catch (e) { pp = null; }
      if (pp) PPES[nf(pp)] = lem;
    });
    PPES.ido = "ir"; PPES.sido = "ser"; PPES.estado = "estar";
  }

  // Persoonsindex: 0 yo, 1 tú, 2 él/ella/usted, 3 nosotros, 4 ellos/ustedes
  var PRON = { yo: 0, tu: 1, el: 2, ella: 2, usted: 2, nosotros: 3, nosotras: 3, ustedes: 4, vosotros: 4, ellos: 4, ellas: 4 };
  var SUBJ_NL = { 0: "ik", 1: "je", 3: "we", 4: "zij" };

  var PREP = { en: "in", a: "naar", con: "met", de: "van", para: "voor", sin: "zonder", sobre: "over", por: "door", desde: "vanaf", hasta: "tot" };
  var ADV = { tardelaat: "laat", hastatarde: "tot laat", dhunano: "al een jaar", dhdosano: "al twee jaar", dhtresano: "al drie jaar", dhunmes: "al een maand", dhdosmes: "al twee maanden", dhunasemana: "al een week", dhdossemana: "al twee weken", dhmuchotiempo: "al lang", estanoche: "vanavond", estamanana: "vanochtend", estatarde: "vanmiddag", enestemomento: "nu", todoeldia: "de hele dag", semanapasada: "vorige week", anopasado: "vorig jaar", semanaqueviene: "volgende week", anoqueviene: "volgend jaar",
    mespasado: "vorige maand", mesqueviene: "volgende maand", estasemana: "deze week", esteano: "dit jaar", pasadomanana: "overmorgen", anteayer: "eergisteren",
    hoy: "vandaag", manana: "morgen", ayer: "gisteren", ahora: "nu", siempre: "altijd", nunca: "nooit",
    tambien: "ook", todavia: "nog", bien: "goed", mal: "slecht", despacio: "langzaam", aqui: "hier", alli: "daar",
    allí: "daar", afuera: "buiten", solo: "alleen", ya: "al", poco: "weinig", mas: "meer", cerca: "dichtbij", lejos: "ver", casi: "bijna", tarde: "laat" };
  var WH = { que: "wat", donde: "waar", cuando: "wanneer", como: "hoe", cuanto: "hoeveel", quien: "wie", cual: "welke", por_que: "waarom" };

  var PROPER = { madrid: "Madrid", barcelona: "Barcelona", amsterdam: "Amsterdam", londres: "Londen", paris: "Parijs",
    espana: "Spanje", mexico: "Mexico", argentina: "Argentinië", francia: "Frankrijk", alemania: "Duitsland",
    "paises bajos": "Nederland", holanda: "Nederland", "nueva york": "New York" };
  // Nationaliteiten (mannelijk, vrouwelijk) en de Nederlandse woordvorm
  var NAT = { holandes: ["Nederlander", "Nederlandse"], holandesa: ["Nederlander", "Nederlandse"], espanol: ["Spanjaard", "Spaanse"], espanola: ["Spanjaard", "Spaanse"] };

  // Bijvoeglijke naamwoorden (predicaat)
  var ADJ = { frescovers: "vers",
    orgulloso: "trots", orgullosa: "trots", satisfecho: "tevreden", satisfecha: "tevreden", celoso: "jaloers", celosa: "jaloers",
    enamorado: "verliefd", enamorada: "verliefd", enfadado: "boos", enfadada: "boos", enojado: "boos", enojada: "boos",
    preocupado: "bezorgd", preocupada: "bezorgd", casado: "getrouwd", casada: "getrouwd", roto: "kapot", rota: "kapot",
    cansado: "moe", cansada: "moe", enfermo: "ziek", enferma: "ziek", contento: "blij", contenta: "blij",
    triste: "verdrietig", nervioso: "zenuwachtig", nerviosa: "zenuwachtig", ocupado: "bezig", ocupada: "bezig",
    listo: "klaar", lista: "klaar", alto: "lang", alta: "lang", bajo: "klein", baja: "klein",
    grande: "groot", pequeno: "klein", pequena: "klein", bonito: "mooi", bonita: "mooi", feo: "lelijk", fea: "lelijk",
    frio: "koud", caliente: "warm", bueno: "goed", buena: "goed", malo: "slecht", mala: "slecht",
    nuevo: "nieuw", nueva: "nieuw", viejo: "oud", vieja: "oud", joven: "jong", simpatico: "aardig", simpatica: "aardig",
    amable: "vriendelijk", dificil: "moeilijk", facil: "makkelijk", caro: "duur", cara: "duur", barato: "goedkoop",
    rapido: "snel", rapida: "snel", lento: "langzaam", lenta: "langzaam", divertido: "leuk", divertida: "leuk",
    aburrido: "saai", aburrida: "saai", importante: "belangrijk", interesante: "interessant", cerca: "dichtbij",
    tranquilo: "rustig", tranquila: "rustig", feliz: "gelukkig", rico: "rijk", rica: "rijk", sabroso: "lekker",
    sabrosa: "lekker", cansados: "moe", contentos: "blij", simpaticos: "aardig", bonitos: "mooi", grandes: "groot",
    estudiante: "student", estudiantes: "studenten", profesor: "leraar", profesora: "lerares", medica: "arts"
  };

  // Afwijkende meervouden van zelfstandige naamwoorden (rest: -en, -s of 's)
  var PLURAL = { leraar: "leraren", huis: "huizen", kind: "kinderen", boek: "boeken", stad: "steden", man: "mannen", vrouw: "vrouwen",
    dag: "dagen", tijd: "tijden", uur: "uren", jaar: "jaren", kat: "katten", hond: "honden", vriend: "vrienden",
    zus: "zussen", broer: "broers", moeder: "moeders", vader: "vaders", tafel: "tafels", auto: "auto's", park: "parken",
    strand: "stranden", station: "stations", film: "films", school: "scholen", koffie: "koffies", water: "water",
    geld: "geld", pescado: "vis", vis: "vissen", werk: "werken", hulp: "hulp", honger: "honger", brood: "broden" };
  var NO_ART = { hem: 1, je: 1, me: 1, het: 1, haar: 1, ons: 1, ze: 1, water: 1, geld: 1, tijd: 1, koffie: 1, hulp: 1, honger: 1, werk: 1, vis: 1, brood: 1 };

  // Zelfstandige naamwoorden waarvan de Nederlandse keuze afwijkt van het woordenboek
  var NOUN_NL = { xme: "me", xte: "je", xlo: "het", xla: "haar", xnos: "ons", xlos: "ze", xlom: "hem", tarea: "huiswerk", pelicula: "film", deberes: "huiswerk", cafe: "koffie", tiempo: "tijd", hora: "uur",
    padre: "vader", madre: "moeder", hermano: "broer", hermana: "zus", amigo: "vriend", amiga: "vriendin",
    profesor: "leraar", profesora: "lerares", medica: "arts", medico: "arts", hijo: "zoon", hija: "dochter",
    esposo: "man", esposa: "vrouw", novio: "vriend", novia: "vriendin", perro: "hond", gato: "kat",
    te: "thee", nina: "meisje", jefa: "bazin", companera: "collega", colegio: "school", bicicleta: "fiets", cena: "avondeten", billete: "kaartje",
    movil: "mobiel", examen: "examen", postre: "toetje", apartamento: "appartement", pausa: "pauze", aeropuerto: "luchthaven", mapa: "kaart",
    piscina: "zwembad", biblioteca: "bibliotheek", cocina: "keuken", reserva: "reservering", cuenta: "rekening", ducha: "douche", entrada: "ingang", salida: "uitgang", guitarra: "gitaar", equipo: "team", tele: "tv" };

  // Meervoud met lange klinker in plaats van dubbele medeklinker (glas -> glazen, dak -> daken)
  var PL_LANG = { glas: "glazen", bad: "baden", dak: "daken", gat: "gaten", pad: "paden", weg: "wegen", schip: "schepen", lid: "leden", god: "goden", slot: "sloten", hof: "hoven", spel: "spellen" };
  // Meervoud van leenwoorden en woorden met de klemtoon achteraan
  var PL_LEEN = { toilet: "toiletten", restaurant: "restaurants", ticket: "tickets", perron: "perrons", café: "cafés", bureau: "bureaus", museum: "musea", menu: "menu's", lift: "liften", hotel: "hotels", winkel: "winkels" };
  function plural(nl) {
    if (PLURAL[nl]) return PLURAL[nl];
    if (PL_LANG[nl]) return PL_LANG[nl];
    if (PL_LEEN[nl]) return PL_LEEN[nl];
    var last = nl.split(" ").pop();
    if (last !== nl) { var pk = plural(last); return nl.slice(0, nl.length - last.length) + pk; }
    if (/heid$/.test(nl)) return nl.slice(0, -4) + "heden";
    // Lange klinker in een open lettergreep: zoon -> zonen, boom -> bomen, beer -> beren
    var lk = /^(.*[^aeiou])(aa|ee|oo|uu)([bcdfgklmnprt])$/.exec(nl);
    if (lk) return lk[1] + lk[2].charAt(0) + lk[3] + "en";
    if (/(el|em|en|er|or)$/.test(nl)) return nl + "s";
    if (/ie$/.test(nl)) return nl + "s";          // vakantie -> vakanties (geen apostrof bij -ie)
    if (/e$/.test(nl)) return nl + "s";           // groente -> groentes, pauze -> pauzes, kaartje -> kaartjes
    // lange klinker of tweeklank + s/f: kaas -> kazen, huis -> huizen, brief -> brieven
    var sf = /^(.*?)(aa|ee|oo|uu|ij|ei|ui|ou|au|eu|oe|ie)([sf])$/.exec(nl);
    if (sf) return sf[1] + (sf[2].length === 2 && /^(aa|ee|oo|uu)$/.test(sf[2]) ? sf[2].charAt(0) : sf[2]) + (sf[3] === "s" ? "z" : "v") + "en";
    // één lettergreep met een korte klinker: trap -> trappen, bus -> bussen, bril -> brillen
    if (/^[^aeiouy]*[aeiou][bdfgklmnprst]$/.test(nl)) return nl + nl.charAt(nl.length - 1) + "en";
    if (/(eau|a|o|u|i)$/.test(nl)) return nl + "'s";
    return nl + "en";
  }

  // Dutch -> lidwoord voor een zelfstandig naamwoord (gen = "c" of "n" uit de lexicon), of null als onbekend
  function defArt(gen, pl) {
    if (pl) return "de";
    if (gen === "c") return "de";
    if (gen === "n") return "het";
    return null;
  }

  // de/het uit de PDF-lijst (wordlist.pdf) als het eigen lexicon het woord niet kent
  var NLG = null;
  var NLG_EXTRA = {};
  "thee=c|meisje=n|jongen=c|opa=c|oma=c|arts=c|baas=c|bazin=c|buurman=c|buurvrouw=c|collega=c|school=c|markt=c|sap=n|fiets=c|avondeten=n|bar=c|kaartje=n|mobiel=c|examen=n|vlees=n|fruit=n|appel=c|soep=c|rijst=c|kip=c|groente=c|chocolade=c|toetje=n|pizza=c|appartement=n|overhemd=n|menu=n|pauze=c|aankoop=c|verjaardag=c|taxi=c|luchthaven=c|kaart=c|boom=c|zwembad=n|bibliotheek=c|gitaar=c|team=n|paard=n|vogel=c|tv=c".split("|").forEach(function (p) { var i = p.indexOf("="); NLG_EXTRA[p.slice(0, i)] = p.slice(i + 1); });
  function nlGen(w) {
    if (!NLG) { NLG = {}; if (typeof ZIN_GENDER !== "undefined" && ZIN_GENDER.nl) ZIN_GENDER.nl.split("|").forEach(function (p) { var i = p.indexOf("="); if (i > 0) NLG[p.slice(0, i)] = p.slice(i + 1); }); }
    var g = NLG[String(w).toLowerCase()];
    if (g === undefined) g = NLG_EXTRA[String(w).toLowerCase()];
    return g === undefined ? null : g;
  }

  // Zelfstandig naamwoord (Spaans enkelvoud) -> { nl, gen, plural } of null
  function noun(es, rev, gen) {
    var s = nf(es);
    // tweede betekenis met eigen sleutel: "baños_zzb" = meervoud van "baño_zzb" (toilet)
    var zk = /^(.+?)(es|s)?(_zz[a-h])$/.exec(s);
    if (zk && rev[zk[1] + zk[3]] !== undefined) { var zv = rev[zk[1] + zk[3]]; return /\s/.test(zv) ? null : { nl: zv, gen: gen(zk[1] + zk[3]) || nlGen(zv), plural: !!zk[2], base: zk[1] + zk[3] }; }
    if (NOUN_NL[s]) return { nl: NOUN_NL[s], gen: gen(s) || nlGen(NOUN_NL[s]), plural: false, base: s };
    // Meervoud: eerst het enkelvoud zoeken (het woordenboek geeft meervouden al in het Nederlands)
    var base = s, pl = false, v;
    if (/es$/.test(s) && s.length > 4 && rev[s.slice(0, -2)] !== undefined) { base = s.slice(0, -2); pl = true; }
    else if (/s$/.test(s) && s.length > 3 && rev[s.slice(0, -1)] !== undefined) { base = s.slice(0, -1); pl = true; }
    v = NOUN_NL[base] !== undefined ? NOUN_NL[base] : rev[base];
    if (v === undefined && !pl) { v = rev[s]; base = s; }
    if (v === undefined || /\s/.test(v)) return null;
    return { nl: v, gen: gen(base) || nlGen(v), plural: pl, base: base };
  }

  // Naamgroep: lidwoord/bezitter/aantal + zelfstandig naamwoord. Geeft { s, end, fixed } of null
  function np(toks, i, rev, gen) {
    var t = toks[i], det = null, n = 1, pl = false, num = null;
    if (t === undefined) return null;
    if (t === "el" || t === "la" || t === "los" || t === "las") { det = "def"; pl = (t === "los" || t === "las"); }
    else if (t === "un" || t === "una") { det = "ind"; }
    else if (t === "mi" || t === "mis") { det = "mijn"; pl = t === "mis"; }
    else if (t === "tu" || t === "tus") { det = "je"; pl = t === "tus"; }
    else if (t === "nuestro" || t === "nuestra" || t === "nuestros" || t === "nuestras") { det = "onze"; pl = /s$/.test(t); }
    else if (t === "dos") { num = "twee"; }
    else if (t === "tres") { num = "drie"; }
    else if (t === "cuatro") { num = "vier"; }
    else if (t === "muchos" || t === "muchas") { num = "veel"; }
    else if (t === "muchas") { num = "veel"; }
    else det = "bare";
    if (det !== "bare") n = 2;
    var nounTok = toks[i + (det === "bare" ? 0 : 1)];
    if (num && num !== "veel") { n = 2; nounTok = toks[i + 1]; }
    if (num === "veel") { n = 2; nounTok = toks[i + 1]; }
    if (nounTok === undefined) return null;
    var nn = noun(nounTok, rev, gen);
    if (!nn) return null;
    // Bijvoeglijk naamwoord na het zelfstandig naamwoord: "casa grande" -> "een groot huis"
    var attr = null, attrEnd = 0;
    var afterTok = toks[i + n];
    if (afterTok !== undefined && ADJ[nf(afterTok)] !== undefined && !(num === "veel")) {
      attr = ADJ[nf(afterTok)];
      attrEnd = 1;
    }
    var out = [];
    var isPl = nn.plural || pl || (num && num !== "veel") || false;
    // Eén ding met een meervoudsvorm in het Spaans (las gafas = de bril, los bomberos = de brandweer)
    if (isPl && !num && typeof ALLEDAAGS_MW !== "undefined" && ALLEDAAGS_MW.enkelNl && ALLEDAAGS_MW.enkelNl[nf(nounTok)]) isPl = false;
    // "hijos" is meestal "kinderen" (zonen én dochters); "hijo" alleen is "zoon"
    // Spaanse meervouden die samen een groep zijn: padres = ouders (niet "vaders"), abuelos = grootouders
    var GROEP = { hijos: "kinderen", padres: "ouders", abuelos: "grootouders", hermanos: "broers en zussen", tios: "ooms en tantes" };
    var nlN = isPl ? (GROEP[nf(nounTok)] && (!num || nf(nounTok) === "hijos") ? GROEP[nf(nounTok)] : plural(nn.nl)) : nn.nl;
    if (det === "def") {
      var a = defArt(nn.gen, isPl);
      if (!a) return null;
      out.push(a);
    } else if (det === "ind") {
      out.push("een");
    } else if (det === "mijn") out.push("mijn");
    else if (det === "je") out.push("je");
    else if (det === "onze") {
      if (!nn.gen && !isPl) return null;
      out.push(isPl || nn.gen === "c" ? "onze" : "ons");
    }
    else if (num) out.push(num === "veel" ? "veel" : num);
    else if (det === "bare") {
      if (NO_ART[nn.nl] || isPl) { /* bloot */ }
    }
    if (attr) {
      // Voor een attributief bijvoeglijk naamwoord: -e bij meervoud en bij "de"-woorden
      var attrTxt = (isPl || nn.gen === "c") ? attr + "e" : attr;
      if (det === "bare" || det === null) attrTxt = attr + "e";
      out.push(attrTxt);
      out.push(nlN);
      return { s: out.join(" "), end: i + n + attrEnd, plural: isPl, nl: nn.nl, bare: det === "bare", def: det !== "bare", indef: det === "ind" };
    }
    out.push(nlN);
    return { s: out.join(" "), end: i + n, plural: isPl, nl: nn.nl, bare: det === "bare" || (num && num !== "veel" && false), def: det === "def" || det === "ind" || det === "mijn" || det === "je" || det === "onze", indef: det === "ind" };
  }

  // Plaats of bijwoord-zin
  function phrase(toks, i, rev, gen) {
    var t = toks[i];
    if (t === undefined) return null;
    if (t === "al") {
      // "al" = a + el: "al parque" -> naar het park
      var alp = np(["el"].concat(toks.slice(i + 1)), 0, rev, gen);
      if (!alp) return null;
      return { s: "naar " + alp.s, end: i + alp.end };
    }
    if (PREP[t] !== undefined) {
      var p = PREP[t];
      if (t === "en" && (toks[i + 1] === "casa")) return { s: "thuis", end: i + 2 };
      if (t === "a" && (toks[i + 1] === "casa")) return { s: "naar huis", end: i + 2 };
      if (t === "con" && toks[i + 1] === "migo") return { s: "met mij", end: i + 2 };
      if (t === "con" && toks[i + 1] === "ti") return { s: "met jou", end: i + 2 };
      // voornaamwoord na een voorzetsel: "con él" = met hem, "para ella" = voor haar
      var vw = toks[i + 1] || "", vwN = nf(vw);
      if (AP_PRON_NL[vwN] !== undefined && (/^(mí|él|ella|ellas|ellos|nosotros|nosotras|ustedes|vosotros|usted|ti)$/i.test(vw) || (vwN !== "mi" && vwN !== "el" && toks[i + 2] === undefined)))
        return { s: p + " " + AP_PRON_NL[vwN], end: i + 2 };
      if (t === "a" && (toks[i + 1] === "el" || toks[i + 1] === "la")) {
        var ap = np(toks, i + 1, rev, gen);
        if (!ap) return null;
        // "naar" bij bewegen; bij plaatsen van waar je bent gebruiken we "in"/"op"
        return { s: "naar " + ap.s, end: ap.end };
      }
      if (t === "en" && (toks[i + 1] === "el" || toks[i + 1] === "la")) {
        var ep = np(toks, i + 1, rev, gen);
        if (!ep) return null;
        if (nf(toks[i + 2] || "") === "escuela" || nf(toks[i + 1] || "") === "escuela") return null;
        return { s: "in " + ep.s, end: ep.end };
      }
      if (PROPER[toks[i + 1]] !== undefined) return { s: p + " " + PROPER[toks[i + 1]], end: i + 2 };
      var pn = np(toks, i + 1, rev, gen);
      if (!pn) return null;
      return { s: p + " " + pn.s, end: pn.end, pp: true };
    }
    if (PROPER[t] !== undefined) return { s: PROPER[t], end: i + 1 };
    if (ADV[t] !== undefined) return { s: ADV[t], end: i + 1, adv: true };
    if (t === "mucho" || t === "muy") return { s: t === "muy" ? "heel" : "veel", end: i + 1, adv: true, mucho: t === "mucho" };
    var nn = np(toks, i, rev, gen);
    if (nn) return { s: nn.s, end: nn.end, np: nn };
    return null;
  }

  // Voorzetsel + naamgroep na een bijvoeglijk naamwoord: "de mi hijo", "del perro", "conmigo", "por ti"
  var AP_PRON_NL = { mi: "mij", ti: "jou", el: "hem", ella: "haar", nosotros: "ons", nosotras: "ons", ustedes: "jullie", vosotros: "jullie", ellos: "hen", ellas: "hen", usted: "u" };
  function apAanvulling(words, i, rev, gen) {
    var w = nf(words[i] || "");
    if (w === "conmigo") return i + 1 === words.length ? { prep: "con", s: "mij" } : null;
    if (w === "contigo") return i + 1 === words.length ? { prep: "con", s: "jou" } : null;
    var prep = w === "del" ? "de" : w;
    if (!/^(de|con|por)$/.test(prep)) return null;
    var rest = w === "del" ? ["el"].concat(words.slice(i + 1)) : words.slice(i + 1);
    if (!rest.length) return null;
    if (rest.length === 1 && AP_PRON_NL[nf(rest[0])] !== undefined) return { prep: prep, s: AP_PRON_NL[nf(rest[0])] };
    var n = np(rest, 0, rev, gen);
    if (!n || n.end !== rest.length) return null;
    return { prep: prep, s: n.s };
  }
  var ES_AP_NL = { orgulloso: ["trots", { de: "op" }], enfadado: ["boos", { con: "op" }], enojado: ["boos", { con: "op" }],
    contento: ["blij", { con: "met" }], satisfecho: ["tevreden", { con: "met" }], preocupado: ["bezorgd", { por: "om" }],
    casado: ["getrouwd", { con: "met" }], enamorado: ["verliefd", { de: "op" }], celoso: ["jaloers", { de: "op" }], cansado: ["moe", { de: "van" }] };

  // Tekst van een predicaat: adjectief of naamwoord na ser/estar
  function predicateAdj(word) {
    var k = nf(word);
    if (ADJ[k] !== undefined) return ADJ[k];
    // meervoud en vrouwelijk: "buenos", "bonitas", "grandes" (een Nederlands naamwoordelijk deel wordt niet verbogen)
    var kand = [k.replace(/s$/, ""), k.replace(/es$/, ""), k.replace(/as?$/, "o"), k.replace(/os$/, "o"), k.replace(/ces$/, "z")];
    for (var ki = 0; ki < kand.length; ki++) if (kand[ki] !== k && ADJ[kand[ki]] !== undefined) return ADJ[kand[ki]];
    return null;
  }

  // Nederlandse werkwoordsvorm voor een persoon. inv = omgekeerde volgorde (vraag)
  function dutchVerb(v, p, inv, past, perfect) {
    if (perfect && PAST_D[v]) { var ax = PAST_D[v][3] === "z" ? AUX_Z : AUX_H; return (p === 1 && inv) ? ax[0] : ax[p]; }
    if (past && v === "ir") return PAST_NL[p];
    if (past && PAST_D[v]) return PAST_D[v][p >= 3 ? 1 : 0];
    if (past) return PAST_NL[p];
    var d = VERBS[v].d;
    if (p === 0) return d[0];
    // Vraag met "je": vorm zonder t ("werk je"); geeft dat een dubbele klinker ("staa"), dan de ik-vorm ("sta je")
    if (p === 1) return inv ? d[0] === "eet" ? "eet" : (d[1] === "gaat" ? "ga" : (d[1] === "weet" ? "weet" : (/(aa|ee|oo|uu)$/.test(d[1].replace(/t$/, "")) ? d[0] : d[1].replace(/t$/, "")))) : d[1];
    if (p === 2) return d[2];
    return d[3];
  }

  // Onderwerp voor een persoon (zonder woord: dan een gedeeld onderwerp)
  function subjFor(p, extra) {
    if (p === 2) return extra || "hij";
    return SUBJ_NL[p];
  }

  // Hoofdfunctie
  // Woordenlijst zonder accenten en kleine letters (één keer opgebouwd)
  var revCache = null, revSrc = null;
  function normRev(rev) {
    if (revSrc === rev && revCache) return revCache;
    var m = {};
    Object.keys(rev).forEach(function (k) { var n = nf(k); if (m[n] === undefined) m[n] = rev[k]; });
    revSrc = rev; revCache = m;
    return m;
  }

  // Voorwerp-voornaamwoord vóór het werkwoord (te oigo, lo he comprado) wordt een voorwerp erachter (oigo te -> "ik hoor je")
  var CLITIC = { lom: "xlom", me: "xme", te: "xte", lo: "xlo", la: "xla", nos: "xnos", los: "xlos", las: "xlos" };
  var NOT_CLITIC_V = /^(gusta|gustan|encanta|encantan|parece|parecen|interesa|interesan|duele|duelen|siento|sientes|va|voy|vas)$/;
  function moveClitic(toks) {
    for (var k = 0; k < toks.length - 1; k++) {
      if (!CLITIC[toks[k]]) continue;
      var nx = toks[k + 1];
      if ((toks[k] === "me" || toks[k] === "te" || toks[k] === "nos") && NOT_CLITIC_V.test(nx)) continue;
      // "me llamo / te llamas / nos llamamos" = heten; "me llama" = hij/zij belt me
      if ({ me: "llamo", te: "llamas", nos: "llamamos" }[toks[k]] === nx) continue;
      // "está la cocina": na een werkwoord is "la/el + zelfstandig naamwoord" een lidwoord, geen voorwerp ("kookt het")
      if (/^(la|lo|los|las)$/.test(toks[k]) && NOUN_NL[nx] && k > 0 && FORM[toks[k - 1]] !== undefined) continue;
      var perf = HABER_P[nx] !== undefined && toks.length > k + 2;
      buildPast();
      var isV = FORM[nx] !== undefined || (PASTES && PASTES[nx] !== undefined) || (PASTES && PASTES[nx + "§"] !== undefined);
      if (!isV && !perf) continue;
      var out = toks.slice(0, k).concat(toks.slice(k + 1));
      var at = perf ? k + 2 : k + 1;   // na het (hulp)werkwoord of na het voltooid deelwoord
      // "lo conozco / lo llamo / lo ayudo": bij deze werkwoorden is "lo" een persoon (hem), geen ding
      out.splice(at, 0, toks[k] === "lo" && /^(conozc|conoc|llam|ayud|visit)/.test(nx) ? "xlom" : CLITIC[toks[k]]);
      return out;
    }
    return toks;
  }

  function translate(text, rev, gen) {
    if (!text || !rev || !gen) return null;
    rev = normRev(rev);
    var raw = String(text).trim();
    var isQ = /^¿/.test(raw) || /\?\s*$/.test(raw);
    // "¿Hay un supermercado cerca?" -> "Is er een supermarkt in de buurt?" (hay = er is)
    var hm = /^[¿¡]?\s*(no\s+)?hay\s+(un|una|ningún|ninguna|ningun)?\s*([a-záéíóúñü_]+)(?:\s+(cerca|aquí|aqui|por aquí|por aqui|cerca de aquí|cerca de aqui))?\s*[?.!]?$/i.exec(raw);
    if (hm) {
      var hw = nf(hm[3].toLowerCase()), hn = NOUN_NL[hw] || rev[hw];
      if (hn && !/\s/.test(hn)) {
        var geen = !!hm[1] || /^ning/i.test(hm[2] || "");
        var hdet = geen ? "geen " : (hm[2] ? "een " : "");
        var hplek = hm[4] ? (/cerca/i.test(hm[4]) ? " in de buurt" : " hier") : "";
        // "hier" vóór het lidwoord: "Is er hier een apotheek?"
        if (hplek === " hier") return isQ ? "Is er hier " + hdet + hn + "?" : "Er is hier " + hdet + hn + ".";
        return isQ ? "Is er " + hdet + hn + hplek + "?" : "Er is " + hdet + hn + hplek + ".";
      }
    }
    var s = nf(raw.replace(/([a-záéíóúñ]+)ó(?![a-záéíóúñ])/gi, "$1o§")).replace(/[¿?¡!.]/g, " ").replace(/\s+/g, " ").trim();
    var pleaseAdd = false, prefixNl = "";
    if (/,?\s*por favor$/.test(s)) { s = s.replace(/,?\s*por favor$/, ""); pleaseAdd = true; }
    var inter = /^(si|no) ,?/.exec(s.replace(/,\s*/, ", "));
    if (/^(si|no),/.test(s)) { prefixNl = /^si,/.test(s) ? "Ja, " : "Nee, "; s = s.replace(/^(si|no),\s*/, ""); }
    if (s.indexOf(",") >= 0) return null;
    var toks = s.split(" ").filter(Boolean);
    if (!toks.length) return null;
    toks = moveClitic(toks);

    var out = null;
    // Vaste zinnen (betrouwbaar)
    var FIXED = {
      "que hora es": "Hoe laat is het?",
      "como te llamas": "Hoe heet je?",
      "como estas": "Hoe gaat het met je?",
      "que quieres decir": "Wat bedoel je?",
      "que desea usted": "Wat wilt u?",
      "hace mucho frio": "Het is erg koud.",
      "hace frio": "Het is koud.",
      "hace mucho calor": "Het is erg warm.",
      "hace calor": "Het is warm.",
      "no entiendo": "Ik begrijp het niet.",
      "no lo se": "Ik weet het niet.",
      "estoy de acuerdo": "Ik ben het ermee eens.",
      "estoy de vacaciones": "Ik ben op vakantie.",
      "no estoy de acuerdo": "Ik ben het er niet mee eens.",
      "no lo entiendo": "Ik begrijp het niet.",
      "no se": "Ik weet het niet.",
      "puedes repetir": "Kun je dat herhalen?",
      "puedes repetirlo": "Kun je dat herhalen?",
      "me llamo": null
    };
    var key = toks.join(" ");
    if (FIXED[key]) { out = FIXED[key]; }
    // Weer met een tijd: "Hoy hace mucho frío" = "Vandaag is het erg koud"
    var wm = /^(?:(hoy|manana|ayer) )?(hace|hara|hizo) (mucho |muy )?(frio|calor|sol|viento|buen tiempo|mal tiempo)(?: (hoy|manana|ayer))?$/.exec(key);
    if (!out && wm && !(wm[1] && wm[5])) {
      var WT = { hoy: "vandaag", manana: "morgen", ayer: "gisteren" }, WW = { frio: "koud", calor: "warm", sol: "zonnig", viento: "winderig", "buen tiempo": "mooi weer", "mal tiempo": "slecht weer" };
      var tw = wm[1] || wm[5], ww = WW[wm[4]], wordt = wm[2] === "hara" || (tw === "manana" && wm[2] === "hace");
      var ww2 = (wm[3] && !/weer$/.test(ww) ? "erg " : "") + ww, vw = wordt ? "wordt" : wm[2] === "hizo" ? "was" : "is";
      if (/weer$/.test(ww)) { vw = wordt ? "wordt" : wm[2] === "hizo" ? "was" : "is"; }
      var zin = tw ? WT[tw] + " " + vw + " het " + ww2 : "het " + vw + " " + ww2;
      if (/weer$/.test(ww)) zin = tw ? WT[tw] + " " + (wordt ? "wordt" : wm[2] === "hizo" ? "was" : "is") + " het " + ww : "het " + vw + " " + ww;
      out = zin.charAt(0).toUpperCase() + zin.slice(1) + ".";
    }
    if (out === null || out === undefined) {
      if (toks[0] === "me" && toks[1] === "llamo" && toks.length >= 3) {
        var nameToks = raw.replace(/[¿?¡!.]/g, "").trim().split(/\s+/).slice(2);
        out = "Ik heet " + nameToks.map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(" ") + ".";
      }
    }
    if (out === null || out === undefined) out = buildQuestionOrClause(toks, isQ, rev, gen, raw);
    if (out === null || out === undefined) return null;
    if (pleaseAdd) out = out.replace(/[.?]$/, "") + ", alsjeblieft" + (out.slice(-1) === "?" ? "?" : ".");
    if (prefixNl) return prefixNl + out.charAt(0).toLowerCase() + out.slice(1);
    return out.charAt(0).toUpperCase() + out.slice(1);
  }

  // Werkwoordsvorm op positie i: tegenwoordige tijd (tabel), verleden tijd of voltooide tijd (he comido)
  function fvAt(toks, i) {
    var t = toks[i];
    if (t === undefined) return null;
    if (FORM[t]) return FORM[t];
    if (PAST_GO[t] !== undefined) return { v: (toks[i + 1] !== undefined && ADJ[nf(toks[i + 1])] !== undefined) ? "ser" : "ir", p: PAST_GO[t], past: true };
    buildPast();
    if (PASTES[t] !== undefined) return { v: PASTES[t].v, p: PASTES[t].p, past: true };
    if (HABER_P[t] !== undefined && toks[i + 1] !== undefined && PPES[toks[i + 1]] !== undefined && PPES[toks[i + 1]] !== "deber") return { v: PPES[toks[i + 1]], p: HABER_P[t], past: true, perfect: true, len: 2 };
    return null;
  }

  function buildQuestionOrClause(toks, isQ, rev, gen, raw) {
    // Vraagwoord
    // "¿Por qué …?" = waarom
    if (toks[0] === "por" && toks[1] === "que" && isQ) toks = ["por_que"].concat(toks.slice(2));
    var w0 = toks[0];
    // "Como pan." (ik eet brood): zonder vraagteken en zonder accent is "como" het werkwoord, geen vraagwoord
    var comoWerkwoord = w0 === "como" && !isQ && !/c[óÓ]mo/.test(raw || "");
    if (WH[w0] !== undefined && w0 !== "por" && !comoWerkwoord) {
      var wq = WH[w0];
      var restQ = toks.slice(1);
      // "¿Por qué no comes?" = "Waarom eet je niet?" (alleen zonder verdere aanvulling)
      var whNeg = false;
      if (restQ[0] === "no" && restQ.length >= 2) { whNeg = true; restQ = restQ.slice(1); }
      var fv = fvAt(restQ, 0);
      if (whNeg && (!fv || restQ.length > (fv.len || 1) + (restQ[(fv.len || 1)] === "tardelaat" ? 1 : 0))) return null;
      if (w0 === "donde" && restQ[0] && FORM[restQ[0]] && FORM[restQ[0]].v === "estar") {
        var locQ = phrase(restQ, 1, rev, gen);
        if (!locQ || locQ.end !== restQ.length) return null;
        // "¿Dónde están las gafas?" -> "Waar is de bril?": het werkwoord volgt het Nederlandse getal
        var wPl = FORM[restQ[0]].p === 4 && !(locQ.np && locQ.np.plural === false);
        return "Waar " + (wPl ? "zijn" : "is") + " " + locQ.s + "?";
      }
      if (fv) {
        var r = clauseParts(fv, restQ.slice(fv.len || 1), rev, gen, { inv: true, qw: wq });
        if (!r) return null;
        if (whNeg) { r = r.replace(/\.$/, ""); return (/ (aan|op|af|uit|mee|terug)$/.test(r) ? r.replace(/ (aan|op|af|uit|mee|terug)$/, " niet $1") : r + " niet") + "?"; }
        return r.replace(/\.$/, "") + "?";
      }
      if (w0 === "que" && restQ[0] === "hora") return null;
      return null;
    }
    // Ja/nee-vraag: werkwoord eerst (alleen bij een vraag)
    if (isQ && fvAt(toks, 0)) {
      var fv2 = fvAt(toks, 0);
      var r2 = clauseParts(fv2, toks.slice(fv2.len || 1), rev, gen, { inv: true });
      if (!r2) return null;
      return r2.replace(/\.$/, "") + "?";
    }
    if (isQ) return null;
    // "A mi hermano le gusta el fútbol", "Te gusta leer", "Nos encanta la playa": wie iets leuk vindt wordt het onderwerp
    var GUSTA_V = /^(gusta|gustan|encanta|encantan)$/;
    if (!isQ && (toks[0] === "a" || (/^(te|nos|les)$/.test(toks[0]) && GUSTA_V.test(toks[1] || "")))) {
      var gk = -1, gS = null, gI = 2;
      if (toks[0] === "a") {
        for (var gq = 2; gq < toks.length - 1; gq++) if (/^(me|te|le|nos|les)$/.test(toks[gq]) && GUSTA_V.test(toks[gq + 1])) { gk = gq; break; }
        if (gk > 0) {
          var aT = toks.slice(1, gk), PRG = { mi: ["Ik", 0], ti: ["Je", 1], el: ["Hij", 2], ella: ["Zij", 2], usted: ["U", 2], nosotros: ["We", 3], nosotras: ["We", 3], ellos: ["Zij", 3], ellas: ["Zij", 3], ustedes: ["Jullie", 3] };
          if (aT.length === 1 && PRG[nf(aT[0])]) { gS = PRG[nf(aT[0])][0]; gI = PRG[nf(aT[0])][1]; }
          else { var aN = np(aT, 0, rev, gen); if (aN && aN.end === aT.length) { gS = aN.s.charAt(0).toUpperCase() + aN.s.slice(1); gI = (/^(mis|tus|sus|los|las|nuestros|nuestras)$/.test(aT[0]) || /s$/.test(aT[aT.length - 1])) ? 3 : 2; } }
        }
      } else { gk = 0; gS = { te: "Je", nos: "We", les: "Zij" }[toks[0]]; gI = { te: 1, nos: 3, les: 3 }[toks[0]]; }
      if (gS && gk >= 0) {
        var gR = toks.slice(gk + 2), gEm = /^encanta/.test(toks[gk + 1]), gInf2 = findInfinitive(gR);
        if (gInf2 && gInf2.idx === 0) {
          var gT2 = gR.length > 1 ? tailOf(gR.slice(1), rev, gen) : "";
          if (gT2 === null) return null;
          return [gS, VERBS[gInf2.v].d[gI], gEm ? "heel" : "", "graag", gT2].filter(Boolean).join(" ").replace(/\s+/g, " ") + ".";
        }
        var gN2 = np(gR, 0, rev, gen);
        if (gN2 && gN2.end === gR.length) return gS + " " + ["hou", "houdt", "houdt", "houden"][gI] + " " + (gEm ? "heel erg " : "") + "van " + vanZonderLidwoord(gN2.s, gR) + ".";
        return null;
      }
    }
    // Mededeling: onderwerp + werkwoord
    if (!isQ && toks[0] === "me" && (toks[1] === "gusta" || toks[1] === "gustan" || toks[1] === "encanta" || toks[1] === "encantan")) {
      var gRest = toks.slice(2);
      var gInf = findInfinitive(gRest);
      var emph = toks[1] === "encanta" || toks[1] === "encantan";
      if (gInf && gInf.idx === 0) {
        var gv = VERBS[gInf.v];
        var gTail = gRest.length > 1 ? tailOf(gRest.slice(1), rev, gen) : "";
        if (gTail === null) return null;
        return ["Ik", gv.d[0], emph ? "heel" : "", "graag", gTail].filter(Boolean).join(" ").replace(/\s+/g, " ") + ".";
      }
      var gNp = np(gRest, 0, rev, gen);
      if (gNp && gNp.end === gRest.length) {
        var gObj = gNp.s;
        return "Ik hou " + (emph ? "heel erg " : "") + "van " + vanZonderLidwoord(gObj, gRest) + ".";
      }
      return null;
    }
    var verbIdx = -1, pastFv = null;
    for (var i = 0; i < toks.length; i++) {
      var fvi = fvAt(toks, i);
      if (fvi) { verbIdx = i; if (fvi.past) pastFv = fvi; break; }
    }
    if (verbIdx < 0) {
      // "hay" en "es/son" met een naamgroep zonder werkwoordsvorm uit de tabel
      return null;
    }
    var subjToks = toks.slice(0, verbIdx), fvM = pastFv || FORM[toks[verbIdx]];
    var rest = toks.slice(verbIdx + (pastFv && pastFv.perfect ? 2 : 1));
    var negPre = false, front = null;
    if (subjToks[0] === "no") { negPre = true; subjToks = subjToks.slice(1); }
    if (subjToks.length && ADV[subjToks[0]] !== undefined && ["gisteren", "morgen", "vandaag", "nu"].indexOf(ADV[subjToks[0]]) >= 0) {
      front = ADV[subjToks[0]] === "gisteren" ? "gisteren" : ADV[subjToks[0]];
      subjToks = subjToks.slice(1);
    }
    if (front === null && subjToks.length === 1 && ADV[subjToks[0]] !== undefined) return null;
    var subjNL = null, subjPl = false, subjNoun = null;
    var pN = (subjToks.length === 0) ? null : subjToks;
    if (pN) {
      if (pN.length === 1 && PRON[pN[0]] !== undefined) {
        var pp = PRON[pN[0]];
        if (pp !== fvM.p && !(pp === 2 && fvM.p === 2)) {
          // onderwerp past niet bij het werkwoord
          return null;
        }
      } else {
        var sNp = np(pN, 0, rev, gen);
        if (!sNp || sNp.end !== pN.length) return null;
        subjNoun = sNp.s;
        subjPl = sNp.plural;
        if (fvM.p !== (subjPl ? 4 : 2) && fvM.p !== 3) return null;
      }
    }
    return clauseParts(fvM, rest, rev, gen, { subjNoun: subjNoun, subjPronoun: subjToks.length === 1 ? subjToks[0] : null, hasSubj: pN !== null, raw: raw, negPre: negPre, front: front });
  }

  // Bouwt een zin rond een werkwoord. rest = tokens na het werkwoord.
  function clauseParts(fv, rest, rev, gen, o) {
    o = o || {};
    var v = fv.v, p = fv.p, inv = !!o.inv;
    var spec = VERBS[v];
    var neg = !!o.negPre;
    // "no" vóór het werkwoord of in de rest
    var restN = rest.slice();
    if (restN[0] === "no") { neg = true; restN.shift(); }
    if (restN.indexOf("no") >= 0) return null;
    // Onderwerp
    var subj;
    if (o.subjNoun) subj = o.subjNoun;
    else if (o.subjPronoun) {
      var pr = PRON[o.subjPronoun];
      subj = (o.subjPronoun === "usted") ? "u" : (o.subjPronoun === "el" ? "hij" : (o.subjPronoun === "ella" ? "zij" : (o.subjPronoun === "tu" ? "je" : (SUBJ_NL[pr] || "zij"))));
      if (o.subjPronoun === "ellos" || o.subjPronoun === "ellas") subj = "zij";
      if (o.subjPronoun === "ustedes") subj = "jullie";
      if (o.subjPronoun === "nosotros" || o.subjPronoun === "nosotras") subj = "we";
    }
    else subj = (p === 2 ? null : SUBJ_NL[p]);
    if (!o.hasSubj && p === 2) {
      // geen onderwerp: derde persoon. Onbekend geslacht -> alleen zinnen waar het zeker is
      subj = o.impersonal ? "het" : "hij/zij";   // "trabaja" zonder onderwerp: geslacht onbekend, dus niet gokken
    }
    if (fv.past && !o.hasSubj && p === 2 && !o.impersonal) return null;
    var verbNL = dutchVerb(v, p, inv, fv.past, fv.perfect);
    if (fv.perfect && (spec.copula || spec.modal || spec.need || v === "ir" || v === "tener")) return null;
    // Scheidbare werkwoorden (aankomen): het deel "aan" komt achteraan; verleden tijd ("kwam ... aan") nog niet
    if (VERBS[v] && VERBS[v].prt && (fv.past || fv.perfect)) return null;
    var ppTxt = fv.perfect ? PAST_D[v][2] : (VERBS[v] && VERBS[v].prt ? VERBS[v].prt : null);

    // Ser / estar + predicaat
    if (spec.copula) {
      var neg2 = neg;
      var words = restN;
      // "soy de X" = komen uit X (plaats)
      if (v === "ser" && words[0] === "de" && words.length >= 2 && PROPER[words[1]] !== undefined) {
        var place = PROPER[words[1]];
        var kv = p === 0 ? "kom" : ((p === 3 || p === 4) ? "komen" : "komt");
        if (inv) return (kv + " " + (subj || "") + " uit " + place + "?").replace(/\s+/g, " ");
        return finalize(subj, kv, { pred: "uit " + place, neg: neg2, inv: false, o: o });
      }
      // "estoy en casa" / "estoy aquí" / "está en X"
      if ((v === "estar" && !(words.length === 1 && predicateAdj(words[0]))) || (words[0] === "en" || words[0] === "aqui" || words[0] === "alli" || words[0] === "afuera")) {
        var lp = phrase(words, 0, rev, gen);
        if (lp && lp.end === words.length) {
          var locTxt = lp.s === "naar huis" ? "thuis" : lp.s;
          return finalize(subj, verbNL, { pred: locTxt, neg: neg2, inv: inv, o: o });
        }
      }
      // ser de nationaliteit / beroep
      if (words.length === 1 && NAT[nf(words[0])]) {
        var nat = NAT[nf(words[0])];
        var fem = /a$/.test(nf(words[0]));
        return finalize(subj, verbNL, { pred: nat[0], neg: neg2, inv: inv, o: o });
      }
      // bijvoeglijk naamwoord
      if (words.length === 1 && predicateAdj(words[0])) {
        return finalize(subj, verbNL, { pred: predicateAdj(words[0]), neg: neg2, inv: inv, o: o });
      }
      // "muy/mucho" + bijvoeglijk naamwoord
      if (words.length === 2 && (words[0] === "muy" || words[0] === "mucho") && predicateAdj(words[1])) {
        return finalize(subj, verbNL, { pred: "heel " + predicateAdj(words[1]), neg: neg2, inv: inv, o: o });
      }
      // bijvoeglijk naamwoord met vast voorzetsel: "estoy orgulloso de mi hijo" = ik ben trots op mijn zoon
      var apM = nf(words[0] || "") === "muy" ? 1 : 0;
      var apB = nf(words[apM] || "").replace(/(os|as|a)$/, "o"), apE = ES_AP_NL[apB];
      if (apE && words.length > apM + 1) {
        var apA = apAanvulling(words, apM + 1, rev, gen);
        if (apA && apE[1][apA.prep]) return finalize(subj, verbNL, { pred: (apM ? "heel " : "") + apE[0] + " " + apE[1][apA.prep] + " " + apA.s, neg: neg2, inv: inv, o: o });
      }
      // naamgroep na ser: identiteit
      var npc = np(words, 0, rev, gen);
      if (npc && npc.end === words.length) {
        var predTxt = npc.s;
        if (v === "ser" && p === 2 && !o.hasSubj) {
          // "Es mi padre": persoonlijk (hij/zij) als het een persoon is, anders "het"
          var masc = /(padre|hermano|amigo|profesor|hijo|esposo|hombre|novio)$/.test(nf(words[words.length - 1] || ""));
          var fem2 = /(madre|hermana|amiga|profesora|medica|hija|esposa|mujer|novia)$/.test(nf(words[words.length - 1] || ""));
          var pr2 = masc ? "hij" : (fem2 ? "zij" : "het");
          return finalize(pr2, verbNL, { pred: predTxt, neg: neg2, inv: inv, o: o, noNeg: false });
        }
        return finalize(subj, verbNL, { pred: predTxt, neg: neg2, inv: inv, o: o });
      }
      return null;
    }

    // Werkwoord van de tabel: rest bevat object, bijwoorden, infinitief
    var fronted = null, objTxt = null, inf = null, pp2 = [], k = 0;
    var toksR = restN;
    // Gustar / encantar
    if (false) return null;
    var useMogen = false;
    if (v === "tener" && toksR[0] === "permiso" && toksR[1] === "para") { toksR = toksR.slice(2); v = "poder"; spec = VERBS.poder; useMogen = true; }
    // Modaal of "ir a" + infinitief
    if (spec.modal || (v === "ir" && toksR[0] === "a")) {
      var target = (v === "ir") ? toksR.slice(1) : toksR;
      if (target[0] === "venir" && target[1] === "conmigo") {
        return finalize(subj, dutchVerb(v, p, inv), { pred: null, neg: neg, inv: inv, o: o, inf: "meekomen", obj: "met mij", modal: true });
      }
      var infTok = target[target.length - 1];
      var infFound = null;
      if (v === "ir") {
        // ir a + infinitief
        var infToken = target[0];
        if (infToken && VERB_INF[infToken] !== undefined) {
          var pre = target.slice(1, target.length - 0);
        }
      }
      // infinitief: laatste woord dat een werkwoord is
      var ii = findInfinitive(target);
      if (ii) {
        var objToks = target.slice(0, ii.idx);
        var rest2 = target.slice(ii.idx + 1);
        var objPart = null;
        if (objToks.length) {
          // "venir conmigo" etc.
          var op = phrase(objToks, 0, rev, gen);
          if (!op || op.end !== objToks.length) {
            if (objToks.length === 1 && objToks[0] === "conmigo") objPart = "met mij";
            else return null;
          } else objPart = op.s;
        }
        var infNL = ii.nl;
        // "ir a" + infinitief met bijwoord of persoonlijke a: de Nederlandse woordvolgorde is hier nog niet betrouwbaar.
        if (v === "ir" && (rest2.length || (toksR[1] === "a" && ii.idx === 0 && target.length > 1 && !objToks.length && target.length > ii.idx + 1))) return null;
        if (v === "ir") {
          return finalize(subj, dutchVerb("ir", p, inv), { pred: null, neg: neg, inv: inv, o: o, inf: infNL, adv: rest2.length ? (phrase(rest2, 0, rev, gen) || {}).s : null, front: null, o2: objPart });
        }
        if (v === "poder" || v === "querer" || v === "deber" || v === "deberia") {
          var mod = dutchVerb(useMogen ? "mogen" : v, p, inv, fv.past);
          var pieces = [];
          if (objPart) pieces.push(objPart);
          var restAdv = null;
          if (rest2.length && ADV[rest2[0]] === undefined && PREP[rest2[0]] === undefined) {
            var restNp = np(rest2, 0, rev, gen);
            if (restNp && restNp.end === rest2.length) { pieces.push(restNp.s); rest2 = []; }
          }
          if (rest2.length) restAdv = phrase(rest2, 0, rev, gen);
          if (rest2.length && (!restAdv || restAdv.end !== rest2.length)) return null;
          var objAll = pieces.length ? pieces.join(" ") : null, negM = neg;
          if (neg && objAll) {
            if (/^(een|wat|veel|weinig)\s/.test(objAll)) objAll = objAll.replace(/^(een|wat)\s/, "geen ");
            else if (/^(de|het|dit|dat|deze|die|mijn|jouw|je|zijn|haar|ons|onze|jullie|hun|u|uw|met|aan|van|naar|voor|bij|op|in)\s|^(dit|dat|hem|haar|ze|hen|ons|jullie|jou|je|het|mij|me|u)$/.test(objAll)) objAll = objAll + " niet";
            else objAll = "geen " + objAll;
            negM = false;
          }
          return finalize(subj, mod, { pred: null, neg: negM, inv: inv, o: o, inf: (v === "deberia" ? "moeten " : "") + infNL, obj: objAll, adv: restAdv ? restAdv.s : null, modal: true });
        }
      }
      if (v === "venir") return null;
    }
    if (v === "ir") {
      var goP = null;
      var goT = toksR;
      if (goT.length && (goT[0] === "a" || goT[0] === "al")) {
        if (goT.slice(1).some(function (t) { return /(ar|er|ir)$/.test(t) && t.length > 3; }) || findInfinitive(goT.slice(1))) return null;
        var goPl = phrase(goT, 0, rev, gen);
        if (goPl && goPl.end === goT.length) goP = goPl.s;
      } else if (goT.length === 0) goP = null;
      if (goP !== null) return finalize(subj, verbNL, { pred: goP, neg: neg, inv: inv, o: o });
      if (goT.length === 0) return finalize(subj, verbNL, { pred: null, neg: neg, inv: inv, o: o });
    }
    // tener que + infinitief ("tengo que trabajar")
    if (v === "tener" && toksR[0] === "que") {
      var ii2 = findInfinitive(toksR.slice(1));
      if (!ii2) return null;
      return finalize(subj, dutchVerb("deber", p, inv), { pred: null, neg: neg, inv: inv, o: o, inf: ii2.nl, modal: true });
    }
    // necesitar + naamgroep: "necesito ayuda" -> "heb hulp nodig"
    if (spec.need) {
      var nNp = np(toksR, 0, rev, gen);
      if (!nNp) return null;
      var nTail = tailOf(toksR.slice(nNp.end), rev, gen);
      if (nTail === null) return null;
      return finalize(subj, verbNL, { pred: "nodig", neg: neg, inv: inv, o: o, objDirect: nNp.s, tail: nTail });
    }
    // tener + naamgroep (bezit, honger, tijd) of "tengo X años"
    if (v === "tener") {
      if (toksR.length === 0) return null;
      // "tengo miedo del perro" = ik ben bang voor de hond
      if (nf(toksR[0] || "") === "miedo" && toksR.length >= 2) {
        var mA = apAanvulling(toksR, 1, rev, gen);
        if (mA && mA.prep === "de") return finalize(subj, dutchVerb("estar", p, inv, fv.past, false), { pred: "bang voor " + mA.s, neg: neg, inv: inv, o: o });
        return null;
      }
      if (toksR.length === 2 && toksR[1] === "años") {
        var nm = toksR[0];
        var nmBase = /^\d+$/.test(nm) ? nm : null;
        if (!nmBase && !NUMBER[nm]) return null;
        return finalize(subj, "ben", { pred: (NUMBER[nm] || nm) + " jaar", neg: neg, inv: inv, o: o });
      }
      var coord = splitY(toksR);
      if (coord) {
        var cparts = coord.map(function (c) { var cn = np(c, 0, rev, gen); return cn && cn.end === c.length ? cn.s : null; });
        if (cparts.indexOf(null) >= 0) return null;
        var joined = cparts.join(" en ");
        if (neg) joined = joined.replace(/^(een|de|het) /, "geen ");
        return finalize(subj, verbNL, { neg: false, inv: inv, o: o, objDirect: neg ? "geen " + joined.replace(/^geen /, "") : joined });
      }
      var tg = np(toksR, 0, rev, gen);
      if (tg && tg.end < toksR.length) {
        var tgTail = tailOf(toksR.slice(tg.end), rev, gen);
        if (tgTail === null) return null;
        var tgObj = neg ? "geen " + tg.s.replace(/^(een|de|het|mijn|je|onze|ons|veel) /, "") : tg.s;
        return finalize(subj, verbNL, { neg: false, inv: inv, o: o, objDirect: tgObj, tail: tgTail });
      }
      if (tg && tg.end === toksR.length) {
        var objNl = tg.s;
        if (neg) {
          // geen + zelfstandig naamwoord
          var bare = tg.s.replace(/^(een|de|het|mijn|je|onze|ons|veel|twee|drie|vier|vijf|zes|zeven|acht|negen|tien) /, "");
          return finalize(subj, verbNL, { pred: null, neg: false, inv: inv, o: o, objDirect: "geen " + bare });
        }
        return finalize(subj, verbNL, { pred: null, neg: false, inv: inv, o: o, objDirect: objNl });
      }
      // "tengo hambre / tengo frío / tengo sed" (bloot naamwoord zonder lidwoord)
      if (toksR.length === 1) {
        var hb = nf(toksR[0]);
        var HAB = { hambre: "honger", sed: "dorst", frio: "koud", calor: "warm", tiempo: "tijd", razon: "gelijk" };
        if (HAB[hb]) {
          if (hb === "frio" || hb === "calor") return null;
          if (neg) return finalize(subj, verbNL, { pred: null, neg: false, inv: inv, o: o, objDirect: "geen " + HAB[hb] });
          return finalize(subj, verbNL, { pred: null, neg: false, inv: inv, o: o, objDirect: HAB[hb] });
        }
      }
      return null;
    }
    // Gustar en encantar: "me gusta / me encanta" + infinitief of naamwoord
    if (o.gusta) return null;
    // Algemene werkwoorden met een object of bijwoord
    var ph = toksR.length ? toksR : [];
    if (ph[0] === "a" && ph.length > 1 && /^(ver|ayudar|escuchar|entender|buscar|esperar|llamar)$/.test(v)) ph = ph.slice(1);
    var objDir = null, advs = [], j = 0, negObj = false;
    if (ph.length === 0) return finalize(subj, verbNL, { pred: null, neg: neg, inv: inv, o: o, tail: ppTxt });
    // Object: een naamgroep direct na het werkwoord
    var npO = np(ph, 0, rev, gen);
    var consumed = 0;
    if (npO) { objDir = npO.s; consumed = npO.end; }
    var restTail = ph.slice(consumed);
    var tailTxt = [];
    for (var q = 0; q < restTail.length;) {
      var pr3 = phrase(restTail, q, rev, gen);
      if (!pr3) return null;
      tailTxt.push(pr3.s);
      q = pr3.end;
    }
    var tailJoined = tailTxt.concat(ppTxt ? [ppTxt] : []).join(" ");
    var neg3 = neg;
    if (objDir && neg3) {
      var isDef = /^(de|het|mijn|je|onze|ons) /.test(objDir) || /^(me|mij|je|jou|hem|haar|het|ons|ze|hen|jullie|u|dit|dat)$/.test(objDir);
      if (!isDef) {
        objDir = "geen " + objDir.replace(/^(een) /, "");
        neg3 = false;
      }
    }
    return finalize(subj, verbNL, { pred: null, neg: neg3, inv: inv, o: o, objDirect: objDir, tail: tailJoined });
  }

  // Zinsdeel na het werkwoord: bijwoorden en voorzetselgroepen, samengevoegd. null bij onbekende woorden.
  function tailOf(toks, rev, gen) {
    var out = [];
    for (var q = 0; q < toks.length;) {
      var pr = phrase(toks, q, rev, gen);
      if (!pr) return null;
      out.push(pr.s);
      q = pr.end;
    }
    return out.join(" ");
  }
  // "A y B": splits de naamgroepen op "y"
  function splitY(toks) {
    if (toks.indexOf("y") < 0) return null;
    var parts = [], cur = [];
    toks.forEach(function (t) { if (t === "y") { parts.push(cur); cur = []; } else cur.push(t); });
    parts.push(cur);
    return parts.every(function (c) { return c.length; }) ? parts : null;
  }

  var NUMBER = { dos: "twee", tres: "drie", cuatro: "vier", cinco: "vijf", seis: "zes", siete: "zeven", ocho: "acht", nueve: "negen", diez: "tien" };
  var VERB_INF = {};

  // Vind het infinitief in een zin (het werkwoord dat de werkwoordsvorm van de tabel uit de infinitief-lijst is)
  var INF_ES = {};
  Object.keys(VERBS).forEach(function (k) { INF_ES[k] = true; });
  var INF_MAP = { hablar: 1, trabajar: 1, estudiar: 1, comer: 1, beber: 1, cocinar: 1, leer: 1, ver: 1, venir: 1, hacer: 1,
    decir: 1, ayudar: 1, escuchar: 1, saber: 1, entender: 1, aprender: 1, mirar: 1, jugar: 1, vivir: 1, ir: 1, tener: 1,
    ser: 1, estar: 1, costar: 1, comprar: 1, buscar: 1, escribir: 1, dormir: 1, pagar: 1, tomar: 1, abrir: 1 };
  function findInfinitive(toks) {
    for (var i = toks.length - 1; i >= 0; i--) {
      var k = nf(toks[i]);
      if (INF_MAP[k]) return { idx: i, nl: VERBS[k] ? VERBS[k].inf : null, v: k };
    }
    return null;
  }

  // Zet de zin in elkaar. d = { pred, neg, inv, o, objDirect, tail, inf, obj, adv }
  function finalize(subj, verbNL, d) {
    var o = d.o || {};
    var inv = !!d.inv;
    var neg = !!d.neg;
    var front = o.front || null;
    var adv = d.adv || null;
    var objD = d.objDirect || d.obj || null;
    var pred = d.pred || null;
    var infT = d.inf || null;
    var tail = d.tail || null;
    var sb = subj || "";
    if (inv) {
      var seq = [verbNL, sb];
      if (objD) seq.push(objD);
      // ontkenning: "geen" zit al in het voorwerp; anders "niet" na het voorwerp ("Ken je haar niet?")
      if (neg && (!objD || !/^geen\b/.test(objD))) seq.push("niet");
      if (pred) seq.push(pred);
      // met een hulpwerkwoord staat de infinitief achteraan: "Wil je naar Mexico gaan?"
      if (d.modal && infT && /^\S+$/.test(infT) && (tail || adv)) { if (tail) seq.push(tail); if (adv) seq.push(adv); seq.push(infT); }
      else {
        if (infT) seq.push(infT);
        if (tail) seq.push(tail);
        if (adv) seq.push(adv);
      }
      var q = seq.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      if (o.qw) q = o.qw + " " + q;
      return q;
    }
    var parts = [];
    if (front) { parts.push(front, verbNL); if (sb) parts.push(sb); }
    else { if (sb) parts.push(sb); parts.push(verbNL); }
    if (objD) parts.push(objD);
    // een tijd staat vóór "niet": "Ik kan vandaag niet komen"
    var TIJD_NL = /^(vandaag|morgen|gisteren|nu|vanavond|vanmiddag|vanochtend|overmorgen|deze week|dit jaar|volgende week|vorige week|volgend jaar|vorig jaar)$/;
    if (neg && d.modal && adv && TIJD_NL.test(adv) && infT) { parts.push(adv); adv = null; }
    if (neg && (!objD || !/^geen\b/.test(objD))) parts.push("niet");
    if (pred) parts.push(pred);
    if (d.modal && infT && /^\S+$/.test(infT) && (tail || adv)) { if (tail) parts.push(tail); if (adv) parts.push(adv); parts.push(infT); }
    else {
      if (infT) parts.push(infT);
      if (tail) parts.push(tail);
      if (adv) parts.push(adv);
    }
    var s2 = parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
    if (!s2) return null;
    return s2 + ".";
  }

  // (hulpfunctie) zin-opbouw voor "soy de X": gebruikt de vaste zinsvorm
  function sentence(subj, a, b, c, d, o) {
    var verb = d.verbs;
    var neg = !!d.neg;
    var parts = [subj || "", verb || "", neg ? "niet" : "", d.tail || ""].filter(Boolean);
    return parts.join(" ").replace(/\s+/g, " ").trim() + ".";
  }

  // Schil om translate(): tijdsbepaling aan het eind gaat in het Nederlands naar voren
  // ("Voy a la playa mañana." -> "Morgen ga ik naar het strand."), en namen van talen krijgen de juiste vorm.
  var TAAL_NL = { espanol: "Spaans", ingles: "Engels", aleman: "Duits", frances: "Frans", holandes: "Nederlands", neerlandes: "Nederlands", italiano: "Italiaans" };
  // Tijden aan het eind van de zin: "a las once y media" = "om half twaalf", "a las doce menos cuarto" = "om kwart voor twaalf"
  var ES_HOUR = { una: 1, un: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12 };
  var NL_HOUR = ["", "één", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien", "elf", "twaalf"];
  var ES_TIME_END = /\s+a\s+(?:las|la)\s+(una|un|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce)(?:\s+(y media|y cuarto|menos cuarto|y cinco|y diez|menos cinco|menos diez))?\s*[.!]?$/i;
  function nlClock(hw, min) {
    var H = ES_HOUR[hw.toLowerCase()];
    if (!min) return "om " + NL_HOUR[H] + " uur";
    var nx = H % 12 + 1;
    if (min === "y media") return "om half " + NL_HOUR[nx];
    if (min === "y cuarto") return "om kwart over " + NL_HOUR[H];
    if (min === "menos cuarto") return "om kwart voor " + NL_HOUR[H];
    if (min === "y cinco") return "om vijf over " + NL_HOUR[H];
    if (min === "y diez") return "om tien over " + NL_HOUR[H];
    if (min === "menos cinco") return "om vijf voor " + NL_HOUR[H];
    if (min === "menos diez") return "om tien voor " + NL_HOUR[H];
    return null;
  }
  // Losse getallen (0-99) als woord: de vertaler kent "doce", niet "12". Tijden met een dubbele punt (12:30) blijven staan.
  var ES_GETAL = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
    "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
  var ES_TIEN = ["", "", "", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  function getalEs(n) {
    if (n < 30) return ES_GETAL[n];
    var e = n % 10, t = ES_TIEN[Math.floor(n / 10)];
    return e ? t + " y " + ES_GETAL[e] : t;
  }
  function cijfersEs(text) {
    var s = String(text).replace(/\ba las 1(?![\d:.,]\d)\b/gi, "a la una");
    return s.replace(/(^|[^\d:.,])(\d{1,2})(?![\d:.,]\d)/g, function (m0, voor, d) { return voor + getalEs(parseInt(d, 10)); });
  }
  function translateNL(text, rev, gen) {
    if (typeof text === "string" && /\d/.test(text)) text = cijfersEs(text);
    // "en casa" = thuis; "en casa de mi madre" = bij mijn moeder thuis (de vertaler zelf maakt er "in huis" van)
    if (typeof text === "string" && /\ben casa\b/i.test(text) && !arguments[4]) {
      var rC = translateNL(text, rev, gen, arguments[3], true);
      if (!rC) return rC;
      rC = rC.replace(/\bin huis van ((?:mijn|je|jouw|zijn|haar|onze|ons|hun|jullie|de|het|een) [^ .?!,]+)/, "bij $1 thuis");
      return rC.replace(/\bin (het )?huis\b(?! van)/, "thuis");
    }
    // "hasta las cinco" = tot vijf uur: vertaal als "a las cinco" (om vijf uur) en maak van "om" daarna "tot"
    if (typeof text === "string" && /\bhasta (la|las)\b/i.test(text) && !arguments[3]) {
      var rH = translateNL(text.replace(/\bhasta (la|las)\b/i, "a $1"), rev, gen, true, arguments[4]);
      return rH && /\bom\b/.test(rH) ? rH.replace(/\bom\b/, "tot") : null;
    }
    var raw = String(text || "").trim();
    // "llega tarde" / "llego tarde": tarde na een werkwoord is "laat" (niet "de middag")
    raw = raw.replace(/\b(llego|llegas|llega|llegamos|llegan|llegó|llegué|llegaste|llegaron|voy|vas|va|vamos|van) tarde\b/gi, "$1 tardelaat");
    // Tijdsbepalingen van meer woorden worden één woord (zie ADV)
    raw = raw.replace(/\btodo el d[ií]a\b/gi, "todoeldia").replace(/\bla semana pasada\b/gi, "semanapasada").replace(/\bel a[ñn]o pasado\b/gi, "anopasado")
      .replace(/\bla semana que viene\b/gi, "semanaqueviene").replace(/\bel a[ñn]o que viene\b/gi, "anoqueviene").replace(/\bel mes pasado\b/gi, "mespasado")
      .replace(/\bel mes que viene\b/gi, "mesqueviene").replace(/\besta semana\b/gi, "estasemana").replace(/\beste a[ñn]o\b/gi, "esteano").replace(/\bpasado ma[ñn]ana\b/gi, "pasadomanana")
      .replace(/\besta noche\b/gi, "estanoche").replace(/\besta ma[ñn]ana\b/gi, "estamanana").replace(/\besta tarde\b/gi, "estatarde").replace(/\ben este momento\b/gi, "enestemomento")
      // "hermanos o hermanas" = broers of zussen (niet "broers en zussen of zussen")
      .replace(/\bhermanos o hermanas\b/gi, "hermanos");
    // Tijd vooraan ("La semana pasada trabajé mucho"): achteraan zetten, de Nederlandse zin wordt er niet anders van
    // "Puedo ayudarte" = "te puedo ayudar": het voornaamwoord aan de infinitief gaat vóór het hulpwerkwoord ("Ik kan je helpen")
    raw = raw.replace(/\b(quiero|quieres|quiere|queremos|quieren|puedo|puedes|puede|podemos|pueden|debo|debes|debe|necesito|necesitas|necesita)\s+([a-záéíóúñ]+?(?:ar|er|ir))(me|te|lo|la|nos|los|las)\b/gi, function (m0, mv, inf, cl) { return cl + " " + mv + " " + inf; });
    // "me voy de vacaciones" = ik ga op vakantie (niet "weg")
    raw = raw.replace(/\b(?:me|te|se|nos)\s+(voy|vas|va|vamos|van)\s+de vacaciones\b/gi, "$1 de vacaciones");
    // "hasta tarde" = tot laat; "desde hace un año" = al een jaar
    raw = raw.replace(/\bhasta tarde\b/gi, "hastatarde").replace(/\bdesde hace (un|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|mucho) (a[ñn]os?|mes|meses|semanas?|d[ií]as?|tiempo)\b/gi, function (m0, n, u) {
      return "dh" + nf(n) + nf(u).replace(/(es|s)$/, "").replace(/^ano$/, "ano");
    });
    // Tijd vooraan ("La semana pasada trabajé mucho"): direct na het werkwoord zetten, zoals in het Nederlands ("Ik werkte vorige week veel")
    raw = raw.replace(/^\s*(semanapasada|anopasado|mespasado|semanaqueviene|anoqueviene|mesqueviene|estasemana|esteano|todoeldia|estanoche|estamanana|estatarde|pasadomanana|anteayer),?\s+([^¿?]+?)\s*([.!]?)\s*$/i, function (m0, t, rest, end) {
      var w = rest.split(/\s+/), k = /^(no|me|te|se|lo|la|le|nos|los|las|les)$/i.test(w[0]) ? (/^(no)$/i.test(w[0]) && /^(me|te|se|lo|la|le|nos|los|las|les)$/i.test(w[1] || "") ? 3 : 2) : 1;
      if (w.length <= k) return rest + " " + t + end;
      return w.slice(0, k).concat([t], w.slice(k)).join(" ") + end;
    });
    // "El pan está fresco": bij eten is fresco "vers", niet "fris"
    raw = raw.replace(/\b(pan|pescado|fruta|frutas|leche|carne|verdura|verduras|huevos?|queso|pescados)\s+(es|está|esta|son|están|estan)\s+(muy\s+)?fresc(o|a|os|as)\b/gi, "$1 $2 $3frescovers");
    // Weer: "llovió ayer" = het regende gisteren, "ha llovido todo el día" = het heeft de hele dag geregend
    var wr = /^\s*(?:(ayer|hoy|ma[ñn]ana|semanapasada|todoeldia)\s+)?(no\s+)?(llueve|llovi[oó]|ha llovido|nieva|nev[oó]|ha nevado|va a llover|va a nevar)((?:\s+(?:mucho|ayer|hoy|ma[ñn]ana|semanapasada|todoeldia))*)\s*[.!]?\s*$/i.exec(raw);
    if (wr) {
      var wv = nf(wr[3].replace(/\s+/g, " ")), WNL = { llueve: ["regent"], llovio: ["regende"], "ha llovido": ["heeft", "geregend"], nieva: ["sneeuwt"], nevo: ["sneeuwde"], "ha nevado": ["heeft", "gesneeuwd"], "va a llover": ["gaat", "regenen"], "va a nevar": ["gaat", "sneeuwen"] }[wv];
      var wx = ((wr[1] ? wr[1] + " " : "") + (wr[4] || "")).trim().split(/\s+/).filter(Boolean).map(function (x) { return x === "mucho" ? "veel" : ADV[nf(x)]; });
      if (WNL && wx.indexOf(undefined) < 0) {
        var wz = "Het " + WNL[0] + (wx.length ? " " + wx.join(" ") : "") + (wr[2] ? " niet" : "") + (WNL[1] ? " " + WNL[1] : "") + ".";
        return wz;
      }
    }
    // "¿Cuándo cierra la tienda?" / "¿A qué hora abre el museo?": onderwerp na een onovergankelijk werkwoord
    var vsq = /^\s*¿\s*(cu[aá]ndo|a qu[eé] hora|d[oó]nde)\s+(abre|abren|cierra|cierran|sale|salen|llega|llegan|empieza|empiezan|comienza|comienzan|termina|terminan|acaba|acaban|parte|parten)\s+((?:el|la|los|las)\s+[^\s?]+)\s*\?\s*$/i.exec(raw);
    if (vsq) {
      var vsS = np(vsq[3].toLowerCase().split(/\s+/), 0, rev, gen) || np(vsq[3].toLowerCase().split(/\s+/).map(nf), 0, rev, gen);
      var mv = /n$/.test(vsq[2]), vk = nf(vsq[2]).replace(/n$/, "");
      var VSV = { abre: [mv ? "gaan" : "gaat", "open"], cierra: [mv ? "gaan" : "gaat", "dicht"], sale: [mv ? "vertrekken" : "vertrekt"], parte: [mv ? "vertrekken" : "vertrekt"], llega: [mv ? "komen" : "komt", "aan"], empieza: [mv ? "beginnen" : "begint"], comienza: [mv ? "beginnen" : "begint"], termina: [mv ? "eindigen" : "eindigt"], acaba: [mv ? "eindigen" : "eindigt"] }[vk];
      var vsW = { cuando: "Wanneer", "a que hora": "Hoe laat", donde: "Waar" }[nf(vsq[1]).replace(/\s+/g, " ")];
      if (vsS && vsS.end === 2 && VSV && vsW) return vsW + " " + VSV[0] + " " + vsS.s + (VSV[1] ? " " + VSV[1] : "") + "?";
    }
    // Vervoermiddelen vertrekken: "el autobús sale" = "de bus vertrekt"
    raw = raw.replace(/^((?:el|la|los|las)\s+(?:autob[uú]s|autobuses|tren|trenes|avi[oó]n|aviones|metro|barco|tranv[ií]a)\s+)sale\b/i, "$1parte");
    // "el autobús se va" (zo komen "le bus part" en "the bus leaves" binnen) is ook: de bus vertrekt
    raw = raw.replace(/^((?:el|la|los|las)\s+(?:autob[uú]s|autobuses|tren|trenes|avi[oó]n|aviones|metro|barco|tranv[ií]a)\s+)se (va|van)\b/i, function (m0, s1, v) { return s1 + (v.toLowerCase() === "van" ? "parten" : "parte"); });
    // Wederkerende werkwoorden: "me levanto" -> "melevanto" (zie VERBS, refl)
    raw = raw.replace(/(^|[\s¿¡])(me|te|se|nos) ([a-záéíóúñ]+)/gi, function (m0, voor, cl, vf) {
      var j = (cl + vf).toLowerCase();
      for (var k in VERBS) if (VERBS[k].refl && VERBS[k].es.indexOf(j) >= 0) return voor + j;
      return m0;
    });
    var isQ = /\?/.test(raw) || /^¿/.test(raw);
    var tm = ES_TIME_END.exec(raw);
    if (tm && !isQ) {
      var tt = nlClock(tm[1], (tm[2] || "").toLowerCase());
      var head = raw.slice(0, tm.index).trim();
      var base = tt && head ? translate(head + ".", normRev(rev), gen) : null;
      if (!base) return null;
      // Scheidbaar deel ("komt ... aan") blijft achteraan: "De trein komt om acht uur aan."
      var prts = Object.keys(VERBS).map(function (k) { return VERBS[k].prt; }).filter(Boolean);
      var bm = new RegExp("^(.*) (" + prts.join("|") + ")\\.$").exec(base);
      if (prts.length && bm) return bm[1] + " " + tt + " " + bm[2] + ".";
      return base.replace(/\.$/, "") + " " + tt + ".";
    }
    if (isQ && /\s(hoy|mañana|ayer|ahora)\s*\?\s*$/i.test(raw)) return null;
    // "No hablo alemán" = "Ik spreek geen Duits"
    var geenTaal = false;
    if (/(^|\s)no\s+(hablo|hablas|habla|hablamos|hablan|aprendo|estudio|entiendo|entiendes|entiende)\s+(un poco de\s+)?(español|inglés|alemán|francés|holandés|neerlandés|italiano)\b/i.test(raw)) {
      if (/un poco de/i.test(raw)) return null;
      raw = raw.replace(/(^|\s|¿)no\s+/i, "$1"); geenTaal = true;
    }
    var TAAL_RE = /\b(hablo|hablas|habla|hablamos|hablan|aprendo|aprendes|aprende|aprendemos|aprenden|estudio|estudias|estudia|estudiamos|estudian|entiendo|entiendes|entiende)\s+(un poco de\s+)?(español|inglés|alemán|francés|holandés|neerlandés|italiano)\b/i;
    var m = /^(.*\S)\s+(hoy|mañana|ayer|ahora)\s*([.!]?)$/i.exec(raw);
    if (m && !/^(hoy|mañana|ayer|ahora)\b/i.test(raw) && !TAAL_RE.test(raw)) {
      if (isQ) return null;
      var head = m[1].replace(/,\s*$/, "");
      if (/^(s[ií]|no)\s*,/i.test(head)) return null;
      var fronted = m[2].charAt(0).toUpperCase() + m[2].slice(1).toLowerCase() + " " + head.charAt(0).toLowerCase() + head.slice(1) + ".";
      var fo = translate(fronted, rev, gen);
      if (fo) return fo;
      if (!/^no\s/i.test(raw)) return null;      // "Ik heb geen tijd vandaag." mag; anders hoort de tijd vooraan
    }
    // talen als lijdend voorwerp: "hablo español", "aprendo un poco de inglés"
    var lang = /\b(hablo|hablas|habla|hablamos|hablan|aprendo|aprendes|aprende|aprendemos|aprenden|estudio|estudias|estudia|estudiamos|estudian|entiendo|entiendes|entiende)\s+(un poco de\s+)?(español|inglés|alemán|francés|holandés|neerlandés|italiano)\b/i.exec(raw);
    var out;
    if (lang) {
      var stripped = raw.replace(lang[0], lang[1]);
      out = translate(stripped, rev, gen);
      if (!out) return null;
      var nm = TAAL_NL[nf(lang[3])], add = (geenTaal ? "geen " : "") + (lang[2] ? "een beetje " : "") + nm;
      var w = out.replace(/[.?!]$/, "").split(" "), endP = /[.?!]$/.exec(out);
      // direct na de persoonsvorm en het onderwerp: "Ik spreek Spaans", "Spreek je Spaans?", "Morgen leer ik Spaans"
      var pos = /^(ik|je|jij|hij|zij|we|wij|u)$/i.test(w[0]) ? 2 : (/^(ik|je|jij|hij|zij|we|wij|u)$/i.test(w[1] || "") ? 2 : (/^(ik|je|jij|hij|zij|we|wij|u)$/i.test(w[2] || "") ? 3 : -1));
      if (pos < 0) return null;
      // tijd direct na het onderwerp blijft voor de taal: "Ik leer nu Spaans"
      if (/^(nu|vandaag|morgen|gisteren)$/i.test(w[pos] || "")) pos++;
      else if (/^al$/i.test(w[pos] || "") && /^(lang)$/i.test(w[pos + 1] || "")) pos += 2;
      else if (/^al$/i.test(w[pos] || "") && /^(jaar|maand|maanden|week|weken)$/i.test(w[pos + 2] || "")) pos += 3;
      if (geenTaal && w.slice(pos).some(function (x) { return /^niet$/i.test(x); })) return null;
      w.splice(pos, 0, add);
      return w.join(" ") + (endP ? endP[0] : ".");
    }
    out = translate(raw, rev, gen);
    // tijd voor "veel/weinig": "Ik werkte vorige week veel"
    if (out) out = out.replace(/\b(veel|weinig|hard|lang) (vorige week|vorig jaar|vorige maand|volgende week|volgend jaar|vandaag|gisteren|morgen|de hele dag|deze week|dit jaar)([.?!]?)$/i, "$2 $1$3");
    if (out && /spanjaard|een weinig van/i.test(out) && /\b(un poco de|español)\b/i.test(raw) && !/\b(soy|eres|es|somos|son)\s+español/i.test(raw)) return null;
    return out;
  }
  // "ik kom naar huis terug" -> "ik kom terug naar huis" (zo zeg je het)
  // Gebiedende wijs: "¡Habla despacio!" / "Habla despacio, por favor." (zonder onderwerp) = "Spreek langzaam!".
  // De tú-vorm van het verzoek is gelijk aan de hij/zij-vorm; we vertalen de zin met "ik" en laten "Ik" weg (spreek, kom terug, loop).
  function gebiedend(text, rev, gen) {
    var t = String(text || "").trim();
    var uitroep = /^¡/.test(t) || /!\s*$/.test(t), pf = /,?\s*por favor\s*[.!]?\s*$/i.test(t);
    if (!uitroep && !pf) return null;
    var kern = t.replace(/^¡\s*/, "").replace(/,?\s*por favor\s*[.!]?\s*$/i, "").replace(/\s*[.!]+\s*$/, "").trim();
    var w = kern.split(/\s+/), v0 = (w[0] || "").toLowerCase(), hit = null;
    if (!kern || /[?¿]/.test(kern)) return null;
    // onregelmatige verzoekvormen: ven = kom, ve = ga, haz = doe, pon = zet, sal = ga naar buiten, di = zeg, ten = heb
    var IRR = { ven: "vengo", ve: "voy", haz: "hago", pon: "pongo", sal: "salgo", di: "digo", ten: "tengo" };
    var ik1 = null;
    if (IRR[v0]) ik1 = IRR[v0];
    else { for (var k in VERBS) { var e = VERBS[k]; if (e.es && e.es[2] === v0 && !e.refl) { hit = e; break; } } if (hit) ik1 = hit.es[0]; }
    if (!ik1) return null;
    var ik = translateNL(cap1(ik1) + (w.length > 1 ? " " + w.slice(1).join(" ") : "") + ".", rev, gen);
    if (typeof ik !== "string" || !/^Ik /.test(ik)) return null;
    var imp = ik.replace(/^Ik /, "").replace(/\s*[.!?]+\s*$/, "");
    imp = imp.charAt(0).toUpperCase() + imp.slice(1);
    return pf ? imp + ", alsjeblieft" + (uitroep ? "!" : ".") : imp + "!";
  }
  // Terugval als de zin als geheel niet lukt. Elke stap maakt een eenvoudiger zin die wel lukt en zet het verschil er daarna weer in.
  var VZ_NA = /^(naar|in|op|met|bij|thuis|om|uit|van|aan|voor|op|morgen|vandaag|gisteren|vaak|veel|graag|hier|daar)$/;
  var MODAAL = { quiero: ["wil", 0], quieres: ["wilt", 1], quiere: ["wil", 2], queremos: ["willen", 3], quieren: ["willen", 4],
    puedo: ["kan", 0], puedes: ["kunt", 1], puede: ["kan", 2], podemos: ["kunnen", 3], pueden: ["kunnen", 4],
    debo: ["moet", 0], debes: ["moet", 1], debe: ["moet", 2], debemos: ["moeten", 3], deben: ["moeten", 4] };
  function terugval(text, rev, gen, diepte) {
    var t = String(text).trim(), punt = /\?\s*$/.test(t) ? "?" : ".", body = t.replace(/^[¿¡]/, "").replace(/\s*[.!?]+\s*$/, "");
    if (punt === "?") return null;
    var T = function (x) { var r0 = translateNLTerug(x, rev, gen, diepte); return typeof r0 === "string" ? r0 : null; };
    var m;
    // 0. "los domingos" vooraan: achteraan zetten ("Los domingos como en casa" -> "Ik eet thuis op zondag")
    if ((m = /^(los (?:lunes|martes|miércoles|jueves|viernes|sábados|domingos))\s*,?\s+(.+)$/i.exec(body))) {
      var dg = T(cap1(m[2]) + " " + m[1].toLowerCase() + ".");
      if (dg) return dg;
    }
    // 0b. "me preocupo por X" = "ik maak me zorgen over X"
    if ((m = /^(me preocupo|te preocupas|se preocupa|nos preocupamos|se preocupan)\s+por\s+(.+)$/i.exec(body))) {
      var zx = T("Veo " + m[2] + ".");
      if (zx && /^Ik zie /.test(zx)) return { "me preocupo": "Ik maak me", "te preocupas": "Je maakt je", "se preocupa": "Hij/zij maakt zich", "nos preocupamos": "We maken ons", "se preocupan": "Ze maken zich" }[m[1].toLowerCase()] + " zorgen over " + zx.replace(/^Ik zie /, "");
    }
    // 1. ontkenning: de zin zonder "no" vertalen en "niet"/"geen" zelf zetten ("Ella no fue al mercado" -> "Zij ging niet naar de markt")
    if ((m = /^((?:yo|tú|él|ella|nosotros|nosotras|ellos|ellas)\s+)?no\s+(.+)$/i.exec(body))) {
      var pos = T((m[1] || "") + m[2] + ".");
      if (pos) {
        var w = pos.replace(/\.$/, "").split(" ");
        if (w.length >= 3 && w[2] === "een") { w[2] = "geen"; return w.join(" ") + "."; }
        if (w.length >= 3 && VZ_NA.test(w[2])) { w.splice(2, 0, "niet"); return w.join(" ") + "."; }
        if (w.length >= 4 && /^(wil|wilt|willen|kan|kunt|kunnen|moet|moeten|mag|mogen)$/.test(w[1])) { w.splice(2, 0, "niet"); return w.join(" ") + "."; }
        if (w.length === 2) return w.join(" ") + " niet.";
      }
    }
    // 2. "más" + zelfstandig naamwoord: "aprendo más español" -> "ik leer meer Spaans"
    if ((m = /^(.*\S)\s+más\s+(\S+)$/i.exec(body)) && !/\b(quiero|quieres|quiere|queremos|quieren|puedo|puedes|puede|podemos|pueden|debo|debes|debe|debemos|deben)\s+\S+[aei]r\b/i.test(body)) {
      var zm = T(m[1] + " " + m[2] + ".");
      if (zm && /\S+\.$/.test(zm)) return zm.replace(/(\S+)\.$/, "meer $1.");
    }
    // 3. modaal werkwoord + infinitief: "quiero aprender español" -> "Ik leer Spaans" -> "Ik wil Spaans leren"
    if ((m = /^(?:(yo|tú|él|ella|nosotros|ellos)\s+)?(quiero|quieres|quiere|queremos|quieren|puedo|puedes|puede|podemos|pueden|debo|debes|debe|debemos|deben)\s+([a-záéíóú]+[aei]r)\s*(.*)$/i.exec(body))) {
      var md = MODAAL[m[2].toLowerCase()], inf = m[3].toLowerCase(), e = null;
      for (var k in VERBS) if (k === inf) e = VERBS[k];
      if (e && e.es && e.inf && !e.refl && !e.prt) {
        var ik = T(cap1(e.es[0]) + (m[4] ? " " + m[4] : "") + ".");
        var pre = "Ik " + e.d[0] + " ";
        if (ik && ik.indexOf(pre) === 0) {
          var rest = ik.slice(pre.length).replace(/\.$/, "");
          var subj = ["Ik", "Je", m[1] && m[1].toLowerCase() === "ella" ? "Zij" : (m[1] ? "Hij" : "Hij/zij"), "We", "Zij"][md[1]];
          return subj + " " + md[0] + " " + rest + " " + e.inf + ".";
        }
      }
    }
    return null;
  }
  function cap1(x) { return x.charAt(0).toUpperCase() + x.slice(1); }

  // Vaste woordgroepen die de woord-voor-woord-vertaling verkeerd doet (zelfde regels als bij Zin bouwen in app.js)
  function nlNazorg(r) {
    if (typeof r !== "string") return r;
    return r.replace(/\bboodschappen haar\b/g, "boodschappen").replace(/\b(doe|doet|doen) (de )?boodschappen\b/g, "$1 boodschappen")
      .replace(/\b(doe|doet|doen) (het )?avondeten\b/g, function (m0, v) { return { doe: "maak", doet: "maakt", doen: "maken" }[v] + " het avondeten"; })
      .replace(/\b(niet |geen )?sinds huis\b/g, function (m0, n) { return (n ? "niet " : "") + "vanuit huis"; })
      .replace(/\b(niet |geen )?van vakanties?\b/g, function (m0, n) { return (n ? "niet " : "") + "op vakantie"; })
      .replace(/\b(doe|doet|doen) (een )?pauze\b/g, function (m0, v) { return { doe: "neem", doet: "neemt", doen: "nemen" }[v] + " een pauze"; })
      .replace(/\b(gratis tijd|tijd vrij)\b/g, "vrije tijd")
      // "geen" hoort alleen voor een zelfstandig naamwoord; voor een voorzetsel of werkwoord is het "niet"
      .replace(/\b(wil|wilt|willen|kan|kunt|kunnen|moet|moeten|mag|mogen) geen (\w+en)(?=[.!?]?$)/, "$1 niet $2")
      .replace(/\b(doe|doet|doen) een lijstje van boodschappen\b/g, function (m0, v) { return { doe: "maak", doet: "maakt", doen: "maken" }[v] + " een boodschappenlijstje"; })
      .replace(/\blijstje van boodschappen\b/g, "boodschappenlijstje")
      // tijdsbepalingen: "todos los días" = elke dag, "cada semana" = elke week, "los domingos" = op zondag
      .replace(/\balles?en de (dagen|weken|maanden|ochtenden|middagen|avonden)\b/gi, function (m0, w) { return "elke " + { dagen: "dag", weken: "week", maanden: "maand", ochtenden: "ochtend", middagen: "middag", avonden: "avond" }[w.toLowerCase()]; })
      .replace(/\belk (dag|week|maand|ochtend|middag|avond|keer)\b/g, "elke $1")
      .replace(/\bde (maandag|dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag)en\b/g, "op $1")
      .replace(/\bin fiets\b/g, "op de fiets").replace(/\been post\b/g, "een mail")
      .replace(/\bgeen (?=(met|naar|in|op|bij|thuis|vanuit|van|voor|om|wil|wilt|willen|kan|kunt|kunnen|moet|moeten|mag|mogen|ga|gaat|gaan|ging|gingen)\b)/g, "niet ");
  }
  // Voorzetsel + voornaamwoord ("con él", "para ti", "sin ellos"): eerst met een vaste plaatsnaam vertalen, dan het
  // Nederlandse voornaamwoord terugzetten. Zo wordt het nooit "met zij" of "met hun".
  var VZ_PRON = /\b(con|para|sin|de|sobre|a)\s+(él|ella|ellos|ellas|mí|ti|nosotros|nosotras|ustedes|vosotros|usted)\b/i;
  var VZ_PRON_NL = { "él": "hem", ella: "haar", ellos: "hen", ellas: "hen", "mí": "mij", ti: "jou", nosotros: "ons", nosotras: "ons", ustedes: "jullie", vosotros: "jullie", usted: "u" };
  function metVoornaamwoord(text, rev, gen) {
    if (typeof text !== "string") return undefined;
    var t = text.replace(/\bconmigo\b/gi, "con mí").replace(/\bcontigo\b/gi, "con ti");
    var m = VZ_PRON.exec(t);
    if (!m || (t.match(new RegExp(VZ_PRON.source, "gi")) || []).length > 1) return undefined;
    if (m[1].toLowerCase() === "a") return undefined;   // "a él le gusta": eigen regels
    var r = translateNLTerugBasisKern(t.replace(VZ_PRON, "$1 Madrid"), rev, gen);
    if (typeof r !== "string" || (r.match(/\bMadrid\b/g) || []).length !== 1) return null;
    return r.replace(/\bMadrid\b/, VZ_PRON_NL[m[2].toLowerCase()]);
  }
  // "Ik hou van voetbal" (stofnaam/activiteit zonder lidwoord), maar "Ik hou van het strand"
  var STOF_NL = /^(de|het) (voetbal|muziek|koffie|thee|chocolade|sport|kunst|natuur|wijn|bier|kaas|vis|vlees|fruit|pasta|rijst|soep|geschiedenis|politiek|mode|dans|tennis|basketbal|zwemmen|lezen|koken|reizen)$/;
  function vanZonderLidwoord(np0, esToks) {
    // algemeen meervoud: "me gustan los perros" = ik hou van honden
    if (esToks && /^(los|las)$/.test(esToks[0] || "") && /^de \S+$/.test(np0)) return np0.replace(/^de /, "");
    return STOF_NL.test(np0) ? np0.replace(/^(de|het) /, "") : np0;
  }
  function translateNLTerugBasis(text, rev, gen) {
    var vp = metVoornaamwoord(text, rev, gen);
    if (typeof vp === "string") return vp;
    var kr = translateNLTerugBasisKern.apply(null, arguments);
    // nooit een onderwerpsvorm na een voorzetsel ("met zij", "voor hun")
    if (vp === null && typeof kr === "string" && /\b(met|voor|zonder|van|over|op|bij) (zij|hun|ik|jij|hij|wij)\b/i.test(kr)) return null;
    return kr;
  }
  function translateNLTerugBasisKern(text, rev, gen) {
    if (typeof text === "string" && /\b(pido|pides|pide|pedimos|piden|pedir)\s+(ayuda|perdón|permiso|información|consejo|un favor|la palabra|disculpas)\b/i.test(text)) return null;
    var gb = null;
    try { gb = gebiedend(text, rev, gen); } catch (e) { gb = null; }
    if (gb) return gb.replace(/\bde huiswerken\b/g, "je huiswerk").replace(/\b(kom|ga) naar huis terug\b/i, function (m0, v) { return v + " terug naar huis"; });
    var r = translateNL(text, rev, gen);
    // "Tú no vas al cine" / "Ella no tiene un perro": het onderwerp vóór "no" eerst weglaten, daarna het onderwerp terugzetten
    if (!r && typeof text === "string") {
      var mo = /^(\s*[¿¡]?)(yo|tú|él|ella|nosotros|nosotras|ellos|ellas)\s+(no\s+.+)$/i.exec(text);
      if (mo) {
        var r2 = translateNL(mo[1] + mo[3].charAt(0).toUpperCase() + mo[3].slice(1), rev, gen);
        if (typeof r2 === "string") {
          var pr = mo[2].toLowerCase();
          if (pr === "él") r2 = r2.replace(/(^|[¿¡])Hij\/zij\b/, "$1Hij").replace(/\bhij\/zij\b/, "hij");
          else if (pr === "ella") r2 = r2.replace(/(^|[¿¡])Hij\/zij\b/, "$1Zij").replace(/\bhij\/zij\b/, "zij");
          else if (pr === "ellos" || pr === "ellas") r2 = r2.replace(/(^|[¿¡])Ze\b/, "$1Zij");
          r = r2;
        }
      }
    }
    if (!r && typeof text === "string" && (arguments[3] || 0) < 3) r = terugval(text, rev, gen, (arguments[3] || 0) + 1);
    // "Ella ... su madre": zij belt haar moeder (niet "zijn")
    if (typeof r === "string" && typeof text === "string" && /^\s*[¿¡]?\s*ella\b/i.test(text) && /\bsus?\b/i.test(text)) r = r.replace(/^(Zij (?!zijn\b)\S+(?: \S+)*?) zijn (?=\S)/, "$1 haar ");
    if (typeof r === "string") r = r.replace(/\bde huiswerken\b/g, "het huiswerk").replace(/\bhuiswerken\b/g, "huiswerk");
    if (typeof r === "string") r = r.replace(/\b(kom|komt|komen|ga|gaat|gaan|kwam|kwamen|ging|gingen) naar huis terug\b/gi, "$1 terug naar huis");
    return r;
  }
  // Vaste zinnen uit de zinsmodule (zin-lex.js) gaan voor de woord-voor-woord-vertaling
  var vastNlIdx = null;
  function vastEs(text) {
    if (typeof ZINC === "undefined" || !ZINC.FIXED || typeof text !== "string") return null;
    var k = ZINC.normKey(text);
    var f = ZINC.FIXED[ZINC.fold(k)] || ZINC.FIXED[k];
    if (f && f.nl) return f.nl;
    // Vaste Nederlandse zinnen zonder Engels/Duits/Frans (zoals "hacía frío" = "Het was koud.")
    if (typeof ZIN_LEX !== "undefined" && ZIN_LEX.FIXED_NL) {
      if (!vastNlIdx) { vastNlIdx = {}; for (var fk in ZIN_LEX.FIXED_NL) vastNlIdx[ZINC.fold(ZINC.normKey(fk))] = ZIN_LEX.FIXED_NL[fk]; }
      var nl = vastNlIdx[ZINC.fold(k)];
      if (nl) return nl;
    }
    return null;
  }
  // Losse naamwoordgroep bij bestellen: "Dos cafés, por favor" = Twee koffie, alsjeblieft
  function esFragment(text, rev, gen) {
    var t = String(text || "").trim().replace(/[¡!.]+$/, "");
    if (/[¿?]/.test(t)) return null;
    var m = /^(.+?)\s*,?\s*por favor$/i.exec(t), body = m ? m[1] : t;
    var words = body.toLowerCase().replace(/,/g, " ").split(/\s+/).filter(Boolean);
    if (!words.length || words.length > 4) return null;
    if (!m && !/^(un|una|dos|tres|cuatro|cinco|seis)$/i.test(words[0])) return null;
    var getal = NUMBER[nf(words[0])] || null, uit = null;
    if (getal && words.length === 2) {
      var zw = words[1], zn = noun(zw.replace(/s$/, ""), rev, gen) || noun(zw.replace(/es$/, ""), rev, gen) || noun(zw, rev, gen);
      if (!zn) return null;
      // bestellen: "twee koffie, twee bier" (drankjes blijven enkelvoud na een getal)
      uit = getal + " " + (/^(koffie|thee|bier|wijn|water|cola|melk|sap|limonade)$/.test(zn.nl) ? zn.nl : plural(zn.nl));
    } else {
      var n = np(words, 0, rev, gen);
      if (!n || n.end !== words.length || !n.s) return null;
      uit = n.s;
    }
    return uit.charAt(0).toUpperCase() + uit.slice(1) + (m ? ", alsjeblieft." : ".");
  }
  function translateNLTerug(text, rev, gen, diepte) {
    var v = vastEs(text); if (v) return v;
    var r = nlNazorg(translateNLTerugBasis(text, rev, gen, diepte) || esFragment(text, rev, gen));
    // "llegar tarde" = te laat komen: "Mijn broer komt te laat", "Waarom kom je te laat?"
    if (typeof r === "string") r = r.replace(/\b(kom|komt|komen)((?: (?:je|jij|hij|zij|ze|we|wij|jullie|u))?) laat aan\b/g, "$1$2 te laat").replace(/\b(kom|komt|komen)((?: (?:je|jij|hij|zij|ze|we|wij|jullie|u))?) niet laat aan\b/g, "$1$2 niet te laat");
    return r;
  }
  return { translate: translateNLTerug, nazorg: nlNazorg };
})();
