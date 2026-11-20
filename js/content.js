// Inhoud van de gids. Elke zin heeft een Spaanse tekst (es) en een vertaling
// per taal (m: nl, en, de, fr). Het Spaans zelf blijft Spaans.
function p(es, nl, en, de, fr) { return { es: es, m: m(nl, en, de, fr) }; }

// ---------- Zinnen per categorie ----------
var PHRASES = {
  "Gesprek openen": [
    p("¿Qué tal?", "Hoe gaat het?", "How's it going?", "Wie geht's?", "Ça va ?"),
    p("Cuénteme cómo fue su fin de semana.", "Vertelt u eens hoe uw weekend was.", "Tell me how your weekend was.", "Erzählen Sie, wie Ihr Wochenende war.", "Dites-moi comment s'est passé votre week-end."),
    p("Me alegro de verle.", "Leuk u te zien.", "Nice to see you.", "Schön, Sie zu sehen.", "Ravi de vous voir.")
  ],
  "Doorvragen": [
    p("¿Y tú?", "En jij?", "And you?", "Und du?", "Et toi ?"),
    p("¿Cómo fue?", "Hoe was het?", "How was it?", "Wie war es?", "Comment ça s'est passé ?"),
    p("¿Por qué?", "Waarom?", "Why?", "Warum?", "Pourquoi ?"),
    p("¿Desde cuándo?", "Sinds wanneer?", "Since when?", "Seit wann?", "Depuis quand ?"),
    p("Cuéntame más.", "Vertel meer.", "Tell me more.", "Erzähl mehr.", "Raconte-moi plus."),
    p("¿Qué pasó después?", "Wat gebeurde er daarna?", "What happened after that?", "Was ist danach passiert?", "Qu'est-ce qui s'est passé après ?")
  ],
  "Meningen geven": [
    p("Creo que sí.", "Ik denk van wel.", "I think so.", "Ich glaube schon.", "Je crois que oui."),
    p("Creo que no.", "Ik denk van niet.", "I don't think so.", "Ich glaube nicht.", "Je crois que non."),
    p("Me parece bien.", "Ik vind het goed.", "I think that's fine.", "Das finde ich gut.", "Ça me paraît bien."),
    p("Me parece un poco raro.", "Ik vind het een beetje raar.", "I think it's a bit strange.", "Das finde ich etwas komisch.", "Ça me paraît un peu bizarre."),
    p("A mí me gusta mucho.", "Ik vind het erg leuk.", "I really like it.", "Ich mag es sehr.", "Moi, j'aime beaucoup."),
    p("Yo no estoy de acuerdo.", "Ik ben het er niet mee eens.", "I don't agree.", "Ich bin nicht einverstanden.", "Je ne suis pas d'accord.")
  ],
  "Tijd winnen": [
    p("A ver...", "Even kijken...", "Let me see...", "Mal sehen...", "Voyons voir..."),
    p("Espera, lo pienso.", "Wacht, ik denk even na.", "Wait, let me think.", "Warte, ich denke kurz nach.", "Attends, je réfléchis."),
    p("Déjame pensar.", "Laat me nadenken.", "Let me think.", "Lass mich nachdenken.", "Laisse-moi réfléchir."),
    p("Bueno, pues...", "Nou, dan...", "Well, then...", "Also, na ja...", "Eh bien, alors...")
  ],
  "Herhaling vragen": [
    p("¿Puedes repetirlo, por favor?", "Kun je dat herhalen, alsjeblieft?", "Can you repeat that, please?", "Kannst du das bitte wiederholen?", "Tu peux le répéter, s'il te plaît ?"),
    p("Más despacio, por favor.", "Iets langzamer, alsjeblieft.", "Slower, please.", "Etwas langsamer, bitte.", "Plus lentement, s'il te plaît."),
    p("No entiendo.", "Ik begrijp het niet.", "I don't understand.", "Ich verstehe nicht.", "Je ne comprends pas."),
    p("¿Qué significa...?", "Wat betekent...?", "What does ... mean?", "Was bedeutet ...?", "Que signifie... ?")
  ],
  "Afronden": [
    p("Tengo que irme.", "Ik moet gaan.", "I have to go.", "Ich muss gehen.", "Je dois y aller."),
    p("Me alegro de verte.", "Leuk je gezien te hebben.", "Nice to have seen you.", "Schön, dich gesehen zu haben.", "Ravi de t'avoir vu."),
    p("Hablamos luego.", "We praten later.", "Let's talk later.", "Wir sprechen später.", "On se parle plus tard."),
    p("Nos vemos.", "Tot ziens.", "See you.", "Bis bald.", "À bientôt.")
  ],
  "Bedanken": [
    p("Muchas gracias por la oferta.", "Heel erg bedankt voor het aanbod.", "Thank you so much for the offer.", "Vielen Dank für das Angebot.", "Merci beaucoup pour la proposition."),
    p("Es muy amable de tu parte, gracias.", "Dat is erg aardig van je, bedankt.", "That's very kind of you, thank you.", "Das ist sehr nett von dir, danke.", "C'est très gentil de ta part, merci."),
    p("Muchas gracias, pero no hace falta.", "Heel erg bedankt, maar het hoeft niet.", "Thank you very much, but there's no need.", "Vielen Dank, aber das ist nicht nötig.", "Merci beaucoup, mais ce n'est pas nécessaire."),
    p("Gracias de verdad por tu ayuda.", "Echt bedankt voor je hulp.", "Thank you truly for your help.", "Wirklich danke für deine Hilfe.", "Merci vraiment pour ton aide."),
    p("Te agradezco que hayas pensado en mí.", "Bedankt dat je aan mij hebt gedacht.", "I appreciate that you thought of me.", "Danke, dass du an mich gedacht hast.", "Merci d'avoir pensé à moi."),
    p("Te lo agradezco de corazón.", "Ik ben je er oprecht dankbaar voor.", "I'm sincerely grateful to you for it.", "Ich bin dir von Herzen dankbar.", "Je t'en remercie du fond du cœur."),
    p("Gracias por todo lo que has hecho por mí.", "Bedankt voor alles wat je voor me hebt gedaan.", "Thank you for everything you've done for me.", "Danke für alles, was du für mich getan hast.", "Merci pour tout ce que tu as fait pour moi.")
  ]
};

// Vastlopen: reddingszinnen
// Wisselkaart bovenaan Gesprek openen: elke 2,5 seconde een andere zin. Tik je erop, dan gaat het gesprek in Gesprek verder.
var OPENERS = [
  p("¿Puede ayudarme?", "Kunt u mij helpen?", "Can you help me?", "Können Sie mir helfen?", "Pouvez-vous m'aider ?"),
  p("Tengo una pregunta.", "Ik heb een vraag.", "I have a question.", "Ich habe eine Frage.", "J'ai une question."),
  p("¿Tiene un momento?", "Heeft u even tijd?", "Do you have a moment?", "Haben Sie einen Moment?", "Vous avez un moment ?"),
  p("¿Disculpe?", "Pardon?", "Excuse me?", "Entschuldigung?", "Excusez-moi ?")
];

// Positief antwoord van de gesprekspartner op de kaart-zinnen (volgorde gelijk aan OPENERS)
var OPENER_REPLY = [
  p("Sí, claro. ¿En qué le puedo ayudar?", "Ja, natuurlijk. Waarmee kan ik u helpen?", "Yes, of course. How can I help you?", "Ja, natürlich. Wobei kann ich Ihnen helfen?", "Oui, bien sûr. Comment puis-je vous aider ?"),
  p("Claro, adelante. ¿Qué quiere saber?", "Natuurlijk, ga uw gang. Wat wilt u weten?", "Of course, go ahead. What would you like to know?", "Natürlich, fragen Sie ruhig. Was möchten Sie wissen?", "Bien sûr, allez-y. Que voulez-vous savoir ?"),
  p("Sí, claro. ¿Qué necesita?", "Ja, zeker. Wat heeft u nodig?", "Yes, sure. What do you need?", "Ja, sicher. Was brauchen Sie?", "Oui, bien sûr. De quoi avez-vous besoin ?"),
  p("Sí, dígame.", "Ja, zegt u het maar.", "Yes, go ahead.", "Ja, bitte.", "Oui, je vous écoute.")
];

// Hulpvragen die na het positieve antwoord verschijnen. Met een kleine toelichting, zodat het niet kaal klinkt.
function helpOpt(label_nl, label_en, label_de, label_fr, es, nl, en, de, fr) {
  return { l: m(label_nl, label_en, label_de, label_fr), es: es, m: m(nl, en, de, fr) };
}
var HELP_OPTIONS = [
  helpOpt("Tijd", "Time", "Zeit", "Heure", "No soy de aquí. ¿Me puede decir qué hora es?", "Ik kom hier niet vandaan. Kunt u me zeggen hoe laat het is?", "I'm not from here. Can you tell me what time it is?", "Ich komme nicht von hier. Können Sie mir sagen, wie spät es ist?", "Je ne suis pas d'ici. Pouvez-vous me dire quelle heure il est ?"),
  helpOpt("Restaurant", "Restaurant", "Restaurant", "Restaurant", "Tengo hambre. ¿Me recomienda un buen restaurante cerca?", "Ik heb honger. Kunt u een goed restaurant in de buurt aanbevelen?", "I'm hungry. Can you recommend a good restaurant nearby?", "Ich habe Hunger. Können Sie ein gutes Restaurant in der Nähe empfehlen?", "J'ai faim. Pouvez-vous me recommander un bon restaurant près d'ici ?"),
  helpOpt("Busstation", "Bus station", "Busbahnhof", "Gare routière", "No soy de aquí. ¿Dónde está la estación de autobuses?", "Ik kom hier niet vandaan. Waar is het busstation?", "I'm not from here. Where is the bus station?", "Ich komme nicht von hier. Wo ist der Busbahnhof?", "Je ne suis pas d'ici. Où est la gare routière ?"),
  helpOpt("Trein", "Train", "Zug", "Train", "Quiero ir a la estación de tren. ¿A qué hora sale el próximo tren?", "Ik wil naar het station. Hoe laat vertrekt de volgende trein?", "I want to go to the train station. What time does the next train leave?", "Ich möchte zum Bahnhof. Wann fährt der nächste Zug ab?", "Je veux aller à la gare. À quelle heure part le prochain train ?"),
  helpOpt("Kaartje", "Ticket", "Fahrkarte", "Billet", "¿Cuánto cuesta el billete al centro?", "Hoeveel kost het kaartje naar het centrum?", "How much is the ticket to the city centre?", "Wie viel kostet die Fahrkarte ins Zentrum?", "Combien coûte le billet pour le centre-ville ?"),
  helpOpt("Hulp", "Help", "Hilfe", "Aide", "Estoy perdido. ¿Me puede ayudar a encontrar la farmacia?", "Ik ben verdwaald. Kunt u me helpen de apotheek te vinden?", "I'm lost. Can you help me find the pharmacy?", "Ich habe mich verlaufen. Können Sie mir helfen, die Apotheke zu finden?", "Je suis perdu. Pouvez-vous m'aider à trouver la pharmacie ?")
];

var STUCK = [
  p("¿Cómo se dice... en español?", "Hoe zeg je ... in het Spaans?", "How do you say ... in Spanish?", "Wie sagt man ... auf Spanisch?", "Comment dit-on ... en espagnol ?"),
  p("No me sale la palabra.", "Het woord komt niet bij me op.", "The word won't come to me.", "Mir fällt das Wort nicht ein.", "Le mot ne me vient pas."),
  p("Lo digo de otra manera.", "Ik zeg het op een andere manier.", "Let me say it another way.", "Ich sage es anders.", "Je le dis autrement."),
  p("Es algo como...", "Het is zoiets als...", "It's something like...", "Es ist so etwas wie...", "C'est un peu comme..."),
  p("Es lo que se usa para...", "Het is wat je gebruikt om...", "It's what you use to...", "Das benutzt man, um ...", "C'est ce qu'on utilise pour..."),
  p("¿Me explicas esa palabra?", "Kun je dat woord uitleggen?", "Can you explain that word?", "Kannst du mir das Wort erklären?", "Tu peux m'expliquer ce mot ?")
];

// Onderwerpen: vragen voor als het gesprek stilvalt
var TOPICS = [
  p("¿Qué te gusta hacer los fines de semana?", "Wat doe je graag in het weekend?", "What do you like doing on weekends?", "Was machst du gern am Wochenende?", "Qu'est-ce que tu aimes faire le week-end ?"),
  p("¿Cómo es tu trabajo o tu estudio?", "Hoe is je werk of studie?", "What's your job or studies like?", "Wie ist deine Arbeit oder dein Studium?", "Comment est ton travail ou tes études ?"),
  p("¿Qué música escuchas últimamente?", "Wat voor muziek luister je de laatste tijd?", "What music have you been listening to lately?", "Welche Musik hörst du in letzter Zeit?", "Quelle musique écoutes-tu ces temps-ci ?"),
  p("¿Qué serie o película te gustó?", "Welke serie of film vond je goed?", "What series or film did you like?", "Welche Serie oder welcher Film hat dir gefallen?", "Quelle série ou quel film t'a plu ?"),
  p("¿Qué planes tienes para las vacaciones?", "Wat zijn je plannen voor de vakantie?", "What are your plans for the holidays?", "Was hast du für den Urlaub vor?", "Quels sont tes projets pour les vacances ?"),
  p("¿Qué opinas de la comida de aquí?", "Wat vind je van het eten hier?", "What do you think of the food here?", "Was hältst du vom Essen hier?", "Que penses-tu de la cuisine d'ici ?"),
  p("¿Cuál fue lo mejor de tu semana?", "Wat was het beste van je week?", "What was the best part of your week?", "Was war das Beste an deiner Woche?", "Quel a été le meilleur moment de ta semaine ?"),
  p("¿Qué te gustaría aprender este año?", "Wat zou je dit jaar willen leren?", "What would you like to learn this year?", "Was würdest du dieses Jahr gern lernen?", "Qu'est-ce que tu aimerais apprendre cette année ?")
];

// Zin bouwen: patronen (label + voorbeeld)
var PATTERNS = [
  { label: m("Ayer + yo + fui a... (verleden tijd)", "Ayer + yo + fui a... (past tense)", "Ayer + yo + fui a... (Vergangenheit)", "Ayer + yo + fui a... (passé)"), ex: p("Ayer fui al cine con mi amigo.", "Gisteren ging ik met mijn vriend naar de bioscoop.", "Yesterday I went to the cinema with my friend.", "Gestern bin ich mit meinem Freund ins Kino gegangen.", "Hier je suis allé au cinéma avec mon ami.") },
  { label: m("Hoy + yo + estoy + ... (toestand)", "Hoy + yo + estoy + ... (state)", "Hoy + yo + estoy + ... (Zustand)", "Hoy + yo + estoy + ... (état)"), ex: p("Hoy estoy cansado porque trabajé mucho.", "Vandaag ben ik moe, omdat ik veel heb gewerkt.", "Today I'm tired because I worked a lot.", "Heute bin ich müde, weil ich viel gearbeitet habe.", "Aujourd'hui je suis fatigué parce que j'ai beaucoup travaillé.") },
  { label: m("Me gusta + werkwoord in de infinitief", "Me gusta + infinitive verb", "Me gusta + Infinitiv", "Me gusta + infinitif"), ex: p("Me gusta cocinar los domingos.", "Ik kook graag op zondag.", "I like cooking on Sundays.", "Ich koche sonntags gern.", "J'aime cuisiner le dimanche.") },
  { label: m("Creo que + zin", "Creo que + sentence", "Creo que + Satz", "Creo que + phrase"), ex: p("Creo que va a llover mañana.", "Ik denk dat het morgen gaat regenen.", "I think it's going to rain tomorrow.", "Ich glaube, morgen regnet es.", "Je crois qu'il va pleuvoir demain.") },
  { label: m("Cuando + zin, + zin", "Cuando + clause, + clause", "Cuando + Satz, + Satz", "Cuando + proposition, + proposition"), ex: p("Cuando tengo tiempo, leo un libro.", "Als ik tijd heb, lees ik een boek.", "When I have time, I read a book.", "Wenn ich Zeit habe, lese ich ein Buch.", "Quand j'ai le temps, je lis un livre.") },
  { label: m("Quiero + infinitief", "Quiero + infinitive", "Quiero + Infinitiv", "Quiero + infinitif"), ex: p("Quiero aprender más palabras.", "Ik wil meer woorden leren.", "I want to learn more words.", "Ich möchte mehr Wörter lernen.", "Je veux apprendre plus de mots.") }
];

