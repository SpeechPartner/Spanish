// Gespreksgids Spaans: logica en weergave.
(function () {
  "use strict";

  var IS_ES = true;   // dit is de Spaanse app (de andere apps delen dezelfde logica via bron-nieuwe-talen)
  // Opzoektabellen zonder ingebouwde eigenschappen (zodat een woord als "constructor" niets oplevert)
  function nullProto(o) { Object.setPrototypeOf(o, null); return o; }
  [GLOSS, WHEN, BUILD_STEMS, DICTS.nl, DICTS.en, DICTS.de, DICTS.fr,
    REVS.nl, REVS.en, REVS.de, REVS.fr,
    PHRASES_BY_LANG.nl, PHRASES_BY_LANG.en, PHRASES_BY_LANG.de, PHRASES_BY_LANG.fr].forEach(nullProto);

  var LANGS = ["nl", "en", "de", "fr"];
  var TABS = [
    ["zinnen", "Zinnen"], ["onderwerpen", "Onderwerpen"], ["vastlopen", "Vastlopen"],
    ["bouwen", "Zin bouwen"], ["reageren", "Reageren"], ["leren", "Leren"],
    ["regels", "Regels"], ["gesprek", "Gesprek"], ["uitspraak", "Uitspraak"], ["info", "Info"],
    ["shop", "Webshop"]
  ];

  // ---------- Opslag op het toestel ----------
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem("gg_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) { try { localStorage.setItem("gg_" + k, JSON.stringify(v)); } catch (e) {} }
  };

  // Of dit een verse kopie op het beginscherm is, moet bepaald worden vóór de app iets opslaat
  var FRESH_COPY = (function () {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k.indexOf("gg_") !== 0) continue;
      if (k === "gg_bezocht_web" || k.indexOf("gg_nieuw-") === 0 || k === "gg_toegevoegd") continue;
      return false;
    }
    return true;
  })();

  // Taal van de telefoon (eerste keer openen): de eerste systeemtaal die als uitlegtaal beschikbaar is
  function systeemTaal(lijst) {
    var ls = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < ls.length; i++) { var c = String(ls[i] || "").slice(0, 2).toLowerCase(); if (lijst.indexOf(c) >= 0) return c; }
    return null;
  }
  var lang = store.get("lang", null) || systeemTaal(LANGS) || "nl";
  if (LANGS.indexOf(lang) < 0) lang = "nl";
  if (LANGS.indexOf(lang) < 0) lang = "nl";
  var theme = store.get("theme", "standaard");
  if (theme === "nacht") theme = "donker"; // het Nachtlampje is vervallen: opgeslagen keuzes vallen terug op de donkere modus
  var rate = parseFloat(store.get("rate", 0.9)) || 0.9;

  // ---------- Toestand ----------
  // Eerste keer openen: start op Info (uitleg). Daarna altijd op de hoofdpagina (Zinnen).
  // Het startscherm van de telefoon (losse app) heeft een eigen 'eerste keer', los van de browser (Safari).
  var inApp = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
  var visitKey = inApp ? "bezocht_app" : "bezocht_web";
  var firstVisit = !store.get(visitKey, false);
  store.set(visitKey, true);
  var S = {
    tab: firstVisit ? "info" : "zinnen", cat: "Gesprek openen", stuck: 0, build: null,
    rKind: "vraag", rOpen: null, rSub: null, rAns: {},
    lMode: "kaarten", lIdx: 0, lShow: false, quiz: null, score: [0, 0],
    convo: [], note: "", listening: false, rec: null
  };

  // ---------- Hulpfuncties ----------
  function T(k) { var u = UI[k]; return u ? (u[lang] || u.nl) : k; }
  function L(o) {
    if (o === undefined || o === null) return "";
    if (typeof o === "string") return o;
    return o[lang] || o.nl;
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) e.textContent = text;
    return e;
  }
  function btn(label, cls, fn) {
    var b = el("button", "btn" + (cls ? " " + cls : ""), label);
    b.type = "button";
    b.onclick = fn;
    return b;
  }
  function speakBtn(text) {
    var b = el("button", "speak", "🔊");
    b.type = "button";
    b.title = T("Luister");
    b.setAttribute("aria-label", T("Luister"));
    b.onclick = function () { speak(text); };
    return b;
  }
  function shuffle(a) {
    var c = a.slice();
    for (var i = c.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = c[i]; c[i] = c[j]; c[j] = t;
    }
    return c;
  }
  // Vergelijkbare schrijfwijze: kleine letters, zonder leestekens
  function clean(s) {
    return String(s).toLowerCase().replace(/[¿¡?!.,;:…"“”()]+/g, " ").replace(/\s+/g, " ").trim();
  }

  // ---------- Voorlezen (Spaans) ----------
  // Score per stem: natuurlijke of verbeterde stemmen eerst (die klinken minder mechanisch), daarna Spaans uit Spanje.
  function voiceScore(v) {
    var s = 0, n = v.name || "";
    if (/enhanced|premium|natural|neural|mejorad|premium|online|google|microsoft/i.test(n)) s += 4;
    if (/^es-ES/i.test(v.lang)) s += 2; else if (/^es/i.test(v.lang)) s += 1;
    if (v.localService === false) s += 1;
    return s;
  }
  function spanishVoices() {
    var vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    return vs.filter(function (v) { return /^es/i.test(v.lang); });
  }
  function pickVoice() {
    var es = spanishVoices(), saved = store.get("stem", "");
    for (var i = 0; i < es.length; i++) if (saved && es[i].name === saved) return es[i];
    var best = null, bs = -1;
    es.forEach(function (v) { var sc = voiceScore(v); if (sc > bs) { best = v; bs = sc; } });
    return best;
  }
  // Eerst de natuurlijke Piper-stem; zolang die niet klaar is of faalt, de ingebouwde stem.
  function speak(text) {
    if (window.PiperTTS && PiperTTS.speak(text, "es", rate, function () { speakBuiltIn(text); })) return;
    speakBuiltIn(text);
  }
  function speakBuiltIn(text) {
    if (!("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = "es-ES";
      u.rate = rate;
      var v = pickVoice();
      if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  // ---------- Begrepen items en gekende kaarten ----------
  function isUnderstood(k) { return store.get("begrepen", []).indexOf(k) >= 0; }
  function markUnderstood(k) {
    var a = store.get("begrepen", []);
    if (a.indexOf(k) < 0) a.push(k);
    store.set("begrepen", a);
  }
  function understoodCheckbox(k) {
    var lab = el("label");
    var cb = document.createElement("input");
    cb.type = "checkbox";
    cb.onchange = function () { markUnderstood(k); render(); };
    lab.appendChild(cb);
    lab.appendChild(document.createTextNode(" " + T("Begrijp ik, niet meer tonen")));
    return lab;
  }

  // ---------- Alle zinnen als één lijst (voor Leren en vertalen) ----------
  var ITEMS = null;
  function allItems() {
    if (ITEMS) return ITEMS;
    var out = [], seen = {};
    function add(es, mm) { if (!es || seen[es]) return; seen[es] = true; out.push({ es: es, m: mm }); }
    Object.keys(PHRASES).forEach(function (k) { PHRASES[k].forEach(function (x) { add(x.es, x.m); }); });
    STUCK.forEach(function (x) { add(x.es, x.m); });
    TOPICS.forEach(function (x) { add(x.es, x.m); });
    PATTERNS.forEach(function (x) { add(x.ex.es, x.ex.m); });
    REACT.forEach(function (e) {
      add(e.es, e.m);
      e.styles.forEach(function (s) { add(s[1], s[2]); });
      e.vervolg.forEach(function (v) { add(v.es, v.m); v.styles.forEach(function (s) { add(s[1], s[2]); }); });
    });
    ITEMS = out;
    return out;
  }

  // Andere manieren om een zin te zeggen (uit de tabel ALT in content.js)
  var ALT_BY_KEY = {};
  Object.keys(ALT).forEach(function (k) { ALT_BY_KEY[normKey(k)] = ALT[k]; });
  function normKey(s) { return String(s || "").toLowerCase().replace(/[¿?¡!.,;:]/g, "").replace(/\s+/g, " ").trim(); }
  function altsFor(es) { return ALT_BY_KEY[normKey(es)] || []; }
  function altBlock(list) {
    var wrap = el("div", "alts");
    wrap.appendChild(el("div", "nl", T("Andere manieren om dit te zeggen:")));
    list.forEach(function (x) {
      var r = el("div", "line-row");
      var t = el("div", "txt");
      t.appendChild(el("div", "es", x.es));
      t.appendChild(el("div", "nl", L(x.m)));
      if (ALT_NOTE[x.es]) t.appendChild(el("div", "nl", "⚠ " + L(ALT_NOTE[x.es])));
      r.appendChild(t);
      r.appendChild(speakBtn(x.es));
      wrap.appendChild(r);
    });
    return wrap;
  }

  // ---------- Woord voor woord en uitleg ----------
  function explainBox(es, opts) {
    var box = el("div", "explain");
    var words = clean(es).split(" ").filter(Boolean);
    var parts = words.map(function (w) {
      var g = GLOSS[w];
      return w + " = " + (g ? L(g) : "?");
    });
    if (words.length) box.appendChild(el("div", "", T("Woord voor woord:") + " " + parts.join(" · ")));
    if (WHEN[es]) box.appendChild(el("div", "", T("Wanneer zeg je dit:") + " " + L(WHEN[es])));
    if (altsFor(es).length) box.appendChild(altBlock(altsFor(es)));
    if (!(opts && opts.noUnderstood)) box.appendChild(understoodCheckbox(es));
    return box;
  }

  // Eén zin als kaart (Spaans, vertaling, luisteren, uitleg, optionele knop)
  function phraseCard(it, extra) {
    if (isUnderstood(it.es)) return null;
    var card = el("div", "card");
    var line = el("div", "line-row");
    var tx = el("div", "txt");
    tx.appendChild(el("div", "es", it.es));
    tx.appendChild(el("div", "nl", L(it.m)));
    line.appendChild(tx);
    line.appendChild(speakBtn(it.es));
    card.appendChild(line);
    card.appendChild(explainBox(it.es));
    if (extra) card.appendChild(extra);
    return card;
  }

  // Wisselkaart: elke 2,5 seconde een nieuwe zin. Vegen wisselt zelf; tikken start het gesprek in Gesprek.
  var carTimer = null;
  function openersCard() {
    var card = el("div", "card carousel");
    var i = 0, sx = null, moved = false;
    function show() {
      var o = OPENERS[i];
      card.innerHTML = "";
      var line = el("div", "line-row");
      var tx = el("div", "txt");
      tx.appendChild(el("div", "es", o.es));
      tx.appendChild(el("div", "nl", L(o.m)));
      line.appendChild(tx);
      var sp = speakBtn(o.es);
      sp.addEventListener("click", function (e) { e.stopPropagation(); });
      line.appendChild(sp);
      card.appendChild(line);
      var dots = el("div", "dots");
      OPENERS.forEach(function (_, k) { dots.appendChild(el("span", "dot" + (k === i ? " on" : ""))); });
      card.appendChild(dots);
      card.appendChild(el("div", "note", T("Tik op de zin om in Gesprek verder te gaan. Veeg om te wisselen.")));
    }
    function stop() { if (carTimer) { clearInterval(carTimer); carTimer = null; } }
    function next(d) { i = (i + d + OPENERS.length) % OPENERS.length; show(); }
    function start() {
      stop();
      carTimer = setInterval(function () {
        if (!document.body.contains(card)) { stop(); return; }
        next(1);
      }, 2500);
    }
    card.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; moved = false; }, { passive: true });
    card.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      sx = null;
      if (Math.abs(dx) > 40) { moved = true; next(dx < 0 ? 1 : -1); start(); }
    });
    card.addEventListener("click", function () {
      if (moved) { moved = false; return; }
      stop();
      startOpenerChat(i);
    });
    show();
    start();
    return card;
  }

  // Na een nieuwe beurt: naar de onderkant, waar de opneemkaart staat.
  function scrollGesprekEnd() { setTimeout(function () { window.scrollTo(0, document.body.scrollHeight); }, 0); }

  // Een gekozen zin wordt jouw eerste beurt in het Gesprek-tabblad; het gesprek gaat daar verder.
  // Tik op een kaart-zin: die wordt je eigen beurt, de gesprekspartner antwoordt positief,
  // daarna kies je een hulpvraag. Alleen voor de wisselkaart; de vertaalbox blijft zoals hij was.
  function startOpenerChat(i) {
    if (carTimer) { clearInterval(carTimer); carTimer = null; }
    var me = { me: true, es: OPENERS[i].es, flow: true };
    S.convo.push(me);
    var rt = makeTurn(OPENER_REPLY[i].es);
    rt.fixedM = OPENER_REPLY[i].m; rt.flow = true; rt.help = true;
    rt.options = HELP_OPTIONS.map(function (h) { return { label: h.l, es: h.es, m: h.m }; });
    S.convo.push(rt);
    S.chatStartTurn = null;
    S.note = "";
    go("gesprek");
    scrollGesprekEnd();
  }

  // Gekozen hulpvraag: de rest verdwijnt, de microfoon gaat aan en het antwoord wordt vertaald.
  function pickHelp(t, o) {
    t.help = false; t.options = [];
    S.convo.push({ me: true, es: o.es, flow: true });
    S.note = "";
    startMic();
    if (S.listening) S.note = T("Wacht op het antwoord van de gesprekspartner. Tik op Stop als die klaar is.");
    render();
    scrollGesprekEnd();
  }

  function startChatWith(text) {
    if (carTimer) { clearInterval(carTimer); carTimer = null; }
    var t = { me: true, es: text };
    S.convo.push(t);
    S.chatStartTurn = t;
    S.note = "";
    go("gesprek");
  }

  // ---------- Navigatie en weergave van de vaste onderbalk ----------
  // ---------- Paginawissel als boek: het blad volgt de vinger; pas bij loslaten komt de volgende pagina ----------
  var TAB_ORDER = TABS.map(function (t) { return t[0]; });
  // Zinnen en Gesprek staan niet in de veeg-volgorde: die bereik je met een tik
  // Veeg-volgorde: Zinnen vooraan, Gesprek achteraan. Vastlopen en Info doen niet mee.
  var SWIPE_TABS = ["zinnen", "onderwerpen", "bouwen", "reageren", "leren", "regels", "uitspraak", "gesprek"];
  function tabIdx(t) { return TAB_ORDER.indexOf(t); }
  // Pagina wisselen: de knoppen onderaan verdwijnen en de nieuwe pagina verschijnt zacht.
  // Geen omslag-animatie meer.
  function flipTo(src, dir, apply) {
    if (window.speelsHideChrome) window.speelsHideChrome();
    apply();
    var v = document.getElementById("view");
    if (!v) return;
    v.classList.remove("page-in");
    void v.offsetWidth;
    v.classList.add("page-in");
    setTimeout(function () { v.classList.remove("page-in"); }, 450);
  }
  // Doel van een veeg: het tabblad (kind "tab") of het volgende blad van het boekje (kind "leaf").
  // Geeft de functie terug die de nieuwe pagina aanzet, of null als er geen volgende is.
  function navTarget(kind, dir) {
    if (kind === "leaf") {
      var bk = document.querySelector("#view .booklet");
      if (!bk) return null;
      var cur = +bk.dataset.cur, j = cur + dir;
      if (j < 0 || j >= +bk.dataset.n) return null;
      return function () { S.infoLeaf = j; render(); };
    }
    var k = SWIPE_TABS.indexOf(S.tab);
    if (k < 0) return null;
    var nt = SWIPE_TABS[k + dir];
    if (!nt) return null;
    return function () { S.tab = nt; S.build = null; render(); window.scrollTo(0, 0); };
  }
  function go(tab) {
    if (typeof prRelease === "function") prRelease();
    var view = document.getElementById("view");
    // Info werkt als schakelaar: tik je er nog eens op, dan ga je terug naar de pagina waar je vandaan kwam
    if (tab === "info" && S.tab === "info") {
      var back = S.backTab || "zinnen";
      var y = S.backY || 0;
      flipTo(view, tabIdx(back) > tabIdx("info") ? 1 : -1, function () { S.tab = back; S.build = null; render(); });
      window.scrollTo(0, y);
      return;
    }
    if (tab === "info") { S.backTab = S.tab; S.backY = window.scrollY; S.infoLeaf = 0; }
    if (tab === S.tab) { render(); window.scrollTo(0, 0); return; }
    var dir = tabIdx(tab) > tabIdx(S.tab) ? 1 : -1;
    flipTo(view, dir, function () { S.tab = tab; S.build = null; render(); });
    window.scrollTo(0, 0);
  }
  // Tik op een leeg stuk aan de uiterste zijkant van de pagina (de lege ruimte naast de kaarten):
  // links gaat terug, rechts gaat verder. Vegen wisselt niet meer van pagina.
  // Tik op een leeg stuk van de banner: het thema wisselt.
  var EDGE = 44;
  // Ligt de tik op de tekst van de titel (en niet op het lege stuk eromheen)?
  function onTitleText(e) {
    var h1 = document.querySelector("header.top h1");
    if (!h1) return false;
    var rg = document.createRange();
    rg.selectNodeContents(h1);
    var rects = rg.getClientRects();
    for (var i = 0; i < rects.length; i++) {
      var q = rects[i];
      if (e.clientX >= q.left - 6 && e.clientX <= q.right + 6 && e.clientY >= q.top - 6 && e.clientY <= q.bottom + 6) return true;
    }
    return false;
  }
  // Café heeft geen banner en Systeem is geen vaste kleur: die staan alleen in de instellingen
  var BANNER_THEMES = ["standaard", "ijs", "jungle", "ruimte"];
  function cycleTheme() {
    var opts = BANNER_THEMES;
    var i = opts.indexOf(theme);
    theme = opts[(i + 1) % opts.length];
    store.set("theme", theme);
    applyStatic();
  }
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest("button, a, input, textarea, select, details, label, nav, .dock, #navHandle, .carousel, .leafdots, #settings, .langmenu, .transout")) return;
    if (t.closest("header.top")) {
      // Tekst van de titel gaat naar het begin (zie hierboven); het lege stuk van de banner wisselt het thema
      if (t.closest("h1") && onTitleText(e)) return;
      cycleTheme();
      return;
    }
    var W = window.innerWidth, x = e.clientX;
    // Tik op een leeg stuk van de pagina: de knoppen onderaan verdwijnen
    if (x > EDGE && x < W - EDGE) { if (window.speelsHideChrome) window.speelsHideChrome(); return; }
    var dir = x >= W - EDGE ? 1 : -1;
    var apply = navTarget("tab", dir);
    if (apply) flipTo(null, dir, apply);
  });
  // Vier vaste tabbladen staan op een eigen plek: Zinnen links, Vastlopen boven, Gesprek rechts,
  // Info rechtsonder (boven de onderste balk). De rest blijft in de onderste balk.
  var DOCK_POS = { zinnen: "dock-l", vastlopen: "dock-t", gesprek: "dock-r", info: "dock-br" };
  function renderNav() {
    var nav = document.getElementById("nav");
    var dock = document.getElementById("dock");
    // Geen container (bijv. een oude index.html): maak hem zelf aan
    if (!dock) { dock = el("div", "dock"); dock.id = "dock"; document.body.appendChild(dock); }
    // Werkt de vaste stijl niet (bijv. speels.css ontbreekt), dan blijven de vier tabs gewoon in de onderste balk
    var dockOk = getComputedStyle(dock).position === "fixed";
    nav.innerHTML = "";
    dock.innerHTML = "";
    TABS.forEach(function (t) {
      if (t[0] === "info") return;   // Info staat niet meer onderaan: die opent u via het ?-knopje in de banner
      var where = DOCK_POS[t[0]] && dockOk ? dock : nav;
      var cls = DOCK_POS[t[0]] && dockOk ? "dock-btn " + DOCK_POS[t[0]] + (S.tab === t[0] ? " active" : "") : (S.tab === t[0] ? "active small" : "small");
      var b = btn(T(t[1]), cls, function () { go(t[0]); });
      b.setAttribute("data-v", String(TABS.indexOf(t) % 4));
      if (DOCK_POS[t[0]] && dockOk) b.setAttribute("aria-current", S.tab === t[0] ? "page" : "false");
      where.appendChild(b);
    });
    // Het belletje toont de knop van de geselecteerde pagina (zelfde ontwerp, met glans)
    // Het ?-knopje is geselecteerd als je op Info bent (witte tekst op de kleur van het thema of de vlag)
    var ib = document.getElementById("infoBtn");
    if (ib) ib.classList.toggle("on", S.tab === "info");
    var h = document.getElementById("navHandle");
    if (!h) { h = document.createElement("button"); h.id = "navHandle"; h.type = "button"; h.setAttribute("aria-label", "Menu tonen"); document.body.appendChild(h); }
    var cur = TABS.filter(function (t) { return t[0] === S.tab; })[0];
    h.textContent = S.tab === "info" ? T("Info") : (cur ? T(cur[1]) : "");
    h.classList.add("active");
  }

  // ---------- Zinnen ----------
  function viewZinnen() {
    var w = el("div");
    var row = el("div", "chips");
    Object.keys(PHRASES).forEach(function (cat) {
      row.appendChild(btn(T(cat), S.cat === cat ? "primary small" : "small", function () { S.cat = cat; render(); }));
    });
    w.appendChild(row);
    var canBuild = false;   // Zin bouwen heeft een eigen pagina
    var shown = 0;
    if (S.cat === "Gesprek openen") { w.appendChild(openersCard()); shown++; }
    PHRASES[S.cat].forEach(function (it) {
      var extra = null;
      if (canBuild && BUILD_STEMS[it.es]) {
        extra = el("div", "row");
        extra.appendChild(btn(T("Bouw verder →"), "primary small", function () {
          S.build = { start: it.es, startM: it.m, conn: null, subj: null, verb: null, neg: BUILD_STEMS[it.es].neg };
          render();
        }));
      }
      var c = phraseCard(it, extra);
      if (c) { w.appendChild(c); shown++; }
    });
    if (!shown) w.appendChild(el("div", "note", T("Alles in deze groep is begrepen. Zet de begrepen items terug in de instellingen.")));
    return w;
  }

  // ---------- Onderwerpen ----------
  function viewOnderwerpen() {
    var w = el("div");
    w.appendChild(el("div", "note", T("Stel zo'n vraag als het gesprek stilvalt. Lees hem hardop en luister na.")));
    TOPICS.forEach(function (it) { var c = phraseCard(it, null); if (c) w.appendChild(c); });
    return w;
  }

  // ---------- Vastlopen ----------
  function viewVastlopen() {
    var w = el("div");
    var idxs = STUCK.map(function (x, i) { return i; }).filter(function (i) { return !isUnderstood(STUCK[i].es); });
    if (!idxs.length) idxs = STUCK.map(function (x, i) { return i; });
    if (idxs.indexOf(S.stuck) < 0) S.stuck = idxs[0];
    var cur = STUCK[S.stuck];
    var big = el("div", "card big");
    big.appendChild(el("div", "big-es", cur.es));
    big.appendChild(el("div", "nl", L(cur.m)));
    w.appendChild(big);
    var row = el("div", "row");
    row.appendChild(btn("🔊 " + T("Luister"), "primary", function () { speak(cur.es); }));
    row.appendChild(btn(T("Andere zin"), "", function () {
      var cand = idxs.filter(function (i) { return i !== S.stuck; });
      if (cand.length) S.stuck = cand[Math.floor(Math.random() * cand.length)];
      render();
    }));
    w.appendChild(row);
    w.appendChild(el("h2", "", T("Zinnen")));
    STUCK.forEach(function (it) { var c = phraseCard(it, null); if (c) w.appendChild(c); });
    return w;
  }

  // ---------- Zin bouwen (vervolgmenu) ----------
  // Vervoegd werkwoord in de gebruikerstaal (de uitleg tussen haakjes), passend bij het gekozen voornaamwoord
  var GLOSS_VORM = {
    en: { ir: ["go", "go", "goes", "go", "go"], tener: ["have", "have", "has", "have", "have"], querer: ["want", "want", "wants", "want", "want"], estar: ["am", "are", "is", "are", "are"],
          trabajar: ["work", "work", "works", "work", "work"], hacer: ["do", "do", "does", "do", "do"], comer: ["eat", "eat", "eats", "eat", "eat"], ir_past: ["went", "went", "went", "went", "went"] },
    de: { ir: ["gehe", "gehst", "geht", "gehen", "gehen"], tener: ["habe", "hast", "hat", "haben", "haben"], querer: ["will", "willst", "will", "wollen", "wollen"], estar: ["bin", "bist", "ist", "sind", "sind"],
          trabajar: ["arbeite", "arbeitest", "arbeitet", "arbeiten", "arbeiten"], hacer: ["mache", "machst", "macht", "machen", "machen"], comer: ["esse", "isst", "isst", "essen", "essen"],
          ir_past: ["bin gegangen", "bist gegangen", "ist gegangen", "sind gegangen", "sind gegangen"] },
    fr: { ir: ["vais", "vas", "va", "allons", "vont"], tener: ["ai", "as", "a", "avons", "ont"], querer: ["veux", "veux", "veut", "voulons", "veulent"], estar: ["suis", "es", "est", "sommes", "sont"],
          trabajar: ["travaille", "travailles", "travaille", "travaillons", "travaillent"], hacer: ["fais", "fais", "fait", "faisons", "font"], comer: ["mange", "manges", "mange", "mangeons", "mangent"],
          ir_past: ["suis allé", "es allé", "est allé", "sommes allés", "sont allés"] },
    nl: { ir: ["ga", "gaat", "gaat", "gaan", "gaan"], tener: ["heb", "hebt", "heeft", "hebben", "hebben"], querer: ["wil", "wilt", "wil", "willen", "willen"], estar: ["ben", "bent", "is", "zijn", "zijn"],
          trabajar: ["werk", "werkt", "werkt", "werken", "werken"], hacer: ["doe", "doet", "doet", "doen", "doen"], comer: ["eet", "eet", "eet", "eten", "eten"], ir_past: ["ging", "ging", "ging", "gingen", "gingen"] }
  };
  function glossVorm(verb, subj, comp) {
    // Per aanvulling kan de Nederlandse uitleg een ander werkwoord hebben (een pauze nemen, het avondeten maken)
    if (lang === "nl" && comp && comp.vnl) return comp.vnl[subj.i];
    var g = GLOSS_VORM[lang], base = L(verb.m);
    if (!g || !g[verb.id]) return base;
    var f = g[verb.id][subj.i];
    if (lang === "fr" && verb.id === "ir_past" && subj.es === "ella") f += "e";
    var pm = /\s*(\([^)]*\))\s*$/.exec(base);   // bijv. "(toestand)" blijft staan
    return f + (pm ? ", " + pm[1].slice(1, -1) : "");   // "ben (toestand)" wordt "ben, toestand" (geen dubbele haakjes in de knop)
  }
  function verbFormEs(v, s) { return v.forms[s.i]; }
  function viewBuilder() {
    var b = S.build;
    var st = BUILD_STEMS[b.start];
    var w = el("div");
    var head = el("div", "card big");
    head.appendChild(el("div", "big-es", st.stem + " …"));
    head.appendChild(el("div", "nl", L(st.stemM) + " …"));
    w.appendChild(head);

    var top = el("div", "chips");
    top.appendChild(btn(T("← Terug naar lijst"), "small", function () { S.build = null; render(); }));
    top.appendChild(btn(T("Ontkennend (no)"), b.neg ? "primary small" : "small", function () { b.neg = !b.neg; render(); }));
    w.appendChild(top);

    // Alleen de verbindingswoorden die na deze startzin logisch zijn (conns in BUILD_STEMS)
    var okConn = st.conns || CONN.map(function (c, ci) { return ci; });
    if (b.conn !== null && okConn.indexOf(b.conn) < 0) b.conn = null;
    if (okConn.length) {
      w.appendChild(el("h2", "", T("1. Verbindingswoord (optioneel)")));
      var cr = el("div", "chips");
      cr.appendChild(btn(T("geen"), b.conn === null ? "primary small" : "small", function () { b.conn = null; render(); }));
      CONN.forEach(function (c, ci) {
        if (okConn.indexOf(ci) < 0) return;
        cr.appendChild(btn(c.es + " (" + L(c.m) + ")", b.conn === ci ? "primary small" : "small", function () { b.conn = ci; render(); }));
      });
      w.appendChild(cr);
    }

    w.appendChild(el("h2", "", T("2. Wie?")));
    var sr = el("div", "chips");
    SUBJ.forEach(function (s, si) {
      sr.appendChild(btn(s.es + " (" + L(s.m) + ")", b.subj === si ? "primary small" : "small", function () { b.subj = si; b.verb = null; render(); }));
    });
    w.appendChild(sr);
    if (b.subj === null) return w;

    w.appendChild(el("h2", "", T("3. Wat doet die persoon?")));
    var vr = el("div", "chips");
    VERBS.forEach(function (v) {
      if (isUnderstood("verb:" + v.id)) return;
      vr.appendChild(btn(verbFormEs(v, SUBJ[b.subj]) + " (" + glossVorm(v, SUBJ[b.subj]) + ")", b.verb === v.id ? "primary small" : "small", function () { b.verb = v.id; render(); }));
    });
    w.appendChild(vr);
    if (b.verb === null) return w;

    var subj = SUBJ[b.subj];
    var verb = null;
    VERBS.forEach(function (v) { if (v.id === b.verb) verb = v; });

    w.appendChild(el("h2", "", T("4. Kies het afmaakdeel")));
    var hint = el("div", "card");
    hint.appendChild(el("div", "nl", L(VERB_HINT[verb.id])));
    hint.appendChild(understoodCheckbox("verb:" + verb.id));
    w.appendChild(hint);

    verb.comps.forEach(function (comp) {
      // Zonder verbindingswoord: stam + zin (Creo que yo voy al cine).
      // Met verbindingswoord: de hele startzin + verbindingswoord + zin (Creo que sí, porque yo voy al cine).
      var clause = [subj.es];
      if (b.neg) clause.push("no");
      clause.push(verb.forms[subj.i]);
      clause.push(comp.es);
      var NEG_M = { nl: "niet", en: "not", de: "nicht", fr: "ne … pas" };
      var gloss = L(subj.m) + (b.neg ? " · " + L(NEG_M) : "") + " · " + glossVorm(verb, subj, comp) + " · " + L(comp.m);
      if (lang === "fr") gloss = gloss.replace(/^je · (?=[aeéiouhàâ])/i, "j'").replace(/^Je · (?=[aeéiouhàâ])/, "J'");   // j'ai (elisie)
      var es, nlParts;
      if (b.conn !== null) {
        var base = b.start.replace(/[.…\s]+$/, "");
        es = base + ", " + CONN[b.conn].es + " " + clause.join(" ") + ".";
        var baseM = b.startM ? String(L(b.startM)).replace(/[.…\s]+$/, "") : L(st.stemM);
        nlParts = baseM + ", " + L(CONN[b.conn].m) + " · " + gloss;
      } else {
        es = st.stem + " " + clause.join(" ") + ".";
        nlParts = L(st.stemM) + " · " + gloss;
      }
      var card = el("div", "card");
      var line = el("div", "line-row");
      var tx = el("div", "txt");
      tx.appendChild(el("div", "es", es));
      tx.appendChild(el("div", "nl", nlParts));
      line.appendChild(tx);
      line.appendChild(speakBtn(es));
      card.appendChild(line);
      w.appendChild(card);
    });
    return w;
  }

  // ---------- Zin bouwen: patronen en analyse ----------
  function viewBouwen() {
    var w = el("div");
    var stems = IS_ES ? BUILD_STEMS : globalThis.BOUW_SRC.stems, cats = IS_ES ? BUILDABLE_CATS : globalThis.BOUW_SRC.cats;
    w.appendChild(el("div", "note", IS_ES ? T("Kies een startzin en bouw hem verder.") : T("Kies een startzin en bouw hem verder. Lukt de zin niet grammaticaal in deze taal, dan zie je alleen de woorden.")));
    var any = 0;
    cats.forEach(function (cat) {
      (PHRASES[cat] || []).forEach(function (it) {
        var src = it.bron !== undefined ? it.bron : it.es;
        if (!stems[src] || isUnderstood(it.es)) return;
        var row = el("div", "row");
        row.appendChild(btn(T("Bouw verder →"), "primary small", function () {
          S.build = { start: src, startM: it.m, startTx: it.es, conn: null, subj: null, verb: null, neg: stems[src].neg };
          S.tab = "bouwen"; render();
        }));
        var c = phraseCard(it, row);
        if (c) { w.appendChild(c); any++; }
      });
    });
    if (!any) w.appendChild(el("div", "note", T("Alles in deze groep is begrepen. Zet de begrepen items terug in de instellingen.")));
    return w;
  }

  // ---------- Leren > Patronen: patroon invullen en je eigen zin ----------
  function viewPatronen() {
    var w = el("div");
    w.appendChild(el("h2", "", T("Patronen")));
    w.appendChild(el("div", "note", T("Vul het patroon in met woorden die je al kent, en lees je zin hardop voor.")));
    (IS_ES ? PATTERNS : (globalThis.PATRONEN || [])).forEach(function (pt) {
      var c = el("div", "card");
      c.appendChild(el("div", "sec-title", L(pt.label)));
      var line = el("div", "line-row");
      var tx = el("div", "txt");
      tx.appendChild(el("div", "es", pt.ex.es));
      tx.appendChild(el("div", "nl", L(pt.ex.m)));
      line.appendChild(tx);
      line.appendChild(speakBtn(pt.ex.es));
      c.appendChild(line);
      if (IS_ES) c.appendChild(explainBox(pt.ex.es, { noUnderstood: true }));
      w.appendChild(c);
    });

    w.appendChild(el("h2", "", T("Jouw zin")));
    var ta = document.createElement("textarea");
    ta.className = "big-input";
    ta.placeholder = T("Typ hier je zin in het Spaans…");
    w.appendChild(ta);
    var out = el("div");
    var row = el("div", "row");
    row.appendChild(btn("🔊 " + T("Luister"), "primary", function () { if (ta.value.trim()) speak(ta.value.trim()); }));
    if (IS_ES) row.appendChild(btn(T("Analyseer mijn zin"), "primary", function () {
      out.innerHTML = "";
      out.appendChild(analyse(ta.value));
    }));
    row.appendChild(btn(T("Wis"), "", function () { ta.value = ""; out.innerHTML = ""; }));
    w.appendChild(row);
    w.appendChild(out);
    return w;
  }

  // Werkwoordsvormen die de analyse herkent
  var FORM_MAP = nullProto({});
  function addForm(f, inf, person, forms) {
    if (!FORM_MAP[f]) FORM_MAP[f] = [];
    FORM_MAP[f].push({ inf: inf, person: person, forms: forms });
  }
  VERBS.forEach(function (v) { v.forms.forEach(function (f, i) { addForm(f, v.inf, i, v.forms); }); });
  ANA_EXTRA.forEach(function (v) { v.forms.forEach(function (f, i) { addForm(f, v.inf, i, v.forms); }); });

  var ANA_SUBJ = nullProto({ "yo": 0, "tú": 1, "él": 2, "ella": 2, "usted": 2, "nosotros": 3, "nosotras": 3, "ellos": 4, "ellas": 4, "ustedes": 4 });
  var OBJ_PRON = ["me", "te", "le", "nos", "les"];
  var QWORDS = nullProto({ "como": "cómo", "donde": "dónde", "cuando": "cuándo", "quien": "quién", "quienes": "quiénes", "cual": "cuál", "cuanto": "cuánto", "cuanta": "cuánta", "que": "qué" });
  var NOUN_G = nullProto({ "café": "m", "cine": "m", "parque": "m", "examen": "m", "tiempo": "m", "trabajo": "m", "amigo": "m", "médico": "m", "pan": "m", "libro": "m", "mercado": "m", "restaurante": "m", "fin": "m", "hermano": "m", "supermercado": "m", "colegio": "m", "película": "f", "casa": "f", "playa": "f", "ciudad": "f", "semana": "f", "fruta": "f", "vida": "f", "fiesta": "f", "comida": "f", "cena": "f", "escuela": "f", "universidad": "f", "familia": "f", "hermana": "f", "amiga": "f" });
  var ADJ_STEMS = ["cansad", "content", "preocupad", "nervios", "enferm", "trist", "emocionad"];
  var NAT = ["holandés", "holandesa", "español", "española", "francés", "francesa", "alemán", "alemana", "inglés", "inglesa", "italiano", "italiana"];
  var STATE = ["cansado", "cansada", "contento", "contenta", "preocupado", "preocupada", "nervioso", "nerviosa", "enfermo", "enferma", "triste", "emocionado", "emocionada"];
  var TIME = ["hoy", "ayer", "mañana", "siempre", "ahora", "después", "luego", "anoche", "semana", "fin"];

  function analyse(text) {
    var raw = (text || "").trim();
    var frag = el("div");
    if (!raw) {
      frag.appendChild(el("div", "card", T("Typ eerst een zin, dan analyseer ik hem.")));
      return frag;
    }
    var toks = raw.split(/\s+/).map(function (t) {
      var pre = (t.match(/^[¿¡]+/) || [""])[0];
      var suf = (t.match(/[?!.,;:]+$/) || [""])[0];
      var core = t.slice(pre.length, t.length - suf.length);
      return { pre: pre, core: core, suf: suf, low: core.toLowerCase(), fix: null };
    });
    var words = toks.map(function (t) { return t.low; });
    var good = [], bad = [], tips = [], grow = [];

    function seq(arr) {
      for (var i = 0; i <= words.length - arr.length; i++) {
        var ok = true;
        for (var k = 0; k < arr.length; k++) { if (words[i + k] !== arr[k]) { ok = false; break; } }
        if (ok) return i;
      }
      return -1;
    }
    function isInf(w) { return !!w && w.length > 3 && /(ar|er|ir)$/.test(w); }
    function has(list) { return words.some(function (w) { return list.indexOf(w) >= 0; }); }

    // Vraagtekens en vraagwoorden
    var hasQ = raw.indexOf("?") >= 0;
    var hasOpen = raw.indexOf("¿") >= 0;
    if (hasQ && !hasOpen) {
      bad.push({ nl: "Vragen beginnen in het Spaans met een omgekeerd vraagteken (¿).", en: "Questions in Spanish start with an upside-down question mark (¿).", de: "Fragen beginnen im Spanischen mit einem umgekehrten Fragezeichen (¿).", fr: "En espagnol, les questions commencent par un point d'interrogation renversé (¿)." });
      toks[0].pre = "¿" + toks[0].pre;
    }
    if (hasOpen && !hasQ) {
      bad.push({ nl: "Een vraag die met ¿ begint, eindigt met ?.", en: "A question that starts with ¿ ends with ?.", de: "Eine Frage, die mit ¿ beginnt, endet mit ?.", fr: "Une question qui commence par ¿ se termine par ?." });
      toks[toks.length - 1].suf += "?";
    }
    if ((hasQ || hasOpen) && QWORDS[toks[0].low] && !/[áéíóúñ]/i.test(toks[0].core)) {
      var rep = QWORDS[toks[0].low];
      if (/^[A-ZÁÉÍÓÚÑ]/.test(toks[0].core)) rep = rep.charAt(0).toUpperCase() + rep.slice(1);
      toks[0].fix = rep;
      bad.push({ nl: "Vraagwoorden krijgen een accent: " + rep + ".", en: "Question words take an accent: " + rep + ".", de: "Fragewörter bekommen einen Akzent: " + rep + ".", fr: "Les mots interrogatifs prennent un accent : " + rep + "." });
    }

    // Onderwerp en werkwoord
    var subjIdx = -1, subjP = null;
    toks.forEach(function (t, i) {
      if (subjIdx < 0 && ANA_SUBJ[t.low] !== undefined && OBJ_PRON.indexOf(words[i - 1]) < 0) {
        subjIdx = i; subjP = ANA_SUBJ[t.low];
      }
    });
    // Het werkwoord dat bij het onderwerp hoort, is het eerste werkwoord NA dat onderwerp
    // (in "Creo que él va" hoort él bij va, niet bij creo).
    var verbIdx = -1;
    toks.forEach(function (t, i) { if (verbIdx < 0 && FORM_MAP[t.low] && i > subjIdx) verbIdx = i; });
    var pairWithSubj = subjIdx >= 0 && verbIdx >= 0;
    if (verbIdx < 0) toks.forEach(function (t, i) { if (verbIdx < 0 && FORM_MAP[t.low]) verbIdx = i; });
    toks.forEach(function (t, i) {
      if (i !== verbIdx) return;
      var cands = FORM_MAP[t.low];
      var c0 = cands[0];
      if (!pairWithSubj) {
        // Staat er een zelfstandig naamwoord als onderwerp voor (La película es...), dan is er niets weggelaten.
        var nounSubj = toks.slice(0, i).some(function (x) { return ["el", "la", "los", "las", "un", "una", "mi", "tu", "su", "mis", "tus", "sus", "este", "esta"].indexOf(x.low) >= 0; });
        if (nounSubj) {
          good.push({ nl: t.core + " is een vorm van " + c0.inf + ".", en: t.core + " is a form of " + c0.inf + ".", de: t.core + " ist eine Form von " + c0.inf + ".", fr: t.core + " est une forme de " + c0.inf + "." });
          return;
        }
        good.push({ nl: t.core + " is een vorm van " + c0.inf + ". Het onderwerp is weggelaten, dat kan als de vorm duidelijk is.", en: t.core + " is a form of " + c0.inf + ". The subject is left out, which is fine when the form is clear.", de: t.core + " ist eine Form von " + c0.inf + ". Das Subjekt fehlt, das geht, wenn die Form klar ist.", fr: t.core + " est une forme de " + c0.inf + ". Le sujet est omis, ce qui va si la forme est claire." });
        return;
      }
      var matches = cands.some(function (c) { return c.person === subjP; });
      if (matches) {
        good.push({ nl: toks[subjIdx].core + " en " + t.core + " kloppen (" + c0.inf + ").", en: toks[subjIdx].core + " and " + t.core + " match (" + c0.inf + ").", de: toks[subjIdx].core + " und " + t.core + " passen zusammen (" + c0.inf + ").", fr: toks[subjIdx].core + " et " + t.core + " vont ensemble (" + c0.inf + ")." });
      } else {
        var corr = c0.forms[subjP];
        bad.push({ nl: "Bij " + toks[subjIdx].core + " hoort " + corr + " (van " + c0.inf + "), niet " + t.core + ".", en: "With " + toks[subjIdx].core + " you need " + corr + " (from " + c0.inf + "), not " + t.core + ".", de: "Zu " + toks[subjIdx].core + " gehört " + corr + " (von " + c0.inf + "), nicht " + t.core + ".", fr: "Avec " + toks[subjIdx].core + ", il faut " + corr + " (de " + c0.inf + "), pas " + t.core + "." });
        t.fix = corr;
      }
    });

    // Gustar
    var gi = -1;
    words.forEach(function (w, i) { if (gi < 0 && (w === "gusta" || w === "gustan")) gi = i; });
    if (gi >= 0) {
      var prev = words[gi - 1];
      if (prev !== undefined && ANA_SUBJ[prev] !== undefined && OBJ_PRON.indexOf(prev) < 0) {
        var a = toks[gi - 1].core, bb = toks[gi].core;
        bad.push({ nl: "Bij gustar is het onderwerp het ding dat je leuk vindt, niet jij. Zeg: me gusta... (niet " + a + " " + bb + ").", en: "With gustar, the subject is the thing you like, not you. Say: me gusta... (not " + a + " " + bb + ").", de: "Bei gustar ist das Subjekt die Sache, die dir gefällt, nicht du. Sag: me gusta... (nicht " + a + " " + bb + ").", fr: "Avec gustar, le sujet est la chose qui te plaît, pas toi. Dis : me gusta... (pas " + a + " " + bb + ")." });
        toks[gi - 1].fix = "me";
      } else if (prev === undefined || OBJ_PRON.indexOf(prev) < 0) {
        tips.push({ nl: "Bij gustar zet je een voornaamwoord ervoor: me (mij), te (jou), le (hem, haar, u), nos (ons) of les (hun).", en: "With gustar, put a pronoun in front: me (me), te (you), le (him, her, you formal), nos (us) or les (them).", de: "Bei gustar setzt du ein Pronomen davor: me (mir), te (dir), le (ihm, ihr, Ihnen), nos (uns) oder les (ihnen).", fr: "Avec gustar, mets un pronom devant : me (moi), te (toi), le (lui, elle, vous), nos (nous) ou les (eux, elles)." });
      } else {
        good.push({ nl: toks[gi - 1].core + " " + toks[gi].core + " is de juiste opbouw voor 'bevalt mij'.", en: toks[gi - 1].core + " " + toks[gi].core + " is the right structure for 'I like'.", de: toks[gi - 1].core + " " + toks[gi].core + " ist der richtige Aufbau für ‚gefällt mir‘.", fr: toks[gi - 1].core + " " + toks[gi].core + " est la bonne structure pour « ça me plaît »." });
      }
      var nextW = words[gi + 1];
      if (nextW && !isInf(nextW)) {
        var plural = (nextW === "las" || nextW === "los") ||
          (["el", "la", "un", "una"].indexOf(nextW) < 0 && nextW.charAt(nextW.length - 1) === "s" && nextW.length > 3);
        var shouldBe = plural ? "gustan" : "gusta";
        var pl = { nl: "meervoud", en: "plural", de: "Mehrzahl", fr: "pluriel" };
        var sg = { nl: "enkelvoud", en: "singular", de: "Einzahl", fr: "singulier" };
        var numM = plural ? pl : sg;
        if (words[gi] !== shouldBe) {
          var pair = plural ? "me gustan" : "me gusta";
          bad.push({ nl: "Bij " + numM.nl + " hoort " + shouldBe + " (" + pair + ").", en: "For " + numM.en + " use " + shouldBe + " (" + pair + ").", de: "Bei " + numM.de + " gehört " + shouldBe + " (" + pair + ").", fr: "Au " + numM.fr + ", on dit " + shouldBe + " (" + pair + ")." });
          toks[gi].fix = shouldBe;
        } else {
          good.push({ nl: shouldBe + " past bij het woord erna.", en: shouldBe + " fits the word after it.", de: shouldBe + " passt zum Wort danach.", fr: shouldBe + " va avec le mot qui suit." });
        }
      }
    }

    // Ser en estar
    var hasEstar = has(["estoy", "estás", "está", "estamos", "están"]);
    var hasSer = has(["soy", "eres", "es", "somos", "son"]);
    if (hasEstar && has(NAT)) bad.push({ nl: "Nationaliteit gebruik je met ser: soy holandés. Estar is voor een toestand of een plek.", en: "Nationality goes with ser: soy holandés. Estar is for a state or a place.", de: "Nationalität benutzt man mit ser: soy holandés. Estar ist für einen Zustand oder einen Ort.", fr: "La nationalité va avec ser : soy holandés. Estar sert pour un état ou un lieu." });
    if (hasSer && has(STATE.filter(function (x) { return x !== "triste"; }))) bad.push({ nl: "Een tijdelijke toestand gebruik je met estar: estoy cansado.", en: "A temporary state goes with estar: estoy cansado.", de: "Ein vorübergehender Zustand wird mit estar gesagt: estoy cansado.", fr: "Un état temporaire va avec estar : estoy cansado." });
    if (hasEstar && (has(STATE) || has(["aquí", "allí", "en"]))) good.push({ nl: "Estar past bij een toestand of plek.", en: "Estar fits a state or a place.", de: "Estar passt zu einem Zustand oder Ort.", fr: "Estar convient pour un état ou un lieu." });

    // Bijvoeglijk naamwoord
    if (subjP !== null && (hasEstar || hasSer)) {
      var sl = toks[subjIdx].low;
      var fem = (sl === "ella" || sl === "ellas" || sl === "nosotras");
      // Bij yo, tú, usted en ustedes hangt het geslacht van de spreker af: -o en -a zijn dan allebei goed.
      var genderKnown = ["él", "ella", "ellos", "ellas", "nosotros", "nosotras"].indexOf(sl) >= 0;
      var plur = (subjP === 3 || subjP === 4);
      toks.forEach(function (t) {
        var mm = t.low.match(/^(.*?)(os|as|o|a)$/);
        if (!mm || ADJ_STEMS.indexOf(mm[1]) < 0) return;
        var isF = /as?$/.test(mm[2]);
        var expected = mm[1] + ((genderKnown ? fem : isF) ? "a" : "o") + (plur ? "s" : "");
        if (t.low !== expected) {
          bad.push({ nl: "Het bijvoeglijk naamwoord past bij het onderwerp: " + expected + " (niet " + t.core + ").", en: "The adjective must match the subject: " + expected + " (not " + t.core + ").", de: "Das Adjektiv passt zum Subjekt: " + expected + " (nicht " + t.core + ").", fr: "L'adjectif doit correspondre au sujet : " + expected + " (pas " + t.core + ")." });
          t.fix = expected;
        } else {
          good.push({ nl: expected + " past qua vorm bij het onderwerp.", en: expected + " matches the subject in form.", de: expected + " passt in der Form zum Subjekt.", fr: expected + " correspond au sujet pour la forme." });
        }
      });
    }

    // Lidwoorden
    toks.forEach(function (t, i) {
      var n = toks[i + 1];
      if (!n) return;
      var g = NOUN_G[n.low];
      if (!g) return;
      if ((t.low === "el" || t.low === "un") && g === "f") {
        var f1 = t.low === "el" ? "la" : "una";
        bad.push({ nl: n.core + " is vrouwelijk: " + f1 + " " + n.core + ".", en: n.core + " is feminine: " + f1 + " " + n.core + ".", de: n.core + " ist weiblich: " + f1 + " " + n.core + ".", fr: n.core + " est féminin : " + f1 + " " + n.core + "." });
        t.fix = f1;
      }
      if ((t.low === "la" || t.low === "una") && g === "m") {
        var m1 = t.low === "la" ? "el" : "un";
        bad.push({ nl: n.core + " is mannelijk: " + m1 + " " + n.core + ".", en: n.core + " is masculine: " + m1 + " " + n.core + ".", de: n.core + " ist männlich: " + m1 + " " + n.core + ".", fr: n.core + " est masculin : " + m1 + " " + n.core + "." });
        t.fix = m1;
      }
    });

    // Bruikbare structuren
    var nci = seq(["no", "creo", "que"]);
    if (seq(["creo", "que"]) >= 0 && nci < 0) good.push({ nl: "Creo que + zin geeft je mening. Een sterke opbouw.", en: "Creo que + sentence gives your opinion. A strong structure.", de: "Creo que + Satz drückt deine Meinung aus. Ein starker Aufbau.", fr: "Creo que + phrase exprime ton avis. Une bonne structure." });
    var vi = seq(["voy", "a"]);
    if (vi >= 0 && isInf(words[vi + 2])) good.push({ nl: "Voy a + infinitief is de gewone manier om over de toekomst te praten.", en: "Voy a + infinitive is the usual way to talk about the future.", de: "Voy a + Infinitiv ist die übliche Art, über die Zukunft zu sprechen.", fr: "Voy a + infinitif est la façon habituelle de parler du futur." });
    var ti = seq(["tengo", "que"]);
    if (ti >= 0 && isInf(words[ti + 2])) good.push({ nl: "Tengo que + infinitief betekent: ik moet iets doen.", en: "Tengo que + infinitive means: I have to do something.", de: "Tengo que + Infinitiv heißt: ich muss etwas tun.", fr: "Tengo que + infinitif veut dire : je dois faire quelque chose." });
    var qi = seq(["quiero"]);
    if (qi >= 0 && isInf(words[qi + 1])) good.push({ nl: "Quiero + infinitief betekent: ik wil iets doen.", en: "Quiero + infinitive means: I want to do something.", de: "Quiero + Infinitiv heißt: ich möchte etwas tun.", fr: "Quiero + infinitif veut dire : je veux faire quelque chose." });
    ["porque", "pero", "cuando", "aunque"].forEach(function (w) {
      if (words.indexOf(w) >= 0) good.push({ nl: w + " verbindt twee gedachten. Goed om uit te breiden.", en: w + " links two ideas. Good for expanding.", de: w + " verbindet zwei Gedanken. Gut zum Erweitern.", fr: w + " relie deux idées. Bon pour enrichir la phrase." });
    });
    var ei = seq(["espero", "que"]);
    if (ei >= 0) {
      var nx = words[ei + 2] || "";
      if (["sea", "tenga", "vaya", "haga", "pueda", "venga", "esté", "sepa", "quiera"].indexOf(nx) >= 0) {
        good.push({ nl: "Espero que + subjunctief (" + nx + "): dat is een hoop uitdrukken.", en: "Espero que + subjunctive (" + nx + "): that expresses a hope.", de: "Espero que + Subjunktiv (" + nx + "): damit drückst du eine Hoffnung aus.", fr: "Espero que + subjonctif (" + nx + ") : cela exprime un espoir." });
      } else {
        tips.push({ nl: "Na espero que gebruik je de subjunctief: sea, tenga, vaya of pueda.", en: "After espero que you use the subjunctive: sea, tenga, vaya or pueda.", de: "Nach espero que benutzt du den Subjunktiv: sea, tenga, vaya oder pueda.", fr: "Après espero que, on utilise le subjonctif : sea, tenga, vaya ou pueda." });
      }
    }
    if (nci >= 0) tips.push({ nl: "Na no creo que gebruik je vaak de subjunctief: No creo que llueva.", en: "After no creo que you often use the subjunctive: No creo que llueva.", de: "Nach no creo que benutzt du oft den Subjunktiv: No creo que llueva.", fr: "Après no creo que, on utilise souvent le subjonctif : No creo que llueva." });

    // Uitbreiden
    if (!has(TIME)) grow.push({ nl: "Voeg een tijdsaanduiding toe: hoy (vandaag), ayer (gisteren), mañana (morgen) of siempre (altijd).", en: "Add a time word: hoy (today), ayer (yesterday), mañana (tomorrow) or siempre (always).", de: "Füg eine Zeitangabe hinzu: hoy (heute), ayer (gestern), mañana (morgen) oder siempre (immer).", fr: "Ajoute un repère de temps : hoy (aujourd'hui), ayer (hier), mañana (demain) ou siempre (toujours)." });
    if (words.length >= 3 && !has(["porque", "pero", "cuando", "aunque", "y"])) grow.push({ nl: "Voeg een reden toe met porque: ... porque ...", en: "Add a reason with porque: ... porque ...", de: "Füge einen Grund mit porque hinzu: ... porque ...", fr: "Ajoute une raison avec porque : ... porque ..." });
    if (seq(["creo"]) < 0 && seq(["me", "parece"]) < 0) grow.push({ nl: "Geef je mening met Creo que... of Me parece que...", en: "Give your opinion with Creo que... or Me parece que...", de: "Sag deine Meinung mit Creo que... oder Me parece que...", fr: "Exprime ton avis avec Creo que... ou Me parece que..." });
    if (!hasQ && !hasOpen) grow.push({ nl: "Maak er een vraag van om het gesprek gaande te houden: ¿...?", en: "Turn it into a question to keep the conversation going: ¿...?", de: "Mach eine Frage daraus, damit das Gespräch weitergeht: ¿...?", fr: "Fais-en une question pour faire vivre la conversation : ¿...?" });

    // Verbeterde versie
    var corrected = toks.map(function (t) { return t.pre + (t.fix !== null ? t.fix : t.core) + t.suf; }).join(" ");

    function section(titleKey, items, color) {
      if (!items.length) return null;
      var c = el("div", "card");
      var h = el("div", "sec-title", T(titleKey));
      h.style.color = color;
      c.appendChild(h);
      items.forEach(function (i) { c.appendChild(el("div", "line", "• " + L(i))); });
      return c;
    }
    if (!good.length && !bad.length && !tips.length) {
      frag.appendChild(el("div", "card", T("Ik herken nog geen bekende patronen. Probeer een zin met een werkwoord uit de tabel, zoals tengo, voy, quiero of me gusta.")));
    }
    [section("Dit gaat goed", good, "#15803d"),
     section("Dit moet anders", bad, "#b91c1c"),
     section("Tips", tips, "#92400e"),
     section("Zo breid je de zin uit", grow, "#1e40af")].forEach(function (s) { if (s) frag.appendChild(s); });
    if (corrected !== raw) {
      var cc = el("div", "card");
      cc.appendChild(el("div", "nl", T("Verbeterde versie")));
      var line = el("div", "line-row");
      var tx = el("div", "txt");
      tx.appendChild(el("div", "es", corrected));
      line.appendChild(tx);
      line.appendChild(speakBtn(corrected));
      cc.appendChild(line);
      frag.appendChild(cc);
    }
    return frag;
  }

  // ---------- Reageren ----------
  function styleList(list) {
    var f = el("div");
    list.forEach(function (s) {
      var c = el("div", "card");
      var line = el("div", "line-row");
      var tx = el("div", "txt");
      tx.appendChild(el("div", "nl", L(LBL[s[0]])));
      tx.appendChild(el("div", "es", s[1]));
      tx.appendChild(el("div", "nl", L(s[2])));
      line.appendChild(tx);
      line.appendChild(speakBtn(s[1]));
      c.appendChild(line);
      f.appendChild(c);
    });
    return f;
  }

  function viewReageren() {
    var w = el("div");
    var row = el("div", "chips");
    [["vraag", "Ik vraag"], ["vertelt", "Vriend vertelt"]].forEach(function (k) {
      row.appendChild(btn(T(k[1]), S.rKind === k[0] ? "primary small" : "small", function () {
        S.rKind = k[0]; S.rOpen = null; S.rSub = null; render();
      }));
    });
    w.appendChild(row);
    REACT.forEach(function (e, gi) {
      if (e.kind !== S.rKind || isUnderstood(e.es)) return;
      var card = el("div", "card");
      var head = el("div", "line-row");
      var tx = el("div", "txt");
      tx.appendChild(el("div", "es", e.es));
      tx.appendChild(el("div", "nl", L(e.m)));
      head.appendChild(tx);
      head.appendChild(speakBtn(e.es));
      head.appendChild(btn(S.rOpen === gi ? T("Sluit") : T("Reageer →"), "primary small", function () {
        S.rOpen = S.rOpen === gi ? null : gi; S.rSub = null; render();
      }));
      card.appendChild(head);
      card.appendChild(explainBox(e.es));
      if (S.rOpen === gi) {
        card.appendChild(el("h2", "", T("Jouw antwoord (stijl)")));
        card.appendChild(styleList(e.styles));
        if (e.vervolg && e.vervolg.length) {
          card.appendChild(el("h2", "", T("Vervolg: wat zegt de ander daarna?")));
          var vr = el("div", "chips");
          e.vervolg.forEach(function (v, vi) {
            vr.appendChild(btn(v.es, S.rSub === vi ? "primary small" : "small", function () {
              S.rSub = S.rSub === vi ? null : vi; render();
            }));
          });
          card.appendChild(vr);
          if (S.rSub !== null) {
            var v = e.vervolg[S.rSub];
            card.appendChild(el("div", "nl", L(v.m)));
            card.appendChild(styleList(v.styles));
          }
        }
      }
      w.appendChild(card);
    });
    return w;
  }

  // ---------- Leren ----------
  function viewKaarten() {
    var deck = allItems();
    var known = store.get("gekend", []);
    var todo = deck.filter(function (d) { return known.indexOf(d.es) < 0; });
    var w = el("div");
    w.appendChild(el("div", "stat", T("Gekend:") + " " + known.length + " / " + deck.length));
    if (!todo.length) {
      w.appendChild(el("div", "card", T("Alles gekend! Reset om opnieuw te beginnen.")));
      w.appendChild(btn(T("Reset voortgang"), "", function () { store.set("gekend", []); S.lIdx = 0; render(); }));
      return w;
    }
    var item = todo[S.lIdx % todo.length];
    var card = el("div", "card big");
    card.appendChild(el("div", "nl", T("Zeg het eerst hardop in het Spaans:")));
    card.appendChild(el("div", "", L(item.m)));
    if (S.lShow) card.appendChild(el("div", "big-es", item.es));
    w.appendChild(card);
    var r = el("div", "row");
    if (!S.lShow) {
      r.appendChild(btn(T("Toon Spaans"), "primary", function () { S.lShow = true; render(); }));
    } else {
      r.appendChild(speakBtn(item.es));
      r.appendChild(btn(T("Nog oefenen"), "", function () { S.lIdx++; S.lShow = false; render(); }));
      r.appendChild(btn(T("Gekend ✓"), "primary", function () {
        store.set("gekend", known.concat([item.es])); S.lShow = false; render();
      }));
    }
    w.appendChild(r);
    w.appendChild(btn(T("Reset voortgang"), "small", function () { store.set("gekend", []); S.lIdx = 0; render(); }));
    return w;
  }

  function quizCtx() {
    var isEs = (typeof IS_ES !== "undefined") ? IS_ES : true, tgt = isEs ? "es" : DOELC;
    var forms = {}; VERBS.forEach(function (v) { forms[v.id] = v.forms; });
    return { T: tgt, L: lang, SUBJ: SUBJ, VERBS: VERBS, esForms: forms,
      comp: function (X, vid, ci) {
        var v = null; VERBS.forEach(function (x) { if (x.id === vid) v = x; });
        var c = v && v.comps[ci]; if (!c) return null;
        if (X === tgt) return c.es;
        if (X === "es") return c.bron !== undefined ? c.bron : c.es;
        return c.m ? (c.m[X] || null) : null;
      } };
  }

  // Quiz: drie zinnen in de taal die je leert. Eén goed, één met een grammaticafout, één met een andere betekenis.
  function viewQuiz() {
    var w = el("div");
    if (!S.quiz || !S.quiz.q) { var nq = QUIZ.next(quizCtx()); S.quiz = nq ? { q: nq, answered: null } : null; }
    if (!S.quiz) return w;
    var q = S.quiz.q, A = S.quiz.answered, U = QUIZ.UI;
    w.appendChild(el("div", "stat", T("Score:") + " " + S.score[0] + " / " + S.score[1]));
    var big = el("div", "card big");
    big.appendChild(el("div", "nl", QUIZ.tx(U.title, lang)));
    big.appendChild(el("div", "nl", QUIZ.tx(U.meaning, lang)));
    big.appendChild(el("div", "big-es", q.meaning));
    w.appendChild(big);
    var list = el("div", "quiz-list");
    q.opts.forEach(function (o, idx) {
      var cls = A === null ? "" : (o.role === "good" ? "primary" : "");
      var b = btn(o.txt, cls, function () {
        if (S.quiz.answered !== null) return;
        S.quiz.answered = idx; S.score[1]++;
        if (o.role === "good") S.score[0]++;
        render();
      });
      b.disabled = A !== null;
      list.appendChild(b);
    });
    w.appendChild(list);
    if (A !== null) {
      var fb = el("div", "card");
      fb.appendChild(el(q.opts[A].role === "good" ? "div" : "div", q.opts[A].role === "good" ? "ok" : "bad", QUIZ.tx(q.opts[A].role === "good" ? U.ok : U.no, lang)));
      q.opts.forEach(function (o, idx) {
        var row = el("div", "quiz-expl");
        var head = el("div", "line-row");
        var tx = el("div", "txt");
        tx.appendChild(el("div", "es", o.txt));
        tx.appendChild(el("div", "nl", QUIZ.tx(o.role === "good" ? U.tagGood : (o.role === "gram" ? U.tagGram : U.tagMean), lang) + (idx === A ? "  ←" : "")));
        if (o.role !== "good") tx.appendChild(el("div", "nl", QUIZ.explain(o.e, lang)));
        head.appendChild(tx);
        if (o.role === "good") head.appendChild(speakBtn(o.txt));
        row.appendChild(head);
        fb.appendChild(row);
      });
      w.appendChild(fb);
      w.appendChild(btn(T("Volgende vraag →"), "primary", function () { S.quiz = null; render(); }));
    }
    return w;
  }

  function viewGrammatica() {
    var w = el("div");
    GRAMMAR.forEach(function (g) {
      var c = el("div", "card");
      c.appendChild(el("div", "sec-title", typeof g.titel === "string" ? g.titel : L(g.titel)));
      c.appendChild(el("div", "", L(g.regel)));
      // Voorbeeldzinnen (met vertaling en luisterknop); zonder zinnen de losse voorbeeldregel
      (g.zinnen || [{ es: g.voorbeeld, m: null }]).forEach(function (z) {
        var line = el("div", "line-row");
        var tx = el("div", "txt");
        tx.appendChild(el("div", "es", z.es));
        if (z.m) tx.appendChild(el("div", "nl", L(z.m)));
        line.appendChild(tx);
        line.appendChild(speakBtn(z.es));
        c.appendChild(line);
      });
      c.appendChild(el("div", "nl", T("Waarom:") + " " + L(g.waarom)));
      w.appendChild(c);
    });
    return w;
  }

  function viewLeren() {
    var w = el("div");
    var row = el("div", "chips");
    [["kaarten", "Kaarten"], ["quiz", "Quiz"], ["grammatica", "Grammatica"], ["patronen", "Patronen"]].forEach(function (k) {
      row.appendChild(btn(T(k[1]), S.lMode === k[0] ? "primary small" : "small", function () {
        S.lMode = k[0]; S.lShow = false; render();
      }));
    });
    w.appendChild(row);
    if (S.lMode === "kaarten") w.appendChild(viewKaarten());
    else if (S.lMode === "quiz") w.appendChild(viewQuiz());
    else if (S.lMode === "patronen") w.appendChild(viewPatronen());
    else w.appendChild(viewGrammatica());
    return w;
  }

  // ---------- Regels ----------
  function viewRegels() {
    var w = el("div");
    w.appendChild(el("div", "note", T("Lees een regel, bekijk de voorbeelden en doe de korte test. Tik op het luidsprekertje om een voorbeeld te horen.")));
    RULES.forEach(function (r, i) {
      var c = el("div", "card");
      c.appendChild(el("div", "sec-title", L(r.titel)));
      c.appendChild(el("div", "", L(r.uitleg)));
      r.voorbeelden.forEach(function (v) {
        var line = el("div", "line-row");
        var tx = el("div", "txt");
        tx.appendChild(el("div", "es", v[0]));
        tx.appendChild(el("div", "nl", L(v[1])));
        line.appendChild(tx);
        line.appendChild(speakBtn(v[0]));
        c.appendChild(line);
      });
      c.appendChild(el("div", "nl", T("Test:") + " " + L(r.test.vraag)));
      var row = el("div", "chips");
      r.test.opties.forEach(function (o, oi) {
        var answered = S.rAns[i] !== undefined;
        var b = btn(L(o), answered && oi === r.test.juist ? "primary small" : "small", function () {
          if (S.rAns[i] !== undefined) return;
          S.rAns[i] = oi;
          render();
        });
        b.disabled = answered;
        row.appendChild(b);
      });
      c.appendChild(row);
      if (S.rAns[i] !== undefined) {
        if (S.rAns[i] === r.test.juist) c.appendChild(el("div", "ok", T("Goed!")));
        else c.appendChild(el("div", "bad", T("Niet helemaal. Het juiste antwoord is:") + " " + L(r.test.opties[r.test.juist])));
      }
      w.appendChild(c);
    });
    w.appendChild(btn(T("Opnieuw beginnen"), "", function () { S.rAns = {}; render(); }));
    return w;
  }

  // ---------- Vertaalvak (bovenaan, op elke pagina) ----------
  function translateOne(text) {
    var t = clean(text);
    if (!t) return null;
    var hit = null;
    allItems().forEach(function (it) { if (!hit && clean(L(it.m)) === t) hit = it; });
    if (hit) return { text: hit.es, whole: true };
    // Zinnen: eerst de grammatica-module (Nederlands), daarna de vaste woordgroepen uit het woordenboek
    if (lang === "nl" && typeof NL_ES !== "undefined" && DICTS.nl) {
      var nes = NL_ES.translate(text, DICTS.nl, store.get("eigenGeslacht", "m") === "f" ? "f" : "m");
      if (nes) return { text: capSent(nes), grammar: true, parts: [], missing: [] };
    }
    // Engels, Duits, Frans: de zinsmodule (zin-*.js)
    if ((lang === "en" || lang === "de" || lang === "fr") && typeof ZIN !== "undefined") {
      var zes = null;
      try { zes = ZIN.toEs(text, lang, store.get("eigenGeslacht", "m") === "f" ? "f" : "m"); } catch (e) { zes = null; }
      if (zes) return { text: capSent(zes), grammar: true, parts: [], missing: [] };
    }
    var ph = PHRASES_BY_LANG[lang];
    if (ph[t] !== undefined) return { text: capSent(ph[t]), whole: true };
    // Lukt dat niet, dan alleen woord voor woord, geen zin
    var wb = wordByWord(t);
    return { text: null, parts: wb.parts, missing: wb.missing, unsupported: true };
  }

  // Meerdere zinnen in één vak: elke zin apart vertalen en de uitkomst op volgorde samenvoegen.
  function translateText(text) {
    var raw = String(text || "").trim();
    var parts = raw.replace(/([.!?…]+)\s+/g, "$1\u0001").split("\u0001").map(function (x) { return x.trim(); }).filter(function (x) { return clean(x); });
    if (parts.length < 2) return translateOne(text);
    var res = parts.map(function (p) { var r = translateOne(p); return r ? { src: p, text: r.text || null, parts: r.parts || [], missing: r.missing || [] } : { src: p, text: null, parts: [], missing: [] }; });
    var ok = res.every(function (r) { return r.text; });
    return { text: ok ? res.map(function (r) { return r.text; }).join(" ") : null, grammar: ok, sentences: res, parts: [], missing: ok ? [] : [].concat.apply([], res.map(function (r) { return r.missing; })) };
  }

  // Hoofdletter aan het begin van een zin (ook na een ¿ of ¡)
  function capSent(s) { return String(s).replace(/^([¿¡]?)(\S)/, function (m, q, c) { return q + c.toUpperCase(); }); }

  function wordByWord(t) {
    var ph = PHRASES_BY_LANG[lang];
    var d = DICTS[lang];
    var words = t.split(" ");
    var out = [], parts = [], missing = [];
    var i = 0;
    while (i < words.length) {
      var matched = false;
      for (var n = 3; n >= 2 && !matched; n--) {
        if (i + n <= words.length) {
          var phrase = words.slice(i, i + n).join(" ");
          if (ph[phrase] !== undefined) {
            out.push(ph[phrase]); parts.push(phrase + " = " + ph[phrase]);
            i += n; matched = true;
          }
        }
      }
      if (matched) continue;
      var w = words[i];
      if (d[w] !== undefined) { out.push(d[w]); parts.push(w + " = " + d[w]); }
      else { out.push("?"); parts.push(w + " = ?"); missing.push(w); }
      i++;
    }
    fixSpanishArticles(out);
    return { parts: parts, missing: missing };
  }

  // Het lidwoord volgt het geslacht van het Spaanse woord erna (el película -> la película).
  // Een vuistregel: woorden op -a, -ción, -dad zijn vrouwelijk, behalve een paar uitzonderingen.
  function fixSpanishArticles(arr) {
    var masc = /(ma|pa|eta|ista)$/, exc = ["agua", "hambre", "alma", "arma", "aula", "águila", "hacha", "área", "día", "ancla"];
    function fem(w) {
      if (!w) return false;
      if (exc.indexOf(w) >= 0) return false;
      if (/^[aá]/.test(w) && exc.indexOf(w) >= 0) return false;
      return /(a|ción|sión|dad|tad|umbre|itud)$/.test(w) && !masc.test(w);
    }
    for (var i = 0; i < arr.length - 1; i++) {
      var nx = arr[i + 1], head = nx.split(" ")[0];
      if (arr[i] === "el" && fem(head)) arr[i] = "la";
      else if (arr[i] === "un" && fem(head)) arr[i] = "una";
      else if (arr[i] === "los" && /as$/.test(head)) arr[i] = "las";
    }
  }

  // Op het Gesprek-tabblad start de vertaalbox een nieuwe beurt van de gesprekspartner.
  // De zin is jouw eigen beurt (rechts). Daarna kan de gesprekspartner opnemen, met de andere manieren eronder.
  function startChatFromTop() {
    var vt = document.getElementById("vtxt");
    var raw = vt.value.trim();
    if (!raw) { S.note = T("Typ eerst iets."); render(); return; }
    var r = translateText(raw);
    if (!r || !r.text) {
      S.note = (r && r.missing && r.missing.length)
        ? T("Niet in de lijst:") + " " + r.missing.join(", ")
        : T("Deze zin kan ik nog niet grammaticaal vertalen. Probeer een eenvoudiger zin.");
      render();
      return;
    }
    var t = { me: true, es: r.text, missing: (r.missing || []) };
    S.convo.push(t);
    S.chatStartTurn = t;
    S.note = "";
    vt.value = "";
    document.getElementById("transOut").hidden = true;
    render();
    scrollGesprekEnd();
  }

  // Valse vrienden: een korte, wegklikbare hint onder de vertaling, alleen als het lijkwoord in de taal van deze app zit
  function valseHint(box, bronTekst) {
    if (typeof valseVriendenInTekst !== "function") return;
    var doel = typeof DOEL !== "undefined" ? DOEL : "es";
    valseVriendenInTekst(bronTekst, lang, doel).forEach(function (v) {
      box.appendChild(el("div", "note", T("Let op: {w} betekent {b}, niet {l} ({bl}).").replace("{w}", v.woord).replace("{b}", v.betekenis).replace("{l}", v.lijkt_op).replace("{bl}", v.betekenis_lijkt_op)));
    });
  }

  function showTranslation() {
    if (S.tab === "gesprek") { startChatFromTop(); return; }
    var box = document.getElementById("transOut");
    var r = translateText(document.getElementById("vtxt").value);
    box.hidden = false;
    box.innerHTML = "";
    var close = el("button", "close", "×");
    close.type = "button";
    close.setAttribute("aria-label", T("Sluit"));
    close.onclick = function () { box.hidden = true; };
    box.appendChild(close);
    if (!r) {
      box.appendChild(el("div", "bad", T("Typ eerst iets.")));
      return;
    }
    var invoerT = document.getElementById("vtxt").value;
    if (r.sentences) {
      r.sentences.forEach(function (x) {
        if (x.text) { box.appendChild(el("div", "es", x.text)); valseHint(box, x.src); return; }
        box.appendChild(el("div", "nl", "“" + x.src + "”: " + T("Deze zin kan ik nog niet grammaticaal vertalen. Woord voor woord:")));
        if (x.parts.length) box.appendChild(el("div", "nl", x.parts.join(" · ")));
        if (x.missing.length) box.appendChild(el("div", "bad", T("Niet in de lijst:") + " " + x.missing.join(", ")));
      });
      var okt = r.sentences.filter(function (x) { return x.text; }).map(function (x) { return x.text; }).join(" ");
      if (okt) { var rw = el("div", "row"); rw.appendChild(speakBtn(okt)); box.appendChild(rw); }
      return;
    }
    if (r.text) {
      box.appendChild(el("div", "es", r.text));
      if (r.whole) box.appendChild(el("div", "nl", T("Dit is een vaste zin uit de gids.")));
      valseHint(box, invoerT);
      var row = el("div", "row");
      row.appendChild(speakBtn(r.text));
      box.appendChild(row);
    } else {
      // Geen grammaticaal correcte zin: alleen de woorden, met de betekenis per woord
      box.appendChild(el("div", "nl", T("Deze zin kan ik nog niet grammaticaal vertalen. Woord voor woord:")));
      if (r.parts.length) box.appendChild(el("div", "nl", r.parts.join(" · ")));
      if (r.missing.length) box.appendChild(el("div", "bad", T("Niet in de lijst:") + " " + r.missing.join(", ")));
    }
  }

  // ---------- Gesprek (microfoon en typvak) ----------
  // ---- Zinnen herkennen en bijleren ----
  // Vergelijken gebeurt zonder accenten en leestekens, zodat kleine verschillen niet uitmaken.
  function norm(s) { return clean(s).normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
  function lev(a, b) {
    var m = a.length, n = b.length, prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur = [i];
      for (j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
      prev = cur;
    }
    return prev[n];
  }
  function near(a, b) {
    if (a === b) return true;
    var L2 = Math.max(a.length, b.length);
    if (L2 < 6 || Math.abs(a.length - b.length) > 3) return false;
    return lev(a, b) / L2 <= 0.18;
  }
  var TALK_RE = [];
  TALK.forEach(function (t, i) {
    // ^ en $ in een patroon gelden voor de hele zin
    var alts = [], depth = 0, cur = "";
    t.re.split("").forEach(function (ch) {
      if (ch === "(" || ch === "[") depth++;
      if (ch === ")" || ch === "]") depth--;
      if (ch === "|" && depth === 0) { alts.push(cur); cur = ""; } else cur += ch;
    });
    alts.push(cur);
    var anchored = alts.map(function (alt) {
      var st = alt.charAt(0) === "^", en = alt.charAt(alt.length - 1) === "$";
      var core = alt.replace(/^\^/, "").replace(/\$$/, "");
      return (st ? "^" : "(?:^| )") + "(?:" + core + ")" + (en ? "$" : "");
    }).join("|");
    try { TALK_RE[i] = new RegExp(anchored); } catch (e) { TALK_RE[i] = /$^/; }
  });
  function findTalk(n) {
    for (var i = 0; i < TALK.length; i++) { if (TALK_RE[i].test(n)) return TALK[i]; }
    return null;
  }
  function findReact(n) {
    var hit = null;
    var n2 = n.replace(/^(hola|oye|bueno|pues) /, "");
    REACT.forEach(function (r) { var k = norm(r.es); if (!hit && (k === n || k === n2)) hit = r; });
    if (!hit) REACT.forEach(function (r) { var k = norm(r.es); if (!hit && (near(k, n) || near(k, n2))) hit = r; });
    return hit;
  }
  // Wat de gebruiker de app zelf heeft geleerd (blijft op het toestel staan)
  function learned(kind) { var o = store.get(kind, {}); return (o && typeof o === "object") ? o : {}; }
  function learnSentence(es, meaning) { var o = learned("geleerdZin"); var k = norm(es); o[k] = o[k] || {}; o[k][lang] = meaning; store.set("geleerdZin", o); }
  function learnWord(w, meaning) { var o = learned("geleerdWoord"); o[lang] = o[lang] || {}; o[lang][norm(w)] = meaning; store.set("geleerdWoord", o); }
  function learnReply(es, reply) { var o = learned("geleerdAntwoord"); var k = norm(es); o[k] = o[k] || []; if (o[k].indexOf(reply) < 0) o[k].push(reply); store.set("geleerdAntwoord", o); }

  var REV_NORM = {};
  var VERB_ENDS = ["ieron", "iendo", "aron", "amos", "emos", "imos", "aste", "iste", "ando", "aba", "ado", "ido", "ais", "eis", "an", "as", "en", "es", "io", "a", "e", "o", "i"];
  function revNorm(rev) {
    if (!REV_NORM[lang]) {
      var o = nullProto({}), k;
      for (k in rev) { var nk = norm(k); if (o[nk] === undefined) o[nk] = rev[k]; }
      REV_NORM[lang] = o;
    }
    return REV_NORM[lang];
  }
  function esToLang(text) {
    var t = clean(text), n = norm(text);
    var ls = learned("geleerdZin")[n];
    if (ls && ls[lang]) return { text: ls[lang], whole: true, learned: true };
    var hit = null;
    allItems().forEach(function (it) { if (!hit && clean(it.es) === t) hit = it; });
    if (!hit) allItems().forEach(function (it) { if (!hit && norm(it.es) === n) hit = it; });
    if (hit) return { text: L(hit.m), whole: true, es: hit.es };
    var r = findReact(n);
    if (r) return { text: L(r.m), whole: true, es: r.es };
    var tk = findTalk(n);
    if (tk && !tk.gen) return { text: L(tk.m), whole: true, es: tk.es, about: norm(tk.es) !== n };
    // Grammatica-motor (NL, EN, DE, FR): eerst de zin ontleden en opbouwen.
    // Lukt dat niet, dan valt de app terug op woord-voor-woord.
    // Nederlands: de zinsmodule (es-nl.js). Lukt die niet, dan alleen de woorden, geen ongrammaticale zin.
    if (lang === "nl" && typeof ES_NL !== "undefined" && typeof REVS !== "undefined" && REVS.nl) {
      var genNl = function (w) { return (typeof GRAM !== "undefined") ? GRAM.gen(w, "nl") : null; };
      var enl = null;
      try { enl = ES_NL.translate(text, REVS.nl, genNl); } catch (e) { enl = null; }
      if (!enl && typeof ZIN !== "undefined") { try { enl = ZIN.translate(text, "es", "nl", "m") || null; } catch (e) { enl = null; } }
      if (enl) return { text: enl, grammar: true, parts: [], missing: [] };
    }
    // Engels, Duits, Frans: de zinsmodule (zin-*.js). Lukt die niet, dan alleen de woorden.
    if ((lang === "en" || lang === "de" || lang === "fr") && typeof ZIN !== "undefined") {
      var zx = null;
      try { zx = ZIN.fromEs(text, lang); } catch (e) { zx = null; }
      if (zx) return { text: zx, grammar: true, parts: [], missing: [] };
    }
    // Pas als de zinsmodule niets vindt: de dichtstbijzijnde bekende zin (typefout), zodat "Trabajo" niet naar "Trabajé" springt
    allItems().forEach(function (it) { if (!hit && near(norm(it.es), n)) hit = it; });
    if (hit) return { text: L(hit.m), whole: true, es: hit.es, about: true };
    // De oude grammatica-motor (GRAM) maakte fouten in het Engels, Duits en Frans; die wordt hier niet meer gebruikt.
    if (false && typeof GRAM !== "undefined" && lang !== "nl") {
      var gw = function (s) {
        var lwx = learned("geleerdWoord")[lang] || {};
        if (lwx[norm(s)] !== undefined) return lwx[norm(s)];
        var PHX = (typeof PHRASES_ES !== "undefined" && PHRASES_ES[lang]) || {};
        if (PHX[s] !== undefined) return PHX[s];
        if (s.indexOf(" ") >= 0) return undefined;
        var rvx = REVS[lang];
        return rvx[s] !== undefined ? rvx[s] : revNorm(rvx)[norm(s)];
      };
      var gr = GRAM.translate(text, gw, lang);
      if (gr) return { text: gr.text, parts: gr.parts, missing: [], grammar: true };
    }
    var rev = REVS[lang], lw = learned("geleerdWoord")[lang] || {};
    var out = [], parts = [], missing = [];
    // Eerst meerwoordige uitdrukkingen (bijv. "fin de semana") als één geheel
    var PHE = (typeof PHRASES_ES !== "undefined" && PHRASES_ES[lang]) || {};
    var tw = t.split(" "), tokens = [];
    for (var ti = 0; ti < tw.length; ti++) {
      var hitP = null;
      for (var sz = 3; sz >= 2 && !hitP; sz--) {
        var cand = tw.slice(ti, ti + sz).join(" ");
        if (ti + sz <= tw.length && PHE[cand] !== undefined) hitP = { n: sz, w: cand, v: PHE[cand] };
      }
      if (hitP) { tokens.push({ w: hitP.w, v: hitP.v }); ti += hitP.n - 1; }
      else tokens.push({ w: tw[ti], v: undefined });
    }
    tokens.forEach(function (tok) {
      var w = tok.w;
      if (!w) return;
      if (tok.v !== undefined) { out.push(tok.v); parts.push(w + " = " + tok.v); return; }
      var v = lw[norm(w)] !== undefined ? lw[norm(w)] : rev[w];
      if (v === undefined) v = revNorm(rev)[norm(w)]; // ook zonder accenten getypt (rapido = rápido)
      var inf = null;
      if (v === undefined) { // vervoegde vorm: zoek het hele werkwoord op (trabaja -> trabajar)
        var rn = revNorm(rev), nw = norm(w);
        VERB_ENDS.some(function (e) {
          if (nw.length - e.length < 2 || nw.slice(-e.length) !== e) return false;
          return ["ar", "er", "ir"].some(function (x) {
            var c = nw.slice(0, nw.length - e.length) + x;
            if (rn[c] !== undefined) { v = rn[c]; inf = c; return true; }
            return false;
          });
        });
      }
      if (inf) { out.push(v); parts.push(w + " = " + v + " (" + inf + ")"); }
      else if (v !== undefined) { out.push(v); parts.push(w + " = " + v); }
      else { out.push("?"); parts.push(w + " = ?"); missing.push(w); }
    });
    // Geen grammaticaal correcte zin: de app toont dan alleen de woorden met hun betekenis
    return { text: "", parts: parts, missing: missing, unsupported: true };
  }

  // ---------- Geslacht van de gesprekspartner ----------
  // Instelling: "auto" (uit de zin van de partner, anders neutraal), "neutraal", "hij" of "zij".
  // We raden nooit uit de stem: alleen als de partner zelf een bijvoeglijk naamwoord met -o of -a gebruikt.
  var GEN_ADJ = ["cansad", "preocupad", "nervios", "emocionad", "preparad", "content", "list", "ocupad", "sorprendid", "enfadad", "perdid"];
  function partnerGenderSetting() { return store.get("partnerGender", "auto"); }
  function partnerGenderEffective() {
    var s0 = partnerGenderSetting();
    if (s0 === "hij" || s0 === "zij") return s0;
    if (s0 === "neutraal") return "neutraal";
    return store.get("partnerGenderAuto", null) || "neutraal";
  }
  // Uit een mededeling van de partner over zichzelf (estoy/soy/me siento + bijvoeglijk naamwoord)
  function detectPartnerGender(text) {
    if (/[¿?]/.test(text)) return null; // vragen gaan over de gebruiker, niet over de partner
    var m0 = text.toLowerCase().match(new RegExp("\\b(estoy|soy|me siento|estuve|estaba)\\s+(?:un poco |muy |bastante |algo |tan |)?(" + GEN_ADJ.join("|") + ")(o|a)\\b"));
    if (!m0) return null;
    return m0[3] === "a" ? "zij" : "hij";
  }
  // Maakt de Spaanse vorm passend bij het geslacht van de partner (hij: -o, zij: -a, neutraal: o/a)
  function genderEs(es) {
    if (!es) return es;
    var g = partnerGenderEffective();
    return es.replace(new RegExp("\\b(" + GEN_ADJ.join("|") + ")(o|a)(\\/a)?\\b", "g"), function (all, stem) {
      if (g === "hij") return stem + "o";
      if (g === "zij") return stem + "a";
      return stem + "o/a";
    });
  }

  // Reactie op een mededeling over een toestand, gevoel of drukte. De reactie gaat over precies dat
  // wat er gezegd is, niet over een algemene "wat leuk" of een onderwerp dat in de zin ontbreekt.
  var QWAT = { es: "¿Qué pasa?", m: { nl: "Wat is er aan de hand?", en: "What's going on?", de: "Was ist los?", fr: "Qu'est-ce qui se passe ?" } };
  var STATE_REACT = [
    { rx: /\b(cansad[oa]s?)\b/, a: { es: "Vaya, qué pena. Espero que descanses pronto.", m: { nl: "Wat jammer. Ik hoop dat je snel rust krijgt.", en: "Oh no, I hope you get some rest soon.", de: "Oh, das tut mir leid. Ich hoffe, du kannst dich bald ausruhen.", fr: "Oh, c'est dommage. J'espère que tu pourras bientôt te reposer." } }, q: QWAT },
    { rx: /\b(preocupad[oa]s?)\b/, a: { es: "Lo siento. Espero que todo se arregle pronto.", m: { nl: "Wat vervelend. Ik hoop dat het snel goed komt.", en: "I'm sorry. I hope it gets sorted soon.", de: "Das tut mir leid. Ich hoffe, es wird bald alles gut.", fr: "Je suis désolé. J'espère que ça s'arrangera vite." } }, q: QWAT },
    { rx: /\b(enferm[oa]s?)\b/, a: { es: "Lo siento mucho. Espero que te mejores pronto.", m: { nl: "Wat vervelend. Ik hoop dat je snel beter wordt.", en: "I'm sorry to hear that. I hope you feel better soon.", de: "Das tut mir leid. Ich hoffe, du wirst bald wieder gesund.", fr: "Je suis désolé. J'espère que tu vas vite aller mieux." } }, q: QWAT },
    { rx: /\b(tristes?)\b/, a: { es: "Lo siento. Espero que las cosas mejoren.", m: { nl: "Wat jammer. Ik hoop dat het beter gaat.", en: "I'm sorry. I hope things get better.", de: "Das tut mir leid. Ich hoffe, es wird besser.", fr: "Je suis désolé. J'espère que ça ira mieux." } }, q: QWAT },
    { rx: /\btengo (mucho|demasiado) (trabajo|que hacer)\b/, a: { es: "Uf, qué pesado. Espero que tengas tiempo para descansar.", m: { nl: "Wat zwaar. Ik hoop dat je tijd hebt om even uit te rusten.", en: "Oh, that's a lot. I hope you get time to rest.", de: "Oje, das ist viel. Ich hoffe, du hast Zeit zum Ausruhen.", fr: "Oh là là, c'est beaucoup. J'espère que tu auras le temps de te reposer." } }, q: { es: "¿Te gusta tu trabajo?", m: { nl: "Vind je je werk leuk?", en: "Do you like your work?", de: "Magst du deine Arbeit?", fr: "Tu aimes ton travail ?" } } },
    { rx: /\b(estoy|estamos|estás|está|están) (muy |bastante )?bien\b/, a: { es: "¡Me alegro! Qué bueno.", m: { nl: "Fijn om te horen!", en: "Good to hear!", de: "Schön zu hören!", fr: "Tant mieux !" } }, q: { es: "¿Qué has hecho hoy?", m: { nl: "Wat heb je vandaag gedaan?", en: "What have you done today?", de: "Was hast du heute gemacht?", fr: "Qu'est-ce que tu as fait aujourd'hui ?" } } }
  ];
  function stateReplies(text) {
    var t = text.toLowerCase();
    if (/\bno (estoy|está|estás|estamos|están) bien\b/.test(t)) {
      return { answer: { es: "Lo siento. ¿Qué pasa?", m: { nl: "Wat vervelend. Wat is er aan de hand?", en: "I'm sorry. What's going on?", de: "Das tut mir leid. Was ist los?", fr: "Je suis désolé. Qu'est-ce qui se passe ?" } }, questions: [{ es: "¿Quieres hablar de ello?", m: { nl: "Wil je erover praten?", en: "Do you want to talk about it?", de: "Willst du darüber reden?", fr: "Tu veux en parler ?" } }] };
    }
    if (/\b(no|ni)\b/.test(t)) return null; // ontkenningen: liever geen reactie dan een verkeerde
    for (var i = 0; i < STATE_REACT.length; i++) {
      var s = STATE_REACT[i];
      if (s.rx.test(t)) return { answer: s.a, questions: [{ es: s.q.es, m: s.q.m }] };
    }
    return null;
  }

  // Woord voor woord: elk Spaans woord met zijn betekenis in de gekozen taal (uit de woordenlijsten)
  // Woord voor woord onder een zin: elk Spaans woord met zijn betekenis
  function glossBlock(es) {
    var gl = wordGloss(es);
    if (!gl.length) return null;
    var gr = el("div", "gloss");
    gr.appendChild(el("div", "nl", T("Woord voor woord")));
    var gw = el("div", "gloss-words");
    gl.forEach(function (g) {
      var gi = el("span", "gloss-w");
      gi.appendChild(el("span", "gloss-es", g.es));
      gi.appendChild(el("span", "gloss-nl", g.m));
      gw.appendChild(gi);
    });
    gr.appendChild(gw);
    return gr;
  }
  function wordGloss(es) {
    var rev = REVS[lang] || {}, out = [];
    String(es).split(/\s+/).forEach(function (raw) {
      var c = clean(raw).trim();
      if (!c) return;
      var g = rev[c];
      if (g === undefined) g = revNorm(rev)[norm(c)];
      out.push({ es: raw.replace(/[¿?¡!.,;:…"“”()]+/g, ""), m: g === undefined ? "?" : g });
    });
    return out;
  }
  // Vraagwoorden (ook zonder ¿ als spraakherkenning die weglaat)
  function isWhText(text) {
    return /(^|[\s¿¡,;:])(qu[ée]|cu[aá]l|cu[aá]les|c[oó]mo|d[oó]nde|cu[aá]ndo|cu[aá]nto|cu[aá]ntos|cu[aá]ntas|por qu[ée]|qui[ée]n|qui[ée]nes|para qu[ée])(?=[\s?¿.,!;:]|$)/i.test(text);
  }
  // Antwoorden die op de vraag passen. Ja/nee-vragen krijgen ja of nee; vraagwoordvragen een invulling.
  function questionReplies(text, tp, wh) {
    var x = tp ? tp.es : null, art = tp ? tp.art : null;
    var nlN = tp ? topicGloss("nl", x) : null;
    var followYou = { es: "¿Y tú?", m: { nl: "En jij?", en: "And you?", de: "Und du?", fr: "Et toi ?" } };
    if (!wh) {
      return {
        answers: [
          { es: "Sí, claro.", m: { nl: "Ja, natuurlijk.", en: "Yes, of course.", de: "Ja, klar.", fr: "Oui, bien sûr." } },
          { es: "No, gracias.", m: { nl: "Nee, dank je.", en: "No, thanks.", de: "Nein, danke.", fr: "Non, merci." } }
        ],
        questions: [{ es: "¿Por qué?", m: { nl: "Waarom?", en: "Why?", de: "Warum?", fr: "Pourquoi ?" } }]
      };
    }
    if (/\b(qu[ée]|cu[aá]l(es)?)\s+(es|son|era|fue)\b/i.test(text) && x) {
      // "¿Qué es tu tarea?": het antwoord is een invulling van wat er gevraagd wordt
      return {
        answers: [
          { es: "Mi " + x + " es de …", m: { nl: "Mijn " + nlN + " is voor …", en: "My " + topicGloss("en", x) + " is for …", de: "Meine " + topicGloss("de", x) + " ist für …", fr: "Mon " + topicGloss("fr", x) + " est pour …" } },
          { es: "Es de …", m: { nl: "Het gaat over …", en: "It's about …", de: "Es geht um …", fr: "C'est sur …" } }
        ],
        questions: [followYou, { es: "¿Para cuándo es?", m: { nl: "Wanneer moet het af zijn?", en: "When is it due?", de: "Wann ist es fällig?", fr: "C'est pour quand ?" } }]
      };
    }
    return {
      answers: [
        { es: "Es …", m: { nl: "Het is …", en: "It's …", de: "Es ist …", fr: "C'est …" } },
        { es: "No lo sé.", m: { nl: "Dat weet ik niet.", en: "I don't know.", de: "Das weiß ich nicht.", fr: "Je ne sais pas." } }
      ],
      questions: [followYou]
    };
  }

  // Foutmarge voor spraak en typefouten: een woord dat niet in de woordenlijst van de doeltaal staat,
  // wordt vervangen door het dichtstbijzijnde bekende woord (1 letter fout bij 4+ letters, 2 bij 8+ letters).
  // Woorden die wel bekend zijn, blijven ongewijzigd, dus "twaalf" wordt nooit "twee".
  var HEARD_VOCAB = {};
  function heardVocab(lang) {
    if (!HEARD_VOCAB[lang]) {
      var src = REVS[lang] || {};   // sleutels = woorden in de taal van de gesprekspartner
      var byLen = {};
      Object.keys(src).forEach(function (w) {
        var n = norm(w).toLowerCase();
        if (n.indexOf(" ") >= 0 || n.length < 4) return;
        (byLen[n.length] = byLen[n.length] || []).push(n);
      });
      HEARD_VOCAB[lang] = { known: Object.create(null), byLen: byLen };
      Object.keys(byLen).forEach(function (k) { byLen[k].forEach(function (n) { HEARD_VOCAB[lang].known[n] = 1; }); });
    }
    return HEARD_VOCAB[lang];
  }
  function heardFix(text) {
    var v = heardVocab(lang), out = [];
    String(text).split(/(\s+|[.,;:!?¿¡])/).forEach(function (tok) {
      var n = norm(tok).toLowerCase();
      if (!n || /^\s+$|^[.,;:!?¿¡]$/.test(tok) || n.length < 4 || v.known[n]) { out.push(tok); return; }
      var thr = n.length >= 8 ? 2 : 1, best = null, bestD = thr + 1, ties = 0;
      for (var L = n.length - thr; L <= n.length + thr; L++) {
        (v.byLen[L] || []).forEach(function (c) {
          var d = lev(n, c);
          if (d < bestD) { bestD = d; best = c; ties = 1; }
          else if (d === bestD && c !== best) ties++;
        });
      }
      out.push(best !== null && ties === 1 ? best : tok);
    });
    return out.join("");
  }
  function makeTurn(text) {
    text = heardFix(text);
    var n = norm(text);
    var genDetected = detectPartnerGender(text);
    if (genDetected) store.set("partnerGenderAuto", genDetected);
    var ANS = UI["Antwoord"];
    var replies = [];
    (learned("geleerdAntwoord")[n] || []).forEach(function (r) { replies.push({ label: UI["Mijn antwoord"], es: r, m: null }); });
    var react = findReact(n), tk = react ? null : findTalk(n);
    if (react) react.styles.forEach(function (s) { replies.push({ label: LBL[s[0]], es: s[1], m: s[2] }); });
    else if (tk) tk.a.forEach(function (x) { replies.push({ label: ANS, es: x.es, m: x.m }); });
    var fu = [];
    if (!react && !tk) {
      // Vragen (met vraagwoord of ¿) krijgen antwoorden die op de vraag passen, nooit een mededeling als "¡Qué bien!"
      var tp = topicOf(text), wh = isWhText(text), isQ = wh || /[¿?]/.test(text);
      if (isQ) {
        var qr = questionReplies(text, tp, wh);
        qr.answers.forEach(function (a) { replies.push({ label: ANS, es: a.es, m: a.m }); });
        fu = qr.questions.map(function (x) { return { label: UI["Vraag door"], es: x.es, m: x.m }; });
      } else {
        var sr = stateReplies(text);
        var tr = sr || (tp ? topicReplies(tp, false) : null);
        if (tr) {
          replies.push({ label: ANS, es: tr.answer.es, m: tr.answer.m });
          fu = tr.questions.map(function (x) { return { label: UI["Vraag door"], es: x.es, m: x.m }; });
        } else {
          // Geen onderwerp te vinden: vraag om herhaling of uitleg van wat er gezegd is
          [
            { es: "¿Puedes repetirlo, por favor?", m: { nl: "Kun je dat herhalen, alsjeblieft?", en: "Can you repeat that, please?", de: "Kannst du das bitte wiederholen?", fr: "Tu peux répéter, s'il te plaît ?" } },
            { es: "¿Qué quieres decir?", m: { nl: "Wat bedoel je?", en: "What do you mean?", de: "Was meinst du?", fr: "Qu'est-ce que tu veux dire ?" } }
          ].forEach(function (x) { fu.push({ label: UI["Vraag door"], es: x.es, m: x.m }); });
        }
      }
    }
    var opts = replies.concat(fu).map(function (o) {
      // Eigen opgeslagen antwoorden blijven precies zoals de gebruiker ze schreef
      return o.label === UI["Mijn antwoord"] ? o : { label: o.label, es: genderEs(o.es), m: o.m };
    });
    return { es: text.trim(), tr: esToLang(text), options: opts, gen: genDetected };
  }

  // Zoekt het onderwerp van een zin: het zelfstandig naamwoord na een lidwoord of bezittelijk voornaamwoord
  var TOPIC_STOP = ["el", "la", "los", "las", "un", "una", "unos", "unas", "tu", "tus", "mi", "mis", "su", "sus",
    "de", "del", "que", "como", "qué", "por", "para", "y", "o", "a", "en", "con", "es", "son", "esta", "está", "estás",
    "estoy", "estamos", "tiene", "tienes", "tengo", "hay", "muy", "bien", "hoy", "ya", "no", "sí", "si", "te", "me", "se",
    "lo", "le", "al", "yo", "tú", "usted", "fin", "cuando", "donde", "dónde", "cuándo", "cuánto", "cuántos", "también"];
  var TOPIC_M = ["mapa", "día", "problema", "sistema", "programa", "idioma", "planeta", "tema", "clima", "sofá"];

  function topicOf(text) {
    var ws = text.toLowerCase().replace(/[^a-záéíóúüñ\s]/g, " ").split(/\s+/).filter(Boolean);
    var DET = ["el", "la", "los", "las", "un", "una", "tu", "tus", "mi", "mis", "su", "sus"];
    var mk = function (det, noun) {
      var art = (det === "la" || det === "las") ? "la" : (det === "el" || det === "los") ? "el" : null;
      if (!art) art = (/a$/.test(noun) && TOPIC_M.indexOf(noun) < 0) ? "la" : "el";
      return { es: noun, art: art, det: det };
    };
    for (var i = 0; i < ws.length - 1; i++) {
      if (DET.indexOf(ws[i]) >= 0 && TOPIC_STOP.indexOf(ws[i + 1]) < 0 && ws[i + 1].length > 2) return mk(ws[i], ws[i + 1]);
    }
    return null; // zonder lidwoord of bezittelijk voornaamwoord geen onderwerp (bijv. "hace frío")
  }

  // Vertaling van het onderwerp in een taal, zonder lidwoord (voor de Nederlandse, Engelse, Duitse en Franse zinnen)
  function topicGloss(l, es) {
    var r = REVS[l], v = r && r[es];
    if (!v) return es;
    v = String(v).split(/\s*[\/;,]\s*/)[0];
    if (l === "de" || l === "fr") v = v.replace(/^(der|die|das|ein|eine|le|la|les|un|une|l')\s*/i, "");
    return v;
  }

  // Antwoorden over het onderwerp van de zin. Het geslacht komt uit de tabel van de grammatica.
  // Staat het woord niet in de tabel, dan blijven de antwoorden zonder naam ("Ich mag es.") en
  // blijft het antwoord over het onderwerp, nooit een willekeurige vraag.
  function topicReplies(tp, isQ) {
    var x = tp.es, art = tp.art, dk = tp.det;
    var dSpec = (dk === "un" || dk === "una") ? "un" : (dk === "tu" || dk === "tus") ? "tu" : (dk === "mi" || dk === "mis") ? "mi" : "el";
    // Bezittelijk voornaamwoord volgt wie met wie praat: zegt de gesprekspartner "mi hermano", dan is dat zijn broer en vraag jij naar "tu hermano".
    var famUn = /^(un|una|unos|unas)$/.test(dk) && /^(hermano|hermana|hermanos|hermanas|padre|madre|padres|hijo|hija|hijos|hijas|perro|perra|gato|gata|amigo|amiga|amigos|amigas|novio|novia|marido|esposa|esposo|abuelo|abuela|tío|tía|primo|prima|sobrino|sobrina|jefe|jefa|compañero|compañera)$/.test(x);
    var poss = /^(mi|mis|tu|tus|su|sus)$/.test(dk) || famUn, plD = /s$/.test(dk);
    var dSpecQ = poss ? "tu" : dSpec;
    var dSpecA = /^(mi|mis|su|sus)$/.test(dk) || famUn ? "tu" : /^(tu|tus)$/.test(dk) ? "mi" : dSpec;
    var artQ = poss ? (plD ? "tus" : "tu") : art;
    var artA = dSpecA === "tu" ? (plD ? "tus" : "tu") : dSpecA === "mi" ? (plD ? "mis" : "mi") : art;
    var gD = (typeof GRAM !== "undefined") ? GRAM.gen(x, "de") : null;
    var gF = (typeof GRAM !== "undefined") ? GRAM.gen(x, "fr") : null;
    var known = !!(gD && gF);
    var g = gD || "m", gfr = gF || "m";
    var np = function (l, det, role) { return known ? GRAM.np(l, det, x, role, null) : null; };
    var capDE = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
    var nlN = topicGloss("nl", x), enBare = topicGloss("en", x), enN = "the " + enBare;
    // Nederlands geslacht uit de woordtabel: de/het. Staat het woord er niet in, dan "dat" zonder lidwoord.
    var gN = (typeof GRAM !== "undefined") ? GRAM.gen(x, "nl") : null;
    var nlNoun = gN === "n" ? "het " + nlN : gN === "c" ? "de " + nlN : "dat";
    var nlPron = gN === "n" ? "dat" : gN === "c" ? "die" : "dat";
    var pDE = { m: "er", f: "sie", n: "es" }[g], pFR = gfr === "f" ? "elle" : "il";
    var deAcc = np("de", dSpecA, "acc"), frAcc = np("fr", dSpecA, "acc");
    var deAccQ = np("de", dSpecQ, "acc"), frAccQ = np("fr", dSpecQ, "acc");
    var deNom = np("de", "el", "nom"), deNomQ = np("de", dSpecQ, "nom");
    if (!isQ) { // mededeling: reageer enthousiast en vraag door over hetzelfde onderwerp
      return {
        answer: { es: "¡Qué bien! Me gusta " + artA + " " + x + ".",
          m: { nl: "Wat leuk! Ik vind " + nlNoun + " ook leuk.", en: "How nice! I like " + enN + ".",
            de: "Wie schön! Ich mag " + (deAcc || "es") + ".",
            fr: "Super ! " + (frAcc ? "J'aime " + frAcc : "Je l'aime bien") + "." } },
        questions: [
          { es: "¿Cómo se llama " + artQ + " " + x + "?",
            m: { nl: "Hoe heet " + nlPron + "?", en: "What is its name?",
              de: "Wie heißt " + (known ? pDE : "es") + "?", fr: "Comment s'appelle-t-" + (known ? pFR : "il") + " ?" } },
          { es: "¿Cómo es " + artQ + " " + x + "?",
            m: { nl: "Hoe is " + nlNoun + "?", en: "What is " + enN + " like?",
              de: "Wie ist " + (deNomQ || deNom || "es") + "?", fr: "Comment est-" + (known ? pFR : "il") + " ?" } }
        ]
      };
    }
    return {
      answer: { es: "Mi " + x + " está muy bien, gracias.",
        m: { nl: "Met mijn " + nlN + " gaat het goed, dank je.", en: "My " + enBare + " is doing very well, thanks.",
          de: (known ? capDE(np("de", "mi", "dat")) + " geht es" : "Es geht ihm") + " sehr gut, danke.",
          fr: known ? "Ça va très bien pour " + np("fr", "mi", "acc") + ", merci." : "Ça va très bien, merci." } },
      questions: [
        { es: "¿Te gusta " + artQ + " " + x + "?",
          m: { nl: "Vind je " + nlNoun + " leuk?", en: "Do you like " + enN + "?",
            de: "Magst du " + (deAccQ || deAcc || "es") + "?", fr: "Tu aimes " + (frAccQ || frAcc || "ça") + " ?" } },
        { es: "¿Cómo es " + artQ + " " + x + "?",
          m: { nl: "Hoe is " + nlNoun + "?", en: "What is " + enN + " like?",
            de: "Wie ist " + (deNomQ || deNom || "es") + "?", fr: "Comment est-" + (known ? pFR : "il") + " ?" } }
      ]
    };
  }

  function isIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }
  function errorText(code) {
    if (code === "not-allowed" || code === "service-not-allowed") return T("Microfoon is niet toegestaan op deze pagina. Typ hieronder wat je gesprekspartner zei.");
    if (code === "no-speech") return T("Geen spraak gehoord. Probeer het opnieuw.");
    if (code === "audio-capture" && isIOS()) return T("Op iPhone werkt spraakherkenning in Safari vaak niet. Typ hieronder wat je gesprekspartner zei.");
    if (code === "audio-capture") return T("De microfoon kan niet worden gebruikt. Sluit andere apps of tabbladen die de microfoon gebruiken, controleer de microfoon-toegang van je browser, of typ hieronder.");
    return T("Spraakherkenning gaf een fout") + " (" + code + "). " + T("Typ hieronder wat je gesprekspartner zei.");
  }

  // ---- Spraak op iPhone: Whisper draait in de browser (gratis, zonder server) ----
  // De gebruiker kiest zelf of en welk spraakmodel wordt gedownload; daarna blijft het op het toestel staan.
  var WH = { rec: null, chunks: [], stream: null, worker: null, ready: false, pending: null, jobs: {}, jobId: 0 };
  var WH_MODELS = { tiny: "onnx-community/whisper-tiny", base: "onnx-community/whisper-base" };

  // Diagnose: elke stap van de spraakroute wordt genoteerd, zodat een fout precies aan te wijzen is.
  var APP_VERSION = "3.0";
  // Versies waarvoor gebruikers de app opnieuw op hun beginscherm moeten zetten (oude icoon weg, nieuwe erop).
  // Bij zo'n update verschijnt eenmalig een melding met uitleg.
  var REINSTALL_VERSIONS = ["1.8"];
  var WH_LOG = [];
  function whLog(msg) {
    var d = new Date();
    WH_LOG.push(("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2) + " " + msg);
    if (WH_LOG.length > 40) WH_LOG.shift();
  }
  function whReport() {
    return "SpeechPartner v" + APP_VERSION + "\n" + navigator.userAgent + "\n" +
      "standalone: " + (!!navigator.standalone) + " | model: " + store.get("whModel", "-") + " | ready: " + WH.ready + "\n" +
      (WH_LOG.length ? WH_LOG.join("\n") : "(nog geen stappen)");
  }
  window.addEventListener("error", function (e) { whLog("JS-fout: " + (e && e.message)); });
  window.addEventListener("unhandledrejection", function (e) { whLog("Promise-fout: " + (e && e.reason && (e.reason.message || e.reason))); });

  function whSetStatus(text) {
    S.whStatus = text;
    var n = document.getElementById("whStatus");
    if (n) { n.textContent = text; n.style.display = text ? "" : "none"; }
  }
  // Het model draait in een aparte werker; laden gebeurt altijd VOOR het opnemen, nooit tijdens.
  function whLoad() {
    if (WH.ready) return Promise.resolve(true);
    if (WH.pending) return WH.pending;
    var model = WH_MODELS[store.get("whModel", "tiny")] || WH_MODELS.tiny;
    S.whLoading = true;
    whLog("model laden: " + model);
    whSetStatus(T("Spraakmodel laden…"));
    WH.pending = new Promise(function (resolve, reject) {
      var w;
      try { w = new Worker("js/whisper-worker.js", { type: "module" }); } catch (e) { reject(e); return; }
      WH.worker = w; WH.jobs = {}; WH.jobId = 0;
      w.onmessage = function (ev) {
        var d = ev.data || {};
        if (d.type === "progress") {
          whSetStatus(T("Spraakmodel laden…") + " " + Math.round(d.loaded / 1048576) + " / " + Math.round(d.total / 1048576) + " MB");
        } else if (d.type === "ready") {
          resolve(true);
        } else if (d.type === "result") {
          if (WH.jobs[d.id]) { WH.jobs[d.id][0](d.text); delete WH.jobs[d.id]; }
        } else if (d.type === "error") {
          if (d.phase === "load") reject(new Error(d.message));
          else if (WH.jobs[d.id]) { WH.jobs[d.id][1](new Error(d.message)); delete WH.jobs[d.id]; }
        }
      };
      w.onerror = function (e) { reject(new Error((e && e.message) || "worker")); };
      w.postMessage({ type: "load", model: model });
    }).then(function () {
      WH.ready = true; S.whLoading = false; whSetStatus("");
      whLog("model klaar");
      return true;
    }, function (e) {
      WH.pending = null; WH.ready = false; S.whLoading = false; whSetStatus("");
      whLog("model FOUT: " + (e && e.message));
      if (WH.worker) { try { WH.worker.terminate(); } catch (x) {} WH.worker = null; }
      throw e;
    });
    return WH.pending;
  }
  function whReset() {
    if (WH.worker) { try { WH.worker.terminate(); } catch (x) {} }
    WH.worker = null; WH.pending = null; WH.ready = false; S.whLoading = false;
  }
  function whRun(audio) {
    return new Promise(function (resolve, reject) {
      var id = ++WH.jobId;
      WH.jobs[id] = [resolve, reject];
      WH.worker.postMessage({ type: "run", id: id, audio: audio }, [audio.buffer]);
    });
  }
  function whLoadWithNote() {
    return whLoad().then(function () {
      S.note = T("Het spraakmodel is klaar. Tik op Opnemen.");
      if (S.tab === "gesprek") render();
    }).catch(function (e) {
      S.note = whErr(e);
      if (S.tab === "gesprek") render();
    });
  }

  // Geluid decoderen en zelf naar 16 kHz mono omrekenen (werkt ook op oudere iPhones).
  function whDecode(blob) {
    return blob.arrayBuffer().then(function (buf) {
      var AC = window.AudioContext || window.webkitAudioContext;
      var ac = new AC();
      return new Promise(function (res, rej) { ac.decodeAudioData(buf, res, rej); }).then(function (audio) {
        try { if (ac.state !== "closed") ac.close().catch(function () {}); } catch (e) {}
        var ch = audio.numberOfChannels, len = audio.length, mono = new Float32Array(len), c, i;
        for (c = 0; c < ch; c++) {
          var d = audio.getChannelData(c);
          for (i = 0; i < len; i++) mono[i] += d[i] / ch;
        }
        var ratio = audio.sampleRate / 16000;
        var n = Math.max(1, Math.floor(len / ratio)), out = new Float32Array(n);
        for (i = 0; i < n; i++) {
          var pos = i * ratio, i0 = Math.floor(pos), i1 = Math.min(i0 + 1, len - 1), f = pos - i0;
          out[i] = mono[i0] * (1 - f) + mono[i1] * f;
        }
        return out;
      });
    });
  }

  function whErr(e) {
    var msg = e && (e.message || e.name) ? String(e.message || e.name).slice(0, 120) : "";
    return T("Spraakherkenning gaf een fout") + (msg ? " (" + msg + ")" : "") + ". " + T("Typ hieronder wat je gesprekspartner zei.");
  }

  // Keuzekaart: toestemming voor het downloaden van het spraakmodel
  function whConsentCard() {
    var c = el("div", "card panel");
    c.appendChild(el("div", "sec-title", T("Spraakmodel downloaden?")));
    c.appendChild(el("div", "", T("Om Spaans te verstaan op de iPhone downloadt de app eenmalig een spraakmodel. Het blijft daarna op je toestel staan en werkt ook zonder internet. Gebruik bij voorkeur wifi.")));
    var row = el("div", "chips");
    function choose(kind) {
      store.set("whModel", kind);
      whReset();
      S.whAsk = false; S.note = "";
      render();
      whLoadWithNote();
    }
    row.appendChild(btn(T("Snel (ongeveer 40 MB)"), "primary small", function () { choose("tiny"); }));
    row.appendChild(btn(T("Nauwkeuriger (ongeveer 80 MB, trager)"), "small", function () { choose("base"); }));
    row.appendChild(btn(T("Niet nu"), "small", function () { S.whAsk = false; render(); }));
    c.appendChild(row);
    return c;
  }

  // Opnemen op iPhone: het geluid wordt rechtstreeks als ruwe samples opgevangen (geen bestand
  // dat achteraf gedecodeerd moet worden), daarna naar 16 kHz gebracht en op volume gebracht.
  function whStart() {
    if (!store.get("whModel", null)) { S.whAsk = true; S.note = ""; go("gesprek"); scrollGesprekEnd(); return; }
    if (!WH.ready) {
      // Eerst het model laden (uit de opslag van het toestel), pas daarna opnemen.
      S.note = T("Het spraakmodel wordt nog geladen. Wacht even.");
      go("gesprek"); scrollGesprekEnd();
      whLoadWithNote();
      return;
    }
    if (WH.starting) return;
    WH.starting = true;
    var AC = window.AudioContext || window.webkitAudioContext;
    var ac = null;
    try { ac = new AC(); ac.resume(); } catch (e) { ac = null; whLog("AudioContext FOUT: " + e.message); }
    whLog("opname gevraagd; audio: " + (ac ? ac.state + " " + ac.sampleRate + " Hz" : "geen"));
    navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } }).then(function (stream) {
      WH.starting = false;
      WH.stream = stream; WH.pcm = [];
      var trk = stream.getAudioTracks()[0];
      whLog("microfoon ok: " + (trk ? trk.label + " (" + trk.readyState + ")" : "geen spoor"));
      if (trk) { trk.onended = function () { whLog("microfoonspoor BEEINDIGD door het systeem"); }; trk.onmute = function () { whLog("microfoon gedempt door het systeem"); }; }

      // Route 1: ruwe samples via de audio-motor. Op iPhone kan die motor stilvallen zodra de
      // microfoon start; daarom opnieuw starten, en zo nodig een nieuwe motor maken.
      function wire(ctx) {
        WH.ac = ctx; WH.rate = ctx.sampleRate;
        var src = ctx.createMediaStreamSource(stream);
        var proc = ctx.createScriptProcessor(4096, 1, 1);
        var mute = ctx.createGain(); mute.gain.value = 0;
        proc.onaudioprocess = function (e) { WH.pcm.push(new Float32Array(e.inputBuffer.getChannelData(0))); };
        src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
        WH.src = src; WH.proc = proc;
        ctx.onstatechange = function () { whLog("audio-status: " + ctx.state); };
        try { ctx.resume(); } catch (e) {}
        whLog("audio-motor gekoppeld: " + ctx.state + " " + ctx.sampleRate + " Hz");
      }
      try { if (!ac) ac = new AC(); wire(ac); } catch (e) { whLog("audio-motor FOUT: " + e.message); }
      WH.watch = setTimeout(function () {
        if (!S.wrec || WH.pcm.length) return;
        whLog("geen samples na 0,8 s (status " + (WH.ac ? WH.ac.state : "-") + "); nieuwe audio-motor");
        try { WH.proc.onaudioprocess = null; WH.src.disconnect(); WH.proc.disconnect(); WH.ac.close().catch(function () {}); } catch (e) {}
        try { wire(new AC()); } catch (e) { whLog("nieuwe audio-motor FOUT: " + e.message); }
      }, 800);

      // Route 2 (reserve): gewone opname als bestand, voor als route 1 niets oplevert.
      WH.rec = null; WH.chunks = [];
      if (window.MediaRecorder) {
        try {
          var rec = new MediaRecorder(stream);
          rec.ondataavailable = function (e) { if (e.data && e.data.size) WH.chunks.push(e.data); };
          rec.start();
          WH.rec = rec;
          whLog("reserve-opname gestart (" + (rec.mimeType || "?") + ")");
        } catch (e) { whLog("reserve-opname FOUT: " + e.message); }
      }
      S.listening = true; S.wrec = true; S.note = "";
      updateMic(); render();
    }).catch(function (e) {
      WH.starting = false;
      whLog("microfoon FOUT: " + (e && (e.name + " " + e.message)));
      if (ac) { try { ac.close().catch(function () {}); } catch (x) {} }
      S.note = T("Microfoon is niet toegestaan op deze pagina. Typ hieronder wat je gesprekspartner zei.");
      go("gesprek"); scrollGesprekEnd();
    });
  }

  // Samples naar 16 kHz brengen
  function whTo16k(flat, rate) {
    var ratio = rate / 16000, len = flat.length, n = Math.floor(len / ratio), out = new Float32Array(n), i;
    for (i = 0; i < n; i++) {
      var pos = i * ratio, i0 = Math.floor(pos), i1 = Math.min(i0 + 1, len - 1), f = pos - i0;
      out[i] = flat[i0] * (1 - f) + flat[i1] * f;
    }
    return out;
  }

  function whStop() {
    clearTimeout(WH.watch);
    try { WH.proc.onaudioprocess = null; WH.src.disconnect(); WH.proc.disconnect(); } catch (e) {}
    var rate = WH.rate || 48000;
    var chunks = WH.pcm || []; WH.pcm = [];
    var len = 0, i;
    for (i = 0; i < chunks.length; i++) len += chunks[i].length;
    whLog("opname gestopt: route 1 gaf " + chunks.length + " blokken, " + (Math.round(len / rate * 10) / 10) + " s, " + rate + " Hz");
    S.listening = false; S.wrec = false;
    S.note = T("Bezig met verwerken…");
    updateMic(); go("gesprek"); scrollGesprekEnd();

    function release() {
      if (WH.stream) { WH.stream.getTracks().forEach(function (t) { t.stop(); }); WH.stream = null; }
      if (WH.ac) { try { WH.ac.close().catch(function () {}); } catch (e) {} WH.ac = null; }
    }
    // Reserve-opname afsluiten en als samples teruggeven (of null)
    function backup() {
      var rec = WH.rec; WH.rec = null;
      if (!rec || rec.state === "inactive") return Promise.resolve(null);
      return new Promise(function (resolve) {
        var done = false;
        function fin() {
          if (done) return; done = true;
          var blob = new Blob(WH.chunks, { type: rec.mimeType || "audio/mp4" });
          WH.chunks = [];
          whLog("reserve-opname: " + blob.size + " bytes");
          if (!blob.size) { resolve(null); return; }
          whDecode(blob).then(resolve, function (e) { whLog("reserve decoderen FOUT: " + (e && e.message)); resolve(null); });
        }
        rec.onstop = fin;
        try { rec.stop(); } catch (e) { fin(); }
        setTimeout(fin, 2500);
      });
    }

    var p;
    if (len >= rate * 0.3) {
      var flat = new Float32Array(len), o = 0;
      for (i = 0; i < chunks.length; i++) { flat.set(chunks[i], o); o += chunks[i].length; }
      var peak1 = 0;
      for (i = 0; i < len; i += 7) { var a = flat[i] < 0 ? -flat[i] : flat[i]; if (a > peak1) peak1 = a; }
      if (peak1 > 0.002) { if (WH.rec) { try { WH.rec.stop(); } catch (e) {} WH.rec = null; } p = Promise.resolve(whTo16k(flat, rate)); }
      else { whLog("route 1 is stil (volume 0%); reserve gebruiken"); p = backup(); }
    } else {
      p = backup();
    }
    p.then(function (out) {
      release();
      if (!out || out.length < 16000 * 0.3) {
        whLog("geen bruikbaar geluid uit beide routes");
        S.note = T("Geen spraak gehoord. Probeer het opnieuw.") + " (" + T("opname") + " 0 s)";
        go("gesprek"); scrollGesprekEnd(); return null;
      }
      // Eerst achtergrondgeluid dempen (brom, ruis), daarna pas het volume gelijkmaken.
      if (window.SpraakSchoon) out = SpraakSchoon.clean(out, 16000);
      var n = out.length, peak = 0, k;
      for (k = 0; k < n; k++) { var v = out[k] < 0 ? -out[k] : out[k]; if (v > peak) peak = v; }
      // Zachte opnames (partner op afstand) versterken tot een normaal niveau.
      if (peak > 0.002) { var g = Math.min(0.9 / peak, 40); for (k = 0; k < n; k++) out[k] *= g; }
      var secs = Math.round(n / 1600) / 10;
      whLog(secs + " s, volume " + Math.round(peak * 100) + "%; naar model");
      var info = " (" + T("opname") + " " + secs + " s, " + T("volume") + " " + Math.round(peak * 100) + "%";
      return whRun(out).then(function (res) {
        var text = String(res || "").trim();
        whLog("model antwoord: \"" + text.slice(0, 60) + "\"");
        S.note = "";
        // Whisper zet stilte of ruis soms om in (música) of [Music]: dat telt niet als zin.
        var junk = /^[\(\[\{].*[\)\]\}]$/.test(text) || /^[\W_]+$/.test(text);
        if (text.length >= 2 && !junk) S.convo.push(makeTurn(herstelZin(text)));
        else S.note = T("Geen spraak gehoord. Probeer het opnieuw.") + info + (text ? ", " + T("gehoord") + ": " + text.slice(0, 40) : "") + ")";
        go("gesprek"); scrollGesprekEnd();
      });
    }).catch(function (e) {
      release();
      whLog("verwerken FOUT: " + (e && e.message));
      S.note = whErr(e);
      go("gesprek"); scrollGesprekEnd();
    });
  }

  // Opname via de spraakherkenning van de browser. Stopt de herkenning zelf (dat gebeurt na een stilte),
  // dan start de app hem opnieuw, tot de gebruiker op Stop tikt. Alles wat gehoord is, blijft bewaard.
  var micStop = null;
  // Herkende zin naar de bekende zin uit de app (zin-herstel.js). Staat uit tot de steekproef van zinnen is gekeurd.
  // Niet toegepast in de uitspraaktrainer: daar zou een verkeerde uitspraak dan goed lijken.
  var ZINHERSTEL_AAN = true;
  function herstelZin(t) {
    try {
      if (ZINHERSTEL_AAN && window.ZIN_HERSTEL && window.ZINNEN_ES) return ZIN_HERSTEL.corrigeer(t, ZINNEN_ES).tekst;
    } catch (e) {}
    return t;
  }

  function startMic() {
    if (S.listening) return;
    if (typeof prRelease === "function") prRelease();
    if (isIOS() && (window.AudioContext || window.webkitAudioContext) && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) { whStart(); return; }
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      S.note = T("Spraakherkenning werkt niet in deze browser. Gebruik Chrome of Edge, of typ hieronder.");
      go("gesprek"); scrollGesprekEnd();
      return;
    }
    var heard = [], errored = false, ended = false, userStop = false, cur = null, restarts = 0, lastStart = 0;
    function finish() {
      if (ended) return; ended = true;
      S.listening = false; S.rec = null; micStop = null;
      if (heard.length) {
        heard.forEach(function (t) { S.convo.push(makeTurn(herstelZin(t))); });
        S.note = "";
      } else if (!errored) {
        S.note = T("Geen spraak gehoord. Probeer het opnieuw.");
      }
      go("gesprek"); scrollGesprekEnd();
    }
    function begin() {
      var rec = null;
      try { rec = new SR(); } catch (e) { rec = null; }
      if (!rec) { errored = true; S.note = T("Spraakherkenning werkt niet in deze browser. Gebruik Chrome of Edge, of typ hieronder."); finish(); return; }
      rec.lang = "es-ES";
      rec.continuous = true;
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = function (ev) {
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) {
            var t = (ev.results[i][0].transcript || "").trim();
            if (t) heard.push(t);
          }
        }
      };
      rec.onerror = function (ev) {
        var code = ev && ev.error;
        // "no-speech" en "aborted" zijn geen fouten: de herkenning start dan gewoon opnieuw
        if (code === "aborted" || code === "no-speech") return;
        errored = true; S.note = errorText(code);
      };
      rec.onend = function () {
        if (cur !== rec || ended) return;
        var snel = Date.now() - lastStart < 400;
        restarts = snel ? restarts + 1 : 0;
        if (!userStop && !errored && restarts < 20) { begin(); return; }
        finish();
      };
      cur = rec; S.rec = rec;
      lastStart = Date.now();
      try { rec.start(); } catch (e) { errored = true; S.note = T("Spraakherkenning werkt niet in deze browser. Gebruik Chrome of Edge, of typ hieronder."); finish(); }
    }
    S.listening = true; S.note = "";
    updateMic();
    micStop = function () {
      // Stoppen op verzoek: de herkenning verwerkt eerst de laatste zin; blijft het eindsignaal uit, dan rond de app zelf af.
      userStop = true;
      try { if (cur) cur.stop(); } catch (e) {}
      setTimeout(function () { if (!ended) finish(); }, 3000);
    };
    begin();
  }
  function stopMic() {
    if (S.wrec) { whStop(); return; }
    if (micStop) micStop();
  }

  // ---------- Info: uitleg over de app, de maker en de bronnen ----------
  var INFO_SECTIONS = [
    { t: m("Wat is SpeechPartner.Spanish?", "What is SpeechPartner.Spanish?", "Was ist SpeechPartner.Spanish?", "Qu'est-ce que SpeechPartner.Spanish ?"),
      b: m("Een gratis hulpmiddel om Spaans te spreken, ook als je de taal nog niet goed kent. Je vindt er kant-en-klare zinnen, uitleg over de grammatica en een gesprekstrainer. De app werkt op je telefoon, zonder account en zonder server.",
           "A free tool to speak Spanish, even if you don't know the language well yet. It has ready-made sentences, grammar explanations and a conversation trainer. The app runs on your phone, without an account and without a server.",
           "Ein kostenloses Hilfsmittel, um Spanisch zu sprechen, auch wenn du die Sprache noch nicht gut kennst. Es gibt fertige Sätze, Grammatikerklärungen und einen Gesprächstrainer. Die App läuft auf deinem Telefon, ohne Konto und ohne Server.",
           "Un outil gratuit pour parler espagnol, même si tu ne le maîtrises pas encore. Il contient des phrases toutes prêtes, des explications de grammaire et un entraîneur de conversation. L'application fonctionne sur ton téléphone, sans compte et sans serveur.") },
    { t: m("Zo gebruik je de tabbladen", "How to use the tabs", "So benutzt du die Reiter", "Comment utiliser les onglets"),
      b: m("Zinnen: kant-en-klare zinnen per situatie, met de vertaling en een uitleg. Onderwerpen: zinnen per onderwerp. Vastlopen: wat je zegt als je even niets weet. Zin bouwen: maak zelf zinnen met een patroon. Reageren: antwoorden op wat je gesprekspartner zegt. Leren: korte lessen en oefeningen. Regels: grammatica in het kort, met een test. Gesprek: je gesprekspartner spreekt in, de app vertaalt en geeft antwoorden. Uitspraak: oefen je uitspraak met opnemen. Info: deze pagina.",
           "Sentences: ready-made sentences per situation, with translation and explanation. Topics: sentences per topic. Stuck: what to say when you don't know what to say. Build a sentence: make your own sentences with a pattern. React: answers to what your conversation partner says. Learn: short lessons and exercises. Rules: grammar in brief, with a test. Conversation: your partner speaks, the app translates and suggests answers. Pronunciation: practise your pronunciation by recording. Info: this page.",
           "Sätze: fertige Sätze pro Situation, mit Übersetzung und Erklärung. Themen: Sätze pro Thema. Hänger: was du sagst, wenn dir nichts einfällt. Satz bauen: eigene Sätze mit einem Muster. Reagieren: Antworten auf das, was dein Gesprächspartner sagt. Lernen: kurze Lektionen und Übungen. Regeln: Grammatik kurz gefasst, mit einem Test. Gespräch: dein Gesprächspartner spricht, die App übersetzt und schlägt Antworten vor. Aussprache: übe deine Aussprache mit Aufnehmen. Info: diese Seite.",
           "Phrases : phrases toutes prêtes par situation, avec traduction et explication. Sujets : phrases par sujet. Bloqué : que dire quand tu ne sais plus quoi dire. Construire une phrase : tes propres phrases avec un modèle. Réagir : réponses à ce que dit ton interlocuteur. Apprendre : courtes leçons et exercices. Règles : grammaire en bref, avec un test. Conversation : ton interlocuteur parle, l'application traduit et propose des réponses. Prononciation : entraîne ta prononciation en enregistrant. Info : cette page.") },
    { t: m("Spreken op de iPhone", "Speaking on iPhone", "Sprechen auf dem iPhone", "Parler sur iPhone"),
      b: m("Op de iPhone herkent de app spraak met een spraakmodel dat op je telefoon draait. Het model wordt één keer gedownload (ongeveer 40 of 80 MB; bij voorkeur via wifi). Daarna werkt het ook zonder internet. Tik op de microfoon, spreek de Spaanse zin en tik op Stop. Werkt de spraakherkenning niet goed, typ de zin dan in het typvak.",
           "On iPhone the app recognises speech with a speech model that runs on your phone. The model is downloaded once (about 40 or 80 MB; preferably over Wi-Fi). After that it also works without internet. Tap the microphone, say the Spanish sentence and tap Stop. If speech recognition doesn't work well, type the sentence in the text box.",
           "Auf dem iPhone erkennt die App Sprache mit einem Sprachmodell, das auf deinem Telefon läuft. Das Modell wird einmal heruntergeladen (etwa 40 oder 80 MB; am besten über WLAN). Danach funktioniert es auch ohne Internet. Tippe auf das Mikrofon, sprich den spanischen Satz und tippe auf Stopp. Funktioniert die Spracherkennung nicht gut, tippe den Satz in das Eingabefeld.",
           "Sur iPhone, l'application reconnaît la voix grâce à un modèle vocal qui tourne sur ton téléphone. Le modèle se télécharge une fois (environ 40 ou 80 Mo ; de préférence en Wi-Fi). Ensuite il fonctionne aussi hors ligne. Appuie sur le micro, dis la phrase espagnole puis appuie sur « Arrêter ». Si la reconnaissance vocale ne marche pas bien, tape la phrase dans la zone de saisie.") },
    { t: m("Aanleren", "Teaching the app", "Der App etwas beibringen", "Enseigner à l'application"),
      b: m("Herkent de app een zin of woord niet? Dan kun je het zelf aanleren. Doe dat alleen als je de betekenis zeker weet; de app geeft je daarvoor een controleknop (vraag het na of controleer online). Wat je aanleert, blijft op je eigen toestel.",
           "If the app doesn't recognise a sentence or word, you can teach it yourself. Only do this if you are sure of the meaning; the app gives you a check button for that (ask or check online). What you teach stays on your own device.",
           "Erkennt die App einen Satz oder ein Wort nicht, kannst du es ihr selbst beibringen. Tu das nur, wenn du die Bedeutung sicher kennst; dafür gibt es einen Prüfknopf (nachfragen oder online prüfen). Was du beibringst, bleibt auf deinem eigenen Gerät.",
           "Si l'application ne reconnaît pas une phrase ou un mot, tu peux le lui apprendre. Fais-le seulement si tu es sûr du sens ; un bouton de vérification t'aide (demander ou vérifier en ligne). Ce que tu enseignes reste sur ton propre appareil.") },
    { t: m("Over de maker", "About the maker", "Über den Entwickler", "À propos de l'auteur"),
      b: m("SpeechPartner.Spanish is ontworpen en gemaakt door Abel, in samenwerking met Claude (Anthropic). Abel bedacht de opzet, de inhoud en de werkwijze; Claude heeft de code en de teksten uitgewerkt en getest.",
           "SpeechPartner.Spanish was designed and created by Abel, in collaboration with Claude (Anthropic). Abel devised the concept, content and approach; Claude developed and tested the code and texts.",
           "SpeechPartner.Spanish wurde von Abel entworfen und erstellt, in Zusammenarbeit mit Claude (Anthropic). Abel hat das Konzept, den Inhalt und die Herangehensweise entwickelt; Claude hat den Code und die Texte ausgearbeitet und getestet.",
           "SpeechPartner.Spanish a été conçu et créé par Abel, en collaboration avec Claude (Anthropic). Abel a imaginé le concept, le contenu et la démarche ; Claude a développé et testé le code et les textes.") },
    { t: m("Bronnen en licenties", "Sources and licences", "Quellen und Lizenzen", "Sources et licences"),
      b: m("Woordenlijst: Wiktionary, CC BY-SA 4.0, via kaikki.org. Spraakherkenning: Whisper (OpenAI, MIT-licentie) via Hugging Face en Transformers.js (Apache 2.0). De app zelf is gratis; er wordt niets verkocht.",
           "Word list: Wiktionary, CC BY-SA 4.0, via kaikki.org. Speech recognition: Whisper (OpenAI, MIT licence) via Hugging Face and Transformers.js (Apache 2.0). The app itself is free; nothing is sold.",
           "Wortliste: Wiktionary, CC BY-SA 4.0, über kaikki.org. Spracherkennung: Whisper (OpenAI, MIT-Lizenz) über Hugging Face und Transformers.js (Apache 2.0). Die App selbst ist kostenlos; es wird nichts verkauft.",
           "Liste de mots : Wiktionary, CC BY-SA 4.0, via kaikki.org. Reconnaissance vocale : Whisper (OpenAI, licence MIT) via Hugging Face et Transformers.js (Apache 2.0). L'application est gratuite ; rien n'est vendu.") }
  ];
  // ---------- Overzicht van de tabbladen, instellingen en extra's (Info-pagina) ----------
  var TAB_GUIDE = [
    { n: m("Zinnen", "Sentences", "Sätze", "Phrases"),
      w: m("Kant-en-klare zinnen per situatie, zoals begroeten, eten, werk en vakantie, met vertaling en uitleg.",
           "Ready-made sentences per situation, such as greeting, eating, work and holidays, with translation and explanation.",
           "Fertige Sätze pro Situation, zum Beispiel Begrüßen, Essen, Arbeit und Urlaub, mit Übersetzung und Erklärung.",
           "Phrases toutes prêtes par situation, comme saluer, manger, le travail et les vacances, avec traduction et explication."),
      k: [m("Kies bovenaan een groep.", "Choose a group at the top.", "Wähle oben eine Gruppe.", "Choisis un groupe en haut."),
          m("Tik op het luidsprekertje om een zin te horen.", "Tap the speaker icon to hear a sentence.", "Tippe auf das Lautsprechersymbol, um einen Satz zu hören.", "Touche le haut-parleur pour entendre une phrase."),
          m("Bij sommige zinnen kun je met 'Bouw verder' zelf een zin maken.", "For some sentences, 'Continue' lets you make your own sentence.", "Bei manchen Sätzen kannst du mit 'Weiter' deinen eigenen Satz bauen.", "Pour certaines phrases, « Continuer » te permet de faire ta propre phrase."),
          m("Zinnen die je begrijpt verdwijnen. Zet ze terug via Instellingen.", "Sentences you understand disappear. Bring them back via Settings.", "Verstandene Sätze verschwinden. Hol sie über die Einstellungen zurück.", "Les phrases que tu comprends disparaissent. Remets-les via les réglages.")] },
    { n: m("Onderwerpen", "Topics", "Themen", "Sujets"),
      w: m("Vragen per onderwerp om een gesprek te beginnen of gaande te houden.",
           "Questions per topic to start or keep a conversation going.",
           "Fragen pro Thema, um ein Gespräch zu beginnen oder am Laufen zu halten.",
           "Questions par sujet pour lancer ou entretenir une conversation."),
      k: [m("Lees de vraag hardop en luister naar het voorbeeld.", "Read the question aloud and listen to the example.", "Lies die Frage laut vor und höre das Beispiel an.", "Lis la question à voix haute et écoute l'exemple."),
          m("Gebruik ze als het gesprek stilvalt.", "Use them when the conversation stalls.", "Nutze sie, wenn das Gespräch stockt.", "Utilise-les quand la conversation s'arrête.")] },
    { n: m("Vastlopen", "Stuck", "Hänger", "Bloqué"),
      w: m("Wat je zegt als je even niets weet.", "What to say when you don't know what to say.", "Was du sagst, wenn dir nichts einfällt.", "Que dire quand tu ne sais plus quoi dire."),
      k: [m("Een grote zin met luisterknop.", "A large sentence with a listen button.", "Ein großer Satz mit Hörknopf.", "Une grande phrase avec bouton d'écoute."),
          m("'Andere zin' laat een nieuwe zin zien.", "'Another phrase' shows a new one.", "'Anderer Satz' zeigt einen neuen.", "« Autre phrase » en affiche une nouvelle."),
          m("Onderaan staat de volledige lijst.", "The full list is at the bottom.", "Unten steht die vollständige Liste.", "La liste complète est en bas.")] },
    { n: m("Zin bouwen", "Build a sentence", "Satz bauen", "Construire une phrase"),
      w: m("Bouw zelf zinnen vanuit een startzin, met het juiste werkwoord bij de gekozen persoon.", "Build your own sentences from a starter sentence, with the right verb form for the person you choose.", "Baue eigene Sätze aus einem Startsatz, mit der richtigen Verbform für die gewählte Person.", "Construis tes propres phrases à partir d'une phrase de départ, avec la bonne forme du verbe pour la personne choisie."),
      k: [m("Kies een startzin en tik op 'Bouw verder →'.", "Choose a starter sentence and tap 'Continue →'.", "Wähle einen Startsatz und tippe auf 'Weiter →'.", "Choisis une phrase de départ et touche « Continuer → »."),
          m("Kies een verbindingswoord, wie het doet en wat die persoon doet.", "Choose a connecting word, who does it and what that person does.", "Wähle ein Bindewort, wer es tut und was die Person tut.", "Choisis un mot de liaison, qui le fait et ce que fait cette personne.")] },
    { n: m("Reageren", "React", "Reagieren", "Réagir"),
      w: m("Antwoorden op wat je gesprekspartner vraagt, of op wat een vriend vertelt.", "Answers to what your partner asks, or to what a friend tells you.", "Antworten auf das, was dein Gesprächspartner fragt, oder auf das, was ein Freund erzählt.", "Réponses à ce que ton interlocuteur demande, ou à ce qu'un ami raconte."),
      k: [m("'Ik vraag': antwoorden op vragen van je partner.", "'I ask': answers to questions from your partner.", "'Ich frage': Antworten auf Fragen deines Partners.", "« Je demande » : réponses aux questions de ton interlocuteur."),
          m("'Vriend vertelt': reageer op een verhaal.", "'A friend tells': respond to a story.", "'Freund erzählt': reagiere auf eine Geschichte.", "« L'ami raconte » : réagis à une histoire."),
          m("Begrepen reacties verdwijnen uit de lijst.", "Understood responses disappear from the list.", "Verstandene Reaktionen verschwinden aus der Liste.", "Les réponses comprises disparaissent de la liste.")] },
    { n: m("Leren", "Learn", "Lernen", "Apprendre"),
      w: m("Oefenen met kaarten, een quiz, grammatica en patronen.", "Practise with flashcards, a quiz, grammar and patterns.", "Üben mit Karteikarten, einem Quiz, Grammatik und Mustern.", "S'entraîner avec des cartes, un quiz, la grammaire et des modèles."),
      k: [m("Kaarten: markeer wat je al kent als 'gekend'.", "Flashcards: mark what you already know with 'Known'.", "Karten: markiere, was du schon kannst, mit 'Gekonnt'.", "Cartes : marque ce que tu connais déjà avec « Acquis »."),
          m("Quiz: je krijgt de betekenis en kiest uit drie zinnen: één is goed, één bevat een grammaticafout en één betekent iets anders. Bij elk fout antwoord krijg je uitleg.", "Quiz: you see the meaning and choose from three sentences: one is correct, one contains a grammar mistake and one means something else. Every wrong answer comes with an explanation.", "Quiz: Du siehst die Bedeutung und wählst aus drei Sätzen: einer ist richtig, einer enthält einen Grammatikfehler und einer bedeutet etwas anderes. Zu jeder falschen Antwort gibt es eine Erklärung.", "Quiz : tu vois le sens et tu choisis parmi trois phrases : une est correcte, une contient une faute de grammaire et une veut dire autre chose. Chaque mauvaise réponse est expliquée."),
          m("Grammatica: korte regels met voorbeelden en het waarom.", "Grammar: short rules with examples and the reason.", "Grammatik: kurze Regeln mit Beispielen und dem Warum.", "Grammaire : courtes règles avec exemples et explication."),
          m("Patronen: kies een patroon, vul het in met woorden die je al kent en lees je zin hardop voor.", "Patterns: pick a pattern, fill it in with words you already know and read your sentence aloud.", "Muster: wähle ein Muster, fülle es mit Wörtern, die du schon kennst, und lies deinen Satz laut vor.", "Modèles : choisis un modèle, complète-le avec des mots que tu connais déjà et lis ta phrase à voix haute.")] },
    { n: m("Regels", "Rules", "Regeln", "Règles"),
      w: m("Grammatica in het kort, met voorbeelden en een korte test.", "Grammar in brief, with examples and a short test.", "Grammatik kurz gefasst, mit Beispielen und einem kurzen Test.", "La grammaire en bref, avec exemples et un court test."),
      k: [m("Tik op het luidsprekertje om een voorbeeld te horen.", "Tap the speaker icon to hear an example.", "Tippe auf das Lautsprechersymbol, um ein Beispiel zu hören.", "Touche le haut-parleur pour entendre un exemple."),
          m("Doe de test om te zien wat je onthoudt.", "Take the test to see what you remember.", "Mach den Test, um zu sehen, was du behältst.", "Fais le test pour voir ce que tu retiens.")] },
    { n: m("Gesprek", "Conversation", "Gespräch", "Conversation"),
      w: m("Je gesprekspartner spreekt in of typt, de app vertaalt en geeft antwoorden.", "Your partner speaks or types, the app translates and suggests answers.", "Dein Gesprächspartner spricht oder tippt, die App übersetzt und schlägt Antworten vor.", "Ton interlocuteur parle ou écrit, l'application traduit et propose des réponses."),
      k: [m("Tik op Opnemen en spreek Spaans, of typ de zin in het veld.", "Tap Record and speak Spanish, or type the sentence in the field.", "Tippe auf Aufnehmen und sprich Spanisch, oder tippe den Satz ins Feld.", "Touche Enregistrer et parle espagnol, ou écris la phrase dans le champ."),
          m("Elke zin krijgt een vertaling, met uitleg per woord.", "Every sentence gets a translation, with an explanation per word.", "Jeder Satz bekommt eine Übersetzung, mit Erklärung pro Wort.", "Chaque phrase reçoit une traduction, avec une explication par mot."),
          m("Rechts staan mogelijke antwoorden in bellen.", "Possible answers are shown on the right in bubbles.", "Rechts stehen mögliche Antworten in Sprechblasen.", "À droite, les réponses possibles dans des bulles."),
          m("Verbeter een vertaling of voeg een eigen antwoord toe.", "Correct a translation or add your own answer.", "Verbessere eine Übersetzung oder füge eine eigene Antwort hinzu.", "Corrige une traduction ou ajoute ta propre réponse."),
          m("Met 'Wis gesprek' begin je het gesprek opnieuw.", "With 'Clear conversation' you start the conversation over.", "Mit 'Gespräch leeren' fängst du das Gespräch neu an.", "Avec « Effacer la conversation », tu recommences la conversation."),
          m("Op de iPhone wordt spraak herkend met een model dat je eenmalig downloadt, met jouw toestemming.", "On iPhone, speech is recognised with a model you download once, with your permission.", "Auf dem iPhone wird Sprache mit einem Modell erkannt, das du einmalig mit deiner Zustimmung herunterlädst.", "Sur iPhone, la parole est reconnue par un modèle que tu télécharges une fois, avec ton accord.")] },
    { n: m("Uitspraak", "Pronunciation", "Aussprache", "Prononciation"),
      w: m("Oefen je uitspraak met opnemen en vergelijken, met minimale paren en shadowing.", "Practise your pronunciation by recording and comparing, with minimal pairs and shadowing.", "Übe deine Aussprache mit Aufnehmen und Vergleichen, mit Minimalpaaren und Shadowing.", "Entraîne ta prononciation en enregistrant et en comparant, avec paires minimales et shadowing."),
      k: [m("Luister, herhaal en neem jezelf op.", "Listen, repeat and record yourself.", "Hör zu, wiederhole und nimm dich auf.", "Écoute, répète et enregistre-toi."),
          m("Na het opnemen zie je per woord en per klank wat afweek van het voorbeeld, met een tip.", "After recording you see, per word and per sound, what differed from the example, with a tip.", "Nach der Aufnahme siehst du pro Wort und pro Laut, was vom Beispiel abwich, mit einem Tipp.", "Après l'enregistrement, tu vois pour chaque mot et chaque son ce qui différait de l'exemple, avec un conseil."),
          m("Vergelijk jezelf met het voorbeeld en beoordeel jezelf.", "Compare yourself with the example and assess yourself.", "Vergleiche dich mit dem Beispiel und bewerte dich selbst.", "Compare-toi à l'exemple et évalue-toi."),
          m("Het tempo stel je in bij Instellingen.", "Set the speed in Settings.", "Das Tempo stellst du in den Einstellungen ein.", "Règle la vitesse dans les réglages.")] },
    { n: m("Info", "Info", "Info", "Info"),
      w: m("Deze pagina: uitleg over de app en de tabbladen.", "This page: an explanation of the app and the tabs.", "Diese Seite: Erklärung der App und der Reiter.", "Cette page : explication de l'application et des onglets."),
      k: [] }
  ];
  var EXTRA_GUIDE = { n: m("Instellingen en extra's", "Settings and extras", "Einstellungen und Extras", "Réglages et extras"),
    k: [m("Vertaalbalk bovenaan: typ Nederlands en tik op Vertaal.", "Translation bar at the top: type English and tap Translate.", "Übersetzungsleiste oben: Gib einen deutschen Satz ein und tippe auf Übersetzen.", "Barre de traduction en haut : écris en français et touche Traduire."),
        m("Taal: via het logo of het tandwiel (Nederlands, Engels, Duits, Frans).", "Language: via the logo or the gear icon (Dutch, English, German, French).", "Sprache: über das Logo oder das Zahnrad (Niederländisch, Englisch, Deutsch, Französisch).", "Langue : via le logo ou la roue crantée (néerlandais, anglais, allemand, français)."),
        m("Thema: Standaard, Systeem (donker als je telefoon dat is), Café, IJs, Jungle of Ruimte.", "Theme: Standard, System (dark when your phone is), Café, Ice, Jungle or Outer space.", "Design: Standard, System (dunkel, wenn dein Telefon es ist), Café, Eis, Dschungel oder Weltraum.", "Thème : Standard, Système (sombre si ton téléphone l'est), Café, Glace, Jungle ou Espace."),
        m("Gesprekspartner: automatisch, neutraal (o/a), man (hij) of vrouw (zij). Automatisch leidt het alleen af uit een zin die de partner over zichzelf zegt.", "Conversation partner: automatic, neutral (o/a), man (he) or woman (she). Automatic only uses a sentence in which the partner describes themselves.", "Gesprächspartner: automatisch, neutral (o/a), Mann (er) oder Frau (sie). Automatisch leitet nur aus einem Satz ab, in dem der Partner sich selbst beschreibt.", "Partenaire : automatique, neutre (o/a), homme (il) ou femme (elle). Automatique ne se base que sur une phrase où le partenaire se décrit lui-même."),
        m("Mijn geslacht: man (Estoy cansado) of vrouw (Estoy cansada). Zo krijgen zinnen over jezelf de juiste Spaanse vorm.", "My gender: male (Estoy cansado) or female (Estoy cansada). This gives sentences about yourself the right Spanish form.", "Mein Geschlecht: männlich (Estoy cansado) oder weiblich (Estoy cansada). So bekommen Sätze über dich die richtige spanische Form.", "Mon genre : masculin (Estoy cansado) ou féminin (Estoy cansada). Ainsi, les phrases sur toi ont la bonne forme en espagnol."),
        m("Snelheid van voorlezen: stel het tempo in.", "Reading speed: set the tempo.", "Vorlesegeschwindigkeit: stelle das Tempo ein.", "Vitesse de lecture : règle le rythme."),
        m("'Begrepen items resetten' zet de begrepen items terug. 'Voortgang resetten' wist je voortgang.", "'Reset understood items' brings back the understood items. 'Reset progress' clears your progress.", "'Verstandene zurücksetzen' holt die verstandenen Elemente zurück. 'Fortschritt zurücksetzen' löscht deinen Fortschritt.", "« Réinitialiser les éléments compris » remet les éléments compris. « Réinitialiser la progression » efface ta progression."),
        m("De onderste balk verdwijnt na een paar seconden. Tik op het belletje of scroll naar het einde van de pagina om hem terug te halen.", "The bottom bar disappears after a few seconds. Tap the bell or scroll to the end of the page to bring it back.", "Die untere Leiste verschwindet nach ein paar Sekunden. Tippe auf das Glöckchen oder scrolle bis zum Ende der Seite, um sie zurückzuholen.", "La barre du bas disparaît après quelques secondes. Touche la cloche ou fais défiler jusqu'à la fin de la page pour la faire revenir."),
        m("De uil in de koptekst reageert op het gesprek. Tik erop voor een sprong.", "The owl in the header reacts to the conversation. Tap it for a hop.", "Die Eule im Kopfbereich reagiert auf das Gespräch. Tippe darauf für einen Hüpfer.", "La chouette dans l'en-tête réagit à la conversation. Touche-la pour un petit saut."),
        m("De tabbladen staan altijd op dezelfde plek. Info opent met het ?-knopje in de banner.", "The tabs always stay in the same place. Info opens with the ? button in the banner.", "Die Reiter bleiben immer an derselben Stelle. Info öffnest du mit dem ?-Knopf im Banner.", "Les onglets restent toujours au même endroit. Info s'ouvre avec le bouton ? dans la bannière.")] };
  // Info als boekje: vaste bladgrootte, lange onderdelen verdeeld over meerdere bladen.
  // Over de maker, bronnen en licenties en de versie blijven onderaan als vaste kaarten staan.
  function infoSec(title, body) {
    var b = el("div", "leafsec");
    b.appendChild(el("h4", "sec-title", title));
    b.appendChild(typeof body === "string" ? el("p", "", body) : body);
    return b;
  }
  function goLeaf(i) {
    var bk = document.querySelector("#view .booklet");
    if (!bk) return;
    var cur = +bk.dataset.cur;
    if (i === cur) return;
    flipTo(bk.querySelector(".leaf-card"), i > cur ? 1 : -1, function () { S.infoLeaf = i; render(); });
  }
  // Verdeelt onderdelen over bladen op basis van hun lengte, zodat een blad niet te vol wordt
  var TAB_BUDGET = 460;
  function pack(items, weight, budget) {
    var out = [], cur = [], sum = 0;
    items.forEach(function (it) {
      var wgt = weight(it);
      if (cur.length && sum + wgt > budget) { out.push(cur); cur = []; sum = 0; }
      cur.push(it);
      sum += wgt;
    });
    if (cur.length) out.push(cur);
    return out;
  }
  function viewInfo() {
    var w = el("div");
    // 1. Buiten de losse app (bijv. in Safari): eerst de stappen om de pagina op het beginscherm te zetten.
    var slot = el("div");
    slot.id = "installSlot";
    w.appendChild(slot);

    // De bladen van het boekje
    var pages = [];
    function page(title, blocks) {
      var p = el("div", "leafpage");
      p.appendChild(el("h3", "leafhead", title));
      blocks.forEach(function (b) { p.appendChild(b); });
      pages.push(p);
    }

    // Blad: wat is het
    page(L(INFO_SECTIONS[0].t), [infoSec(L(m("Waar het over gaat", "What it is about", "Worum es geht", "De quoi il s'agit")), L(INFO_SECTIONS[0].b))]);

    // Blad: het gespreksmodel dat één keer gedownload wordt
    page(L(m("Gespreksmodel en offline gebruik", "Conversation model and offline use", "Gesprächsmodell und Offline-Nutzung", "Modèle de conversation et usage hors ligne")), [
      infoSec(L(m("Eenmalige download", "One-time download", "Einmaliger Download", "Téléchargement unique")), L(m(
        "Voor de spraakherkenning heeft de app eenmalig een gespreksmodel nodig. Dat wordt op je toestel gedownload: ongeveer 40 MB voor de snelle versie of 80 MB voor de nauwkeurige.",
        "For speech recognition the app needs a conversation model once. It is downloaded to your device: about 40 MB for the fast version or 80 MB for the more accurate one.",
        "Für die Spracherkennung braucht die App einmalig ein Gesprächsmodell. Es wird auf dein Gerät heruntergeladen: etwa 40 MB für die schnelle Version oder 80 MB für die genauere.",
        "Pour la reconnaissance vocale, l'application a besoin, une seule fois, d'un modèle de conversation. Il est téléchargé sur ton appareil : environ 40 Mo pour la version rapide ou 80 Mo pour la version plus précise.")))
      , infoSec(L(m("Offline gebruik", "Offline use", "Offline-Nutzung", "Usage hors ligne")), L(m(
        "Daarna kun je de dienst offline gebruiken.",
        "After that you can use the service offline.",
        "Danach kannst du den Dienst offline nutzen.",
        "Ensuite, tu peux utiliser le service hors ligne.")))
    ]);

    // Bladen: de Help, per vier onderdelen op één blad
    var helpTitle = L(m("Help: stappenplan", "Help: step plan", "Hilfe: Schritt-für-Schritt-Plan", "Aide : plan pas à pas"));
    pack(HELP_GUIDE, function () { return 130; }, 500).forEach(function (group) {
      var blocks = [];
      group.forEach(function (sec) {
        var d = el("details", "help-sec");
        d.appendChild(el("summary", "", L(sec.t)));
        var ol = el("ol", "help-steps");
        sec.s.forEach(function (x) { ol.appendChild(el("li", "", L(x))); });
        d.appendChild(ol);
        blocks.push(d);
      });
      page(helpTitle, blocks);
    });

    // Bladen: het overzicht per tabblad, twee per blad
    pack(TAB_GUIDE, function (tb) {
      return 80 + L(tb.w).length + tb.k.reduce(function (a, k) { return a + L(k).length + 25; }, 0);
    }, TAB_BUDGET).forEach(function (group) {
      var tblocks = [];
      group.forEach(function (tb) {
        var sec = infoSec(L(tb.n), L(tb.w));
        if (tb.k.length) {
          var ul = el("ul", "guide-list");
          tb.k.forEach(function (k) { ul.appendChild(el("li", "", L(k))); });
          sec.appendChild(ul);
        }
        tblocks.push(sec);
      });
      page(T("Tabbladen"), tblocks);
    });

    // Blad: instellingen en extra's
    pack(EXTRA_GUIDE.k, function (k) { return L(k).length + 25; }, TAB_BUDGET).forEach(function (group, gi) {
      var exl = el("ul", "guide-list");
      group.forEach(function (k) { exl.appendChild(el("li", "", L(k))); });
      page(L(EXTRA_GUIDE.n), [exl]);
    });

    // Blad: spreken op de iPhone
    page(L(INFO_SECTIONS[2].t), [el("p", "", L(INFO_SECTIONS[2].b))]);

    // Blad: aanleren
    page(L(INFO_SECTIONS[3].t), [el("p", "", L(INFO_SECTIONS[3].b))]);

    // Blad: privacy (los document, dus een gewone link)
    var privA = el("a", "", L(m("Lees de privacyverklaring", "Read the privacy statement", "Zur Datenschutzerklärung", "Lire la déclaration de confidentialité")));
    privA.href = "privacy.html";
    page(L(m("Privacy", "Privacy", "Datenschutz", "Confidentialité")), [el("p", "", L(m(
      "De app heeft geen account, geen advertenties en geen gebruiksstatistieken. Je voortgang blijft op je eigen toestel.",
      "The app has no account, no ads and no analytics. Your progress stays on your own device.",
      "Die App hat kein Konto, keine Werbung und keine Nutzungsanalyse. Dein Fortschritt bleibt auf deinem Gerät.",
      "L'application n'a ni compte, ni publicité, ni statistiques d'utilisation. Ta progression reste sur ton appareil.")) ), privA]);

    // Het boekje zelf: één blad tegelijk, een vaste grootte, stipjes onderaan
    var n = pages.length;
    var cur = Math.min(S.infoLeaf || 0, n - 1);
    var bk = el("div", "booklet");
    bk.dataset.n = String(n);
    bk.dataset.cur = String(cur);
    var card = el("div", "card leaf-card");
    card.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("button, a, input, textarea, select, details, .leafdots")) return;
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      var next = x > 0.7 ? cur + 1 : (x < 0.3 ? cur - 1 : cur);
      if (next !== cur && next >= 0 && next < n) goLeaf(next);
    });
    card.appendChild(pages[cur]);
    // Eerste blad: laat zien dat je verder kunt bladeren
    if (cur === 0 && n > 1) {
      var hint = el("button", "leafhint", L(m(
        "Tik rechts op de kaart om verder te bladeren. Links tikken gaat een blad terug.",
        "Tap the right side of the card to go to the next page. Tap the left side to go back.",
        "Tippe rechts auf die Karte, um weiterzublättern. Links tippen blättert zurück.",
        "Touche le côté droit de la carte pour passer à la page suivante. Touche le côté gauche pour revenir en arrière.")) + " →");
      hint.type = "button";
      hint.onclick = function (e) { e.stopPropagation(); goLeaf(1); };
      card.appendChild(hint);
    }
    card.appendChild(el("div", "leafnum", (cur + 1) + " / " + n));
    bk.appendChild(card);
    var dots = el("div", "leafdots");
    pages.forEach(function (_, i) {
      var d = el("button", "leafdot" + (i === cur ? " on" : ""));
      d.type = "button";
      d.setAttribute("aria-label", String(i + 1));
      d.onclick = function () { goLeaf(i); };
      dots.appendChild(d);
    });
    bk.appendChild(dots);
    w.appendChild(bk);

    // Vaste kaarten onderaan: over de maker, bronnen en licenties, en de versie
    [4, 5].forEach(function (i) {
      var c = el("div", "card");
      c.appendChild(el("div", "sec-title", L(INFO_SECTIONS[i].t)));
      c.appendChild(el("div", "", L(INFO_SECTIONS[i].b)));
      w.appendChild(c);
    });
    var head = el("div", "card");
    head.appendChild(el("div", "sec-title", "SpeechPartner.Spanish"));
    head.appendChild(el("div", "nl", T("Versie") + " " + APP_VERSION + " · " + T("Gemaakt door Abel, met Claude")));
    w.appendChild(head);
    return w;
  }

  function viewGesprek() {
    var w = el("div");
    var built = [];
    var row = el("div", "chips");
    if (S.listening) row.appendChild(btn("⏹ " + T("Stop"), "primary", stopMic));
    else row.appendChild(btn("🎤 " + T("Opnemen"), "primary", startMic));
    if (S.convo.length) row.appendChild(btn(T("Wis gesprek"), "small", function () { S.convo = []; S.chatStartTurn = null; S.note = ""; render(); }));
    w.appendChild(row);
    if (S.note) w.appendChild(el("div", "bad", S.note));
    if (isIOS()) {
      if (S.whAsk) w.appendChild(whConsentCard());
      else if (store.get("whModel", null) && !WH.ready && !WH.pending) whLoadWithNote();
      var ws = el("div", "note", S.whStatus || "");
      ws.id = "whStatus";
      if (!S.whStatus) ws.style.display = "none";
      w.appendChild(ws);
      if (store.get("whModel", null) && !S.whAsk && !S.listening) {
        w.appendChild(btn(T("Spraakmodel wijzigen"), "small", function () { S.whAsk = true; render(); }));
      }
    }
    w.appendChild(el("div", "note", T("Spraak hangt af van je browser. Het typvak werkt altijd.")));

    var box = el("div", "card");
    box.appendChild(el("div", "nl", T("Of typ wat je gesprekspartner zei")));
    var tIn = document.createElement("textarea");
    tIn.className = "big-input";
    tIn.style.minHeight = "56px";
    tIn.placeholder = T("Typ hier de Spaanse zin");
    box.appendChild(tIn);
    box.appendChild(btn(T("Verwerk"), "primary", function () {
      var v = tIn.value.trim();
      if (!v) return;
      S.note = "";
      S.convo.push(makeTurn(v));
      render();
    }));
    w.appendChild(box);

    if (!S.convo.length) {
      w.appendChild(el("div", "note", T("Nog geen gesprek. Tik op de microfoon en zeg bijvoorbeeld ¿Qué tal?")));
      return w;
    }
    function refresh(t) { var nt = makeTurn(t.es); t.tr = nt.tr; t.options = nt.options; S.teach = null; render(); }
    function teachForm(card, ph, onSave, ctx) {
      // Eerst uitleg: alleen aanleren wat je zeker weet, met twee manieren om het na te gaan.
      var info = el("div", "card panel");
      info.appendChild(el("div", "sec-title", T("Eerst controleren, dan aanleren")));
      info.appendChild(el("div", "", ctx.kind === "antwoord"
        ? T("Voeg alleen een antwoord toe waarvan je zeker weet dat het goed Spaans is. De app toont het daarna zonder controle.")
        : T("Leer de app alleen iets aan als je de betekenis zeker weet. De app toont jouw vertaling daarna als juist. Weet je het niet zeker? Vraag het na of controleer het online, of sla niets op.")));
      var hr = el("div", "chips");
      if (ctx.kind !== "antwoord") {
        var q = "¿Qué significa " + ctx.text + "?";
        hr.appendChild(btn("🔊 " + T("Vraag het na") + ": " + q, "small", function () { speak(q); }));
      }
      var a = document.createElement("a");
      a.className = "btn small"; a.target = "_blank"; a.rel = "noopener";
      a.textContent = T("Controleer online");
      a.href = "https://translate.google.com/?sl=es&tl=" + lang + "&text=" + encodeURIComponent(ctx.text) + "&op=translate";
      hr.appendChild(a);
      info.appendChild(hr);
      card.appendChild(info);
      var f = el("div", "row");
      var inp = document.createElement("input");
      inp.type = "text"; inp.className = "teach-input"; inp.placeholder = ph;
      f.appendChild(inp);
      f.appendChild(btn(T("Opslaan"), "primary small", function () { var v = inp.value.trim(); if (v) onSave(v); }));
      f.appendChild(btn(T("Annuleer"), "small", function () { S.teach = null; render(); }));
      card.appendChild(f);
    }
    S.convo.forEach(function (t, ti) {
      // Jouw eigen beurt (vanuit de vertaalbox): rechts, met de andere manieren om het te zeggen
      if (t.me) {
        var mt = el("div", "turn");
        var mb = el("div", "line-row bubble me");
        var mx = el("div", "txt");
        mx.appendChild(el("div", "nl", T("Jij zei")));
        mx.appendChild(el("div", "es", t.es));
        mb.appendChild(mx);
        mb.appendChild(speakBtn(t.es));
        mt.appendChild(mb);
        if (t.missing && t.missing.length) mt.appendChild(el("div", "bad", T("Niet in de lijst:") + " " + t.missing.join(", ")));
        // Woord voor woord: elk Spaans woord met zijn betekenis in de gekozen taal
        var grb = glossBlock(t.es);
        if (grb) mt.appendChild(grb);
        var mrep = el("div", "replies");
        if (altsFor(t.es).length) mrep.appendChild(altBlock(altsFor(t.es)));
        // Vervolgopties: wat de gesprekspartner kan antwoorden, en vragen die je zelf kunt stellen
        var mopts = t.flow ? [] : makeTurn(t.es).options;
        if (mopts.length) {
          mrep.appendChild(el("div", "sec-title", T("Mogelijke vervolg")));
          mopts.forEach(function (o) {
            var l = el("div", "line-row bubble me");
            var x = el("div", "txt");
            x.appendChild(el("div", "nl", L(o.label)));
            x.appendChild(el("div", "es", o.es));
            if (o.m) x.appendChild(el("div", "nl", L(o.m)));
            l.appendChild(x);
            l.appendChild(speakBtn(o.es));
            mrep.appendChild(l);
          });
        }
        mt.appendChild(mrep);
        built.push(mt);
        return;
      }
      var turn = el("div", "turn");
      var card = el("div", "card bubble partner");
      card.appendChild(el("div", "nl", T("Gesprekspartner zei")));
      var line = el("div", "line-row");
      var tx = el("div", "txt");
      tx.appendChild(el("div", "es", t.es));
      line.appendChild(tx);
      line.appendChild(speakBtn(t.es));
      card.appendChild(line);
      card.appendChild(el("div", "nl", T("Vertaling")));
      // De vertaling wordt bij het tonen opnieuw gemaakt, zodat ze altijd de gekozen taal volgt.
      var trr = t.fixedM ? { text: L(t.fixedM) } : (esToLang(t.es) || t.tr);
      // Eerst de volledige zinvertaling, daaronder de woord-voor-woord-laag (één keer)
      if (trr.text) card.appendChild(el("div", "sentence-tr", trr.text));
      else card.appendChild(el("div", "note", T("Nog geen volledige zinsvertaling. Tik op Verbeter vertaling om er een toe te voegen.")));
      var pgl = glossBlock(t.es); if (pgl) card.appendChild(pgl);
      if (altsFor(t.es).length) card.appendChild(altBlock(altsFor(t.es)));
      if (t.gen) card.appendChild(el("div", "nl", T("Uit de zin afgeleid: vorm voor de gesprekspartner") + " (" + (t.gen === "zij" ? "zij" : "hij") + ")"));
      if (trr.about && trr.es) card.appendChild(el("div", "nl", T("Herkend als:") + " " + trr.es));
      if (trr.learned) card.appendChild(el("div", "nl", T("Door jou aangeleerd")));
      var teach = (S.teach && S.teach.i === ti) ? S.teach : null;
      if (trr.missing && trr.missing.length) {
        card.appendChild(el("div", "bad", T("Niet in de lijst. Tik op een woord om het de app te leren:")));
        var mr = el("div", "chips");
        trr.missing.forEach(function (wd) {
          mr.appendChild(btn(wd + " = ?", teach && teach.word === wd ? "primary small" : "small", function () { S.teach = { i: ti, kind: "word", word: wd }; render(); }));
        });
        card.appendChild(mr);
      }
      var tr2 = el("div", "chips");
      tr2.appendChild(btn(T("Verbeter vertaling"), "small", function () { S.teach = { i: ti, kind: "zin" }; render(); }));
      tr2.appendChild(btn(T("Eigen antwoord toevoegen"), "small", function () { S.teach = { i: ti, kind: "antwoord" }; render(); }));
      card.appendChild(tr2);
      if (teach && teach.kind === "word") teachForm(card, teach.word + " = …", function (v) { learnWord(teach.word, v); refresh(t); }, { kind: "word", text: teach.word });
      if (teach && teach.kind === "zin") teachForm(card, T("Wat betekent deze zin?"), function (v) { learnSentence(t.es, v); refresh(t); }, { kind: "zin", text: t.es.replace(/[¿?¡!.]+/g, "").trim() });
      if (teach && teach.kind === "antwoord") teachForm(card, T("Jouw antwoord in het Spaans"), function (v) { learnReply(t.es, v); refresh(t); }, { kind: "antwoord", text: t.es });
      turn.appendChild(card);
      // Vervolgopties als eigen bellen aan de andere kant van het gesprek
      var rep = el("div", "replies");
      if (t.options.length) {
        rep.appendChild(el("div", "sec-title", t.help ? T("Kies wat je wilt vragen:") : T("Mogelijke vervolg")));
        t.options.forEach(function (o) {
          var l = el("div", "line-row bubble me" + (t.help ? " pick" : ""));
          var x = el("div", "txt");
          x.appendChild(el("div", "nl", L(o.label)));
          x.appendChild(el("div", "es", o.es));
          if (o.m) x.appendChild(el("div", "nl", L(o.m)));
          l.appendChild(x);
          l.appendChild(speakBtn(o.es));
          if (t.help) {
            l.setAttribute("role", "button");
            l.onclick = function () { pickHelp(t, o); };
          }
          rep.appendChild(l);
        });
        // De start van de chat (vanuit de vertaalbox) krijgt de antwoorden pas na de opneemfunctie
        turn.appendChild(rep);
      }
      built.push(turn);
    });
    // Chronologisch: de nieuwste beurt staat onderaan, en de opneemkaart volgt direct daarna
    var out = el("div");
    built.forEach(function (x) { out.appendChild(x); });
    out.appendChild(w);
    return out;
  }

  // ---------- Uitspraaktrainer ----------
  var PR = { sub: "pairs", pair: 0, side: "a", shadow: 0, rr: 0, ds: 0, dt: 0 };
  var prRec = null, prChunks = [], prUrl = null, prStream = null, prCtx = null;

  function prStartRecording(onStop) {
    if (!navigator.mediaDevices || !window.MediaRecorder) return Promise.resolve(false);
    // Geen ruis- of echo-onderdrukking (die dempen een gesprekspartner op afstand),
    // en het signaal wordt versterkt en begrensd zodat de partner goed hoorbaar is.
    var constraints = { audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } };
    return navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      var AC = window.AudioContext || window.webkitAudioContext;
      var ctx = null, rawStream = stream, recStream = stream;
      prStream = stream;
      try {
        ctx = new AC(); prCtx = ctx;
        var src = ctx.createMediaStreamSource(stream);
        var gain = ctx.createGain(); gain.gain.value = 3.0;
        var comp = ctx.createDynamicsCompressor();
        var dest = ctx.createMediaStreamDestination();
        src.connect(gain); gain.connect(comp); comp.connect(dest);
        recStream = dest.stream;
        if (ctx.state === "suspended") ctx.resume();
      } catch (e) { recStream = stream; }
      prChunks = [];
      prRec = new MediaRecorder(recStream);
      prRec.ondataavailable = function (e) { prChunks.push(e.data); };
      prRec.onstop = function () {
        rawStream.getTracks().forEach(function (t) { t.stop(); });
        if (ctx && ctx.state !== "closed") { try { ctx.close().catch(function () {}); } catch (e) {} }
        if (prUrl) URL.revokeObjectURL(prUrl);
        var prBlob = new Blob(prChunks, { type: prRec.mimeType || "audio/webm" });
        prUrl = URL.createObjectURL(prBlob);
        onStop && onStop(prUrl, prBlob);
      };
      prRec.start();
      return true;
    }).catch(function () { return false; });
  }
  function prStopRecording() { if (prRec && prRec.state !== "inactive") prRec.stop(); }
  // Laat de microfoon volledig los (opname, audio en herkenning), zodat andere
  // onderdelen van de app hem weer kunnen gebruiken.
  function prRelease() {
    if (prRec && prRec.state !== "inactive") { try { prRec.stop(); } catch (e) {} }
    if (prRecog) { try { prRecog.abort(); } catch (e) {} prRecog = null; }
    if (prStream) { prStream.getTracks().forEach(function (t) { t.stop(); }); prStream = null; }
    if (prCtx) { if (prCtx.state !== "closed") { try { prCtx.close().catch(function () {}); } catch (e) {} } prCtx = null; }
  }

  // Eén zin herkennen; geeft tekst of null (niet ondersteund / mislukt)
  var prRecog = null;
  function prHear(cb) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { cb(null); return; }
    var done = false;
    function finish(v) { if (!done) { done = true; cb(v); } }
    try {
      prRecog = new SR();
      prRecog.lang = "es-ES";
      prRecog.interimResults = false;
      prRecog.maxAlternatives = 1;
      prRecog.onresult = function (e) { finish(e.results[0][0].transcript); };
      prRecog.onerror = function () { finish(null); };
      prRecog.onend = function () { finish(null); };
      prRecog.start();
    } catch (e) { finish(null); }
  }
  function prNorm(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zñ\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  function prSimilar(target, heard) {
    var t = prNorm(target).split(" ");
    var h = {};
    prNorm(heard).split(" ").forEach(function (w) { h[w] = true; });
    if (!t.length || !t[0]) return 0;
    var hit = t.filter(function (w) { return h[w]; }).length;
    return Math.round(hit / t.length * 100);
  }

  function prLog(kind, item, stars) {
    var entries = store.get("uitspraakLog", []);
    entries.push({ t: new Date().toISOString(), kind: kind, item: item, stars: stars });
    store.set("uitspraakLog", entries.slice(-500));
  }
  function prStars(kind, item) {
    var wrap = el("div", "chips");
    wrap.appendChild(el("span", "note", T("Hoe ging het?")));
    for (var i = 1; i <= 5; i++) (function (n) {
      wrap.appendChild(btn("★", "small", function () {
        prLog(kind, item, n);
        wrap.innerHTML = "";
        wrap.appendChild(el("span", "good", T("Opgeslagen") + ": " + n + "/5"));
      }));
    })(i);
    return wrap;
  }

  // Opneemblok: opnemen, herkennen, de klanken vergelijken met het voorbeeld en de eigen opname afspelen.
  // Herkenning: de spraakherkenning van de browser; op de iPhone (of zonder browserherkenning) het Whisper-model.
  function prRecordBlock(target) {
    var box = el("div");
    var row = el("div", "chips");
    var recB = btn("● " + T("Opnemen"), "primary small", null);
    var stopB = btn("■ " + T("Stop"), "small", null);
    var playB = btn("▶ " + T("Mijn opname"), "small", null);
    stopB.disabled = true; playB.disabled = true;
    var status = el("span", "note", "");
    row.appendChild(recB); row.appendChild(stopB); row.appendChild(playB); row.appendChild(status);
    var result = el("div");
    var audio = new Audio();
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var useWhisper = !SR || isIOS();
    var srState = "idle", blob = null, stopped = false;
    playB.onclick = function () { if (prUrl) { audio.src = prUrl; audio.play().catch(function () {}); } };
    var col = lang === "fr" ? " : " : ": ";
    function showResult(text) {
      result.innerHTML = "";
      var k = KLANK.compare(target, text, lang);
      result.appendChild(el("div", "heard", T("Herkend") + col + text));
      var wl = el("div", "klank-words");
      k.words.forEach(function (w) { wl.appendChild(el("span", w.ok ? "good" : "bad", (w.ok ? "✓ " : "✗ ") + w.w)); });
      result.appendChild(wl);
      result.appendChild(el("div", k.score >= 85 ? "good" : "bad", T("Klankovereenkomst") + col + k.score + "%"));
      k.msgs.forEach(function (msg) { result.appendChild(el("div", "nl", msg)); });
      if (k.tip) result.appendChild(el("div", "note", T("Tip") + col + k.tip));
      result.appendChild(el("div", "note", KLANK.note(lang)));
    }
    // Whisper op de eigen opname (alleen als het model gedownload is)
    function checkWithWhisper() {
      if (!blob) return;
      if (!store.get("whModel", null)) {
        result.innerHTML = "";
        result.appendChild(el("div", "note", T("Download het spraakmodel om je uitspraak per klank te laten controleren. Je kunt jezelf ook met de sterren beoordelen.")));
        result.appendChild(whConsentCard());
        return;
      }
      result.innerHTML = "";
      result.appendChild(el("div", "note", T("Bezig met controleren…")));
      whLoad().then(function () { return whDecode(blob); }).then(function (pcm) {
        var peak = 0, i;
        for (i = 0; i < pcm.length; i++) { var a = Math.abs(pcm[i]); if (a > peak) peak = a; }
        if (peak > 0 && peak < 0.9) { var f = 0.9 / peak; for (i = 0; i < pcm.length; i++) pcm[i] *= f; }
        return whRun(pcm);
      }).then(function (text) {
        text = String(text || "").trim();
        if (!text || /^[\[(]|m[uú]sica|subt[ií]tulo/i.test(text)) { result.innerHTML = ""; result.appendChild(el("div", "bad", T("Niets verstaan. Probeer het opnieuw."))); return; }
        showResult(text);
      }).catch(function (e) {
        result.innerHTML = "";
        result.appendChild(el("div", "note", whErr(e).split(". ")[0] + ". " + T("Beoordeel jezelf met de sterren.")));
      });
    }
    recB.onclick = function () {
      srState = useWhisper ? "none" : "pending"; blob = null; stopped = false;
      result.innerHTML = "";
      prStartRecording(function (url, b) {
        blob = b; stopped = true;
        playB.disabled = false; status.textContent = T("Opname klaar.");
        recB.disabled = false; stopB.disabled = true;
        if (useWhisper) checkWithWhisper();
        else if (srState === "pending") result.appendChild(el("div", "note", T("Bezig met controleren…")));
      }).then(function (ok) {
        if (!ok) { result.appendChild(el("div", "bad", T("Microfoon is niet beschikbaar. Geef toegang of beoordeel jezelf met de sterren."))); return; }
        recB.disabled = true; stopB.disabled = false;
        status.textContent = T("● Opname loopt") + (useWhisper ? " · " + T("tik op Stop als je klaar bent") : "");
        if (useWhisper) return;
        prHear(function (text) {
          srState = text === null ? "failed" : "done";
          if (text === null) {
            result.innerHTML = "";
            result.appendChild(el("div", "bad", T("Niets verstaan. Probeer het opnieuw.")));
            return;
          }
          showResult(text);
          if (!stopped) prStopRecording();
        });
      });
    };
    stopB.onclick = function () {
      prStopRecording();
      if (prRecog) { try { prRecog.stop(); } catch (e) {} }
      recB.disabled = false; stopB.disabled = true;
    };
    box.appendChild(row); box.appendChild(result);
    return box;
  }

  function prSubTabs() {
    var row = el("div", "chips");
    [["pairs", "Minimale paren"], ["shadow", "Shadowing"], ["rr", "Getrilde r"], ["dlg", "Gesprek"], ["log", "Voortgang"]].forEach(function (t) {
      row.appendChild(btn(T(t[1]), PR.sub === t[0] ? "primary small" : "small", function () { PR.sub = t[0]; render(); }));
    });
    return row;
  }

  function prPairs() {
    var w = el("div");
    var p = PRON.PAIRS[PR.pair];
    var target = PR.side === "a" ? p.a : p.b;
    var card = el("div", "card big");
    card.appendChild(el("div", "nl", T("Minimaal paar") + " " + (PR.pair + 1) + " / " + PRON.PAIRS.length));
    card.appendChild(el("div", "es", p.a + "  /  " + p.b));
    card.appendChild(el("div", "nl", L(p.tip)));
    var lr = el("div", "chips");
    lr.appendChild(btn("🔊 " + T("Luister"), "primary small", function () { speak(target); }));
    lr.appendChild(btn(p.a, "small" + (PR.side === "a" ? " active" : ""), function () { PR.side = "a"; render(); }));
    lr.appendChild(btn(p.b, "small" + (PR.side === "b" ? " active" : ""), function () { PR.side = "b"; render(); }));
    card.appendChild(lr);
    w.appendChild(card);
    var rc = el("div", "card");
    rc.appendChild(el("div", "nl", T("Oefen dit woord:") + " " + target));
    rc.appendChild(prRecordBlock(target));
    w.appendChild(rc);
    w.appendChild(prStars("paar", target));
    w.appendChild(prNav(function (d) { PR.pair = (PR.pair + d + PRON.PAIRS.length) % PRON.PAIRS.length; PR.side = "a"; }));
    return w;
  }

  function prNav(move) {
    var row = el("div", "chips");
    row.appendChild(btn("← " + T("Vorige"), "small", function () { move(-1); render(); }));
    row.appendChild(btn(T("Volgende") + " →", "small", function () { move(1); render(); }));
    return row;
  }

  function prShadow() {
    var w = el("div");
    var text = PRON.SHADOW[PR.shadow];
    var card = el("div", "card big");
    card.appendChild(el("div", "nl", T("Luister en herhaal direct daarna.") + " " + (PR.shadow + 1) + " / " + PRON.SHADOW.length));
    card.appendChild(el("div", "es", text));
    var lr = el("div", "chips");
    lr.appendChild(btn("🔊 " + T("Luister"), "primary small", function () { speak(text); }));
    card.appendChild(lr);
    w.appendChild(card);
    var rc = el("div", "card");
    rc.appendChild(el("div", "nl", T("Herhaal hardop en neem op:")));
    rc.appendChild(prRecordBlock(text));
    w.appendChild(rc);
    w.appendChild(prStars("shadow", text.slice(0, 40)));
    w.appendChild(prNav(function (d) { PR.shadow = (PR.shadow + d + PRON.SHADOW.length) % PRON.SHADOW.length; }));
    return w;
  }

  function prRR() {
    var w = el("div");
    var item = PRON.RR[PR.rr];
    var card = el("div", "card big");
    card.appendChild(el("div", "nl", T("Trap") + " " + (PR.rr + 1) + " / " + PRON.RR.length + " · " + T("van makkelijk naar moeilijk")));
    card.appendChild(el("div", "es", item.t));
    card.appendChild(el("div", "nl", L(item.note)));
    var lr = el("div", "chips");
    lr.appendChild(btn("🔊 " + T("Luister"), "primary small", function () { speak(item.t); }));
    card.appendChild(lr);
    w.appendChild(card);
    var rc = el("div", "card");
    rc.appendChild(el("div", "nl", T("Oefen en neem op:")));
    rc.appendChild(prRecordBlock(item.t));
    w.appendChild(rc);
    w.appendChild(prStars("rr", item.t));
    w.appendChild(prNav(function (d) { PR.rr = Math.max(0, Math.min(PRON.RR.length - 1, PR.rr + d)); }));
    return w;
  }

  function prDialog() {
    var w = el("div");
    var d = PRON.DIALOGS[PR.ds];
    if (PR.dt >= d.turns.length) {
      var done = el("div", "card big");
      done.appendChild(el("div", "good", T("Gesprek klaar ✓")));
      done.appendChild(el("div", "nl", L(d.title)));
      var r = el("div", "chips");
      r.appendChild(btn(T("Opnieuw"), "primary small", function () { PR.dt = 0; render(); }));
      r.appendChild(btn(T("Volgend gesprek") + " →", "small", function () { PR.ds = (PR.ds + 1) % PRON.DIALOGS.length; PR.dt = 0; render(); }));
      done.appendChild(r);
      w.appendChild(done);
      return w;
    }
    var turn = d.turns[PR.dt];
    var card = el("div", "card");
    card.appendChild(el("div", "nl", L(d.title) + " · " + T("beurt") + " " + (PR.dt + 1) + " / " + d.turns.length));
    card.appendChild(el("div", "nl", T("Partner zegt:")));
    card.appendChild(el("div", "es", turn.say));
    var lr = el("div", "chips");
    lr.appendChild(btn("🔊 " + T("Luister"), "primary small", function () { speak(turn.say); }));
    card.appendChild(lr);
    w.appendChild(card);

    var rc = el("div", "card");
    rc.appendChild(el("div", "nl", T("Jouw antwoord:")));
    var fb = el("div");
    var mic = btn("🎤 " + T("Spreek"), "primary small", null);
    var pass = btn(T("Ik heb het gezegd"), "small", function () { PR.dt++; render(); });
    pass.style.display = "none";
    var status = el("span", "note", "");
    var mrow = el("div", "chips");
    mrow.appendChild(mic); mrow.appendChild(status); mrow.appendChild(pass);
    rc.appendChild(mrow);
    mic.onclick = function () {
      mic.disabled = true;
      status.textContent = T("Luistert…");
      prHear(function (text) {
        mic.disabled = false; status.textContent = "";
        fb.innerHTML = "";
        if (text === null) {
          fb.appendChild(el("div", "note", T("Spraakherkenning werkt niet in deze browser. Zeg het hardop en klik op 'Ik heb het gezegd'.")));
          pass.style.display = "inline-block";
          return;
        }
        var score = Math.max.apply(null, turn.ok.map(function (o) { return prSimilar(o, text); }));
        if (score >= 70) {
          fb.appendChild(el("div", "good", T("Goed gezegd ✓")));
          fb.appendChild(el("div", "heard", T("Herkend") + ": " + text));
          fb.appendChild(btn(T("Volgende beurt") + " →", "primary small", function () { PR.dt++; render(); }));
        } else {
          fb.appendChild(el("div", "bad", T("Nog niet helemaal. Probeer opnieuw of kijk naar het voorbeeld.")));
          fb.appendChild(el("div", "heard", T("Herkend") + ": " + text));
        }
      });
    };
    rc.appendChild(fb);
    var ex = el("div", "chips");
    ex.appendChild(btn(T("Toon voorbeeld"), "small", function () { fb.innerHTML = ""; fb.appendChild(el("div", "nl", T("Voorbeeld") + ": " + turn.model)); }));
    ex.appendChild(btn(T("Overslaan"), "small", function () { PR.dt++; render(); }));
    ex.appendChild(btn(T("Ander gesprek"), "small", function () { PR.ds = (PR.ds + 1) % PRON.DIALOGS.length; PR.dt = 0; render(); }));
    rc.appendChild(ex);
    w.appendChild(rc);
    return w;
  }

  function prLogView() {
    var w = el("div");
    var entries = store.get("uitspraakLog", []);
    if (!entries.length) { w.appendChild(el("div", "card", T("Nog geen oefeningen opgeslagen. Sterren geven na een oefening vult dit overzicht."))); return w; }
    var byKind = {};
    entries.forEach(function (e) { (byKind[e.kind] = byKind[e.kind] || []).push(e.stars); });
    var card = el("div", "card");
    Object.keys(byKind).forEach(function (k) {
      var arr = byKind[k];
      var avg = (arr.reduce(function (a, b) { return a + b; }, 0) / arr.length).toFixed(1);
      card.appendChild(el("div", "", k + ": " + arr.length + "×, " + T("gemiddeld") + " " + avg + "/5"));
    });
    w.appendChild(card);
    var recent = el("div", "card");
    entries.slice(-15).reverse().forEach(function (e) {
      recent.appendChild(el("div", "nl", new Date(e.t).toLocaleDateString() + " · " + e.kind + " · " + e.item + " · " + e.stars + "/5"));
    });
    w.appendChild(recent);
    w.appendChild(btn(T("Wis voortgang uitspraak"), "small", function () { store.set("uitspraakLog", []); render(); }));
    return w;
  }

  function viewUitspraak() {
    var w = el("div");
    w.appendChild(el("div", "note", T("Luister, herhaal, neem op, vergelijk en beoordeel jezelf. Het tempo stel je in bij Instellingen.")));
    w.appendChild(prSubTabs());
    var views = { pairs: prPairs, shadow: prShadow, rr: prRR, dlg: prDialog, log: prLogView };
    w.appendChild(views[PR.sub]());
    return w;
  }

  // ---------- Opbouw van de pagina ----------
  // ---------- Webshop: eigen pagina (vrijwillige donatie), laatste knop in de onderste balk ----------
  function viewShop() {
    var w = el("div", "shop-page");
    var img = el("img", "shop-cup");
    img.src = "img/koffiekopje.png";
    img.alt = L(m("Een kopje koffie", "A cup of coffee", "Eine Tasse Kaffee", "Une tasse de café"));
    w.appendChild(img);
    w.appendChild(el("p", "", L(m(
      "Vind je de app nuttig? Dan kun je de ontwikkelaar een kop koffie aanbieden voor 1,99 euro. Dat is vrijwillig.",
      "Do you find the app useful? You can buy the developer a coffee for 1.99 euro. This is voluntary.",
      "Findest du die App nützlich? Du kannst dem Entwickler einen Kaffee für 1,99 Euro spendieren. Das ist freiwillig.",
      "Vous trouvez l'application utile ? Vous pouvez offrir un café au développeur pour 1,99 euro. C'est facultatif."))));
    var shopA = el("a", "btn primary", L(m("Open de webshop", "Open the shop", "Zum Webshop", "Ouvrir la boutique")));
    shopA.href = "webshop.html";
    w.appendChild(shopA);
    return w;
  }

  var VIEWS = {
    zinnen: viewZinnen, onderwerpen: viewOnderwerpen, vastlopen: viewVastlopen,
    bouwen: viewBouwen, reageren: viewReageren, leren: viewLeren,
    regels: viewRegels, gesprek: viewGesprek, uitspraak: viewUitspraak, info: viewInfo, shop: viewShop
  };

  // Vlaggen als SVG (overal gelijk; geen emoji nodig). Spaans is altijd rood-geel-rood.
  var FLAG_BANDS = {
    nl: { dir: "h", c: ["#AE1C28", "#FFFFFF", "#21468B"] },
    de: { dir: "h", c: ["#000000", "#DD0000", "#FFCE00"] },
    fr: { dir: "v", c: ["#002395", "#FFFFFF", "#ED2939"] },
    es: { dir: "h", c: ["#AA151B", "#F1BF00", "#AA151B"] }
  };
  function flagInner(code, w, h) {
    if (code === "en") {
      return '<rect width="' + w + '" height="' + h + '" fill="#012169"/>' +
        '<path d="M0,0 L' + w + ',' + h + ' M' + w + ',0 L0,' + h + '" stroke="#FFFFFF" stroke-width="' + (h * 0.2) + '"/>' +
        '<path d="M0,0 L' + w + ',' + h + ' M' + w + ',0 L0,' + h + '" stroke="#C8102E" stroke-width="' + (h * 0.07) + '"/>' +
        '<path d="M' + (w / 2) + ',0 V' + h + ' M0,' + (h / 2) + ' H' + w + '" stroke="#FFFFFF" stroke-width="' + (h * 0.33) + '"/>' +
        '<path d="M' + (w / 2) + ',0 V' + h + ' M0,' + (h / 2) + ' H' + w + '" stroke="#C8102E" stroke-width="' + (h * 0.2) + '"/>';
    }
    var f = FLAG_BANDS[code] || FLAG_BANDS.nl, out = "", i;
    for (i = 0; i < 3; i++) {
      if (f.dir === "h") out += '<rect x="0" y="' + (i * h / 3) + '" width="' + w + '" height="' + (h / 3 + 0.5) + '" fill="' + f.c[i] + '"/>';
      else out += '<rect x="' + (i * w / 3) + '" y="0" width="' + (w / 3 + 0.5) + '" height="' + h + '" fill="' + f.c[i] + '"/>';
    }
    if (code === "es") { // Spanje: geel midden is breder
      out = '<rect width="' + w + '" height="' + h + '" fill="#AA151B"/><rect y="' + h * 0.25 + '" width="' + w + '" height="' + h * 0.5 + '" fill="#F1BF00"/>';
    }
    return out;
  }
  function flagSVG(code, w, h) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" aria-hidden="true">' + flagInner(code, w, h) + '</svg>';
  }

  // Logo: ring in de kleuren van alle talen met SP in schrijfletters (als pad, dus overal gelijk).
  // Het kleine label rechtsonder toont de gekozen taal; een tik opent het taalmenu.
  var LOGO_INNER = '<path d="M54.19,13.24 A37,37 0 0 1 83.67,34.66" fill="none" stroke="#D52B1E" stroke-width="6.5" stroke-linecap="round"/><path d="M86.26,42.62 A37,37 0 0 1 75.00,77.28" fill="none" stroke="#FCD116" stroke-width="6.5" stroke-linecap="round"/><path d="M68.22,82.20 A37,37 0 0 1 31.78,82.20" fill="none" stroke="#009E49" stroke-width="6.5" stroke-linecap="round"/><path d="M25.00,77.28 A37,37 0 0 1 13.74,42.62" fill="none" stroke="#0052B4" stroke-width="6.5" stroke-linecap="round"/><path d="M16.33,34.66 A37,37 0 0 1 45.81,13.24" fill="none" stroke="#1a1a1a" stroke-width="6.5" stroke-linecap="round"/><path d="M21.54 81.79Q17.08 81.79 12.89 80.27Q8.7 78.74 5.81 75.62Q2.92 72.51 2.37 67.83Q1.86 63.68 3.41 61.37Q4.97 59.05 7.61 58.14Q10.24 57.22 12.84 57.22Q10.71 59.81 9.78 62.56Q8.85 65.31 9.15 67.8Q9.46 70.42 11.07 72.67Q12.67 74.93 15.51 76.34Q18.35 77.75 22.37 77.75Q25.73 77.75 28.86 76.59Q31.98 75.44 33.8 73.16Q35.62 70.88 35.2 67.41Q34.83 64.3 32.77 62.06Q30.7 59.81 27.66 58.02Q24.62 56.23 21.3 54.59Q17.97 52.95 14.92 51.03Q11.87 49.11 9.78 46.61Q7.68 44.1 7.25 40.58Q6.88 37.45 8.02 33.9Q9.16 30.36 11.68 27.23Q14.21 24.1 18.09 22.15Q21.98 20.21 27.02 20.21Q32.28 20.21 34.69 22.42Q37.09 24.63 37.52 28.22Q37.85 31.01 37.25 34.23Q36.66 37.44 35.59 40.35Q34.52 43.25 33.47 45.31Q31.74 44.93 30.79 43.98Q29.83 43.02 29.64 41.42Q29.45 39.82 29.87 37.83Q30.3 35.85 30.89 33.71Q31.48 31.58 31.9 29.56Q32.37 27.53 32.14 26.01Q31.98 24.63 31.08 23.87Q30.19 23.11 27.72 23.11Q24.08 23.11 21.22 24.71Q18.36 26.31 16.42 28.76Q14.47 31.22 13.56 33.92Q12.66 36.62 12.92 38.83Q13.25 41.57 15.24 43.53Q17.24 45.49 20.21 47.08Q23.18 48.67 26.47 50.27Q29.75 51.88 32.77 53.88Q35.79 55.88 37.88 58.61Q39.97 61.35 40.44 65.27Q40.92 69.28 39.49 72.37Q38.07 75.38 35.27 77.48Q32.46 79.58 28.9 80.69Q25.33 81.79 21.54 81.79ZM52.9 81.79Q50.61 81.79 48.44 80.57Q46.27 79.35 46.04 77.44Q45.93 76.45 46.13 75.31Q46.34 74.16 46.52 73.17Q48.02 65.92 49.33 59.62Q50.63 53.33 52.03 47.49Q53.43 41.65 55.05 35.77Q56.67 29.9 58.8 23.49Q55.98 24.1 54.03 25.05Q52.08 26.01 50.87 26.73Q49.66 27.46 49.05 27.46Q48.67 27.46 47.88 26.92Q47.09 26.39 46.48 25.7Q45.86 25.01 45.79 24.48Q47.82 23.56 50.56 22.57Q53.31 21.58 56.58 20.89Q59.86 20.21 63.22 20.21Q66.8 20.21 70.66 21.16Q74.51 22.11 77.9 23.98Q81.29 25.85 83.58 28.64Q85.86 31.42 86.3 35.16Q86.79 39.21 85.31 42.11Q83.82 45.01 81.05 46.99Q78.27 48.98 74.91 50.2Q71.54 51.42 68.14 52.03Q64.74 52.64 62.02 52.87Q59.3 53.1 57.93 53.1H57.47Q56.24 60.65 55.08 68.17Q53.92 75.69 52.9 81.79ZM57.87 50.73Q62.11 50.43 66.25 49.28Q70.38 48.14 73.61 46.12Q76.84 44.09 78.58 41.04Q80.31 37.99 79.82 33.94Q79.37 30.13 77.06 27.76Q74.75 25.4 71.44 24.17Q68.13 22.95 64.61 22.88Q62.5 28.22 60.86 35.51Q59.21 42.8 57.87 50.73Z" fill="#1b1b1b" stroke="#ffffff" stroke-width="3.2" stroke-linejoin="round" paint-order="stroke"/>';
  function renderLogo() {
    document.getElementById("logo").innerHTML =
      '<img class="logo-img" src="icons/logo.png" alt="" width="52" height="52">' +
      '<span class="logolang">' + lang.toUpperCase() + '</span>';
  }

  // Systeem: volgt de donkere modus van de telefoon (dan het subtiele donkere thema, zonder neonbuis)
  function effectiveTheme() {
    if (theme !== "systeem") return theme;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "donker" : "standaard";
  }

  function applyStatic() {
    document.documentElement.lang = lang;
    document.body.setAttribute("data-lang", lang);
    document.querySelectorAll("[data-i18n]").forEach(function (n) { n.textContent = T(n.getAttribute("data-i18n")); });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (n) { n.setAttribute("aria-label", T(n.getAttribute("data-i18n-aria"))); });
    document.querySelectorAll("[data-ph]").forEach(function (n) { n.placeholder = T(n.getAttribute("data-ph")); });
    document.getElementById("langSel").value = lang;
    document.getElementById("themeSel").value = theme;
    if (document.getElementById("genSel")) document.getElementById("genSel").value = partnerGenderSetting();
    if (document.getElementById("ownGenSel")) document.getElementById("ownGenSel").value = store.get("eigenGeslacht", "m") === "f" ? "f" : "m";
    var eff = effectiveTheme();
    document.body.classList.toggle("cafe", eff === "cafe");
    // Het café-thema heet in de banner "Business Café"
    var ttlEl = document.querySelector("header.top h1");
    if (ttlEl) { var ttlTxt = T("SpeechPartner.Spanish"); if (eff === "cafe") ttlEl.textContent = "Business Café"; else if (ttlTxt.indexOf("Speech") === 0) ttlEl.innerHTML = "Speech<br>" + ttlTxt.slice(6); else ttlEl.textContent = ttlTxt; }
    ["ijs", "jungle", "ruimte", "donker"].forEach(function (t) { document.body.classList.toggle("th-" + t, eff === t); });
    if (typeof ACHTERGROND !== "undefined") ACHTERGROND.set(eff === "standaard" ? "standaard-" + lang : eff);
    renderLogo();
  }

  function updateMic() {
    var b = document.getElementById("mbtn");
    var label = S.listening ? T("Stop") : T("Spreek een Spaanse reactie in");
    b.textContent = S.listening ? "⏹" : "🎤";
    b.classList.toggle("rec", S.listening);
    b.title = label;
    b.setAttribute("aria-label", label);
    var out = document.getElementById("transOut");
    if (S.listening) {
      out.hidden = false;
      out.innerHTML = "";
      var lm = el("div", "bad listen-msg", "● " + T("Luistert…"));
      out.appendChild(lm);
    } else if (out.querySelector && out.querySelector(".listen-msg")) {
      out.innerHTML = "";
      out.hidden = true;
    }
  }

  function render() {
    applyStatic();
    renderNav();
    var view = document.getElementById("view");
    view.innerHTML = "";
    view.appendChild(S.build ? viewBuilder() : VIEWS[S.tab]());
    updateMic();
  }

  // ---------- Instellingen en vertaalvak koppelen ----------
  function setup() {
    applyStatic();

    var rateEl = document.getElementById("rate");
    var rateVal = document.getElementById("rateVal");
    rateEl.value = String(rate);
    rateVal.textContent = String(rate);
    rateEl.addEventListener("input", function () {
      rate = parseFloat(rateEl.value);
      rateVal.textContent = rateEl.value;
      store.set("rate", rate);
    });

    // Stem van voorlezen: 'Automatisch' kiest de beste beschikbare, of je kiest zelf een Spaanse stem
    var vSel = document.getElementById("voiceSel");
    if (vSel) {
      var fillVoices = function () {
        var cur = store.get("stem", "");
        vSel.innerHTML = "";
        vSel.appendChild(el("option", "", T("Automatisch (beste stem)")));
        vSel.firstChild.value = "";
        spanishVoices().forEach(function (v) {
          var o = el("option", "", v.name + " (" + v.lang + ")");
          o.value = v.name;
          vSel.appendChild(o);
        });
        vSel.value = cur;
      };
      vSel.addEventListener("change", function () { store.set("stem", vSel.value); });
      fillVoices();
      if (window.speechSynthesis) speechSynthesis.onvoiceschanged = fillVoices;
    }

    document.getElementById("langSel").addEventListener("change", function (e) {
      lang = e.target.value;
      store.set("lang", lang);
      S.lShow = false;
      render();
      if (!document.getElementById("transOut").hidden) showTranslation();
    });
    if (document.getElementById("ownGenSel")) document.getElementById("ownGenSel").addEventListener("change", function (e) {
      store.set("eigenGeslacht", e.target.value === "f" ? "f" : "m");
      if (!document.getElementById("transOut").hidden) showTranslation();
    });
    if (document.getElementById("genSel")) document.getElementById("genSel").addEventListener("change", function (e) {
      store.set("partnerGender", e.target.value);
      render();
    });
    if (window.matchMedia) {
      var darkQ = window.matchMedia("(prefers-color-scheme: dark)");
      var onScheme = function () { if (theme === "systeem") applyStatic(); };
      if (darkQ.addEventListener) darkQ.addEventListener("change", onScheme); else if (darkQ.addListener) darkQ.addListener(onScheme);
    }
    document.getElementById("themeSel").addEventListener("change", function (e) {
      theme = e.target.value;
      store.set("theme", theme);
      applyStatic();
    });
    // Taalopties schuiven onder de koptekst uit: via het logo, de vlag of het instellingenwiel.
    function toggleSettings() {
      var p = document.getElementById("settings");
      var open = !p.classList.contains("open");
      p.classList.toggle("open", open);
      p.setAttribute("aria-hidden", open ? "false" : "true");
      document.getElementById("setBtn").classList.toggle("on", open);
    }
    document.getElementById("setBtn").onclick = toggleSettings;
    // Klik of tik je ergens anders (ook op een andere knop), dan sluiten de instellingen weer
    document.addEventListener("click", function (e) {
      var p = document.getElementById("settings");
      if (!p.classList.contains("open")) return;
      if (p.contains(e.target) || document.getElementById("setBtn").contains(e.target)) return;
      p.classList.remove("open");
      p.setAttribute("aria-hidden", "true");
      document.getElementById("setBtn").classList.remove("on");
    }, true);
    // Het ?-knopje in de banner opent Info; nog eens tikken brengt je terug naar de vorige pagina
    document.getElementById("infoBtn").onclick = function () { go("info"); };
    // Tik op de titel: terug naar het begin (Zinnen, met de hoofdcategorie open).
    var ttl = document.querySelector("header.top h1");
    if (ttl) {
      ttl.style.cursor = "pointer";
      ttl.onclick = function (e) {
        if (!onTitleText(e)) return;
        S.build = null; S.teach = null; S.listening = false;
        document.getElementById("settings").classList.remove("open");
        go("zinnen");
        window.scrollTo(0, 0);
      };
    }
    // Tik op het logo: klein lijstje met alleen de taalafkortingen.
    var lm = document.getElementById("langMenu"), lg = document.getElementById("logo");
    function closeLangMenu() { lm.hidden = true; lg.setAttribute("aria-expanded", "false"); }
    lg.onclick = function (e) {
      e.stopPropagation();
      if (!lm.hidden) { closeLangMenu(); return; }
      lm.innerHTML = "";
      ["nl", "en", "de", "fr"].forEach(function (code) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "langopt" + (code === lang ? " on" : "");
        b.textContent = code.toUpperCase();
        b.onclick = function (ev) {
          ev.stopPropagation();
          closeLangMenu();
          var sel = document.getElementById("langSel");
          sel.value = code;
          sel.dispatchEvent(new Event("change"));
        };
        lm.appendChild(b);
      });
      lm.hidden = false; lg.setAttribute("aria-expanded", "true");
    };
    document.addEventListener("click", closeLangMenu);
    document.getElementById("resetUnd").onclick = function () {
      store.set("begrepen", []); render();
    };
    document.getElementById("resetProg").onclick = function () {
      store.set("gekend", []); S.lIdx = 0; S.lShow = false; S.score = [0, 0]; S.quiz = null; S.rAns = {}; render();
    };

    document.getElementById("vbtn").onclick = showTranslation;
    document.getElementById("vtxt").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); showTranslation(); }
    });
    document.getElementById("mbtn").onclick = function () {
      if (S.listening) stopMic(); else startMic();
    };

    render();
    showReinstallNotice();
  }

  // Eenmalige melding bij een update waarvoor de app opnieuw op het beginscherm moet
  // Versie waarin de app opnieuw op het beginscherm moet (icoon of naam veranderd)
  function verNum(v) { var p = String(v).split("."); return parseInt(p[0], 10) * 1000 + (parseInt(p[1] || "0", 10)); }
  // Melding alleen voor kopieën die ouder zijn dan een versie waarvoor opnieuw toevoegen nodig is; eenmalig per versie
  function showReinstallNotice() {
    var added = store.get("toegevoegd", null);
    if (added === null) {
      if (!FRESH_COPY) added = "0.0";               // oude kopie zonder vastgelegde versie
      else { store.set("toegevoegd", APP_VERSION); return; }
    }
    var pending = REINSTALL_VERSIONS.filter(function (v) { return verNum(v) > verNum(added) && !store.get("nieuw-" + v, false); });
    if (!pending.length) return;
    var box = el("div", "card reinstall-note");
    box.setAttribute("role", "dialog");
    // Tekst in de taal van de telefoon, met de stap voor de browser die de gebruiker heeft (speels.js); anders de vaste tekst
    var tm = null; try { tm = window.THUIS_MELDING ? window.THUIS_MELDING() : null; } catch (e) { tm = null; }
    if (tm && tm.titel && tm.tekst) {
      box.appendChild(el("div", "sec-title", tm.titel));
      box.appendChild(el("div", "", tm.tekst));
      var ok = el("button", "btn primary", tm.ok);
    } else {
      box.appendChild(el("div", "sec-title", L(m("Nieuwe versie: zet de app opnieuw op je beginscherm", "New version: put the app on your home screen again", "Neue Version: lege die App erneut auf deinen Home-Bildschirm", "Nouvelle version : remets l'app sur ton écran d'accueil"))));
      box.appendChild(el("div", "", L(m(
        "Verwijder het oude icoon: houd het ingedrukt en kies 'App verwijderen'. Open daarna deze pagina in Safari, tik op Deel en kies 'Zet op beginscherm'. Zo heb je de nieuwste versie.",
        "Remove the old icon: press and hold it and choose 'Remove App'. Then open this page in Safari, tap Share and choose 'Add to Home Screen'. That gives you the latest version.",
        "Entferne das alte Symbol: halte es gedrückt und wähle 'App entfernen'. Öffne dann diese Seite in Safari, tippe auf Teilen und wähle 'Zum Home-Bildschirm'. So hast du die neueste Version.",
        "Supprime l'ancienne icône : maintiens-la appuyée et choisis « Supprimer l'app ». Ouvre ensuite cette page dans Safari, touche Partager et choisis « Sur l'écran d'accueil ». Tu auras ainsi la dernière version."))));
      var ok = el("button", "btn primary", L(m("Begrepen", "Got it", "Verstanden", "Compris")));
    }
    ok.type = "button";
    ok.onclick = function () { pending.forEach(function (v) { store.set("nieuw-" + v, true); }); box.parentNode && box.parentNode.removeChild(box); };
    box.appendChild(ok);
    document.body.appendChild(box);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup);
  else setup();

  // Offline werken via de service worker
  // Automatisch bijwerken: zodra er een nieuwe versie is, wordt die actief en ververst de pagina zelf.
  // Het vinkje in sessionStorage voorkomt een eindeloze herlaadlus.
  if ("serviceWorker" in navigator) {
    var hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener("controllerchange", function () {
      if (!hadController) { hadController = true; return; }
      try {
        if (sessionStorage.getItem("sp-reloaded") === APP_VERSION) return;
        sessionStorage.setItem("sp-reloaded", APP_VERSION);
      } catch (e) {}
      window.location.reload();
    });
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").then(function (reg) {
        reg.update().catch(function () {});
        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState === "visible") reg.update().catch(function () {});
        });
      }).catch(function () {});
    });
  }
})();
