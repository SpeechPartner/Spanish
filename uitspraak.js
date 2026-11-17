// Oefenmateriaal voor de uitspraaktrainer. Spaanse tekst blijft Spaans; uitleg is vertaald.
// Gebruikt de functie m(nl, en, de, fr) uit i18n.js.
var PRON = {
  PAIRS: [
    { a: "pero", b: "perro", tip: m("Tik-r (pero = maar) tegenover getrilde rr (perro = hond).", "Single tap r (pero = but) versus trilled rr (perro = dog).", "Einfaches r (pero = aber) gegenüber gerolltem rr (perro = Hund).", "R simple (pero = mais) contre rr roulé (perro = chien).") },
    { a: "caro", b: "carro", tip: m("Duur tegenover auto. Let op de getrilde rr in carro.", "Expensive versus car. Note the trilled rr in carro.", "Teuer gegenüber Auto. Achte auf das gerollte rr in carro.", "Cher contre voiture. Attention au rr roulé dans carro.") },
    { a: "para", b: "parra", tip: m("Para (voor) met één tik tegenover parra (wijnrank) met een getrilde rr.", "Para (for) with a single tap versus parra (grapevine) with a rolled rr.", "Para (für) mit einfachem r gegenüber parra (Weinranke) mit gerolltem rr.", "Para (pour) avec un r simple contre parra (treille) avec un rr roulé.") },
    { a: "coro", b: "corro", tip: m("Koor tegenover ik ren.", "Choir versus I run.", "Chor gegenüber ich renne.", "Chœur contre je cours.") },
    { a: "vaca", b: "baca", tip: m("b en v klinken in het Spaans hetzelfde; geen verschil in uitspraak.", "b and v sound the same in Spanish; no difference in pronunciation.", "b und v klingen im Spanischen gleich; kein Unterschied in der Aussprache.", "b et v se prononcent pareil en espagnol ; aucune différence.") },
    { a: "jota", b: "gota", tip: m("De j is een keelklank (jota = de letter j), de g in gota (druppel) is zacht, zoals in het Engelse 'go'.", "The j is a throat sound (jota = the letter j); the g in gota (drop) is soft, as in 'go'.", "Das j ist ein Kehllaut (jota = der Buchstabe j); das g in gota (Tropfen) ist weich, wie in „gut“.", "Le j est un son de gorge (jota = la lettre j) ; le g de gota (goutte) est doux, comme dans « gare ».") },
    { a: "pollo", b: "poyo", tip: m("ll wordt meestal als een y-achtig geluid gesproken.", "ll is usually pronounced like a y sound.", "ll wird meist wie ein j-artiger Laut gesprochen.", "ll se prononce en général comme un y.") },
    { a: "ano", b: "año", tip: m("Gewone n tegenover ñ (nj-geluid). De betekenis verandert volledig.", "Plain n versus ñ (ny sound). The meaning changes completely.", "Normales n gegenüber ñ (nj-Laut). Die Bedeutung ändert sich völlig.", "n simple contre ñ (son « gn »). Le sens change complètement.") },
    { a: "casa", b: "caza", tip: m("In Spanje klinkt de z als een zachte Engelse th (caza = jacht) en de s als een s (casa = huis). In Latijns-Amerika klinken ze hetzelfde; de app keurt beide goed.", "In Spain the z sounds like a soft English th (caza = hunt) and the s like an s (casa = house). In Latin America they sound the same; the app accepts both.", "In Spanien klingt das z wie ein weiches englisches th (caza = Jagd) und das s wie ein s (casa = Haus). In Lateinamerika klingen beide gleich; die App akzeptiert beides.", "En Espagne, le z se prononce comme un th anglais doux (caza = chasse) et le s comme un s (casa = maison). En Amérique latine, ils se prononcent pareil ; l'application accepte les deux.") },
    { a: "pero", b: "pera", tip: m("Let op de laatste klinker: pero (maar) eindigt op o, pera (peer) op a.", "Note the last vowel: pero (but) ends in o, pera (pear) in a.", "Achte auf den letzten Vokal: pero (aber) endet auf o, pera (Birne) auf a.", "Attention à la dernière voyelle : pero (mais) finit par o, pera (poire) par a.") }
  ],
  SHADOW: [
    "Quiero aprender español.",
    "¿Dónde está la estación de tren?",
    "Hoy hace mucho frío en la ciudad.",
    "Me gustaría un café con leche, por favor.",
    "Mi hermano trabaja en un restaurante cerca del río.",
    "Ayer fuimos al mercado a comprar frutas y verduras.",
    "¿Puedes repetirlo más despacio, por favor?",
    "Los perros corren rápido por el parque."
  ],
  RR: [
    { t: "r", note: m("Tik met de tongpunt tegen het achterste deel van het tandvlees (één snelle tik).", "Tap the tip of your tongue once against the back of your gum ridge.", "Mit der Zungenspitze einmal kurz hinter dem Zahndamm tippen.", "Donne un seul petit coup de la pointe de la langue derrière les gencives.") },
    { t: "ere", note: m("Oefen 'ere' met één tik per e; herhaal 10 keer.", "Practise 'ere' with one tap per e; repeat 10 times.", "Übe 'ere' mit einem Tipper pro e; wiederhole 10-mal.", "Pratique « ere » avec un coup par e ; répète 10 fois.") },
    { t: "rrrr", note: m("Lang aangehouden getrild geluid; adem uit door je mond.", "A long held trill; breathe out through your mouth.", "Ein lang gehaltenes Rollen; durch den Mund ausatmen.", "Un roulement tenu longtemps ; souffle par la bouche.") },
    { t: "pero", note: m("Eerst de tik, dan de vlotte overgang naar perro.", "First the tap, then a smooth transition to perro.", "Erst der Tipper, dann der flüssige Übergang zu perro.", "D'abord le coup, puis passe en douceur à perro.") },
    { t: "perro", note: m("Getrild rr; zoek de trilling met iets meer lucht.", "Trilled rr; find the vibration with a little more air.", "Gerolltes rr; finde das Vibrieren mit etwas mehr Luft.", "rr roulé ; trouve la vibration avec un peu plus d'air.") },
    { t: "ferrocarril", note: m("Woord voor woord: rr in het midden en aan het eind.", "Word by word: rr in the middle and at the end.", "Wort für Wort: rr in der Mitte und am Ende.", "Mot à mot : rr au milieu et à la fin.") },
    { t: "Ramón corre rápido al ferrocarril.", note: m("Zin met veel r-klanken; vertraag eerst.", "Sentence with many r sounds; slow down first.", "Satz mit vielen r-Lauten; zuerst langsamer sprechen.", "Phrase avec beaucoup de r ; ralentis d'abord.") }
  ],
  DIALOGS: [
    { title: m("Bij het café", "At the café", "Im Café", "Au café"), turns: [
      { say: "¡Hola! ¿Qué le pongo?", ok: ["quiero un café con leche", "un café con leche por favor", "quisiera un café", "un café solo"], model: "Quiero un café con leche, por favor." },
      { say: "¿Lo quiere para llevar o para tomar aquí?", ok: ["para tomar aquí", "para llevar", "aquí", "para llevar por favor"], model: "Para tomar aquí, por favor." },
      { say: "Muy bien. ¿Algo más?", ok: ["no gracias", "nada más", "sí, una tostada", "quisiera una tostada"], model: "No, gracias. Nada más." },
      { say: "Son dos euros cincuenta.", ok: ["aquí tiene", "aquí tiene usted", "gracias", "cuánto es"], model: "Aquí tiene. Gracias." }
    ] },
    { title: m("Een weg vragen", "Asking the way", "Den Weg fragen", "Demander son chemin"), turns: [
      { say: "Hola, ¿en qué le puedo ayudar?", ok: ["dónde está la estación", "perdone dónde está la estación", "necesito ir a la estación", "dónde está el río"], model: "Perdone, ¿dónde está la estación?" },
      { say: "Siga recto y gire a la derecha en la plaza.", ok: ["gracias", "muchas gracias", "está lejos", "cuánto tarda"], model: "Muchas gracias." },
      { say: "De nada. Está a cinco minutos a pie.", ok: ["muchas gracias", "hasta luego", "adiós", "gracias"], model: "Muchas gracias, adiós." }
    ] },
    { title: m("Een afspraak maken", "Making an appointment", "Eine Verabredung treffen", "Fixer un rendez-vous"), turns: [
      { say: "¿Quieres quedar el sábado?", ok: ["sí, a qué hora", "sí, ¿a qué hora?", "sí quiero", "sí claro"], model: "Sí, ¿a qué hora?" },
      { say: "A las cinco en el parque.", ok: ["perfecto", "vale nos vemos", "de acuerdo", "nos vemos allí", "a las cinco está bien"], model: "Perfecto, nos vemos allí." },
      { say: "Genial. ¿Vienes en bici o andando?", ok: ["voy andando", "en bici", "andando", "voy en bici"], model: "Voy andando." }
    ] }
  ]
};
