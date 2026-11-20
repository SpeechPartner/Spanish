// Valse vrienden per brontaal: woord lijkt op een woord in een andere taal, maar betekent iets anders.
// Bron: lijst valse vrienden (CSV). Per rij een status: "bron (csv: web)" of een beoordeling tegen de PDF-woordenlijsten en kaikki.
// Eigen kennis-rijen die niet bevestigd konden worden: "deels bevestigd" (één van de twee talen is bevestigd).
var VALSE_VRIENDEN = [
 {
  "bron": "nl",
  "woord": "slim",
  "betekenis": "slim / knap",
  "lijkt_op": "schlimm",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "erg / vervelend",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "net",
  "betekenis": "zojuist / pas",
  "lijkt_op": "nett",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "aardig",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "klaar",
  "betekenis": "gereed / af",
  "lijkt_op": "klar",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "duidelijk",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "durven",
  "betekenis": "wagen",
  "lijkt_op": "dürfen",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "mogen",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "zullen",
  "betekenis": "zullen (toekomst)",
  "lijkt_op": "sollen",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "moeten",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "bellen",
  "betekenis": "telefoneren",
  "lijkt_op": "bellen",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "blaffen",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "mist",
  "betekenis": "nevel",
  "lijkt_op": "Mist",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "mest",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "ziel",
  "betekenis": "ziel",
  "lijkt_op": "Ziel",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "doel",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "doos",
  "betekenis": "doos (karton)",
  "lijkt_op": "Dose",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "blik",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "enkel",
  "betekenis": "enkel (lichaamsdeel)",
  "lijkt_op": "Enkel",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "kleinzoon",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "rente",
  "betekenis": "rente (interest)",
  "lijkt_op": "Rente",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "pensioen",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "baan",
  "betekenis": "baan (werk / weg)",
  "lijkt_op": "Bahn",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "spoor",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "winkel",
  "betekenis": "winkel (zaak)",
  "lijkt_op": "Winkel",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "hoek",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "proeven",
  "betekenis": "proeven (eten)",
  "lijkt_op": "prüfen",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "controleren",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "rijden",
  "betekenis": "rijden (met auto)",
  "lijkt_op": "reiten",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "paardrijden",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "bezorgen",
  "betekenis": "bezorgen (afleveren)",
  "lijkt_op": "besorgen",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "regelen / kopen",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "nl",
  "woord": "aardig",
  "betekenis": "aardig (leuk)",
  "lijkt_op": "artig",
  "taal_lijkt_op": "de",
  "betekenis_lijkt_op": "brav / netjes",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "en",
  "woord": "actual",
  "betekenis": "werkelijk / feitelijk",
  "lijkt_op": "actueel",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "huidig / up-to-date",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "en",
  "woord": "eventually",
  "betekenis": "uiteindelijk",
  "lijkt_op": "eventueel",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "mogelijk / desnoods",
  "bron_info": "eigen kennis",
  "status": "bevestigd"
 },
 {
  "bron": "en",
  "woord": "sympathetic",
  "betekenis": "meelevend / begripvol",
  "lijkt_op": "sympathiek",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "aardig / sympathiek",
  "bron_info": "eigen kennis",
  "status": "bevestigd"
 },
 {
  "bron": "en",
  "woord": "gift",
  "betekenis": "geschenk / cadeau",
  "lijkt_op": "gift",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "gif",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "en",
  "woord": "sensible",
  "betekenis": "verstandig / redelijk",
  "lijkt_op": "sensibel",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "gevoelig",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "en",
  "woord": "college",
  "betekenis": "universiteit / hogeschool",
  "lijkt_op": "college",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "hoorcollege",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "en",
  "woord": "magazine",
  "betekenis": "tijdschrift",
  "lijkt_op": "magazijn",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "opslagruimte / warenhuis",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "en",
  "woord": "brave",
  "betekenis": "dapper / moedig",
  "lijkt_op": "braaf",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "gehoorzaam / netjes",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "en",
  "woord": "rare",
  "betekenis": "zeldzaam",
  "lijkt_op": "raar",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "vreemd",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "de",
  "woord": "Rat",
  "betekenis": "raad / advies",
  "lijkt_op": "rat",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "knaagdier",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "de",
  "woord": "Art",
  "betekenis": "soort / manier",
  "lijkt_op": "aard",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "karakter / natuur",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "de",
  "woord": "Handy",
  "betekenis": "mobiele telefoon",
  "lijkt_op": "handig",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "praktisch",
  "bron_info": "eigen kennis",
  "status": "bevestigd"
 },
 {
  "bron": "de",
  "woord": "Rock",
  "betekenis": "jasje / rok",
  "lijkt_op": "rock",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "rockmuziek",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "de",
  "woord": "artig",
  "betekenis": "brav / netjes (vooral kinderen)",
  "lijkt_op": "aardig",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "vriendelijk",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "de",
  "woord": "bekommen",
  "betekenis": "krijgen / ontvangen",
  "lijkt_op": "bekomen",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "herstellen van",
  "bron_info": "eigen kennis",
  "status": "bevestigd"
 },
 {
  "bron": "de",
  "woord": "Mist",
  "betekenis": "mest",
  "lijkt_op": "mist",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "nevel",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "es",
  "woord": "embarazada",
  "betekenis": "zwanger",
  "lijkt_op": "embarrassed",
  "taal_lijkt_op": "en",
  "betekenis_lijkt_op": "beschaamd",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "es",
  "woord": "actual",
  "betekenis": "huidig / momenteel",
  "lijkt_op": "actueel",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "up-to-date",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "es",
  "woord": "actualmente",
  "betekenis": "momenteel",
  "lijkt_op": "actually",
  "taal_lijkt_op": "en",
  "betekenis_lijkt_op": "eigenlijk",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "es",
  "woord": "éxito",
  "betekenis": "succes",
  "lijkt_op": "exit",
  "taal_lijkt_op": "en",
  "betekenis_lijkt_op": "uitgang",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "es",
  "woord": "asistir",
  "betekenis": "aanwezig zijn / bijwonen",
  "lijkt_op": "assisteren",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "helpen",
  "bron_info": "eigen kennis",
  "status": "bevestigd"
 },
 {
  "bron": "es",
  "woord": "soportar",
  "betekenis": "verdragen / uithouden",
  "lijkt_op": "steunen",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "ondersteunen",
  "bron_info": "eigen kennis",
  "status": "bevestigd"
 },
 {
  "bron": "es",
  "woord": "librería",
  "betekenis": "boekhandel",
  "lijkt_op": "bibliotheek",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "bibliotheek",
  "bron_info": "web",
  "status": "bron (csv: web)"
 },
 {
  "bron": "es",
  "woord": "colegio",
  "betekenis": "school (basisschool of middelbare school)",
  "lijkt_op": "college",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "hoorcollege / universiteit",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "fr",
  "woord": "actuellement",
  "betekenis": "momenteel / op dit moment",
  "lijkt_op": "actueel",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "up-to-date",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "fr",
  "woord": "librairie",
  "betekenis": "boekhandel",
  "lijkt_op": "bibliotheek",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "bibliotheek",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "fr",
  "woord": "assister",
  "betekenis": "bijwonen",
  "lijkt_op": "assisteren",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "helpen",
  "bron_info": "eigen kennis",
  "status": "bevestigd"
 },
 {
  "bron": "fr",
  "woord": "rester",
  "betekenis": "blijven",
  "lijkt_op": "resteren",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "overblijven",
  "bron_info": "eigen kennis",
  "status": "bevestigd"
 },
 {
  "bron": "fr",
  "woord": "formidable",
  "betekenis": "geweldig / fantastisch",
  "lijkt_op": "formidabel",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "ontzagwekkend / indrukwekkend",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "fr",
  "woord": "place",
  "betekenis": "plein (openbaar plein)",
  "lijkt_op": "plaats",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "plek / positie",
  "bron_info": "eigen kennis",
  "status": "deels bevestigd"
 },
 {
  "bron": "fr",
  "woord": "pain",
  "betekenis": "brood",
  "lijkt_op": "pijn",
  "taal_lijkt_op": "nl",
  "betekenis_lijkt_op": "pijn",
  "bron_info": "eigen kennis",
  "status": "bevestigd"
 }
];

