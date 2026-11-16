// Grammatica-motor, eerste versie (Spaans -> Nederlands).
// Ontleedt een Spaanse zin in werkwoorden, onderwerp, ontkenning en bijzinnen en bouwt daarna
// een Nederlandse zin op met de juiste persoonsvorm en woordvolgorde.
// Lukt dat niet (onbekend woord, ingewikkelde zin), dan geeft translate() null terug en
// gebruikt de app de gewone woord-voor-woord vertaling.
var GRAM = (function () {

  function fold(s) {
    return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  }
  function has(obj, k) { return Object.prototype.hasOwnProperty.call(obj, k); }

  // Volgorde van personen: 0 yo, 1 tú, 2 él/ella/usted, 3 nosotros, 4 vosotros, 5 ellos/ellas
  var PERS = ["1e pers.", "2e pers.", "3e pers.", "1e pers. mv.", "2e pers. mv.", "3e pers. mv."];
  // Nederlandse persoonlijke voornaamwoorden bij het weglaten van het onderwerp
  var IMPL = ["ik", "je", "hij", "wij", "jullie", "zij"];

  // ---- Spaanse regelmatige uitgangen (ik, jij, hij, wij, jullie, zij)
  var ES_END = {
    ar: {
      pres: ["o", "as", "a", "amos", "áis", "an"],
      pret: ["é", "aste", "ó", "amos", "asteis", "aron"],
      imp: ["aba", "abas", "aba", "ábamos", "abais", "aban"]
    },
    er: {
      pres: ["o", "es", "e", "emos", "éis", "en"],
      pret: ["í", "iste", "ió", "imos", "isteis", "ieron"],
      imp: ["ía", "ías", "ía", "íamos", "íais", "ían"]
    },
    ir: {
      pres: ["o", "es", "e", "imos", "ís", "en"],
      pret: ["í", "iste", "ió", "imos", "isteis", "ieron"],
      imp: ["ía", "ías", "ía", "íamos", "íais", "ían"]
    }
  };

  function regular(inf) {
    var cls = inf.slice(-2), stem = inf.slice(0, -2), end = ES_END[cls];
    var s1 = stem;
    if (cls === "ar") { // spelling: llegar -> llegué, jugar -> jugué, empezar -> empecé
      if (/c$/.test(stem)) s1 = stem.slice(0, -1) + "qu";
      else if (/g$/.test(stem)) s1 = stem + "u";
      else if (/z$/.test(stem)) s1 = stem.slice(0, -1) + "c";
    }
    var pret = end.pret.map(function (e, i) { return (i === 0 ? s1 : stem) + e; });
    return {
      pres: end.pres.map(function (e) { return stem + e; }),
      pret: pret,
      imp: end.imp.map(function (e) { return stem + e; })
    };
  }

  // ---- Spaanse werkwoorden: onregelmatige vormen expliciet, de rest wordt afgeleid
  var ES_VERBS = [
    { es: "ser", nl: "zijn", pres: ["soy", "eres", "es", "somos", "sois", "son"],
      pret: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"], imp: ["era", "eras", "era", "éramos", "erais", "eran"] },
    { es: "ir", nl: "gaan", pres: ["voy", "vas", "va", "vamos", "vais", "van"],
      pret: ["fui", "fuiste", "fue", "fuimos", "fuisteis", "fueron"], imp: ["iba", "ibas", "iba", "íbamos", "ibais", "iban"] },
    { es: "estar", nl: "zijn", pres: ["estoy", "estás", "está", "estamos", "estáis", "están"],
      pret: ["estuve", "estuviste", "estuvo", "estuvimos", "estuvisteis", "estuvieron"] },
    { es: "tener", nl: "hebben", pres: ["tengo", "tienes", "tiene", "tenemos", "tenéis", "tienen"],
      pret: ["tuve", "tuviste", "tuvo", "tuvimos", "tuvisteis", "tuvieron"] },
    { es: "hacer", nl: "doen", pres: ["hago", "haces", "hace", "hacemos", "hacéis", "hacen"],
      pret: ["hice", "hiciste", "hizo", "hicimos", "hicisteis", "hicieron"] },
    { es: "decir", nl: "zeggen", pres: ["digo", "dices", "dice", "decimos", "decís", "dicen"],
      pret: ["dije", "dijiste", "dijo", "dijimos", "dijisteis", "dijeron"] },
    { es: "ver", nl: "zien", pres: ["veo", "ves", "ve", "vemos", "veis", "ven"],
      pret: ["vi", "viste", "vio", "vimos", "visteis", "vieron"] },
    { es: "poder", nl: "kunnen", nlAlt: ["mogen"], pres: ["puedo", "puedes", "puede", "podemos", "podéis", "pueden"],
      pret: ["pude", "pudiste", "pudo", "pudimos", "pudisteis", "pudieron"] },
    { es: "querer", nl: "willen", pres: ["quiero", "quieres", "quiere", "queremos", "queréis", "quieren"],
      pret: ["quise", "quisiste", "quiso", "quisimos", "quisisteis", "quisieron"] },
    { es: "saber", nl: "weten", pres: ["sé", "sabes", "sabe", "sabemos", "sabéis", "saben"],
      pret: ["supe", "supiste", "supo", "supimos", "supisteis", "supieron"] },
    { es: "dar", nl: "geven", pres: ["doy", "das", "da", "damos", "dais", "dan"],
      pret: ["di", "diste", "dio", "dimos", "disteis", "dieron"] },
    { es: "venir", nl: "komen", pres: ["vengo", "vienes", "viene", "venimos", "venís", "vienen"],
      pret: ["vine", "viniste", "vino", "vinimos", "vinisteis", "vinieron"] },
    { es: "leer", nl: "lezen", pres: ["leo", "lees", "lee", "leemos", "leéis", "leen"],
      pret: ["leí", "leíste", "leyó", "leímos", "leísteis", "leyeron"] },
    { es: "dormir", nl: "slapen", pres: ["duermo", "duermes", "duerme", "dormimos", "dormís", "duermen"],
      pret: ["dormí", "dormiste", "durmió", "dormimos", "dormisteis", "durmieron"] },
    { es: "empezar", nl: "beginnen", pres: ["empiezo", "empiezas", "empieza", "empezamos", "empezáis", "empiezan"] },
    { es: "entender", nl: "begrijpen", pres: ["entiendo", "entiendes", "entiende", "entendemos", "entendéis", "entienden"] },
    { es: "jugar", nl: "spelen", pres: ["juego", "juegas", "juega", "jugamos", "jugáis", "juegan"] },
    // regelmatige werkwoorden
    { es: "comer", nl: "eten" }, { es: "beber", nl: "drinken" }, { es: "hablar", nl: "praten" },
    { es: "trabajar", nl: "werken" }, { es: "llegar", nl: "aankomen" }, { es: "comprar", nl: "kopen" },
    { es: "decidir", nl: "beslissen" }, { es: "estudiar", nl: "studeren" }, { es: "vivir", nl: "wonen" },
    { es: "cocinar", nl: "koken" }, { es: "escuchar", nl: "luisteren" }, { es: "mirar", nl: "kijken" },
    { es: "correr", nl: "rennen" }, { es: "pasar", nl: "gebeuren" }, { es: "escribir", nl: "schrijven" },
    { es: "ayudar", nl: "helpen" },
    { es: "esperar", nl: "hopen", nlAlt: ["wachten"] },
    { es: "preguntar", nl: "vragen" },
    { es: "contestar", nl: "antwoorden" },
    { es: "terminar", nl: "eindigen" },
    { es: "buscar", nl: "zoeken" },
    { es: "encontrar", nl: "vinden", pres: ["encuentro", "encuentras", "encuentra", "encontramos", "encontráis", "encuentran"] },
    { es: "olvidar", nl: "vergeten" },
    { es: "perder", nl: "verliezen", pres: ["pierdo", "pierdes", "pierde", "perdemos", "perdéis", "pierden"] },
    { es: "salir", nl: "uitgaan", nlAlt: ["vertrekken"], pres: ["salgo", "sales", "sale", "salimos", "salís", "salen"] },
    { es: "abrir", nl: "openen" },
    { es: "cerrar", nl: "sluiten", pres: ["cierro", "cierras", "cierra", "cerramos", "cerráis", "cierran"] },
    { es: "seguir", nl: "volgen", pres: ["sigo", "sigues", "sigue", "seguimos", "seguís", "siguen"] },
    { es: "pagar", nl: "betalen" },
    { es: "costar", nl: "kosten", pres: ["cuesto", "cuestas", "cuesta", "costamos", "costáis", "cuestan"] },
    { es: "usar", nl: "gebruiken" },
    { es: "visitar", nl: "bezoeken" },
    { es: "viajar", nl: "reizen" },
    { es: "preparar", nl: "voorbereiden" },
    { es: "limpiar", nl: "poetsen" },
    { es: "pensar", nl: "denken", pres: ["pienso", "piensas", "piensa", "pensamos", "pensáis", "piensan"] },
    { es: "sentir", nl: "voelen", pres: ["siento", "sientes", "siente", "sentimos", "sentís", "sienten"] },
    { es: "creer", nl: "geloven", pret: ["creí", "creíste", "creyó", "creímos", "creísteis", "creyeron"] },
    { es: "conocer", nl: "kennen", pres: ["conozco", "conoces", "conoce", "conocemos", "conocéis", "conocen"] },
    { es: "ganar", nl: "winnen" },
    { es: "poner", nl: "zetten", pres: ["pongo", "pones", "pone", "ponemos", "ponéis", "ponen"], pret: ["puse", "pusiste", "puso", "pusimos", "pusisteis", "pusieron"] },
    { es: "traer", nl: "brengen", pres: ["traigo", "traes", "trae", "traemos", "traéis", "traen"], pret: ["traje", "trajiste", "trajo", "trajimos", "trajisteis", "trajeron"] },
    { es: "conducir", nl: "rijden", pres: ["conduzco", "conduces", "conduce", "conducimos", "conducís", "conducen"], pret: ["conduje", "condujiste", "condujo", "condujimos", "condujisteis", "condujeron"] },
    { es: "aprender", nl: "leren" },
    { es: "comprender", nl: "begrijpen" },
    { es: "llevar", nl: "dragen" },
    { es: "romper", nl: "breken" },
    { es: "llamar", nl: "bellen" },
    { es: "pedir", nl: "bestellen", pres: ["pido", "pides", "pide", "pedimos", "pedís", "piden"], pret: ["pedí", "pediste", "pidió", "pedimos", "pedisteis", "pidieron"] },
    { es: "dejar", nl: "laten" },
    { es: "nadar", nl: "zwemmen" },
    { es: "caminar", nl: "lopen" },
    { es: "dibujar", nl: "tekenen" },
    { es: "bailar", nl: "dansen" },
    { es: "cantar", nl: "zingen" },
    { es: "entrar", nl: "binnenkomen" },
    { es: "tomar", nl: "nemen" },
    { es: "llover", nl: "regenen", impers: true, pres: ["llueve", "llueve", "llueve", "llueven", "llueven", "llueven"], pret: ["llovió", "llovió", "llovió", "llovieron", "llovieron", "llovieron"] },
    { es: "nevar", nl: "sneeuwen", impers: true, pres: ["nieva", "nieva", "nieva", "nievan", "nievan", "nievan"], pret: ["nevó", "nevó", "nevó", "nevaron", "nevaron", "nevaron"] },
    { es: "durar", nl: "duren" },
    { es: "subir", nl: "instappen" },
    { es: "bajar", nl: "uitstappen" },
    { es: "cambiar", nl: "veranderen", nlAlt: ["wisselen"] },
    { es: "doblar", nl: "afslaan" },
    { es: "cruzar", nl: "oversteken" },
    { es: "reservar", nl: "reserveren" },
    { es: "deber", nl: "moeten", pres: ["debo", "debes", "debe", "debemos", "debéis", "deben"] },
    { es: "contar", nl: "vertellen", pres: ["cuento", "cuentas", "cuenta", "contamos", "contáis", "cuentan"] },
    { es: "volver", nl: "terugkomen", pres: ["vuelvo", "vuelves", "vuelve", "volvemos", "volvéis", "vuelven"], pret: ["volví", "volviste", "volvió", "volvimos", "volvisteis", "volvieron"] }
  ];

  // Vormen die te algemeen zijn (zoals het voornaamwoord "se") tellen niet als werkwoord
  var SKIP_FORMS = ["se"];

  var ESIDX = {}, ESEX = {}; // ESEX: met accenten (llegó ≠ llego), ESIDX: zonder accenten
  ES_VERBS.forEach(function (v) {
    var base = regular(v.es);
    var tbl = { pres: v.pres || base.pres, pret: v.pret || base.pret, imp: v.imp || base.imp };
    ["pres", "pret", "imp"].forEach(function (tense) {
      tbl[tense].forEach(function (form, p) {
        var k = fold(form);
        if (SKIP_FORMS.indexOf(k) >= 0) return;
        var entry = { es: v.es, nl: v.nl, tense: tense, p: p };
        (ESIDX[k] = ESIDX[k] || []).push(entry);
        (ESEX[form.toLowerCase()] = ESEX[form.toLowerCase()] || []).push(entry);
      });
    });
  });

  // ---- Nederlandse onregelmatige werkwoorden (ik, jij, hij, wij, jullie, zij)
  var NL_IRR = {
    zijn: { pret: ["was", "was", "was", "waren", "waren", "waren"], pres: ["ben", "bent", "is", "zijn", "zijn", "zijn"] },
    hebben: { pret: ["had", "had", "had", "hadden", "hadden", "hadden"], pres: ["heb", "hebt", "heeft", "hebben", "hebben", "hebben"] },
    gaan: { pret: ["ging", "ging", "ging", "gingen", "gingen", "gingen"], pres: ["ga", "gaat", "gaat", "gaan", "gaan", "gaan"] },
    doen: { pret: ["deed", "deed", "deed", "deden", "deden", "deden"], pres: ["doe", "doet", "doet", "doen", "doen", "doen"] },
    zeggen: { pret: ["zei", "zei", "zei", "zeiden", "zeiden", "zeiden"], pres: ["zeg", "zegt", "zegt", "zeggen", "zeggen", "zeggen"] },
    zien: { pret: ["zag", "zag", "zag", "zagen", "zagen", "zagen"], pres: ["zie", "ziet", "ziet", "zien", "zien", "zien"] },
    kunnen: { pret: ["kon", "kon", "kon", "konden", "konden", "konden"], pres: ["kan", "kan", "kan", "kunnen", "kunnen", "kunnen"] },
    willen: { pret: ["wilde", "wilde", "wilde", "wilden", "wilden", "wilden"], pres: ["wil", "wil", "wil", "willen", "willen", "willen"] },
    weten: { pret: ["wist", "wist", "wist", "wisten", "wisten", "wisten"], pres: ["weet", "weet", "weet", "weten", "weten", "weten"] },
    geven: { pret: ["gaf", "gaf", "gaf", "gaven", "gaven", "gaven"], pres: ["geef", "geeft", "geeft", "geven", "geven", "geven"] },
    komen: { pret: ["kwam", "kwam", "kwam", "kwamen", "kwamen", "kwamen"], pres: ["kom", "komt", "komt", "komen", "komen", "komen"] },
    eten: { pret: ["at", "at", "at", "aten", "aten", "aten"], pres: ["eet", "eet", "eet", "eten", "eten", "eten"] },
    rennen: { pret: ["rende", "rende", "rende", "renden", "renden", "renden"] },
    slapen: { pret: ["sliep", "sliep", "sliep", "sliepen", "sliepen", "sliepen"], pres: ["slaap", "slaapt", "slaapt", "slapen", "slapen", "slapen"] },
    beginnen: { pret: ["begon", "begon", "begon", "begonnen", "begonnen", "begonnen"], pres: ["begin", "begint", "begint", "beginnen", "beginnen", "beginnen"] },
    begrijpen: { pret: ["begreep", "begreep", "begreep", "begrepen", "begrepen", "begrepen"], pres: ["begrijp", "begrijpt", "begrijpt", "begrijpen", "begrijpen", "begrijpen"] },
    drinken: { pret: ["dronk", "dronk", "dronk", "dronken", "dronken", "dronken"], pres: ["drink", "drinkt", "drinkt", "drinken", "drinken", "drinken"] },
    kopen: { pret: ["kocht", "kocht", "kocht", "kochten", "kochten", "kochten"], pres: ["koop", "koopt", "koopt", "kopen", "kopen", "kopen"] },
    beslissen: { pret: ["besliste", "besliste", "besliste", "beslisten", "beslisten", "beslisten"] },
    praten: { pret: ["praatte", "praatte", "praatte", "praatten", "praatten", "praatten"], pres: ["praat", "praat", "praat", "praten", "praten", "praten"] },
    wonen: { pret: ["woonde", "woonde", "woonde", "woonden", "woonden", "woonden"], pres: ["woon", "woont", "woont", "wonen", "wonen", "wonen"] },
    koken: { pret: ["kookte", "kookte", "kookte", "kookten", "kookten", "kookten"], pres: ["kook", "kookt", "kookt", "koken", "koken", "koken"] },
    spelen: { pret: ["speelde", "speelde", "speelde", "speelden", "speelden", "speelden"], pres: ["speel", "speelt", "speelt", "spelen", "spelen", "spelen"] },
    kijken: { pret: ["keek", "keek", "keek", "keken", "keken", "keken"], pres: ["kijk", "kijkt", "kijkt", "kijken", "kijken", "kijken"] },
    schrijven: { pret: ["schreef", "schreef", "schreef", "schreven", "schreven", "schreven"], pres: ["schrijf", "schrijft", "schrijft", "schrijven", "schrijven", "schrijven"] },
    lezen: { pret: ["las", "las", "las", "lazen", "lazen", "lazen"], pres: ["lees", "leest", "leest", "lezen", "lezen", "lezen"] },
    "helpen": { pres: ["help", "helpt", "helpt", "helpen", "helpen", "helpen"], pret: ["hielp", "hielp", "hielp", "hielpen", "hielpen", "hielpen"] },
    "vragen": { pres: ["vraag", "vraagt", "vraagt", "vragen", "vragen", "vragen"], pret: ["vroeg", "vroeg", "vroeg", "vroegen", "vroegen", "vroegen"] },
    "zoeken": { pres: ["zoek", "zoekt", "zoekt", "zoeken", "zoeken", "zoeken"], pret: ["zocht", "zocht", "zocht", "zochten", "zochten", "zochten"] },
    "vinden": { pres: ["vind", "vindt", "vindt", "vinden", "vinden", "vinden"], pret: ["vond", "vond", "vond", "vonden", "vonden", "vonden"] },
    "vergeten": { pres: ["vergeet", "vergeet", "vergeet", "vergeten", "vergeten", "vergeten"], pret: ["vergat", "vergat", "vergat", "vergaten", "vergaten", "vergaten"] },
    "verliezen": { pres: ["verlies", "verliest", "verliest", "verliezen", "verliezen", "verliezen"], pret: ["verloor", "verloor", "verloor", "verloren", "verloren", "verloren"] },
    "uitgaan": { pres: ["ga uit", "gaat uit", "gaat uit", "gaan uit", "gaan uit", "gaan uit"], pret: ["ging uit", "ging uit", "ging uit", "gingen uit", "gingen uit", "gingen uit"] },
    "sluiten": { pres: ["sluit", "sluit", "sluit", "sluiten", "sluiten", "sluiten"], pret: ["sloot", "sloot", "sloot", "sloten", "sloten", "sloten"] },
    "bezoeken": { pres: ["bezoek", "bezoekt", "bezoekt", "bezoeken", "bezoeken", "bezoeken"], pret: ["bezocht", "bezocht", "bezocht", "bezochten", "bezochten", "bezochten"] },
    "reizen": { pres: ["reis", "reist", "reist", "reizen", "reizen", "reizen"], pret: ["reisde", "reisde", "reisde", "reisden", "reisden", "reisden"] },
    "voorbereiden": { pres: ["bereid voor", "bereidt voor", "bereidt voor", "bereiden voor", "bereiden voor", "bereiden voor"], pret: ["bereidde voor", "bereidde voor", "bereidde voor", "bereidden voor", "bereidden voor", "bereidden voor"] },
    "denken": { pres: ["denk", "denkt", "denkt", "denken", "denken", "denken"], pret: ["dacht", "dacht", "dacht", "dachten", "dachten", "dachten"] },
    "kennen": { pres: ["ken", "kent", "kent", "kennen", "kennen", "kennen"], pret: ["kende", "kende", "kende", "kenden", "kenden", "kenden"] },
    "winnen": { pres: ["win", "wint", "wint", "winnen", "winnen", "winnen"], pret: ["won", "won", "won", "wonnen", "wonnen", "wonnen"] },
    "brengen": { pres: ["breng", "brengt", "brengt", "brengen", "brengen", "brengen"], pret: ["bracht", "bracht", "bracht", "brachten", "brachten", "brachten"] },
    "rijden": { pres: ["rijd", "rijdt", "rijdt", "rijden", "rijden", "rijden"], pret: ["reed", "reed", "reed", "reden", "reden", "reden"] },
    "dragen": { pres: ["draag", "draagt", "draagt", "dragen", "dragen", "dragen"], pret: ["droeg", "droeg", "droeg", "droegen", "droegen", "droegen"] },
    "breken": { pres: ["breek", "breekt", "breekt", "breken", "breken", "breken"], pret: ["brak", "brak", "brak", "braken", "braken", "braken"] },
    "laten": { pres: ["laat", "laat", "laat", "laten", "laten", "laten"], pret: ["liet", "liet", "liet", "lieten", "lieten", "lieten"] },
    "zwemmen": { pres: ["zwem", "zwemt", "zwemt", "zwemmen", "zwemmen", "zwemmen"], pret: ["zwom", "zwom", "zwom", "zwommen", "zwommen", "zwommen"] },
    "lopen": { pres: ["loop", "loopt", "loopt", "lopen", "lopen", "lopen"], pret: ["liep", "liep", "liep", "liepen", "liepen", "liepen"] },
    "zingen": { pres: ["zing", "zingt", "zingt", "zingen", "zingen", "zingen"], pret: ["zong", "zong", "zong", "zongen", "zongen", "zongen"] },
    "binnenkomen": { pres: ["kom binnen", "komt binnen", "komt binnen", "komen binnen", "komen binnen", "komen binnen"], pret: ["kwam binnen", "kwam binnen", "kwam binnen", "kwamen binnen", "kwamen binnen", "kwamen binnen"] },
    "nemen": { pres: ["neem", "neemt", "neemt", "nemen", "nemen", "nemen"], pret: ["nam", "nam", "nam", "namen", "namen", "namen"] },
    aankomen: { pret: ["kwam aan", "kwam aan", "kwam aan", "kwamen aan", "kwamen aan", "kwamen aan"], pres: ["kom aan", "komt aan", "komt aan", "komen aan", "komen aan", "komen aan"] },
    vertrekken: { pret: ["vertrok", "vertrok", "vertrok", "vertrokken", "vertrokken", "vertrokken"] },
    mogen: { pres: ["mag", "mag", "mag", "mogen", "mogen", "mogen"], pret: ["mocht", "mocht", "mocht", "mochten", "mochten", "mochten"] },
    moeten: { pres: ["moet", "moet", "moet", "moeten", "moeten", "moeten"], pret: ["moest", "moest", "moest", "moesten", "moesten", "moesten"] },
    instappen: { pres: ["stap in", "stapt in", "stapt in", "stappen in", "stappen in", "stappen in"], pret: ["stapte in", "stapte in", "stapte in", "stapten in", "stapten in", "stapten in"] },
    uitstappen: { pres: ["stap uit", "stapt uit", "stapt uit", "stappen uit", "stappen uit", "stappen uit"], pret: ["stapte uit", "stapte uit", "stapte uit", "stapten uit", "stapten uit", "stapten uit"] },
    afslaan: { pres: ["sla af", "slaat af", "slaat af", "slaan af", "slaan af", "slaan af"], pret: ["sloeg af", "sloeg af", "sloeg af", "sloegen af", "sloegen af", "sloegen af"] },
    oversteken: { pres: ["steek over", "steekt over", "steekt over", "steken over", "steken over", "steken over"], pret: ["stak over", "stak over", "stak over", "staken over", "staken over", "staken over"] },
    reserveren: { pres: ["reserveer", "reserveert", "reserveert", "reserveren", "reserveren", "reserveren"], pret: ["reserveerde", "reserveerde", "reserveerde", "reserveerden", "reserveerden", "reserveerden"] },
    terugkomen: { pres: ["kom terug", "komt terug", "komt terug", "komen terug", "komen terug", "komen terug"], pret: ["kwam terug", "kwam terug", "kwam terug", "kwamen terug", "kwamen terug", "kwamen terug"] },
    leren: { pres: ["leer", "leert", "leert", "leren", "leren", "leren"], pret: ["leerde", "leerde", "leerde", "leerden", "leerden", "leerden"] },
    duren: { pres: ["duur", "duurt", "duurt", "duren", "duren", "duren"], pret: ["duurde", "duurde", "duurde", "duurden", "duurden", "duurden"] },
    betalen: { pres: ["betaal", "betaalt", "betaalt", "betalen", "betalen", "betalen"], pret: ["betaalde", "betaalde", "betaalde", "betaalden", "betaalden", "betaalden"] }
  };

  // Nederlandse persoonsvorm. Regelmatige zwakke werkwoorden worden uit de infinitief afgeleid.
  function nlVerb(inf, tense, p) {
    var ov = NL_IRR[inf];
    if (ov && ov[tense]) return ov[tense][p];
    var stem = inf.slice(0, -2);
    // Dubbele medeklinker in de stam wordt één letter in de tegenwoordige tijd (vertrekken -> vertrek, bellen -> bel)
    if (/([bcdfgklmnprstvz])\1$/.test(stem)) stem = stem.slice(0, -1);
    var voiceless = /[fkpstch]$/.test(stem);
    if (tense === "pres") {
      if (p === 0) return stem;
      if (p === 1 || p === 2) return /t$/.test(stem) ? stem : stem + "t";
      return inf;
    }
    if (p >= 3) return stem + (voiceless ? "ten" : "den");
    return stem + (voiceless ? "te" : "de");
  }

  // Nederlandse vormen van alle werkwoorden in de lijst (ik, hij/zij, verleden) met de Spaanse tegenhanger,
  // zodat bijvoorbeeld "vertrekt" in de woordenlijst staat. Alleen enkelvoudige woorden.
  var NL_FORMS = [];
  ES_VERBS.forEach(function (v) {
    var esR = regular(v.es);
    var esPres = v.pres || esR.pres, esPret = v.pret || esR.pret;
    [v.nl].concat(v.nlAlt || []).forEach(function (inf) {
      if (inf.indexOf(" ") >= 0) return;
      NL_FORMS.push({ nl: inf, es: v.es });
      if (v.impers) {
        NL_FORMS.push({ nl: nlVerb(inf, "pres", 2), es: esPres[2] });
        NL_FORMS.push({ nl: nlVerb(inf, "pret", 2), es: esPret[2] });
        return;
      }
      NL_FORMS.push({ nl: nlVerb(inf, "pres", 0), es: esPres[0] });
      NL_FORMS.push({ nl: nlVerb(inf, "pres", 2), es: esPres[2] });
      NL_FORMS.push({ nl: nlVerb(inf, "pret", 2), es: esPret[2] });
      NL_FORMS.push({ nl: nlVerb(inf, "pret", 5), es: esPret[5] });
    });
  });

  // ---- Vaste woordgroepen en gedrag per zinsdeel
  var NOUN_BEFORE = ["mucho", "poco", "mi", "mis", "tu", "tus", "su", "sus", "un", "una", "el", "la", "los", "las", "muy", "buen", "buena", "nuestro", "nuestra"];
  var GO_NEXT = ["a", "al", "en", "hacia", "hasta", "para"];
  var QW_KEYS = ["que", "como", "donde", "cuando", "quien"];
  var POSS_ES = ["tu", "tus", "mi", "mis", "su", "sus"];
  var DETS = ["el", "la", "un", "una", "tu", "mi", "su"];
  var ADVSET = ["ayer", "hoy", "ya", "siempre", "nunca", "tambien", "todavia", "luego", "despues", "antes", "ahora", "anoche"];
  var DAYS_ES = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
  var PRON_KEY = { "yo": "yo", "tú": "tu", "él": "el", "el": "el", "ella": "ella", "usted": "usted",
    "nosotros": "nosotros", "nosotras": "nosotros", "vosotros": "vosotros", "vosotras": "vosotros",
    "ellos": "ellos", "ellas": "ellas" };
  function isVowel(w) { return !!w && /^[aeiouyhàâéèêëîïôöùûüœ]/i.test(w); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  // ---- Per taal: persoonlijke voornaamwoorden, vraagwoorden, voegwoorden, dagen
  var IMPLS = {
    nl: ["ik", "je", "hij", "wij", "jullie", "zij"],
    en: ["I", "you", "it", "we", "you", "they"],
    de: ["ich", "du", "es", "wir", "ihr", "sie"],
    fr: ["je", "tu", "il", "nous", "vous", "ils"]
  };
  var SUBJ = {
    yo: { nl: "ik", en: "I", de: "ich", fr: "je" },
    tu: { nl: "je", en: "you", de: "du", fr: "tu" },
    el: { nl: "hij", en: "he", de: "er", fr: "il" },
    ella: { nl: "zij", en: "she", de: "sie", fr: "elle" },
    usted: { nl: "u", en: "you", de: "Sie", fr: "vous" },
    nosotros: { nl: "wij", en: "we", de: "wir", fr: "nous" },
    vosotros: { nl: "jullie", en: "you", de: "ihr", fr: "vous" },
    ellos: { nl: "zij", en: "they", de: "sie", fr: "ils" },
    ellas: { nl: "zij", en: "they", de: "sie", fr: "elles" }
  };
  var QW = {
    nl: { que: "wat", como: "hoe", donde: "waar", cuando: "wanneer", quien: "wie" },
    en: { que: "what", como: "how", donde: "where", cuando: "when", quien: "who" },
    de: { que: "was", como: "wie", donde: "wo", cuando: "wann", quien: "wer" },
    fr: { que: "Qu'est-ce que", como: "comment", donde: "où", cuando: "quand", quien: "qui" }
  };
  var CONJ = {
    porque: { nl: "omdat", en: "because", de: "weil", fr: "parce que" },
    que: { nl: "dat", en: "that", de: "dass", fr: "que" },
    cuando: { nl: null, en: "when", de: null, fr: "quand" },
    y: { nl: "en", en: "and", de: "und", fr: "et" },
    pero: { nl: "maar", en: "but", de: "aber", fr: "mais" }
  };
  var DAYS = {
    nl: { prep: "op", names: ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"] },
    en: { prep: "on", names: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    de: { prep: "am", names: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"] },
    fr: { prep: "", names: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"] }
  };
  function dayName(lang, f) { var i = DAYS_ES.indexOf(f); return i < 0 ? null : DAYS[lang].names[i]; }

  // Bijwoorden en bijvoeglijke naamwoorden (Duits en Frans; Nederlands en Engels komen uit de woordenlijst)
  var ADV_T = {
    ayer: { de: "gestern", fr: "hier" }, hoy: { de: "heute", fr: "aujourd'hui" }, ya: { de: "schon", fr: "déjà" },
    siempre: { de: "immer", fr: "toujours" }, nunca: { de: "nie", fr: "jamais" }, tambien: { de: "auch", fr: "aussi" },
    muy: { de: "sehr", fr: "très" }, mucho: { de: "viel", fr: "beaucoup" }, bien: { de: "gut", fr: "bien" }, mal: { de: "schlecht", fr: "mal" }
  };
  var ADJ_T = {
    "bonito": { nl: "mooi", en: "pretty", de: "schön", fr: "joli" },
    "bonita": { nl: "mooi", en: "pretty", de: "schön", fr: "jolie" },
    "grande": { nl: "groot", en: "big", de: "groß", fr: "grand" },
    "pequeño": { nl: "klein", en: "small", de: "klein", fr: "petit" },
    "pequeña": { nl: "klein", en: "small", de: "klein", fr: "petite" },
    "nuevo": { nl: "nieuw", en: "new", de: "neu", fr: "nouveau" },
    "nueva": { nl: "nieuw", en: "new", de: "neu", fr: "nouvelle" },
    "viejo": { nl: "oud", en: "old", de: "alt", fr: "vieux" },
    "vieja": { nl: "oud", en: "old", de: "alt", fr: "vieille" },
    "bueno": { nl: "goed", en: "good", de: "gut", fr: "bon" },
    "buena": { nl: "goed", en: "good", de: "gut", fr: "bonne" },
    "malo": { nl: "slecht", en: "bad", de: "schlecht", fr: "mauvais" },
    "mala": { nl: "slecht", en: "bad", de: "schlecht", fr: "mauvaise" },
    "caro": { nl: "duur", en: "expensive", de: "teuer", fr: "cher" },
    "cara": { nl: "duur", en: "expensive", de: "teuer", fr: "chère" },
    "barato": { nl: "goedkoop", en: "cheap", de: "billig", fr: "pas cher" },
    "barata": { nl: "goedkoop", en: "cheap", de: "billig", fr: "pas cher" },
    "rico": { nl: "lekker", en: "tasty", de: "lecker", fr: "délicieux" },
    "rica": { nl: "lekker", en: "tasty", de: "lecker", fr: "délicieuse" },
    "delicioso": { nl: "heerlijk", en: "delicious", de: "köstlich", fr: "délicieux" },
    "deliciosa": { nl: "heerlijk", en: "delicious", de: "köstlich", fr: "délicieuse" },
    "interesante": { nl: "interessant", en: "interesting", de: "interessant", fr: "intéressant" },
    "aburrido": { nl: "saai", en: "boring", de: "langweilig", fr: "ennuyeux" },
    "aburrida": { nl: "saai", en: "boring", de: "langweilig", fr: "ennuyeuse" },
    "difícil": { nl: "moeilijk", en: "difficult", de: "schwierig", fr: "difficile" },
    "fácil": { nl: "makkelijk", en: "easy", de: "einfach", fr: "facile" },
    "contento": { nl: "blij", en: "happy", de: "glücklich", fr: "content" },
    "contenta": { nl: "blij", en: "happy", de: "glücklich", fr: "contente" },
    "feliz": { nl: "gelukkig", en: "happy", de: "glücklich", fr: "heureux" },
    "nervioso": { nl: "nerveus", en: "nervous", de: "nervös", fr: "nerveux" },
    "nerviosa": { nl: "nerveus", en: "nervous", de: "nervös", fr: "nerveuse" },
    "ocupado": { nl: "bezig", en: "busy", de: "beschäftigt", fr: "occupé" },
    "ocupada": { nl: "bezig", en: "busy", de: "beschäftigt", fr: "occupée" },
    "lento": { nl: "langzaam", en: "slow", de: "langsam", fr: "lent" },
    "lenta": { nl: "langzaam", en: "slow", de: "langsam", fr: "lente" },
    "rápido": { nl: "snel", en: "fast", de: "schnell", fr: "rapide" },
    "rápida": { nl: "snel", en: "fast", de: "schnell", fr: "rapide" },
    "tranquilo": { nl: "rustig", en: "calm", de: "ruhig", fr: "tranquille" },
    "tranquila": { nl: "rustig", en: "calm", de: "ruhig", fr: "tranquille" },
    "triste": { nl: "verdrietig", en: "sad", de: "traurig", fr: "triste" },
    "cansado": { nl: "moe", en: "tired", de: "müde", fr: "fatigué" },
    "cansada": { nl: "moe", en: "tired", de: "müde", fr: "fatiguée" },
    "enfermo": { nl: "ziek", en: "sick", de: "krank", fr: "malade" },
    "enferma": { nl: "ziek", en: "sick", de: "krank", fr: "malade" },
    "frío": { nl: "koud", en: "cold", de: "kalt", fr: "froid" },
    "fría": { nl: "koud", en: "cold", de: "kalt", fr: "froide" },
    "preocupado": { nl: "bezorgd", en: "worried", de: "besorgt", fr: "inquiet" },
    "preocupada": { nl: "bezorgd", en: "worried", de: "besorgt", fr: "inquiète" },
    "largo": { nl: "lang", en: "long", de: "lang", fr: "long" },
    "larga": { nl: "lang", en: "long", de: "lang", fr: "longue" },
    "corto": { nl: "kort", en: "short", de: "kurz", fr: "court" },
    "corta": { nl: "kort", en: "short", de: "kurz", fr: "courte" },
    "sano": { nl: "gezond", en: "healthy", de: "gesund", fr: "sain" },
    "sana": { nl: "gezond", en: "healthy", de: "gesund", fr: "saine" }
  };

  // Zelfstandige naamwoorden met geslacht (m, f, n) voor Duits en Frans
  var LEX_RAW = {
    "fin de semana": { nl: ["n", "weekend"], de: ["n", "Wochenende"], fr: ["m", "week-end"] },
    "semana": { nl: ["c", "week"], de: ["f", "Woche"], fr: ["f", "semaine"] },
    "trabajo": { nl: ["n", "werk"], de: ["f", "Arbeit"], fr: ["m", "travail"] },
    "amigo": { nl: ["c", "vriend"], de: ["m", "Freund"], fr: ["m", "ami"] },
    "amiga": { nl: ["c", "vriendin"], de: ["f", "Freundin"], fr: ["f", "amie"] },
    "cine": { nl: ["c", "bioscoop"], de: ["n", "Kino"], fr: ["m", "cinéma"] },
    "conejo": { nl: ["n", "konijn"], de: ["n", "Kaninchen"], fr: ["m", "lapin"] },
    "perro": { nl: ["c", "hond"], de: ["m", "Hund"], fr: ["m", "chien"] },
    "gato": { nl: ["c", "kat"], de: ["f", "Katze"], fr: ["m", "chat"] },
    "café": { nl: ["c", "koffie"], de: ["m", "Kaffee"], fr: ["m", "café"] },
    "hermano": { nl: ["c", "broer"], de: ["m", "Bruder"], fr: ["m", "frère"] },
    "hermana": { nl: ["c", "zus"], de: ["f", "Schwester"], fr: ["f", "sœur"] },
    "casa": { nl: ["n", "huis"], de: ["n", "Haus"], fr: ["f", "maison"] },
    "hora": { nl: ["n", "uur"], de: ["f", "Uhr"], fr: ["f", "heure"] },
    "tiempo": { nl: ["c", "tijd"], de: ["f", "Zeit"], fr: ["m", "temps"] },
    "día": { nl: ["c", "dag"], de: ["m", "Tag"], fr: ["m", "jour"] },
    "noche": { nl: ["c", "nacht"], de: ["f", "Nacht"], fr: ["f", "nuit"] },
    "libro": { nl: ["n", "boek"], de: ["n", "Buch"], fr: ["m", "livre"] },
    "parque": { nl: ["n", "park"] },
    "playa": { nl: ["n", "strand"] },
    "hospital": { nl: ["n", "ziekenhuis"] },
    "tarea": { nl: ["n", "huiswerk"] },
    "estación": { nl: ["n", "station"] },
    "tiempo": { nl: ["c", "tijd"] },
    "hora": { nl: ["n", "uur"] },
    "mesa": { nl: ["c", "tafel"] },
    "ciudad": { nl: ["c", "stad"] },
    "libro": { nl: ["n", "boek"] },
    "perro": { nl: ["c", "hond"] },
    "gato": { nl: ["c", "kat"] },
    "madre": { nl: ["c", "moeder"] },
    "padre": { nl: ["c", "vader"] },
    "hermana": { nl: ["c", "zus"] },
    "hermano": { nl: ["c", "broer"] },
    "año": { nl: ["n", "jaar"] },
    "dinero": { nl: ["n", "geld"] },
    "ayuda": { nl: ["c", "hulp"] },
    "casa": { nl: ["n", "huis"] },
    "amigo": { nl: ["c", "vriend"] },
    "amiga": { nl: ["c", "vriendin"] },
    "agua": { nl: ["n", "water"] },
    "película": { nl: ["c", "film"] },
    "cine": { nl: ["c", "bioscoop"] },
    "tienda": { nl: ["c", "winkel"] },
    "cocina": { nl: ["c", "keuken"] },
    "habitación": { nl: ["c", "kamer"] },
    "día": { nl: ["c", "dag"] },
    "semana": { nl: ["c", "week"] },
    "mujer": { nl: ["c", "vrouw"] },
    "hombre": { nl: ["c", "man"] },
    "música": { nl: ["c", "muziek"] },
    "pescado": { nl: ["n", "vis"] },
    "pan": { nl: ["n", "brood"] },
    "coche": { nl: ["c", "auto"], de: ["n", "Auto"], fr: ["f", "voiture"] },
    "mesa": { nl: ["c", "tafel"], de: ["m", "Tisch"], fr: ["f", "table"] },
    "ciudad": { nl: ["c", "stad"], de: ["f", "Stadt"], fr: ["f", "ville"] },
    "madre": { nl: ["c", "moeder"], de: ["f", "Mutter"], fr: ["f", "mère"] },
    "padre": { nl: ["c", "vader"], de: ["m", "Vater"], fr: ["m", "père"] },
    "familia": { nl: ["c", "familie"], de: ["f", "Familie"], fr: ["f", "famille"] },
    "escuela": { nl: ["c", "school"], de: ["f", "Schule"], fr: ["f", "école"] },
    "música": { nl: ["c", "muziek"], de: ["f", "Musik"], fr: ["f", "musique"] },
    "película": { nl: ["c", "film"], de: ["m", "Film"], fr: ["m", "film"] },
    "viaje": { nl: ["c", "reis"], de: ["f", "Reise"], fr: ["m", "voyage"] },
    "problema": { nl: ["n", "probleem"], de: ["n", "Problem"], fr: ["m", "problème"] },
    "dinero": { nl: ["n", "geld"], de: ["n", "Geld"], fr: ["m", "argent"] }
  };
  var LEXF = {};
  Object.keys(LEX_RAW).forEach(function (k) { LEXF[fold(k)] = LEX_RAW[k]; });

  var DEF = { nom: { m: "der", f: "die", n: "das" }, acc: { m: "den", f: "die", n: "das" }, dat: { m: "dem", f: "der", n: "dem" } };
  var IND = { nom: { m: "ein", f: "eine", n: "ein" }, acc: { m: "einen", f: "eine", n: "ein" }, dat: { m: "einem", f: "einer", n: "einem" } };
  var POSS_DE = {
    mein: { nom: { m: "mein", f: "meine", n: "mein" }, acc: { m: "meinen", f: "meine", n: "mein" }, dat: { m: "meinem", f: "meiner", n: "meinem" } },
    dein: { nom: { m: "dein", f: "deine", n: "dein" }, acc: { m: "deinen", f: "deine", n: "dein" }, dat: { m: "deinem", f: "deiner", n: "deinem" } }
  };

  // ---- Werkwoorden in de andere talen (Spaans lemma -> vorm per taal)
  var VERBS = {
    "ayudar": { en: { base: "help", past: "helped" }, de: { inf: "helfen", aux: "haben", pp: "geholfen", prt: ["half", "halfst", "half", "halfen", "halft", "halfen"], pres: ["helfe", "hilfst", "hilft", "helfen", "helft", "helfen"] }, fr: { inf: "aider", aux: "avoir", pp: "aidé", pres: ["aide", "aides", "aide", "aidons", "aidez", "aident"] } },
    "esperar": { en: { base: "hope", past: "hoped" }, de: { inf: "hoffen", aux: "haben", pp: "gehofft" }, fr: { inf: "espérer", aux: "avoir", pp: "espéré", pres: ["espère", "espères", "espère", "espérons", "espérez", "espèrent"] } },
    "preguntar": { en: { base: "ask", past: "asked" }, de: { inf: "fragen", aux: "haben", pp: "gefragt" }, fr: { inf: "demander", aux: "avoir", pp: "demandé", pres: ["demande", "demandes", "demande", "demandons", "demandez", "demandent"] } },
    "contestar": { en: { base: "answer", past: "answered" }, de: { inf: "antworten", aux: "haben", pp: "geantwortet" }, fr: { inf: "répondre", aux: "avoir", pp: "répondu", pres: ["réponds", "réponds", "répond", "répondons", "répondez", "répondent"] } },
    "terminar": { en: { base: "finish", past: "finished" }, de: { inf: "beenden", aux: "haben", pp: "beendet" }, fr: { inf: "finir", aux: "avoir", pp: "fini", pres: ["finis", "finis", "finit", "finissons", "finissez", "finissent"] } },
    "buscar": { en: { base: "look for", past: "looked for", s3: "looks for" }, de: { inf: "suchen", aux: "haben", pp: "gesucht" }, fr: { inf: "chercher", aux: "avoir", pp: "cherché", pres: ["cherche", "cherches", "cherche", "cherchons", "cherchez", "cherchent"] } },
    "encontrar": { en: { base: "find", past: "found" }, de: { inf: "finden", aux: "haben", pp: "gefunden", prt: ["fand", "fandest", "fand", "fanden", "fandet", "fanden"], pres: ["finde", "findest", "findet", "finden", "findet", "finden"] }, fr: { inf: "trouver", aux: "avoir", pp: "trouvé", pres: ["trouve", "trouves", "trouve", "trouvons", "trouvez", "trouvent"] } },
    "olvidar": { en: { base: "forget", past: "forgot" }, de: { inf: "vergessen", aux: "haben", pp: "vergessen", prt: ["vergaß", "vergaßest", "vergaß", "vergaßen", "vergaßt", "vergaßen"], pres: ["vergesse", "vergisst", "vergisst", "vergessen", "vergesst", "vergessen"] }, fr: { inf: "oublier", aux: "avoir", pp: "oublié", pres: ["oublie", "oublies", "oublie", "oublions", "oubliez", "oublient"] } },
    "perder": { en: { base: "lose", past: "lost" }, de: { inf: "verlieren", aux: "haben", pp: "verloren", prt: ["verlor", "verlorst", "verlor", "verloren", "verlort", "verloren"], pres: ["verliere", "verlierst", "verliert", "verlieren", "verliert", "verlieren"] }, fr: { inf: "perdre", aux: "avoir", pp: "perdu", pres: ["perds", "perds", "perd", "perdons", "perdez", "perdent"] } },
    "salir": { en: { base: "leave", past: "left" }, de: { inf: "ausgehen", aux: "sein", pp: "ausgegangen", pres: ["gehe aus", "gehst aus", "geht aus", "gehen aus", "geht aus", "gehen aus"] }, fr: { inf: "sortir", aux: "être", pp: "sorti", pres: ["sors", "sors", "sort", "sortons", "sortez", "sortent"] } },
    "abrir": { en: { base: "open", past: "opened" }, de: { inf: "öffnen", aux: "haben", pp: "geöffnet" }, fr: { inf: "ouvrir", aux: "avoir", pp: "ouvert", pres: ["ouvre", "ouvres", "ouvre", "ouvrons", "ouvrez", "ouvrent"] } },
    "cerrar": { en: { base: "close", past: "closed" }, de: { inf: "schließen", aux: "haben", pp: "geschlossen", prt: ["schloss", "schlossest", "schloss", "schlossen", "schlosst", "schlossen"], pres: ["schließe", "schließt", "schließt", "schließen", "schließt", "schließen"] }, fr: { inf: "fermer", aux: "avoir", pp: "fermé", pres: ["ferme", "fermes", "ferme", "fermons", "fermez", "ferment"] } },
    "seguir": { en: { base: "follow", past: "followed" }, de: { inf: "folgen", aux: "haben", pp: "gefolgt" }, fr: { inf: "suivre", aux: "avoir", pp: "suivi", pres: ["suis", "suis", "suit", "suivons", "suivez", "suivent"] } },
    "pagar": { en: { base: "pay", past: "paid" }, de: { inf: "bezahlen", aux: "haben", pp: "bezahlt" }, fr: { inf: "payer", aux: "avoir", pp: "payé", pres: ["paie", "paies", "paie", "payons", "payez", "paient"] } },
    "costar": { en: { base: "cost", past: "cost" }, de: { inf: "kosten", aux: "haben", pp: "gekostet" }, fr: { inf: "coûter", aux: "avoir", pp: "coûté", pres: ["coûte", "coûtes", "coûte", "coûtons", "coûtez", "coûtent"] } },
    "usar": { en: { base: "use", past: "used" }, de: { inf: "benutzen", aux: "haben", pp: "benutzt" }, fr: { inf: "utiliser", aux: "avoir", pp: "utilisé", pres: ["utilise", "utilises", "utilise", "utilisons", "utilisez", "utilisent"] } },
    "visitar": { en: { base: "visit", past: "visited" }, de: { inf: "besuchen", aux: "haben", pp: "besucht" }, fr: { inf: "visiter", aux: "avoir", pp: "visité", pres: ["visite", "visites", "visite", "visitons", "visitez", "visitent"] } },
    "viajar": { en: { base: "travel", past: "traveled" }, de: { inf: "reisen", aux: "sein", pp: "gereist" }, fr: { inf: "voyager", aux: "avoir", pp: "voyagé", pres: ["voyage", "voyages", "voyage", "voyageons", "voyagez", "voyagent"] } },
    "preparar": { en: { base: "prepare", past: "prepared" }, de: { inf: "vorbereiten", aux: "haben", pp: "vorbereitet", pres: ["bereite vor", "bereitest vor", "bereitet vor", "bereiten vor", "bereitet vor", "bereiten vor"] }, fr: { inf: "préparer", aux: "avoir", pp: "préparé", pres: ["prépare", "prépares", "prépare", "préparons", "préparez", "préparent"] } },
    "limpiar": { en: { base: "clean", past: "cleaned" }, de: { inf: "putzen", aux: "haben", pp: "geputzt" }, fr: { inf: "nettoyer", aux: "avoir", pp: "nettoyé", pres: ["nettoie", "nettoies", "nettoie", "nettoyons", "nettoyez", "nettoient"] } },
    "pensar": { en: { base: "think", past: "thought" }, de: { inf: "denken", aux: "haben", pp: "gedacht", prt: ["dachte", "dachtest", "dachte", "dachten", "dachtet", "dachten"] }, fr: { inf: "penser", aux: "avoir", pp: "pensé", pres: ["pense", "penses", "pense", "pensons", "pensez", "pensent"] } },
    "sentir": { en: { base: "feel", past: "felt" }, de: { inf: "fühlen", aux: "haben", pp: "gefühlt" }, fr: { inf: "sentir", aux: "avoir", pp: "senti", pres: ["sens", "sens", "sent", "sentons", "sentez", "sentent"] } },
    "creer": { en: { base: "believe", past: "believed" }, de: { inf: "glauben", aux: "haben", pp: "geglaubt" }, fr: { inf: "croire", aux: "avoir", pp: "cru", pres: ["crois", "crois", "croit", "croyons", "croyez", "croient"] } },
    "conocer": { en: { base: "know", past: "knew" }, de: { inf: "kennen", aux: "haben", pp: "gekannt", prt: ["kannte", "kanntest", "kannte", "kannten", "kanntet", "kannten"], pres: ["kenne", "kennst", "kennt", "kennen", "kennt", "kennen"] }, fr: { inf: "connaître", aux: "avoir", pp: "connu", pres: ["connais", "connais", "connaît", "connaissons", "connaissez", "connaissent"] } },
    "ganar": { en: { base: "win", past: "won" }, de: { inf: "gewinnen", aux: "haben", pp: "gewonnen", prt: ["gewann", "gewannst", "gewann", "gewannen", "gewannt", "gewannen"], pres: ["gewinne", "gewinnst", "gewinnt", "gewinnen", "gewinnt", "gewinnen"] }, fr: { inf: "gagner", aux: "avoir", pp: "gagné", pres: ["gagne", "gagnes", "gagne", "gagnons", "gagnez", "gagnent"] } },
    "poner": { en: { base: "put", past: "put" }, de: { inf: "legen", aux: "haben", pp: "gelegt" }, fr: { inf: "mettre", aux: "avoir", pp: "mis", pres: ["mets", "mets", "met", "mettons", "mettez", "mettent"] } },
    "traer": { en: { base: "bring", past: "brought" }, de: { inf: "bringen", aux: "haben", pp: "gebracht", prt: ["brachte", "brachtest", "brachte", "brachten", "brachtet", "brachten"], pres: ["bringe", "bringst", "bringt", "bringen", "bringt", "bringen"] }, fr: { inf: "apporter", aux: "avoir", pp: "apporté", pres: ["apporte", "apportes", "apporte", "apportons", "apportez", "apportent"] } },
    "conducir": { en: { base: "drive", past: "drove" }, de: { inf: "fahren", aux: "haben", pp: "gefahren", prt: ["fuhr", "fuhrst", "fuhr", "fuhren", "fuhrt", "fuhren"], pres: ["fahre", "fährst", "fährt", "fahren", "fahrt", "fahren"] }, fr: { inf: "conduire", aux: "avoir", pp: "conduit", pres: ["conduis", "conduis", "conduit", "conduisons", "conduisez", "conduisent"] } },
    "aprender": { en: { base: "learn", past: "learned" }, de: { inf: "lernen", aux: "haben", pp: "gelernt" }, fr: { inf: "apprendre", aux: "avoir", pp: "appris", pres: ["apprends", "apprends", "apprend", "apprenons", "apprenez", "apprennent"] } },
    "comprender": { en: { base: "understand", past: "understood" }, de: { inf: "verstehen", aux: "haben", pp: "verstanden", prt: ["verstand", "verstandest", "verstand", "verstanden", "verstandet", "verstanden"], pres: ["verstehe", "verstehst", "versteht", "verstehen", "versteht", "verstehen"] }, fr: { inf: "comprendre", aux: "avoir", pp: "compris", pres: ["comprends", "comprends", "comprend", "comprenons", "comprenez", "comprennent"] } },
    "llevar": { en: { base: "carry", past: "carried" }, de: { inf: "tragen", aux: "haben", pp: "getragen", prt: ["trug", "trugst", "trug", "trugen", "trugt", "trugen"], pres: ["trage", "trägst", "trägt", "tragen", "tragt", "tragen"] }, fr: { inf: "porter", aux: "avoir", pp: "porté", pres: ["porte", "portes", "porte", "portons", "portez", "portent"] } },
    "romper": { en: { base: "break", past: "broke" }, de: { inf: "brechen", aux: "haben", pp: "gebrochen", prt: ["brach", "brachst", "brach", "brachen", "bracht", "brachen"], pres: ["breche", "brichst", "bricht", "brechen", "brecht", "brechen"] }, fr: { inf: "casser", aux: "avoir", pp: "cassé", pres: ["casse", "casses", "casse", "cassons", "cassez", "cassent"] } },
    "llamar": { en: { base: "call", past: "called" }, de: { inf: "anrufen", aux: "haben", pp: "angerufen", pres: ["rufe an", "rufst an", "ruft an", "rufen an", "ruft an", "rufen an"] }, fr: { inf: "appeler", aux: "avoir", pp: "appelé", pres: ["appelle", "appelles", "appelle", "appelons", "appelez", "appellent"] } },
    "pedir": { en: { base: "order", past: "ordered" }, de: { inf: "bestellen", aux: "haben", pp: "bestellt" }, fr: { inf: "commander", aux: "avoir", pp: "commandé", pres: ["commande", "commandes", "commande", "commandons", "commandez", "commandent"] } },
    "dejar": { en: { base: "let", past: "let" }, de: { inf: "lassen", aux: "haben", pp: "gelassen", prt: ["ließ", "ließest", "ließ", "ließen", "ließt", "ließen"], pres: ["lasse", "lässt", "lässt", "lassen", "lasst", "lassen"] }, fr: { inf: "laisser", aux: "avoir", pp: "laissé", pres: ["laisse", "laisses", "laisse", "laissons", "laissez", "laissent"] } },
    "nadar": { en: { base: "swim", past: "swam" }, de: { inf: "schwimmen", aux: "sein", pp: "geschwommen", prt: ["schwamm", "schwammst", "schwamm", "schwammen", "schwammt", "schwammen"], pres: ["schwimme", "schwimmst", "schwimmt", "schwimmen", "schwimmt", "schwimmen"] }, fr: { inf: "nager", aux: "avoir", pp: "nagé", pres: ["nage", "nages", "nage", "nageons", "nagez", "nagent"] } },
    "caminar": { en: { base: "walk", past: "walked" }, de: { inf: "laufen", aux: "sein", pp: "gelaufen", prt: ["lief", "liefst", "lief", "liefen", "lieft", "liefen"], pres: ["laufe", "läufst", "läuft", "laufen", "lauft", "laufen"] }, fr: { inf: "marcher", aux: "avoir", pp: "marché", pres: ["marche", "marches", "marche", "marchons", "marchez", "marchent"] } },
    "dibujar": { en: { base: "draw", past: "drew" }, de: { inf: "zeichnen", aux: "haben", pp: "gezeichnet" }, fr: { inf: "dessiner", aux: "avoir", pp: "dessiné", pres: ["dessine", "dessines", "dessine", "dessinons", "dessinez", "dessinent"] } },
    "bailar": { en: { base: "dance", past: "danced" }, de: { inf: "tanzen", aux: "haben", pp: "getanzt" }, fr: { inf: "danser", aux: "avoir", pp: "dansé", pres: ["danse", "danses", "danse", "dansons", "dansez", "dansent"] } },
    "cantar": { en: { base: "sing", past: "sang" }, de: { inf: "singen", aux: "haben", pp: "gesungen", prt: ["sang", "sangst", "sang", "sangen", "sangt", "sangen"], pres: ["singe", "singst", "singt", "singen", "singt", "singen"] }, fr: { inf: "chanter", aux: "avoir", pp: "chanté", pres: ["chante", "chantes", "chante", "chantons", "chantez", "chantent"] } },
    "entrar": { en: { base: "enter", past: "entered" }, de: { inf: "eintreten", aux: "sein", pp: "eingetreten", pres: ["trete ein", "trittst ein", "tritt ein", "treten ein", "tretet ein", "treten ein"] }, fr: { inf: "entrer", aux: "être", pp: "entré", pres: ["entre", "entres", "entre", "entrons", "entrez", "entrent"] } },
    "tomar": { en: { base: "take", past: "took" }, de: { inf: "nehmen", aux: "haben", pp: "genommen", prt: ["nahm", "nahmst", "nahm", "nahmen", "nahmt", "nahmen"], pres: ["nehme", "nimmst", "nimmt", "nehmen", "nehmt", "nehmen"] }, fr: { inf: "prendre", aux: "avoir", pp: "pris", pres: ["prends", "prends", "prend", "prenons", "prenez", "prennent"] } },
    "ser": { en: { be: true }, de: { inf: "sein", aux: "sein", pp: "gewesen", prt: ["war", "warst", "war", "waren", "wart", "waren"], pres: ["bin", "bist", "ist", "sind", "seid", "sind"] },
      fr: { inf: "être", aux: "avoir", pp: "été", pres: ["suis", "es", "est", "sommes", "êtes", "sont"] } },
    "estar": { en: { be: true }, de: { inf: "sein", aux: "sein", pp: "gewesen", prt: ["war", "warst", "war", "waren", "wart", "waren"], pres: ["bin", "bist", "ist", "sind", "seid", "sind"] },
      fr: { inf: "être", aux: "avoir", pp: "été", pres: ["suis", "es", "est", "sommes", "êtes", "sont"] } },
    "ir": { en: { base: "go", past: "went", s3: "goes" }, de: { inf: "gehen", aux: "sein", pp: "gegangen" },
      fr: { inf: "aller", aux: "être", pp: "allé", pres: ["vais", "vas", "va", "allons", "allez", "vont"] } },
    "tener": { en: { base: "have", past: "had", s3: "has" }, de: { inf: "haben", aux: "haben", pp: "gehabt", prt: ["hatte", "hattest", "hatte", "hatten", "hattet", "hatten"], pres: ["habe", "hast", "hat", "haben", "habt", "haben"] },
      fr: { inf: "avoir", aux: "avoir", pp: "eu", pres: ["ai", "as", "a", "avons", "avez", "ont"] } },
    "hacer": { en: { base: "do", past: "did", s3: "does" }, de: { inf: "machen", aux: "haben", pp: "gemacht" },
      fr: { inf: "faire", aux: "avoir", pp: "fait", pres: ["fais", "fais", "fait", "faisons", "faites", "font"] } },
    "decir": { en: { base: "say", past: "said", s3: "says" }, de: { inf: "sagen", aux: "haben", pp: "gesagt" },
      fr: { inf: "dire", aux: "avoir", pp: "dit", pres: ["dis", "dis", "dit", "disons", "dites", "disent"] } },
    "ver": { en: { base: "see", past: "saw", s3: "sees" }, de: { inf: "sehen", aux: "haben", pp: "gesehen", pres: ["sehe", "siehst", "sieht", "sehen", "seht", "sehen"] },
      fr: { inf: "voir", aux: "avoir", pp: "vu", pres: ["vois", "vois", "voit", "voyons", "voyez", "voient"] } },
    "poder": { en: { modal: true, base: "can", past: "could" }, de: { inf: "können", aux: "haben", pp: "gekonnt", prt: ["konnte", "konntest", "konnte", "konnten", "konntet", "konnten"], pres: ["kann", "kannst", "kann", "können", "könnt", "können"] },
      fr: { inf: "pouvoir", aux: "avoir", pp: "pu", pres: ["peux", "peux", "peut", "pouvons", "pouvez", "peuvent"] } },
    "querer": { en: { base: "want", past: "wanted", s3: "wants" }, de: { inf: "wollen", aux: "haben", pp: "gewollt", prt: ["wollte", "wolltest", "wollte", "wollten", "wolltet", "wollten"], pres: ["will", "willst", "will", "wollen", "wollt", "wollen"] },
      fr: { inf: "vouloir", aux: "avoir", pp: "voulu", pres: ["veux", "veux", "veut", "voulons", "voulez", "veulent"] } },
    "saber": { en: { base: "know", past: "knew", s3: "knows" }, de: { inf: "wissen", aux: "haben", pp: "gewusst", prt: ["wusste", "wusstest", "wusste", "wussten", "wusstet", "wussten"], pres: ["weiß", "weißt", "weiß", "wissen", "wisst", "wissen"] },
      fr: { inf: "savoir", aux: "avoir", pp: "su", pres: ["sais", "sais", "sait", "savons", "savez", "savent"] } },
    "dar": { en: { base: "give", past: "gave", s3: "gives" }, de: { inf: "geben", aux: "haben", pp: "gegeben", pres: ["gebe", "gibst", "gibt", "geben", "gebt", "geben"] },
      fr: { inf: "donner", aux: "avoir", pp: "donné", pres: ["donne", "donnes", "donne", "donnons", "donnez", "donnent"] } },
    "venir": { en: { base: "come", past: "came", s3: "comes" }, de: { inf: "kommen", aux: "sein", pp: "gekommen" },
      fr: { inf: "venir", aux: "être", pp: "venu", pres: ["viens", "viens", "vient", "venons", "venez", "viennent"] } },
    "leer": { en: { base: "read", past: "read", s3: "reads" }, de: { inf: "lesen", aux: "haben", pp: "gelesen", pres: ["lese", "liest", "liest", "lesen", "lest", "lesen"] },
      fr: { inf: "lire", aux: "avoir", pp: "lu", pres: ["lis", "lis", "lit", "lisons", "lisez", "lisent"] } },
    "dormir": { en: { base: "sleep", past: "slept", s3: "sleeps" }, de: { inf: "schlafen", aux: "haben", pp: "geschlafen", pres: ["schlafe", "schläfst", "schläft", "schlafen", "schlaft", "schlafen"] },
      fr: { inf: "dormir", aux: "avoir", pp: "dormi", pres: ["dors", "dors", "dort", "dormons", "dormez", "dorment"] } },
    "empezar": { en: { base: "start", past: "started", s3: "starts" }, de: { inf: "beginnen", aux: "haben", pp: "begonnen", pres: ["beginne", "beginnst", "beginnt", "beginnen", "beginnt", "beginnen"] },
      fr: { inf: "commencer", aux: "avoir", pp: "commencé", pres: ["commence", "commences", "commence", "commençons", "commencez", "commencent"] } },
    "entender": { en: { base: "understand", past: "understood", s3: "understands" }, de: { inf: "verstehen", aux: "haben", pp: "verstanden", pres: ["verstehe", "verstehst", "versteht", "verstehen", "versteht", "verstehen"] },
      fr: { inf: "comprendre", aux: "avoir", pp: "compris", pres: ["comprends", "comprends", "comprend", "comprenons", "comprenez", "comprennent"] } },
    "jugar": { en: { base: "play", past: "played", s3: "plays" }, de: { inf: "spielen", aux: "haben", pp: "gespielt" },
      fr: { inf: "jouer", aux: "avoir", pp: "joué", pres: ["joue", "joues", "joue", "jouons", "jouez", "jouent"] } },
    "comer": { en: { base: "eat", past: "ate", s3: "eats" }, de: { inf: "essen", aux: "haben", pp: "gegessen", pres: ["esse", "isst", "isst", "essen", "esst", "essen"] },
      fr: { inf: "manger", aux: "avoir", pp: "mangé", pres: ["mange", "manges", "mange", "mangeons", "mangez", "mangent"] } },
    "beber": { en: { base: "drink", past: "drank", s3: "drinks" }, de: { inf: "trinken", aux: "haben", pp: "getrunken" },
      fr: { inf: "boire", aux: "avoir", pp: "bu", pres: ["bois", "bois", "boit", "buvons", "buvez", "boivent"] } },
    "hablar": { en: { base: "talk", past: "talked", s3: "talks" }, de: { inf: "sprechen", aux: "haben", pp: "gesprochen", pres: ["spreche", "sprichst", "spricht", "sprechen", "sprecht", "sprechen"] },
      fr: { inf: "parler", aux: "avoir", pp: "parlé", pres: ["parle", "parles", "parle", "parlons", "parlez", "parlent"] } },
    "trabajar": { en: { base: "work", past: "worked", s3: "works" }, de: { inf: "arbeiten", aux: "haben", pp: "gearbeitet" },
      fr: { inf: "travailler", aux: "avoir", pp: "travaillé", pres: ["travaille", "travailles", "travaille", "travaillons", "travaillez", "travaillent"] } },
    "llegar": { en: { base: "arrive", past: "arrived", s3: "arrives" }, de: null,
      fr: { inf: "arriver", aux: "être", pp: "arrivé", pres: ["arrive", "arrives", "arrive", "arrivons", "arrivez", "arrivent"] } },
    "comprar": { en: { base: "buy", past: "bought", s3: "buys" }, de: { inf: "kaufen", aux: "haben", pp: "gekauft" },
      fr: { inf: "acheter", aux: "avoir", pp: "acheté", pres: ["achète", "achètes", "achète", "achetons", "achetez", "achètent"] } },
    "decidir": { en: { base: "decide", past: "decided", s3: "decides" }, de: { inf: "entscheiden", aux: "haben", pp: "entschieden" },
      fr: { inf: "décider", aux: "avoir", pp: "décidé", pres: ["décide", "décides", "décide", "décidons", "décidez", "décident"] } },
    "estudiar": { en: { base: "study", past: "studied", s3: "studies" }, de: { inf: "studieren", aux: "haben", pp: "studiert" },
      fr: { inf: "étudier", aux: "avoir", pp: "étudié", pres: ["étudie", "étudies", "étudie", "étudions", "étudiez", "étudient"] } },
    "vivir": { en: { base: "live", past: "lived", s3: "lives" }, de: { inf: "leben", aux: "haben", pp: "gelebt" },
      fr: { inf: "vivre", aux: "avoir", pp: "vécu", pres: ["vis", "vis", "vit", "vivons", "vivez", "vivent"] } },
    "cocinar": { en: { base: "cook", past: "cooked", s3: "cooks" }, de: { inf: "kochen", aux: "haben", pp: "gekocht" },
      fr: { inf: "cuisiner", aux: "avoir", pp: "cuisiné", pres: ["cuisine", "cuisines", "cuisine", "cuisinons", "cuisinez", "cuisinent"] } },
    "escuchar": { en: { base: "listen", past: "listened", s3: "listens" }, de: { inf: "hören", aux: "haben", pp: "gehört" },
      fr: { inf: "écouter", aux: "avoir", pp: "écouté", pres: ["écoute", "écoutes", "écoute", "écoutons", "écoutez", "écoutent"] } },
    "mirar": { en: { base: "look", past: "looked", s3: "looks" }, de: { inf: "schauen", aux: "haben", pp: "geschaut" },
      fr: { inf: "regarder", aux: "avoir", pp: "regardé", pres: ["regarde", "regardes", "regarde", "regardons", "regardez", "regardent"] } },
    "correr": { en: { base: "run", past: "ran", s3: "runs" }, de: { inf: "laufen", aux: "sein", pp: "gelaufen", pres: ["laufe", "läufst", "läuft", "laufen", "lauft", "laufen"] },
      fr: { inf: "courir", aux: "avoir", pp: "couru", pres: ["cours", "cours", "court", "courons", "courez", "courent"] } },
    "pasar": { en: { base: "happen", past: "happened", s3: "happens" }, de: { inf: "passieren", aux: "sein", pp: "passiert" }, fr: null },
    "escribir": { en: { base: "write", past: "wrote", s3: "writes" }, de: { inf: "schreiben", aux: "haben", pp: "geschrieben" },
      fr: { inf: "écrire", aux: "avoir", pp: "écrit", pres: ["écris", "écris", "écrit", "écrivons", "écrivez", "écrivent"] } },
    "llover": { en: { base: "rain", past: "rained" }, de: { inf: "regnen", aux: "haben", pp: "geregnet" }, fr: { inf: "pleuvoir", aux: "avoir", pp: "plu", pres: ["pleut", "pleut", "pleut", "pleuvent", "pleuvent", "pleuvent"] } },
    "nevar": { en: { base: "snow", past: "snowed" }, de: { inf: "schneien", aux: "haben", pp: "geschneit" }, fr: { inf: "neiger", aux: "avoir", pp: "neigé", pres: ["neige", "neige", "neige", "neigent", "neigent", "neigent"] } },
    "durar": { en: { base: "last", past: "lasted" }, de: { inf: "dauern", aux: "haben", pp: "gedauert" }, fr: { inf: "durer", aux: "avoir", pp: "duré", pres: ["dure", "dures", "dure", "durons", "durez", "durent"] } },
    "subir": { en: { base: "get on", past: "got on" }, de: { inf: "einsteigen", aux: "sein", pp: "eingestiegen" }, fr: { inf: "monter", aux: "être", pp: "monté", pres: ["monte", "montes", "monte", "montons", "montez", "montent"] } },
    "bajar": { en: { base: "get off", past: "got off" }, de: { inf: "aussteigen", aux: "sein", pp: "ausgestiegen" }, fr: { inf: "descendre", aux: "être", pp: "descendu", pres: ["descends", "descends", "descend", "descendons", "descendez", "descendent"] } },
    "cambiar": { en: { base: "change", past: "changed" }, de: { inf: "ändern", aux: "haben", pp: "geändert" }, fr: { inf: "changer", aux: "avoir", pp: "changé", pres: ["change", "changes", "change", "changeons", "changez", "changent"] } },
    "doblar": { en: { base: "turn", past: "turned" }, de: { inf: "abbiegen", aux: "sein", pp: "abgebogen" }, fr: { inf: "tourner", aux: "avoir", pp: "tourné", pres: ["tourne", "tournes", "tourne", "tournons", "tournez", "tournent"] } },
    "cruzar": { en: { base: "cross", past: "crossed" }, de: { inf: "überqueren", aux: "haben", pp: "überquert" }, fr: { inf: "traverser", aux: "avoir", pp: "traversé", pres: ["traverse", "traverses", "traverse", "traversons", "traversez", "traversent"] } },
    "reservar": { en: { base: "reserve", past: "reserved" }, de: { inf: "reservieren", aux: "haben", pp: "reserviert" }, fr: { inf: "réserver", aux: "avoir", pp: "réservé", pres: ["réserve", "réserves", "réserve", "réservons", "réservez", "réservent"] } },
    "deber": { en: { base: "have to", past: "had to", s3: "has to" }, de: { inf: "müssen", aux: "haben", pp: "gemusst", pres: ["muss", "musst", "muss", "müssen", "müsst", "müssen"] }, fr: { inf: "devoir", aux: "avoir", pp: "dû", pres: ["dois", "dois", "doit", "devons", "devez", "doivent"] } },
    "contar": { en: { base: "tell", past: "told" }, de: { inf: "erzählen", aux: "haben", pp: "erzählt" }, fr: { inf: "raconter", aux: "avoir", pp: "raconté", pres: ["raconte", "racontes", "raconte", "racontons", "racontez", "racontent"] } },
    "volver": { en: { base: "come back", past: "came back" }, de: { inf: "zurückkommen", aux: "sein", pp: "zurückgekommen" }, fr: { inf: "revenir", aux: "être", pp: "revenu", pres: ["reviens", "reviens", "revient", "revenons", "revenez", "reviennent"] } }
  };
  var SEIN_PRES = ["bin", "bist", "ist", "sind", "seid", "sind"];
  var HABEN_PRES = ["habe", "hast", "hat", "haben", "habt", "haben"];
  var AVOIR_PRES = ["ai", "as", "a", "avons", "avez", "ont"];
  var ETRE_PRES = ["suis", "es", "est", "sommes", "êtes", "sont"];
  var ESNL = {};
  ES_VERBS.forEach(function (v) { ESNL[v.es] = v.nl; });

  function verbEntry(es, lang) {
    if (!has(VERBS, es) || !VERBS[es][lang]) throw new Error("werkwoord onbekend in " + lang);
    return VERBS[es][lang];
  }
  // Duitse regelmatige persoonsvormen (Präsens)
  function dePres(inf, p) {
    var stem = inf.slice(0, -2), e = /(d|t|m|n)$/.test(stem);
    if (p === 0) return stem + "e";
    if (p === 1) return stem + (e ? "est" : "st");
    if (p === 2 || p === 4) return stem + (e ? "et" : "t");
    return inf;
  }
  function s3Of(base) {
    if (/(s|sh|ch|x|o)$/.test(base)) return base + "es";
    if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + "ies";
    return base + "s";
  }
  function enV(es, tense, p) {
    var v = verbEntry(es, "en");
    if (v.be) return { kind: "be", main: tense === "pres" ? ["am", "are", "is", "are", "are", "are"][p] : ["was", "were", "was", "were", "were", "were"][p] };
    if (v.modal) return { kind: "modal", main: tense === "pres" ? "can" : "could" };
    var main = tense === "pres" ? (p === 2 ? (v.s3 || s3Of(v.base)) : v.base) : v.past;
    return { kind: "lex", main: main, base: v.base, do: tense === "pres" ? (p === 2 ? "does" : "do") : "did" };
  }
  function deV(es, tense, p) {
    var d = verbEntry(es, "de");
    if (tense === "pres") return { fin: d.pres ? d.pres[p] : dePres(d.inf, p), aux: null, pp: null };
    if (d.prt) return { fin: d.prt[p], aux: null, pp: null };
    return { fin: null, aux: (d.aux === "sein" ? SEIN_PRES : HABEN_PRES)[p], pp: d.pp };
  }
  function frV(es, tense, p) {
    var f = verbEntry(es, "fr");
    if (tense === "pres") return { fin: f.pres[p], aux: null, pp: null };
    return { fin: null, aux: (f.aux === "être" ? ETRE_PRES : AVOIR_PRES)[p], pp: f.pp };
  }

  // ---- Zelfstandige naamwoorden en woordgroepen (Duits en Frans)
  function matchNoun(toks, i, lang) {
    for (var n = 3; n >= 1; n--) {
      if (i + n <= toks.length) {
        var key = toks.slice(i, i + n).map(function (t) { return t.f; }).join(" ");
        if (has(LEXF, key) && LEXF[key][lang]) return { n: n, lex: LEXF[key][lang] };
      }
    }
    return null;
  }
  function itemsOf(toks, lang) {
    var items = [], i = 0, pend = null;
    while (i < toks.length) {
      var t = toks[i], f = t.f;
      if (f === "con" || f === "de" || f === "al") {
        if (pend) throw new Error("twee voorzetsels");
        pend = f; i++; continue;
      }
      if (f === "el" && i + 1 < toks.length && dayName(lang, toks[i + 1].f)) {
        if (pend) throw new Error("voorzetsel bij dag");
        items.push({ k: "day", name: dayName(lang, toks[i + 1].f) }); i += 2; continue;
      }
      if (DETS.indexOf(f) >= 0 && f !== "su") {
        var m = matchNoun(toks, i + 1, lang);
        if (!m) throw new Error("naamwoord onbekend");
        items.push({ k: "np", det: f, lex: m.lex, prep: pend }); pend = null; i += 1 + m.n; continue;
      }
      if (f === "mucho") {
        var m2 = matchNoun(toks, i + 1, lang);
        if (m2) { items.push({ k: "np", det: "mucho", lex: m2.lex, prep: pend }); pend = null; i += 1 + m2.n; continue; }
        if (pend) throw new Error("voorzetsel bij bijwoord");
        items.push({ k: "adv", f: f }); i++; continue;
      }
      if (pend === "al") {
        var m3 = matchNoun(toks, i, lang);
        if (m3) { items.push({ k: "np", det: "el", lex: m3.lex, prep: "al" }); pend = null; i += m3.n; continue; }
      }
      if (has(ADJ_T, f) || has(ADV_T, f)) {
        if (pend) throw new Error("voorzetsel bij bijvoeglijk naamwoord");
        items.push({ k: has(ADJ_T, f) ? "adj" : "adv", f: f }); i++; continue;
      }
      throw new Error("woord onbekend: " + t.w);
    }
    if (pend) throw new Error("voorzetsel zonder naamwoord");
    return items;
  }
  function npDE(it, role) {
    var g = it.lex[0], w = it.lex[1];
    var caseK = (it.prep === "con" || it.prep === "de") ? "dat" : (it.prep === "al" ? "acc" : role);
    var pre = it.prep === "con" ? "mit " : it.prep === "de" ? "von " : it.prep === "al" ? "in " : "";
    if (it.det === "mucho") return pre + "viel " + w;
    if (it.prep === "al" && it.det === "el" && g === "n") return "ins " + w;
    var art;
    if (it.det === "el" || it.det === "la") art = DEF[caseK][g];
    else if (it.det === "un" || it.det === "una") art = IND[caseK][g];
    else if (it.det === "mi") art = POSS_DE.mein[caseK][g];
    else if (it.det === "tu") art = POSS_DE.dein[caseK][g];
    if (!art) throw new Error("lidwoord onbekend");
    return pre + art + " " + w;
  }
  function frArt(det, g, w) {
    var vow = isVowel(w);
    if (det === "el" || det === "la") return vow ? "l'" : (g === "f" ? "la " : "le ");
    if (det === "un" || det === "una") return g === "f" ? "une " : "un ";
    if (det === "mi") return (g === "f" && !vow) ? "ma " : "mon ";
    if (det === "tu") return (g === "f" && !vow) ? "ta " : "ton ";
    throw new Error("lidwoord onbekend");
  }
  function npFR(it) {
    var g = it.lex[0], w = it.lex[1];
    if (it.det === "mucho") {
      if (it.prep) throw new Error("voorzetsel bij beaucoup");
      return isVowel(w) ? "beaucoup d'" + w : "beaucoup de " + w;
    }
    if (it.prep === "de") throw new Error("de + naamwoord niet ondersteund");
    if (it.prep === "al") {
      if (it.det !== "el") throw new Error("al zonder lidwoord");
      if (g === "m") return "au " + w;
      return isVowel(w) ? "à l'" + w : "à la " + w;
    }
    return (it.prep === "con" ? "avec " : "") + frArt(it.det, g, w) + w;
  }
  function renderItems(lang, items, role) {
    return items.map(function (it) {
      if (it.k === "np") return lang === "de" ? npDE(it, role) : npFR(it);
      if (it.k === "day") return lang === "de" ? "am " + it.name : it.name;
      var v = ADV_T[it.f] || ADJ_T[it.f];
      if (!v || !v[lang]) throw new Error("vertaling onbekend");
      return v[lang];
    }).join(" ");
  }

  // Woordgroep vertalen: Nederlands en Engels via de woordenlijst, Duits en Frans via de tabel
  function trans(lang, toks, wordFn) {
    var out = [], i = 0;
    while (i < toks.length) {
      var done = false;
      for (var sz = 3; sz >= 2 && !done; sz--) {
        if (i + sz <= toks.length) {
          var span = toks.slice(i, i + sz).map(function (t) { return t.w; }).join(" ");
          var pv = wordFn(span);
          if (pv) { out.push(pv); i += sz; done = true; }
        }
      }
      if (done) continue;
      var t = toks[i];
      if (t.f === "el" && i + 1 < toks.length && dayName(lang, toks[i + 1].f)) {
        var pr = DAYS[lang].prep;
        out.push((pr ? pr + " " : "") + dayName(lang, toks[i + 1].f)); i += 2; continue;
      }
      if (lang === "nl" && (t.w === "tu" || t.w === "tus")) { out.push("je"); i++; continue; }
      // Nederlands lidwoord: de of het volgt het geslacht uit de woordenlijst (el libro = het boek)
      if (lang === "nl" && (t.f === "el" || t.f === "la" || t.f === "los" || t.f === "las") && i + 1 < toks.length) {
        var nlG = (t.f === "el" || t.f === "la") ? gen(toks[i + 1].f, "nl") : null;
        out.push(nlG === "n" ? "het" : "de"); i++; continue;
      }
      if (lang === "en" && t.f === "mucho") {
        var nx0 = i + 1 < toks.length ? wordFn(toks[i + 1].w) : null;
        out.push(nx0 ? "a lot of" : "a lot"); i++; continue;
      }
      var v = wordFn(t.w);
      if (!v) throw new Error("woord onbekend: " + t.w);
      if (lang === "en" && (t.f === "un" || t.f === "una")) {
        var nx = i + 1 < toks.length ? wordFn(toks[i + 1].w) : null;
        if (nx && /^[aeiou]/i.test(nx)) v = "an";
      }
      out.push(v); i++;
    }
    return out;
  }
  function phrase(lang, toks, role, wordFn) {
    if (lang === "de" || lang === "fr") return renderItems(lang, itemsOf(toks, lang), role);
    return trans(lang, toks, wordFn).join(" ");
  }

  // ---- Ontleding van de Spaanse zin
  function parse(text) {
    var isQ = /[¿?]/.test(text);
    var words = text.toLowerCase().replace(/[¿¡?!.,;:()"«»…]/g, " ").split(/\s+/).filter(function (x) { return x; });
    if (!words.length) return null;
    var toks = words.map(function (w) { return { w: w, f: fold(w) }; });
    if (toks.some(function (t) { return t.f === "hace" || t.f === "hay"; })) return null; // idiomen niet vertalen
    toks.forEach(function (t, i) {
      var c = has(ESEX, t.w) ? ESEX[t.w] : (has(ESIDX, t.f) ? ESIDX[t.f] : null);
      if (!c) return;
      if (i === 0 && QW_KEYS.indexOf(t.f) >= 0) return; // "¿Cómo…?" is een vraagwoord, niet "como" (ik eet)
      if (i > 0 && NOUN_BEFORE.indexOf(toks[i - 1].w) >= 0) return; // "mucho trabajo" is een naamwoord
      var pick = c[0];
      if (c.length > 1) {
        var nxt = toks[i + 1] ? toks[i + 1].f : "";
        var wantIr = GO_NEXT.indexOf(nxt) >= 0;
        pick = c.filter(function (x) { return (x.es === "ir") === wantIr; })[0] || c[0];
      }
      t.v = pick;
    });
    // Opdelen in clausules
    var segs = [], cur = { conj: null, toks: [] };
    toks.forEach(function (t, i) {
      var key = null;
      if (i > 0) {
        if (t.f === "porque" || t.f === "que" || t.f === "cuando" || t.f === "y" || t.f === "pero") key = t.f;
      }
      if (key) {
        segs.push(cur);
        cur = { conj: { key: key, sub: ["porque", "que", "cuando"].indexOf(key) >= 0 }, toks: [] };
      } else cur.toks.push(t);
    });
    segs.push(cur);
    var merged = [];
    segs.forEach(function (s, idx) {
      var hasV = s.toks.some(function (t) { return t.v; });
      if (idx > 0 && !hasV && !s.conj.sub && merged.length) {
        var prev = merged[merged.length - 1];
        prev.toks.push({ w: s.conj.key, f: s.conj.key });
        s.toks.forEach(function (t) { prev.toks.push(t); });
      } else {
        merged.push({ conj: idx === 0 ? null : s.conj, toks: s.toks });
      }
    });
    if (merged.some(function (s) { return s.toks.filter(function (t) { return t.v; }).length !== 1; })) return null;
    return {
      isQ: isQ,
      segs: merged.map(function (s, idx) {
        var vi = -1;
        s.toks.forEach(function (t, i) { if (vi < 0 && t.v) vi = i; });
        var vt = s.toks[vi];
        var neg = s.toks.some(function (t) { return t.f === "no"; });
        var pre = s.toks.slice(0, vi).filter(function (t) { return t.f !== "no"; });
        var post = s.toks.slice(vi + 1).filter(function (t) { return t.f !== "no"; });
        var qw = null;
        if (idx === 0 && pre.length && QW_KEYS.indexOf(pre[0].f) >= 0) { qw = pre[0].f; pre = pre.slice(1); }
        var pron = null;
        if (pre.length && has(PRON_KEY, pre[pre.length - 1].w)) { pron = PRON_KEY[pre[pre.length - 1].w]; pre = pre.slice(0, -1); }
        var adv = pre.filter(function (t) { return ADVSET.indexOf(t.f) >= 0; });
        var np = pre.filter(function (t) { return ADVSET.indexOf(t.f) < 0; });
        var postNP = !!qw && post.length > 0 && (POSS_ES.indexOf(post[0].f) >= 0 ||
          (DETS.indexOf(post[0].f) >= 0 && !(post[1] && DAYS_ES.indexOf(post[1].f) >= 0)));
        return { conj: s.conj, qw: qw, pron: pron, neg: neg, adv: adv, np: np,
          verb: { es: vt.v.es, tense: vt.v.tense, p: vt.v.p, w: vt.w }, rest: post, postNP: postNP };
      })
    };
  }

  // ---- Zin opbouwen per taal
  function realize(lang, seg, wordFn, parts) {
    var v = seg.verb;
    var tense = v.tense === "pres" ? "pres" : "pret";
    var S = { p: v.p, tense: tense, neg: seg.neg, qw: null, subj: null, subjNP: null, adv: null, rest: "", postNP: seg.postNP, v: null };
    if (seg.qw) S.qw = QW[lang][seg.qw];
    if (seg.pron) S.subj = SUBJ[seg.pron][lang];
    if (seg.np.length) S.subjNP = phrase(lang, seg.np, "nom", wordFn);
    if (seg.adv.length) S.adv = phrase(lang, seg.adv, "acc", wordFn);
    S.timeOnly = seg.rest.length > 0 && seg.rest.every(function (t) {
      return has(ADV_T, t.f) || DAYS_ES.indexOf(t.f) >= 0 || t.f === "el";
    });
    if (seg.postNP) {
      if (S.subjNP) throw new Error("twee onderwerpen");
      S.subjNP = phrase(lang, seg.rest, "nom", wordFn);
    } else if (seg.rest.length) {
      S.rest = phrase(lang, seg.rest, "acc", wordFn);
    }
    if (lang === "nl") {
      var fin = nlVerb(ESNL[v.es], tense, v.p);
      var inv = (tense === "pres" && v.p === 1) ? nlVerb(ESNL[v.es], tense, 0) : fin;
      S.v = { fin: fin, inv: inv };
    } else if (lang === "en") {
      S.v = enV(v.es, tense, v.p);
    } else if (lang === "de") {
      S.v = deV(v.es, tense, v.p);
    } else {
      S.v = frV(v.es, tense, v.p);
    }
    var shown = S.v.fin || (S.v.aux ? S.v.aux + " " + S.v.pp : null) || S.v.main || S.v.inv || "";
    parts.push(v.w + " = " + shown + " (" + v.es + ", " + PERS[v.p] + ", " +
      (tense === "pres" ? "tegenwoordige tijd" : "verleden tijd") + ")");
    return S;
  }
  function asmNL(S, kind) {
    var verb = S.v.fin, verbI = S.v.inv;
    var subj = S.subj || S.subjNP || IMPL[S.p];
    var neg = S.neg ? "niet" : null;
    var parts;
    if (kind === "sub") parts = [subj, S.adv, neg, S.rest, verb];
    else if (kind === "wh") parts = [S.qw, verbI, subj, neg, S.rest];
    else if (kind === "yn") parts = [verbI, subj, neg, S.adv, S.rest];
    else parts = S.adv ? [S.adv, verb, subj, neg, S.rest] : [subj, verb, neg, S.rest];
    return parts.filter(Boolean).join(" ");
  }
  function asmEN(S, kind) {
    var v = S.v, subj = S.subj || S.subjNP || IMPLS.en[S.p];
    var parts;
    if (kind === "wh" || kind === "yn") {
      var qp = S.qw ? [S.qw] : [];
      if (v.kind === "lex") parts = qp.concat([v.do, subj, S.neg ? "not" : null, v.base, S.rest]);
      else parts = qp.concat([v.main, subj, S.neg ? "not" : null, S.rest]);
    } else {
      parts = [S.adv, subj];
      if (v.kind === "be") parts.push(v.main + (S.neg ? " not" : ""));
      else if (v.kind === "modal") parts.push(S.neg ? (v.main === "can" ? "cannot" : "could not") : v.main);
      else if (S.neg) parts.push(v.do, "not", v.base);
      else parts.push(v.main);
      parts.push(S.rest);
    }
    return parts.filter(Boolean).join(" ");
  }
  function asmDE(S, kind) {
    var v = S.v, sj = S.subj || S.subjNP || IMPLS.de[S.p];
    var fa = v.aux || v.fin, neg = S.neg ? "nicht" : null, parts;
    // Bij tijdsbepalingen na het werkwoord komt "nicht" achteraan: "isst heute nicht"
    var nb = S.timeOnly ? null : neg, na = S.timeOnly ? neg : null;
    if (kind === "sub") parts = [sj, nb, S.rest, na, v.pp, v.aux || v.fin];
    else if (kind === "wh") parts = [S.qw, fa, sj, nb, S.rest, na, v.pp];
    else if (kind === "yn") parts = [fa, sj, nb, S.rest, na, v.pp];
    else if (S.adv) parts = [S.adv, fa, sj, nb, S.rest, na, v.pp];
    else parts = [sj, fa, nb, S.rest, na, v.pp];
    return parts.filter(Boolean).join(" ");
  }
  function asmFR(S, kind) {
    var v = S.v, first = v.aux || v.fin, neg = S.neg;
    var vpart = neg ? (isVowel(first) ? "n'" + first : "ne " + first) : first;
    var pas = neg ? "pas" : null;
    var nounSubj = !S.subj && S.subjNP ? S.subjNP : null;
    var subj = S.subj || nounSubj || IMPLS.fr[S.p];
    var clause = nounSubj ? nounSubj + " " + vpart
      : (subj === "je" && !neg && isVowel(first) ? "j'" + first : subj + " " + vpart);
    var parts;
    if (kind === "sub") parts = [clause, pas, v.pp, S.rest];
    else if (kind === "yn") parts = ["Est-ce que", clause, pas, v.pp, S.rest];
    else if (kind === "wh") {
      if (S.qw === QW.fr.que) parts = [S.qw, clause, pas, v.pp, S.rest];
      else if (nounSubj) parts = [S.qw, vpart, v.pp, nounSubj, S.rest];
      else parts = [S.qw, "est-ce que", clause, pas, v.pp, S.rest];
    } else parts = [S.adv, clause, pas, v.pp, S.rest];
    return parts.filter(Boolean).join(" ");
  }
  function conjWord(conj, lang, S) {
    if (conj.key === "cuando") {
      if (lang === "nl") return S.tense === "pret" ? "toen" : "als";
      if (lang === "de") return S.tense === "pret" ? "als" : "wenn";
    }
    return CONJ[conj.key][lang];
  }

  // "me/te/nos gusta(n) X" heeft een eigen vorm: het onderwerp van de Nederlandse, Engelse, Duitse en Franse zin is
  // de persoon die iets leuk vindt. Geeft null als de zin niet over "gustar" gaat.
  function gustar(lang, text, wordFn) {
    var isQ = /[¿?]/.test(text);
    var words = text.toLowerCase().replace(/[¿¡?!.,;:()"«»…]/g, " ").split(/\s+/).filter(function (x) { return x; });
    var neg = false;
    if (words[0] === "no") { neg = true; words = words.slice(1); }
    if (words.length < 3 || ["me", "te", "nos"].indexOf(words[0]) < 0 || (words[1] !== "gusta" && words[1] !== "gustan")) return null;
    var who = words[0], objW = words.slice(2);
    var mucho = objW.length === 1 && objW[0] === "mucho";
    if (mucho && (isQ || neg || who !== "me")) return null;
    var obj = mucho ? "" : phrase(lang, objW.map(function (w) { return { w: w, f: fold(w) }; }), "acc", wordFn);
    var out;
    if (lang === "nl") {
      if (mucho) out = "Ik vind het erg leuk";
      else if (who === "te") out = (isQ ? "Vind je " : "Je vindt ") + obj + (neg ? " niet" : "") + " leuk";
      else out = (who === "me" ? "Ik vind " : "Wij vinden ") + obj + (neg ? " niet" : "") + " leuk";
    } else if (lang === "en") {
      if (mucho) out = "I like it a lot";
      else if (who === "te" && isQ) out = "Do you" + (neg ? " not" : "") + " like " + obj;
      else out = (who === "me" ? "I" : who === "nos" ? "we" : "you") + (neg ? " do not" : "") + " like " + obj;
    } else if (lang === "de") {
      if (mucho) out = "Ich mag es sehr";
      else if (who === "te") out = (isQ ? "Magst du " : "Du magst ") + obj + (neg ? " nicht" : "");
      else out = (who === "me" ? "Ich mag " : "Wir mögen ") + obj + (neg ? " nicht" : "");
    } else {
      if (mucho) out = "J'aime beaucoup";
      else if (who === "te") out = "Tu " + (neg ? "n'aimes pas " : "aimes ") + obj;
      else if (who === "nos") out = "Nous " + (neg ? "n'aimons pas " : "aimons ") + obj;
      else out = (neg ? "Je n'aime pas " : "J'aime ") + obj;
    }
    if (isQ) out += lang === "fr" ? " ?" : "?";
    return { text: cap(out), parts: [] };
  }

  // Weer: "hace frío" / "hace mucho calor" is één uitdrukking ("het is erg koud"), geen werkwoord met een bijvoeglijk naamwoord
  var WX = {
    frío: { nl: "koud", en: "cold", de: "kalt", fr: "froid" },
    calor: { nl: "warm", en: "hot", de: "warm", fr: "chaud" }
  };
  var WX_INT = {
    mucho: { nl: "erg", en: "very", de: "sehr", fr: "très" },
    muy: { nl: "erg", en: "very", de: "sehr", fr: "très" },
    bastante: { nl: "nogal", en: "quite", de: "ziemlich", fr: "assez" }
  };
  function weather(text, lang) {
    var m = /^\s*hace (?:(mucho|muy|bastante) )?(frío|calor)\s*[.!?¡]*\s*$/i.exec(text);
    if (!m) return null;
    var w = WX[m[2].toLowerCase()][lang];
    var it = m[1] ? WX_INT[m[1].toLowerCase()][lang] : null;
    var core = (it ? it + " " : "") + w;
    var out = { nl: "Het is " + core + ".", en: "It is " + core + ".", de: "Es ist " + core + ".", fr: "Il fait " + core + "." }[lang];
    return out ? { text: out, parts: null, missing: [] } : null;
  }

  function translate(text, wordFn, lang) {
    lang = lang || "nl";
    try {
      var wx = weather(text, lang);
      if (wx) return wx;
      var gu = gustar(lang, text, wordFn);
      if (gu) return gu;
      var P = parse(text);
      if (!P) return null;
      var parts = [];
      var pieces = P.segs.map(function (seg, idx) {
        var S = realize(lang, seg, wordFn, parts);
        var kind = (P.isQ && idx === 0 && S.qw) ? "wh" : (P.isQ && idx === 0) ? "yn" : (seg.conj && seg.conj.sub) ? "sub" : "decl";
        var s = lang === "nl" ? asmNL(S, kind) : lang === "en" ? asmEN(S, kind) : lang === "de" ? asmDE(S, kind) : asmFR(S, kind);
        if (idx > 0 && seg.conj) s = conjWord(seg.conj, lang, S) + " " + s;
        return s;
      });
      var txt = cap(pieces.join(lang === "de" ? ", " : " "));
      if (P.isQ) txt += lang === "fr" ? " ?" : "?";
      return { text: txt, parts: parts };
    } catch (e) {
      return null;
    }
  }

  // Losse naamwoordgroep met lidwoord, bijvoorbeeld voor de antwoorden van de app.
  // Geeft null als het zelfstandig naamwoord niet in de tabel staat.
  function np(lang, det, noun, role, prep) {
    try {
      var toks = [];
      if (prep) toks.push({ w: prep, f: fold(prep) });
      toks.push({ w: det, f: fold(det) });
      toks.push({ w: noun, f: fold(noun) });
      return renderItems(lang, itemsOf(toks, lang), role || "acc");
    } catch (e) {
      return null;
    }
  }

  // Geslacht van een zelfstandig naamwoord in een taal ("m", "f" of "n"), of null als het niet in de tabel staat
  function gen(noun, lang) {
    var e = LEXF[fold(noun)];
    return e && e[lang] ? e[lang][0] : null;
  }

  return { translate: translate, np: np, gen: gen, nlForms: NL_FORMS };
})();
