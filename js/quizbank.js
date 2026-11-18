// Quiz "Welke zin is goed?": elke vraag heeft drie antwoorden in de taal die je leert:
//   1 goed · 1 goed bedoeld, maar met een grammaticafout · 1 grammaticaal goed, maar een andere betekenis (dus fout).
// De zinnen worden samengesteld uit dezelfde werkwoorden, voornaamwoorden en vervolgdelen als bij "Zin bouwen";
// de fouten komen uit vaste, gecontroleerde regels (geen gokwerk), met uitleg in de taal van de gebruiker.
var QUIZ = (function () {
  var SUBJW = {
    es: ["yo", "tú", "él", "ella", "nosotros", "ellos"],
    nl: ["ik", "jij", "hij", "zij", "wij", "zij"],
    en: ["I", "you", "he", "she", "we", "they"],
    de: ["ich", "du", "er", "sie", "wir", "sie"],
    fr: ["je", "tu", "il", "elle", "nous", "ils"]
  };
  var F = {
    en: { ir: ["am going", "are going", "is going", "are going", "are going"], tener: ["have", "have", "has", "have", "have"], querer: ["want", "want", "wants", "want", "want"],
      estar: ["am", "are", "is", "are", "are"], trabajar: ["work", "work", "works", "work", "work"], hacer: ["do", "do", "does", "do", "do"], comer: ["eat", "eat", "eats", "eat", "eat"],
      ir_past: ["went", "went", "went", "went", "went"] },
    de: { ir: ["gehe", "gehst", "geht", "gehen", "gehen"], tener: ["habe", "hast", "hat", "haben", "haben"], querer: ["möchte", "möchtest", "möchte", "möchten", "möchten"],
      estar: ["bin", "bist", "ist", "sind", "sind"], trabajar: ["arbeite", "arbeitest", "arbeitet", "arbeiten", "arbeiten"], hacer: ["mache", "machst", "macht", "machen", "machen"],
      comer: ["esse", "isst", "isst", "essen", "essen"], ir_past: ["bin gegangen", "bist gegangen", "ist gegangen", "sind gegangen", "sind gegangen"] },
    fr: { ir: ["vais", "vas", "va", "allons", "vont"], tener: ["ai", "as", "a", "avons", "ont"], querer: ["veux", "veux", "veut", "voulons", "veulent"],
      estar: ["suis", "es", "est", "sommes", "sont"], trabajar: ["travaille", "travailles", "travaille", "travaillons", "travaillent"], hacer: ["fais", "fais", "fait", "faisons", "font"],
      comer: ["mange", "manges", "mange", "mangeons", "mangent"], ir_past: ["suis allé", "es allé", "est allé", "sommes allés", "sont allés"] },
    nl: { ir: ["ga", "gaat", "gaat", "gaan", "gaan"], tener: ["heb", "hebt", "heeft", "hebben", "hebben"], querer: ["wil", "wilt", "wil", "willen", "willen"],
      estar: ["ben", "bent", "is", "zijn", "zijn"], trabajar: ["werk", "werkt", "werkt", "werken", "werken"], hacer: ["doe", "doet", "doet", "doen", "doen"],
      comer: ["eet", "eet", "eet", "eten", "eten"], ir_past: ["ging", "ging", "ging", "gingen", "gingen"] }
  };
  var REFL = { de: ["mich", "dich", "sich", "sich", "uns", "sich"], fr: ["me", "te", "se", "se", "nous", "se"] };
  var AVOIR = { fr: ["ai", "as", "a", "avons", "ont"], de: ["habe", "hast", "hat", "haben", "haben"] };

  // Lidwoord-/geslachtsfouten per vervolgdeel (werkwoord:nummer). g = geslacht van het zelfstandig naamwoord
  var ART = {
    es: { "ir:0": ["a la cine", "cine", "m"], "ir:1": ["a la trabajo", "trabajo", "m"], "ir:2": ["al playa", "playa", "f"], "ir:3": ["a la parque", "parque", "m"],
      "tener:3": ["una perro", "perro", "m"], "querer:1": ["una café", "café", "m"], "hacer:1": ["el cena", "cena", "f"], "hacer:2": ["el compra", "compra", "f"], "hacer:3": ["un pausa", "pausa", "f"],
      "estar:3": ["en el ciudad", "ciudad", "f"], "trabajar:1": ["en un tienda", "tienda", "f"], "trabajar:3": ["en el ciudad", "ciudad", "f"],
      "ir_past:0": ["a la cine", "cine", "m"], "ir_past:1": ["a la mercado", "mercado", "m"], "ir_past:2": ["al playa", "playa", "f"] },
    fr: { "ir:0": ["à la cinéma", "cinéma", "m"], "ir:1": ["à la travail", "travail", "m"], "ir:2": ["au plage", "plage", "f"], "ir:3": ["à la parc", "parc", "m"],
      "tener:2": ["de la temps libre", "temps", "m"], "tener:3": ["une chien", "chien", "m"], "querer:1": ["une café", "café", "m"], "estar:1": ["au maison", "maison", "f"],
      "trabajar:1": ["dans une magasin", "magasin", "m"], "hacer:0": ["de la sport", "sport", "m"], "hacer:1": ["la dîner", "dîner", "m"], "hacer:3": ["un pause", "pause", "f"],
      "comer:0": ["de la pain", "pain", "m"], "comer:3": ["au maison", "maison", "f"], "ir_past:0": ["à la cinéma", "cinéma", "m"], "ir_past:1": ["à la marché", "marché", "m"], "ir_past:2": ["au plage", "plage", "f"] },
    de: { "ir:0": ["in die Kino", "Kino", "n"], "ir:1": ["zum Arbeit", "Arbeit", "f"], "ir:2": ["an die Strand", "Strand", "m"], "ir:3": ["in das Park", "Park", "m"],
      "tener:3": ["eine Hund", "Hund", "m"], "querer:1": ["eine Kaffee", "Kaffee", "m"], "estar:2": ["in der Urlaub", "Urlaub", "m"], "estar:3": ["in dem Stadt", "Stadt", "f"],
      "trabajar:1": ["in einer Laden", "Laden", "m"], "hacer:1": ["die Abendessen", "Abendessen", "n"], "hacer:2": ["das Einkauf", "Einkauf", "m"], "hacer:3": ["ein Pause", "Pause", "f"],
      "ir_past:0": ["in die Kino", "Kino", "n"], "ir_past:1": ["auf die Markt", "Markt", "m"], "ir_past:2": ["an die Strand", "Strand", "m"] },
    nl: { "ir:0": ["naar het bioscoop", "bioscoop", "de"], "ir:1": ["naar de werk", "werk", "het"], "ir:2": ["naar de strand", "strand", "het"], "ir:3": ["naar de park", "park", "het"],
      "hacer:1": ["de avondeten", "avondeten", "het"], "estar:3": ["in het stad", "stad", "de"], "trabajar:3": ["in het stad", "stad", "de"],
      "ir_past:0": ["naar het bioscoop", "bioscoop", "de"], "ir_past:1": ["naar het markt", "markt", "de"], "ir_past:2": ["naar de strand", "strand", "het"] },
    en: { "tener:0": ["an lot of work", "lot", "an"], "tener:3": ["an dog", "dog", "an"], "querer:1": ["an coffee", "coffee", "an"], "trabajar:1": ["in an shop", "shop", "an"], "hacer:3": ["an break", "break", "an"] }
  };

  // Zinnen buiten het patroon "onderwerp + werkwoord + vervolg": betekenis in elke taal + fouten per leertaal
  var BANK = [
    { t: { nl: "Het huis is wit.", en: "The house is white.", de: "Das Haus ist weiß.", fr: "La maison est blanche.", es: "La casa es blanca." },
      err: { fr: { txt: "La maison est blanc.", type: "adj", n: "maison", r: "blanche", w: "blanc" }, es: { txt: "La casa es blanco.", type: "adj", n: "casa", r: "blanca", w: "blanco" } } },
    { t: { nl: "Mijn zus is moe.", en: "My sister is tired.", de: "Meine Schwester ist müde.", fr: "Ma sœur est fatiguée.", es: "Mi hermana está cansada." },
      err: { fr: { txt: "Ma sœur est fatigué.", type: "adj", n: "sœur", r: "fatiguée", w: "fatigué" }, es: { txt: "Mi hermana está cansado.", type: "adj", n: "hermana", r: "cansada", w: "cansado" } } },
    { t: { nl: "Ik heb een groot huis.", en: "I have a big house.", de: "Ich habe ein großes Haus.", fr: "J'ai une grande maison.", es: "Tengo una casa grande." },
      err: { nl: { txt: "Ik heb een grote huis.", type: "adj", n: "huis", r: "groot", w: "grote" }, de: { txt: "Ich habe ein große Haus.", type: "adj", n: "Haus", r: "großes", w: "große" },
        fr: { txt: "J'ai une maison grande.", type: "adjpos", r: "une grande maison" }, es: { txt: "Tengo una casa grandes.", type: "adj", n: "casa", r: "grande", w: "grandes" } } },
    { t: { nl: "Zij heeft twee kinderen.", en: "She has two children.", de: "Sie hat zwei Kinder.", fr: "Elle a deux enfants.", es: "Ella tiene dos hijos." },
      err: { nl: { txt: "Zij heeft twee kind.", type: "plural", r: "kinderen", w: "kind" }, en: { txt: "She has two childs.", type: "plural", r: "children", w: "childs" },
        de: { txt: "Sie hat zwei Kind.", type: "plural", r: "Kinder", w: "Kind" }, fr: { txt: "Elle a deux enfant.", type: "plural", r: "enfants", w: "enfant" }, es: { txt: "Ella tiene dos hijo.", type: "plural", r: "hijos", w: "hijo" } } },
    { t: { nl: "Hij drinkt geen koffie.", en: "He doesn't drink coffee.", de: "Er trinkt keinen Kaffee.", fr: "Il ne boit pas de café.", es: "Él no bebe café." },
      err: { nl: { txt: "Hij drinkt niet koffie.", type: "neg", r: "geen koffie", w: "niet koffie" }, en: { txt: "He don't drink coffee.", type: "aux", r: "doesn't", w: "don't" },
        de: { txt: "Er trinkt kein Kaffee.", type: "neg", r: "keinen Kaffee", w: "kein Kaffee" }, fr: { txt: "Il ne boit pas du café.", type: "neg", r: "pas de café", w: "pas du café" } } },
    { t: { nl: "Morgen ga ik naar het strand.", en: "Tomorrow I am going to the beach.", de: "Morgen gehe ich an den Strand.", fr: "Demain, je vais à la plage.", es: "Mañana voy a la playa." },
      err: { nl: { txt: "Morgen ik ga naar het strand.", type: "order", r: "Morgen ga ik naar het strand." }, de: { txt: "Morgen ich gehe an den Strand.", type: "order", r: "Morgen gehe ich an den Strand." } } },
    { t: { nl: "Gisteren heb ik een film gezien.", en: "Yesterday I saw a film.", de: "Gestern habe ich einen Film gesehen.", fr: "Hier, j'ai vu un film.", es: "Ayer vi una película." },
      err: { nl: { txt: "Gisteren ben ik een film gezien.", type: "aux", r: "heb", w: "ben" }, en: { txt: "Yesterday I seen a film.", type: "irreg", r: "saw", w: "seen" },
        de: { txt: "Gestern bin ich einen Film gesehen.", type: "aux", r: "habe", w: "bin" }, fr: { txt: "Hier, j'ai voir un film.", type: "part", r: "vu", w: "voir" },
        es: { txt: "Ayer vi un película.", type: "art", n: "película", g: "f", r: "una película", w: "un película" } } }
  ];

  var GEN = {
    m: { nl: "mannelijk", en: "masculine", de: "maskulin", fr: "masculin", es: "masculino" },
    f: { nl: "vrouwelijk", en: "feminine", de: "feminin", fr: "féminin", es: "femenino" },
    n: { nl: "onzijdig", en: "neuter", de: "neutral", fr: "neutre", es: "neutro" },
    de: { nl: "een de-woord", en: "a “de” word", de: "ein „de“-Wort", fr: "un mot en « de »", es: "una palabra con «de»" },
    het: { nl: "een het-woord", en: "a “het” word", de: "ein „het“-Wort", fr: "un mot en « het »", es: "una palabra con «het»" }
  };
  var TX = {
    conj: { nl: "Het werkwoord past niet bij het onderwerp: bij «{s}» hoort «{r}», niet «{w}» (dat is de vorm bij {x}).",
      en: "The verb doesn't match the subject: with “{s}” you need “{r}”, not “{w}” (that is the form for {x}).",
      de: "Das Verb passt nicht zum Subjekt: zu „{s}“ gehört „{r}“, nicht „{w}“ (das ist die Form für {x}).",
      fr: "Le verbe ne s'accorde pas avec le sujet : avec « {s} » il faut « {r} », pas « {w} » (c'est la forme pour {x}).",
      es: "El verbo no concuerda con el sujeto: con «{s}» va «{r}», no «{w}» (esa es la forma de {x})." },
    art: { nl: "Fout in het lidwoord: «{n}» is {g}. Goed is «{r}», niet «{w}».",
      en: "Article mistake: “{n}” is {g}. The correct form is “{r}”, not “{w}”.",
      de: "Fehler beim Artikel: „{n}“ ist {g}. Richtig ist „{r}“, nicht „{w}“.",
      fr: "Erreur d'article : « {n} » est {g}. Il faut « {r} », pas « {w} ».",
      es: "Error de artículo: «{n}» es {g}. Lo correcto es «{r}», no «{w}»." },
    aan: { nl: "Fout in het lidwoord: voor een klinkerklank gebruik je «an», voor een medeklinker «a». Goed is «{r}», niet «{w}».",
      en: "Article mistake: use “an” before a vowel sound and “a” before a consonant sound. Correct: “{r}”, not “{w}”.",
      de: "Fehler beim Artikel: vor einem Vokallaut steht „an“, vor einem Konsonanten „a“. Richtig ist „{r}“, nicht „{w}“.",
      fr: "Erreur d'article : devant une voyelle on dit « an », devant une consonne « a ». Il faut « {r} », pas « {w} ».",
      es: "Error de artículo: antes de sonido vocálico se usa «an», antes de consonante «a». Correcto: «{r}», no «{w}»." },
    agree: { nl: "Het voltooid deelwoord moet overeenkomen met het onderwerp «{s}»: «{r}», niet «{w}».",
      en: "The past participle must agree with the subject “{s}”: “{r}”, not “{w}”.",
      de: "Das Partizip muss zum Subjekt „{s}“ passen: „{r}“, nicht „{w}“.",
      fr: "Le participe passé doit s'accorder avec le sujet « {s} » : « {r} », pas « {w} ».",
      es: "El participio debe concordar con el sujeto «{s}»: «{r}», no «{w}»." },
    part: { nl: "Verkeerde vorm van het werkwoord: het voltooid deelwoord is «{r}», niet «{w}».",
      en: "Wrong verb form: the past participle is “{r}”, not “{w}”.",
      de: "Falsche Verbform: das Partizip heißt „{r}“, nicht „{w}“.",
      fr: "Mauvaise forme du verbe : le participe passé est « {r} », pas « {w} ».",
      es: "Forma verbal incorrecta: el participio es «{r}», no «{w}»." },
    aux: { nl: "Fout in het hulpwerkwoord: hier hoort «{r}» in plaats van «{w}».",
      en: "Auxiliary mistake: here you need “{r}” instead of “{w}”.",
      de: "Fehler beim Hilfsverb: hier gehört „{r}“ statt „{w}“.",
      fr: "Erreur d'auxiliaire : ici il faut « {r} » et pas « {w} ».",
      es: "Error de auxiliar: aquí va «{r}» en lugar de «{w}»." },
    irreg: { nl: "Onregelmatige vorm: het is «{r}», niet «{w}».",
      en: "Irregular form: it is “{r}”, not “{w}”.",
      de: "Unregelmäßige Form: es heißt „{r}“, nicht „{w}“.",
      fr: "Forme irrégulière : c'est « {r} », pas « {w} ».",
      es: "Forma irregular: es «{r}», no «{w}»." },
    order: { nl: "Fout in de woordvolgorde: het vervoegde werkwoord staat op de verkeerde plek. Goed is: «{r}»",
      en: "Word order mistake: the conjugated verb is in the wrong place. Correct: “{r}”",
      de: "Fehler in der Wortstellung: das konjugierte Verb steht an der falschen Stelle. Richtig: „{r}“",
      fr: "Erreur d'ordre des mots : le verbe conjugué n'est pas à la bonne place. Correct : « {r} »",
      es: "Error en el orden de las palabras: el verbo conjugado está en el lugar equivocado. Correcto: «{r}»" },
    adj: { nl: "Fout bij het bijvoeglijk naamwoord: het moet passen bij het zelfstandig naamwoord «{n}». Goed is «{r}», niet «{w}».",
      en: "Adjective mistake: it has to agree with the noun “{n}”. Correct: “{r}”, not “{w}”.",
      de: "Fehler beim Adjektiv: es muss zum Nomen „{n}“ passen. Richtig ist „{r}“, nicht „{w}“.",
      fr: "Erreur d'adjectif : il doit s'accorder avec le nom « {n} ». Il faut « {r} », pas « {w} ».",
      es: "Error en el adjetivo: debe concordar con el sustantivo «{n}». Correcto: «{r}», no «{w}»." },
    adjpos: { nl: "Fout bij de plaats van het bijvoeglijk naamwoord: «grand» staat in het Frans vóór het zelfstandig naamwoord. Goed is «{r}».",
      en: "Adjective position: “grand” goes before the noun in French. Correct: “{r}”.",
      de: "Stellung des Adjektivs: „grand“ steht im Französischen vor dem Nomen. Richtig: „{r}“.",
      fr: "Place de l'adjectif : « grand » se place avant le nom. Correct : « {r} ».",
      es: "Posición del adjetivo: en francés «grand» va antes del sustantivo. Correcto: «{r}»." },
    plural: { nl: "Fout in het meervoud: het is «{r}», niet «{w}».",
      en: "Plural mistake: it is “{r}”, not “{w}”.",
      de: "Fehler im Plural: es heißt „{r}“, nicht „{w}“.",
      fr: "Erreur de pluriel : c'est « {r} », pas « {w} ».",
      es: "Error de plural: es «{r}», no «{w}»." },
    neg: { nl: "Fout in de ontkenning: hier hoort «{r}», niet «{w}».",
      en: "Negation mistake: here you need “{r}”, not “{w}”.",
      de: "Fehler bei der Verneinung: hier gehört „{r}“, nicht „{w}“.",
      fr: "Erreur de négation : ici il faut « {r} », pas « {w} ».",
      es: "Error en la negación: aquí va «{r}», no «{w}»." },
    mean: { nl: "Deze zin is grammaticaal goed, maar hij betekent iets anders: «{m}»",
      en: "This sentence is grammatically fine, but it means something else: “{m}”",
      de: "Dieser Satz ist grammatisch richtig, bedeutet aber etwas anderes: „{m}“",
      fr: "Cette phrase est correcte, mais elle veut dire autre chose : « {m} »",
      es: "Esta frase es correcta, pero significa otra cosa: «{m}»" }
  };
  var UI = {
    title: { nl: "Welke zin is goed?", en: "Which sentence is correct?", de: "Welcher Satz ist richtig?", fr: "Quelle phrase est correcte ?", es: "¿Qué frase es correcta?" },
    meaning: { nl: "Betekenis:", en: "Meaning:", de: "Bedeutung:", fr: "Sens :", es: "Significado:" },
    ok: { nl: "Goed!", en: "Correct!", de: "Richtig!", fr: "Bien !", es: "¡Correcto!" },
    no: { nl: "Niet helemaal.", en: "Not quite.", de: "Nicht ganz.", fr: "Pas tout à fait.", es: "No del todo." },
    tagGood: { nl: "✓ goed", en: "✓ correct", de: "✓ richtig", fr: "✓ correct", es: "✓ correcta" },
    tagGram: { nl: "✗ grammaticafout", en: "✗ grammar mistake", de: "✗ Grammatikfehler", fr: "✗ faute de grammaire", es: "✗ error de gramática" },
    tagMean: { nl: "✗ andere betekenis", en: "✗ different meaning", de: "✗ andere Bedeutung", fr: "✗ autre sens", es: "✗ otro significado" }
  };
  function tx(o, L) { return o[L] || o.nl; }
  function fill(s, p) { return s.replace(/\{(\w+)\}/g, function (m0, k) { return p[k] === undefined ? "" : p[k]; }); }
  function explain(e, L) {
    var p = {}; Object.keys(e).forEach(function (k) { p[k] = e[k]; });
    if (e.g) p.g = tx(GEN[e.g], L);
    return fill(tx(TX[e.type], L), p);
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  // ---- zinnen samenstellen ----
  function blocked(X, vid, ci, si) {
    if (vid === "estar" && ci === 0) return true;                       // "bien/gut/well" past niet in elke taal als losse zin
    if (vid === "tener" && ci === 1 && X === "en") return true;          // "I have hunger" is geen Engels
    if (((vid === "ir_past" && ci === 3) || (vid === "trabajar" && ci === 2)) && si !== 0) return true;   // "mijn vrienden", "chez moi"
    if (vid === "ir_past" && ci === 3 && X === "de") return true;
    return false;
  }
  function formOf(ctx, X, vid, ci, i) {
    var f = X === "es" ? (ctx.esForms[vid] || [])[i] : (F[X] && F[X][vid] ? F[X][vid][i] : null);
    if (X === "en" && vid === "hacer") { if (ci === 1) f = ["make", "make", "makes", "make", "make"][i]; if (ci === 3) f = ["take", "take", "takes", "take", "take"][i]; }
    if (X === "nl" && vid === "hacer") { if (ci === 1) f = ["maak", "maakt", "maakt", "maken", "maken"][i]; if (ci === 3) f = ["neem", "neemt", "neemt", "nemen", "nemen"][i]; }
    return f;
  }
  function compose(ctx, X, vid, ci, si, o) {
    o = o || {};
    if (blocked(X, vid, ci, si)) return null;
    var S = ctx.SUBJ[si], i = S.i, comp = ctx.comp(X, vid, ci);
    if (comp === undefined || comp === null || comp === "") return null;
    if (o.comp) comp = o.comp;
    var sw = SUBJW[X][si], form = o.form !== undefined ? o.form : formOf(ctx, X, vid, ci, i);
    if (!form) return null;
    if (X === "en" && vid === "querer" && ci !== 1 && !o.comp) comp = "to " + comp;
    if (X === "de" && vid === "querer" && ci === 2) comp = REFL.de[si] + " " + comp;
    if (X === "fr" && vid === "querer" && ci === 2) comp = comp.replace(/^se /, REFL.fr[si] + " ");
    var aux = null, part = null;
    if (vid === "ir_past" && (X === "de" || X === "fr")) {
      var sp = form.split(" "); aux = sp[0]; part = sp[1];
      if (X === "fr" && si === 3 && /allé$/.test(part) && o.part === undefined) part += "e";
      if (o.part !== undefined) part = o.part;
    }
    var words;
    if (aux) words = X === "de" ? (o.order ? [sw, comp, aux, part] : [sw, aux, comp, part]) : (o.order ? [sw, comp, aux, part] : [sw, aux, part, comp]);
    else words = o.order ? [sw, comp, form] : [sw, form, comp];
    var txt;
    if (X === "fr" && si === 0 && !o.order && /^[aeiouyéèêh]/i.test(aux || form)) txt = "J'" + words.slice(1).join(" ");
    else txt = words.join(" ");
    return { txt: cap(txt) + ".", sw: sw, form: aux ? aux + " " + part : form, aux: aux, part: part, comp: comp };
  }
  function verbText(c) { return c.form; }

  function makeDrill(ctx) {
    var T = ctx.T, L = ctx.L, tries = 0;
    while (tries++ < 60) {
      var v = pick(ctx.VERBS), vid = v.id, ci = Math.floor(Math.random() * v.comps.length), si = Math.floor(Math.random() * ctx.SUBJ.length);
      var good = compose(ctx, T, vid, ci, si), mean = compose(ctx, L, vid, ci, si);
      if (!good || !mean) continue;
      var i = ctx.SUBJ[si].i, cands = [];
      // 1 werkwoordsvorm van een andere persoon
      var others = [];
      // "sie"/"zij" kan enkelvoud én meervoud zijn: dan zijn beide vormen goed en dus geen fout
      var ambig = (T === "de" || T === "nl") && (si === 3 || si === 5), okForms = ambig ? [formOf(ctx, T, vid, ci, 2), formOf(ctx, T, vid, ci, 4)] : [];
      for (var j = 0; j < 5; j++) {
        var fj = formOf(ctx, T, vid, ci, j);
        if (!fj || fj === formOf(ctx, T, vid, ci, i) || okForms.indexOf(fj) >= 0) continue;
        if (T === "nl" && vid === "querer" && si === 1 && fj === "wil") continue;   // "jij wil" hoor je veel; dat tellen we niet als fout
        others.push(j);
      }
      if (others.length) {
        var j2 = pick(others), wf = formOf(ctx, T, vid, ci, j2), bad = compose(ctx, T, vid, ci, si, { form: wf });
        if (bad) {
          var who = []; for (var k = 0; k < 6; k++) if (ctx.SUBJ[k].i === j2 && who.indexOf(SUBJW[T][k]) < 0) who.push(SUBJW[T][k]);
          cands.push({ txt: bad.txt, e: { type: "conj", s: good.sw, r: good.form, w: bad.form, x: who.join(" / ") } });
        }
      }
      // 2 lidwoord / geslacht
      var a = ART[T] && ART[T][vid + ":" + ci];
      if (a) {
        var bd = compose(ctx, T, vid, ci, si, { comp: (T === "en" && vid === "querer" ? "" : "") + a[0] });
        if (bd) {
          var rc = good.comp, wc = a[0];
          cands.push({ txt: bd.txt, e: T === "en" ? { type: "aan", r: rc, w: wc } : { type: "art", n: a[1], g: a[2], r: rc, w: wc } });
        }
      }
      // 3 deelwoord / hulpwerkwoord / onregelmatig
      if (vid === "ir_past") {
        if (T === "fr" && si >= 3) { var bp = compose(ctx, T, vid, ci, si, { part: "allé" }); if (bp && bp.txt !== good.txt) cands.push({ txt: bp.txt, e: { type: "agree", s: good.sw, r: good.part, w: "allé" } }); }
        if (T === "fr" || T === "de") {
          var af = AVOIR[T][i] + " " + (T === "fr" ? "allé" : "gegangen"), ba = compose(ctx, T, vid, ci, si, { form: af });
          if (ba) cands.push({ txt: ba.txt, e: { type: "aux", r: good.aux, w: AVOIR[T][i] } });
        }
        if (T === "en") { var bi = compose(ctx, T, vid, ci, si, { form: "goed" }); if (bi) cands.push({ txt: bi.txt, e: { type: "irreg", r: "went", w: "goed" } }); }
      }
      // 4 woordvolgorde
      if (T !== "es" && !(T === "nl" && vid === "trabajar" && ci === 0)) { var bo = compose(ctx, T, vid, ci, si, { order: true }); if (bo && bo.txt !== good.txt) cands.push({ txt: bo.txt, e: { type: "order", r: good.txt } }); }
      if (!cands.length) continue;
      var err = pick(cands);
      // 5 grammaticaal goede zin met een andere betekenis (zelfde persoon, ander werkwoord of vervolgdeel)
      var wrong = null, t2 = 0;
      while (!wrong && t2++ < 40) {
        var v2 = pick(ctx.VERBS), ci2 = Math.floor(Math.random() * v2.comps.length);
        if (v2.id === vid && ci2 === ci) continue;
        var g2 = compose(ctx, T, v2.id, ci2, si), m2 = compose(ctx, L, v2.id, ci2, si);
        if (g2 && m2 && g2.txt !== good.txt && g2.txt !== err.txt) wrong = { txt: g2.txt, e: { type: "mean", m: m2.txt } };
      }
      if (!wrong) continue;
      return finish(mean.txt, good.txt, err, wrong);
    }
    return null;
  }
  function makeBank(ctx) {
    var T = ctx.T, L = ctx.L, pool = BANK.filter(function (b) { return b.err[T]; });
    if (!pool.length) return null;
    var b = pick(pool), er = b.err[T], e = {};
    Object.keys(er).forEach(function (k) { if (k !== "txt") e[k] = er[k]; });
    var others = BANK.filter(function (x) { return x !== b && x.t[T] && x.t[L]; });
    if (!others.length || !b.t[L] || !b.t[T]) return null;
    var o = pick(others);
    return finish(b.t[L], b.t[T], { txt: er.txt, e: e }, { txt: o.t[T], e: { type: "mean", m: o.t[L] } });
  }
  function finish(meaning, goodTxt, err, wrong) {
    return { meaning: meaning, opts: shuffle([{ txt: goodTxt, role: "good" }, { txt: err.txt, role: "gram", e: err.e }, { txt: wrong.txt, role: "mean", e: wrong.e }]) };
  }
  function next(ctx) {
    for (var n = 0; n < 8; n++) {
      var q = Math.random() < 0.3 ? (makeBank(ctx) || makeDrill(ctx)) : (makeDrill(ctx) || makeBank(ctx));
      if (q) return q;
    }
    return null;
  }
  return { next: next, explain: explain, UI: UI, tx: tx, compose: compose, BANK: BANK, ART: ART };
})();
if (typeof module !== "undefined") module.exports = QUIZ;