// Wanneer zeg je dit (uitleg per zin, in het Spaans als sleutel)
var WHEN = {
  "¿Qué tal?": m("als je iemand begroet en wilt weten hoe het gaat.", "when you greet someone and want to know how they are.", "wenn du jemanden begrüßt und wissen willst, wie es geht.", "quand tu salues quelqu'un et veux savoir comment il va."),
  "¿Qué tal el fin de semana?": m("als je iemand na het weekend spreekt.", "when you speak to someone after the weekend.", "wenn du jemanden nach dem Wochenende sprichst.", "quand tu parles à quelqu'un après le week-end."),
  "¿Qué has hecho hoy?": m("als je wilt weten wat iemand vandaag heeft gedaan.", "when you want to know what someone has done today.", "wenn du wissen willst, was jemand heute gemacht hat.", "quand tu veux savoir ce que quelqu'un a fait aujourd'hui."),
  "¡Qué bien verte!": m("als je iemand blij tegenkomt.", "when you meet someone and are happy to see them.", "wenn du jemanden triffst und dich freust.", "quand tu croises quelqu'un avec plaisir."),
  "¿Y tú?": m("als iemand jou iets vraagt en jij het terugvraagt.", "when someone asks you something and you ask back.", "wenn dich jemand etwas fragt und du zurückfragst.", "quand on te pose une question et que tu la renvoies."),
  "¿Cómo fue?": m("als je wilt weten hoe iets is gegaan.", "when you want to know how something went.", "wenn du wissen willst, wie etwas gelaufen ist.", "quand tu veux savoir comment ça s'est passé."),
  "¿Por qué?": m("als je de reden wilt weten.", "when you want to know the reason.", "wenn du den Grund wissen willst.", "quand tu veux connaître la raison."),
  "¿Desde cuándo?": m("als je wilt weten sinds wanneer iets zo is.", "when you want to know since when something is like this.", "wenn du wissen willst, seit wann etwas so ist.", "quand tu veux savoir depuis quand c'est comme ça."),
  "Cuéntame más.": m("als je wilt dat iemand meer vertelt.", "when you want someone to tell you more.", "wenn du möchtest, dass jemand mehr erzählt.", "quand tu veux que quelqu'un en dise plus."),
  "¿Qué pasó después?": m("als je wilt weten wat er daarna gebeurde.", "when you want to know what happened next.", "wenn du wissen willst, was danach passiert ist.", "quand tu veux savoir ce qui s'est passé ensuite."),
  "Creo que sí.": m("als je het ergens mee eens bent, maar niet helemaal zeker weet.", "when you agree with something but aren't completely sure.", "wenn du etwas zustimmst, dir aber nicht ganz sicher bist.", "quand tu es plutôt d'accord, mais pas tout à fait sûr."),
  "Creo que no.": m("als je denkt dat iets niet zo is.", "when you think something isn't so.", "wenn du denkst, dass etwas nicht so ist.", "quand tu penses que ce n'est pas le cas."),
  "Me parece bien.": m("als je iets goed vindt.", "when you think something is good.", "wenn du etwas gut findest.", "quand tu trouves que quelque chose est bien."),
  "Me parece un poco raro.": m("als je iets een beetje vreemd vindt.", "when you find something a bit strange.", "wenn du etwas ein bisschen seltsam findest.", "quand tu trouves quelque chose un peu bizarre."),
  "A mí me gusta mucho.": m("als je zegt dat je iets erg leuk vindt.", "when you say you really like something.", "wenn du sagst, dass dir etwas sehr gefällt.", "quand tu dis que tu aimes beaucoup quelque chose."),
  "Yo no estoy de acuerdo.": m("als je het niet eens bent met iemand.", "when you disagree with someone.", "wenn du mit jemandem nicht einverstanden bist.", "quand tu n'es pas d'accord avec quelqu'un."),
  "A ver...": m("als je even nadenkt voordat je antwoordt.", "when you pause to think before answering.", "wenn du kurz überlegst, bevor du antwortest.", "quand tu réfléchis un instant avant de répondre."),
  "Espera, lo pienso.": m("als je wilt dat iemand even wacht.", "when you want someone to wait a moment.", "wenn du möchtest, dass jemand kurz wartet.", "quand tu veux que quelqu'un attende un peu."),
  "Déjame pensar.": m("als je even tijd nodig hebt om na te denken.", "when you need a moment to think.", "wenn du einen Moment zum Nachdenken brauchst.", "quand tu as besoin d'un moment pour réfléchir."),
  "Bueno, pues...": m("als je iets nieuws gaat zeggen of een besluit neemt.", "when you are about to say something new or decide.", "wenn du etwas Neues sagen oder dich entscheiden willst.", "quand tu vas dire quelque chose de nouveau ou décider."),
  "¿Puedes repetirlo, por favor?": m("als je iets niet goed hebt gehoord.", "when you didn't hear something well.", "wenn du etwas nicht gut verstanden hast.", "quand tu n'as pas bien entendu."),
  "Más despacio, por favor.": m("als iemand te snel praat.", "when someone speaks too fast.", "wenn jemand zu schnell spricht.", "quand quelqu'un parle trop vite."),
  "No entiendo.": m("als je iets niet begrijpt.", "when you don't understand something.", "wenn du etwas nicht verstehst.", "quand tu ne comprends pas quelque chose."),
  "¿Qué significa...?": m("als je wilt weten wat een woord betekent.", "when you want to know what a word means.", "wenn du wissen willst, was ein Wort bedeutet.", "quand tu veux savoir ce qu'un mot signifie."),
  "Tengo que irme.": m("als je weg moet.", "when you have to leave.", "wenn du gehen musst.", "quand tu dois partir."),
  "Me alegro de verte.": m("als je blij bent iemand te zien.", "when you are happy to see someone.", "wenn du dich freust, jemanden zu sehen.", "quand tu es content de voir quelqu'un."),
  "Hablamos luego.": m("als je afscheid neemt en later nog gaat praten.", "when you say goodbye and will talk again later.", "wenn du dich verabschiedest und später noch sprichst.", "quand tu dis au revoir et que vous vous reparlerez plus tard."),
  "Nos vemos.": m("als je afscheid neemt.", "when you say goodbye.", "wenn du dich verabschiedest.", "quand tu dis au revoir."),
  "¿Cómo se dice... en español?": m("als je niet weet hoe je iets in het Spaans zegt.", "when you don't know how to say something in Spanish.", "wenn du nicht weißt, wie man etwas auf Spanisch sagt.", "quand tu ne sais pas comment dire quelque chose en espagnol."),
  "No me sale la palabra.": m("als een woord je even niet te binnen schiet.", "when a word won't come to you.", "wenn dir ein Wort gerade nicht einfällt.", "quand un mot ne te vient pas."),
  "Lo digo de otra manera.": m("als je het anders gaat zeggen, zodat het duidelijker wordt.", "when you're going to say it differently, so it's clearer.", "wenn du es anders sagst, damit es klarer wird.", "quand tu vas le dire autrement, pour être plus clair."),
  "Es algo como...": m("als je iets uitlegt met een voorbeeld.", "when you explain something with an example.", "wenn du etwas mit einem Beispiel erklärst.", "quand tu expliques quelque chose avec un exemple."),
  "Es lo que se usa para...": m("als je uitlegt waarvoor iets dient.", "when you explain what something is used for.", "wenn du erklärst, wofür etwas benutzt wird.", "quand tu expliques à quoi sert quelque chose."),
  "¿Me explicas esa palabra?": m("als je wilt dat iemand een woord uitlegt.", "when you want someone to explain a word.", "wenn du möchtest, dass jemand ein Wort erklärt.", "quand tu veux que quelqu'un explique un mot."),
  "¿Qué te gusta hacer los fines de semana?": m("om een gesprek over het weekend te beginnen.", "to start a conversation about the weekend.", "um ein Gespräch über das Wochenende zu beginnen.", "pour lancer une conversation sur le week-end."),
  "¿Cómo es tu trabajo o tu estudio?": m("om te vragen naar het werk of de studie van iemand.", "to ask about someone's job or studies.", "um nach Arbeit oder Studium zu fragen.", "pour demander le travail ou les études de quelqu'un."),
  "¿Qué música escuchas últimamente?": m("om over muziek te praten.", "to talk about music.", "um über Musik zu sprechen.", "pour parler de musique."),
  "¿Qué serie o película te gustó?": m("om over een film of serie te praten.", "to talk about a film or series.", "um über einen Film oder eine Serie zu sprechen.", "pour parler d'un film ou d'une série."),
  "¿Qué planes tienes para las vacaciones?": m("om over vakantie te praten.", "to talk about holidays.", "um über den Urlaub zu sprechen.", "pour parler des vacances."),
  "¿Qué opinas de la comida de aquí?": m("om te vragen wat iemand van iets vindt.", "to ask what someone thinks about something.", "um zu fragen, was jemand von etwas hält.", "pour demander ce que quelqu'un pense de quelque chose."),
  "¿Cuál fue lo mejor de tu semana?": m("om te vragen wat het beste van de week was.", "to ask what the best part of the week was.", "um zu fragen, was das Beste der Woche war.", "pour demander quel a été le meilleur moment de la semaine."),
  "¿Qué te gustaría aprender este año?": m("om te praten over wat iemand wil leren.", "to talk about what someone would like to learn.", "um darüber zu sprechen, was jemand lernen möchte.", "pour parler de ce que quelqu'un aimerait apprendre."),
  "¿Cómo estás?": m("als je wilt weten hoe iemand zich voelt.", "when you want to know how someone feels.", "wenn du wissen willst, wie sich jemand fühlt.", "quand tu veux savoir comment quelqu'un se sent."),
  "¿Qué hiciste ayer?": m("als je wilt weten wat iemand gisteren deed.", "when you want to know what someone did yesterday.", "wenn du wissen willst, was jemand gestern gemacht hat.", "quand tu veux savoir ce que quelqu'un a fait hier."),
  "¿Qué vas a hacer el fin de semana?": m("als je wilt weten wat iemand in het weekend gaat doen.", "when you want to know what someone will do at the weekend.", "wenn du wissen willst, was jemand am Wochenende vorhat.", "quand tu veux savoir ce que quelqu'un va faire le week-end."),
  "Estoy cansado.": m("als je zegt dat je moe bent.", "when you say you are tired.", "wenn du sagst, dass du müde bist.", "quand tu dis que tu es fatigué."),
  "Tengo un examen mañana.": m("als je zegt dat je morgen een tentamen hebt.", "when you say you have an exam tomorrow.", "wenn du sagst, dass du morgen eine Prüfung hast.", "quand tu dis que tu as un examen demain."),
  "Fui al médico.": m("als je zegt dat je bij de dokter bent geweest.", "when you say you went to the doctor.", "wenn du sagst, dass du beim Arzt warst.", "quand tu dis que tu es allé chez le médecin."),
  "Me voy de vacaciones la semana que viene.": m("als je zegt dat je volgende week op vakantie gaat.", "when you say you're going on holiday next week.", "wenn du sagst, dass du nächste Woche in den Urlaub fährst.", "quand tu dis que tu pars en vacances la semaine prochaine.")
};

// Woord voor woord: Spaans woord -> [nl, en, de, fr]
var GLOSS = {
  "qué": m("wat", "what", "was", "quoi"), "tal": m("zo", "so", "so", "comme"), "el": m("de", "the", "der", "le"),
  "fin": m("einde", "end", "Ende", "fin"), "de": m("van", "of", "von", "de"), "semana": m("week", "week", "Woche", "semaine"),
  "has": m("heb", "have", "hast", "as"), "hecho": m("gedaan", "done", "gemacht", "fait"), "hoy": m("vandaag", "today", "heute", "aujourd'hui"),
  "bien": m("goed", "well", "gut", "bien"), "verte": m("je zien", "see you", "dich sehen", "te voir"), "y": m("en", "and", "und", "et"),
  "tú": m("jij", "you", "du", "tu"), "cómo": m("hoe", "how", "wie", "comment"), "fue": m("was", "was", "war", "fut"),
  "por": m("voor", "for", "wegen", "pour"), "desde": m("sinds", "since", "seit", "depuis"), "cuándo": m("wanneer", "when", "wann", "quand"),
  "cuéntame": m("vertel me", "tell me", "erzähl mir", "raconte-moi"), "más": m("meer", "more", "mehr", "plus"),
  "pasó": m("gebeurde", "happened", "passierte", "s'est passé"), "después": m("daarna", "after", "danach", "après"),
  "creo": m("denk", "think", "glaube", "crois"), "que": m("dat", "that", "dass", "que"), "sí": m("ja", "yes", "ja", "oui"),
  "no": m("nee", "no", "nein", "non"), "me": m("mij", "me", "mir", "me"), "parece": m("lijkt", "seems", "scheint", "semble"),
  "un": m("een", "a", "ein", "un"), "poco": m("beetje", "little", "wenig", "peu"), "raro": m("raar", "strange", "seltsam", "bizarre"),
  "a": m("naar", "to", "zu", "à"), "mí": m("mij", "me", "mir", "moi"), "gusta": m("bevalt", "likes", "gefällt", "plaît"),
  "mucho": m("veel", "much", "viel", "beaucoup"), "yo": m("ik", "I", "ich", "je"), "estoy": m("ben", "am", "bin", "suis"),
  "acuerdo": m("afspraak", "agreement", "Einverständnis", "accord"), "ver": m("zien", "see", "sehen", "voir"),
  "espera": m("wacht", "wait", "warte", "attends"), "lo": m("het", "it", "es", "le"), "pienso": m("denk", "think", "denke", "pense"),
  "déjame": m("laat me", "let me", "lass mich", "laisse-moi"), "pensar": m("denken", "think", "denken", "penser"),
  "bueno": m("goed", "well", "gut", "bon"), "pues": m("dan", "well", "also", "alors"), "puedes": m("kun jij", "you can", "du kannst", "tu peux"),
  "repetirlo": m("het herhalen", "repeat it", "es wiederholen", "le répéter"), "por": m("voor", "for", "wegen", "pour"),
  "favor": m("gunst", "favour", "Gefallen", "faveur"), "despacio": m("langzaam", "slowly", "langsam", "lentement"),
  "entiendo": m("begrijp", "understand", "verstehe", "comprends"), "significa": m("betekent", "means", "bedeutet", "signifie"),
  "tengo": m("heb", "have", "habe", "ai"), "irme": m("weggaan", "leave", "gehen", "partir"), "alegro": m("ben blij", "am glad", "freue mich", "suis ravi"),
  "hablamos": m("praten we", "we talk", "wir sprechen", "nous parlons"), "luego": m("later", "later", "später", "plus tard"),
  "nos": m("ons", "us", "uns", "nous"), "vemos": m("zien", "see", "sehen", "voyons"), "se": m("men", "one", "man", "on"),
  "dice": m("zegt", "says", "sagt", "dit"), "en": m("in", "in", "in", "en"), "español": m("Spaans", "Spanish", "Spanisch", "espagnol"),
  "sale": m("komt", "comes", "fällt", "vient"), "la": m("de", "the", "die", "la"), "palabra": m("woord", "word", "Wort", "mot"),
  "digo": m("zeg", "say", "sage", "dis"), "otra": m("andere", "other", "andere", "autre"), "manera": m("manier", "way", "Art", "façon"),
  "es": m("is", "is", "ist", "est"), "algo": m("iets", "something", "etwas", "quelque chose"), "como": m("zoals", "like", "wie", "comme"),
  "usa": m("gebruikt", "uses", "benutzt", "utilise"), "para": m("voor", "for", "für", "pour"), "explicas": m("legt uit", "explain", "erklärst", "expliques"),
  "esa": m("dat", "that", "das", "cette"), "te": m("jou", "you", "dir", "te"), "hacer": m("doen", "do", "machen", "faire"),
  "los": m("de", "the", "die", "les"), "trabajo": m("werk", "work", "Arbeit", "travail"), "o": m("of", "or", "oder", "ou"),
  "estudio": m("studie", "study", "Studium", "études"), "música": m("muziek", "music", "Musik", "musique"), "escuchas": m("luister", "listen", "hörst", "écoutes"),
  "últimamente": m("de laatste tijd", "lately", "in letzter Zeit", "ces derniers temps"), "serie": m("serie", "series", "Serie", "série"),
  "película": m("film", "film", "Film", "film"), "gustó": m("beviel", "liked", "hat gefallen", "a plu"), "planes": m("plannen", "plans", "Pläne", "projets"),
  "tienes": m("heb jij", "have you", "hast du", "as"), "vacaciones": m("vakantie", "holidays", "Urlaub", "vacances"), "opinas": m("vind", "think", "meinst", "penses"),
  "comida": m("eten", "food", "Essen", "cuisine"), "aquí": m("hier", "here", "hier", "ici"), "cuál": m("welke", "which", "welche", "quel"),
  "mejor": m("beste", "best", "beste", "meilleur"), "aprender": m("leren", "learn", "lernen", "apprendre"), "este": m("deze", "this", "dieses", "cette"),
  "año": m("jaar", "year", "Jahr", "an"), "gustaría": m("zou graag", "would like", "würde gern", "aimerais"), "estás": m("ben jij", "are you", "bist du", "es"),
  "hiciste": m("deed jij", "did you", "hast du gemacht", "as fait"), "ayer": m("gisteren", "yesterday", "gestern", "hier"),
  "vas": m("ga jij", "are you going", "gehst du", "vas"), "mañana": m("morgen", "tomorrow", "morgen", "demain"), "examen": m("tentamen", "exam", "Prüfung", "examen"),
  "médico": m("dokter", "doctor", "Arzt", "médecin"), "al": m("naar het", "to the", "zum", "au"), "cansado": m("moe", "tired", "müde", "fatigué"),
  "voy": m("ga", "go", "gehe", "vais"), "viene": m("komt", "comes", "kommt", "vient"),
  "fui": m("ging", "went", "ging", "suis allé"), "cine": m("bioscoop", "cinema", "Kino", "cinéma"), "con": m("met", "with", "mit", "avec"),
  "mi": m("mijn", "my", "mein", "mon"), "amigo": m("vriend", "friend", "Freund", "ami"), "trabajé": m("werkte", "worked", "arbeitete", "ai travaillé"),
  "cocinar": m("koken", "cook", "kochen", "cuisiner"), "domingos": m("zondagen", "Sundays", "Sonntage", "dimanches"), "va": m("gaat", "goes", "geht", "va"),
  "llover": m("regenen", "rain", "regnen", "pleuvoir"), "cuando": m("wanneer", "when", "wenn", "quand"), "tiempo": m("tijd", "time", "Zeit", "temps"),
  "leo": m("lees", "read", "lese", "lis"), "libro": m("boek", "book", "Buch", "livre"), "quiero": m("wil", "want", "will", "veux"),
  "palabras": m("woorden", "words", "Wörter", "mots")
};

