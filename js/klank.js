// Klankvergelijking voor de uitspraaktrainer.
// Spaanse tekst wordt omgezet naar klanken (rr getrild, enkele r, j/g als keelklank, b = v, h stom, ñ, ll/y, ch),
// daarna wordt wat de spraakherkenning hoorde klank voor klank naast het voorbeeld gelegd.
// Zo ziet de gebruiker welke klank in welk woord afweek, met een tip voor die klank.
var KLANK = (function () {
  var VOW = "aeiou";
  function isV(c) { return VOW.indexOf(c) >= 0; }
  function clean(s) {
    return String(s || "").toLowerCase()
      .replace(/[áàâ]/g, "a").replace(/[éèê]/g, "e").replace(/[íìî]/g, "i").replace(/[óòô]/g, "o").replace(/[úùû]/g, "u")
      .replace(/[^a-zñü\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  // Eén woord naar klanken
  function word(w) {
    var out = [], i = 0, n = w.length;
    while (i < n) {
      var c = w.charAt(i), nx = w.charAt(i + 1), pv = w.charAt(i - 1);
      if (c === "c" && nx === "h") { out.push("tʃ"); i += 2; continue; }
      if (c === "l" && nx === "l") { out.push("ʝ"); i += 2; continue; }
      if (c === "r" && nx === "r") { out.push("R"); i += 2; continue; }
      if (c === "r") { out.push(i === 0 || "nls".indexOf(pv) >= 0 ? "R" : "r"); i++; continue; }
      if (c === "q" && nx === "u") { out.push("k"); i += 2; continue; }
      if (c === "q") { out.push("k"); i++; continue; }
      if (c === "g" && nx === "u" && "ei".indexOf(w.charAt(i + 2)) >= 0 && w.charAt(i + 2) !== "") { out.push("g"); i += 2; continue; }
      if (c === "g" && nx === "ü") { out.push("g"); out.push("w"); i += 2; continue; }
      if (c === "g") { out.push("ei".indexOf(nx) >= 0 && nx !== "" ? "x" : "g"); i++; continue; }
      if (c === "j") { out.push("x"); i++; continue; }
      if (c === "c") { out.push("ei".indexOf(nx) >= 0 && nx !== "" ? "s" : "k"); i++; continue; }
      if (c === "z" || c === "s") { out.push("s"); i++; continue; }
      if (c === "h") { i++; continue; }
      if (c === "v" || c === "b") { out.push("b"); i++; continue; }
      if (c === "ñ") { out.push("ɲ"); i++; continue; }
      if (c === "x") { out.push("k"); out.push("s"); i++; continue; }
      if (c === "y") { out.push(i === n - 1 || !isV(nx) ? "i" : "ʝ"); i++; continue; }
      if (c === "ü") { out.push("u"); i++; continue; }
      if (c === "w") { out.push("w"); i++; continue; }
      out.push(c); i++;
    }
    return out;
  }
  // Tekst naar klanken, met het woord waar elke klank bij hoort
  function phones(text) {
    var words = clean(text).split(" ").filter(Boolean), res = [];
    words.forEach(function (w, wi) { word(w).forEach(function (p) { res.push({ p: p, w: wi }); }); });
    return { list: res, words: words };
  }
  // Uitlijnen (Levenshtein met terugweg)
  function align(a, b) {
    var n = a.length, m = b.length, d = [], i, j;
    for (i = 0; i <= n; i++) { d[i] = [i]; }
    for (j = 0; j <= m; j++) d[0][j] = j;
    for (i = 1; i <= n; i++) for (j = 1; j <= m; j++) {
      var sub = a[i - 1].p === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + sub);
    }
    var ops = [];
    i = n; j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1].p === b[j - 1] ? 0 : 1)) {
        ops.unshift({ op: a[i - 1].p === b[j - 1] ? "ok" : "sub", t: a[i - 1].p, h: b[j - 1], w: a[i - 1].w }); i--; j--;
      } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
        ops.unshift({ op: "del", t: a[i - 1].p, w: a[i - 1].w }); i--;
      } else {
        ops.unshift({ op: "ins", h: b[j - 1], w: i > 0 ? a[i - 1].w : 0 }); j--;
      }
    }
    return { ops: ops, cost: d[n][m] };
  }

  // Namen van de klanken en tips, in de vier talen van de app
  var NAMES = {
    R: ["de getrilde rr", "the rolled rr", "das gerollte rr", "le r roulé (rr)"],
    r: ["de enkele tik-r", "the single tapped r", "das einfache, getippte r", "le r simple battu"],
    x: ["de j-klank (een keelklank)", "the j sound (a throat sound)", "der j-Laut (ein Kehllaut)", "le son j (un son de gorge)"],
    "ɲ": ["de ñ (nj)", "the ñ (ny)", "das ñ (nj)", "le ñ (gn)"],
    "tʃ": ["de ch (tsj)", "the ch (as in church)", "das ch (tsch)", "le ch (tch)"],
    "ʝ": ["de ll/y-klank", "the ll/y sound", "der ll/y-Laut", "le son ll/y"],
    b: ["de b/v-klank", "the b/v sound", "der b/v-Laut", "le son b/v"],
    s: ["de s-klank", "the s sound", "der s-Laut", "le son s"],
    w: ["de w-klank", "the w sound", "der w-Laut", "le son w"],
    k: ["de k-klank", "the k sound", "der k-Laut", "le son k"],
    g: ["de g-klank (zoals in het Engelse 'go')", "the g sound (as in 'go')", "der g-Laut (wie in „gut“)", "le son g (comme dans « gare »)"]
  };
  var VOWEL_NAME = ["de klinker „%”", "the vowel “%”", "der Vokal „%“", "la voyelle « % »"];
  var CONS_NAME = ["de klank „%”", "the sound “%”", "der Laut „%“", "le son « % »"];
  var TIPS = {
    R: ["Laat de tongpunt een paar keer snel trillen tegen het tandvlees achter je boventanden. Blaas er iets meer lucht langs.",
        "Let the tip of your tongue vibrate several times against the ridge behind your upper teeth. Push a little more air past it.",
        "Lass die Zungenspitze mehrmals schnell am Zahndamm hinter den oberen Zähnen vibrieren. Schick etwas mehr Luft daran vorbei.",
        "Fais vibrer plusieurs fois la pointe de la langue contre les alvéoles derrière les dents du haut. Souffle un peu plus d'air."],
    r: ["Eén snelle tik met de tongpunt, niet trillen.", "One quick tap with the tip of your tongue, no trill.", "Ein schneller Tipper mit der Zungenspitze, kein Rollen.", "Un seul petit coup de la pointe de la langue, sans rouler."],
    x: ["Maak een schurend geluid achter in je keel, zoals de Nederlandse g in 'goed'.", "Make a raspy sound at the back of your throat, like the ch in Scottish 'loch'.", "Mach ein raues Reibegeräusch hinten im Hals, wie das ch in „Bach“.", "Fais un son raclé au fond de la gorge, comme la jota espagnole."],
    "ɲ": ["Zeg 'nj', zoals in 'oranje'.", "Say 'ny', as in 'canyon'.", "Sprich 'nj', wie in „Champagner“.", "Dis « gn », comme dans « montagne »."],
    "tʃ": ["Zeg 'tsj', zoals in 'tsjilpen'.", "Say 'ch', as in 'church'.", "Sprich 'tsch', wie in „Deutsch“.", "Dis « tch », comme dans « match »."],
    "ʝ": ["Zeg een zachte j, zoals in 'ja'.", "Say a soft y, as in 'yes'.", "Sprich ein weiches j, wie in „ja“.", "Dis un y doux, comme dans « yeux »."],
    b: ["In het Spaans klinken b en v hetzelfde: een zachte b, met de lippen bijna dicht.", "In Spanish b and v sound the same: a soft b, lips almost closed.", "Im Spanischen klingen b und v gleich: ein weiches b, die Lippen fast geschlossen.", "En espagnol, b et v se prononcent pareil : un b doux, lèvres presque fermées."],
    vowel: ["Spaanse klinkers zijn kort en zuiver: a, e, i, o, u, zonder tweeklank.", "Spanish vowels are short and pure: a, e, i, o, u, never gliding.", "Spanische Vokale sind kurz und rein: a, e, i, o, u, ohne Doppellaut.", "Les voyelles espagnoles sont courtes et pures : a, e, i, o, u, sans diphtongue."]
  };
  var TEXT = {
    sub: ["In „{w}” klonk {a} als {b}.", "In “{w}”, {a} sounded like {b}.", "In „{w}“ klang {a} wie {b}.", "Dans « {w} », {a} ressemblait à {b}."],
    del: ["In „{w}” was {a} niet te horen.", "In “{w}”, {a} could not be heard.", "In „{w}“ war {a} nicht zu hören.", "Dans « {w} », {a} ne s'entendait pas."],
    ins: ["In „{w}” hoorde de app een extra klank: {b}.", "In “{w}”, the app heard an extra sound: {b}.", "In „{w}“ hörte die App einen zusätzlichen Laut: {b}.", "Dans « {w} », l'application a entendu un son en plus : {b}."],
    allok: ["Alle klanken komen overeen met het voorbeeld.", "All sounds match the example.", "Alle Laute stimmen mit dem Beispiel überein.", "Tous les sons correspondent à l'exemple."],
    note: ["De app vergelijkt de klanken van wat de spraakherkenning verstond met het voorbeeld. Een spraakherkenner maakt van je klanken altijd een bestaand woord; luister daarom ook naar je eigen opname.",
           "The app compares the sounds of what the speech recogniser understood with the example. A recogniser always turns your sounds into an existing word, so listen to your own recording as well.",
           "Die App vergleicht die Laute dessen, was die Spracherkennung verstanden hat, mit dem Beispiel. Eine Spracherkennung macht aus deinen Lauten immer ein bestehendes Wort; hör dir deshalb auch deine eigene Aufnahme an.",
           "L'application compare les sons de ce que la reconnaissance vocale a compris avec l'exemple. Une reconnaissance vocale transforme toujours tes sons en un mot existant ; écoute donc aussi ton propre enregistrement."]
  };
  var LI = { nl: 0, en: 1, de: 2, fr: 3 };
  function name(p, li) {
    if (NAMES[p]) return NAMES[p][li];
    return (isV(p) ? VOWEL_NAME : CONS_NAME)[li].replace("%", p);
  }
  function fill(tpl, w, a, b, li) {
    var s = tpl.replace("{w}", w).replace("{a}", a).replace("{b}", b);
    if (li === 3) s = s.replace(/à le /g, "au ").replace(/à les /g, "aux ");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Vergelijk: geeft { score (0-100), words: [{ w, ok }], msgs: [...], tip }
  function compare(target, heard, lang) {
    var li = LI[lang] !== undefined ? LI[lang] : 0;
    var T = phones(target), H = phones(heard);
    if (!T.list.length) return { score: 0, words: [], msgs: [], tip: null };
    var al = align(T.list, H.list.map(function (x) { return x.p; }));
    var score = Math.max(0, Math.round((1 - al.cost / Math.max(T.list.length, 1)) * 100));
    var bad = {};
    al.ops.forEach(function (o) { if (o.op !== "ok") bad[o.w] = true; });
    var orig = String(target || "").replace(/[¿¡?!.,;:"“”„«»()]/g, " ").split(/\s+/).filter(Boolean);
    var shown = orig.length === T.words.length ? orig.map(function (x) { return x.toLowerCase(); }) : T.words;
    var words = shown.map(function (w, i) { return { w: w, ok: !bad[i] }; });
    var msgs = [], tipKey = null, seen = {};
    for (var k = 0; k < al.ops.length && msgs.length < 3; k++) {
      var o = al.ops[k];
      if (o.op === "ok") continue;
      var w = shown[o.w] || "";
      var key = o.op + o.t + o.h + o.w;
      if (seen[key]) continue;
      seen[key] = true;
      if (o.op === "sub") msgs.push(fill(TEXT.sub[li], w, name(o.t, li), name(o.h, li), li));
      else if (o.op === "del") msgs.push(fill(TEXT.del[li], w, name(o.t, li), "", li));
      else msgs.push(fill(TEXT.ins[li], w, "", name(o.h, li), li));
      if (!tipKey && o.t) tipKey = TIPS[o.t] ? o.t : (isV(o.t) ? "vowel" : null);
    }
    if (!msgs.length) msgs.push(TEXT.allok[li]);
    return { score: score, words: words, msgs: msgs, tip: tipKey ? TIPS[tipKey][li] : null };
  }
  function note(lang) { return TEXT.note[LI[lang] !== undefined ? LI[lang] : 0]; }
  return { compare: compare, note: note, phones: phones };
})();
