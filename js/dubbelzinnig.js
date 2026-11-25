// Woorden met meer gangbare betekenissen. De vertaling kiest er één; onder de vertaling staat een korte hint
// met de andere betekenissen in de doeltaal, met uitleg in de taal van de gebruiker.
// Per woord: bron (taal van de invoer), woord, en per betekenis het woord in elke taal (w) en een korte uitleg (u).
var DUBBELZINNIG = [
  { bron: "en", woord: "glasses", b: [
    { w: { nl: "bril", en: "glasses", de: "Brille", fr: "lunettes", es: "gafas" }, u: { nl: "om mee te zien", en: "to see with", de: "zum Sehen", fr: "pour voir", es: "para ver" } },
    { w: { nl: "glazen", en: "glasses", de: "Gläser", fr: "verres", es: "vasos" }, u: { nl: "om uit te drinken", en: "to drink from", de: "zum Trinken", fr: "pour boire", es: "para beber" } }] },
  { bron: "fr", woord: "carte", b: [
    { w: { nl: "menukaart", en: "menu", de: "Speisekarte", fr: "carte", es: "carta" }, u: { nl: "in een restaurant", en: "in a restaurant", de: "im Restaurant", fr: "au restaurant", es: "en un restaurante" } },
    { w: { nl: "plattegrond", en: "map", de: "Karte", fr: "carte", es: "mapa" }, u: { nl: "van een stad of land", en: "of a town or country", de: "einer Stadt oder eines Landes", fr: "d'une ville ou d'un pays", es: "de una ciudad o un país" } },
    { w: { nl: "pas", en: "card", de: "Karte", fr: "carte", es: "tarjeta" }, u: { nl: "om mee te betalen", en: "to pay with", de: "zum Bezahlen", fr: "pour payer", es: "para pagar" } }] },
  { bron: "fr", woord: "serviette", b: [
    { w: { nl: "handdoek", en: "towel", de: "Handtuch", fr: "serviette", es: "toalla" }, u: { nl: "om je af te drogen", en: "to dry yourself", de: "zum Abtrocknen", fr: "pour s'essuyer", es: "para secarse" } },
    { w: { nl: "servet", en: "napkin", de: "Serviette", fr: "serviette", es: "servilleta" }, u: { nl: "aan tafel", en: "at the table", de: "am Tisch", fr: "à table", es: "en la mesa" } }] },
  { bron: "es", woord: "entrada", b: [
    { w: { nl: "ingang", en: "entrance", de: "Eingang", fr: "entrée", es: "entrada" }, u: { nl: "de deur naar binnen", en: "the way in", de: "der Weg hinein", fr: "la porte pour entrer", es: "la puerta para entrar" } },
    { w: { nl: "toegangskaartje", en: "ticket", de: "Eintrittskarte", fr: "billet", es: "entrada" }, u: { nl: "voor een concert of museum", en: "for a concert or museum", de: "für ein Konzert oder Museum", fr: "pour un concert ou un musée", es: "para un concierto o un museo" } }] },
  { bron: "es", woord: "carta", b: [
    { w: { nl: "menukaart", en: "menu", de: "Speisekarte", fr: "carte", es: "carta" }, u: { nl: "in een restaurant", en: "in a restaurant", de: "im Restaurant", fr: "au restaurant", es: "en un restaurante" } },
    { w: { nl: "brief", en: "letter", de: "Brief", fr: "lettre", es: "carta" }, u: { nl: "om te versturen", en: "to send", de: "zum Verschicken", fr: "à envoyer", es: "para enviar" } }] },
  { bron: "nl", woord: "kaart", b: [
    { w: { nl: "plattegrond", en: "map", de: "Karte", fr: "plan", es: "mapa" }, u: { nl: "van een stad of land", en: "of a town or country", de: "einer Stadt oder eines Landes", fr: "d'une ville ou d'un pays", es: "de una ciudad o un país" } },
    { w: { nl: "menukaart", en: "menu", de: "Speisekarte", fr: "carte", es: "carta" }, u: { nl: "in een restaurant", en: "in a restaurant", de: "im Restaurant", fr: "au restaurant", es: "en un restaurante" } },
    { w: { nl: "pas", en: "card", de: "Karte", fr: "carte", es: "tarjeta" }, u: { nl: "om mee te betalen", en: "to pay with", de: "zum Bezahlen", fr: "pour payer", es: "para pagar" } }] },
  { bron: "de", woord: "karte", b: [
    { w: { nl: "kaartje", en: "ticket", de: "Karte", fr: "billet", es: "billete" }, u: { nl: "voor de trein of bus", en: "for the train or bus", de: "für Zug oder Bus", fr: "pour le train ou le bus", es: "para el tren o el autobús" } },
    { w: { nl: "plattegrond", en: "map", de: "Karte", fr: "plan", es: "mapa" }, u: { nl: "van een stad of land", en: "of a town or country", de: "einer Stadt oder eines Landes", fr: "d'une ville ou d'un pays", es: "de una ciudad o un país" } },
    { w: { nl: "menukaart", en: "menu", de: "Speisekarte", fr: "carte", es: "carta" }, u: { nl: "in een restaurant", en: "in a restaurant", de: "im Restaurant", fr: "au restaurant", es: "en un restaurante" } },
    { w: { nl: "pas", en: "card", de: "Karte", fr: "carte", es: "tarjeta" }, u: { nl: "om mee te betalen", en: "to pay with", de: "zum Bezahlen", fr: "pour payer", es: "para pagar" } }] },
  { bron: "nl", woord: "bank", b: [
    { w: { nl: "bank", en: "bank", de: "Bank", fr: "banque", es: "banco" }, u: { nl: "voor geld", en: "for money", de: "für Geld", fr: "pour l'argent", es: "para el dinero" } },
    { w: { nl: "bank", en: "bench", de: "Bank", fr: "banc", es: "banco" }, u: { nl: "om op te zitten", en: "to sit on", de: "zum Sitzen", fr: "pour s'asseoir", es: "para sentarse" } },
    { w: { nl: "bank", en: "sofa", de: "Sofa", fr: "canapé", es: "sofá" }, u: { nl: "in de woonkamer", en: "in the living room", de: "im Wohnzimmer", fr: "au salon", es: "en el salón" } }] },
  { bron: "nl", woord: "rekening", b: [
    { w: { nl: "rekening", en: "bill", de: "Rechnung", fr: "addition", es: "cuenta" }, u: { nl: "om te betalen", en: "to pay", de: "zum Bezahlen", fr: "à payer", es: "para pagar" } },
    { w: { nl: "rekening", en: "account", de: "Konto", fr: "compte", es: "cuenta" }, u: { nl: "bij de bank", en: "at the bank", de: "bei der Bank", fr: "à la banque", es: "en el banco" } }] },
  { bron: "en", woord: "bill", b: [
    { w: { nl: "rekening", en: "bill", de: "Rechnung", fr: "addition", es: "cuenta" }, u: { nl: "om te betalen", en: "to pay", de: "zum Bezahlen", fr: "à payer", es: "para pagar" } },
    { w: { nl: "briefje", en: "note", de: "Geldschein", fr: "billet", es: "billete" }, u: { nl: "papiergeld", en: "paper money", de: "Papiergeld", fr: "argent en papier", es: "dinero en papel" } }] }
];