// ---------- Reageren ----------
// Een reactie: [labelsleutel, Spaans, betekenis]
var REACT = [
  { kind: "vraag", es: "¿Cómo estás?", m: m("Hoe gaat het met je?", "How are you?", "Wie geht es dir?", "Comment tu vas ?"),
    styles: [
      ["blij", "¡Muy bien, gracias! ¿Y tú?", m("Heel goed, dank je! En jij?", "Very well, thanks! And you?", "Sehr gut, danke! Und du?", "Très bien, merci ! Et toi ?")],
      ["eerlijk", "Estoy bien, gracias. Hoy trabajé bastante.", m("Het gaat goed, bedankt. Ik heb vandaag flink gewerkt.", "I'm fine, thanks. I worked quite a lot today.", "Gut, danke. Heute habe ich ziemlich viel gearbeitet.", "Ça va, merci. J'ai pas mal travaillé aujourd'hui.")],
      ["moe", "Un poco cansado, pero bien.", m("Een beetje moe, maar het gaat.", "A bit tired, but okay.", "Ein bisschen müde, aber gut.", "Un peu fatigué, mais ça va.")],
      ["zorgen", "Estoy un poco preocupado por algo.", m("Ik maak me een beetje zorgen over iets.", "I'm a bit worried about something.", "Ich mache mir ein bisschen Sorgen um etwas.", "Je me fais un peu de souci pour quelque chose.")]
    ],
    vervolg: [
      { es: "¿Y tú?", m: m("En jij?", "And you?", "Und du?", "Et toi ?"), styles: [
        ["blij", "Yo también, muy bien.", m("Ik ook, heel goed.", "Me too, very well.", "Mir auch, sehr gut.", "Moi aussi, très bien.")],
        ["eerlijk", "Yo estoy bien, gracias por preguntar.", m("Het gaat goed met mij, bedankt dat je vraagt.", "I'm fine, thanks for asking.", "Mir geht es gut, danke der Nachfrage.", "Ça va pour moi, merci de demander.")],
        ["doorvragen", "¿Y tú qué tal el fin de semana?", m("En hoe was je weekend?", "And how was your weekend?", "Und wie war dein Wochenende?", "Et ton week-end, comment s'est-il passé ?")]
      ] }
    ] },
  { kind: "vraag", es: "¿Qué hiciste ayer?", m: m("Wat heb je gisteren gedaan?", "What did you do yesterday?", "Was hast du gestern gemacht?", "Qu'est-ce que tu as fait hier ?"),
    styles: [
      ["eerlijk", "Fui al supermercado y después estudié.", m("Ik ging naar de supermarkt en daarna heb ik gestudeerd.", "I went to the supermarket and then I studied.", "Ich bin zum Supermarkt gegangen und danach habe ich gelernt.", "Je suis allé au supermarché puis j'ai étudié.")],
      ["leuk", "Fui al cine con un amigo. Fue muy divertido.", m("Ik ging met een vriend naar de bioscoop. Het was erg leuk.", "I went to the cinema with a friend. It was great fun.", "Ich bin mit einem Freund ins Kino gegangen. Es war sehr lustig.", "Je suis allé au cinéma avec un ami. C'était très sympa.")],
      ["kort", "Nada especial, descansé en casa.", m("Niets bijzonders, ik heb thuis gerust.", "Nothing special, I rested at home.", "Nichts Besonderes, ich habe mich zu Hause ausgeruht.", "Rien de spécial, je me suis reposé à la maison.")],
      ["grappig", "Cociné y casi quemé la cena, ¡jaja!", m("Ik kookte en verbrandde bijna het eten, haha!", "I cooked and almost burned dinner, haha!", "Ich habe gekocht und fast das Abendessen verbrannt, haha!", "J'ai cuisiné et j'ai failli cramer le dîner, haha !")]
    ],
    vervolg: [
      { es: "¿Y tú qué hiciste?", m: m("En wat heb jij gedaan?", "And what did you do?", "Und was hast du gemacht?", "Et toi, qu'est-ce que tu as fait ?"), styles: [
        ["doorvragen", "¿Y qué tal fue?", m("En hoe was het?", "And how was it?", "Und wie war es?", "Et c'était comment ?")],
        ["eerlijk", "Nada más, fue un día tranquilo.", m("Niets meer, het was een rustige dag.", "Nothing more, it was a quiet day.", "Mehr nicht, es war ein ruhiger Tag.", "Rien d'autre, c'était une journée calme.")]
      ] }
    ] },
  { kind: "vraag", es: "¿Qué vas a hacer el fin de semana?", m: m("Wat ga je dit weekend doen?", "What are you going to do this weekend?", "Was machst du dieses Wochenende?", "Que vas-tu faire ce week-end ?"),
    styles: [
      ["eerlijk", "Todavía no sé. Quizás descanse.", m("Ik weet het nog niet. Misschien rust ik uit.", "I don't know yet. Maybe I'll rest.", "Ich weiß es noch nicht. Vielleicht ruhe ich mich aus.", "Je ne sais pas encore. Peut-être que je vais me reposer.")],
      ["enthousiast", "Voy a ir a la playa con mis amigos.", m("Ik ga met mijn vrienden naar het strand.", "I'm going to the beach with my friends.", "Ich fahre mit meinen Freunden an den Strand.", "Je vais à la plage avec mes amis.")],
      ["twijfel", "Creo que voy a estudiar, pero no estoy seguro.", m("Ik denk dat ik ga studeren, maar zeker weet ik het niet.", "I think I'll study, but I'm not sure.", "Ich glaube, ich lerne, aber ich bin mir nicht sicher.", "Je crois que je vais étudier, mais je n'en suis pas sûr.")]
    ],
    vervolg: [
      { es: "¿Quieres venir?", m: m("Wil je meekomen?", "Do you want to come?", "Willst du mitkommen?", "Tu veux venir ?"), styles: [
        ["ja", "¡Sí, claro! ¿A qué hora?", m("Ja, zeker! Hoe laat?", "Yes, of course! What time?", "Ja, klar! Um wie viel Uhr?", "Oui, bien sûr ! À quelle heure ?")],
        ["nee", "Lo siento, hoy no puedo.", m("Sorry, vandaag kan ik niet.", "Sorry, I can't today.", "Tut mir leid, heute kann ich nicht.", "Désolé, je ne peux pas aujourd'hui.")],
        ["later", "Déjame pensarlo y te digo.", m("Laat me er even over nadenken, dan laat ik het weten.", "Let me think about it and I'll let you know.", "Lass mich kurz darüber nachdenken, dann sage ich dir Bescheid.", "Laisse-moi y réfléchir, je te dis.")]
      ] }
    ] },
  { kind: "vertelt", es: "Estoy cansado.", m: m("Ik ben moe.", "I'm tired.", "Ich bin müde.", "Je suis fatigué."),
    styles: [
      ["meeleven", "Ay, lo siento. ¿Dormiste bien?", m("Oh, wat vervelend. Heb je goed geslapen?", "Oh, I'm sorry. Did you sleep well?", "Oh, das tut mir leid. Hast du gut geschlafen?", "Oh, désolé. Tu as bien dormi ?")],
      ["grappig", "¡Yo también! Hoy todo me cuesta.", m("Ik ook! Vandaag kost alles me moeite.", "Me too! Everything is hard today.", "Ich auch! Heute fällt mir alles schwer.", "Moi aussi ! Aujourd'hui, tout me coûte.")],
      ["vragen", "¿Por qué estás cansado?", m("Waarom ben je moe?", "Why are you tired?", "Warum bist du müde?", "Pourquoi tu es fatigué ?")],
      ["advies", "Descansa un poco, ¿vale?", m("Rust een beetje, oké?", "Rest a little, okay?", "Ruh dich ein bisschen aus, okay?", "Repose-toi un peu, d'accord ?")]
    ],
    vervolg: [
      { es: "Trabajé mucho.", m: m("Ik heb veel gewerkt.", "I worked a lot.", "Ich habe viel gearbeitet.", "J'ai beaucoup travaillé."), styles: [
        ["meeleven", "Qué duro. Espero que mañana sea más fácil.", m("Wat zwaar. Ik hoop dat morgen makkelijker wordt.", "How hard. I hope tomorrow is easier.", "Wie anstrengend. Ich hoffe, morgen wird es leichter.", "Quelle galère. J'espère que demain sera plus facile.")],
        ["doorvragen", "¿Qué tipo de trabajo haces?", m("Wat voor werk doe je?", "What kind of work do you do?", "Was für eine Arbeit machst du?", "Quel genre de travail tu fais ?")]
      ] }
    ] },
  { kind: "vertelt", es: "Tengo un examen mañana.", m: m("Ik heb morgen een tentamen.", "I have an exam tomorrow.", "Ich habe morgen eine Prüfung.", "J'ai un examen demain."),
    styles: [
      ["steun", "¡Mucha suerte! Seguro que va bien.", m("Veel succes! Het komt vast goed.", "Good luck! I'm sure it'll go well.", "Viel Erfolg! Das wird sicher gut.", "Bonne chance ! Ça va sûrement bien se passer.")],
      ["vragen", "¿De qué es el examen?", m("Over wat gaat het tentamen?", "What is the exam about?", "Worum geht es bei der Prüfung?", "Sur quoi porte l'examen ?")],
      ["grappig", "¡Pobre! Yo odio los exámenes.", m("Arme jij! Ik haat tentamens.", "Poor you! I hate exams.", "Du Arme! Ich hasse Prüfungen.", "Pauvre toi ! Je déteste les examens.")],
      ["praktisch", "¿Qué hora es?", m("Hoe laat is het?", "What time is it?", "Wie spät ist es?", "Quelle heure est-il ?")]
    ],
    vervolg: [
      { es: "Estoy un poco nervioso.", m: m("Ik ben een beetje zenuwachtig.", "I'm a bit nervous.", "Ich bin ein bisschen nervös.", "Je suis un peu nerveux."), styles: [
        ["steun", "Tranquilo, has estudiado mucho.", m("Rustig, je hebt hard gestudeerd.", "Calm down, you've studied a lot.", "Ruhig, du hast viel gelernt.", "Calme-toi, tu as beaucoup étudié.")],
        ["advies", "Respira y ten confianza.", m("Adem in en vertrouw op jezelf.", "Breathe and have confidence.", "Atme durch und vertrau dir.", "Respire et aie confiance.")]
      ] }
    ] },
  { kind: "vertelt", es: "Fui al médico.", m: m("Ik ben naar de dokter geweest.", "I went to the doctor.", "Ich war beim Arzt.", "Je suis allé chez le médecin."),
    styles: [
      ["bezorgd", "¿Estás bien? ¿Qué te dijeron?", m("Gaat het goed? Wat hebben ze gezegd?", "Are you okay? What did they say?", "Geht es dir gut? Was haben sie gesagt?", "Ça va ? Qu'est-ce qu'ils t'ont dit ?")],
      ["meeleven", "Espero que no sea nada grave.", m("Ik hoop dat het niets ernstigs is.", "I hope it's nothing serious.", "Ich hoffe, es ist nichts Ernstes.", "J'espère que ce n'est rien de grave.")],
      ["vragen", "¿Por qué fuiste?", m("Waarom ging je?", "Why did you go?", "Warum bist du hingegangen?", "Pourquoi tu y es allé ?")]
    ],
    vervolg: [
      { es: "Estoy mejor, gracias.", m: m("Het gaat beter, bedankt.", "I'm better, thanks.", "Es geht mir besser, danke.", "Je vais mieux, merci."), styles: [
        ["blij", "¡Qué alivio! Me alegro.", m("Wat een opluchting! Fijn voor je.", "What a relief! I'm glad.", "Was für eine Erleichterung! Schön für dich.", "Quel soulagement ! Je suis content.")],
        ["doorvragen", "¿Y qué te recomendaron?", m("En wat hebben ze aanbevolen?", "And what did they recommend?", "Und was haben sie empfohlen?", "Et qu'est-ce qu'ils t'ont conseillé ?")]
      ] }
    ] },
  { kind: "vertelt", es: "Me voy de vacaciones la semana que viene.", m: m("Ik ga volgende week op vakantie.", "I'm going on holiday next week.", "Ich fahre nächste Woche in den Urlaub.", "Je pars en vacances la semaine prochaine."),
    styles: [
      ["blij", "¡Qué bien! ¿A dónde vas?", m("Wat leuk! Waar ga je naartoe?", "How nice! Where are you going?", "Wie schön! Wohin fährst du?", "Super ! Tu vas où ?")],
      ["jaloers", "¡Qué envidia! Yo también necesito vacaciones.", m("Wat benijdenswaardig! Ik heb ook vakantie nodig.", "How lucky! I need a holiday too.", "Wie beneidenswert! Ich brauche auch Urlaub.", "Quelle chance ! J'ai aussi besoin de vacances.")],
      ["vragen", "¿Cuánto tiempo vas a estar?", m("Hoe lang blijf je?", "How long will you stay?", "Wie lange bleibst du?", "Combien de temps tu restes ?")],
      ["grappig", "No te olvides de mí en la playa.", m("Vergeet me niet op het strand.", "Don't forget me on the beach.", "Vergiss mich am Strand nicht.", "N'oublie pas de me ramener une photo de la plage.")]
    ],
    vervolg: [
      { es: "Voy a Barcelona.", m: m("Ik ga naar Barcelona.", "I'm going to Barcelona.", "Ich fahre nach Barcelona.", "Je vais à Barcelone."), styles: [
        ["enthousiast", "¡Me encanta Barcelona! Come paella.", m("Ik hou van Barcelona! Eet paella.", "I love Barcelona! Eat paella.", "Ich liebe Barcelona! Iss Paella.", "J'adore Barcelone ! Mange de la paella.")],
        ["doorvragen", "¿Ya has estado allí?", m("Ben je daar al eens geweest?", "Have you been there before?", "Warst du schon mal dort?", "Tu y es déjà allé ?")]
      ] }
    ] }
];

// Startzinnen die je kunt doorbouwen (Spaanse startzin -> stam, betekenis, ontkenning)
var BUILD_STEMS = {
  "Creo que sí.": { stem: "Creo que", stemM: m("Ik denk dat", "I think that", "Ich glaube, dass", "Je crois que"), neg: false },
  "Creo que no.": { stem: "Creo que", stemM: m("Ik denk dat", "I think that", "Ich glaube, dass", "Je crois que"), neg: true },
  "Me parece bien.": { stem: "Me parece que", stemM: m("Ik vind dat", "I think that", "Ich finde, dass", "Il me semble que"), neg: false },
  "Me parece un poco raro.": { stem: "Me parece que", stemM: m("Ik vind dat", "I think that", "Ich finde, dass", "Il me semble que"), neg: false },
  "Bueno, pues...": { stem: "Bueno, pues", stemM: m("Nou, dan", "Well then", "Also dann", "Eh bien, alors"), neg: false },
  "A ver...": { stem: "A ver,", stemM: m("Even kijken", "Let me see", "Mal sehen", "Voyons"), neg: false },
  "Espera, lo pienso.": { stem: "Espera, creo que", stemM: m("Wacht, ik denk dat", "Wait, I think that", "Warte, ich glaube, dass", "Attends, je crois que"), neg: false }
};
var BUILDABLE_CATS = ["Meningen geven", "Tijd winnen"];

// Verbindingswoorden voor de zinsbouwer
var CONN = [
  { es: "porque", m: m("want", "because", "weil", "parce que") },
  { es: "pero", m: m("maar", "but", "aber", "mais") },
  { es: "y", m: m("en", "and", "und", "et") },
  { es: "así que", m: m("dus", "so", "also", "donc") },
  { es: "aunque", m: m("hoewel", "although", "obwohl", "bien que") }
];

// Onderwerpen: i = index in de vervoegingen
var SUBJ = [
  { es: "yo", m: m("ik", "I", "ich", "je"), i: 0 },
  { es: "tú", m: m("jij", "you", "du", "tu"), i: 1 },
  { es: "él", m: m("hij", "he", "er", "il"), i: 2 },
  { es: "ella", m: m("zij", "she", "sie", "elle"), i: 2 },
  { es: "nosotros", m: m("wij", "we", "wir", "nous"), i: 3 },
  { es: "ellos", m: m("zij (mv.)", "they", "sie (Mehrzahl)", "ils"), i: 4 }
];

// Zinsbouwer: werkwoorden met vormen en afmaakdelen
var VERBS = [
  { id: "ir", inf: "ir", m: m("gaan", "go", "gehen", "aller"), forms: ["voy", "vas", "va", "vamos", "van"],
    comps: [p("al cine", "naar de bioscoop", "to the cinema", "ins Kino", "au cinéma"), p("al trabajo", "naar het werk", "to work", "zur Arbeit", "au travail"), p("a la playa", "naar het strand", "to the beach", "an den Strand", "à la plage"), p("al parque", "naar het park", "to the park", "in den Park", "au parc")] },
  { id: "tener", inf: "tener", m: m("hebben", "have", "haben", "avoir"), forms: ["tengo", "tienes", "tiene", "tenemos", "tienen"],
    comps: [p("mucho trabajo", "veel werk", "a lot of work", "viel Arbeit", "beaucoup de travail"), p("hambre", "honger", "hunger", "Hunger", "faim"), p("tiempo libre", "vrije tijd", "free time", "Freizeit", "du temps libre"), p("un perro", "een hond", "a dog", "einen Hund", "un chien")] },
  { id: "querer", inf: "querer", m: m("willen", "want", "wollen", "vouloir"), forms: ["quiero", "quieres", "quiere", "queremos", "quieren"],
    comps: [p("aprender más español", "meer Spaans leren", "learn more Spanish", "mehr Spanisch lernen", "apprendre plus d'espagnol"), p("un café", "een koffie", "a coffee", "einen Kaffee", "un café"), p("descansar", "rusten", "rest", "ausruhen", "se reposer"), p("viajar", "reizen", "travel", "reisen", "voyager")] },
  { id: "estar", inf: "estar", m: m("zijn (toestand)", "be (state)", "sein (Zustand)", "être (état)"), forms: ["estoy", "estás", "está", "estamos", "están"],
    comps: [p("bien", "goed", "well", "gut", "bien"), p("en casa", "thuis", "at home", "zu Hause", "à la maison"), p("de vacaciones", "op vakantie", "on holiday", "im Urlaub", "en vacances"), p("en la ciudad", "in de stad", "in the city", "in der Stadt", "en ville")] },
  { id: "trabajar", inf: "trabajar", m: m("werken", "work", "arbeiten", "travailler"), forms: ["trabajo", "trabajas", "trabaja", "trabajamos", "trabajan"],
    comps: [p("mucho", "veel", "a lot", "viel", "beaucoup"), p("en una tienda", "in een winkel", "in a shop", "in einem Laden", "dans un magasin"), p("desde casa", "vanuit huis", "from home", "von zu Hause", "depuis chez moi"), p("en la ciudad", "in de stad", "in the city", "in der Stadt", "en ville")] },
  { id: "hacer", inf: "hacer", m: m("doen", "do", "machen", "faire"), forms: ["hago", "haces", "hace", "hacemos", "hacen"],
    comps: [p("deporte", "sport", "sport", "Sport", "du sport"), p("la cena", "het avondeten", "dinner", "das Abendessen", "le dîner"), p("la compra", "boodschappen", "the shopping", "den Einkauf", "les courses"), p("una pausa", "een pauze", "a break", "eine Pause", "une pause")] },
  { id: "comer", inf: "comer", m: m("eten", "eat", "essen", "manger"), forms: ["como", "comes", "come", "comemos", "comen"],
    comps: [p("pan", "brood", "bread", "Brot", "du pain"), p("fruta", "fruit", "fruit", "Obst", "des fruits"), p("tarde", "laat", "late", "spät", "tard"), p("en casa", "thuis", "at home", "zu Hause", "à la maison")] },
  { id: "ir_past", inf: "ir", past: true, m: m("gaan (verleden)", "went", "gehen (Vergangenheit)", "aller (passé)"), forms: ["fui", "fuiste", "fue", "fuimos", "fueron"],
    comps: [p("al cine", "naar de bioscoop", "to the cinema", "ins Kino", "au cinéma"), p("al mercado", "naar de markt", "to the market", "auf den Markt", "au marché"), p("a la playa", "naar het strand", "to the beach", "an den Strand", "à la plage"), p("con mis amigos", "met mijn vrienden", "with my friends", "mit meinen Freunden", "avec mes amis")] }
];

