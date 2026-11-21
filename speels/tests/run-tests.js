// Controles die vóór elke oplevering draaien: node tests/run-tests.js
// Geen afhankelijkheden. Faalt met een niet-nul exit-code als er iets niet klopt.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
let failures = 0;
function check(name, ok, detail) {
  if (ok) console.log("ok   " + name);
  else { failures++; console.log("FAIL " + name + (detail ? "\n     " + detail : "")); }
}

// 1. Versienummers lopen gelijk (app en service worker)
const appVer = (read("js/app.js").match(/APP_VERSION = "([\d.]+)"/) || [])[1];
const swVer = (read("sw.js").match(/CACHE_VERSION = "gespreksgids-v([\d.]+)"/) || [])[1];
check("APP_VERSION en CACHE_VERSION zijn gelijk", appVer && appVer === swVer, `app=${appVer} sw=${swVer}`);

// 2. Alle scripts en stijlen in index.html bestaan
const html = read("index.html");
const refs = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)].map((m) => m[1]);
const missing = refs.filter((f) => !fs.existsSync(path.join(root, f)));
check("alle js/css uit index.html bestaan", missing.length === 0, missing.join(", "));

// 3. Offline-cache bevat alles wat de app nodig heeft
const sw = read("sw.js");
const precache = [...sw.matchAll(/"(\.\/[^"]+)"/g)].map((m) => m[1].slice(2));
const needed = refs.concat(["index.html", "privacy.html", "manifest.webmanifest"]);
const notCached = needed.filter((f) => !precache.includes(f) && f !== "");
check("alle bestanden die de app laadt staan in de offline-cache", notCached.length === 0, notCached.join(", "));
const brokenCache = precache.filter((f) => !fs.existsSync(path.join(root, f)));
check("alle bestanden in de offline-cache bestaan", brokenCache.length === 0, brokenCache.join(", "));

// 4. Woordenlijsten: formaat en inhoud
const ctx = {};
vm.createContext(ctx);
for (const f of ["js/dict-wiki.js", "js/dict-extra.js", "js/dict-pdf.js", "js/dict-pdf-nl.js", "js/dict-pdf-en.js", "js/dict-pdf-de.js", "js/dict-pdf-fr.js", "js/dict.js"]) {
  if (fs.existsSync(path.join(root, f))) vm.runInContext(read(f), ctx, { filename: f });
}
const DICTS = vm.runInContext("DICTS", ctx);
for (const l of ["nl", "en", "de", "fr"]) {
  check(`woordenlijst ${l} heeft meer dan 3000 woorden`, Object.keys(DICTS[l] || {}).length > 3000, `aantal=${Object.keys(DICTS[l] || {}).length}`);
}
const pdfRaw = vm.runInContext("DICT_PDF", ctx);
for (const l of ["nl", "en", "de", "fr"]) {
  const bad = pdfRaw[l].split("|").filter((e) => e.split("=").length !== 2 || !e.split("=")[0] || !e.split("=")[1]);
  check(`DICT_PDF ${l}: elk item is bron=doel`, bad.length === 0, bad.slice(0, 5).join(" , "));
}
// Spot-checks: woorden die via de Spaanse PDF-lijsten (Spaans-Engels) gekoppeld zijn
const spot = [["en", "greet", "saludar"], ["en", "childhood", "infancia"], ["fr", "bonsoir", "buenas noches"], ["nl", "boodschappen", "compra"]];
for (const [l, w, es] of spot) check(`opzoeken ${l}:${w} geeft "${es}"`, DICTS[l][w] === es, `kreeg ${DICTS[l][w]}`);

