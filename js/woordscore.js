// Uitspraak per woord beoordelen (zoals Duolingo): vergelijk de zin die je moest zeggen met wat de
// spraakherkenning hoorde, en geef elk woord van de zin een kleur:
//   goed  = het woord is gehoord (eventueel met een ander accent of een andere schrijfwijze);
//   bijna = er is een woord gehoord dat er sterk op lijkt (vaak een klank net anders);
//   mis   = het woord is niet of als iets heel anders gehoord.
// Werkt voor es, de, fr, en, nl. Geen internet nodig.
var WOORDSCORE = (function () {
  // Getallen die de herkenning als cijfers schrijft
  var GETAL = {
    es: ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce"],
    de: ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf"],
    fr: ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze"],
    en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"],
    nl: ["nul", "een", "twee", "drie", "vier", "vijf", "zes", "zeven", "acht", "negen", "tien", "elf", "twaalf"]
  };
  // Woorden van de zin zoals ze getoond worden (met hoofdletters, zonder leestekens eromheen)
  function woorden(s) {
    return String(s || "").replace(/[’`]/g, "'").split(/\s+/).map(function (w) {
      return w.replace(/^[¿¡"“”„«»(\[]+|[?!.,;:"“”„«»)\]…]+$/g, "");
    }).filter(function (w) { return /[\p{L}\d]/u.test(w); });
  }
  // Vergelijkbare vorm: kleine letters, zonder accenten, cijfers als woord
  function exact(w, taal) {
    w = String(w).toLowerCase().replace(/[’`]/g, "'");
    if (/^\d+$/.test(w) && GETAL[taal] && GETAL[taal][+w]) w = GETAL[taal][+w];
    return w.replace(/ß/g, "ss");
  }
  function vorm(w, taal) {
    return exact(w, taal).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9']/g, "");
  }
  // Klanksleutel: schrijfwijzen die hetzelfde klinken vallen samen
  function klank(w, taal) {
    var k = w.replace(/'/g, "");
    if (taal === "de") k = k.replace(/ie/g, "i").replace(/(ei|ai)/g, "ai").replace(/(eu|au)$/, "$1").replace(/ae/g, "e").replace(/v/g, "f").replace(/w/g, "v").replace(/z/g, "ts").replace(/th/g, "t").replace(/([aeiou])h/g, "$1").replace(/d$/, "t").replace(/g$/, "k");
    else if (taal === "fr") k = k.replace(/^(l|d|j|n|m|t|s|c|qu)e$/, "$1q").replace(/^([a-z]{1,2})es$/, "$1e").replace(/^est$/, "e")
      .replace(/(ent|[stdxzp]+)$/, "").replace(/([^q])e$/, "$1").replace(/(eaux|eau|aux|au)/g, "o").replace(/(ai|ei|et|er|ez)/g, "e").replace(/qu/g, "k").replace(/ph/g, "f").replace(/h/g, "").replace(/c([eiy])/g, "s$1").replace(/c/g, "k");
    else if (taal === "en") k = k.replace(/ph/g, "f").replace(/ck/g, "k").replace(/(ee|ea|ie)/g, "i").replace(/(oo|ou)/g, "u").replace(/e$/, "").replace(/gh/g, "");
    else if (taal === "nl") k = k.replace(/(ij|ei|y)/g, "ei").replace(/(au|ou)/g, "au").replace(/ch/g, "g").replace(/(dt|d)$/, "t").replace(/v/g, "f").replace(/z/g, "s").replace(/ie/g, "i");
    else if (taal === "es") k = k.replace(/h/g, "").replace(/v/g, "b").replace(/ll/g, "y").replace(/z/g, "s").replace(/c([ei])/g, "s$1").replace(/qu/g, "k").replace(/c/g, "k");
    return k.replace(/(.)\1+/g, "$1");
  }
  function afstand(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  // Kosten om doelwoord t te vervangen door gehoord woord h (0 = goed, 0.4 = bijna, 1 = mis)
  // Accenten: in het Duits is ö/ü/ä een andere klank (möchte/mochte = bijna); in het Frans en Spaans
  // verandert een accent de klank weinig. Franse woorden die hetzelfde klinken (où/ou, est/et) tellen als goed.
  function kosten(t, h, taal) {
    if (t.x === h.x) return 0;
    if (t.v === h.v) return taal === "de" ? 0.4 : 0;
    if (t.k === h.k) return taal === "fr" ? 0 : 0.4;
    var n = Math.max(t.v.length, h.v.length);
    var r = 1 - afstand(t.k, h.k) / Math.max(t.k.length, h.k.length, 1);
    if (n >= 3 && r >= 0.5) return 0.4;
    return 1;
  }
  function vergelijk(doel, gehoord, taal) {
    var tw = woorden(doel), T = tw.map(function (w) { var v = vorm(w, taal); return { w: w, x: exact(w, taal), v: v, k: klank(v, taal) }; });
    // gehoorde woorden; Franse samentrekkingen (l'eau) worden niet gesplitst, zodat ze per woord blijven tellen
    var H = woorden(gehoord).map(function (w) { var v = vorm(w, taal); return { x: exact(w, taal), v: v, k: klank(v, taal) }; });
    var n = T.length, mlen = H.length, D = [], P = [], i, j;
    for (i = 0; i <= n; i++) { D[i] = []; P[i] = []; }
    D[0][0] = 0;
    for (i = 1; i <= n; i++) { D[i][0] = i; P[i][0] = "del"; }
    for (j = 1; j <= mlen; j++) { D[0][j] = j * 0.3; P[0][j] = "ins"; }
    for (i = 1; i <= n; i++) for (j = 1; j <= mlen; j++) {
      var c = kosten(T[i - 1], H[j - 1], taal);
      var s = D[i - 1][j - 1] + c, de = D[i - 1][j] + 1, ins = D[i][j - 1] + 0.3;
      if (s <= de && s <= ins) { D[i][j] = s; P[i][j] = "sub"; }
      else if (de <= ins) { D[i][j] = de; P[i][j] = "del"; }
      else { D[i][j] = ins; P[i][j] = "ins"; }
    }
    var uit = new Array(n);
    i = n; j = mlen;
    while (i > 0 || j > 0) {
      var p = P[i][j];
      if (p === "sub") { var cc = kosten(T[i - 1], H[j - 1], taal); uit[i - 1] = { w: T[i - 1].w, s: cc === 0 ? "goed" : (cc < 1 ? "bijna" : "mis"), h: H[j - 1].v }; i--; j--; }
      else if (p === "del") { uit[i - 1] = { w: T[i - 1].w, s: "mis", h: "" }; i--; }
      else j--;
    }
    var punten = uit.reduce(function (a, x) { return a + (x.s === "goed" ? 1 : x.s === "bijna" ? 0.5 : 0); }, 0);
    return { woorden: uit, score: n ? Math.round(punten / n * 100) : 0 };
  }
  return { vergelijk: vergelijk, woorden: woorden };
})();
if (typeof module !== "undefined") module.exports = WOORDSCORE;