// Korte uitleg per werkwoord in de zinsbouwer
var VERB_HINT = {
  ir: m("Gaan naar een plek: voy (ik ga), vas (jij gaat), va (hij of zij gaat).", "Going to a place: voy (I go), vas (you go), va (he or she goes).", "Gehen zu einem Ort: voy (ich gehe), vas (du gehst), va (er/sie geht).", "Aller vers un endroit : voy (je vais), vas (tu vas), va (il/elle va)."),
  tener: m("Hebben: tengo (ik heb). Bij honger of tijd gebruik je tener.", "To have: tengo (I have). For hunger or time, use tener.", "Haben: tengo (ich habe). Bei Hunger oder Zeit benutzt man tener.", "Avoir : tengo (j'ai). Pour la faim ou le temps, on utilise tener."),
  querer: m("Willen: quiero (ik wil), quieres (jij wilt).", "To want: quiero (I want), quieres (you want).", "Wollen: quiero (ich will), quieres (du willst).", "Vouloir : quiero (je veux), quieres (tu veux)."),
  estar: m("Zijn, voor hoe iemand zich voelt of waar iemand is: estoy (ik ben).", "To be, for how someone feels or where someone is: estoy (I am).", "Sein, für Gefühle oder den Ort: estoy (ich bin).", "Être, pour l'état ou le lieu : estoy (je suis)."),
  trabajar: m("Werken: trabajo (ik werk), trabajas (jij werkt).", "To work: trabajo (I work), trabajas (you work).", "Arbeiten: trabajo (ich arbeite), trabajas (du arbeitest).", "Travailler : trabajo (je travaille), trabajas (tu travailles)."),
  hacer: m("Doen of maken: hago (ik doe). Hacer deporte betekent sport doen.", "To do or make: hago (I do). Hacer deporte means to do sport.", "Tun oder machen: hago (ich mache). Hacer deporte heißt Sport treiben.", "Faire : hago (je fais). Hacer deporte veut dire faire du sport."),
  comer: m("Eten: como (ik eet), comes (jij eet).", "To eat: como (I eat), comes (you eat).", "Essen: como (ich esse), comes (du isst).", "Manger : como (je mange), comes (tu manges)."),
  ir_past: m("Ging, een keer in het verleden: fui (ik ging), fuiste (jij ging).", "Went, once in the past: fui (I went), fuiste (you went).", "Ging, einmal in der Vergangenheit: fui (ich ging), fuiste (du gingst).", "Est allé, une fois dans le passé : fui (je suis allé), fuiste (tu es allé).")
};

// Analyse-zin: bekende vervoegingen (extra werkwoorden die alleen de analyse kent)
var ANA_EXTRA = [
  { inf: "ser", forms: ["soy", "eres", "es", "somos", "son"] },
  { inf: "hablar", forms: ["hablo", "hablas", "habla", "hablamos", "hablan"] },
  { inf: "estudiar", forms: ["estudio", "estudias", "estudia", "estudiamos", "estudian"] },
  { inf: "creer", forms: ["creo", "crees", "cree", "creemos", "creen"] }
];

// ---------- Grammatica ----------
var GRAMMAR = [
  { titel: "Ser vs. estar", regel: m("ser = wat iets is: vaste eigenschappen, beroep, nationaliteit (Soy holandés, Soy alto). estar = hoe iets nu is of waar iemand is: tijdelijke toestand en plek (Estoy cansado, Estoy en casa).", "ser = what something is: lasting traits, job, nationality (Soy holandés, Soy alto). estar = how something is right now or where someone is: temporary state and place (Estoy cansado, Estoy en casa).", "ser = was etwas ist: feste Eigenschaften, Beruf, Nationalität (Soy holandés, Soy alto). estar = wie etwas gerade ist oder wo jemand ist: vorübergehender Zustand und Ort (Estoy cansado, Estoy en casa).", "ser = ce que quelque chose est : traits permanents, métier, nationalité (Soy holandés, Soy alto). estar = comment quelque chose est en ce moment ou où se trouve quelqu'un : état temporaire et lieu (Estoy cansado, Estoy en casa)."), zinnen: [p("Soy holandés.", "Ik ben Nederlands.", "I'm Dutch.", "Ich bin Niederländer.", "Je suis néerlandais."), p("Estoy cansado.", "Ik ben moe.", "I'm tired.", "Ich bin müde.", "Je suis fatigué."), p("Soy alto.", "Ik ben lang.", "I'm tall.", "Ich bin groß.", "Je suis grand."), p("Estoy en casa.", "Ik ben thuis.", "I'm at home.", "Ich bin zu Hause.", "Je suis à la maison.")], voorbeeld: "Soy holandés. Estoy cansado.", waarom: m("Nederlander zijn is vast, dus ser. Moe zijn is tijdelijk, dus estar.", "Being Dutch is permanent, so ser. Being tired is temporary, so estar.", "Niederländer zu sein ist fest, also ser. Müde zu sein ist vorübergehend, also estar.", "Être néerlandais est permanent, donc ser. Être fatigué est temporaire, donc estar.") },
  { titel: m("Creo que + indicatief", "Creo que + indicative", "Creo que + Indikativ", "Creo que + indicatif"), regel: m("Bij creo que gebruik je de gewone werkwoordsvorm: Creo que va a llover.", "With creo que you use the normal verb form: Creo que va a llover.", "Bei creo que benutzt du die normale Verbform: Creo que va a llover.", "Avec creo que, on utilise la forme verbale normale : Creo que va a llover."), zinnen: [p("Creo que tienes razón.", "Ik denk dat je gelijk hebt.", "I think you're right.", "Ich glaube, du hast recht.", "Je crois que tu as raison."), p("No creo que llueva.", "Ik denk niet dat het gaat regenen.", "I don't think it'll rain.", "Ich glaube nicht, dass es regnet.", "Je ne crois pas qu'il pleuve.")], voorbeeld: "Creo que tienes razón.", waarom: m("Bij ontkenning verandert dat: No creo que llueva (subjunctief).", "With a negative this changes: No creo que llueva (subjunctive).", "Bei Verneinung ändert sich das: No creo que llueva (Subjunktiv).", "À la négative, cela change : No creo que llueva (subjonctif).") },
  { titel: m("Espero que + subjunctief", "Espero que + subjunctive", "Espero que + Subjunktiv", "Espero que + subjonctif"), regel: m("Na espero que (ik hoop dat) en andere wensen gebruik je de subjunctief: sea, tenga, vaya.", "After espero que (I hope that) and other wishes you use the subjunctive: sea, tenga, vaya.", "Nach espero que (ich hoffe, dass) und anderen Wünschen benutzt du den Subjunktiv: sea, tenga, vaya.", "Après espero que (j'espère que) et d'autres souhaits, on utilise le subjonctif : sea, tenga, vaya."), zinnen: [p("Espero que mañana sea más fácil.", "Ik hoop dat morgen makkelijker is.", "I hope tomorrow is easier.", "Ich hoffe, dass morgen leichter ist.", "J'espère que demain sera plus facile."), p("Espero que vengas.", "Ik hoop dat je komt.", "I hope you come.", "Ich hoffe, dass du kommst.", "J'espère que tu viendras.")], voorbeeld: "Espero que mañana sea más fácil.", waarom: m("Je drukt een wens of hoop uit, geen vaststaand feit.", "You express a wish or hope, not a fixed fact.", "Du drückst einen Wunsch oder eine Hoffnung aus, keine feste Tatsache.", "Tu exprimes un souhait ou un espoir, pas un fait établi.") },
  { titel: "Me gusta / me gustan", regel: m("Het onderwerp van gustar is wat je leuk vindt. Enkelvoud: me gusta. Meervoud: me gustan.", "The subject of gustar is what you like. Singular: me gusta. Plural: me gustan.", "Das Subjekt von gustar ist das, was dir gefällt. Einzahl: me gusta. Mehrzahl: me gustan.", "Le sujet de gustar est ce qui te plaît. Singulier : me gusta. Pluriel : me gustan."), zinnen: [p("Me gusta el café.", "Ik vind koffie lekker.", "I like coffee.", "Ich mag Kaffee.", "J'aime le café."), p("Me gustan las películas.", "Ik hou van films.", "I like films.", "Ich mag Filme.", "J'aime les films."), p("Me gusta viajar.", "Ik hou van reizen.", "I like travelling.", "Ich reise gern.", "J'aime voyager.")], voorbeeld: "Me gusta el café. Me gustan las películas.", waarom: m("Letterlijk staat er: de koffie bevalt mij. Het werkwoord past zich aan het ding aan, niet aan jou.", "Literally: the coffee pleases me. The verb agrees with the thing, not with you.", "Wörtlich: der Kaffee gefällt mir. Das Verb richtet sich nach der Sache, nicht nach dir.", "Littéralement : le café me plaît. Le verbe s'accorde avec la chose, pas avec toi.") },
  { titel: "Pretérito vs. imperfecto", regel: m("Pretérito voor een afgerond moment (fui, comí). Imperfecto voor gewoonte, achtergrond of een beschrijving (iba, comía).", "Pretérito for a finished moment (fui, comí). Imperfecto for habits, background or description (iba, comía).", "Pretérito für einen abgeschlossenen Moment (fui, comí). Imperfecto für Gewohnheiten, Hintergrund oder Beschreibungen (iba, comía).", "Pretérito pour un moment achevé (fui, comí). Imperfecto pour les habitudes, le décor ou une description (iba, comía)."), zinnen: [p("Fui al cine ayer.", "Ik ging gisteren naar de bioscoop.", "I went to the cinema yesterday.", "Ich bin gestern ins Kino gegangen.", "Je suis allé au cinéma hier."), p("Cuando era niño, iba al cine.", "Toen ik een kind was, ging ik vaak naar de bioscoop.", "When I was a child, I often went to the cinema.", "Als Kind bin ich oft ins Kino gegangen.", "Quand j'étais enfant, j'allais souvent au cinéma.")], voorbeeld: "Fui al cine ayer. Cuando era niño, iba al cine.", waarom: m("Eenmalig is pretérito; vroeger vaak of gewoonlijk is imperfecto.", "One-off is pretérito; often or usually in the past is imperfecto.", "Einmalig ist Pretérito; früher oft oder gewöhnlich ist Imperfecto.", "Une fois, c'est le pretérito ; souvent ou habituellement dans le passé, c'est l'imperfecto.") },
  { titel: "Por vs. para", regel: m("Por: reden, duur, doorgang of ruil. Para: doel, bestemming of richting.", "Por: reason, duration, passing through or exchange. Para: purpose, destination or direction.", "Por: Grund, Dauer, Durchgang oder Tausch. Para: Ziel, Bestimmung oder Richtung.", "Por : raison, durée, passage ou échange. Para : but, destination ou direction."), zinnen: [p("Gracias por tu ayuda.", "Dank je voor je hulp.", "Thanks for your help.", "Danke für deine Hilfe.", "Merci pour ton aide."), p("Es para ti.", "Het is voor jou.", "It's for you.", "Das ist für dich.", "C'est pour toi.")], voorbeeld: "Gracias por tu ayuda. Es para ti.", waarom: m("Dank voor iets gebruik je por. Iets dat voor iemand bestemd is, is para.", "Thanks for something uses por. Something meant for someone is para.", "Danke für etwas benutzt man por. Etwas, das für jemanden bestimmt ist, ist para.", "Merci pour quelque chose se dit avec por. Ce qui est destiné à quelqu'un est para.") },
  { titel: m("Rr en r", "Rr and r", "Rr und r", "Rr et r"), regel: m("Aan het begin van een woord en na n, l of s klinkt r getrild (rr). Tussen klinkers is het een korte tik.", "At the start of a word and after n, l or s, r is rolled (rr). Between vowels it is a short tap.", "Am Wortanfang und nach n, l oder s wird r gerollt (rr). Zwischen Vokalen ist es ein kurzer Tipp.", "Au début d'un mot et après n, l ou s, le r est roulé (rr). Entre voyelles, c'est une courte frappe."), zinnen: [p("Quiero un perro, pero no tengo tiempo.", "Ik wil een hond, maar ik heb geen tijd.", "I want a dog, but I don't have time.", "Ich möchte einen Hund, aber ich habe keine Zeit.", "Je veux un chien, mais je n'ai pas le temps.")], voorbeeld: "pero (tik) / perro (getrild), Ramón (getrild)", waarom: m("Het verschil kan de betekenis veranderen, dus het is het waard om te oefenen.", "The difference can change the meaning, so it's worth practising.", "Der Unterschied kann die Bedeutung ändern, also lohnt sich das Üben.", "La différence peut changer le sens, donc ça vaut la peine de s'entraîner.") },
  { titel: "Tú vs. usted", regel: m("Tú is informeel (vrienden, familie). Usted is formeel (nieuwe kennissen, werk, ouderen).", "Tú is informal (friends, family). Usted is formal (new acquaintances, work, older people).", "Tú ist informell (Freunde, Familie). Usted ist förmlich (neue Bekannte, Arbeit, ältere Menschen).", "Tú est informel (amis, famille). Usted est formel (nouvelles connaissances, travail, personnes âgées)."), zinnen: [p("¿Qué quieres?", "Wat wil jij?", "What do you want?", "Was willst du?", "Qu'est-ce que tu veux ?"), p("¿Qué desea usted?", "Wat wilt u?", "What would you like?", "Was möchten Sie?", "Que désirez-vous ?")], voorbeeld: "¿Qué quieres? / ¿Qué desea usted?", waarom: m("Bij twijfel gebruik je usted. Vrienden spreken elkaar meestal met tú aan.", "When in doubt use usted. Friends usually address each other with tú.", "Im Zweifel benutze usted. Freunde duzen sich meist mit tú.", "En cas de doute, utilise usted. Les amis se tutoient généralement avec tú.") },
  { titel: m("Ir a + infinitief", "Ir a + infinitive", "Ir a + Infinitiv", "Ir a + infinitif"), regel: m("Voor de toekomst: ir a + infinitief.", "For the future: ir a + infinitive.", "Für die Zukunft: ir a + Infinitiv.", "Pour le futur : ir a + infinitif."), zinnen: [p("Voy a estudiar mañana.", "Ik ga morgen studeren.", "I'm going to study tomorrow.", "Ich werde morgen lernen.", "Je vais étudier demain."), p("Voy a llamar a mi madre.", "Ik ga mijn moeder bellen.", "I'm going to call my mother.", "Ich werde meine Mutter anrufen.", "Je vais appeler ma mère.")], voorbeeld: "Voy a estudiar mañana.", waarom: m("Het komt overeen met gaan + werkwoord in het Nederlands: ik ga morgen studeren.", "It matches 'going to + verb' in English: I'm going to study tomorrow.", "Es entspricht 'werden + Verb' im Deutschen: Ich werde morgen lernen.", "Cela correspond à « aller + infinitif » en français : je vais étudier demain.") }
];

