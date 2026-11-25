// Ontleden: Spaans (partnerzinnen) en Engels, Duits, Frans (invoer) naar de gedeelde zinsstructuur.
// Elke parser geeft null als een woord of zinsbouw niet zeker herkend wordt.
var ZINI = (function () {
  var C = ZINC, L = C.L, VERB = C.VERB, NOUN = C.NOUN, ADJ = C.ADJ, has = C.has, fold = C.fold, low = C.low, cap = C.cap;
  var DICT = function (lang) { return (typeof DICTS !== "undefined" && DICTS[lang]) || {}; };
  var REV = function (lang) { return (typeof REVS !== "undefined" && REVS[lang]) || {}; };

  // ---------------- gedeelde hulpfuncties ----------------
  var DITRANS = { dar: 1, mostrar: 1, traer: 1, enviar: 1, decir: 1, preguntar: 1, contar: 1 };
  function subjOf(p, g, formal, pron) { return { p: p, g: g || null, formal: !!formal, pron: !!pron, np: null }; }
  function npHead(np) { return np; }
  var INTJ = { si: { en: "Yes", de: "Ja", fr: "Oui", es: "Sí" }, no: { en: "No", de: "Nein", fr: "Non", es: "No" } };

  // ================= SPAANS =================
  // Spaanse zelfstandige naamwoorden (ook meervoud, zonder accenten)
  var ESN = {};
  function addN(form, key, pl) { var k = fold(form); if (!has(ESN, k)) ESN[k] = { n: key, pl: pl }; }
  Object.keys(NOUN).filter(function (k) { return NOUN[k].esPlOnly; }).forEach(function (k) { addN(k, k, true); });
  Object.keys(NOUN).forEach(function (k) { var e = NOUN[k]; addN(k, k, e.esPlOnly); if (!e.esPlOnly) addN(C.esPlural(k), k, true); });
  // naDet: het woord staat direct achter een lidwoord of bezittelijk voornaamwoord ("la cocina", "mi casa");
  // dan is het een zelfstandig naamwoord, ook als dezelfde vorm een werkwoord kan zijn (cocina = kookt)
  function esNoun(tok, naDet) {
    var t = fold(tok);
    if (has(ESPRON, t)) return null;   // voornaamwoorden (él, ella, …) zijn nooit een zelfstandig naamwoord
    // lidwoorden, voorzetsels en voegwoorden zijn nooit een zelfstandig naamwoord ("esta la casa" is geen "deze la")
    if (/^(el|la|lo|los|las|un|una|unos|unas|de|del|a|al|en|y|o|que|se|me|te|le|les|nos|os|con|por|para|sin)$/.test(low(tok))) return null;
    if (has(ESN, t)) return ESN[t];
    // woorden uit de woordenlijsten: alleen als er een vertaling in het Engels, Duits of Frans is
    var cand = [[tok, false]];
    if (/es$/.test(tok)) cand.push([tok.slice(0, -2), true]);
    if (/s$/.test(tok)) cand.push([tok.slice(0, -1), true]);
    if (/ces$/.test(tok)) cand.push([tok.slice(0, -3) + "z", true]);
    if (/iones$/.test(tok)) cand.push([tok.slice(0, -5) + "ión", true]);
    for (var i = 0; i < cand.length; i++) {
      var w = cand[i][0];
      if (!naDet && (has(VERB, w) || has(C.INFIDX, fold(w)))) continue;
      if (REV("en")[w] !== undefined && REV("de")[w] !== undefined && REV("fr")[w] !== undefined && /^[a-záéíóúñü_]+$/.test(w) && !has(ADJ, w)) return { n: w, pl: cand[i][1] };
    }
    return null;
  }
  var ESA = {};
  Object.keys(ADJ).forEach(function (k) {
    [[false, false], [true, false], [false, true], [true, true]].forEach(function (fp) { var f = fold(C.esAdj(k, fp[0], fp[1])); if (!has(ESA, f)) ESA[f] = { a: k, fem: fp[0], pl: fp[1] }; });
  });
  Object.keys(C.SER_ESTAR).forEach(function (k) {
    [[false, false], [true, false], [false, true], [true, true]].forEach(function (fp) { var f = fold(C.esAdj(k, fp[0], fp[1])); ESA[f] = { a: k, fem: fp[0], pl: fp[1], se: true }; });
  });
  var ESNAT = {};
  Object.keys(C.NAT).forEach(function (k) {
    var n = C.NAT[k];
    ESNAT[fold(n.m)] = { key: k, g: "m" }; ESNAT[fold(n.f)] = { key: k, g: "f" };
    ESNAT[fold(C.esAdj(n.m, false, true))] = { key: k, g: "m", pl: true }; ESNAT[fold(C.esAdj(n.f, false, true))] = { key: k, g: "f", pl: true };
  });
  var ESPLACE = {}; Object.keys(C.PLACE).forEach(function (k) { ESPLACE[fold(k)] = k; });
  var ESLANG = {}; Object.keys(C.LANG).forEach(function (k) { ESLANG[fold(k)] = k; });
  var ESADV = {}; Object.keys(C.ADV).forEach(function (k) { ESADV[fold(k)] = k; });
  var ESPRON = { yo: [0], tu: [1], el: [2, "m"], ella: [2, "f"], usted: [2, null, true], nosotros: [3, "m"], nosotras: [3, "f"],
    vosotros: [4, "m"], vosotras: [4, "f"], ellos: [5, "m"], ellas: [5, "f"], ustedes: [5, null, true] };
  var ESCLIT = { me: { p: 0 }, te: { p: 1 }, lo: { p: 2, g: "m" }, la: { p: 2, g: "f" }, nos: { p: 3 }, os: { p: 4 }, los: { p: 5, g: "m" }, las: { p: 5, g: "f" }, le: { p: 2, dat: true }, les: { p: 5, dat: true }, se: { p: 2, refl: true } };
  var ESNUM = { un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, veinte: 20, treinta: 30, cien: 100 };
  var ESPREP = { en: "en", a: "a", con: "con", de: "de", para: "para", sin: "sin", desde: "desde", hasta: "hasta", sobre: "sobre" };
  var POSTSUBJ = { costar: 1, llegar: 1, venir: 1, salir: 1, empezar: 1, terminar: 1, abrir: 1, cerrar: 1, vivir: 1, trabajar: 1, ir: 1, volver: 1, regresar: 1 };
  var MOTION = { ir: 1, venir: 1, volver: 1, regresar: 1, viajar: 1, llegar: 1, salir: 1, caminar: 1, correr: 1, conducir: 1, mudarse: 1 };

  function esTokens(text) {
    var raw = String(text || "").trim();
    var q = /\?/.test(raw) || /^¿/.test(raw);
    var r = raw.replace(/[¿¡!?]/g, " ").replace(/\.+$/, "").replace(/…/g, " ").replace(/\s+/g, " ").trim();
    return { q: q, raw: r };
  }
  // Spaanse NP vanaf positie i (in fold-tokens T), of null
  function esNP(T, O, i, opts) {
    opts = opts || {};
    var t = T[i]; if (t === undefined) return null;
    var np = { k: "n", det: "none", adjs: [] }, j = i;
    // eigennamen / plaatsen (tot 3 woorden)
    for (var n = 3; n >= 1; n--) { var ph = T.slice(i, i + n).join(" "); if (has(ESPLACE, ph)) return { np: { k: "place", key: ESPLACE[ph] }, end: i + n }; }
    if (has(ESLANG, t) && opts.lang) return { np: { k: "lang", key: ESLANG[t] }, end: i + 1 };
    if (t === "esto") return { np: { k: "this" }, end: i + 1 };
    if (t === "eso") return { np: { k: "that" }, end: i + 1 };
    if (t === "el" || t === "la") { np.det = "def"; j++; }
    else if (t === "los" || t === "las") { np.det = "def"; np.pl = true; j++; }
    else if (t === "un" || t === "una") { np.det = "ind"; j++; }
    else if (t === "unos" || t === "unas") { np.det = "ind"; np.pl = true; j++; }
    else if (/^(mi|mis|tu|tus|nuestro|nuestra|nuestros|nuestras|vuestro|vuestra|vuestros|vuestras)$/.test(t)) {
      np.det = "poss"; np.own = /^m/.test(t) ? 0 : /^t/.test(t) ? 1 : /^n/.test(t) ? 3 : 4; np.pl = /s$/.test(t); j++;
    }
    else if (t === "su" || t === "sus") { np.det = "poss"; np.own = 2; np.ownG = null; np.pl = t === "sus"; j++; }
    else if (/^(este|esta|estos|estas)$/.test(t)) { np.det = "dem"; np.pl = /s$/.test(t); j++; }
    else if (/^(ese|esa|esos|esas)$/.test(t)) { np.det = "dem"; np.far = true; np.pl = /s$/.test(t); j++; }
    else if (t === "ningun" || t === "ninguna") { np.det = "neg"; j++; }
    else if (/^(mucho|mucha|muchos|muchas)$/.test(t)) { np.qty = "mucho"; np.pl = /s$/.test(t); j++; }
    else if (/^(poco|poca|pocos|pocas)$/.test(t)) { np.qty = "poco"; np.pl = /s$/.test(t); j++; }
    else if (/^(otro|otra|otros|otras)$/.test(t)) { np.qty = "otro"; np.pl = /s$/.test(t); j++; }
    else if ((t === "todos" || t === "todas") && /^(los|las)$/.test(T[i + 1] || "")) { np.det = "all"; np.pl = true; j += 2; }
    else if (has(ESNUM, t) && t !== "un" && t !== "una") { np.num = ESNUM[t]; np.pl = np.num > 1; j++; }
    else if (/^\d+$/.test(t)) { np.num = +t; np.pl = np.num > 1; j++; }
    else if (!opts.bare) return null;
    // "fin de semana"
    if (T[j] === "fin" && T[j + 1] === "de" && T[j + 2] === "semana") { np.n = "fin de semana"; np.pl = np.pl || false; j += 3; }
    else {
      var nd = np.det !== "none" || np.num !== undefined;
      var nn = T[j] !== undefined ? esNoun(O[j], nd) || esNoun(T[j], nd) : null;
      if (!nn) return null;
      np.n = nn.n; if (nn.pl) np.pl = true; else if (np.det !== "none" && !np.num) np.pl = !!np.pl;
      if (np.pl && !nn.pl && !(NOUN[nn.n] && NOUN[nn.n].esPlOnly)) return null;     // "los casa"
      j++;
    }
    // bijvoeglijke naamwoorden achter het zelfstandig naamwoord
    while (T[j] !== undefined && has(ESA, T[j]) && !ESA[T[j]].se) { np.adjs.push(ESA[T[j]].a); j++; }
    // "de" + bezitter
    if (T[j] === "de" && T[j + 1] !== undefined && !opts.noOf) {
      var of = esNP(T, O, j + 1, { noOf: true });
      if (of && of.np.k === "n" && of.np.det !== "none") { np.of = of.np; j = of.end; }
    }
    if (T[j] === "del" && !opts.noOf) {
      var of2 = esNP(["el"].concat(T.slice(j + 1)), ["el"].concat(O.slice(j + 1)), 0, { noOf: true });
      if (of2 && of2.np.k === "n") { np.of = of2.np; j = j + of2.end; }
    }
    return { np: np, end: j };
  }
  function esAdvAt(T, i) {
    for (var n = 4; n >= 1; n--) { var ph = T.slice(i, i + n).join(" "); if (has(ESADV, ph)) return { k: ESADV[ph], end: i + n }; }
    return null;
  }
  // werkwoordsvorm herkennen; voorkeur voor vormen met accent
  function esVerbAt(O, T, i) {
    var o = O[i], t = T[i];
    var hits = (C.ESF[o] || []).slice();
    if (!hits.length && t !== "esta" && t !== "como" && t !== "se") hits = (C.ESFF[t] || []).slice();
    if (!hits.length && t === "esta" && (T[i + 1] === undefined || !esNoun(O[i + 1]))) hits = (C.ESFF[t] || []).slice();
    return hits;
  }
  function splitEnclitic(tok) {
    var m = /^(.*?(ar|er|ir))(me|te|lo|la|le|nos|os|los|las|se)$/.exec(tok);
    if (m && has(C.INFIDX, fold(m[1]))) return { inf: C.INFIDX[fold(m[1])], cl: m[3] };
    var t = fold(tok);
    if (has(C.INFIDX, t)) return { inf: C.INFIDX[t], cl: null };
    return null;
  }

  function parseEs(text) {
    if (/…|\.\.\./.test(String(text || "")) && !/^vamos a ver/i.test(String(text).replace(/^[¿¡]/, ""))) return null;
    var tk = esTokens(text);
    var raw = tk.raw, q = tk.q;
    if (!raw) return null;
    var c = { type: q ? "yn" : "stmt", s: null, advs: [], obl: [] };
    // tussenwerpsel en "por favor"
    var fullKey = fold(raw.replace(/,/g, " ").replace(/\s+/g, " ").trim());
    if (has(C.FIXED, fullKey)) return { fixed: C.FIXED[fullKey] };
    var m = /^(s[ií]|no)\s*,\s*(.+)$/i.exec(raw);
    if (m) { c.intj = INTJ[fold(m[1])]; raw = m[2]; }
    if (/,?\s*por favor$/i.test(raw) && fold(raw) !== "por favor") { c.please = true; raw = raw.replace(/,?\s*por favor$/i, ""); }
    if (/^por favor,?\s+/i.test(raw) && fold(raw) !== "por favor") { c.please = true; raw = raw.replace(/^por favor,?\s+/i, ""); }
    raw = raw.replace(/,/g, " ").replace(/\s+/g, " ").trim();
    var key = fold(raw);
    if (has(C.FIXED, key) && !c.intj && !c.please) return { fixed: C.FIXED[key] };
    if (has(C.WEATHER, key)) return { fixed: C.WEATHER[key] };
    var origTok = raw.split(" ");
    var O = origTok.map(low), T = origTok.map(fold);
    var i = 0;
    // vraagwoord
    if (q || /^(que|donde|cuando|como|quien|por|cual|cuanto|cuanta|cuantos|cuantas|de|adonde)$/.test(T[0])) {
      var accented = /^(qué|dónde|cuándo|cómo|quién|cuál|cuánto|cuánta|cuántos|cuántas|adónde)$/.test(O[0]) || (O[0] === "de" && O[1] === "dónde") || (O[0] === "por" && O[1] === "qué");
      if (q || accented) {
        if (T[0] === "por" && T[1] === "que") { c.type = "wh"; c.wh = "porque"; i = 2; }
        else if (T[0] === "de" && T[1] === "donde") { c.type = "wh"; c.wh = "dedonde"; i = 2; }
        else if (T[0] === "a" && T[1] === "donde" || T[0] === "adonde") { c.type = "wh"; c.wh = "adonde"; i = T[0] === "adonde" ? 1 : 2; }
        else if (/^(que|donde|cuando|como|quien|quienes|cual|cuales)$/.test(T[0])) { c.type = "wh"; c.wh = { quienes: "quien", cuales: "cual" }[T[0]] || T[0]; i = 1; }
        else if (/^(cuanto|cuanta|cuantos|cuantas)$/.test(T[0])) { c.type = "wh"; c.wh = "cuanto"; i = 1; }
        if (c.type === "wh" && (c.wh === "que" || c.wh === "cuanto" || c.wh === "cual") && T[i] !== undefined) {
          var wn = esNoun(O[i]);
          if (wn && !esVerbAt(O, T, i).length) { c.whNP = { k: "n", n: wn.n, pl: wn.pl || /s$/.test(T[0]), det: "none" }; i++; }
        }
      }
    }
    // bijwoorden vooraan: "Ayer fui...", "Siempre como..."
    while (T[i] !== undefined) { var fa = esAdvAt(T, i); if (!fa || fa.k === "cerca" || fa.k === "lejos") break; if (fa.k === "nunca") { c.never = true; } else c.advs.push(fa.k); i = fa.end; }
    // gustar: "(a mí) (no) me gusta(n) ..."
    var expP = null;
    if (T[i] === "a" && /^(mi|ti|el|ella|usted|nosotros|nosotras|vosotros|ellos|ellas|ustedes)$/.test(T[i + 1] || "")) { expP = ESPRON[T[i + 1] === "mi" ? "yo" : T[i + 1] === "ti" ? "tu" : T[i + 1]]; i += 2; }
    if (T[i] === "no") { c.neg = true; i++; }
    else if (T[i] === "nunca") { c.never = true; i++; }
    if (/^(me|te|le|nos|os|les)$/.test(T[i] || "") && /^(gusta|gustan|gusto|gustaron|gustaba|gustaban|encanta|encantan|encanto|encantaba)$/.test(T[i + 1] || "")) {
      var cl = ESCLIT[T[i]];
      var ep = expP || [cl.p, null, false];
      if ((cl.p === 2 || cl.p === 5) && !expP) return null;                    // "le gusta": hij of zij onbekend
      c.sp = /^gust/.test(T[i + 1]) ? "gustar" : "encantar";
      c.s = subjOf(ep[0], ep[1], ep[2], !!expP);
      c.t = /(o|aron)$/.test(T[i + 1]) ? "past" : (/ba(n)?$/.test(T[i + 1]) ? "impf" : "pres");
      c.v = c.sp;
      i += 2;
      var inf = splitEnclitic(O[i] || "");
      if (inf && T[i] !== undefined && !esNoun(O[i])) {
        c.infV = inf.inf; i++;
        if (inf.cl) { var ic = ESCLIT[inf.cl]; if (!ic || ic.dat || ic.refl) return null; c.infO = { k: "pron", p: ic.p, g: ic.g }; }
        var r0 = esRest(T, O, i, c, true); if (!r0) return null;
        if (r0.o) c.infO = r0.o;
        c.infObl = c.obl; c.obl = [];
        return finishEs(c);
      }
      var on = esNP(T, O, i, { lang: true }); if (!on) return null;
      c.o = on.np; i = on.end;
      var r1 = esRest(T, O, i, c, false); if (!r1 || r1.o) return null;
      return finishEs(c);
    }
    // onderwerp vooraan
    var subj = null;
    // "él" (met accent) is altijd het voornaamwoord; "el" zonder accent kan het lidwoord zijn
    if (has(ESPRON, T[i]) && !(T[i] === "el" && O[i] === "el" && esNoun(O[i + 1] || ""))) { var sp = ESPRON[T[i]]; subj = subjOf(sp[0], sp[1], sp[2], true); i++; }
    else if (c.type !== "wh" || true) {
      var sn = esNP(T, O, i);
      if (sn) { var vj = sn.end; if (T[vj] === "no") vj++; while (/^(me|te|lo|la|nos|os|los|las|le|les|se)$/.test(T[vj] || "")) vj++; if (esVerbAt(O, T, vj).length || /^(hay|he|has|ha|hemos|han)$/.test(T[vj] || "")) { subj = { p: sn.np.pl ? 5 : 2, np: sn.np }; i = sn.end; } }
    }
    if (T[i] === "no" && !c.neg) { c.neg = true; i++; }
    else if (T[i] === "nunca" && !c.never) { c.never = true; i++; }
    if (T[i] === "tampoco") return null;
    // clitica
    var clits = [];
    while (/^(me|te|lo|la|nos|os|los|las|le|les|se)$/.test(T[i] || "") && esVerbAt(O, T, i + 1).length + (/^(me|te|lo|la|nos|os|los|las|le|les|se)$/.test(T[i + 1] || "") ? 1 : 0) + (/^(he|has|ha|hemos|habeis|han)$/.test(T[i + 1] || "") ? 1 : 0)) { clits.push(T[i]); i++; }
    // hay / había
    if (T[i] === "hay" || T[i] === "habia" || T[i] === "hubo" || T[i] === "habra") {
      if (clits.length || subj) return null;
      c.sp = "hay"; c.v = "haber"; c.t = T[i] === "hay" ? "pres" : (T[i] === "hubo" ? "past" : (T[i] === "habra" ? "fut" : "impf")); c.s = subjOf(2, "n"); i++;
      var hn = esNP(T, O, i, { bare: true }); if (!hn) return null;
      c.o = hn.np; i = hn.end;
      var rh = esRest(T, O, i, c, false); if (!rh || rh.o) return null;
      return finishEs(c);
    }
    // haber de + infinitivo = tener que
    if (/^(he|has|ha|hemos|habeis|han)$/.test(T[i] || "") && T[i + 1] === "de" && has(C.INFIDX, T[i + 2] || "")) {
      var hdp = ["he", "has", "ha", "hemos", "habeis", "han"].indexOf(T[i]);
      T.splice(i, 3, { 0: "tengo", 1: "tienes", 2: "tiene", 3: "tenemos", 4: "teneis", 5: "tienen" }[hdp], "que", T[i + 2]);
    }
    // voltooide tijd: he/has/ha + deelwoord
    var vinfo = null;
    if (/^(he|has|ha|hemos|habeis|han)$/.test(T[i] || "") && has(C.PPIDX, T[i + 1] || "")) {
      vinfo = { v: C.PPIDX[T[i + 1]], tense: "perf", p: ["he", "has", "ha", "hemos", "habeis", "han"].indexOf(T[i]) };
      if (vinfo.p === 5 && subj && subj.np) vinfo.p = 5;
      i += 2;
    } else {
      var hits = esVerbAt(O, T, i);
      if (!hits.length) return null;
      vinfo = chooseVerb(hits, clits, subj, T, i);
      if (!vinfo) return null;
      i++;
    }
    var p = vinfo.p;
    if (subj && subj.np) { if (subj.np.pl ? p !== 5 : p !== 2) return null; }
    else if (subj) { if (subj.p !== p && !(subj.formal && ((subj.p === 2 && p === 2) || (subj.p === 5 && p === 5)))) return null; }
    else subj = subjOf(p, null, false, false);
    c.s = subj; c.v = vinfo.v; if (c.v === "salir" && subj && subj.np && subj.np.k === "n" && TRANSPORT_N[subj.np.n]) c.v = "partir"; c.t = vinfo.tense === "pret" ? "past" : (vinfo.tense === "imp" ? "impf" : vinfo.tense);
    // wederkerend werkwoord met het voornaamwoord
    var refl = C.esIsRefl(c.v);
    var reflWord = C.REFL_ES[p];
    if (refl) { var ri = clits.indexOf(reflWord); if (ri < 0) return null; clits.splice(ri, 1); }
    if (c.v === "llamarse") {
      if (c.type === "wh" && c.wh === "como") {
        var sl = esNP(T, O, i);
        if (sl) { c.s = { p: sl.np.pl ? 5 : 2, np: sl.np }; i = sl.end; }
        return i === T.length ? finishEs(Object.assign(c, { sp: "llamarse" })) : null;
      }
      if (c.type !== "stmt" || i >= T.length) return null;
      c.sp = "llamarse"; c.name = origTok.slice(i).map(function (w) { return cap(w); }).join(" ");
      if (!/^[A-Za-zÀ-ÿ' -]+$/.test(c.name) || origTok.length - i > 3) return null;
      return finishEs(c);
    }
    // objectvoornaamwoorden
    if (clits.length === 2 && DITRANS[c.v] && /^(me|te|nos|os|se|le|les)$/.test(clits[0]) && /^(lo|la|los|las)$/.test(clits[1])) {
      var cc0 = ESCLIT[clits[0]];
      c.io = { p: clits[0] === "se" ? 2 : (cc0.dat ? (clits[0] === "les" ? 5 : 2) : cc0.p), g: null };
      c.o = { k: "pron", p: /s$/.test(clits[1]) ? 5 : 2, g: "n" };
      clits = [];
    }
    if (clits.length > 1) return null;
    if (clits.length === 1) {
      var cc = ESCLIT[clits[0]];
      // "le pregunto a mi madre": de persoon staat er met "a" bij; dan is het voornaamwoord geen apart meewerkend voorwerp
      var aPersoon = c.v === "preguntar" && T.slice(i).indexOf("a") >= 0;
      // preguntar/contar: alleen meewerkend voorwerp als er ook iets gevraagd/verteld wordt ("me pregunta algo"); "te pregunto" blijft gewoon
      if ((c.v === "preguntar" || c.v === "contar") && i >= T.length) aPersoon = true;
      if (cc && !cc.refl && DITRANS[c.v] && !aPersoon && /^(me|te|nos|os|le|les)$/.test(clits[0])) { c.io = { p: cc.dat ? (clits[0] === "les" ? 5 : 2) : cc.p, g: cc.g || null }; clits = []; cc = null; }
      else if (!cc || cc.dat || cc.refl) return null;
      if (cc && cc.p === p && p !== 2 && p !== 5) {
        if (has(VERB, C.esBase(c.v) + "se")) { c.v = C.esBase(c.v) + "se"; clits = []; }
        else if (c.v === "ir") { c.v = "irse"; clits = []; }
        else return null;
      } else if (!cc) { /* meewerkend voorwerp al verwerkt */ } else if (/^(saber|creer|entender|comprender|hacer|decir|pensar|olvidar|comprar|encontrar|intentar|probar|ganar|perder|recoger|buscar|usar|pedir|leer|escribir|comer|beber|tener|preparar|abrir|cerrar|pagar|traer|llevar|enviar|mandar|necesitar|cambiar|terminar|empezar|conseguir|reservar|cocinar|tomar|repetir|explicar|aprender|estudiar|practicar|limpiar|lavar|guardar|vender|romper|arreglar|recordar|traducir|imprimir|apagar|encender)$/.test(c.v) && clits[0] === "lo") c.o = { k: "pron", p: 2, g: "n" };
      else if (clits[0] === "lo" || clits[0] === "la") c.o = { k: "pron", p: 2, g: clits[0] === "la" ? "f" : "m", amb: true };
      else if (cc) c.o = { k: "pron", p: cc.p, g: cc.g || null };
    }
    // modaal / ir a / estar + gerundium
    if ((c.v === "ir") && T[i] === "a" && splitEnclitic(O[i + 1] || "") && !esNoun(O[i + 1])) {
      var f1 = splitEnclitic(O[i + 1]);
      c.t = c.t === "pres" ? "fut" : null; if (!c.t) return null;
      c.v = f1.inf; i += 2;
      if (f1.cl) { var c1 = ESCLIT[f1.cl]; if (!c1 || c1.dat) return null; if (c1.refl || (C.esIsRefl(c.v) && f1.cl === reflWord)) {} else c.o = { k: "pron", p: c1.p, g: c1.g }; }
      if (C.esIsRefl(c.v) && !(f1.cl === reflWord || clits.indexOf(reflWord) >= 0)) {
        if (has(VERB, c.v.replace(/se$/, ""))) c.v = c.v.replace(/se$/, ""); else return null;
      }
    } else if (/^(poder|querer|deber|tener que|necesitar|deber cond|tener permiso)$/.test(c.v) && splitEnclitic(O[i] || "") && !esNoun(O[i]) && T[i] !== "que") {
      var f2 = splitEnclitic(O[i]);
      c.mod = c.v; c.v = f2.inf; i++;
      if (f2.cl) {
        var c2 = ESCLIT[f2.cl]; if (!c2 || c2.dat) return null;
        if (c2.refl) { if (has(VERB, C.esBase(c.v) + "se")) c.v = C.esBase(c.v) + "se"; }
        else c.o = { k: "pron", p: c2.p, g: c2.g || null };
      } else if (C.esIsRefl(c.v)) { c.v = C.esBase(c.v); if (!has(VERB, c.v)) return null; }
    } else if (c.v === "tener" && T[i] === "permiso" && T[i + 1] === "para" && splitEnclitic(O[i + 2] || "")) {
      var f4 = splitEnclitic(O[i + 2]);
      c.mod = "tener permiso"; c.v = f4.inf; i += 3;
      if (f4.cl) { var c4 = ESCLIT[f4.cl]; if (!c4 || c4.dat) return null; if (f4.cl === reflWord && has(VERB, C.esBase(c.v) + "se")) c.v = C.esBase(c.v) + "se"; else c.o = { k: "pron", p: c4.p, g: c4.g || null }; }
      else if (C.esIsRefl(c.v)) { c.v = C.esBase(c.v); if (!has(VERB, c.v)) return null; }
    } else if (c.v === "tener" && T[i] === "que" && splitEnclitic(O[i + 1] || "")) {
      var f3 = splitEnclitic(O[i + 1]);
      c.mod = "tener que"; c.v = f3.inf; i += 2;
      if (f3.cl) { var c3 = ESCLIT[f3.cl]; if (!c3 || c3.dat) return null; if (f3.cl === reflWord && has(VERB, C.esBase(c.v) + "se")) c.v = C.esBase(c.v) + "se"; else c.o = { k: "pron", p: c3.p, g: c3.g || null }; }
      else if (C.esIsRefl(c.v)) { c.v = C.esBase(c.v); if (!has(VERB, c.v)) return null; }
    } else if (c.v === "estar" && has(C.GERIDX, T[i] || "")) {
      c.v = C.GERIDX[T[i]]; c.t = c.t === "pres" ? "prog" : null; if (!c.t) return null; i++;
    }
    if (c.mod && C.esIsRefl(c.v) && !has(VERB, c.v)) return null;
    // tener-uitdrukkingen en leeftijd
    if (c.v === "tener" && !c.mod) {
      var j = i, deg = null;
      if (T[j] === "mucho" || T[j] === "mucha") { deg = "mucho"; j++; }
      if (has(C.TENER, O[j] || "") || has(C.TENER, T[j] === "frio" ? "frío" : T[j] === "razon" ? "razón" : T[j] === "sueno" ? "sueño" : "#")) {
        var tk2 = has(C.TENER, O[j]) ? O[j] : (T[j] === "frio" ? "frío" : T[j] === "razon" ? "razón" : "sueño");
        if (deg) return null;
        c.sp = "tener"; c.tn = tk2; i = j + 1;
        var rt = esRest(T, O, i, c, false); if (!rt || rt.o) return null;
        return finishEs(c);
      }
      if ((has(ESNUM, T[i]) || /^\d+$/.test(T[i] || "")) && /^anos?$/.test(T[i + 1] || "") && O[i + 1] !== "anos") {
        c.sp = "edad"; c.age = has(ESNUM, T[i]) ? ESNUM[T[i]] : +T[i]; i += 2;
        var ra = esRest(T, O, i, c, false); if (!ra || ra.o) return null;
        return finishEs(c);
      }
    }
    // onderwerp na het werkwoord in vragen: "¿Cuánto cuesta el café?", "¿A qué hora llega el tren?"
    if (c.type !== "stmt" && !c.s.pron && !c.s.np && (p === 2 || p === 5) && !c.mod && POSTSUBJ[c.v] && !c.o) {
      var ps = esNP(T, O, i);
      if (ps && (ps.np.pl ? 5 : 2) === p) { c.s = { p: p, np: ps.np }; i = ps.end; }
    }
    // ser/estar: predicaat
    if ((c.v === "ser" || c.v === "estar") && !c.mod) {
      var pr = esPredicate(T, O, i, c);
      if (pr === null) return null;
      return finishEs(c);
    }
    // gewone werkwoorden
    var rr = esRest(T, O, i, c, true);
    if (!rr) return null;
    if (rr.o) { if (c.o) return null; c.o = rr.o; }
    return finishEs(c);
  }
  function chooseVerb(hits, clits, subj, T, i) {
    // wederkerend werkwoord als het voornaamwoord er staat
    var best = null;
    hits.forEach(function (h) {
      var refl = C.esIsRefl(h.v);
      var hasRefl = clits.indexOf(C.REFL_ES[h.p]) >= 0;
      var score = 0;
      if (refl && hasRefl) score += 3;
      if (refl && !hasRefl) score -= 5;
      if (!refl && hasRefl && (h.p === 0 || h.p === 1 || h.p === 3 || h.p === 4) && has(VERB, h.v + "se")) score -= 2;
      if (subj && !subj.np && subj.p === h.p) score += 2;
      if (subj && subj.np && h.p === (subj.np.pl ? 5 : 2)) score += 2;
      // fui/fue: ir bij "a", anders ser
      if ((h.v === "ir" || h.v === "ser") && h.tense === "pret") { if (/^(a|al|con|sin)$/.test(T[i + 1] || "") && !(T[i + 1] === "con" && /^(mi|tu|su|nuestro|vuestro)$/.test("") )) score += h.v === "ir" ? 2 : -2; else score += h.v === "ser" ? 1 : -1; }
      if (h.v === "venir" && h.tense === "pret" && h.p === 2 && T[i] === "vino") score -= 1;
      if (!best || score > best.score) best = { v: h.v, tense: h.tense, p: h.p, score: score };
    });
    if (best && best.score < -2) return null;
    return best;
  }
  // predicaat na ser/estar
  function esPredicate(T, O, i, c) {
    var deg = null;
    if (/^(muy|bastante|demasiado)$/.test(T[i] || "")) { deg = T[i]; i++; }
    var t = T[i];
    // geen predicaat: "¿Dónde está la estación?" / "¿Cómo estás?"
    if (c.type === "wh" && (c.wh === "donde" || c.wh === "como" || c.wh === "dedonde" || c.wh === "cuando")) {
      if (t === undefined) { c.pred = null; return c; }
      var sn = esNP(T, O, i);
      if (sn && !deg) {
        if (c.s.pron || c.s.np) return null;
        c.s = { p: sn.np.pl ? 5 : 2, np: sn.np }; i = sn.end;
        var r0 = esRest(T, O, i, c, false); if (!r0 || r0.o) return null;
        return c;
      }
      return null;
    }
    if (t === undefined) return null;
    // ser de + plaats (herkomst)
    if (c.v === "ser" && t === "de" && !deg) {
      var pl = esNP(T, O, i + 1, { bare: true });
      if (pl && pl.np.k === "place") { c.sp = "origen"; c.from = pl.np; var r1 = esRest(T, O, pl.end, c, false); return r1 && !r1.o ? c : null; }
      return null;
    }
    if (has(ESA, t)) {
      var a = ESA[t];
      if (a.se) c.pred = { t: "adj", a: a.a + "#" + (c.v === "estar" ? 1 : 0), deg: deg };
      else c.pred = { t: "adj", a: a.a, deg: deg };
      // geslacht/getal van het onderwerp afleiden uit het bijvoeglijk naamwoord
      if (!c.s.np && c.s.p === 2 && !c.s.formal && !c.s.g) c.s.g = a.fem ? "f" : (c.s.pron ? null : null);
      if (!c.s.np && !c.s.g && a.fem) c.s.g = "f";
      if (!c.s.np && !c.s.g && /o$|os$/.test(t)) c.s.g = "m";
      i++;
      var r2 = esRest(T, O, i, c, false); return r2 && !r2.o ? c : null;
    }
    if (has(ESNAT, t) && !deg) {
      var n = ESNAT[t];
      c.pred = { t: "nat", key: n.key, g: n.g };
      if (!c.s.np && !c.s.g) c.s.g = n.g;
      var r3 = esRest(T, O, i + 1, c, false); return r3 && !r3.o ? c : null;
    }
    if (deg) return null;
    // plaats: "estoy en casa", "está aquí"
    if (c.v === "estar") {
      if (T[i] === "de" && T[i + 1] === "vacaciones") { c.pred = { t: "idiom", key: "vacaciones" }; var rv = esRest(T, O, i + 2, c, false); return rv && !rv.o ? c : null; }
      var r4 = esRest(T, O, i, c, false);
      if (!r4 || r4.o) return null;
      if (!c.obl.length && !c.advs.length) return null;
      if (!c.obl.length && c.advs.every(function (k) { return C.ADV[k] && C.ADV[k].k !== "p"; })) return null;
      if (c.obl.length === 1 && !c.advs.length) { c.pred = { t: "loc", pp: c.obl[0] }; c.obl = []; }
      return c;
    }
    // ser + naamwoord: "es mi padre", "soy profesor", "es un libro"
    var np = esNP(T, O, i, { bare: true });
    if (np) {
      c.pred = { t: "np", np: np.np };
      if (!c.s.np && c.s.p === 2 && !c.s.g && !c.s.formal) {
        if (np.np.k === "n" && has(C.PERSON, np.np.n)) c.s.g = C.esFem(np.np.n) ? "f" : "m";
        else c.s.g = "n";
      }
      if (!c.s.np && c.s.p === 5 && !c.s.g) c.s.g = "m";
      var r5 = esRest(T, O, np.end, c, false); return r5 && !r5.o ? c : null;
    }
    return null;
  }
  // rest van de zin: object, voorzetselgroepen, bijwoorden, tijd
  function esRest(T, O, i, c, allowObj) {
    var out = { o: null };
    while (i < T.length) {
      var t = T[i];
      var adv = esAdvAt(T, i);
      if (adv && !((t === "mucho" || t === "poco") && T[i + 1] !== undefined && esNoun(O[i + 1])) && !(t === "manana" && /^(por)$/.test(T[i - 1] || "")) && !(t === "cerca" && T[i + 1] === "de") && !(t === "lejos" && T[i + 1] === "de")) { c.advs.push(adv.k); i = adv.end; continue; }
      // "hasta las cinco" = tot vijf uur: dezelfde tijd als "a las cinco", met de markering "tot"
      if (t === "hasta" && (T[i + 1] === "las" || (T[i + 1] === "la" && T[i + 2] === "una"))) { c.until = true; T[i] = "a"; t = "a"; }
      // Klokttijd met minuten: "a las once y media", "a las doce menos cuarto", "a la una y cinco"
      if (t === "a") { var ck = esClock(T, i); if (ck && ck.min) { c.hour = ck.hour; c.min = ck.min; i += ck.n; continue; } }
      if (t === "a" && T[i + 1] === "las" && (has(ESNUM, T[i + 2]) || /^\d+$/.test(T[i + 2] || ""))) { c.hour = has(ESNUM, T[i + 2]) ? ESNUM[T[i + 2]] : +T[i + 2]; i += 3; continue; }
      if (t === "a" && T[i + 1] === "la" && T[i + 2] === "una") { c.hour = 1; i += 3; continue; }
      if ((t === "el" || t === "los") && /^(lunes|martes|miercoles|jueves|viernes|sabados?|domingos?)$/.test(T[i + 1] || "")) {
        var dk = Object.keys(NOUN).filter(function (k) { return fold(k) === T[i + 1].replace(/^(sabado|domingo)s$/, "$1"); })[0];
        c.day = { key: dk, pl: t === "los" }; i += 2; continue;
      }
      if (t === "por" && T[i + 1] === "la" && /^(manana|tarde|noche)$/.test(T[i + 2] || "")) return null;
      if (t === "conmigo" || t === "contigo") { c.obl.push({ prep: "con", np: { k: "pron", p: t === "conmigo" ? 0 : 1 } }); i++; continue; }
      if (t === "muy" || t === "bastante") return null;
      // voorzetsels met de tweede naamval in het Duits (a causa de, a pesar de, durante, ...)
      var gpHit = null;
      Object.keys(C.GENP).forEach(function (k) { var kt = k.split(" "); if (!gpHit && kt.every(function (w, q) { return T[i + q] === w; }) && (!gpHit || kt.length > gpHit.len)) gpHit = { key: k, len: kt.length }; });
      if (gpHit) {
        var gTT = T, gOO = O, gS = i + gpHit.len, gDel = false;
        if (/ de$/.test(gpHit.key) && T[gS] === "del") { gTT = T.slice(0, gS).concat(["el"], T.slice(gS + 1)); gOO = O.slice(0, gS).concat(["el"], O.slice(gS + 1)); gDel = true; }
        var gnp = esNP(gTT, gOO, gS, { bare: true });
        if (!gnp) return null;
        c.obl.push({ prep: gpHit.key, np: gnp.np }); i = gnp.end; continue;
      }
      // voorzetsel
      if (has(ESPREP, t) || t === "al" || t === "del" || (t === "cerca" && T[i + 1] === "de") || ((t === "por" || t === "contra") && C.PV[c.v] && C.PV[c.v].es === t)) {
        var prep = t === "al" ? "a" : (t === "del" ? "de" : (t === "cerca" ? "cerca" : ((t === "por" || t === "contra") ? t : ESPREP[t])));
        var start = (t === "al" || t === "del") ? null : i + 1;
        if (t === "cerca") start = i + 2;
        var npx;
        var TON = { "mi": 0, "ti": 1, "nosotros": 3, "vosotros": 4 };
        if (C.PV[c.v] && C.PV[c.v].es === prep && start !== null && has(TON, T[start]) && (T[start] !== "mi" || /^mí$/i.test(O[start] || ""))) { c.obl.push({ prep: prep, np: { k: "pron", p: TON[T[start]], g: "m" } }); i = start + 1; continue; }
        if (start === null) { var tt = ["el"].concat(T.slice(i + 1)), oo = ["el"].concat(O.slice(i + 1)); npx = esNP(tt, oo, 0); if (npx) npx.end = i + npx.end; }
        else if (T[start] === "casa") { npx = { np: { k: "n", n: "casa", det: "none" }, end: start + 1 }; }
        else npx = esNP(T, O, start, { bare: prep === "en" || prep === "de" || prep === "con" || prep === "sin" || prep === "para" });
        if (!npx) return null;
        // persoonlijke "a" bij een persoon als lijdend voorwerp
        if (prep === "a" && DITRANS[c.v] && (out.o || c.o) && !c.io && npx.np.k === "n") { c.io = { np: npx.np }; i = npx.end; continue; }
        if (prep === "a" && c.v === "responder" && !out.o && !c.o && npx.np.k === "n") { out.o = npx.np; i = npx.end; continue; }
        if (prep === "a" && allowObj && !MOTION[c.v] && !out.o && npx.np.k === "n" && has(C.PERSON, npx.np.n) && !c.o) { out.o = npx.np; i = npx.end; continue; }
        if (prep === "a" && C.PV[c.v] && C.PV[c.v].es === "a") { c.obl.push({ prep: "a", np: npx.np }); i = npx.end; continue; }
        if (prep === "a" && !MOTION[c.v] && !(c.v === "jugar")) return null;
        if (prep === "a" && c.v === "jugar") { if (out.o || c.o) return null; out.o = npx.np; if (out.o.k === "n" && out.o.det === "def") out.o.det = "none"; i = npx.end; continue; }
        if (prep === "de" && (c.v === "venir") && npx.np.k === "place") { c.from = npx.np; i = npx.end; continue; }
        if (prep === "de" && /^(irse|ir)$/.test(c.v) && npx.np.k === "n" && npx.np.n === "vacaciones" && npx.np.det === "none") { c.obl.push({ prep: "idiom", key: "vacaciones" }); i = npx.end; continue; }
        c.obl.push({ prep: prep, np: npx.np });
        i = npx.end; continue;
      }
      // taal: "hablo español"
      if (has(ESLANG, t) && allowObj && !out.o && !c.o && !c.lng && (c.v === "hablar" || c.v === "aprender" || c.v === "estudiar" || c.v === "entender")) { c.lng = ESLANG[t]; i++; continue; }
      if (allowObj && !out.o && !c.o) {
        var np = esNP(T, O, i, { bare: true });
        if (np) {
          out.o = np.np; i = np.end;
          while ((T[i] === "y" || T[i] === "e") && T[i + 1] !== undefined) { var np2 = esNP(T, O, i + 1, { bare: true }); if (!np2) return null; out.o = coord(out.o, np2.np); i = np2.end; }
          continue;
        }
      }
      return null;
    }
    return out;
  }
  function coord(a, b) { if (a.k === "coord") { a.items.push(b); return a; } return { k: "coord", items: [a, b], pl: true }; }
  function finishEs(c) {
    if (!c.s) return null;
    if (c.never && c.neg) { c.neg = false; }
    if (c.io && !c.o && c.v !== "decir") return null;
    return c;
  }

  // ================= ENGELS =================
  var ENV = {};   // vorm -> [{ v, f (b/s3/past/ing/pp), tail, obj }]
  function addEV(form, lemma, f, ve) { (ENV[form] = ENV[form] || []).push({ v: lemma, f: f, tail: ve.tail || null, obj: ve.obj || null }); }
  Object.keys(VERB).forEach(function (lemma) {
    var ve = VERB[lemma].en; if (!ve || ve.be || ve.modal || ve.special || !ve.b) return;
    if (lemma === "tener que" || lemma === "necesitar" && false) return;
    addEV(ve.b, lemma, "b", ve); addEV(C.enS3(ve), lemma, "s3", ve); addEV(C.enPast(ve), lemma, "past", ve); addEV(C.enIng(ve), lemma, "ing", ve); addEV(C.enPPf(ve), lemma, "pp", ve);
  });
  // extra Engelse werkwoorden
  [["talk", "hablar"], ["start", "empezar"], ["begin", "empezar", { past: "began" }], ["leave", "salir", { past: "left" }], ["return", "volver"], ["phone", "llamar"], ["cook", "cocinar"], ["make", "hacer", { past: "made" }]].forEach(function (x) {
    var ve = Object.assign({ b: x[0] }, x[2] || {});
    addEV(ve.b, x[1], "b", {}); addEV(C.enS3(ve), x[1], "s3", {}); addEV(C.enPast(ve), x[1], "past", {}); addEV(C.enIng(ve), x[1], "ing", {});
  });
  (function () { var ve = { b: "miss", past: "missed" }; addEV("missed", "perder", "past", {}); addEV("missed", "perder", "pp", {}); })();   // "I missed the bus" (niet "I miss you")
  var EN_PREF = { understand: "entender", know: "saber", have: "tener", go: "ir", come: "venir", get: "levantarse", feel: "sentirse", like: "gustar", love: "encantar", watch: "mirar" };
  var ENPRON = { i: [0], you: [1], he: [2, "m"], she: [2, "f"], it: [2, "n"], we: [3], they: [5] };
  var ENOBJ = { me: [0], you: [1], him: [2, "m"], her: [2, "f"], it: [2, "n"], us: [3], them: [5] };
  var ENPOSS = { my: 0, your: 1, his: 2, her: 2, its: 2, our: 3, their: 5 };
  // Spaanse klokttijd op positie i (T[i] = "a"). Geeft {hour, min, n} terug; min is 0 bij een hele uur.
  // "y media" = 30, "y cuarto" = 15, "y cinco/diez/veinte/veinticinco" = 5/10/20/25 na het uur;
  // "menos cuarto" en "menos cinco/diez/veinte/veinticinco" = het volgende uur (het echte uur is het vorige).
  // Vervoermiddelen: "sale" betekent bij een bus, trein of vliegtuig "vertrekt" (partir), niet "gaat weg" (salir)
  var TRANSPORT_N = { "autobús": 1, "autobus": 1, "tren": 1, "avión": 1, "metro": 1, "barco": 1, "tranvía": 1 };
  var ESCLOCK_MIN = { media: 30, cuarto: 15, cinco: 5, diez: 10, veinte: 20, veinticinco: 25 };
  function esClock(T, i) {
    var j = i + 1, h = null;
    if (T[j] === "las" && (has(ESNUM, T[j + 1]) || /^\d+$/.test(T[j + 1] || ""))) { h = has(ESNUM, T[j + 1]) ? ESNUM[T[j + 1]] : +T[j + 1]; j += 2; }
    else if (T[j] === "la" && T[j + 1] === "una") { h = 1; j += 2; }
    else return null;
    var a = T[j], b = T[j + 1];
    if (a === "y" && ESCLOCK_MIN[b] !== undefined) return { hour: h, min: ESCLOCK_MIN[b], n: j + 2 - i };
    if (a === "menos" && ESCLOCK_MIN[b] !== undefined) {
      var hm = ((h + 10) % 12) + 1;                 // het uur ervoor (1 -> 12)
      return { hour: hm, min: 60 - ESCLOCK_MIN[b], n: j + 2 - i };
    }
    return { hour: h, min: 0, n: j - i };
  }
  var ENNUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, twenty: 20, thirty: 30, hundred: 100 };
  // Klokttijd met minuten in het Engels, Duits en Frans (zoals esClock): geeft {hour, min, n} of null; n = aantal woorden.
  // Het uur bij "to"/"vor"/"moins" en bij "halb" is het uur ervoor: "quarter to seven" = 6:45, "halb sieben" = 6:30.
  function vorigUur(h) { return ((h + 10) % 12) + 1; }
  function klokUur(tab, w) { if (has(tab, w || "") && tab[w] <= 24) return tab[w]; if (/^\d{1,2}$/.test(w || "") && +w <= 24) return +w; return null; }
  var ENCLOCK_MIN = { five: 5, ten: 10, twenty: 20, "twenty-five": 25, quarter: 15, half: 30 };
  function enClock(T, j) {
    var a = T[j];
    if (a === "a" && T[j + 1] === "quarter") { var q = enClock(T, j + 1); return q ? { hour: q.hour, min: q.min, n: q.n + 1 } : null; }
    if (ENCLOCK_MIN[a] !== undefined && (T[j + 1] === "past" || T[j + 1] === "to") && klokUur(ENNUM, T[j + 2]) !== null) {
      var h = klokUur(ENNUM, T[j + 2]), m = ENCLOCK_MIN[a];
      if (T[j + 1] === "to") { if (m === 30) return null; h = vorigUur(h); m = 60 - m; }
      return { hour: h, min: m, n: 3 };
    }
    var u = klokUur(ENNUM, a);
    if (u !== null) return { hour: u, min: 0, n: T[j + 1] === "o'clock" ? 2 : 1 };
    return null;
  }
  var DECLOCK_MIN = { "fünf": 5, zehn: 10, zwanzig: 20, viertel: 15 };
  function deClock(T, j) {
    var a = T[j], h;
    if (a === "halb" && (h = klokUur(DENUM, T[j + 1])) !== null) return { hour: vorigUur(h), min: 30, n: 2 };
    if (DECLOCK_MIN[a] !== undefined && (T[j + 1] === "nach" || T[j + 1] === "vor") && (h = klokUur(DENUM, T[j + 2])) !== null) {
      var m = DECLOCK_MIN[a];
      return T[j + 1] === "nach" ? { hour: h, min: m, n: 3 } : { hour: vorigUur(h), min: 60 - m, n: 3 };
    }
    if ((h = klokUur(DENUM, a)) !== null && T[j + 1] === "uhr") return { hour: h, min: 0, n: 2 };
    return null;
  }
  var FRCLOCK_MIN = { cinq: 5, dix: 10, vingt: 20, "vingt-cinq": 25 };
  function frClock(T, j) {
    var h = null, k = j;
    if (T[k] === "midi") { h = 12; k += 1; }
    else if (T[k] === "minuit") { h = 12; k += 1; }
    else if ((h = klokUur(FRNUM, T[k])) !== null && /^heures?$/.test(T[k + 1] || "")) k += 2;
    else return null;
    var a = T[k], b = T[k + 1];
    if (a === "et" && (b === "demie" || b === "demi")) return { hour: h, min: 30, n: k + 2 - j };
    if (a === "et" && b === "quart") return { hour: h, min: 15, n: k + 2 - j };
    if (a === "moins" && b === "le" && T[k + 2] === "quart") return { hour: vorigUur(h), min: 45, n: k + 3 - j };
    if (a === "moins" && (b === "quart" || FRCLOCK_MIN[b] !== undefined)) return { hour: vorigUur(h), min: 60 - (b === "quart" ? 15 : FRCLOCK_MIN[b]), n: k + 2 - j };
    if (FRCLOCK_MIN[a] !== undefined) return { hour: h, min: FRCLOCK_MIN[a], n: k + 1 - j };
    return { hour: h, min: 0, n: k - j };
  }
  var ENWH = { what: "que", where: "donde", when: "cuando", how: "como", who: "quien", why: "porque", which: "cual" };
  var ENDAYS = { monday: "lunes", tuesday: "martes", wednesday: "miércoles", thursday: "jueves", friday: "viernes", saturday: "sábado", sunday: "domingo" };
  function enNoun(w) {
    var k = low(w);
    if (has(C.NIDX.en, k)) return C.NIDX.en[k][0];
    var d = DICT("en");
    var cand = [[k, false]];
    if (/ies$/.test(k)) cand.push([k.slice(0, -3) + "y", true]);
    if (/es$/.test(k)) cand.push([k.slice(0, -2), true]);
    if (/s$/.test(k)) cand.push([k.slice(0, -1), true]);
    for (var i = 0; i < cand.length; i++) {
      var es = d[cand[i][0]];
      if (es && /^[a-záéíóúñü_]+$/.test(es) && !has(VERB, es) && !/(ar|er|ir)$/.test(es) && !has(ADJ, es) && !has(ENV, cand[i][0])) return { es: es, pl: cand[i][1] };
    }
    return null;
  }
  function enNP(T, O, i, opts) {
    opts = opts || {};
    var t = T[i]; if (t === undefined) return null;
    var np = { k: "n", det: "none", adjs: [] }, j = i;
    for (var n = 3; n >= 1; n--) { var ph = T.slice(i, i + n).join(" ").replace(/^the /, ""); if (has(C.PIDX.en, ph)) return { np: { k: "place", key: C.PIDX.en[ph] }, end: i + n }; }
    if (has(C.LANGIDX.en, t) && opts.lang) return { np: { k: "lang", key: C.LANGIDX.en[t] }, end: i + 1 };
    if ((t === "this" || t === "that") && (T[i + 1] === undefined || !enNoun(T[i + 1]))) return { np: { k: t }, end: i + 1 };
    if (t === "the") { np.det = "def"; j++; }
    else if (t === "a" || t === "an") { if (T[i + 1] === "lot" && T[i + 2] === "of") { np.qty = "mucho"; j += 3; } else { np.det = "ind"; j++; } }
    else if (t === "some") { np.det = "ind"; np.pl = true; j++; }
    else if (t === "any") { np.det = "none"; j++; }
    else if (has(ENPOSS, t)) { np.det = "poss"; np.own = ENPOSS[t]; np.ownG = { his: "m", her: "f", its: "n" }[t] || null; j++; }
    else if (t === "this" || t === "these") { np.det = "dem"; np.pl = t === "these"; j++; }
    else if (t === "that" || t === "those") { np.det = "dem"; np.far = true; np.pl = t === "those"; j++; }
    else if (t === "no") { np.det = "neg"; j++; }
    else if (t === "lots" && T[i + 1] === "of") { np.qty = "mucho"; j += 2; }
    else if (t === "many" || t === "much") { np.qty = "mucho"; j++; }
    else if (t === "another") { np.qty = "otro"; j++; }
    else if (has(ENNUM, t)) { np.num = ENNUM[t]; j++; }
    else if (/^\d+$/.test(t)) { np.num = +t; j++; }
    else if (!opts.bare) return null;
    while (T[j] !== undefined && has(C.AIDX.en, T[j]) && T[j + 1] !== undefined && (enNoun(T[j + 1]) || has(C.AIDX.en, T[j + 1]))) { np.adjs.push(C.AIDX.en[T[j]]); j++; }
    var nn = T[j] !== undefined ? enNoun(T[j]) : null;
    if (!nn) return null;
    np.n = nn.es; if (nn.pl) np.pl = true;
    if (np.num && np.num > 1) np.pl = true;
    j++;
    if (T[j] === "of" && T[j + 1] !== undefined && np.det !== "none") { var of = enNP(T, O, j + 1); if (of && of.np.k === "n") { np.of = of.np; j = of.end; } }
    return { np: np, end: j };
  }
  function enAdvAt(T, i) {
    for (var n = 3; n >= 1; n--) { var ph = T.slice(i, i + n).join(" "); if (has(C.ADVIDX.en, ph)) return { k: C.ADVIDX.en[ph], end: i + n }; }
    if (T[i] === "also") return { k: "también", end: i + 1 };
    return null;
  }
  var EN_CONTR = [[/\bi'm\b/g, "i am"], [/\b(you|we|they)'re\b/g, "$1 are"], [/\b(he|she|it|that|what|where|how|who|there)'s\b/g, "$1 is"],
    [/\bcan't\b/g, "can not"], [/\bcannot\b/g, "can not"], [/\bwon't\b/g, "will not"], [/\b(\w+)n't\b/g, "$1 not"], [/\b(i|you|we|they)'ve\b/g, "$1 have"],
    [/\b(i|you|he|she|we|they)'d like\b/g, "$1 would like"], [/\b(i|you|he|she|it|we|they)'ll\b/g, "$1 will"]];
  function parseEn(text) {
    var raw = String(text || "").trim();
    var q = /\?\s*$/.test(raw);
    var key = C.enKey(raw);
    if (has(C.FIDX.en, key)) return { fixedEs: C.FIDX.en[key] };
    if (has(C.WIDX.en, key)) return { fixedEs: C.WIDX.en[key] };
    var s = low(raw).replace(/[’]/g, "'").replace(/[?!.,]/g, " ");
    var c = { type: q ? "yn" : "stmt", advs: [], obl: [] };
    if (/(^|\s)please(\s|$)/.test(s)) { c.please = true; s = s.replace(/(^|\s)please(\s|$)/, " "); }
    EN_CONTR.forEach(function (r) { s = s.replace(r[0], r[1]); });
    var T = s.split(/\s+/).filter(Boolean), O = String(raw).replace(/[?!.,]/g, " ").split(/\s+/).filter(Boolean);
    if (!T.length) return null;
    if ((T[0] === "yes" || T[0] === "no") && T.length > 1 && /^(yes|no)\s*,/i.test(raw)) { c.intj = INTJ[T[0] === "yes" ? "si" : "no"]; T = T.slice(1); O = O.slice(1); }
    var i = 0;
    // vraagwoord
    if (has(ENWH, T[0]) || (T[0] === "how" && /^(much|many|old)$/.test(T[1] || ""))) {
      c.type = "wh";
      if (T[0] === "how" && (T[1] === "much" || T[1] === "many")) {
        c.wh = "cuanto"; i = 2;
        var wn = T[i] && enNoun(T[i]);
        if (wn && !(T[i] === "is" || T[i] === "does")) { c.whNP = { k: "n", n: wn.es, pl: T[1] === "many" || wn.pl, det: "none" }; i++; }
      } else if (T[0] === "which" || T[0] === "what") {
        c.wh = ENWH[T[0]]; i = 1;
        var wn2 = T[1] && enNoun(T[1]);
        if (wn2 && !/^(is|are|do|does|did|can)$/.test(T[1])) { c.whNP = { k: "n", n: wn2.es, pl: wn2.pl, det: "none" }; i = 2; }
      } else { c.wh = ENWH[T[0]]; i = 1; }
      if (c.wh === "donde" && T[T.length - 1] === "from") { c.wh = "dedonde"; T = T.slice(0, -1); }
    }
    // "there is/are"
    if (T[i] === "there" && /^(is|are|was|were)$/.test(T[i + 1] || "") || (c.type === "yn" && /^(is|are|was|were)$/.test(T[i] || "") && T[i + 1] === "there")) {
      var be = T[i] === "there" ? T[i + 1] : T[i];
      i += 2;
      c.sp = "hay"; c.v = "haber"; c.t = /^(was|were)$/.test(be) ? "impf" : "pres"; c.s = subjOf(2, "n");
      if (T[i] === "not") { c.neg = true; i++; if (T[i] === "a" || T[i] === "an" || T[i] === "any") { if (T[i] === "any") T[i] = "some"; } }
      if (T[i] === "no") { c.neg = true; i++; var nb = enNP(T, O, i, { bare: true }); if (!nb) return null; c.o = nb.np; c.o.det = c.o.pl ? "none" : "ind"; i = nb.end; }
      else { var nh = enNP(T, O, i, { bare: true }); if (!nh) return null; c.o = nh.np; i = nh.end; }
      var rh = enRest(T, O, i, c, false); if (!rh || rh.o) return null;
      return c;
    }
    // "my name is X"
    if (has(ENPOSS, T[i]) && T[i + 1] === "name" && T[i + 2] === "is" && c.type === "stmt") {
      var own = ENPOSS[T[i]];
      c.sp = "llamarse"; c.v = "llamarse"; c.t = "pres"; c.s = subjOf(own, { his: "m", her: "f" }[T[i]] || null);
      c.name = O.slice(i + 3).map(cap).join(" "); if (!c.name || O.length - i - 3 > 3) return null;
      return c;
    }
    // vraag met hulpwerkwoord vooraan (ja/nee of na een vraagwoord)
    var aux = null;
    if (c.type !== "stmt" && /^(do|does|did|am|is|are|was|were|can|could|must|will|have|has|would)$/.test(T[i] || "")) { aux = T[i]; i++; }
    // onderwerp
    var subj = null;
    if (has(ENPRON, T[i])) { var sp = ENPRON[T[i]]; subj = subjOf(sp[0], sp[1], false, true); i++; }
    else {
      var sn = enNP(T, O, i);
      if (sn) { subj = { p: sn.np.pl ? 5 : 2, np: sn.np }; i = sn.end; }
    }
    if (!subj) {
      if (c.type === "wh" && c.wh === "quien") subj = subjOf(2, null, false, false);
      else return null;
    }
    c.s = subj;
    // werkwoordsgroep
    if (!aux && /^(do|does|did|am|is|are|was|were|can|could|must|will|have|has|would)$/.test(T[i] || "") && !(/^(do|does|did)$/.test(T[i]) && T[i + 1] !== "not" && T[i + 1] !== undefined && c.type === "stmt")) { aux = T[i]; i++; }
    if (T[i] === "not") { c.neg = true; i++; }
    if (T[i] === "never") { c.never = true; i++; }
    var freqAdv = enAdvAt(T, i); if (freqAdv && C.ADV[freqAdv.k].k === "f") { if (freqAdv.k === "nunca") c.never = true; else c.advs.push(freqAdv.k); i = freqAdv.end; }
    var tense = "pres";
    if (aux === "did" || aux === "was" || aux === "were") tense = "past";
    if (aux === "will") tense = "fut";
    // be + going to / -ing / predicaat
    if (/^(am|is|are|was|were)$/.test(aux || "")) {
      if (T[i] === "going" && T[i + 1] === "to" && has(ENV, T[i + 2] || "") && tense === "pres") {
        var g = enLexAt(T, i + 2, "b"); if (!g) return null; c.t = "fut"; c.v = g.v; i = g.end;
        if (T[i] === "be") return null;
        return enAfterVerb(T, O, i, c, g);
      }
      if (has(ENV, T[i] || "") && /ing$/.test(T[i])) {
        var gi = enLexAt(T, i, "ing"); if (!gi) return null; c.v = gi.v; c.t = tense === "pres" ? (gi.v === "ir" ? "pres" : "prog") : null; if (!c.t) return null; i = gi.end;
        return enAfterVerb(T, O, i, c, gi);
      }
      c.t = tense === "past" ? "past" : "pres";
      return enBe(T, O, i, c);
    }
    if (aux === "can" || aux === "could" || aux === "must") {
      c.mod = aux === "must" ? "deber" : "poder"; c.t = aux === "could" ? "past" : "pres";
      var lm = enLexAt(T, i, "b"); if (!lm) return null; c.v = lm.v; i = lm.end;
      return enAfterVerb(T, O, i, c, lm);
    }
    if (aux === "would") { if (T[i] === "like") { c.mod = null; c.v = "querer"; c.t = "pres"; i++; if (T[i] === "to") { var lw = enLexAt(T, i + 1, "b"); if (!lw) return null; c.mod = "querer"; c.v = lw.v; i = lw.end; return enAfterVerb(T, O, i, c, lw); } return enAfterVerb(T, O, i, c, { v: "querer" }); } return null; }
    if (aux === "will") { var lf = enLexAt(T, i, "b"); if (!lf) return null; c.v = lf.v; c.t = "fut"; i = lf.end; return enAfterVerb(T, O, i, c, lf); }
    if (aux === "have" || aux === "has") {
      if (T[i] === "to") { var lt = enLexAt(T, i + 1, "b"); if (!lt) return null; c.mod = "tener que"; c.v = lt.v; c.t = "pres"; i = lt.end; return enAfterVerb(T, O, i, c, lt); }
      var lp = enLexAt(T, i, "pp"); if (lp) { c.v = lp.v; c.t = "perf"; i = lp.end; return enAfterVerb(T, O, i, c, lp); }
      if (c.type === "stmt") { c.v = "tener"; c.t = "pres"; return enAfterVerb(T, O, i, c, { v: "tener" }); }
      return null;
    }
    // do/does/did + grondvorm
    var form = aux ? "b" : null;
    if (/^(do|does|did)$/.test(aux || "")) {
      if (T[i] === "have" && T[i + 1] === "to") { var l2 = enLexAt(T, i + 2, "b"); if (!l2) return null; c.mod = "tener que"; c.v = l2.v; c.t = tense; i = l2.end; return enAfterVerb(T, O, i, c, l2); }
      if (/^(want|need)$/.test(T[i] || "") && T[i + 1] === "to") { var l3 = enLexAt(T, i + 2, "b"); if (!l3) return null; c.mod = T[i] === "want" ? "querer" : "necesitar"; c.v = l3.v; c.t = tense; i = l3.end; return enAfterVerb(T, O, i, c, l3); }
      if (T[i] === "have") { c.v = "tener"; c.t = tense; i++; return enAfterVerb(T, O, i, c, { v: "tener" }); }
      if (/^(like|love)$/.test(T[i] || "")) { c.t = tense; return enLike(T, O, i, c); }
      var lb = enLexAt(T, i, "b"); if (!lb) return null; c.v = lb.v; c.t = tense; i = lb.end;
      return enAfterVerb(T, O, i, c, lb);
    }
    if (aux) return null;
    // vervoegd werkwoord zonder hulpwerkwoord
    var w = T[i];
    if (/^(am|is|are)$/.test(w)) return null;
    if (/^(have|has|had)$/.test(w || "")) {
      if (T[i + 1] === "to") { var l4 = enLexAt(T, i + 2, "b"); if (!l4) return null; c.mod = "tener que"; c.v = l4.v; c.t = w === "had" ? "past" : "pres"; i = l4.end; return enAfterVerb(T, O, i, c, l4); }
      if (w !== "had") { var lp2 = enLexAt(T, i + 1, "pp"); if (lp2) { c.v = lp2.v; c.t = "perf"; i = lp2.end; return enAfterVerb(T, O, i, c, lp2); } }
      c.v = "tener"; c.t = w === "had" ? "past" : "pres"; i++;
      return enAfterVerb(T, O, i, c, { v: "tener" });
    }
    if (/^(want|wants|wanted|need|needs|needed)$/.test(w || "") && T[i + 1] === "to") {
      var l5 = enLexAt(T, i + 2, "b"); if (!l5) return null; c.mod = /^w/.test(w) ? "querer" : "necesitar"; c.v = l5.v; c.t = /^(wanted|needed)$/.test(w) ? "past" : "pres"; i = l5.end; return enAfterVerb(T, O, i, c, l5);
    }
    if (/^(want|wants|wanted)$/.test(w || "")) { c.v = "querer"; c.t = w === "wanted" ? "past" : "pres"; i++; return enAfterVerb(T, O, i, c, { v: "querer" }); }
    if (/^(need|needs|needed)$/.test(w || "")) { c.v = "necesitar"; c.t = w === "needed" ? "past" : "pres"; i++; return enAfterVerb(T, O, i, c, { v: "necesitar" }); }
    if (/^(like|likes|liked|love|loves|loved)$/.test(w || "")) { c.t = /d$/.test(w) ? "past" : "pres"; return enLike(T, O, i, c); }
    var hits = ENV[w] || [];
    if (!hits.length) return null;
    var fm = hits.filter(function (h) { return h.f !== "ing" && h.f !== "pp" || h.f === "past"; });
    var l6 = enLexAt(T, i, null); if (!l6) return null;
    if (l6.f === "ing") return null;
    if (l6.f === "pp" && l6.f !== "past") { if (!(ENV[w] || []).some(function (h) { return h.f === "past"; })) return null; }
    c.v = l6.v; c.t = l6.f === "past" || (l6.f === "pp" && (ENV[w] || []).some(function (h) { return h.f === "past"; })) ? "past" : "pres";
    // persoon controleren (hij-vorm)
    var s3 = (subj.np && !subj.np.pl) || (!subj.np && subj.p === 2);
    if (c.t === "pres" && ((s3 && l6.f !== "s3") || (!s3 && l6.f === "s3"))) {
      if (!(l6.f === "b" && C.enS3({ b: w }) === w)) return null;
    }
    i = l6.end;
    return enAfterVerb(T, O, i, c, l6);
  }
  // werkwoord met eventueel een deeltje (look for, get up, go out ...)
  function enLexAt(T, i, want) {
    var w = T[i]; var hits = ENV[w] || [];
    if (!hits.length) return null;
    if (want) hits = hits.filter(function (h) { return h.f === want || (want === "b" && h.f === "b"); });
    if (!hits.length) return null;
    // deeltje direct erachter of na het object: kies het werkwoord met dat deeltje
    var best = null;
    hits.forEach(function (h) {
      var sc = 0, end = i + 1;
      if (h.tail) {
        var tw = h.tail.split(" ");
        var ok = tw.every(function (x, k) { return T[i + 1 + k] === x; });
        if (ok) { sc = 10; end = i + 1 + tw.length; } else sc = -10;
      }
      if (h.obj) { if (T[end] === h.obj) { sc += 5; end++; } else sc -= 1; }
      if (EN_PREF[w] === h.v || EN_PREF[(VERB[h.v] && VERB[h.v].en && VERB[h.v].en.b) || ""] === h.v) sc += 1;
      if (!best || sc > best.sc) best = { v: h.v, f: h.f, sc: sc, end: end };
    });
    if (!best || best.sc < -2) return null;
    return best;
  }
  function enAfterVerb(T, O, i, c, l) {
    var r = enRest(T, O, i, c, true);
    if (!r) return null;
    if (r.o) c.o = r.o;
    if (c.io && !c.o && c.v !== "decir") return null;
    // "know" + persoon/plaats -> conocer
    if (c.v === "saber" && c.o && (c.o.k === "place" || (c.o.k === "n"))) c.v = "conocer";
    // "have" + drankje -> tomar
    if (c.v === "tener" && c.o && c.o.k === "n" && c.o.det === "ind" && /^(café|té|cerveza|vino|zumo|agua)$/.test(c.o.n)) c.v = "tomar";
    if (c.v === "ir" && c.o) return null;
    return c;
  }
  function enLike(T, O, i, c) {
    var w = T[i]; c.sp = /^lik/.test(w) ? "gustar" : "encantar"; c.v = c.sp; i++;
    if (T[i] === "to") { var l = enLexAt(T, i + 1, "b"); if (!l) return null; c.infV = l.v; i = l.end; }
    else if (has(ENV, T[i] || "") && /ing$/.test(T[i])) { var l2 = enLexAt(T, i, "ing"); if (!l2) return null; c.infV = l2.v; i = l2.end; }
    if (c.infV) {
      var r = enRest(T, O, i, c, true); if (!r) return null;
      if (r.o) c.infO = r.o; c.infObl = c.obl; c.obl = [];
      return c;
    }
    if (has(ENOBJ, T[i]) && T.length === i + 1) return null;
    var np = enNP(T, O, i, { bare: true, lang: true }); if (!np) return null;
    c.o = np.np; i = np.end;
    if (c.o.det === "none" && c.o.k === "n") c.o.det = "def";
    var r2 = enRest(T, O, i, c, false); if (!r2 || r2.o) return null;
    return c;
  }
  // zijn-zinnen in het Engels
  function enBe(T, O, i, c) {
    c.v = "estar";
    var deg = null;
    if (T[i] === "very") { deg = "muy"; i++; } else if (T[i] === "quite") { deg = "bastante"; i++; } else if (T[i] === "too" && T[i + 1] !== undefined) { deg = "demasiado"; i++; }
    var t = T[i];
    if (t === undefined) {
      if (c.type === "wh" && (c.wh === "donde" || c.wh === "como" || c.wh === "dedonde" || c.wh === "cuando")) { c.v = c.wh === "dedonde" ? "ser" : (c.wh === "cuando" ? "ser" : "estar"); if (c.wh === "dedonde") { c.sp = null; } return c; }
      return null;
    }
    // leeftijd
    if ((has(ENNUM, t) || /^\d+$/.test(t)) && (T[i + 1] === undefined || (T[i + 1] === "years" && T[i + 2] === "old"))) {
      if (c.type !== "stmt") return null;
      c.sp = "edad"; c.v = "tener"; c.age = has(ENNUM, t) ? ENNUM[t] : +t; return c;
    }
    // herkomst
    if (t === "from") { var pl = enNP(T, O, i + 1, { bare: true }); if (!pl || pl.np.k !== "place") return null; c.sp = "origen"; c.v = "ser"; c.from = pl.np; var r0 = enRest(T, O, pl.end, c, false); return r0 && !r0.o ? c : null; }
    // tener-uitdrukkingen (alleen met een persoon als onderwerp)
    var tw = T.slice(i, i + 3).join(" ");
    var tk = has(C.TIDX.en, t) ? C.TIDX.en[t] : (has(C.TIDX.en, tw) ? C.TIDX.en[tw] : null);
    if (tk && !c.s.np && c.s.g !== "n" && !deg) {
      c.sp = "tener"; c.v = "tener"; c.tn = tk; i += C.TENER[tk].en.split(" ").length;
      var r1 = enRest(T, O, i, c, false); return r1 && !r1.o ? c : null;
    }
    var BEADJ = { interested: "interesarse", worried: "preocuparse", surprised: "sorprenderse", angry: "enfadarse", pleased: "alegrarse", happy: "alegrarse" };
    if (has(BEADJ, t) && !deg && C.PV[BEADJ[t]] && T[i + 1] === C.PV[BEADJ[t]].en && T[i + 2] !== undefined) {
      var bv = BEADJ[t], bpr = C.PV[bv].es, bnp = null, bend = i + 2;
      if (has(ENOBJ, T[i + 2])) { bnp = { k: "pron", p: ENOBJ[T[i + 2]][0], g: ENOBJ[T[i + 2]][1] || "m" }; bend = i + 3; }
      else { var bn = enNP(T, O, i + 2, { bare: true }); if (bn && bn.np.k === "n") { bnp = bn.np; bend = bn.end; } }
      if (bnp) { c.v = bv; c.obl.push({ prep: bpr, np: bnp }); var rb = enRest(T, O, bend, c, false); return rb && !rb.o ? c : null; }
    }
    if (has(C.AIDX.en, t)) {
      var a = C.AIDX.en[t];
      if (/#/.test(a)) { c.v = a.slice(-1) === "1" ? "estar" : "ser"; c.pred = { t: "adj", a: a, deg: deg }; }
      else { c.v = ADJ[a].estar ? "estar" : "ser"; c.pred = { t: "adj", a: a, deg: deg }; }
      var r2 = enRest(T, O, i + 1, c, false); return r2 && !r2.o ? c : null;
    }
    if (has(C.NATIDX.en, t) && !deg) { c.v = "ser"; c.pred = { t: "nat", key: C.NATIDX.en[t].k }; var r3 = enRest(T, O, i + 1, c, false); return r3 && !r3.o ? c : null; }
    if (deg) return null;
    // plaats
    if (/^(in|at|on|here|there|home|near)$/.test(t)) {
      c.v = "estar";
      var r4 = enRest(T, O, i, c, false); if (!r4 || r4.o) return null;
      if (c.obl.length === 1 && !c.advs.length) { c.pred = { t: "loc", pp: c.obl[0] }; c.obl = []; }
      else if (!c.obl.length && !c.advs.length) return null;
      return c;
    }
    var np = enNP(T, O, i, { bare: true });
    if (np) {
      c.v = "ser"; c.pred = { t: "np", np: np.np };
      if (c.s.g === "n" && np.np.k === "n" && has(C.PERSON, np.np.n)) c.s.g = C.esFem(np.np.n) ? "f" : "m";
      var r5 = enRest(T, O, np.end, c, false); return r5 && !r5.o ? c : null;
    }
    return null;
  }
  function enRest(T, O, i, c, allowObj) {
    var out = { o: null };
    while (i < T.length) {
      var t = T[i];
      var adv = enAdvAt(T, i);
      if (adv && !(t === "a" && T[i + 1] === "lot" && T[i + 2] === "of") && !(t === "a" && T[i + 1] !== "lot" && T[i + 1] !== "bit")) { if (adv.k === "nunca") c.never = true; else c.advs.push(adv.k); i = adv.end; continue; }
      if (t === "too" || t === "either") { c.advs.push("también"); i++; continue; }
      if (t === "at" || t === "until" || t === "till") { var ek = enClock(T, i + 1); if (ek) { c.hour = ek.hour; c.min = ek.min; if (t !== "at") c.until = true; i += 1 + ek.n; continue; } }
      if (t === "at" && (has(ENNUM, T[i + 1]) || /^\d+$/.test(T[i + 1] || ""))) { c.hour = has(ENNUM, T[i + 1]) ? ENNUM[T[i + 1]] : +T[i + 1]; i += 2; if (T[i] === "o'clock") i++; continue; }
      if (t === "on" && has(ENDAYS, (T[i + 1] || "").replace(/s$/, ""))) { c.day = { key: ENDAYS[T[i + 1].replace(/s$/, "")], pl: /s$/.test(T[i + 1]) }; i += 2; continue; }
      if (t === "home" && MOTION[c.v]) { c.obl.push({ prep: "a", np: { k: "n", n: "casa", det: "none" } }); i++; continue; }
      if (t === "at" && T[i + 1] === "home") { c.obl.push({ prep: "en", np: { k: "n", n: "casa", det: "none" } }); i += 2; continue; }
      if ((t === "at" || t === "to") && /^(work|school|university)$/.test(T[i + 1] || "")) {
        var nk = { work: "trabajo", school: "escuela", university: "universidad" }[T[i + 1]];
        c.obl.push({ prep: t === "at" ? "en" : "a", np: { k: "n", n: nk, det: "def" } }); i += 2; continue;
      }
      if (t === "by" && /^(train|bus|car|plane|bike|taxi|boat)$/.test(T[i + 1] || "")) {
        var bk = { train: "tren", bus: "autobús", car: "coche", plane: "avión", bike: "bici", taxi: "taxi", boat: "barco" }[T[i + 1]];
        c.obl.push({ prep: "en", np: { k: "n", n: bk, det: "none" } }); i += 2; continue;
      }
      var PREPS = { "in": "en", at: "en", to: "a", "with": "con", "for": "para", without: "sin", from: "de", about: "sobre", near: "cerca", until: "hasta" };
      if (C.PV[c.v] && (C.PV[c.v].en === t || (c.v === "soñar" && t === "of")) && !has(ENOBJ, T[i + 1] || "")) {
        var npv = enNP(T, O, i + 1, { bare: true });
        if (npv && npv.np.k === "n") { c.obl.push({ prep: C.PV[c.v].es, np: npv.np }); i = npv.end; continue; }
      }
      var egHit = null;
      Object.keys(C.GENP).forEach(function (k) { var kt = C.GENP[k].en.split(" "); if (!egHit && kt.every(function (w, q) { return T[i + q] === w; })) egHit = { key: k, len: kt.length }; });
      if (egHit) { var egn = enNP(T, O, i + egHit.len, { bare: true }); if (!egn) return null; c.obl.push({ prep: egHit.key, np: egn.np }); i = egn.end; continue; }
      if (has(PREPS, t)) {
        var prep = PREPS[t];
        if (t === "about" && c.v === "pensar") prep = "en";
        if (C.PV[c.v] && C.PV[c.v].en === t && has(ENOBJ, T[i + 1] || "")) { c.obl.push({ prep: C.PV[c.v].es, np: { k: "pron", p: ENOBJ[T[i + 1]][0], g: ENOBJ[T[i + 1]][1] || "m" } }); i += 2; continue; }
        if (t === "to" && DITRANS[c.v] && !has(ENOBJ, T[i + 1] || "") && (out.o || c.o) && !c.io) { var ion2 = enNP(T, O, i + 1, { bare: true }); if (ion2 && ion2.np.k === "n") { c.io = { np: ion2.np }; i = ion2.end; continue; } }
        if (t === "to" && DITRANS[c.v] && has(ENOBJ, T[i + 1] || "") && (out.o || c.o) && !c.io) { var ipo2 = ENOBJ[T[i + 1]]; c.io = { p: ipo2[0], g: ipo2[1] || null }; i += 2; continue; }
        if (prep === "a" && !MOTION[c.v]) return null;
        if (has(ENOBJ, T[i + 1] || "") && prep !== "a") return null;
        var npx = enNP(T, O, i + 1, { bare: true });
        if (!npx) return null;
        if (prep === "de" && c.v === "venir" && npx.np.k === "place") { c.from = npx.np; i = npx.end; continue; }
        if (t === "for" && (c.v === "buscar" || c.v === "esperar")) { if (out.o || c.o) return null; out.o = npx.np; i = npx.end; continue; }
        if (t === "to" && c.v === "escuchar") { out.o = npx.np; i = npx.end; continue; }
        c.obl.push({ prep: prep, np: npx.np }); i = npx.end; continue;
      }
      if (allowObj && !out.o && !c.o && !c.io && DITRANS[c.v] && has(ENOBJ, t) && T[i + 1] !== undefined && !/^(in|at|to|with|for|without|from|about|near|until|and)$/.test(T[i + 1]) && !enAdvAt(T, i + 1)) {
        var nx = enNP(T, O, i + 1, { bare: true });
        if (nx) { var ipo = ENOBJ[t]; c.io = { p: ipo[0], g: ipo[1] || null }; i++; continue; }
      }
      if (allowObj && !out.o && !c.o && has(ENOBJ, t)) { var po = ENOBJ[t]; out.o = { k: "pron", p: po[0], g: po[1] || null }; i++; continue; }
      if (allowObj && !out.o && !c.o && !c.lng && has(C.LANGIDX.en, t) && /^(hablar|aprender|estudiar|entender)$/.test(c.v)) { c.lng = C.LANGIDX.en[t]; i++; continue; }
      if (allowObj && !out.o && !c.o) { var np = enNP(T, O, i, { bare: true }); if (np) { out.o = np.np; i = np.end; while (T[i] === "and" && T[i + 1] !== undefined) { var n2 = enNP(T, O, i + 1, { bare: true }); if (!n2) return null; out.o = coord(out.o, n2.np); i = n2.end; } continue; } }
      // deeltjes die bij het werkwoord horen, na het object (look for, get up)
      var ve = VERB[c.v] && VERB[c.v].en;
      if (ve && ve.tail && T.slice(i, i + ve.tail.split(" ").length).join(" ") === ve.tail) { i += ve.tail.split(" ").length; continue; }
      return null;
    }
    return out;
  }

  // ================= DUITS =================
  var DEV = {};  // vorm -> [{ v, p:[...], tense, sep, tail, modal }]
  function addDV(form, lemma, ps, tense, dv) { if (!form) return; var k = low(form); (DEV[k] = DEV[k] || []).push({ v: lemma, p: ps, tense: tense, sep: dv.sep || null, tail: dv.tail || null }); }
  Object.keys(VERB).forEach(function (lemma) {
    var dv = VERB[lemma].de; if (!dv) return;
    for (var p = 0; p < 6; p++) { addDV(C.dePres(dv, p), lemma, [p], "pres", dv); if (dv.prt) addDV(C.dePrt(dv, p), lemma, [p], "past", dv); }
  });
  // wollen: ook "querer"
  ["will", "willst", "will", "wollen", "wollt", "wollen"].forEach(function (f, p) { addDV(f, "querer", [p], "pres", {}); });
  ["mag", "magst", "mag", "mögen", "mögt", "mögen"].forEach(function (f, p) { addDV(f, "gustar", [p], "pres", {}); });
  "verpasse verpasst verpasst verpassen verpasst verpassen".split(" ").forEach(function (f, p) { addDV(f, "perder", [p], "pres", {}); });
  var DEINF = {}, DEPP = {};
  Object.keys(VERB).forEach(function (lemma) {
    var dv = VERB[lemma].de; if (!dv) return;
    var inf = low(C.deInf(dv)); (DEINF[inf] = DEINF[inf] || []).push({ v: lemma, tail: dv.tail || null });
    var pp = low(C.dePP(dv)); (DEPP[pp] = DEPP[pp] || []).push({ v: lemma, aux: dv.aux || "h", tail: dv.tail || null });
  });
  var DE_PREF = { lernen: "aprender", sein: "estar", gehen: "ir", kommen: "venir", haben: "tener", verstehen: "entender", "müssen": "tener que", fahren: "conducir", wohnen: "vivir", leben: "vivir" };
  DEINF.leben = [{ v: "vivir" }];
  // extra Duitse werkwoorden die op een bestaand Spaans lemma uitkomen
  [["tun", "hacer", "tue tust tut tun tut tun", "tat tatst tat taten tatet taten", "getan"],
   ["treffen", "encontrar", "treffe triffst trifft treffen trefft treffen", "traf traf traf trafen traft trafen", "getroffen"],
   ["liegen", "estar", "liege liegst liegt liegen liegt liegen", "lag lagst lag lagen lagt lagen", "gelegen"],
   ["sollen", "deber cond", "soll sollst soll sollen sollt sollen", "sollte solltest sollte sollten solltet sollten", "gesollt"],
   ["dürfen", "tener permiso", "darf darfst darf dürfen dürft dürfen", "durfte durftest durfte durften durftet durften", "gedurft"]].forEach(function (al) {
    DEINF[al[0]] = (DEINF[al[0]] || []).concat([{ v: al[1], tail: null }]);
    al[2].split(" ").forEach(function (f, p) { addDV(f, al[1], [p], "pres", {}); });
    al[3].split(" ").forEach(function (f, p) { addDV(f, al[1], [p], al[0] === "sollen" ? "pres" : "past", {}); });
    (DEPP[al[4]] = DEPP[al[4]] || []).push({ v: al[1], aux: "h", tail: null });
  });
  ["lebe", "lebst", "lebt", "leben", "lebt", "leben"].forEach(function (f, p) { addDV(f, "vivir", [p], "pres", {}); });
  var DEPRON = { ich: [0], du: [1], er: [2, "m"], sie: [2, "f"], es: [2, "n"], wir: [3], ihr: [4] };
  var DEOBJ = { mich: [0], dich: [1], ihn: [2, "m"], es: [2, "n"], uns: [3], euch: [4], mir: [0, null, "d"], dir: [1, null, "d"], ihm: [2, "m", "d"], ihnen: [5, null, "d"] };
  var DENUM = { ein: 1, eins: 1, zwei: 2, drei: 3, vier: 4, "fünf": 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, "zwölf": 12, zwanzig: 20, dreißig: 30, hundert: 100 };
  var DEDAYS = { montag: "lunes", dienstag: "martes", mittwoch: "miércoles", donnerstag: "jueves", freitag: "viernes", samstag: "sábado", sonntag: "domingo" };
  var DEWH = { was: "que", wo: "donde", wann: "cuando", wie: "como", wer: "quien", warum: "porque", woher: "dedonde", wohin: "adonde" };
  function deUnUml(w) { return w.replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/äu/g, "au"); }
  function deNoun(w) {
    var k = low(w);
    if (has(C.NIDX.de, k)) return C.NIDX.de[k][0];
    var d = DICT("de");
    var cand = [[k, false]];
    ["n", "en", "e", "er", "s"].forEach(function (s) { if (k.length > 4 && k.slice(-s.length) === s) { cand.push([k.slice(0, -s.length), true]); cand.push([deUnUml(k.slice(0, -s.length)), true]); } });
    for (var i = 0; i < cand.length; i++) {
      var ck = cand[i][0];
      if (has(C.NIDX.de, ck)) return { es: C.NIDX.de[ck][0].es, pl: cand[i][1] || C.NIDX.de[ck][0].pl };
      var es = d[ck] || d["der " + ck] || d["die " + ck] || d["das " + ck];
      if (es && /^[a-záéíóúñü_]+$/.test(es) && !has(VERB, es) && !/(ar|er|ir)$/.test(es) && !has(ADJ, es) && (has(ZINO.GEN.de, ck) || d["der " + ck] || d["die " + ck] || d["das " + ck])) return { es: es, pl: cand[i][1] };
    }
    return null;
  }
  function deAdj(w) { var k = low(w); return has(C.AIDX.de, k) ? C.AIDX.de[k] : null; }
  function deNP(T, O, i, opts) {
    opts = opts || {};
    var t = T[i]; if (t === undefined) return null;
    var np = { k: "n", det: "none", adjs: [] }, j = i;
    for (var n = 3; n >= 1; n--) { var ph = T.slice(i, i + n).join(" "); var ph2 = ph.replace(/^(die|den|der) /, ""); if (has(C.PIDX.de, ph2) && (n > 1 || !/^(die|den|der)$/.test(t))) return { np: { k: "place", key: C.PIDX.de[ph2] }, end: i + n + (/^(den niederlanden|der türkei)$/.test(ph) ? 0 : 0) }; }
    if (/^(den|der) (niederlanden|türkei)$/.test(T.slice(i, i + 2).join(" "))) return { np: { k: "place", key: T[i + 1] === "türkei" ? "turquía" : "países bajos" }, end: i + 2 };
    if (has(C.LANGIDX.de, t) && opts.lang) return { np: { k: "lang", key: C.LANGIDX.de[t] }, end: i + 1 };
    if (/^(der|die|das|den|dem|des)$/.test(t)) { np.det = "def"; if (t === "die" || t === "den") np.plCand = true; j++; }
    else if (/^(ein|eine|einen|einem|einer|eines)$/.test(t)) { np.det = "ind"; j++; }
    else if (/^kein(e|en|em|er|es)?$/.test(t)) { np.det = "neg"; j++; }
    else if (/^(mein|dein|sein|ihr|unser|euer|eur|ihr)(e|en|em|er|es)?$/.test(t)) {
      var st = /^(mein|dein|sein|ihr|unser|euer|eur)/.exec(t)[1];
      np.det = "poss"; np.own = { mein: 0, dein: 1, sein: 2, ihr: 2, unser: 3, euer: 4, eur: 4 }[st]; np.ownG = st === "sein" ? "m" : (st === "ihr" ? "f" : null);
      if (O[i] && /^Ihr/.test(O[i]) && i > 0) { np.own = 2; np.ownFormal = true; }
      j++;
    }
    else if (/^dies(e|en|em|er|es)$/.test(t)) { np.det = "dem"; j++; }
    else if (/^viel(e|en|er)?$/.test(t)) { np.qty = "mucho"; j++; }
    else if (/^wenig(e|en|er)?$/.test(t)) { np.qty = "poco"; j++; }
    else if (has(DENUM, t) && t !== "ein") { np.num = DENUM[t]; j++; }
    else if (/^\d+$/.test(t)) { np.num = +t; j++; }
    else if (!opts.bare) return null;
    while (T[j] !== undefined && deAdj(T[j]) && T[j + 1] !== undefined && (deNoun(T[j + 1]) || deAdj(T[j + 1]))) { np.adjs.push(deAdj(T[j])); j++; }
    var nn = T[j] !== undefined ? deNoun(T[j]) : null;
    if (opts.gen && T[j] !== undefined && (j === i || /^(des|(ein|mein|dein|sein|ihr|unser|euer|eur|dies|kein)es)$/.test(t))) { [T[j].replace(/es$/, ""), T[j].replace(/s$/, "")].forEach(function (cd) { if (cd !== T[j] && !(nn && nn.gsing)) { var gsn = deNoun(cd); if (gsn && !gsn.pl) { nn = Object.assign({}, gsn, { gsing: true }); } } }); }
    if (!nn && opts.gen && T[j] !== undefined) nn = deNoun(T[j].replace(/(es|s|en|n)$/, "")) || deNoun(T[j].replace(/s$/, ""));
    if (!nn) return null;
    if (!/^[A-ZÄÖÜ]/.test(O[j] || "") && !has(C.NIDX.de, low(O[j] || ""))) { /* kleine letter: accepteren, gebruikers typen vaak zonder hoofdletter */ }
    np.n = nn.es; if (nn.pl) np.pl = true;
    if (np.num && np.num > 1) np.pl = true;
    delete np.plCand;
    j++;
    if (T[j] === "von" && np.det !== "none") { var of = deNP(T, O, j + 1); if (of && of.np.k === "n") { np.of = of.np; j = of.end; } }
    return { np: np, end: j };
  }
  function deAdvAt(T, i) {
    for (var n = 3; n >= 1; n--) { var ph = T.slice(i, i + n).join(" "); if (has(C.ADVIDX.de, ph)) return { k: C.ADVIDX.de[ph], end: i + n }; }
    return null;
  }
  function parseDe(text) {
    var raw = String(text || "").trim();
    var q = /\?\s*$/.test(raw);
    var key = C.normKey(raw);
    if (has(C.FIDX.de, key)) return { fixedEs: C.FIDX.de[key] };
    if (has(C.WIDX.de, key)) return { fixedEs: C.WIDX.de[key] };
    var c = { type: q ? "yn" : "stmt", advs: [], obl: [] };
    var s = raw.replace(/[?!.,]/g, " ");
    var Ow = s.split(/\s+/).filter(Boolean);
    if (/(^|\s)bitte(\s|$)/i.test(s)) { c.please = true; Ow = Ow.filter(function (w) { return low(w) !== "bitte"; }); }
    if (Ow.length > 1 && /^(ja|nein)$/i.test(Ow[0]) && /^(ja|nein)\s*,/i.test(raw)) { c.intj = INTJ[/^j/i.test(Ow[0]) ? "si" : "no"]; Ow = Ow.slice(1); }
    var O = Ow, T = Ow.map(low);
    if (!T.length) return null;
    // "mir ist kalt"
    if (/^(mir|dir|ihm|ihr|uns|euch|ihnen)$/.test(T[0]) && /^(ist|war)$/.test(T[1] || "") || (q && /^(ist|war)$/.test(T[0]) && /^(mir|dir|ihm|ihr|uns|euch|ihnen)$/.test(T[1] || ""))) {
      var dp = /^(ist|war)$/.test(T[0]) ? T[1] : T[0];
      var rest0 = T.slice(2);
      var neg0 = rest0[0] === "nicht"; if (neg0) rest0 = rest0.slice(1);
      if (rest0.length !== 1 || !/^(kalt|warm)$/.test(rest0[0])) return null;
      var pp0 = { mir: [0], dir: [1], ihm: [2, "m"], ihr: [2, "f"], uns: [3], euch: [4], ihnen: [5] }[dp];
      return { type: q ? "yn" : "stmt", s: subjOf(pp0[0], pp0[1]), sp: "tener", v: "tener", tn: rest0[0] === "kalt" ? "frío" : "calor", t: /^(war)$/.test(T[0]) || T[1] === "war" ? "past" : "pres", neg: neg0, advs: [], obl: [] };
    }
    // "es gibt"
    if ((T[0] === "es" && /^(gibt|gab)$/.test(T[1] || "")) || (q && /^(gibt|gab)$/.test(T[0]) && T[1] === "es")) {
      c.sp = "hay"; c.v = "haber"; c.s = subjOf(2, "n"); c.t = T[0] === "gab" || T[1] === "gab" ? "impf" : "pres";
      var ih = 2;
      var rh = deMid(T, O, ih, c, { hay: true });
      if (!rh || !c.o) return null;
      return c;
    }
    var i = 0;
    // vraagwoord
    if (has(DEWH, T[0]) || (T[0] === "wie" && /^(viel|viele|alt)$/.test(T[1] || ""))) {
      c.type = "wh";
      if (T[0] === "wie" && (T[1] === "viel" || T[1] === "viele")) {
        c.wh = "cuanto"; i = 2;
        var wn = T[i] && deNoun(T[i]); if (wn && !DEV[T[i]]) { c.whNP = { k: "n", n: wn.es, pl: T[1] === "viele" || wn.pl, det: "none" }; i++; }
      } else { c.wh = DEWH[T[0]]; i = 1; }
    }
    // eerste zinsdeel (onderwerp of bijwoord) en finiet werkwoord
    var subj = null, front = null;
    if (c.type === "stmt") {
      if (has(DEPRON, T[0])) { subj = dePronSubj(T, O, 0); i = 1; }
      else if ((T[0] === "das" || T[0] === "dies") && DEV[T[1] || ""]) { subj = subjOf(2, "n", false, false); i = 1; }
      else {
        var fn = deNP(T, O, 0);
        if (fn) { front = { np: fn.np }; i = fn.end; }
        else { var fa = deAdvAt(T, 0); if (!fa) return null; c.advs.push(fa.k); i = fa.end; front = { adv: true }; }
      }
    }
    var vf = DEV[T[i]];
    if (!vf) {
      if (c.type === "stmt") return null;
      return null;
    }
    var fin = T[i]; i++;
    // onderwerp na het werkwoord (vraag of inversie)
    if (!subj) {
      if (has(DEPRON, T[i]) || T[i] === "sie") { subj = dePronSubj(T, O, i); i++; }
      else if ((T[i] === "das" || T[i] === "dies") && !deNoun(T[i + 1] || "")) { subj = subjOf(2, "n", false, false); i++; }
      else if (front && front.np) { subj = { p: front.np.pl ? 5 : 2, np: front.np }; front = null; }
      else {
        var sn = deNP(T, O, i);
        if (sn && /^(der|die|das|ein|eine|mein|meine|dein|deine|sein|seine|ihr|ihre|unser|unsere)$/.test(T[i])) { subj = { p: sn.np.pl ? 5 : 2, np: sn.np }; i = sn.end; }
        else if (c.type === "wh" && c.wh === "quien") subj = subjOf(2, null, false, false);
        else return null;
      }
    }
    if (front && front.np) return null;   // voorwerp vooraan: te riskant
    if (!subj.np && !subj.formal && subj.p === 2 && subj.g === "f" && T.indexOf("sie") >= 0 && vf.every(function (h) { return h.p.indexOf(2) < 0; })) { subj.p = 5; subj.g = null; }
    c.s = subj;
    // werkwoord kiezen met de persoon van het onderwerp
    var sp = subj.np ? (subj.np.pl ? 5 : 2) : (subj.formal ? 5 : subj.p);
    var cand = vf.filter(function (h) { return h.p.indexOf(sp) >= 0 || (subj.p === 2 && subj.g === "f" && T[i - 1] === "sie" && h.p.indexOf(5) >= 0); });
    if (!cand.length) return null;
    if (!subj.np && subj.g === "f" && O.indexOf("sie") >= 0 && cand.every(function (h) { return h.p[0] === 5; })) { subj.p = 5; subj.g = null; }
    // eindveld: scheidbaar deel, infinitief of voltooid deelwoord
    var last = T[T.length - 1], last2 = T.slice(-2).join(" ");
    var finForm = cand[0];
    var mainV = null, tense = finForm.tense;
    var endTake = 0;
    var finLemmas = cand.map(function (h) { return h.v; });
    var isHaben = finLemmas.indexOf("tener") >= 0, isSein = finLemmas.indexOf("ser") >= 0;
    var isModal = cand.some(function (h) { return VERB[h.v] && VERB[h.v].de && VERB[h.v].de.modal || h.v === "querer" || h.v === "tener que" || h.v === "deber" || h.v === "poder" || h.v === "deber cond" || h.v === "tener permiso"; });
    var isWerden = false;
    if (/^(werde|wirst|wird|werden|werdet)$/.test(fin)) isWerden = true;
    if ((isHaben || isSein) && has(DEPP, last) && T.length - 1 >= i) {
      var pps = DEPP[last].filter(function (x) { return (isSein ? x.aux === "s" : x.aux !== "s"); });
      if (pps.length) { mainV = pickTail(pps, T, T.length - 1); if (!mainV) return null; tense = "past"; endTake = mainV.tailLen + 1; }
    }
    if (!mainV && (isModal || isWerden) && has(DEINF, last)) {
      mainV = pickTail(DEINF[last], T, T.length - 1); if (!mainV) return null; endTake = mainV.tailLen + 1;
      if (isWerden) { tense = "fut"; } else {
        var mh = cand.filter(function (h) { return /^(querer|poder|deber|tener que|deber cond|tener permiso)$/.test(h.v) || (VERB[h.v] && VERB[h.v].de && VERB[h.v].de.modal); })[0];
        if (!mh) return null;
        c.mod = mh.v === "deber" ? "tener que" : mh.v;
      }
    }
    if (!mainV && isWerden) return null;
    if (!mainV) {
      // scheidbaar deel aan het eind
      var sepHit = cand.filter(function (h) { return h.sep && last === h.sep; });
      var tailHit = cand.filter(function (h) { return h.tail && last2.indexOf(low(h.tail)) >= 0 && T.slice(-h.tail.split(" ").length).join(" ") === low(h.tail); });
      if (sepHit.length) { mainV = { v: sepHit[0].v }; endTake = 1; }
      else if (tailHit.length) { mainV = { v: tailHit[0].v }; endTake = tailHit[0].tail.split(" ").length; }
      else {
        var plain = cand.filter(function (h) { return !h.sep && !h.tail; });
        if (!plain.length) return null;
        var pref = plain.filter(function (h) { return DE_PREF[low(VERB[h.v].de.inf)] === h.v; });
        mainV = { v: (pref[0] || plain[0]).v };
      }
    }
    c.v = mainV.v; c.t = tense === "past" ? "past" : (tense === "fut" ? "fut" : "pres");
    var midT = T.slice(i, T.length - endTake), midO = O.slice(i, O.length - endTake);
    // bijzondere werkwoorden
    if (c.v === "llamarse") {
      if (c.type === "wh" && c.wh === "como") return midT.length ? null : Object.assign(c, { sp: "llamarse" });
      if (c.type !== "stmt" || !midO.length || midO.length > 3) return null;
      c.sp = "llamarse"; c.name = midO.map(cap).join(" "); return c;
    }
    if (c.v === "ser" || c.v === "estar") { if (c.mod) return null; return deBe(midT, midO, c); }
    if (c.v === "gustar" && !c.mod) {
      c.sp = "gustar";
      var rg = deMid(midT, midO, 0, c, {}); if (!rg || !c.o) return null;
      if ((c.o.det === "none" || (c.o.det === "ind" && c.neg)) && c.o.k === "n") c.o.det = "def";
      return c;
    }
    if (c.v === "encantar" && c.o && c.o.k === "pron") return null;
    if (c.v === "venir" && !c.mod) {
      var r0 = deMid(midT, midO, 0, c, { from: true }); if (!r0) return null;
      if (c.o) return null;
      return c;
    }
    var rm = deMid(midT, midO, 0, c, {}); if (!rm) return null;
    // "gern" -> gustar + infinitief
    if (c.gern) {
      var inf = c.v; c.sp = c.gern === "sehr" ? "encantar" : "gustar"; c.infV = inf; c.v = c.sp; c.infO = c.o; c.o = null; c.infObl = c.obl; c.obl = [];
      delete c.gern;
    }
    if (c.v === "tener" && c.o && c.o.k === "n" && c.o.det === "none" && /^(hambre|sed|miedo|razón)$/.test(c.o.n)) { c.sp = "tener"; c.tn = c.o.n; c.o = null; }
    if (c.v === "conducir" && c.obl.some(function (x) { return x.prep === "a"; })) c.v = "ir";
    if (c.v === "ir" && c.o) return null;
    return c;
  }
  function pickTail(list, T, pos) {
    var best = null;
    list.forEach(function (x) {
      var tl = x.tail ? low(x.tail).split(" ") : [];
      var ok = tl.every(function (w, k) { return T[pos - tl.length + k] === w; });
      if (x.tail && !ok) return;
      var sc = tl.length * 2;
      if (!best || sc > best.sc) best = { v: x.v, tailLen: tl.length, sc: sc };
    });
    return best;
  }
  function dePronSubj(T, O, i) {
    var t = T[i];
    if (t === "sie" && O[i] === "Sie" && i > 0) return subjOf(2, null, true, true);
    var p = DEPRON[t]; if (!p) return null;
    return subjOf(p[0], p[1], false, true);
  }
  // middenveld: voorwerpen, nicht/kein, bijwoorden, voorzetselgroepen
  function deMid(T, O, i, c, opts) {
    while (i < T.length) {
      var t = T[i];
      if (t === "nicht") { c.neg = true; i++; continue; }
      if (t === "nie" || t === "niemals") { c.never = true; i++; continue; }
      if (t === "auch") { c.advs.push("también"); i++; continue; }
      if (t === "gern" || t === "gerne") { c.gern = "gern"; i++; continue; }
      if (t === "sehr" && /^(gern|gerne)$/.test(T[i + 1] || "")) { c.gern = "sehr"; i += 2; continue; }
      if (/^(mich|dich|sich|uns|euch)$/.test(t) && VERB[c.v] && VERB[c.v].de && VERB[c.v].de.refl) { i++; continue; }
      var adv = deAdvAt(T, i);
      if (adv && !(T[i] === "viel" && T[i + 1] !== undefined && deNoun(T[i + 1]) && !DEV[T[i + 1]])) { c.advs.push(adv.k); i = adv.end; continue; }
      if (t === "um" || t === "bis") { var dk = deClock(T, i + 1); if (dk) { c.hour = dk.hour; c.min = dk.min; if (t === "bis") c.until = true; i += 1 + dk.n; continue; } }
      if (t === "um" && (has(DENUM, T[i + 1]) || /^\d+$/.test(T[i + 1] || "")) && T[i + 2] === "uhr") { c.hour = has(DENUM, T[i + 1]) ? DENUM[T[i + 1]] : +T[i + 1]; i += 3; continue; }
      if (t === "am" && has(DEDAYS, T[i + 1] || "")) { c.day = { key: DEDAYS[T[i + 1]] }; i += 2; continue; }
      if (/^(montags|dienstags|mittwochs|donnerstags|freitags|samstags|sonntags)$/.test(t)) { c.day = { key: DEDAYS[t.slice(0, -1)], pl: true }; i++; continue; }
      if (t === "zu" && T[i + 1] === "hause") { c.obl.push({ prep: "en", np: { k: "n", n: "casa", det: "none" } }); i += 2; continue; }
      if (t === "nach" && T[i + 1] === "hause") { c.obl.push({ prep: "a", np: { k: "n", n: "casa", det: "none" } }); i += 2; continue; }
      if (t === "mit" && /^(dem|der)$/.test(T[i + 1] || "") && /^(zug|bus|auto|flugzeug|fahrrad|taxi|boot|u-bahn)$/.test(T[i + 2] || "")) {
        var bk = { zug: "tren", bus: "autobús", auto: "coche", flugzeug: "avión", fahrrad: "bici", taxi: "taxi", boot: "barco", "u-bahn": "metro" }[T[i + 2]];
        c.obl.push({ prep: "en", np: { k: "n", n: bk, det: "none" } }); i += 3; continue;
      }
      if (/^(dem|einem|meinem|deinem|seinem|ihrem|unserem|eurem)$/.test(t) && DITRANS[c.v] && !c.io && !opts.hay) { var din = deNP(T, O, i, { bare: true }); if (din && din.np.k === "n") { c.io = { np: din.np }; i = din.end; continue; } }
      if (/^(das|dies)$/.test(t) && !c.o && (T[i + 1] === undefined || /^(nicht|hier|dort|jetzt|heute|auch|noch|nie)$/.test(T[i + 1]))) { c.o = { k: "that" }; i++; continue; }
      var pr = dePrep(T, O, i, c);
      if (pr === false) return null;
      if (pr) { i = pr.end; continue; }
      if (has(DEOBJ, t) && DEOBJ[t][2] === "d" && DITRANS[c.v] && !c.io && !opts.hay) { var pi = DEOBJ[t]; c.io = { p: pi[0], g: pi[1] || null }; i++; continue; }
      // fragen: de persoon in de vierde naamval is het meewerkend voorwerp als er nog iets volgt ("er fragt mich etwas")
      if (has(DEOBJ, t) && c.v === "preguntar" && DEOBJ[t][2] !== "d" && !c.io && i + 1 < T.length && !opts.hay) { var pq = DEOBJ[t]; c.io = { p: pq[0], g: pq[1] || null }; i++; continue; }
      if (has(DEOBJ, t) && !c.o && !opts.hay) { var po = DEOBJ[t]; c.o = { k: "pron", p: po[0], g: po[1] || null }; if (po[2] === "d" && !(VERB[c.v] && VERB[c.v].de && VERB[c.v].de.obj === "d")) return null; i++; continue; }
      if (has(C.LANGIDX.de, t) && !c.o && !c.lng && /^(hablar|aprender|estudiar|entender)$/.test(c.v)) { c.lng = C.LANGIDX.de[t]; i++; continue; }
      if (C.PV[c.v] && C.PV[c.v].de && C.PV[c.v].de[0] === "" && C.PV[c.v].de[1] === "gen" && !opts.hay) {
        var gvn = deNP(T, O, i, { bare: true, gen: true });
        if (gvn && gvn.np.k === "n") { c.obl.push({ prep: C.PV[c.v].es, np: gvn.np }); i = gvn.end; continue; }
      }
      if (!c.o && VERB[c.v] && VERB[c.v].de && VERB[c.v].de.obj === "g" && !opts.hay) {
        var gon = deNP(T, O, i, { bare: true, gen: true });
        if (gon && gon.np.k === "n") { c.o = gon.np; i = gon.end; continue; }
      }
      if (!c.o) {
        var np = deNP(T, O, i, { bare: true });
        if (np) {
          if (np.np.det === "neg") { c.neg = true; np.np.det = (np.np.pl || (NOUN[np.np.n] && NOUN[np.np.n].enMass)) ? "none" : "ind"; }
          c.o = np.np; i = np.end;
          while (T[i] === "und" && T[i + 1] !== undefined) { var n2 = deNP(T, O, i + 1, { bare: true }); if (!n2 || n2.np.det === "neg") return null; c.o = coord(c.o, n2.np); i = n2.end; }
          continue;
        }
      }
      return null;
    }
    if (c.io && !c.o && c.v !== "decir") return null;
    return true;
  }
  var DE_PREPS = { in: "en", im: "en", ins: "a", nach: "a", zu: "a", zum: "a", zur: "a", mit: "con", "für": "para", ohne: "sin", aus: "de", von: "de", vom: "de", an: "en", am: "en", ans: "a", auf: "en", bei: "con", beim: "con", "über": "sobre", bis: "hasta", um: "um", vor: "vor", gegen: "contra" };
  function dePrep(T, O, i, c) {
    var t = T[i];
    var gpk = null; Object.keys(C.GENP).forEach(function (k) { if (C.GENP[k].de === t) gpk = k; });
    if (gpk) { var gdn = deNP(T, O, i + 1, { bare: true, gen: true }); if (!gdn) return false; c.obl.push({ prep: gpk, np: gdn.np }); return { end: gdn.end }; }
    if (!has(DE_PREPS, t)) return null;
    var prep = DE_PREPS[t];
    var start = i + 1;
    var DEPR = { mich: 0, mir: 0, dich: 1, dir: 1, uns: 3, euch: 4 };
    if (C.PV[c.v] && C.PV[c.v].de && t === C.PV[c.v].de[0] && has(DEPR, T[i + 1] || "")) { c.obl.push({ prep: C.PV[c.v].es, np: { k: "pron", p: DEPR[T[i + 1]], g: "m" } }); return { end: i + 2 }; }
    var tt = T, oo = O;
    var contracted = /^(im|ins|zum|zur|vom|am|ans|beim)$/.test(t);
    if (contracted) { var art = { im: "dem", ins: "das", zum: "dem", zur: "der", vom: "dem", am: "dem", ans: "das", beim: "dem" }[t]; tt = T.slice(0, i + 1).concat([art], T.slice(i + 1)); oo = O.slice(0, i + 1).concat([art], O.slice(i + 1)); }
    var np = deNP(tt, oo, start, { bare: true });
    if (!np) return false;
    var end = contracted ? np.end - 1 : np.end;
    var pvb = { am: "an", ans: "an", zum: "zu", zur: "zu", vom: "von", beim: "bei", im: "in", ins: "in" }[t] || t;
    if (C.PV[c.v] && C.PV[c.v].de && pvb === C.PV[c.v].de[0] && np.np.k === "n") { c.obl.push({ prep: C.PV[c.v].es, np: np.np }); return { end: end }; }
    // richting: "in" + accusatief (ins Kino, in die Stadt) en "an den Strand"
    if ((t === "in" || t === "an") && /^(den|das|die)$/.test(T[i + 1] || "") && MOTION[c.v] && np.np.k !== "place") prep = "a";
    if (t === "in" && np.np.k === "place" && MOTION[c.v]) prep = "a";
    if (t === "aus" && np.np.k === "place") { if (c.v === "venir") { c.from = np.np; return { end: end }; } prep = "de"; }
    if (t === "zu" || t === "zum" || t === "zur") { if (!MOTION[c.v]) return false; }
    if (prep === "a" && !MOTION[c.v]) return false;
    if (t === "bei" || t === "beim") return false;
    if (t === "auf" && c.v === "esperar") { if (c.o) return false; c.o = np.np; return { end: end }; }
    if (t === "an" && /^(den|dem)$/.test(T[i + 1] || "") && !np.np.n) return false;
    c.obl.push({ prep: prep, np: np.np });
    return { end: end };
  }
  function deBe(T, O, c) {
    var i = 0, neg = false, deg = null;
    var rest = [];
    // bijwoorden en nicht eruit
    var core = [];
    for (; i < T.length; i++) {
      if (T[i] === "nicht") { c.neg = true; continue; }
      if (T[i] === "auch") { c.advs.push("también"); continue; }
      var adv = deAdvAt(T, i);
      if (adv && C.ADV[adv.k].k !== "p" && !(T[i] === "hier" || T[i] === "dort")) { c.advs.push(adv.k); i = adv.end - 1; continue; }
      core.push(i);
    }
    var CT = core.map(function (k) { return T[k]; }), CO = core.map(function (k) { return O[k]; });
    if (!CT.length) {
      if (c.type === "wh" && /^(donde|como|cuando)$/.test(c.wh)) { c.v = c.wh === "cuando" ? "ser" : "estar"; return c; }
      return null;
    }
    if (/^(sehr|ziemlich|zu)$/.test(CT[0]) && CT.length === 2 && deAdj(CT[1])) { deg = { sehr: "muy", ziemlich: "bastante", zu: "demasiado" }[CT[0]]; CT = CT.slice(1); CO = CO.slice(1); }
    // leeftijd
    if (CT.length === 3 && (has(DENUM, CT[0]) || /^\d+$/.test(CT[0])) && CT[1] === "jahre" && CT[2] === "alt") { if (c.type !== "stmt") return null; c.sp = "edad"; c.v = "tener"; c.age = has(DENUM, CT[0]) ? DENUM[CT[0]] : +CT[0]; return c; }
    if (CT.length === 1) {
      var a = deAdj(CT[0]);
      if (a && !deg && CT[0] === "müde" && !c.s.np) { c.v = "estar"; c.pred = { t: "adj", a: "cansado" }; return c; }
      if (a) {
        if (/#/.test(a)) c.v = a.slice(-1) === "1" ? "estar" : "ser"; else c.v = ADJ[a].estar ? "estar" : "ser";
        c.pred = { t: "adj", a: a, deg: deg }; return c;
      }
      if (has(C.NATIDX.de, CT[0]) && !deg) { var n = C.NATIDX.de[CT[0]]; c.v = "ser"; c.pred = { t: "nat", key: n.k, g: n.g }; if (!c.s.np && !c.s.g) c.s.g = n.g; return c; }
    }
    if (deg) return null;
    // plaats
    var pr = { obl: [] };
    var cc = Object.assign({}, c, { obl: [], advs: c.advs.slice(), v: "estar" });
    var okLoc = deMid(CT, CO, 0, cc, {});
    if (okLoc && !cc.o && (cc.obl.length || cc.advs.length > c.advs.length)) {
      c.v = "estar"; c.advs = cc.advs; c.neg = c.neg || cc.neg;
      if (cc.obl.length === 1 && cc.advs.length === c.advs.length) { c.pred = { t: "loc", pp: cc.obl[0] }; } else c.obl = cc.obl;
      if (!c.pred && !c.obl.length && cc.advs.length) { c.advs = cc.advs; }
      return c;
    }
    // naamwoord: "Ich bin Lehrer", "Das ist mein Bruder", "Ich bin kein Lehrer"
    var np = deNP(CT, CO, 0, { bare: true });
    if (np && np.end === CT.length) {
      if (np.np.det === "neg") { c.neg = true; np.np.det = "none"; }
      c.v = "ser"; c.pred = { t: "np", np: np.np };
      if (!c.s.np && c.s.g === "n" && np.np.k === "n" && has(C.PERSON, np.np.n)) c.s.g = C.esFem(np.np.n) ? "f" : "m";
      return c;
    }
    return null;
  }

  // ================= FRANS =================
  (function () { (DEINF.verpassen = DEINF.verpassen || []).push({ v: "perder", tail: null }); (DEPP.verpasst = DEPP.verpasst || []).push({ v: "perder", aux: "h", tail: null }); })();
  var FRV = {};
  function addFV(form, lemma, p, tense, fv) { if (!form) return; (FRV[form] = FRV[form] || []).push({ v: lemma, p: p, tense: tense, refl: !!fv.refl }); }
  Object.keys(VERB).forEach(function (lemma) {
    var fv = VERB[lemma].fr; if (!fv) return;
    for (var p = 0; p < 6; p++) { addFV(C.frPres(fv, p), lemma, p, "pres", fv); if (fv.imp) addFV(C.split6(fv.imp)[p], lemma, p, "impf", fv); }
  });
  ["voudrais", "voudrais", "voudrait", "voudrions", "voudriez", "voudraient"].forEach(function (f, p) { addFV(f, "querer", p, "pres", {}); });
  ["vis", "vis", "vit", "vivons", "vivez", "vivent"].forEach(function (f, p) { addFV(f, "vivir", p, "pres", {}); });
  var FRINF = {}, FRPP = {};
  Object.keys(VERB).forEach(function (lemma) {
    var fv = VERB[lemma].fr; if (!fv) return;
    (FRINF[fv.inf] = FRINF[fv.inf] || []).push({ v: lemma, refl: !!fv.refl });
    var pp = C.frPP(fv); if (pp) { [pp, pp + "e", pp + "s", pp + "es"].forEach(function (f) { (FRPP[f] = FRPP[f] || []).push({ v: lemma, refl: !!fv.refl, aux: fv.aux || "a" }); }); }
  });
  (FRINF.vivre = FRINF.vivre || []).push({ v: "vivir", refl: false });
  ["vécu", "vécue", "vécus", "vécues"].forEach(function (f) { (FRPP[f] = FRPP[f] || []).push({ v: "vivir", refl: false, aux: "a" }); });
  ["vivais", "vivais", "vivait", "vivions", "viviez", "vivaient"].forEach(function (f, p) { addFV(f, "vivir", p, "impf", {}); });
  "rate rates rate ratons ratez ratent".split(" ").forEach(function (f, p) { addFV(f, "perder", p, "pres", {}); });
  (FRINF.rater = FRINF.rater || []).push({ v: "perder", refl: false });
  ["raté", "ratée", "ratés", "ratées"].forEach(function (f) { (FRPP[f] = FRPP[f] || []).push({ v: "perder", refl: false, aux: "a" }); });
  var FR_PREF = { "être": "estar", aller: "ir", avoir: "tener", comprendre: "entender", devoir: "tener que", aimer: "gustar", adorer: "encantar", sentir: "sentirse", appeler: "llamar", arriver: "llegar" };   // "ça arrive" (het gebeurt) is een vaste zin
  var FRPRON = { je: [0], tu: [1], il: [2, "m"], elle: [2, "f"], on: [3], nous: [3], vous: [1, null, true], ils: [5, "m"], elles: [5, "f"] };
  var FRCLIT = { me: [0], te: [1], le: [2, "m"], la: [2, "f"], les: [5], nous: [3], vous: [4], se: ["refl"], lui: ["dat"], leur: ["dat"], y: ["y"], en: ["en"] };
  var FRNUM = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12, vingt: 20, trente: 30, cent: 100 };
  var FRDAYS = { lundi: "lunes", mardi: "martes", mercredi: "miércoles", jeudi: "jueves", vendredi: "viernes", samedi: "sábado", dimanche: "domingo" };
  var FRWH = { que: "que", quoi: "que", "où": "donde", quand: "cuando", comment: "como", qui: "quien", pourquoi: "porque", combien: "cuanto" };
  function frNoun(w) {
    var k = low(w);
    if (has(C.NIDX.fr, k)) return C.NIDX.fr[k][0];
    var d = DICT("fr");
    var cand = [[k, false]];
    if (/[sx]$/.test(k)) cand.push([k.slice(0, -1), true]);
    if (/aux$/.test(k)) cand.push([k.slice(0, -3) + "al", true]);
    for (var i = 0; i < cand.length; i++) {
      var ck = cand[i][0];
      if (has(C.NIDX.fr, ck)) return { es: C.NIDX.fr[ck][0].es, pl: true };
      var es = d[ck] || d["le " + ck] || d["la " + ck] || d["l'" + ck];
      if (es && /^[a-záéíóúñü_]+$/.test(es) && !has(VERB, es) && !/(ar|er|ir)$/.test(es) && !has(ADJ, es) && (has(ZINO.GEN.fr, ck) || d["le " + ck] || d["la " + ck])) return { es: es, pl: cand[i][1] };
    }
    return null;
  }
  function frAdj(w) { var k = low(w); return has(C.AIDX.fr, k) ? C.AIDX.fr[k] : null; }
  function frNP(T, i, opts) {
    opts = opts || {};
    var t = T[i]; if (t === undefined) return null;
    var np = { k: "n", det: "none", adjs: [] }, j = i;
    for (var n = 3; n >= 1; n--) {
      var ph = T.slice(i, i + n).join(" "), ph2 = ph.replace(/^(le|la|les|l') ?/, "");
      if (has(C.PIDX.fr, ph2) && (n > 1 || !/^(le|la|les)$/.test(t))) return { np: { k: "place", key: C.PIDX.fr[ph2] }, end: i + n };
    }
    if (has(C.LANGIDX.fr, t) && opts.lang) return { np: { k: "lang", key: C.LANGIDX.fr[t] }, end: i + 1 };
    if (t === "le" || t === "la" || t === "l'") { np.det = "def"; j++; }
    else if (t === "de" && (T[i + 1] === "la" || T[i + 1] === "l'") ) { np.det = "none"; j += 2; }
    else if (t === "les") { np.det = "def"; np.pl = true; j++; }
    else if (t === "un" || t === "une") { np.det = "ind"; j++; }
    else if (t === "des") { np.det = "ind"; np.pl = true; j++; }
    else if (t === "du") { np.det = "none"; j++; }
    else if (t === "de" && (T[i + 1] === "la" || T[i + 1] === "l'")) { np.det = "none"; j += 2; }
    else if ((t === "de" || t === "d'") && opts.afterNeg) { np.det = "ind"; j++; }
    else if (/^(mon|ma|mes|ton|ta|tes|son|sa|ses|notre|nos|votre|vos|leur|leurs)$/.test(t)) {
      np.det = "poss"; np.own = { m: 0, t: 1, s: 2, n: 3, v: 4, l: 5 }[t.charAt(0)]; np.pl = /^(mes|tes|ses|nos|vos|leurs)$/.test(t); j++;
    }
    else if (/^(ce|cet|cette|ces)$/.test(t)) { np.det = "dem"; np.pl = t === "ces"; j++; }
    else if (t === "aucun" || t === "aucune") { np.det = "neg"; j++; }
    else if (t === "beaucoup" && /^(de|d')$/.test(T[i + 1] || "")) { np.qty = "mucho"; j += 2; }
    else if (t === "peu" && /^(de|d')$/.test(T[i + 1] || "")) { np.qty = "poco"; j += 2; }
    else if (has(FRNUM, t) && t !== "un" && t !== "une") { np.num = FRNUM[t]; j++; }
    else if (/^\d+$/.test(t)) { np.num = +t; j++; }
    else if (!opts.bare) return null;
    while (T[j] !== undefined && frAdj(T[j]) && C.ADJ[frAdj(T[j])] && C.ADJ[frAdj(T[j])].before && T[j + 1] !== undefined && frNoun(T[j + 1])) { np.adjs.push(frAdj(T[j])); j++; }
    var nn = null;
    for (var m = 3; m >= 1 && !nn; m--) { var w = T.slice(j, j + m).join(" "); var x = has(C.NIDX.fr, w) ? C.NIDX.fr[w][0] : (m === 1 ? frNoun(w) : null); if (x) { nn = x; j += m; } }
    if (!nn) return null;
    np.n = nn.es; if (nn.pl) np.pl = true;
    if (np.num && np.num > 1) np.pl = true;
    while (T[j] !== undefined && frAdj(T[j]) && !(C.ADJ[frAdj(T[j])] && C.ADJ[frAdj(T[j])].before && false)) {
      if (opts.noAdj) break;
      np.adjs.push(frAdj(T[j])); j++;
    }
    if ((T[j] === "de" || T[j] === "du" || T[j] === "des") && np.det !== "none" && !opts.noOf) {
      var tt = T[j] === "du" ? ["le"].concat(T.slice(j + 1)) : (T[j] === "des" ? ["les"].concat(T.slice(j + 1)) : T.slice(j + 1));
      var of = frNP(tt, 0, { noOf: true });
      if (of && of.np.k === "n" && of.np.det !== "none") { np.of = of.np; j = j + (T[j] === "de" ? 1 : 0) + of.end; }
    }
    return { np: np, end: j };
  }
  function frAdvAt(T, i) {
    for (var n = 3; n >= 1; n--) { var ph = T.slice(i, i + n).join(" "); if (has(C.ADVIDX.fr, ph)) return { k: C.ADVIDX.fr[ph], end: i + n }; }
    return null;
  }
  function frTokens(raw) {
    var s = low(raw).replace(/[’]/g, "'").replace(/[?!.,;:]/g, " ");
    s = s.replace(/qu'est-ce que|qu'est-ce qu'/g, " _qecq_ ").replace(/est-ce que|est-ce qu'/g, " _ecq_ ");
    s = s.replace(/aujourd'hui/g, "aujourd_hui");
    s = s.replace(/\b(j|m|t|s|n|c|qu)'/g, function (m, w) { return { j: "je", m: "me", t: "te", s: "se", n: "ne", c: "ce", qu: "que" }[w] + " "; });
    s = s.replace(/\bd'/g, "d' ").replace(/\bl'/g, "l' ");
    s = s.replace(/-t-/g, " ").replace(/\b(\w+)-(je|tu|il|elle|on|nous|vous|ils|elles|ce)\b/g, "$1 #$2");
    s = s.replace(/aujourd_hui/g, "aujourd'hui").replace(/\s+/g, " ").trim();
    return s.split(" ").filter(Boolean);
  }
  function parseFr(text) {
    var raw = String(text || "").trim();
    var q = /\?\s*$/.test(raw);
    var key = C.normKey(raw);
    if (has(C.FIDX.fr, key)) return { fixedEs: C.FIDX.fr[key] };
    if (has(C.WIDX.fr, key)) return { fixedEs: C.WIDX.fr[key] };
    var c = { type: q ? "yn" : "stmt", advs: [], obl: [] };
    if (/s'il (te|vous) pla[iî]t/i.test(raw)) { c.please = true; raw = raw.replace(/,?\s*s'il (te|vous) pla[iî]t/i, ""); }
    var Oraw = raw.replace(/[?!.,]/g, " ").split(/\s+/).filter(Boolean);
    var T = frTokens(raw);
    if (!T.length) return null;
    if (/^(oui|non)\s*,/i.test(raw) && T.length > 1) { c.intj = INTJ[T[0] === "oui" ? "si" : "no"]; T = T.slice(1); Oraw = Oraw.slice(1); }
    var i = 0;
    if (T[0] === "_ecq_") { c.type = "yn"; i = 1; }
    if (T[i] === "il" && T[i + 1] === "y" && /^(a|avait)$/.test(T[i + 2] || "") || (T[i] === "il" && T[i + 1] === "ne" && T[i + 2] === "y")) {
      var neg = T[i + 1] === "ne"; var off = neg ? 1 : 0;
      c.sp = "hay"; c.v = "haber"; c.s = subjOf(2, "n"); c.t = T[i + 2 + off] === "avait" ? "impf" : "pres"; i += 3 + off;
      if (neg) { if (!/^(pas|plus|jamais)$/.test(T[i])) return null; c.neg = T[i] === "pas"; c.never = T[i] === "jamais"; i++; }
      var hn = frNP(T, i, { bare: true, afterNeg: neg }); if (!hn) return null;
      c.o = hn.np; if (neg && c.o.det === "none" && !c.o.pl) c.o.det = "ind";
      i = hn.end;
      var rh = frRest(T, i, c, false); if (!rh || rh.o) return null;
      return c;
    }
    // vraagwoord
    if (has(FRWH, T[i]) || T[i] === "_qecq_") {
      c.type = "wh";
      if (T[i] === "_qecq_") { c.wh = "que"; i += 1; }
      else if (T[i] === "d'" && T[i + 1] === "où") { c.wh = "dedonde"; i += 2; }
      else { c.wh = FRWH[T[i]]; i++; }
      if (c.wh === "cuanto" && /^(de|d')$/.test(T[i] || "")) { var wn = frNoun(T[i + 1] || ""); if (!wn) return null; c.whNP = { k: "n", n: wn.es, pl: wn.pl, det: "none" }; i += 2; }
      if (T[i] === "_ecq_") i += 1;
    } else if (T[i] === "d'" && T[i + 1] === "où") { c.type = "wh"; c.wh = "dedonde"; i += 2; if (T[i] === "_ecq_") i += 1; }
    // onderwerp
    var subj = null, inverted = false;
    var startI = i;
    var snp = (T[i] !== "ne" && !has(FRV, T[i])) ? frNP(T, i) : null;
    if (snp && (has(FRV, T[snp.end] || "") || T[snp.end] === "ne" || (has(FRCLIT, T[snp.end] || "") && has(FRV, T[snp.end + 1] || "")))) { subj = { p: snp.np.pl ? 5 : 2, np: snp.np }; i = snp.end; }
    else if (has(FRPRON, T[i])) { var sp = FRPRON[T[i]]; subj = subjOf(sp[0], sp[1], sp[2], true); i++; }
    else if (T[i] === "ce" && /^(est|sont|était|n'|ne)$/.test(T[i + 1] || "")) { subj = subjOf(T[i + 1] === "sont" ? 5 : 2, "n", false, false); i++; }
    // ontkenning en clitica
    if (T[i] === "ne") { c.neg = true; i++; }
    var clits = [];
    while (has(FRCLIT, T[i] || "") && (has(FRV, T[i + 1] || "") || has(FRCLIT, T[i + 1] || ""))) { clits.push(T[i]); i++; }
    if (T[i] === "l'") { clits.push("le"); i++; }
    var vf = FRV[T[i]];
    if (!vf) return null;
    var fin = T[i]; i++;
    // inversie: "habites #tu"
    if (!subj && /^#/.test(T[i] || "")) { var ip = T[i].slice(1); if (!has(FRPRON, ip)) return null; var sp2 = FRPRON[ip]; subj = subjOf(sp2[0], sp2[1], sp2[2], true); inverted = true; i++; if (c.type === "stmt") c.type = "yn"; }
    if (!subj && c.type === "wh") {
      var sn2 = frNP(T, i);
      if (sn2) { subj = { p: sn2.np.pl ? 5 : 2, np: sn2.np }; i = sn2.end; }
      else if (c.wh === "quien") subj = subjOf(2, null, false, false);
    }
    if (!subj) return null;
    c.s = subj;
    if (T[i] === "pas" || T[i] === "jamais" || T[i] === "plus") { if (T[i] === "plus") return null; c.neg = T[i] === "pas"; c.never = T[i] === "jamais"; if (c.never) c.neg = false; i++; }
    else if (c.neg) { if (!/^(pas|jamais)$/.test(T[i] || "")) { /* "ne" zonder pas na het deelwoord */ } }
    var sp3 = subj.np ? (subj.np.pl ? 5 : 2) : (subj.formal ? 4 : subj.p);
    var cand = vf.filter(function (h) { return h.p === sp3; });
    if (!cand.length) return null;
    var isRefl = clits.indexOf("se") >= 0 || clits.indexOf(["me", "te", "se", "nous", "vous", "se"][sp3]) >= 0 && cand.some(function (h) { return h.refl; });
    // hulpwerkwoorden
    var lemmas = cand.map(function (h) { return h.v; });
    var tense = cand[0].tense;
    var main = null;
    if (c.neg && /^(pas|jamais)$/.test(T[i] || "")) { c.never = T[i] === "jamais"; if (c.never) c.neg = false; i++; }
    var infClits = [];
    if ((lemmas.indexOf("ir") >= 0 || lemmas.indexOf("poder") >= 0 || lemmas.indexOf("querer") >= 0 || lemmas.indexOf("tener que") >= 0 || lemmas.indexOf("gustar") >= 0 || lemmas.indexOf("encantar") >= 0)) {
      var k0 = i; while (has(FRCLIT, T[k0] || "") && (has(FRINF, T[k0 + 1] || "") || has(FRCLIT, T[k0 + 1] || ""))) k0++;
      if (k0 > i && has(FRINF, T[k0] || "")) { infClits = T.slice(i, k0); i = k0; }
    }
    if ((lemmas.indexOf("tener") >= 0 || lemmas.indexOf("ser") >= 0) && has(FRPP, T[i] || "") && tense === "pres") {
      var etre = lemmas.indexOf("ser") >= 0;
      var pc = FRPP[T[i]].filter(function (x) { return etre ? (x.aux === "e" || x.refl) : (x.aux !== "e" && !x.refl); });
      if (isRefl) pc = pc.filter(function (x) { return x.refl; }); else pc = pc.filter(function (x) { return !x.refl; });
      if (pc.length) { main = pc[0].v; tense = "past"; i++; }
    }
    var reflBeforeInf = infClits.indexOf(["me", "te", "se", "nous", "vous", "se"][sp3]) >= 0;
    if (!main && lemmas.indexOf("ir") >= 0 && has(FRINF, T[i] || "") && tense === "pres") {
      var fi = FRINF[T[i]].filter(function (x) { return reflBeforeInf ? x.refl : !x.refl; }); if (!fi.length && !reflBeforeInf) fi = []; if (!fi.length) return null; main = fi[0].v; tense = "fut"; i++;
    }
    if (!main && (lemmas.indexOf("poder") >= 0 || lemmas.indexOf("querer") >= 0 || lemmas.indexOf("deber") >= 0 || lemmas.indexOf("tener que") >= 0 || lemmas.indexOf("deber cond") >= 0 || lemmas.indexOf("tener permiso") >= 0) && has(FRINF, T[i] || "")) {
      var fm = FRINF[T[i]].filter(function (x) { return reflBeforeInf ? x.refl : !x.refl; }); if (!fm.length) return null;
      c.mod = lemmas.indexOf("poder") >= 0 ? "poder" : (lemmas.indexOf("querer") >= 0 ? "querer" : (lemmas.indexOf("deber cond") >= 0 ? "deber cond" : (lemmas.indexOf("tener permiso") >= 0 ? "tener permiso" : "tener que")));
      main = fm[0].v; i++;
    }
    if (!main && (lemmas.indexOf("gustar") >= 0 || lemmas.indexOf("encantar") >= 0)) {
      c.sp = lemmas.indexOf("gustar") >= 0 ? "gustar" : "encantar"; c.v = c.sp; c.t = "pres";
      if (has(FRINF, T[i] || "")) { var fg = FRINF[T[i]].filter(function (x) { return !x.refl; }); if (!fg.length) return null; c.infV = fg[0].v; i++; var rg = frRest(T, i, c, true); if (!rg) return null; c.infO = rg.o; c.infObl = c.obl; c.obl = []; return c; }
      var go = frNP(T, i, { lang: true }); if (!go) return null; c.o = go.np; i = go.end;
      if (clits.length) return null;
      var rg2 = frRest(T, i, c, false); if (!rg2 || rg2.o) return null; return c;
    }
    if (!main) {
      var pick = cand.filter(function (h) { return isRefl ? h.refl : !h.refl; });
      if (!pick.length) return null;
      var pref = pick.filter(function (h) { return FR_PREF[VERB[h.v].fr.inf] === h.v; });
      main = (pref[0] || pick[0]).v;
    }
    c.v = main; c.t = tense === "impf" ? "impf" : tense;
    if (c.neg && /^(pas|jamais)$/.test(T[i] || "")) { c.never = T[i] === "jamais"; if (c.never) c.neg = false; i++; }
    // clitica als voorwerp
    var reflInf = infClits.indexOf(["me", "te", "se", "nous", "vous", "se"][sp3]) >= 0 && VERB[main] && VERB[main].fr && VERB[main].fr.refl;
    var objCl = clits.concat(infClits).filter(function (x) { return x !== "se" && !(isRefl && x === ["me", "te", "se", "nous", "vous", "se"][sp3]) && !(reflInf && x === ["me", "te", "se", "nous", "vous", "se"][sp3]); });
    if (objCl.length === 1 && DITRANS[main] && /^(me|te|nous|vous|lui|leur)$/.test(objCl[0])) {
      var fio = FRCLIT[objCl[0]];
      c.io = fio[0] === "dat" ? { p: objCl[0] === "lui" ? 2 : 5, g: null } : { p: fio[0], g: null };
      objCl = [];
    }
    if (objCl.length === 2 && DITRANS[main]) {
      var fIo = objCl.filter(function (x) { return /^(me|te|nous|vous|lui|leur)$/.test(x); }), fD = objCl.filter(function (x) { return /^(le|la|les)$/.test(x); });
      if (fIo.length === 1 && fD.length === 1) {
        var fio2 = FRCLIT[fIo[0]];
        c.io = fio2[0] === "dat" ? { p: fIo[0] === "lui" ? 2 : 5, g: null } : { p: fio2[0], g: null };
        c.o = { k: "pron", p: fD[0] === "les" ? 5 : 2, g: "n" };
        objCl = [];
      }
    }
    if (objCl.length > 1) return null;
    if (objCl.length === 1) { var fc = FRCLIT[objCl[0]]; if (typeof fc[0] !== "number") return null; c.o = { k: "pron", p: fc[0], g: fc[1] || null }; }
    if (c.v === "llamarse") {
      if (c.type === "wh" && c.wh === "como") return i >= T.length ? Object.assign(c, { sp: "llamarse" }) : null;
      var nm = Oraw.slice(Oraw.length - (T.length - i));
      if (!nm.length || nm.length > 3 || c.type !== "stmt") return null;
      c.sp = "llamarse"; c.name = nm.map(cap).join(" "); return c;
    }
    if (c.v === "ser" || c.v === "estar") return frBe(T, i, c);
    if (c.v === "tener" && !c.mod) {
      // avoir faim / avoir 25 ans
      if (has(C.TIDX.fr, T[i] || "") ) { c.sp = "tener"; c.tn = C.TIDX.fr[T[i]]; i++; var rt = frRest(T, i, c, false); return rt && !rt.o ? c : null; }
      if ((has(FRNUM, T[i]) || /^\d+$/.test(T[i] || "")) && /^ans?$/.test(T[i + 1] || "")) { if (c.type !== "stmt") return null; c.sp = "edad"; c.age = has(FRNUM, T[i]) ? FRNUM[T[i]] : +T[i]; i += 2; var ra = frRest(T, i, c, false); return ra && !ra.o ? c : null; }
      if (T[i] === "besoin" && /^(de|d'|du|des)$/.test(T[i + 1] || "")) {
        c.v = "necesitar";
        if (/^(du|des)$/.test(T[i + 1])) { T[i + 1] = T[i + 1] === "du" ? "le" : "les"; i += 1; } else i += 2;
        if (has(FRINF, T[i] || "")) { var fb = FRINF[T[i]].filter(function (x) { return !x.refl; }); if (!fb.length) return null; c.mod = "necesitar"; c.v = fb[0].v; i++; }
        else { var bn = frNP(T, i, { bare: true }); if (!bn) return null; c.o = bn.np; if (c.o.det === "none" && !c.o.pl && !(NOUN[c.o.n] && NOUN[c.o.n].enMass)) c.o.det = "ind"; i = bn.end; }
        var rb = frRest(T, i, c, !c.o); return rb && !(rb.o && c.o) ? (rb.o ? Object.assign(c, { o: rb.o }) : c) : null;
      }
    }
    var r = frRest(T, i, c, true); if (!r) return null;
    if (r.o) { if (c.o) return null; c.o = r.o; }
    if (c.io && !c.o && c.v !== "decir") return null;
    if (c.v === "ir" && c.o) return null;
    if (c.o && c.o.det === "ind" && c.neg && !c.o.pl) { /* "pas de" -> ningún/geen: Spaans laat het lidwoord weg */ }
    return c;
  }
  function frBe(T, i, c) {
    var deg = null;
    if (/^(très|assez|trop)$/.test(T[i] || "")) { deg = { "très": "muy", assez: "bastante", trop: "demasiado" }[T[i]]; i++; }
    var t = T[i];
    if (t === undefined) {
      if (c.type === "wh" && /^(donde|como|cuando|dedonde)$/.test(c.wh)) { c.v = c.wh === "dedonde" || c.wh === "cuando" ? "ser" : "estar"; return c; }
      return null;
    }
    if (has(C.AIDX.fr, t)) {
      var a = C.AIDX.fr[t];
      if (/#/.test(a)) c.v = a.slice(-1) === "1" ? "estar" : "ser"; else c.v = ADJ[a].estar ? "estar" : "ser";
      c.pred = { t: "adj", a: a, deg: deg };
      if (!c.s.np && !c.s.g && ADJ[a.split("#")[0]] && t === ADJ[a.split("#")[0]].frf && ADJ[a.split("#")[0]].frf !== ADJ[a.split("#")[0]].frm) c.s.g = "f";
      var r1 = frRest(T, i + 1, c, false); return r1 && !r1.o ? c : null;
    }
    if (has(C.NATIDX.fr, t) && !deg) { var n = C.NATIDX.fr[t]; c.v = "ser"; c.pred = { t: "nat", key: n.k, g: n.g }; if (!c.s.np && !c.s.g) c.s.g = n.g; var r2 = frRest(T, i + 1, c, false); return r2 && !r2.o ? c : null; }
    if (deg) return null;
    if (t === "de" || t === "d'") { var pl = frNP(T, i + 1, { bare: true }); if (pl && pl.np.k === "place") { c.sp = "origen"; c.v = "ser"; c.from = pl.np; var r3 = frRest(T, pl.end, c, false); return r3 && !r3.o ? c : null; } return null; }
    if (/^(à|au|aux|en|dans|ici|là|chez)$/.test(t)) {
      c.v = "estar";
      var r4 = frRest(T, i, c, false); if (!r4 || r4.o) return null;
      if (c.obl.length === 1 && !c.advs.length) { c.pred = { t: "loc", pp: c.obl[0] }; c.obl = []; }
      else if (!c.obl.length && !c.advs.length) return null;
      return c;
    }
    var np = frNP(T, i, { bare: true });
    if (np) {
      c.v = "ser"; c.pred = { t: "np", np: np.np };
      if (np.np.det === "none" && np.np.k === "n" && !has(C.PROF, np.np.n)) return null;
      var r5 = frRest(T, np.end, c, false); return r5 && !r5.o ? c : null;
    }
    return null;
  }
  function frRest(T, i, c, allowObj) {
    var out = { o: null };
    while (i < T.length) {
      var t = T[i];
      if (t === "pas" && c.neg) { i++; continue; }
      if (t === "aussi") { c.advs.push("también"); i++; continue; }
      var adv = frAdvAt(T, i);
      if (adv && !(t === "beaucoup" && /^(de|d')$/.test(T[i + 1] || "")) && !(t === "à" && T[i + 1] !== "la")) { if (adv.k === "nunca") c.never = true; else c.advs.push(adv.k); i = adv.end; continue; }
      if (t === "à" || t === "jusqu'à") { var fk = frClock(T, i + 1); if (fk) { c.hour = fk.hour; c.min = fk.min; if (t !== "à") c.until = true; i += 1 + fk.n; continue; } }
      if (t === "à" && (has(FRNUM, T[i + 1]) || /^\d+$/.test(T[i + 1] || "")) && /^heures?$/.test(T[i + 2] || "")) { c.hour = has(FRNUM, T[i + 1]) ? FRNUM[T[i + 1]] : +T[i + 1]; i += 3; continue; }
      if (has(FRDAYS, t)) { c.day = { key: FRDAYS[t] }; i++; continue; }
      if (t === "le" && has(FRDAYS, T[i + 1] || "")) { c.day = { key: FRDAYS[T[i + 1]], pl: true }; i += 2; continue; }
      if (t === "à" && T[i + 1] === "la" && T[i + 2] === "maison") { c.obl.push({ prep: MOTION[c.v] ? "a" : "en", np: { k: "n", n: "casa", det: "none" } }); i += 3; continue; }
      if (t === "en" && /^(train|bus|voiture|avion|métro|taxi|bateau)$/.test(T[i + 1] || "")) {
        var bk = { train: "tren", bus: "autobús", voiture: "coche", avion: "avión", "métro": "metro", taxi: "taxi", bateau: "barco" }[T[i + 1]];
        c.obl.push({ prep: "en", np: { k: "n", n: bk, det: "none" } }); i += 2; continue;
      }
      if (t === "à" && T[i + 1] === "vélo") { c.obl.push({ prep: "en", np: { k: "n", n: "bici", det: "none" } }); i += 2; continue; }
      // "pas de chien", "du café", "de la viande", "des pommes" als voorwerp
      if (allowObj && !out.o && !c.o && /^(ça|cela|ceci)$/.test(t)) { out.o = { k: "that" }; i++; continue; }
      if (allowObj && !out.o && !c.o && c.v !== "venir" && !(C.PV[c.v] && C.PV[c.v].fr === "de" && (t === "du" || t === "de" || t === "des"))) {
        var partit = (t === "du" || t === "des" || (t === "de" && (T[i + 1] === "la" || T[i + 1] === "l'"))) || ((t === "de" || t === "d'") && (c.neg || c.never));
        if (partit) {
          var pn = frNP(T, i, { bare: true, afterNeg: (c.neg || c.never) && (t === "de" || t === "d'") });
          if (pn && pn.np.k === "n") { if ((c.neg || c.never) && (t === "de" || t === "d'")) pn.np.det = pn.np.pl ? "none" : (NOUN[pn.np.n] && NOUN[pn.np.n].enMass ? "none" : "ind"); out.o = pn.np; i = pn.end; continue; }
        }
      }
      var fgHit = null;
      Object.keys(C.GENP).forEach(function (k) { var kt = C.GENP[k].fr.replace(/'/g, "' ").split(" ").filter(Boolean); if (!fgHit && kt.every(function (w, q) { return T[i + q] === w || (q === kt.length - 1 && w === "de" && (T[i + q] === "du" || T[i + q] === "des")); })) fgHit = { key: k, len: kt.length, de: / de$/.test(C.GENP[k].fr) }; });
      if (fgHit) {
        var fgS = i + fgHit.len, fgT = T;
        if (fgHit.de && (T[fgS] === "du" || T[fgS] === "des")) { fgT = T.slice(0, fgS).concat([T[fgS] === "du" ? "le" : "les"], T.slice(fgS + 1)); }
        var fgn = frNP(fgT, fgS, { bare: true }); if (!fgn) return null;
        c.obl.push({ prep: fgHit.key, np: fgn.np }); i = (fgT !== T) ? fgn.end - 1 : fgn.end; continue;
      }
      if ((t === "des" || t === "du" || t === "de" || t === "d'") && T[i + 1] !== undefined) {
        var plc = null; for (var pn2 = 3; pn2 >= 1 && !plc; pn2--) { var ph3 = T.slice(i + 1, i + 1 + pn2).join(" "); if (has(C.PIDX.fr, ph3)) plc = { key: C.PIDX.fr[ph3], end: i + 1 + pn2 }; }
        if (plc) { if (c.v === "venir") c.from = { k: "place", key: plc.key }; else c.obl.push({ prep: "de", np: { k: "place", key: plc.key } }); i = plc.end; continue; }
      }
      var PREPS = { "à": 1, au: 1, aux: 1, en: 1, dans: 1, avec: "con", pour: "para", sans: "sin", de: "de", "d'": "de", du: "de", des: "de", sur: "sobre", chez: "a", depuis: "desde", contre: "contra" };
      if (has(PREPS, t)) {
        var tt = T, st = i + 1;
        if (t === "au") { tt = T.slice(0, i + 1).concat(["le"], T.slice(i + 1)); }
        if (t === "aux") { tt = T.slice(0, i + 1).concat(["les"], T.slice(i + 1)); }
        if (t === "du") { tt = T.slice(0, i + 1).concat(["le"], T.slice(i + 1)); }
        if (t === "des" && !allowObj) { tt = T.slice(0, i + 1).concat(["les"], T.slice(i + 1)); }
        if (t === "des" && allowObj) { /* lidwoord meervoud: als voorwerp behandelen */ }
        else {
          var FRPR = { moi: 0, toi: 1, nous: 3, vous: 4 };
          if (C.PV[c.v] && C.PV[c.v].fr === t && has(FRPR, T[i + 1] || "")) { c.obl.push({ prep: C.PV[c.v].es, np: { k: "pron", p: FRPR[T[i + 1]], g: "m" } }); i += 2; continue; }
          var np = frNP(tt, st, { bare: true });
          if (!np) return null;
          var end = (t === "au" || t === "aux" || t === "du" || t === "des") ? np.end - 1 : np.end;
          var pvf = { au: "à", aux: "à", du: "de", des: "de" }[t] || t;
          if (c.v === "responder" && pvf === "à" && np.np.k === "n" && !c.o) { c.o = np.np; i = end; continue; }
          if (C.PV[c.v] && C.PV[c.v].fr === pvf && np.np.k === "n") { c.obl.push({ prep: C.PV[c.v].es, np: np.np }); i = end; continue; }
          var prep;
          if (t === "à" || t === "au" || t === "aux" || t === "en" || t === "dans") prep = MOTION[c.v] ? "a" : "en";
          else prep = PREPS[t];
          if (prep === "de" && c.v === "venir" && np.np.k === "place") { c.from = np.np; i = end; continue; }
          if (prep === "de" && !c.from && c.v !== "venir" && allowObj) { if (!/^(hablar)$/.test(c.v)) return null; }
          if (t === "chez") { if (!MOTION[c.v]) return null; prep = "a"; }
          if (c.v === "jugar" && (t === "au" || t === "à") && !out.o) { out.o = np.np; i = end; continue; }
          c.obl.push({ prep: prep, np: np.np }); i = end; continue;
        }
      }
      if (allowObj && !out.o && !c.o && !c.lng && (t === "l'" || t === "le") && has(C.LANGIDX.fr, T[i + 1] || "") && /^(hablar|aprender|estudiar|entender)$/.test(c.v)) { c.lng = C.LANGIDX.fr[T[i + 1]]; i += 2; continue; }
      if (allowObj && !out.o && !c.o && !c.lng && has(C.LANGIDX.fr, t) && /^(hablar|aprender|estudiar|entender)$/.test(c.v)) { c.lng = C.LANGIDX.fr[t]; i++; continue; }
      if (allowObj && !out.o && !c.o && (c.neg || c.never) && c.v === "tener" && t === "le" && T[i + 1] === "temps") { out.o = { k: "n", n: "tiempo", det: "none", adjs: [] }; i += 2; continue; }
      if (allowObj && !out.o && !c.o) {
        var np2 = frNP(T, i, { bare: true, afterNeg: c.neg || c.never });
        if (np2) { if (c.neg && np2.np.det === "ind" && (T[i] === "de" || T[i] === "d'")) { np2.np.det = np2.np.pl ? "none" : "ind"; } out.o = np2.np; i = np2.end;
          while (T[i] === "et" && T[i + 1] !== undefined) { var n3 = frNP(T, i + 1, { bare: true }); if (!n3) return null; out.o = coord(out.o, n3.np); i = n3.end; }
          continue; }
      }
      return null;
    }
    return out;
  }

  // Gebiedende wijs (Engels): "Remove the cover" wordt gelezen als "you remove the cover" en door de uitvoer omgezet.
  function parseEnImp(text) {
    var raw = String(text || "").trim();
    if (!raw || /\?\s*$/.test(raw)) return null;
    var body = raw.replace(/[!.]+\s*$/, "").replace(/[’]/g, "'");
    var please = /(^|[\s,])please([\s,]|$)/i.test(body);
    body = body.replace(/(^|[\s,])please(?=[\s,]|$)[,\s]*/i, " ").replace(/\s+/g, " ").trim();
    var T0 = low(body).split(/\s+/), w = T0[0];
    var neg = /^(don't|dont)$/.test(w) || (w === "do" && T0[1] === "not");
    var vw = neg ? (w === "do" ? T0[2] : T0[1]) : w;
    if (!vw || !has(ENV, vw)) return null;
    if (!(ENV[vw] || []).some(function (h) { return h.f === "b"; })) return null;
    if (/^(is|are|am|was|were|can|could|must|will|have|has|would|does|did|i|you|he|she|it|we|they|the|a|an|my|your|this|that)$/.test(vw)) return null;
    var c = null;
    try { c = parseEn("you " + body); } catch (e) { c = null; }
    if (!c || c.type !== "stmt" || !c.s || c.s.p !== 1 || c.s.np || c.sp || c.mod || (c.t && c.t !== "pres")) return null;
    c.imp = true; if (please) c.please = true;
    return c;
  }
  // Gebiedende wijs als invoer (Spaans, Duits, Frans): wordt herschreven naar een beweerzin met tú/du/tu
  function impIn(text, from) {
    var raw = String(text || "").trim();
    if (!raw || /\?\s*$/.test(raw) || typeof ZINO === "undefined" || !ZINO.impOf) return null;
    var body = raw.replace(/[!.]+\s*$/, "").replace(/^¡/, "").replace(/!$/, ""), tk = body.split(/\s+/), t0 = low(tk[0]);
    var lem = Object.keys(VERB), i, s2;
    if (from === "es") {
      var neg = t0 === "no", ci0 = neg ? 1 : 0, cli = "";
      if (neg && /^(me|te|se|le|lo|la|los|las|nos|os|les)$/.test(low(tk[1] || ""))) { cli = low(tk[1]); ci0 = 2; if (/^(me|te|se|nos|os)$/.test(cli) && /^(lo|la|los|las)$/.test(low(tk[2] || ""))) { cli += " " + low(tk[2]); ci0 = 3; } }
      var vt = low(tk[ci0] || ""), rest = tk.slice(ci0 + 1).join(" ");
      if (!vt) return null;
      // onbeklemtoond "se" is het wederkerende voornaamwoord ("Se casa." = hij trouwt); de gebiedende wijs van ser heet "sé"
      if (!neg && t0 === "se") return null;
      if (!neg) {
        var PAIRS = [];
        ["me", "te", "se", "nos", "os"].forEach(function (a) { ["los", "las", "lo", "la"].forEach(function (b) { PAIRS.push(a + b); }); });
        for (var q2 = 0; q2 < PAIRS.length && !cli; q2++) {
          var pc = PAIRS[q2];
          if (vt.length > pc.length + 1 && vt.slice(-pc.length) === pc) {
            var bs2 = vt.slice(0, -pc.length);
            for (i = 0; i < lem.length; i++) {
              var l1 = lem[i]; if (l1 === "tener que" || C.esIsRefl(l1)) continue;
              var f1 = ZINO.impOf.es(l1);
              if (f1 && fold(f1) === fold(bs2)) { var m2 = /^(me|te|se|nos|os)(.+)$/.exec(pc); cli = m2[1] + " " + m2[2]; vt = bs2; break; }
            }
          }
        }
        var ENCL = ["nos", "los", "las", "les", "me", "te", "lo", "la", "le"];
        for (var q = 0; q < ENCL.length && !cli; q++) {
          var ec = ENCL[q];
          if (vt.length > ec.length + 1 && vt.slice(-ec.length) === ec) {
            var bs = vt.slice(0, -ec.length);
            for (i = 0; i < lem.length; i++) {
              var l0 = lem[i]; if (l0 === "tener que" || C.esIsRefl(l0)) continue;
              var f0 = ZINO.impOf.es(l0);
              if (f0 && fold(f0) === fold(bs)) { cli = ec; vt = bs; break; }
            }
          }
        }
      }
      if (!neg && !cli && /te$/.test(vt)) {
        for (i = 0; i < lem.length; i++) {
          var lr = lem[i]; if (!C.esIsRefl(lr)) continue;
          var f3 = C.esForm(lr, "pres", 2), f1r = C.esForm(lr, "pres", 1); if (!f3 || !f1r) continue;
          if (fold(f3.replace(/^se /, "") + "te") === fold(vt)) {
            var cr = null; try { cr = parseEs("Tú te " + f1r + (rest ? " " + rest : "")); } catch (e) { cr = null; }
            if (cr && cr.type === "stmt" && cr.s && cr.s.p === 1) { cr.imp = true; return cr; }
          }
        }
      }
      for (i = 0; i < lem.length; i++) {
        var l = lem[i];
        if (!VERB[l].es && !VERB[l].de && !VERB[l].en) continue;
        if (l === "tener que" || C.esIsRefl(l)) continue;
        var f = neg ? ZINO.impOf.esNeg(l) : ZINO.impOf.es(l);
        if (f && fold(f) === fold(vt)) {
          var tu = C.esForm(l, "pres", 1); if (!tu) continue;
          s2 = "Tú " + (neg ? "no " : "") + (cli ? cli + " " : "") + tu + (rest ? " " + rest : "");
          var c = null; try { c = parseEs(s2); } catch (e) { c = null; }
          if (c && c.type === "stmt" && c.s && c.s.p === 1) { c.imp = true; if (c.o && c.o.k === "pron" && c.o.amb) { delete c.o.amb; if (!c.o.g || c.o.g === "m") c.o.g = c.o.g === "m" ? "n" : c.o.g; } return c; }
        }
      }
      return null;
    }
    if (from === "de" && /^sie$/i.test(tk[1] || "")) {
      var tkS = [tk[0]].concat(tk.slice(2));
      for (i = 0; i < lem.length; i++) {
        var dvS = VERB[lem[i]].de; if (!dvS || dvS.modal || dvS.sep) continue;
        if (low(dvS.inf) !== low(tk[0])) continue;
        var duS = C.dePres(dvS, 1); if (!duS) continue;
        var cS = null; try { cS = parseDe(("Du " + duS + " " + tk.slice(2).join(" ")).trim()); } catch (e) { cS = null; }
        if (cS && cS.type === "stmt" && cS.s && cS.s.p === 1 && !cS.s.np) { cS.imp = true; return cS; }
      }
    }
    if (from === "de") {
      for (i = 0; i < lem.length; i++) {
        var dv = VERB[lem[i]].de; if (!dv || dv.modal) continue;
        var f2 = ZINO.impOf.de(dv); if (!f2 || (low(f2) !== t0 && low(f2).replace(/e$/, "") !== t0 && low(f2) + "e" !== t0)) continue;
        var du = C.dePres(dv, 1); if (!du) continue;
        s2 = "Du " + du + " " + tk.slice(1).join(" ");
        var c2 = null; try { c2 = parseDe(s2.trim()); } catch (e) { c2 = null; }
        if (c2 && c2.type === "stmt" && c2.s && c2.s.p === 1 && !c2.s.np) { c2.imp = true; return c2; }
      }
      return null;
    }
    if (from === "fr") {
      var frCl = "";
      if (!/^(ne|n[’'])$/i.test(t0)) {
        var hm2 = /^(.+?)-(le|la|les)-(moi|toi|lui|nous|vous|leur)$/i.exec(tk[0]);
        if (hm2) { tk[0] = hm2[1]; t0 = low(hm2[1]); var io3 = { moi: "me", toi: "te", lui: "lui", nous: "nous", vous: "vous", leur: "leur" }[low(hm2[3])]; frCl = /^(lui|leur)$/.test(io3) ? low(hm2[2]) + " " + io3 : io3 + " " + low(hm2[2]); }
        var hm = hm2 ? null : /^(.+?)-(moi|toi|lui|nous|vous|leur)$/i.exec(tk[0]);
        if (hm) { tk[0] = hm[1]; t0 = low(hm[1]); frCl = { moi: "me", toi: "te", lui: "lui", nous: "nous", vous: "vous", leur: "leur" }[low(hm[2])]; }
      } else if (tk[1] && /^(me|m[’']|te|t[’']|lui|nous|vous|leur)$/i.test(tk[1]) && !/^n[’']/.test(t0)) {
        frCl = low(tk[1]).replace(/[’']$/, "").replace(/^m$/, "me").replace(/^t$/, "te"); tk.splice(1, 1);
        if (/^(le|la|les)$/i.test(tk[1] || "")) { frCl += " " + low(tk[1]); tk.splice(1, 1); }
      }
      var nf = /^(ne|n[’'])$/.test(t0) ? 1 : (/^n[’']/.test(t0) ? 2 : 0), vt2, rest2;
      if (nf === 1) { vt2 = low(tk[1] || ""); rest2 = tk.slice(2).join(" "); }
      else if (nf === 2) { vt2 = low(tk[0].replace(/^n[’']/i, "")); rest2 = tk.slice(1).join(" "); }
      else { vt2 = t0; rest2 = tk.slice(1).join(" "); }
      for (i = 0; i < lem.length; i++) {
        var fv = VERB[lem[i]].fr; if (!fv) continue;
        var tu2 = C.frPres(fv, 1); if (!tu2) continue;
        var fi = ZINO.impOf.fr(tu2); var vousF = C.frPres(fv, 4); if (!fi || (low(fi) !== vt2 && !(vousF && low(vousF) === vt2 && /ez$/.test(vt2)))) continue;
        var clS = frCl ? frCl + " " : "";
        s2 = nf ? "Tu ne " + clS + tu2 + " " + rest2 : "Tu " + clS + tu2 + " " + rest2;
        if (nf && !clS && /^[aeiouhéèêàâîôù]/i.test(tu2)) s2 = "Tu n'" + tu2 + " " + rest2;
        var c3 = null; try { c3 = parseFr(s2.trim()); } catch (e) { c3 = null; }
        if (c3 && c3.type === "stmt" && c3.s && c3.s.p === 1 && !c3.s.np) { c3.imp = true; return c3; }
      }
      return null;
    }
    return null;
  }
  // "je vais/rentre à la maison": bij een werkwoord van beweging is "à la maison" een richting (a casa), geen plaats (en casa)
  function parseFrRichting(t) {
    var c = parseFr(t);
    if (c && MOTION[c.v] && c.advs && c.advs.indexOf("en casa") >= 0) {
      c.advs.splice(c.advs.indexOf("en casa"), 1);
      (c.obl = c.obl || []).push({ prep: "a", np: { k: "n", n: "casa", det: "none" } });
    }
    return c;
  }
  // "lo" na een infinitief of gebiedende wijs ("¿Puedes repetirlo?", "Quiero comprarlo"): bij werkwoorden die een ding als
  // voorwerp hebben is "lo" = het (it/es/le), niet hem. Dezelfde lijst als bij "lo" voor het werkwoord.
  var LO_DING = /^(saber|creer|entender|comprender|hacer|decir|pensar|olvidar|comprar|encontrar|intentar|probar|ganar|perder|recoger|buscar|usar|pedir|leer|escribir|comer|beber|tener|preparar|abrir|cerrar|pagar|traer|llevar|enviar|mandar|necesitar|cambiar|terminar|empezar|conseguir|reservar|cocinar|tomar|repetir|explicar|aprender|estudiar|practicar|limpiar|lavar|guardar|vender|romper|arreglar|recordar|traducir|imprimir|apagar|encender)$/;
  var DAGEN_ES = "lunes|martes|miércoles|jueves|viernes|sábados|domingos";
  function parseEsLo(t) {
    var t0 = String(t || "");
    // "los domingos" vooraan mag ook: "Los domingos como en casa" = "Como en casa los domingos"
    var md = new RegExp("^\\s*(los (?:" + DAGEN_ES + "))\\s*,?\\s+([^¿?]+?)(\\s*[.!]?)\\s*$", "i").exec(t0);
    if (md) t0 = md[2].charAt(0).toUpperCase() + md[2].slice(1) + " " + md[1].toLowerCase() + (md[3] || ".");
    // "cada día" = todos los días
    t0 = t0.replace(/\bcada día\b/gi, "todos los días");
    // wandelen "por el parque": door/in het park
    t0 = t0.replace(/\b(paseo|paseas|pasea|paseamos|pasean|camino|caminas|camina|caminamos|caminan|corro|corres|corre|corremos|corren) por (el|la|los|las)\b/gi, "$1 en $2");
    // eerst de zin zoals hij is (vaste zinnen, gewone ontleding); de herschreven vorm alleen als dat niets geeft
    var c = parseEs(t);
    if (!c && t0 !== String(t || "")) c = parseEs(t0);
    // "su" met een uitgesproken onderwerp (él/ella/ellos/ellas): het bezit hoort bij het onderwerp
    if (c && c.s && c.s.pron && c.s.g && (c.s.p === 2 || c.s.p === 5) && /^\s*[¿¡]?\s*(él|ella|ellos|ellas)\b/i.test(t0)) {
      var zet = function (np) { if (np && np.det === "poss" && np.own === 2 && !np.ownG && !np.ownFormal) { np.own = c.s.p; np.ownG = c.s.g; } };
      zet(c.o); zet(c.io); (c.obl || []).forEach(function (pp) { zet(pp && pp.np); });
    }
    if (c && c.o && c.o.k === "pron" && c.o.p === 2 && c.o.g === "m" && !c.o.amb && LO_DING.test(c.v || "") && /[a-záéíóú]lo\s*[.!?]*\s*$|[a-záéíóú]lo[\s,]/i.test(String(t || ""))) c.o.g = "n";
    return c;
  }
  return { es: parseEsLo, en: parseEn, de: parseDe, fr: parseFrRichting, enImp: parseEnImp, impIn: impIn };
})();

// Publieke ingang voor de app
var ZIN = (function () {
  // Spaans -> Engels/Duits/Frans (partnerzinnen)
  function nlImpAlt(text) {
    var raw = String(text || "").trim();
    if (!raw || /\?\s*$/.test(raw)) return null;
    var body = raw.replace(/[!.]+\s*$/, "").trim(), please = /(^|\s)(alsjeblieft|alstublieft|graag)(\s|$)/i.test(body);
    body = body.replace(/\s*,?\s*\b(alsjeblieft|alstublieft|graag)\b/ig, "").trim();
    var w = (body.split(/\s+/)[0] || "").toLowerCase();
    if (!w || /^(ik|jij|je|u|hij|zij|ze|wij|we|jullie|het|de|een|mijn|jouw|uw|zijn|haar|dit|dat|is|ben|bent|heb|hebt|heeft|hebben|wat|waar|wie|hoe|wanneer|waarom|welke|kan|kun|kunt|moet|moeten|wil|wilt|zal|mag|niet|geen|ja|nee|dank|bedankt|hallo|goedemorgen|goedemiddag|goedenavond|goedenacht|sorry|pardon|alsjeblieft|alstublieft)$/.test(w)) return null;
    // Met "mij/me/ons" als voorwerp werkt de ik-vorm niet ("Ik luister naar mij"): gebruik dan de jij-vorm
    var parts = body.split(/\s+/);
    if (/\b(mij|me|ons)\b/i.test(parts.slice(1).join(" "))) {
      var jf = /t$/i.test(w) ? w : w + "t";
      return { t: "Jij " + jf.toLowerCase() + (parts.length > 1 ? " " + parts.slice(1).join(" ") : ""), please: please, jij: true };
    }
    return { t: "Ik " + body.charAt(0).toLowerCase() + body.slice(1), please: please };
  }
  function fromEs(text, lang) {
    if (lang !== "en" && lang !== "de" && lang !== "fr") return null;
    var c;
    var special = COMP_POSS.test(String(text || "").trim()) || /^\s*no\b.*\bnada\s*[.!]*\s*$/i.test(String(text || ""));
    if (special) { try { var tn = translateNothing(text, "es", lang, "m"); if (tn) return tn; } catch (e0) { /* terugval hieronder */ } }
    try { c = ZINI.es(text); } catch (e) { c = null; }
    if (!c) return null;
    if (c.fixed) return c.fixed[lang] || null;
    try { var ro = ZINO[lang](c) || null; if (ro && lang === "fr") ro = ro.replace(/\b(fais|fait|faisons|faites|font) la course\b/, "$1 les courses"); return ro; } catch (e) { return null; }
  }
  // Engels/Duits/Frans -> Spaans (invoer). gen = geslacht van de gebruiker ("m" of "f")
  function toEs(text, lang, gen) {
    if (lang !== "en" && lang !== "de" && lang !== "fr") return null;
    var c;
    try { c = ZINI[lang](text); } catch (e) { return null; }
    if (!c) return null;
    if (c.fixedEs) {
      var f = ZINC.FIXED[ZINC.fold(c.fixedEs)] || ZINC.WEATHER[ZINC.fold(c.fixedEs)];
      var es = f ? f.es : c.fixedEs;
      if (gen === "f") es = es.replace(/^encantado$/, "encantada").replace(/^bienvenido$/, "bienvenida");
      var q = /\?\s*$/.test(String(text).trim()) || (f && /\?$/.test(f[lang] || ""));
      es = ZINC.cap(es).replace(/ por favor$/, ", por favor");
      return q ? "¿" + es + "?" : es + ".";
    }
    try { return ZINO.es(c, gen === "f" ? "f" : "m") || null; } catch (e) { return null; }
  }
  // Vaste zin in de gevraagde taal
  function fixedOut(f, to, gen, isQ) {
    if (!f) return null;
    if (to !== "es") return f[to] || null;
    var es = f.es;
    if (gen === "f") es = es.replace(/^encantado$/, "encantada").replace(/^bienvenido$/, "bienvenida");
    var q = isQ || /\?\s*$/.test(f.en || "");
    es = ZINC.cap(es).replace(/ por favor$/, ", por favor");
    return q ? "¿" + es + "?" : es + ".";
  }
  // Eigen geslacht: "ik ben leraar" wordt bij een vrouw "lerares" (waar de taal dat onderscheid kent)
  var FEM_N = { profesor: "profesora", "médico": "médica", camarero: "camarera", enfermero: "enfermera", jefe: "jefa", amigo: "amiga", vecino: "vecina", "compañero": "compañera" };
  function ownGender(c, gen) {
    if (!c.s || c.s.np || c.s.p !== 0) return;
    if (!c.s.g) c.s.g = gen === "f" ? "f" : "m";
    if (c.s.g === "f" && c.pred && c.pred.t === "np" && c.pred.np.k === "n" && (c.pred.np.det === "none" || c.pred.np.det === "ind") && FEM_N[c.pred.np.n]) c.pred.np.n = FEM_N[c.pred.np.n];
  }
  // Algemeen: van elke taal naar elke taal (nl, en, de, fr, es). Nederlands loopt via het Spaans,
  // met de aparte modules NL_ES en ES_NL. Geeft null als een stap niet zeker is.
  function translate(text, from, to, gen) {
    if (from === "nl" && typeof text === "string" && /^\s*ik heb een rekening bij (de|een) bank\s*[.!]*\s*$/i.test(text) && NL_REKENING_BANK[to]) return NL_REKENING_BANK[to];
    if (from === "nl" && typeof text === "string") { var bkT = nlBankPatroon(text); if (bkT && bkT !== text) { var rT = translate(bkT, from, to, gen); if (rT) return rT; } }
    if (typeof text === "string") {
      var mm;
      // "hoe voel jij je (vandaag)" = "hoe gaat het (vandaag)": de andere talen kennen "voelen" niet als werkwoord
      if (from === "nl") text = text.replace(/^\s*hoe voel(?:t)? (?:jij|je|u|jullie|hij|zij|ze|we|wij) (?:je|zich|jou|me|mij|ons|jullie)(?: vandaag)?\s*[?.!]*\s*$/i, "Hoe gaat het met je?");
      // "hoe gaat het vandaag" (zonder 'met') wordt ook de vraag naar hoe het gaat
      if (from === "nl") text = text.replace(/^\s*hoe gaat het vandaag\s*[?.!]*\s*$/i, "Hoe gaat het met je?");
      if (from === "fr" && (mm = /^\s*il faut\s+([a-zàâçéèêëîïôûùüÿ]+(?:er|ir|re))\b(.*)$/i.exec(text))) text = "Nous devons " + mm[1] + mm[2];
      else if (from === "es" && (mm = /^\s*hay que\s+(\S+)(.*)$/i.exec(text))) text = "Debemos " + mm[1] + mm[2];
      else if (from === "de" && (mm = /^\s*man muss\s+(.*)$/i.exec(text))) text = "Wir müssen " + mm[1];
      else if (from === "de" && (mm = /^\s*man braucht\s+(.*)$/i.exec(text))) text = "Wir brauchen " + mm[1];
      else if (from === "fr" && (mm = /^\s*il\s+(me|te|lui|nous|vous|leur)\s+faut\s+(.+?)\s*([.!?]*)$/i.exec(text))) text = { me: "J'ai", te: "Tu as", lui: "Il a", nous: "Nous avons", vous: "Vous avez", leur: "Ils ont" }[mm[1].toLowerCase()] + " besoin " + frBesoinNp(mm[2]) + mm[3];
      else if (from === "fr" && (mm = /^\s*il\s+faut\s+(.+?)\s*([.!?]*)$/i.exec(text)) && !/^[a-zàâçéèêëîïôûùüÿ]+(?:er|ir|re)\b/i.test(mm[1])) text = "Nous avons besoin " + frBesoinNp(mm[1]) + mm[2];
      else if (from === "es" && (mm = /^\s*(me|te|le|nos|os|les)\s+hace\s+falta\s+(.+)$/i.exec(text))) text = { me: "Necesito", te: "Necesitas", le: "Necesita", nos: "Necesitamos", os: "Necesitáis", les: "Necesitan" }[mm[1].toLowerCase()] + " " + mm[2];
      else if (from === "es" && (mm = /^\s*hace\s+falta\s+(.+)$/i.exec(text))) text = /^\S+(ar|er|ir)\b/i.test(mm[1]) ? "Debemos " + mm[1] : "Necesitamos " + mm[1];
    }
    var text0 = String(text || ""), fromNl = from === "nl";
    var nlLove = from === "nl" && /\bhou(d|dt|den)?\b.*\bvan\s+(je|jou|hem|haar|mij|me|ons|jullie|hen|ze)\s*[.!?]*$/i.test(String(text || ""));
    var nlHaar = from === "nl" && /\b(geef|geeft|stuur|stuurt|toon|toont|breng|brengt|zeg|zegt)\s+haar\s+(het|de|een|mijn|je|jouw|dit|dat)\b/i.test(String(text || ""));
    if (from === to) return null;
    gen = gen === "f" ? "f" : "m";
    var isQ = /\?\s*$/.test(String(text).trim());
    // "Hoe laat ...?" = vraag naar de tijd: vertaal als "Wanneer ...?" en zet het vraagwoord om in "what time" enz.
    if (from === "nl" && to !== "es") {
      var hl = /^(\s*)hoe laat\s+(.+)$/i.exec(String(text || ""));
      if (hl && !/^is het\s*\??\s*$/i.test(hl[2].trim())) {
        // eerst: staat de Spaanse vertaling ("¿A qué hora ...?") als vaste zin in alle talen?
        var es1 = null;
        try { es1 = typeof NL_ES !== "undefined" ? NL_ES.translate(text, DICTS.nl, gen) : null; } catch (e) { es1 = null; }
        var fx1 = es1 ? ZINC.FIXED[ZINC.normKey(es1)] : null;
        if (fx1) return fixedOut(fx1, to, gen, true);
        var ow = translate(hl[1] + "Wanneer " + hl[2], from, to, gen);
        var rep = { en: [/^When /, "What time "], de: [/^Wann /, "Um wie viel Uhr "], fr: [/^Quand /, "À quelle heure "] }[to];
        return ow && rep && rep[0].test(ow) ? ow.replace(rep[0], rep[1]) : null;
      }
    }
    if (from === "nl") {
      var nk = ZINC.NLIDX[ZINC.normKey(text)];
      if (nk) { var fn = ZINC.FIXED[ZINC.fold(nk)] || ZINC.WEATHER[ZINC.fold(nk)]; return fixedOut(fn, to, gen, isQ); }
      // Weersituatie met een tijdsbepaling achteraan ("Het regent vandaag"): de weerzin vertalen en de tijdsbepaling erachter zetten
      var wt = /^(.+?) (vandaag|elke dag|morgen|nu)\.?$/i.exec(String(text || "").trim());
      if (wt) {
        var wk = ZINC.NLIDX[ZINC.normKey(wt[1])];
        var wf = wk ? (ZINC.FIXED[ZINC.fold(wk)] || ZINC.WEATHER[ZINC.fold(wk)]) : null;
        var wTijd = { vandaag: "hoy", "elke dag": "todos los días", morgen: "mañana", nu: "ahora" }[wt[2].toLowerCase()];
        var wAdv = wTijd && ZINC.ADV[wTijd];
        var wBasis = wf && (to === "es" ? fixedOut(wf, "es", gen, false) : wf[to]);
        if (wBasis && wAdv && wAdv[to]) return wBasis.replace(/\.$/, "") + " " + wAdv[to] + ".";
      }
      if (typeof NL_ES === "undefined") return null;
      var es0 = null, nlImp = false;
      try { nlImp = !!(NL_ES.verbFirst && NL_ES.verbFirst(text) && nlImpAlt(text) && !/\b(niet|geen)\b.*$/i.test("") ); } catch (e) { nlImp = false; }
      if (!nlImp) { try { es0 = NL_ES.translate(text, DICTS.nl, gen); } catch (e) { es0 = null; } }
      if (!es0) {
        // Gebiedende wijs: "Open de deur" = de ik-vorm; vertaal als "Ik open de deur" en maak er een bevel van
        var alt = nlImpAlt(text);
        if (!alt || to === "nl") return null;
        var e1 = null;
        try { e1 = NL_ES.translate(alt.t, DICTS.nl, gen); } catch (e) { e1 = null; }
        var cN = null;
        try { cN = e1 ? ZINI.es(e1) : null; } catch (e) { cN = null; }
        if (!cN || cN.type !== "stmt" || !cN.s || cN.s.p !== (alt.jij ? 1 : 0) || cN.s.np || cN.sp) return null;
        if (cN.io && !(cN.io.p === 0 || cN.io.p === 3)) { /* alleen "mij/ons" als meewerkend voorwerp */ }
        cN.s = { p: 1, g: null, formal: false, pron: true, np: null }; cN.imp = true; if (alt.please) cN.please = true;
        if (cN.io && cN.io.p === 2 && !cN.io.g) cN.io = { p: 2, g: nlHaar ? "f" : "m" };
        var oN = null;
        try { oN = to === "es" ? ZINO.es(cN, gen) : ZINO[to](cN); } catch (e) { oN = null; }
        return oN ? ZINO.imp(oN, to, cN) : null;
      }
      if (to === "es") return es0;
      text = es0; from = "es";
    }
    if (from === "en") text = String(text).replace(/\blook(s|ing|ed)? at\b/i, function (m, x) { return "watch" + ({ s: "es", ing: "ing", ed: "ed" }[(x || "").toLowerCase()] || ""); });
    if (from === "en") text = String(text).replace(/\b(tell|tells|told)\s+(?=(me|you|him|her|us|them)\b)/i, function (m, w) { return { tell: "say ", tells: "says ", told: "said " }[w.toLowerCase()]; });
    var congePron = null;
    if (from === "fr") {
      text = String(text).replace(/\b(prends|prend|prenons|prenez|prennent)\s+congé\s+de\s+(toi|moi|nous|vous|lui|elle)(?![\wÀ-ÿ])/i, function (m, v, pr) { congePron = { toi: 1, moi: 0, nous: 3, vous: 4, lui: 2, elle: 2 }[pr.toLowerCase()]; return v + " un congé de ma mère"; });
      text = String(text).replace(/\b(prends|prend|prenons|prenez|prennent)\s+congé(?![\wÀ-ÿ])/i, "$1 un congé");
    }
    var c;
    try { c = ZINI[from](text); } catch (e) { c = null; }
    // Nederlands "vertrekken" is niet "uitgaan": via het Spaans werd het "salir" (go out / sortir / ausgehen)
    if (fromNl && c && c.v === "salir" && /\bvertrek/i.test(text0)) c.v = "partir";
    var imp = false;
    if (!c && to !== "nl" && from !== "nl") { try { c = from === "en" ? ZINI.enImp(text) : ZINI.impIn(text, from); } catch (e) { c = null; } imp = !!c; }
    if (!c) return null;
    if (c && ZINC.PV[c.v] && ZINC.PV[c.v].en === "" && from === "en" && c.o && c.o.k === "n" && !c.io && !(c.obl || []).some(function (x) { return x.prep === ZINC.PV[c.v].es; })) { c.obl = (c.obl || []).concat([{ prep: ZINC.PV[c.v].es, np: c.o }]); delete c.o; }
    if (c && c.v === "tomar" && c.o && c.o.k === "n" && c.o.n === "permiso" && from === "fr" && ((c.obl || []).some(function (x) { return x.prep === "de"; }) || c.o.of)) { c.v = "despedirse"; c.obl = c.obl || []; if (c.o.of) c.obl.push({ prep: "de", np: congePron !== null ? { k: "pron", p: congePron, g: "m" } : c.o.of }); delete c.o; }
    if (c && c.v === "preparar" && c.s && c.o && c.o.k === "pron" && c.o.p === c.s.p && !c.s.np) { c.v = "prepararse"; delete c.o; }
    if (c && c.v === "nacer" && to === "de" && c.t && c.t !== "pres") c.t = "pres";
    if (c && c.v === "sentirse" && !c.pred && !c.o && ((c.advs || []).some(function (x) { return x === "aquí" || x === "allí"; }) || (c.obl || []).some(function (x) { return x.prep === "en" || x.prep === "cerca"; }))) c.v = "sentarse";
    if (/^(dar|mostrar|traer|enviar)$/.test(c.v || "") && c.o && !c.io && c.obl) {
      for (var oi = 0; oi < c.obl.length; oi++) { var ob = c.obl[oi]; if ((ob.prep === "a" || ob.prep === "en" && ob.np && ob.np.k === "n" && ZINC.PERSON[ob.np.n]) && ob.np && (ob.np.k === "n" || ob.np.k === "name")) { c.io = { np: ob.np }; c.obl = c.obl.slice(0, oi).concat(c.obl.slice(oi + 1)); break; } }
    }
    if (c.v === "decir" && c.o && c.o.k === "pron" && !c.io && /^[0134]$/.test(String(c.o.p))){ c.io = { p: c.o.p, g: c.o.g || null }; c.o = null; }
    if (nlLove && c.v === "querer" && c.o && c.o.k === "pron") { c.v = "amar"; c.o = Object.assign({}, c.o, { amb: false }); }
    if (from === "es" && c.v === "querer" && !c.mod && !c.sp && c.type === "stmt" && c.o && (c.o.k === "pron" && /^[0134]$/.test(String(c.o.p)) || c.o.k === "n" && ZINC.PERSON[c.o.n])) c.v = "amar";   // "no te quiero" = ik hou niet van je
    if (fromNl && c.s && c.s.p === 2 && !c.s.g && !c.s.np && !c.s.formal) {
      var nlS = /^\s*hij\b/i.test(text0) ? "m" : (/^\s*(zij|ze)\b/i.test(text0) ? "f" : null);
      if (nlS) c.s = Object.assign({}, c.s, { g: nlS });
    }
    // Nederlands "het" is onzijdig, "hem" mannelijk: het Spaanse "lo" zegt dat niet
    if (fromNl && c.o && c.o.k === "pron" && c.o.p === 2 && (c.o.amb || !c.o.g || c.o.g === "m")) {
      if (/\bhem\b/i.test(text0)) c.o = Object.assign({}, c.o, { g: "m", amb: false });
      else if (/\bhet\b/i.test(text0) && !/\bhet\s+(is|was|zijn|waren)\b/i.test(text0)) c.o = Object.assign({}, c.o, { g: "n", amb: false });
    }
    if (c.io && c.io.p === 2 && !c.io.g && !c.io.np) c.io = { p: 2, g: nlHaar ? "f" : "m" };   // "lui"/"le": geslacht onbekend, standaard "hem"
    // beroep als gezegde: geen lidwoord in het Duits, Frans en Spaans, en de vrouwelijke vorm bij een vrouw
    if (c.pred && c.pred.t === "np" && c.pred.np.k === "n" && c.pred.np.det === "ind" && !c.pred.np.pl && !(c.pred.np.adjs || []).length && (ZINC.PROF[c.pred.np.n] || FEM_N[c.pred.np.n] && ZINC.PROF[FEM_N[c.pred.np.n]])) {
      c.pred.np.det = "none";
      var sf = c.s && (c.s.np ? (c.s.np.k === "n" && ZINC.PERSON[c.s.np.n] && ZINC.esFem(c.s.np.n)) : (c.s.g === "f" && c.s.p !== 0));
      if (sf && FEM_N[c.pred.np.n]) c.pred.np.n = FEM_N[c.pred.np.n];
    }
    if ((c.fixed || c.fixedEs) && to === "nl") {
      var f0 = c.fixed || ZINC.FIXED[ZINC.fold(c.fixedEs)] || ZINC.WEATHER[ZINC.fold(c.fixedEs)];
      if (f0 && f0.nl) return f0.nl;
    }
    var viaEs = to === "nl", out = null, target = viaEs ? "es" : to;
    if (viaEs && from === "es") out = String(text).trim();
    else if (c.fixed || c.fixedEs) {
      var f = c.fixed || ZINC.FIXED[ZINC.fold(c.fixedEs)] || ZINC.WEATHER[ZINC.fold(c.fixedEs)];
      out = fixedOut(f, target, gen, isQ);
    } else {
      ownGender(c, gen);
      try { out = target === "es" ? ZINO.es(c, gen) : ZINO[target](c); } catch (e) { out = null; }
    }
    if (!out && !imp && !viaEs && from !== "nl") {
      var ci = null;
      try { ci = from === "en" ? ZINI.enImp(text) : ZINI.impIn(text, from); } catch (e) { ci = null; }
      if (ci) { try { out = target === "es" ? ZINO.es(ci, gen) : ZINO[target](ci); } catch (e) { out = null; } if (out) return ZINO.imp(out, target, ci); }
    }
    if (!out && !imp && !viaEs && (from === "es" || nlHaar !== undefined && from === "nl")) {
      // Terugvallen: onderwerp onbekend (hij/zij) -> "hij"; lo/la -> hem/haar (persoon)
      var subjOpen = c.s && c.s.p === 2 && !c.s.g && !c.s.np && !c.s.formal, objAmb = c.o && c.o.k === "pron" && c.o.amb;
      if (subjOpen || objAmb) {
        var cv = Object.assign({}, c);
        if (subjOpen) cv.s = Object.assign({}, c.s, { g: "m" });
        if (objAmb) cv.o = Object.assign({}, c.o, { amb: false });
        try { out = target === "es" ? ZINO.es(cv, gen) : ZINO[target](cv); } catch (e) { out = null; }
      }
    }
    if (!out) return null;
    if (imp) return ZINO.imp(out, target, c);
    var missSense = c.v === "perder" && (fromNl && /\b(mis|mist|missen|miste|misten|gemist)\b/i.test(text0) && !/verlie|verlor/i.test(text0) || from === "en" && /\bmissed\b/i.test(text0) || from === "de" && /verpass/i.test(text0) || from === "fr" && /(^|[^\wÀ-ÿ])(rat(e|es|ons|ez|ent|é|ée|és|ées)|rater)(?![\wÀ-ÿ])/i.test(text0));
    if (!viaEs && missSense && target !== "es") out = missOut(out, target);
    if (!viaEs) return out;
    if (typeof ES_NL === "undefined") return null;
    try {
      if (c.o && c.o.k === "pron" && c.o.p === 2 && c.o.g === "m" && !c.o.amb) out = String(out).replace(/\blo\b/i, "lom");   // "hem", niet "het"
      var nlRes = ES_NL.translate(out, REVS.nl, function (w) { return (typeof GRAM !== "undefined") ? GRAM.gen(w, "nl") : null; }) || null;
      return nlRes && missSense && !fromNl ? missOut(nlRes, "nl") : nlRes;
    } catch (e) { return null; }
  }
  // "niets / nada / nichts / rien / anything": herschrijf naar "dat" met ontkenning en zet het woord na vertaling terug
  // Nederlands "missen" (de bus missen) is in het Spaans "perder", maar in de andere talen niet "verlieren/lose/perdre"
  var MISS = {
    nl: { verloor: "miste", verloren: "gemist", verlies: "mis", verliest: "mist", verliezen: "missen" },
    de: { verloren: "verpasst", verliere: "verpasse", verlierst: "verpasst", verliert: "verpasst", verlieren: "verpassen", verlor: "verpasste", verlorst: "verpasstest", verlorte: "verpassten" },
    en: { lost: "missed", lose: "miss", loses: "misses", losing: "missing" },
    fr: { "perdu": "raté", "perds": "rate", "perd": "rate", "perdons": "ratons", "perdez": "ratez", "perdent": "ratent", "perdre": "rater", "perdais": "ratais", "perdait": "ratait" }
  };
  function missOut(out, target) {
    var m = MISS[target]; if (!m) return out;
    return String(out).replace(/[A-Za-zÀ-ÿ]+/g, function (w) { return m[w.toLowerCase()] !== undefined ? m[w.toLowerCase()] : w; });
  }
  var translateBase = translate;
  // Samengesteld onderwerp: "Mi hermano y yo somos de Alemania" -> "My brother and I are from Germany"
  var COMP_POSS = /^(mi|tu|su|nuestro|nuestra|mis|tus|sus)\s+([a-záéíóúñ]+)\s+y\s+yo\s+(.+)$/i;
  var COMP_FIX = { son: "somos", "están": "estamos", tienen: "tenemos", van: "vamos", viven: "vivimos", hablan: "hablamos", tiene: "tenemos", va: "vamos", vive: "vivimos", es: "somos", "está": "estamos", habla: "hablamos" };
  function translateCompound(text, from, to, gen) {
    var m = from === "es" && COMP_POSS.exec(String(text || "").trim());
    if (!m || to === "es") return undefined;
    var np = m[1] + " " + m[2], rest = m[3].replace(/^(\S+)/, function (w) { return COMP_FIX[w.toLowerCase()] || w; });
    var main = translateNothing(("Nosotros " + rest), "es", to, gen);
    var subj = translateNothing(("Cap " + np + " es alto.").replace(/^Cap /, "") .replace(/^./, function (c) { return c.toUpperCase(); }), "es", to, gen);
    if (!main || !subj) return null;
    var X = null, sm;
    if (to === "en" && (sm = /^(.*?) (is|are)\b/.exec(subj))) X = sm[1] + " and I";
    else if (to === "de" && (sm = /^(.*?) (ist|sind)\b/.exec(subj))) X = sm[1] + " und ich";
    else if (to === "fr" && (sm = /^(.*?) (est|sont)\b/.exec(subj))) X = sm[1] + " et moi, nous";
    else if (to === "nl" && (sm = /^(.*?) (is|zijn)\b/.exec(subj))) X = sm[1] + " en ik";
    if (!X) return null;
    var lead = { en: /^We\b/, de: /^Wir\b/, fr: /^Nous\b/, nl: /^(We|Wij)\b/ }[to];
    if (!lead || !lead.test(main)) return null;
    return main.replace(lead, X);
  }
  function frBesoinNp(np) {
    var t = String(np).trim(), m;
    if ((m = /^(du|de la|des)\s+(.*)$/i.exec(t))) t = m[2];
    else if ((m = /^de l'(.*)$/i.exec(t))) t = m[1];
    else if ((m = /^(un|une)\s+(.*)$/i.exec(t))) return (/^[aeiouhàâéèêîôû]/i.test(m[2]) || true ? "d'" : "de ") + m[1].toLowerCase() + " " + m[2];
    else if ((m = /^le\s+(.*)$/i.exec(t))) return "du " + m[1];
    else if ((m = /^les\s+(.*)$/i.exec(t))) return "des " + m[1];
    else if ((m = /^la\s+(.*)$/i.exec(t))) return "de la " + m[1];
    else if ((m = /^l'(.*)$/i.exec(t))) return "de l'" + m[1];
    return (/^[aeiouhàâéèêîôû]/i.test(t) ? "d'" : "de ") + t;
  }
  // Nederlandse kale werkwoordsvormen (zonder lijdend voorwerp) naar Duits. Vormen gecontroleerd tegen kaikki
  // (tegenwoordige tijd, enkelvoud); lemma's volgens de keuze van de gebruiker: lopen = laufen, gaan = gehen, willen = möchten.
  var NL_DE_KAAL = {
    "ik ga": "Ich gehe.", "hij gaat": "Er geht.",
    "ik loop": "Ich laufe.", "hij loopt": "Er läuft.",
    "ik begin": "Ich fange an.", "hij begint": "Er fängt an.",
    "ik haal": "Ich hole ab.", "hij haalt": "Er holt ab.",
    "ik studeer": "Ich studiere.", "hij studeert": "Er studiert.",
    "ik teken": "Ich zeichne.", "hij tekent": "Er zeichnet.",
    "ik trouw": "Ich heirate.", "hij trouwt": "Er heiratet.",
    "ik huil": "Ich weine.", "hij huilt": "Er weint.",
    "ik lach": "Ich lache.", "hij lacht": "Er lacht.",
    "ik glimlach": "Ich lächle.", "hij glimlacht": "Er lächelt.",
    "ik duw": "Ich schiebe.", "hij duwt": "Er schiebt.",
    "ik sta": "Ich stehe.", "hij staat": "Er steht.",
    "ik zit": "Ich sitze.", "hij zit": "Er sitzt.",
    "ik lig": "Ich liege.", "hij ligt": "Er liegt.",
    "ik schijn": "Ich scheine.", "hij schijnt": "Er scheint.",
    "ik besta": "Ich existiere.", "hij bestaat": "Er existiert.",
    "ik moet": "Ich muss.", "hij moet": "Er muss.",
    "ik wil": "Ich möchte.", "hij wil": "Er möchte.",
    "ik mag": "Ich darf.", "hij mag": "Er darf.",
    "ik woon": "Ich wohne.", "hij woont": "Er wohnt.",
    "ik praat": "Ich rede.", "hij praat": "Er redet.",
    "ik kijk": "Ich schaue.", "hij kijkt": "Er schaut.",
    "ik fiets": "Ich radfahre.", "hij fietst": "Er radfährt.",
    "ik eindig": "Ich ende.", "hij eindigt": "Er endet.",
    "ik zet": "Ich setze.", "hij zet": "Er setzt.",
    "ik doe": "Ich tue.", "hij doet": "Er tut.",
    "ik onthoud": "Ich behalte.", "hij onthoudt": "Er behält.",
    "ik hoop": "Ich hoffe.", "hij hoopt": "Er hofft.",
    "ik voel": "Ich fühle.", "hij voelt": "Er fühlt.",
    "ik verander": "Ich ändere.", "hij verandert": "Er ändert.",
    "ik regel": "Ich regle.", "hij regelt": "Er regelt.",
    "ik kies": "Ich wähle aus.", "hij kiest": "Er wählt aus.",
    "ik beslis": "Ich entscheide.", "hij beslist": "Er entscheidet.",
    "ik ontmoet": "Ich treffe.", "hij ontmoet": "Er trifft.",
    "ik sleep": "Ich schleppe.", "hij sleept": "Er schleppt.",
    "ik val": "Ich falle.", "hij valt": "Er fällt.",
    "ik ruik": "Ich rieche.", "hij ruikt": "Er riecht.",
    "ik glimlach": "Ich lächle.", "hij vraagt": "Er fragt.",
    "ik voel me goed": "Ich fühle mich gut.",
    "ik wil graag water": "Ich möchte bitte Wasser."
  };
  // Nederlandse kale werkwoordsvormen naar Frans, alleen de vormen die de testsuite (run_fr_en.js) als fout meldde. Lemma's volgens de keuzes in FR_LEMMA.
  var NL_FR_KAAL = {
    "ik woon": "J'habite.", "hij woont": "Il habite.",
    "ik hoop": "J'espère.", "hij hoopt": "Il espère.",
    "ik ontmoet": "Je rencontre.", "hij ontmoet": "Il rencontre.",
    "ik proef": "Je goûte.", "hij proeft": "Il goûte.",
    "ik teken": "Je dessine.", "hij tekent": "Il dessine.",
    "ik voel": "Je sens.", "hij voelt": "Il sent.",
    "ik verander": "Je change.", "hij verandert": "Il change.",
    "ik regel": "J'arrange.", "hij regelt": "Il arrange.",
    "ik kies": "Je choisis.", "hij kiest": "Il choisit.",
    "ik beslis": "Je décide.", "hij beslist": "Il décide.",
    "ik huil": "Je pleure.", "hij huilt": "Il pleure.",
    "ik lach": "Je ris.", "hij lacht": "Il rit.",
    "ik glimlach": "Je souris.", "hij glimlacht": "Il sourit.",
    "ik sleep": "Je traîne.", "hij sleept": "Il traîne.",
    "ik val": "Je tombe.", "hij valt": "Il tombe.",
    "ik besta": "J'existe.", "hij bestaat": "Il existe.",
    "ik ruik": "Je sens.", "hij ruikt": "Il sent.",
    "ik moet": "Je dois.", "hij moet": "Il doit."
  };
  // Nederlandse kale werkwoordsvormen naar Engels, alleen de vormen die de testsuite (run_fr_en.js) als fout meldde. Lemma's volgens de keuzes in EN_LEMMA.
  var NL_EN_KAAL = {
    "ik haal": "I fetch.", "hij haalt": "He fetches.",
    "ik maak": "I make.", "hij maakt": "He makes.",
    "ik hoop": "I hope.", "hij hoopt": "He hopes.",
    "ik ontmoet": "I meet.", "hij ontmoet": "He meets.",
    "ik trouw": "I marry.", "hij trouwt": "He marries.",
    "ik blijf": "I stay.", "hij blijft": "He stays.",
    "ik proef": "I taste.", "hij proeft": "He tastes.",
    "ik mag": "I may.", "hij mag": "He may.",
    "ik kan": "I can.", "hij kan": "He can.",
    "ik teken": "I draw.", "hij tekent": "He draws.",
    "ik onthoud": "I remember.", "hij onthoudt": "He remembers.",
    "ik voel": "I feel.", "hij voelt": "He feels.",
    "ik verander": "I change.", "hij verandert": "He changes.",
    "ik regel": "I arrange.", "hij regelt": "He arranges.",
    "ik kies": "I choose.", "hij kiest": "He chooses.",
    "ik beslis": "I decide.", "hij beslist": "He decides.",
    "ik huil": "I cry.", "hij huilt": "He cries.",
    "ik lach": "I laugh.", "hij lacht": "He laughs.",
    "ik glimlach": "I smile.", "hij glimlacht": "He smiles.",
    "ik sleep": "I drag.", "hij sleept": "He drags.",
    "ik val": "I fall.", "hij valt": "He falls.",
    "ik sta": "I stand.", "hij staat": "He stands.",
    "ik zit": "I sit.", "hij zit": "He sits.",
    "ik lig": "I lie.", "hij ligt": "He lies.",
    "ik besta": "I exist.", "hij bestaat": "He exists.",
    "ik ruik": "I smell.", "hij ruikt": "He smells.",
    "ik moet": "I must.", "hij moet": "He must."
  };
  // Smaakwerkwoorden in context: "smaken" (de soep smaakt lekker) en "proeven" met een voorwerp (ik proef de soep).
  // Zelfde Engelse/Franse/Duitse woord, andere zinsbouw; daarom bepaalt het patroon in de volledige zin de vertaling.
  // Onderwerp en voorwerp worden via een gewone zin vertaald; alleen het werkwoord en het predicaat schrijven we hier.
  var SMAAK_PRED = {
    lekker: { en: "tastes good", fr: "a bon goût", de: "schmeckt gut" }, goed: { en: "tastes good", fr: "a bon goût", de: "schmeckt gut" },
    zout: { en: "tastes salty", fr: "a un goût salé", de: "schmeckt salzig" }, zoet: { en: "tastes sweet", fr: "a un goût sucré", de: "schmeckt süß" },
    bitter: { en: "tastes bitter", fr: "a un goût amer", de: "schmeckt bitter" }, zuur: { en: "tastes sour", fr: "a un goût acide", de: "schmeckt sauer" }
  };
  var SMAAK_SUBJ_TAIL = { en: / is good\.?$/i, fr: /\s+est (bon|bonne)\.?$/i, de: / ist gut\.?$/i };
  var PROEF_PRON = { ik: { en: ["I", "taste"], fr: ["Je", "goûte"], de: ["Ich", "probiere"] }, hij: { en: ["He", "tastes"], fr: ["Il", "goûte"], de: ["Er", "probiert"] },
    zij: { en: ["She", "tastes"], fr: ["Elle", "goûte"], de: ["Sie", "probiert"] }, wij: { en: ["We", "taste"], fr: ["Nous", "goûtons"], de: ["Wir", "probieren"] },
    jij: { en: ["You", "taste"], fr: ["Tu", "goûtes"], de: ["Du", "probierst"] } };
  // Tijdsbepaling in een smaakzin ("de soep smaakt vandaag lekker", "de soep smaakt lekker vandaag"): eerst zonder, dan het bijwoord erbij
  var SMAAK_TIJD = { vandaag: "hoy", "elke dag": "todos los días", morgen: "mañana", nu: "ahora" };
  // Houdingen (zitten, liggen, staan), "ik wil ziek zijn / ziek worden / moeten werken / naar buiten mogen", smaakt naar en gaat smaken.
  // Per werkwoord en per onderwerp, niet per zin: de vorm in de zin bepaalt welke regel geldt.
  var HOUD_TIJD = { "": { de: "", fr: "", en: "" }, "vandaag": { de: "heute", fr: "aujourd'hui", en: "today" }, "elke dag": { de: "jeden Tag", fr: "tous les jours", en: "every day" } };
  var HOUD_VERB = {
    ik: { zit: { de: "sitze", fr: "suis assis", en: "sit" }, lig: { de: "liege", fr: "suis allongé", en: "lie" }, sta: { de: "stehe", fr: "suis debout", en: "stand" } },
    hij: { zit: { de: "sitzt", fr: "est assis", en: "sits" }, ligt: { de: "liegt", fr: "est allongé", en: "lies" }, staat: { de: "steht", fr: "est debout", en: "stands" } }
  };
  var HOUD_SUBJ = { ik: { de: "Ich", fr: "Je", en: "I" }, hij: { de: "Er", fr: "Il", en: "He" } };
  var HOUD_ADJ = { ziek: { de: "krank", fr: "malade", en: "ill", worden: { de: "krank werden", fr: "tomber malade", en: "get ill" } },
    moe: { de: "müde", fr: "fatigué", en: "tired", worden: { de: "müde werden", fr: "me fatiguer", en: "get tired" } } };
  var HOUD_NOUN = { tomaat: { de: "Tomate", fr: "tomate", en: "tomato" } };
  var HOUD_SOEP = { soep: { de: "Die Suppe", fr: "La soupe", en: "The soup" } };
  function nlHoudingPatroon(t, to) {
    if (to !== "de" && to !== "fr" && to !== "en") return null;
    var s = String(t).replace(/\s+/g, " ").trim().replace(/[.!?]+$/, "").toLowerCase(), m, tj;
    // zitten / liggen / staan: "ik zit vandaag", "hij staat elke dag"
    if ((m = /^(ik|hij) (zit|lig|ligt|sta|staat)(?: (vandaag|elke dag))?$/.exec(s))) {
      var vk = HOUD_VERB[m[1]][m[2]] ? m[2] : null, vg = m[2] === "ligt" ? "ligt" : m[2] === "staat" ? "staat" : m[2];
      var key = m[1] === "ik" ? { zit: "zit", lig: "lig", sta: "sta" }[m[2]] : { zit: "zit", ligt: "lig", staat: "sta" }[m[2]];
      var hv = key && HOUD_VERB[m[1]][m[1] === "ik" ? key : vg];
      if (!hv) return null;
      tj = HOUD_TIJD[m[3] || ""][to];
      var vb = hv[to];
      if (to === "de") return HOUD_SUBJ[m[1]].de + " " + vb + (tj ? " " + tj : "") + ".";
      // spreektaal: "I'm sitting today", "He's standing every day"
      // met tijdsbepaling spreektaal ("I'm sitting today"); zonder tijdsbepaling blijft de bestaande vorm ("I sit.")
      if (to === "en" && tj) { var ENING = { sit: "sitting", lie: "lying", stand: "standing", lies: "lying", sits: "sitting", stands: "standing" }[vb]; return (m[1] === "ik" ? "I'm " : "He's ") + ENING + " " + tj + "."; }
      return HOUD_SUBJ[m[1]][to] + " " + vb + (tj ? " " + tj : "") + ".";
    }
    // "ik wil ziek zijn" / "ik wil ziek worden" / "ik wil moe zijn"
    if ((m = /^ik wil (ziek|moe) (zijn|worden)$/.exec(s))) {
      var ad = HOUD_ADJ[m[1]];
      if (m[2] === "zijn") return { de: "Ich möchte " + ad.de + " sein.", fr: "Je veux être " + ad.fr + ".", en: "I want to be " + ad.en + "." }[to];
      return { de: "Ich möchte " + ad.worden.de + ".", fr: "Je veux " + ad.worden.fr + ".", en: "I want to " + ad.worden.en + "." }[to];
    }
    // "ik wil zitten / liggen / staan"
    if ((m = /^ik wil (zitten|liggen|staan)$/.exec(s))) {
      return { zitten: { de: "Ich möchte sitzen.", fr: "Je veux être assis.", en: "I want to sit." },
               liggen: { de: "Ich möchte liegen.", fr: "Je veux être allongé.", en: "I want to lie down." },
               staan: { de: "Ich möchte stehen.", fr: "Je veux être debout.", en: "I want to stand." } }[m[1]][to];
    }
    // worden met een gevoelstoestand: "ik word vandaag moe", "hij wordt elke dag ziek"
    if ((m = /^(ik|hij) (word|wordt) (?:(vandaag|elke dag) )?(moe|ziek)(?: (vandaag|elke dag))?$/.exec(s))) {
      var wA = HOUD_ADJ[m[4]], wT = HOUD_TIJD[m[3] || m[5] || ""][to], wSub = HOUD_SUBJ[m[1]][to];
      var wBase = { de: { ik: "werde", hij: "wird" }, fr: { ik: "deviens", hij: "devient" }, en: { ik: "get", hij: "gets" } }[to][m[1] === "ik" ? "ik" : "hij"];
      if (to === "de") return wSub + " " + wBase + (wT ? " " + wT : "") + " " + wA.de + ".";
      if (to === "fr") return wSub + " " + wBase + " " + wA.fr + (wT ? " " + wT : "") + ".";
      return wSub + " " + wBase + " " + wA.en + (wT ? " " + wT : "") + ".";
    }
    if (/^de zon wil schijnen$/.test(s)) return { de: "Die Sonne will scheinen.", fr: "Le soleil veut briller.", en: "The sun wants to shine." }[to];
    // "ik wil moeten werken": de moet-zin vertalen en het infinitief overnemen
    if ((m = /^ik wil moeten (\w+)$/.exec(s))) {
      var mo = translateNothing("ik moet " + m[1] + ".", "nl", to, "m");
      if (!mo) return null;
      if (to === "de" && (m = /^Ich muss (.+)\.$/.exec(mo))) return "Ich möchte " + m[1] + " müssen.";
      if (to === "fr" && (m = /^Je dois (.+)\.$/.exec(mo))) return "Je veux devoir " + m[1] + ".";
      if (to === "en" && (m = /^I (?:must|have to) (.+)\.$/.exec(mo))) return "I want to have to " + m[1] + ".";
      return null;
    }
    if (/^ik wil naar buiten mogen$/.test(s)) return { de: "Ich möchte ausgehen dürfen.", fr: "Je veux avoir le droit de sortir.", en: "I want to be allowed to go out." }[to];
    // "de soep smaakt (vandaag) naar tomaat"
    if ((m = /^de (\w+) smaakt (?:(vandaag|elke dag) )?naar (\w+)$/.exec(s))) {
      var sj = HOUD_SOEP[m[1]], nn = HOUD_NOUN[m[3]];
      if (!sj || !nn) return null;
      tj = HOUD_TIJD[m[2] || ""][to];
      if (to === "de") return sj.de + " schmeckt" + (tj ? " " + tj : "") + " nach " + nn.de + ".";
      if (to === "fr") return sj.fr + " a un goût de " + nn.fr + (tj ? " " + tj : "") + ".";
      return sj.en + " tastes like " + nn.en + (tj ? " " + tj : "") + ".";
    }
    // "die broek is niet mijn smaak" (smaak = voorkeur, spreektaal)
    if ((m = /^(die|dit|dat|deze) (broek|jurk) is niet mijn smaak$/.exec(s))) {
      return { broek: { de: "Die Hose ist nicht mein Geschmack.", fr: "Ce pantalon n'est pas mon style.", en: "Those trousers aren't my style." },
               jurk: { de: "Das Kleid ist nicht mein Geschmack.", fr: "Cette robe n'est pas mon style.", en: "That dress isn't my style." } }[m[2]][to];
    }
    // "de soep gaat lekker smaken" (+ tijd)
    if ((m = /^de (\w+) gaat lekker smaken(?: (vandaag|elke dag))?$/.exec(s))) {
      var sj2 = HOUD_SOEP[m[1]];
      if (!sj2) return null;
      tj = HOUD_TIJD[m[2] || ""][to];
      if (to === "de") return sj2.de + " wird" + (tj ? " " + tj : "") + " gut schmecken.";
      if (to === "fr") return sj2.fr + " va avoir bon goût" + (tj ? " " + tj : "") + ".";
      return sj2.en + " is going to taste good" + (tj ? " " + tj : "") + ".";
    }
    return null;
  }
  function nlSmaakPatroon(t, to) {
    var sx = String(t).replace(/\s+/g, " ").trim(), tm;
    var tijdEs = null;
    if ((tm = /^(.+?) smaakt (vandaag|elke dag|morgen|nu) (lekker|goed|zout|zoet|bitter|zuur)([.!]*)$/i.exec(sx))) { tijdEs = SMAAK_TIJD[tm[2].toLowerCase()]; sx = tm[1] + " smaakt " + tm[3] + tm[4]; }
    else if ((tm = /^(.+?) smaakt (lekker|goed|zout|zoet|bitter|zuur) (vandaag|elke dag|morgen|nu)([.!]*)$/i.exec(sx))) { tijdEs = SMAAK_TIJD[tm[3].toLowerCase()]; sx = tm[1] + " smaakt " + tm[2] + tm[4]; }
    var basis = nlSmaakPatroonBasis(sx, to);
    if (!tijdEs) return basis;
    var adv = ZINC.ADV[tijdEs] && ZINC.ADV[tijdEs][to];
    if (!basis || !adv) return null;
    if (to === "de") return basis.replace(" schmeckt ", " schmeckt " + adv + " ");
    return basis.replace(/\.$/, "") + " " + adv + ".";
  }
  function nlSmaakPatroonBasis(t, to) {
    var m, ds = "(?:de|het|dit|dat|deze|die|mijn|jouw|zijn|haar)";
    var s = String(t).replace(/\s+/g, " ").trim();
    if ((m = new RegExp("^(" + ds + " [a-zéëï]+) smaakt (lekker|goed|zout|zoet|bitter|zuur)[.!]*$", "i").exec(s))) {
      var pr = SMAAK_PRED[m[2].toLowerCase()][to];
      var sub = translateNothing(m[1] + " is goed.", "nl", to, "m");
      if (!sub || !SMAAK_SUBJ_TAIL[to] || !SMAAK_SUBJ_TAIL[to].test(sub)) return null;
      var sj = sub.replace(SMAAK_SUBJ_TAIL[to], "");
      if (to === "de") return sj.charAt(0).toUpperCase() + sj.slice(1) + " " + pr.replace(/^schmeckt/, "schmeckt") + ".";
      if (to === "fr") return sj.charAt(0).toUpperCase() + sj.slice(1) + " " + pr + ".";
      return sj.charAt(0).toUpperCase() + sj.slice(1) + " " + pr + ".";
    }
    if ((m = new RegExp("^(ik|hij|zij|wij|jij) (?:proef|proeft) (" + ds.replace("(?:", "(?:") + " [a-zéëï]+)[.!]*$", "i").exec(s))) {
      var pp = PROEF_PRON[m[1].toLowerCase()];
      if (!pp) return null;
      var eet = translateNothing(m[1] + " eet " + m[2] + ".", "nl", to, "m");
      if (!eet) return null;
      var rest = (to === "en" ? new RegExp("^" + pp.en[0] + " (eats|eat) ", "") : to === "fr" ? new RegExp("^" + pp.fr[0] + " (mange|manges|mangeons|mangez|mangent) ", "i") : new RegExp("^" + pp.de[0] + " (esse|isst|essen|esst) ", ""));
      var ob = eet.replace(rest, "").replace(/\.$/, "");
      if (ob === eet || !ob) return null;
      return pp[to][0] + " " + pp[to][1] + " " + ob + ".";
    }
    return null;
  }
  // "bank" als zitbank of als financiële bank. Met zitcontext of "bank" na "koop/kopen" herschrijven we naar "sofa"; anders blijft het de financiële bank.
  // "rekening bij de bank" is een bankrekening.
  var NL_BANK_ZIT = /\b(comfortabel|zacht|kussen|kussens|woonkamer|bekleed|leren|zit|zitten|zat|ligt|liggen|lag|slapen|kopen|koop|gekocht|nieuwe bank|nieuwe)\b/i;
  var NL_REKENING_BANK = { es: "Tengo una cuenta en el banco.", en: "I have an account with the bank.", fr: "J'ai un compte à la banque.", de: "Ich habe ein Konto bei der Bank." };
  function nlBankPatroon(t) {
    var s = String(t);
    if (/\bbank\b/i.test(s) && NL_BANK_ZIT.test(s) && !/\bbank(en)?\s+(geeft|geven|verstrekt|rente|lening)/i.test(s)) return s.replace(/\bbank\b/i, "sofa");
    return null;
  }
  // Homoniemen met context (stem = stem/voto/voix/Stimme, vak = schoolvak/compartiment). Het zijn vaste zinnen, net als de bank-regel:
  // de betekenis hangt aan de zin, en de zin bepaalt de vertaling. Andere zinnen gaan gewoon hun gewone weg.
  var NL_HOMONIEM = {
    "ik geef mijn stem": { es: "Doy mi voto.", en: "I cast my vote.", fr: "Je donne ma voix.", de: "Ich gebe meine Stimme ab." },
    "ik strijk de was": { es: "Plancho la ropa.", en: "I iron the laundry.", fr: "Je repasse le linge.", de: "Ich bügle die Wäsche." },
    "ik hoor zijn stem": { es: "Oigo su voz.", en: "I hear his voice.", fr: "J'entends sa voix.", de: "Ich höre seine Stimme." },
    "zijn stem is mooi": { es: "Su voz es bonita.", en: "His voice is beautiful.", fr: "Sa voix est belle.", de: "Seine Stimme ist schön." },
    "de stem van de zanger is mooi": { es: "La voz del cantante es bonita.", en: "The singer's voice is beautiful.", fr: "La voix du chanteur est belle.", de: "Die Stimme des Sängers ist schön." },
    "het vak is vol": { es: "El compartimento está lleno.", en: "The compartment is full.", fr: "Le compartiment est plein.", de: "Das Fach ist voll." },
    "ik heb wiskunde als vak": { es: "Tengo matemáticas como asignatura.", en: "I have mathematics as a subject.", fr: "J'ai les mathématiques comme matière.", de: "Ich habe Mathematik als Fach." },
    "wiskunde is een leuk vak": { es: "Matemáticas es una asignatura divertida.", en: "Mathematics is a fun subject.", fr: "Les mathématiques sont une matière amusante.", de: "Mathematik ist ein lustiges Fach." }
  };
  function nlHomoniem(t, to) {
    var k = String(t).toLowerCase().replace(/[.!?]+$/, "").replace(/\s+/g, " ").trim();
    return NL_HOMONIEM.hasOwnProperty(k) && NL_HOMONIEM[k][to] ? NL_HOMONIEM[k][to] : null;
  }
  // Dubbele Nederlandse werkwoorden die in het Engels op hetzelfde woord uitkomen (zie de inventarisatie van 95 groepen).
  // Het Spaanse tussenwoord is hetzelfde (hacer, hablar); daarom kiezen we het Engelse werkwoord in de volledige zin.
  // praten met/over/tegen X of praten + veel/niet = talk (niet speak); maken = make (niet do), behalve afwas/huiswerk/werk/boodschappen/sport.
  function nlDubbelEn(text, out) {
    var src = String(text || "");
    if (!out || typeof out !== "string") return out;
    if (/\bpraat(t|en)?\b|\bpraatte(n)?\b/i.test(src) && !/\bspreek|spreekt|spreken\b/i.test(src) && (/\b(met|over|tegen)\b/i.test(src) || /\b(veel|niet|te veel|zo)\b/i.test(src))) {
      out = out.replace(/\bspeaks\b/g, "talks").replace(/\bspeak\b/g, "talk").replace(/\bspoke\b/g, "talked").replace(/\bspeaking\b/g, "talking");
    }
    if (/\bontmoet(en|t|te|ten)?\b/i.test(src) && !/\bken(t|nen|de)?\b|\bkennen\b/i.test(src)) {
      out = out.replace(/\bknow\b/g, "meet").replace(/\bknows\b/g, "meets").replace(/\bknew\b/g, "met");
    }
    if (/\bbekijk(t|en|e|te|ten)?\b/i.test(src)) {
      out = out.replace(/\b(see|sees|saw) (?=(the|a|an|my|your|his|her|our|their|this|that|these|those)\b)/g, function (m, v) { return ({ see: "look at ", sees: "looks at ", saw: "looked at " })[v]; });
    }
    if (/\bmaak(t|en|te|ten)?\b|\bgemaakt\b/i.test(src) && !/\b(doe|doet|doen|deed|deden)\b/i.test(src) && !/\b(afwas|huiswerk|werk|boodschappen|sport)\b/i.test(src)) {
      out = out.replace(/^(I|He|She|We|You|They) (do|does|did)( (?!not\b)|\.)/, function (m, p, v, rest) { return p + " " + ({ do: "make", does: "makes", did: "made" })[v] + rest; });
    }
    return out;
  }
  // hopen: "hoop dat …" (bijzin met onderwerp) en "hoop op …" (voorwerp). Het Spaanse tussenwoord is esperar, dat ook wachten is.
  // Daarom bouwen we hopen op uit de vertaling van de zin zelf: "je komt" -> "I hope that you come", "wacht op de bus" -> "I hope for the bus".
  // Duits en Spaans blijven null (aanvoegende wijs / werkwoordsvolgorde kunnen we nog niet veilig opbouwen).
  var HOOP_PRON = { en: { ik: "I", hij: "He", zij: "She", wij: "We", jij: "You" }, fr: { ik: "J'espère que", hij: "Il espère que", zij: "Elle espère que", wij: "Nous espérons que", jij: "Tu espères que" } };
  function lowerFirst(x) { return x.charAt(0).toLowerCase() + x.slice(1); }
  function nlHoopPatroon(t, to) {
    var s = String(t).replace(/\s+/g, " ").trim(), m;
    if (!/^(ik|hij|zij|wij|jij) hoop(?:t|en)? (dat|op) /i.test(s)) return undefined;
    if (to !== "en" && to !== "fr") return null;
    if ((m = /^(ik|hij|zij|wij|jij) hoop(?:t|en)? dat (je|ik|hij|zij|we|wij|jullie|u|ze|het|dit|dat) (.+?)[.!]*$/i.exec(s))) {
      var pn = m[1].toLowerCase();
      // In een dat-zin staat het werkwoord achteraan: "je morgen komt" -> "je komt morgen" (onderwerp, werkwoord, rest)
      var ws = (m[2] + " " + m[3]).split(" "), vb = ws[ws.length - 1];
      var hoofd = ws.length >= 3 ? [ws[0], vb].concat(ws.slice(1, -1)).join(" ") : ws.join(" ");
      var sub = translateNothing(hoofd + ".", "nl", to, "m");
      if (!sub) return null;
      sub = sub.replace(/[.!?]+$/, "");
      if (to === "en") return HOOP_PRON.en[pn] && (HOOP_PRON.en[pn] + (pn === "ik" || pn === "wij" || pn === "jij" ? " hope" : " hopes") + " that " + lowerFirst(sub) + ".");
      return HOOP_PRON.fr[pn] + " " + lowerFirst(sub) + ".";
    }
    if ((m = /^(ik|hij|zij|wij|jij) hoop(?:t|en)? op (.+?)[.!]*$/i.exec(s))) {
      var w = translateNothing(m[1] + " wacht op " + m[2] + ".", "nl", to, "m");
      if (!w) return null;
      if (to === "en") { var e = w.replace(/^(I|He|She|We|You) (am|is|are) waiting (for|in|on) /, function (x, p, v, prep) { return p + " " + (v === "am" ? "hope" : "hopes") + " for "; }); return e !== w ? e : null; }
      var f = w.replace(/^(J'attends|Je attends|Il attend|Elle attend|Nous attendons|Tu attends) /, function (x, p) { return ({ "J'attends": "J'espère ", "Je attends": "J'espère ", "Il attend": "Il espère ", "Elle attend": "Elle espère ", "Nous attendons": "Nous espérons ", "Tu attends": "Tu espères " })[p]; });
      return f !== w ? f : null;
    }
    return null;
  }
  function translateNothing(text, from, to, gen) {
    if (from === "nl" && to === "en") { var dbl = translateNothingRaw(text, from, to, gen); return dbl === null || dbl === undefined ? dbl : nlDubbelEn(text, dbl); }
    return translateNothingRaw(text, from, to, gen);
  }
  // In- en uitstappen met een voertuig en de trap op/af, vanuit een Spaanse zin ("subo al autobús", "no bajo del tren a las ocho",
  // "subo las escaleras"). De algemene ontleding leest "subir a" als richting; dit patroon geeft per taal de gewone uitdrukking.
  var VOERTUIG = {
    "autobús": { en: ["bus", "on"], de: ["Bus", "m"], fr: ["bus", "m"], nl: ["bus", "de"] }, tren: { en: ["train", "on"], de: ["Zug", "m"], fr: ["train", "m"], nl: ["trein", "de"] },
    "tranvía": { en: ["tram", "on"], de: ["Straßenbahn", "f"], fr: ["tram", "m"], nl: ["tram", "de"] }, metro: { en: ["metro", "on"], de: ["U-Bahn", "f"], fr: ["métro", "m"], nl: ["metro", "de"] },
    coche: { en: ["car", "in"], de: ["Auto", "n"], fr: ["voiture", "f"], nl: ["auto", "de"] }, barco: { en: ["boat", "on"], de: ["Boot", "n"], fr: ["bateau", "m"], nl: ["boot", "de"] },
    "avión": { en: ["plane", "on"], de: ["Flugzeug", "n"], fr: ["avion", "m"], nl: ["vliegtuig", "het"] }, taxi: { en: ["taxi", "in"], de: ["Taxi", "n"], fr: ["taxi", "m"], nl: ["taxi", "de"] }
  };
  var VT_VORM = { bajo: ["b", 0], bajas: ["b", 1], baja: ["b", 2], bajamos: ["b", 3], bajan: ["b", 5], subo: ["s", 0], subes: ["s", 1], sube: ["s", 2], subimos: ["s", 3], suben: ["s", 5] };
  var VT_HULP = { en: "I work ", de: "Ich arbeite ", fr: "Je travaille ", nl: "Ik werk " };
  // Een Spaanse tijdsbepaling ("a las ocho", "mañana") naar de doeltaal, via een hulpzin. null als dat niet lukt.
  function vtTijd(tijd, to, gen) {
    if (!tijd) return "";
    var hulp = VT_HULP[to], tr = hulp && translateNothing("Trabajo " + tijd + ".", "es", to, gen);
    if (!tr) return null;
    if (tr.indexOf(hulp) === 0) return tr.slice(hulp.length).replace(/[.!?]+$/, "");
    // tijd vooraan met inversie: "Morgen werk ik." / "Morgen arbeite ich."
    var inv = { nl: " werk ik", de: " arbeite ich" }[to], mi = inv && new RegExp("^(.+?)" + inv + "[.!?]*$").exec(tr);
    if (mi) return mi[1].charAt(0).toLowerCase() + mi[1].slice(1);
    return null;
  }
  // Spaanse zin ontleden: {p, uit, trap, v, een, neg, tijd, q}, false = subir/bajar met een ander voorwerp (niet vertalen), null = geen stapzin.
  function vtLees(es) {
    var q = /^\s*¿/.test(es || "") || /\?\s*$/.test(es || "");
    var t = (es || "").replace(/[¿?¡!.]/g, " ").replace(/\s+/g, " ").trim(), tl = t.toLowerCase();
    var m = /^(.*?)\b(bajo|bajas|baja|bajamos|bajan|subo|subes|sube|subimos|suben)\b\s*(.*)$/.exec(tl);
    if (!m) return null;
    var voor = m[1].trim(), na = m[3], neg = null, fem = false;
    if (/(^|\s)no$/.test(voor)) { neg = "no"; voor = voor.replace(/(^|\s)no$/, "").trim(); }
    else if (/(^|\s)nunca$/.test(voor)) { neg = "nunca"; voor = voor.replace(/(^|\s)nunca$/, "").trim(); }
    var pm = /(^|\s)(yo|tú|él|ella|nosotros|nosotras|ellos|ellas|usted|ustedes)$/.exec(voor);
    if (pm) { fem = /^ella/.test(pm[2]); voor = voor.slice(0, voor.length - pm[0].length).trim(); }
    var vf = VT_VORM[m[2]], uit = vf[0] === "b", r, v = null, een = false, trap = false;
    if ((r = /^(del|de la|de un|de una|al|a la|a un|a una)\s+(autobús|tren|tranvía|metro|coche|barco|avión|taxi)\b\s*(.*)$/.exec(na))) {
      if ((uit && /^a/.test(r[1])) || (!uit && /^de/.test(r[1]))) return null;
      v = VOERTUIG[r[2]]; een = /un/.test(r[1]); na = r[3];
    } else if ((r = /^(la escalera|las escaleras)\b\s*(.*)$/.exec(na))) { trap = true; na = r[2]; }
    else if (/^(el|la|los|las|un|una|unos|unas|mi|mis|tu|tus|su|sus|este|esta|estos|estas|ese|esa|nuestro|nuestra)\s/.test(na)) return false;
    else return null;
    var tijd = [voor, na.trim()].filter(Boolean).join(" ");
    return { p: vf[1], uit: uit, trap: trap, v: v, een: een, neg: neg, tijd: tijd, q: q, fem: fem };
  }
  function cap(x) { return x.charAt(0).toUpperCase() + x.slice(1); }
  function voertuigZin(es, to, gen) {
    var o = vtLees(es);
    if (o === false) return false;
    if (!o) return null;
    var tijd = vtTijd(o.tijd, to, gen);
    if (tijd === null) return false;
    var p = o.p, uit = o.uit, v = o.v, q = o.q, neg = o.neg, nooit = neg === "nunca", T = tijd ? " " + tijd : "";
    if (to === "en") {
      var sEn = ["I", "you", o.fem ? "she" : "he", "we", "", "they"][p], s3 = p === 2;
      var kern = o.trap ? "go " + (uit ? "down" : "up") + " the stairs"
        : "get " + (v.en[1] === "in" ? (uit ? "out of" : "into") : (uit ? "off" : "on")) + " " + (o.een ? "a " : "the ") + v.en[0];
      if (q) return (neg === "no" ? (s3 ? "Doesn't " : "Don't ") : (s3 ? "Does " : "Do ")) + sEn + (nooit ? " never " : " ") + kern + T + "?";
      if (neg === "no") return cap(sEn) + (s3 ? " doesn't " : " don't ") + kern + T + ".";
      var vEn = kern.replace(/^(get|go)/, function (x) { return s3 ? (x === "go" ? "goes" : "gets") : x; });
      return cap(sEn) + (nooit ? " never " : " ") + vEn + T + ".";
    }
    if (to === "de") {
      var sDe = ["ich", "du", o.fem ? "sie" : "er", "wir", "", "sie"][p], ngDe = neg === "no" ? " nicht" : nooit ? " nie" : "", kernD, vDe;
      if (o.trap) {
        vDe = ["gehe", "gehst", "geht", "gehen", "", "gehen"][p];
        kernD = T + " die Treppe" + ngDe + " " + (uit ? "hinunter" : "hinauf");
      } else {
        vDe = ["steige", "steigst", "steigt", "steigen", "", "steigen"][p];
        var g = v.de[1];
        var npD = uit ? (o.een ? (g === "f" ? "einer " : "einem ") : (g === "f" ? "der " : "dem ")) : (o.een ? (g === "f" ? "eine " : g === "n" ? "ein " : "einen ") : (g === "f" ? "die " : g === "n" ? "das " : "den "));
        kernD = T + ngDe + " " + (uit ? "aus " : "in ") + npD + v.de[0] + " " + (uit ? "aus" : "ein");
      }
      return q ? cap(vDe) + " " + sDe + kernD + "?" : cap(sDe) + " " + vDe + kernD + ".";
    }
    if (to === "fr") {
      var sFr = ["je", "tu", o.fem ? "elle" : "il", "nous", "", o.fem ? "elles" : "ils"][p];
      var vFr = uit ? ["descends", "descends", "descend", "descendons", "", "descendent"][p] : ["monte", "montes", "monte", "montons", "", "montent"][p];
      var npF;
      if (o.trap) npF = "l'escalier";
      else {
        var gF = v.fr[1], artF = o.een ? (gF === "f" ? "une " : "un ") : (uit ? (gF === "f" ? "de la " : "du ") : (gF === "f" ? "la " : "le "));
        npF = (uit ? (o.een ? "d'" + artF : artF) : "dans " + artF) + v.fr[0];
      }
      var vz = neg ? (/^[aeiouéh]/.test(vFr) ? "n'" : "ne ") + vFr + (nooit ? " jamais" : " pas") : vFr;
      var subj = sFr === "je" && neg ? "je" : sFr;
      return cap(subj) + " " + vz + " " + npF + T + (q ? " ?" : ".");
    }
    if (to === "nl") {
      var sNl = ["ik", "je", o.fem ? "zij" : "hij", "we", "", "ze"][p], kernN, vNl, ngNl = neg === "no" ? " niet" : nooit ? " nooit" : "";
      if (o.trap) {
        vNl = ["ga", "gaat", "gaat", "gaan", "", "gaan"][p];
        kernN = T + " de trap" + ngNl + " " + (uit ? "af" : "op");
      } else {
        vNl = ["stap", "stapt", "stapt", "stappen", "", "stappen"][p];
        kernN = T + ngNl + " " + (uit ? "uit " : "in ") + (o.een ? "een " : v.nl[1] + " ") + v.nl[0];
      }
      if (q) return (p === 1 ? (o.trap ? "Ga" : "Stap") : cap(vNl)) + " " + sNl + kernN + "?";
      return cap(sNl) + " " + vNl + kernN + ".";
    }
    return null;
  }
  // Omgekeerd: een Engelse, Duitse of Franse in-/uitstapzin (of de trap op/af) naar de Spaanse vorm.
  // undefined = geen stapzin, null = herkend maar niet te vertalen.
  function vtTijdNaarEs(tail, from, gen) {
    tail = (tail || "").trim();
    if (!tail) return "";
    var hulp = VT_HULP[from], tr = translateNothing(hulp + tail + ".", from, "es", gen);
    if (!tr || !/^Trabajo /.test(tr)) return null;
    return tr.replace(/^Trabajo /, "").replace(/[.!?]+$/, "");
  }
  function voertuigNaarEs(text, from, gen) {
    var q = /\?\s*$/.test(text || "");
    var t = (text || "").replace(/[?!.]/g, " ").replace(/\s+/g, " ").trim(), tl = t.toLowerCase(), m, p, uit, een = false, nm = null, trap = false, neg = null, tijd = [], fem = false;
    var NEN = { bus: "autobús", train: "tren", tram: "tranvía", metro: "metro", subway: "metro", car: "coche", boat: "barco", plane: "avión", taxi: "taxi" };
    var NDE = { bus: "autobús", zug: "tren", "straßenbahn": "tranvía", "u-bahn": "metro", auto: "coche", boot: "barco", flugzeug: "avión", taxi: "taxi" };
    var NFR = { bus: "autobús", train: "tren", tram: "tranvía", "métro": "metro", voiture: "coche", bateau: "barco", avion: "avión", taxi: "taxi" };
    if (from === "en") {
      var PEN = { i: 0, you: 1, he: 2, she: 2, we: 3, they: 5 };
      m = /^(?:(.+?) )??(?:(do|does|don't|doesn't) )?(i|you|he|she|we|they) (?:(do not|don't|does not|doesn't|never) )?(get|gets|go|goes) (off|on|onto|in|into|out of|up|down) (the|a) (\S+)(?: (.+))?$/.exec(tl);
      if (!m) return undefined;
      p = PEN[m[3]]; fem = m[3] === "she";
      if (m[2]) { if (!q || m[1]) return undefined; if (/n't$/.test(m[2])) neg = "no"; }
      if (m[4]) neg = m[4] === "never" ? "nunca" : "no";
      var go = /^go/.test(m[5]);
      if (go) { if (!/^stairs?$/.test(m[8]) || !/^(up|down)$/.test(m[6])) return undefined; trap = true; uit = m[6] === "down"; }
      else { nm = NEN[m[8]]; if (!nm || /^(up|down)$/.test(m[6])) return undefined; uit = /^(off|out of)$/.test(m[6]); een = m[7] === "a"; }
      if (m[1]) tijd.push(m[1]); if (m[9]) tijd.push(m[9]);
    } else if (from === "de") {
      var PDE = { ich: 0, du: 1, er: 2, sie: 2, wir: 3, ihr: 4 };
      var VDE = "steige|steigst|steigt|steigen|gehe|gehst|geht|gehen";
      m = new RegExp("^(?:(.+?) )??(?:(ich|du|er|sie|wir) (" + VDE + ")|(" + VDE + ") (ich|du|er|sie|wir))(?: (.+?))??(?: (nicht|nie))? (?:(aus|in) (dem|der|den|die|das|einem|einer|einen|eine|ein) (\\S+) (aus|ein)|die treppe(?: (nicht|nie))? (hinauf|hinunter|hoch|runter|rauf|nach oben|nach unten))$").exec(tl);
      if (!m) return undefined;
      var subjD = m[2] || m[5], verbD = m[3] || m[4];
      if (m[4] && !m[1] && !q) return undefined;
      p = PDE[subjD]; if (subjD === "sie" && /en$/.test(verbD)) p = 5; else if (subjD === "sie") fem = true;
      var ng = m[7] || m[12];
      if (ng) neg = ng === "nie" ? "nunca" : "no";
      if (m[13]) { if (!/^geh/.test(verbD)) return undefined; trap = true; uit = /^(hinunter|runter|nach unten)$/.test(m[13]); }
      else { if (!/^steig/.test(verbD)) return undefined; uit = m[11] === "aus"; if ((m[8] === "aus") !== uit) return undefined; een = /^ein/.test(m[9]); nm = NDE[m[10]]; }
      if (m[1]) tijd.push(m[1]); if (m[6]) tijd.push(m[6]);
    } else if (from === "fr") {
      var PFR = { je: 0, tu: 1, il: 2, elle: 2, nous: 3, ils: 5, elles: 5 };
      m = /^(?:(.+?) )??(je|tu|il|elle|nous|ils|elles) (?:(ne|n') ?)?(descends|descend|descendons|descendent|monte|montes|montons|montent)(?: (pas|jamais))? (du|de la|d'un|d'une|dans le|dans la|dans un|dans une|l'escalier|les escaliers) ?(\S+)?(?: (.+))?$/.exec(tl.replace(/n'(?=\S)/, "n' "));
      if (!m) return undefined;
      p = PFR[m[2]]; fem = /^elle/.test(m[2]); uit = /^desc/.test(m[4]);
      if (m[3]) { if (!m[5]) return undefined; neg = m[5] === "jamais" ? "nunca" : "no"; }
      if (/escalier/.test(m[6])) { trap = true; if (m[7]) tijd.push(m[7] + (m[8] ? " " + m[8] : "")); }
      else { if (uit !== /^d(u|e|')/.test(m[6])) return undefined; een = /un/.test(m[6]); nm = NFR[m[7]]; if (m[8]) tijd.push(m[8]); }
      if (m[1]) tijd.unshift(m[1]);
    } else return undefined;
    if ((!nm && !trap) || p === undefined) return undefined;
    var tEs = [];
    for (var ti = 0; ti < tijd.length; ti++) { var te = vtTijdNaarEs(tijd[ti], from, gen); if (te === null) return null; if (te) tEs.push(te); }
    var vorm = (uit ? ["bajo", "bajas", "baja", "bajamos", "bajáis", "bajan"] : ["subo", "subes", "sube", "subimos", "subís", "suben"])[p];
    var np = trap ? "las escaleras" : ((uit ? "de " : "a ") + (een ? "un " : "el ") + nm).replace(/^de el /, "del ").replace(/^a el /, "al ");
    var pron = p === 2 ? (fem ? "ella " : "él ") : p === 5 ? (fem ? "ellas " : "ellos ") : "";
    var zin = cap(pron + (neg ? neg + " " : "") + vorm + " " + np + (tEs.length ? " " + tEs.join(" ") : ""));
    return q ? "¿" + zin + "?" : zin + ".";
  }
  function translateNothingRaw(text, from, to, gen) {
    if (from === "en" || from === "de" || from === "fr") {
      var vEs = voertuigNaarEs(text, from, gen);
      if (vEs === null) return null;
      if (vEs) { if (to === "es") return vEs; var vOut = voertuigZin(vEs, to, gen); if (vOut) return vOut; if (vOut === false) return null; }
    }
    if (to !== "es") {
      var esVt = from === "es" ? text : (from === "nl" && typeof NL_ES !== "undefined" && typeof DICTS !== "undefined" ? NL_ES.translate(text, DICTS.nl, "m") : null);
      var vtz = esVt && voertuigZin(esVt, to, gen);
      if (vtz) return vtz;
      if (vtz === false) return null;
    }
    // "dag" op zichzelf is de begroeting (doei); "dag" in een zin is het zelfstandig naamwoord (día)
    if (from === "nl" && typeof text === "string" && /^\s*dag\s*[.!]*\s*$/i.test(text)) { if (to === "es") return "Adiós."; return translateNothingRaw("tot ziens", from, to, gen); }
    if (from === "nl") { var hm = nlHomoniem(text, to); if (hm) return hm; }
    if (from === "nl") { var hp = nlHoopPatroon(text, to); if (hp !== undefined) return hp; }  // undefined = geen hopen-zin; null = hopen-zin die we niet kunnen vertalen
    if (from === "nl") { var bk = nlBankPatroon(text); if (bk) return translateNothing(bk, from, to, gen) || null; }  // zitcontext: nooit terugvallen op de financiële bank
    var cmp = translateCompound(text, from, to, gen);
    if (cmp !== undefined) return cmp;
    var t = String(text || ""), flag = false, m;
    var mb = from === "es" && /^\s*(yo|tú|él|ella|nosotros|ellos)?\s*(no\s+)?(estoy|estás|está|estamos|están)\s+bien\s*[.!]*\s*$/i.exec(t);
    if (mb) {
      var pi = { estoy: 0, "estás": 1, "está": 2, estamos: 3, "están": 5 }[mb[3].toLowerCase()], ng = !!mb[2], sg = (mb[1] || "").toLowerCase();
      var fem = sg === "ella";
      if (to === "en") return ["I am", "You are", fem ? "She is" : "He is", "We are", "", "They are"][pi] + (ng ? " not" : "") + " fine.";
      if (to === "de") return ["Mir", "Dir", fem ? "Ihr" : "Ihm", "Uns", "", "Ihnen"][pi] + " geht es " + (ng ? "nicht " : "") + "gut.";
      if (to === "fr") return ["Je ", "Tu ", fem ? "Elle " : "Il ", "Nous ", "", "Ils "][pi].replace(/^(Je|Tu|Il|Elle|Nous|Ils) $/, "$1 ") + (ng ? ["ne vais pas", "ne vas pas", "ne va pas", "n'allons pas", "", "ne vont pas"][pi] : ["vais", "vas", "va", "allons", "", "vont"][pi]) + (ng ? "" : "") + " bien.";
    }
    if (from === "es" && /^\s*no\b/i.test(t) && /\bnada\s*[.!]*\s*$/i.test(t)) { t = t.replace(/\bnada(\s*[.!]*\s*)$/i, "eso$1"); flag = true; }
    else if (from === "de" && /\bnichts\s*[.!]*\s*$/i.test(t) && !/\bnicht\b/i.test(t) && /^\s*ich\s+(tue|mache|sehe|höre|esse|trinke|habe|weiß|kaufe|brauche|will)\b/i.test(t)) { t = t.replace(/\bnichts(\s*[.!]*\s*)$/i, "das nicht$1"); flag = true; }
    else if (from === "fr" && /\bne\s+\S+\s+rien\s*[.!]*\s*$/i.test(t)) { t = t.replace(/\brien(\s*[.!]*\s*)$/i, "pas ça$1"); flag = true; }
    else if (from === "en" && /\b(don't|do not|doesn't|does not)\b.*\banything\s*[.!]*\s*$/i.test(t)) { t = t.replace(/\banything(\s*[.!]*\s*)$/i, "that$1"); flag = true; }
    // "iets / algo / something / etwas / quelque chose" aan het eind (zonder ontkenning): zelfde aanpak als bij "niets"
    var iets = false;
    if (!flag) {
      var IETS = { es: /\balgo(\s*[.!?]*\s*)$/i, nl: /\biets(\s*[.!?]*\s*)$/i, en: /\bsomething(\s*[.!?]*\s*)$/i, de: /\betwas(\s*[.!?]*\s*)$/i, fr: /\bquelque chose(\s*[.!?]*\s*)$/i };
      var NEG = { es: /^\s*no\b/i, nl: /\b(niet|geen)\b/i, en: /\b(not|n't|never)\b/i, de: /\b(nicht|kein\w*)\b/i, fr: /\b(ne|n')\b/i };
      var DAT = { es: "eso", nl: "dat", en: "that", de: "das", fr: "ça" };
      if (IETS[from] && IETS[from].test(t) && !NEG[from].test(t) && !/\?\s*$/.test(t)) {
        // Naar het Nederlands: eerst naar het Spaans ("... algo"), dan rechtstreeks met de Spaans-Nederlandse vertaler, die "algo" kent
        if (to === "nl" && typeof ES_NL !== "undefined" && typeof REVS !== "undefined") {
          var esZin = from === "es" ? t : translateNothingRaw(t, from, "es", gen);
          var nlZin = esZin ? ES_NL.translate(esZin, REVS.nl, function (w) { return (typeof GRAM !== "undefined") ? GRAM.gen(w, "nl") : null; }) : null;
          if (nlZin) return nlZin;
        }
        t = t.replace(IETS[from], DAT[from] + "$1"); iets = true;
      }
    }
    if (from === "nl" && (to === "de" || to === "fr" || to === "en")) {
      var smk = nlSmaakPatroon(t, to); if (smk) return smk;
      var hdn = nlHoudingPatroon(t, to); if (hdn) return hdn;
      var kaal = t.replace(/[.!?]+\s*$/, "").replace(/\s+/g, " ").trim().toLowerCase();
      var kaalTabel = to === "de" ? NL_DE_KAAL : to === "fr" ? NL_FR_KAAL : NL_EN_KAAL;
      if (Object.prototype.hasOwnProperty.call(kaalTabel, kaal)) return kaalTabel[kaal];
    }
    var r = translateBase(t, from, to, gen);
    if (r && to === "fr") r = r.replace(/\b(fais|fait|faisons|faites|font) la course\b/, "$1 les courses");
    if (r && to === "fr") r = r.replace(/\bplus (apprendre|parler|étudier) (?:l')?(espagnol|français|anglais|allemand|néerlandais)\b/, function (m0, v, l) { return v + " plus " + (/^[aeéiouh]/.test(l) ? "d'" : "de ") + l; });
    if (r && to === "en") r = r.replace(/\b(learn|speak|study) (Spanish|French|English|German|Dutch) more\b/, "$1 more $2");
    if (r && to === "en") r = r.replace(/\bI be\b/g, "I am").replace(/\b(You|you|We|we|They|they) be\b/g, "$1 are");
    if (r && to === "en") r = r.replace(/\b(Let|let) (that|this|it)(?=[!.]|$)/, function (m0, l, w) { return (l === "Let" ? "Leave " : "leave ") + w; }).replace(/\bbeautiful (man|boy|guy|actor|father|brother|husband|son)\b/g, "handsome $1").replace(/^(He is|He's|He was) beautiful\b/, "$1 handsome");
    if (iets) {
      if (!r) return null;
      var TERUG = { es: [/\beso\b/, "algo"], nl: [/\bdat\b/, "iets"], en: [/\bthat\b/, "something"], de: [/\bdas\b/, "etwas"], fr: [/(^|\s)ça\b/, "$1quelque chose"] }[to];   // \b werkt niet voor ç
      var o2 = TERUG ? r.replace(TERUG[0], TERUG[1]) : r;
      return o2 === r ? null : o2;
    }
    if (!flag || !r) return flag ? null : r;
    var o = r;
    if (to === "es") o = r.replace(/\beso\b/, "nada");
    else if (to === "en") o = r.replace(/\bthat\b/, "anything");
    else if (to === "de") o = r.replace(/\bdas nicht\b/, "nichts").replace(/ nicht\b/, " nichts");
    else if (to === "fr") o = r.replace(/ pas ça\b/, " rien").replace(/ pas\b/, " rien").replace(/ ça\b/, "");
    return o === r ? null : o;
  }
  // Het Spaans heeft één woord voor zonen en kinderen ("hijos"). Zei de bron "sons", "Söhne" of "fils", dan zijn het zonen.
  // Vaste woordgroepen per doeltaal (zelfde regels als bij Zin bouwen in app.js), nu voor alle vertalingen
  function nazorg(r, to) {
    if (typeof r !== "string") return r;
    if (to === "en") r = r.replace(/\b(have|has) work a lot\b/g, "$1 a lot of work").replace(/\b(do|does) the dinner\b/g, function (m0, v) { return (v === "does" ? "makes" : "make") + " dinner"; })
      .replace(/\b(don't|doesn't) do the dinner\b/g, "$1 make dinner").replace(/\b(do|does) a break\b/g, function (m0, v) { return (v === "does" ? "takes" : "take") + " a break"; })
      .replace(/\b(don't|doesn't) do a break\b/g, "$1 take a break").replace(/\b(do|does|don't|doesn't) sport\b/g, "$1 sports");
    if (to === "fr") r = r.replace(/\bbeaucoup du\b/g, "beaucoup de").replace(/\bpas la course\b/g, "pas les courses").replace(/(^|\s)à la ville\b/g, "$1en ville")
      .replace(/\bque (elle|il|ils|elles|on)\b/g, "qu'$1");
    if (to === "nl" && typeof ES_NL !== "undefined" && ES_NL.nazorg) r = ES_NL.nazorg(r);
    return r;
  }
  function translateZonen(text, from, to, gen) { return nazorg(translateZonenBasis(text, from, to, gen), to); }
  function translateZonenBasis(text, from, to, gen) {
    var r = translateNothing(text, from, to, gen);
    if (r && to === "nl" && (from === "en" || from === "de" || from === "fr") && /\b(sons|söhne|fils)\b/i.test(String(text || "")))
      r = r.replace(/\bkinderen\b/g, "zonen").replace(/\bKinderen\b/g, "Zonen");
    // "caminar a casa": te voet naar huis, niet "nach Hause spazieren" / "marcher à la maison"
    if (r && to === "de") r = r.replace(/\b(gehe|gehst|geht|gehen)( nicht)? nach Hause spazieren\b/g, "$1$2 zu Fuß nach Hause");
    if (r && to === "fr") r = r.replace(/\b(ne )?(marche|marches|marchons|marchez|marchent)( pas)? à la maison\b/g, function (m0, ne, v, pas) {
      return (ne ? "ne " : "") + { marche: "rentre", marches: "rentres", marchons: "rentrons", marchez: "rentrez", marchent: "rentrent" }[v] + (pas || "") + " à pied";
    });
    return r;
  }
  // De Spaanse app vraagt fromEs/toEs aan. Die gaan via dezelfde volledige vertaler als de andere apps (met de extra lagen
  // voor iets/niets, in- en uitstappen, enzovoort). Gemeten over 1760 zinnen: nooit een andere of slechtere uitkomst.
  // Bij twijfel geeft de Spaanse app bewust niets ("Lo veo": hem of het?). Daarom blijft de eigen ontleding de basis; alleen
  // de lagen die aantoonbaar goed gaan komen erbij: in- en uitstappen en de trap, en zinnen die op iets/niets eindigen.
  var IETS_EIND = { es: /\b(algo|nada)\s*[.!?]*\s*$/i, en: /\b(something|nothing|anything)\s*[.!?]*\s*$/i, de: /\b(etwas|nichts)\s*[.!?]*\s*$/i, fr: /\b(quelque chose|rien)\s*[.!?]*\s*$/i };
  function fromEsVol(text, lang) {
    if (lang !== "en" && lang !== "de" && lang !== "fr") return null;
    try {
      var vz = voertuigZin(text, lang, "m");
      if (vz) return vz;
      if (vz === false) return null;
      var b = fromEs(text, lang);
      if (b) return nazorg(b, lang);
      if (IETS_EIND.es.test(String(text || ""))) return translateZonen(text, "es", lang, "m") || null;
    } catch (e) { return null; }
    return null;
  }
  function toEsVol(text, lang, gen) {
    if (lang !== "en" && lang !== "de" && lang !== "fr") return null;
    try {
      var ve = voertuigNaarEs(text, lang, gen);
      if (ve !== undefined) return ve;
      var b = toEs(text, lang, gen);
      if (b) return b;
      if (IETS_EIND[lang].test(String(text || ""))) return translateZonen(text, lang, "es", gen) || null;
    } catch (e) { return null; }
    return null;
  }
  return { fromEs: fromEsVol, toEs: toEsVol, translate: translateZonen };
})();

// ---------- Samengestelde zinnen ----------
// Een zin met twee of meer delen ("ik stap uit de bus en loop naar huis", "als ik moe ben, ga ik naar bed",
// "ik eet brood en kaas") wordt op de voegwoorden en komma's in delen geknipt. Elk deel gaat apart door de
// gewone vertaler (one), met de juiste rol: weggelaten onderwerp aanvullen, omgekeerde volgorde of bijzin
// (werkwoord achteraan, Nederlands en Duits) terugzetten, en bij "brood en kaas" het eerste deel aanvullen.
// Daarna worden de vertaalde delen met het voegwoord van de doeltaal aan elkaar gezet. Lukt één deel niet,
// dan probeert het systeem minder knippunten; lukt niets, dan geeft het null (geen halve vertaling).
var ZINDELEN = (function () {
  // [woorden, sleutel, soort]: co = gewone volgorde, inv = werkwoord vooraan (nl/de), sub = bijzin (werkwoord achteraan, nl/de)
  var CONJ = {
    nl: [["en dan", "then", "inv"], ["en daarna", "then", "inv"], ["en toen", "then", "inv"], ["daarna", "then", "inv"], ["dan", "then", "inv"],
         ["want", "because", "co"], ["omdat", "because", "sub"], ["maar", "but", "co"], ["dus", "so", "inv"], ["of", "or", "co"], ["en", "and", "co"],
         ["als", "when", "sub"], ["wanneer", "when", "sub"], ["terwijl", "while", "sub"], ["toen", "when", "sub"], ["hoewel", "although", "sub"], ["dat", "that", "sub"]],
    es: [["y luego", "then", "co"], ["y después", "then", "co"], ["y entonces", "then", "co"], ["luego", "then", "co"], ["después", "then", "co"],
         ["porque", "because", "co"], ["pero", "but", "co"], ["así que", "so", "co"], ["y", "and", "co"], ["e", "and", "co"], ["o", "or", "co"], ["u", "or", "co"],
         ["cuando", "when", "co"], ["mientras", "while", "co"], ["si", "if", "co"], ["aunque", "although", "co"], ["que", "that", "co"]],
    en: [["and then", "then", "co"], ["then", "then", "co"], ["because", "because", "co"], ["but", "but", "co"], ["so", "so", "co"], ["and", "and", "co"], ["or", "or", "co"],
         ["when", "when", "co"], ["while", "while", "co"], ["if", "if", "co"], ["although", "although", "co"], ["even though", "although", "co"], ["that", "that", "co"]],
    de: [["und dann", "then", "inv"], ["und danach", "then", "inv"], ["dann", "then", "inv"], ["danach", "then", "inv"], ["denn", "because", "co"], ["weil", "because", "sub"],
         ["aber", "but", "co"], ["also", "so", "inv"], ["deshalb", "so", "inv"], ["und", "and", "co"], ["oder", "or", "co"],
         ["wenn", "when", "sub"], ["als", "when", "sub"], ["während", "while", "sub"], ["falls", "if", "sub"], ["obwohl", "although", "sub"], ["dass", "that", "sub"]],
    fr: [["et puis", "then", "co"], ["et ensuite", "then", "co"], ["et après", "then", "co"], ["puis", "then", "co"], ["ensuite", "then", "co"],
         ["parce que", "because", "co"], ["parce qu'", "because", "co"], ["car", "because", "co"], ["mais", "but", "co"], ["donc", "so", "co"], ["alors", "so", "co"],
         ["et", "and", "co"], ["ou", "or", "co"], ["quand", "when", "co"], ["lorsque", "when", "co"], ["pendant que", "while", "co"], ["si", "if", "co"], ["s'", "if", "co"], ["même si", "although", "co"], ["bien que", "although", "co"], ["que", "that", "co"], ["qu'", "that", "co"]]
  };
  var OUT = {
    and: { nl: "en", es: "y", en: "and", de: "und", fr: "et" }, but: { nl: "maar", es: "pero", en: "but", de: "aber", fr: "mais" },
    or: { nl: "of", es: "o", en: "or", de: "oder", fr: "ou" }, because: { nl: "want", es: "porque", en: "because", de: "denn", fr: "parce que" },
    so: { nl: "dus", es: "así que", en: "so", de: "also", fr: "donc" }, then: { nl: "en dan", es: "y luego", en: "and then", de: "und dann", fr: "et puis" },
    when: { nl: "als", es: "cuando", en: "when", de: "wenn", fr: "quand" }, "while": { nl: "terwijl", es: "mientras", en: "while", de: "während", fr: "pendant que" },
    "if": { nl: "als", es: "si", en: "if", de: "wenn", fr: "si" },
    although: { nl: "hoewel", es: "aunque", en: "although", de: "obwohl", fr: "même si" },
    that: { nl: "dat", es: "que", en: "", de: "dass", fr: "que" }
  };
  // "Ik denk / zeg / weet dat ...": de hoofdzin is alleen het werkwoord; vaste vormen per taal (ik, jij, hij, wij, zij mv)
  var DENK = {
    denken: { nl: ["denk", "denkt", "denkt", "denken", "denken"], es: ["creo", "crees", "cree", "creemos", "creen"], en: ["think", "think", "thinks", "think", "think"], de: ["glaube", "glaubst", "glaubt", "glauben", "glauben"], fr: ["crois", "crois", "croit", "croyons", "croient"] },
    pensar: { nl: ["denk", "denkt", "denkt", "denken", "denken"], es: ["pienso", "piensas", "piensa", "pensamos", "piensan"], en: ["think", "think", "thinks", "think", "think"], de: ["denke", "denkst", "denkt", "denken", "denken"], fr: ["pense", "penses", "pense", "pensons", "pensent"] },
    zeggen: { nl: ["zeg", "zegt", "zegt", "zeggen", "zeggen"], es: ["digo", "dices", "dice", "decimos", "dicen"], en: ["say", "say", "says", "say", "say"], de: ["sage", "sagst", "sagt", "sagen", "sagen"], fr: ["dis", "dis", "dit", "disons", "disent"] },
    weten: { nl: ["weet", "weet", "weet", "weten", "weten"], es: ["sé", "sabes", "sabe", "sabemos", "saben"], en: ["know", "know", "knows", "know", "know"], de: ["weiß", "weißt", "weiß", "wissen", "wissen"], fr: ["sais", "sais", "sait", "savons", "savent"] },
    geloven: { nl: ["geloof", "gelooft", "gelooft", "geloven", "geloven"], es: ["creo", "crees", "cree", "creemos", "creen"], en: ["believe", "believe", "believes", "believe", "believe"], de: ["glaube", "glaubst", "glaubt", "glauben", "glauben"], fr: ["crois", "crois", "croit", "croyons", "croient"] }
  };
  var DENK_SUBJ = { nl: [["ik"], ["je", "jij"], ["hij", "zij", "ze"], ["we", "wij"], ["ze", "zij"]], en: [["i"], ["you"], ["he", "she"], ["we"], ["they"]], de: [["ich"], ["du"], ["er", "sie"], ["wir"], ["sie"]],
    fr: [["je"], ["tu"], ["il", "elle"], ["nous"], ["ils", "elles"]], es: [["yo"], ["tú"], ["él", "ella"], ["nosotros", "nosotras"], ["ellos", "ellas"]] };
  var DENK_OUT = { nl: ["ik", "je", "hij", "we", "ze"], en: ["I", "you", "he", "we", "they"], de: ["ich", "du", "er", "wir", "sie"], fr: ["je", "tu", "il", "nous", "ils"], es: ["", "", "", "", ""] };
  var DENK_OUT_F = { nl: "zij", en: "she", de: "sie", fr: "elle", es: "ella" };
  // geeft {p, f, verb} of null
  function denkLees(tk, from) {
    var w = tk.map(lc), subj = null, vi = 0, fem = false;
    var S = DENK_SUBJ[from];
    if (w.length === 2) { subj = w[0]; vi = 1; } else if (w.length === 1 && from === "es") vi = 0; else return null;
    for (var vb in DENK) {
      var f = DENK[vb][from];
      for (var p = 0; p < 5; p++) {
        if (f[p] !== w[vi]) continue;
        if (subj !== null && S[p].indexOf(subj) < 0) continue;
        if (subj !== null && (p === 2 || p === 4) && /^(zij|ze|she|sie|elle|elles|ella|ellas)$/.test(subj) && !(from === "nl" && p === 4)) fem = p === 2;
        return { p: p, f: fem, verb: vb, subj: subj };
      }
    }
    return null;
  }
  function denkUit(d, to) {
    var v = DENK[d.verb][to][d.p], s = d.f ? DENK_OUT_F[to] : DENK_OUT[to][d.p];
    if (to === "es") return cap((d.f ? "ella " : (d.subj && d.p === 2 ? "él " : "")) + v);
    if (to === "nl" && d.p === 2 && !d.f && !d.subj) s = "hij/zij";
    return cap(s + " " + v);
  }
  var INV_OUT = { then: 1, so: 1 }, SUB_OUT = { when: 1, "while": 1, "if": 1, although: 1, that: 1 };
  var INTERJ = {};
  [["ja", "sí", "yes", "ja", "oui"], ["nee", "no", "no", "nein", "non"], ["oké", "vale", "okay", "okay", "d'accord"], ["natuurlijk", "claro", "of course", "natürlich", "bien sûr"]].forEach(function (r) {
    var o = { nl: r[0], es: r[1], en: r[2], de: r[3], fr: r[4] };
    r.forEach(function (w) { if (!INTERJ[w]) INTERJ[w] = o; });
  });
  INTERJ.ok = INTERJ["oké"]; INTERJ.yes = INTERJ.ja; INTERJ.no = INTERJ.nee; INTERJ.nein = INTERJ.nee; INTERJ.si = INTERJ.ja;
  var NUMW = /^(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|veinte|treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa|heures?|uur|uhr|o'clock|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|un|deux|trois|quatre|cinq|sept|huit|neuf|dix|onze|douze|vingt|trente|eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf|een|twee|vijf|zes|zeven|negen|tien|twaalf)$/;
  var TIJDW = /^(media|cuarto|quart|demie|demi|half|halb|viertel|kwart|minutos|minutes|minuten)$/;
  var BELEEFD = { es: /,?\s*por favor$/i, en: /,?\s*please$/i, de: /,?\s*bitte$/i, fr: /,?\s*s'il (te|vous) pla[iî]t$/i, nl: /,?\s*(alsjeblieft|alstublieft)$/i };
  var BELEEFD_OUT = { es: "por favor", en: "please", de: "bitte", fr: "s'il te plaît", nl: "alsjeblieft" };
  var GAP_KEEP = { fr: /^(du|de|des|d'|la|le|les|l'|un|une|à|au|aux)$/, en: /^(the|a|an|some|any|to)$/, es: /^(el|la|los|las|un|una|unos|unas|del|al|a|de)$/,
    de: /^(der|die|das|den|dem|des|ein|eine|einen|einem|einer)$/, nl: /^(de|het|een|naar)$/ };
  var PRON = {
    nl: ["ik", "jij", "je", "u", "hij", "zij", "ze", "we", "wij", "jullie", "het", "men", "hij/zij"], de: ["ich", "du", "er", "sie", "es", "wir", "ihr", "man"],
    en: ["i", "you", "he", "she", "it", "we", "they"], fr: ["je", "j'", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "c'", "ce"],
    es: ["yo", "tú", "él", "ella", "nosotros", "nosotras", "vosotros", "ellos", "ellas", "usted", "ustedes"]
  };
  var DET = {
    nl: ["de", "het", "een", "mijn", "jouw", "zijn", "haar", "ons", "onze", "hun", "deze", "die", "dit", "dat"],
    de: ["der", "die", "das", "ein", "eine", "einen", "mein", "meine", "dein", "deine", "sein", "seine", "ihre", "unser", "unsere", "dieser", "diese", "dieses"],
    en: ["the", "a", "an", "my", "your", "his", "her", "our", "their", "this", "that", "these", "those"],
    fr: ["le", "la", "les", "l'", "un", "une", "des", "mon", "ma", "mes", "ton", "ta", "tes", "son", "sa", "ses", "notre", "nos", "leur", "leurs", "cette", "ces"],
    es: ["el", "la", "los", "las", "un", "una", "mi", "mis", "tu", "tus", "su", "sus", "este", "esta", "ese", "esa"]
  };
  var PART = { nl: ["op", "uit", "in", "af", "aan", "mee", "terug", "weg", "binnen", "buiten", "toe", "langs", "thuis"], de: ["auf", "aus", "ein", "an", "ab", "mit", "zurück", "weg", "los", "vor", "zu", "fern", "her", "hin", "hinauf", "hinunter"] };
  // "Ik weet niet of hij komt": "of" = whether, niet knippen
  var OF_NA = /^(weet|weten|vraag|vraagt|vragen|vroeg|vroegen|snap|begrijp|zie|kijk|twijfel|benieuwd|niet)$/;

  function lc(w) { return String(w || "").toLowerCase(); }
  function isIn(list, w) { w = lc(w); for (var i = 0; i < list.length; i++) if (list[i] === w || (/'$/.test(list[i]) && w.indexOf(list[i]) === 0 && w.length > list[i].length)) return true; return false; }
  function cap(s) { return String(s).replace(/^([¿¡]?)(\S)/, function (m, q, c) { return q + c.toUpperCase(); }); }

  function tokens(text) {
    return String(text).replace(/,/g, " , ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  }
  // Knippunten: {i: index van het eerste woord van het voegwoord, n: aantal woorden, key, kind, comma}
  function splitPoints(tk, from) {
    var list = CONJ[from], pts = [];
    for (var i = 1; i < tk.length; i++) {
      if (tk[i] === ",") {
        // komma direct voor een voegwoord hoort bij dat voegwoord
        var nx = matchConj(tk, i + 1, list);
        if (nx) { var p = conjPoint(tk, i + 1, nx, from); if (p) { p.comma = true; p.i0 = i; pts.push(p); i = i + nx[0].split(" ").length; continue; } }
        pts.push({ i0: i, i: i, n: 1, key: "comma", kind: "co", comma: true }); continue;
      }
      var m = matchConj(tk, i, list);
      if (m) { var cp = conjPoint(tk, i, m, from); if (cp) { cp.i0 = i; pts.push(cp); i += m[0].split(" ").length - 1; } }
    }
    return pts;
  }
  function matchConj(tk, i, list) {
    for (var k = 0; k < list.length; k++) {
      var ws = list[k][0].split(" "), ok = true;
      for (var j = 0; j < ws.length; j++) {
        var w = lc(tk[i + j]);
        if (/'$/.test(ws[j]) ? w.indexOf(ws[j]) !== 0 : w !== ws[j]) { ok = false; break; }
      }
      if (ok) return list[k];
    }
    return null;
  }
  function conjPoint(tk, i, m, from) {
    var n = m[0].split(" ").length, key = m[1], kind = m[2] || "co";
    if (/'$/.test(m[0].split(" ").pop())) {   // "parce qu'il", "s'il": het woord na de apostrof hoort bij het volgende deel
      return { i: i, n: n, key: key, kind: kind, glued: m[0].split(" ").pop() };
    }
    if (from === "nl" && m[0] === "of" && OF_NA.test(lc(tk[i - 1]))) return null;
    if (key === "that") {
      var voor = [], k0 = i - 1;
      while (k0 >= 0 && tk[k0] !== ",") { voor.unshift(tk[k0]); k0--; }
      if (from === "de" && tk[i - 1] === ",") { voor = []; k0 = i - 2; while (k0 >= 0 && tk[k0] !== ",") { voor.unshift(tk[k0]); k0--; } }
      if (!denkLees(voor, from)) return null;
      if (/^(sí|si|no|oui|non)$/.test(lc(tk[i + n]))) return null;
    }
    // tijden en getallen niet knippen: "ocho y cuarto", "six heures et demie", "treinta y dos", "half acht en"
    if (key === "and" && (NUMW.test(lc(tk[i - 1])) || /^\d/.test(tk[i - 1] || "")) && (TIJDW.test(lc(tk[i + 1])) || NUMW.test(lc(tk[i + 1])) || /^\d/.test(tk[i + 1] || ""))) return null;
    if (key === "and" && TIJDW.test(lc(tk[i + 1])) && (i + 2 >= tk.length || tk[i + 2] === ",")) return null;
    if (from === "nl" && m[0] === "toen") { if (isIn(PRON.nl, tk[i + 1])) { key = "when"; kind = "sub"; } else { key = "then"; kind = "inv"; } }
    if (from === "nl" && m[0] === "dan" && i > 0 && /^(groter|kleiner|beter|meer|minder|liever|eerder|later|ouder|jonger)$/.test(lc(tk[i - 1]))) return null;
    return { i: i, n: n, key: key, kind: kind };
  }
  function leadConj(tk, from) {
    var m = matchConj(tk, 0, CONJ[from]);
    if (!m || !/^(when|while|if|because)$/.test(m[1])) return null;
    var c = tk.indexOf(",");
    if (c < 2) return null;
    var n = m[0].split(" ").length;
    return { n: n, key: m[1], kind: m[2] || "co", comma: c, glued: /'$/.test(m[0]) ? m[0].split(" ").pop() : null };
  }
  // Nederlands en Duits: tweede persoon bij inversie ("ga je" <-> "je gaat")
  function nlAddT(v) { v = lc(v); if (/t$/.test(v)) return v; if (/[^aeiou]a$/.test(v) || v === "ga" || v === "sta" || v === "sla") return v + "at"; return v + "t"; }
  function nlDropT(v) {
    var lv = lc(v);
    if (!/t$/.test(lv) || lv.length <= 3) return v;
    var r = lv.slice(0, -1);
    if (/aa$/.test(r)) return r.slice(0, -1);
    if (/(oe|ie)$/.test(r) || /[^aeiou]$/.test(r)) return r;
    return v;
  }
  function subjLen(tk, lang) {
    if (isIn(PRON[lang] || [], tk[0])) return 1;
    if (isIn(DET[lang] || [], tk[0]) && tk.length > 2) return 2;
    return 0;
  }
  // Bron: "ga ik naar bed" -> "ik ga naar bed"
  function deInvert(tk, lang) {
    if (tk.length > 1 && isIn(PRON[lang] || [], tk[1]) && !isIn(PRON[lang] || [], tk[0])) {
      var v = tk[0], s = tk[1];
      if (lang === "nl" && /^(je|jij)$/.test(lc(s))) v = nlAddT(v);
      return [lc(s), lc(v)].concat(tk.slice(2));
    }
    return null;
  }
  // Bron: bijzin met het werkwoord achteraan -> gewone volgorde. Geeft een lijst kandidaten.
  function subToMain(tk, lang) {
    var out = [], s = subjLen(tk, lang);
    if (!s || tk.length < s + 1) return out;
    var subj = tk.slice(0, s), mid = tk.slice(s), last = mid[mid.length - 1];
    var parts = PART[lang] || [];
    // werkwoord met vast deel: "uitstap" -> "stap ... uit", "aussteige" -> "steige ... aus"
    for (var p = 0; p < parts.length; p++) {
      if (lc(last).indexOf(parts[p]) === 0 && lc(last).length > parts[p].length + 2) {
        out.push(subj.concat([last.slice(parts[p].length)], mid.slice(0, -1), [parts[p]]));
      }
    }
    out.push(subj.concat([last], mid.slice(0, -1)));
    if (mid.length >= 2) out.push(subj.concat([mid[mid.length - 2]], mid.slice(0, -2), [last]));
    out.push(tk.slice());
    return out;
  }
  // Doel: gewone zin -> werkwoord vooraan ("ik ga naar bed" -> "ga ik naar bed")
  function invertOut(o, lang) {
    var tk = o.split(" ");
    if (isIn(PRON[lang], tk[0]) && tk.length > 1) {
      var v = tk[1];
      if (lang === "nl" && /^(je|jij)$/.test(lc(tk[0]))) v = nlDropT(v);
      return [v, lowSubj(tk[0], lang)].concat(tk.slice(2)).join(" ");
    }
    if (isIn(DET[lang], tk[0]) && tk.length > 2) return [tk[2], lc(tk[0]), tk[1]].concat(tk.slice(3)).join(" ");
    return null;
  }
  function lowSubj(w, lang) { return lang === "en" && /^I('|$)/.test(w) ? w : lc(w); }
  // Doel: gewone zin -> bijzin ("ik ben moe" -> "ik moe ben", "ich steige aus dem Bus aus" -> "ich aus dem Bus aussteige")
  function subOut(o, lang) {
    var tk = o.split(" "), s = 0, v, subj, rest;
    if (isIn(PRON[lang], tk[0])) s = 1; else if (isIn(DET[lang], tk[0]) && tk.length > 2) s = 2;
    if (s && tk.length > s) { subj = tk.slice(0, s); v = tk[s]; rest = tk.slice(s + 1); }
    else if (tk.length > 2 && isIn(PRON[lang], tk[2])) { subj = [tk[2]]; v = tk[1]; rest = [tk[0]].concat(tk.slice(3)); }   // "Morgen ga ik ..." -> "ik morgen ... ga"
    else return null;
    subj = subj.map(function (w, i) { return i === 0 ? (lang === "de" && !isIn(PRON.de, w) && !isIn(DET.de, w) ? w : lc(w)) : w; });
    rest = rest.map(function (w, i) { return i === 0 && s === 0 ? lc(w) : w; });
    var parts = PART[lang] || [], lastW = rest[rest.length - 1];
    if (rest.length && parts.indexOf(lc(lastW)) >= 0) return subj.concat(rest.slice(0, -1), [lc(lastW) + v]).join(" ");
    // Nederlands: hulpwerkwoord vóór de infinitief ("dat je meer Spaans wilt leren", "als ik kan komen")
    if (lang === "nl" && rest.length >= 1 && /^(wil|wilt|willen|kan|kun|kunt|kunnen|moet|moeten|mag|mogen|ga|gaat|gaan|zal|zult|zullen)$/.test(lc(v)) && /[a-z]en$/.test(lc(lastW))) return subj.concat(rest.slice(0, -1), [v, lastW]).join(" ");
    return subj.concat(rest, [v]).join(" ");
  }
  function stripPunct(o) { return String(o).replace(/\s*[.!?]+\s*$/, "").replace(/^[¿¡]/, "").trim(); }
  function words(o) { return o.split(" "); }

  // Een vaste zin (zin-lex.js) wordt nooit geknipt: die heeft een eigen, goedgekeurde vertaling
  function isVast(text, from) {
    if (typeof ZINC === "undefined") return false;
    var k = ZINC.normKey(text);
    if (from === "nl") return !!(ZINC.NLIDX && ZINC.NLIDX[k]);
    if (from === "es") return !!(ZINC.FIXED[ZINC.fold(k)] || ZINC.FIXED[k]);
    var fi = ZINC.FIDX && ZINC.FIDX[from];
    return !!(fi && (fi[k] || (ZINC.enKey && from === "en" && fi[ZINC.enKey(text)])));
  }
  function compound(text, from, to, one) {
    if (!CONJ[from] || !OUT.and[to] || typeof one !== "function") return null;
    var src = String(text || "").trim(), q = /\?\s*$/.test(src);
    if (isVast(src, from)) return null;
    // meer zinnen in één keer ("¿Puedes cerrar la ventana? Hace frío."): elke zin apart
    var zinnen = src.replace(/([.!?…]+)\s+(?=[¿¡]?[A-ZÁÉÍÓÚÑÄÖÜÀÂÇÈÊÎÔÛ])/g, "$1\u0001").split("\u0001").map(function (x) { return x.trim(); }).filter(Boolean);
    if (zinnen.length > 1) {
      var uitz = [];
      for (var zi = 0; zi < zinnen.length; zi++) {
        var zr = (hasSplit(zinnen[zi], from) ? compound(zinnen[zi], from, to, one) : null) || one(zinnen[zi]);
        if (!zr) return null;
        uitz.push(String(zr));
      }
      return uitz.join(" ");
    }
    var body = src.replace(/^[¿¡]/, "").replace(/\s*[.!?…]+\s*$/, "");
    // beleefdheid aan het eind (", por favor") los houden: de rest vertalen en het woord van de doeltaal erachter zetten
    if (BELEEFD[from] && BELEEFD[from].test(body) && BELEEFD_OUT[to]) {
      var kern = body.replace(BELEEFD[from], "").trim();
      if (kern && kern !== body) {
        // zonder ander knippunt: liever de hele zin als de gewone vertaler die kent ("Kannst du das bitte wiederholen?")
        if (!splitPoints(tokens(kern), from).length && !leadConj(tokens(kern), from)) { var heel = one(src); if (heel) return String(heel); }
        // eerst: het beleefdheidswoord bij het laatste deel houden ("pero habla despacio, por favor" = een verzoek)
        var mPol = BELEEFD[from].exec(body), polSrc = mPol[0].replace(/^,?\s*/, "");
        var vk = kern + "";
        var kt = tokens(vk);
        if (splitPoints(kt, from).length || leadConj(kt, from)) {
          var rp = coreCompound(kt, from, to, q, one, polSrc);
          if (rp) return rp;
        }
        var kz = (src.charAt(0) === "¿" ? "¿" : "") + kern + (q ? "?" : ".");
        var kr = (hasSplit(kz, from) ? compound(kz, from, to, one) : null) || one(kz);
        if (!kr) return null;
        var kq = /\?\s*$/.test(kr);
        return String(kr).replace(/\s*[.!?]+\s*$/, "") + ", " + BELEEFD_OUT[to] + (q || kq ? (to === "fr" ? " ?" : "?") : ".");
      }
    }
    var tk = tokens(body);
    if (tk.length < 3) return null;
    return coreCompound(tk, from, to, q, one, null);
  }
  function coreCompound(tk, from, to, q, one, polSrc) {
    var lead = leadConj(tk, from);
    var pts = splitPoints(tk, from).filter(function (p) { return !lead || p.i0 !== lead.comma; });
    if (lead) {
      // het eerste deel loopt tot de komma; knippunten daarbinnen vervallen
      pts = pts.filter(function (p) { return p.i0 > lead.comma; });
    }
    if (!pts.length && !lead) return null;
    if (pts.length > 6) pts = pts.slice(0, 6);
    var combos = [];
    for (var mask = (1 << pts.length) - 1; mask >= 0; mask--) {
      var sel = pts.filter(function (p, k) { return mask & (1 << k); });
      if (sel.length || lead) combos.push(sel);
    }
    combos.sort(function (a, b) { return b.length - a.length; });
    for (var ci = 0; ci < combos.length; ci++) {
      var r = tryCombo(tk, combos[ci], lead, from, to, q, one, polSrc);
      if (r) return r;
    }
    return null;
  }

  function tryCombo(tk, sel, lead, from, to, q, one, polSrc) {
    // segmenten bouwen
    var segs = [], start = 0, first = { role: "main", key: null, kind: "co" };
    if (lead) {
      var t0 = tk.slice(lead.n, lead.comma);
      if (lead.glued) t0[0] = t0[0].slice(lead.glued.length) || t0[0];
      segs.push({ tk: t0, role: "sub", key: lead.key, kind: lead.kind, leadSub: true });
      start = lead.comma + 1;
      first = { role: "afterSub", key: "comma", kind: "co" };
    }
    var cur = first;
    for (var s = 0; s <= sel.length; s++) {
      var end = s < sel.length ? sel[s].i0 : tk.length;
      var part = tk.slice(start, end);
      if (cur.glued && part.length) { var g = part[0].slice(cur.glued.length); part[0] = g; }
      if (!part.length || part[0] === "") return null;
      segs.push({ tk: part, role: cur.role, key: cur.key, kind: cur.kind, comma: cur.comma, at: start });
      if (s < sel.length) {
        var p = sel[s];
        start = p.i + p.n;
        if (p.key === "comma") start = p.i + 1;
        var role = p.key === "comma" ? "main" : (p.kind === "sub" && (from === "nl" || from === "de")) ? "sub" : (p.kind === "inv" && (from === "nl" || from === "de")) ? "inv" : "main";
        cur = { role: role, key: p.key, kind: p.kind, comma: p.comma, glued: p.glued };
        if (p.glued) start = p.i + p.n - 1;
      }
    }
    var punct = q ? "?" : ".";
    function mk(arr, last) { return cap(arr.join(" ")) + (q ? "?" : "."); }
    function tryT(arr, last) {
      // losse tussenwerpsels ("ja", "nee", "oké") hebben een vaste vertaling
      if (arr.length === 1 && INTERJ[lc(arr[0])] && INTERJ[lc(arr[0])][to]) return cap(INTERJ[lc(arr[0])][to]) + ".";
      var r = one(mk(arr, last)); return r ? String(r) : null;
    }
    var outs = [], lastClause = null, lastOutRaw = null;
    for (var i = 0; i < segs.length; i++) {
      var sg = segs[i], isLast = i === segs.length - 1, res = null, used = null, how = "full";
      var cands = [];
      var src = sg.tk.map(function (w, k) { return k === 0 && !/^[A-ZÄÖÜ]/.test(w) ? w : w; });
      var hasSubj = (PRON[from] && (isIn(PRON[from], src[0]) || isIn(DET[from], src[0]) || /^[A-ZÄÖÜÉ]/.test(src[0]) || (src.length > 2 && (isIn(PRON[from], src[1]) || isIn(PRON[from], src[2])))));
      if (sg.role === "sub" && (from === "nl" || from === "de")) subToMain(src, from).forEach(function (c) { cands.push({ tk: c, how: "full" }); });
      else if (sg.role === "inv" || (sg.role === "afterSub" && (from === "nl" || from === "de"))) {
        var di = deInvert(src, from);
        if (di) cands.push({ tk: di, how: "full" });
        cands.push({ tk: src, how: "full" });
      } else if (from === "es" || hasSubj || !lastClause || sg.role === "sub") cands.push({ tk: src, how: "full" });
      if (lastClause && !(sg.role === "sub" && (from === "nl" || from === "de")) && sg.role !== "afterSub" && /^(and|or|but|then|comma)$/.test(sg.key)) {
        var sl = subjLen(lastClause, from);
        if (from !== "es" && !hasSubj && sl) cands.push({ tk: lastClause.slice(0, sl).concat(src.map(function (w, k) { return k === 0 ? lc(w) : w; })), how: "elided", n: sl });
        var lijst = sg.key !== "comma" || sel.some(function (pp) { return pp.i0 > sg.at && /^(and|or)$/.test(pp.key); });
        if (/^(and|or|but|comma)$/.test(sg.key) && lijst) {
          for (var L = lastClause.length - 1; L >= 1; L--) cands.push({ tk: lastClause.slice(0, L).concat(src), how: "gap" });
        }
        if (from !== "es" && !hasSubj && !sl) cands.push({ tk: src, how: "full" });
      }
      var polDone = false;
      if (isLast && polSrc) {
        for (var cp = 0; cp < cands.length && !res; cp++) {
          if (cands[cp].how !== "full") continue;
          var trp = one(cap(cands[cp].tk.join(" ")) + ", " + polSrc + (q ? "?" : "."));
          if (trp && BELEEFD[to] && BELEEFD[to].test(stripPunct(trp))) { res = String(trp); used = cands[cp]; polDone = true; }
        }
      }
      var nextKey = i + 1 < segs.length ? segs[i + 1].key : null;
      if (nextKey === "that") { var dl = denkLees(src, from); if (dl) { res = denkUit(dl, to) + "."; used = { tk: src, how: "denk" }; } }
      for (var c = 0; c < cands.length && !res; c++) {
        var tr = tryT(cands[c].tk, isLast);
        if (tr) { res = tr; used = cands[c]; }
      }
      if (!res) return null;
      var raw = res, o = stripPunct(res);
      if (used.how === "full" || used.how === "denk") { lastClause = used.tk; lastOutRaw = o; }
      if (used.how === "elided" && i > 0) {
        var ow = words(o), pw = words(lastOutRaw || "");
        if (ow.length > 1 && pw.length && lc(ow[0]) === lc(pw[0]) && (isIn(PRON[to] || [], ow[0]) || /^(él|ella)$/i.test(ow[0]))) o = ow.slice(1).join(" ");
        o = lowFirst(o, to);
      }
      // Spaanse bron laat het onderwerp weg; in de doeltaal dubbel onderwerp weghalen bij "en"/"of": "I get off the bus and walk home"
      if (used.how === "full" && i > 0 && from === "es" && /^(and|or|then)$/.test(sg.key) && outs.length && outs[outs.length - 1].how !== "gap") {
        var pw2 = words(outs[outs.length - 1].firstRaw || ""), ow2 = words(o);
        if (to !== "es" && ow2.length > 1 && pw2.length && lc(ow2[0]) === lc(pw2[0]) && isIn(PRON[to] || [], ow2[0]) && !((to === "nl" || to === "de") && sg.key === "then")
            && !(to === "fr" && (sg.key === "then" || /^(me|m'|te|t'|se|s'|nous|vous|le|la|les|l'|lui|leur|y|en|ne|n')/.test(lc(ow2[1]))))) { o = ow2.slice(1).join(" "); used = { how: "elided", tk: used.tk }; }
      }
      if (used.how === "gap") {
        var aw = words(stripPunct(lastOutRaw || "")), bw = words(o), k2 = 0;
        while (k2 < aw.length && k2 < bw.length - 1 && aw[k2] === bw[k2]) k2++;
        // lidwoorden en voorzetsels horen bij het nieuwe deel: "du pain et du fromage", "naar Madrid en naar Barcelona" niet, wel "et du fromage"
        while (k2 > 0 && GAP_KEEP[to] && GAP_KEEP[to].test(lc(aw[k2 - 1]))) k2--;
        if (!k2) return null;
        o = bw.slice(k2).join(" ");
      }
      outs.push({ o: o, sg: sg, how: used.how, src: sg.tk, firstRaw: stripPunct(raw), polDone: polDone });
    }
    // aan elkaar zetten
    var res2 = "";
    for (var j = 0; j < outs.length; j++) {
      var it = outs[j], o2 = it.o, key = it.sg.key;
      if (j > 0 && it.how === "full") {
        var srcLow = !/^[A-ZÄÖÜÉ]/.test(it.src[0]) || (from === "en" && it.src[0] === "I");
        if (srcLow && !(to === "en" && /^I\b/.test(o2))) o2 = o2.charAt(0).toLowerCase() + o2.slice(1);
      }
      if ((to === "nl" || to === "de") && it.how === "full") {
        if (it.sg.leadSub || (key && SUB_OUT[key] && it.sg.role !== "afterSub")) { o2 = subOut(o2, to); if (!o2) return null; }
        else if (it.sg.role === "afterSub" || INV_OUT[key]) { o2 = invertOut(o2, to); if (!o2) return null; }
      }
      if (j === 0) {
        if (it.sg.leadSub) { res2 = conjWord(it.sg.key, to, o2) + " " + (o2.charAt(0).toLowerCase() === o2.charAt(0) || to === "de" ? o2 : lowFirst(o2, to)); }
        else res2 = o2;
        continue;
      }
      if (key === "comma") { res2 += ", " + o2; continue; }
      var cw = conjWord(key, to, o2);
      if (cw === "") { res2 += (to === "de" ? ", " : " ") + o2; continue; }
      var comma = (it.sg.comma && /^(but|so|comma)$/.test(key)) || (it.sg.comma && to === from) || (to === "de" && !/^(and|or|then)$/.test(key) && it.how === "full");
      res2 += (comma ? ", " : " ") + cw + (/'$/.test(cw) ? "" : " ") + o2;
    }
    if (to === "fr") res2 = res2.replace(/\bparce que (?=[aeiouéh])/gi, "parce qu'").replace(/\bsi il(s?)\b/g, "s'il$1").replace(/ de le /g, " du ");
    if (to === "es") res2 = res2.replace(/\by (?=h?i[^aeou])/gi, "e ").replace(/\bo (?=h?o)/gi, "u ");
    if (polSrc && !(outs.length && outs[outs.length - 1].polDone)) res2 += ", " + BELEEFD_OUT[to];
    if (to === "nl" && typeof ES_NL !== "undefined" && ES_NL.nazorg) res2 = ES_NL.nazorg(res2);
    res2 = cap(res2);
    if (q) { res2 = to === "fr" ? res2 + " ?" : res2 + "?"; if (to === "es" && res2.charAt(0) !== "¿") res2 = "¿" + res2; }
    else res2 += ".";
    return res2;
  }
  function lowFirst(o, lang) {
    var w = o.split(" ")[0];
    if (lang === "en" && /^I('|$)/.test(w)) return o;
    return o.charAt(0).toLowerCase() + o.slice(1);
  }
  function conjWord(key, to, next) {
    var w = OUT[key][to];
    if (to === "fr" && w === "parce que" && /^[aeiouéh]/i.test(next)) return "parce qu'";
    if (to === "fr" && w === "que" && /^[aeiouéh]/i.test(next)) return "qu'";
    return w;
  }
  function hasSplit(text, from) {
    if (!CONJ[from]) return false;
    if (/[.!?…]\s+[¿¡]?[A-ZÁÉÍÓÚÑÄÖÜ]/.test(String(text || "").trim())) return true;
    var tk = tokens(String(text || "").replace(/[.!?…]+\s*$/, "").replace(/^[¿¡]/, ""));
    return splitPoints(tk, from).length > 0 || !!leadConj(tk, from) || !!(BELEEFD[from] && BELEEFD[from].test(tk.join(" ").replace(/ ,/g, ",")));
  }
  // Waar de gewone vertaler een samengestelde zin zelf niet goed doet (Nederlands <-> Spaans), gaat dit systeem voor.
  function first(from, to) { return from === "nl" || (from === "es" && to === "nl"); }
  return { compound: compound, hasSplit: hasSplit, first: first };
})();
ZIN.compound = ZINDELEN.compound;
ZIN.hasSplit = ZINDELEN.hasSplit;
ZIN.compoundFirst = ZINDELEN.first;
