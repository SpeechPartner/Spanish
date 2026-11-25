// Woordenschat voor de zinsmodules Engels, Duits en Frans (zin.js).
// Elk woord staat hier met de vormen die de grammatica nodig heeft: geslacht, meervoud, vervoegingen.
// Woorden die hier niet staan, haalt zin.js uit de woordenlijsten (DICTS/REVS) met het geslacht uit de PDF's.
var ZIN_LEX = (function () {

  // ---- Zelfstandige naamwoorden
  // es | en | de | fr
  // en: "woord" of "woord/meervoud"; ~ = ontelbaar (geen a/an, geen meervoud); ^ = altijd meervoud
  // de: "Woord geslacht Meervoud"  (geslacht m/f/n/pl; meervoud "=" gelijk, "-" geen)
  // fr: "woord geslacht [meervoud]" (geslacht m/f, "m pl"/"f pl" altijd meervoud); _ = spatie
  // es: "*" achteraan = Spaans altijd meervoud
  var NOUNS = [
    "hermanos*|siblings^|Geschwister pl -|frères_et_sœurs m pl",
    "casa|house|Haus n Häuser|maison f",
    "perro|dog|Hund m Hunde|chien m",
    "gato|cat|Katze f Katzen|chat m",
    "café|coffee~|Kaffee m Kaffees|café m",
    "té|tea~|Tee m Tees|thé m",
    "agua|water~|Wasser n -|eau f eaux",
    "pan|bread~|Brot n Brote|pain m",
    "libro|book|Buch n Bücher|livre m",
    "coche|car|Auto n Autos|voiture f",
    "ciudad|city/cities|Stadt f Städte|ville f",
    "salud|health~|Gesundheit f -|santé f",
    "calle|street|Straße f Straßen|rue f",
    "estación|station|Bahnhof m Bahnhöfe|gare f",
    "playa|beach/beaches|Strand m Strände|plage f",
    "mesa|table|Tisch m Tische|table f",
    "silla|chair|Stuhl m Stühle|chaise f",
    "hermano|brother|Bruder m Brüder|frère m",
    "hermana|sister|Schwester f Schwestern|sœur f",
    "padre|father|Vater m Väter|père m",
    "madre|mother|Mutter f Mütter|mère f",
    "padres*|parents^|Eltern pl -|parents m pl",
    "hijo|son|Sohn m Söhne|fils m fils",
    "hija|daughter|Tochter f Töchter|fille f",
    "hijos*|children^|Kinder pl -|enfants m pl",
    "niño|child/children|Kind n Kinder|enfant m",
    "niña|girl|Mädchen n =|fille f",
    "chico|boy|Junge m Jungen|garçon m",
    "chica|girl|Mädchen n =|fille f",
    "hombre|man/men|Mann m Männer|homme m",
    "mujer|woman/women|Frau f Frauen|femme f",
    "amigo|friend|Freund m Freunde|ami m",
    "amiga|friend|Freundin f Freundinnen|amie f",
    "novio|boyfriend|Freund m Freunde|copain m",
    "novia|girlfriend|Freundin f Freundinnen|copine f",
    "familia|family/families|Familie f Familien|famille f",
    "abuelo|grandfather|Großvater m Großväter|grand-père m grands-pères",
    "abuela|grandmother|Großmutter f Großmütter|grand-mère f grands-mères",
    "abuelos*|grandparents^|Großeltern pl -|grands-parents m pl",
    "tío|uncle|Onkel m =|oncle m",
    "tía|aunt|Tante f Tanten|tante f",
    "primo|cousin|Cousin m Cousins|cousin m",
    "prima|cousin|Cousine f Cousinen|cousine f",
    "esposo|husband|Mann m Männer|mari m",
    "marido|husband|Mann m Männer|mari m",
    "esposa|wife/wives|Frau f Frauen|femme f",
    "profesor|teacher|Lehrer m =|professeur m",
    "profesora|teacher|Lehrerin f Lehrerinnen|professeure f",
    "médico|doctor|Arzt m Ärzte|médecin m",
    "médica|doctor|Ärztin f Ärztinnen|médecin m",
    "jefe|boss/bosses|Chef m Chefs|patron m",
    "jefa|boss/bosses|Chefin f Chefinnen|patronne f",
    "vecino|neighbour|Nachbar m Nachbarn|voisin m",
    "vecina|neighbour|Nachbarin f Nachbarinnen|voisine f",
    "estudiante|student|Student m Studenten|étudiant m",
    "compañero|colleague|Kollege m Kollegen|collègue m",
    "compañera|colleague|Kollegin f Kolleginnen|collègue f",
    "camarero|waiter|Kellner m =|serveur m",
    "camarera|waitress/waitresses|Kellnerin f Kellnerinnen|serveuse f",
    "enfermero|nurse|Krankenpfleger m =|infirmier m",
    "enfermera|nurse|Krankenschwester f Krankenschwestern|infirmière f",
    "bebé|baby/babies|Baby n Babys|bébé m",
    "persona|person/people|Person f Personen|personne f",
    "trabajo|work~|Arbeit f Arbeiten|travail m travaux",
    "escuela|school|Schule f Schulen|école f",
    "colegio|school|Schule f Schulen|école f",
    "universidad|university/universities|Universität f Universitäten|université f",
    "tienda|shop|Geschäft n Geschäfte|magasin m",
    "supermercado|supermarket|Supermarkt m Supermärkte|supermarché m",
    "mercado|market|Markt m Märkte|marché m",
    "cerveza|beer~|Bier n Biere|bière f",
    "vino|wine~|Wein m Weine|vin m",
    "leche|milk~|Milch f -|lait m",
    "zumo|juice~|Saft m Säfte|jus m jus",
    "película|film|Film m Filme|film m",
    "reunión|meeting|Besprechung f Besprechungen|réunion f",
    "cine|cinema|Kino n Kinos|cinéma m",
    "hotel|hotel|Hotel n Hotels|hôtel m",
    "habitación|room|Zimmer n =|chambre f",
    "pared|wall|Wand f Wände|mur m", "informe|report|Bericht m Berichte|rapport m", "correo|email|E-Mail f E-Mails|mail m",
    "tren|train|Zug m Züge|train m",
    "autobús|bus/buses|Bus m Busse|bus m bus",
    "avión|plane|Flugzeug n Flugzeuge|avion m",
    "bicicleta|bike|Fahrrad n Fahrräder|vélo m",
    "bici|bike|Fahrrad n Fahrräder|vélo m",
    "dinero|money~|Geld n -|argent m",
    "tiempo|time~|Zeit f Zeiten|temps m temps",
    "día|day|Tag m Tage|jour m",
    "semana|week|Woche f Wochen|semaine f",
    "mes|month|Monat m Monate|mois m mois",
    "año|year|Jahr n Jahre|an m",
    "hora|hour|Stunde f Stunden|heure f",
    "minuto|minute|Minute f Minuten|minute f",
    "noche|night|Nacht f Nächte|nuit f",
    "fin de semana|weekend|Wochenende n Wochenenden|week-end m",
    "fiesta|party/parties|Party f Partys|fête f",
    "comida|food~|Essen n -|nourriture f",
    "cena|dinner|Abendessen n =|dîner m",
    "desayuno|breakfast|Frühstück n Frühstücke|petit-déjeuner m petits-déjeuners",
    "almuerzo|lunch/lunches|Mittagessen n =|déjeuner m",
    "hospital|hospital|Krankenhaus n Krankenhäuser|hôpital m hôpitaux",
    "farmacia|pharmacy/pharmacies|Apotheke f Apotheken|pharmacie f",
    "parque|park|Park m Parks|parc m",
    "museo|museum|Museum n Museen|musée m",
    "mar|sea|Meer n Meere|mer f",
    "montaña|mountain|Berg m Berge|montagne f",
    "río|river|Fluss m Flüsse|rivière f",
    "restaurante|restaurant|Restaurant n Restaurants|restaurant m",
    "bar|bar|Bar f Bars|bar m",
    "cuenta|bill|Rechnung f Rechnungen|addition f",
    "billete|ticket|Fahrkarte f Fahrkarten|billet m",
    "entrada|entrance|Eingang m Eingänge|entrée f",
    "pregunta|question|Frage f Fragen|question f",
    "respuesta|answer|Antwort f Antworten|réponse f",
    "problema|problem|Problem n Probleme|problème m",
    "idea|idea|Idee f Ideen|idée f",
    "música|music~|Musik f -|musique f",
    "fútbol|football~|Fußball m -|football m",
    "deporte|sport~|Sport m -|sport m",
    "teléfono|phone|Telefon n Telefone|téléphone m",
    "móvil|mobile phone|Handy n Handys|portable m",
    "ordenador|computer|Computer m =|ordinateur m",
    "país|country/countries|Land n Länder|pays m pays",
    "idioma|language|Sprache f Sprachen|langue f",
    "palabra|word|Wort n Wörter|mot m",
    "clase|lesson|Unterricht m -|cours m cours",
    "curso|course|Kurs m Kurse|cours m cours",
    "examen|exam|Prüfung f Prüfungen|examen m",
    "tarea|homework~|Hausaufgabe f Hausaufgaben|devoir m",
    "deberes*|homework~|Hausaufgaben pl -|devoirs m pl",
    "pescado|fish~|Fisch m Fische|poisson m",
    "carne|meat~|Fleisch n -|viande f",
    "fruta|fruit~|Obst n -|fruit m",
    "manzana|apple|Apfel m Äpfel|pomme f",
    "huevo|egg|Ei n Eier|œuf m",
    "queso|cheese~|Käse m -|fromage m",
    "sopa|soup|Suppe f Suppen|soupe f",
    "arroz|rice~|Reis m -|riz m riz",
    "pollo|chicken~|Hähnchen n =|poulet m",
    "ensalada|salad|Salat m Salate|salade f",
    "tomate|tomato/tomatoes|Tomate f Tomaten|tomate f",
    "verdura|vegetables^|Gemüse n -|légumes m pl",
    "chocolate|chocolate~|Schokolade f -|chocolat m",
    "helado|ice cream|Eis n -|glace f",
    "postre|dessert|Nachtisch m Nachtische|dessert m",
    "plato|dish/dishes|Gericht n Gerichte|plat m",
    "vaso|glass/glasses|Glas n Gläser|verre m",
    "botella|bottle|Flasche f Flaschen|bouteille f",
    "pizza|pizza|Pizza f Pizzas|pizza f",
    "puerta|door|Tür f Türen|porte f",
    "tapa|cover|Deckel m Deckel|couvercle m",
    "ventana|window|Fenster n =|fenêtre f",
    "cama|bed|Bett n Betten|lit m",
    "cocina|kitchen|Küche f Küchen|cuisine f",
    "jardín|garden|Garten m Gärten|jardin m",
    "piso|flat|Wohnung f Wohnungen|appartement m",
    "apartamento|flat|Wohnung f Wohnungen|appartement m",
    "llave|key|Schlüssel m =|clé f",
    "reloj|watch/watches|Uhr f Uhren|montre f",
    "zapato|shoe|Schuh m Schuhe|chaussure f",
    "camisa|shirt|Hemd n Hemden|chemise f",
    "cabeza|head|Kopf m Köpfe|tête f",
    "mano|hand|Hand f Hände|main f",
    "pie|foot/feet|Fuß m Füße|pied m",
    "foto|photo|Foto n Fotos|photo f",
    "carta|letter|Brief m Briefe|lettre f",
    "menú|menu|Speisekarte f Speisekarten|menu m",
    "pausa|break|Pause f Pausen|pause f",
    "compra|shopping|Einkauf m Einkäufe|course f",
    "regalo|present|Geschenk n Geschenke|cadeau m cadeaux",
    "cumpleaños|birthday|Geburtstag m Geburtstage|anniversaire m",
    "vacaciones*|holidays^|Urlaub m -|vacances f pl",
    "viaje|trip|Reise f Reisen|voyage m",
    "plan|plan|Plan m Pläne|projet m",
    "barco|boat|Boot n Boote|bateau m bateaux",
    "metro|underground~|U-Bahn f U-Bahnen|métro m",
    "taxi|taxi|Taxi n Taxis|taxi m",
    "aeropuerto|airport|Flughafen m Flughäfen|aéroport m",
    "centro|centre|Zentrum n Zentren|centre m",
    "banco|bank|Bank f Banken|banque f",
    "iglesia|church/churches|Kirche f Kirchen|église f",
    "oficina|office|Büro n Büros|bureau m bureaux",
    "empresa|company/companies|Firma f Firmen|entreprise f",
    "nombre|name|Name m Namen|nom m",
    "número|number|Nummer f Nummern|numéro m",
    "dirección|address/addresses|Adresse f Adressen|adresse f",
    "mundo|world|Welt f Welten|monde m",
    "vida|life/lives|Leben n =|vie f",
    "cosa|thing|Sache f Sachen|chose f",
    "historia|story/stories|Geschichte f Geschichten|histoire f",
    "periódico|newspaper|Zeitung f Zeitungen|journal m journaux",
    "mapa|map|Karte f Karten|carte f",
    "camino|way|Weg m Wege|chemin m",
    "árbol|tree|Baum m Bäume|arbre m",
    "flor|flower|Blume f Blumen|fleur f",
    "pueblo|village|Dorf n Dörfer|village m",
    "barrio|neighbourhood|Viertel n =|quartier m",
    "piscina|swimming pool|Schwimmbad n Schwimmbäder|piscine f",
    "biblioteca|library/libraries|Bibliothek f Bibliotheken|bibliothèque f",
    "canción|song|Lied n Lieder|chanson f",
    "guitarra|guitar|Gitarre f Gitarren|guitare f",
    "partido|match/matches|Spiel n Spiele|match m",
    "equipo|team|Mannschaft f Mannschaften|équipe f",
    "pasaporte|passport|Pass m Pässe|passeport m",
    "maleta|suitcase|Koffer m =|valise f",
    "precio|price|Preis m Preise|prix m prix",
    "euro|euro|Euro m =|euro m",
    "caballo|horse|Pferd n Pferde|cheval m chevaux",
    "pájaro|bird|Vogel m Vögel|oiseau m oiseaux",
    "ayuda|help~|Hilfe f -|aide f",
    "mañana|morning|Morgen m =|matin m",
    "tarde|afternoon|Nachmittag m Nachmittage|après-midi m après-midi",
    "lunes|Monday|Montag m Montage|lundi m",
    "martes|Tuesday|Dienstag m Dienstage|mardi m",
    "miércoles|Wednesday|Mittwoch m Mittwoche|mercredi m",
    "jueves|Thursday|Donnerstag m Donnerstage|jeudi m",
    "viernes|Friday|Freitag m Freitage|vendredi m",
    "sábado|Saturday|Samstag m Samstage|samedi m",
    "domingo|Sunday|Sonntag m Sonntage|dimanche m",
    "tele|TV~|Fernsehen n -|télé f",
    "televisión|television~|Fernsehen n -|télévision f",
    "internet|internet~|Internet n -|internet m",
    "gimnasio|gym|Fitnessstudio n Fitnessstudios|salle_de_sport f salles_de_sport",
    "baño|bathroom|Badezimmer n =|salle_de_bains f salles_de_bains"
  ];

  // Personen (voor hij/zij, persoonlijke "a" en het weglaten van het lidwoord bij beroepen)
  var PERSON = "padre madre padres hermano hermana hijo hija hijos niño niña chico chica hombre mujer amigo amiga novio novia " +
    "abuelo abuela abuelos tío tía primo prima esposo esposa marido profesor profesora médico médica jefe jefa vecino vecina " +
    "estudiante compañero compañera camarero camarera enfermero enfermera bebé persona familia";
  // Beroepen: na "zijn" zonder lidwoord in het Spaans, Duits en Frans, met a/an in het Engels
  var PROFESSION = "profesor profesora médico médica estudiante camarero camarera enfermero enfermera jefe jefa";
  // Woorden die in het Engels zonder lidwoord "home"/"bed" e.d. vormen, staan in zin.js.

  // ---- Bijvoeglijke naamwoorden
  // es | en | de | fr mannelijk | fr vrouwelijk | vlaggen
  // vlaggen: e = toestand (estar), b = Frans vóór het zelfstandig naamwoord
  var ADJS = [
    "cansado|tired|müde|fatigué|fatiguée|e",
    "enfermo|ill|krank|malade|malade|e",
    "contento|happy|froh|content|contente|e",
    "triste|sad|traurig|triste|triste|e",
    "nervioso|nervous|nervös|nerveux|nerveuse|e",
    "ocupado|busy|beschäftigt|occupé|occupée|e",
    "enfadado|angry|wütend|fâché|fâchée|e",
    "preocupado|worried|besorgt|inquiet|inquiète|e",
    "tranquilo|calm|ruhig|calme|calme|e",
    "casado|married|verheiratet|marié|mariée|e",
    "abierto|open|geöffnet|ouvert|ouverte|e",
    "cerrado|closed|geschlossen|fermé|fermée|e",
    "lleno|full|voll|plein|pleine|e",
    "vacío|empty|leer|vide|vide|e",
    "feliz|happy|glücklich|heureux|heureuse|",
    "grande|big|groß|grand|grande|b",
    "pequeño|small|klein|petit|petite|b",
    "bonito|beautiful|schön|beau|belle|b",
    "guapo|good-looking|hübsch|beau|belle|b",
    "feo|ugly|hässlich|laid|laide|",
    "nuevo|new|neu|nouveau|nouvelle|b",
    "viejo|old|alt|vieux|vieille|b",
    "joven|young|jung|jeune|jeune|b",
    "bueno|good|gut|bon|bonne|b",
    "malo|bad|schlecht|mauvais|mauvaise|b",
    "caro|expensive|teuer|cher|chère|",
    "barato|cheap|billig|bon_marché|bon_marché|",
    "fácil|easy|einfach|facile|facile|",
    "difícil|difficult|schwierig|difficile|difficile|",
    "importante|important|wichtig|important|importante|",
    "interesante|interesting|interessant|intéressant|intéressante|",
    "divertido|fun|lustig|amusant|amusante|",
    "simpático|nice|nett|sympathique|sympathique|",
    "amable|kind|freundlich|gentil|gentille|",
    "alto|tall|groß|grand|grande|",
    "bajo|short|klein|petit|petite|",
    "rápido|fast|schnell|rapide|rapide|",
    "lento|slow|langsam|lent|lente|",
    "frío|cold|kalt|froid|froide|e",
    "caliente|hot|heiß|chaud|chaude|e",
    "delicioso|delicious|lecker|délicieux|délicieuse|",
    "limpio|clean|sauber|propre|propre|",
    "sucio|dirty|schmutzig|sale|sale|",
    "libre|free|frei|libre|libre|",
    "largo|long|lang|long|longue|",
    "corto|short|kurz|court|courte|",
    "soltero|single|ledig|célibataire|célibataire|",
    "inteligente|intelligent|intelligent|intelligent|intelligente|",
    "perezoso|lazy|faul|paresseux|paresseuse|",
    "trabajador|hard-working|fleißig|travailleur|travailleuse|",
    "tímido|shy|schüchtern|timide|timide|",
    "gordo|fat|dick|gros|grosse|",
    "delgado|thin|dünn|mince|mince|",
    "fuerte|strong|stark|fort|forte|",
  ];
  // Bijvoeglijke naamwoorden waarvan de betekenis wisselt met ser/estar
  // es: [ser-betekenis en|de|fr_m|fr_f, estar-betekenis en|de|fr_m|fr_f]
  var ADJ_SER_ESTAR = {
    "aburrido": [["boring", "langweilig", "ennuyeux", "ennuyeuse"], ["bored", "gelangweilt", null, null]],
    "rico": [["rich", "reich", "riche", "riche"], ["delicious", "lecker", "délicieux", "délicieuse"]],
    "listo": [["clever", "klug", "intelligent", "intelligente"], ["ready", "fertig", "prêt", "prête"]]
  };

  // Nationaliteiten: es (m) | es (f) | en | de m | de f | fr m | fr f
  var NATS = [
    "holandés|holandesa|Dutch|Niederländer|Niederländerin|néerlandais|néerlandaise",
    "neerlandés|neerlandesa|Dutch|Niederländer|Niederländerin|néerlandais|néerlandaise",
    "español|española|Spanish|Spanier|Spanierin|espagnol|espagnole",
    "inglés|inglesa|English|Engländer|Engländerin|anglais|anglaise",
    "alemán|alemana|German|Deutscher|Deutsche|allemand|allemande",
    "francés|francesa|French|Franzose|Französin|français|française",
    "belga|belga|Belgian|Belgier|Belgierin|belge|belge",
    "italiano|italiana|Italian|Italiener|Italienerin|italien|italienne",
    "mexicano|mexicana|Mexican|Mexikaner|Mexikanerin|mexicain|mexicaine",
    "marroquí|marroquí|Moroccan|Marokkaner|Marokkanerin|marocain|marocaine",
    "turco|turca|Turkish|Türke|Türkin|turc|turque"
  ];
  // Talen (als zelfstandig naamwoord: "hablo español")
  var LANGS = {
    "español": ["Spanish", "Spanisch", "espagnol"], "inglés": ["English", "Englisch", "anglais"],
    "alemán": ["German", "Deutsch", "allemand"], "francés": ["French", "Französisch", "français"],
    "holandés": ["Dutch", "Niederländisch", "néerlandais"], "neerlandés": ["Dutch", "Niederländisch", "néerlandais"],
    "italiano": ["Italian", "Italienisch", "italien"], "árabe": ["Arabic", "Arabisch", "arabe"]
  };

  // Plaatsen: es | en | de | fr | fr-type (v = stad, m/f = land met lidwoord, pl = meervoud)
  var PLACES = [
    "madrid|Madrid|Madrid|Madrid|v", "barcelona|Barcelona|Barcelona|Barcelone|v", "sevilla|Seville|Sevilla|Séville|v",
    "valencia|Valencia|Valencia|Valence|v", "málaga|Málaga|Málaga|Malaga|v", "granada|Granada|Granada|Grenade|v",
    "ámsterdam|Amsterdam|Amsterdam|Amsterdam|v", "amsterdam|Amsterdam|Amsterdam|Amsterdam|v",
    "rotterdam|Rotterdam|Rotterdam|Rotterdam|v", "róterdam|Rotterdam|Rotterdam|Rotterdam|v",
    "utrecht|Utrecht|Utrecht|Utrecht|v", "la haya|The Hague|Den Haag|La Haye|v",
    "londres|London|London|Londres|v", "parís|Paris|Paris|Paris|v", "berlín|Berlin|Berlin|Berlin|v",
    "bruselas|Brussels|Brüssel|Bruxelles|v", "roma|Rome|Rom|Rome|v", "nueva york|New York|New York|New York|v",
    "españa|Spain|Spanien|Espagne|f", "holanda|the Netherlands|die Niederlande|Pays-Bas|pl",
    "países bajos|the Netherlands|die Niederlande|Pays-Bas|pl", "francia|France|Frankreich|France|f",
    "alemania|Germany|Deutschland|Allemagne|f", "inglaterra|England|England|Angleterre|f",
    "bélgica|Belgium|Belgien|Belgique|f", "italia|Italy|Italien|Italie|f", "portugal|Portugal|Portugal|Portugal|m",
    "méxico|Mexico|Mexiko|Mexique|m", "marruecos|Morocco|Marokko|Maroc|m", "argentina|Argentina|Argentinien|Argentine|f",
    "colombia|Colombia|Kolumbien|Colombie|f", "perú|Peru|Peru|Pérou|m", "chile|Chile|Chile|Chili|m",
    "turquía|Turkey|die Türkei|Turquie|f", "europa|Europe|Europa|Europe|f"
  ];

  // ---- Werkwoorden (Spaanse infinitief als sleutel)
  // es: onregelmatige vormen (pres/pret: yo, tú, él, nosotros, vosotros, ellos; ger = gerundium)
  // en: base, s3 (hij-vorm), past, ing; prog = in de tegenwoordige tijd liever "am ...ing"; obj = voorzetsel voor het lijdend voorwerp
  // de: inf, pres (6 vormen, scheidbaar deel apart in sep), pp, aux (h/s), prt (onvoltooid verleden), sep, refl, obj (a/d of "auf+a"), tail
  // fr: inf, pres (6), pp, aux (a/e), refl, imp (imparfait)
  var VERBS = {
    // Scheidbare werkwoorden uit de werkwoordenaudit (doelvertalingen; het Spaanse lemma komt uit nl-es.js EXTRA_VERBS)
    lavar: { en: { b: "wash", past: "washed", ing: "washing" }, de: { inf: "waschen", pres: "wasche wäschst wäscht waschen wascht waschen", pp: "gewaschen", aux: "haben" }, fr: { inf: "laver", pp: "lavé", aux: "a" } },
    "estar de pie": { en: { b: "stand", past: "stood", ing: "standing" }, de: { inf: "stehen", pp: "gestanden", aux: "haben" }, fr: { inf: "être debout", pp: "été debout", aux: "e" } },
    "estar tumbado": { en: { b: "lie", past: "lay", ing: "lying" }, de: { inf: "liegen", pp: "gelegen", aux: "haben" }, fr: { inf: "être allongé", pp: "été allongé", aux: "e" } },
    "estar sentado": { en: { b: "sit", past: "sat", ing: "sitting" }, de: { inf: "sitzen", pp: "gesessen", aux: "haben" }, fr: { inf: "être assis", pp: "été assis", aux: "e" } },
    llover: { en: { b: "rain", past: "rained", ing: "raining" }, de: { inf: "regnen", pp: "geregnet", aux: "haben" }, fr: { inf: "pleuvoir", pp: "plu", aux: "a" } },
    nevar: { en: { b: "snow", past: "snowed", ing: "snowing" }, de: { inf: "schneien", pp: "geschneit", aux: "haben" }, fr: { inf: "neiger", pp: "neigé", aux: "a" } },
    soplar: { en: { b: "blow", past: "blew", ing: "blowing" }, de: { inf: "wehen", pp: "geweht", aux: "haben" }, fr: { inf: "souffler", pp: "soufflé", aux: "a" } },
    brillar: { en: { b: "shine", past: "shone", ing: "shining" }, de: { inf: "scheinen", pp: "geschienen", aux: "haben" }, fr: { inf: "briller", pp: "brillé", aux: "a" } },
    pasar: { en: { b: "happen", past: "happened", ing: "happening" }, de: { inf: "passieren", pp: "passiert", aux: "s" }, fr: { inf: "arriver", pp: "arrivé", aux: "e" } },
    bajar: { en: { b: "get", past: "got", tail: "off" }, de: { inf: "steigen", sep: "aus", pres: "steige steigst steigt steigen steigt steigen", pp: "ausgestiegen", aux: "s" }, fr: { inf: "descendre", pres: "descends descends descend descendons descendez descendent", pp: "descendu", aux: "e" } },
    subir: { en: { b: "get", past: "got", tail: "on" }, de: { inf: "steigen", sep: "ein", pres: "steige steigst steigt steigen steigt steigen", pp: "eingestiegen", aux: "s" }, fr: { inf: "monter", pp: "monté", aux: "e" } },
    doblar: { en: { b: "turn", past: "turned" }, de: { inf: "biegen", sep: "ab", pres: "biege biegst biegt biegen biegt biegen", pp: "abgebogen", aux: "s" }, fr: { inf: "tourner", pp: "tourné", aux: "a" } },
    cruzar: { en: { b: "cross", past: "crossed" }, de: { inf: "überqueren", pp: "überquert", aux: "haben" }, fr: { inf: "traverser", pp: "traversé", aux: "a" } },
    ordenar: { en: { b: "tidy", past: "tidied", tail: "up" }, de: { inf: "räumen", sep: "auf", pres: "räume räumst räumt räumen räumt räumen", pp: "aufgeräumt", aux: "haben" }, fr: { inf: "ranger", pp: "rangé", aux: "a" } },
    transbordar: { en: { b: "change", past: "changed" }, de: { inf: "steigen", sep: "um", pres: "steige steigst steigt steigen steigt steigen", pp: "umgestiegen", aux: "s" }, fr: { inf: "changer", pp: "changé", aux: "a" } },
    rellamar: { en: { b: "call", past: "called", tail: "back" }, de: { inf: "rufen", sep: "zurück", pres: "rufe rufst ruft rufen ruft rufen", pp: "zurückgerufen", aux: "haben" }, fr: { inf: "rappeler", pres: "rappelle rappelles rappelle rappelons rappelez rappellent", pp: "rappelé", aux: "a" } },
    girar: { en: { b: "turn", past: "turned", tail: "around" }, de: { inf: "drehen", sep: "um", pres: "drehe drehst dreht drehen dreht drehen", pp: "umgedreht", aux: "haben" }, fr: { inf: "tourner", pp: "tourné", aux: "a" } },
    explicar: { en: { b: "explain", past: "explained" }, de: { inf: "erklären", pp: "erklärt", aux: "haben" }, fr: { inf: "expliquer", pp: "expliqué", aux: "a" } },
    ser: { es: { pres: "soy eres es somos sois son", pret: "fui fuiste fue fuimos fuisteis fueron", imp: "era eras era éramos erais eran", ger: "siendo" },
      en: { be: true }, de: { inf: "sein", pres: "bin bist ist sind seid sind", pp: "gewesen", aux: "s", prt: "war warst war waren wart waren" },
      fr: { inf: "être", pres: "suis es est sommes êtes sont", pp: "été", aux: "a", imp: "étais étais était étions étiez étaient" } },
    estar: { es: { pres: "estoy estás está estamos estáis están", pret: "estuve estuviste estuvo estuvimos estuvisteis estuvieron", imp: "estaba estabas estaba estábamos estabais estaban" },
      en: { be: true }, de: { inf: "sein", pres: "bin bist ist sind seid sind", pp: "gewesen", aux: "s", prt: "war warst war waren wart waren" },
      fr: { inf: "être", pres: "suis es est sommes êtes sont", pp: "été", aux: "a", imp: "étais étais était étions étiez étaient" } },
    tener: { es: { pres: "tengo tienes tiene tenemos tenéis tienen", pret: "tuve tuviste tuvo tuvimos tuvisteis tuvieron", imp: "tenía tenías tenía teníamos teníais tenían" },
      en: { b: "have", s3: "has", past: "had", ing: "having" }, de: { inf: "haben", pres: "habe hast hat haben habt haben", pp: "gehabt", prt: "hatte hattest hatte hatten hattet hatten" },
      fr: { inf: "avoir", pres: "ai as a avons avez ont", pp: "eu", imp: "avais avais avait avions aviez avaient" } },
    ir: { es: { pres: "voy vas va vamos vais van", pret: "fui fuiste fue fuimos fuisteis fueron", imp: "iba ibas iba íbamos ibais iban", ger: "yendo" },
      en: { b: "go", s3: "goes", past: "went", ing: "going" }, de: { inf: "gehen", pres: "gehe gehst geht gehen geht gehen", pp: "gegangen", aux: "s", prt: "ging gingst ging gingen gingt gingen" },
      fr: { inf: "aller", pres: "vais vas va allons allez vont", pp: "allé", aux: "e" } },
    hacer: { es: { pres: "hago haces hace hacemos hacéis hacen", pret: "hice hiciste hizo hicimos hicisteis hicieron" },
      en: { b: "do", s3: "does", past: "did", ing: "doing" }, de: { inf: "machen" }, fr: { inf: "faire", pres: "fais fais fait faisons faites font", pp: "fait" } },
    decir: { es: { pres: "digo dices dice decimos decís dicen", pret: "dije dijiste dijo dijimos dijisteis dijeron", ger: "diciendo" },
      en: { b: "say", s3: "says", past: "said" }, de: { inf: "sagen" }, fr: { inf: "dire", pres: "dis dis dit disons dites disent", pp: "dit" } },
    ver: { es: { pres: "veo ves ve vemos veis ven", pret: "vi viste vio vimos visteis vieron" },
      en: { b: "see", past: "saw", ing: "seeing" }, de: { inf: "sehen", pres: "sehe siehst sieht sehen seht sehen", pp: "gesehen" },
      fr: { inf: "voir", pres: "vois vois voit voyons voyez voient", pp: "vu" } },
    venir: { es: { pres: "vengo vienes viene venimos venís vienen", pret: "vine viniste vino vinimos vinisteis vinieron", ger: "viniendo" },
      en: { b: "come", past: "came", ing: "coming" }, de: { inf: "kommen", pp: "gekommen", aux: "s", prt: "kam kamst kam kamen kamt kamen" },
      fr: { inf: "venir", pres: "viens viens vient venons venez viennent", pp: "venu", aux: "e" } },
    comer: { en: { b: "eat", past: "ate" }, de: { inf: "essen", pres: "esse isst isst essen esst essen", pp: "gegessen" },
      fr: { inf: "manger", pres: "mange manges mange mangeons mangez mangent", pp: "mangé" } },
    beber: { en: { b: "drink", past: "drank" }, de: { inf: "trinken", pp: "getrunken" }, fr: { inf: "boire", pres: "bois bois boit buvons buvez boivent", pp: "bu" } },
    dormir: { es: { pres: "duermo duermes duerme dormimos dormís duermen", pret: "dormí dormiste durmió dormimos dormisteis durmieron", ger: "durmiendo" },
      en: { b: "sleep", past: "slept" }, de: { inf: "schlafen", pres: "schlafe schläfst schläft schlafen schlaft schlafen", pp: "geschlafen" },
      fr: { inf: "dormir", pres: "dors dors dort dormons dormez dorment", pp: "dormi" } },
    comprar: { en: { b: "buy", past: "bought" }, de: { inf: "kaufen" }, fr: { inf: "acheter", pres: "achète achètes achète achetons achetez achètent", pp: "acheté" } },
    leer: { es: { pret: "leí leíste leyó leímos leísteis leyeron", ger: "leyendo" },
      en: { b: "read", past: "read" }, de: { inf: "lesen", pres: "lese liest liest lesen lest lesen", pp: "gelesen" },
      fr: { inf: "lire", pres: "lis lis lit lisons lisez lisent", pp: "lu" } },
    escribir: { en: { b: "write", past: "wrote", ing: "writing" }, de: { inf: "schreiben", pp: "geschrieben" },
      fr: { inf: "écrire", pres: "écris écris écrit écrivons écrivez écrivent", pp: "écrit" } },
    hablar: { en: { b: "speak", past: "spoke" }, de: { inf: "sprechen", pres: "spreche sprichst spricht sprechen sprecht sprechen", pp: "gesprochen" },
      fr: { inf: "parler" } },
    saber: { es: { pres: "sé sabes sabe sabemos sabéis saben", pret: "supe supiste supo supimos supisteis supieron" },
      en: { b: "know", past: "knew" }, de: { inf: "wissen", pres: "weiß weißt weiß wissen wisst wissen", pp: "gewusst", prt: "wusste wusstest wusste wussten wusstet wussten" },
      fr: { inf: "savoir", pres: "sais sais sait savons savez savent", pp: "su" } },
    conocer: { es: { pres: "conozco conoces conoce conocemos conocéis conocen" },
      en: { b: "know", past: "knew" }, de: { inf: "kennen", pp: "gekannt" },
      fr: { inf: "connaître", pres: "connais connais connaît connaissons connaissez connaissent", pp: "connu" } },
    pensar: { es: { pres: "pienso piensas piensa pensamos pensáis piensan" },
      en: { b: "think", past: "thought" }, de: { inf: "denken", pp: "gedacht" }, fr: { inf: "penser" } },
    creer: { es: { pret: "creí creíste creyó creímos creísteis creyeron", ger: "creyendo" },
      en: { b: "believe", past: "believed" }, de: { inf: "glauben" }, fr: { inf: "croire", pres: "crois crois croit croyons croyez croient", pp: "cru" } },
    querer: { es: { pres: "quiero quieres quiere queremos queréis quieren", pret: "quise quisiste quiso quisimos quisisteis quisieron", imp: "quería querías quería queríamos queríais querían" },
      en: { b: "want", modalTo: true }, de: { inf: "möchten", pres: "möchte möchtest möchte möchten möchtet möchten", pp: "gewollt", prt: "wollte wolltest wollte wollten wolltet wollten", modal: true },
      fr: { inf: "vouloir", pres: "veux veux veut voulons voulez veulent", pp: "voulu", modal: true } },
    poder: { es: { pres: "puedo puedes puede podemos podéis pueden", pret: "pude pudiste pudo pudimos pudisteis pudieron", imp: "podía podías podía podíamos podíais podían" },
      en: { modal: "can", past: "could" }, de: { inf: "können", pres: "kann kannst kann können könnt können", pp: "gekonnt", prt: "konnte konntest konnte konnten konntet konnten", modal: true },
      fr: { inf: "pouvoir", pres: "peux peux peut pouvons pouvez peuvent", pp: "pu", modal: true } },
    deber: { en: { modal: "must" }, de: { inf: "müssen", pres: "muss musst muss müssen müsst müssen", pp: "gemusst", prt: "musste musstest musste mussten musstet mussten", modal: true },
      fr: { inf: "devoir", pres: "dois dois doit devons devez doivent", pp: "dû", modal: true } },
    "deber cond": { es: { pres: "debería|deberías|debería|deberíamos|deberíais|deberían", pret: "debería|deberías|debería|deberíamos|deberíais|deberían" },
      en: { modal: "should", past: "should" }, de: { inf: "sollen", pres: "sollte solltest sollte sollten solltet sollten", pp: "gesollt", prt: "sollte solltest sollte sollten solltet sollten", modal: true },
      fr: { inf: "devoir", pres: "devrais devrais devrait devrions devriez devraient", pp: "dû", modal: true } },
    "tener permiso": { es: { pres: "tengo permiso para|tienes permiso para|tiene permiso para|tenemos permiso para|tenéis permiso para|tienen permiso para", pret: "tuve permiso para|tuviste permiso para|tuvo permiso para|tuvimos permiso para|tuvisteis permiso para|tuvieron permiso para" },
      en: { modal: "may", past: "was allowed to" }, de: { inf: "dürfen", pres: "darf darfst darf dürfen dürft dürfen", pp: "gedurft", prt: "durfte durftest durfte durften durftet durften", modal: true },
      fr: { inf: "avoir le droit", pres: "ai le droit de|as le droit de|a le droit de|avons le droit de|avez le droit de|ont le droit de", pp: "eu", modal: true } },
    "tener que": { es: { pres: "tengo que|tienes que|tiene que|tenemos que|tenéis que|tienen que", pret: "tuve que|tuviste que|tuvo que|tuvimos que|tuvisteis que|tuvieron que" },
      en: { b: "have", s3: "has", past: "had", modalTo: true }, de: { inf: "müssen", pres: "muss musst muss müssen müsst müssen", pp: "gemusst", prt: "musste musstest musste mussten musstet mussten", modal: true },
      fr: { inf: "devoir", pres: "dois dois doit devons devez doivent", pp: "dû", modal: true } },
    necesitar: { en: { b: "need", modalTo: true }, de: { inf: "brauchen" }, fr: { inf: "avoir", pres: "ai as a avons avez ont", pp: "eu", besoin: true } },
    trabajar: { en: { b: "work" }, de: { inf: "arbeiten" }, fr: { inf: "travailler" } },
    vivir: { en: { b: "live", ing: "living" }, de: { inf: "wohnen" }, fr: { inf: "habiter" } },
    estudiar: { en: { b: "study", past: "studied" }, de: { inf: "lernen" }, fr: { inf: "étudier" } },
    aprender: { en: { b: "learn" }, de: { inf: "lernen" }, fr: { inf: "apprendre", pres: "apprends apprends apprend apprenons apprenez apprennent", pp: "appris" } },
    entender: { es: { pres: "entiendo entiendes entiende entendemos entendéis entienden" },
      en: { b: "understand", past: "understood" }, de: { inf: "verstehen", pp: "verstanden" },
      fr: { inf: "comprendre", pres: "comprends comprends comprend comprenons comprenez comprennent", pp: "compris" } },
    comprender: { en: { b: "understand", past: "understood" }, de: { inf: "verstehen", pp: "verstanden" },
      fr: { inf: "comprendre", pres: "comprends comprends comprend comprenons comprenez comprennent", pp: "compris" } },
    ayudar: { en: { b: "help" }, de: { inf: "helfen", pres: "helfe hilfst hilft helfen helft helfen", pp: "geholfen", obj: "d" }, fr: { inf: "aider" } },
    buscar: { en: { b: "look", obj: "for", prog: true }, de: { inf: "suchen" }, fr: { inf: "chercher" } },
    esperar: { en: { b: "wait", obj: "for", prog: true }, de: { inf: "warten", obj: "auf" }, fr: { inf: "attendre", pres: "attends attends attend attendons attendez attendent", pp: "attendu" } },
    llamar: { en: { b: "call" }, de: { inf: "rufen", sep: "an", pp: "angerufen" }, fr: { inf: "appeler", pres: "appelle appelles appelle appelons appelez appellent" } },
    regresar: { en: { b: "go", past: "went", ing: "going", tail: "back" }, de: { inf: "gehen", sep: "zurück", pres: "gehe gehst geht gehen geht gehen", pp: "zurückgegangen", aux: "s" }, fr: { inf: "rentrer", aux: "e" } },
    llegar: { en: { b: "arrive", ing: "arriving" }, de: { inf: "kommen", sep: "an", pp: "angekommen", aux: "s" }, fr: { inf: "arriver", aux: "e" } },
    irse: { es: { pres: "me voy|te vas|se va|nos vamos|os vais|se van", pret: "me fui|te fuiste|se fue|nos fuimos|os fuisteis|se fueron", imp: "me iba|te ibas|se iba|nos íbamos|os ibais|se iban", ger: "yendo" },
      en: { b: "leave", past: "left", ing: "leaving", prog: true }, de: { inf: "gehen", pres: "gehe gehst geht gehen geht gehen", pp: "gegangen", aux: "s", prt: "ging gingst ging gingen gingt gingen" },
      fr: { inf: "partir", pres: "pars pars part partons partez partent", pp: "parti", aux: "e" } },
    salir: { es: { pres: "salgo sales sale salimos salís salen" }, en: { b: "go", s3: "goes", past: "went", ing: "going", tail: "out" },
      de: { inf: "gehen", sep: "aus", pp: "ausgegangen", aux: "s" }, fr: { inf: "sortir", pres: "sors sors sort sortons sortez sortent", pp: "sorti", aux: "e" } },
    partir: { es: { pres: "parto partes parte partimos partís parten" }, en: { b: "leave", s3: "leaves", past: "left", ing: "leaving" },
      de: { inf: "fahren", pres: "fahre fährst fährt fahren fahrt fahren", sep: "ab", pp: "abgefahren", aux: "s" }, fr: { inf: "partir", pres: "pars pars part partons partez partent", pp: "parti", aux: "e" } },
    volver: { es: { pres: "vuelvo vuelves vuelve volvemos volvéis vuelven" }, en: { b: "come", past: "came", ing: "coming", tail: "back" },
      de: { inf: "kommen", sep: "zurück", pp: "zurückgekommen", aux: "s" }, fr: { inf: "revenir", pres: "reviens reviens revient revenons revenez reviennent", pp: "revenu", aux: "e" } },
    empezar: { es: { pres: "empiezo empiezas empieza empezamos empezáis empiezan" }, en: { b: "start" },
      de: { inf: "fangen", sep: "an", pres: "fange fängst fängt fangen fangt fangen", pp: "angefangen" },
      fr: { inf: "commencer", pres: "commence commences commence commençons commencez commencent" } },
    reservar: { en: { b: "book" }, de: { inf: "buchen", pp: "gebucht" }, fr: { inf: "réserver", pp: "réservé" } },
    pintar: { en: { b: "paint" }, de: { inf: "streichen", pres: "streiche streichst streicht streichen streicht streichen", pp: "gestrichen" }, fr: { inf: "peindre", pres: "peins peins peint peignons peignez peignent", pp: "peint" } },
    pasear: { en: { b: "go", past: "went", ing: "going", tail: "for a walk" }, de: { inf: "gehen", pres: "gehe gehst geht gehen geht gehen", pp: "gegangen", aux: "s", tail: "spazieren" }, fr: { inf: "promener", pres: "promène promènes promène promenons promenez promènent", refl: true, aux: "e" } },
    llevar: { en: { b: "take", past: "took", ing: "taking" }, de: { inf: "nehmen", sep: "mit", pres: "nehme nimmst nimmt nehmen nehmt nehmen", pp: "mitgenommen" }, fr: { inf: "emporter", pp: "emporté" } },
    mudarse: { es: { pres: "me mudo|te mudas|se muda|nos mudamos|os mudáis|se mudan" }, en: { b: "move", past: "moved", ing: "moving" }, de: { inf: "ziehen", sep: "um", pres: "ziehe ziehst zieht ziehen zieht ziehen", pp: "umgezogen", aux: "s" }, fr: { inf: "déménager", pres: "déménage déménages déménage déménageons déménagez déménagent", pp: "déménagé" } },
    terminar: { en: { b: "finish", s3: "finishes" }, de: { inf: "beenden", pp: "beendet" }, fr: { inf: "finir", pres: "finis finis finit finissons finissez finissent", pp: "fini" } },
    abrir: { en: { b: "open" }, de: { inf: "öffnen", pres: "öffne öffnest öffnet öffnen öffnet öffnen", pp: "geöffnet" },
      fr: { inf: "ouvrir", pres: "ouvre ouvres ouvre ouvrons ouvrez ouvrent", pp: "ouvert" } },
    mostrar: { es: { pres: "muestro muestras muestra mostramos mostráis muestran" }, en: { b: "show" }, de: { inf: "zeigen" }, fr: { inf: "montrer" } },
    traer: { es: { pres: "traigo traes trae traemos traéis traen", pret: "traje trajiste trajo trajimos trajisteis trajeron" }, en: { b: "bring", past: "brought", ing: "bringing" },
      de: { inf: "bringen", pres: "bringe bringst bringt bringen bringt bringen", pp: "gebracht", prt: "brachte brachtest brachte brachten brachtet brachten" }, fr: { inf: "apporter" } },
    quitar: { en: { b: "remove" }, de: { inf: "entfernen", pres: "entferne entfernst entfernt entfernen entfernt entfernen", pp: "entfernt" }, fr: { inf: "enlever", pres: "enlève enlèves enlève enlevons enlevez enlèvent", pp: "enlevé" } },
    cerrar: { es: { pres: "cierro cierras cierra cerramos cerráis cierran" }, en: { b: "close", ing: "closing" },
      de: { inf: "schließen", pres: "schließe schließt schließt schließen schließt schließen", pp: "geschlossen" }, fr: { inf: "fermer" } },
    cocinar: { en: { b: "cook" }, de: { inf: "kochen" }, fr: { inf: "cuisiner" } },
    amar: { en: { b: "love" }, de: { inf: "lieben", pp: "geliebt" }, fr: { inf: "aimer" } },
    comenzar: { es: { pres: "comienzo comienzas comienza comenzamos comenzáis comienzan", pret: "comencé comenzaste comenzó comenzamos comenzasteis comenzaron" }, en: { b: "begin", past: "began", ing: "beginning" }, de: { inf: "beginnen", pres: "beginne beginnst beginnt beginnen beginnt beginnen", pp: "begonnen", prt: "begann begannst begann begannen begannt begannen" }, fr: { inf: "commencer", pres: "commence commences commence commençons commencez commencent", pp: "commencé" } },
    parar: { en: { b: "stop", past: "stopped", ing: "stopping" }, de: { inf: "hören", sep: "auf", pres: "höre hörst hört hören hört hören", pp: "aufgehört", prt: "hörte hörtest hörte hörten hörtet hörten" }, fr: { inf: "arrêter", pres: "arrête arrêtes arrête arrêtons arrêtez arrêtent", pp: "arrêté" } },
    morder: { es: { pres: "muerdo muerdes muerde mordemos mordéis muerden" }, en: { b: "bite", past: "bit", ing: "biting" }, de: { inf: "beißen", pres: "beiße beißt beißt beißen beißt beißen", pp: "gebissen", prt: "biss bissest biss bissen biss(e)t bissen" }, fr: { inf: "mordre", pres: "mords mords mord mordons mordez mordent", pp: "mordu" } },
    rogar: { es: { pres: "ruego ruegas ruega rogamos rogáis ruegan", pret: "rogué rogaste rogó rogamos rogasteis rogaron" }, en: { b: "beg", past: "begged", ing: "begging" }, de: { inf: "bitten", pres: "bitte bittest bittet bitten bittet bitten", pp: "gebeten", prt: "bat batest bat baten batet baten" }, fr: { inf: "prier", pres: "prie pries prie prions priez prient", pp: "prié" } },
    romper: { en: { b: "break", past: "broke", ing: "breaking" }, de: { inf: "brechen", pres: "breche brichst bricht brechen brecht brechen", pp: "gebrochen", prt: "brach brachst brach brachen bracht brachen" }, fr: { inf: "rompre", pres: "romps romps rompt rompons rompez rompent", pp: "rompu" } },
    considerar: { en: { b: "consider" }, de: { inf: "erwägen", pres: "erwäge erwägst erwägt erwägen erwägt erwägen", pp: "erwogen", prt: "erwog erwogst erwog erwogen erwogt erwogen" }, fr: { inf: "envisager", pres: "envisage envisages envisage envisageons envisagez envisagent", pp: "envisagé" } },
    fluir: { es: { pres: "fluyo fluyes fluye fluimos fluís fluyen", pret: "fluí fluiste fluyó fluimos fluisteis fluyeron" }, en: { b: "flow" }, de: { inf: "fließen", pres: "fließe fließt fließt fließen fließt fließen", pp: "geflossen", aux: "s", prt: "floss flossest floss flossen floss(e)t flossen" }, fr: { inf: "couler", pres: "coule coules coule coulons coulez coulent", pp: "coulé" } },
    agarrar: { en: { b: "grab", past: "grabbed", ing: "grabbing" }, de: { inf: "greifen", pres: "greife greifst greift greifen greift greifen", pp: "gegriffen", prt: "griff griffst griff griffen grifft griffen" }, fr: { inf: "saisir", pres: "saisis saisis saisit saisissons saisissez saisissent", pp: "saisi" } },
    sostener: { es: { pres: "sostengo sostienes sostiene sostenemos sostenéis sostienen", pret: "sostuve sostuviste sostuvo sostuvimos sostuvisteis sostuvieron" }, en: { b: "hold", past: "held", ing: "holding" }, de: { inf: "halten", pres: "halte hältst hält halten haltet halten", pp: "gehalten", prt: "hielt hielt(e)st hielt hielten hieltet hielten" }, fr: { inf: "tenir", pres: "tiens tiens tient tenons tenez tiennent", pp: "tenu" } },
    actuar: { es: { pres: "actúo actúas actúa actuamos actuáis actúan" }, en: { b: "act" }, de: { inf: "handeln", pres: "handle handelst handelt handeln handelt handeln", pp: "gehandelt", prt: "handelte handeltest handelte handelten handeltet handelten" }, fr: { inf: "agir", pres: "agis agis agit agissons agissez agissent", pp: "agi" } },
    colgar: { es: { pres: "cuelgo cuelgas cuelga colgamos colgáis cuelgan", pret: "colgué colgaste colgó colgamos colgasteis colgaron" }, en: { b: "hang", past: "hung", ing: "hanging" }, de: { inf: "hängen", pres: "hänge hängst hängt hängen hängt hängen", pp: "gehangen", prt: "hing hingst hing hingen hingt hingen" }, fr: { inf: "pendre", pres: "pends pends pend pendons pendez pendent", pp: "pendu" } },
    levantar: { en: { b: "lift" }, de: { inf: "heben", pres: "hebe hebst hebt heben hebt heben", pp: "gehoben", prt: "hob hobst hob hoben hobt hoben" }, fr: { inf: "lever", pres: "lève lèves lève levons levez lèvent", pp: "levé" } },
    cargar: { es: { pret: "cargué cargaste cargó cargamos cargasteis cargaron" }, en: { b: "load" }, de: { inf: "laden", pres: "lade lädst lädt laden ladet laden", pp: "geladen", prt: "lud lud(e)st lud luden ludet luden" }, fr: { inf: "charger", pres: "charge charges charge chargeons chargez chargent", pp: "chargé" } },
    dejar: { es: { pret: "dejé dejaste dejó dejamos dejasteis dejaron" }, en: { b: "let", past: "let", ing: "letting" }, de: { inf: "lassen", pres: "lasse lässt lässt lassen lasst lassen", pp: "gelassen", prt: "ließ ließest ließ ließen ließ(e)t ließen" }, fr: { inf: "laisser", pres: "laisse laisses laisse laissons laissez laissent", pp: "laissé" } },
    sufrir: { en: { b: "suffer" }, de: { inf: "leiden", pres: "leide leidest leidet leiden leidet leiden", pp: "gelitten", prt: "litt litt(e)st litt litten littet litten" }, fr: { inf: "souffrir", pres: "souffre souffres souffre souffrons souffrez souffrent", pp: "souffert" } },
    prestar: { en: { b: "lend", past: "lent", ing: "lending" }, de: { inf: "leihen", pres: "leihe leihst leiht leihen leiht leihen", pp: "geliehen", prt: "lieh liehst lieh liehen lieht liehen" }, fr: { inf: "prêter", pres: "prête prêtes prête prêtons prêtez prêtent", pp: "prêté" } },
    mentir: { es: { pres: "miento mientes miente mentimos mentís mienten", pret: "mentí mentiste mintió mentimos mentisteis mintieron" }, en: { b: "lie", past: "lied", ing: "lying" }, de: { inf: "lügen", pres: "lüge lügst lügt lügen lügt lügen", pp: "gelogen", prt: "log logst log logen logt logen" }, fr: { inf: "mentir", pres: "mens mens ment mentons mentez mentent", pp: "menti" } },
    nombrar: { en: { b: "name" }, de: { inf: "nennen", pres: "nenne nennst nennt nennen nennt nennen", pp: "genannt", prt: "nannte nanntest nannte nannten nanntet nannten" }, fr: { inf: "nommer", pres: "nomme nommes nomme nommons nommez nomment", pp: "nommé" } },
    aconsejar: { en: { b: "advise" }, de: { inf: "raten", pres: "rate rätst rät raten ratet raten", pp: "geraten", prt: "riet riet(e)st riet rieten rietet rieten" }, fr: { inf: "conseiller", pres: "conseille conseilles conseille conseillons conseillez conseillent", pp: "conseillé" } },
    chupar: { en: { b: "suck" }, de: { inf: "saugen", pres: "sauge saugst saugt saugen saugt saugen", pp: "gesogen", prt: "sog sogst sog sogen sogt sogen" }, fr: { inf: "sucer", pres: "suce suces suce suçons sucez sucent", pp: "sucé" } },
    conmutar: { en: { b: "switch" }, de: { inf: "schalten", pres: "schalte schaltest schaltet schalten schaltet schalten", pp: "geschaltet", prt: "schaltete schaltetest schaltete schalteten schaltetet schalteten" }, fr: { inf: "commuter", pres: "commute commutes commute commutons commutez commutent", pp: "commuté" } },
    empujar: { en: { b: "push" }, de: { inf: "schieben", pres: "schiebe schiebst schiebt schieben schiebt schieben", pp: "geschoben", prt: "schob schobst schob schoben schobt schoben" }, fr: { inf: "pousser", pres: "pousse pousses pousse poussons poussez poussent", pp: "poussé" } },
    maltratar: { en: { b: "mistreat" }, de: { inf: "schinden", pres: "schinde schindest schindet schinden schindet schinden", pp: "geschunden", prt: "schund schundest schund schunden schundet schunden" }, fr: { inf: "maltraiter", pres: "maltraite maltraites maltraite maltraitons maltraitez maltraitent", pp: "maltraité" } },
    derretir: { es: { pres: "derrito derrites derrite derretimos derretís derriten" }, en: { b: "melt" }, de: { inf: "schmelzen", pres: "schmelze schmilzt schmilzt schmelzen schmelzt schmelzen", pp: "geschmolzen", aux: "s", prt: "schmolz schmolzest schmolz schmolzen schmolz(e)t schmolzen" }, fr: { inf: "fondre", pres: "fonds fonds fond fondons fondez fondent", pp: "fondu" } },
    gritar: { en: { b: "shout" }, de: { inf: "schreien", pres: "schreie schreist schreit schreien schreit schreien", pp: "geschrien", prt: "schrie schriest schrie schrien schriet schrien" }, fr: { inf: "crier", pres: "crie cries crie crions criez crient", pp: "crié" } },
    jurar: { en: { b: "swear", past: "swore", ing: "swearing" }, de: { inf: "schwören", pres: "schwöre schwörst schwört schwören schwört schwören", pp: "geschworen", prt: "schwor schworst schwor schworen schwort schworen" }, fr: { inf: "jurer", pres: "jure jures jure jurons jurez jurent", pp: "juré" } },
    hervir: { es: { pres: "hiervo hierves hierve hervimos hervís hierven", pret: "herví herviste hirvió hervimos hervisteis hirvieron" }, en: { b: "boil" }, de: { inf: "sieden", pres: "siede siedest siedet sieden siedet sieden", pp: "gesotten", prt: "sott sottest sott sotten sottet sotten" }, fr: { inf: "bouillir", pres: "bous bous bout bouillons bouillez bouillent", pp: "bouilli" } },
    golpear: { en: { b: "hit", past: "hit", ing: "hitting" }, de: { inf: "stoßen", pres: "stoße stößt stößt stoßen stoßt stoßen", pp: "gestoßen", prt: "stieß stießest stieß stießen stieß(e)t stießen" }, fr: { inf: "heurter", pres: "heurte heurtes heurte heurtons heurtez heurtent", pp: "heurté" } },
    crecer: { es: { pres: "crezco creces crece crecemos crecéis crecen", pret: "crecí creciste creció crecimos crecisteis crecieron" }, en: { b: "grow", past: "grew", ing: "growing" }, de: { inf: "wachsen", pres: "wachse wächst wächst wachsen wachst wachsen", pp: "gewachsen", aux: "s", prt: "wuchs wuchst wuchs wuchsen wuchst wuchsen" }, fr: { inf: "croître", pres: "croîs croîs croît croissons croissez croissent", pp: "crû" } },
    girar: { en: { b: "turn" }, de: { inf: "wenden", pres: "wende wendest wendet wenden wendet wenden", pp: "gewandt", prt: "wandte wandtest wandte wandten wandtet wandten" }, fr: { inf: "tourner", pres: "tourne tournes tourne tournons tournez tournent", pp: "tourné" } },
    lanzar: { es: { pret: "lancé lanzaste lanzó lanzamos lanzasteis lanzaron" }, en: { b: "throw", past: "threw", ing: "throwing" }, de: { inf: "werfen", pres: "werfe wirfst wirft werfen werft werfen", pp: "geworfen", prt: "warf warfst warf warfen warft warfen" }, fr: { inf: "jeter", pres: "jette jettes jette jetons jetez jettent", pp: "jeté" } },
    echar: { es: { pret: "eché echaste echó echamos echasteis echaron" }, en: { b: "throw", past: "threw", pp: "thrown" }, de: { inf: "werfen", pres: "werfe wirfst wirft werfen werft werfen", pp: "geworfen", prt: "warf warfst warf warfen warft warfen" }, fr: { inf: "jeter", pres: "jette jettes jette jetons jetez jettent", pp: "jeté" } },
    tirar: { en: { b: "pull" }, de: { inf: "ziehen", pres: "ziehe ziehst zieht ziehen zieht ziehen", pp: "gezogen", prt: "zog zogst zog zogen zogt zogen" }, fr: { inf: "tirer", pres: "tire tires tire tirons tirez tirent", pp: "tiré" } },
    poner: { es: { pres: "pongo pones pone ponemos ponéis ponen", pret: "puse pusiste puso pusimos pusisteis pusieron" }, en: { b: "put", past: "put", ing: "putting" }, de: { inf: "legen", pres: "lege legst legt legen legt legen", pp: "gelegt" }, fr: { inf: "mettre", pres: "mets mets met mettons mettez mettent", pp: "mis" } },
    ceder: { en: { b: "yield" }, de: { inf: "geben", sep: "nach", pres: "gebe gibst gibt geben gebt geben", pp: "nachgegeben", prt: "gab gabst gab gaben gabt gaben" }, fr: { inf: "céder", pres: "cède cèdes cède cédons cédez cèdent", pp: "cédé" } },
    concluir: { es: { pres: "concluyo concluyes concluye concluimos concluís concluyen", pret: "concluí concluiste concluyó concluimos concluisteis concluyeron" }, en: { b: "conclude" }, de: { inf: "schließen", sep: "ab", pres: "schließe schließt schließt schließen schließt schließen", pp: "abgeschlossen" }, fr: { inf: "conclure", pres: "conclus conclus conclut concluons concluez concluent", pp: "conclu" } },
    coser: { en: { b: "sew", past: "sewed", ing: "sewing" }, de: { inf: "nähen", pres: "nähe nähst näht nähen näht nähen", pp: "genäht" }, fr: { inf: "coudre", pres: "couds couds coud cousons cousez cousent", pp: "cousu" } },
    temer: { en: { b: "fear" }, de: { inf: "fürchten", pres: "fürchte fürchtest fürchtet fürchten fürchtet fürchten", pp: "gefürchtet" }, fr: { inf: "craindre", pres: "crains crains craint craignons craignez craignent", pp: "craint" } },
    recoger: { es: { pres: "recojo recoges recoge recogemos recogéis recogen" }, en: { b: "pick", past: "picked", ing: "picking" }, de: { inf: "pflücken", pres: "pflücke pflückst pflückt pflücken pflückt pflücken", pp: "gepflückt" }, fr: { inf: "chercher", go: true, pp: "cherché" } },
    conmover: { es: { pres: "conmuevo conmueves conmueve conmovemos conmovéis conmueven" }, en: { b: "touch" }, de: { inf: "rühren", pres: "rühre rührst rührt rühren rührt rühren", pp: "gerührt" }, fr: { inf: "émouvoir", pres: "émeus émeus émeut émouvons émouvez émeuvent", pp: "ému" } },
    hojear: { en: { b: "browse" }, de: { inf: "blättern", pres: "blättere blätterst blättert blättern blättert blättern", pp: "geblättert" }, fr: { inf: "feuilleter", pres: "feuillette feuillettes feuillette feuilletons feuilletez feuillettent", pp: "feuilleté" } },
    huir: { es: { pres: "huyo huyes huye huimos huís huyen", pret: "huí huiste huyó huimos huisteis huyeron" }, en: { b: "flee", past: "fled", ing: "fleeing" }, de: { inf: "fliehen", pres: "fliehe fliehst flieht fliehen flieht fliehen", pp: "geflohen", aux: "s" }, fr: { inf: "fuir", pres: "fuis fuis fuit fuyons fuyez fuient", pp: "fui" } },
    odiar: { en: { b: "hate" }, de: { inf: "hassen", pres: "hasse hasst hasst hassen hasst hassen", pp: "gehasst" }, fr: { inf: "haïr", pres: "hais hais hait haïssons haïssez haïssent", pp: "haï" } },
    moler: { es: { pres: "muelo mueles muele molemos moléis muelen" }, en: { b: "grind", past: "ground", ing: "grinding" }, de: { inf: "mahlen", pres: "mahle mahlst mahlt mahlen mahlt mahlen", pp: "gemahlen" }, fr: { inf: "moudre", pres: "mouds mouds moud moulons moulez moulent", pp: "moulu" } },
    morir: { es: { pres: "muero mueres muere morimos morís mueren", pret: "morí moriste murió morimos moristeis murieron" }, en: { b: "die", past: "died", ing: "dying" }, de: { inf: "sterben", pres: "sterbe stirbst stirbt sterben sterbt sterben", pp: "gestorben", aux: "s" }, fr: { inf: "mourir", pres: "meurs meurs meurt mourons mourez meurent", pp: "mort", aux: "e" } },
    pesar: { en: { b: "weigh" }, de: { inf: "wiegen", pres: "wiege wiegst wiegt wiegen wiegt wiegen", pp: "gewogen" }, fr: { inf: "peser", pres: "pèse pèses pèse pesons pesez pèsent", pp: "pesé" } },
    recibir: { en: { b: "receive" }, de: { inf: "erhalten", pres: "erhalte erhältst erhält erhalten erhaltet erhalten", pp: "erhalten" }, fr: { inf: "recevoir", pres: "reçois reçois reçoit recevons recevez reçoivent", pp: "reçu" } },
    resolver: { es: { pres: "resuelvo resuelves resuelve resolvemos resolvéis resuelven" }, en: { b: "solve" }, de: { inf: "lösen", pres: "löse löst löst lösen löst lösen", pp: "gelöst" }, fr: { inf: "résoudre", pres: "résous résous résout résolvons résolvez résolvent", pp: "résolu" } },
    seguir: { es: { pres: "sigo sigues sigue seguimos seguís siguen", pret: "seguí seguiste siguió seguimos seguisteis siguieron" }, en: { b: "follow" }, de: { inf: "folgen", pres: "folge folgst folgt folgen folgt folgen", pp: "gefolgt", aux: "s", obj: "d" }, fr: { inf: "suivre", pres: "suis suis suit suivons suivez suivent", pp: "suivi" } },
    vencer: { es: { pret: "vencí venciste venció vencimos vencisteis vencieron" }, en: { b: "defeat" }, de: { inf: "besiegen", pres: "besiege besiegst besiegt besiegen besiegt besiegen", pp: "besiegt" }, fr: { inf: "vaincre", pres: "vaincs vaincs vainc vainquons vainquez vainquent", pp: "vaincu" } },
    batir: { en: { b: "beat", past: "beat", ing: "beating" }, de: { inf: "schlagen", pres: "schlage schlägst schlägt schlagen schlagt schlagen", pp: "geschlagen", prt: "schlug schlugst schlug schlugen schlugt schlugen" }, fr: { inf: "battre", pres: "bats bats bat battons battez battent", pp: "battu" } },
    valer: { es: { pres: "valgo vales vale valemos valéis valen" }, en: { b: "be worth", s3: "is worth", past: "was worth", ing: "being worth" }, de: { inf: "wert sein", pres: "bin wert bist wert ist wert sind wert seid wert sind wert", pp: "wert gewesen" }, fr: { inf: "valoir", pres: "vaux vaux vaut valons valez valent", pp: "valu" } },
    apagar: { es: { pret: "apagué apagaste apagó apagamos apagasteis apagaron" }, en: { b: "turn", past: "turned", ing: "turning", tail: "off" }, de: { inf: "schalten", sep: "aus", pres: "schalte schaltest schaltet schalten schaltet schalten", pp: "ausgeschaltet" }, fr: { inf: "éteindre", pres: "éteins éteins éteint éteignons éteignez éteignent", pp: "éteint" } },
    encender: { es: { pres: "enciendo enciendes enciende encendemos encendéis encienden" }, en: { b: "turn", past: "turned", ing: "turning", tail: "on" }, de: { inf: "schalten", sep: "ein", pres: "schalte schaltest schaltet schalten schaltet schalten", pp: "eingeschaltet" }, fr: { inf: "allumer", pres: "allume allumes allume allumons allumez allument", pp: "allumé" } },
    responder: { en: { b: "answer" }, de: { inf: "antworten", pres: "antworte antwortest antwortet antworten antwortet antworten", pp: "geantwortet", obj: "d" }, fr: { inf: "répondre", pres: "réponds réponds répond répondons répondez répondent", pp: "répondu" } },
    calentar: { es: { pres: "caliento calientas calienta calentamos calentáis calientan" }, en: { b: "heat" }, de: { inf: "wärmen", pres: "wärme wärmst wärmt wärmen wärmt wärmen", pp: "gewärmt" }, fr: { inf: "chauffer", pres: "chauffe chauffes chauffe chauffons chauffez chauffent", pp: "chauffé" } },
    despertar: { es: { pres: "despierto despiertas despierta despertamos despertáis despiertan" }, en: { b: "wake", past: "woke", ing: "waking" }, de: { inf: "wecken", pres: "wecke weckst weckt wecken weckt wecken", pp: "geweckt" }, fr: { inf: "réveiller", pres: "réveille réveilles réveille réveillons réveillez réveillent", pp: "réveillé" } },
    regar: { es: { pres: "riego riegas riega regamos regáis riegan", pret: "regué regaste regó regamos regasteis regaron" }, en: { b: "water" }, de: { inf: "gießen", pres: "gieße gießt gießt gießen gießt gießen", pp: "gegossen", prt: "goss gossest goss gossen gosst gossen" }, fr: { inf: "arroser", pres: "arrose arroses arrose arrosons arrosez arrosent", pp: "arrosé" } },
    probar: { es: { pres: "pruebo pruebas prueba probamos probáis prueban" }, en: { b: "try" }, de: { inf: "probieren", pres: "probiere probierst probiert probieren probiert probieren", pp: "probiert" }, fr: { inf: "essayer", pres: "essaie essaies essaie essayons essayez essaient", pp: "essayé" } },
    sacar: { es: { pret: "saqué sacaste sacó sacamos sacasteis sacaron" }, en: { b: "take", past: "took", ing: "taking", tail: "out" }, de: { inf: "nehmen", sep: "heraus", pres: "nehme nimmst nimmt nehmen nehmt nehmen", pp: "herausgenommen" }, fr: { inf: "sortir", pres: "sors sors sort sortons sortez sortent", pp: "sorti" } },
    coger: { es: { pres: "cojo coges coge cogemos cogéis cogen" }, en: { b: "catch", past: "caught", ing: "catching" }, de: { inf: "nehmen", pres: "nehme nimmst nimmt nehmen nehmt nehmen", pp: "genommen" }, fr: { inf: "prendre", pres: "prends prends prend prenons prenez prennent", pp: "attrapé" } },
    oír: { es: { pres: "oigo oyes oye oímos oís oyen", pret: "oí oíste oyó oímos oísteis oyeron" }, en: { b: "hear", past: "heard", ing: "hearing" }, de: { inf: "hören", pres: "höre hörst hört hören hört hören", pp: "gehört" }, fr: { inf: "entendre", pres: "entends entends entend entendons entendez entendent", pp: "entendu" } },
    escuchar: { en: { b: "listen", obj: "to" }, de: { inf: "hören", sep: "zu", pp: "zugehört", obj: "d" }, fr: { inf: "écouter" } },
    mirar: { en: { b: "watch", s3: "watches" }, de: { inf: "schauen", sep: "an", pp: "angeschaut" }, fr: { inf: "regarder" } },
    jugar: { es: { pres: "juego juegas juega jugamos jugáis juegan" }, en: { b: "play" }, de: { inf: "spielen" }, fr: { inf: "jouer" } },
    bailar: { en: { b: "dance", ing: "dancing" }, de: { inf: "tanzen", pres: "tanze tanzt tanzt tanzen tanzt tanzen" }, fr: { inf: "danser" } },
    cantar: { en: { b: "sing", past: "sang" }, de: { inf: "singen", pp: "gesungen" }, fr: { inf: "chanter" } },
    nadar: { en: { b: "swim", past: "swam", ing: "swimming" }, de: { inf: "schwimmen", pp: "geschwommen", aux: "s" }, fr: { inf: "nager", pres: "nage nages nage nageons nagez nagent" } },
    correr: { en: { b: "run", past: "ran", ing: "running" }, de: { inf: "laufen", pres: "laufe läufst läuft laufen lauft laufen", pp: "gelaufen", aux: "s" },
      fr: { inf: "courir", pres: "cours cours court courons courez courent", pp: "couru" } },
    caminar: { en: { b: "walk" }, de: { inf: "gehen", pres: "gehe gehst geht gehen geht gehen", pp: "gegangen", aux: "s", tail: "spazieren" }, fr: { inf: "marcher" } },
    viajar: { en: { b: "travel", past: "travelled", ing: "travelling" }, de: { inf: "reisen", pres: "reise reist reist reisen reist reisen", aux: "s" }, fr: { inf: "voyager", pres: "voyage voyages voyage voyageons voyagez voyagent" } },
    visitar: { en: { b: "visit" }, de: { inf: "besuchen", pp: "besucht" }, fr: { inf: "visiter" } },
    pagar: { en: { b: "pay", past: "paid" }, de: { inf: "bezahlen", pp: "bezahlt" }, fr: { inf: "payer", pres: "paie paies paie payons payez paient" } },
    costar: { es: { pres: "cuesto cuestas cuesta costamos costáis cuestan" }, en: { b: "cost", past: "cost", ing: "costing" },
      de: { inf: "kosten", pres: "koste kostest kostet kosten kostet kosten" }, fr: { inf: "coûter" } },
    tomar: { en: { b: "take", past: "took", ing: "taking" }, de: { inf: "nehmen", pres: "nehme nimmst nimmt nehmen nehmt nehmen", pp: "genommen" },
      fr: { inf: "prendre", pres: "prends prends prend prenons prenez prennent", pp: "pris" } },
    pedir: { es: { pres: "pido pides pide pedimos pedís piden", pret: "pedí pediste pidió pedimos pedisteis pidieron", ger: "pidiendo" },
      en: { b: "order" }, de: { inf: "bestellen", pp: "bestellt" }, fr: { inf: "commander" } },
    preferir: { es: { pres: "prefiero prefieres prefiere preferimos preferís prefieren", pret: "preferí preferiste prefirió preferimos preferisteis prefirieron" },
      en: { b: "prefer", past: "preferred", ing: "preferring" }, de: { inf: "bevorzugen", pp: "bevorzugt" },
      fr: { inf: "préférer", pres: "préfère préfères préfère préférons préférez préfèrent" } },
    dar: { es: { pres: "doy das da damos dais dan", pret: "di diste dio dimos disteis dieron" },
      en: { b: "give", past: "gave", ing: "giving" }, de: { inf: "geben", pres: "gebe gibst gibt geben gebt geben", pp: "gegeben" }, fr: { inf: "donner" } },
    conducir: { es: { pres: "conduzco conduces conduce conducimos conducís conducen", pret: "conduje condujiste condujo condujimos condujisteis condujeron" },
      en: { b: "drive", past: "drove", ing: "driving" }, de: { inf: "fahren", pres: "fahre fährst fährt fahren fahrt fahren", pp: "gefahren", aux: "s" },
      fr: { inf: "conduire", pres: "conduis conduis conduit conduisons conduisez conduisent", pp: "conduit" } },
    olvidar: { en: { b: "forget", past: "forgot", ing: "forgetting" }, de: { inf: "vergessen", pres: "vergesse vergisst vergisst vergessen vergesst vergessen", pp: "vergessen" }, fr: { inf: "oublier" } },
    encontrar: { es: { pres: "encuentro encuentras encuentra encontramos encontráis encuentran" },
      en: { b: "find", past: "found" }, de: { inf: "finden", pres: "finde findest findet finden findet finden", pp: "gefunden" }, fr: { inf: "trouver" } },
    ganar: { en: { b: "win", past: "won", ing: "winning" }, de: { inf: "gewinnen", pp: "gewonnen" }, fr: { inf: "gagner" } },
    intentar: { en: { b: "try", past: "tried", ing: "trying" }, de: { inf: "versuchen" }, fr: { inf: "essayer", pres: "essaie essaies essaie essayons essayez essaient", pp: "essayé" } },
    perder: { es: { pres: "pierdo pierdes pierde perdemos perdéis pierden" },
      en: { b: "lose", past: "lost", ing: "losing" }, de: { inf: "verlieren", pp: "verloren" },
      fr: { inf: "perdre", pres: "perds perds perd perdons perdez perdent", pp: "perdu" } },
    usar: { en: { b: "use", ing: "using" }, de: { inf: "benutzen", pres: "benutze benutzt benutzt benutzen benutzt benutzen", pp: "benutzt" }, fr: { inf: "utiliser" } },
    limpiar: { en: { b: "clean" }, de: { inf: "putzen", pres: "putze putzt putzt putzen putzt putzen" },
      fr: { inf: "nettoyer", pres: "nettoie nettoies nettoie nettoyons nettoyez nettoient" } },
    preparar: { en: { b: "prepare", ing: "preparing" }, de: { inf: "bereiten", sep: "vor", pres: "bereite bereitest bereitet bereiten bereitet bereiten", pp: "vorbereitet" }, fr: { inf: "préparer" } },
    enviar: { en: { b: "send", past: "sent" }, de: { inf: "schicken" }, fr: { inf: "envoyer", pres: "envoie envoies envoie envoyons envoyez envoient" } },
    descansar: { en: { b: "rest" }, de: { inf: "ruhen", sep: "aus", pp: "ausgeruht", refl: true }, fr: { inf: "reposer", refl: true } },
    levantarse: { en: { b: "get", past: "got", ing: "getting", tail: "up" }, de: { inf: "stehen", sep: "auf", pp: "aufgestanden", aux: "s" },
      fr: { inf: "lever", pres: "lève lèves lève levons levez lèvent", refl: true, aux: "e" } },
    planchar: { en: { b: "iron", past: "ironed" }, de: { inf: "bügeln", pp: "gebügelt", aux: "haben" }, fr: { inf: "repasser", pp: "repassé" } },
    cortar: { en: { b: "cut", past: "cut" }, de: { inf: "schneiden", pp: "geschnitten", aux: "haben" }, fr: { inf: "couper", pp: "coupé" } },
    dibujar: { en: { b: "draw", past: "drew" }, de: { inf: "zeichnen", pp: "gezeichnet", aux: "haben" }, fr: { inf: "dessiner", pp: "dessiné" } },
    arrastrar: { en: { b: "drag", past: "dragged" }, de: { inf: "schleppen", pp: "geschleppt", aux: "haben" }, fr: { inf: "traîner", pp: "traîné" } },
    reír: { es: { pres: "río ríes ríe reímos reís ríen", pret: "reí reíste rio reímos reísteis rieron", imp: "reía reías reía reíamos reíais reían", ger: "riendo" }, en: { b: "laugh", past: "laughed" }, de: { inf: "lachen", pp: "gelacht", aux: "haben" }, fr: { inf: "rire", pres: "ris ris rit rions riez rient", pp: "ri" } },
    sonreír: { es: { pres: "sonrío sonríes sonríe sonreímos sonreís sonríen", ger: "sonriendo" }, en: { b: "smile", past: "smiled" }, de: { inf: "lächeln", pp: "gelächelt", aux: "haben" }, fr: { inf: "sourire", pres: "souris souris sourit sourions souriez sourient", pp: "souri" } },
    llorar: { en: { b: "cry", past: "cried" }, de: { inf: "weinen", pp: "geweint", aux: "haben" }, fr: { inf: "pleurer", pp: "pleuré" } },
    cambiar: { en: { b: "change", past: "changed" }, de: { inf: "ändern", pp: "geändert", aux: "haben" }, fr: { inf: "changer", pp: "changé" } },
    elegir: { es: { pres: "elijo eliges elige elegimos elegís eligen", pret: "elegí elegiste eligió elegimos elegisteis eligieron", imp: "elegía elegías elegía elegíamos elegíais elegían", ger: "eligiendo" }, en: { b: "choose", past: "chose" }, de: { inf: "wählen", sep: "aus", pp: "ausgewählt", aux: "haben" }, fr: { inf: "choisir", pres: "choisis choisis choisit choisissons choisissez choisissent", pp: "choisi" } },
    decidir: { en: { b: "decide", past: "decided" }, de: { inf: "entscheiden", pp: "entschieden", aux: "haben" }, fr: { inf: "décider", pp: "décidé" } },
    existir: { en: { b: "exist", past: "existed" }, de: { inf: "existieren", pp: "existiert", aux: "haben" }, fr: { inf: "exister", pp: "existé" } },
    arreglar: { en: { b: "fix", s3: "fixes", past: "fixed" }, de: { inf: "reparieren", pp: "repariert", aux: "haben" }, fr: { inf: "réparer", pp: "réparé" } },
    caer: { es: { pres: "caigo caes cae caemos caéis caen", pret: "caí caíste cayó caímos caísteis cayeron", imp: "caía caías caía caíamos caíais caían", ger: "cayendo" }, en: { b: "fall", past: "fell" }, de: { inf: "fallen", pres: "falle fällst fällt fallen fallt fallen", pp: "gefallen", aux: "sein" }, fr: { inf: "tomber", pp: "tombé" } },
    sentir: { es: { pres: "siento sientes siente sentimos sentís sienten", ger: "sintiendo" }, en: { b: "feel", past: "felt" }, de: { inf: "fühlen", pp: "gefühlt", aux: "haben" }, fr: { inf: "sentir", pres: "sens sens sent sentons sentez sentent", pp: "senti" } },
    casarse: { es: { pres: "me caso|te casas|se casa|nos casamos|os casáis|se casan" }, en: { b: "marry", past: "married", ing: "marrying" }, de: { inf: "heiraten", pp: "geheiratet", aux: "haben" }, fr: { inf: "marier", refl: true, aux: "e" } },
    oler: { es: { pres: "huelo hueles huele olemos oléis huelen" }, en: { b: "smell", past: "smelled" }, de: { inf: "riechen", pres: "rieche riechst riecht riechen riecht riechen", pp: "gerochen", aux: "haben" }, fr: { inf: "sentir", pres: "sens sens sent sentons sentez sentent", pp: "senti" } },
    recordar: { es: { pres: "recuerdo recuerdas recuerda recordamos recordáis recuerdan" }, en: { b: "remember", past: "remembered" }, de: { inf: "behalten", pres: "behalte behältst behält behalten behaltet behalten", pp: "behalten", aux: "haben" }, fr: { inf: "souvenir", pres: "souviens souviens souvient souvenons souvenez souviennent", pp: "souvenu", refl: true, aux: "e" } },
    fumar: { en: { b: "smoke", past: "smoked" }, de: { inf: "rauchen", pp: "geraucht", aux: "haben" }, fr: { inf: "fumer", pp: "fumé" } },
    ducharse: { en: { b: "have", s3: "has", past: "had", ing: "having", tail: "a shower" }, de: { inf: "duschen" }, fr: { inf: "doucher", refl: true, aux: "e" } },
    // wakker worden (despertar zonder "me" is iemand wekken)
    despertarse: { es: { pres: "me despierto|te despiertas|se despierta|nos despertamos|os despertáis|se despiertan" },
      en: { b: "wake", past: "woke", ing: "waking", tail: "up" }, de: { inf: "wachen", sep: "auf", pres: "wache wachst wacht wachen wacht wachen", pp: "aufgewacht", aux: "s" },
      fr: { inf: "réveiller", refl: true, aux: "e" } },
    acostarse: { es: { pres: "me acuesto|te acuestas|se acuesta|nos acostamos|os acostáis|se acuestan" },
      en: { b: "go", s3: "goes", past: "went", ing: "going", tail: "to bed" }, de: { inf: "gehen", pp: "gegangen", aux: "s", tail: "ins Bett" },
      fr: { inf: "coucher", refl: true, aux: "e" } },
    repetir: { es: { pres: "repito repites repite repetimos repetís repiten", pret: "repetí repetiste repitió repetimos repetisteis repitieron", ger: "repitiendo" },
      en: { b: "repeat" }, de: { inf: "wiederholen", pres: "wiederhole wiederholst wiederholt wiederholen wiederholt wiederholen", pp: "wiederholt" },
      fr: { inf: "répéter", pres: "répète répètes répète répétons répétez répètent" } },
    sentirse: { es: { pres: "me siento|te sientes|se siente|nos sentimos|os sentís|se sienten" },
      en: { b: "feel", past: "felt" }, de: { inf: "fühlen", refl: true }, fr: { inf: "sentir", pres: "sens sens sent sentons sentez sentent", pp: "senti", refl: true, aux: "e" } },
    sentarse: { es: { pres: "me siento|te sientas|se sienta|nos sentamos|os sentáis|se sientan" },
      en: { b: "sit", past: "sat", ing: "sitting", tail: "down" }, de: { inf: "setzen", sep: "hin", pres: "setze setzt setzt setzen setzt setzen", pp: "hingesetzt", refl: true }, fr: { inf: "asseoir", pres: "assieds assieds assied asseyons asseyez asseyent", pp: "assis", refl: true, aux: "e" } },
    caber: { es: { pres: "quepo cabes cabe cabemos cabéis caben", pret: "cupe cupiste cupo cupimos cupisteis cupieron" },
      en: { b: "fit", past: "fit" }, de: { inf: "passen", pres: "passe passt passt passen passt passen", pp: "gepasst" }, fr: { inf: "tenir", pres: "tiens tiens tient tenons tenez tiennent", pp: "tenu" } },
    nacer: { es: { pret: "nací naciste nació nacimos nacisteis nacieron" },
      en: { b: "be born", past: "was born", s3: "is born" }, de: { inf: "sein", pres: "bin bist ist sind seid sind", pp: "gewesen", aux: "s", tail: "geboren" }, fr: { inf: "naître", pres: "nais nais naît naissons naissez naissent", pp: "né", aux: "e" } },
    hermanar: { en: { b: "twin" }, de: { inf: "verschwistern" }, fr: { inf: "jumeler", pres: "jumelle jumelles jumelle jumelons jumelez jumellent", pp: "jumelé" } },
    aparcar: { es: { pret: "aparqué aparcaste aparcó aparcamos aparcasteis aparcaron" }, en: { b: "park" }, de: { inf: "parken" }, fr: { inf: "garer" } },
    soñar: { es: { pres: "sueño sueñas sueña soñamos soñáis sueñan" }, en: { b: "dream" }, de: { inf: "träumen" }, fr: { inf: "rêver" } },
    depender: { en: { b: "depend" }, de: { inf: "hängen", sep: "ab", pres: "hänge hängst hängt hängen hängt hängen", pp: "abgehangen" }, fr: { inf: "dépendre", pres: "dépends dépends dépend dépendons dépendez dépendent", pp: "dépendu" } },
    participar: { en: { b: "take", s3: "takes", past: "took", ing: "taking", tail: "part" }, de: { inf: "nehmen", sep: "teil", pres: "nehme nimmst nimmt nehmen nehmt nehmen", pp: "teilgenommen", prt: "nahm nahmst nahm nahmen nahmt nahmen" }, fr: { inf: "participer" } },
    preguntar: { en: { b: "ask" }, de: { inf: "fragen" }, fr: { inf: "demander" } },
    invitar: { en: { b: "invite" }, de: { inf: "laden", sep: "ein", pres: "lade lädst lädt laden ladet laden", pp: "eingeladen" }, fr: { inf: "inviter" } },
    pertenecer: { es: { pres: "pertenezco perteneces pertenece pertenecemos pertenecéis pertenecen" }, en: { b: "belong" }, de: { inf: "gehören" }, fr: { inf: "appartenir", pres: "appartiens appartiens appartient appartenons appartenez appartiennent", pp: "appartenu" } },
    dudar: { es: { pres: "dudo dudas duda dudamos dudáis dudan" }, en: { b: "doubt" }, de: { inf: "zweifeln", pres: "zweifle zweifelst zweifelt zweifeln zweifelt zweifeln", pp: "gezweifelt" }, fr: { inf: "douter" } },
    consistir: { en: { b: "consist" }, de: { inf: "bestehen", pres: "bestehe bestehst besteht bestehen besteht bestehen", pp: "bestanden", prt: "bestand bestandst bestand bestanden bestandet bestanden" }, fr: { inf: "consister" } },
    contribuir: { es: { pret: "contribuí contribuiste contribuyó contribuimos contribuisteis contribuyeron", ger: "contribuyendo", pres: "contribuyo contribuyes contribuye contribuimos contribuís contribuyen" }, en: { b: "contribute" }, de: { inf: "tragen", sep: "bei", pres: "trage trägst trägt tragen tragt tragen", pp: "beigetragen" }, fr: { inf: "contribuer" } },
    advertir: { es: { pres: "advierto adviertes advierte advertimos advertís advierten" }, en: { b: "warn" }, de: { inf: "warnen" }, fr: { inf: "avertir", pres: "avertis avertis avertit avertissons avertissez avertissent", pp: "averti" } },
    felicitar: { en: { b: "congratulate" }, de: { inf: "gratulieren", obj: "d" }, fr: { inf: "féliciter" } },
    comparar: { en: { b: "compare" }, de: { inf: "vergleichen", pres: "vergleiche vergleichst vergleicht vergleichen vergleicht vergleichen", pp: "verglichen", prt: "verglich verglichst verglich verglichen verglicht verglichen" }, fr: { inf: "comparer" } },
    reflexionar: { en: { b: "reflect" }, de: { inf: "denken", sep: "nach", pres: "denke denkst denkt denken denkt denken", pp: "nachgedacht" }, fr: { inf: "réfléchir", pres: "réfléchis réfléchis réfléchit réfléchissons réfléchissez réfléchissent", pp: "réfléchi" } },
    interesarse: { es: { pres: "me intereso|te interesas|se interesa|nos interesamos|os interesáis|se interesan" }, en: { b: "be", s3: "is", past: "was", ing: "being", tail: "interested" }, de: { inf: "interessieren", refl: true }, fr: { inf: "intéresser", refl: true, aux: "e" } },
    alegrarse: { es: { pres: "me alegro|te alegras|se alegra|nos alegramos|os alegráis|se alegran" }, en: { b: "be", s3: "is", past: "was", ing: "being", tail: "happy" }, de: { inf: "freuen", refl: true }, fr: { inf: "réjouir", pres: "réjouis réjouis réjouit réjouissons réjouissez réjouissent", pp: "réjoui", refl: true, aux: "e" } },
    adaptar: { en: { b: "adapt" }, de: { inf: "passen", sep: "an", pres: "passe passt passt passen passt passen", pp: "angepasst" }, fr: { inf: "adapter" } },
    acordarse: { es: { pres: "me acuerdo|te acuerdas|se acuerda|nos acordamos|os acordáis|se acuerdan" }, en: { b: "remember" }, de: { inf: "erinnern", refl: true }, fr: { inf: "souvenir", pres: "souviens souviens souvient souvenons souvenez souviennent", pp: "souvenu", refl: true, aux: "e" } },
    acostumbrarse: { es: { pres: "me acostumbro|te acostumbras|se acostumbra|nos acostumbramos|os acostumbráis|se acostumbran" }, en: { b: "get", past: "got", ing: "getting", tail: "used to" }, de: { inf: "gewöhnen", refl: true }, fr: { inf: "habituer", refl: true, aux: "e" } },
    referirse: { es: { pres: "me refiero|te refieres|se refiere|nos referimos|os referís|se refieren" }, en: { b: "refer" }, de: { inf: "beziehen", pres: "beziehe beziehst bezieht beziehen bezieht beziehen", pp: "bezogen", refl: true }, fr: { inf: "référer", pres: "réfère réfères réfère référons référez réfèrent", pp: "référé", refl: true, aux: "e" } },
    concentrarse: { es: { pres: "me concentro|te concentras|se concentra|nos concentramos|os concentráis|se concentran" }, en: { b: "concentrate" }, de: { inf: "konzentrieren", refl: true }, fr: { inf: "concentrer", refl: true, aux: "e" } },
    reaccionar: { en: { b: "react" }, de: { inf: "reagieren" }, fr: { inf: "réagir", pres: "réagis réagis réagit réagissons réagissez réagissent", pp: "réagi" } },
    especializarse: { es: { pres: "me especializo|te especializas|se especializa|nos especializamos|os especializáis|se especializan" }, en: { b: "specialize" }, de: { inf: "spezialisieren", refl: true }, fr: { inf: "spécialiser", refl: true, aux: "e" } },
    confiar: { es: { pres: "confío confías confía confiamos confiáis confían" }, en: { b: "trust" }, de: { inf: "vertrauen" }, fr: { inf: "fier", refl: true, aux: "e" } },
    renunciar: { en: { b: "give", past: "gave", ing: "giving", tail: "up" }, de: { inf: "verzichten" }, fr: { inf: "renoncer", pres: "renonce renonces renonce renonçons renoncez renoncent", pp: "renoncé" } },
    prepararse: { es: { pres: "me preparo|te preparas|se prepara|nos preparamos|os preparáis|se preparan" }, en: { b: "prepare" }, de: { inf: "bereiten", sep: "vor", pres: "bereite bereitest bereitet bereiten bereitet bereiten", pp: "vorbereitet", refl: true }, fr: { inf: "préparer", refl: true, aux: "e" } },
    decidirse: { es: { pres: "me decido|te decides|se decide|nos decidimos|os decidís|se deciden" }, en: { b: "decide" }, de: { inf: "entscheiden", pres: "entscheide entscheidest entscheidet entscheiden entscheidet entscheiden", pp: "entschieden", refl: true }, fr: { inf: "décider", refl: true, aux: "e" } },
    disculparse: { es: { pres: "me disculpo|te disculpas|se disculpa|nos disculpamos|os disculpáis|se disculpan" }, en: { b: "apologize" }, de: { inf: "entschuldigen", refl: true }, fr: { inf: "excuser", refl: true, aux: "e" } },
    luchar: { en: { b: "fight", past: "fought" }, de: { inf: "kämpfen" }, fr: { inf: "lutter" } },
    protestar: { en: { b: "protest" }, de: { inf: "protestieren" }, fr: { inf: "protester" } },
    invertir: { es: { pres: "invierto inviertes invierte invertimos invertís invierten" }, en: { b: "invest" }, de: { inf: "investieren" }, fr: { inf: "investir", pres: "investis investis investit investissons investissez investissent", pp: "investi" } },
    conmemorar: { en: { b: "commemorate" }, de: { inf: "gedenken", pres: "gedenke gedenkst gedenkt gedenken gedenkt gedenken", pp: "gedacht", obj: "g" }, fr: { inf: "commémorer" } },
    disfrutar: { en: { b: "enjoy" }, de: { inf: "erfreuen", refl: true }, fr: { inf: "profiter" } },
    enamorarse: { es: { pres: "me enamoro|te enamoras|se enamora|nos enamoramos|os enamoráis|se enamoran" }, en: { b: "fall", past: "fell", ing: "falling", tail: "in love" }, de: { inf: "verlieben", refl: true }, fr: { inf: "éprendre", pres: "éprends éprends éprend éprenons éprenez éprennent", pp: "épris", refl: true, aux: "e" } },
    enfadarse: { es: { pres: "me enfado|te enfadas|se enfada|nos enfadamos|os enfadáis|se enfadan" }, en: { b: "be", s3: "is", past: "was", ing: "being", tail: "angry" }, de: { inf: "ärgern", refl: true }, fr: { inf: "fâcher", refl: true, aux: "e" } },
    informar: { en: { b: "report" }, de: { inf: "berichten", pres: "berichte berichtest berichtet berichten berichtet berichten", pp: "berichtet" }, fr: { inf: "informer" } },
    quejarse: { es: { pres: "me quejo|te quejas|se queja|nos quejamos|os quejáis|se quejan" }, en: { b: "complain" }, de: { inf: "beschweren", refl: true }, fr: { inf: "plaindre", pres: "plains plains plaint plaignons plaignez plaignent", pp: "plaint", refl: true, aux: "e" } },
    discutir: { en: { b: "discuss" }, de: { inf: "diskutieren" }, fr: { inf: "discuter" } },
    reírse: { es: { pres: "me río|te ríes|se ríe|nos reímos|os reís|se ríen" }, en: { b: "laugh" }, de: { inf: "lachen" }, fr: { inf: "rire", pres: "ris ris rit rions riez rient", pp: "ri" } },
    sorprenderse: { es: { pres: "me sorprendo|te sorprendes|se sorprende|nos sorprendemos|os sorprendéis|se sorprenden" }, en: { b: "be", s3: "is", past: "was", ing: "being", tail: "surprised" }, de: { inf: "wundern", pres: "wundere wunderst wundert wundern wundert wundern", pp: "gewundert", refl: true }, fr: { inf: "étonner", refl: true, aux: "e" } },
    informarse: { es: { pres: "me informo|te informas|se informa|nos informamos|os informáis|se informan" }, en: { b: "find", past: "found", ing: "finding", tail: "out" }, de: { inf: "informieren", refl: true }, fr: { inf: "informer", refl: true, aux: "e" } },
    ocuparse: { es: { pres: "me ocupo|te ocupas|se ocupa|nos ocupamos|os ocupáis|se ocupan" }, en: { b: "take", past: "took", ing: "taking", tail: "care" }, de: { inf: "kümmern", refl: true }, fr: { inf: "occuper", refl: true, aux: "e" } },
    preocuparse: { es: { pres: "me preocupo|te preocupas|se preocupa|nos preocupamos|os preocupáis|se preocupan" }, en: { b: "worry" }, de: { inf: "sorgen", refl: true }, fr: { inf: "inquiéter", pres: "inquiète inquiètes inquiète inquiétons inquiétez inquiètent", pp: "inquiété", refl: true, aux: "e" } },
    quedar: { en: { b: "meet", past: "met" }, de: { inf: "treffen", pres: "treffe triffst trifft treffen trefft treffen", pp: "getroffen", refl: true }, fr: { inf: "retrouver" } },
    unir: { en: { b: "connect" }, de: { inf: "verbinden", pres: "verbinde verbindest verbindet verbinden verbindet verbinden", pp: "verbunden" }, fr: { inf: "relier" } },
    recuperarse: { es: { pres: "me recupero|te recuperas|se recupera|nos recuperamos|os recuperáis|se recuperan" }, en: { b: "recover" }, de: { inf: "erholen", refl: true }, fr: { inf: "remettre", pres: "remets remets remet remettons remettez remettent", pp: "remis", refl: true, aux: "e" } },
    contar: { es: { pres: "cuento cuentas cuenta contamos contáis cuentan" }, en: { b: "tell", past: "told" }, de: { inf: "erzählen" }, fr: { inf: "raconter" } },
    tratar: { en: { b: "deal", past: "dealt", ing: "dealing" }, de: { inf: "handeln" }, fr: { inf: "traiter" } },
    separarse: { es: { pres: "me separo|te separas|se separa|nos separamos|os separáis|se separan" }, en: { b: "separate" }, de: { inf: "trennen", refl: true }, fr: { inf: "séparer", refl: true, aux: "e" } },
    convencer: { es: { pres: "convenzo convences convence convencemos convencéis convencen" }, en: { b: "convince" }, de: { inf: "überzeugen" }, fr: { inf: "convaincre", pres: "convaincs convaincs convainc convainquons convainquez convainquent", pp: "convaincu" } },
    diferir: { es: { pres: "difiero difieres difiere diferimos diferís difieren" }, en: { b: "differ" }, de: { inf: "unterscheiden", pres: "unterscheide unterscheidest unterscheidet unterscheiden unterscheidet unterscheiden", pp: "unterschieden", refl: true }, fr: { inf: "différer", pres: "diffère diffères diffère différons différez diffèrent", pp: "différé" } },
    despedirse: { es: { pres: "me despido|te despides|se despide|nos despedimos|os despedís|se despiden" }, en: { b: "say", past: "said", tail: "goodbye" }, de: { inf: "verabschieden", refl: true }, fr: { inf: "prendre", pres: "prends prends prend prenons prenez prennent", pp: "pris", tail: "congé" } },
    tender: { es: { pres: "tiendo tiendes tiende tendemos tendéis tienden" }, en: { b: "tend" }, de: { inf: "tendieren" }, fr: { inf: "tendre", pres: "tends tends tend tendons tendez tendent", pp: "tendu" } },
    agradecer: { es: { pres: "agradezco agradeces agradece agradecemos agradecéis agradecen" }, en: { b: "thank" }, de: { inf: "danken", obj: "d" }, fr: { inf: "remercier" } },
    quedarse: { en: { b: "stay", prog: true }, de: { inf: "bleiben", pp: "geblieben", aux: "s" }, fr: { inf: "rester", aux: "e" } },
    llamarse: { en: { special: true }, de: { inf: "heißen", pres: "heiße heißt heißt heißen heißt heißen", pp: "geheißen" },
      fr: { inf: "appeler", pres: "appelle appelles appelle appelons appelez appellent", refl: true, aux: "e" } },
    gustar: { en: { b: "like" }, de: { inf: "mögen", pres: "mag magst mag mögen mögt mögen", pp: "gemocht" }, fr: { inf: "aimer" } },
    encantar: { en: { b: "love", ing: "loving" }, de: { inf: "lieben" }, fr: { inf: "adorer" } }
  };

  // Tijd- en andere bijwoorden: es | en | de | fr | plaats (t = tijd, aan het eind in het Engels; f = frequentie; d = graad; p = plaats)
  var ADVS = [
    "hoy|today|heute|aujourd'hui|t", "mañana|tomorrow|morgen|demain|t", "ayer|yesterday|gestern|hier|t",
    "todos los días|every day|jeden Tag|tous les jours|t", "cada semana|every week|jede Woche|chaque semaine|t", "cada mañana|every morning|jeden Morgen|chaque matin|t",
    "cada tarde|every afternoon|jeden Nachmittag|chaque après-midi|t", "todas las noches|every night|jede Nacht|chaque nuit|t",
    "ahora|now|jetzt|maintenant|t", "luego|later|später|plus tard|t", "después|afterwards|danach|après|t",
    "antes|before|vorher|avant|t", "pronto|soon|bald|bientôt|t", "esta noche|tonight|heute Abend|ce soir|t",
    "esta mañana|this morning|heute Morgen|ce matin|t", "esta tarde|this afternoon|heute Nachmittag|cet après-midi|t",
    "este fin de semana|this weekend|dieses Wochenende|ce week-end|t", "el fin de semana|at the weekend|am Wochenende|le week-end|t",
    "la semana que viene|next week|nächste Woche|la semaine prochaine|t", "el año que viene|next year|nächstes Jahr|l'année prochaine|t",
    "todos los días|every day|jeden Tag|tous les jours|t", "anoche|last night|gestern Abend|hier soir|t",
    "temprano|early|früh|tôt|t", "tarde|late|spät|tard|t",
    "siempre|always|immer|toujours|f", "a menudo|often|oft|souvent|f", "a veces|sometimes|manchmal|parfois|f",
    "nunca|never|nie|jamais|f", "también|too|auch|aussi|a", "todavía|still|noch|encore|f", "ya|already|schon|déjà|f",
    "mucho|a lot|viel|beaucoup|d", "de aquí|from here|von hier|d'ici|p", "desde casa|from home|von zu Hause aus|à domicile|p", "por teléfono|by phone|per Telefon|par téléphone|p", "con cuidado|carefully|vorsichtig|avec précaution|p", "con prudencia|carefully|vorsichtig|prudemment|p", "más|more|mehr|plus|d", "un poco|a bit|ein bisschen|un peu|d", "poco|not much|wenig|peu|d",
    "bien|well|gut|bien|d", "mal|badly|schlecht|mal|d", "muy bien|very well|sehr gut|très bien|d",
    "despacio|slowly|langsam|lentement|d", "rápido|fast|schnell|vite|d", "juntos|together|zusammen|ensemble|d",
    "solo|alone|allein|seul|d", "otra vez|again|wieder|encore une fois|d", "aquí|here|hier|ici|p", "allí|there|dort|là|p",
    "ahí|there|da|là|p", "en casa|at home|zu Hause|à la maison|p", "fuera|outside|draußen|dehors|p", "cerca|nearby|in der Nähe|près d'ici|p",
    "lejos|far away|weit weg|loin|p"
  ];

  // Uitdrukkingen met tener: es-zelfst. nw. | en (be + bijv.) | de | fr (avoir + ...)
  // de: "n:Hunger" = haben + zelfst. nw.; "d:kalt" = mir ist kalt
  var TENER = [
    "hambre|hungry|n:Hunger|faim", "sed|thirsty|n:Durst|soif", "frío|cold|d:kalt|froid", "calor|hot|d:warm|chaud",
    "sueño|sleepy|a:müde|sommeil", "miedo|afraid|n:Angst|peur", "razón|right|n:Recht|raison", "prisa|in a hurry|n:es eilig|hâte"
  ];

  // Weer: es | en | de | fr
  var WEATHER = [
    "hace frío|It is cold.|Es ist kalt.|Il fait froid.", "hace calor|It is hot.|Es ist heiß.|Il fait chaud.",
    "hacía frío|It was cold.|Es war kalt.|Il faisait froid.", "hacía calor|It was hot.|Es war heiß.|Il faisait chaud.",
    "hace sol|It is sunny.|Die Sonne scheint.|Il fait beau.", "hace viento|It is windy.|Es ist windig.|Il y a du vent.",
    "hace buen tiempo|The weather is nice.|Das Wetter ist schön.|Il fait beau.", "hace mal tiempo|The weather is bad.|Das Wetter ist schlecht.|Il fait mauvais.",
    "va a llover|It is going to rain.|Es wird regnen.|Il va pleuvoir.", "va a nevar|It is going to snow.|Es wird schneien.|Il va neiger.",
    "va a soplar|It is going to be windy.|Es wird windig.|Il va y avoir du vent.", "va a pasar|It is going to happen.|Es wird passieren.|Ça va arriver.",
    "pasa|It happens.|Es passiert.|Ça arrive.", "llueve|It is raining.|Es regnet.|Il pleut.", "está lloviendo|It is raining.|Es regnet.|Il pleut.",
    "nieva|It is snowing.|Es schneit.|Il neige.", "está nevando|It is snowing.|Es schneit.|Il neige.",
    "hace mucho frío|It is very cold.|Es ist sehr kalt.|Il fait très froid.", "hace mucho calor|It is very hot.|Es ist sehr heiß.|Il fait très chaud.",
    "no hace frío|It is not cold.|Es ist nicht kalt.|Il ne fait pas froid.", "no hace calor|It is not hot.|Es ist nicht heiß.|Il ne fait pas chaud."
  ];

  // Vaste zinnen: es | en | de | fr  (beide richtingen)
  var FIXED = [
    "hola|Hello.|Hallo.|Bonjour.", "buenos días|Good morning.|Guten Morgen.|Bonjour.", "buenas tardes|Good afternoon.|Guten Tag.|Bonjour.",
    "buenas noches|Good evening.|Guten Abend.|Bonsoir.", "adiós|Goodbye.|Auf Wiedersehen.|Au revoir.", "hasta luego|See you later.|Bis später.|À plus tard.",
    "hasta mañana|See you tomorrow.|Bis morgen.|À demain.", "hasta pronto|See you soon.|Bis bald.|À bientôt.",
    "gracias|Thank you.|Danke.|Merci.", "muchas gracias|Thank you very much.|Vielen Dank.|Merci beaucoup.",
    "de nada|You're welcome.|Gern geschehen.|De rien.", "por favor|Please.|Bitte.|S'il te plaît.", "perdón|Sorry.|Entschuldigung.|Pardon.",
    "lo siento|I'm sorry.|Es tut mir leid.|Je suis désolé.", "vale|Okay.|Okay.|D'accord.", "sí|Yes.|Ja.|Oui.", "no|No.|Nein.|Non.",
    "claro|Of course.|Natürlich.|Bien sûr.", "de acuerdo|Agreed.|Einverstanden.|D'accord.", "estoy de acuerdo|I agree.|Ich bin einverstanden.|Je suis d'accord.",
    "no estoy de acuerdo|I don't agree.|Ich bin nicht einverstanden.|Je ne suis pas d'accord.",
    "mucho gusto|Nice to meet you.|Freut mich.|Enchanté.", "encantado|Nice to meet you.|Freut mich.|Enchanté.", "encantada|Nice to meet you.|Freut mich.|Enchantée.",
    "qué tal|How are you?|Wie geht's?|Ça va ?", "cómo estás|How are you?|Wie geht es dir?|Comment vas-tu ?", "cómo está usted|How are you?|Wie geht es Ihnen?|Comment allez-vous ?",
    "estoy bien|I'm fine.|Mir geht es gut.|Je vais bien.", "muy bien|Very good.|Sehr gut.|Très bien.", "bien gracias|Fine, thank you.|Gut, danke.|Bien, merci.",
    "y tú|And you?|Und du?|Et toi ?", "y usted|And you?|Und Sie?|Et vous ?",
    "no entiendo|I don't understand.|Ich verstehe das nicht.|Je ne comprends pas.", "no lo entiendo|I don't understand it.|Ich verstehe es nicht.|Je ne le comprends pas.",
    "no sé|I don't know.|Ich weiß es nicht.|Je ne sais pas.", "no lo sé|I don't know.|Ich weiß es nicht.|Je ne sais pas.",
    "qué hora es|What time is it?|Wie spät ist es?|Quelle heure est-il ?", "cuánto cuesta|How much does it cost?|Wie viel kostet das?|Combien ça coûte ?",
    "cuánto es|How much is it?|Wie viel macht das?|C'est combien ?", "la cuenta por favor|The bill, please.|Die Rechnung, bitte.|L'addition, s'il vous plaît.",
    "cómo te llamas|What's your name?|Wie heißt du?|Comment tu t'appelles ?", "cómo se llama usted|What's your name?|Wie heißen Sie?|Comment vous appelez-vous ?",
    "de dónde eres|Where are you from?|Woher kommst du?|D'où viens-tu ?", "de dónde es usted|Where are you from?|Woher kommen Sie?|D'où venez-vous ?",
    "cuántos años tienes|How old are you?|Wie alt bist du?|Quel âge as-tu ?",
    "puedes repetir|Can you repeat that?|Kannst du das wiederholen?|Tu peux répéter ?", "puedes repetir por favor|Can you repeat that, please?|Kannst du das bitte wiederholen?|Tu peux répéter, s'il te plaît ?",
    "más despacio por favor|More slowly, please.|Langsamer, bitte.|Plus lentement, s'il te plaît.", "habla más despacio por favor|Please speak more slowly.|Sprich bitte langsamer.|Parle plus lentement, s'il te plaît.",
    "qué significa|What does it mean?|Was bedeutet das?|Qu'est-ce que ça veut dire ?", "qué pasa|What's happening?|Was ist los?|Qu'est-ce qui se passe ?",
    "no pasa nada|No problem.|Kein Problem.|Ce n'est pas grave.", "qué te pasa|What's wrong?|Was ist los mit dir?|Qu'est-ce que tu as ?",
    "buen provecho|Enjoy your meal.|Guten Appetit.|Bon appétit.", "salud|Cheers.|Prost.|Santé.", "feliz cumpleaños|Happy birthday.|Alles Gute zum Geburtstag.|Joyeux anniversaire.",
    "buen viaje|Have a good trip.|Gute Reise.|Bon voyage.", "buena suerte|Good luck.|Viel Glück.|Bonne chance.", "que te mejores|Get well soon.|Gute Besserung.|Bon rétablissement.",
    "tengo una pregunta|I have a question.|Ich habe eine Frage.|J'ai une question.", "necesito ayuda|I need help.|Ich brauche Hilfe.|J'ai besoin d'aide.",
    "estoy de vacaciones|I'm on holiday.|Ich bin im Urlaub.|Je suis en vacances.", "me da igual|I don't mind.|Das ist mir egal.|Ça m'est égal.",
    "qué hora es|What time is it?|Wie spät ist es?|Quelle heure est-il ?", "a qué hora|At what time?|Um wie viel Uhr?|À quelle heure ?",
    "dónde está el baño|Where is the bathroom?|Wo ist die Toilette?|Où sont les toilettes ?", "te quiero|I love you.|Ich liebe dich.|Je t'aime.",
    "hablas inglés|Do you speak English?|Sprichst du Englisch?|Tu parles anglais ?", "hablo un poco de español|I speak a little Spanish.|Ich spreche ein bisschen Spanisch.|Je parle un peu espagnol.",
    "nos vemos|See you.|Bis dann.|À bientôt.",
    "estás bien|Are you okay?|Geht es dir gut?|Tu vas bien ?", "está bien|It's okay.|Das ist in Ordnung.|C'est bien.",
    "estoy mal|I'm not well.|Mir geht es nicht gut.|Je ne vais pas bien.", "no lo creo|I don't think so.|Das glaube ich nicht.|Je ne crois pas.",
    "no creo|I don't think so.|Ich glaube nicht.|Je ne crois pas.", "creo que sí|I think so.|Ich glaube schon.|Je crois que oui.", "creo que no|I don't think so.|Ich glaube nicht.|Je crois que non.",
    "vamos a ver|Let's see.|Mal sehen.|On va voir.", "vamos|Let's go.|Los geht's.|Allons-y.", "estás de vacaciones|Are you on holiday?|Bist du im Urlaub?|Tu es en vacances ?",
    "me voy|I'm leaving.|Ich gehe jetzt.|Je m'en vais.", "me tengo que ir|I have to go.|Ich muss gehen.|Je dois partir.", "tengo que irme|I have to go.|Ich muss gehen.|Je dois partir.", "bienvenido|Welcome.|Willkommen.|Bienvenue.", "bienvenida|Welcome.|Willkommen.|Bienvenue."
  ];

  // Nederlandse vorm van de vaste zinnen en de weerzinnen (sleutel: de Spaanse zin)
  var FIXED_NL = {"creo que no": "Ik denk het niet.", "hacía frío": "Het was koud.", "hacía calor": "Het was warm.", "hola": "Hallo.", "buenos días": "Goedemorgen.", "buenas tardes": "Goedemiddag.", "buenas noches": "Goedenavond.", "adiós": "Tot ziens.", "hasta luego": "Tot straks.", "hasta mañana": "Tot morgen.", "hasta pronto": "Tot gauw.", "gracias": "Dank je.", "muchas gracias": "Heel erg bedankt.", "de nada": "Graag gedaan.", "por favor": "Alsjeblieft.", "perdón": "Sorry.", "lo siento": "Het spijt me.", "vale": "Oké.", "sí": "Ja.", "no": "Nee.", "claro": "Natuurlijk.", "de acuerdo": "Akkoord.", "estoy de acuerdo": "Ik ben het ermee eens.", "no estoy de acuerdo": "Ik ben het er niet mee eens.", "mucho gusto": "Aangenaam.", "encantado": "Aangenaam.", "encantada": "Aangenaam.", "qué tal": "Hoe gaat het?", "cómo estás": "Hoe gaat het met je?", "cómo está usted": "Hoe gaat het met u?", "estoy bien": "Het gaat goed met me.", "muy bien": "Heel goed.", "bien gracias": "Goed, dank je.", "y tú": "En jij?", "y usted": "En u?", "no entiendo": "Ik begrijp het niet.", "no lo entiendo": "Ik begrijp het niet.", "no sé": "Ik weet het niet.", "no lo sé": "Ik weet het niet.", "qué hora es": "Hoe laat is het?", "cuánto cuesta": "Hoeveel kost het?", "cuánto es": "Hoeveel is het?", "la cuenta por favor": "De rekening, alstublieft.", "cómo te llamas": "Hoe heet je?", "cómo se llama usted": "Hoe heet u?", "de dónde eres": "Waar kom je vandaan?", "de dónde es usted": "Waar komt u vandaan?", "cuántos años tienes": "Hoe oud ben je?", "puedes repetir": "Kun je dat herhalen?", "puedes repetir por favor": "Kun je dat herhalen, alsjeblieft?", "más despacio por favor": "Langzamer, alsjeblieft.", "habla más despacio por favor": "Praat alsjeblieft wat langzamer.", "qué significa": "Wat betekent het?", "qué pasa": "Wat is er aan de hand?", "no pasa nada": "Geen probleem.", "qué te pasa": "Wat is er met je?", "buen provecho": "Eet smakelijk.", "salud": "Proost.", "feliz cumpleaños": "Gefeliciteerd met je verjaardag.", "buen viaje": "Goede reis.", "buena suerte": "Veel succes.", "que te mejores": "Beterschap.", "tengo una pregunta": "Ik heb een vraag.", "necesito ayuda": "Ik heb hulp nodig.", "estoy de vacaciones": "Ik ben op vakantie.", "me da igual": "Het maakt me niet uit.", "a qué hora": "Hoe laat?", "dónde está el baño": "Waar is het toilet?", "te quiero": "Ik hou van je.", "hablas inglés": "Spreek je Engels?", "hablo un poco de español": "Ik spreek een beetje Spaans.", "nos vemos": "Tot ziens.", "estás bien": "Gaat het goed met je?", "está bien": "Het is goed.", "estoy mal": "Het gaat niet goed met me.", "no lo creo": "Ik denk het niet.", "no creo": "Ik denk het niet.", "creo que sí": "Ik denk het wel.", "vamos a ver": "We zullen zien.", "vamos": "Laten we gaan.", "estás de vacaciones": "Ben je op vakantie?", "me voy": "Ik ga weg.", "me tengo que ir": "Ik moet gaan.", "tengo que irme": "Ik moet gaan.", "bienvenido": "Welkom.", "bienvenida": "Welkom.", "hace frío": "Het is koud.", "hace calor": "Het is warm.", "hace sol": "De zon schijnt.", "hace viento": "Het waait.", "hace buen tiempo": "Het is mooi weer.", "hace mal tiempo": "Het is slecht weer.", "llueve": "Het regent.", "pasa": "Het gebeurt.", "va a llover": "Het gaat regenen.", "va a nevar": "Het gaat sneeuwen.", "va a soplar": "Het gaat waaien.", "va a pasar": "Het gaat gebeuren.", "está lloviendo": "Het regent.", "nieva": "Het sneeuwt.", "está nevando": "Het sneeuwt.", "hace mucho frío": "Het is erg koud.", "hace mucho calor": "Het is erg warm.", "no hace frío": "Het is niet koud.", "no hace calor": "Het is niet warm."};


  // ---- Reis- en tijdvragen: elke zin staat in alle talen vast (es|en|de|fr + nl), dus ze werken in elke app en bij elke gebruikerstaal ----
  var FIXED_ALT = [];
  (function () {
    function add(es, nl, en, de, fr, alt) {
      FIXED.push(es + "|" + en + "|" + de + "|" + fr);
      FIXED_NL[es] = nl;
      if (alt) FIXED_ALT.push({ es: es, nl: alt.nl || [], en: alt.en || [], de: alt.de || [], fr: alt.fr || [] });
    }
    // vervoermiddelen: [es, nl, en, de, fr, duitse werkwoord voor vertrek]
    var VEH = [
      ["el autobús", "de bus", "the bus", "der Bus", "le bus", "fährt"], ["el tren", "de trein", "the train", "der Zug", "le train", "fährt"],
      ["el tranvía", "de tram", "the tram", "die Straßenbahn", "le tram", "fährt"], ["el metro", "de metro", "the metro", "die U-Bahn", "le métro", "fährt"],
      ["el avión", "het vliegtuig", "the plane", "das Flugzeug", "l'avion", "fliegt"], ["el barco", "de boot", "the boat", "das Boot", "le bateau", "fährt"]
    ];
    VEH.forEach(function (n) {
      add("a qué hora sale " + n[0], "Hoe laat vertrekt " + n[1] + "?", "What time does " + n[2] + " leave?", "Um wie viel Uhr " + n[5] + " " + n[3] + " ab?", "À quelle heure part " + n[4] + " ?");
      add("a qué hora llega " + n[0], "Hoe laat komt " + n[1] + " aan?", "What time does " + n[2] + " arrive?", "Um wie viel Uhr kommt " + n[3] + " an?", "À quelle heure arrive " + n[4] + " ?");
    });
    // haltes en stations: [es, nl, en, de, fr]
    var STOP = [
      ["la parada de autobús", "de bushalte", "the bus stop", "die Bushaltestelle", "l'arrêt de bus"],
      ["la parada de tranvía", "de tramhalte", "the tram stop", "die Straßenbahnhaltestelle", "l'arrêt de tram"],
      ["la estación de metro", "het metrostation", "the metro station", "die U-Bahn-Station", "la station de métro"]
    ];
    STOP.forEach(function (n) { add("dónde está " + n[0], "Waar is " + n[1] + "?", "Where is " + n[2] + "?", "Wo ist " + n[3] + "?", "Où est " + n[4] + " ?"); });
    // "hoe kom ik bij ...": [es (met a), nl, en, de (met zu), fr (met à)]
    var PL = [
      ["a la estación", "het station", "the station", "zum Bahnhof", "à la gare"], ["al aeropuerto", "het vliegveld", "the airport", "zum Flughafen", "à l'aéroport"],
      ["al centro", "het centrum", "the city centre", "zum Stadtzentrum", "au centre-ville"], ["al hotel", "het hotel", "the hotel", "zum Hotel", "à l'hôtel"],
      ["al museo", "het museum", "the museum", "zum Museum", "au musée"], ["al hospital", "het ziekenhuis", "the hospital", "zum Krankenhaus", "à l'hôpital"],
      ["a la playa", "het strand", "the beach", "zum Strand", "à la plage"], ["al supermercado", "de supermarkt", "the supermarket", "zum Supermarkt", "au supermarché"],
      ["a la farmacia", "de apotheek", "the pharmacy", "zur Apotheke", "à la pharmacie"], ["a la parada de autobús", "de bushalte", "the bus stop", "zur Bushaltestelle", "à l'arrêt de bus"]
    ];
    PL.forEach(function (n) {
      add("cómo llego " + n[0], "Hoe kom ik bij " + n[1] + "?", "How do I get to " + n[2] + "?", "Wie komme ich " + n[3] + "?", "Comment aller " + n[4] + " ?",
        { nl: ["Hoe kom ik naar " + n[1] + "?", "Hoe kom ik er bij " + n[1] + "?"], en: ["How can I get to " + n[2] + "?", "How do I get to " + n[2].replace(/^the /, "the ") + "?"], de: ["Wie komme ich " + n[3].replace(/^zum /, "zum ") + "?", "Wie gelange ich " + n[3] + "?"],
          fr: ["Comment puis-je aller " + n[4] + " ?", "Comment est-ce que j'arrive " + n[4] + " ?", "Comment j'arrive " + n[4] + " ?"] });
    });
    add("cómo llego allí", "Hoe kom ik daar?", "How do I get there?", "Wie komme ich dorthin?", "Comment y aller ?", { nl: ["Hoe kom ik er?", "Hoe kom ik er naartoe?"], en: ["How can I get there?"], de: ["Wie komme ich da hin?", "Wie komme ich dahin?"], fr: ["Comment puis-je y aller ?", "Comment j'y arrive ?"] });
    // Gewone zinnen uit de lijst van de gebruiker (zelf vertaald en goedgekeurd, nl en es); en, de en fr in spreektaal
    add("me levanto todas las mañanas a las siete", "Ik sta elke ochtend om zeven uur op.", "I get up at seven every morning.", "Ich stehe jeden Morgen um sieben Uhr auf.", "Je me lève tous les matins à sept heures.");
    add("él toma el café siempre solo", "Hij drinkt zijn koffie altijd zwart.", "He always drinks his coffee black.", "Er trinkt seinen Kaffee immer schwarz.", "Il boit toujours son café noir.");
    add("le gusta cocinar para sus amigos", "Zij kookt graag voor haar vrienden.", "She likes cooking for her friends.", "Sie kocht gern für ihre Freunde.", "Elle aime cuisiner pour ses amis.");
    add("me sujetas la puerta un momento", "Kun je even de deur voor me openhouden?", "Can you hold the door for me for a moment?", "Kannst du mir kurz die Tür aufhalten?", "Tu peux me tenir la porte un instant ?");
    add("ella friega los platos después de comer", "Ze wast de vaat na het eten.", "She does the dishes after eating.", "Sie spült nach dem Essen ab.", "Elle fait la vaisselle après le repas.");
    add("es hora de sacar la basura", "Het is tijd om de vuilnis buiten te zetten.", "It's time to take out the rubbish.", "Es ist Zeit, den Müll rauszubringen.", "C'est l'heure de sortir la poubelle.");
    add("él pone el despertador a las seis y media", "Hij zet de wekker op half zeven.", "He sets the alarm for half past six.", "Er stellt den Wecker auf halb sieben.", "Il met le réveil à six heures et demie.");
    add("tengo que terminar este informe antes del viernes", "Ik moet dit rapport vóór vrijdag afmaken.", "I have to finish this report before Friday.", "Ich muss diesen Bericht vor Freitag fertig machen.", "Je dois finir ce rapport avant vendredi.");
    add("ella ha encontrado un trabajo nuevo en Utrecht", "Zij heeft een nieuwe baan gevonden in Utrecht.", "She has found a new job in Utrecht.", "Sie hat eine neue Stelle in Utrecht gefunden.", "Elle a trouvé un nouveau travail à Utrecht.");
    add("hablamos del plan con el director", "We bespreken het plan met de directeur.", "We discuss the plan with the director.", "Wir besprechen den Plan mit dem Direktor.", "On discute du plan avec le directeur.");
    add("él escribe un informe cada semana para el equipo", "Hij schrijft elke week een verslag voor het team.", "He writes a report for the team every week.", "Er schreibt jede Woche einen Bericht für das Team.", "Il écrit un rapport pour l'équipe chaque semaine.");
    add("puedes revisar las cifras del resumen", "Kun je de cijfers in het overzicht controleren?", "Can you check the figures in the summary?", "Kannst du die Zahlen in der Übersicht prüfen?", "Tu peux vérifier les chiffres du résumé ?");
    add("el profesor explica la tarea otra vez", "De leraar legt de opdracht nog een keer uit.", "The teacher explains the task again.", "Der Lehrer erklärt die Aufgabe noch einmal.", "Le professeur explique encore une fois le devoir.");
    add("ella se ha apuntado a un curso de inglés", "Ze heeft zich ingeschreven voor een cursus Engels.", "She has signed up for an English course.", "Sie hat sich für einen Englischkurs angemeldet.", "Elle s'est inscrite à un cours d'anglais.");
    add("cogemos el tren a Ámsterdam Central", "Wij nemen de trein naar Amsterdam Centraal.", "We take the train to Amsterdam Central.", "Wir nehmen den Zug nach Amsterdam Centraal.", "On prend le train pour Amsterdam-Central.");
    add("el autobús sale de la estación a las ocho y cuarto", "De bus vertrekt vanaf het station om kwart over acht.", "The bus leaves the station at quarter past eight.", "Der Bus fährt um Viertel nach acht vom Bahnhof ab.", "Le bus part de la gare à huit heures et quart.");
    add("tengo que llevar mi pasaporte al aeropuerto", "Ik moet mijn paspoort meenemen naar het vliegveld.", "I have to take my passport to the airport.", "Ich muss meinen Reisepass zum Flughafen mitnehmen.", "Je dois emporter mon passeport à l'aéroport.");
    add("él va al trabajo en bici todos los días", "Hij fietst elke dag naar zijn werk.", "He cycles to work every day.", "Er fährt jeden Tag mit dem Fahrrad zur Arbeit.", "Il va au travail à vélo tous les jours.");
    add("reservamos un hotel cerca del centro", "We boeken een hotel dicht bij het centrum.", "We book a hotel near the centre.", "Wir buchen ein Hotel in der Nähe des Zentrums.", "On réserve un hôtel près du centre.");
    add("el avión aterriza con veinte minutos de retraso", "Het vliegtuig landt met een vertraging van twintig minuten.", "The plane lands twenty minutes late.", "Das Flugzeug landet mit zwanzig Minuten Verspätung.", "L'avion atterrit avec vingt minutes de retard.");
    add("ella pide una pizza con queso extra", "Zij bestelt een pizza met extra kaas.", "She orders a pizza with extra cheese.", "Sie bestellt eine Pizza mit extra Käse.", "Elle commande une pizza avec du fromage en plus.");
    add("esta noche comemos albóndigas con puré de patatas", "We eten vanavond gehaktballen met aardappelpuree.", "Tonight we're having meatballs with mashed potatoes.", "Heute Abend essen wir Frikadellen mit Kartoffelbrei.", "Ce soir, on mange des boulettes avec de la purée.");
    add("puedes poner la mesa antes de que lleguen los invitados", "Kun je de tafel dekken voordat de gasten komen?", "Can you set the table before the guests arrive?", "Kannst du den Tisch decken, bevor die Gäste kommen?", "Tu peux mettre la table avant que les invités arrivent ?");
    add("él prueba la sopa y le echa un poco de sal", "Hij proeft de soep en voegt wat zout toe.", "He tastes the soup and adds a little salt.", "Er probiert die Suppe und gibt etwas Salz dazu.", "Il goûte la soupe et ajoute un peu de sel.");
    add("hago una lista de la compra para el supermercado", "Ik maak een boodschappenlijstje voor de supermarkt.", "I make a shopping list for the supermarket.", "Ich mache eine Einkaufsliste für den Supermarkt.", "Je fais une liste de courses pour le supermarché.");
    add("me preocupo por mi hermana", "Ik maak me zorgen over mijn zus.", "I'm worried about my sister.", "Ich mache mir Sorgen um meine Schwester.", "Je m'inquiète pour ma sœur.");
    add("ella está muy contenta con la noticia", "Zij is erg blij met het nieuws.", "She is very happy with the news.", "Sie freut sich sehr über die Nachricht.", "Elle est très contente de la nouvelle.");
    add("ella está muy contenta por la noticia", "Zij is erg blij met het nieuws.", "She is very happy with the news.", "Sie freut sich sehr über die Nachricht.", "Elle est très contente de la nouvelle.");
    add("hace años que no nos vemos", "We hebben elkaar al jaren niet gezien.", "We haven't seen each other for years.", "Wir haben uns seit Jahren nicht gesehen.", "Ça fait des années qu'on ne s'est pas vus.");
    add("él llama a su madre los domingos", "Hij belt zijn moeder op zondag.", "He calls his mother on Sundays.", "Er ruft sonntags seine Mutter an.", "Il appelle sa mère le dimanche.");
    add("la tristeza desaparece poco a poco", "Het verdriet verdwijnt langzaam.", "The sadness slowly goes away.", "Die Traurigkeit verschwindet langsam.", "La tristesse disparaît peu à peu.");
    add("llueve toda la mañana", "Het regent al de hele ochtend.", "It's been raining all morning.", "Es regnet schon den ganzen Morgen.", "Il pleut toute la matinée.");
    add("lleva lloviendo toda la mañana", "Het regent al de hele ochtend.", "It's been raining all morning.", "Es regnet schon den ganzen Morgen.", "Il pleut toute la matinée.");
    add("el sol sale a eso de las siete y media", "De zon komt op rond half acht.", "The sun rises at about half past seven.", "Die Sonne geht gegen halb acht auf.", "Le soleil se lève vers sept heures et demie.");
    add("paseamos por el bosque hasta el lago", "We wandelen door het bos naar het meer.", "We walk through the forest to the lake.", "Wir spazieren durch den Wald zum See.", "On se promène dans la forêt jusqu'au lac.");
    add("paseamos por el bosque hacia el lago", "We wandelen door het bos naar het meer.", "We walk through the forest to the lake.", "Wir spazieren durch den Wald zum See.", "On se promène dans la forêt jusqu'au lac.");
    add("las hojas caen de los árboles en otoño", "De bladeren vallen in de herfst van de bomen.", "The leaves fall from the trees in autumn.", "Im Herbst fallen die Blätter von den Bäumen.", "Les feuilles tombent des arbres en automne.");
    add("nos mudamos el mes que viene a una casa más grande", "Wij verhuizen volgende maand naar een grotere woning.", "We're moving to a bigger house next month.", "Wir ziehen nächsten Monat in ein größeres Haus.", "On déménage le mois prochain dans une maison plus grande.");
    add("él arregla el grifo que gotea en el baño", "Hij repareert het lekkende kraantje in de badkamer.", "He fixes the dripping tap in the bathroom.", "Er repariert den tropfenden Wasserhahn im Bad.", "Il répare le robinet qui fuit dans la salle de bains.");
    add("ella pinta las paredes del salón de blanco", "Ze schildert de muren van de woonkamer wit.", "She paints the living room walls white.", "Sie streicht die Wände im Wohnzimmer weiß.", "Elle peint les murs du salon en blanc.");
    add("puedes cerrar la ventana un momento", "Kun je het raam even sluiten?", "Can you close the window for a moment?", "Kannst du kurz das Fenster zumachen?", "Tu peux fermer la fenêtre un instant ?");
    // tijdvragen
    add("a qué hora estás en casa", "Hoe laat ben je thuis?", "What time are you home?", "Um wie viel Uhr bist du zu Hause?", "À quelle heure es-tu à la maison ?", { en: ["What time will you be home?", "What time are you at home?"], fr: ["À quelle heure es-tu chez toi ?"], de: ["Um wie viel Uhr bist du zuhause?"] });
    add("a qué hora llegas a casa", "Hoe laat kom je thuis?", "What time do you get home?", "Um wie viel Uhr kommst du nach Hause?", "À quelle heure rentres-tu à la maison ?", { en: ["What time do you arrive home?", "What time do you come home?"], fr: ["À quelle heure rentres-tu ?", "À quelle heure arrives-tu à la maison ?"], de: ["Um wie viel Uhr kommst du nach Hause an?"] });
    add("a qué hora tengo que estar allí", "Hoe laat moet ik er zijn?", "What time do I have to be there?", "Um wie viel Uhr muss ich dort sein?", "À quelle heure dois-je être là ?", { nl: ["Hoe laat moet ik daar zijn?"], en: ["What time should I be there?", "What time must I be there?"], fr: ["À quelle heure dois-je être là-bas ?"], de: ["Um wie viel Uhr muss ich da sein?"] });
    add("a qué hora quieres comer", "Hoe laat wil je eten?", "What time do you want to eat?", "Um wie viel Uhr willst du essen?", "À quelle heure veux-tu manger ?", { de: ["Um wie viel Uhr möchtest du essen?"], fr: ["À quelle heure voulez-vous manger ?"] });
    add("cuánto cuesta esto", "Hoeveel kost dit?", "How much is this?", "Was kostet das?", "Combien ça coûte ?",
      { nl: ["Wat kost dit?", "Wat kost het?", "Hoeveel kost het?", "Hoeveel kost dat?", "Wat kost dat?"], en: ["How much does this cost?", "How much is it?", "How much does it cost?", "What does this cost?", "How much is that?"],
        de: ["Wie viel kostet das?", "Was kostet es?", "Wie viel kostet es?", "Wie viel kostet dies?"], fr: ["Combien coûte ceci ?", "Combien ça coûte ?", "Ça coûte combien ?", "C'est combien ?", "Combien coûte ça ?"] });
    // meningen: "Ik vind het leuk / niet leuk / mooi ...", "Wat vind je ervan?"
    add("me gusta", "Ik vind het leuk.", "I like it.", "Es gefällt mir.", "Ça me plaît.", { en: ["I like that."], de: ["Das gefällt mir.", "Ich mag es."], fr: ["J'aime ça.", "J'aime bien."] });
    add("no me gusta", "Ik vind het niet leuk.", "I don't like it.", "Es gefällt mir nicht.", "Ça ne me plaît pas.", { en: ["I do not like it.", "I don't like that."], de: ["Das gefällt mir nicht.", "Ich mag es nicht."], fr: ["Je n'aime pas ça.", "Je n'aime pas."] });
    add("te gusta", "Vind je het leuk?", "Do you like it?", "Gefällt es dir?", "Ça te plaît ?", { en: ["Do you like that?"], de: ["Magst du es?"], fr: ["Tu aimes ça ?", "Tu aimes bien ?"] });
    add("no te gusta", "Vind je het niet leuk?", "Don't you like it?", "Gefällt es dir nicht?", "Ça ne te plaît pas ?", { en: ["Do you not like it?"], de: ["Magst du es nicht?"], fr: ["Tu n'aimes pas ça ?"] });
    add("me parece bonito", "Ik vind het mooi.", "I think it's beautiful.", "Ich finde es schön.", "Je le trouve beau.", { en: ["I find it beautiful.", "I think it's pretty.", "I think it's nice."], fr: ["Je trouve ça beau."] });
    add("me parece muy bonito", "Ik vind het erg mooi.", "I think it's very beautiful.", "Ich finde es sehr schön.", "Je le trouve très beau.", { nl: ["Ik vind het heel mooi."], en: ["I find it very beautiful.", "I think it's very pretty."], fr: ["Je trouve ça très beau."] });
    add("no me parece bien", "Ik vind het niet goed.", "I don't think that's good.", "Ich finde das nicht gut.", "Je ne trouve pas ça bien.", { nl: ["Ik vind dat niet goed."], en: ["I don't think it's good.", "I don't think that's right."], de: ["Ich finde es nicht gut."], fr: ["Je ne trouve pas ça bon."] });
    add("me parece mal", "Ik vind het slecht.", "I think it's bad.", "Ich finde es schlecht.", "Je trouve ça mal.", { nl: ["Ik vind dat slecht."], en: ["I find it bad."], fr: ["Je trouve ça mauvais."] });
    add("me parece interesante", "Ik vind het interessant.", "I think it's interesting.", "Ich finde es interessant.", "Je trouve ça intéressant.", { en: ["I find it interesting."] });
    add("me parece difícil", "Ik vind het moeilijk.", "I think it's difficult.", "Ich finde es schwierig.", "Je trouve ça difficile.", { en: ["I find it difficult.", "I think it's hard."] });
    add("me parece fácil", "Ik vind het makkelijk.", "I think it's easy.", "Ich finde es einfach.", "Je trouve ça facile.", { nl: ["Ik vind het gemakkelijk."], en: ["I find it easy."], de: ["Ich finde es leicht."] });
    add("me parece caro", "Ik vind het duur.", "I think it's expensive.", "Ich finde es teuer.", "Je le trouve cher.", { en: ["I find it expensive."], fr: ["Je trouve ça cher."] });
    add("me parece barato", "Ik vind het goedkoop.", "I think it's cheap.", "Ich finde es billig.", "Je le trouve bon marché.", { en: ["I find it cheap."], fr: ["Je trouve ça pas cher."] });
    add("está rico", "Het is lekker.", "It's delicious.", "Es ist lecker.", "C'est bon.", { nl: ["Ik vind het lekker.", "Dat is lekker.", "Het smaakt lekker.", "Ik vind dat lekker."], en: ["It's tasty.", "It tastes good.", "It tastes great.", "It is delicious."], de: ["Es schmeckt gut.", "Das ist lecker.", "Das schmeckt gut.", "Ich finde es lecker."], fr: ["C'est délicieux.", "C'est très bon.", "Ça a bon goût.", "Je trouve ça bon."] });
    add("no está rico", "Het is niet lekker.", "It's not tasty.", "Es ist nicht lecker.", "Ce n'est pas bon.", { nl: ["Ik vind het niet lekker.", "Dat is niet lekker.", "Het smaakt niet lekker."], en: ["It doesn't taste good.", "It is not delicious.", "It's not delicious."], de: ["Es schmeckt nicht gut.", "Das schmeckt nicht gut.", "Ich finde es nicht lecker."], fr: ["Ce n'est pas délicieux.", "Je ne trouve pas ça bon.", "Ça n'a pas bon goût."] });
    add("está muy rico", "Het is erg lekker.", "It's very tasty.", "Es ist sehr lecker.", "C'est très bon.", { nl: ["Ik vind het erg lekker.", "Het is heel lekker.", "Ik vind het heel lekker.", "Het smaakt erg lekker."], en: ["It tastes very good.", "It is very tasty.", "It's really delicious."], de: ["Es schmeckt sehr gut.", "Das ist sehr lecker."], fr: ["C'est délicieux.", "C'est vraiment bon."] });
    add("qué te parece", "Wat vind je ervan?", "What do you think of it?", "Was hältst du davon?", "Qu'en penses-tu ?", { nl: ["Wat vind je daarvan?", "Wat vind je ervan"], en: ["What do you think about it?", "What do you think of that?", "What do you think?"], de: ["Was denkst du darüber?", "Was meinst du dazu?"], fr: ["Qu'est-ce que tu en penses ?", "Que penses-tu de ça ?", "Qu'en dis-tu ?"] });
  })();

  return { FIXED_ALT: FIXED_ALT, FIXED_NL: FIXED_NL, NOUNS: NOUNS, PERSON: PERSON, PROFESSION: PROFESSION, ADJS: ADJS, ADJ_SER_ESTAR: ADJ_SER_ESTAR, NATS: NATS, LANGS: LANGS,
    PLACES: PLACES, VERBS: VERBS, ADVS: ADVS, TENER: TENER, WEATHER: WEATHER, FIXED: FIXED };
})();