// ---------- Regels ----------
// Opties en vragen zijn meertalig of Spaans. juist = index van het goede antwoord.
var RULES = [
  { titel: m("1. Woorden op -o en -a", "1. Words ending in -o and -a", "1. Wörter auf -o und -a", "1. Mots en -o et -a"),
    uitleg: m("Woorden die eindigen op -o zijn meestal mannelijk. Woorden die eindigen op -a zijn meestal vrouwelijk. Het lidwoord past zich aan: el (mannelijk) of la (vrouwelijk).", "Words ending in -o are usually masculine. Words ending in -a are usually feminine. The article changes: el (masculine) or la (feminine).", "Wörter auf -o sind meist männlich. Wörter auf -a sind meist weiblich. Der Artikel ändert sich: el (männlich) oder la (weiblich).", "Les mots en -o sont souvent masculins, ceux en -a souvent féminins. L'article change : el (masculin) ou la (féminin)."),
    voorbeelden: [["el libro", m("het boek", "the book", "das Buch", "le livre")], ["la casa", m("het huis", "the house", "das Haus", "la maison")]],
    test: { vraag: m("Welk lidwoord hoort bij casa?", "Which article goes with casa?", "Welcher Artikel gehört zu casa?", "Quel article va avec casa ?"), opties: ["el", "la"], juist: 1 } },
  { titel: m("2. Meervoud: -s of -es", "2. Plural: -s or -es", "2. Mehrzahl: -s oder -es", "2. Pluriel : -s ou -es"),
    uitleg: m("Eindigt een woord op een klinker (a, e, i, o, u), dan voeg je -s toe. Eindigt het op een medeklinker, dan voeg je -es toe.", "If a word ends in a vowel (a, e, i, o, u), add -s. If it ends in a consonant, add -es.", "Endet ein Wort auf einen Vokal (a, e, i, o, u), fügst du -s hinzu. Endet es auf einen Konsonanten, fügst du -es hinzu.", "Si le mot finit par une voyelle (a, e, i, o, u), ajoute -s. S'il finit par une consonne, ajoute -es."),
    voorbeelden: [["libro → libros", m("boek → boeken", "book → books", "Buch → Bücher", "livre → livres")], ["examen → exámenes", m("tentamen → tentamens", "exam → exams", "Prüfung → Prüfungen", "examen → examens")]],
    test: { vraag: m("Wat is het meervoud van mujer (vrouw)?", "What is the plural of mujer (woman)?", "Was ist die Mehrzahl von mujer (Frau)?", "Quel est le pluriel de mujer (femme) ?"), opties: ["mujers", "mujeres"], juist: 1 } },
  { titel: m("3. De vraag: ¿ en ?", "3. The question: ¿ and ?", "3. Die Frage: ¿ und ?", "3. La question : ¿ et ?"),
    uitleg: m("Een vraag begint met een omgekeerd vraagteken (¿) en eindigt met een gewoon vraagteken (?). Vraagwoorden krijgen een accent.", "A question starts with an upside-down question mark (¿) and ends with a normal one (?). Question words take an accent.", "Eine Frage beginnt mit einem umgekehrten Fragezeichen (¿) und endet mit einem normalen (?). Fragewörter bekommen einen Akzent.", "Une question commence par un point d'interrogation renversé (¿) et finit par un normal (?). Les mots interrogatifs prennent un accent."),
    voorbeelden: [["¿Cómo estás?", m("Hoe gaat het?", "How are you?", "Wie geht es dir?", "Comment tu vas ?")], ["¿Dónde vives?", m("Waar woon je?", "Where do you live?", "Wo wohnst du?", "Où habites-tu ?")]],
    test: { vraag: m("Welke schrijfwijze is goed?", "Which spelling is correct?", "Welche Schreibweise ist richtig?", "Quelle écriture est correcte ?"), opties: ["que quieres?", "¿Qué quieres?"], juist: 1 } },
  { titel: m("4. Ontkennen: no voor het werkwoord", "4. Negating: no before the verb", "4. Verneinen: no vor dem Verb", "4. La négation : no devant le verbe"),
    uitleg: m("Je zet no voor het werkwoord. Zo maak je een zin negatief.", "You put no before the verb. That's how you make a sentence negative.", "Du setzt no vor das Verb. So verneinst du einen Satz.", "On met no devant le verbe. C'est ainsi qu'on fait une phrase négative."),
    voorbeelden: [["No tengo tiempo.", m("Ik heb geen tijd.", "I don't have time.", "Ich habe keine Zeit.", "Je n'ai pas le temps.")], ["No entiendo.", m("Ik begrijp het niet.", "I don't understand.", "Ich verstehe nicht.", "Je ne comprends pas.")]],
    test: { vraag: m("Waar zet je no?", "Where do you put no?", "Wo setzt du no hin?", "Où met-on no ?"), opties: [m("achter het werkwoord", "after the verb", "nach dem Verb", "après le verbe"), m("voor het werkwoord", "before the verb", "vor dem Verb", "devant le verbe")], juist: 1 } },
  { titel: m("5. Het werkwoord past zich aan de persoon aan", "5. The verb changes with the person", "5. Das Verb passt sich der Person an", "5. Le verbe s'adapte à la personne"),
    uitleg: m("yo = ik, tú = jij, él/ella = hij/zij, nosotros = wij, ellos/ellas = zij (meervoud). Elke persoon krijgt een eigen uitgang. Bij -ar zijn de uitgangen: o, as, a, amos, an.", "yo = I, tú = you, él/ella = he/she, nosotros = we, ellos/ellas = they. Each person gets its own ending. For -ar verbs the endings are: o, as, a, amos, an.", "yo = ich, tú = du, él/ella = er/sie, nosotros = wir, ellos/ellas = sie (Mehrzahl). Jede Person bekommt eine eigene Endung. Bei -ar sind die Endungen: o, as, a, amos, an.", "yo = je, tú = tu, él/ella = il/elle, nosotros = nous, ellos/ellas = ils/elles. Chaque personne a sa terminaison. Pour les verbes en -ar : o, as, a, amos, an."),
    voorbeelden: [["hablo", m("ik praat", "I speak", "ich spreche", "je parle")], ["hablas", m("jij praat", "you speak", "du sprichst", "tu parles")], ["habla", m("hij of zij praat", "he or she speaks", "er/sie spricht", "il/elle parle")]],
    test: { vraag: m("Hoe zeg je ik werk?", "How do you say I work?", "Wie sagt man ich arbeite?", "Comment dit-on je travaille ?"), opties: ["trabajas", "trabajo"], juist: 1 } },
  { titel: m("6. Werkwoorden op -er en -ir", "6. Verbs ending in -er and -ir", "6. Verben auf -er und -ir", "6. Verbes en -er et -ir"),
    uitleg: m("Ook bij -er en -ir verandert de uitgang per persoon. Bij -er: o, es, e, emos, en. Bij -ir: o, es, e, imos, en.", "With -er and -ir verbs the ending also changes per person. For -er: o, es, e, emos, en. For -ir: o, es, e, imos, en.", "Auch bei -er und -ir ändert sich die Endung je Person. Bei -er: o, es, e, emos, en. Bei -ir: o, es, e, imos, en.", "Avec -er et -ir, la terminaison change aussi selon la personne. Pour -er : o, es, e, emos, en. Pour -ir : o, es, e, imos, en."),
    voorbeelden: [["como", m("ik eet", "I eat", "ich esse", "je mange")], ["vives", m("jij woont", "you live", "du wohnst", "tu habites")]],
    test: { vraag: m("Hoe zeg je jij eet?", "How do you say you eat?", "Wie sagt man du isst?", "Comment dit-on tu manges ?"), opties: ["comes", "come"], juist: 0 } },
  { titel: m("7. Me gusta = het bevalt mij", "7. Me gusta = I like it", "7. Me gusta = es gefällt mir", "7. Me gusta = ça me plaît"),
    uitleg: m("Bij gustar is het ding dat je leuk vindt het onderwerp. Enkelvoud: me gusta. Meervoud: me gustan. Me betekent mij.", "With gustar the thing you like is the subject. Singular: me gusta. Plural: me gustan. Me means me.", "Bei gustar ist das, was dir gefällt, das Subjekt. Einzahl: me gusta. Mehrzahl: me gustan. Me heißt mir.", "Avec gustar, la chose qui te plaît est le sujet. Singulier : me gusta. Pluriel : me gustan. Me veut dire me."),
    voorbeelden: [["Me gusta el café.", m("Ik vind koffie lekker.", "I like coffee.", "Ich mag Kaffee.", "J'aime le café.")], ["Me gustan las películas.", m("Ik hou van films.", "I like films.", "Ich mag Filme.", "J'aime les films.")]],
    test: { vraag: m("Wat zeg je bij de films (meervoud)?", "What do you say about the films (plural)?", "Was sagst du über die Filme (Mehrzahl)?", "Que dis-tu pour les films (pluriel) ?"), opties: ["me gusta las películas", "me gustan las películas"], juist: 1 } },
  { titel: m("8. Ser of estar", "8. Ser or estar", "8. Ser oder estar", "8. Ser ou estar"),
    uitleg: m("Ser gebruik je voor wat iets of iemand is, zoals nationaliteit of beroep. Estar gebruik je voor hoe je je voelt en waar je bent.", "Ser is for what something or someone is, like nationality or job. Estar is for how you feel and where you are.", "Ser benutzt du für das, was etwas oder jemand ist, zum Beispiel Nationalität oder Beruf. Estar benutzt du für Gefühle und den Ort.", "Ser sert à dire ce que quelque chose ou quelqu'un est, comme la nationalité ou le métier. Estar sert à dire comment on se sent et où l'on est."),
    voorbeelden: [["Soy holandés.", m("Ik ben Nederlands.", "I'm Dutch.", "Ich bin Niederländer.", "Je suis néerlandais.")], ["Estoy cansado.", m("Ik ben moe.", "I'm tired.", "Ich bin müde.", "Je suis fatigué.")]],
    test: { vraag: m("Welk werkwoord hoort bij ik ben moe?", "Which verb goes with I'm tired?", "Welches Verb passt zu ich bin müde?", "Quel verbe va avec je suis fatigué ?"), opties: ["soy", "estoy"], juist: 1 } },
  { titel: m("9. Tú of usted", "9. Tú or usted", "9. Tú oder usted", "9. Tú ou usted"),
    uitleg: m("Tú is jij, voor vrienden en familie. Usted is u, voor mensen die je niet kent en in werk of formele situaties.", "Tú is you, for friends and family. Usted is the formal you, for people you don't know and in work or formal situations.", "Tú ist du, für Freunde und Familie. Usted ist Sie, für Fremde und in Arbeit oder förmlichen Situationen.", "Tú est tu, pour les amis et la famille. Usted est vous, pour les inconnus et les situations formelles."),
    voorbeelden: [["¿Qué quieres?", m("Wat wil jij?", "What do you want?", "Was willst du?", "Qu'est-ce que tu veux ?")], ["¿Qué desea usted?", m("Wat wilt u?", "What would you like?", "Was möchten Sie?", "Que désirez-vous ?")]],
    test: { vraag: m("Welke vorm gebruik je bij een onbekende in een winkel?", "Which form do you use with a stranger in a shop?", "Welche Form benutzt du bei einem Fremden im Laden?", "Quelle forme utilises-tu avec un inconnu dans un magasin ?"), opties: ["tú", "usted"], juist: 1 } },
  { titel: m("10. Verleden tijd: -é en -í", "10. Past tense: -é and -í", "10. Vergangenheit: -é und -í", "10. Passé : -é et -í"),
    uitleg: m("Voor iets dat je één keer in het verleden deed. Bij -ar krijgt de ik-vorm de uitgang -é. Bij -er en -ir krijgt de ik-vorm de uitgang -í. Fui betekent ik ging.", "For something you did once in the past. With -ar verbs the I-form ends in -é. With -er and -ir verbs the I-form ends in -í. Fui means I went.", "Für etwas, das du einmal in der Vergangenheit getan hast. Bei -ar endet die ich-Form auf -é. Bei -er und -ir endet die ich-Form auf -í. Fui heißt ich ging.", "Pour une action unique dans le passé. Avec -ar, la forme je finit en -é. Avec -er et -ir, elle finit en -í. Fui veut dire je suis allé."),
    voorbeelden: [["hablé", m("ik sprak", "I spoke", "ich sprach", "j'ai parlé")], ["comí", m("ik at", "I ate", "ich aß", "j'ai mangé")], ["fui al cine", m("ik ging naar de bioscoop", "I went to the cinema", "ich ging ins Kino", "je suis allé au cinéma")]],
    test: { vraag: m("Hoe zeg je ik at (één keer)?", "How do you say I ate (once)?", "Wie sagt man ich aß (einmal)?", "Comment dit-on j'ai mangé (une fois) ?"), opties: ["como", "comí"], juist: 1 } },
  { titel: m("11. Bijvoeglijk naamwoord: -o, -a, -e", "11. Adjective: -o, -a, -e", "11. Adjektiv: -o, -a, -e", "11. Adjectif : -o, -a, -e"),
    uitleg: m("Het bijvoeglijk naamwoord past zich aan het zelfstandig naamwoord aan. Op -o: alto (m), alta (v), altos (mv m), altas (mv v). Op -e of een medeklinker: één vorm voor man en vrouw (grande, fácil), meervoud grandes, fáciles. Nationaliteiten op een medeklinker krijgen -a bij vrouw: español, española. Het staat meestal achter het zelfstandig naamwoord: una casa grande.", "The adjective agrees with the noun. Ending in -o: alto (m), alta (f), altos (m pl), altas (f pl). Ending in -e or a consonant: one form for masculine and feminine (grande, fácil), plural grandes, fáciles. Nationalities ending in a consonant add -a for feminine: español, española. It usually follows the noun: una casa grande.", "Das Adjektiv richtet sich nach dem Substantiv. Auf -o: alto (m), alta (f), altos (m Pl.), altas (f Pl.). Auf -e oder Konsonant: eine Form für männlich und weiblich (grande, fácil), Plural grandes, fáciles. Nationalitäten auf Konsonant bekommen im Femininum -a: español, española. Es steht meist hinter dem Substantiv: una casa grande.", "L'adjectif s'accorde avec le nom. En -o : alto (m), alta (f), altos (m pl.), altas (f pl.). En -e ou consonne : une seule forme pour le masculin et le féminin (grande, fácil), pluriel grandes, fáciles. Les nationalités en consonne prennent -a au féminin : español, española. Il se place en général après le nom : una casa grande."),
    voorbeelden: [["un chico alto, una chica alta", m("een lange jongen, een lang meisje", "a tall boy, a tall girl", "ein großer Junge, ein großes Mädchen", "un grand garçon, une grande fille")], ["un libro fácil, una prueba fácil", m("een makkelijk boek, een makkelijke toets", "an easy book, an easy test", "ein leichtes Buch, ein leichter Test", "un livre facile, un test facile")], ["mi amigo español, mi amiga española", m("mijn Spaanse vriend, mijn Spaanse vriendin", "my Spanish friend (m/f)", "mein spanischer Freund, meine spanische Freundin", "mon ami espagnol, mon amie espagnole")]],
    test: { vraag: m("Welke vorm past? una casa ___ (groot)", "Which form fits? una casa ___ (big)", "Welche Form passt? una casa ___ (groß)", "Quelle forme convient ? una casa ___ (grand)"), opties: ["grando", "grande"], juist: 1 } }
];

