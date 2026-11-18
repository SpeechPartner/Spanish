// Zinsmodules Engels, Duits, Frans: gedeelde vormleer en woordenschat-indexen.
// Persoon: 0 yo, 1 tú, 2 él/ella/usted, 3 nosotros, 4 vosotros, 5 ellos/ustedes. formal = usted/ustedes.
var ZINC = (function () {
  var L = ZIN_LEX;
  function fold(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function low(s) { return String(s || "").toLowerCase(); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function split6(s) { if (!s) return null; return s.indexOf("|") >= 0 ? s.split("|") : s.split(" "); }

  // ---------------- Zelfstandige naamwoorden ----------------
  var NOUN = {};                         // es -> entry
  var NIDX = { en: {}, de: {}, fr: {} }; // woord in taal -> [{ es, pl }]
  function addIdx(lang, w, es, pl) {
    var k = low(w);
    (NIDX[lang][k] = NIDX[lang][k] || []).push({ es: es, pl: pl });
  }
  L.NOUNS.forEach(function (line) {
    var f = line.split("|");
    var es = f[0], esPlOnly = /\*$/.test(es); es = es.replace(/\*$/, "");
    var e = { es: es, esPlOnly: esPlOnly };
    // Engels
    var en = f[1];
    e.enMass = /~$/.test(en); e.enPlOnly = /\^$/.test(en); en = en.replace(/[~^]$/, "");
    var ep = en.split("/"); e.en = ep[0]; e.enPl = ep[1] || null;
    // Duits
    var dp = f[2].split(" "); e.de = dp[0]; e.dg = dp[1]; e.dePl = dp[2] === "=" ? dp[0] : (dp[2] === "-" ? null : dp[2]);
    if (e.dg === "pl") e.dePl = e.de;
    // Frans
    var fp = f[3].split(" "); e.fr = fp[0].replace(/_/g, " "); e.fg = fp[1]; e.frPlOnly = fp[2] === "pl";
    e.frPl = e.frPlOnly ? e.fr : (fp[2] ? fp[2].replace(/_/g, " ") : null);
    NOUN[es] = e;
    addIdx("en", e.en, es, e.enPlOnly); if (!e.enMass && !e.enPlOnly) addIdx("en", enPlural(e), es, true);
    addIdx("de", e.de, es, e.dg === "pl"); if (e.dePl && e.dg !== "pl") { addIdx("de", e.dePl, es, true); if (!/[ns]$/.test(e.dePl)) addIdx("de", e.dePl + "n", es, true); }
    addIdx("fr", e.fr, es, e.frPlOnly); if (!e.frPlOnly) addIdx("fr", frPlural(e), es, true);
  });
  var PERSON = {}; L.PERSON.split(" ").forEach(function (w) { PERSON[w] = 1; });
  var PROF = {}; L.PROFESSION.split(" ").forEach(function (w) { PROF[w] = 1; });

  function enPlural(e) {
    if (e.enPl) return e.enPl;
    var w = e.en;
    if (/(s|sh|ch|x|z)$/.test(w)) return w + "es";
    if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + "ies";
    return w + "s";
  }
  function frPlural(e) {
    if (e.frPl) return e.frPl;
    var w = e.fr;
    if (/[sxz]$/.test(w)) return w;
    if (/al$/.test(w)) return w.slice(0, -2) + "aux";
    if (/(eau|eu)$/.test(w)) return w + "x";
    return w + "s";
  }
  function dePlural(e) { return e.dePl; }

  // Spaans geslacht (vuistregels met uitzonderingen)
  var ES_FEM = { salud: 1, mujer: 1, mano: 1, foto: 1, moto: 1, radio: 1, bici: 1, tele: 1, calle: 1, clase: 1, leche: 1, carne: 1, noche: 1,
    llave: 1, flor: 1, tarde: 1, madre: 1, gente: 1, parte: 1, suerte: 1, nieve: 1, fuente: 1, base: 1, frase: 1, sangre: 1, muerte: 1,
    torre: 1, fiebre: 1, sal: 1, miel: 1, piel: 1, "cárcel": 1, "señal": 1, postal: 1, catedral: 1, vez: 1, voz: 1, luz: 1, paz: 1,
    nariz: 1, cruz: 1, "raíz": 1, imagen: 1, crisis: 1, tesis: 1, serie: 1, especie: 1, mente: 1, red: 1, pared: 1, sed: 1, ley: 1, tos: 1,
    "razón": 1, "canción": 1, hambre: 1, nube: 1, "mañana": 1 };
  var ES_MASC = { "día": 1, mapa: 1, problema: 1, idioma: 1, tema: 1, programa: 1, sistema: 1, clima: 1, planeta: 1, "sofá": 1, pijama: 1,
    "avión": 1, "camión": 1, "autobús": 1, "país": 1, mes: 1, "lápiz": 1, arroz: 1, pez: 1, "examen": 1, "cumpleaños": 1,
    lunes: 1, martes: 1, "miércoles": 1, jueves: 1, viernes: 1, "sábado": 1, domingo: 1, "corazón": 1, "jamón": 1, "salón": 1, "ratón": 1, "limón": 1, "melón": 1 };
  // el/la uit de PDF-lijst (Collins Spanish); eigen tabellen hierboven winnen
  var ESG = null;
  function esGenData(w) {
    if (!ESG) { ESG = {}; if (typeof ZIN_GENDER !== "undefined" && ZIN_GENDER.es) ZIN_GENDER.es.split("|").forEach(function (p) { var i = p.indexOf("="); if (i > 0) ESG[p.slice(0, i)] = p.slice(i + 1); }); }
    return ESG[w] || null;
  }
  function esFem(w) {
    if (has(ES_FEM, w)) return true;
    if (has(ES_MASC, w)) return false;
    var pg = esGenData(w);
    if (pg) return pg === "f";
    if (/(ción|sión|dad|tad|tud|umbre|ie)$/.test(w)) return true;
    if (/a$/.test(w)) return true;
    return false;
  }
  var STRESSED_A = { agua: 1, hambre: 1, "área": 1, alma: 1, arma: 1, aula: 1, "águila": 1, hacha: 1 };
  function stripAcc(s) { return s.normalize("NFD").replace(/[̀-ͯ]/g, "").normalize("NFC"); }
  function esPlural(w) {
    if (/(s|x)$/.test(w) && !/(és|ás|ís|ós|ús)$/.test(w) && w.length > 3) return w;     // lunes, crisis, cumpleaños
    if (/[aeiouáéó]$/.test(w)) return w + "s";
    if (/z$/.test(w)) return w.slice(0, -1) + "ces";
    if (/(ión|ón|án|én|ín|és|ás|ís|ós|ús)$/.test(w)) return stripAcc(w.slice(0, -2)) + w.slice(-2).replace(/[áéíóú]/, function (c) { return stripAcc(c); }) + "es";
    if (w === "examen") return "exámenes"; if (w === "joven") return "jóvenes"; if (w === "imagen") return "imágenes";
    return w + "es";
  }
  function esArt(w, pl, def) {
    var f = esFem(w);
    if (def) return pl ? (f ? "las" : "los") : (f && !has(STRESSED_A, w) ? "la" : "el");
    return pl ? (f ? "unas" : "unos") : (f && !has(STRESSED_A, w) ? "una" : "un");
  }
  function esAdj(m, fem, pl) {
    var a = m;
    if (fem) {
      if (/o$/.test(a)) a = a.slice(0, -1) + "a";
      else if (/(or|és|án|ón)$/.test(a) && !/(mejor|peor|mayor|menor|exterior|interior)$/.test(a)) a = stripAcc(a) + "a";
    }
    if (pl) {
      if (/[aeiouáéíóú]$/.test(a)) a = a + "s";
      else if (/z$/.test(a)) a = a.slice(0, -1) + "ces";
      else if (/(és|án|ón)$/.test(a)) a = stripAcc(a) + "es";
      else if (a === "joven") a = "jóvenes";
      else a = a + "es";
    }
    return a;
  }

  // ---------------- Bijvoeglijke naamwoorden ----------------
  var ADJ = {};                         // es (m) -> { en, de, frm, frf, estar, before }
  var AIDX = { en: {}, de: {}, fr: {} }; // vorm -> es
  function addA(lang, w, es) { var k = low(w); if (!has(AIDX[lang], k)) AIDX[lang][k] = es; }
  L.ADJS.forEach(function (line) {
    var f = line.split("|"), fl = f[5] || "";
    var a = { es: f[0], en: f[1], de: f[2], frm: f[3].replace(/_/g, " "), frf: f[4].replace(/_/g, " "), estar: fl.indexOf("e") >= 0, before: fl.indexOf("b") >= 0 };
    ADJ[f[0]] = a;
    addA("en", a.en, f[0]); addA("de", a.de, f[0]); addA("fr", a.frm, f[0]); addA("fr", a.frf, f[0]);
    addA("fr", frAdjPl(a.frm), f[0]); addA("fr", frAdjPl(a.frf), f[0]);
    ["e", "en", "er", "es", "em"].forEach(function (s) { addA("de", deAdjStem(a.de) + s, f[0]); });
  });
  // Engelse/Duitse/Franse woorden die op een "tener"-uitdrukking uitkomen, horen niet bij de gewone bijvoeglijke naamwoorden
  function frAdjPl(w) { if (/[sx]$/.test(w)) return w; if (/al$/.test(w)) return w.slice(0, -2) + "aux"; if (/eau$/.test(w)) return w + "x"; return w + "s"; }
  function deAdjStem(w) {
    if (w === "hoch") return "hoh";
    if (/el$/.test(w) && w !== "viel") return w.slice(0, -2) + "l";          // dunkel -> dunkl
    if (/e$/.test(w)) return w.slice(0, -1);                                 // müde -> müd(e)
    return w;
  }
  var SER_ESTAR = L.ADJ_SER_ESTAR;
  Object.keys(SER_ESTAR).forEach(function (k) {
    [0, 1].forEach(function (i) {
      var t = SER_ESTAR[k][i];
      AIDX.en[t[0]] = AIDX.en[t[0]] || (k + "#" + i);
      AIDX.de[low(t[1])] = AIDX.de[low(t[1])] || (k + "#" + i);
      AIDX.fr[t[2]] = AIDX.fr[t[2]] || (k + "#" + i); AIDX.fr[t[3]] = AIDX.fr[t[3]] || (k + "#" + i);
    });
  });

  var NAT = {}, NATIDX = { es: {}, en: {}, de: {}, fr: {} };
  L.NATS.forEach(function (line) {
    var f = line.split("|");
    var n = { m: f[0], f: f[1], en: f[2], dem: f[3], def: f[4], frm: f[5], frf: f[6] };
    NAT[f[0]] = n; NATIDX.es[f[0]] = { k: f[0], g: "m" }; NATIDX.es[f[1]] = { k: f[0], g: "f" };
    NATIDX.en[low(f[2])] = { k: f[0] }; NATIDX.de[low(f[3])] = { k: f[0], g: "m" }; NATIDX.de[low(f[4])] = { k: f[0], g: "f" };
    NATIDX.fr[f[5]] = { k: f[0], g: "m" }; NATIDX.fr[f[6]] = { k: f[0], g: "f" };
    NATIDX.fr[f[5] + "s"] = { k: f[0], g: "m", pl: true }; NATIDX.fr[f[6] + "s"] = { k: f[0], g: "f", pl: true };
  });
  var LANG = L.LANGS, LANGIDX = { en: {}, de: {}, fr: {} };
  Object.keys(LANG).forEach(function (k) {
    LANGIDX.en[low(LANG[k][0])] = LANGIDX.en[low(LANG[k][0])] || k;
    LANGIDX.de[low(LANG[k][1])] = LANGIDX.de[low(LANG[k][1])] || k;
    LANGIDX.fr[LANG[k][2]] = LANGIDX.fr[LANG[k][2]] || k;
  });

  var PLACE = {}, PIDX = { en: {}, de: {}, fr: {} };
  L.PLACES.forEach(function (line) {
    var f = line.split("|");
    PLACE[f[0]] = { es: f[0], en: f[1], de: f[2], fr: f[3], ft: f[4] };
    PIDX.en[low(f[1]).replace(/^the /, "")] = f[0]; PIDX.de[low(f[2]).replace(/^die /, "")] = f[0]; PIDX.fr[low(f[3])] = f[0];
  });

  // Franse elisievormen voor een klinker of stomme h: bel, nouvel, vieil
  [["bel", "beau"], ["nouvel", "nouveau"], ["vieil", "vieux"]].forEach(function (p) { if (AIDX.fr[p[1]] && !AIDX.fr[p[0]]) AIDX.fr[p[0]] = AIDX.fr[p[1]]; });
  // ---------------- Bijwoorden, tener-uitdrukkingen, weer, vaste zinnen ----------------
  var ADV = {}, ADVIDX = { es: {}, en: {}, de: {}, fr: {} };
  L.ADVS.forEach(function (line) {
    var f = line.split("|");
    ADV[f[0]] = { es: f[0], en: f[1], de: f[2], fr: f[3], k: f[4] };
    ADVIDX.es[fold(f[0])] = f[0]; ADVIDX.en[low(f[1])] = ADVIDX.en[low(f[1])] || f[0];
    ADVIDX.de[low(f[2])] = ADVIDX.de[low(f[2])] || f[0]; ADVIDX.fr[low(f[3])] = ADVIDX.fr[low(f[3])] || f[0];
  });
  var TENER = {}, TIDX = { en: {}, de: {}, fr: {} };
  L.TENER.forEach(function (line) {
    var f = line.split("|");
    TENER[f[0]] = { en: f[1], de: f[2], fr: f[3] };
    TIDX.en[f[1]] = f[0]; TIDX.de[low(f[2].slice(2))] = f[0]; TIDX.fr[f[3]] = f[0];
  });
  var WEATHER = {}, WIDX = { en: {}, de: {}, fr: {} };
  L.WEATHER.forEach(function (line) {
    var f = line.split("|"), k = fold(f[0]);
    if (!has(WEATHER, k)) WEATHER[k] = { es: f[0], en: f[1], de: f[2], fr: f[3], nl: (L.FIXED_NL || {})[f[0]] };
    [["en", 1], ["de", 2], ["fr", 3]].forEach(function (p) { var kk = p[0] === "en" ? enKey(f[p[1]]) : normKey(f[p[1]]); if (!has(WIDX[p[0]], kk)) WIDX[p[0]][kk] = f[0]; });
  });
  var FIXED = {}, FIDX = { en: {}, de: {}, fr: {} };
  L.FIXED.forEach(function (line) {
    var f = line.split("|"), k = fold(f[0]);
    if (!has(FIXED, k)) FIXED[k] = { es: f[0], en: f[1], de: f[2], fr: f[3], nl: (L.FIXED_NL || {})[f[0]] };
    [["en", 1], ["de", 2], ["fr", 3]].forEach(function (p) { var kk = p[0] === "en" ? enKey(f[p[1]]) : normKey(f[p[1]]); if (!has(FIDX[p[0]], kk)) FIDX[p[0]][kk] = f[0]; });
  });
  function enKey(s) {
    var k = normKey(s);
    [[/\bi'm\b/g, "i am"], [/\b(you|we|they)'re\b/g, "$1 are"], [/\b(he|she|it|that|what|where|how|who|there)'s\b/g, "$1 is"],
     [/\bcan't\b/g, "can not"], [/\bwon't\b/g, "will not"], [/\b(\w+)n't\b/g, "$1 not"], [/\b(\w+)'ll\b/g, "$1 will"], [/\b(\w+)'d\b/g, "$1 would"]].forEach(function (r) { k = k.replace(r[0], r[1]); });
    return k;
  }
  var NLIDX = {};
  Object.keys(L.FIXED_NL || {}).forEach(function (k) { var kk = fold(L.FIXED_NL[k]).replace(/[?!.,;:]/g, " ").replace(/\s+/g, " ").trim(); if (!has(NLIDX, kk)) NLIDX[kk] = k; });
  function normKey(s) { return fold(s).replace(/[’']/g, "'").replace(/[¿¡?!.,;:]/g, " ").replace(/\s+/g, " ").trim(); }
  // Andere formuleringen van dezelfde vaste zin (L.FIXED_ALT): naar dezelfde Spaanse sleutel
  (L.FIXED_ALT || []).forEach(function (al) {
    al.nl.forEach(function (x) { var kk = normKey(x); if (!has(NLIDX, kk)) NLIDX[kk] = al.es; });
    al.en.forEach(function (x) { var kk = enKey(x); if (!has(FIDX.en, kk)) FIDX.en[kk] = al.es; });
    al.de.forEach(function (x) { var kk = normKey(x); if (!has(FIDX.de, kk)) FIDX.de[kk] = al.es; });
    al.fr.forEach(function (x) { var kk = normKey(x); if (!has(FIDX.fr, kk)) FIDX.fr[kk] = al.es; });
  });

  // ---------------- Werkwoorden ----------------
  var VERB = L.VERBS;
  var ES_END = {
    ar: { pres: ["o", "as", "a", "amos", "áis", "an"], pret: ["é", "aste", "ó", "amos", "asteis", "aron"], imp: ["aba", "abas", "aba", "ábamos", "abais", "aban"] },
    er: { pres: ["o", "es", "e", "emos", "éis", "en"], pret: ["í", "iste", "ió", "imos", "isteis", "ieron"], imp: ["ía", "ías", "ía", "íamos", "íais", "ían"] },
    ir: { pres: ["o", "es", "e", "imos", "ís", "en"], pret: ["í", "iste", "ió", "imos", "isteis", "ieron"], imp: ["ía", "ías", "ía", "íamos", "íais", "ían"] }
  };
  var REFL_ES = ["me", "te", "se", "nos", "os", "se"];
  function esBase(lemma) { return lemma.replace(/se$/, ""); }
  function esIsRefl(lemma) { return /se$/.test(lemma) && !/ /.test(lemma); }
  // Spaanse vervoeging. tense: pres, pret, imp. Geeft de vorm zonder wederkerend voornaamwoord.
  function esForm(lemma, tense, p) {
    var v = VERB[lemma] || {}, o = v.es || {};
    if (o[tense]) { var arr = split6(o[tense]); var f = arr[p]; return f.replace(/^(me|te|se|nos|os) /, ""); }
    var inf = esBase(lemma);
    if (/ /.test(lemma)) return null;
    var cls = inf.slice(-2), stem = inf.slice(0, -2), e = ES_END[cls];
    if (!e) return null;
    if (tense === "pret" && p === 0 && cls === "ar") {
      if (/c$/.test(stem)) return stem.slice(0, -1) + "qué";
      if (/g$/.test(stem)) return stem + "ué";
      if (/z$/.test(stem)) return stem.slice(0, -1) + "cé";
    }
    // stamklinkerwissel in de tegenwoordige tijd voor wederkerende werkwoorden met een opgegeven vorm
    if (tense === "pres" && o.pres) return null;
    return stem + e[tense][p];
  }
  function esGer(lemma) {
    var v = VERB[lemma] || {}, o = v.es || {};
    if (o.ger) return o.ger;
    var inf = esBase(lemma), cls = inf.slice(-2), stem = inf.slice(0, -2);
    return stem + (cls === "ar" ? "ando" : "iendo");
  }
  var ES_PP_IRR = { hacer: "hecho", decir: "dicho", ver: "visto", escribir: "escrito", volver: "vuelto", poner: "puesto", abrir: "abierto",
    romper: "roto", ir: "ido", ser: "sido", estar: "estado" };
  function esPP(lemma) {
    var inf = esBase(lemma);
    if (has(ES_PP_IRR, inf)) return ES_PP_IRR[inf];
    var cls = inf.slice(-2), stem = inf.slice(0, -2);
    if (cls === "ar") return stem + "ado";
    if (/[aeo]$/.test(stem)) return stem + "ído";     // leído, creído
    return stem + "ido";
  }
  var HABER = ["he", "has", "ha", "hemos", "habéis", "han"];

  // Index Spaanse vormen -> [{ v, tense, p }]
  var ESF = {}, ESFF = {};
  function addEs(form, v, tense, p) {
    if (!form) return;
    var k = low(form), kf = fold(form);
    (ESF[k] = ESF[k] || []).push({ v: v, tense: tense, p: p });
    if (kf !== "se") (ESFF[kf] = ESFF[kf] || []).push({ v: v, tense: tense, p: p });
  }
  Object.keys(VERB).forEach(function (lemma) {
    if (lemma === "tener que" || lemma === "tener permiso") return;
    ["pres", "pret", "imp"].forEach(function (t) {
      for (var p = 0; p < 6; p++) {
        var f = esForm(lemma, t, p);
        if (f && !(t === "imp" && !((VERB[lemma].es || {}).imp))) addEs(f, lemma, t, p);
        else if (f && t === "imp") addEs(f, lemma, t, p);
      }
    });
  });
  var GERIDX = {}, PPIDX = {}, INFIDX = {};
  Object.keys(VERB).forEach(function (lemma) {
    if (/ /.test(lemma)) return;
    GERIDX[fold(esGer(lemma))] = GERIDX[fold(esGer(lemma))] || lemma;
    PPIDX[fold(esPP(lemma))] = PPIDX[fold(esPP(lemma))] || lemma;
    INFIDX[fold(esBase(lemma))] = INFIDX[fold(esBase(lemma))] || lemma;
  });
  // wederkerende infinitieven hebben voorrang voor llamar(se) e.d. alleen als het voornaamwoord erbij staat
  INFIDX.llamar = "llamar"; INFIDX.sentir = "sentirse"; INFIDX.levantar = "levantarse"; INFIDX.duchar = "ducharse";
  INFIDX.acostar = "acostarse"; INFIDX.quedar = "quedarse";

  // ---- Engels
  var EN_PP = { be: "been", have: "had", go: "gone", do: "done", say: "said", see: "seen", come: "come", eat: "eaten", drink: "drunk",
    sleep: "slept", buy: "bought", read: "read", write: "written", speak: "spoken", know: "known", think: "thought", want: "wanted",
    understand: "understood", find: "found", lose: "lost", forget: "forgotten", take: "taken", give: "given", sing: "sung", swim: "swum",
    run: "run", drive: "driven", pay: "paid", get: "got", feel: "felt", send: "sent", cost: "cost", believe: "believed" };
  function enS3(e) { if (e.s3) return e.s3; var b = e.b; if (/(s|sh|ch|x|z|o)$/.test(b)) return b + "es"; if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + "ies"; return b + "s"; }
  function enPast(e) { if (e.past) return e.past; var b = e.b; if (/e$/.test(b)) return b + "d"; if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + "ied"; return b + "ed"; }
  function enPPf(e) { return has(EN_PP, e.b) ? EN_PP[e.b] : enPast(e); }
  function enIng(e) { if (e.ing) return e.ing; var b = e.b; if (/ie$/.test(b)) return b.slice(0, -2) + "ying"; if (/[^e]e$/.test(b)) return b.slice(0, -1) + "ing"; return b + "ing"; }

  // ---- Duits
  function deStem(inf) { return /[^e]n$/.test(inf) && /(el|er)n$/.test(inf) ? inf.slice(0, -1) : inf.replace(/en$/, ""); }
  function dePres(d, p) {
    if (d.pres) return split6(d.pres)[p];
    var st = deStem(d.inf);
    var e = /(d|t|chn|ffn|gn|dm|tm)$/.test(st);
    var sib = /(s|ß|z|x)$/.test(st);
    var end = ["e", (sib ? "t" : (e ? "est" : "st")), (e ? "et" : "t"), "en", (e ? "et" : "t"), "en"][p];
    return st + end;
  }
  function dePP(d) {
    if (d.pp) return d.pp;
    var inf = d.inf, st = deStem(inf);
    var t = /(d|t|chn|ffn|gn)$/.test(st) ? "et" : "t";
    if (/ieren$/.test(inf) || /^(be|ver|er|ent|zer|ge|emp|miss)/.test(inf)) return st + t;
    return (d.sep || "") + "ge" + st + t;
  }
  function deInf(d) { return (d.sep || "") + d.inf; }
  function dePrt(d, p) { return d.prt ? split6(d.prt)[p] : null; }

  // ---- Frans
  function frPres(f, p) {
    if (f.pres) return split6(f.pres)[p];
    var inf = f.inf;
    if (!/er$/.test(inf)) return null;
    var st = inf.slice(0, -2);
    var e = ["e", "es", "e", "ons", "ez", "ent"][p];
    if (p === 3 && /g$/.test(st)) return st + "eons";
    if (p === 3 && /c$/.test(st)) return st.slice(0, -1) + "çons";
    return st + e;
  }
  function frPP(f) { if (f.pp) return f.pp; return /er$/.test(f.inf) ? f.inf.slice(0, -2) + "é" : null; }
  var FR_AVOIR = ["ai", "as", "a", "avons", "avez", "ont"], FR_ETRE = ["suis", "es", "est", "sommes", "êtes", "sont"];
  var FR_ALLER = ["vais", "vas", "va", "allons", "allez", "vont"];
  var DE_HABEN = ["habe", "hast", "hat", "haben", "habt", "haben"], DE_SEIN = ["bin", "bist", "ist", "sind", "seid", "sind"];
  var DE_WERDEN = ["werde", "wirst", "wird", "werden", "werdet", "werden"];

  // Persoon in de doeltaal (u/ustedes -> Sie/vous)
  function persFor(lang, s) {
    if (!s.formal) return s.p;
    if (lang === "de") return 5;
    if (lang === "fr") return 4;
    return s.p;
  }

  // Werkwoorden met vast voorzetsel: Spaans lemma -> voorzetsel per taal (de: [voorzetsel, naamval])
  // Voorzetsels met de tweede naamval in het Duits (wegen, trotz, während, statt, innerhalb, außerhalb)
  var GENP = {
    "a causa de": { en: "because of", de: "wegen", fr: "à cause de" },
    "a pesar de": { en: "despite", de: "trotz", fr: "malgré" },
    "durante": { en: "during", de: "während", fr: "pendant" },
    "en lugar de": { en: "instead of", de: "statt", fr: "au lieu de" },
    "dentro de": { en: "inside", de: "innerhalb", fr: "à l'intérieur de" },
    "fuera de": { en: "outside", de: "außerhalb", fr: "en dehors de" }
  };
  var PV = {
    soñar: { es: "con", en: "about", de: ["von", "dat"], fr: "de" },
    depender: { es: "de", en: "on", de: ["von", "dat"], fr: "de" },
    participar: { es: "en", en: "in", de: ["an", "dat"], fr: "à" },
    preguntar: { es: "por", en: "about", de: ["nach", "dat"], fr: "sur" },
    invitar: { es: "a", en: "to", de: ["zu", "dat"], fr: "à" },
    pertenecer: { es: "a", en: "to", de: ["zu", "dat"], fr: "à" },
    dudar: { es: "de", en: "", de: ["an", "dat"], fr: "de" },
    consistir: { es: "en", en: "of", de: ["aus", "dat"], fr: "en" },
    contribuir: { es: "a", en: "to", de: ["zu", "dat"], fr: "à" },
    advertir: { es: "de", en: "about", de: ["vor", "dat"], fr: "de" },
    felicitar: { es: "por", en: "on", de: ["zu", "dat"], fr: "pour" },
    comparar: { es: "con", en: "with", de: ["mit", "dat"], fr: "avec" },
    reflexionar: { es: "sobre", en: "about", de: ["über", "acc"], fr: "sur" },
    creer: { es: "en", en: "in", de: ["an", "acc"], fr: "en" },
    empezar: { es: "con", en: "with", de: ["mit", "dat"], fr: "avec" },
    interesarse: { es: "por", en: "in", de: ["für", "acc"], fr: "à" },
    alegrarse: { es: "de", en: "about", de: ["über", "acc"], fr: "de" },
    adaptar: { es: "a", en: "to", de: ["an", "acc"], fr: "à" },
    acordarse: { es: "de", en: "", de: ["an", "acc"], fr: "de" },
    acostumbrarse: { es: "a", en: "", de: ["an", "acc"], fr: "à" },
    referirse: { es: "a", en: "to", de: ["auf", "acc"], fr: "à" },
    concentrarse: { es: "en", en: "on", de: ["auf", "acc"], fr: "sur" },
    reaccionar: { es: "a", en: "to", de: ["auf", "acc"], fr: "à" },
    especializarse: { es: "en", en: "in", de: ["auf", "acc"], fr: "dans" },
    confiar: { es: "en", en: "", de: ["auf", "acc"], fr: "à" },
    renunciar: { es: "a", en: "", de: ["auf", "acc"], fr: "à" },
    prepararse: { es: "para", en: "for", de: ["auf", "acc"], fr: "à" },
    preparar: { es: "para", en: "for", de: ["auf", "acc"], fr: "à" },
    decidirse: { es: "por", en: "on", de: ["für", "acc"], fr: "pour" },
    disculparse: { es: "por", en: "for", de: ["für", "acc"], fr: "de" },
    luchar: { es: "por", en: "for", de: ["für", "acc"], fr: "pour" },
    protestar: { es: "contra", en: "against", de: ["gegen", "acc"], fr: "contre" },
    invertir: { es: "en", en: "in", de: ["in", "acc"], fr: "dans" },
    disfrutar: { es: "de", en: "", de: ["", "gen"], fr: "de" },
    enamorarse: { es: "de", en: "with", de: ["in", "acc"], fr: "de" },
    enfadarse: { es: "por", en: "about", de: ["über", "acc"], fr: "de" },
    informar: { es: "sobre", en: "on", de: ["über", "acc"], fr: "sur" },
    quejarse: { es: "de", en: "about", de: ["über", "acc"], fr: "de" },
    discutir: { es: "sobre", en: "", de: ["über", "acc"], fr: "de" },
    reírse: { es: "de", en: "at", de: ["über", "acc"], fr: "de" },
    sorprenderse: { es: "de", en: "at", de: ["über", "acc"], fr: "de" },
    informarse: { es: "sobre", en: "about", de: ["über", "acc"], fr: "sur" },
    ocuparse: { es: "de", en: "of", de: ["um", "acc"], fr: "de" },
    preocuparse: { es: "por", en: "about", de: ["um", "acc"], fr: "de" },
    quedar: { es: "con", en: "", de: ["mit", "dat"], fr: "" },
    unir: { es: "con", en: "with", de: ["mit", "dat"], fr: "à" },
    recuperarse: { es: "de", en: "from", de: ["von", "dat"], fr: "de" },
    contar: { es: "de", en: "about", de: ["von", "dat"], fr: "de" },
    tratar: { es: "de", en: "with", de: ["von", "dat"], fr: "de" },
    separarse: { es: "de", en: "from", de: ["von", "dat"], fr: "de" },
    convencer: { es: "de", en: "of", de: ["von", "dat"], fr: "de" },
    diferir: { es: "de", en: "from", de: ["von", "dat"], fr: "de" },
    despedirse: { es: "de", en: "to", de: ["von", "dat"], fr: "de" },
    tender: { es: "a", en: "to", de: ["zu", "dat"], fr: "à" },
    sufrir: { es: "de", en: "from", de: ["an", "dat"], fr: "de" },
    ayudar: { es: "con", en: "with", de: ["bei", "dat"], fr: "à" },
    pensar: { es: "en", en: "about", de: ["an", "acc"], fr: "à" }
  };
  return {
    PV: PV,
    GENP: GENP,
    L: L, fold: fold, low: low, cap: cap, has: has, split6: split6, normKey: normKey, enKey: enKey, stripAcc: stripAcc,
    NOUN: NOUN, NIDX: NIDX, PERSON: PERSON, PROF: PROF, enPlural: enPlural, frPlural: frPlural, dePlural: dePlural,
    esFem: esFem, esPlural: esPlural, esArt: esArt, esAdj: esAdj, STRESSED_A: STRESSED_A,
    ADJ: ADJ, AIDX: AIDX, SER_ESTAR: SER_ESTAR, frAdjPl: frAdjPl, deAdjStem: deAdjStem,
    NAT: NAT, NATIDX: NATIDX, LANG: LANG, LANGIDX: LANGIDX, PLACE: PLACE, PIDX: PIDX,
    NLIDX: NLIDX, ADV: ADV, ADVIDX: ADVIDX, TENER: TENER, TIDX: TIDX, WEATHER: WEATHER, WIDX: WIDX, FIXED: FIXED, FIDX: FIDX,
    VERB: VERB, esForm: esForm, esGer: esGer, esPP: esPP, HABER: HABER, REFL_ES: REFL_ES, esIsRefl: esIsRefl, esBase: esBase,
    ESF: ESF, ESFF: ESFF, GERIDX: GERIDX, PPIDX: PPIDX, INFIDX: INFIDX,
    enS3: enS3, enPast: enPast, enPPf: enPPf, enIng: enIng,
    dePres: dePres, dePP: dePP, deInf: deInf, dePrt: dePrt, DE_HABEN: DE_HABEN, DE_SEIN: DE_SEIN, DE_WERDEN: DE_WERDEN,
    frPres: frPres, frPP: frPP, FR_AVOIR: FR_AVOIR, FR_ETRE: FR_ETRE, FR_ALLER: FR_ALLER, persFor: persFor
  };
})();
