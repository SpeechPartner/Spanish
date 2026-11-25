// Alledaagse zelfstandige naamwoorden in vijf talen (plaatsen, winkels, vervoer, eten, spullen).
// Vult de woordenlijsten (DICTS, REVS), de geslachten (ZIN_GENDER) en de woordenlijst van de zinsmodule (ZIN_LEX.NOUNS) aan.
// Per woord: nl, nl-geslacht (c = de, n = het), en, de, de-geslacht, fr, fr-geslacht, es, es-geslacht,
// omgekeerd (1 = ook vaste vertaling Spaans -> taal), ontelbaar in het Engels.
// Woorden van meer dan één woord staan met _ (centro_comercial); ALLEDAAGS_MW voegt ze in een zin samen.
// Gemaakt met tests/maak_alledaags.py; laden na dict.js, zin-lex.js en zin-gender.js, vóór zin-core.js.
var ALLEDAAGS = [["bibliotheek", "c", "library", "Bibliothek", "f", "bibliothèque", "f", "biblioteca", "f", 1, 0, ""],
  ["supermarkt", "c", "supermarket", "Supermarkt", "m", "supermarché", "m", "supermercado", "m", 1, 0, ""],
  ["apotheek", "c", "pharmacy", "Apotheke", "f", "pharmacie", "f", "farmacia", "f", 1, 0, ""],
  ["ziekenhuis", "n", "hospital", "Krankenhaus", "n", "hôpital", "m", "hospital", "m", 1, 0, ""],
  ["bakkerij", "c", "bakery", "Bäckerei", "f", "boulangerie", "f", "panadería", "f", 1, 0, ""],
  ["slagerij", "c", "butcher", "Metzgerei", "f", "boucherie", "f", "carnicería", "f", 1, 0, ""],
  ["postkantoor", "n", "post_office", "Post", "f", "poste", "f", "oficina_de_correos", "f", 1, 0, ""],
  ["gemeentehuis", "n", "town_hall", "Rathaus", "n", "mairie", "f", "ayuntamiento", "m", 1, 0, ""],
  ["politiebureau", "n", "police_station", "Polizeiwache", "f", "commissariat", "m", "comisaría", "f", 1, 0, ""],
  ["tankstation", "n", "petrol_station", "Tankstelle", "f", "station_x_service", "f", "gasolinera", "f", 1, 0, ""],
  ["bushalte", "c", "bus_stop", "Bushaltestelle", "f", "arrêt_de_bus", "m", "parada_de_autobús", "f", 1, 0, ""],
  ["metrostation", "n", "metro_station", "U_x_Bahn_x_Station", "f", "station_de_métro", "f", "estación_de_metro", "f", 1, 0, ""],
  ["vliegveld", "n", "airport", "Flughafen", "m", "aéroport", "m", "aeropuerto", "m", 1, 0, ""],
  ["haven", "c", "harbour", "Hafen", "m", "port", "m", "puerto", "m", 1, 0, ""],
  ["strand", "n", "beach", "Strand", "m", "plage", "f", "playa", "f", 1, 0, ""],
  ["museum", "n", "museum", "Museum", "n", "musée", "m", "museo", "m", 1, 0, ""],
  ["kerk", "c", "church", "Kirche", "f", "église", "f", "iglesia", "f", 1, 0, ""],
  ["moskee", "c", "mosque", "Moschee", "f", "mosquée", "f", "mezquita", "f", 1, 0, ""],
  ["park", "n", "park", "Park", "m", "parc", "m", "parque", "m", 1, 0, ""],
  ["markt", "c", "market", "Markt", "m", "marché", "m", "mercado", "m", 1, 0, ""],
  ["bank", "c", "bank", "Bank", "f", "banque", "f", "banco", "m", 0, 0, ""],
  ["geldautomaat", "c", "cash_machine", "Geldautomat", "m", "distributeur", "m", "cajero", "m", 1, 0, ""],
  ["toilet", "n", "toilet", "Toilette", "f", "toilettes", "f", "baño_zzb", "m", 1, 0, "fr"],
  ["hotel", "n", "hotel", "Hotel", "n", "hôtel", "m", "hotel", "m", 1, 0, ""],
  ["camping", "c", "campsite", "Campingplatz", "m", "camping", "m", "camping", "m", 1, 0, ""],
  ["restaurant", "n", "restaurant", "Restaurant", "n", "restaurant", "m", "restaurante", "m", 1, 0, ""],
  ["kapper", "c", "hairdresser", "Friseur", "m", "coiffeur", "m", "peluquería", "f", 1, 0, ""],
  ["bioscoop", "c", "cinema", "Kino", "n", "cinéma", "m", "cine", "m", 0, 0, ""],
  ["theater", "n", "theatre", "Theater", "n", "théâtre", "m", "teatro", "m", 1, 0, ""],
  ["zwembad", "n", "swimming_pool", "Schwimmbad", "n", "piscine", "f", "piscina", "f", 1, 0, ""],
  ["sportschool", "c", "gym", "Fitnessstudio", "n", "salle_de_sport", "f", "gimnasio", "m", 1, 0, ""],
  ["school", "c", "school", "Schule", "f", "école", "f", "escuela", "f", 1, 0, ""],
  ["universiteit", "c", "university", "Universität", "f", "université", "f", "universidad", "f", 1, 0, ""],
  ["station", "n", "station", "Bahnhof", "m", "gare", "f", "estación", "f", 1, 0, ""],
  ["parkeerplaats", "c", "car_park", "Parkplatz", "m", "parking", "m", "aparcamiento", "m", 1, 0, ""],
  ["winkelcentrum", "n", "shopping_centre", "Einkaufszentrum", "n", "centre_commercial", "m", "centro_comercial", "m", 1, 0, ""],
  ["boekwinkel", "c", "bookshop", "Buchhandlung", "f", "librairie", "f", "librería", "f", 1, 0, ""],
  ["kledingwinkel", "c", "clothes_shop", "Bekleidungsgeschäft", "n", "magasin_de_vêtements", "m", "tienda_de_ropa", "f", 1, 0, ""],
  ["winkel", "c", "shop", "Geschäft", "n", "magasin", "m", "tienda", "f", 1, 0, ""],
  ["centrum", "n", "centre", "Zentrum", "n", "centre", "m", "centro", "m", 0, 0, ""],
  ["ingang", "c", "entrance", "Eingang", "m", "entrée", "f", "entrada", "f", 1, 0, ""],
  ["uitgang", "c", "exit", "Ausgang", "m", "sortie", "f", "salida", "f", 1, 0, ""],
  ["lift", "c", "lift", "Aufzug", "m", "ascenseur", "m", "ascensor", "m", 1, 0, ""],
  ["trap", "c", "stairs", "Treppe", "f", "escalier", "m", "escalera", "f", 0, 0, "en"],
  ["receptie", "c", "reception", "Rezeption", "f", "réception", "f", "recepción", "f", 1, 0, ""],
  ["balie", "c", "counter", "Schalter", "m", "guichet", "m", "mostrador", "m", 1, 0, ""],
  ["kassa", "c", "checkout", "Kasse", "f", "caisse", "f", "caja", "f", 0, 0, ""],
  ["perron", "n", "platform", "Bahnsteig", "m", "quai", "m", "andén", "m", 1, 0, ""],
  ["trein", "c", "train", "Zug", "m", "train", "m", "tren", "m", 1, 0, ""],
  ["bus", "c", "bus", "Bus", "m", "bus", "m", "autobús", "m", 1, 0, ""],
  ["tram", "c", "tram", "Straßenbahn", "f", "tram", "m", "tranvía", "m", 1, 0, ""],
  ["metro", "c", "underground", "U_x_Bahn", "f", "métro", "m", "metro", "m", 1, 0, ""],
  ["taxi", "c", "taxi", "Taxi", "n", "taxi", "m", "taxi", "m", 1, 0, ""],
  ["fiets", "c", "bike", "Fahrrad", "n", "vélo", "m", "bici", "f", 1, 0, ""],
  ["auto", "c", "car", "Auto", "n", "voiture", "f", "coche", "m", 1, 0, ""],
  ["boot", "c", "boat", "Boot", "n", "bateau", "m", "barco", "m", 1, 0, ""],
  ["veerboot", "c", "ferry", "Fähre", "f", "ferry", "m", "ferry", "m", 1, 0, ""],
  ["vliegtuig", "n", "plane", "Flugzeug", "n", "avion", "m", "avión", "m", 1, 0, ""],
  ["kaartje", "n", "ticket", "Fahrkarte", "f", "billet", "m", "billete", "m", 1, 0, ""],
  ["paspoort", "n", "passport", "Reisepass", "m", "passeport", "m", "pasaporte", "m", 1, 0, ""],
  ["koffer", "c", "suitcase", "Koffer", "m", "valise", "f", "maleta", "f", 1, 0, ""],
  ["tas", "c", "bag", "Tasche", "f", "sac", "m", "bolso", "m", 0, 0, ""],
  ["portemonnee", "c", "wallet", "Geldbörse", "f", "portefeuille", "m", "cartera", "f", 1, 0, ""],
  ["sleutel", "c", "key", "Schlüssel", "m", "clé", "f", "llave", "f", 0, 0, ""],
  ["telefoon", "c", "phone", "Telefon", "n", "téléphone", "m", "teléfono", "m", 1, 0, ""],
  ["oplader", "c", "charger", "Ladegerät", "n", "chargeur", "m", "cargador", "m", 1, 0, ""],
  ["paraplu", "c", "umbrella", "Regenschirm", "m", "parapluie", "m", "paraguas", "m", 1, 0, ""],
  ["jas", "c", "coat", "Jacke", "f", "manteau", "m", "abrigo", "m", 1, 0, ""],
  ["bril", "c", "glasses", "Brille", "f", "lunettes", "f", "gafas", "f", 1, 0, "enfres"],
  ["kaart", "c", "map", "Karte", "f", "carte", "f", "mapa", "m", 0, 0, ""],
  ["rekening", "c", "bill", "Rechnung", "f", "addition", "f", "cuenta", "f", 0, 0, ""],
  ["bon", "c", "receipt", "Quittung", "f", "reçu", "m", "recibo", "m", 0, 0, ""],
  ["menukaart", "c", "menu", "Speisekarte", "f", "carte", "f", "menú", "m", 1, 0, ""],
  ["fles", "c", "bottle", "Flasche", "f", "bouteille", "f", "botella", "f", 1, 0, ""],
  ["glas", "n", "glass", "Glas", "n", "verre", "m", "vaso", "m", 0, 0, ""],
  ["kopje", "n", "cup", "Tasse", "f", "tasse", "f", "taza", "f", 1, 0, ""],
  ["bord", "n", "plate", "Teller", "m", "assiette", "f", "plato", "m", 0, 0, ""],
  ["vork", "c", "fork", "Gabel", "f", "fourchette", "f", "tenedor", "m", 1, 0, ""],
  ["mes", "n", "knife", "Messer", "n", "couteau", "m", "cuchillo", "m", 1, 0, ""],
  ["lepel", "c", "spoon", "Löffel", "m", "cuillère", "f", "cuchara", "f", 1, 0, ""],
  ["servet", "n", "napkin", "Serviette", "f", "serviette", "f", "servilleta", "f", 1, 0, ""],
  ["ontbijt", "n", "breakfast", "Frühstück", "n", "petit_x_déjeuner", "m", "desayuno", "m", 1, 1, ""],
  ["lunch", "c", "lunch", "Mittagessen", "n", "déjeuner", "m", "almuerzo", "m", 1, 1, ""],
  ["avondeten", "n", "dinner", "Abendessen", "n", "dîner", "m", "cena", "f", 1, 1, ""],
  ["brood", "n", "bread", "Brot", "n", "pain", "m", "pan", "m", 0, 1, ""],
  ["kaas", "c", "cheese", "Käse", "m", "fromage", "m", "queso", "m", 1, 1, ""],
  ["melk", "c", "milk", "Milch", "f", "lait", "m", "leche", "f", 1, 1, ""],
  ["koffie", "c", "coffee", "Kaffee", "m", "café", "m", "café", "m", 0, 1, ""],
  ["thee", "c", "tea", "Tee", "m", "thé", "m", "té", "m", 0, 1, ""],
  ["water", "n", "water", "Wasser", "n", "eau", "f", "agua", "f", 1, 1, ""],
  ["bier", "n", "beer", "Bier", "n", "bière", "f", "cerveza", "f", 1, 1, ""],
  ["wijn", "c", "wine", "Wein", "m", "vin", "m", "vino", "m", 1, 1, ""],
  ["sap", "n", "juice", "Saft", "m", "jus", "m", "zumo", "m", 1, 1, ""],
  ["taart", "c", "cake", "Kuchen", "m", "gâteau", "m", "tarta", "f", 1, 0, ""],
  ["ijs", "n", "ice_cream", "Eis", "n", "glace", "f", "helado", "m", 1, 1, ""],
  ["soep", "c", "soup", "Suppe", "f", "soupe", "f", "sopa", "f", 1, 1, ""],
  ["salade", "c", "salad", "Salat", "m", "salade", "f", "ensalada", "f", 1, 0, ""],
  ["vlees", "n", "meat", "Fleisch", "n", "viande", "f", "carne", "f", 1, 1, ""],
  ["vis", "c", "fish", "Fisch", "m", "poisson", "m", "pescado", "m", 1, 1, ""],
  ["kip", "c", "chicken", "Hähnchen", "n", "poulet", "m", "pollo", "m", 1, 1, ""],
  ["rijst", "c", "rice", "Reis", "m", "riz", "m", "arroz", "m", 1, 1, ""],
  ["aardappel", "c", "potato", "Kartoffel", "f", "pomme_de_terre", "f", "patata", "f", 1, 0, ""],
  ["groente", "c", "vegetables", "Gemüse", "n", "légumes", "m", "verduras", "f", 1, 0, "enfres"],
  ["fruit", "n", "fruit", "Obst", "n", "fruits", "m", "fruta", "f", 1, 1, "fr"],
  ["appel", "c", "apple", "Apfel", "m", "pomme", "f", "manzana", "f", 1, 0, ""],
  ["ei", "n", "egg", "Ei", "n", "œuf", "m", "huevo", "m", 1, 0, ""],
  ["suiker", "c", "sugar", "Zucker", "m", "sucre", "m", "azúcar", "m", 1, 1, ""],
  ["zout", "n", "salt", "Salz", "n", "sel", "m", "sal", "f", 0, 1, ""],
  ["kamer", "c", "room", "Zimmer", "n", "chambre", "f", "habitación", "f", 1, 0, ""],
  ["bed", "n", "bed", "Bett", "n", "lit", "m", "cama", "f", 1, 0, ""],
  ["douche", "c", "shower", "Dusche", "f", "douche", "f", "ducha", "f", 1, 0, ""],
  ["handdoek", "c", "towel", "Handtuch", "n", "serviette", "f", "toalla", "f", 1, 0, ""],
  ["deur", "c", "door", "Tür", "f", "porte", "f", "puerta", "f", 1, 0, ""],
  ["raam", "n", "window", "Fenster", "n", "fenêtre", "f", "ventana", "f", 1, 0, ""],
  ["keuken", "c", "kitchen", "Küche", "f", "cuisine", "f", "cocina", "f", 1, 0, ""],
  ["tuin", "c", "garden", "Garten", "m", "jardin", "m", "jardín", "m", 1, 0, ""],
  ["huis", "n", "house", "Haus", "n", "maison", "f", "casa", "f", 1, 0, ""],
  ["appartement", "n", "flat", "Wohnung", "f", "appartement", "m", "piso", "m", 1, 0, ""],
  ["buurt", "c", "neighbourhood", "Viertel", "n", "quartier", "m", "barrio", "m", 1, 0, ""],
  ["straat", "c", "street", "Straße", "f", "rue", "f", "calle", "f", 1, 0, ""],
  ["plein", "n", "square", "Platz", "m", "place", "f", "plaza", "f", 1, 0, ""],
  ["brug", "c", "bridge", "Brücke", "f", "pont", "m", "puente", "m", 1, 0, ""],
  ["rivier", "c", "river", "Fluss", "m", "rivière", "f", "río", "m", 1, 0, ""],
  ["zee", "c", "sea", "Meer", "n", "mer", "f", "mar", "m", 1, 0, ""],
  ["berg", "c", "mountain", "Berg", "m", "montagne", "f", "montaña", "f", 1, 0, ""],
  ["bos", "n", "forest", "Wald", "m", "forêt", "f", "bosque", "m", 1, 0, ""],
  ["dokter", "c", "doctor", "Arzt", "m", "médecin", "m", "médico", "m", 1, 0, ""],
  ["tandarts", "c", "dentist", "Zahnarzt", "m", "dentiste", "m", "dentista", "m", 1, 0, ""],
  ["huisarts", "c", "GP", "Hausarzt", "m", "médecin_traitant", "m", "médico_de_cabecera", "m", 1, 0, ""],
  ["medicijn", "n", "medicine", "Medikament", "n", "médicament", "m", "medicamento", "m", 1, 0, ""],
  ["pleister", "c", "plaster", "Pflaster", "n", "pansement", "m", "tirita", "f", 1, 0, ""],
  ["ambulance", "c", "ambulance", "Krankenwagen", "m", "ambulance", "f", "ambulancia", "f", 1, 0, ""],
  ["politie", "c", "police", "Polizei", "f", "police", "f", "policía", "f", 1, 0, ""],
  ["brandweer", "c", "fire_brigade", "Feuerwehr", "f", "pompiers", "m", "bomberos", "m", 1, 0, "fres"],
  ["wifi", "c", "wifi", "WLAN", "n", "wifi", "m", "wifi", "m", 1, 1, ""],
  ["wachtwoord", "n", "password", "Passwort", "n", "mot_de_passe", "m", "contraseña", "f", 1, 0, ""],
  ["internet", "n", "internet", "Internet", "n", "internet", "m", "internet", "m", 1, 1, ""],
  ["computer", "c", "computer", "Computer", "m", "ordinateur", "m", "ordenador", "m", 1, 0, ""],
  ["foto", "c", "photo", "Foto", "n", "photo", "f", "foto", "f", 1, 0, ""],
  ["krant", "c", "newspaper", "Zeitung", "f", "journal", "m", "periódico", "m", 1, 0, ""],
  ["boek", "n", "book", "Buch", "n", "livre", "m", "libro", "m", 1, 0, ""],
  ["geld", "n", "money", "Geld", "n", "argent", "m", "dinero", "m", 1, 1, ""],
  ["pinpas", "c", "bank_card", "Bankkarte", "f", "carte_bancaire", "f", "tarjeta", "f", 0, 0, ""],
  ["paspoortcontrole", "c", "passport_control", "Passkontrolle", "f", "contrôle_des_passeports", "m", "control_de_pasaportes", "m", 1, 0, ""],
  ["bagage", "c", "luggage", "Gepäck", "n", "bagages", "m", "equipaje", "m", 1, 1, "fr"],
  ["reservering", "c", "booking", "Reservierung", "f", "réservation", "f", "reserva", "f", 0, 0, ""],
  ["afspraak", "c", "appointment", "Termin", "m", "rendez_x_vous", "m", "cita", "f", 0, 0, ""],
  ["vergadering", "c", "meeting", "Besprechung", "f", "réunion", "f", "reunión", "f", 1, 0, ""],
  ["werk", "n", "work", "Arbeit", "f", "travail", "m", "trabajo", "m", 0, 1, ""],
  ["kantoor", "n", "office", "Büro", "n", "bureau", "m", "oficina", "f", 1, 0, ""],
  ["fabriek", "c", "factory", "Fabrik", "f", "usine", "f", "fábrica", "f", 1, 0, ""],
  ["weer", "n", "weather", "Wetter", "n", "temps", "m", "tiempo", "m", 0, 1, ""],
  ["regen", "c", "rain", "Regen", "m", "pluie", "f", "lluvia", "f", 1, 1, ""],
  ["zon", "c", "sun", "Sonne", "f", "soleil", "m", "sol", "m", 0, 0, ""],
  ["sneeuw", "c", "snow", "Schnee", "m", "neige", "f", "nieve", "f", 1, 1, ""],
  ["wind", "c", "wind", "Wind", "m", "vent", "m", "viento", "m", 1, 1, ""],
  ["feest", "n", "party", "Party", "f", "fête", "f", "fiesta", "f", 0, 0, ""],
  ["verjaardag", "c", "birthday", "Geburtstag", "m", "anniversaire", "m", "cumpleaños", "m", 1, 0, ""],
  ["cadeau", "n", "present", "Geschenk", "n", "cadeau", "m", "regalo", "m", 0, 0, ""],
  ["concert", "n", "concert", "Konzert", "n", "concert", "m", "concierto", "m", 1, 0, ""],
  ["wedstrijd", "c", "match", "Spiel", "n", "match", "m", "partido", "m", 1, 0, ""],
  ["kind", "n", "child", "Kind", "n", "enfant", "m", "niño", "m", 1, 0, ""],
  ["vriend", "c", "friend", "Freund", "m", "ami", "m", "amigo", "m", 1, 0, ""],
  ["buurman", "c", "neighbour", "Nachbar", "m", "voisin", "m", "vecino", "m", 1, 0, ""],
  ["collega", "c", "colleague", "Kollege", "m", "collègue", "m", "compañero", "m", 1, 0, ""],
  ["leraar", "c", "teacher", "Lehrer", "m", "professeur", "m", "profesor", "m", 1, 0, ""],
  ["ober", "c", "waiter", "Kellner", "m", "serveur", "m", "camarero", "m", 1, 0, ""],
  ["chauffeur", "c", "driver", "Fahrer", "m", "chauffeur", "m", "conductor", "m", 1, 0, ""],
  ["hond", "c", "dog", "Hund", "m", "chien", "m", "perro", "m", 1, 0, ""],
  ["kat", "c", "cat", "Katze", "f", "chat", "m", "gato", "m", 1, 0, ""]];