// ---------- Gesprek: veelgehoorde zinnen van een gesprekspartner ----------
// re = patroon op de zin zonder accenten en leestekens. gen = de zin heeft een wisselend deel:
// dan blijft de vertaling woord voor woord, maar de antwoorden passen wel bij het soort vraag.
var TALK = [
  { re: "como (te|se) llam|cual es (tu|su) nombre", es: "¿Cómo te llamas?", m: m("Hoe heet je?", "What's your name?", "Wie heißt du?", "Comment tu t'appelles ?"),
    a: [p("Me llamo … ¿Y tú?", "Ik heet … En jij?", "My name is … And you?", "Ich heiße … Und du?", "Je m'appelle … Et toi ?"), p("Soy …, mucho gusto.", "Ik ben …, aangenaam.", "I'm …, nice to meet you.", "Ich bin …, freut mich.", "Je suis …, enchanté.")] },
  { re: "de donde (eres|es|sois|son)", es: "¿De dónde eres?", m: m("Waar kom je vandaan?", "Where are you from?", "Woher kommst du?", "D'où viens-tu ?"),
    a: [p("Soy de …", "Ik kom uit …", "I'm from …", "Ich komme aus …", "Je viens de …"), p("Soy de … ¿Y tú, de dónde eres?", "Ik kom uit … En jij, waar kom jij vandaan?", "I'm from … And you, where are you from?", "Ich komme aus … Und du, woher kommst du?", "Je viens de … Et toi, d'où viens-tu ?")] },
  { re: "donde (vives|vive|vivis|viven)", es: "¿Dónde vives?", m: m("Waar woon je?", "Where do you live?", "Wo wohnst du?", "Où habites-tu ?"),
    a: [p("Vivo en …", "Ik woon in …", "I live in …", "Ich wohne in …", "J'habite à …"), p("Vivo en …, ¿y tú?", "Ik woon in …, en jij?", "I live in …, and you?", "Ich wohne in …, und du?", "J'habite à …, et toi ?")] },
  { re: "cuantos anos (tienes|tiene)", es: "¿Cuántos años tienes?", m: m("Hoe oud ben je?", "How old are you?", "Wie alt bist du?", "Quel âge as-tu ?"),
    a: [p("Tengo … años.", "Ik ben … jaar.", "I'm … years old.", "Ich bin … Jahre alt.", "J'ai … ans."), p("Tengo … años, ¿y tú?", "Ik ben … jaar, en jij?", "I'm … years old, and you?", "Ich bin … Jahre alt, und du?", "J'ai … ans, et toi ?")] },
  { re: "a que te dedicas|en que trabajas|de que trabajas|cual es tu trabajo", es: "¿A qué te dedicas?", m: m("Wat voor werk doe je?", "What do you do for a living?", "Was machst du beruflich?", "Que fais-tu dans la vie ?"),
    a: [p("Trabajo en …", "Ik werk in …", "I work in …", "Ich arbeite in …", "Je travaille dans …"), p("Soy estudiante.", "Ik ben student.", "I'm a student.", "Ich bin Student.", "Je suis étudiant.")] },
  { re: "hablas (espanol|castellano)|habla usted espanol", es: "¿Hablas español?", m: m("Spreek je Spaans?", "Do you speak Spanish?", "Sprichst du Spanisch?", "Tu parles espagnol ?"),
    a: [p("Un poco. Estoy aprendiendo.", "Een beetje. Ik ben het aan het leren.", "A little. I'm learning.", "Ein bisschen. Ich lerne noch.", "Un peu. J'apprends."), p("Sí, pero habla despacio, por favor.", "Ja, maar praat langzaam, alsjeblieft.", "Yes, but speak slowly, please.", "Ja, aber sprich bitte langsam.", "Oui, mais parle lentement, s'il te plaît.")] },
  { re: "^(hola )?(que tal|como va todo|como andas|como te va|como va)( todo)?$", es: "¿Qué tal?", m: m("Hoe gaat het?", "How's it going?", "Wie geht's?", "Ça va ?"),
    a: [p("Muy bien, ¿y tú?", "Heel goed, en met jou?", "Very well, and you?", "Sehr gut, und dir?", "Très bien, et toi ?"), p("Todo bien, gracias.", "Alles goed, bedankt.", "All good, thanks.", "Alles gut, danke.", "Tout va bien, merci.")] },
  { re: "mucho gusto|encantad[oa]|un placer", es: "Mucho gusto.", m: m("Aangenaam.", "Nice to meet you.", "Freut mich.", "Enchanté."),
    a: [p("Igualmente.", "Insgelijks.", "Likewise.", "Gleichfalls.", "De même."), p("El gusto es mío.", "Het genoegen is aan mijn kant.", "The pleasure is mine.", "Die Freude ist ganz meinerseits.", "Tout le plaisir est pour moi.")] },
  { re: "^(hola|buenas)$", es: "¡Hola!", m: m("Hallo!", "Hello!", "Hallo!", "Salut !"),
    a: [p("¡Hola! ¿Qué tal?", "Hallo! Hoe gaat het?", "Hello! How's it going?", "Hallo! Wie geht's?", "Salut ! Ça va ?"), p("¡Hola! Mucho gusto.", "Hallo! Aangenaam.", "Hello! Nice to meet you.", "Hallo! Freut mich.", "Salut ! Enchanté.")] },
  { re: "^(hola )?buenos dias", es: "¡Buenos días!", m: m("Goedemorgen!", "Good morning!", "Guten Morgen!", "Bonjour !"),
    a: [p("¡Buenos días! ¿Cómo estás?", "Goedemorgen! Hoe gaat het met je?", "Good morning! How are you?", "Guten Morgen! Wie geht es dir?", "Bonjour ! Comment vas-tu ?")] },
  { re: "^(hola )?buenas tardes", es: "¡Buenas tardes!", m: m("Goedemiddag!", "Good afternoon!", "Guten Tag!", "Bon après-midi !"),
    a: [p("¡Buenas tardes! ¿Qué tal?", "Goedemiddag! Hoe gaat het?", "Good afternoon! How's it going?", "Guten Tag! Wie geht's?", "Bon après-midi ! Ça va ?")] },
  { re: "^(hola )?buenas noches", es: "¡Buenas noches!", m: m("Goedenavond!", "Good evening!", "Guten Abend!", "Bonsoir !"),
    a: [p("¡Buenas noches! ¿Qué tal?", "Goedenavond! Hoe gaat het?", "Good evening! How's it going?", "Guten Abend! Wie geht's?", "Bonsoir ! Ça va ?")] },
  { re: "^(muchas |muchisimas )?gracias", es: "Gracias.", m: m("Dank je.", "Thank you.", "Danke.", "Merci."),
    a: [p("De nada.", "Graag gedaan.", "You're welcome.", "Gern geschehen.", "De rien."), p("No hay de qué.", "Geen dank.", "Don't mention it.", "Keine Ursache.", "Il n'y a pas de quoi.")] },
  { re: "^de nada|no hay de que", es: "De nada.", m: m("Graag gedaan.", "You're welcome.", "Gern geschehen.", "De rien."),
    a: [p("Muy amable.", "Heel vriendelijk.", "Very kind of you.", "Sehr freundlich.", "C'est très gentil.")] },
  { re: "adios|hasta luego|hasta pronto|hasta manana|nos vemos|chao", es: "¡Hasta luego!", m: m("Tot ziens!", "See you later!", "Bis später!", "À plus tard !"),
    a: [p("¡Hasta luego!", "Tot ziens!", "See you later!", "Bis später!", "À plus tard !"), p("¡Nos vemos! Cuídate.", "Tot ziens! Pas goed op jezelf.", "See you! Take care.", "Bis bald! Pass auf dich auf.", "À bientôt ! Prends soin de toi.")] },
  { re: "que hora es|tienes hora", es: "¿Qué hora es?", m: m("Hoe laat is het?", "What time is it?", "Wie spät ist es?", "Quelle heure est-il ?"),
    a: [p("Son las …", "Het is … uur.", "It's … o'clock.", "Es ist … Uhr.", "Il est … heures."), p("No lo sé, lo siento.", "Dat weet ik niet, sorry.", "I don't know, sorry.", "Ich weiß es nicht, tut mir leid.", "Je ne sais pas, désolé.")] },
  { re: "tienes hambre", es: "¿Tienes hambre?", m: m("Heb je honger?", "Are you hungry?", "Hast du Hunger?", "Tu as faim ?"),
    a: [p("Sí, tengo hambre.", "Ja, ik heb honger.", "Yes, I'm hungry.", "Ja, ich habe Hunger.", "Oui, j'ai faim."), p("No, gracias, ya comí.", "Nee, dank je, ik heb al gegeten.", "No, thanks, I've already eaten.", "Nein, danke, ich habe schon gegessen.", "Non, merci, j'ai déjà mangé.")] },
  { re: "tienes (hermanos|hermanas)", es: "¿Tienes hermanos?", m: m("Heb je broers of zussen?", "Do you have brothers or sisters?", "Hast du Geschwister?", "Tu as des frères et sœurs ?"),
    a: [p("Sí, tengo …", "Ja, ik heb …", "Yes, I have …", "Ja, ich habe …", "Oui, j'ai …"), p("No, no tengo hermanos.", "Nee, ik heb geen broers of zussen.", "No, I don't have any siblings.", "Nein, ich habe keine Geschwister.", "Non, je n'ai pas de frères et sœurs.")] },
  { re: "que te gusta hacer|que haces en tu tiempo libre|cuales son tus aficiones", es: "¿Qué te gusta hacer?", m: m("Wat doe je graag?", "What do you like to do?", "Was machst du gern?", "Qu'est-ce que tu aimes faire ?"),
    a: [p("Me gusta …", "Ik hou van …", "I like …", "Ich mag …", "J'aime …"), p("Me gusta viajar y aprender idiomas.", "Ik hou van reizen en talen leren.", "I like travelling and learning languages.", "Ich reise gern und lerne gern Sprachen.", "J'aime voyager et apprendre des langues.")] },
  { re: "estas (aqui )?de vacaciones", es: "¿Estás de vacaciones?", m: m("Ben je op vakantie?", "Are you on holiday?", "Bist du im Urlaub?", "Tu es en vacances ?"),
    a: [p("Sí, estoy de vacaciones.", "Ja, ik ben op vakantie.", "Yes, I'm on holiday.", "Ja, ich bin im Urlaub.", "Oui, je suis en vacances."), p("No, estoy aquí por trabajo.", "Nee, ik ben hier voor werk.", "No, I'm here for work.", "Nein, ich bin beruflich hier.", "Non, je suis ici pour le travail.")] },
  { re: "cuanto tiempo (te quedas|vas a estar|te vas a quedar|llevas aqui)", es: "¿Cuánto tiempo te quedas?", m: m("Hoe lang blijf je?", "How long are you staying?", "Wie lange bleibst du?", "Tu restes combien de temps ?"),
    a: [p("Me quedo … días.", "Ik blijf … dagen.", "I'm staying … days.", "Ich bleibe … Tage.", "Je reste … jours."), p("Una semana.", "Een week.", "One week.", "Eine Woche.", "Une semaine.")] },
  { re: "es tu primera vez", es: "¿Es tu primera vez aquí?", m: m("Is dit je eerste keer hier?", "Is this your first time here?", "Bist du zum ersten Mal hier?", "C'est ta première fois ici ?"),
    a: [p("Sí, es mi primera vez.", "Ja, het is mijn eerste keer.", "Yes, it's my first time.", "Ja, es ist mein erstes Mal.", "Oui, c'est ma première fois."), p("No, ya estuve aquí antes.", "Nee, ik ben hier al eerder geweest.", "No, I've been here before.", "Nein, ich war schon einmal hier.", "Non, je suis déjà venu ici.")] },
  { re: "que (quieres|quiere|vas a|va a|desea|deseas|te pongo|le pongo) ?(tomar|beber|comer|pedir)?$|que (quieres|vas a) (tomar|beber|comer|pedir)", es: "¿Qué quieres tomar?", m: m("Wat wil je bestellen?", "What would you like to have?", "Was möchtest du bestellen?", "Qu'est-ce que tu veux prendre ?"),
    a: [p("Quiero un café, por favor.", "Ik wil graag een koffie.", "I'd like a coffee, please.", "Ich möchte bitte einen Kaffee.", "Je voudrais un café, s'il vous plaît."), p("Una cerveza, por favor.", "Een biertje, alsjeblieft.", "A beer, please.", "Ein Bier, bitte.", "Une bière, s'il vous plaît."), p("¿Qué me recomiendas?", "Wat raad je me aan?", "What do you recommend?", "Was empfiehlst du mir?", "Qu'est-ce que tu me conseilles ?")] },
  { re: "algo mas", es: "¿Algo más?", m: m("Nog iets?", "Anything else?", "Noch etwas?", "Autre chose ?"),
    a: [p("No, gracias, eso es todo.", "Nee, dank je, dat is alles.", "No, thanks, that's all.", "Nein, danke, das ist alles.", "Non, merci, c'est tout."), p("Sí, … por favor.", "Ja, … alsjeblieft.", "Yes, … please.", "Ja, … bitte.", "Oui, … s'il vous plaît.")] },
  { re: "(me )?(entiendes|entiende|comprendes)", es: "¿Me entiendes?", m: m("Begrijp je me?", "Do you understand me?", "Verstehst du mich?", "Tu me comprends ?"),
    a: [p("Sí, entiendo.", "Ja, ik begrijp het.", "Yes, I understand.", "Ja, ich verstehe.", "Oui, je comprends."), p("No entiendo. ¿Puedes repetir más despacio?", "Ik begrijp het niet. Kun je het langzamer herhalen?", "I don't understand. Can you repeat more slowly?", "Ich verstehe nicht. Kannst du es langsamer wiederholen?", "Je ne comprends pas. Tu peux répéter plus lentement ?")] },
  { re: "^(perdon|perdona|disculpa|disculpe|lo siento)", es: "Perdón.", m: m("Sorry.", "Sorry.", "Entschuldigung.", "Pardon."),
    a: [p("No pasa nada.", "Geeft niets.", "No problem.", "Macht nichts.", "Ce n'est rien."), p("Tranquilo, no te preocupes.", "Rustig maar, maak je geen zorgen.", "It's fine, don't worry.", "Schon gut, mach dir keine Sorgen.", "Ce n'est pas grave, ne t'inquiète pas.")] },
  { re: "^estas bien|te encuentras bien|todo bien$", es: "¿Estás bien?", m: m("Gaat het goed met je?", "Are you okay?", "Geht es dir gut?", "Ça va ?"),
    a: [p("Sí, estoy bien, gracias.", "Ja, het gaat goed, dank je.", "Yes, I'm fine, thanks.", "Ja, mir geht es gut, danke.", "Oui, ça va, merci."), p("Más o menos.", "Het gaat wel.", "So-so.", "Es geht so.", "Comme ci, comme ça.")] },
  { re: "cuando (llegaste|llego|has llegado)", es: "¿Cuándo llegaste?", m: m("Wanneer ben je aangekomen?", "When did you arrive?", "Wann bist du angekommen?", "Quand es-tu arrivé ?"),
    a: [p("Llegué ayer.", "Ik ben gisteren aangekomen.", "I arrived yesterday.", "Ich bin gestern angekommen.", "Je suis arrivé hier."), p("Llegué hace … días.", "Ik ben … dagen geleden aangekomen.", "I arrived … days ago.", "Ich bin vor … Tagen angekommen.", "Je suis arrivé il y a … jours.")] },
  { re: "cuando (te vas|se va|vuelves|regresas)", es: "¿Cuándo te vas?", m: m("Wanneer ga je weg?", "When are you leaving?", "Wann fährst du ab?", "Tu pars quand ?"),
    a: [p("Me voy mañana.", "Ik ga morgen weg.", "I'm leaving tomorrow.", "Ich fahre morgen ab.", "Je pars demain."), p("Me voy la semana que viene.", "Ik ga volgende week weg.", "I'm leaving next week.", "Ich fahre nächste Woche ab.", "Je pars la semaine prochaine.")] },
  { re: "con quien (viajas|estas|vienes|has venido)", es: "¿Con quién viajas?", m: m("Met wie reis je?", "Who are you travelling with?", "Mit wem reist du?", "Tu voyages avec qui ?"),
    a: [p("Estoy con mis amigos.", "Ik ben met mijn vrienden.", "I'm with my friends.", "Ich bin mit meinen Freunden hier.", "Je suis avec mes amis."), p("Viajo solo.", "Ik reis alleen.", "I'm travelling alone.", "Ich reise allein.", "Je voyage seul.")] },
  { re: "buen provecho|que aproveche", es: "¡Buen provecho!", m: m("Eet smakelijk!", "Enjoy your meal!", "Guten Appetit!", "Bon appétit !"),
    a: [p("Gracias, igualmente.", "Dank je, insgelijks.", "Thanks, you too.", "Danke, gleichfalls.", "Merci, toi aussi.")] },
  { re: "^salud$", es: "¡Salud!", m: m("Proost!", "Cheers!", "Prost!", "Santé !"),
    a: [p("¡Salud!", "Proost!", "Cheers!", "Prost!", "Santé !")] },
  { re: "bienvenid[oa]", es: "¡Bienvenido!", m: m("Welkom!", "Welcome!", "Willkommen!", "Bienvenue !"),
    a: [p("Muchas gracias.", "Dank je wel.", "Thank you very much.", "Vielen Dank.", "Merci beaucoup.")] },
  { gen: true, re: "donde esta|donde queda|donde hay", a: [p("No lo sé, lo siento.", "Dat weet ik niet, sorry.", "I don't know, sorry.", "Ich weiß es nicht, tut mir leid.", "Je ne sais pas, désolé."), p("No soy de aquí.", "Ik kom hier niet vandaan.", "I'm not from here.", "Ich bin nicht von hier.", "Je ne suis pas d'ici.")] },
  { gen: true, re: "(te|le) gusta", a: [p("Sí, me gusta mucho.", "Ja, dat vind ik erg leuk.", "Yes, I like it a lot.", "Ja, das gefällt mir sehr.", "Oui, j'aime beaucoup."), p("No mucho, la verdad.", "Niet zo, eerlijk gezegd.", "Not much, to be honest.", "Nicht so sehr, ehrlich gesagt.", "Pas trop, à vrai dire.")] },
  { gen: true, re: "que te parece|que opinas|que piensas", a: [p("Me parece bien.", "Dat lijkt me goed.", "Sounds good to me.", "Das finde ich gut.", "Ça me paraît bien."), p("No estoy seguro.", "Ik weet het niet zeker.", "I'm not sure.", "Ich bin mir nicht sicher.", "Je ne suis pas sûr.")] },
  { gen: true, re: "^(quieres|te apetece|te gustaria|vamos a|vamos)", a: [p("Sí, claro.", "Ja, natuurlijk.", "Yes, of course.", "Ja, klar.", "Oui, bien sûr."), p("Ahora no, gracias.", "Nu niet, dank je.", "Not now, thanks.", "Jetzt nicht, danke.", "Pas maintenant, merci.")] },
  { re: "que (haces|vas a hacer|planes tienes) (para )?(este|el) (fin de semana|finde)", es: "¿Qué haces este fin de semana?", m: m("Wat doe je dit weekend?", "What are you doing this weekend?", "Was machst du am Wochenende?", "Qu'est-ce que tu fais ce week-end ?"),
    a: [p("Voy a descansar un poco.", "Ik ga een beetje uitrusten.", "I'm going to rest a bit.", "Ich werde mich ein bisschen ausruhen.", "Je vais me reposer un peu."), p("Todavía no lo sé. ¿Y tú?", "Dat weet ik nog niet. En jij?", "I don't know yet. And you?", "Das weiß ich noch nicht. Und du?", "Je ne sais pas encore. Et toi ?")] },
  { re: "^(y )?que (haces|estas haciendo)$", es: "¿Qué haces?", m: m("Wat ben je aan het doen?", "What are you doing?", "Was machst du gerade?", "Qu'est-ce que tu fais ?"),
    a: [p("Nada especial.", "Niets bijzonders.", "Nothing special.", "Nichts Besonderes.", "Rien de spécial."), p("Estoy dando un paseo.", "Ik maak een wandeling.", "I'm going for a walk.", "Ich mache einen Spaziergang.", "Je me promène.")] },
  { re: "^te gusta", gen: true, es: "¿Te gusta …?", m: m("Vind je … leuk?", "Do you like …?", "Gefällt dir …?", "Est-ce que tu aimes … ?"),
    a: [p("Sí, me gusta mucho.", "Ja, dat vind ik erg leuk.", "Yes, I like it a lot.", "Ja, das gefällt mir sehr.", "Oui, j'aime beaucoup."), p("Me encanta.", "Ik vind het geweldig.", "I love it.", "Ich liebe es.", "J'adore."), p("No mucho, la verdad.", "Niet zo, eerlijk gezegd.", "Not much, to be honest.", "Ehrlich gesagt nicht so sehr.", "Pas trop, à vrai dire.")] },
  { re: "^quieres ", gen: true, es: "¿Quieres …?", m: m("Wil je …?", "Do you want …?", "Möchtest du …?", "Tu veux … ?"),
    a: [p("Sí, por favor.", "Ja, graag.", "Yes, please.", "Ja, bitte.", "Oui, s'il te plaît."), p("No, gracias.", "Nee, dank je.", "No, thank you.", "Nein, danke.", "Non, merci.")] },
  { re: "(como|que tal) (estuvo|fue|estuviste|fuiste|estuvieron|fueron) (tu |el |su |vuestro )?(fin de semana|finde)", es: "¿Cómo estuvo tu fin de semana?", m: m("Hoe was je weekend?", "How was your weekend?", "Wie war dein Wochenende?", "Comment s'est passé ton week-end ?"),
    a: [p("Muy bien, gracias. ¿Y el tuyo?", "Heel goed, dank je. En het jouwe?", "Very good, thanks. And yours?", "Sehr gut, danke. Und deins?", "Très bien, merci. Et le tien ?"), p("Fue tranquilo. Descansé mucho.", "Het was rustig. Ik heb veel gerust.", "It was quiet. I rested a lot.", "Es war ruhig. Ich habe viel ausgeruht.", "C'était calme. Je me suis beaucoup reposé.")] }
];

