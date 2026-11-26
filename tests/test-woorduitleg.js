// Controle "Woord voor woord": elk woord van elke Spaanse zin in de app moet een betekenis hebben (geen "?").
// Gebruik: node tests/test-woorduitleg.js
const fs = require("fs"), vm = require("vm"), path = require("path");
const dir = path.join(__dirname, "..");
const files = ["i18n.js", "content.js", "dict-wiki.js", "dict-extra.js", "dict-pdf.js", "dict-pdf-nl.js", "dict-pdf-en.js", "dict-pdf-de.js", "dict-pdf-fr.js", "basis.js", "grammatica.js", "nl-direct-pairs.js", "extra-pairs.js", "dict.js", "nl-es.js", "es-nl.js", "zin-lex.js", "zin-gender.js", "woorden-alledaags.js", "zin-core.js", "zin-out.js", "zin-in.js", "woorduitleg.js"];
const ctx = { console, window: {}, navigator: { language: "nl" }, localStorage: { getItem() { return null; }, setItem() {} }, document: { documentElement: { lang: "nl" } } };
ctx.self = ctx.window; vm.createContext(ctx);
for (const f of files) vm.runInContext(fs.readFileSync(path.join(dir, "js", f), "utf8"), ctx, { filename: f });
const src = ["content.js", "zinnen-es.js", "grammatica.js"].map((f) => fs.readFileSync(path.join(dir, "js", f), "utf8")).join("\n");
const zinnen = [...new Set([...src.matchAll(/(?:es: |p\()"([^"]+)"/g)].map((m) => m[1]).concat([...fs.readFileSync(path.join(dir, "js/zinnen-es.js"), "utf8").matchAll(/^"([^"]+)",?$/gm)].map((m) => m[1])))]
  .filter((s) => /\s/.test(s) && /[¿¡ñáéíóú]|\b(el|la|que|de|es|y|no|me|te)\b/.test(s));   // alleen Spaanse zinnen
const G = vm.runInContext("GLOSS", ctx);
let fout = 0;
for (const t of ["nl", "en", "de", "fr"]) {
  const mis = {};
  for (const z of zinnen) for (const x of ctx.WOORDUITLEG.zin(z, t, G)) if (!x.m) mis[x.w] = z;
  const n = Object.keys(mis).length;
  if (n) { fout += n; console.log("FOUT", t, n, "woorden zonder betekenis:", Object.entries(mis).slice(0, 10).map(([w, z]) => w + " (" + z + ")").join("; ")); }
}
console.log("Gecontroleerd:", zinnen.length, "zinnen in 4 talen");
console.log(fout ? fout + " fouten." : "Alles geslaagd.");
process.exit(fout ? 1 : 0);
