// Herstel van herkende Spaanse zinnen naar een bekende zin uit de app.
// De spraakherkenning maakt soms kleine fouten ("Bibo" voor "Vivo"). Deze module kiest de bekende zin
// alleen als die duidelijk de beste is: een overeenkomst van minstens 0,6 en een voorsprong van minstens 0,05
// op de tweede keuze. Van de vijf beste kandidaten wordt daarna de zin gekozen die klank voor klank het dichtst
// bij het gehoorde ligt (v en b gelijk, c voor e/i als s, enzovoort). Bij twijfel gebeurt er niets:
// de herkende tekst blijft dan staan.
// Getest in de werkomgeving met 240 opnames (twee stemmen, schoon en met stemmen op de achtergrond).
var ZIN_HERSTEL = (function () {
  // MAX_AFWIJKING: de gekozen zin mag in klank hooguit 25% afwijken van wat er gehoord is (regel B).
  // Gemeten over vijf talen: 295 extra goede zinnen en 17 verkeerde correcties, tegen 385 en 45 zonder deze grens.
  var DREMPEL = 0.6, MARGE = 0.05, KANDIDATEN = 5, MAX_AFWIJKING = 0.25;

  // Vergelijkbaar met Python difflib.SequenceMatcher(None, a, b).ratio(), zonder junk-heuristiek
  // (zinnen zijn korter dan 200 tekens).
  function zoekLangste(a, b, alo, ahi, blo, bhi, b2j) {
    var besti = alo, bestj = blo, bestk = 0, j2len = {};
    for (var i = alo; i < ahi; i++) {
      var nj2len = {}, js = b2j[a.charAt(i)] || [];
      for (var t = 0; t < js.length; t++) {
        var j = js[t];
        if (j < blo) continue;
        if (j >= bhi) break;
        var k = (j2len[j - 1] || 0) + 1;
        nj2len[j] = k;
        if (k > bestk) { besti = i - k + 1; bestj = j - k + 1; bestk = k; }
      }
      j2len = nj2len;
    }
    return [besti, bestj, bestk];
  }
  function telGelijk(a, b, alo, ahi, blo, bhi, b2j) {
    if (alo >= ahi || blo >= bhi) return 0;
    var m = zoekLangste(a, b, alo, ahi, blo, bhi, b2j), i = m[0], j = m[1], k = m[2];
    if (!k) return 0;
    return k + telGelijk(a, b, alo, i, blo, j, b2j) + telGelijk(a, b, i + k, ahi, j + k, bhi, b2j);
  }
  function gelijkenis(a, b) {
    if (!a.length && !b.length) return 1;
    var b2j = {};
    for (var j = 0; j < b.length; j++) { (b2j[b.charAt(j)] = b2j[b.charAt(j)] || []).push(j); }
    return 2 * telGelijk(a, b, 0, a.length, 0, b.length, b2j) / (a.length + b.length);
  }

  // Levenshtein-afstand
  function afstand(a, b) {
    var d = [], i, j;
    for (j = 0; j <= b.length; j++) d[j] = j;
    for (i = 1; i <= a.length; i++) {
      var p = d[0]; d[0] = i;
      for (j = 1; j <= b.length; j++) {
        var c = d[j];
        d[j] = Math.min(d[j] + 1, d[j - 1] + 1, p + (a.charAt(i - 1) !== b.charAt(j - 1) ? 1 : 0));
        p = c;
      }
    }
    return d[b.length];
  }

  // Tekst zonder accenten, hoofdletters, leestekens en dubbele spaties
  function sleutel(s) {
    return String(s || "").toLowerCase().replace(/ß/g, "ss").replace(/œ/g, "oe").replace(/æ/g, "ae").normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  // Klanken: letters die in het Spaans gelijk klinken vallen samen; klinkers blijven
  // Klankregels zijn er alleen voor het Spaans; voor de andere talen telt de tekst zelf (zonder spaties).
  function klank(s, taal) {
    var k = sleutel(s);
    if (taal && taal !== "es") return k.replace(/ /g, "");
    k = k.replace(/ll/g, "y").replace(/qu/g, "k").replace(/gu/g, "g").replace(/ch/g, "C");
    k = k.replace(/c(?=[ei])/g, "s").replace(/c/g, "k");
    k = k.replace(/z/g, "s").replace(/v/g, "b").replace(/h/g, "").replace(/x/g, "j").replace(/w/g, "u");
    return k.replace(/ /g, "");
  }

  // Geeft { tekst, gecorrigeerd } terug. zinnen: de bekende zinnen van de app in deze taal.
  // taal: es, de, fr, en of nl (zonder taal: Spaans)
  function corrigeer(herkend, zinnen, taal) {
    var ruw = String(herkend || "");
    if (!ruw.trim() || !zinnen || !zinnen.length) return { tekst: ruw, gecorrigeerd: false };
    var k = sleutel(ruw), scores = [];
    for (var i = 0; i < zinnen.length; i++) {
      scores.push({ zin: zinnen[i], score: gelijkenis(k, sleutel(zinnen[i])) });
    }
    scores.sort(function (x, y) {
      if (y.score !== x.score) return y.score - x.score;
      return x.zin < y.zin ? 1 : (x.zin > y.zin ? -1 : 0);
    });
    var s1 = scores[0].score, s2 = scores.length > 1 ? scores[1].score : 0;
    if (s1 < DREMPEL || s1 - s2 < MARGE) return { tekst: ruw, gecorrigeerd: false };
    var rk = klank(ruw, taal), beste = scores[0], beste_r = Infinity;
    for (var n = 0; n < Math.min(KANDIDATEN, scores.length); n++) {
      var kz = klank(scores[n].zin, taal);
      var r = afstand(rk, kz) / Math.max(1, kz.length);
      if (r < beste_r) { beste_r = r; beste = scores[n]; }
    }
    if (beste_r > MAX_AFWIJKING) return { tekst: ruw, gecorrigeerd: false };
    return { tekst: beste.zin, gecorrigeerd: beste.zin !== ruw };
  }

  return { corrigeer: corrigeer, sleutel: sleutel, klank: klank, gelijkenis: gelijkenis, afstand: afstand };
})();
if (typeof window !== "undefined") window.ZIN_HERSTEL = ZIN_HERSTEL;
if (typeof module !== "undefined") module.exports = ZIN_HERSTEL;
