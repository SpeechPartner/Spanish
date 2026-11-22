// Opzoeken in het situatieboek (js/situaties.js): vertalen en antwoordvoorstellen.
// Vertalen: alleen een precies gelijke zin (na weglaten van hoofdletters en leestekens), zodat er nooit een
// andere zin uit het boek wordt teruggegeven. Een beurt met meer zinnen is ook per zin te vinden als elke taal
// evenveel zinnen heeft.
// Antwoordvoorstellen: wat in het boek direct na die zin komt. Daar mag de zin iets afwijken (spraakherkenning),
// maar namen en getallen moeten gelijk zijn.
var SIT = (function () {
  var KOL = { de: 1, nl: 2, en: 3, fr: 4, es: 5 };
  var TALEN = ["de", "nl", "en", "fr", "es"];
  function sleutel(t) {
    return String(t || "").toLowerCase().replace(/[’`]/g, "'").replace(/[¿¡?!.,;:…"“”«»()\-–—]+/g, " ").replace(/\s+/g, " ").trim();
  }
  function zinnen(t) {
    var m = String(t || "").match(/[^.!?…]+[.!?…]*["”»]?/g);
    return m ? m.map(function (x) { return x.trim(); }).filter(Boolean) : [];
  }
  // Index per taal: sleutel -> lijst van { s: situatie, i: beurt, v: variant (-1 = de beurt zelf), z: zin (-1 = hele beurt) }
  // Een variant ("(ook)" in het boek) is een andere manier om dezelfde beurt te zeggen: zelfde plek in het gesprek.
  var IDX = {};
  TALEN.forEach(function (l) { IDX[l] = {}; });
  function voeg(l, k, v) { if (!k) return; (IDX[l][k] = IDX[l][k] || []).push(v); }
  function cel(s, i, v, l) { return v < 0 ? s.r[i][KOL[l]] : s.v[String(i)][v][KOL[l] - 1]; }
  (typeof SITUATIES !== "undefined" ? SITUATIES : []).forEach(function (s, si) {
    s.r.forEach(function (r, ri) {
      var vs = [-1].concat(((s.v && s.v[String(ri)]) || []).map(function (x, k) { return k; }));
      vs.forEach(function (v) {
        var tel = TALEN.map(function (l) { return zinnen(cel(s, ri, v, l)).length; });
        var gelijk = tel.every(function (n) { return n === tel[0]; }) && tel[0] > 1;
        TALEN.forEach(function (l) {
          var t = cel(s, ri, v, l);
          voeg(l, sleutel(t), { s: si, i: ri, v: v, z: -1 });
          if (gelijk) zinnen(t).forEach(function (z, zi) { voeg(l, sleutel(z), { s: si, i: ri, v: v, z: zi }); });
        });
      });
    });
  });
  function rij(h) { return SITUATIES[h.s].r[h.i]; }
  function heel(h, l) { return cel(SITUATIES[h.s], h.i, h.v === undefined ? -1 : h.v, l); }
  function tekst(h, l) { var t = heel(h, l); return h.z < 0 ? t : zinnen(t)[h.z]; }

  // Losse zinnen met een open plek ([plaats], [getal], [tijd], [dag]): de app vult in wat er gezegd is
  var DAG = { nl: ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"],
    de: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
    en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    fr: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
    es: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"] };
  var TAL = { nl: "een twee drie vier vijf zes zeven acht negen tien elf twaalf", de: "eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf",
    en: "one two three four five six seven eight nine ten eleven twelve", fr: "un deux trois quatre cinq six sept huit neuf dix onze douze",
    es: "uno dos tres cuatro cinco seis siete ocho nueve diez once doce" };
  function vorm(t) { return String(t || "").replace(/[’`]/g, "'").replace(/[¿¡?!.,;:…"“”«»()]+/g, " ").replace(/\s+/g, " ").trim(); }
  var VRIJ = {};
  TALEN.forEach(function (l) { VRIJ[l] = []; });
  (typeof SITUATIES !== "undefined" ? SITUATIES : []).forEach(function (s) {
    (s.p || []).forEach(function (r) {
      TALEN.forEach(function (l) {
        var namen = [], pat = vorm(r[KOL[l] - 1]).replace(/[.*+?^${}|\\]/g, "\\$&").replace(/\\\[(plaats|getal|tijd|dag)\\\]|\[(plaats|getal|tijd|dag)\]/g, function (m0, a, b) {
          var n = a || b; namen.push(n);
          if (n === "tijd") return "(\\d{1,2}(?:[:.h]\\d{2})?)";
          if (n === "getal") return "(\\d+|" + TAL[l].split(" ").join("|") + ")";
          if (n === "dag") return "(" + DAG[l].join("|") + ")";
          return "(.+?)";
        });
        if (namen.length) VRIJ[l].push({ re: new RegExp("^" + pat + "$", "i"), namen: namen, r: r });
      });
    });
  });
  function vulIn(n, w, from, to) {
    if (n === "dag") { var i = DAG[from].map(function (x) { return x.toLowerCase(); }).indexOf(w.toLowerCase()); return i >= 0 ? DAG[to][i] : null; }
    if (n === "getal" && !/^\d+$/.test(w)) { var j = TAL[from].split(" ").indexOf(w.toLowerCase()); return j >= 0 ? String(j + 1) : null; }
    // Een plaats is een naam: met een hoofdletter en zonder lidwoord ("the station" of "la gare" is geen plaatsnaam)
    // (wel: "Den Haag", "La Haye", waar het tweede woord ook met een hoofdletter begint)
    if (n === "plaats") {
      var ws = w.split(/\s+/), LW = ["the", "a", "an", "de", "het", "een", "der", "die", "das", "den", "dem", "ein", "eine", "le", "la", "les", "un", "une", "el", "los", "las", "lo", "unos", "unas"];
      if (!/^[A-ZÀ-ÝÄÖÜ]/.test(w)) return null;
      if (LW.indexOf(ws[0].toLowerCase()) >= 0 && !(ws[1] && /^[A-ZÀ-ÝÄÖÜ]/.test(ws[1]))) return null;
      if (/^l'/i.test(w) && !/^l'[A-ZÀ-ÝÄÖÜ]/i.test(w.replace(/^l'/i, "l'"))) return null;
      return w;
    }
    return w;
  }
  function vrij(text, from, to) {
    var t = vorm(text);
    for (var k = 0; k < VRIJ[from].length; k++) {
      var e = VRIJ[from][k], m = t.match(e.re);
      if (!m) continue;
      var uit = e.r[KOL[to] - 1], ok = true, idx = 0;
      uit = uit.replace(/\[(plaats|getal|tijd|dag)\]/g, function (m0, n) {
        var p = e.namen.indexOf(n, idx); if (p < 0) p = e.namen.indexOf(n);
        var w = p >= 0 ? vulIn(n, m[p + 1], from, to) : null;
        if (w === null) ok = false;
        return w || "";
      });
      if (ok) return uit;
    }
    return null;
  }

  // Waar het gesprek in het boek is (situatie en beurt van de laatst herkende zin). Zinnen die in meer
  // situaties voorkomen, krijgen zo de vertaling en het vervolg uit de situatie van dit gesprek.
  var CTX = null;
  function score(h) {
    var p = h.z < 0 ? 1 : 0;
    if (CTX && h.s === CTX.s) p += (h.i === CTX.i + 1 ? 4 : 2);
    return p;
  }
  function beste(hits) {
    var b = null, bs = -1;
    (hits || []).forEach(function (h) { var x = score(h); if (x > bs) { bs = x; b = h; } });
    return b;
  }
  // Onthoud waar deze zin in het boek staat (aanroepen als een beurt wordt toegevoegd)
  function zet(text, l) {
    var h = beste(vind(text, l));
    if (h) CTX = { s: h.s, i: h.i, zeker: !!(CTX && CTX.s === h.s) };
    return !!h;
  }
  // Welke vindplaatsen tellen mee: in een gesprek dat zeker in een situatie zit, die van die situatie;
  // anders alleen hele beurten (een losse zin uit een beurt kan in het boek vrij vertaald zijn,
  // "Lo siento." = "Oh, wat vervelend.").
  function bruikbaar(hits, laatsteZin) {
    hits = hits || [];
    if (CTX && CTX.zeker) {
      var hier = hits.filter(function (h) { return h.s === CTX.s; });
      if (hier.length) return hier;
    }
    // Voor voorstellen telt ook de laatste zin van een beurt: daar antwoordt de volgende beurt op
    return hits.filter(function (h) { return h.z < 0 || (laatsteZin && h.z === zinnen(heel(h, "nl")).length - 1); });
  }
  function woorden(t) { return sleutel(t).split(" ").filter(Boolean).length; }
  function wis() { CTX = null; }
  // Precieze vertaling uit het boek, of null
  function vertaal(text, from, to) {
    if (!KOL[from] || !KOL[to] || from === to) return null;
    var h = beste(bruikbaar(IDX[from][sleutel(text)]));
    if (!h) return vrij(text, from, to);
    var uit = tekst(h, to);
    if (!uit) return null;
    // Een vraag blijft een vraag, ook als de spraakherkenning het vraagteken weglaat (alleen als de zin in het
    // boek zelf geen vraag is en de vertaling ook niet)
    if (/\?\s*$/.test(String(text)) && !/\?/.test(tekst(h, from)) && !/\?/.test(uit)) uit = uit.replace(/[.!…]+$/, "") + (to === "fr" ? " ?" : "?");
    return uit;
  }
  // Alle vertalingen uit het boek voor deze zin (sommige zinnen staan in meer situaties)
  function alleVertalingen(text, from, to) {
    var hits = IDX[from] && bruikbaar(IDX[from][sleutel(text)]);
    if (!hits) return [];
    var seen = {}, out = [];
    hits.forEach(function (h) { var t = tekst(h, to); if (t && !seen[t]) { seen[t] = 1; out.push(t); } });
    return out;
  }

  // Lijkt een zin genoeg op een zin uit het boek? Kleine verschillen mogen (herkenningsfouten), namen en getallen niet.
  var GETAL = /^(een|twee|drie|vier|vijf|zes|zeven|acht|negen|tien|elf|twaalf|twintig|dertig|veertig|vijftig|honderd|eins|zwei|drei|fünf|sechs|sieben|neun|zehn|zwölf|zwanzig|dreißig|vierzig|fünfzig|hundert|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|hundred|un|deux|trois|quatre|cinq|sept|huit|neuf|dix|onze|douze|vingt|trente|quarante|cinquante|cent|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|veinte|treinta|cuarenta|cincuenta|cien)$/;
  function vast(t) {
    var w = String(t || "").replace(/^[¿¡"“]+/, "").split(/\s+/).slice(1);
    var namen = w.filter(function (x) { return /^[A-ZÄÖÜÉÈÁÍÓÚÑ]/.test(x); }).map(sleutel);
    var cijfers = (String(t).match(/\d+/g) || []).concat(sleutel(t).split(" ").filter(function (x) { return GETAL.test(x); }));
    return namen.concat(cijfers).sort().join("|");
  }
  function afstand(a, b) {
    if (a === b) return 0;
    var m = a.length, n = b.length;
    if (Math.abs(m - n) > Math.max(m, n) * 0.25) return 99;
    var v0 = [], v1 = [], i, j;
    for (j = 0; j <= n; j++) v0[j] = j;
    for (i = 0; i < m; i++) {
      v1[0] = i + 1;
      for (j = 0; j < n; j++) v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + (a[i] === b[j] ? 0 : 1));
      for (j = 0; j <= n; j++) v0[j] = v1[j];
    }
    return v0[n];
  }
  function vind(text, l) {
    var k = sleutel(text);
    if (!k || !IDX[l]) return [];
    if (IDX[l][k]) return IDX[l][k];
    if (k.length < 8) return [];
    var best = null, bs = 1e9, vt = vast(text);
    for (var kk in IDX[l]) {
      var d = afstand(k, kk);
      if (d < bs) { bs = d; best = kk; }
    }
    if (!best || bs > Math.max(2, Math.floor(best.length * 0.15))) return [];
    var hits = IDX[l][best].filter(function (h) { return vast(tekst(h, l)) === vt; });
    return hits;
  }
  // Voorstellen: de beurt die in het boek op deze zin volgt (in elke situatie waar de zin voorkomt).
  // Geeft [{ doel: tekst in de doeltaal, m: { nl, en, de, fr, es } }]
  function antwoorden(text, l) {
    // Zonder vaste situatie geen voorstellen bij een heel korte zin ("Alsjeblieft."): die past in te veel gesprekken
    var hits = bruikbaar(vind(text, l), true);
    if (!(CTX && CTX.zeker && hits.some(function (h) { return h.s === CTX.s; })) && woorden(text) < 3) hits = [];
    hits = hits.slice().sort(function (a, b) { return score(b) - score(a); });
    var seen = {}, out = [];
    hits.forEach(function (h) {
      var s = SITUATIES[h.s];
      if (h.i + 1 >= s.r.length) return;
      // de volgende beurt, en daarna de andere manieren om die te zeggen
      [-1].concat(((s.v && s.v[String(h.i + 1)]) || []).map(function (x, k) { return k; })).forEach(function (v) {
        var t = cel(s, h.i + 1, v, l);
        if (seen[sleutel(t)]) return;
        seen[sleutel(t)] = 1;
        var m = {};
        TALEN.forEach(function (x) { m[x] = cel(s, h.i + 1, v, x); });
        out.push({ doel: t, m: m, situatie: s.t, variant: v >= 0 });
      });
    });
    return out;
  }
  return { zet: zet, wis: wis, vertaal: vertaal, alleVertalingen: alleVertalingen, antwoorden: antwoorden, vind: vind, sleutel: sleutel, zinnen: zinnen, KOL: KOL };
})();