var ALLEDAAGS_MW = (function () {
  var MW = {"en": ["passport control", "shopping centre", "police station", "petrol station", "metro station", "swimming pool", "cash machine", "clothes shop", "fire brigade", "post office", "town hall", "ice cream", "bank card", "bus stop", "car park"], "es": ["control de pasaportes", "oficina de correos", "médico de cabecera", "parada de autobús", "estación de metro", "centro comercial", "tienda de ropa"], "fr": ["contrôle des passeports", "magasin de vêtements", "centre commercial", "station de métro", "médecin traitant", "station-service", "salle de sport", "petit-déjeuner", "pomme de terre", "carte bancaire", "arrêt de bus", "mot de passe", "rendez-vous"], "de": ["U-Bahn-Station", "U-Bahn"]};
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var RE = {};
  Object.keys(MW).forEach(function (l) { RE[l] = MW[l].map(function (w) { return [new RegExp("(^|[^\\wÀ-ÿ'])" + esc(w) + "(?=$|[^\\wÀ-ÿ])", "gi"), w.replace(/-/g, "_x_").replace(/ /g, "_")]; }); });
  // "Where is the post office?" -> "Where is the post_office?"
  function samen(text, l) {
    var t = String(text || "");
    (RE[l] || []).forEach(function (p) { t = t.replace(p[0], function (m0, voor) { return voor + p[1]; }); });
    return t;
  }
  function los(s) { return typeof s === "string" ? s.replace(/_zz[a-h](?![a-z])/g, "").replace(/_x_/gi, "-").replace(/([A-Za-zÀ-ÿ])_(?=[A-Za-zÀ-ÿ])/g, "$1 ") : s; }
  // Spaanse meervoudsvormen die in het Nederlands één ding zijn (las gafas = de bril)
  var ENKEL_NL = {"gafas": 1, "verduras": 1, "bomberos": 1};
  return { samen: samen, los: los, enkelNl: ENKEL_NL };
})();
(function () {
  if (typeof DICTS === "undefined" || typeof REVS === "undefined") return;
  function lc(s) { return String(s).toLowerCase(); }
  var gen = { nl: [], es: [], de: [], fr: [] };
  var bekend = {};
  if (typeof ZIN_LEX !== "undefined" && ZIN_LEX.NOUNS) ZIN_LEX.NOUNS.forEach(function (l) { bekend[l.split("|")[0].replace(/\*$/, "")] = 1; });
  ALLEDAAGS.forEach(function (w) {
    var nl = w[0], en = w[2], de = w[3], fr = w[5], es = w[7], omg = w[9];
    var bron = { nl: lc(nl), en: lc(en), de: lc(de), fr: lc(fr) };
    Object.keys(bron).forEach(function (l) {
      if (!DICTS[l]) return;
      DICTS[l][bron[l]] = es;
      if (REVS[l] && (omg || REVS[l][es] === undefined)) REVS[l][es] = l === "de" ? de : l === "en" ? en : bron[l];
    });
    gen.nl.push(nl + "=" + w[1]); gen.es.push(es + "=" + w[8]); gen.de.push(lc(de) + "=" + w[4]); gen.fr.push(fr + "=" + w[6]);
    // Zinsmodule: enkelvoudige woorden die ze nog niet kent, zodat ze ook voor een werkwoord met dezelfde vorm gaan ("the lift", "la cocina")
    // (w[11]: talen waarin het woord alleen meervoud is: es -> "*", en -> "^", fr -> "pl")
    if (typeof ZIN_LEX !== "undefined" && ZIN_LEX.NOUNS && !bekend[es] && (es + en + de + fr).indexOf("_x_") < 0 && de.indexOf("_") < 0) {
      var mv = w[11] || "";
      ZIN_LEX.NOUNS.push(es + (mv.indexOf("es") >= 0 ? "*" : "") + "|" + en + (mv.indexOf("en") >= 0 ? "^" : (w[10] ? "~" : "")) + "|" + de + " " + w[4] + " -|" + fr + " " + w[6] + (mv.indexOf("fr") >= 0 ? " pl" : ""));
      bekend[es] = 1;
    }
  });
  if (typeof ZIN_GENDER !== "undefined") Object.keys(gen).forEach(function (l) {
    // achteraan: bij het inlezen wint de laatste waarde
    ZIN_GENDER[l] = (ZIN_GENDER[l] ? ZIN_GENDER[l] + "|" : "") + gen[l].join("|");
  });
})();