// Andere manieren om dezelfde boodschap te zeggen. De sleutel is de zin zoals hierboven (zonder leestekens).
var ALT = {
  "¿Qué tal?": [
    p("¿Cómo estás?", "Hoe gaat het met je?", "How are you?", "Wie geht es dir?", "Comment tu vas ?"),
    p("¿Cómo va todo?", "Hoe gaat alles?", "How is everything going?", "Wie läuft alles?", "Tout va bien ?"),
    p("¿Qué hay de nuevo?", "Wat is er nieuws?", "What's new?", "Was gibt es Neues?", "Quoi de neuf ?"),
    p("¿Qué onda?", "Hoe is het?", "What's up?", "Was geht?", "Ça roule ?")
  ],
  "¿Cómo estás?": [
    p("¿Qué tal?", "Hoe gaat het?", "How's it going?", "Wie geht's?", "Ça va ?"),
    p("¿Cómo te va?", "Hoe gaat het met je?", "How are things going for you?", "Wie geht es dir so?", "Comment ça va pour toi ?")
  ],
  "¿Qué tal el fin de semana?": [
    p("¿Cómo fue el fin de semana?", "Hoe was het weekend?", "How was the weekend?", "Wie war das Wochenende?", "Comment s'est passé le week-end ?"),
    p("¿Qué hiciste el fin de semana?", "Wat heb je dit weekend gedaan?", "What did you do this weekend?", "Was hast du am Wochenende gemacht?", "Qu'est-ce que tu as fait ce week-end ?")
  ],
  "¿Qué has hecho hoy?": [
    p("¿Qué tal tu día?", "Hoe was je dag?", "How was your day?", "Wie war dein Tag?", "Comment s'est passée ta journée ?"),
    p("¿Qué tal el día?", "Hoe is je dag tot nu toe?", "How's your day so far?", "Wie läuft dein Tag bisher?", "Comment se passe ta journée ?")
  ],
  "Hablamos luego.": [
    p("Hasta luego.", "Tot straks.", "See you later.", "Bis später.", "À tout à l'heure."),
    p("Chao.", "Doei.", "Bye.", "Tschüss.", "Salut.")
  ],
  "Nos vemos.": [
    p("Hasta luego.", "Tot straks.", "See you later.", "Bis später.", "À tout à l'heure."),
    p("Hasta mañana.", "Tot morgen.", "See you tomorrow.", "Bis morgen.", "À demain.")
  ],
  "No entiendo.": [
    p("No comprendo.", "Ik begrijp het niet.", "I don't understand.", "Ich verstehe nicht.", "Je ne comprends pas."),
    p("No lo entiendo.", "Ik snap het niet.", "I don't get it.", "Ich verstehe es nicht.", "Je n'y comprends rien.")
  ],
  "¿Puedes repetirlo, por favor?": [
    p("¿Me lo repites, por favor?", "Kun je dat nog een keer zeggen?", "Can you say that again?", "Kannst du das nochmal sagen?", "Tu peux le répéter, s'il te plaît ?")
  ],
  "Más despacio, por favor.": [
    p("¿Puedes hablar más despacio?", "Kun je langzamer praten?", "Can you speak more slowly?", "Kannst du langsamer sprechen?", "Tu peux parler plus lentement ?")
  ],
  "Tengo que irme.": [
    p("Me tengo que ir.", "Ik moet gaan.", "I have to go.", "Ich muss gehen.", "Je dois partir."),
    p("Me voy.", "Ik ga.", "I'm off.", "Ich gehe.", "Je m'en vais.")
  ],
  "Me parece bien.": [
    p("Estoy de acuerdo.", "Ik ben het ermee eens.", "I agree.", "Einverstanden.", "Je suis d'accord."),
    p("Está bien.", "Goed.", "Okay.", "Gut.", "D'accord.")
  ],
  "Me alegro de verte.": [
    p("Qué bueno verte.", "Wat fijn je te zien.", "Good to see you.", "Schön, dich zu sehen.", "Ravi de te voir."),
    p("Me da gusto verte.", "Wat leuk je te zien.", "Nice to see you.", "Schön, dich zu sehen.", "Content de te voir.")
  ],
  "Creo que sí.": [
    p("Supongo que sí.", "Ik denk van wel.", "I think so.", "Ich glaube schon.", "Je pense que oui."),
    p("Puede ser.", "Misschien.", "Maybe.", "Kann sein.", "Ça se peut.")
  ],
  "¡Qué bien verte!": [
    p("¡Qué alegría verte!", "Wat fijn je te zien!", "So nice to see you!", "Schön, dich zu sehen!", "Quel plaisir de te voir !"),
    p("¡Qué gusto verte!", "Leuk je te zien!", "Good to see you!", "Schön dich zu sehen!", "Ravi de te voir !")
  ],
  "¿Y tú?": [
    p("¿Y tú qué opinas?", "En wat vind jij?", "And what do you think?", "Und was denkst du?", "Et toi, qu'en penses-tu ?"),
    p("¿Y tú, qué tal?", "En hoe gaat het met jou?", "And how about you?", "Und wie geht es dir?", "Et toi, ça va ?")
  ],
  "¿Cómo fue?": [
    p("¿Qué tal fue?", "Hoe ging het?", "How did it go?", "Wie war es?", "Comment ça s'est passé ?"),
    p("¿Cómo salió?", "Hoe is het afgelopen?", "How did it turn out?", "Wie ist es ausgegangen?", "Comment ça a tourné ?")
  ],
  "¿Por qué?": [
    p("¿Y eso por qué?", "Waarom dan?", "Why is that?", "Warum denn?", "Pourquoi ça ?"),
    p("¿Cuál es la razón?", "Wat is de reden?", "What's the reason?", "Was ist der Grund?", "Quelle est la raison ?")
  ],
  "¿Desde cuándo?": [
    p("¿Hace cuánto?", "Hoe lang al?", "How long has it been?", "Seit wann?", "Depuis quand ?"),
    p("¿Desde cuándo es así?", "Sinds wanneer is het zo?", "Since when has it been like that?", "Seit wann ist das so?", "Depuis quand c'est comme ça ?")
  ],
  "Cuéntame más.": [
    p("Dime más.", "Vertel het me.", "Tell me.", "Erzähl mir.", "Dis-moi."),
    p("¿Qué más?", "Wat nog meer?", "What else?", "Was noch?", "Quoi d'autre ?")
  ],
  "¿Qué pasó después?": [
    p("¿Y luego?", "En toen?", "And then?", "Und dann?", "Et ensuite ?"),
    p("¿Y después qué?", "En wat gebeurde er toen?", "And what happened then?", "Und was passierte dann?", "Et après, qu'est-ce qui s'est passé ?")
  ],
  "Creo que no.": [
    p("No lo creo.", "Ik geloof het niet.", "I don't believe so.", "Ich glaube nicht.", "Je ne pense pas."),
    p("No creo.", "Ik denk van niet.", "I don't think so.", "Ich denke nicht.", "Je ne pense pas.")
  ],
  "Me parece un poco raro.": [
    p("Me parece extraño.", "Ik vind het vreemd.", "I find it strange.", "Ich finde es seltsam.", "Je trouve ça étrange."),
    p("Es un poco extraño.", "Het is een beetje vreemd.", "It's a bit odd.", "Es ist ein bisschen seltsam.", "C'est un peu étrange.")
  ],
  "A mí me gusta mucho.": [
    p("Me encanta.", "Ik vind het heerlijk.", "I love it.", "Ich liebe es.", "J'adore ça."),
    p("Me gusta muchísimo.", "Ik vind het super leuk.", "I like it a lot.", "Es gefällt mir sehr.", "Ça me plaît beaucoup.")
  ],
  "Yo no estoy de acuerdo.": [
    p("No estoy de acuerdo.", "Ik ben het niet eens.", "I don't agree.", "Ich bin nicht einverstanden.", "Je ne suis pas d'accord."),
    p("No lo veo así.", "Ik zie het niet zo.", "I don't see it that way.", "Ich sehe das nicht so.", "Je ne vois pas les choses comme ça.")
  ],
  "A ver...": [
    p("Vamos a ver...", "Laat me eens kijken...", "Let's see...", "Mal sehen...", "Voyons voir..."),
    p("Un momento...", "Even...", "One moment...", "Einen Moment...", "Un instant...")
  ],
  "Espera, lo pienso.": [
    p("Un momento, lo pienso.", "Even denken.", "Hang on, I'm thinking.", "Moment, ich überlege.", "Attends, je réfléchis."),
    p("Déjame pensarlo.", "Laat me er even over nadenken.", "Let me think about it.", "Lass mich darüber nachdenken.", "Laisse-moi y réfléchir.")
  ],
  "Déjame pensar.": [
    p("Déjame pensarlo un momento.", "Laat me even nadenken.", "Let me think for a moment.", "Lass mich kurz nachdenken.", "Laisse-moi réfléchir un instant."),
    p("Dame un segundo.", "Geef me even een seconde.", "Give me a second.", "Gib mir eine Sekunde.", "Donne-moi une seconde.")
  ],
  "Bueno, pues...": [
    p("Bueno, entonces...", "Nou, dan...", "Well, so...", "Also, dann...", "Bon, alors..."),
    p("Pues bien...", "Nou, goed dan...", "Well then...", "Nun gut...", "Eh bien...")
  ],
  "¿Qué significa...?": [
    p("¿Qué quiere decir...?", "Wat betekent...?", "What does ... mean?", "Was bedeutet ...?", "Qu'est-ce que ... veut dire ?")
  ],
  "¿Cómo se dice... en español?": [
    p("¿Cómo se dice eso en español?", "Hoe zeg je dat in het Spaans?", "How do you say that in Spanish?", "Wie sagt man das auf Spanisch?", "Comment on dit ça en espagnol ?")
  ],
  "No me sale la palabra.": [
    p("No me acuerdo de la palabra.", "Ik kan het woord niet vinden.", "I can't remember the word.", "Mir fällt das Wort nicht ein.", "Le mot ne me vient pas."),
    p("Se me olvida la palabra.", "Het woord is me even kwijt.", "I've forgotten the word.", "Ich habe das Wort vergessen.", "J'ai oublié le mot.")
  ],
  "Lo digo de otra manera.": [
    p("Lo explico de otra forma.", "Ik leg het anders uit.", "I'll explain it differently.", "Ich erkläre es anders.", "Je l'explique autrement."),
    p("Dicho de otra forma...", "Anders gezegd...", "In other words...", "Anders gesagt...", "Autrement dit...")
  ],
  "Es algo como...": [
    p("Es parecido a...", "Het lijkt op...", "It's similar to...", "Es ist ähnlich wie...", "C'est un peu comme...")
  ],
  "Es lo que se usa para...": [
    p("Sirve para...", "Het is om ... mee te doen.", "It's used for...", "Es dient zum...", "Ça sert à...")
  ],
  "¿Me explicas esa palabra?": [
    p("¿Qué significa esa palabra?", "Wat betekent dat woord?", "What does that word mean?", "Was bedeutet das Wort?", "Que veut dire ce mot ?")
  ],
  "Ayer fui al cine con mi amigo.": [
    p("Ayer fui al cine con un amigo.", "Gisteren ging ik met een vriend naar de bioscoop.", "Yesterday I went to the cinema with a friend.", "Gestern bin ich mit einem Freund ins Kino gegangen.", "Hier, je suis allé au cinéma avec un ami."),
    p("Ayer salí con mi amigo.", "Gisteren ben ik met mijn vriend uit geweest.", "Yesterday I went out with my friend.", "Gestern bin ich mit meinem Freund ausgegangen.", "Hier, je suis sorti avec mon ami.")
  ],
  "Hoy estoy cansado porque trabajé mucho.": [
    p("Estoy cansado hoy porque trabajé mucho.", "Ik ben vandaag moe, want ik heb veel gewerkt.", "I'm tired today because I worked a lot.", "Ich bin heute müde, weil ich viel gearbeitet habe.", "Je suis fatigué aujourd'hui parce que j'ai beaucoup travaillé.")
  ],
  "Me gusta cocinar los domingos.": [
    p("Los domingos me gusta cocinar.", "Op zondag kook ik graag.", "On Sundays I like to cook.", "Sonntags koche ich gern.", "Le dimanche, j'aime cuisiner."),
    p("Me encanta cocinar los domingos.", "Ik kook op zondag heel graag.", "I love cooking on Sundays.", "Ich koche sonntags sehr gern.", "J'adore cuisiner le dimanche.")
  ],
  "Creo que va a llover mañana.": [
    p("Creo que mañana lloverá.", "Ik denk dat het morgen regent.", "I think it'll rain tomorrow.", "Ich glaube, morgen regnet es.", "Je pense qu'il va pleuvoir demain."),
    p("Parece que mañana va a llover.", "Het lijkt erop dat het morgen gaat regenen.", "It looks like it's going to rain tomorrow.", "Es sieht so aus, als ob es morgen regnet.", "Il semble qu'il va pleuvoir demain.")
  ],
  "Cuando tengo tiempo, leo un libro.": [
    p("Si tengo tiempo, leo un libro.", "Als ik tijd heb, lees ik een boek.", "If I have time, I read a book.", "Wenn ich Zeit habe, lese ich ein Buch.", "Quand j'ai le temps, je lis un livre."),
    p("Leo un libro cuando tengo tiempo.", "Ik lees een boek als ik tijd heb.", "I read a book when I have time.", "Ich lese ein Buch, wenn ich Zeit habe.", "Je lis un livre quand j'ai le temps.")
  ],
  "Quiero aprender más palabras.": [
    p("Quiero aprender más vocabulario.", "Ik wil meer woordenschat leren.", "I want to learn more vocabulary.", "Ich möchte mehr Vokabeln lernen.", "Je veux apprendre plus de vocabulaire."),
    p("Me gustaría aprender más palabras.", "Ik zou graag meer woorden leren.", "I would like to learn more words.", "Ich würde gern mehr Wörter lernen.", "J'aimerais apprendre plus de mots.")
  ]
};

// Regionale of informele aantekeningen bij een alternatief (sleutel = de Spaanse zin van het alternatief)
var ALT_NOTE = {
  "¿Qué onda?": m("vooral in Mexico gebruikt, informeel.", "mainly used in Mexico, informal.", "vor allem in Mexiko gebraucht, umgangssprachlich.", "surtout utilisé au Mexique, familier."),
  "Me da gusto verte.": m("vooral in Mexico gebruikt, informeel.", "mainly used in Mexico, informal.", "vor allem in Mexiko gebraucht, umgangssprachlich.", "surtout utilisé au Mexique, familier."),
  "Chao.": m("vooral in Latijns-Amerika gebruikt, informeel.", "mainly used in Latin America, informal.", "vor allem in Lateinamerika gebraucht, umgangssprachlich.", "surtout utilisé en Amérique latine, familier.")
};

