// Noodfunctie: noodzinnen, noodnummers per land, de volgorde van een gesprek met de meldkamer,
// en de teksten voor het noodformulier en de overdrachtskaart (Info).
// Alles staat in vijf talen. De app kiest de doeltaal (de taal van het land) en de taal van de gebruiker.
// Bewust geen m(): die zet taalnamen om (Spaans -> Duits), en dat mag hier niet.
// Bronnen van de nummers: zie NOOD.bronnen onderaan. Nagekeken op 27 november 2026.
var NOOD = (function () {
  function t(nl, en, de, fr, es) { return { nl: nl, en: en, de: de, fr: fr, es: es }; }

  // Pas op true zetten bij de publieke release: dan bellen de knoppen echt (tel:-link) na de dubbele bevestiging.
  var ECHT_BELLEN = false;

  // ---------- Noodzinnen ----------
  // z = zin uit het situatieboek (id erbij), x = de extra zin die de situatie veiliger maakt.
  // f = vrouwelijke vorm (als de spreker een vrouw is), alleen waar de taal dat nodig heeft.
  var CATS = [
    { id: "hulp", n: t("Hulp roepen", "Calling for help", "Hilfe rufen", "Appeler à l'aide", "Pedir ayuda") },
    { id: "onwel", n: t("Ziek of onwel", "Ill or unwell", "Krank oder unwohl", "Malade ou pas bien", "Enfermo o indispuesto") },
    { id: "allergie", n: t("Allergie", "Allergy", "Allergie", "Allergie", "Alergia") },
    { id: "diefstal", n: t("Diefstal en verlies", "Theft and loss", "Diebstahl und Verlust", "Vol et perte", "Robo y pérdida") }
  ];
  var ZINNEN = [
    { cat: "hulp", id: "s19-b00",
      z: t("Help! Help me alstublieft!", "Help! Please help me!", "Hilfe! Bitte helfen Sie mir!", "Au secours ! Aidez-moi, s'il vous plaît !", "¡Socorro! ¡Por favor, ayúdeme!"),
      x: t("Bel alstublieft het alarmnummer.", "Please call the emergency services.", "Bitte rufen Sie den Notruf.", "Appelez les secours, s'il vous plaît.", "Llame a emergencias, por favor.") },
    { cat: "hulp", id: "s27-b04",
      z: t("Ik heb hulp nodig.", "I need help.", "Ich brauche Hilfe.", "J'ai besoin d'aide.", "Necesito ayuda."),
      x: t("Het is een noodgeval.", "It's an emergency.", "Es ist ein Notfall.", "C'est une urgence.", "Es una emergencia.") },
    { cat: "hulp", id: "s27-b06",
      z: t("Kunt u een dokter bellen?", "Could you call a doctor?", "Können Sie einen Arzt rufen?", "Pouvez-vous appeler un médecin ?", "¿Puede llamar a un médico?"),
      x: t("Blijft u alstublieft bij mij.", "Please stay with me.", "Bitte bleiben Sie bei mir.", "Restez avec moi, s'il vous plaît.", "Quédese conmigo, por favor.") },
    { cat: "hulp", id: "s19-b04",
      z: t("Ik bel nu. Waar zijn we hier?", "I'm calling now. Where are we?", "Ich rufe jetzt an. Wo sind wir hier?", "J'appelle maintenant. On est où ici ?", "Llamo ahora. ¿Dónde estamos?"),
      x: t("Kunt u het adres voor mij opschrijven?", "Could you write down the address for me?", "Können Sie mir die Adresse aufschreiben?", "Vous pouvez m'écrire l'adresse ?", "¿Me puede escribir la dirección?") },
    { cat: "onwel", id: "s27-b00",
      z: t("Ik voel me niet goed.", "I don't feel well.", "Mir geht es nicht gut.", "Je ne me sens pas bien.", "No me encuentro bien."),
      x: t("Ik heb een dokter nodig.", "I need a doctor.", "Ich brauche einen Arzt.", "J'ai besoin d'un médecin.", "Necesito un médico.") },
    { cat: "onwel", id: "s27-b02",
      z: t("Ik ben duizelig.", "I feel dizzy.", "Mir ist schwindelig.", "J'ai la tête qui tourne.", "Estoy mareado."),
      f: { es: "Estoy mareada." },
      x: t("Mag ik even gaan zitten?", "Can I sit down for a moment?", "Kann ich mich kurz hinsetzen?", "Je peux m'asseoir un moment ?", "¿Puedo sentarme un momento?") },
    { cat: "onwel", id: "s27-b10",
      z: t("Alles draait. Ik kan niet lopen.", "My head is spinning. I can't walk.", "Mir dreht sich alles. Ich kann nicht laufen.", "J'ai la tête qui tourne. Je ne peux pas marcher.", "Me da vueltas la cabeza. No puedo caminar."),
      x: t("Wilt u een ambulance bellen?", "Could you call an ambulance?", "Können Sie einen Krankenwagen rufen?", "Vous pouvez appeler une ambulance ?", "¿Puede llamar a una ambulancia?") },
    { cat: "onwel", id: "s14-b08",
      z: t("Ik gebruik ook andere pillen. Zijn er wisselwerkingen?", "I also take other tablets. Are there interactions?", "Ich nehme auch andere Tabletten. Gibt es Wechselwirkungen?", "Je prends aussi d'autres comprimés. Il y a des interactions ?", "También tomo otras pastillas. ¿Hay interacciones?"),
      x: t("Hier is de lijst van mijn medicijnen.", "Here is the list of my medicines.", "Hier ist die Liste meiner Medikamente.", "Voici la liste de mes médicaments.", "Aquí tiene la lista de mis medicamentos.") },
    // Frans: "fruits à coque" (de allergeengroep); "noix" is alleen de walnoot. Ook zo in het situatieboek verbeterd.
    { cat: "allergie", id: "s26-b00",
      z: t("Ik ben allergisch voor noten.", "I'm allergic to nuts.", "Ich bin allergisch gegen Nüsse.", "Je suis allergique aux fruits à coque.", "Soy alérgico a los frutos secos."),
      f: { es: "Soy alérgica a los frutos secos." },
      x: t("Zitten er noten in dit eten?", "Are there nuts in this food?", "Sind in diesem Essen Nüsse?", "Est-ce qu'il y a des fruits à coque dans ce plat ?", "¿Esta comida lleva frutos secos?") },
    { cat: "diefstal", id: "s32-b04",
      z: t("Mijn telefoon is gestolen.", "My phone has been stolen.", "Mein Handy wurde gestohlen.", "On m'a volé mon téléphone.", "Me han robado el móvil."),
      x: t("Ik wil aangifte doen.", "I want to report it to the police.", "Ich möchte Anzeige erstatten.", "Je veux porter plainte.", "Quiero poner una denuncia.") },
    { cat: "diefstal", id: "s32-b00",
      z: t("Ik heb mijn tas verloren.", "I've lost my bag.", "Ich habe meine Tasche verloren.", "J'ai perdu mon sac.", "He perdido mi bolso."),
      x: t("Mijn paspoort zat erin.", "My passport was in it.", "Mein Reisepass war darin.", "Mon passeport était dedans.", "Mi pasaporte estaba dentro.") },
    { cat: "diefstal", id: "s32-b12",
      z: t("Waar is het dichtstbijzijnde politiebureau?", "Where is the nearest police station?", "Wo ist die nächste Polizeiwache?", "Où est le commissariat le plus proche ?", "¿Dónde está la comisaría más cercana?"),
      x: t("Kunt u de politie voor mij bellen?", "Could you call the police for me?", "Können Sie für mich die Polizei rufen?", "Vous pouvez appeler la police pour moi ?", "¿Puede llamar a la policía por mí?") }
  ];

  // ---------- Noodnummers per land (land = de doeltaal van de app) ----------
  // soort: spoed (levensgevaar), algemeen (geen spoed), anoniem (anoniem melden).
  // hulp: de lijn voor mensen met nare gedachten (zoals 113 in Nederland); staat onderaan de kaart.
  var LAND = {
    nl: {
      kop: t("Noodnummers in Nederland", "Emergency numbers in the Netherlands", "Notrufnummern in den Niederlanden", "Numéros d'urgence aux Pays-Bas", "Números de emergencia en los Países Bajos"),
      spoed: [{ nr: "112", naam: "Alarmnummer 112", d: t("Politie, brandweer en ambulance bij levensgevaar of als er net een misdrijf gebeurt", "Police, fire brigade and ambulance when a life is in danger or a crime is happening", "Polizei, Feuerwehr und Rettungsdienst bei Lebensgefahr oder wenn gerade eine Straftat passiert", "Police, pompiers et ambulance en cas de danger de mort ou de délit en cours", "Policía, bomberos y ambulancia si hay peligro de muerte o un delito en curso") }],
      algemeen: [{ nr: "0900-8844", naam: "Politie (geen spoed)", d: t("Politie als het geen spoed is, bijvoorbeeld om aangifte te doen", "Police when it is not urgent, for example to report a crime", "Polizei, wenn es nicht dringend ist, zum Beispiel für eine Anzeige", "Police quand ce n'est pas urgent, par exemple pour porter plainte", "Policía cuando no es urgente, por ejemplo para poner una denuncia") }],
      anoniem: [{ nr: "0800-7000", naam: "Meld Misdaad Anoniem", d: t("Misdaad anoniem melden, gratis", "Report crime anonymously, free of charge", "Straftaten anonym melden, kostenlos", "Signaler un crime anonymement, gratuit", "Denunciar un delito de forma anónima, gratis") }],
      hulp: { nr: "113", alt: "0800-0113", naam: "113 Zelfmoordpreventie" }
    },
    es: {
      kop: t("Noodnummers in Spanje", "Emergency numbers in Spain", "Notrufnummern in Spanien", "Numéros d'urgence en Espagne", "Números de emergencia en España"),
      spoed: [{ nr: "112", naam: "Emergencias 112", d: t("Alle noodgevallen: politie, Guardia Civil, ambulance en brandweer", "All emergencies: police, Guardia Civil, ambulance and fire brigade", "Alle Notfälle: Polizei, Guardia Civil, Rettungsdienst und Feuerwehr", "Toutes les urgences : police, Guardia Civil, secours médicaux et pompiers", "Todas las emergencias: policía, Guardia Civil, sanitarios y bomberos") }],
      algemeen: [
        { nr: "091", naam: "Policía Nacional", d: t("Nationale politie, vooral in de steden. Bij gevaar: 112", "National police, mainly in cities. If there is danger: 112", "Nationale Polizei, vor allem in Städten. Bei Gefahr: 112", "Police nationale, surtout en ville. En cas de danger : 112", "Policía Nacional, sobre todo en las ciudades. Si hay riesgo: 112") },
        { nr: "062", naam: "Guardia Civil", d: t("Politie op het platteland, op de wegen en aan de kust. Bij gevaar: 112", "Police in rural areas, on the roads and on the coast. If there is danger: 112", "Polizei auf dem Land, auf den Straßen und an der Küste. Bei Gefahr: 112", "Police à la campagne, sur les routes et sur la côte. En cas de danger : 112", "Seguridad en zonas rurales, carreteras y costa. Si hay riesgo: 112") },
        { nr: "902 102 112", naam: "Denuncias para turistas", d: t("Aangifte doen als toerist, in het Engels, Frans, Duits of Italiaans", "Report a crime as a tourist, in English, French, German or Italian", "Anzeige als Tourist, auf Englisch, Französisch, Deutsch oder Italienisch", "Porter plainte en tant que touriste, en anglais, français, allemand ou italien", "Denuncias para turistas extranjeros, en inglés, francés, alemán o italiano") }
      ],
      anoniem: [],
      anoniemNoot: t("Spanje heeft geen landelijk telefoonnummer om anoniem te melden. De Guardia Civil heeft op haar website formulieren om anoniem te melden.", "Spain has no national phone number for anonymous reports. The Guardia Civil has forms on its website for anonymous reports.", "Spanien hat keine landesweite Telefonnummer für anonyme Meldungen. Die Guardia Civil hat auf ihrer Website Formulare für anonyme Meldungen.", "L'Espagne n'a pas de numéro national pour signaler anonymement. La Guardia Civil propose sur son site des formulaires pour signaler anonymement.", "España no tiene un teléfono nacional para denuncias anónimas. La Guardia Civil tiene en su web formularios para comunicar hechos de forma anónima."),
      hulp: { nr: "024", naam: "Línea de atención a la conducta suicida" }
    },
    de: {
      kop: t("Noodnummers in Duitsland", "Emergency numbers in Germany", "Notrufnummern in Deutschland", "Numéros d'urgence en Allemagne", "Números de emergencia en Alemania"),
      spoed: [
        { nr: "112", naam: "Notruf 112", d: t("Brandweer en ambulance", "Fire brigade and ambulance", "Feuerwehr und Rettungsdienst", "Pompiers et ambulance", "Bomberos y ambulancia") },
        { nr: "110", naam: "Polizei-Notruf 110", d: t("Politie bij een noodgeval", "Police in an emergency", "Polizei im Notfall", "Police en cas d'urgence", "Policía en caso de emergencia") }
      ],
      algemeen: [{ nr: "116117", naam: "Ärztlicher Bereitschaftsdienst", d: t("Dokter als het geen levensgevaar is, dag en nacht, gratis", "A doctor when it is not life-threatening, day and night, free of charge", "Ärztliche Hilfe, wenn es nicht lebensbedrohlich ist, rund um die Uhr, kostenlos", "Un médecin quand la vie n'est pas en danger, jour et nuit, gratuit", "Médico cuando no hay peligro de muerte, día y noche, gratis") }],
      anoniem: [],
      anoniemNoot: t("Duitsland heeft geen landelijk telefoonnummer om anoniem te melden. Je kunt een melding doen bij een politiebureau.", "Germany has no national phone number for anonymous reports. You can report something at a police station.", "Deutschland hat keine bundesweite Telefonnummer für anonyme Meldungen. Du kannst dich an eine Polizeiwache wenden.", "L'Allemagne n'a pas de numéro national pour signaler anonymement. Tu peux faire un signalement dans un commissariat.", "Alemania no tiene un teléfono nacional para denuncias anónimas. Puedes acudir a una comisaría."),
      hulp: { nr: "0800 111 0 111", alt: "0800 111 0 222", naam: "TelefonSeelsorge" }
    },
    fr: {
      kop: t("Noodnummers in Frankrijk", "Emergency numbers in France", "Notrufnummern in Frankreich", "Numéros d'urgence en France", "Números de emergencia en Francia"),
      spoed: [
        { nr: "112", naam: "Numéro d'urgence européen", d: t("Elk noodgeval", "Any emergency", "Jeder Notfall", "Toute urgence", "Cualquier emergencia") },
        { nr: "15", naam: "SAMU", d: t("Medisch noodgeval", "Medical emergency", "Medizinischer Notfall", "Urgence médicale", "Emergencia médica") },
        { nr: "17", naam: "Police secours", d: t("Politie: een misdrijf", "Police: a crime", "Polizei: eine Straftat", "Police : une infraction", "Policía: un delito") },
        { nr: "18", naam: "Pompiers", d: t("Brandweer: brand, ongeluk of gevaar", "Fire brigade: fire, accident or danger", "Feuerwehr: Brand, Unfall oder Gefahr", "Pompiers : incendie, accident ou péril", "Bomberos: incendio, accidente o peligro") },
        { nr: "114", naam: "Urgence 114", d: t("Voor wie doof of slechthorend is of niet kan praten: via sms of de app", "For people who are deaf or hard of hearing or cannot speak: by text message or app", "Für Gehörlose, Schwerhörige und Menschen, die nicht sprechen können: per SMS oder App", "Pour les personnes sourdes, malentendantes ou qui ne peuvent pas parler : par SMS ou application", "Para personas sordas o con problemas de audición o que no pueden hablar: por SMS o aplicación") }
      ],
      algemeen: [{ nr: "15", naam: "Service d'accès aux soins (SAS)", d: t("Medisch advies en een dokter vinden, ook als het geen spoed is", "Medical advice and finding a doctor, also when it is not urgent", "Medizinischer Rat und Arztsuche, auch wenn es nicht dringend ist", "Conseil médical et orientation vers un médecin, même si ce n'est pas urgent", "Consejo médico y orientación hacia un médico, también si no es urgente") }],
      anoniem: [],
      anoniemNoot: t("Frankrijk heeft geen landelijk telefoonnummer om anoniem te melden. Je kunt een melding doen bij de politie of de gendarmerie.", "France has no national phone number for anonymous reports. You can report something to the police or the gendarmerie.", "Frankreich hat keine landesweite Telefonnummer für anonyme Meldungen. Du kannst dich an die Polizei oder die Gendarmerie wenden.", "La France n'a pas de numéro national pour signaler anonymement. Tu peux t'adresser à la police ou à la gendarmerie.", "Francia no tiene un teléfono nacional para denuncias anónimas. Puedes acudir a la policía o a la gendarmería."),
      hulp: { nr: "3114", naam: "Numéro national de prévention du suicide" }
    },
    en: {
      kop: t("Noodnummers in het Verenigd Koninkrijk", "Emergency numbers in the United Kingdom", "Notrufnummern im Vereinigten Königreich", "Numéros d'urgence au Royaume-Uni", "Números de emergencia en el Reino Unido"),
      spoed: [
        { nr: "999", naam: "Emergency 999", d: t("Politie, ambulance, brandweer en kustwacht", "Police, ambulance, fire and coastguard", "Polizei, Rettungsdienst, Feuerwehr und Küstenwache", "Police, ambulance, pompiers et garde-côtes", "Policía, ambulancia, bomberos y guardacostas") },
        { nr: "112", naam: "Emergency 112", d: t("Werkt hetzelfde als 999", "Works the same as 999", "Funktioniert wie die 999", "Fonctionne comme le 999", "Funciona igual que el 999") }
      ],
      algemeen: [
        { nr: "101", naam: "Police non-emergency", d: t("Politie als het geen spoed is", "Police when it is not an emergency", "Polizei, wenn es kein Notfall ist", "Police quand ce n'est pas une urgence", "Policía cuando no es una emergencia") },
        { nr: "111", naam: "NHS 111", d: t("Medisch advies als het dringend is, maar geen levensgevaar", "Medical advice when it is urgent but not life-threatening", "Medizinischer Rat, wenn es dringend, aber nicht lebensbedrohlich ist", "Conseil médical quand c'est urgent mais pas vital", "Consejo médico cuando es urgente pero no hay peligro de muerte") }
      ],
      anoniem: [{ nr: "0800 555 111", naam: "Crimestoppers", d: t("Misdaad anoniem melden", "Report crime anonymously", "Straftaten anonym melden", "Signaler un crime anonymement", "Denunciar un delito de forma anónima") }],
      hulp: { nr: "116 123", naam: "Samaritans" }
    }
  };

  // ---------- Gespreksvolgorde met de meldkamer ----------
  // Per land: de stappen in het Engels (groot) en in de taal van het land (eronder).
  var SCRIPT = {
    nl: [
      ["The operator asks where you are and which service you need: police, fire brigade or ambulance.", "De medewerker vraagt waar je bent en welke hulpdienst je nodig hebt: politie, brandweer of ambulance."],
      ["Say which service you need, for example: “Ambulance.”", "Zeg welke hulpdienst je nodig hebt, bijvoorbeeld: “Ambulance.”"],
      ["You are put through to the emergency room in that region.", "Je wordt doorverbonden met de meldkamer in die regio."],
      ["Say what has happened.", "Zeg wat er aan de hand is."],
      ["Say where help is needed: town, street and house number.", "Zeg waar hulp nodig is: plaats, straat en huisnummer."],
      ["Don't speak Dutch well? Say which language you speak.", "Spreek je niet goed Nederlands? Zeg welke taal je spreekt."],
      ["Stay on the line and answer the questions. If the line drops, call 112 again.", "Blijf aan de lijn en beantwoord de vragen. Valt de verbinding weg? Bel dan opnieuw 112."]
    ],
    en: [
      ["The operator says: “Emergency, which service?”", null],
      ["Say the service first: “Ambulance”, “Police”, “Fire” or “Coastguard”. Do not start with “please”: it can sound like “police”.", null],
      ["You are put through to that service.", null],
      ["Say where you are.", null],
      ["Say what has happened.", null],
      ["Need an interpreter? Say which language you speak.", null],
      ["Cannot speak? Press 55 when you are asked. You are put through to the police.", null],
      ["Stay on the line. Do not hang up until you are told to.", null]
    ],
    de: [
      ["112 is for the fire brigade and ambulance. 110 is for the police.", "Die 112 ist für Feuerwehr und Rettungsdienst. Die 110 ist für die Polizei."],
      ["Where? Say exactly where it happened: town, street and house number.", "Wo? Sag genau, wo es passiert ist: Ort, Straße und Hausnummer."],
      ["What happened?", "Was ist passiert?"],
      ["How many people are hurt or ill?", "Wie viele Menschen sind verletzt oder krank?"],
      ["What kind of injuries or symptoms?", "Welche Verletzungen oder Beschwerden gibt es?"],
      ["Don't speak German well? Say which language you speak.", "Du sprichst nicht gut Deutsch? Sag, welche Sprache du sprichst."],
      ["Wait for questions. Do not hang up.", "Warte auf Rückfragen. Leg nicht auf."]
    ],
    es: [
      ["112 is the single emergency number in Spain, for every emergency.", "El 112 es el teléfono único de emergencias en España, para cualquier emergencia."],
      ["Say what has happened: an accident, a fire, a robbery …", "Di qué ha pasado: un accidente, un incendio, un robo…"],
      ["Say where it is: town, street and number, or a landmark nearby.", "Di dónde es: población, calle y número, o un punto de referencia cercano."],
      ["Say how many people are hurt and whether they are conscious.", "Di cuántos heridos hay y si están conscientes."],
      ["Say which language you speak or which country you are from.", "Di qué idioma hablas o de qué país eres."],
      ["Answer the operator's questions calmly. Do not hang up.", "Responde con calma a las preguntas del operador. No cuelgues."]
    ],
    fr: [
      ["112 works for every emergency. 15 is for medical emergencies, 17 for the police and 18 for the fire brigade.", "Le 112 fonctionne pour toutes les urgences. Le 15 est pour les urgences médicales, le 17 pour la police et le 18 pour les pompiers."],
      ["Who are you? Give your name and a phone number where they can reach you.", "Qui es-tu ? Donne ton nom et un numéro où on peut te joindre."],
      ["Where are you? Give the exact address.", "Où es-tu ? Donne l'adresse exacte."],
      ["Why are you calling? Say what has happened.", "Pourquoi tu appelles ? Explique ce qui s'est passé."],
      ["Answer the questions and follow the advice.", "Réponds aux questions et suis les conseils."],
      ["Do not hang up until you are told to.", "Ne raccroche pas avant qu'on te le dise."],
      ["Deaf or unable to speak? Use 114 (text message or app).", "Tu es sourd ou tu ne peux pas parler ? Utilise le 114 (SMS ou application)."]
    ]
  };
  // Voor de Engelse app staat het Engels groot; eronder de taal van de gebruiker
  var SCRIPT_EN_UI = [
    t("De medewerker zegt: “Emergency, which service?”", null, "Die Leitstelle sagt: „Emergency, which service?“", "L'opérateur dit : « Emergency, which service? »", "El operador dice: «Emergency, which service?»"),
    t("Zeg eerst de hulpdienst: “Ambulance”, “Police”, “Fire” of “Coastguard”. Begin niet met “please”: dat kan klinken als “police”.", null, "Sag zuerst den Dienst: „Ambulance“, „Police“, „Fire“ oder „Coastguard“. Fang nicht mit „please“ an: Das kann wie „police“ klingen.", "Dis d'abord le service : « Ambulance », « Police », « Fire » ou « Coastguard ». Ne commence pas par « please » : ça peut sonner comme « police ».", "Di primero el servicio: «Ambulance», «Police», «Fire» o «Coastguard». No empieces con «please»: puede sonar como «police»."),
    t("Je wordt doorverbonden met die hulpdienst.", null, "Du wirst mit diesem Dienst verbunden.", "Tu es mis en relation avec ce service.", "Te pasan con ese servicio."),
    t("Zeg waar je bent.", null, "Sag, wo du bist.", "Dis où tu es.", "Di dónde estás."),
    t("Zeg wat er is gebeurd.", null, "Sag, was passiert ist.", "Dis ce qui s'est passé.", "Di qué ha pasado."),
    t("Heb je een tolk nodig? Zeg welke taal je spreekt.", null, "Brauchst du einen Dolmetscher? Sag, welche Sprache du sprichst.", "Tu as besoin d'un interprète ? Dis quelle langue tu parles.", "¿Necesitas un intérprete? Di qué idioma hablas."),
    t("Kun je niet praten? Druk op 55 als dat gevraagd wordt. Je wordt doorverbonden met de politie.", null, "Du kannst nicht sprechen? Drück die 55, wenn du danach gefragt wirst. Du wirst mit der Polizei verbunden.", "Tu ne peux pas parler ? Appuie sur 55 quand on te le demande. Tu es mis en relation avec la police.", "¿No puedes hablar? Pulsa 55 cuando te lo pidan. Te pasan con la policía."),
    t("Blijf aan de lijn. Hang pas op als dat gezegd wordt.", null, "Bleib dran. Leg erst auf, wenn man es dir sagt.", "Reste en ligne. Ne raccroche pas avant qu'on te le dise.", "No cuelgues hasta que te lo digan.")
  ];
  // Een gewoon (geen spoed) nummer: korte volgorde, in het Engels en in de taal van het land
  var SCRIPT_ALGEMEEN = [
    t("Hallo, mijn naam is …", "Hello, my name is …", "Hallo, mein Name ist …", "Bonjour, je m'appelle …", "Hola, me llamo…"),
    t("Spreekt u Engels?", "Do you speak English?", "Sprechen Sie Englisch?", "Vous parlez anglais ?", "¿Habla inglés?"),
    t("Ik bel omdat …", "I'm calling because …", "Ich rufe an, weil …", "J'appelle parce que…", "Llamo porque…"),
    t("Kunt u dat herhalen, alstublieft?", "Could you repeat that, please?", "Können Sie das bitte wiederholen?", "Vous pouvez répéter, s'il vous plaît ?", "¿Puede repetirlo, por favor?")
  ];
  var SCRIPT_ANONIEM = t("Je hoeft je naam niet te zeggen.", "You do not have to give your name.", "Du musst deinen Namen nicht sagen.", "Tu n'es pas obligé de donner ton nom.", "No tienes que decir tu nombre.");

  // ---------- Teksten van de interface (taal van de gebruiker) ----------
  var UI = {
    tab: t("Nood", "Emergency", "Notfall", "Urgence", "Emergencia"),
    zinnen: t("Zinnen", "Sentences", "Sätze", "Phrases", "Frases"),
    toon: t("Toonstand", "Show mode", "Zeigemodus", "Mode affichage", "Modo mostrar"),
    uitlegLijst: t("Zinnen voor een noodgeval. Onder elke zin staat een extra zin die je erna kunt zeggen. Tik op 🔊 om de zin te laten voorlezen.", "Sentences for an emergency. Under each sentence is an extra sentence you can say next. Tap 🔊 to hear it.", "Sätze für einen Notfall. Unter jedem Satz steht ein weiterer Satz, den du danach sagen kannst. Tippe auf 🔊, um ihn vorlesen zu lassen.", "Des phrases pour une urgence. Sous chaque phrase, il y a une phrase en plus à dire ensuite. Touche 🔊 pour l'écouter.", "Frases para una emergencia. Debajo de cada frase hay otra que puedes decir después. Toca 🔊 para escucharla."),
    uitlegToon: t("Toonstand: grote letters, zodat je je telefoon aan iemand kunt laten zien. Met de pijlen ga je naar de volgende zin.", "Show mode: large letters, so you can show your phone to someone. Use the arrows to go to the next sentence.", "Zeigemodus: große Schrift, damit du dein Handy jemandem zeigen kannst. Mit den Pfeilen gehst du zum nächsten Satz.", "Mode affichage : de grandes lettres, pour montrer ton téléphone à quelqu'un. Les flèches passent à la phrase suivante.", "Modo mostrar: letras grandes para enseñar el móvil a alguien. Con las flechas pasas a la frase siguiente."),
    zegErna: t("Zeg erna", "Say next", "Sag danach", "Dis ensuite", "Di después"),
    vorige: t("Vorige", "Previous", "Zurück", "Précédente", "Anterior"),
    volgende: t("Volgende", "Next", "Weiter", "Suivante", "Siguiente"),
    luister: t("Luister", "Listen", "Anhören", "Écouter", "Escuchar"),
    kaartUitleg: t("Tik op een nummer om te bellen. Met Kopieer zet je het nummer op het klembord.", "Tap a number to call it. Copy puts the number on the clipboard.", "Tippe auf eine Nummer, um anzurufen. Mit Kopieren legst du die Nummer in die Zwischenablage.", "Touche un numéro pour appeler. Copier met le numéro dans le presse-papiers.", "Toca un número para llamar. Copiar pone el número en el portapapeles."),
    spoed: t("Spoed: levensgevaar", "Emergency: danger to life", "Notfall: Lebensgefahr", "Urgence : danger de mort", "Emergencia: peligro de muerte"),
    algemeen: t("Algemeen: geen spoed", "General: not urgent", "Allgemein: kein Notfall", "Général : pas urgent", "General: no urgente"),
    anoniem: t("Anoniem melden", "Report anonymously", "Anonym melden", "Signaler anonymement", "Denunciar de forma anónima"),
    kopieer: t("Kopieer", "Copy", "Kopieren", "Copier", "Copiar"),
    gekopieerd: t("Gekopieerd", "Copied", "Kopiert", "Copié", "Copiado"),
    of: t("of", "or", "oder", "ou", "o"),
    hulpRegel: t("Heb je last van nare gedachten, of ken je iemand die daarmee kampt? Neem dan contact op met {naam}: {nr}. Je kunt dag en nacht bellen.", "Are you struggling with dark thoughts, or do you know someone who is? Contact {naam}: {nr}. You can call day and night.", "Hast du belastende Gedanken, oder kennst du jemanden, dem es so geht? Dann melde dich bei {naam}: {nr}. Du kannst Tag und Nacht anrufen.", "Tu as des idées noires, ou tu connais quelqu'un qui en a ? Contacte {naam} : {nr}. Tu peux appeler jour et nuit.", "¿Tienes pensamientos difíciles, o conoces a alguien que los tiene? Contacta con {naam}: {nr}. Puedes llamar de día y de noche."),
    vraag1: t("Wil je {nr} bellen ({naam})?", "Do you want to call {nr} ({naam})?", "Möchtest du {nr} anrufen ({naam})?", "Tu veux appeler le {nr} ({naam}) ?", "¿Quieres llamar al {nr} ({naam})?"),
    jaBellen: t("Ja, bellen", "Yes, call", "Ja, anrufen", "Oui, appeler", "Sí, llamar"),
    annuleer: t("Annuleren", "Cancel", "Abbrechen", "Annuler", "Cancelar"),
    vraag2Spoed: t("Weet je het zeker? Bel een alarmnummer alleen bij echte nood.", "Are you sure? Only call an emergency number in a real emergency.", "Bist du sicher? Ruf eine Notrufnummer nur in einem echten Notfall an.", "Tu es sûr ? N'appelle un numéro d'urgence qu'en cas de vraie urgence.", "¿Estás seguro? Llama a un número de emergencia solo en una emergencia real."),
    vraag2: t("Weet je zeker dat je dit nummer wilt bellen?", "Are you sure you want to call this number?", "Bist du sicher, dass du diese Nummer anrufen möchtest?", "Tu es sûr de vouloir appeler ce numéro ?", "¿Seguro que quieres llamar a este número?"),
    jaZeker: t("Ja, ik weet het zeker", "Yes, I'm sure", "Ja, ich bin sicher", "Oui, j'en suis sûr", "Sí, estoy seguro"),
    script: t("Zo gaat het gesprek", "How the call goes", "So läuft der Anruf", "Comment se passe l'appel", "Así va la llamada"),
    scriptAlgemeen: t("Handige zinnen voor dit gesprek", "Useful sentences for this call", "Nützliche Sätze für dieses Gespräch", "Phrases utiles pour cet appel", "Frases útiles para esta llamada"),
    testBellen: t("Deze versie belt nog niet zelf. Bel {nr} met de telefoon-app van je toestel.", "This version does not make the call yet. Call {nr} with the phone app on your device.", "Diese Version ruft noch nicht selbst an. Ruf {nr} mit der Telefon-App deines Geräts an.", "Cette version n'appelle pas encore elle-même. Appelle le {nr} avec l'application téléphone de ton appareil.", "Esta versión todavía no llama. Llama al {nr} con la aplicación de teléfono de tu dispositivo."),
    belNu: t("Bel nu", "Call now", "Jetzt anrufen", "Appeler maintenant", "Llamar ahora"),
    terug: t("Terug", "Back", "Zurück", "Retour", "Volver"),
    mijnGegevens: t("Mijn gegevens laten zien", "Show my details", "Meine Daten zeigen", "Montrer mes données", "Mostrar mis datos"),
    sluit: t("Sluiten", "Close", "Schließen", "Fermer", "Cerrar"),
    naarInfo: t("Terug naar de app (Info)", "Back to the app (Info)", "Zurück zur App (Info)", "Retour à l'application (Info)", "Volver a la aplicación (Info)"),
    naarFormulier: t("Naar het formulier (Info)", "To the form (Info)", "Zum Formular (Info)", "Vers le formulaire (Info)", "Ir al formulario (Info)"),
    // Info: formulier en overdrachtskaart
    formTitel: t("Mijn noodgegevens", "My emergency details", "Meine Notfalldaten", "Mes données d'urgence", "Mis datos de emergencia"),
    formUitleg: t("Vul in wat je wilt. Deze gegevens worden alleen op dit toestel bewaard; de app stuurt niets weg. De kaart hieronder zet ze om in gewone zinnen in de taal van het land.", "Fill in what you want. These details are only stored on this device; the app does not send anything. The card below turns them into plain sentences in the language of the country.", "Füll aus, was du möchtest. Diese Daten bleiben nur auf diesem Gerät; die App verschickt nichts. Die Karte darunter macht daraus einfache Sätze in der Sprache des Landes.", "Remplis ce que tu veux. Ces données restent uniquement sur cet appareil ; l'application n'envoie rien. La carte ci-dessous les transforme en phrases simples dans la langue du pays.", "Rellena lo que quieras. Estos datos solo se guardan en este dispositivo; la aplicación no envía nada. La tarjeta de abajo los convierte en frases sencillas en el idioma del país."),
    kaartTitel: t("Mijn gegevens voor de hulpverlener", "My details for the helper", "Meine Daten für die Helfer", "Mes données pour les secours", "Mis datos para quien me atiende"),
    kaartUitleg2: t("Laat deze kaart zien of laat hem voorlezen. Er staat alleen in wat je hebt ingevuld.", "Show this card or let it be read aloud. It only contains what you filled in.", "Zeig diese Karte oder lass sie vorlesen. Sie enthält nur, was du ausgefüllt hast.", "Montre cette carte ou fais-la lire à voix haute. Elle contient seulement ce que tu as rempli.", "Enseña esta tarjeta o haz que la lea en voz alta. Solo contiene lo que has rellenado."),
    kaartLeeg: t("Nog niets ingevuld. Vul eerst het formulier hierboven in.", "Nothing filled in yet. Fill in the form above first.", "Noch nichts ausgefüllt. Füll zuerst das Formular oben aus.", "Rien n'est encore rempli. Remplis d'abord le formulaire ci-dessus.", "Todavía no has rellenado nada. Rellena primero el formulario de arriba."),
    allesVoorlezen: t("Lees alles voor", "Read everything aloud", "Alles vorlesen", "Tout lire à voix haute", "Leer todo en voz alta"),
    wis: t("Wis mijn gegevens", "Delete my details", "Meine Daten löschen", "Effacer mes données", "Borrar mis datos"),
    wisZeker: t("Weet je het zeker? Al je noodgegevens worden gewist.", "Are you sure? All your emergency details will be deleted.", "Bist du sicher? Alle deine Notfalldaten werden gelöscht.", "Tu es sûr ? Toutes tes données d'urgence seront effacées.", "¿Estás seguro? Se borrarán todos tus datos de emergencia."),
    jaWis: t("Ja, wis alles", "Yes, delete everything", "Ja, alles löschen", "Oui, tout effacer", "Sí, borrar todo"),
    bewaard: t("Bewaard op dit toestel", "Saved on this device", "Auf diesem Gerät gespeichert", "Enregistré sur cet appareil", "Guardado en este dispositivo"),
    // Velden
    naam: t("Naam", "Name", "Name", "Nom", "Nombre"),
    geboren: t("Geboortedatum", "Date of birth", "Geburtsdatum", "Date de naissance", "Fecha de nacimiento"),
    taal: t("Welke taal spreek je?", "Which language do you speak?", "Welche Sprache sprichst du?", "Quelle langue parles-tu ?", "¿Qué idioma hablas?"),
    taalAnders: t("Andere taal", "Other language", "Andere Sprache", "Autre langue", "Otro idioma"),
    bloed: t("Bloedgroep", "Blood type", "Blutgruppe", "Groupe sanguin", "Grupo sanguíneo"),
    onbekend: t("Weet ik niet", "I don't know", "Weiß ich nicht", "Je ne sais pas", "No lo sé"),
    nvt: t("Niet van toepassing", "Not applicable", "Trifft nicht zu", "Sans objet", "No procede"),
    nee: t("Nee", "No", "Nein", "Non", "No"),
    ja: t("Ja", "Yes", "Ja", "Oui", "Sí"),
    allergie: t("Heb je allergieën?", "Do you have allergies?", "Hast du Allergien?", "As-tu des allergies ?", "¿Tienes alergias?"),
    adrenaline: t("Ik heb een adrenalinepen bij me", "I carry an adrenaline auto-injector", "Ich habe einen Adrenalin-Autoinjektor dabei", "J'ai un stylo auto-injecteur d'adrénaline sur moi", "Llevo un autoinyector de adrenalina"),
    anders: t("Anders (in je eigen taal)", "Other (in your own language)", "Anderes (in deiner Sprache)", "Autre (dans ta langue)", "Otro (en tu idioma)"),
    medicijn: t("Gebruik je medicijnen?", "Do you take medicines?", "Nimmst du Medikamente?", "Prends-tu des médicaments ?", "¿Tomas medicamentos?"),
    medicijnNamen: t("Welke? (de namen zoals op het doosje)", "Which ones? (the names as on the box)", "Welche? (die Namen wie auf der Packung)", "Lesquels ? (les noms comme sur la boîte)", "¿Cuáles? (los nombres como en la caja)"),
    aandoening: t("Heb je een aandoening?", "Do you have a medical condition?", "Hast du eine Erkrankung?", "As-tu une maladie ?", "¿Tienes alguna enfermedad?"),
    zwanger: t("Ben je zwanger?", "Are you pregnant?", "Bist du schwanger?", "Es-tu enceinte ?", "¿Estás embarazada?"),
    weken: t("Hoeveel weken? (mag leeg)", "How many weeks? (may be empty)", "Wie viele Wochen? (darf leer bleiben)", "Combien de semaines ? (peut rester vide)", "¿Cuántas semanas? (puede quedar vacío)"),
    contact: t("Contactpersoon in nood", "Emergency contact", "Notfallkontakt", "Personne à prévenir", "Contacto de emergencia"),
    contactNaam: t("Naam contactpersoon", "Contact's name", "Name des Kontakts", "Nom du contact", "Nombre del contacto"),
    relatie: t("Wie is het?", "Who is it?", "Wer ist das?", "Qui est-ce ?", "¿Quién es?"),
    telefoon: t("Telefoonnummer (met landnummer, bijv. +31)", "Phone number (with country code, e.g. +44)", "Telefonnummer (mit Ländervorwahl, z. B. +49)", "Numéro de téléphone (avec l'indicatif, par ex. +33)", "Teléfono (con prefijo del país, por ejemplo +34)"),
    verzekering: t("Zorgverzekering", "Health insurance", "Krankenversicherung", "Assurance maladie", "Seguro médico"),
    verzekeraar: t("Naam van de verzekeraar", "Name of the insurer", "Name der Versicherung", "Nom de l'assureur", "Nombre de la aseguradora"),
    polis: t("Polisnummer", "Policy number", "Versicherungsnummer", "Numéro de contrat", "Número de póliza"),
    ehic: t("Ik heb een Europese zorgpas (EHIC)", "I have a European Health Insurance Card (EHIC)", "Ich habe eine Europäische Krankenversicherungskarte (EHIC)", "J'ai la carte européenne d'assurance maladie (CEAM)", "Tengo la tarjeta sanitaria europea (TSE)"),
    keuze: t("Kies …", "Choose …", "Wähle …", "Choisis…", "Elige…")
  };

  // ---------- Formulier: keuzelijsten ----------
  // Elk item: label in de taal van de gebruiker (l) en de tekst in de doeltaal voor de overdrachtskaart (o)
  var TALEN = [
    { id: "nl", l: t("Nederlands", "Dutch", "Niederländisch", "néerlandais", "neerlandés") },
    { id: "en", l: t("Engels", "English", "Englisch", "anglais", "inglés") },
    { id: "de", l: t("Duits", "German", "Deutsch", "allemand", "alemán") },
    { id: "fr", l: t("Frans", "French", "Französisch", "français", "francés") },
    { id: "es", l: t("Spaans", "Spanish", "Spanisch", "espagnol", "español") }
  ];
  var BLOED = ["A+", "A-", "B+", "B-", "AB+", "AB-", "0+", "0-"];
  // Allergie: l = keuze in de taal van de gebruiker; o = de vorm in de zin "Ik ben allergisch voor …"
  // (Frans en Spaans met het voorzetsel en lidwoord erbij)
  var ALLERGIE = [
    { id: "noten", l: t("Noten", "Nuts", "Nüsse", "Fruits à coque (noix, noisettes, amandes…)", "Frutos secos"), o: t("noten", "nuts", "Nüsse", "aux fruits à coque", "a los frutos secos") },
    { id: "pinda", l: t("Pinda's", "Peanuts", "Erdnüsse", "Arachides (cacahuètes)", "Cacahuetes"), o: t("pinda's", "peanuts", "Erdnüsse", "aux arachides", "a los cacahuetes") },
    { id: "gluten", l: t("Gluten", "Gluten", "Gluten", "Gluten", "Gluten"), o: t("gluten", "gluten", "Gluten", "au gluten", "al gluten") },
    { id: "melk", l: t("Melk", "Milk", "Milch", "Lait", "Leche"), o: t("melk", "milk", "Milch", "au lait", "a la leche") },
    { id: "ei", l: t("Eieren", "Eggs", "Eier", "Œufs", "Huevo"), o: t("eieren", "eggs", "Eier", "aux œufs", "al huevo") },
    { id: "schaal", l: t("Schaaldieren", "Shellfish", "Schalentiere", "Crustacés", "Marisco"), o: t("schaaldieren", "shellfish", "Schalentiere", "aux crustacés", "al marisco") },
    { id: "vis", l: t("Vis", "Fish", "Fisch", "Poisson", "Pescado"), o: t("vis", "fish", "Fisch", "au poisson", "al pescado") },
    { id: "soja", l: t("Soja", "Soy", "Soja", "Soja", "Soja"), o: t("soja", "soy", "Soja", "au soja", "a la soja") },
    { id: "penicilline", l: t("Penicilline", "Penicillin", "Penicillin", "Pénicilline", "Penicilina"), o: t("penicilline", "penicillin", "Penicillin", "à la pénicilline", "a la penicilina") },
    { id: "aspirine", l: t("Aspirine", "Aspirin", "Aspirin", "Aspirine", "Aspirina"), o: t("aspirine", "aspirin", "Aspirin", "à l'aspirine", "a la aspirina") },
    { id: "latex", l: t("Latex", "Latex", "Latex", "Latex", "Látex"), o: t("latex", "latex", "Latex", "au latex", "al látex") },
    { id: "steken", l: t("Bijen- en wespensteken", "Bee and wasp stings", "Bienen- und Wespenstiche", "Piqûres d'abeille et de guêpe", "Picaduras de abeja y avispa"), o: t("bijen- en wespensteken", "bee and wasp stings", "Bienen- und Wespenstiche", "aux piqûres d'abeille et de guêpe", "a las picaduras de abeja y avispa") }
  ];
  // Aandoening: o = een hele zin in de doeltaal
  var AANDOENING = [
    { id: "diabetes", l: t("Diabetes", "Diabetes", "Diabetes", "Diabète", "Diabetes"), o: t("Ik heb diabetes.", "I have diabetes.", "Ich habe Diabetes.", "J'ai du diabète.", "Tengo diabetes.") },
    { id: "epilepsie", l: t("Epilepsie", "Epilepsy", "Epilepsie", "Épilepsie", "Epilepsia"), o: t("Ik heb epilepsie.", "I have epilepsy.", "Ich habe Epilepsie.", "Je suis épileptique.", "Tengo epilepsia.") },
    { id: "hart", l: t("Hartaandoening", "Heart condition", "Herzerkrankung", "Maladie cardiaque", "Enfermedad del corazón"), o: t("Ik heb een hartaandoening.", "I have a heart condition.", "Ich habe eine Herzerkrankung.", "J'ai une maladie cardiaque.", "Tengo una enfermedad del corazón.") },
    { id: "astma", l: t("Astma", "Asthma", "Asthma", "Asthme", "Asma"), o: t("Ik heb astma.", "I have asthma.", "Ich habe Asthma.", "J'ai de l'asthme.", "Tengo asma.") },
    { id: "bloeddruk", l: t("Hoge bloeddruk", "High blood pressure", "Hoher Blutdruck", "Hypertension", "Tensión alta"), o: t("Ik heb een hoge bloeddruk.", "I have high blood pressure.", "Ich habe hohen Blutdruck.", "J'ai de l'hypertension.", "Tengo la tensión alta.") },
    { id: "verdunner", l: t("Ik gebruik bloedverdunners", "I take blood thinners", "Ich nehme Blutverdünner", "Je prends des anticoagulants", "Tomo anticoagulantes"), o: t("Ik gebruik bloedverdunners.", "I take blood thinners.", "Ich nehme Blutverdünner.", "Je prends des anticoagulants.", "Tomo anticoagulantes.") }
  ];
  var RELATIE = [
    { id: "vader", l: t("Vader", "Father", "Vater", "Père", "Padre"), o: t("mijn vader", "my father", "mein Vater", "mon père", "mi padre") },
    { id: "moeder", l: t("Moeder", "Mother", "Mutter", "Mère", "Madre"), o: t("mijn moeder", "my mother", "meine Mutter", "ma mère", "mi madre") },
    { id: "partnerm", l: t("Partner (man)", "Partner (man)", "Partner (Mann)", "Compagnon (homme)", "Pareja (hombre)"), o: t("mijn partner", "my partner", "mein Partner", "mon compagnon", "mi pareja") },
    { id: "partnerv", l: t("Partner (vrouw)", "Partner (woman)", "Partnerin (Frau)", "Compagne (femme)", "Pareja (mujer)"), o: t("mijn partner", "my partner", "meine Partnerin", "ma compagne", "mi pareja") },
    { id: "zoon", l: t("Zoon", "Son", "Sohn", "Fils", "Hijo"), o: t("mijn zoon", "my son", "mein Sohn", "mon fils", "mi hijo") },
    { id: "dochter", l: t("Dochter", "Daughter", "Tochter", "Fille", "Hija"), o: t("mijn dochter", "my daughter", "meine Tochter", "ma fille", "mi hija") },
    { id: "broer", l: t("Broer", "Brother", "Bruder", "Frère", "Hermano"), o: t("mijn broer", "my brother", "mein Bruder", "mon frère", "mi hermano") },
    { id: "zus", l: t("Zus", "Sister", "Schwester", "Sœur", "Hermana"), o: t("mijn zus", "my sister", "meine Schwester", "ma sœur", "mi hermana") },
    { id: "vriend", l: t("Vriend", "Friend (man)", "Freund", "Ami", "Amigo"), o: t("een vriend", "a friend", "ein Freund", "un ami", "un amigo") },
    { id: "vriendin", l: t("Vriendin", "Friend (woman)", "Freundin", "Amie", "Amiga"), o: t("een vriendin", "a friend", "eine Freundin", "une amie", "una amiga") }
  ];

  // ---------- Overdrachtskaart: zinnen in de doeltaal ----------
  var O = {
    kop: t("Dit zijn mijn belangrijke medische gegevens.", "This is my important medical information.", "Das sind meine wichtigen medizinischen Angaben.", "Voici mes informations médicales importantes.", "Estos son mis datos médicos importantes."),
    naam: t("Ik heet {x}.", "My name is {x}.", "Ich heiße {x}.", "Je m'appelle {x}.", "Me llamo {x}."),
    geboren: t("Ik ben geboren op {x}.", "I was born on {x}.", "Ich bin am {x} geboren.", "Je suis né le {x}.", "Nací el {x}."),
    geborenF: { fr: "Je suis née le {x}." },
    taal: t("Ik spreek {x}.", "I speak {x}.", "Ich spreche {x}.", "Je parle {x}.", "Hablo {x}."),
    bloed: t("Mijn bloedgroep is {x}.", "My blood type is {x}.", "Meine Blutgruppe ist {x}.", "Mon groupe sanguin est {x}.", "Mi grupo sanguíneo es {x}."),
    allergie: t("Ik ben allergisch voor {x}.", "I'm allergic to {x}.", "Ich bin allergisch gegen {x}.", "Je suis allergique {x}.", "Tengo alergia {x}."),
    geenAllergie: t("Ik heb geen bekende allergieën.", "I have no known allergies.", "Ich habe keine bekannten Allergien.", "Je n'ai pas d'allergie connue.", "No tengo alergias conocidas."),
    andereAllergie: t("Andere allergieën (in mijn eigen taal): {x}", "Other allergies (in my own language): {x}", "Weitere Allergien (in meiner Sprache): {x}", "Autres allergies (dans ma langue) : {x}", "Otras alergias (en mi idioma): {x}"),
    adrenaline: t("Ik heb een adrenalinepen bij me.", "I carry an adrenaline auto-injector.", "Ich habe einen Adrenalin-Autoinjektor dabei.", "J'ai un stylo auto-injecteur d'adrénaline sur moi.", "Llevo un autoinyector de adrenalina."),
    medicijn: t("Ik gebruik deze medicijnen: {x}.", "I take these medicines: {x}.", "Ich nehme diese Medikamente: {x}.", "Je prends ces médicaments : {x}.", "Tomo estos medicamentos: {x}."),
    geenMedicijn: t("Ik gebruik geen medicijnen.", "I don't take any medicines.", "Ich nehme keine Medikamente.", "Je ne prends pas de médicaments.", "No tomo ningún medicamento."),
    geenAandoening: t("Ik heb geen bekende aandoeningen.", "I have no known medical conditions.", "Ich habe keine bekannten Erkrankungen.", "Je n'ai pas de maladie connue.", "No tengo ninguna enfermedad conocida."),
    andereAandoening: t("Andere aandoeningen (in mijn eigen taal): {x}", "Other conditions (in my own language): {x}", "Weitere Erkrankungen (in meiner Sprache): {x}", "Autres maladies (dans ma langue) : {x}", "Otras enfermedades (en mi idioma): {x}"),
    zwanger: t("Ik ben zwanger.", "I am pregnant.", "Ich bin schwanger.", "Je suis enceinte.", "Estoy embarazada."),
    zwangerWeken: t("Ik ben {x} weken zwanger.", "I am {x} weeks pregnant.", "Ich bin in der {x}. Woche schwanger.", "Je suis enceinte de {x} semaines.", "Estoy embarazada de {x} semanas."),
    nietZwanger: t("Ik ben niet zwanger.", "I am not pregnant.", "Ich bin nicht schwanger.", "Je ne suis pas enceinte.", "No estoy embarazada."),
    contact: t("Bel in nood alstublieft {x}.", "In an emergency, please call {x}.", "Bitte im Notfall anrufen: {x}.", "En cas d'urgence, appelez {x}, s'il vous plaît.", "En caso de emergencia, llame a {x}, por favor."),
    verzekering: t("Mijn zorgverzekering is {x}.", "My health insurance is {x}.", "Meine Krankenversicherung ist {x}.", "Mon assurance maladie est {x}.", "Mi seguro médico es {x}."),
    polis: t("Mijn polisnummer is {x}.", "My policy number is {x}.", "Meine Versicherungsnummer ist {x}.", "Mon numéro de contrat est {x}.", "Mi número de póliza es {x}."),
    ehic: t("Ik heb een Europese zorgpas (EHIC).", "I have a European Health Insurance Card (EHIC).", "Ich habe eine Europäische Krankenversicherungskarte (EHIC).", "J'ai la carte européenne d'assurance maladie.", "Tengo la tarjeta sanitaria europea."),
    en: t("en", "and", "und", "et", "y"),
    positief: t("positief", "positive", "positiv", "positif", "positivo"),
    negatief: t("negatief", "negative", "negativ", "négatif", "negativo")
  };
  var MAAND = {
    nl: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
    fr: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    es: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
  };
  function datum(iso, d) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
    if (!m) return null;
    var j = +m[1], mi = +m[2] - 1, dag = +m[3];
    if (mi < 0 || mi > 11 || dag < 1 || dag > 31) return null;
    var mn = MAAND[d][mi];
    if (d === "de") return dag + ". " + mn + " " + j;
    if (d === "es") return dag + " de " + mn + " de " + j;
    if (d === "fr") return (dag === 1 ? "1er" : dag) + " " + mn + " " + j;
    return dag + " " + mn + " " + j;
  }
  function lijst(items, d) {
    if (!items.length) return "";
    if (items.length === 1) return items[0];
    var en = O.en[d];
    // Spaans: "y" wordt "e" voor een woord dat met een i-klank begint
    if (d === "es" && /^(i|hi)[^aeiouáéó]/i.test(items[items.length - 1])) en = "e";
    return items.slice(0, -1).join(", ") + " " + en + " " + items[items.length - 1];
  }
  function bloedTekst(bg, d) {
    var mm = /^(A|B|AB|0)([+-])$/.exec(bg || "");
    if (!mm) return null;
    var letter = mm[1] === "0" && (d === "en" || d === "fr") ? "O" : mm[1];
    return letter + " " + (mm[2] === "+" ? O.positief[d] : O.negatief[d]);
  }
  function vul(s, x) { return String(s).replace("{x}", x); }
  function zoek(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  // Maakt de zinnen voor de overdrachtskaart. g = gegevens uit het formulier, d = doeltaal, u = taal van de gebruiker,
  // vrouw = de gebruiker heeft als geslacht vrouw gekozen. Elke regel: { o: zin in de doeltaal, u: dezelfde zin in de taal van de gebruiker }.
  function overdracht(g, d, u, vrouw) {
    g = g || {};
    var uit = [];
    function regel(fn) { var o = fn(d), b = fn(u); if (o) uit.push({ o: o, u: b || o }); }
    var naam = String(g.naam || "").trim();
    if (naam) regel(function (l) { return vul(O.naam[l], naam); });
    var dt = g.geboren;
    if (datum(dt, d)) regel(function (l) { return vul(vrouw && O.geborenF[l] ? O.geborenF[l] : O.geboren[l], datum(dt, l)); });
    if (g.taal === "anders" && String(g.taalAnders || "").trim()) { var ta = String(g.taalAnders).trim(); regel(function (l) { return vul(O.taal[l], ta); }); }
    else if (zoek(TALEN, g.taal)) { var tl = zoek(TALEN, g.taal); regel(function (l) { return vul(O.taal[l], tl.l[l]); }); }
    if (bloedTekst(g.bloed, d)) regel(function (l) { return vul(O.bloed[l], bloedTekst(g.bloed, l)); });
    if (g.allergie === "nee") regel(function (l) { return O.geenAllergie[l]; });
    else if (g.allergie === "ja") {
      var al = (g.allergieen || []).map(function (id) { return zoek(ALLERGIE, id); }).filter(Boolean);
      if (al.length) regel(function (l) { return vul(O.allergie[l], lijst(al.map(function (a) { return a.o[l]; }), l)); });
      var aa = String(g.allergieAnders || "").trim();
      if (aa) regel(function (l) { return vul(O.andereAllergie[l], aa); });
      if (g.adrenaline) regel(function (l) { return O.adrenaline[l]; });
    }
    if (g.medicijn === "nee") regel(function (l) { return O.geenMedicijn[l]; });
    else if (g.medicijn === "ja" && String(g.medicijnen || "").trim()) { var md = String(g.medicijnen).trim().replace(/[.\s]+$/, ""); regel(function (l) { return vul(O.medicijn[l], md); }); }
    if (g.aandoening === "nee") regel(function (l) { return O.geenAandoening[l]; });
    else if (g.aandoening === "ja") {
      (g.aandoeningen || []).forEach(function (id) { var a = zoek(AANDOENING, id); if (a) regel(function (l) { return a.o[l]; }); });
      var ad = String(g.aandoeningAnders || "").trim();
      if (ad) regel(function (l) { return vul(O.andereAandoening[l], ad); });
    }
    if (g.zwanger === "ja") {
      var wk = parseInt(g.weken, 10);
      if (wk > 0 && wk < 45) regel(function (l) { return vul(O.zwangerWeken[l], String(wk)); });
      else regel(function (l) { return O.zwanger[l]; });
    } else if (g.zwanger === "nee") regel(function (l) { return O.nietZwanger[l]; });
    var cn = String(g.contactNaam || "").trim(), ct = String(g.contactTel || "").trim(), rel = zoek(RELATIE, g.relatie);
    if (cn || ct) regel(function (l) {
      var wie = cn ? (rel ? rel.o[l] + ", " + cn : cn) : (rel ? rel.o[l] : "");
      return vul(O.contact[l], (wie ? wie + (ct ? (l === "fr" ? " : " : ": ") : "") : "") + ct);
    });
    var vz = String(g.verzekeraar || "").trim(), pn = String(g.polis || "").trim();
    if (vz) regel(function (l) { return vul(O.verzekering[l], vz); });
    if (pn) regel(function (l) { return vul(O.polis[l], pn); });
    if (g.ehic) regel(function (l) { return O.ehic[l]; });
    if (uit.length) uit.unshift({ o: O.kop[d], u: O.kop[u] });
    return uit;
  }

  var BRONNEN = [
    "rijksoverheid.nl: wat gebeurt er als ik alarmnummer 112 bel; politie.nl/en/contact (0900-8844, 0800-7000); 113.nl (113, 0800-0113)",
    "interior.gob.es (112, 091, 062); juntadeandalucia.es (902 102 112 voor toeristen); sanidad.gob.es/linea024 (024)",
    "barmer.de en gesund.bund.de (112, 110, 116117); telefonseelsorge.de (0800 111 0 111, 0800 111 0 222); W-Fragen: DGUV",
    "service-public.fr (112, 15, 17, 18, 114, SAS via 15); sante.fr (3114)",
    "gov.uk 999 en 112; childline.org.uk (55); 111.wales.nhs.uk (please/police); crimestoppers-uk.org (0800 555 111); samaritans (116 123)"
  ];

  return { echtBellen: ECHT_BELLEN, cats: CATS, zinnen: ZINNEN, land: LAND, script: SCRIPT, scriptEnUi: SCRIPT_EN_UI,
    scriptAlgemeen: SCRIPT_ALGEMEEN, scriptAnoniem: SCRIPT_ANONIEM, ui: UI, talen: TALEN, bloed: BLOED, allergie: ALLERGIE,
    aandoening: AANDOENING, relatie: RELATIE, overdracht: overdracht, datum: datum, bronnen: BRONNEN };
})();
