// Zinsopbouw (Engels, Duits, Frans, Spaans) vanuit de gedeelde zinsstructuur.
// Elke functie geeft een zin of null. Null betekent: niet zeker genoeg, de app toont dan alleen de woorden.
var ZINO = (function () {
  var C = ZINC, L = C.L, NOUN = C.NOUN, ADJ = C.ADJ, VERB = C.VERB, has = C.has, cap = C.cap, low = C.low;
  var GEN = { de: {}, fr: {} };
  if (typeof ZIN_GENDER !== "undefined") {
    ["de", "fr"].forEach(function (l) { ZIN_GENDER[l].split("|").forEach(function (p) { var i = p.indexOf("="); if (i > 0) GEN[l][p.slice(0, i)] = p.slice(i + 1); }); });
  }
  var REV = function (lang) { return (typeof REVS !== "undefined" && REVS[lang]) || {}; };

  // ---------------- Zelfstandige naamwoorden opzoeken (kerntabel, anders woordenlijst + PDF-geslacht) ----------------
  function nounEntry(es) {
    if (has(NOUN, es)) return NOUN[es];
    var e = { es: es, fallback: true };
    var en = REV("en")[es];
    if (en && /^[a-z][a-z-]*$/i.test(en) && !/^to /.test(en)) { e.en = en; }
    var de = REV("de")[es];
    if (de) {
      var m = /^(der|die|das) (\S+)$/.exec(de);
      if (m) { e.de = cap(m[2]); e.dg = { der: "m", die: "f", das: "n" }[m[1]]; }
      else if (/^\S+$/.test(de) && has(GEN.de, low(de)) && GEN.de[low(de)] !== "pl") { e.de = cap(de); e.dg = GEN.de[low(de)]; }
    }
    var fr = REV("fr")[es];
    if (fr) {
      var mf = /^(le|la) (\S+)$/.exec(fr);
      if (mf) { e.fr = mf[2]; e.fg = mf[1] === "le" ? "m" : "f"; }
      else if (/^\S+$/.test(fr) && !/^l'/.test(fr) && has(GEN.fr, fr)) { e.fr = fr; e.fg = GEN.fr[fr]; }
      else if (/^l'(\S+)$/.test(fr)) { var w = fr.slice(2); if (has(GEN.fr, w)) { e.fr = w; e.fg = GEN.fr[w]; } }
    }
    return e;
  }
  function isPerson(es) { return has(C.PERSON, es); }

  var IDIOM = { vacaciones: { en: "on holiday", de: "im Urlaub", deDir: "in den Urlaub", fr: "en vacances" } };
  // ================= ENGELS =================
  var EN_SUBJ = ["I", "you", null, "we", "you", "they"], EN_OBJ = ["me", "you", null, "us", "you", "them"];
  var EN_POSS = ["my", "your", null, "our", "your", "their"];
  var EN_NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  function enA(w) { return /^(hour|honest)/i.test(w) ? "an" : (/^(uni|use|eu|one)/i.test(w) ? "a" : (/^[aeiou]/i.test(w) ? "an" : "a")); }
  function en3(g) { return g === "f" ? ["she", "her", "her"] : (g === "n" ? ["it", "it", "its"] : ["he", "him", "his"]); }
  function enPron(s, role) {
    if (s.amb && role !== "subj") return null;
    if (s.formal) return "you";
    if (s.p === 2) { if (!s.g) return null; return en3(s.g)[role === "subj" ? 0 : 1]; }
    return (role === "subj" ? EN_SUBJ : EN_OBJ)[s.p];
  }
  function enPoss(p, g, formal) { if (formal) return "your"; if (p === 2) return g ? en3(g)[2] : null; return EN_POSS[p]; }
  function enNum(n) { return n <= 12 ? EN_NUM[n] : String(n); }
  // Klok met minuten (Engels): "at half past eleven", "at quarter to twelve", "at five past eleven"
  var EN_MIN = { 5: "five", 10: "ten", 20: "twenty", 25: "twenty-five" };
  function enTime(h, m) {
    var nx = h % 12 + 1;
    if (!m) return "at " + enNum(h) + " o'clock";
    if (m === 30) return "at half past " + enNum(h);
    if (m === 15) return "at quarter past " + enNum(h);
    if (m === 45) return "at quarter to " + enNum(nx);
    if (m < 30) return "at " + EN_MIN[m] + " past " + enNum(h);
    return "at " + EN_MIN[60 - m] + " to " + enNum(nx);
  }
  // role: subj/obj; generic = bij "like": lidwoord weg bij ontelbaar of meervoud
  function enNP(np, role, generic, anyCtx) {
    if (!np) return null;
    if (np.k === "coord") { var parts = np.items.map(function (x) { return enNP(x, role, generic, anyCtx); }); if (parts.some(function (x) { return !x; })) return null; return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1]; }
    if (np.k === "pron") return enPron(np, role);
    if (np.k === "this") return np.pl ? "these" : "this";
    if (np.k === "that") return np.pl ? "those" : "that";
    if (np.k === "name") return np.s;
    if (np.k === "place") return C.PLACE[np.key].en;
    if (np.k === "lang") return C.LANG[np.key][0];
    if (np.k !== "n") return null;
    var e = nounEntry(np.n);
    if (!e.en) return null;
    var pl = np.pl || e.esPlOnly;
    var w;
    if (e.enPlOnly) w = e.en;
    else if (pl) { if (e.enMass && !np.num) w = e.en; else w = C.enPlural(e); }
    else w = e.en;
    var adjs = [];
    for (var i = 0; i < (np.adjs || []).length; i++) { var a = adjEn(np.adjs[i], false); if (!a) return null; adjs.push(a); }
    var head = (adjs.length ? adjs.join(" ") + " " : "") + w;
    if (np.of) {
      var ow = enNP(np.of, "obj");
      if (!ow) return null;
      if (np.of.k === "n" && isPerson(np.of.n) || np.of.k === "name") return (ow + (/s$/.test(ow) ? "'" : "'s")) + " " + head;
      head = head + " of " + ow;
    }
    if (np.num) return enNum(np.num) + " " + head;
    if (np.qty === "mucho") return "a lot of " + head;
    if (np.qty === "poco") return (pl ? "few " : "little ") + head;
    if (np.qty === "otro") return pl ? "other " + head : "another " + head;
    switch (np.det) {
      case "def": return (generic && (e.enMass || pl)) ? head : "the " + head;
      case "ind": if (pl) return "some " + head; if (e.enPlOnly) return head; return enA(head) + " " + head;
      case "none": if (!pl && !e.enMass && !e.enPlOnly) return null; return anyCtx && pl ? "any " + head : head;
      case "poss": var ps = enPoss(np.own, np.ownG, np.ownFormal); return ps ? ps + " " + head : null;
      case "dem": return (np.far ? (pl ? "those" : "that") : (pl ? "these" : "this")) + " " + head;
      case "neg": return "no " + head;
      case "all": return "all the " + head;
    }
    return null;
  }
  function adjEn(key, estar) {
    if (!key) return null;
    var k = key.split("#");
    if (has(C.SER_ESTAR, k[0])) return C.SER_ESTAR[k[0]][k[1] !== undefined ? +k[1] : (estar ? 1 : 0)][0];
    return has(ADJ, key) ? ADJ[key].en : null;
  }
  // werkwoordsdelen Engels
  function enBe(p, s3, tense, formal) {
    if (tense === "past") return (p === 0 || (p === 2 && !formal) || s3) ? "was" : "were";
    if (p === 0 && !s3) return "am";
    if ((p === 2 && !formal) || s3) return "is";
    return "are";
  }
  function enIsS3(s) { return (s.p === 2 && !s.formal) || s.s3; }

  // Engels: zin opbouwen
  function genEn(c) {
    var s = c.s;
    var subj = s.np ? enNP(s.np, "subj") : enPron(s, "subj");
    if (!subj && !(c.type === "wh" && c.wh === "quien" && !s.np)) return null;
    var s3 = s.np ? !s.np.pl && !(s.np.k === "n" && nounEntry(s.np.n).esPlOnly) && !(s.np.k === "n" && nounEntry(s.np.n).enPlOnly) : enIsS3(s);
    var sp = { p: s.p, s3: s3, formal: s.formal };
    var neg = c.neg, never = c.never, q = c.type !== "stmt";
    // bijwoorden
    var freq = [], tAdv = [], dAdv = [], pAdv = [], too = false;
    (c.advs || []).forEach(function (k) {
      var a = C.ADV[k]; if (!a) return;
      if (k === "también") { too = true; return; }
      if (a.k === "f") freq.push(a.en); else if (a.k === "t") tAdv.push(a.en); else if (a.k === "p") pAdv.push(a.en); else dAdv.push(a.en);
    });
    if (never) { freq.unshift("never"); neg = false; }
    if (freq.length && (neg || c.type !== "stmt")) { if (freq.indexOf("never") < 0 && neg) return null; }
    var tail = [];
    var obl = enObl(c);
    if (obl === null) return null;
    if (c.hour) tail.push(c.until ? enTime(c.hour, c.min || 0).replace(/^at /, "until ") : enTime(c.hour, c.min || 0));
    if (c.day) tail.push("on " + nounEntry(c.day.key).en + (c.day.pl ? "s" : ""));
    var endAdv = [].concat(dAdv, obl, pAdv, tail, tAdv);
    if (too) endAdv.push(neg ? "either" : "too");

    // ---- bijzondere constructies
    if (c.sp === "hay") {
      var npH = enNP(c.o, "obj"); if (!npH) return null;
      var plH = c.o.pl || (c.o.num > 1);
      var beH = c.t === "fut" ? "will be" : (c.t === "past" || c.t === "impf" ? (plH ? "were" : "was") : (plH ? "are" : "is"));
      if (neg) {
        var npN = enNP(Object.assign({}, c.o, { det: c.o.det === "def" ? "def" : "neg", num: null }), "obj");
        if (c.o.det === "def") return null;
        if (c.type === "yn") return null;
        return finish("There " + beH + " " + npN + rest(endAdv), c);
      }
      if (c.type === "yn") return finish(cap(beH) + " there " + npH + rest(endAdv) + "?", c, true);
      if (c.type === "wh") return null;
      return finish("There " + beH + " " + npH + rest(endAdv), c);
    }
    if (c.sp === "llamarse") {
      if (c.type === "wh" && c.wh === "como") {
        if (s.np) return finish("What is " + possOf(s.np) + " name?", c, true);
        var pw = enPoss(s.p, s.g, s.formal); if (!pw) return null;
        return finish("What is " + pw + " name?", c, true);
      }
      if (c.type !== "stmt" || !c.name) return null;
      if (s.np) { var pn = possOf(s.np); if (!pn) return null; return finish(cap(pn) + " name is " + c.name, c); }
      var po = enPoss(s.p, s.g, s.formal); if (!po) return null;
      return finish(cap(po) + " name " + (neg ? "is not " : "is ") + c.name, c);
    }
    if (c.sp === "gustar" || c.sp === "encantar") {
      var vb = c.sp === "gustar" ? "like" : "love";
      var objG;
      if (c.infV) {
        var vi = VERB[c.infV] && VERB[c.infV].en; if (!vi || !vi.b || vi.modal) return null;
        objG = C.enIng(vi) + (vi.obj ? " " + vi.obj : "") + (vi.tail ? " " + vi.tail : "");
        if (c.infO) { var io = enNP(c.infO, "obj"); if (!io) return null; objG += " " + io; }
        var infObl = enObl({ obl: c.infObl || [], v: c.infV });
        if (infObl === null) return null;
        if (infObl.length) objG += " " + infObl.join(" ");
      } else { objG = enNP(c.o, "obj", true); if (!objG) return null; }
      return enLex({ b: vb }, sp, subj, objG, c, neg, freq, endAdv);
    }
    if (c.sp === "tener") {
      var tn = C.TENER[c.tn]; if (!tn) return null;
      return enCop(sp, subj, tn.en, c, neg, freq, endAdv);
    }
    if (c.sp === "edad") {
      if (c.type !== "stmt") return null;
      return enCop(sp, subj, enNum(c.age) + " years old", c, neg, freq, endAdv);
    }
    if (c.sp === "origen" || (c.v === "venir" && c.from)) {
      var fr = enNP(c.from, "obj"); if (!fr) return null;
      if (c.type === "wh" && c.wh === "dedonde") {
        if (c.v === "venir") return enQ("where", { b: "come" }, sp, subj, " from", c);
        return finish("Where " + enBe(sp.p, sp.s3, tenseBe(c.t), sp.formal) + " " + subj + " from?", c, true);
      }
      if (c.v === "venir") return enLex({ b: "come", past: "came" }, sp, subj, "from " + fr, c, neg, freq, endAdv);
      return enCop(sp, subj, "from " + fr, c, neg, freq, endAdv);
    }
    if (c.type === "wh" && c.wh === "dedonde") {
      if (c.v === "venir") return enQ("where", { b: "come" }, sp, subj, " from", c);
      if (c.v === "ser") return finish("Where " + enBe(sp.p, sp.s3, tenseBe(c.t), sp.formal) + " " + subj + " from?", c, true);
      return null;
    }
    // ---- ser / estar
    if (c.v === "ser" || c.v === "estar") {
      if (c.mod) return null;
      var pr = enPred(c, s);
      if (pr === null) return null;
      if (c.type === "wh") {
        var whw = EN_WH[c.wh]; if (!whw) return null;
        if (c.wh === "quien" && !s.np && !c.whNP) return null;
        if (c.whNP) return null;
        var beq = enBe(sp.p, sp.s3, tenseBe(c.t), sp.formal);
        if (c.wh === "donde" && !pr) return finish(cap(whw) + " " + beq + " " + subj + rest(endAdv) + "?", c, true);
        if (c.wh === "como" && !pr) return finish("How " + beq + " " + subj + rest(endAdv) + "?", c, true);
        if (c.wh === "que" && !pr) return finish("What " + beq + " " + subj + rest(endAdv) + "?", c, true);
        if (c.wh === "cuando" && !pr) return finish("When " + beq + " " + subj + rest(endAdv) + "?", c, true);
        if (pr && (c.wh === "porque" || c.wh === "cuando" || c.wh === "donde")) return finish(cap(whw) + " " + beq + " " + subj + " " + pr + rest(endAdv) + "?", c, true);
        return null;
      }
      if (c.t === "perf") return null;
      return enCop(sp, subj, pr + (endAdv.length ? "" : ""), c, neg, freq, endAdv);
    }
    // ---- gewone werkwoorden, met of zonder modaal werkwoord
    var lemma = c.v, ve = VERB[lemma] && VERB[lemma].en;
    if (!ve || ve.special) return null;
    if (lemma === "irse" && (c.obl || []).some(function (x) { return x.prep === "idiom"; })) ve = { b: "go", s3: "goes", past: "went", ing: "going", prog: true };
    if (lemma === "tomar" && ((c.o && c.o.k === "n" && NOUN[c.o.n] && NOUN[c.o.n].enMass) || (!c.o && c.type === "wh" && c.wh === "que"))) ve = { b: "have", s3: "has", past: "had", ing: "having" };
    var objS = "";
    if (c.o) { objS = enNP(c.o, "obj", false, c.neg || c.type === "yn"); if (!objS) return null; }
    if (c.io && c.io.np) { var ioN = enNP(c.io.np, "obj"); if (!ioN || !c.o) return null; objS = (objS || "") + " to " + ioN; } else if (c.io) { var ioE = enPron(c.io, "obj"); if (!ioE || (!c.o && c.v !== "decir")) return null; objS = (c.o && c.o.k === "pron") ? (objS + " to " + ioE) : (ioE + " " + (objS || "")).trim(); }
    if (c.lng) objS = C.LANG[c.lng][0];
    var vbody = function (form) {
      var parts = [form];
      if (ve.obj && objS) parts.push(ve.obj);
      if (objS) parts.push(objS);
      if (ve.tail) parts.push(ve.tail);
      return parts.join(" ");
    };
    // Engelse tegenwoordige tijd: bij "gaan" met een bestemming liever de duurvorm
    var prog = c.t === "prog" || (c.t === "pres" && !c.mod && (ve.prog || (lemma === "ir" && (c.obl || []).length)) && !freq.length && !c.day);
    // Modaal werkwoord zonder infinitief ("Puedo." = "I can."): alleen het modaal werkwoord, geen lege infinitief
    if (ve.modal && sp.p === 0 && !c.infV && !c.mod && !c.o && c.type === "stmt" && !neg && !freq.length && !(endAdv && endAdv.length)) {
      var bmf = (c.t === "past" || c.t === "impf") ? ve.past : ve.modal;
      if (bmf) return finish(subj + " " + bmf + ".", c);
    }
    if (c.mod) return enModal(c, sp, subj, ve, vbody, neg, freq, endAdv);
    if (c.t === "fut") return enAux(sp, subj, enBe(sp.p, sp.s3, "pres", sp.formal) + (neg ? " not" : ""), "going to " + vbody(ve.b), c, freq, endAdv, true);
    if (prog) return enAux(sp, subj, enBe(sp.p, sp.s3, "pres", sp.formal) + (neg ? " not" : ""), vbody(C.enIng(ve)), c, freq, endAdv, true);
    if (c.t === "perf") return enAux(sp, subj, (sp.s3 ? "has" : "have") + (neg ? " not" : ""), vbody(C.enPPf(ve)), c, freq, endAdv, true);
    if (c.t === "impf") return null;
    return enLex(ve, sp, subj, objS, c, neg, freq, endAdv, vbody);
  }
  function tenseBe(t) { return t === "past" || t === "impf" ? "past" : "pres"; }
  var EN_WH = { que: "what", donde: "where", cuando: "when", como: "how", quien: "who", porque: "why", cual: "which", adonde: "where", cuanto: "how much" };
  function possOf(np) { var w = enNP(np, "obj"); if (!w) return null; return w + (/s$/.test(w) ? "'" : "'s"); }
  function rest(arr) { return arr.length ? " " + arr.join(" ") : ""; }
  function finish(s, c, isQ) {
    var out = s.replace(/\s+/g, " ").trim();
    if (c.intj) out = c.intj.en + ", " + out;
    if (c.please) out = out.replace(/[?.]?$/, "") + ", please";
    out = cap(out);
    if (!/[?.!]$/.test(out)) out += isQ || c.type !== "stmt" ? "?" : ".";
    return out;
  }
  function enCop(sp, subj, pred, c, neg, freq, endAdv) {
    var t = tenseBe(c.t);
    if (c.t === "fut") return enAux(sp, subj, enBe(sp.p, sp.s3, "pres", sp.formal) + (neg ? " not" : ""), "going to be " + pred, c, freq, endAdv, true);
    var be = enBe(sp.p, sp.s3, t, sp.formal);
    if (c.type === "yn") return finish(cap(be) + " " + subj + (neg ? " not" : "") + (freq.length ? " " + freq.join(" ") : "") + " " + pred + rest(endAdv) + "?", c, true);
    if (c.type === "wh") {
      var w = EN_WH[c.wh]; if (!w || c.wh === "que" || c.wh === "quien" || c.wh === "cual") return null;
      return finish(cap(w) + " " + be + " " + subj + " " + pred + rest(endAdv) + "?", c, true);
    }
    var bf = be + (neg ? " not" : "");
    if (subj === "I" && be === "am" && neg) bf = "am not";
    return finish(subj + " " + bf + (freq.length ? " " + freq.join(" ") : "") + " " + pred + rest(endAdv), c);
  }
  function enAux(sp, subj, aux, main, c, freq, endAdv) {
    var aw = aux.split(" ");
    if (c.type === "yn") return finish(cap(aw[0]) + " " + subj + (aw[1] ? " " + aw[1] : "") + (freq.length ? " " + freq.join(" ") : "") + " " + main + rest(endAdv) + "?", c, true);
    if (c.type === "wh") return enWhAux(c, sp, subj, aw, main, freq, endAdv);
    return finish(subj + " " + aux + (freq.length ? " " + freq.join(" ") : "") + " " + main + rest(endAdv), c);
  }
  function enWhAux(c, sp, subj, aw, main, freq, endAdv) {
    var w = EN_WH[c.wh]; if (!w) return null;
    if (c.whNP) { var wn = enWhNP(c); if (!wn) return null; w = wn; }
    if (c.wh === "quien" && !c.s.np && c.s.p === 2) return null;
    if (c.wh === "que" && c.o) return null;
    return finish(cap(w) + " " + aw[0] + " " + subj + (aw[1] ? " " + aw[1] : "") + (freq.length ? " " + freq.join(" ") : "") + " " + main + rest(endAdv) + "?", c, true);
  }
  function enWhNP(c) {
    var np = c.whNP; var e = nounEntry(np.n); if (!e.en) return null;
    if (c.wh === "cuanto" && np.n === "tiempo" && !np.pl) return "how long";
    if (c.wh === "cuanto") return (np.pl ? "how many " + C.enPlural(e) : (e.enMass ? "how much " + e.en : null));
    if (c.wh === "que" || c.wh === "cual") return "which " + (np.pl ? C.enPlural(e) : e.en);
    return null;
  }
  // gewone werkwoorden: do-omschrijving bij vraag en ontkenning
  function enLex(ve, sp, subj, objS, c, neg, freq, endAdv, vbody) {
    vbody = vbody || function (f) { return f + (objS ? " " + objS : ""); };
    var past = c.t === "past";
    var doF = past ? "did" : (sp.s3 ? "does" : "do");
    if (c.type === "yn") return finish(cap(doF) + " " + subj + (neg ? " not" : "") + (freq.length ? " " + freq.join(" ") : "") + " " + vbody(ve.b) + rest(endAdv) + "?", c, true);
    if (c.type === "wh") {
      if (c.wh === "quien" && !c.s.np && !c.s.pron && c.s.p === 2) {
        if (neg) return null;
        return finish("Who " + vbody(past ? C.enPast(ve) : C.enS3(ve)) + rest(endAdv) + "?", c, true);
      }
      return enWhAux(c, sp, subj, [doF + (neg ? " not" : "")], vbody(ve.b), freq, endAdv);
    }
    if (neg) return finish(subj + " " + (doF === "do" ? "don't" : doF === "does" ? "doesn't" : "didn't") + (freq.length ? " " + freq.join(" ") : "") + " " + vbody(ve.b) + rest(endAdv), c);
    var form = past ? C.enPast(ve) : (sp.s3 ? C.enS3(ve) : ve.b);
    return finish(subj + (freq.length ? " " + freq.join(" ") : "") + " " + vbody(form) + rest(endAdv), c);
  }
  function enModal(c, sp, subj, ve, vbody, neg, freq, endAdv) {
    var m = c.mod, me = VERB[m] && VERB[m].en;
    if (!me) return null;
    if (c.t === "fut" || c.t === "perf") return null;
    var past = c.t === "past" || c.t === "impf";
    if (me.modal) {
      if (past && !me.past) return null;
      var mf = past ? me.past : me.modal;
      var nf = mf === "can" ? "can't" : mf === "could" ? "couldn't" : mf + " not";
      if (c.type === "yn") return finish(cap(mf) + " " + subj + (neg ? " not" : "") + (freq.length ? " " + freq.join(" ") : "") + " " + vbody(ve.b) + rest(endAdv) + "?", c, true);
      if (c.type === "wh") return enWhAux(c, sp, subj, [mf + (neg ? " not" : "")], vbody(ve.b), freq, endAdv);
      return finish(subj + " " + (neg ? nf : mf) + (freq.length ? " " + freq.join(" ") : "") + " " + vbody(ve.b) + rest(endAdv), c);
    }
    // want to / have to / need to: als gewoon werkwoord + "to" + infinitief
    var to = function () { return "to " + vbody(ve.b); };
    return enLex(me, sp, subj, "", c, neg, freq, endAdv, function (f) { return f + " " + to(); });
  }
  function enQ(w, ve, sp, subj, after, c) {
    var doF = c.t === "past" ? "did" : (sp.s3 ? "does" : "do");
    return finish(cap(w) + " " + doF + " " + subj + " " + ve.b + after + "?", c, true);
  }
  // predicaat bij ser/estar
  function enPred(c, s) {
    var p = c.pred; if (!p) return "";
    var deg = p.deg === "muy" ? "very " : (p.deg === "bastante" ? "quite " : (p.deg === "demasiado" ? "too " : ""));
    if (p.t === "adj") { var a = adjEn(p.a, c.v === "estar"); return a ? deg + a : null; }
    if (p.t === "nat") return C.NAT[p.key].en;
    if (p.t === "idiom") return IDIOM[p.key].en;
    if (p.t === "np") {
      var np = p.np;
      if (np.k === "n" && np.det === "none" && !np.pl) {
        var e = nounEntry(np.n); if (!e.en) return null;
        var adjs = (np.adjs || []).map(function (k) { return adjEn(k, false); });
        if (adjs.some(function (x) { return !x; })) return null;
        var hw = (adjs.length ? adjs.join(" ") + " " : "") + e.en;
        return e.enMass ? hw : enA(hw) + " " + hw;
      }
      return enNP(np, "obj");
    }
    if (p.t === "loc") { var o = enObl({ obl: [p.pp], v: "estar" }); return o && o.length ? o.join(" ") : null; }
    return null;
  }
  // voorzetselgroepen Engels
  var EN_AT = { playa: "at the beach", "estación": "at the station", trabajo: "at work", escuela: "at school", colegio: "at school",
    universidad: "at university", aeropuerto: "at the airport", fiesta: "at the party" };
  var EN_TO = { casa: "home", trabajo: "to work", escuela: "to school", colegio: "to school", universidad: "to university", cama: "to bed" };
  var EN_BY = { tren: "by train", "autobús": "by bus", coche: "by car", "avión": "by plane", bici: "by bike", bicicleta: "by bike", metro: "by underground", taxi: "by taxi", barco: "by boat" };
  var MOTION = { ir: 1, venir: 1, volver: 1, regresar: 1, viajar: 1, llegar: 1, salir: 1, caminar: 1, correr: 1, conducir: 1, acostarse: 1, mudarse: 1 };
  function enObl(c) {
    var out = [], late = [];
    var obl = c.obl || [];
    for (var i = 0; i < obl.length; i++) {
      var pp = obl[i], np = pp.np, r = null;
      if (pp.prep === "idiom") { out.push(IDIOM[pp.key].en); continue; }
      if (C.GENP[pp.prep]) { var wgp = enNP(np, "obj"); if (!wgp) return null; late.push(C.GENP[pp.prep].en + " " + wgp); continue; }
      if (C.PV[c.v] && pp.prep === C.PV[c.v].es) { var wpv = enNP(np, "obj"); if (!wpv) return null; out.push((C.PV[c.v].en ? C.PV[c.v].en + " " : "") + wpv); continue; }
      var bare = np.k === "n" && np.det === "def" && !np.pl && !(np.adjs || []).length && !np.of;
      if (pp.prep === "en" && np.k === "n" && np.det === "none" && has(EN_BY, np.n)) r = EN_BY[np.n];
      else if (pp.prep === "a" && MOTION[c.v]) {
        if (np.k === "n" && np.n === "casa" && np.det === "none") r = "home";
        else if (bare && has(EN_TO, np.n) && np.n !== "casa") r = EN_TO[np.n];
        else if (c.v === "llegar") { var w1 = enNP(np, "obj"); r = w1 ? (np.k === "place" ? "in " : "at ") + w1 : null; }
        else { var w2 = enNP(np, "obj"); r = w2 ? "to " + w2 : null; }
      } else if (pp.prep === "en" && c.v === "pensar") {
        var wp = enNP(np, "obj"); r = wp ? "about " + wp : null;
      } else if (pp.prep === "en") {
        if (np.k === "n" && np.n === "casa" && np.det === "none") r = "at home";
        else if (bare && has(EN_AT, np.n)) r = EN_AT[np.n];
        else { var w3 = enNP(np, "obj"); r = w3 ? "in " + w3 : null; }
      } else {
        var map = { con: "with", para: "for", sin: "without", de: "from", desde: "from", hasta: "until", sobre: "about", a: "to", por: null, cerca: "near" };
        var pr = map[pp.prep]; if (!pr) return null;
        var w4 = enNP(np, "obj"); r = w4 ? pr + " " + w4 : null;
        if (pp.prep === "con" && c.v === "hablar") r = w4 ? "to " + w4 : null;
      }
      if (!r) return null;
      out.push(r);
    }
    return out.concat(late);
  }

  // ================= DUITS =================
  var DE_P = { nom: ["ich", "du", null, "wir", "ihr", "sie"], acc: ["mich", "dich", null, "uns", "euch", "sie"], dat: ["mir", "dir", null, "uns", "euch", "ihnen"] };
  var DE_3 = { m: { nom: "er", acc: "ihn", dat: "ihm" }, f: { nom: "sie", acc: "sie", dat: "ihr" }, n: { nom: "es", acc: "es", dat: "ihm" } };
  var DE_REFL = ["mich", "dich", "sich", "uns", "euch", "sich"];
  var DEF = { nom: { m: "der", f: "die", n: "das", pl: "die" }, acc: { m: "den", f: "die", n: "das", pl: "die" }, dat: { m: "dem", f: "der", n: "dem", pl: "den" } };
  var EINE = { nom: { m: "", f: "e", n: "", pl: "e" }, acc: { m: "en", f: "e", n: "", pl: "e" }, dat: { m: "em", f: "er", n: "em", pl: "en" } };
  var GEN_DEF = { m: "des", f: "der", n: "des", pl: "der" }, GEN_END = { m: "es", f: "er", n: "es", pl: "er" };
  var DIES = { nom: { m: "er", f: "e", n: "es", pl: "e" }, acc: { m: "en", f: "e", n: "es", pl: "e" }, dat: { m: "em", f: "er", n: "em", pl: "en" } };
  var ADJ_WEAK = { nom: { m: "e", f: "e", n: "e", pl: "en" }, acc: { m: "en", f: "e", n: "e", pl: "en" }, dat: { m: "en", f: "en", n: "en", pl: "en" } };
  var ADJ_MIX = { nom: { m: "er", f: "e", n: "es", pl: "en" }, acc: { m: "en", f: "e", n: "es", pl: "en" }, dat: { m: "en", f: "en", n: "en", pl: "en" } };
  var ADJ_STR = { nom: { m: "er", f: "e", n: "es", pl: "e" }, acc: { m: "en", f: "e", n: "es", pl: "e" }, dat: { m: "em", f: "er", n: "em", pl: "en" } };
  var DE_POSS = ["mein", "dein", null, "unser", "euer", "ihr"];
  var DE_WEAK = { Student: "Studenten", Junge: "Jungen", Kollege: "Kollegen", Nachbar: "Nachbarn", Herr: "Herrn", Mensch: "Menschen", Name: "Namen", Franzose: "Franzosen", Kunde: "Kunden" };
  var DE_NUM = ["null", "ein", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf"];
  function deNumW(n) { return n <= 12 ? DE_NUM[n] : String(n); }
  // Klok met minuten (Duits): "um halb zwölf", "um Viertel nach elf", "um fünf vor zwölf"
  var DE_MIN = { 5: "fünf", 10: "zehn", 20: "zwanzig" };
  function deHr(n) { return deNumW(n).replace(/^ein$/, "eins"); }
  function deTime(h, m) {
    var nx = h % 12 + 1;
    if (!m) return "um " + (h === 1 ? "ein" : deHr(h)) + " Uhr";   // um ein Uhr (maar: halb eins)
    if (m === 30) return "um halb " + deHr(nx);
    if (m === 15) return "um Viertel nach " + deHr(h);
    if (m === 45) return "um Viertel vor " + deHr(nx);
    if (m === 25) return "um fünf vor halb " + deHr(nx);
    if (m === 35) return "um fünf nach halb " + deHr(nx);
    if (m < 30) return "um " + DE_MIN[m] + " nach " + deHr(h);
    return "um " + DE_MIN[60 - m] + " vor " + deHr(nx);
  }
  function dePron(s, cas) {
    if (s.amb && s.g === "m") return null;
    if (s.formal) return cas === "nom" || cas === "acc" ? "Sie" : "Ihnen";
    if (s.p === 2) { if (!s.g) return null; return DE_3[s.g][cas]; }
    return DE_P[cas][s.p];
  }
  function dePossStem(p, g, formal) { if (formal) return "Ihr"; if (p === 2) return g === "f" ? "ihr" : (g ? "sein" : null); return DE_POSS[p]; }
  function deAdjForm(key) {
    var k = key.split("#");
    if (has(C.SER_ESTAR, k[0])) return C.SER_ESTAR[k[0]][k[1] !== undefined ? +k[1] : 0][1];
    return has(ADJ, key) ? ADJ[key].de : null;
  }
  // NP in het Duits; cas: nom/acc/dat; neg: kein- gebruiken
  function deNP(np, cas, neg) {
    if (!np) return null;
    if (np.k === "coord") { if (neg) return null; var parts = np.items.map(function (x) { return deNP(x, cas); }); if (parts.some(function (x) { return !x; })) return null; return parts.slice(0, -1).join(", ") + " und " + parts[parts.length - 1]; }
    if (np.k === "pron") return dePron(np, cas === "gen" ? "dat" : cas);
    if (np.k === "this" || np.k === "that") return cas === "gen" ? "dieses" : (cas === "dat" ? "dem" : "das");
    if (np.k === "name") return np.s;
    if (np.k === "place") { var pl = C.PLACE[np.key].de; if (/^die /.test(pl) && cas === "dat") return (C.PLACE[np.key].ft === "pl" ? "den " + pl.slice(4) + "n" : "der " + pl.slice(4)); return pl; }
    if (np.k === "lang") return C.LANG[np.key][1];
    if (np.k !== "n") return null;
    var e = nounEntry(np.n);
    if (!e.de || !e.dg) return null;
    var plur = np.pl || e.esPlOnly || e.dg === "pl";
    if (plur && !np.num && e.enMass && e.dg !== "pl" && !e.dePl) plur = false;
    var g = plur ? "pl" : e.dg;
    var w = plur ? (e.dg === "pl" ? e.de : e.dePl) : e.de;
    if (!w) return null;
    if (plur && cas === "dat" && !/[ns]$/.test(w)) w = w + "n";
    if (!plur && cas !== "nom" && has(DE_WEAK, w)) w = DE_WEAK[w];
    if (cas === "gen" && !plur) {
      if (has(DE_WEAK, w)) { /* zwak: Studenten */ }
      else if (g === "m" || g === "n") w = w + ((/(s|ß|x|z|sch|tz)$/.test(w) || (w.match(/[aeiouäöüy]+/gi) || []).length <= 1) ? "es" : "s");
    }
    var det = "", adjT = ADJ_STR;
    if (np.num && cas !== "gen") { det = np.num === 1 ? "ein" + EINE[cas][g] : deNumW(np.num); adjT = np.num === 1 ? ADJ_MIX : ADJ_STR; }
    else if (np.qty === "mucho" && cas !== "gen") { det = plur ? "viel" + ADJ_STR[cas].pl : "viel"; adjT = ADJ_STR; }
    else if (np.qty === "poco" && cas !== "gen") { det = plur ? "wenig" + ADJ_STR[cas].pl : "wenig"; adjT = ADJ_STR; }
    else if (cas === "gen") { det = null; }
    else if (neg && (np.det === "ind" || np.det === "none")) { det = "kein" + EINE[cas][g]; adjT = ADJ_MIX; }
    else if (np.det === "def") { det = DEF[cas][g]; adjT = ADJ_WEAK; }
    else if (np.det === "ind") { if (plur) det = ""; else { det = "ein" + EINE[cas][g]; adjT = ADJ_MIX; } }
    else if (np.det === "none") det = "";
    else if (np.det === "neg") { det = "kein" + EINE[cas][g]; adjT = ADJ_MIX; }
    else if (np.det === "poss") {
      var st = dePossStem(np.own, np.ownG, np.ownFormal); if (!st) return null;
      var en = EINE[cas][g];
      if (st === "euer" && en) st = "eur";
      det = st + en; adjT = ADJ_MIX;
    } else if (np.det === "dem") { det = "dies" + DIES[cas][g]; adjT = ADJ_WEAK; }
    else if (np.det === "all") { det = "all" + DIES[cas][g === "pl" ? "pl" : g]; adjT = ADJ_WEAK; }
    else if (cas !== "gen") return null;
    if (cas === "gen") {
      var gE = GEN_END[g];
      if (np.num) { det = np.num === 1 ? "ein" + gE : deNumW(np.num); adjT = np.num === 1 ? "MIXG" : "STRG"; }
      else if (np.det === "def") { det = GEN_DEF[g]; adjT = "WEAKG"; }
      else if (np.det === "ind") { if (plur) det = ""; else { det = "ein" + gE; adjT = "MIXG"; } }
      else if (np.det === "none") { det = ""; adjT = "STRG"; }
      else if (np.det === "neg") { det = "kein" + gE; adjT = "MIXG"; }
      else if (np.det === "poss") { var stg = dePossStem(np.own, np.ownG, np.ownFormal); if (!stg) return null; if (stg === "euer") stg = "eur"; det = stg + gE; adjT = "MIXG"; }
      else if (np.det === "dem") { det = "dies" + gE; adjT = "WEAKG"; }
      else return null;
    }
    var adjs = [];
    for (var i = 0; i < (np.adjs || []).length; i++) {
      var a = deAdjForm(np.adjs[i]); if (!a) return null;
      if (cas === "gen") { var ge = (adjT === "STRG") ? (g === "f" || g === "pl" ? "er" : "en") : "en"; adjs.push(C.deAdjStem(a) + ge); continue; }
      var end = (adjT === ADJ_MIX && (det === "" )) ? ADJ_STR[cas][g] : adjT[cas][g];
      if (adjT === ADJ_MIX && !det) end = ADJ_STR[cas][g];
      adjs.push(C.deAdjStem(a) + end);
    }
    var out = (det ? det + " " : "") + (adjs.length ? adjs.join(" ") + " " : "") + w;
    if (np.of) { var of = deNP(np.of, "dat"); if (!of) return null; out += " von " + of; }
    return deContr(out);
  }
  function deContr(s) { return s; }
  function deIsIndef(np) { return np && np.k === "n" && (np.det === "ind" || np.det === "none") && !np.num && !np.qty; }
  // voorzetsels Duits: geeft "voorzetsel + NP" met samentrekking
  var DE_LOC = { playa: "an", mar: "an", "estación": "an", aeropuerto: "an", trabajo: "auf", fiesta: "auf", mercado: "auf" };
  var DE_DIRIN = { cine: 1, restaurante: 1, museo: 1, bar: 1, piscina: 1, ciudad: 1, supermercado: 1, oficina: 1, parque: 1, hotel: 1,
    "habitación": 1, cocina: 1, cama: 1, tienda: 1, "jardín": 1, gimnasio: 1, biblioteca: 1, centro: 1, iglesia: 1, escuela: 1, colegio: 1, "baño": 1, montaña: 0 };
  var DE_BY = { tren: "Zug", "autobús": "Bus", coche: "Auto", "avión": "Flugzeug", bici: "Fahrrad", bicicleta: "Fahrrad", metro: "U-Bahn", taxi: "Taxi", barco: "Boot" };
  function dePP(prep, np, cas) {
    var o = deNP(np, cas); if (!o) return null;
    var s = (prep ? prep + " " : "") + o;
    s = s.replace(/^in dem /, "im ").replace(/^in das /, "ins ").replace(/^an dem /, "am ").replace(/^an das /, "ans ")
      .replace(/^zu dem /, "zum ").replace(/^zu der /, "zur ").replace(/^von dem /, "vom ").replace(/^bei dem /, "beim ");
    return s;
  }
  function deObl(c) {
    var out = [], manner = [];
    var obl = c.obl || [];
    for (var i = 0; i < obl.length; i++) {
      var pp = obl[i], np = pp.np, r = null;
      if (pp.prep === "idiom") { out.push(MOTION[c.v] || c.v === "irse" ? IDIOM[pp.key].deDir : IDIOM[pp.key].de); continue; }
      if (C.GENP[pp.prep]) { var rgp = dePP(C.GENP[pp.prep].de, np, "gen"); if (!rgp) return null; manner.push(rgp); continue; }
      if (C.PV[c.v] && C.PV[c.v].de && pp.prep === C.PV[c.v].es) { var rpv = dePP(C.PV[c.v].de[0], np, C.PV[c.v].de[1]); if (!rpv) return null; out.push(rpv); continue; }
      if (pp.prep === "en" && c.v === "pensar") { var rpn = dePP("an", np, "acc"); if (!rpn) return null; out.push(rpn); continue; }
      if (pp.prep === "en" && c.v === "sentarse") { var rsn = dePP("auf", np, "acc"); if (!rsn) return null; out.push(rsn); continue; }
      if (pp.prep === "con") { var rc = dePP("mit", np, "dat"); if (!rc) return null; manner.push(rc); continue; }
      if (pp.prep === "en" && np.k === "n" && np.det === "none" && has(DE_BY, np.n)) {
        var bn = deNP({ k: "n", n: np.n, det: "def" }, "dat"); r = bn ? dePP("mit", { k: "n", n: np.n, det: "def" }, "dat") : null;
        if (r) { manner.push(r); continue; }
      } else if (pp.prep === "a" && MOTION[c.v]) {
        if (np.k === "n" && np.n === "casa" && np.det === "none") r = "nach Hause";
        else if (np.k === "place") r = /^die /.test(C.PLACE[np.key].de) ? "in " + C.PLACE[np.key].de : "nach " + C.PLACE[np.key].de;
        else if (np.k === "n" && isPerson(np.n)) r = dePP("zu", np, "dat");
        else if (np.k === "n" && DE_LOC[np.n] === "an") r = dePP("an", np, "acc");
        else if (np.k === "n" && DE_DIRIN[np.n]) r = dePP("in", np, "acc");
        else if (np.k === "n" && c.v !== "llegar") r = dePP("zu", np, "dat");
        else if (np.k === "n" && c.v === "llegar") r = dePP("in", np, "dat");
      } else if (pp.prep === "en") {
        if (np.k === "n" && np.n === "casa" && np.det === "none") r = "zu Hause";
        else if (np.k === "place") r = "in " + deNP(np, "dat");
        else if (np.k === "n") r = dePP(DE_LOC[np.n] || "in", np, "dat");
      } else {
        var map = { con: ["mit", "dat"], para: ["für", "acc"], sin: ["ohne", "acc"], de: ["aus", "dat"], sobre: ["über", "acc"], hasta: ["bis", "acc"], cerca: ["von", "dat"] };
        var m = map[pp.prep]; if (!m) return null;
        if (pp.prep === "de" && np.k === "n" && isPerson(np.n)) m = ["von", "dat"];
        // "de casa" zonder lidwoord: "aus dem Haus" (niet "aus Haus")
        if (pp.prep === "de" && np.k === "n" && np.n === "casa" && np.det === "none") r = "aus dem Haus";
        else r = dePP(m[0], np, m[1]);
        // "cerca de la estación" = in der Nähe des Bahnhofs; spreektaal: "in der Nähe vom Bahnhof" / "von der Kirche"
        if (r && pp.prep === "cerca") r = "in der Nähe " + r.replace(/^von dem /, "vom ");
      }
      if (!r) return null;
      out.push(r);
    }
    return manner.concat(out);
  }
  var DE_FAHREN = { inf: "fahren", pres: "fahre fährst fährt fahren fahrt fahren", pp: "gefahren", aux: "s" };
  function deUsesFahren(c) {
    return (c.obl || []).some(function (pp) { return (pp.prep === "a" && pp.np.k === "place") || (pp.prep === "en" && pp.np.k === "n" && pp.np.det === "none" && has(DE_BY, pp.np.n)); });
  }
  function deVfin(dv, p, tense) {
    if (tense === "pres") return C.dePres(dv, p);
    return null;
  }
  // Duits: zin opbouwen (V2, werkwoordelijk eind)
  function genDe(c) {
    var s = c.s, pp = C.persFor("de", s);
    var subj = s.np ? deNP(s.np, "nom") : dePron(s, "nom");
    var isWhoSubj = c.type === "wh" && c.wh === "quien" && !s.np && !s.pron && s.p === 2;
    if (!subj && !isWhoSubj) return null;
    if (s.np) pp = s.np.pl || (s.np.k === "n" && nounEntry(s.np.n).dg === "pl") ? 5 : 2;
    var neg = c.neg, never = c.never;
    var tAdv = [], fAdv = [], dAdv = [], pAdv = [], auch = false;
    (c.advs || []).forEach(function (k) {
      var a = C.ADV[k]; if (!a) return;
      if (k === "también") { auch = true; return; }
      if (a.k === "t") tAdv.push(a.de); else if (a.k === "f") fAdv.push(a.de); else if (a.k === "p") pAdv.push(a.de); else dAdv.push(a.de);
    });
    if (c.hour) tAdv.push(c.until ? deTime(c.hour, c.min || 0).replace(/^um /, "bis ") : deTime(c.hour, c.min || 0));
    if (c.day) { var de = nounEntry(c.day.key).de; tAdv.push(c.day.pl ? low(de) + "s" : "am " + de); }
    var obl = deObl(c); if (obl === null) return null;
    var negW = never ? "nie" : (neg ? "nicht" : null);

    var D = { fin: null, refl: null, pron: null, defObj: null, indefObj: null, pred: null, tail: null, end: null, gern: null };
    var tenseF = c.t;
    // ---- bijzondere constructies
    if (c.sp === "hay") {
      var useKein = neg && !never && deIsIndef(c.o);
      var o = deNP(c.o, "acc", useKein); if (!o) return null;
      if (neg && !useKein && !never) return null;
      var gibt = c.t === "fut" ? "geben" : ((c.t === "past" || c.t === "impf") ? "gab" : "gibt");
      if (c.t === "fut") {
        if (c.type === "yn") return finDe("Wird es " + mid([].concat(tAdv), never ? "nie" : null, [o], obl, pAdv) + " geben?", c);
        if (c.type === "wh") return null;
        return finDe("Es wird " + mid(tAdv, never ? "nie" : null, [o], obl, pAdv) + " geben", c);
      }
      if (c.type === "yn") return finDe(cap(gibt) + " es " + mid([].concat(tAdv), never ? "nie" : null, [o], obl, pAdv) + "?", c);
      if (c.type === "wh") return null;
      return finDe("Es " + gibt + " " + mid(tAdv, never ? "nie" : null, [o], obl, pAdv), c);
    }
    if (c.sp === "llamarse") {
      var hp = C.dePres(VERB.llamarse.de, pp);
      if (c.type === "wh" && c.wh === "como") return finDe("Wie " + hp + " " + subj + "?", c);
      if (c.type !== "stmt" || !c.name) return null;
      return finDe(subj + " " + hp + (neg ? " nicht" : "") + " " + c.name, c);
    }
    if (c.sp === "tener") {
      var tn = C.TENER[c.tn]; if (!tn) return null;
      var kind = tn.de.slice(0, 1), word = tn.de.slice(2);
      if (kind === "d") {
        var dp = dePron(s, "dat"); if (s.np) return null; if (!dp) return null;
        var ist = (c.t === "past" || c.t === "impf") ? "war" : "ist";
        if (c.type === "yn") return finDe(cap(ist) + " " + dp + (neg ? " nicht" : "") + " " + word + "?", c);
        if (c.type !== "stmt") return null;
        return finDe(dp + " " + ist + (neg ? " nicht" : "") + " " + word, c);
      }
      if (kind === "a") return deClause(c, subj, pp, VERB.ser.de, { pred: word }, negW, tAdv, fAdv, dAdv, pAdv, obl, auch);
      // haben + zelfstandig naamwoord (Hunger, Durst, Angst, Recht, es eilig)
      var obj;
      if (neg && !never && /^(Hunger|Durst|Angst)$/.test(word)) { obj = (word === "Angst" ? "keine " : "keinen ") + word; negW = null; }
      else obj = word;
      return deClause(c, subj, pp, VERB.tener.de, { indefObj: obj }, negW, tAdv, fAdv, dAdv, pAdv, obl, auch);
    }
    if (c.sp === "edad") {
      if (c.type !== "stmt") return null;
      return deClause(c, subj, pp, VERB.ser.de, { pred: deNumW(c.age).replace(/^ein$/, "eins") + " Jahre alt" }, negW, tAdv, fAdv, dAdv, pAdv, obl, auch);
    }
    if (c.sp === "gustar" || c.sp === "encantar") {
      if (c.infV) {
        var dv = VERB[c.infV] && VERB[c.infV].de; if (!dv || dv.modal) return null;
        var cc = Object.assign({}, c, { v: c.infV, o: c.infO || null, obl: c.infObl || [], sp: null });
        var oblI = deObl(cc); if (oblI === null) return null;
        return deVerbClause(cc, subj, pp, dv, negW, tAdv, fAdv, dAdv, pAdv, oblI, auch, c.sp === "gustar" ? "gern" : "sehr gern");
      }
      var mv = c.sp === "gustar" ? VERB.gustar.de : VERB.encantar.de;
      var oG = genericDe(c.o); var ob = deNP(oG, "acc", neg && deIsIndef(oG) && !never);
      if (!ob) return null;
      var isK = neg && deIsIndef(oG) && !never;
      var part = (oG.det === "def" || oG.det === "poss" || oG.det === "dem" || oG.k !== "n") ? { defObj: ob } : { indefObj: ob };
      return deClause(c, subj, pp, mv, part, isK ? null : negW, tAdv, fAdv, dAdv, pAdv, obl, auch);
    }
    if (c.sp === "origen" || (c.v === "venir" && c.from) || (c.type === "wh" && c.wh === "dedonde")) {
      if (c.type === "wh") {
        if (c.wh !== "dedonde") return null;
        return finDe("Woher " + C.dePres(VERB.venir.de, pp) + " " + subj + "?", c);
      }
      var fr = dePP("aus", c.from, "dat"); if (!fr) return null;
      return deClause(c, subj, pp, VERB.venir.de, { pred: fr }, negW, tAdv, fAdv, dAdv, pAdv, obl, auch);
    }
    if (c.v === "ser" || c.v === "estar") {
      if (c.mod) return null;
      var pr = dePred(c, neg && !never);
      if (pr === null) return null;
      if (pr.kein) negW = null;
      if (c.type === "wh") {
        var ww = DE_WH[c.wh]; if (!ww || c.whNP || (pr.s && !/^(porque|cuando|donde)$/.test(c.wh))) return null;
        var fin = (c.t === "past" || c.t === "impf") ? C.dePrt(VERB.ser.de, pp) : C.dePres(VERB.ser.de, pp);
        return finDe(ww + " " + fin + " " + subj + (tAdv.length ? " " + tAdv.join(" ") : "") + (pr.s ? " " + pr.s : "") + "?", c);
      }
      return deClause(c, subj, pp, VERB.ser.de, { pred: pr.s }, negW, tAdv, fAdv, dAdv, pAdv, obl, auch);
    }
    var dv2 = VERB[c.v] && VERB[c.v].de; if (!dv2) return null;
    if ((c.v === "ir" || c.v === "irse") && (deUsesFahren(c) || (c.obl || []).some(function (x) { return x.prep === "idiom"; }))) dv2 = DE_FAHREN;
    return deVerbClause(c, subj, pp, dv2, negW, tAdv, fAdv, dAdv, pAdv, obl, auch, null);
  }
  var DE_WH = { que: "Was", donde: "Wo", cuando: "Wann", como: "Wie", quien: "Wer", porque: "Warum", cual: "Welche", adonde: "Wohin", cuanto: "Wie viel" };
  function genericDe(np) {
    if (np && np.k === "n" && np.det === "def") { var e = nounEntry(np.n); if (e.enMass || np.pl) return Object.assign({}, np, { det: "none" }); }
    return np;
  }
  function dePred(c, negOK) {
    var p = c.pred; if (!p) return { s: "" };
    var deg = p.deg === "muy" ? "sehr " : (p.deg === "bastante" ? "ziemlich " : (p.deg === "demasiado" ? "zu " : ""));
    if (p.t === "adj") {
      var k = p.a.split("#"), a;
      if (has(C.SER_ESTAR, k[0])) a = C.SER_ESTAR[k[0]][k[1] !== undefined ? +k[1] : (c.v === "estar" ? 1 : 0)][1];
      else a = has(ADJ, p.a) ? ADJ[p.a].de : null;
      return a ? { s: deg + a } : null;
    }
    if (p.t === "nat") { var n = C.NAT[p.key]; var g = p.g || (c.s.g); if (!g && c.s.p !== 2) return null; return { s: g === "f" ? n.def : n.dem }; }
    if (p.t === "np") {
      var np = p.np;
      if (np.k === "n" && np.det === "none") {
        if (negOK) { var kk = deNP(Object.assign({}, np, { det: "neg" }), "nom"); return kk ? { s: kk, kein: true } : null; }
        var bare = deNP(np, "nom"); return bare ? { s: bare } : null;
      }
      if (negOK && np.k === "n" && np.det === "ind") { var k2 = deNP(np, "nom", true); return k2 ? { s: k2, kein: true } : null; }
      var o = deNP(np, "nom"); return o ? { s: o } : null;
    }
    if (p.t === "loc") { if (p.pp.prep === "con") return null; var ob = deObl({ obl: [p.pp], v: "estar" }); return ob && ob.length ? { s: ob.join(" ") } : null; }
    if (p.t === "idiom") return { s: IDIOM[p.key].de };
    return null;
  }
  // gewoon werkwoord (eventueel met modaal werkwoord) in het Duits
  function deVerbClause(c, subj, pp, dv, negW, tAdv, fAdv, dAdv, pAdv, obl, auch, gern) {
    var part = {};
    if (c.o) {
      var cas = dv.obj === "d" ? "dat" : (dv.obj === "g" ? "gen" : "acc");
      var useK = negW === "nicht" && deIsIndef(c.o) && !dv.obj;
      var o = deNP(c.o, cas, useK);
      if (!o) return null;
      if (dv.obj === "auf") o = dePP("auf", c.o, "acc");
      if (useK) negW = null;
      if (c.o.k === "pron") part.pron = o;
      else if (useK || deIsIndef(c.o) || c.o.qty || c.o.num) part.indefObj = o;
      else part.defObj = o;
    }
    // fragen: de persoon in de vierde naamval ("er fragt mich etwas")
    var ioNv = c.v === "preguntar" ? "acc" : "dat";
    if (c.io && c.io.np) { var ion = deNP(c.io.np, ioNv); if (!ion || !c.o) return null; part.ioObj = ion; } else if (c.io) { var iop = dePron(c.io, ioNv); if (!iop || (!c.o && c.v !== "decir")) return null; part.pron = part.pron ? part.pron + " " + iop : iop; }
    if (c.lng) part.indefObj = C.LANG[c.lng][1];
    if (gern) part.gern = gern;
    if (dv.tail) part.tail = dv.tail;
    // "leben" zonder plaats, "wohnen" met plaats
    if (c.v === "vivir" && !obl.length && !(c.type === "wh" && c.wh === "donde")) dv = { inf: "leben" };
    // "salir de casa": de voorzetselgroep bevat al "aus", dus geen losse afscheidbare "aus" erbij
    if (c.v === "salir" && obl.some(function (x) { return /^aus /.test(x); })) dv = Object.assign({}, dv, { sep: null });
    return deClause(c, subj, pp, dv, part, negW, tAdv, fAdv, dAdv, pAdv, obl, auch);
  }
  // Zinsbouw: Vorfeld + finiet werkwoord + middenveld + eindveld
  function deClause(c, subj, pp, dv, part, negW, tAdv, fAdv, dAdv, pAdv, obl, auch) {
    var past = c.t === "past" || c.t === "impf" || c.t === "perf";
    var fin, end = [], refl = null;
    var mod = c.mod ? VERB[c.mod] && VERB[c.mod].de : null;
    if (c.mod && !mod) return null;
    if (c.mod && c.mod === "necesitar") return null;
    if (dv.refl) refl = DE_REFL[pp];
    if (mod) {
      if (past) { fin = C.dePrt(mod, pp); if (!fin) return null; } else fin = C.dePres(mod, pp);
      end.push(C.deInf(dv));
    } else if (c.t === "fut") {
      fin = C.DE_WERDEN[pp]; end.push(C.deInf(dv));
    } else if (past) {
      var prt = C.dePrt(dv, pp);
      if (prt && (dv.inf === "sein" || dv.inf === "haben" || dv.modal || dv.inf === "wissen")) fin = prt;
      else { fin = (dv.aux === "s" ? C.DE_SEIN : C.DE_HABEN)[pp]; end.push(C.dePP(dv)); }
    } else {
      fin = C.dePres(dv, pp);
      if (dv.sep) end.push(dv.sep);
    }
    if (!fin) return null;
    // middenveld
    var M = [];
    if (refl) M.push(refl);
    if (part.pron) M.push(part.pron);
    if (auch) M.push("auch");
    M = M.concat(tAdv, fAdv);
    if (part.ioObj) M.push(part.ioObj);
    if (part.defObj) M.push(part.defObj);
    if (negW) M.push(negW);
    if (part.gern) M.push(part.gern);
    M = M.concat(dAdv);
    if (part.indefObj) M.push(part.indefObj);
    M = M.concat(obl, pAdv);
    if (part.pred) M.push(part.pred);
    if (part.tail) M.push(part.tail);
    var midS = M.concat(end).join(" ");
    if (c.type === "yn") return finDe(cap(fin) + " " + subj + (midS ? " " + midS : "") + "?", c);
    if (c.type === "wh") {
      var ww = DE_WH[c.wh]; if (!ww) return null;
      if (c.whNP) {
        var wn = c.whNP, e = nounEntry(wn.n); if (!e.de) return null;
        if (c.wh === "cuanto" && wn.n === "tiempo" && !wn.pl) ww = "Wie lange";
        else if (c.wh === "cuanto") ww = wn.pl ? "Wie viele " + (e.dePl || e.de) : "Wie viel " + e.de;
        else return null;
      }
      if (c.wh === "quien" && !c.s.np && !c.s.pron && c.s.p === 2) return finDe("Wer " + fin + (midS ? " " + midS : "") + "?", c);
      if (c.wh === "que" && (part.defObj || part.indefObj)) return null;
      if (c.wh === "adonde" && obl.length) return null;
      return finDe(ww + " " + fin + " " + subj + (midS ? " " + midS : "") + "?", c);
    }
    return finDe(subj + " " + fin + (midS ? " " + midS : ""), c);
  }
  function mid() { var out = []; for (var i = 0; i < arguments.length; i++) { var a = arguments[i]; if (a === null) continue; out = out.concat(a); } return out.join(" "); }
  function finDe(s, c) {
    var out = s.replace(/\s+/g, " ").trim();
    out = cap(out);
    if (c.intj) out = c.intj.de + ", " + out.charAt(0).toLowerCase() + out.slice(1);
    if (c.intj && /^\w+, sie /.test(out) && c.s && c.s.formal) out = out.replace(/, sie /, ", Sie ");
    if (c.please) out = out.replace(/[?.]?$/, "") + ", bitte";
    if (!/[?.!]$/.test(out)) out += c.type !== "stmt" ? "?" : ".";
    if (c.type !== "stmt" && /\.$/.test(out)) out = out.slice(0, -1) + "?";
    return out;
  }

  // ================= FRANS =================
  var FR_SUBJ = ["je", "tu", null, "nous", "vous", null];
  var FR_OBJ = ["me", "te", null, "nous", "vous", "les"];
  var FR_REFL = ["me", "te", "se", "nous", "vous", "se"];
  var FR_POSS = [["mon", "ma", "mes"], ["ton", "ta", "tes"], ["son", "sa", "ses"], ["notre", "notre", "nos"], ["votre", "votre", "vos"], ["leur", "leur", "leurs"]];
  var FR_NUM = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze"];
  // Klok met minuten (Frans): "à onze heures et demie", "à onze heures et quart", "à midi moins le quart"
  var FR_MIN = { 5: "cinq", 10: "dix", 20: "vingt", 25: "vingt-cinq" };
  function frHrs(n) { return n === 1 ? "une heure" : (n === 12 ? "midi" : FR_NUM[n] + " heures"); }
  function frTime(h, m) {
    var nx = h % 12 + 1;
    if (!m) return "à " + (h === 1 ? "une heure" : (h <= 12 ? FR_NUM[h] : h) + " heures");
    if (m === 30) return "à " + frHrs(h) + " et demie";
    if (m === 15) return "à " + frHrs(h) + " et quart";
    if (m === 45) return "à " + frHrs(nx) + " moins le quart";
    if (m < 30) return "à " + frHrs(h) + " " + FR_MIN[m];
    return "à " + frHrs(nx) + " moins " + FR_MIN[60 - m];
  }
  function frV(w) { return /^[aeiouyhàâéèêëîïôöùûœ]/i.test(w); }
  function frSubj(s) {
    if (s.formal) return "vous";
    if (s.p === 2) return s.g === "f" ? "elle" : (s.g === "m" ? "il" : (s.g === "n" ? "il" : null));
    if (s.p === 5) return s.g === "f" ? "elles" : "ils";
    return FR_SUBJ[s.p];
  }
  function frObjPron(o) {
    if (o.formal) return "vous";
    if (o.p === 2) return o.g === "f" ? "la" : "le";
    return FR_OBJ[o.p];
  }
  function frAdjForm(key, fem, pl, estar) {
    var k = key.split("#"), m, f;
    if (has(C.SER_ESTAR, k[0])) { var t = C.SER_ESTAR[k[0]][k[1] !== undefined ? +k[1] : (estar ? 1 : 0)]; m = t[2]; f = t[3]; if (!m) return null; }
    else if (has(ADJ, key)) { m = ADJ[key].frm; f = ADJ[key].frf; }
    else return null;
    var w = fem ? f : m;
    return pl ? C.frAdjPl(w) : w;
  }
  var FR_TONIC = ["moi", "toi", null, "nous", "vous", "eux"];
  function frNP(np, opts) {
    opts = opts || {};
    if (!np) return null;
    if (np.k === "coord") { if (opts.negDe) return null; var parts = np.items.map(function (x) { return frNP(x, opts); }); if (parts.some(function (x) { return !x; })) return null; return parts.slice(0, -1).join(", ") + " et " + parts[parts.length - 1]; }
    if (np.k === "pron") { if (np.formal) return "vous"; if (np.p === 2) return np.g === "f" ? "elle" : (np.g === "m" ? "lui" : null); if (np.p === 5 && np.g === "f") return "elles"; return FR_TONIC[np.p]; }
    if (np.k === "this" || np.k === "that") return "ça";
    if (np.k === "name") return np.s;
    if (np.k === "place") return frPlaceArt(np.key);
    if (np.k === "lang") return "le " + C.LANG[np.key][2];
    if (np.k !== "n") return null;
    var e = nounEntry(np.n);
    if (!e.fr || !e.fg) return null;
    var pl = np.pl || e.esPlOnly || e.frPlOnly;
    if (pl && e.enMass && !np.num && !e.frPlOnly) pl = false;
    var fem = e.fg === "f";
    var w = pl ? C.frPlural(e) : e.fr;
    var before = [], after = [];
    for (var i = 0; i < (np.adjs || []).length; i++) {
      var a = frAdjForm(np.adjs[i], fem, pl, false); if (!a) return null;
      if (has(ADJ, np.adjs[i]) && ADJ[np.adjs[i]].before) {
        if (!fem && !pl && frV(w)) a = { beau: "bel", nouveau: "nouvel", vieux: "vieil" }[a] || a;
        before.push(a);
      } else after.push(a);
    }
    var head = (before.length ? before.join(" ") + " " : "") + w + (after.length ? " " + after.join(" ") : "");
    var first = before.length ? before[0] : w;
    var det;
    if (np.num) det = np.num === 1 ? (fem ? "une" : "un") : (np.num <= 12 ? FR_NUM[np.num] : String(np.num));
    else if (np.qty === "mucho") det = frV(head) ? "beaucoup d'" : "beaucoup de";
    else if (np.qty === "poco") det = frV(head) ? "peu d'" : "peu de";
    else if (opts.negDe && (np.det === "ind" || np.det === "none")) det = frV(head) ? "d'" : "de";
    else if (np.det === "def" || (opts.generic && np.det === "none")) det = pl ? "les" : (frV(first) ? "l'" : (fem ? "la" : "le"));
    else if (np.det === "ind") det = pl ? "des" : (fem ? "une" : "un");
    else if (np.det === "none") {
      if (opts.bare) det = "";
      else if (pl) det = "des";
      else if (e.enMass) det = frV(first) ? "de l'" : (fem ? "de la" : "du");
      else return null;
    }
    else if (np.det === "poss") {
      var own = np.ownFormal ? 4 : np.own;
      if (own === 2 && !np.ownG && !np.ownFormal) return null;
      var row = FR_POSS[own]; det = pl ? row[2] : (fem && !frV(first) ? row[1] : row[0]);
    }
    else if (np.det === "dem") det = pl ? "ces" : (fem ? "cette" : (frV(first) ? "cet" : "ce"));
    else if (np.det === "neg") det = fem ? "aucune" : "aucun";
    else if (np.det === "all") det = pl ? (fem ? "toutes les" : "tous les") : (fem ? "toute la" : "tout le");
    else return null;
    var out = det ? (/'$/.test(det) ? det + head : det + " " + head) : head;
    if (np.of) { var of = frNP(np.of); if (!of) return null; out += " " + frDe(of); }
    return out;
  }
  function frDe(s) { if (/^le /.test(s)) return "du " + s.slice(3); if (/^les /.test(s)) return "des " + s.slice(4); if (/^des /.test(s)) return "de " + s.slice(4); return (frV(s) ? "d'" : "de ") + s; }
  function frA(s) { if (/^le /.test(s)) return "au " + s.slice(3); if (/^les /.test(s)) return "aux " + s.slice(4); return "à " + s; }
  function frPlaceArt(key) {
    var P = C.PLACE[key];
    if (P.ft === "v") return P.fr;
    if (P.ft === "pl") return "les " + P.fr;
    return (frV(P.fr) ? "l'" : (P.ft === "f" ? "la " : "le ")) + P.fr;
  }
  function frPlaceA(key) { var P = C.PLACE[key]; if (P.ft === "v") return "à " + P.fr; if (P.ft === "pl") return "aux " + P.fr; if (P.ft === "f" || frV(P.fr)) return "en " + P.fr; return "au " + P.fr; }
  function frPlaceDe(key) { var P = C.PLACE[key]; if (P.ft === "v") return (frV(P.fr) ? "d'" : "de ") + P.fr; if (P.ft === "pl") return "des " + P.fr; if (P.ft === "f" || frV(P.fr)) return (frV(P.fr) ? "d'" : "de ") + P.fr; return "du " + P.fr; }
  var FR_IN = { "habitación": 1, cocina: 1, "baño": 1, coche: 1, "jardín": 1, ciudad: 0, centro: 0 };
  var FR_BY = { tren: "en train", "autobús": "en bus", coche: "en voiture", "avión": "en avion", bici: "à vélo", bicicleta: "à vélo", metro: "en métro", taxi: "en taxi", barco: "en bateau" };
  function frObl(c) {
    var out = [], late = [];
    var obl = c.obl || [];
    for (var i = 0; i < obl.length; i++) {
      var pp = obl[i], np = pp.np, r = null;
      if (pp.prep === "idiom") { out.push(IDIOM[pp.key].fr); continue; }
      if (C.GENP[pp.prep]) { var wgf = frNP(np); if (!wgf) return null; var gf = C.GENP[pp.prep].fr; late.push(/ de$/.test(gf) ? gf.slice(0, -3) + " " + frDe(wgf) : gf + " " + wgf); continue; }
      if (C.PV[c.v] && pp.prep === C.PV[c.v].es) { var wf = frNP(np); if (!wf) return null; var fp = C.PV[c.v].fr; out.push(fp === "à" ? frA(wf) : (fp === "de" ? frDe(wf) : (fp ? fp + " " + wf : wf))); continue; }
      if (pp.prep === "en" && np.k === "n" && np.det === "none" && has(FR_BY, np.n)) r = FR_BY[np.n];
      else if ((pp.prep === "a" && MOTION[c.v]) || pp.prep === "en") {
        if (np.k === "n" && np.n === "casa" && np.det === "none") r = "à la maison";
        else if (np.k === "place") r = frPlaceA(np.key);
        else if (np.k === "n" && pp.prep === "en" && (FR_IN[np.n] || /^(ind|poss|dem)$/.test(np.det))) { var d = frNP(np); r = d ? "dans " + d : null; }
        else if (np.k === "n" && isPerson(np.n) && pp.prep === "a") { var pn = frNP(np); r = pn ? "chez " + pn : null; }
        else { var w = frNP(np); r = w ? frA(w) : null; }
      } else {
        var map = { con: "avec", para: "pour", sin: "sans", sobre: "sur", desde: "depuis", hasta: "jusqu'à" };
        if (pp.prep === "de") { if (np.k === "place") { r = frPlaceDe(np.key); } else { var wd = frNP(np); r = wd ? frDe(wd) : null; } }
        else if (pp.prep === "cerca") { var wc = frNP(np); r = wc ? "près " + frDe(wc) : null; }
        else { var m = map[pp.prep]; if (!m) return null; var w2 = frNP(np); r = w2 ? m + " " + w2 : null; }
      }
      if (!r) return null;
      out.push(r);
    }
    return out.concat(late);
  }
  function frElide(s) {
    // (?<![\p{L}]) i.p.v. \b: in "achète un" telt de è als niet-letter, en zou "te" anders als los woord zien
    return s.replace(/(?<![\p{L}])(je|me|te|se|le|la|ne|de|que) (?=[aeiouyhàâéèêëîïôöùûœ])/giu, function (m, w) { return w.slice(0, -1) + "'"; })
      .replace(/' /g, "'");
  }
  function frPpAgree(pp, s) {
    if (s.np) { var e = s.np.k === "n" ? nounEntry(s.np.n) : null; var f = e && e.fg === "f"; return pp + (f ? "e" : "") + (s.np.pl ? "s" : ""); }
    var fem = s.g === "f", pl = s.p >= 3;
    if (s.formal && s.p === 2) pl = false;
    return pp + (fem ? "e" : "") + (pl && !/s$/.test(pp) ? "s" : "");
  }
  // Frans: zin opbouwen
  function genFr(c) {
    var s = c.s, pp = C.persFor("fr", s);
    var subj = s.np ? frNP(s.np) : frSubj(s);
    var isWhoSubj = c.type === "wh" && c.wh === "quien" && !s.np && !s.pron && s.p === 2;
    if (!subj && !isWhoSubj) return null;
    if (s.np) pp = s.np.pl || (s.np.k === "n" && nounEntry(s.np.n).frPlOnly) ? 5 : 2;
    var neg = c.neg || c.never, pas = c.never ? "jamais" : "pas";
    var tAdv = [], vAdv = [], pAdv = [], aussi = false;
    (c.advs || []).forEach(function (k) {
      var a = C.ADV[k]; if (!a) return;
      if (k === "también") { aussi = true; return; }
      if (a.k === "t") tAdv.push(a.fr); else if (a.k === "p") pAdv.push(a.fr); else vAdv.push(a.fr);
    });
    if (aussi) { if (neg) return null; vAdv.push("aussi"); }
    if (c.hour) tAdv.push(c.until ? frTime(c.hour, c.min || 0).replace(/^à /, "jusqu'à ") : frTime(c.hour, c.min || 0));
    if (c.day) { var dn = nounEntry(c.day.key).fr; tAdv.push(c.day.pl ? "le " + dn : dn); }
    var obl = frObl(c); if (obl === null) return null;

    if (c.sp === "hay") {
      var o = frNP(c.o, { negDe: neg }); if (!o) return null;
      var a = c.t === "fut" ? "aura" : ((c.t === "past" || c.t === "impf") ? "avait" : "a");
      var core = neg ? "il n'y " + a + " " + pas + " " + o : "il y " + a + " " + o;
      var tailH = rest([].concat(obl, pAdv, tAdv));
      if (c.type === "yn") return finFr("est-ce qu'" + core + tailH, c);
      if (c.type === "wh") return null;
      return finFr(core + tailH, c);
    }
    if (c.sp === "llamarse") {
      var ap = C.frPres(VERB.llamarse.fr, pp);
      var rf = FR_REFL[pp];
      if (c.type === "wh" && c.wh === "como") {
        if (s.np) return finFr("comment s'appelle " + subj, c);
        return finFr("comment " + frElide(rf + " " + ap) + "-" + frInvPron(subj, ap), c);
      }
      if (c.type !== "stmt" || !c.name) return null;
      return finFr(frElide(subj + " " + (neg ? "ne " : "") + rf + " " + ap) + (neg ? " pas" : "") + " " + c.name, c);
    }
    if (c.sp === "tener") {
      var tn = C.TENER[c.tn]; if (!tn) return null;
      return frClause(c, subj, pp, VERB.tener.fr, { tailObj: tn.fr }, neg, pas, tAdv, vAdv, pAdv, obl);
    }
    if (c.sp === "edad") {
      if (c.type !== "stmt") return null;
      return frClause(c, subj, pp, VERB.tener.fr, { tailObj: (c.age === 1 ? "un an" : (c.age <= 12 ? FR_NUM[c.age] : c.age) + " ans") }, neg, pas, tAdv, vAdv, pAdv, obl);
    }
    if (c.sp === "gustar" || c.sp === "encantar") {
      var vf = c.sp === "gustar" ? VERB.gustar.fr : VERB.encantar.fr;
      if (c.infV) {
        var iv = VERB[c.infV] && VERB[c.infV].fr; if (!iv) return null;
        var infS = frInfPhrase(c.infV, iv, c.infO, s, pp);
        if (!infS) return null;
        var oblI = frObl({ obl: c.infObl || [], v: c.infV }); if (oblI === null) return null;
        return frClause(c, subj, pp, vf, { tailObj: infS + (oblI.length ? " " + oblI.join(" ") : "") }, neg, pas, tAdv, vAdv, pAdv, obl);
      }
      var og = frNP(c.o, { generic: true }); if (!og) return null;
      return frClause(c, subj, pp, vf, { tailObj: og }, neg, pas, tAdv, vAdv, pAdv, obl);
    }
    if (c.sp === "origen" || (c.v === "venir" && c.from) || (c.type === "wh" && c.wh === "dedonde")) {
      if (c.type === "wh") {
        if (c.wh !== "dedonde" || s.np) return null;
        var vv = C.frPres(VERB.venir.fr, pp);
        return finFr("d'où " + vv + "-" + frInvPron(subj, vv), c);
      }
      var fromS = c.from.k === "place" ? frPlaceDe(c.from.key) : (frNP(c.from) ? frDe(frNP(c.from)) : null);
      if (!fromS) return null;
      return frClause(c, subj, pp, VERB.venir.fr, { tailObj: fromS }, neg, pas, tAdv, vAdv, pAdv, obl);
    }
    if (c.v === "ser" || c.v === "estar") {
      if (c.mod) return null;
      var pr = frPred(c);
      if (pr === null) return null;
      // "c'est" / "ce sont" bij een naamgroep met lidwoord of bezittelijk voornaamwoord
      if (c.pred && c.pred.t === "np" && !s.np && !s.formal && (s.p === 2 || s.p === 5) && c.pred.np.k === "n" && c.pred.np.det !== "none") {
        var ce = s.p === 5 ? "sont" : ((c.t === "past" || c.t === "impf") ? "était" : "est");
        var coreC = (c.neg ? "ce n'" + ce + " pas " : (s.p === 5 ? "ce " : "c'") + ce + " ") + pr;
        if (c.neg && s.p === 5) coreC = "ce ne sont pas " + pr;
        if (c.type === "yn") return finFr("est-ce que " + coreC, c);
        if (c.type === "wh") return null;
        return finFr(coreC + rest([].concat(obl, pAdv, tAdv)), c);
      }
      if (c.type === "wh") {
        var ww = FR_WH[c.wh]; if (!ww) return null;
        if (pr && /^(porque|cuando|donde)$/.test(c.wh) && !s.np) { var est2 = (c.t === "past" || c.t === "impf") ? C.split6(VERB.ser.fr.imp)[pp] : C.FR_ETRE[pp]; return finFr(ww + " " + est2 + "-" + frInvPron(subj, est2) + " " + pr, c); }
        if (pr || c.whNP) return null;
        var est = (c.t === "past" || c.t === "impf") ? C.split6(VERB.ser.fr.imp)[pp] : C.FR_ETRE[pp];
        if (s.np) return finFr(ww + " " + est + " " + subj, c);
        return finFr(ww + " " + est + "-" + frInvPron(subj, est), c);
      }
      if (c.t === "impf") return frClause(c, subj, pp, VERB.ser.fr, { tailObj: pr, impf: true }, neg, pas, tAdv, vAdv, pAdv, obl);
      return frClause(c, subj, pp, VERB.ser.fr, { tailObj: pr }, neg, pas, tAdv, vAdv, pAdv, obl);
    }
    var fv = VERB[c.v] && VERB[c.v].fr; if (!fv) return null;
    if (c.v === "vivir" && c.wh !== "donde" && !(c.obl || []).some(function (x) { return x.prep === "en" || x.prep === "a"; }) && !(c.advs || []).some(function (x) { return /^(aquí|allí|allá|cerca|lejos)$/.test(x); })) fv = { inf: "vivre", pres: "vis vis vit vivons vivez vivent", imp: "vivais vivais vivait vivions viviez vivaient", pp: "vécu" };
    var part = {};
    if (c.o) {
      if (c.o.k === "pron") { part.clit = frObjPron(c.o); }
      else {
        var obj = frNP(c.o, { negDe: neg && (c.o.det === "ind" || c.o.det === "none") }); if (!obj) return null;
        part.tailObj = c.v === "responder" ? frA(obj) : obj;
      }
    }
    if (fv.tail) part.fvTail = fv.tail;
    if (c.io && c.io.np) { var ifr = frNP(c.io.np, {}); if (!ifr || !c.o) return null; part.tailObj = (part.tailObj ? part.tailObj + " " : "") + frA(ifr); } else if (c.io) { if (!c.o && c.v !== "decir") return null; var FRIO = ["me", "te", "lui", "nous", "vous", "leur"]; var frIoC = c.io.formal ? "vous" : FRIO[c.io.p]; if (c.o && c.o.k === "pron") { var frDc = frObjPron(c.o); if (!/^(le|la|les|l')$/.test(frDc)) return null; part.clit = /^(lui|leur)$/.test(frIoC) ? frDc + " " + frIoC : frIoC + " " + frDc; } else part.clit = frIoC; }
    if (c.lng) part.tailObj = C.LANG[c.lng][2];
    if (c.v === "jugar" && part.tailObj) { if (c.o.k === "n" && /^(fútbol|tenis|deporte)$/.test(c.o.n)) part.tailObj = frA(frNP(Object.assign({}, c.o, { det: "def" }))); }
    if (fv.besoin) {
      if (c.o && c.o.k === "pron") return null;
      part.besoin = true;
    }
    return frClause(c, subj, pp, fv, part, neg, pas, tAdv, vAdv, pAdv, obl);
  }
  var FR_WH = { que: "que", donde: "où", cuando: "quand", como: "comment", quien: "qui", porque: "pourquoi", adonde: "où", cuanto: "combien" };
  function frInvPron(subj, verb) { return (/[ae]$/.test(verb) && /^(il|elle|on)$/.test(subj) ? "t-" : "") + subj; }
  function frInfPhrase(lemma, iv, obj, s, pp) {
    var inf = iv.inf;
    if (iv.refl) inf = frElide(FR_REFL[pp] + " " + inf);
    if (obj) {
      if (obj.k === "pron") return frElide(frObjPron(obj) + " " + inf);
      var o = frNP(obj); if (!o) return null;
      return inf + " " + o;
    }
    return inf;
  }
  function frPred(c) {
    var p = c.pred; if (!p) return "";
    var s = c.s;
    var fem = s.np ? (s.np.k === "n" && nounEntry(s.np.n).fg === "f") : s.g === "f";
    var pl = s.np ? !!s.np.pl : (s.p >= 3 && !(s.formal && s.p === 2));
    var deg = p.deg === "muy" ? "très " : (p.deg === "bastante" ? "assez " : (p.deg === "demasiado" ? "trop " : ""));
    if (p.t === "adj") { var a = frAdjForm(p.a, fem, pl, c.v === "estar"); return a ? deg + a : null; }
    if (p.t === "nat") { var n = C.NAT[p.key]; var g = p.g || s.g; var w = g === "f" ? n.frf : n.frm; return pl ? C.frAdjPl(w) : w; }
    if (p.t === "np") {
      var np = p.np;
      if (np.k === "n" && np.det === "none") return frNP(np, { bare: true });
      return frNP(np);
    }
    if (p.t === "loc") { var o = frObl({ obl: [p.pp], v: "estar" }); return o && o.length ? o.join(" ") : null; }
    if (p.t === "idiom") return IDIOM[p.key].fr;
    return null;
  }
  // Franse zinsbouw: onderwerp ne clitica werkwoord pas bijwoorden [voltooid deelwoord/infinitief] voorwerp rest
  function frClause(c, subj, pp, fv, part, neg, pas, tAdv, vAdv, pAdv, obl) {
    var s = c.s;
    var mod = c.mod ? VERB[c.mod] && VERB[c.mod].fr : null;
    if (c.mod && !mod) return null;
    var refl = fv.refl ? FR_REFL[pp] : null;
    var fin, nonfin = null, clitOnInf = false;
    var past = c.t === "past" || c.t === "perf";
    if (mod) {
      if (past || c.t === "impf") return null;
      if (mod.besoin) {
        fin = C.FR_AVOIR[pp];
        nonfin = "besoin de " + (refl ? frElide(refl + " " + fv.inf) : fv.inf); clitOnInf = true;
        if (part.clit) return null;
      } else { fin = C.frPres(mod, pp); nonfin = (refl ? refl + " " : "") + fv.inf; clitOnInf = true; }
    } else if (c.t === "fut") {
      fin = C.FR_ALLER[pp]; nonfin = (refl ? refl + " " : "") + fv.inf; clitOnInf = true;
    } else if (part.impf || (c.t === "impf" && fv.imp)) {
      fin = C.split6(fv.imp)[pp];
    } else if (c.t === "impf") return null;
    else if (past) {
      var pv = C.frPP(fv); if (!pv) return null;
      var etre = fv.aux === "e" || fv.refl;
      fin = (etre ? C.FR_ETRE : C.FR_AVOIR)[pp];
      nonfin = etre ? frPpAgree(pv, s) : pv;
    } else if (fv.go && !refl) {
      // "aller + infinitief" (halen = aller chercher): vervoeg "aller", zet daarna de infinitief voor het object
      fin = C.FR_ALLER[pp]; nonfin = fv.inf;
    } else {
      fin = C.frPres(fv, pp);
    }
    if (!fin) return null;
    var pre = [];               // clitica voor het finiete werkwoord
    var infPre = [];            // clitica voor de infinitief
    if (clitOnInf) { if (part.clit) infPre.push(part.clit); }
    else { if (refl) pre.push(refl); if (part.clit) pre.push(part.clit); }
    var verbGroup = frElide(pre.concat([fin]).join(" "));
    var after = [];
    after = after.concat(vAdv);
    if (nonfin) after.push(clitOnInf ? frElide(infPre.concat([nonfin]).join(" ")) : nonfin);
    if (part.besoin && part.tailObj) { var bo = c.o ? frNP(c.o, { bare: c.o.det === "none" }) : part.tailObj; if (!bo) return null; after.push(frDe(bo).replace(/^de des /, "de ").replace(/^des /, "de ")); part.tailObj = null; after.unshift("besoin"); }
    if (part.fvTail) after.push(part.fvTail);
    if (part.tailObj) after.push(part.tailObj);
    after = after.concat(obl, pAdv, tAdv);
    var afterS = after.join(" ");
    if (c.type === "yn") {
      var st = (neg ? frElide(subj + " ne " + verbGroup) + " " + pas : frElide(subj + " " + verbGroup)) + (afterS ? " " + afterS : "");
      return finFr("est-ce que " + st, c, true);
    }
    if (c.type === "wh") {
      var ww = FR_WH[c.wh]; if (!ww) return null;
      if (c.whNP) {
        var e = nounEntry(c.whNP.n); if (!e.fr) return null;
        if (c.wh === "cuanto") ww = "combien " + (frV(e.fr) ? "d'" : "de ") + (c.whNP.pl ? C.frPlural(e) : e.fr); else return null;
      }
      if (c.wh === "quien" && !s.np && !s.pron && s.p === 2) return finFr("qui " + (neg ? frElide("ne " + verbGroup) + " " + pas : verbGroup) + (afterS ? " " + afterS : ""), c);
      if (c.wh === "que" && part.tailObj) return null;
      if (neg) return null;
      if (s.np) {
        if (pre.length || nonfin) return null;
        return finFr(ww + " " + verbGroup + " " + subj + (afterS ? " " + afterS : ""), c);
      }
      if (ww === "que") return finFr(frElide("qu'est-ce que " + subj + " " + verbGroup) + (afterS ? " " + afterS : ""), c);
      return finFr(ww + " " + verbGroup + "-" + frInvPron(subj, fin) + (afterS ? " " + afterS : ""), c);
    }
    // Meerwoordige finiete vorm ("ai le droit de"): "pas" komt na het eerste woord -> "je n'ai pas le droit de nager"
    var finW = fin.split(" ");
    if (neg && mod && finW.length > 1 && !pre.length) {
      var core2 = frElide(subj + " ne " + finW[0]) + " pas " + finW.slice(1).join(" ");
      return finFr(core2 + (afterS ? " " + afterS : ""), c);
    }
    var core = neg ? frElide(subj + " ne " + verbGroup) + " " + pas : frElide(subj + " " + verbGroup);
    return finFr(core + (afterS ? " " + afterS : ""), c);
  }
  function finFr(s, c) {
    var out = s.replace(/\s+/g, " ").trim();
    out = frElide(out);
    if (c.intj) out = c.intj.fr + ", " + out;
    if (c.please) out = out.replace(/\s*[?.]?$/, "") + ", s'il te plaît";
    out = cap(out);
    if (c.type !== "stmt") out = out.replace(/\s*\??$/, "") + " ?";
    else if (!/[.!?]$/.test(out)) out += ".";
    return out;
  }

  // ================= SPAANS (invoer EN/DE/FR -> Spaans) =================
  var ES_SUBJ = ["yo", "tú", null, "nosotros", "vosotros", null];
  var ES_OBJ = ["me", "te", null, "nos", "os", null];
  var ES_POSS = ["mi", "tu", "su", "nuestro", "vuestro", "su"];
  var ES_NUM = ["cero", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce"];
  // Klok met minuten (Spaans): "a las once y media", "a las doce menos cuarto", "a la una y cinco"
  var ES_MIN = { 5: "cinco", 10: "diez", 20: "veinte", 25: "veinticinco" };
  function esHrs(n) { return n === 1 ? "la una" : "las " + ES_NUM[n]; }
  function esTime(h, m) {
    var nx = h % 12 + 1;
    if (!m) return h === 1 ? "a la una" : "a las " + (h <= 12 ? ES_NUM[h] : h);
    if (m === 30) return "a " + esHrs(h) + " y media";
    if (m === 15) return "a " + esHrs(h) + " y cuarto";
    if (m === 45) return "a " + esHrs(nx) + " menos cuarto";
    if (m < 30) return "a " + esHrs(h) + " y " + ES_MIN[m];
    return "a " + esHrs(nx) + " menos " + ES_MIN[60 - m];
  }
  function esNP(np, opts) {
    opts = opts || {};
    if (!np) return null;
    if (np.k === "coord") { var parts = np.items.map(function (x) { return esNP(x, opts); }); if (parts.some(function (x) { return !x; })) return null; return parts.slice(0, -1).join(", ") + " y " + parts[parts.length - 1]; }
    if (np.k === "this") return "esto";
    if (np.k === "that") return "eso";
    if (np.k === "name") return np.s;
    if (np.k === "place") { var P = C.PLACE[np.key]; return np.key === "holanda" ? "Holanda" : esPlaceName(np.key); }
    if (np.k === "lang") return np.key;
    if (np.k === "pron") return null;
    if (np.k !== "n") return null;
    var w0 = np.n, fem = C.esFem(w0);
    var e = has(NOUN, w0) ? NOUN[w0] : null;
    var pl = np.pl || (e && e.esPlOnly);
    var w = pl && !(e && e.esPlOnly) ? C.esPlural(w0) : w0;
    var adjs = [];
    for (var i = 0; i < (np.adjs || []).length; i++) { var a = np.adjs[i].split("#")[0]; adjs.push(C.esAdj(a, fem, pl)); }
    var head = w + (adjs.length ? " " + adjs.join(" ") : "");
    var det = "";
    if (np.num) det = np.num === 1 ? (fem ? "una" : "un") : (np.num <= 12 ? ES_NUM[np.num] : String(np.num));
    else if (np.qty === "mucho") det = C.esAdj("mucho", fem, pl);
    else if (np.qty === "poco") det = C.esAdj("poco", fem, pl);
    else if (np.qty === "otro") det = C.esAdj("otro", fem, pl);
    else if (np.det === "def" || (opts.generic && np.det === "none")) det = C.esArt(w0, pl, true);
    else if (np.det === "ind") det = C.esArt(w0, pl, false);
    else if (np.det === "none") det = "";
    else if (np.det === "poss") { var o = ES_POSS[np.ownFormal ? 2 : np.own]; if (o === "nuestro" || o === "vuestro") o = C.esAdj(o, fem, false); det = o + (pl ? "s" : ""); }
    else if (np.det === "dem") det = np.far ? C.esAdj("ese", fem, pl).replace(/^esa$/, "esa").replace(/^eses$/, "esos") : (pl ? (fem ? "estas" : "estos") : (fem ? "esta" : "este"));
    else if (np.det === "neg") det = fem ? "ninguna" : "ningún";
    else if (np.det === "all") det = (fem ? "todas" : "todos").replace(/s$/, pl ? "s" : "") + " " + C.esArt(w0, pl, true);
    if (np.det === "dem" && np.far) det = pl ? (fem ? "esas" : "esos") : (fem ? "esa" : "ese");
    if (np.det === "all") det = (pl ? (fem ? "todas" : "todos") : (fem ? "toda" : "todo")) + " " + C.esArt(w0, pl, true);
    var out = det ? det + " " + head : head;
    if (np.of) { var of = esNP(np.of); if (!of) return null; out += " " + esContr("de", of); }
    return out;
  }
  function esPlaceName(key) {
    var map = { "españa": "España", holanda: "Holanda", "países bajos": "los Países Bajos", francia: "Francia", alemania: "Alemania", inglaterra: "Inglaterra",
      "bélgica": "Bélgica", italia: "Italia", portugal: "Portugal", "méxico": "México", marruecos: "Marruecos", argentina: "Argentina", colombia: "Colombia",
      "perú": "Perú", chile: "Chile", "turquía": "Turquía", europa: "Europa", "nueva york": "Nueva York", "la haya": "La Haya" };
    if (has(map, key)) return map[key];
    return key.split(" ").map(cap).join(" ");
  }
  function esContr(prep, s) { if (prep === "a" && /^el /.test(s)) return "al " + s.slice(3); if (prep === "de" && /^el /.test(s)) return "del " + s.slice(3); return prep + " " + s; }
  function esObjPron(o, dative) {
    if (o.formal) return dative ? "le" : "lo";
    if (o.p === 2) return dative ? "le" : (o.g === "f" ? "la" : "lo");
    if (o.p === 5) return dative ? "les" : (o.g === "f" ? "las" : "los");
    return ES_OBJ[o.p];
  }
  function esVerbForm(lemma, tense, p) {
    var f = C.esForm(lemma, tense, p);
    if (!f && lemma === "tener que") { var t = C.esForm("tener", tense, p); return t ? t + " que" : null; }
    return f;
  }
  // tijd in de tussenrepresentatie -> Spaanse tijd
  function esTense(c) {
    if (c.t === "past") { if (c.v === "ser" || c.v === "estar" || c.v === "tener") return "imp"; return "pret"; }
    if (c.t === "impf") return "imp";
    return "pres";
  }
  function genEs(c, gen) {
    var ioNpStr = null;
    var s = c.s;
    var p = s.np ? (s.np.pl ? 5 : 2) : (s.formal ? (s.p >= 3 ? 5 : 2) : s.p);
    var subjG = s.np ? (s.np.k === "n" && C.esFem(s.np.n) ? "f" : "m") : (s.g === "f" || s.g === "m" ? s.g : (s.p === 0 ? gen : "m"));
    var subjS = s.np ? esNP(s.np) : null;
    if (s.np && !subjS) return null;
    var pronS = !s.np && s.p === 2 ? (s.formal ? "usted" : (s.g === "f" ? "ella" : (s.g === "m" ? "él" : null))) :
      (!s.np && s.p === 5 ? (s.formal ? "ustedes" : (s.g === "f" ? "ellas" : "ellos")) : null);
    var neg = c.neg, never = c.never;
    var advEnd = [], advFront = [];
    (c.advs || []).forEach(function (k) { if (k === "siempre" || k === "a veces" || k === "también" && false) advFront.push(k); else advEnd.push(k); });
    if (c.hour) advEnd.push(c.until ? esTime(c.hour, c.min || 0).replace(/^a /, "hasta ") : esTime(c.hour, c.min || 0));
    if (c.day) advEnd.push(c.day.pl ? "los " + C.esPlural(c.day.key) : "el " + c.day.key);
    var obl = esObl(c); if (obl === null) return null;
    var tense = esTense(c);
    var noPart = never ? "nunca" : (neg ? "no" : null);

    function assemble(verbPart, restParts, opts) {
      opts = opts || {};
      var pieces = [];
      if (c.type === "wh") {
        var ww = ES_WH[c.wh]; if (!ww) return null;
        if (c.wh === "donde" && /^(ir|venir|viajar|volver|irse)$/.test(c.v) && !c.mod && c.v !== "venir") ww = "adónde";
        if (c.whNP) { var wn = c.whNP; if (c.wh === "cuanto") ww = (wn.pl ? (C.esFem(wn.n) ? "cuántas " : "cuántos ") + C.esPlural(wn.n) : (C.esFem(wn.n) ? "cuánta " : "cuánto ") + wn.n); else if (c.wh === "que" || c.wh === "cual") ww = "qué " + (wn.pl ? C.esPlural(wn.n) : wn.n); }
        pieces.push(ww);
        if (noPart) pieces.push(noPart);
        pieces.push(verbPart);
        if (subjS && !opts.noSubj) pieces.push(subjS);
        else if (pronS && (s.formal || opts.keepPron)) pieces.push(pronS);
        pieces = pieces.concat(restParts);
        return "¿" + cap(pieces.join(" ").replace(/\s+/g, " ").trim()) + "?";
      }
      if (subjS && !opts.noSubj) pieces.push(subjS);
      else if (pronS && (s.formal || s.pron)) pieces.push(pronS);
      pieces = pieces.concat(advFront);
      if (noPart) pieces.push(noPart);
      pieces.push(verbPart);
      pieces = pieces.concat(restParts);
      var out = pieces.join(" ").replace(/\s+/g, " ").trim();
      if (c.please) out += ", por favor";
      if (c.intj) out = c.intj.es + ", " + out;
      if (c.type === "yn") return "¿" + cap(out) + "?";
      return cap(out) + ".";
    }
    var tail = [].concat(obl, advEnd.map(function (k) { return C.ADV[k] ? C.ADV[k].es : k; }));

    if (c.sp === "hay") {
      var npH = esNP(c.o); if (!npH) return null;
      if (neg && c.o.det === "ind" && !c.o.pl) npH = npH.replace(/^(un|una) /, "");
      var h = tense === "pres" ? "hay" : (c.t === "fut" ? "habrá" : (c.t === "past" ? "hubo" : "había"));
      return assemble(h, [npH].concat(tail), { noSubj: true });
    }
    if (c.sp === "llamarse") {
      var lf = C.esForm("llamarse", "pres", p); if (!lf) lf = { 0: "llamo", 1: "llamas", 2: "llama", 3: "llamamos", 4: "llamáis", 5: "llaman" }[p];
      var rfl = C.REFL_ES[p];
      if (c.type === "wh" && c.wh === "como") return "¿Cómo " + rfl + " " + lf + (subjS ? " " + subjS : (s.formal ? " " + pronS : "")) + "?";
      if (!c.name) return null;
      return assemble(rfl + " " + lf, [c.name]);
    }
    if (c.sp === "tener") {
      var tf = esVerbForm("tener", tense, p);
      return assemble(tf, [c.tn].concat(tail));
    }
    if (c.sp === "edad") {
      var tf2 = esVerbForm("tener", tense, p);
      return assemble(tf2, [String(c.age) + (c.age === 1 ? " año" : " años")].concat(tail));
    }
    if (c.sp === "gustar" || c.sp === "encantar") {
      var exp = s.np ? null : esObjPron(Object.assign({}, s), true);
      if (!exp) return null;
      var vb = c.sp;
      var plO = !c.infV && c.o && (c.o.pl || (c.o.k === "n" && has(NOUN, c.o.n) && NOUN[c.o.n].esPlOnly));
      var gf = esVerbForm(vb, tense === "imp" ? "imp" : tense, plO ? 5 : 2);
      var objS;
      if (c.infV) {
        objS = C.esBase(c.infV);
        if (c.infO) { if (c.infO.k === "pron") objS += esObjPron(c.infO, false); else { var io = esNP(c.infO); if (!io) return null; objS += " " + (personNP(c.infO) ? esContr("a", io) : io); } }
        var oi = esObl({ obl: c.infObl || [], v: c.infV }); if (oi === null) return null;
        if (oi.length) objS += " " + oi.join(" ");
      } else { objS = esNP(c.o, { generic: true }); if (!objS) return null; if (c.o.det === "none" && c.o.k === "n") objS = esNP(Object.assign({}, c.o, { det: "def" })); }
      var pre = s.p === 2 && !s.formal && s.g ? "a " + (s.g === "f" ? "ella" : "él") + " " : (s.formal ? "a usted " : "");
      var vp = exp + " " + gf;
      if (c.type === "wh") return null;
      var core = (pre ? pre : "") + (noPart ? noPart + " " : "") + vp + " " + objS + (tail.length ? " " + tail.join(" ") : "");
      core = core.replace(/\s+/g, " ").trim();
      return c.type === "yn" ? "¿" + cap(core) + "?" : cap(core) + ".";
    }
    if (c.sp === "origen" || (c.v === "venir" && c.from) || (c.type === "wh" && c.wh === "dedonde")) {
      var useV = c.v === "venir" ? "venir" : "ser";
      var vfo = esVerbForm(useV, tense, p);
      if (c.type === "wh") return "¿De dónde " + vfo + (subjS ? " " + subjS : (s.formal ? " " + pronS : "")) + "?";
      var fromS = esNP(c.from); if (!fromS) return null;
      return assemble(vfo, [esContr("de", fromS)].concat(tail));
    }
    if (c.v === "ser" || c.v === "estar") {
      if (c.mod) return null;
      var pr = esPred(c, subjG, p);
      if (!pr) return null;
      var vlem = pr.estar ? "estar" : "ser";
      var vf = c.t === "fut" ? esVerbForm("ir", "pres", p) + " a " + vlem : esVerbForm(vlem, tense === "pret" ? "imp" : tense, p);
      if (c.t === "perf") vf = C.HABER[p] + " " + C.esPP(vlem);
      if (c.type === "wh" && !pr.s) return assemble(vf, tail);
      return assemble(vf, [pr.s].concat(tail));
    }
    // gewone werkwoorden
    var lemma = c.v;
    if (!VERB[lemma]) return null;
    var refl = C.esIsRefl(lemma);
    var clit = [];
    if (refl) clit.push(C.REFL_ES[p]);
    if (c.io && c.io.np) { var ies = esNP(c.io.np); if (!ies || !c.o) return null; ioNpStr = esContr("a", ies); } else if (c.io) { if (!c.o && c.v !== "decir") return null; var ioS = esObjPron(c.io, true); if (!ioS) return null; if (c.o && c.o.k === "pron") { if (!(c.o.p === 2 || c.o.p === 5)) return null; if (/^les?$/.test(ioS)) ioS = "se"; } clit.push(ioS); }
    var objParts = [];
    if (c.o) {
      if (c.o.k === "pron") clit.push(esObjPron(c.o, lemma === "ayudar" ? false : false));
      else {
        var os = esNP(c.o); if (!os) return null;
        if (neg && c.o.det === "ind" && !c.o.pl && !(c.o.adjs || []).length) os = os.replace(/^(un|una) /, "");
        if (personNP(c.o) && lemma !== "tener") os = esContr("a", os);   // geen persoonlijke a bij tener: "tengo tres hijos"
        if (lemma === "jugar" && c.o.k === "n" && /^(fútbol|tenis|deporte)$/.test(c.o.n)) os = "al " + c.o.n;
        objParts.push(os);
      }
    }
    if (ioNpStr) objParts.push(ioNpStr);
    if (c.lng) objParts.push(c.lng);
    var verbPart;
    if (c.mod) {
      var mf = esVerbForm(c.mod, tense === "imp" ? "imp" : tense, p); if (!mf) return null;
      var inf = C.esBase(lemma) + (refl ? C.REFL_ES[p] : "");
      var cl = clit.filter(function (x) { return x !== C.REFL_ES[p] || !refl; });
      if (refl) cl = clit.slice(1);
      verbPart = mf + " " + inf + cl.join("");
    } else if (c.t === "fut") {
      var inf2 = C.esBase(lemma) + clit.join("");
      verbPart = esVerbForm("ir", "pres", p) + " a " + inf2;
    } else if (c.t === "prog") {
      verbPart = (clit.length ? clit.join(" ") + " " : "") + esVerbForm("estar", "pres", p) + " " + C.esGer(lemma);
    } else if (c.t === "perf") {
      verbPart = (clit.length ? clit.join(" ") + " " : "") + C.HABER[p] + " " + C.esPP(lemma);
    } else {
      var vf2 = esVerbForm(lemma, tense, p); if (!vf2) return null;
      verbPart = (clit.length ? clit.join(" ") + " " : "") + vf2;
    }
    return assemble(verbPart, objParts.concat(tail));
  }
  function personNP(np) { return np && np.k === "n" && has(C.PERSON, np.n) || (np && np.k === "name"); }
  var ES_WH = { que: "qué", donde: "dónde", cuando: "cuándo", como: "cómo", quien: "quién", porque: "por qué", cual: "cuál", adonde: "adónde", cuanto: "cuánto" };
  function esPred(c, g, p) {
    var pr = c.pred; if (!pr) return { s: "", estar: c.v === "estar" };
    var fem = g === "f", pl = p >= 3;
    var deg = pr.deg ? pr.deg + " " : "";
    if (pr.t === "adj") {
      var k = pr.a.split("#");
      var a = k[0];
      var estar;
      if (k[1] !== undefined) estar = k[1] === "1";
      else estar = has(ADJ, a) ? ADJ[a].estar : false;
      return { s: deg + C.esAdj(a, fem, pl), estar: estar };
    }
    if (pr.t === "nat") { var n = C.NAT[pr.key]; return { s: pl ? C.esAdj(fem ? n.f : n.m, false, true) : (fem ? n.f : n.m), estar: false }; }
    if (pr.t === "np") {
      var np = pr.np;
      if (np.k === "n" && (np.det === "ind" || np.det === "none") && has(C.PROF, np.n) && !(np.adjs || []).length) {
        var w = np.n;
        if (fem && has(C.PROF, w.replace(/o$/, "a"))) w = w.replace(/o$/, "a");
        if (fem && w === "profesor") w = "profesora";
        return { s: pl ? C.esPlural(w) : w, estar: false };
      }
      var s = esNP(np); return s ? { s: s, estar: false } : null;
    }
    if (pr.t === "loc") { var o = esObl({ obl: [pr.pp], v: "estar" }); return o && o.length ? { s: o.join(" "), estar: true } : null; }
    if (pr.t === "idiom") return { s: "de " + pr.key, estar: true };
    return null;
  }
  function esObl(c) {
    var out = [];
    var obl = c.obl || [];
    for (var i = 0; i < obl.length; i++) {
      var pp = obl[i], np = pp.np, r;
      if (pp.prep === "idiom") { out.push("de " + pp.key); continue; }
      if (C.GENP[pp.prep]) { if (np.k === "pron") return null; var sgp = esNP(np); if (!sgp) return null; out.push(/ de$/.test(pp.prep) ? pp.prep.slice(0, -3) + " " + esContr("de", sgp) : pp.prep + " " + sgp); continue; }
      if (np.k === "n" && np.n === "casa" && np.det === "none") { r = (pp.prep === "a" ? "a casa" : "en casa"); out.push(r); continue; }
      if (pp.prep === "en" && np.k === "n" && np.det === "none") { out.push("en " + np.n); continue; }
      if (np.k === "pron" && C.PV[c.v] && pp.prep === C.PV[c.v].es) { var TN = ["mí", "ti", null, "nosotros", "vosotros", "ellos"][np.p]; if (!TN) return null; out.push(pp.prep === "con" && np.p < 2 ? (np.p === 0 ? "conmigo" : "contigo") : pp.prep + " " + TN); continue; }
      if (np.k === "pron") { if (pp.prep !== "con" && pp.prep !== "para" && pp.prep !== "sin") return null; if (pp.prep === "con" && (np.p === 0 || np.p === 1) && !np.formal) { out.push(np.p === 0 ? "conmigo" : "contigo"); continue; } var tp = np.formal ? "usted" : (["mí", "ti", np.g === "f" ? "ella" : "él", "nosotros", "vosotros", np.g === "f" ? "ellas" : "ellos"][np.p]); out.push(pp.prep + " " + tp); continue; }
      var s = esNP(np); if (!s) return null;
      out.push(esContr(pp.prep === "cerca" ? "cerca de" : pp.prep, s).replace(/^cerca de el /, "cerca del "));
    }
    return out;
  }

  // ---------------- Gebiedende wijs (tu/du/tú): de beweerzin met "you" wordt omgezet (en omgekeerd) ----------------
  var DE_IMP = {"nehmen": "nimm", "brechen": "brich", "essen": "iss", "handeln": "handle", "helfen": "hilf", "lesen": "lies", "schmelzen": "schmilz", "sehen": "sieh", "treffen": "triff", "werfen": "wirf", "sein": "sei", "geben": "gib", "sprechen": "sprich", "vergessen": "vergiss", "werden": "werde"};
  var ES_IMP = { decir: "di", oír: "oye", hacer: "haz", ir: "ve", poner: "pon", salir: "sal", ser: "sé", tener: "ten", venir: "ven" };
  var ES_NEG_IRR = { ser: "seas", ir: "vayas", estar: "estés", dar: "des", saber: "sepas", haber: "hayas" };
  function deImpOf(dv) {
    if (!dv || dv.modal) return null;
    var du = C.dePres(dv, 1); if (!du) return null;
    var inf = dv.inf, stem = inf.replace(/e?n$/, ""), cand = du.replace(/e?st$/, "").replace(/ß$/, "ss");
    if (has(DE_IMP, inf)) return DE_IMP[inf];
    if (cand !== stem && cand.replace(/ie|i/, "e") === stem) return cand;
    return stem + (/(d|t|chn|ffn|gn|dm|tm|ln|rn|ig)$/.test(stem) ? "e" : "");
  }
  function frImpOf(v) {
    var map = { es: "sois", as: "aie", sais: "sache" };
    if (v === "peux") return null;
    if (has(map, v)) return map[v];
    if (/(es|vas)$/.test(v)) return v.slice(0, -1);
    return v;
  }
  function esNegOf(lemma) {
    if (has(ES_NEG_IRR, lemma)) return ES_NEG_IRR[lemma];
    var yo = C.esForm(lemma, "pres", 0); if (!yo || !/o$/.test(yo)) return null;
    var stem = yo.slice(0, -1), ar = /ar$/.test(C.esBase(lemma));
    if (!ar) return stem + "as";
    if (/car$/.test(lemma) && /c$/.test(stem)) stem = stem.slice(0, -1) + "qu";
    else if (/gar$/.test(lemma) && /g$/.test(stem)) stem += "u";
    else if (/zar$/.test(lemma) && /z$/.test(stem)) stem = stem.slice(0, -1) + "c";
    return stem + "es";
  }
  function esImpOf(lemma) { if (has(ES_IMP, lemma)) return ES_IMP[lemma]; return C.esForm(lemma, "pres", 2); }
  // klinker achter het bevel: dame, quítame, tráeme, muéstrame
  function esEnclitic(imp, cl) {
    var groups = imp.match(/[aeiouáéíóú]+/g) || [], syl = 0;
    groups.forEach(function (g) { syl += /^[aeo][aeo]$/.test(g) ? 2 : 1; });
    if (syl <= 1 && cl.length > 3 && /^[^aeiouáéíóú]*[aeiou][^aeiouáéíóú]*$/.test(imp)) return imp.replace(/[aeiou]/, function (v) { return { a: "á", e: "é", i: "í", o: "ó", u: "ú" }[v]; }) + cl;
    if (syl <= 1 || /[áéíóú]/.test(imp)) return imp + cl;
    // klemtoon van de gebiedende wijs: voorlaatste lettergreep
    var gi = groups.length - 1, lastG = groups[gi];
    if (!/^[aeo][aeo]$/.test(lastG)) gi = gi - 1;
    if (gi < 0) return imp + cl;
    var n = -1, accented = function (g) {
      if (/^(ue|ie|ua|uo|ia|io)$/.test(g)) return g.charAt(0) + { e: "é", a: "á", o: "ó" }[g.charAt(1)];
      if (/^[aeo][aeo]$/.test(g)) return { a: "á", e: "é", o: "ó" }[g.charAt(0)] + g.charAt(1);
      if (/^(ui|iu)$/.test(g)) return g.charAt(0) + { i: "í", u: "ú" }[g.charAt(1)];
      if (g.length === 1) return { a: "á", e: "é", i: "í", o: "ó", u: "ú" }[g];
      return g;
    };
    var w = imp.replace(/[aeiouáéíóú]+/g, function (g) { n++; return n === gi ? accented(g) : g; });
    return w + cl;
  }
  function impDe(out, c) {
    var dv = VERB[c.v] && VERB[c.v].de; if (!dv || dv.modal) return null;
    out = String(out).replace(/[.!?]+$/, "");
    var du = C.dePres(dv, 1), m = /^Du (\S+)(.*)$/.exec(out);
    if (!m || !du || m[1] !== du) return null;
    var imp = deImpOf(dv), rest = m[2];
    if ((c.v === "venir" || c.v === "ir") && / hier[.!?]*$/.test(rest)) rest = rest.replace(/ hier([.!?]*)$/, " hierher$1");
    return cap(imp) + rest;
  }
  function impFr(out, c) {
    out = String(out).replace(/[.!?]+$/, "");
    var CL = { me: "moi", te: "toi", lui: "lui", nous: "nous", vous: "vous", leur: "leur" };
    var pm = /^Tu (ne )?(me|te|nous|vous) (le|la|les|l') ?(\S+)(.*)$/.exec(out) || null, pl2 = /^Tu (ne )?(le|la|les|l') ?(lui|leur) (\S+)(.*)$/.exec(out) || null;
    if (pm || pl2) {
      var kio, kd, kv, kr, kn;
      if (pm) { kn = pm[1]; kio = pm[2]; kd = pm[3]; kv = pm[4]; kr = pm[5]; } else { kn = pl2[1]; kd = pl2[2]; kio = pl2[3]; kv = pl2[4]; kr = pl2[5]; }
      var kcl = c && c.o && c.o.p === 5 ? "les" : (c && c.o && c.o.g === "f" ? "la" : "le");
      var kvi = frImpOf(kv); if (!kvi || !/^[a-zéèêëàâîïôùûç]+$/.test(kv)) return null;
      var KM = { me: "moi", te: "toi", nous: "nous", vous: "vous", lui: "lui", leur: "leur" };
      if (kn) return "Ne " + (kio === "me" || kio === "te" ? kio : kio) + " " + kcl + " " + kvi + kr;
      return cap(kvi) + "-" + kcl + "-" + KM[kio] + kr;
    }
    if (c && c.o && c.o.k === "pron" && c.o.p === 2 || c && c.o && c.o.k === "pron" && c.o.p === 5) {
      var lm = /^Tu (ne )?(le |la |les |l')(\S+)(.*)$/.exec(out);
      if (lm) {
        var lcl = c.o.p === 5 ? "les" : (c.o.g === "f" ? "la" : "le");
        var lv = frImpOf(lm[3]); if (!lv || !/^[a-zéèêëàâîïôùûç]+$/.test(lm[3])) return null;
        if (lm[1]) return "Ne " + (/^[aeiouhéèêàâîôù]/i.test(lv) && lcl !== "les" ? "l'" : lcl + " ") + lv + lm[4];
        return cap(lv) + "-" + lcl + lm[4];
      }
    }
    var mc = /^Tu (ne )?(me |te |lui |nous |vous |leur |m'|t')(\S+)(.*)$/.exec(out);
    if (mc) {
      var vi = frImpOf(mc[3]); if (!vi || !/^[a-zéèêëàâîïôùûç]+$/.test(mc[3])) return null;
      var cl = mc[2].trim().replace(/'$/, "");
      if (cl === "m") cl = "me"; if (cl === "t") cl = "te";
      if (mc[1]) return "Ne " + (/^[aeiouhéèêàâîôù]/i.test(vi) && (cl === "me" || cl === "te") ? cl.charAt(0) + "'" : cl + " ") + vi + mc[4];
      return cap(vi) + "-" + CL[cl] + mc[4];
    }
    var m = /^Tu (ne |n')?(\S+)(.*)$/.exec(out);
    if (!m) return null;
    var v = m[2];
    if (/'|^(le|la|les|me|te|se|nous|vous|lui|leur|y|en)$/.test(v) || !/^[a-zéèêëàâîïôùûç]+$/.test(v)) return null;
    var imp = frImpOf(v); if (!imp) return null;
    var neg = m[1] ? (m[1] === "n'" ? "n'" : "ne ") : "";
    return cap(neg + imp) + m[3];
  }
  function impEs(out, c) {
    var tu = C.esForm(c.v, "pres", 1), el = C.esForm(c.v, "pres", 2);
    if (!tu || !el || c.never) return null;
    var body = out.replace(/^Tú /, "").replace(/[.!]+$/, "");
    var CLS = "me|te|se|le|nos|os|les|lo|la|los|las";
    if (c.neg) {
      var ng = esNegOf(c.v); if (!ng) return null;
      var mn = new RegExp("^no (?:((?:" + CLS + ")(?: (?:lo|la|los|las))?) )?(\\S+)(.*)$", "i").exec(body);
      if (!mn || mn[2].toLowerCase() !== tu.toLowerCase()) return null;
      return "¡No " + (mn[1] ? mn[1].toLowerCase() + " " : "") + ng + mn[3].replace(/[.!]+$/, "") + "!";
    }
    var mp = new RegExp("^(?:((?:" + CLS + ")(?: (?:lo|la|los|las))?) )?(\\S+)(.*)$", "i").exec(body);
    if (!mp || mp[2].toLowerCase() !== tu.toLowerCase()) return null;
    var imp = esImpOf(c.v), w = mp[1] ? esEnclitic(imp, mp[1].toLowerCase().replace(" ", "")) : imp;
    return "¡" + cap(w) + mp[3].replace(/[.!]+$/, "") + "!";
  }
  function impEn(out) {
    var m = /^You (don't |do not )?(.*)$/.exec(out);
    if (!m) return null;
    var body = m[2].replace(/[.!]+$/, "");
    return (m[1] ? "Don't " : "") + (m[1] ? body : cap(body)) + "!";
  }
  function imp(out, to, c) {
    if (!out) return null;
    var r = null;
    if (to === "de") r = impDe(out, c); else if (to === "fr") r = impFr(out, c); else if (to === "es") r = impEs(out, c); else if (to === "en") r = impEn(out);
    if (!r) return null;
    if (to === "es") return r;
    return r.replace(/[.?!]+$/, "") + "!";
  }
  function genEnW(c) { var o = genEn(c); if (o && c && c.v === "mirar" && c.o && !(c.o.k === "n" && /^(televisión|película|partido|programa|serie)$/.test(c.o.n))) o = o.replace(/\bwatches\b/, "looks at").replace(/\bwatching\b/, "looking at").replace(/\bwatched\b/, "looked at").replace(/\bwatch\b/, "look at"); if (o && c && c.v === "decir" && c.io) o = o.replace(/\bsays\b/, "tells").replace(/\bsay\b/, "tell").replace(/\bsaid\b/, "told").replace(/\bsaying\b/, "telling"); return o; }
  function genDeW(c) { if (c && c.v === "escuchar" && c.o && c.o.k === "n" && c.o.det === "none") c = Object.assign({}, c, { o: Object.assign({}, c.o, { det: "def" }) }); return genDe(c); }
  return { en: genEnW, de: genDeW, fr: genFr, es: genEs, imp: imp, impOf: { es: esImpOf, esNeg: esNegOf, de: deImpOf, fr: frImpOf }, nounEntry: nounEntry, GEN: GEN };
})();
