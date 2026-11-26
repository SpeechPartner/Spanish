// "Woord voor woord" onder een Spaanse zin: de betekenis van elk woord in de taal van de gebruiker.
// Volgorde: eigen uitleglijst (GLOSS) → kleine woorden (lidwoorden, voornaamwoorden, voegwoorden …) →
// woordenboek (REVS) → werkwoordsvorm via het hele werkwoord (agradezco → bedanken) → meervoud/vrouwelijk → "?".
var WOORDUITLEG = (function () {
  // Kleine woorden: [nl, en, de, fr]
  var KLEIN = {
    el: ["de", "the", "der", "le"], la: ["de", "the", "die", "la"], los: ["de", "the", "die", "les"], las: ["de", "the", "die", "les"],
    lo: ["het", "it", "es", "le"], un: ["een", "a", "ein", "un"], una: ["een", "a", "eine", "une"], unos: ["een paar", "some", "einige", "des"], unas: ["een paar", "some", "einige", "des"],
    al: ["naar de", "to the", "zum", "au"], del: ["van de", "of the", "vom", "du"],
    mi: ["mijn", "my", "mein", "mon"], mis: ["mijn", "my", "meine", "mes"], tu: ["je", "your", "dein", "ton"], tus: ["je", "your", "deine", "tes"],
    su: ["zijn/haar/uw", "his/her/your", "sein/ihr/Ihr", "son/sa/votre"], sus: ["zijn/haar/uw", "his/her/your", "seine/ihre/Ihre", "ses/vos"],
    nuestro: ["ons", "our", "unser", "notre"], nuestra: ["onze", "our", "unsere", "notre"], nuestros: ["onze", "our", "unsere", "nos"], nuestras: ["onze", "our", "unsere", "nos"],
    yo: ["ik", "I", "ich", "je"], "tú": ["jij", "you", "du", "tu"], "él": ["hij", "he", "er", "il"], ella: ["zij", "she", "sie", "elle"], usted: ["u", "you", "Sie", "vous"],
    nosotros: ["wij", "we", "wir", "nous"], nosotras: ["wij", "we", "wir", "nous"], ellos: ["zij", "they", "sie", "ils"], ellas: ["zij", "they", "sie", "elles"], ustedes: ["u (mv.)", "you (pl.)", "Sie (Pl.)", "vous"],
    me: ["me", "me", "mich/mir", "me"], te: ["je", "you", "dich/dir", "te"], le: ["hem/haar/u", "him/her/you", "ihm/ihr/Ihnen", "lui"], les: ["hun/u", "them/you", "ihnen/Ihnen", "leur"],
    nos: ["ons", "us", "uns", "nous"], os: ["jullie", "you", "euch", "vous"], se: ["zich", "oneself", "sich", "se"],
    "mí": ["mij", "me", "mich/mir", "moi"], ti: ["jou", "you", "dich/dir", "toi"], conmigo: ["met mij", "with me", "mit mir", "avec moi"], contigo: ["met jou", "with you", "mit dir", "avec toi"],
    y: ["en", "and", "und", "et"], e: ["en", "and", "und", "et"], o: ["of", "or", "oder", "ou"], u: ["of", "or", "oder", "ou"], pero: ["maar", "but", "aber", "mais"], que: ["dat/die", "that", "dass/der", "que"],
    porque: ["omdat", "because", "weil", "parce que"], si: ["als", "if", "wenn", "si"], "sí": ["ja", "yes", "ja", "oui"], no: ["niet/nee", "not/no", "nicht/nein", "ne pas/non"],
    cuando: ["wanneer", "when", "wenn", "quand"], como: ["zoals", "like", "wie", "comme"], aunque: ["hoewel", "although", "obwohl", "bien que"],
    a: ["naar/aan", "to", "zu/an", "à"], de: ["van", "of", "von", "de"], en: ["in", "in", "in", "en/dans"], con: ["met", "with", "mit", "avec"], sin: ["zonder", "without", "ohne", "sans"],
    por: ["voor/door", "for/by", "für/durch", "pour/par"], para: ["voor", "for", "für", "pour"], sobre: ["over", "about", "über", "sur"], entre: ["tussen", "between", "zwischen", "entre"],
    hasta: ["tot", "until", "bis", "jusqu'à"], desde: ["sinds/vanaf", "since/from", "seit/ab", "depuis"], hacia: ["naar", "towards", "nach", "vers"],
    muy: ["heel", "very", "sehr", "très"], mucho: ["veel", "a lot", "viel", "beaucoup"], mucha: ["veel", "a lot of", "viel", "beaucoup de"], muchos: ["veel", "many", "viele", "beaucoup de"], muchas: ["veel", "many", "viele", "beaucoup de"],
    todo: ["alles", "everything", "alles", "tout"], toda: ["heel", "all", "ganz", "toute"], todos: ["allemaal", "all", "alle", "tous"], todas: ["allemaal", "all", "alle", "toutes"],
    "más": ["meer", "more", "mehr", "plus"], menos: ["minder", "less", "weniger", "moins"], tan: ["zo", "so", "so", "si"], tanto: ["zoveel", "so much", "so viel", "tant"],
    "también": ["ook", "also", "auch", "aussi"], tampoco: ["ook niet", "neither", "auch nicht", "non plus"], ya: ["al", "already", "schon", "déjà"], "todavía": ["nog", "still", "noch", "encore"],
    aquí: ["hier", "here", "hier", "ici"], "allí": ["daar", "there", "dort", "là"], "ahí": ["daar", "there", "da", "là"], "así": ["zo", "like this", "so", "ainsi"],
    este: ["deze", "this", "dieser", "ce"], esta: ["deze", "this", "diese", "cette"], estos: ["deze", "these", "diese", "ces"], estas: ["deze", "these", "diese", "ces"],
    ese: ["die", "that", "der da", "ce"], esa: ["die", "that", "die da", "cette"], eso: ["dat", "that", "das", "ça"], esto: ["dit", "this", "das", "ceci"],
    algo: ["iets", "something", "etwas", "quelque chose"], nada: ["niets", "nothing", "nichts", "rien"], alguien: ["iemand", "someone", "jemand", "quelqu'un"], nadie: ["niemand", "nobody", "niemand", "personne"],
    otro: ["ander", "other", "anderer", "autre"], otra: ["andere", "other", "andere", "autre"], cada: ["elke", "every", "jeder", "chaque"],
    gracias: ["bedankt", "thanks", "danke", "merci"], diga: ["zeg", "say", "sag", "dis"], dime: ["zeg me", "tell me", "sag mir", "dis-moi"], dame: ["geef me", "give me", "gib mir", "donne-moi"], "muchísimo": ["heel erg", "very much", "sehr", "énormément"], "muchísimas": ["heel veel", "very many", "sehr viele", "énormément de"],
    pausa: ["pauze", "pause", "Pause", "pause"], vez: ["keer", "time", "Mal", "fois"], verdad: ["echt/waar", "really/true", "wirklich/wahr", "vraiment/vrai"], falta: ["nodig/gebrek", "need/lack", "nötig/Mangel", "besoin/manque"],
    buen: ["goed", "good", "gut", "bon"], gran: ["groot", "great", "groß", "grand"], provecho: ["smakelijk", "enjoy", "Mahlzeit", "appétit"], igualmente: ["insgelijks", "likewise", "gleichfalls", "pareillement"],
    "mío": ["van mij", "mine", "meins", "le mien"], "mía": ["van mij", "mine", "meine", "la mienne"], tuyo: ["van jou", "yours", "deins", "le tien"], tuya: ["van jou", "yours", "deine", "la tienne"], suyo: ["van hem/haar/u", "his/hers/yours", "seins/ihres", "le sien"],
    ha: ["heeft", "has", "hat", "a"], he: ["heb", "have", "habe", "ai"], han: ["hebben", "have", "haben", "ont"], hemos: ["hebben", "have", "haben", "avons"], "habéis": ["hebben", "have", "habt", "avez"], hayas: ["hebt", "have", "hast", "aies"], haya: ["heeft/er is", "has/there is", "hat/gibt", "ait/il y ait"],
    sea: ["is/zij", "is/be", "ist/sei", "soit"], seas: ["bent", "are", "bist", "sois"], onda: ["golf/sfeer", "wave/vibe", "Welle/Art", "onde/ambiance"], "alegría": ["vreugde", "joy", "Freude", "joie"],
    noticia: ["nieuws", "news", "Nachricht", "nouvelle"], equipo: ["team", "team", "Team", "équipe"], resumen: ["samenvatting", "summary", "Zusammenfassung", "résumé"], cifras: ["cijfers", "figures", "Zahlen", "chiffres"],
    "puré": ["puree", "mash", "Püree", "purée"], "albóndigas": ["gehaktballen", "meatballs", "Fleischbällchen", "boulettes"], hojas: ["bladeren", "leaves", "Blätter", "feuilles"], "holandés": ["Nederlands", "Dutch", "Niederländisch", "néerlandais"], hola: ["hallo", "hello", "hallo", "salut"], vale: ["oké", "okay", "okay", "d'accord"]
  };
  // Woorden die in een of meer woordenboeken ontbreken (hele werkwoorden en een paar zelfstandige naamwoorden)
  var AANVUL = {
    dedicar: ["besteden", "devote", "widmen", "consacrer"], recomendar: ["aanraden", "recommend", "empfehlen", "recommander"], preocupar: ["zorgen maken", "worry", "Sorgen machen", "inquiéter"],
    comprender: ["begrijpen", "understand", "verstehen", "comprendre"], fregar: ["afwassen", "wash up", "abwaschen", "faire la vaisselle"], apuntar: ["noteren", "note down", "notieren", "noter"],
    aterrizar: ["landen", "land", "landen", "atterrir"], echar: ["gooien/doen", "throw/put", "werfen/tun", "jeter/mettre"], gotear: ["lekken", "drip", "tropfen", "goutter"],
    sujetar: ["vasthouden", "hold", "festhalten", "tenir"], agradecer: ["bedanken", "thank", "danken", "remercier"], decir: ["zeggen", "say", "sagen", "dire"],
    necesitar: ["nodig hebben", "need", "brauchen", "avoir besoin"], poner: ["zetten/leggen", "put", "stellen/legen", "mettre"], pedir: ["vragen/bestellen", "ask/order", "bitten/bestellen", "demander/commander"],
    "razón": ["gelijk/reden", "right/reason", "Recht/Grund", "raison"], gratis: ["gratis", "free", "kostenlos", "gratuit"], oferta: ["aanbod", "offer", "Angebot", "offre"],
    momento: ["moment", "moment", "Moment", "moment"], especial: ["speciaal", "special", "besonders", "spécial"], curso: ["cursus", "course", "Kurs", "cours"]
  };
  var LI = { nl: 0, en: 1, de: 2, fr: 3 };
  function schoon(w) { return String(w).toLowerCase().replace(/[¿?¡!.,;:…"“”()«»]+/g, ""); }
  function fold(w) { return w.normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  var HUIDIG = 0;
  function uitRev(rev, w) {
    if (AANVUL[w] && AANVUL[w][HUIDIG] && !(rev && rev[w])) return AANVUL[w][HUIDIG];
    if (!rev) return undefined;
    if (rev[w] !== undefined) return rev[w];
    var f = fold(w);
    if (rev[f] !== undefined) return rev[f];
    return undefined;
  }
  // Betekenis van één Spaans woord in taal t; gloss = de eigen uitleglijst (GLOSS) met waarden {nl,en,de,fr}
  function woord(w, t, gloss) {
    var c = schoon(w);
    if (!c) return null;
    if (LI[t] !== undefined) HUIDIG = LI[t];
    if (gloss && gloss[c] && gloss[c][t]) return gloss[c][t];
    if (KLEIN[c] && LI[t] !== undefined) return KLEIN[c][LI[t]];
    var rev = typeof REVS !== "undefined" ? REVS[t] : null;
    var g = uitRev(rev, c);
    if (g !== undefined && g !== "") return g;
    // werkwoordsvorm: via het hele werkwoord
    if (typeof ZINC !== "undefined" && ZINC.ESF) {
      var hits = ZINC.ESF[c] || (ZINC.ESFF && ZINC.ESFF[ZINC.fold(c)]) || [];
      for (var i = 0; i < hits.length; i++) { var v = uitRev(rev, hits[i].v); if (v) return v; }
    }
    // aangehechte voornaamwoorden: pensarlo, dime, cuídate, dígame, ayudarme -> werkwoord + voornaamwoord
    var KL = ["melo", "mela", "melos", "melas", "telo", "tela", "selo", "sela", "selos", "selas", "noslo", "nosla", "me", "te", "se", "nos", "os", "lo", "la", "los", "las", "le", "les"];
    for (var q = 0; q < KL.length; q++) {
      var kz = KL[q];
      if (c.length <= kz.length + 2 || c.slice(-kz.length) !== kz) continue;
      var stam = fold(c.slice(0, -kz.length)), vw = /^(me|te|se|nos)(lo|la|los|las)$/.test(kz) ? kz.replace(/(lo|la|los|las)$/, "") : kz;
      var vb = uitRev(rev, stam) || (/[aei]$/.test(stam) ? uitRev(rev, stam + "r") : undefined) || woord(stam, t, null);
      if (vb && !/^[A-ZÁÉÍÓÚÑ]/.test(vb)) return KLEIN[vw] && LI[t] !== undefined ? vb + " + " + KLEIN[vw][LI[t]] : vb;
    }
    // gerundium: aprendiendo -> aprender, dando -> dar
    var gr = /^(.+)(ando|iendo|yendo)$/.exec(c);
    if (gr) { var g1 = gr[2] === "ando" ? uitRev(rev, gr[1] + "ar") : (uitRev(rev, gr[1] + "er") || uitRev(rev, gr[1] + "ir")); if (g1) return g1; }
    // voltooid deelwoord: pensado -> pensar
    var pd = /^(.+)(ado|ada|ados|adas)$/.exec(c), id = /^(.+)(ido|ida|idos|idas)$/.exec(c);
    if (pd) { var a1 = uitRev(rev, pd[1] + "ar"); if (a1) return a1; }
    if (id) { var a2 = uitRev(rev, id[1] + "er") || uitRev(rev, id[1] + "ir"); if (a2) return a2; }
    // overige werkwoordsvormen: uitgang eraf, -ar/-er/-ir erachter, klinkerwisseling terug (recomiendas -> recomendar)
    var UIT = ["aremos", "eremos", "iremos", "aréis", "eréis", "iréis", "arán", "erán", "irán", "aré", "eré", "iré", "ará", "erá", "irá", "arás", "erás", "irás",
      "amos", "emos", "imos", "áis", "éis", "ís", "aron", "ieron", "aba", "ía", "ó", "ió", "an", "en", "as", "es", "o", "a", "e", "é", "í", "aste", "iste"];
    for (var u = 0; u < UIT.length; u++) {
      if (c.length <= UIT[u].length + 1 || c.slice(-UIT[u].length) !== UIT[u]) continue;
      var st = fold(c.slice(0, -UIT[u].length)), stammen = [st, st.replace(/ie(?=[^aeiou]*$)/, "e"), st.replace(/ue(?=[^aeiou]*$)/, "o"), st.replace(/i(?=[^aeiou]*$)/, "e"), st.replace(/g$/, "").replace(/ong$/, "on")];
      if (/gu$/.test(st)) stammen.push(st.slice(0, -1));
      if (/j$/.test(st)) stammen.push(st.slice(0, -1) + "g");
      for (var k = 0; k < stammen.length; k++) for (var e2 = 0; e2 < 3; e2++) {
        var inf = stammen[k] + ["ar", "er", "ir"][e2], hit = uitRev(rev, inf);
        if (hit) return hit;
      }
    }
    // namen (Barcelona, Utrecht) blijven zichzelf
    if (/^[A-ZÁÉÍÓÚÑ]/.test(String(w).replace(/^[¿¡"“(]+/, ""))) return String(w).replace(/[¿?¡!.,;:…"“”()«»]+/g, "");
    // meervoud en vrouwelijk: fines -> fin, amables -> amable, buena -> bueno
    var probeer = [];
    if (/es$/.test(c)) probeer.push(c.slice(0, -2));
    if (/s$/.test(c)) probeer.push(c.slice(0, -1));
    if (/a$/.test(c)) probeer.push(c.slice(0, -1) + "o");
    if (/as$/.test(c)) probeer.push(c.slice(0, -2) + "o");
    if (/ces$/.test(c)) probeer.push(c.slice(0, -3) + "z");
    for (var j = 0; j < probeer.length; j++) { var p = uitRev(rev, probeer[j]); if (p) return p; }
    return null;
  }
  // Hele zin: [{ w, m }] met m = null als de betekenis onbekend is
  function zin(es, t, gloss) {
    return String(es).split(/\s+/).map(function (w) { return { w: schoon(w), m: woord(w, t, gloss) }; }).filter(function (x) { return x.w; });
  }
  return { woord: woord, zin: zin, KLEIN: KLEIN };
})();
if (typeof module !== "undefined") module.exports = WOORDUITLEG;
