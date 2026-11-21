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
  // Index per taal: sleutel -> lijst van { s: situatie, i: beurt, z: zin (-1 = hele beurt) }
  var IDX = {};
  TALEN.forEach(function (l) { IDX[l] = {}; });
  function voeg(l, k, v) { if (!k) return; (IDX[l][k] = IDX[l][k] || []).push(v); }
  (typeof SITUATIES !== "undefined" ? SITUATIES : []).forEach(function (s, si) {
    s.r.forEach(function (r, ri) {
      var tel = TALEN.map(function (l) { return zinnen(r[KOL[l]]).length; });
      var gelijk = tel.every(function (n) { return n === tel[0]; }) && tel[0] > 1;
      TALEN.forEach(function (l) {
        voeg(l, sleutel(r[KOL[l]]), { s: si, i: ri, z: -1 });
        if (gelijk) zinnen(r[KOL[l]]).forEach(function (z, zi) { voeg(l, sleutel(z), { s: si, i: ri, z: zi }); });
      });
    });
  });
  function rij(h) { return SITUATIES[h.s].r[h.i]; }
  function tekst(h, l) { var t = rij(h)[KOL[l]]; return h.z < 0 ? t : zinnen(t)[h.z]; }

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
    return hits.filter(function (h) { return h.z < 0 || (laatsteZin && h.z === zinnen(rij(h)[KOL.nl]).length - 1); });
  }
  function woorden(t) { return sleutel(t).split(" ").filter(Boolean).length; }
  function wis() { CTX = null; }
  // Precieze vertaling uit het boek, of null
  function vertaal(text, from, to) {
    if (!KOL[from] || !KOL[to] || from === to) return null;
    var h = beste(bruikbaar(IDX[from][sleutel(text)]));
    if (!h) return null;
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
      var nx = s.r[h.i + 1], t = nx[KOL[l]];
      if (seen[t]) return;
      seen[t] = 1;
      var m = {};
      TALEN.forEach(function (x) { m[x] = nx[KOL[x]]; });
      out.push({ doel: t, m: m, situatie: s.t });
    });
    return out;
  }
  return { zet: zet, wis: wis, vertaal: vertaal, alleVertalingen: alleVertalingen, antwoorden: antwoorden, vind: vind, sleutel: sleutel, zinnen: zinnen, KOL: KOL };
})();