// 5. Stappenplan: elke m() heeft vier talen
const helpSrc = read("js/content.js");
const helpStart = helpSrc.indexOf("HELP_GUIDE");
const helpBlock = helpStart >= 0 ? helpSrc.slice(helpStart) : "";
const mCalls = [...helpBlock.matchAll(/m\(("(?:[^"\\]|\\.)*")\s*,\s*("(?:[^"\\]|\\.)*")\s*,\s*("(?:[^"\\]|\\.)*")\s*,\s*("(?:[^"\\]|\\.)*")\s*\)/g)];
const allM = (helpBlock.match(/m\(/g) || []).length;
check("stappenplan: elke vertaling heeft vier talen", mCalls.length > 0 && mCalls.length >= allM - 2, `volledig=${mCalls.length} aanroepen=${allM}`);

// 6. Zinsmodules Engels, Duits, Frans (beide richtingen)
for (const f of ["js/zin-lex.js", "js/zin-gender.js", "js/zin-core.js", "js/zin-out.js", "js/zin-in.js"]) vm.runInContext(read(f), ctx, { filename: f });
vm.runInContext("var REVS = typeof REVS !== 'undefined' ? REVS : {};", ctx);
const ZIN = vm.runInContext("ZIN", ctx);
const fromCases = [
  ["Estoy cansada.", "en", "I am tired."], ["Estoy cansada.", "fr", "Je suis fatiguée."],
  ["No tengo hermanos.", "de", "Ich habe keine Geschwister."], ["Me gusta el café.", "fr", "J'aime le café."],
  ["¿Dónde está la estación?", "de", "Wo ist der Bahnhof?"], ["Mis padres viven en Utrecht.", "en", "My parents live in Utrecht."],
  ["Ayer fui al cine con un amigo.", "de", "Ich bin gestern mit einem Freund ins Kino gegangen."],
  ["Es mi padre.", "fr", "C'est mon père."], ["Me voy mañana.", "en", "I am leaving tomorrow."],
  ["No bebo café.", "de", "Ich trinke keinen Kaffee."], ["¿Cuánto cuesta el café?", "fr", "Combien coûte le café ?"]
];
for (const [es, l, exp] of fromCases) { const r = ZIN.fromEs(es, l); check(`zin ${l}: "${es}" -> "${exp}"`, r === exp, `kreeg ${r}`); }
const toCases = [
  ["en", "I don't like dogs.", "No me gustan los perros."], ["en", "Where are you going?", "¿Adónde vas?"],
  ["de", "Ich habe Hunger.", "Tengo hambre."], ["de", "Ich rufe meine Mutter an.", "Llamo a mi madre."],
  ["fr", "Je n'ai pas de chien.", "No tengo perro."], ["fr", "Je suis fatiguée.", "Estoy cansada."]
];
for (const [l, txt, exp] of toCases) { const r = ZIN.toEs(txt, l, "m"); check(`zin ${l}->es: "${txt}" -> "${exp}"`, r === exp, `kreeg ${r}`); }
// Onzekere zinnen geven geen zin (alleen woorden): "lo" kan hem of het zijn
check("onzeker: 'Lo veo.' geeft in het Engels geen zin", ZIN.fromEs("Lo veo.", "en") === null, `kreeg ${ZIN.fromEs("Lo veo.", "en")}`);

// 7. Uitspraak: klankvergelijking
vm.runInContext(read("js/klank.js"), ctx, { filename: "js/klank.js" });
const KLANK = vm.runInContext("KLANK", ctx);
const k1 = KLANK.compare("perro", "pero", "nl");
check("klank: 'pero' voor 'perro' wordt herkend als enkele r", k1.score < 100 && /getrilde rr/.test(k1.msgs[0]), JSON.stringify(k1));
const k2 = KLANK.compare("vaca", "baca", "nl");
check("klank: b en v klinken hetzelfde", k2.score === 100, JSON.stringify(k2));
const k3 = KLANK.compare("¿Dónde está la estación?", "donde esta la estacion", "en");
check("klank: accenten en leestekens tellen niet mee", k3.score === 100 && k3.words[3].w === "estación", JSON.stringify(k3));

// 8. Achtergrondband: elk palet bevat de knopkleuren van het thema
{
  const css = read("css/speels.css");
  const ach = {}; vm.createContext(ach); vm.runInContext(read("js/achtergrond.js") + ";this.A=ACHTERGROND", ach);
  const PAL = ach.A.PAL;
  const bt = { "standaard-nl": 'data-lang="nl"', "standaard-en": 'data-lang="en"', "standaard-de": 'data-lang="de"', "standaard-fr": 'data-lang="fr"', ijs: "th-ijs", jungle: "th-jungle", ruimte: "th-ruimte", donker: "th-donker" };
  for (const k of Object.keys(bt)) {
    const line = css.split("\n").find((l) => l.includes(bt[k]) && l.includes("--bt1"));
    const cols = line ? [...line.matchAll(/--bt\d:\s*(#[0-9a-fA-F]{6})/g)].map((m) => m[1].toLowerCase()) : [];
    const pal = PAL[k].map((c) => c.toLowerCase());
    const miss = cols.filter((c) => !pal.includes(c));
    check(`achtergrond ${k}: knopkleuren zitten in het palet`, cols.length === 3 && miss.length === 0, `ontbreekt: ${miss.join(", ")}`);
  }
  check("achtergrond: kleurenkaart staat in de offline-cache", read("sw.js").includes("./img/achtergrond-kaart.png"));
}

// 11. Zinherstel: een herkende zin wordt alleen naar een bekende zin hersteld als die duidelijk de beste is
const ZH = require(path.join(root, "js", "zin-herstel.js"));
const zinnen = ["Vivo mañana.", "Camina hoy.", "Como pan.", "Hace mucho frío."];
const h1 = ZH.corrigeer("Bebo mañana", zinnen);
check("zinherstel: fout herkende zin wordt de bekende zin", h1.tekst === "Vivo mañana." && h1.gecorrigeerd === true, JSON.stringify(h1));
const h2 = ZH.corrigeer("Vivo mañana.", zinnen);
check("zinherstel: juiste zin blijft ongewijzigd", h2.tekst === "Vivo mañana." && h2.gecorrigeerd === false, JSON.stringify(h2));
const h3 = ZH.corrigeer("zxq wvm", zinnen);
check("zinherstel: onbekende tekst blijft staan", h3.tekst === "zxq wvm" && h3.gecorrigeerd === false, JSON.stringify(h3));
const h4 = ZH.corrigeer("Vivo hoy", ["Vivo hoy.", "Vivo hoy!"]);
check("zinherstel: gelijke kandidaten leveren niets op", h4.tekst === "Vivo hoy" && h4.gecorrigeerd === false, JSON.stringify(h4));
const h5 = ZH.corrigeer("Como pan", []);
check("zinherstel: zonder zinnen blijft de tekst staan", h5.tekst === "Como pan" && h5.gecorrigeerd === false, JSON.stringify(h5));
check("zinherstel: klanken van b en v vallen samen", ZH.klank("vivo") === ZH.klank("bibo"), ZH.klank("vivo") + " / " + ZH.klank("bibo"));
const zinLijst = (() => { const c = {}; vm.runInNewContext(read("js/zinnen-es.js"), c); return c.ZINNEN_ES || []; })();
check("zinherstel: zinnenlijst heeft ruim 1500 zinnen, allemaal tekst", zinLijst.length > 1500 && zinLijst.every((z) => typeof z === "string" && z.trim().length > 0), "aantal: " + zinLijst.length);
const zelfTest = zinLijst.filter((z, i) => i % 97 === 0).every((z) => ZH.corrigeer(z, zinLijst).tekst === z);
check("zinherstel: een zin uit de lijst blijft zichzelf", zelfTest);
check("zinherstel: correctie staat aan in de spraakinvoer", /var ZINHERSTEL_AAN = true/.test(read("js/app.js")) && /herstelZin\(text\)/.test(read("js/app.js")) && /herstelZin\(t\)/.test(read("js/app.js")));
check("zinherstel: script staat in index.html en offline-cache", read("index.html").includes("js/zin-herstel.js") && read("sw.js").includes("./js/zinnen-es.js"));

// 12. Melding voor het beginscherm: in elke taal de stappen voor Safari, Chrome (iPhone en Android) en andere browsers
{
  const sp = read("js/speels.js"), keys = ["title", "body", "safari", "chromeIOS", "chromeAndroid", "iosAnders", "androidAnders", "install", "ok"];
  const blok = sp.slice(sp.indexOf("var HOME_TXT = {"), sp.indexOf("function browserSoort"));
  const ht = (() => { const c = {}; vm.runInNewContext(blok.replace("var HOME_TXT", "HOME_TXT"), c); return c.HOME_TXT || {}; })();
  const mis = ["nl", "en", "de", "fr", "es"].filter((l) => !ht[l] || keys.some((k) => !ht[l][k]));
  check("melding beginscherm: alle talen hebben alle browserteksten", mis.length === 0, mis.join(","));
  check("melding beginscherm: taal van de telefoon en soort browser", /function meldingTaal\(/.test(sp) && /navigator\.languages/.test(sp) && /CriOS/.test(sp) && /HOME_TXT\[meldingTaal\(\)\]/.test(sp));
  check("app-taal: eerste keer de taal van de telefoon", /store\.get\("lang", null\) \|\| systeemTaal\(LANGS\)/.test(read("js/app.js")));
}

// Beginscherm: melding in de taal van de telefoon, met een stap per browser; ook voor de melding bij een nieuwe versie
{
  const sp = read("js/speels.js");
  const talen = ["nl", "en", "de", "fr", "es"];
  const blok = sp.slice(sp.indexOf("var HOME_TXT"), sp.indexOf("function browserSoort"));
  const ontbreekt = talen.filter((t) => !new RegExp("\\n    " + t + ": \\{[\\s\\S]*?safari:[\\s\\S]*?chromeIOS:[\\s\\S]*?chromeAndroid:[\\s\\S]*?opnieuw:[\\s\\S]*?verwijder:").test(blok));
  check("beginscherm: melding per browser in vijf talen, ook bij een nieuwe versie", ontbreekt.length === 0 && /window\.THUIS_MELDING = function/.test(sp) && /THUIS_MELDING\(\)/.test(read("js/app.js")), ontbreekt.join(","));
}
check("woordherstel: de oude woordcorrectie staat uit in de Spaanse app (maakte het Spaans slechter)", /var HEARD_FIX_AAN = false;/.test(read("js/app.js")) && /if \(!HEARD_FIX_AAN\) return text;/.test(read("js/app.js")));
// Getallen en tijden: de spraakherkenning schrijft cijfers ("om 12 uur"); "tot" is "hasta", niet "a"
{
  const ec = { console }; ec.window = ec; vm.createContext(ec);
  ["dict-wiki.js","dict-extra.js","dict-pdf.js","dict-pdf-nl.js","dict-pdf-en.js","dict-pdf-de.js","dict-pdf-fr.js","grammatica.js","nl-direct-pairs.js","extra-pairs.js","dict.js","nl-es.js","es-nl.js","zin-lex.js","zin-gender.js","zin-core.js"].forEach((f) => { if (fs.existsSync(path.join(root, "js", f))) vm.runInContext(read("js/" + f), ec); });
  const T1 = ec.NL_ES.translate("De bus vertrekt om 12 uur.", ec.DICTS.nl, "m"), T2 = ec.NL_ES.translate("Ik werk tot 5 uur.", ec.DICTS.nl, "m");
  check("getallen: 'om 12 uur' wordt 'a las doce'", T1 === "El autobús sale a las doce.", T1);
  check("getallen: 'tot 5 uur' wordt 'hasta las cinco'", T2 === "Trabajo hasta las cinco.", T2);
  const T3 = ec.ES_NL.translate("Tengo tres hijos.", ec.REVS.nl, () => null), T4 = ec.ES_NL.translate("El tren llega a las ocho.", ec.REVS.nl, () => null);
  check("hijos wordt 'kinderen'", T3 === "Ik heb drie kinderen.", T3);
  check("aankomen: 'aan' achteraan na de tijd", T4 === "De trein komt om acht uur aan.", T4);
  const N1 = ec.NL_ES.translate("Ik sta om 7 uur op.", ec.DICTS.nl, "m"), N2 = ec.NL_ES.translate("Ik ga om elf uur naar bed.", ec.DICTS.nl, "m"), N3 = ec.NL_ES.translate("Ik werk vroeg.", ec.DICTS.nl, "m");
  check("opstaan met kloktijd ertussen", N1 === "Me levanto a las siete.", N1);
  check("naar bed gaan = acostarse", N2 === "Me acuesto a las once.", N2);
  check("'vroeg' na een werkwoord is temprano, niet 'vragen'", N3 === "Trabajo temprano.", N3);
  const E1 = ec.ES_NL.translate("Me levanto a las siete.", ec.REVS.nl, () => null), E2 = ec.ES_NL.translate("Trabajo en casa.", ec.REVS.nl, () => null);
  check("wederkerend: 'me levanto' = 'ik sta op'", E1 === "Ik sta om zeven uur op.", E1);
  check("'en casa' = thuis", E2 === "Ik werk thuis.", E2);
  const NT = (z) => ec.NL_ES.translate(z, ec.DICTS.nl, "m");
  const R = [["Hij vroeg mij iets.", "Me preguntó algo."], ["Ik was moe.", "Estaba cansado."], ["Hij was niet ziek.", "Él no estaba enfermo."], ["Zij was moe.", "Ella estaba cansada."], ["De film was goed.", "La película era buena."], ["Het was koud.", "Hacía frío."], ["Ik stap de bus uit.", "Bajo del autobús."], ["Ik stap in de bus.", "Subo al autobús."], ["Ik stap de trein in.", "Subo al tren."], ["Stap je de bus uit?", "¿Bajas del autobús?"], ["Morgen stap ik in de bus.", "Mañana subo al autobús."], ["We stappen om 8 uur in de bus.", "Subimos al autobús a las ocho."], ["Ik stap niet uit de bus.", "No bajo del autobús."], ["Hij stapt niet in de auto.", "Él no sube al coche."], ["Zij stapt de tram uit.", "Ella baja del tranvía."], ["Ik ga de trap op.", "Subo las escaleras."], ["Ik loop de trap af.", "Bajo las escaleras."], ["Hij zegt dat ik kom.", "Dice que vengo."], ["Ik eet nooit vlees.", "Nunca como carne."]];
  for (const [nl, es] of R) { const r = NT(nl); check(`nl->es: "${nl}" -> "${es}"`, r === es, r); }
  if (typeof ZIN.translate === "function") {
    for (const [z, l, exp] of [["Subo la maleta.", "en", null], ["Bajo el volumen.", "de", null], ["Subo la escalera.", "de", "Ich gehe die Treppe hinauf."], ["Nunca subo a un taxi.", "fr", "Je ne monte jamais dans un taxi."]]) { const r = ZIN.translate(z, "es", l, "m"); check(`zin es->${l}: "${z}" -> ${exp}`, r === exp, r); }
  }
  if (typeof ZIN.compound === "function") {
    const volEs = (z, from) => { const one = (x) => from === "nl" ? (ec.NL_ES.translate(x, ec.DICTS.nl, "m") || null) : (ZIN.toEs(x, from, "m") || null);
      if (ZIN.compoundFirst(from, "es") && ZIN.hasSplit(z, from)) { const d = ZIN.compound(z, from, "es", one); if (d) return d; } return one(z) || (ZIN.hasSplit(z, from) ? ZIN.compound(z, from, "es", one) : null); };
    const volUit = (z, to) => { const one = (x) => to === "nl" ? (ec.ES_NL.translate(x, ec.REVS.nl, () => null) || ZIN.translate(x, "es", "nl", "m") || null) : (ZIN.fromEs(x, to) || null);
      if (ZIN.compoundFirst("es", to) && ZIN.hasSplit(z, "es")) { const d = ZIN.compound(z, "es", to, one); if (d) return d; } return one(z) || (ZIN.hasSplit(z, "es") ? ZIN.compound(z, "es", to, one) : null); };
    for (const [from, z, exp] of [["nl", "Ik stap uit de bus en loop naar huis.", "Bajo del autobús y camino a casa."], ["nl", "Als ik moe ben, ga ik naar bed.", "Cuando estoy cansado, me acuesto."], ["nl", "Ik eet brood en kaas.", "Como pan y queso."], ["nl", "Wil je koffie of thee?", "¿Quieres café o té?"], ["nl", "Ik werk thuis omdat ik ziek ben.", "Trabajo en casa porque estoy enfermo."], ["en", "I get off the bus and walk home.", "Bajo del autobús y camino a casa."], ["de", "Wenn ich müde bin, gehe ich ins Bett.", "Cuando estoy cansado, me acuesto."], ["fr", "Je suis fatigué mais je travaille.", "Estoy cansado pero trabajo."], ["nl", "Ik denk dat ik naar huis ga.", "Creo que voy a casa."], ["nl", "Ja, maar spreek langzaam, alsjeblieft.", "Sí, pero habla despacio, por favor."], ["de", "Ich glaube, dass ich müde bin.", "Creo que estoy cansado."]]) { const r = volEs(z, from); check(`delen ${from}->es: "${z}" -> "${exp}"`, r === exp, r); }
    for (const [to, z, exp] of [["nl", "Bajo del autobús y camino a casa.", "Ik stap uit de bus en loop naar huis."], ["en", "Me acuesto porque estoy cansado.", "I go to bed because I am tired."], ["de", "Cuando estoy cansado, me acuesto.", "Wenn ich müde bin, gehe ich ins Bett."], ["fr", "Como pan y queso.", "Je mange du pain et du fromage."], ["en", "Bajo del autobús.", "I get off the bus."], ["en", "Me pregunta algo.", "He asks me something."], ["en", "Subo la maleta.", null], ["nl", "Sí, pero habla despacio, por favor.", "Ja, maar spreek langzaam, alsjeblieft."], ["nl", "¡Ven aquí!", "Kom hier!"], ["nl", "Creo que yo no quiero aprender más español.", "Ik denk dat ik niet meer Spaans wil leren."], ["nl", "Ella no fue al mercado.", "Zij ging niet naar de markt."], ["nl", "No trabajo desde casa.", "Ik werk niet vanuit huis."], ["en", "¿Puedes repetirlo, por favor?", "Can you repeat it, please?"], ["en", "Lo veo.", null], ["de", "Creo que ella tiene hambre.", "Ich glaube, dass sie Hunger hat."], ["en", "Dice que viene mañana.", null]]) { const r = volUit(z, to); check(`delen es->${to}: "${z}" -> "${exp}"`, r === exp, r); }
  }
  // De gewone zinnen van de gebruiker (zelf vertaald en goedgekeurd): beide richtingen precies goed
  { const gz = JSON.parse(require("fs").readFileSync(require("path").join(__dirname, "gewone-zinnen.json"), "utf8")); const mis = [];
    for (const [nl, es] of gz) { const a = ec.NL_ES.translate(nl, ec.DICTS.nl, "m"), b = ec.ES_NL.translate(es, ec.REVS.nl, () => null) || ZIN.translate(es, "es", "nl", "m");
      if (a !== es && !(ZIN.compound && ZIN.compound(nl, "nl", "es", (x) => ec.NL_ES.translate(x, ec.DICTS.nl, "m")) === es)) mis.push(nl + " -> " + a);
      if (b !== nl && !(ZIN.compound && ZIN.compound(es, "es", "nl", (x) => ec.ES_NL.translate(x, ec.REVS.nl, () => null)) === nl)) mis.push(es + " -> " + b); }
    check(`gewone zinnen: ${gz.length * 2} vertalingen precies zoals goedgekeurd`, mis.length === 0, mis.slice(0, 3).join(" | ")); }
  for (const [nl, es] of [["We boeken een hotel.", "Reservamos un hotel."], ["Hij repareert de fiets.", "Arregla la bici."], ["Ik schilder de muur.", "Pinto la pared."], ["Ik leg de opdracht uit.", "Explico la tarea."], ["Ik maak het rapport af.", "Termino el informe."], ["Ik neem mijn paspoort mee.", "Llevo mi pasaporte."], ["Ik bel mijn moeder op zondag.", "Llamo a mi madre el domingo."], ["We boeken een hotel dicht bij het station.", "Reservamos un hotel cerca de la estación."], ["Ik maak me zorgen over mijn zoon.", "Me preocupo por mi hijo."], ["Wij verhuizen naar Utrecht.", "Nos mudamos a Utrecht."]]) { const r = ec.NL_ES.translate(nl, ec.DICTS.nl, "m"); check(`variant nl->es: "${nl}" -> "${es}"`, r === es, r); }
  for (const [es, nl] of [["Ella llama a su madre todos los días.", "Zij belt haar moeder elke dag."], ["Reservo un hotel.", "Ik boek een hotel."], ["Él arregla la bici.", "Hij repareert de fiets."], ["Terminamos el informe.", "We maken het rapport af."], ["Llevo mi pasaporte.", "Ik neem mijn paspoort mee."], ["Pedimos una pizza.", "We bestellen een pizza."], ["Me preocupo por mi hijo.", "Ik maak me zorgen over mijn zoon."], ["Los domingos como en casa.", "Ik eet thuis op zondag."], ["Pido ayuda.", null]]) { const r = ec.ES_NL.translate(es, ec.REVS.nl, () => null); check(`variant es->nl: "${es}" -> "${nl}"`, r === nl, r); }
  for (const [es, l, exp] of [["Él arregla la bici.", "en", "He fixes the bike."], ["Ella llama a su madre.", "fr", "Elle appelle sa mère."], ["Reservamos un hotel cerca de la estación.", "de", "Wir buchen ein Hotel in der Nähe vom Bahnhof."], ["Cogemos el autobús.", "de", "Wir nehmen den Bus."], ["Llama a su madre.", "en", null]]) { const r = ZIN.fromEs(es, l); check(`variant es->${l}: "${es}" -> "${exp}"`, r === exp, r); }
  const E3 = ec.ES_NL.translate("Me pregunta algo.", ec.REVS.nl, () => null);
  check("es->nl: 'Me pregunta algo.' -> 'Hij vraagt me iets.'", E3 === "Hij vraagt me iets." || E3 === "Hij/zij vraagt me iets.", E3);
}
console.log(failures === 0 ? "\nAlles geslaagd." : `\n${failures} controle(s) mislukt.`);
process.exit(failures === 0 ? 0 : 1);