// Hints voor de woorden in tekst (in taal bron): [{ woord, opties: "Brille (om mee te zien) · Gläser (om uit te drinken)" }]
// Alleen als de betekenissen in de doeltaal verschillen; uitleg in de taal van de gebruiker (ui).
function dubbelzinnigInTekst(tekst, bron, doel, ui) {
  var woorden = String(tekst || "").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
  var uit = [];
  DUBBELZINNIG.forEach(function (d) {
    if (d.bron !== bron || woorden.indexOf(d.woord) < 0) return;
    // zelfde woord in de doeltaal: uitleg samenvoegen ("Karte (van een stad / om mee te betalen)")
    var volg = [], uitleg = {};
    d.b.forEach(function (b) { var w = b.w[doel]; if (!uitleg[w]) { uitleg[w] = []; volg.push(w); } uitleg[w].push(b.u[ui] || b.u.en); });
    if (volg.length < 2) return;   // in de doeltaal één woord: geen hint nodig
    uit.push({ woord: d.woord, opties: volg.map(function (w) { return w + " (" + uitleg[w].join(" / ") + ")"; }).join(" · ") });
  });
  return uit;
}

if (typeof module !== "undefined") module.exports = { DUBBELZINNIG: DUBBELZINNIG, dubbelzinnigInTekst: dubbelzinnigInTekst };