// HELP-KAART in de Info-tab: stappenplan van alle mogelijkheden van de app.
// BIJWERKEN: bij elke gebruiksaanpassing (nieuwe knop, tabblad, instelling of gedrag) deze tekst meeveranderen.
var HELP_GUIDE = [
  { t: m("Begin hier", "Start here", "Hier anfangen", "Commencer ici"), s: [
    m("De tabbladen staan onderaan. Info open je met het ?-knopje in de banner.", "The tabs are at the bottom. Info opens with the ? button in the banner.", "Die Reiter stehen unten. Info öffnest du mit dem ?-Knopf im Banner.", "Les onglets sont en bas. Info s'ouvre avec le bouton ? dans la bannière."),
    m("Tik nogmaals op Info om terug te gaan naar de pagina waar je was.", "Tap Info again to go back to the page you were on.", "Tippe erneut auf Info, um zur vorherigen Seite zurückzukehren.", "Touche de nouveau Info pour revenir à la page précédente.") ] },
  { t: m("Wisselen en bladeren", "Switching and turning pages", "Wechseln und Blättern", "Changer et tourner les pages"), s: [
    m("Tik op een leeg stuk aan de uiterste linker- of rechterkant van de pagina om naar het vorige of volgende tabblad te gaan.", "Tap an empty strip at the far left or right edge of the page to go to the previous or next tab.", "Tippe auf eine leere Stelle ganz am linken oder rechten Rand der Seite, um zum vorherigen oder nächsten Reiter zu gehen.", "Touche un espace vide tout à gauche ou tout à droite de la page pour aller à l'onglet précédent ou suivant."),
    m("Tik op een tabblad om het te openen. Tik op een leeg stuk in de banner om het thema te wisselen.", "Tap a tab to open it. Tap an empty part of the banner to change the theme.", "Tippe auf einen Reiter, um ihn zu öffnen. Tippe auf eine leere Stelle im Banner, um das Thema zu wechseln.", "Touche un onglet pour l'ouvrir. Touche un espace vide de la bannière pour changer de thème."),
    m("Info open je met het ?-knopje naast het instellingenwiel in de banner; nog eens tikken brengt je terug naar de vorige pagina. Info is een boekje met bladen. Tik links of rechts op een blad, of op de stipjes onderaan, om van blad te wisselen. Bij een paginawissel verdwijnen de knoppen onderaan, Vastlopen, Zinnen en Gesprek, en het belletje verschijnt. Tik op het belletje of scroll naar het einde van de pagina om ze terug te halen. Over de maker, bronnen en licenties en de versie blijven onderaan staan.", "Info opens with the ? button next to the settings wheel in the banner; tap it again to go back to the previous page. Info is a booklet with pages. Tap the left or right side of a page, or the dots at the bottom, to change page. When the page changes, the buttons at the bottom, Stuck, Sentences and Conversation disappear and the little bell appears. Tap the bell or scroll to the end of the page to bring them back. About the maker, sources and licences and the version stay at the bottom.", "Info öffnest du mit dem ?-Knopf neben dem Einstellungsrad im Banner; tippe noch einmal, um zur vorherigen Seite zurückzukehren. Info ist ein Heft mit Seiten. Tippe links oder rechts auf eine Seite oder auf die Punkte unten, um die Seite zu wechseln. Beim Seitenwechsel verschwinden die Knöpfe unten, Hänger, Sätze und Gespräch, und das Glöckchen erscheint. Tippe auf das Glöckchen oder scrolle bis zum Ende der Seite, um sie zurückzuholen. Über den Entwickler, Quellen und Lizenzen und die Version bleiben unten stehen.", "Info s'ouvre avec le bouton ? à côté de la roue des réglages, dans la bannière ; touche-le à nouveau pour revenir à la page précédente. Info est un livret avec des pages. Touche le côté gauche ou droit d'une page, ou les points en bas, pour changer de page. Lors d'un changement de page, les boutons du bas, Bloqué, Phrases et Conversation disparaissent et la petite cloche apparaît. Touche la cloche ou fais défiler jusqu'à la fin de la page pour les faire revenir. À propos de l'auteur, sources et licences et la version restent en bas.")
  ] },
  { t: m("Zinnen", "Sentences", "Sätze", "Phrases"), s: [
    m("Kies bovenaan een groep, bijvoorbeeld begroeten, eten, werk of vakantie.", "Choose a group at the top, for example greeting, eating, work or holidays.", "Wähle oben eine Gruppe, zum Beispiel Begrüßen, Essen, Arbeit oder Urlaub.", "Choisis un groupe en haut, par exemple saluer, manger, travail ou vacances."),
    m("Tik op het luidsprekertje om een zin te horen.", "Tap the speaker icon to hear a sentence.", "Tippe auf das Lautsprechersymbol, um einen Satz zu hören.", "Touche le haut-parleur pour entendre une phrase."),
    m("Zinnen die je begrijpt verdwijnen; zet ze terug via Instellingen.", "Sentences you understand disappear; bring them back via Settings.", "Verstandene Sätze verschwinden; hole sie über die Einstellungen zurück.", "Les phrases comprises disparaissent ; remets-les via les réglages."),
    m("Groep 'Gesprek openen': de eerste kaart wisselt elke 2,5 seconde. Veeg om zelf te wisselen en tik op een zin om in Gesprek verder te gaan.", "Group 'Start a conversation': the first card changes every 2.5 seconds. Swipe to change it yourself and tap a sentence to continue in Conversation.", "Gruppe 'Gespräch beginnen': die erste Karte wechselt alle 2,5 Sekunden. Wische zum Wechseln und tippe auf einen Satz, um im Gespräch weiterzumachen.", "Groupe « Commencer la conversation » : la première carte change toutes les 2,5 secondes. Glisse pour changer et touche une phrase pour continuer dans Conversation.") ] },
  { t: m("Onderwerpen", "Topics", "Themen", "Sujets"), s: [
    m("Kies een onderwerp met vragen om een gesprek te beginnen of gaande te houden.", "Choose a topic with questions to start or keep a conversation going.", "Wähle ein Thema mit Fragen, um ein Gespräch zu beginnen oder am Laufen zu halten.", "Choisis un sujet avec des questions pour lancer ou entretenir une conversation."),
    m("Lees de vraag hardop en luister naar het voorbeeld.", "Read the question aloud and listen to the example.", "Lies die Frage laut vor und höre das Beispiel an.", "Lis la question à voix haute et écoute l'exemple."),
    m("Gebruik de vragen als het gesprek stilvalt.", "Use the questions when the conversation stalls.", "Nutze die Fragen, wenn das Gespräch stockt.", "Utilise les questions quand la conversation s'arrête.") ] },
  { t: m("Vastlopen", "Stuck", "Hänger", "Bloqué"), s: [
    m("Lees de grote zin en tik op de luisterknop.", "Read the large sentence and tap the listen button.", "Lies den großen Satz und tippe auf den Hörknopf.", "Lis la grande phrase et touche le bouton d'écoute."),
    m("Tik op 'Andere zin' om een nieuwe zin te zien.", "Tap 'Another phrase' to see a new one.", "Tippe auf 'Anderer Satz', um einen neuen zu sehen.", "Touche « Autre phrase » pour en voir une nouvelle."),
    m("Onderaan staat de volledige lijst.", "The full list is at the bottom.", "Unten steht die vollständige Liste.", "La liste complète est en bas.") ] },
  { t: m("Zin bouwen", "Build a sentence", "Satz bauen", "Construire une phrase"), s: [
    m("Kies een startzin en tik op 'Bouw verder →'.", "Choose a starter sentence and tap 'Continue →'.", "Wähle einen Startsatz und tippe auf 'Weiter →'.", "Choisis une phrase de départ et touche « Continuer → »."),
    m("Kies een verbindingswoord (of geen), wie het doet en wat die persoon doet; de zin verschijnt onder de knoppen.", "Choose a connecting word (or none), who does it and what that person does; the sentence appears below the buttons.", "Wähle ein Bindewort (oder keins), wer es tut und was die Person tut; der Satz erscheint unter den Knöpfen.", "Choisis un mot de liaison (ou aucun), qui le fait et ce que fait cette personne ; la phrase apparaît sous les boutons."),
    m("Tik op 'Ontkennend' voor een ontkenning en op het luidsprekertje om de zin te horen.", "Tap 'Negative' for a negation and the speaker icon to hear the sentence.", "Tippe auf 'Verneint' für eine Verneinung und auf den Lautsprecher, um den Satz zu hören.", "Touche « Négatif » pour une négation et le haut-parleur pour écouter la phrase.") ] },
  { t: m("Reageren", "React", "Reagieren", "Réagir"), s: [
    m("Kies 'Ik vraag' voor antwoorden op vragen van je gesprekspartner.", "Choose 'I ask' for answers to questions from your conversation partner.", "Wähle 'Ich frage' für Antworten auf Fragen deines Gesprächspartners.", "Choisis « Je demande » pour les réponses aux questions de ton interlocuteur."),
    m("Kies 'Vriend vertelt' om op een verhaal te reageren.", "Choose 'A friend tells' to respond to a story.", "Wähle 'Freund erzählt', um auf eine Geschichte zu reagieren.", "Choisis « L'ami raconte » pour réagir à une histoire."),
    m("Begrepen reacties verdwijnen uit de lijst.", "Understood responses disappear from the list.", "Verstandene Reaktionen verschwinden aus der Liste.", "Les réponses comprises disparaissent de la liste.") ] },
  { t: m("Leren", "Learn", "Lernen", "Apprendre"), s: [
    m("Kaarten: markeer wat je al kent als 'gekend'.", "Flashcards: mark what you already know with 'Known'.", "Karten: markiere, was du schon kannst, mit 'Gekonnt'.", "Cartes : marque ce que tu connais déjà avec « Acquis »."),
    m("Quiz: je krijgt de betekenis en kiest uit drie zinnen: één is goed, één bevat een grammaticafout en één betekent iets anders. Bij elk fout antwoord krijg je uitleg.", "Quiz: you see the meaning and choose from three sentences: one is correct, one contains a grammar mistake and one means something else. Every wrong answer comes with an explanation.", "Quiz: Du siehst die Bedeutung und wählst aus drei Sätzen: einer ist richtig, einer enthält einen Grammatikfehler und einer bedeutet etwas anderes. Zu jeder falschen Antwort gibt es eine Erklärung.", "Quiz : tu vois le sens et tu choisis parmi trois phrases : une est correcte, une contient une faute de grammaire et une veut dire autre chose. Chaque mauvaise réponse est expliquée."),
    m("Grammatica: lees de korte regels met voorbeelden en het waarom.", "Grammar: read the short rules with examples and the reason.", "Grammatik: lies die kurzen Regeln mit Beispielen und dem Warum.", "Grammaire : lis les courtes règles avec exemples et explication."),
    m("Patronen: kies een patroon, vul het in met woorden die je al kent en lees je zin hardop voor.", "Patterns: pick a pattern, fill it in with words you already know and read your sentence aloud.", "Muster: wähle ein Muster, fülle es mit Wörtern, die du schon kennst, und lies deinen Satz laut vor.", "Modèles : choisis un modèle, complète-le avec des mots que tu connais déjà et lis ta phrase à voix haute.") ] },
  { t: m("Regels", "Rules", "Regeln", "Règles"), s: [
    m("Lees de grammatica in het kort, met voorbeelden.", "Read the grammar in brief, with examples.", "Lies die Grammatik kurz gefasst, mit Beispielen.", "Lis la grammaire en bref, avec des exemples."),
    m("Tik op het luidsprekertje om een voorbeeld te horen.", "Tap the speaker icon to hear an example.", "Tippe auf das Lautsprechersymbol, um ein Beispiel zu hören.", "Touche le haut-parleur pour entendre un exemple."),
    m("Doe de korte test om te zien wat je onthoudt.", "Take the short test to see what you remember.", "Mach den kurzen Test, um zu sehen, was du behältst.", "Fais le court test pour voir ce que tu retiens.") ] },
  { t: m("Gesprek: zelf een zin vertalen", "Conversation: translate a sentence yourself", "Gespräch: einen Satz selbst übersetzen", "Conversation : traduire une phrase soi-même"), s: [
    m("Typ bovenaan in de vertaalbox een Nederlandse zin en tik op Vertaal. Je mag ook meerdere zinnen in één vak typen; elke zin wordt apart vertaald.", "Type an English sentence in the translation box at the top and tap Translate. You can also type several sentences in one box; each sentence is translated separately.", "Gib oben im Übersetzungsfeld einen deutschen Satz ein und tippe auf Übersetzen. Du kannst auch mehrere Sätze in ein Feld schreiben; jeder Satz wird einzeln übersetzt.", "Écris une phrase française dans la zone de traduction en haut et touche Traduire. Tu peux aussi écrire plusieurs phrases dans une seule zone ; chaque phrase est traduite séparément."),
    m("Die zin wordt jouw eerste beurt in het gesprek, met daaronder andere manieren om hem te zeggen.", "That sentence becomes your first turn in the conversation, with other ways to say it below.", "Dieser Satz wird dein erster Beitrag im Gespräch, darunter stehen andere Arten, ihn zu sagen.", "Cette phrase devient ton premier tour dans la conversation, avec d'autres façons de la dire en dessous."),
    m("De vertaalbox begrijpt ook werkwoorden met voorzetsel en wederkerige werkwoorden (zoals 'zich interesseren voor'), en zinnen als 'I am interested in…' of 'I am worried about…'.", "The translation box also understands verbs with prepositions and reflexive verbs (such as 'to be interested in'), and sentences like 'I am interested in…' or 'I am worried about…'.", "Das Übersetzungsfeld versteht auch Verben mit Präposition und reflexive Verben (wie 'sich interessieren für') sowie Sätze wie 'I am interested in…' oder 'I am worried about…'.", "La zone de traduction comprend aussi les verbes à préposition et les verbes pronominaux (comme « s'intéresser à »), ainsi que des phrases comme « I am interested in… » ou « I am worried about… »."),
    m("Ook herkend: samengestelde onderwerpen ('mijn broer en ik'), bezittelijk volgens de gesprekspartner ('jouw broer' in een vraag, 'mijn broer' in een antwoord), verleden tijden, en de genitief en voorzetsels met de genitief in het Duits.", "Also recognised: compound subjects ('my brother and I'), possessives that follow the conversation partner ('your brother' in a question, 'my brother' in an answer), past tenses, and the genitive and genitive prepositions in German.", "Außerdem erkannt: zusammengesetzte Subjekte ('mein Bruder und ich'), Possessiva, die dem Gesprächspartner folgen ('dein Bruder' in einer Frage, 'mein Bruder' in einer Antwort), Vergangenheitsformen sowie der Genitiv und Präpositionen mit Genitiv im Deutschen.", "Également reconnus : les sujets composés (« mon frère et moi »), les possessifs qui suivent l'interlocuteur (« ton frère » dans une question, « mon frère » dans une réponse), les temps du passé, ainsi que le génitif et les prépositions avec le génitif en allemand."),
    m("Ook herkend: moeten, mogen en zou moeten (sollen, dürfen, devoir), 'er is' in alle tijden (hay, es gibt, il y a), 'haber de + infinitief', 'il faut' en 'hace falta' met een zelfstandig naamwoord, en vivre naast habiter.", "Also recognised: must, may and should (sollen, dürfen, devoir), 'there is' in all tenses (hay, es gibt, il y a), 'haber de + infinitive', 'il faut' and 'hace falta' with a noun, and vivre next to habiter.", "Außerdem erkannt: müssen, dürfen und sollen (sollen, dürfen, devoir), 'es gibt' in allen Zeiten (hay, es gibt, il y a), 'haber de + Infinitiv', 'il faut' und 'hace falta' mit einem Nomen sowie vivre neben habiter.", "Également reconnus : devoir, pouvoir et devrait (sollen, dürfen, devoir), « il y a » à tous les temps (hay, es gibt, il y a), « haber de + infinitif », « il faut » et « hace falta » avec un nom, et vivre à côté d'habiter.") ] },
  { t: m("Gesprek: de gesprekspartner", "Conversation: the conversation partner", "Gespräch: der Gesprächspartner", "Conversation : le partenaire"), s: [
    m("Tik op Opnemen en spreek Spaans. Tik op Stop als je klaar bent met spreken.", "Tap Record and speak Spanish. Tap Stop when you are done speaking.", "Tippe auf Aufnehmen und sprich Spanisch. Tippe auf Stopp, wenn du fertig bist.", "Touche Enregistrer et parle espagnol. Touche « Arrêter » quand tu as fini de parler."),
    m("Elke zin krijgt een vertaling, met uitleg per woord.", "Every sentence gets a translation, with an explanation per word.", "Jeder Satz bekommt eine Übersetzung, mit Erklärung pro Wort.", "Chaque phrase reçoit une traduction, avec une explication par mot."),
    m("Bij een zin staan mogelijke vervolgen in bellen. Tik op het luidsprekertje naast een bel om hem te horen.", "Next to a sentence are possible follow-ups in bubbles. Tap the speaker icon next to a bubble to hear it.", "Bei einem Satz stehen mögliche Fortsetzungen in Sprechblasen. Tippe auf das Lautsprechersymbol neben einer Blase, um sie zu hören.", "Près d'une phrase, les suites possibles sont dans des bulles. Touche le haut-parleur à côté d'une bulle pour l'entendre."),
    m("Verbeter een vertaling of voeg een eigen antwoord toe.", "Correct a translation or add your own answer.", "Verbessere eine Übersetzung oder füge eine eigene Antwort hinzu.", "Corrige une traduction ou ajoute ta propre réponse."),
    m("Een woord dat de app niet kent, staat met '?' in de vertaling. Tik op dat woord om het de app te leren.", "A word the app does not know is marked '?' in the translation. Tap that word to teach it to the app.", "Ein Wort, das die App nicht kennt, ist in der Übersetzung mit '?' markiert. Tippe auf dieses Wort, um es der App beizubringen.", "Un mot que l'application ne connaît pas est marqué « ? » dans la traduction. Touche ce mot pour le lui apprendre."),
    m("Met 'Wis gesprek' begin je het gesprek opnieuw.", "With 'Clear conversation' you start the conversation over.", "Mit 'Gespräch leeren' fängst du das Gespräch neu an.", "Avec « Effacer la conversation », tu recommences la conversation.") ] },
  { t: m("Gesprek: kies een openingszin", "Conversation: choose an opening sentence", "Gespräch: einen Eröffnungssatz wählen", "Conversation : choisir une phrase d'ouverture"), s: [
    m("Ga naar Zinnen en kies de groep 'Gesprek openen'.", "Go to Sentences and choose the group 'Start a conversation'.", "Gehe zu Sätze und wähle die Gruppe 'Gespräch beginnen'.", "Va dans Phrases et choisis le groupe « Commencer la conversation »."),
    m("Tik op de wisselende zin (of veeg). Die komt als jouw beurt in Gesprek, en de gesprekspartner antwoordt positief.", "Tap the changing sentence (or swipe). It appears as your turn in Conversation, and the conversation partner replies positively.", "Tippe auf den wechselnden Satz (oder wische). Er erscheint als dein Beitrag im Gespräch, und der Gesprächspartner antwortet positiv.", "Touche la phrase qui change (ou glisse). Elle apparaît comme ton tour dans Conversation, et l'interlocuteur répond positivement."),
    m("Kies één hulpvraag: tijd, restaurant, busstation, trein, kaartje of hulp. De andere verdwijnen.", "Choose one help question: time, restaurant, bus station, train, ticket or help. The others disappear.", "Wähle eine Hilfsfrage: Zeit, Restaurant, Busbahnhof, Zug, Fahrkarte oder Hilfe. Die anderen verschwinden.", "Choisis une question d'aide : heure, restaurant, gare routière, train, billet ou aide. Les autres disparaissent."),
    m("De microfoon gaat dan aan. Tik op Stop als het antwoord klaar is; daarna volgt de vertaling.", "The microphone then turns on. Tap Stop when the answer is done; the translation follows.", "Das Mikrofon geht dann an. Tippe auf Stopp, wenn die Antwort fertig ist; danach folgt die Übersetzung.", "Le micro s'allume alors. Touche « Arrêter » quand la réponse est terminée ; la traduction suit.") ] },
  { t: m("Uitspraak", "Pronunciation", "Aussprache", "Prononciation"), s: [
    m("Luister, herhaal en neem jezelf op.", "Listen, repeat and record yourself.", "Hör zu, wiederhole und nimm dich auf.", "Écoute, répète et enregistre-toi."),
    m("Na het opnemen vergelijkt de app de klanken met het voorbeeld. Je ziet per woord ✓ of ✗, welke klank afweek (bijvoorbeeld een enkele r waar een getrilde rr hoort) en een tip.", "After recording, the app compares the sounds with the example. You see ✓ or ✗ per word, which sound differed (for example a single r where a rolled rr belongs) and a tip.", "Nach der Aufnahme vergleicht die App die Laute mit dem Beispiel. Du siehst pro Wort ✓ oder ✗, welcher Laut abwich (zum Beispiel ein einfaches r, wo ein gerolltes rr hingehört) und einen Tipp.", "Après l'enregistrement, l'application compare les sons avec l'exemple. Tu vois ✓ ou ✗ pour chaque mot, quel son différait (par exemple un r simple là où il faut un rr roulé) et un conseil."),
    m("Op de iPhone gebruikt de controle het spraakmodel dat je ook voor Gesprek downloadt.", "On iPhone the check uses the speech model you also download for Conversation.", "Auf dem iPhone nutzt die Prüfung das Sprachmodell, das du auch für das Gespräch herunterlädst.", "Sur iPhone, la vérification utilise le modèle vocal que tu télécharges aussi pour Conversation."),
    m("Vergelijk jezelf met het voorbeeld en beoordeel jezelf.", "Compare yourself with the example and rate yourself.", "Vergleiche dich mit dem Beispiel und bewerte dich selbst.", "Compare-toi à l'exemple et évalue-toi."),
    m("Oefen met minimale paren en shadowing.", "Practise with minimal pairs and shadowing.", "Übe mit Minimalpaaren und Shadowing.", "Entraîne-toi avec les paires minimales et le shadowing.") ] },
  { t: m("Instellingen en extra's", "Settings and extras", "Einstellungen und Extras", "Réglages et extras"), s: [
    m("Vertaalbalk bovenaan: typ Nederlands en tik op Vertaal.", "Translation bar at the top: type English and tap Translate.", "Übersetzungsleiste oben: Gib einen deutschen Satz ein und tippe auf Übersetzen.", "Barre de traduction en haut : écris en français et touche Traduire."),
    m("Taal: via het logo of het tandwiel (Nederlands, Engels, Duits, Frans).", "Language: via the logo or the gear icon (Dutch, English, German, French).", "Sprache: über das Logo oder das Zahnrad (Niederländisch, Englisch, Deutsch, Französisch).", "Langue : via le logo ou la roue crantée (néerlandais, anglais, allemand, français)."),
    m("Thema: Standaard, Systeem (volgt de donkere modus van je telefoon), Café, IJs, Jungle of Ruimte.", "Theme: Standard, System (follows your phone's dark mode), Café, Ice, Jungle or Outer space.", "Design: Standard, System (folgt dem Dunkelmodus deines Telefons), Café, Eis, Dschungel oder Weltraum.", "Thème : Standard, Système (suit le mode sombre de ton téléphone), Café, Glace, Jungle ou Espace."),
    m("Gesprekspartner: automatisch, neutraal (o/a), man (hij) of vrouw (zij).", "Conversation partner: automatic, neutral (o/a), man (he) or woman (she).", "Gesprächspartner: automatisch, neutral (o/a), Mann (er) oder Frau (sie).", "Partenaire : automatique, neutre (o/a), homme (il) ou femme (elle)."),
    m("Mijn geslacht: man (Estoy cansado) of vrouw (Estoy cansada). Zo krijgen zinnen over jezelf de juiste Spaanse vorm.", "My gender: male (Estoy cansado) or female (Estoy cansada). This gives sentences about yourself the right Spanish form.", "Mein Geschlecht: männlich (Estoy cansado) oder weiblich (Estoy cansada). So bekommen Sätze über dich die richtige spanische Form.", "Mon genre : masculin (Estoy cansado) ou féminin (Estoy cansada). Ainsi, les phrases sur toi ont la bonne forme en espagnol."),
    m("Snelheid van voorlezen: stel het tempo in.", "Reading speed: set the tempo.", "Vorlesegeschwindigkeit: stelle das Tempo ein.", "Vitesse de lecture : règle le rythme."),
    m("'Begrepen items resetten' zet de begrepen items terug. 'Voortgang resetten' wist je voortgang.", "'Reset understood items' brings back the understood items. 'Reset progress' clears your progress.", "'Verstandene zurücksetzen' holt die verstandenen Elemente zurück. 'Fortschritt zurücksetzen' löscht deinen Fortschritt.", "« Réinitialiser les éléments compris » remet les éléments compris. « Réinitialiser la progression » efface ta progression."),
    m("De onderste balk verdwijnt na een paar seconden. Tik op het belletje of scroll naar het einde van de pagina om hem terug te halen.", "The bottom bar disappears after a few seconds. Tap the bell or scroll to the end of the page to bring it back.", "Die untere Leiste verschwindet nach ein paar Sekunden. Tippe auf das Glöckchen oder scrolle bis zum Ende der Seite, um sie zurückzuholen.", "La barre du bas disparaît après quelques secondes. Touche la cloche ou fais défiler jusqu'à la fin de la page pour la faire revenir."),
    m("Tik op de uil in de koptekst voor een sprong.", "Tap the owl in the header for a hop.", "Tippe auf die Eule im Kopfbereich für einen Hüpfer.", "Touche la chouette dans l'en-tête pour un petit saut.") ] },
  { t: m("Spraak en offline gebruik", "Speech and offline use", "Sprache und Offline-Nutzung", "Parole et usage hors ligne"), s: [
    m("Op de iPhone download je eenmalig het gespreksmodel, ongeveer 40 of 80 MB.", "On iPhone you download the conversation model once, about 40 or 80 MB.", "Auf dem iPhone lädst du das Gesprächsmodell einmal herunter, etwa 40 oder 80 MB.", "Sur iPhone, tu télécharges le modèle de conversation une fois, environ 40 ou 80 Mo."),
    m("Daarna kun je de app offline gebruiken.", "After that you can use the app offline.", "Danach kannst du die App offline nutzen.", "Ensuite, tu peux utiliser l'application hors ligne."),
    m("Spraak werkt alleen als je browser dat ondersteunt. Het typvak werkt altijd.", "Speech only works if your browser supports it. The typing box always works.", "Spracheingabe funktioniert nur, wenn dein Browser sie unterstützt. Das Eingabefeld funktioniert immer.", "La parole ne marche que si ton navigateur la prend en charge. La zone de saisie marche toujours.") ] }
];
