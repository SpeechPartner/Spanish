// Namen van winkels, ketens en bedrijven (McDonald's, Albert Heijn, Zara) in een zin vertalen.
// De vertaler kent geen merknamen. Daarom vervangt de app een merknaam tijdens het vertalen door een gewoon woord
// dat de vertaler wel kent (supermarkt), en zet daarna de naam terug: "Waar is de McDonald's?" -> "Wo ist der McDonald's?".
// Ook een onbekend woord met een hoofdletter achter een lidwoord ("de Hema") wordt zo behandeld.
var NAMEN = (function () {
  var MERKEN = ["McDonald's", "McDonalds", "Mc Donald's", "Mc Donalds", "Burger King", "KFC", "Starbucks", "Subway", "Domino's", "Pizza Hut", "Five Guys", "Dunkin'", "Costa Coffee", "Telepizza", "Vapiano",
    "Albert Heijn", "Jumbo", "Lidl", "Aldi", "Plus", "Dirk", "Spar", "Carrefour", "Mercadona", "Dia", "Eroski", "Alcampo", "Edeka", "Rewe", "Penny", "Netto", "Kaufland", "Monoprix", "Franprix", "Auchan", "Leclerc", "Intermarché", "Tesco", "Sainsbury's", "Asda", "Waitrose", "Delhaize", "Colruyt",
    "Ikea", "Zara", "H&M", "Primark", "Mango", "Bershka", "Pull&Bear", "Uniqlo", "Decathlon", "Action", "Hema", "Kruidvat", "Etos", "Blokker", "MediaMarkt", "Media Markt", "Fnac", "El Corte Inglés", "Apple Store", "Boots", "Douglas", "Sephora", "dm", "Rossmann",
    "Shell", "BP", "Esso", "Total", "Repsol"];
  // Woord dat de vertaler kent, in elke taal mannelijk (en een de-woord), zodat lidwoorden en samentrekkingen kloppen (zum, au, al)
  var PH = [{ nl: "supermarkt", en: "supermarket", de: "Supermarkt", fr: "supermarché", es: "supermercado" },
            { nl: "markt", en: "market", de: "Markt", fr: "marché", es: "mercado" }];
  var LW = { nl: /^(de|het|een|die|deze|naar de|bij de)$/i, en: /^(the|a|an)$/i, de: /^(der|die|das|den|dem|des|ein|eine|einen|einem|zum|zur|im|beim|vom)$/i,
             fr: /^(le|la|l'|un|une|au|du)$/i, es: /^(el|la|un|una|al|del)$/i };
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var REM = MERKEN.slice().sort(function (a, b) { return b.length - a.length; }).map(function (m) {
    return { naam: m, re: new RegExp("(^|[\\s(\"'¿¡])(" + esc(m).replace(/'/g, "['’]?").replace(/\\ /g, "\\s*") + ")(?=$|[\\s.,!?;:)\"])", "i") };
  });
  // Zonder lidwoord ervoor: een lidwoord (en waar nodig een samentrekking) toevoegen, zodat de vertaler een gewone zin krijgt
  function kaal(voor, l, ph) {
    var v = voor.trim().split(/\s+/).pop() || "", vl = v.toLowerCase();
    if (l === "de") {
      var D = { zu: "zum", nach: "zum", in: "im", bei: "beim", von: "vom", an: "am" };
      if (D[vl]) return { weg: v, door: D[vl] + " " + ph };
      return { weg: "", door: "der " + ph };
    }
    if (l === "fr") {
      var F = { "à": "au", chez: "au", de: "du" };
      if (F[vl]) return { weg: v, door: F[vl] + " " + ph };
      return { weg: "", door: "le " + ph };
    }
    if (l === "es") {
      var E = { a: "al", de: "del" };
      if (E[vl]) return { weg: v, door: E[vl] + " " + ph };
      return { weg: "", door: "el " + ph };
    }
    if (l === "en") return { weg: "", door: "the " + ph };
    return { weg: "", door: "de " + ph };
  }
  // Zoek namen in een zin (taal l). Geeft de zin met vervangers terug, en wat er teruggezet moet worden.
  function zoek(text, l, metOnbekend) {
    var t = String(text || ""), uit = [], n = 0;
    function vervang(start, lengte, naam) {
      if (n >= PH.length) return false;
      var ph = PH[n][l], voor = t.slice(0, start), na = t.slice(start + lengte);
      if (new RegExp("\\b" + esc(ph) + "\\b", "i").test(t)) { n++; if (n >= PH.length) return false; ph = PH[n][l]; }
      var vw = (voor.trim().split(/\s+/).pop() || "").replace(/^[¿¡]/, "");
      var metLw = LW[l] && LW[l].test(vw);
      if (metLw) t = voor + ph + na;
      else {
        var k = kaal(voor, l, ph);
        if (k.weg) voor = voor.replace(new RegExp(esc(k.weg) + "\\s*$"), "");
        t = voor + k.door + na;
      }
      uit.push({ naam: naam, n: n, kaal: !metLw });
      n++;
      return true;
    }
    REM.forEach(function (m) {
      var r = m.re.exec(t);
      if (!r) return;
      var start = r.index + r[1].length;
      vervang(start, r[2].length, r[2].replace(/\s+/g, " "));
    });
    // Onbekend woord met hoofdletter direct na een lidwoord: "de Hema", "the Coop" (niet aan het begin van de zin)
    // (niet in het Duits: daar heeft elk zelfstandig naamwoord een hoofdletter)
    if (metOnbekend && l !== "de" && typeof DICTS !== "undefined" && DICTS[l]) {
      var re = /(\s)([A-ZÀ-Ý][\wÀ-ÿ'’&-]+(?:\s[A-ZÀ-Ý][\wÀ-ÿ'’&-]+)?)/g, mm;
      while ((mm = re.exec(t))) {
        var w = mm[2], voorW = (t.slice(0, mm.index).trim().split(/\s+/).pop() || "").replace(/^[¿¡]/, "");
        if (!LW[l] || !LW[l].test(voorW)) continue;
        if (DICTS[l][w.toLowerCase()] !== undefined || PH.some(function (p) { return p[l].toLowerCase() === w.toLowerCase(); })) continue;
        if (!vervang(mm.index + 1, w.length, w)) break;
        re.lastIndex = 0;
      }
    }
    return uit.length ? { text: t, namen: uit } : null;
  }
  // Zet de namen terug in de vertaling (taal doel). Lukt dat niet, dan null.
  function terug(out, info, doel) {
    if (!out) return null;
    var s = out;
    for (var i = 0; i < info.namen.length; i++) {
      var x = info.namen[i], ph = PH[x.n][doel];
      var re = new RegExp("(^|[^\\wÀ-ÿ])" + esc(ph) + "(?![\\wÀ-ÿ])", "i");
      if (!re.test(s)) return null;
      s = s.replace(re, function (m0, voor) { return voor + x.naam; });
      // Engels zonder lidwoord in de oorspronkelijke zin: "to McDonald's", niet "to the McDonald's"
      if ((doel === "en" || doel === "nl") && x.kaal) s = s.replace(new RegExp("\\b(the|de) (" + esc(x.naam) + ")", "i"), "$2");
      // Frans: le/la/au/du voor een klinker ("l'Albert Heijn", "à l'Ikea")
      if (doel === "fr" && /^[AEIOUYÉÈÊÂÎÔÛHaeiouyéèêâîôûh]/.test(x.naam)) {
        var nm = esc(x.naam);
        s = s.replace(new RegExp("\\b([Ll])[ea] (" + nm + ")"), "$1'$2").replace(new RegExp("\\b([Aa])u (" + nm + ")"), function (m0, a, n2) { return (a === "A" ? "À" : "à") + " l'" + n2; }).replace(new RegExp("\\b([Dd])u (" + nm + ")"), "$1e l'$2");
      }
    }
    return s;
  }
  return { zoek: zoek, terug: terug, MERKEN: MERKEN };
})();