// Waarschuwing: woorden in de brontekst die op een woord in de doeltaal lijken (dus een kans op een verkeerde vertaling).
// Alleen als de doeltaal de taal is van het woord waar het op lijkt. Geeft een lijst; leeg = geen waarschuwing nodig.
function valseVriendenWaarschuwing(tekst, bronTaal, doelTaal) {
  var woorden = String(tekst || "").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
  var uit = [];
  VALSE_VRIENDEN.forEach(function (v) {
    if (v.bron === bronTaal && v.taal_lijkt_op === doelTaal && woorden.indexOf(v.woord.toLowerCase()) >= 0) uit.push(v);
  });
  return uit;
}

// Voor de app: valse vrienden van de woorden in de invoer. Alleen als het lijkwoord in de taal van de app zelf zit
// (doelTaal = de taal die de app leert, bv. Duits in de Duitse app). Alleen rijen met een bevestigde of CSV-bron.
function valseVriendenInTekst(tekst, bronTaal, doelTaal) {
  var woorden = String(tekst || "").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean);
  return VALSE_VRIENDEN.filter(function (v) {
    return v.bron === bronTaal && v.taal_lijkt_op === doelTaal && v.status !== "deels bevestigd" && woorden.indexOf(v.woord.toLowerCase()) >= 0;
  });
}

function valseVriendenVoor(woord, bronTaal) {
  var w = String(woord || "").toLowerCase();
  return VALSE_VRIENDEN.filter(function (v) { return v.bron === bronTaal && v.woord.toLowerCase() === w; });
}

if (typeof module !== "undefined") module.exports = { VALSE_VRIENDEN: VALSE_VRIENDEN, valseVriendenVoor: valseVriendenVoor, valseVriendenWaarschuwing: valseVriendenWaarschuwing, valseVriendenInTekst: valseVriendenInTekst };
