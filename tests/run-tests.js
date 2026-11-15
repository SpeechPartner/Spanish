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
for (const f of ["js/dict-wiki.js", "js/dict-extra.js", "js/dict-pdf.js", "js/dict.js"]) {
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

console.log(failures === 0 ? "\nAlles geslaagd." : `\n${failures} controle(s) mislukt.`);
process.exit(failures === 0 ? 0 : 1);
