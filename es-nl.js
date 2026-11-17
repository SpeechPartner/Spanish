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
    deber:     { es: ["debo", "debes", "debe", "debemos", "deben"], d: ["moet", "moet", "moet", "moeten"], inf: "moeten", modal: true }
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

  // Persoonsindex: 0 yo, 1 tú, 2 él/ella/usted, 3 nosotros, 4 ellos/ustedes
  var PRON = { yo: 0, tu: 1, el: 2, ella: 2, usted: 2, nosotros: 3, nosotras: 3, ustedes: 4, vosotros: 4, ellos: 4, ellas: 4 };
  var SUBJ_NL = { 0: "ik", 1: "je", 3: "we", 4: "zij" };

  var PREP = { en: "in", a: "naar", con: "met", de: "van", para: "voor", sin: "zonder", sobre: "over", por: "door", desde: "vanaf", hasta: "tot" };
  var ADV = { hoy: "vandaag", manana: "morgen", ayer: "gisteren", ahora: "nu", siempre: "altijd", nunca: "nooit",
    tambien: "ook", todavia: "nog", bien: "goed", mal: "slecht", despacio: "langzaam", aqui: "hier", alli: "daar",
    allí: "daar", afuera: "buiten", solo: "alleen", ya: "al", poco: "weinig", mas: "meer", cerca: "dichtbij", lejos: "ver", casi: "bijna", tarde: "laat" };
  var WH = { que: "wat", donde: "waar", cuando: "wanneer", como: "hoe", cuanto: "hoeveel", quien: "wie", cual: "welke", por_que: "waarom" };

  var PROPER = { madrid: "Madrid", barcelona: "Barcelona", amsterdam: "Amsterdam", londres: "Londen", paris: "Parijs",
    espana: "Spanje", mexico: "Mexico", argentina: "Argentinië", francia: "Frankrijk", alemania: "Duitsland",
    "paises bajos": "Nederland", holanda: "Nederland", "nueva york": "New York" };
  // Nationaliteiten (mannelijk, vrouwelijk) en de Nederlandse woordvorm
  var NAT = { holandes: ["Nederlander", "Nederlandse"], holandesa: ["Nederlander", "Nederlandse"], espanol: ["Spanjaard", "Spaanse"], espanola: ["Spanjaard", "Spaanse"] };

  // Bijvoeglijke naamwoorden (predicaat)
  var ADJ = {
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
    strand: "stranden", station: "stations", film: "films", school: "scholen", koffie: "koffie's", water: "water",
    geld: "geld", pescado: "vis", vis: "vissen", werk: "werken", hulp: "hulp", honger: "honger", brood: "broden" };
  var NO_ART = { water: 1, geld: 1, tijd: 1, koffie: 1, hulp: 1, honger: 1, werk: 1, vis: 1, brood: 1 };

  // Zelfstandige naamwoorden waarvan de Nederlandse keuze afwijkt van het woordenboek
  var NOUN_NL = { tarea: "huiswerk", deberes: "huiswerk", cafe: "koffie", tiempo: "tijd", hora: "uur",
    padre: "vader", madre: "moeder", hermano: "broer", hermana: "zus", amigo: "vriend", amiga: "vriendin",
    profesor: "leraar", profesora: "lerares", medica: "arts", medico: "arts", hijo: "zoon", hija: "dochter",
    esposo: "man", esposa: "vrouw", novio: "vriend", novia: "vriendin", perro: "hond", gato: "kat" };

  function plural(nl) {
    if (PLURAL[nl]) return PLURAL[nl];
    if (/(el|em|en|er|or)$/.test(nl)) return nl + "s";
    if (/ie$/.test(nl)) return nl + "s";          // vakantie -> vakanties (geen apostrof bij -ie)
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

  // Zelfstandig naamwoord (Spaans enkelvoud) -> { nl, gen, plural } of null
  function noun(es, rev, gen) {
    var s = nf(es);
    if (NOUN_NL[s]) return { nl: NOUN_NL[s], gen: gen(s), plural: false, base: s };
    // Meervoud: eerst het enkelvoud zoeken (het woordenboek geeft meervouden al in het Nederlands)
    var base = s, pl = false, v;
    if (/es$/.test(s) && s.length > 4 && rev[s.slice(0, -2)] !== undefined) { base = s.slice(0, -2); pl = true; }
    else if (/s$/.test(s) && s.length > 3 && rev[s.slice(0, -1)] !== undefined) { base = s.slice(0, -1); pl = true; }
    v = NOUN_NL[base] !== undefined ? NOUN_NL[base] : rev[base];
    if (v === undefined && !pl) { v = rev[s]; base = s; }
    if (v === undefined || /\s/.test(v)) return null;
    return { nl: v, gen: gen(base), plural: pl, base: base };
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
    var nlN = isPl ? plural(nn.nl) : nn.nl;
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

  // Tekst van een predicaat: adjectief of naamwoord na ser/estar
  function predicateAdj(word) {
    var k = nf(word);
    return ADJ[k] !== undefined ? ADJ[k] : null;
  }

  // Nederlandse werkwoordsvorm voor een persoon. inv = omgekeerde volgorde (vraag)
  function dutchVerb(v, p, inv, past) {
    if (past) return PAST_NL[p];
    var d = VERBS[v].d;
    if (p === 0) return d[0];
    if (p === 1) return inv ? d[0] === "eet" ? "eet" : (d[1] === "gaat" ? "ga" : (d[1] === "weet" ? "weet" : d[1].replace(/t$/, ""))) : d[1];
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

  function translate(text, rev, gen) {
    if (!text || !rev || !gen) return null;
    rev = normRev(rev);
    var raw = String(text).trim();
    var isQ = /^¿/.test(raw) || /\?\s*$/.test(raw);
    var s = nf(raw).replace(/[¿?¡!.]/g, " ").replace(/\s+/g, " ").trim();
    var pleaseAdd = false, prefixNl = "";
    if (/,?\s*por favor$/.test(s)) { s = s.replace(/,?\s*por favor$/, ""); pleaseAdd = true; }
    var inter = /^(si|no) ,?/.exec(s.replace(/,\s*/, ", "));
    if (/^(si|no),/.test(s)) { prefixNl = /^si,/.test(s) ? "Ja, " : "Nee, "; s = s.replace(/^(si|no),\s*/, ""); }
    if (s.indexOf(",") >= 0) return null;
    var toks = s.split(" ").filter(Boolean);
    if (!toks.length) return null;

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

  function buildQuestionOrClause(toks, isQ, rev, gen, raw) {
    // Vraagwoord
    var w0 = toks[0];
    if (WH[w0] !== undefined && w0 !== "por") {
      var wq = WH[w0];
      var restQ = toks.slice(1);
      var fv = FORM[restQ[0]];
      if (w0 === "donde" && restQ[0] && FORM[restQ[0]] && FORM[restQ[0]].v === "estar") {
        var locQ = phrase(restQ, 1, rev, gen);
        if (!locQ || locQ.end !== restQ.length) return null;
        return "Waar " + (FORM[restQ[0]].p === 4 ? "zijn" : "is") + " " + locQ.s + "?";
      }
      if (fv) {
        var r = clauseParts(fv, restQ.slice(1), rev, gen, { inv: true, qw: wq });
        if (!r) return null;
        return r.replace(/\.$/, "") + "?";
      }
      if (w0 === "que" && restQ[0] === "hora") return null;
      return null;
    }
    // Ja/nee-vraag: werkwoord eerst (alleen bij een vraag)
    if (isQ && FORM[toks[0]]) {
      var fv2 = FORM[toks[0]];
      var r2 = clauseParts(fv2, toks.slice(1), rev, gen, { inv: true });
      if (!r2) return null;
      return r2.replace(/\.$/, "") + "?";
    }
    if (isQ) return null;
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
        return "Ik hou " + (emph ? "heel erg " : "") + "van " + gObj.replace(/^(de|het|een) /, "") + ".";
      }
      return null;
    }
    var verbIdx = -1, pastFv = null;
    for (var i = 0; i < toks.length; i++) {
      if (FORM[toks[i]]) { verbIdx = i; break; }
      if (PAST_GO[toks[i]] !== undefined) { verbIdx = i; pastFv = { v: "ir", p: PAST_GO[toks[i]], past: true }; break; }
    }
    if (verbIdx < 0) {
      // "hay" en "es/son" met een naamgroep zonder werkwoordsvorm uit de tabel
      return null;
    }
    var subjToks = toks.slice(0, verbIdx), fvM = pastFv || FORM[toks[verbIdx]];
    var rest = toks.slice(verbIdx + 1);
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
      subj = o.impersonal ? "het" : null;
    }
    var verbNL = dutchVerb(v, p, inv, fv.past);

    // Ser / estar + predicaat
    if (spec.copula) {
      var neg2 = neg;
      var words = restN;
      // "soy de X" = komen uit X (plaats)
      if (v === "ser" && words[0] === "de" && words.length >= 2 && PROPER[words[1]] !== undefined) {
        var place = PROPER[words[1]];
        var kv = p === 0 ? "kom" : (p === 4 ? "komen" : "komt");
        if (inv) return (kv + " " + (subj || "") + " uit " + place + "?").replace(/\s+/g, " ");
        return finalize(subj, kv, { pred: "uit " + place, neg: neg2, inv: false, o: o });
      }
      // "estoy en casa" / "estoy aquí" / "está en X"
      if (v === "estar" || (words[0] === "en" || words[0] === "aqui" || words[0] === "alli" || words[0] === "afuera")) {
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
        if (v === "poder" || v === "querer" || v === "deber") {
          var mod = dutchVerb(v, p, inv);
          var pieces = [];
          if (objPart) pieces.push(objPart);
          var restAdv = rest2.length ? phrase(rest2, 0, rev, gen) : null;
          if (rest2.length && (!restAdv || restAdv.end !== rest2.length)) return null;
          return finalize(subj, mod, { pred: null, neg: neg, inv: inv, o: o, inf: infNL, obj: pieces.length ? pieces.join(" ") : null, adv: restAdv ? restAdv.s : null, modal: true });
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
    var objDir = null, advs = [], j = 0, negObj = false;
    if (ph.length === 0) return finalize(subj, verbNL, { pred: null, neg: neg, inv: inv, o: o });
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
    var tailJoined = tailTxt.join(" ");
    var neg3 = neg;
    if (objDir && neg3) {
      var isDef = /^(de|het|mijn|je|onze|ons) /.test(objDir);
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
    ser: 1, estar: 1, costar: 1 };
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
      if (neg && !objD) seq.push("niet");
      if (pred) seq.push(pred);
      if (infT) seq.push(infT);
      if (tail) seq.push(tail);
      if (adv) seq.push(adv);
      var q = seq.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
      if (o.qw) q = o.qw + " " + q;
      return q;
    }
    var parts = [];
    if (front) { parts.push(front, verbNL); if (sb) parts.push(sb); }
    else { if (sb) parts.push(sb); parts.push(verbNL); }
    if (objD) parts.push(objD);
    if (neg && !objD) parts.push("niet");
    if (pred) parts.push(pred);
    if (infT) parts.push(infT);
    if (tail) parts.push(tail);
    if (adv) parts.push(adv);
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
  function translateNL(text, rev, gen) {
    var raw = String(text || "").trim();
    // Vervoermiddelen vertrekken: "el autobús sale" = "de bus vertrekt"
    raw = raw.replace(/^((?:el|la|los|las)\s+(?:autob[uú]s|autobuses|tren|trenes|avi[oó]n|aviones|metro|barco|tranv[ií]a)\s+)sale\b/i, "$1parte");
    var isQ = /\?/.test(raw) || /^¿/.test(raw);
    var tm = ES_TIME_END.exec(raw);
    if (tm && !isQ) {
      var tt = nlClock(tm[1], (tm[2] || "").toLowerCase());
      var head = raw.slice(0, tm.index).trim();
      var base = tt && head ? translate(head + ".", normRev(rev), gen) : null;
      if (!base) return null;
      return base.replace(/\.$/, "") + " " + tt + ".";
    }
    if (isQ && /\s(hoy|mañana|ayer|ahora)\s*\?\s*$/i.test(raw)) return null;
    if (/(^|\s)no\s+(hablo|hablas|habla|hablamos|hablan|aprendo|estudio|entiendo)\s+(un poco de\s+)?(español|inglés|alemán|francés|holandés|neerlandés|italiano)\b/i.test(raw)) return null;
    var m = /^(.*\S)\s+(hoy|mañana|ayer|ahora)\s*([.!]?)$/i.exec(raw);
    if (m && !/^(hoy|mañana|ayer|ahora)\b/i.test(raw)) {
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
      var nm = TAAL_NL[nf(lang[3])], add = (lang[2] ? "een beetje " : "") + nm;
      var w = out.replace(/[.?!]$/, "").split(" "), endP = /[.?!]$/.exec(out);
      // direct na de persoonsvorm en het onderwerp: "Ik spreek Spaans", "Spreek je Spaans?", "Morgen leer ik Spaans"
      var pos = /^(ik|je|jij|hij|zij|we|wij|u)$/i.test(w[0]) ? 2 : (/^(ik|je|jij|hij|zij|we|wij|u)$/i.test(w[1] || "") ? 2 : (/^(ik|je|jij|hij|zij|we|wij|u)$/i.test(w[2] || "") ? 3 : -1));
      if (pos < 0) return null;
      w.splice(pos, 0, add);
      return w.join(" ") + (endP ? endP[0] : ".");
    }
    out = translate(raw, rev, gen);
    if (out && /spanjaard|een weinig van/i.test(out) && /\b(un poco de|español)\b/i.test(raw) && !/\b(soy|eres|es|somos|son)\s+español/i.test(raw)) return null;
    return out;
  }
  return { translate: translateNL };
})();
