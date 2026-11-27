// Controle van de noodfunctie (js/nood.js): zinnen uit het situatieboek, de extra zinnen, de noodnummers per land,
// de gespreksvolgorde, de teksten in alle talen en de overdrachtskaart.
// Los: node tests/test-nood.js   ·   Wordt ook aangeroepen door tests/test-apps.js.
const fs = require("fs"), path = require("path"), vm = require("vm");
function run() {
  const ROOT = path.join(__dirname, "..");
  const ctx = { console };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js", "nood.js"), "utf8") + "\n;this.NOOD = NOOD;", ctx);
  const N = ctx.NOOD, T5 = ["nl", "en", "de", "fr", "es"];
  let fail = 0;
  const check = (naam, ok, info) => { console.log((ok ? "ok   " : "FOUT ") + "nood: " + naam + (ok || !info ? "" : "  (" + info + ")")); if (!ok) fail++; };
  const vijf = (o) => o && T5.every((l) => typeof o[l] === "string" && o[l].trim().length > 0);

  // 1. De zinnen komen letterlijk uit het situatieboek; elke zin heeft één extra zin in alle vijf talen
  const boek = JSON.parse(fs.readFileSync(path.join(ROOT, "situatieboek.json"), "utf8"));
  const tekst = {};
  boek.zinnen.forEach((z) => { if (!z.variant) (tekst[z.zin_id] = tekst[z.zin_id] || {})[z.taal] = z.tekst; });
  // Bewuste afwijking (veiligheid) staat in z.afwijking: daar moet het situatieboek de oude tekst hebben
  const afwijk = N.zinnen.filter((z) => !tekst[z.id] || T5.some((l) => tekst[z.id][l] !== ((z.afwijking && z.afwijking[l]) || z.z[l]))).map((z) => z.id);
  check("zinnen komen letterlijk uit het situatieboek (" + N.zinnen.length + ")", N.zinnen.length >= 10 && afwijk.length === 0, afwijk.join(", "));
  const sprekerJij = N.zinnen.filter((z) => !boek.zinnen.some((b) => b.zin_id === z.id && b.spreker === "jij")).map((z) => z.id);
  check("het zijn zinnen die jij zelf zegt", sprekerJij.length === 0, sprekerJij.join(", "));
  check("elke zin heeft een extra zin in vijf talen", N.zinnen.every((z) => vijf(z.z) && vijf(z.x)));
  const geenPunt = [];
  N.zinnen.forEach((z) => T5.forEach((l) => { [z.z[l], z.x[l]].forEach((s) => { if (!/[.!?]$/.test(s)) geenPunt.push(l + ": " + s); }); }));
  check("elke zin eindigt met een leesteken", geenPunt.length === 0, geenPunt.slice(0, 3).join(" | "));
  const frSpatie = [];
  N.zinnen.forEach((z) => [z.z.fr, z.x.fr].forEach((s) => { if (/\S[?!]$/.test(s)) frSpatie.push(s); }));
  check("Frans: spatie voor ? en !", frSpatie.length === 0, frSpatie.join(" | "));
  const cats = N.cats.map((c) => c.id);
  check("elke categorie heeft zinnen en een naam in vijf talen", N.cats.every((c) => vijf(c.n) && N.zinnen.some((z) => z.cat === c.id)) && N.zinnen.every((z) => cats.indexOf(z.cat) >= 0));
  const dubbel = N.zinnen.map((z) => z.x.nl).filter((x, i, a) => a.indexOf(x) !== i);
  check("geen dubbele extra zinnen", dubbel.length === 0, dubbel.join(" | "));
  // Spaans met een vrouwelijke vorm waar de zin over de spreker gaat (mareado/mareada, alérgico/alérgica)
  const genderEs = N.zinnen.filter((z) => /\b(mareado|alérgico|cansado|enfermo|herido)\b/.test(z.z.es) && !(z.f && z.f.es));
  check("Spaans: vrouwelijke vorm aanwezig", genderEs.length === 0, genderEs.map((z) => z.id).join(", "));

  // 2. Noodnummers per land: vast nagekeken tegen de bronnen (zie NOOD.bronnen)
  const VERWACHT = {
    nl: { spoed: ["112"], algemeen: ["0900-8844"], anoniem: ["0800-7000"], hulp: ["113", "0800-0113"] },
    es: { spoed: ["112"], algemeen: ["091", "062", "902 102 112"], anoniem: [], hulp: ["024"] },
    de: { spoed: ["112", "110"], algemeen: ["116117"], anoniem: [], hulp: ["0800 111 0 111", "0800 111 0 222"] },
    fr: { spoed: ["112", "15", "17", "18", "114"], algemeen: ["15"], anoniem: [], hulp: ["3114"] },
    en: { spoed: ["999", "112"], algemeen: ["101", "111"], anoniem: ["0800 555 111"], hulp: ["116 123"] }
  };
  Object.keys(VERWACHT).forEach((d) => {
    const L = N.land[d], V = VERWACHT[d];
    check(d + ": land met kop in vijf talen", !!L && vijf(L.kop));
    if (!L) return;
    ["spoed", "algemeen", "anoniem"].forEach((s) => {
      const nrs = (L[s] || []).map((x) => x.nr);
      check(d + ": " + s + " = " + (V[s].join(", ") || "geen"), JSON.stringify(nrs) === JSON.stringify(V[s]), "kreeg " + nrs.join(", "));
      check(d + ": " + s + " heeft namen en uitleg in vijf talen", (L[s] || []).every((x) => x.naam && vijf(x.d)));
      if (!nrs.length) check(d + ": " + s + " zonder nummer heeft een uitleg in vijf talen", vijf(L[s + "Noot"]));
    });
    const h = [L.hulp.nr].concat(L.hulp.alt ? [L.hulp.alt] : []);
    check(d + ": lijn voor nare gedachten = " + V.hulp.join(", "), JSON.stringify(h) === JSON.stringify(V.hulp) && !!L.hulp.naam, "kreeg " + h.join(", "));
    const alle = ["spoed", "algemeen", "anoniem"].reduce((a, s) => a.concat((L[s] || []).map((x) => x.nr)), h);
    check(d + ": nummers bevatten alleen cijfers, spaties, streepjes of +", alle.every((n) => /^\+?[\d][\d \-]*$/.test(n)));
    // Gespreksvolgorde: Engels en de taal van het land; Engelse app: Engels en de taal van de gebruiker
    const sc = N.script[d] || [];
    check(d + ": gespreksvolgorde met minstens 5 stappen", sc.length >= 5);
    if (d === "en") check(d + ": vertaling van elke stap in de vier gebruikerstalen", sc.length === N.scriptEnUi.length && N.scriptEnUi.every((o) => ["nl", "de", "fr", "es"].every((l) => o[l])));
    else check(d + ": elke stap in het Engels en in de taal van het land", sc.every((x) => x[0] && x[1]));
    check(d + ": gespreksvolgorde eindigt met 'blijf aan de lijn / niet ophangen'", sc.some((x) => /hang up|stay on the line/i.test(x[0])));
  });
  check("er zijn precies vijf landen", Object.keys(N.land).sort().join() === "de,en,es,fr,nl");
  check("korte belzinnen in vijf talen", N.scriptAlgemeen.every(vijf) && vijf(N.scriptAnoniem));

  // 3. Teksten van de interface: alles in vijf talen, en de plaatshouders kloppen
  const uiMis = Object.keys(N.ui).filter((k) => !vijf(N.ui[k]));
  check("alle teksten in vijf talen (" + Object.keys(N.ui).length + ")", uiMis.length === 0, uiMis.join(", "));
  const ph = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join();
  const phMis = Object.keys(N.ui).filter((k) => T5.some((l) => ph(N.ui[k][l]) !== ph(N.ui[k].nl)));
  check("plaatshouders gelijk in alle talen", phMis.length === 0, phMis.join(", "));
  check("lijsten van het formulier in vijf talen", [N.talen, N.allergie, N.aandoening, N.relatie].every((a) => a.every((x) => vijf(x.l) && (x.o === undefined || vijf(x.o)))));
  check("nog niet echt bellen (pas bij de publieke release aanzetten)", N.echtBellen === false);

  // 4. Overdrachtskaart: alleen wat is ingevuld, aangepast aan de antwoorden
  check("leeg formulier geeft een lege kaart", N.overdracht({}, "es", "nl", false).length === 0);
  const vol = { naam: "Ana", geboren: "1990-03-05", taal: "nl", bloed: "0-", allergie: "ja", allergieen: ["noten", "penicilline"], adrenaline: true,
    medicijn: "ja", medicijnen: "Metformine", aandoening: "ja", aandoeningen: ["diabetes"], zwanger: "ja", weken: "20",
    contactNaam: "Jan", relatie: "partnerm", contactTel: "+31 6 1234", verzekeraar: "VGZ", polis: "99", ehic: true };
  const REGELS = 14;
  T5.forEach((d) => {
    const r = N.overdracht(vol, d, d === "nl" ? "en" : "nl", true);
    check(d + ": volledige kaart heeft " + REGELS + " regels", r.length === REGELS, "kreeg " + r.length);
    check(d + ": geen open plaatshouders", r.every((x) => !/\{|\}|undefined|null/.test(x.o + x.u)));
  });
  const neeEs = N.overdracht({ allergie: "nee", medicijn: "nee", aandoening: "nee", zwanger: "nee" }, "es", "nl", true).map((x) => x.o);
  check("'nee' geeft de ontkennende zinnen", neeEs.indexOf("No tengo alergias conocidas.") >= 0 && neeEs.indexOf("No tomo ningún medicamento.") >= 0 && neeEs.indexOf("No tengo ninguna enfermedad conocida.") >= 0 && neeEs.indexOf("No estoy embarazada.") >= 0, neeEs.join(" | "));
  const onbekend = N.overdracht({ naam: "Ana", allergie: "", zwanger: "" }, "de", "nl", false).map((x) => x.o).join(" ");
  check("niet ingevuld = niets over allergie of zwangerschap", !/Allergi|schwanger/.test(onbekend), onbekend);
  const geenAdr = N.overdracht({ allergie: "nee", adrenaline: true }, "en", "nl", false).map((x) => x.o).join(" ");
  check("adrenalinepen alleen bij allergie 'ja'", !/adrenaline/.test(geenAdr), geenAdr);
  const fr = N.overdracht(vol, "fr", "nl", true).map((x) => x.o);
  check("Frans: 'née' voor een vrouw, 'né' voor een man", fr.indexOf("Je suis née le 5 mars 1990.") >= 0 && N.overdracht(vol, "fr", "nl", false).some((x) => x.o === "Je suis né le 5 mars 1990."), fr[2]);
  check("Frans: allergie met voorzetsel", fr.indexOf("Je suis allergique aux fruits à coque et à la pénicilline.") >= 0);
  const es = N.overdracht(vol, "es", "nl", true).map((x) => x.o);
  check("Spaans: allergie, bloedgroep, zwangerschap", es.indexOf("Tengo alergia a los frutos secos y a la penicilina.") >= 0 && es.indexOf("Mi grupo sanguíneo es 0 negativo.") >= 0 && es.indexOf("Estoy embarazada de 20 semanas.") >= 0, es.join(" | "));
  const en = N.overdracht(vol, "en", "nl", true).map((x) => x.o);
  check("Engels: bloedgroep met O, datum", en.indexOf("My blood type is O negative.") >= 0 && en.indexOf("I was born on 5 March 1990.") >= 0, en.join(" | "));
  const de = N.overdracht(vol, "de", "nl", true).map((x) => x.o);
  check("Duits: datum en zwangerschap", de.indexOf("Ich bin am 5. März 1990 geboren.") >= 0 && de.indexOf("Ich bin in der 20. Woche schwanger.") >= 0, de.join(" | "));
  const u = N.overdracht(vol, "es", "de", true);
  check("onder elke zin de vertaling in de taal van de gebruiker", u.every((x) => x.u && x.u !== x.o) && u[1].u === "Ich heiße Ana.", u[1].u);
  check("ongeldige datum wordt overgeslagen", N.overdracht({ geboren: "1990-13-40" }, "nl", "en", false).length === 0);
  // 5. Vaste, nagekeken vakwoorden (bron: EFSA/sante.fr, NHS, EMA/ANSM, AMBOSS/PZ, AEPED, Apotheken Umschau)
  const alles = (l) => JSON.stringify(N.zinnen.map((z) => [z.z[l], z.x[l]])) + JSON.stringify(N.allergie.map((a) => a.o[l] + a.l[l])) + JSON.stringify(N.ui.adrenaline[l]) + N.overdracht({ allergie: "ja", allergieen: ["noten"], adrenaline: true }, l, "nl", false).map((x) => x.o).join(" ");
  check("Frans: 'fruits à coque' en nergens 'aux noix'", /fruits à coque/.test(alles("fr")) && !/aux noix|des noix dans/.test(alles("fr")));
  check("adrenaline: officiële termen", /adrenaline auto-injector/.test(alles("en")) && /Adrenalin-Autoinjektor/.test(alles("de")) && /stylo auto-injecteur d'adrénaline/.test(alles("fr")) && /autoinyector de adrenalina/.test(alles("es")) && /adrenalinepen/.test(alles("nl")));
  check("Duits: 'Bitte rufen Sie den Notruf.'", N.zinnen.some((z) => z.x.de === "Bitte rufen Sie den Notruf."));
  // 6. Nood-stand: uitgang naar Info in vijf talen, kale vormgeving in de css, uitleg in de hulptekst (alle talen + Spaans)
  check("uitgang 'Terug naar de app (Info)' in vijf talen", vijf(N.ui.naarInfo) && T5.every((l) => /\(Info\)$/.test(N.ui.naarInfo[l])));
  const lees = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
  const css = lees("css/speels.css"), app = lees("js/app.js"), inh = lees("js/content.js"), esUi = lees("js/i18n-es.js");
  check("css: nood-stand verbergt banner, balk en dock en zet effecten uit", /body\.nood-modus header\.top/.test(css) && /body\.nood-modus #dock/.test(css) && /box-shadow: none !important; text-shadow: none !important; animation: none !important/.test(css));
  check("app: nood-stand haalt speels en thema weg", /classList\.toggle\("nood-modus", noodStand\)/.test(app) && /classList\.toggle\("speels", !noodStand\)/.test(app) && /eff === "cafe" && !noodStand/.test(app));
  const regel = "Op de pagina Nood zie je alleen wat je in nood nodig hebt";
  const telIn = (txt) => txt.split(regel).length - 1;
  check("hulptekst over de nood-stand in Info (HELP_GUIDE) en in de korte uitleg (TAB_GUIDE)", telIn(inh) === 1 && telIn(app) === 1 && /On the Emergency page you only see/.test(inh) && /Auf der Seite Notfall siehst du nur/.test(inh) && /Sur la page Urgence, tu ne vois que/.test(inh));
  check("hulptekst over de nood-stand ook in het Spaans", /En la página Emergencia solo ves lo que necesitas/.test(esUi));
  return fail;
}
module.exports = run;
if (require.main === module) { const f = run(); console.log(f ? "\n" + f + " controle(s) mislukt." : "\nAlles geslaagd."); process.exit(f ? 1 : 0); }
