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

console.log(failures === 0 ? "\nAlles geslaagd." : `\n${failures} controle(s) mislukt.`);
process.exit(failures === 0 ? 0 : 1);
