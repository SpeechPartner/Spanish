/* Betekenisbank: alledaagse zinnen met al hun gangbare vormen in vijf talen.
   Elke vorm in elke taal leidt naar dezelfde betekenis; de uitkomst is de eerste (meest natuurlijke) vorm in de doeltaal.
   Werkt in alle richtingen (nl, en, de, fr, es) en zonder internet.
   Schrijfwijze van de lijst:
     [o|a]   vorm voor een man | vrouw (eigen geslacht in de instellingen), bijvoorbeeld cansad[o|a]
     {P}     een persoonlijk voornaamwoord (op jou, de ti, auf dich); {P:dat} = Duitse derde naamval
     {N}     een getal, {X} een naam aan het eind van de zin
   Alle vormen binnen één betekenis moeten precies hetzelfde zeggen. */
(function () {
  var LIJST = String.raw`
tijd
nl: Hoe laat is het? / Wat is de tijd? / Hoe laat is het nu?
en: What time is it? / What's the time? / Do you have the time?
de: Wie spät ist es? / Wie viel Uhr ist es? / Wie spät ist es jetzt?
fr: Quelle heure est-il ? / Il est quelle heure ? / Tu as l'heure ? / Vous avez l'heure ?
es: ¿Qué hora es? / ¿Qué hora es ahora? / ¿Tienes hora? / ¿Tiene hora?

welke-dag
nl: Welke dag is het vandaag? / Wat voor dag is het vandaag? / Welke dag is het?
en: What day is it today? / What day is it?
de: Welcher Tag ist heute? / Was für ein Tag ist heute?
fr: On est quel jour aujourd'hui ? / Quel jour sommes-nous ? / Quel jour on est ?
es: ¿Qué día es hoy?

datum
nl: De hoeveelste is het vandaag? / Welke datum is het vandaag? / Wat is de datum vandaag?
en: What's the date today? / What is today's date?
de: Der Wievielte ist heute? / Welches Datum haben wir heute? / Welches Datum ist heute?
fr: On est le combien aujourd'hui ? / Quelle est la date aujourd'hui ?
es: ¿Qué fecha es hoy? / ¿A qué fecha estamos?

geen-tijd
nl: Ik heb geen tijd.
en: I don't have time. / I have no time.
de: Ich habe keine Zeit.
fr: Je n'ai pas le temps.
es: No tengo tiempo.

hallo
nl: Hallo! / Hoi! / Hé!
en: Hi! / Hello! / Hey!
de: Hallo! / Hi! / Hey!
fr: Salut ! / Coucou !
es: ¡Hola! / ¡Buenas!

goedemorgen
nl: Goedemorgen! / Goeiemorgen!
en: Good morning! / Morning!
de: Guten Morgen!
fr: Bonjour !
es: ¡Buenos días!

goedemiddag
nl: Goedemiddag! / Goeiemiddag!
en: Good afternoon!
de: Guten Tag! / Guten Nachmittag!
fr: Bonjour !
es: ¡Buenas tardes!

goedenavond
nl: Goedenavond! / Goeienavond!
en: Good evening!
de: Guten Abend!
fr: Bonsoir !
es: ¡Buenas noches!

welterusten
nl: Welterusten! / Slaap lekker! / Slaap goed!
en: Good night! / Sleep well!
de: Gute Nacht! / Schlaf gut!
fr: Bonne nuit ! / Dors bien !
es: ¡Buenas noches! / ¡Que duermas bien! / ¡Que descanses!

doei
nl: Doei! / Dag! / Tot ziens! / Daag!
en: Bye! / Goodbye! / Bye bye!
de: Tschüss! / Auf Wiedersehen! / Ciao!
fr: Au revoir ! / Ciao ! / Salut, à plus !
es: ¡Adiós! / ¡Hasta luego! / ¡Chao!

tot-straks
nl: Tot straks! / Tot zo! / Tot later!
en: See you later! / See you in a bit!
de: Bis später! / Bis gleich! / Bis nachher!
fr: À tout à l'heure ! / À plus tard ! / À tout de suite ! / À plus !
es: ¡Hasta ahora! / ¡Nos vemos luego! / ¡Hasta luego!

tot-gauw
nl: Tot gauw! / Tot snel! / Tot binnenkort!
en: See you soon!
de: Bis bald!
fr: À bientôt !
es: ¡Hasta pronto!

tot-morgen
nl: Tot morgen!
en: See you tomorrow!
de: Bis morgen!
fr: À demain !
es: ¡Hasta mañana!

kennismaken
nl: Leuk je te ontmoeten. / Leuk kennis te maken. / Aangenaam. / Leuk je te leren kennen.
en: Nice to meet you. / Pleased to meet you. / Nice meeting you.
de: Freut mich. / Schön, dich kennenzulernen. / Freut mich, dich kennenzulernen.
fr: Enchant[é|ée]. / Ravi[|e] de te rencontrer. / Ravi[|e] de faire ta connaissance.
es: Encantad[o|a]. / Mucho gusto. / Encantad[o|a] de conocerte.

welkom
nl: Welkom!
en: Welcome!
de: Willkommen!
fr: Bienvenue !
es: ¡Bienvenido!

hoe-gaat-het
nl: Hoe gaat het? / Hoe gaat het met je? / Alles goed? / Hoe is het?
en: How are you? / How's it going? / How are you doing?
de: Wie geht's? / Wie geht es dir? / Alles gut?
fr: Ça va ? / Comment ça va ? / Comment vas-tu ? / Comment tu vas ?
es: ¿Qué tal? / ¿Cómo estás? / ¿Todo bien? / ¿Cómo te va?

hoe-gaat-het-u
nl: Hoe gaat het met u? / Hoe maakt u het?
en: How are you?
de: Wie geht es Ihnen?
fr: Comment allez-vous ? / Vous allez bien ?
es: ¿Cómo está usted? / ¿Cómo está?

goed-met-mij
nl: Het gaat goed. / Met mij gaat het goed. / Het gaat goed met me.
en: I'm fine. / I'm good. / I'm doing well. / I'm well.
de: Mir geht es gut. / Es geht mir gut.
fr: Je vais bien. / Ça va bien.
es: Estoy bien. / Me va bien.

goed-dank
nl: Goed, dank je. / Goed, dankjewel. / Prima, dank je. / Goed, bedankt.
en: Fine, thanks. / Good, thanks. / Fine, thank you. / Good, thank you.
de: Gut, danke. / Danke, gut.
fr: Bien, merci. / Ça va, merci. / Ça va bien, merci.
es: Bien, gracias. / Muy bien, gracias.

en-jij
nl: En jij? / En met jou? / En hoe gaat het met jou?
en: And you? / How about you? / What about you?
de: Und dir? / Und du? / Und wie geht es dir?
fr: Et toi ? / Et toi, ça va ?
es: ¿Y tú?

naam
nl: Hoe heet je? / Wat is je naam? / Hoe heet jij?
en: What's your name?
de: Wie heißt du? / Wie ist dein Name?
fr: Comment tu t'appelles ? / Comment t'appelles-tu ? / Tu t'appelles comment ? / Quel est ton nom ?
es: ¿Cómo te llamas? / ¿Cuál es tu nombre?

naam-u
nl: Hoe heet u? / Wat is uw naam?
en: What's your name?
de: Wie heißen Sie? / Wie ist Ihr Name?
fr: Comment vous appelez-vous ? / Vous vous appelez comment ? / Quel est votre nom ?
es: ¿Cómo se llama usted? / ¿Cómo se llama? / ¿Cuál es su nombre?

ik-heet
nl: Ik heet {X}. / Mijn naam is {X}.
en: My name is {X}.
de: Ich heiße {X}. / Mein Name ist {X}.
fr: Je m'appelle {X}. / Mon nom est {X}.
es: Me llamo {X}. / Mi nombre es {X}.

herkomst
nl: Waar kom je vandaan? / Waar kom jij vandaan? / Uit welk land kom je?
en: Where are you from? / Where do you come from? / What country are you from?
de: Woher kommst du? / Wo kommst du her? / Aus welchem Land kommst du?
fr: Tu viens d'où ? / D'où viens-tu ? / D'où tu viens ? / Tu viens de quel pays ?
es: ¿De dónde eres? / ¿De dónde vienes? / ¿De qué país eres?

leeftijd
nl: Hoe oud ben je? / Hoe oud ben jij?
en: How old are you?
de: Wie alt bist du?
fr: Tu as quel âge ? / Quel âge as-tu ? / Quel âge tu as ?
es: ¿Cuántos años tienes?

ik-ben-jaar
nl: Ik ben {N} jaar. / Ik ben {N} jaar oud.
en: I'm {N}. / I'm {N} years old.
de: Ich bin {N} Jahre alt. / Ich bin {N}.
fr: J'ai {N} ans.
es: Tengo {N} años.

waar-woon
nl: Waar woon je? / Waar woon jij?
en: Where do you live?
de: Wo wohnst du?
fr: Où habites-tu ? / Tu habites où ? / Où tu habites ?
es: ¿Dónde vives?

wat-werk
nl: Wat voor werk doe je? / Wat doe je voor werk? / Wat is je beroep?
en: What do you do for a living? / What's your job? / What do you do for work?
de: Was machst du beruflich? / Was arbeitest du? / Was ist dein Beruf?
fr: Tu fais quoi dans la vie ? / Qu'est-ce que tu fais dans la vie ? / Quel est ton métier ?
es: ¿A qué te dedicas? / ¿En qué trabajas? / ¿Cuál es tu trabajo?

broers-zussen
nl: Heb je broers of zussen? / Heb jij broers of zussen? / Heb je broers en zussen?
en: Do you have any brothers or sisters? / Do you have siblings? / Do you have any siblings?
de: Hast du Geschwister?
fr: Tu as des frères et sœurs ? / As-tu des frères et sœurs ?
es: ¿Tienes hermanos?

kinderen
nl: Heb je kinderen? / Heb jij kinderen?
en: Do you have children? / Do you have kids? / Do you have any children?
de: Hast du Kinder?
fr: Tu as des enfants ? / As-tu des enfants ?
es: ¿Tienes hijos?

getrouwd
nl: Ben je getrouwd? / Ben jij getrouwd?
en: Are you married?
de: Bist du verheiratet?
fr: Tu es marié ? / Tu es mariée ? / Es-tu marié ?
es: ¿Estás casado? / ¿Estás casada?

klopt
nl: Dat klopt. / Dat is waar. / Klopt. / Het klopt.
en: That's right. / That's true. / Right. / That's correct.
de: Das stimmt. / Das ist wahr. / Stimmt.
fr: C'est vrai. / C'est exact. / C'est juste. / C'est ça.
es: Es verdad. / Es cierto. / Eso es verdad. / Es correcto.

klopt-niet
nl: Dat klopt niet. / Dat is niet waar. / Klopt niet. / Het klopt niet.
en: That's not right. / That's not true. / That's wrong.
de: Das stimmt nicht. / Das ist nicht wahr. / Stimmt nicht.
fr: Ce n'est pas vrai. / C'est faux. / Ce n'est pas juste.
es: No es verdad. / No es cierto. / Eso no es verdad. / No es correcto.

klopt-dat
nl: Klopt dat? / Is dat waar? / Klopt het?
en: Is that right? / Is that true? / Is that correct?
de: Stimmt das? / Ist das wahr?
fr: C'est vrai ? / C'est ça ? / C'est exact ?
es: ¿Es verdad? / ¿Es cierto? / ¿Eso es verdad?

volgens-mij-klopt
nl: Volgens mij klopt dat. / Ik denk dat dat klopt. / Ik denk dat het klopt. / Volgens mij klopt het.
en: I think that's right. / I think that's true. / I think so, yes.
de: Ich glaube, das stimmt. / Ich denke, das stimmt. / Ich glaube, dass das stimmt.
fr: Je crois que c'est vrai. / Je pense que c'est vrai. / Je crois que c'est juste.
es: Creo que es verdad. / Creo que eso es verdad. / Creo que es cierto.

volgens-mij-klopt-niet
nl: Volgens mij klopt dat niet. / Ik denk dat dat niet klopt. / Ik denk dat het niet klopt. / Volgens mij klopt het niet. / Ik denk niet dat dat klopt.
en: I don't think that's right. / I don't think that's true. / I think that's wrong.
de: Ich glaube, das stimmt nicht. / Ich denke, das stimmt nicht. / Ich glaube nicht, dass das stimmt.
fr: Je crois que ce n'est pas vrai. / Je pense que ce n'est pas vrai. / Je ne crois pas que ce soit vrai.
es: Creo que no es verdad. / Creo que eso no es verdad. / No creo que sea verdad. / Creo que no es cierto.

denk-het-wel
nl: Ik denk het wel. / Ik denk van wel. / Volgens mij wel. / Ik geloof het wel.
en: I think so.
de: Ich glaube schon. / Ich denke schon. / Ich glaube ja.
fr: Je crois que oui. / Je pense que oui. / Je crois bien.
es: Creo que sí.

denk-het-niet
nl: Ik denk het niet. / Ik denk van niet. / Ik geloof het niet. / Volgens mij niet.
en: I don't think so. / I don't believe so.
de: Ich glaube nicht. / Ich denke nicht. / Das glaube ich nicht.
fr: Je ne crois pas. / Je ne pense pas. / Je crois que non. / Je pense que non.
es: Creo que no. / No creo. / No lo creo.

gelijk
nl: Je hebt gelijk. / Jij hebt gelijk. / Daar heb je gelijk in. / Je hebt helemaal gelijk.
en: You're right. / You're absolutely right.
de: Du hast recht. / Da hast du recht. / Du hast völlig recht.
fr: Tu as raison. / T'as raison. / Tu as tout à fait raison.
es: Tienes razón. / Tienes toda la razón.

eens
nl: Ik ben het met je eens. / Daar ben ik het mee eens. / Ik ben het ermee eens. / Mee eens.
en: I agree. / I agree with you.
de: Ich bin einverstanden. / Ich bin deiner Meinung. / Da stimme ich dir zu. / Einverstanden.
fr: Je suis d'accord. / Je suis d'accord avec toi.
es: Estoy de acuerdo. / Estoy de acuerdo contigo.

oneens
nl: Ik ben het niet met je eens. / Daar ben ik het niet mee eens. / Ik ben het er niet mee eens. / Niet mee eens.
en: I don't agree. / I disagree. / I don't agree with you.
de: Ich bin nicht einverstanden. / Ich bin nicht deiner Meinung. / Da stimme ich dir nicht zu.
fr: Je ne suis pas d'accord. / Je ne suis pas d'accord avec toi.
es: No estoy de acuerdo. / No estoy de acuerdo contigo.

weet-niet
nl: Ik weet het niet. / Weet ik niet. / Geen idee. / Ik heb geen idee.
en: I don't know. / No idea. / I have no idea.
de: Ich weiß es nicht. / Weiß ich nicht. / Keine Ahnung. / Ich weiß nicht.
fr: Je ne sais pas. / Aucune idée. / J'en sais rien. / Je n'en sais rien.
es: No sé. / No lo sé. / Ni idea. / No tengo ni idea.

maakt-niet-uit
nl: Het maakt me niet uit. / Maakt me niet uit. / Het maakt mij niet uit. / Maakt mij niet uit.
en: I don't mind. / It doesn't matter to me.
de: Das ist mir egal. / Ist mir egal. / Mir ist es egal.
fr: Ça m'est égal. / Peu importe.
es: Me da igual. / Me da lo mismo.

misschien
nl: Misschien. / Wie weet. / Misschien wel.
en: Maybe. / Perhaps.
de: Vielleicht.
fr: Peut-être.
es: Quizás. / Tal vez. / A lo mejor.

natuurlijk
nl: Natuurlijk. / Tuurlijk. / Zeker. / Natuurlijk!
en: Of course. / Sure. / Certainly.
de: Natürlich. / Klar. / Sicher. / Na klar.
fr: Bien sûr. / Évidemment. / Bien sûr que oui.
es: Claro. / Por supuesto. / Claro que sí.

oke
nl: Oké. / Prima. / Goed. / Is goed. / Okay.
en: Okay. / OK. / Alright. / All right.
de: Okay. / In Ordnung. / Gut. / Alles klar.
fr: D'accord. / OK. / Ça marche. / Ok.
es: Vale. / De acuerdo. / Okey.

ja-graag
nl: Ja, graag. / Graag. / Ja, graag!
en: Yes, please.
de: Ja, gerne. / Gerne. / Ja, bitte.
fr: Oui, volontiers. / Volontiers. / Oui, avec plaisir.
es: Sí, por favor. / Sí, con mucho gusto.

nee-dank
nl: Nee, dank je. / Nee, bedankt. / Nee, dankjewel. / Nee, dank u.
en: No, thank you. / No, thanks.
de: Nein, danke.
fr: Non, merci.
es: No, gracias.

goed-idee
nl: Goed idee! / Dat is een goed idee. / Leuk idee!
en: Good idea! / That's a good idea.
de: Gute Idee! / Das ist eine gute Idee.
fr: Bonne idée ! / C'est une bonne idée.
es: ¡Buena idea! / Es una buena idea.

wat-leuk
nl: Wat leuk! / Leuk! / Gaaf! / Wat gaaf!
en: How nice! / Cool! / That's great! / Great!
de: Wie schön! / Cool! / Toll! / Super!
fr: Super ! / Génial ! / C'est super ! / Trop bien !
es: ¡Qué bien! / ¡Genial! / ¡Qué guay! / ¡Qué chulo!

wat-jammer
nl: Wat jammer. / Jammer. / Dat is jammer. / Wat jammer!
en: What a pity. / That's a shame. / Too bad. / What a shame.
de: Schade. / Wie schade. / Das ist schade.
fr: Dommage. / C'est dommage. / Quel dommage.
es: ¡Qué pena! / Es una pena. / Qué lástima.

echt
nl: Echt? / Meen je dat? / Serieus? / Echt waar?
en: Really? / Seriously? / Are you serious?
de: Wirklich? / Echt? / Im Ernst?
fr: Vraiment ? / Sérieux ? / Sérieusement ?
es: ¿En serio? / ¿De verdad? / ¿Sí?

geen-zorgen
nl: Geen zorgen. / Maak je geen zorgen. / Maak je niet druk.
en: Don't worry. / No worries.
de: Keine Sorge. / Mach dir keine Sorgen.
fr: Ne t'inquiète pas. / T'inquiète pas. / T'inquiète.
es: No te preocupes.

ik-ook
nl: Ik ook. / Ik ook!
en: Me too.
de: Ich auch.
fr: Moi aussi.
es: Yo también.

ik-ook-niet
nl: Ik ook niet.
en: Me neither. / Neither do I.
de: Ich auch nicht.
fr: Moi non plus.
es: Yo tampoco.

wat-vind-je
nl: Wat vind je ervan? / Wat vind jij ervan? / Wat denk je ervan?
en: What do you think of it? / What do you think? / What do you think about it?
de: Was hältst du davon? / Was meinst du? / Was denkst du darüber? / Was denkst du?
fr: Qu'en penses-tu ? / Tu en penses quoi ? / Qu'est-ce que tu en penses ?
es: ¿Qué te parece? / ¿Qué opinas? / ¿Qué piensas?

leuk-vinden
nl: Ik vind het leuk. / Dat vind ik leuk. / Ik vind dat leuk.
en: I like it. / I like that.
de: Es gefällt mir. / Das gefällt mir.
fr: Ça me plaît. / J'aime bien. / J'aime ça. / Ça me plaît bien.
es: Me gusta.

niet-leuk
nl: Ik vind het niet leuk. / Dat vind ik niet leuk. / Ik vind dat niet leuk.
en: I don't like it. / I don't like that.
de: Es gefällt mir nicht. / Das gefällt mir nicht.
fr: Ça ne me plaît pas. / Je n'aime pas ça.
es: No me gusta.

sorry
nl: Sorry. / Het spijt me. / Excuses. / Sorry!
en: Sorry. / I'm sorry. / I apologise. / I apologize.
de: Tut mir leid. / Es tut mir leid. / Sorry.
fr: Désolé[|e]. / Je suis désolé[|e].
es: Lo siento. / Perdón.

pardon
nl: Pardon. / Mag ik even? / Excuseer.
en: Excuse me.
de: Entschuldigung. / Verzeihung.
fr: Excusez-moi. / Pardon.
es: Perdona. / Disculpa. / Disculpe.

geen-probleem
nl: Geen probleem. / Maakt niet uit. / Geeft niks. / Geeft niet.
en: No problem. / It doesn't matter. / Never mind. / Don't worry about it.
de: Kein Problem. / Macht nichts. / Das macht nichts.
fr: Pas de problème. / Ce n'est pas grave. / Pas grave. / Pas de souci.
es: No pasa nada. / No hay problema. / No importa.

bedankt
nl: Dank je wel. / Bedankt. / Dankjewel. / Dank je. / Dank u wel. / Merci.
en: Thank you. / Thanks. / Thanks a lot.
de: Danke. / Danke schön. / Dankeschön.
fr: Merci.
es: Gracias.

heel-erg-bedankt
nl: Heel erg bedankt. / Hartstikke bedankt. / Heel veel dank.
en: Thank you very much. / Thanks so much.
de: Vielen Dank. / Danke sehr. / Vielen lieben Dank.
fr: Merci beaucoup.
es: Muchas gracias.

graag-gedaan
nl: Graag gedaan. / Geen dank.
en: You're welcome. / My pleasure.
de: Gern geschehen. / Bitte schön. / Gern gemacht.
fr: De rien. / Je t'en prie. / Avec plaisir.
es: De nada. / No hay de qué.

alsjeblieft
nl: Alsjeblieft. / Alstublieft.
en: Please.
de: Bitte.
fr: S'il te plaît. / S'il vous plaît.
es: Por favor.

gefeliciteerd
nl: Gefeliciteerd! / Proficiat!
en: Congratulations!
de: Herzlichen Glückwunsch! / Glückwunsch!
fr: Félicitations !
es: ¡Felicidades! / ¡Enhorabuena!

verjaardag
nl: Gefeliciteerd met je verjaardag! / Fijne verjaardag! / Hartelijk gefeliciteerd met je verjaardag!
en: Happy birthday!
de: Alles Gute zum Geburtstag!
fr: Joyeux anniversaire ! / Bon anniversaire !
es: ¡Feliz cumpleaños!

fijne-dag
nl: Fijne dag! / Een fijne dag nog! / Nog een fijne dag! / Fijne dag nog!
en: Have a nice day! / Have a good day!
de: Schönen Tag noch! / Einen schönen Tag!
fr: Bonne journée !
es: ¡Que tengas un buen día!

goed-weekend
nl: Fijn weekend! / Goed weekend! / Prettig weekend!
en: Have a nice weekend! / Have a good weekend!
de: Schönes Wochenende!
fr: Bon week-end !
es: ¡Buen fin de semana!

beterschap
nl: Beterschap! / Word snel beter!
en: Get well soon!
de: Gute Besserung!
fr: Bon rétablissement ! / Remets-toi vite !
es: ¡Que te mejores! / ¡Mejórate pronto!

succes
nl: Succes! / Veel succes!
en: Good luck!
de: Viel Glück! / Viel Erfolg!
fr: Bonne chance !
es: ¡Suerte! / ¡Mucha suerte!

veel-plezier
nl: Veel plezier! / Veel plezier ermee!
en: Have fun!
de: Viel Spaß!
fr: Amuse-toi bien !
es: ¡Que te diviertas! / ¡Pásalo bien!

eet-smakelijk
nl: Eet smakelijk! / Smakelijk eten! / Smakelijk!
en: Enjoy your meal!
de: Guten Appetit!
fr: Bon appétit !
es: ¡Que aproveche! / ¡Buen provecho!

proost
nl: Proost!
en: Cheers!
de: Prost! / Zum Wohl!
fr: Santé ! / À la tienne ! / À ta santé !
es: ¡Salud!

gezondheid
nl: Gezondheid!
en: Bless you!
de: Gesundheit!
fr: À tes souhaits ! / À vos souhaits !
es: ¡Jesús! / ¡Salud!

begrijp-niet
nl: Ik begrijp het niet. / Ik snap het niet. / Dat begrijp ik niet. / Dat snap ik niet.
en: I don't understand. / I don't get it. / I don't understand it.
de: Ich verstehe das nicht. / Ich verstehe es nicht. / Das verstehe ich nicht. / Ich verstehe nicht.
fr: Je ne comprends pas.
es: No entiendo. / No lo entiendo. / No lo comprendo.

herhalen
nl: Kun je dat herhalen? / Kun je het nog een keer zeggen? / Wil je dat herhalen? / Kun je dat nog een keer zeggen?
en: Can you repeat that? / Can you say that again? / Could you repeat that?
de: Kannst du das wiederholen? / Kannst du das noch mal sagen? / Kannst du das nochmal sagen?
fr: Tu peux répéter ? / Tu peux le redire ? / Tu peux répéter, s'il te plaît ?
es: ¿Puedes repetir? / ¿Puedes repetirlo? / ¿Lo puedes repetir? / ¿Puedes repetir eso?

herhalen-u
nl: Kunt u dat herhalen? / Kunt u het nog een keer zeggen?
en: Could you repeat that, please?
de: Können Sie das wiederholen? / Können Sie das noch einmal sagen?
fr: Vous pouvez répéter ? / Pouvez-vous répéter ?
es: ¿Puede repetir? / ¿Puede repetirlo?

langzamer
nl: Kun je langzamer praten? / Wil je wat langzamer praten? / Kun je wat langzamer praten? / Kun je langzamer spreken?
en: Can you speak more slowly? / Could you speak more slowly? / Can you speak slower?
de: Kannst du langsamer sprechen? / Kannst du etwas langsamer sprechen? / Kannst du bitte langsamer sprechen?
fr: Tu peux parler plus lentement ? / Peux-tu parler plus lentement ?
es: ¿Puedes hablar más despacio? / ¿Puedes hablar más lento?

langzamer-u
nl: Kunt u langzamer praten? / Kunt u wat langzamer praten? / Kunt u langzamer spreken?
en: Could you speak more slowly, please?
de: Können Sie langsamer sprechen? / Können Sie etwas langsamer sprechen?
fr: Vous pouvez parler plus lentement ? / Pouvez-vous parler plus lentement ?
es: ¿Puede hablar más despacio?

langzamer-graag
nl: Langzamer, alsjeblieft. / Iets langzamer, alsjeblieft. / Wat langzamer, alsjeblieft.
en: More slowly, please. / Slower, please.
de: Langsamer, bitte. / Etwas langsamer, bitte.
fr: Plus lentement, s'il te plaît. / Plus lentement, s'il vous plaît.
es: Más despacio, por favor.

help
nl: Kun je me helpen? / Kun jij mij helpen? / Wil je me helpen? / Kun je me even helpen?
en: Can you help me? / Could you help me?
de: Kannst du mir helfen? / Hilfst du mir? / Kannst du mir kurz helfen?
fr: Tu peux m'aider ? / Peux-tu m'aider ?
es: ¿Puedes ayudarme? / ¿Me puedes ayudar? / ¿Me ayudas?

help-u
nl: Kunt u me helpen? / Kunt u mij helpen?
en: Could you help me, please?
de: Können Sie mir helfen?
fr: Vous pouvez m'aider ? / Pouvez-vous m'aider ?
es: ¿Puede ayudarme? / ¿Me puede ayudar?

wat-betekent
nl: Wat betekent dat? / Wat wil dat zeggen? / Wat betekent dit?
en: What does that mean? / What does this mean?
de: Was bedeutet das? / Was heißt das?
fr: Qu'est-ce que ça veut dire ? / Ça veut dire quoi ? / Ça signifie quoi ?
es: ¿Qué significa eso? / ¿Qué quiere decir eso? / ¿Qué significa esto?

wat-betekent-woord
nl: Wat betekent dit woord? / Wat betekent dat woord?
en: What does this word mean? / What does that word mean?
de: Was bedeutet dieses Wort? / Was heißt dieses Wort?
fr: Que veut dire ce mot ? / Qu'est-ce que ce mot veut dire ? / Ce mot veut dire quoi ?
es: ¿Qué significa esta palabra? / ¿Qué quiere decir esta palabra?

hoe-zeg-je
nl: Hoe zeg je dat? / Hoe zeg je dit?
en: How do you say that?
de: Wie sagt man das?
fr: Comment on dit ça ? / Comment dit-on ça ?
es: ¿Cómo se dice eso? / ¿Cómo se dice?

spreek-engels
nl: Spreek je Engels? / Spreek jij Engels?
en: Do you speak English?
de: Sprichst du Englisch?
fr: Tu parles anglais ? / Parles-tu anglais ?
es: ¿Hablas inglés?

spreek-engels-u
nl: Spreekt u Engels?
en: Do you speak English?
de: Sprechen Sie Englisch?
fr: Vous parlez anglais ? / Parlez-vous anglais ?
es: ¿Habla inglés? / ¿Habla usted inglés?

wat-zei-je
nl: Wat zei je? / Wat zeg je? / Sorry, wat zei je?
en: What did you say? / Sorry, what did you say?
de: Was hast du gesagt? / Wie bitte? / Was sagst du?
fr: Qu'est-ce que tu as dit ? / Tu as dit quoi ? / Comment ?
es: ¿Qué has dicho? / ¿Cómo? / ¿Qué dices?

hulp-nodig
nl: Ik heb hulp nodig.
en: I need help.
de: Ich brauche Hilfe.
fr: J'ai besoin d'aide.
es: Necesito ayuda.

help-nood
nl: Help!
en: Help!
de: Hilfe!
fr: Au secours ! / À l'aide !
es: ¡Socorro! / ¡Ayuda!

ambulance
nl: Bel een ambulance! / Bel 112!
en: Call an ambulance!
de: Ruf einen Krankenwagen!
fr: Appelle une ambulance ! / Appelez une ambulance !
es: ¡Llama a una ambulancia!

verdwaald
nl: Ik ben verdwaald.
en: I'm lost.
de: Ich habe mich verlaufen.
fr: Je suis perdu[|e].
es: Estoy perdid[o|a]. / Me he perdido.

wacht-even
nl: Wacht even. / Momentje. / Een momentje. / Even wachten. / Een moment.
en: Wait a moment. / Just a moment. / One moment. / Hang on.
de: Moment mal. / Einen Moment. / Warte kurz. / Moment.
fr: Un instant. / Attends un peu. / Une seconde. / Un moment.
es: Un momento. / Espera un momento. / Un segundo.

kom-eraan
nl: Ik kom eraan. / Ik kom zo. / Ik kom eraan!
en: I'm coming. / Coming! / I'll be right there.
de: Ich komme. / Ich komme gleich.
fr: J'arrive. / J'arrive tout de suite.
es: Ya voy. / Voy enseguida.

bijna-er
nl: Ik ben er bijna.
en: I'm almost there. / I'm nearly there.
de: Ich bin fast da. / Ich bin gleich da.
fr: Je suis presque arrivé[|e]. / J'arrive bientôt.
es: Ya casi llego. / Estoy llegando.

sorry-te-laat
nl: Sorry dat ik te laat ben. / Sorry, ik ben te laat. / Sorry voor het wachten.
en: Sorry I'm late. / Sorry, I'm late.
de: Tut mir leid, dass ich zu spät bin. / Entschuldigung, ich bin zu spät.
fr: Désolé[|e] d'être en retard. / Pardon, je suis en retard.
es: Perdón por llegar tarde. / Siento llegar tarde.

te-laat
nl: Ik ben te laat. / Ik kom te laat.
en: I'm late.
de: Ich bin zu spät. / Ich komme zu spät.
fr: Je suis en retard.
es: Llego tarde. / Voy tarde.

vergeten
nl: Ik ben het vergeten. / Vergeten. / Ik ben het vergeten!
en: I forgot. / I've forgotten.
de: Ich habe es vergessen. / Vergessen.
fr: J'ai oublié.
es: Se me ha olvidado. / Lo he olvidado. / Se me olvidó.

wat-is-er
nl: Wat is er? / Wat is er aan de hand? / Wat is er met je?
en: What's wrong? / What's up? / What's the matter?
de: Was ist los? / Was hast du?
fr: Qu'est-ce qu'il y a ? / Qu'est-ce qui se passe ?
es: ¿Qué pasa? / ¿Qué te pasa?

wat-gebeurd
nl: Wat is er gebeurd?
en: What happened?
de: Was ist passiert?
fr: Qu'est-ce qui s'est passé ?
es: ¿Qué ha pasado? / ¿Qué pasó?

alles-in-orde
nl: Is alles in orde? / Gaat het? / Is alles oké? / Gaat het wel?
en: Are you okay? / Is everything okay? / Are you alright?
de: Ist alles in Ordnung? / Alles okay? / Geht es?
fr: Tout va bien ? / Ça va aller ?
es: ¿Estás bien? / ¿Está todo bien?

hoe-was-dag
nl: Hoe was je dag? / Hoe was jouw dag?
en: How was your day?
de: Wie war dein Tag?
fr: Comment s'est passée ta journée ? / Ta journée s'est bien passée ?
es: ¿Qué tal tu día? / ¿Cómo te ha ido el día?

trots-op
nl: Ik ben trots op {P}.
en: I'm proud of {P}.
de: Ich bin stolz auf {P}.
fr: Je suis fi[er|ère] de {P}.
es: Estoy orgullos[o|a] de {P}.

zo-trots-op
nl: Ik ben zo trots op {P}. / Ik ben heel trots op {P}. / Ik ben echt trots op {P}.
en: I'm so proud of {P}. / I'm very proud of {P}. / I'm really proud of {P}.
de: Ich bin so stolz auf {P}. / Ich bin sehr stolz auf {P}. / Ich bin richtig stolz auf {P}.
fr: Je suis tellement fi[er|ère] de {P}. / Je suis très fi[er|ère] de {P}. / Je suis si fi[er|ère] de {P}.
es: Estoy muy orgullos[o|a] de {P}.

boos-op
nl: Ik ben boos op {P}. / Ik ben kwaad op {P}.
en: I'm angry with {P}. / I'm angry at {P}. / I'm mad at {P}.
de: Ich bin sauer auf {P}. / Ich bin wütend auf {P}. / Ich bin böse auf {P}.
fr: Je suis fâché[|e] contre {P}. / Je suis en colère contre {P}.
es: Estoy enfadad[o|a] con {P}. / Estoy enojad[o|a] con {P}.

bang-voor
nl: Ik ben bang voor {P}. / Ik ben bang van {P}.
en: I'm afraid of {P}. / I'm scared of {P}.
de: Ich habe Angst vor {P:dat}.
fr: J'ai peur de {P}.
es: Tengo miedo de {P}.

verliefd-op
nl: Ik ben verliefd op {P}.
en: I'm in love with {P}.
de: Ich bin in {P} verliebt. / Ich bin verliebt in {P}.
fr: Je suis amoureu[x|se] de {P}.
es: Estoy enamorad[o|a] de {P}.

jaloers-op
nl: Ik ben jaloers op {P}.
en: I'm jealous of {P}.
de: Ich bin eifersüchtig auf {P}. / Ich bin neidisch auf {P}.
fr: Je suis jalou[x|se] de {P}.
es: Tengo celos de {P}. / Estoy celos[o|a] de {P}.

blij-voor
nl: Ik ben blij voor {P}.
en: I'm happy for {P}.
de: Ich freue mich für {P}.
fr: Je suis content[|e] pour {P}.
es: Me alegro por {P}.

zorgen-om
nl: Ik maak me zorgen om {P}. / Ik maak me zorgen over {P}.
en: I'm worried about {P}.
de: Ich mache mir Sorgen um {P}.
fr: Je m'inquiète pour {P}.
es: Estoy preocupad[o|a] por {P}.

afspreken-met
nl: Ik heb met {P} afgesproken. / Ik spreek met {P} af.
en: I'm meeting {P}. / I'm meeting up with {P}.
de: Ich treffe mich mit {P:dat}.
fr: J'ai rendez-vous avec {P}.
es: He quedado con {P}. / Quedo con {P}.

bang
nl: Ik ben bang.
en: I'm scared. / I'm afraid.
de: Ich habe Angst.
fr: J'ai peur.
es: Tengo miedo.

moe
nl: Ik ben moe.
en: I'm tired.
de: Ich bin müde.
fr: Je suis fatigué[|e].
es: Estoy cansad[o|a].

heel-moe
nl: Ik ben heel moe. / Ik ben erg moe. / Ik ben zo moe. / Ik ben echt moe.
en: I'm very tired. / I'm so tired. / I'm really tired.
de: Ich bin sehr müde. / Ich bin so müde. / Ich bin echt müde.
fr: Je suis très fatigué[|e]. / Je suis tellement fatigué[|e]. / Je suis vraiment fatigué[|e].
es: Estoy muy cansad[o|a].

beetje-moe
nl: Ik ben een beetje moe. / Ik ben wat moe.
en: I'm a bit tired. / I'm a little tired.
de: Ich bin ein bisschen müde. / Ich bin etwas müde.
fr: Je suis un peu fatigué[|e].
es: Estoy un poco cansad[o|a].

honger
nl: Ik heb honger. / Ik heb trek.
en: I'm hungry.
de: Ich habe Hunger.
fr: J'ai faim.
es: Tengo hambre.

veel-honger
nl: Ik heb veel honger. / Ik heb echt honger. / Ik heb zo'n honger. / Ik heb erge honger.
en: I'm very hungry. / I'm really hungry. / I'm starving.
de: Ich habe großen Hunger. / Ich habe richtig Hunger. / Ich habe so einen Hunger.
fr: J'ai très faim. / J'ai vraiment faim.
es: Tengo mucha hambre.

dorst
nl: Ik heb dorst.
en: I'm thirsty.
de: Ich habe Durst.
fr: J'ai soif.
es: Tengo sed.

het-koud-ik
nl: Ik heb het koud.
en: I'm cold.
de: Mir ist kalt.
fr: J'ai froid.
es: Tengo frío.

het-warm-ik
nl: Ik heb het warm.
en: I'm hot. / I'm warm.
de: Mir ist warm. / Mir ist heiß.
fr: J'ai chaud.
es: Tengo calor.

blij
nl: Ik ben blij. / Ik ben gelukkig.
en: I'm happy.
de: Ich bin froh. / Ich bin glücklich.
fr: Je suis content[|e]. / Je suis heureu[x|se].
es: Estoy content[o|a]. / Estoy feliz.

verveel
nl: Ik verveel me.
en: I'm bored.
de: Mir ist langweilig. / Ich langweile mich.
fr: Je m'ennuie.
es: Me aburro. / Estoy aburrid[o|a].

druk
nl: Ik heb het druk. / Ik ben druk.
en: I'm busy.
de: Ich habe viel zu tun. / Ich bin beschäftigt.
fr: Je suis occupé[|e].
es: Estoy ocupad[o|a].

mis-je
nl: Ik mis je. / Ik mis jou.
en: I miss you.
de: Ich vermisse dich. / Du fehlst mir.
fr: Tu me manques.
es: Te echo de menos. / Te extraño.

hou-van-je
nl: Ik hou van je. / Ik hou van jou. / Ik houd van je.
en: I love you.
de: Ich liebe dich. / Ich hab dich lieb.
fr: Je t'aime.
es: Te quiero. / Te amo.

afspreken-hoe-laat
nl: Hoe laat spreken we af? / Hoe laat zien we elkaar? / Om hoe laat spreken we af?
en: What time shall we meet? / What time do we meet? / What time are we meeting?
de: Um wie viel Uhr treffen wir uns? / Wann treffen wir uns? / Um wie viel Uhr sehen wir uns?
fr: On se retrouve à quelle heure ? / À quelle heure on se retrouve ? / À quelle heure nous retrouvons-nous ? / On se voit à quelle heure ?
es: ¿A qué hora quedamos? / ¿A qué hora nos vemos? / ¿Cuándo quedamos?

waar-afspreken
nl: Waar spreken we af? / Waar zien we elkaar?
en: Where shall we meet? / Where do we meet?
de: Wo treffen wir uns?
fr: On se retrouve où ? / Où est-ce qu'on se retrouve ?
es: ¿Dónde quedamos? / ¿Dónde nos vemos?

morgen-tijd
nl: Heb je morgen tijd? / Ben je morgen vrij? / Kun je morgen? / Heb jij morgen tijd?
en: Are you free tomorrow? / Do you have time tomorrow?
de: Hast du morgen Zeit? / Bist du morgen frei? / Kannst du morgen?
fr: Tu es libre demain ? / Tu as le temps demain ? / Tu es dispo demain ?
es: ¿Tienes tiempo mañana? / ¿Estás libre mañana? / ¿Puedes mañana?

zullen-we-eten
nl: Zullen we gaan eten? / Gaan we eten? / Zullen we wat gaan eten?
en: Shall we go and eat? / Shall we go eat? / Shall we eat?
de: Wollen wir essen gehen? / Gehen wir essen?
fr: On va manger ? / On va manger quelque chose ?
es: ¿Vamos a comer? / ¿Comemos?

zin-om-te-eten
nl: Heb je zin om te eten? / Wil je gaan eten? / Wil je iets eten? / Wil je wat eten?
en: Do you want to eat? / Do you want to go eat? / Do you want something to eat?
de: Hast du Lust zu essen? / Willst du essen gehen? / Möchtest du etwas essen?
fr: Tu veux manger ? / Tu as envie de manger ? / Tu veux manger quelque chose ?
es: ¿Quieres comer? / ¿Te apetece comer? / ¿Quieres comer algo?


vanavond
nl: Wat ga je vanavond doen? / Wat doe je vanavond?
en: What are you doing tonight? / What are you doing this evening?
de: Was machst du heute Abend?
fr: Qu'est-ce que tu fais ce soir ? / Tu fais quoi ce soir ?
es: ¿Qué haces esta noche? / ¿Qué vas a hacer esta noche?

weekend
nl: Wat ga je dit weekend doen? / Wat doe je dit weekend? / Wat ga je doen dit weekend?
en: What are you doing this weekend? / What are you going to do this weekend?
de: Was machst du am Wochenende? / Was hast du am Wochenende vor? / Was machst du dieses Wochenende?
fr: Qu'est-ce que tu fais ce week-end ? / Tu fais quoi ce week-end ?
es: ¿Qué vas a hacer este fin de semana? / ¿Qué haces este fin de semana?

plannen-weekend
nl: Heb je plannen voor het weekend? / Heb je al plannen voor het weekend?
en: Do you have plans for the weekend? / Do you have any plans for the weekend?
de: Hast du Pläne fürs Wochenende? / Hast du schon Pläne fürs Wochenende?
fr: Tu as des projets pour le week-end ? / Tu as prévu quelque chose ce week-end ?
es: ¿Tienes planes para el fin de semana?

kan-niet
nl: Ik kan niet. / Dat lukt me niet. / Ik kan helaas niet.
en: I can't. / I can't make it.
de: Ich kann nicht. / Ich kann leider nicht.
fr: Je ne peux pas. / Je ne peux pas, désolé.
es: No puedo.

morgen-werken
nl: Ik moet morgen werken. / Morgen moet ik werken.
en: I have to work tomorrow. / I need to work tomorrow.
de: Ich muss morgen arbeiten. / Morgen muss ich arbeiten.
fr: Je dois travailler demain. / Demain je dois travailler.
es: Mañana tengo que trabajar. / Tengo que trabajar mañana.

toilet
nl: Waar is het toilet? / Waar is de wc? / Waar zijn de toiletten? / Waar is de wc hier?
en: Where is the toilet? / Where's the bathroom? / Where are the toilets? / Where is the restroom?
de: Wo ist die Toilette? / Wo ist das Klo? / Wo sind die Toiletten? / Wo ist hier die Toilette?
fr: Où sont les toilettes ? / Où est la toilette ? / Les toilettes, c'est où ?
es: ¿Dónde está el baño? / ¿Dónde están los servicios? / ¿Dónde está el servicio? / ¿Dónde está el aseo?

waar-station
nl: Waar is het station?
en: Where is the station?
de: Wo ist der Bahnhof?
fr: Où est la gare ?
es: ¿Dónde está la estación?

hoe-station
nl: Hoe kom ik bij het station? / Hoe kom ik naar het station?
en: How do I get to the station?
de: Wie komme ich zum Bahnhof?
fr: Comment aller à la gare ? / Comment je vais à la gare ?
es: ¿Cómo llego a la estación? / ¿Cómo voy a la estación?

ver
nl: Is het ver? / Is het ver weg? / Is het ver hiervandaan?
en: Is it far? / Is it far away? / Is it far from here?
de: Ist es weit? / Ist es weit weg? / Ist es weit von hier?
fr: C'est loin ? / Est-ce que c'est loin ? / C'est loin d'ici ?
es: ¿Está lejos? / ¿Está muy lejos? / ¿Está lejos de aquí?

bus-vertrek
nl: Hoe laat vertrekt de bus? / Wanneer vertrekt de bus? / Hoe laat gaat de bus?
en: What time does the bus leave? / When does the bus leave? / What time is the bus?
de: Um wie viel Uhr fährt der Bus ab? / Wann fährt der Bus ab? / Wann fährt der Bus? / Um wie viel Uhr fährt der Bus?
fr: À quelle heure part le bus ? / Quand part le bus ? / Le bus part à quelle heure ?
es: ¿A qué hora sale el autobús? / ¿Cuándo sale el autobús?

kosten-dit
nl: Hoeveel kost dit? / Wat kost dit? / Wat kost dat? / Hoeveel kost dat?
en: How much is this? / How much does this cost? / How much is that?
de: Was kostet das? / Wie viel kostet das?
fr: Combien ça coûte ? / Ça coûte combien ? / C'est combien ?
es: ¿Cuánto cuesta esto? / ¿Cuánto es esto? / ¿Cuánto cuesta eso?

kosten
nl: Hoeveel kost het? / Wat kost het? / Hoeveel is het?
en: How much does it cost? / How much is it?
de: Was kostet es? / Wie viel kostet es?
fr: Combien est-ce que ça coûte ? / Ça fait combien ?
es: ¿Cuánto cuesta? / ¿Cuánto es?

pinnen
nl: Kan ik pinnen? / Kan ik met de kaart betalen? / Kan ik met pin betalen? / Kan ik met mijn kaart betalen?
en: Can I pay by card? / Can I pay with my card? / Can I pay with a card?
de: Kann ich mit Karte zahlen? / Kann ich mit Karte bezahlen?
fr: Je peux payer par carte ? / Est-ce que je peux payer par carte ?
es: ¿Puedo pagar con tarjeta? / ¿Se puede pagar con tarjeta?

contant
nl: Kan ik contant betalen? / Kan ik cash betalen?
en: Can I pay in cash? / Can I pay cash?
de: Kann ich bar zahlen? / Kann ich bar bezahlen?
fr: Je peux payer en espèces ? / Je peux payer en liquide ?
es: ¿Puedo pagar en efectivo?

wil-kopen
nl: Ik wil dit kopen. / Dit wil ik kopen. / Ik wil dit graag kopen.
en: I'd like to buy this. / I want to buy this.
de: Ich möchte das kaufen. / Ich will das kaufen.
fr: Je voudrais acheter ça. / Je veux acheter ça.
es: Quiero comprar esto. / Quisiera comprar esto.

neem-dit
nl: Ik neem dit. / Ik neem deze. / Ik neem het.
en: I'll take this. / I'll take it.
de: Ich nehme das. / Ich nehme es.
fr: Je prends ça. / Je le prends.
es: Me llevo esto. / Me lo llevo.

alleen-kijken
nl: Ik kijk alleen even. / Ik kijk alleen. / Ik kijk even rond.
en: I'm just looking.
de: Ich schaue nur. / Ich schaue mich nur um.
fr: Je regarde seulement. / Je regarde juste.
es: Solo estoy mirando. / Solo miro.

te-duur
nl: Het is te duur. / Dat is te duur.
en: It's too expensive.
de: Das ist zu teuer. / Es ist zu teuer.
fr: C'est trop cher.
es: Es demasiado caro. / Es muy caro.

rekening
nl: De rekening, alsjeblieft. / Mag ik de rekening? / Kan ik afrekenen? / Mag ik afrekenen? / De rekening graag.
en: The bill, please. / Can I have the bill? / Could I have the bill?
de: Die Rechnung, bitte. / Kann ich die Rechnung haben? / Zahlen, bitte.
fr: L'addition, s'il vous plaît. / L'addition, s'il te plaît. / Je peux avoir l'addition ?
es: La cuenta, por favor. / ¿Me trae la cuenta? / ¿Me cobras?

menu
nl: Mag ik de kaart? / Mag ik het menu? / Mag ik de menukaart?
en: Can I have the menu? / Could I see the menu?
de: Kann ich die Karte haben? / Kann ich die Speisekarte haben?
fr: Je peux avoir la carte ? / Je peux avoir le menu ?
es: ¿Me da la carta? / ¿Me trae la carta?

bestellen
nl: Ik wil graag bestellen. / Ik wil bestellen. / Mag ik bestellen?
en: I'd like to order. / I want to order.
de: Ich möchte bestellen. / Ich würde gern bestellen.
fr: Je voudrais commander. / Je veux commander.
es: Quiero pedir. / Quisiera pedir.

aanraden
nl: Wat raad je aan? / Wat kun je aanraden? / Wat raad jij aan?
en: What do you recommend? / What would you recommend?
de: Was empfiehlst du? / Was kannst du empfehlen?
fr: Qu'est-ce que tu recommandes ? / Tu me conseilles quoi ?
es: ¿Qué me recomiendas? / ¿Qué recomiendas?

tafel-twee
nl: Een tafel voor twee, alsjeblieft. / Een tafel voor twee personen, alsjeblieft.
en: A table for two, please.
de: Einen Tisch für zwei, bitte. / Einen Tisch für zwei Personen, bitte.
fr: Une table pour deux, s'il vous plaît.
es: Una mesa para dos, por favor.

water
nl: Mag ik een glas water? / Een glas water, alsjeblieft. / Kan ik een glas water krijgen?
en: Can I have a glass of water? / A glass of water, please. / Could I have a glass of water?
de: Kann ich ein Glas Wasser haben? / Ein Glas Wasser, bitte.
fr: Je peux avoir un verre d'eau ? / Un verre d'eau, s'il te plaît. / Un verre d'eau, s'il vous plaît.
es: ¿Me pones un vaso de agua? / Un vaso de agua, por favor. / ¿Me das un vaso de agua?

lekker
nl: Het is lekker. / Dit is lekker. / Het smaakt goed. / Lekker!
en: It's delicious. / This is delicious. / It tastes good. / It's good.
de: Es ist lecker. / Das ist lecker. / Es schmeckt gut. / Lecker!
fr: C'est bon. / C'est délicieux.
es: Está rico. / Está bueno. / Está delicioso. / ¡Qué rico!

heel-lekker
nl: Het is heel lekker. / Het is erg lekker. / Dit is echt lekker.
en: It's really good. / It's very good. / This is really delicious.
de: Es ist sehr lecker. / Das ist richtig lecker.
fr: C'est très bon. / C'est vraiment bon.
es: Está muy rico. / Está buenísimo.

geen-vlees
nl: Ik eet geen vlees.
en: I don't eat meat.
de: Ich esse kein Fleisch.
fr: Je ne mange pas de viande.
es: No como carne.

vegetarier
nl: Ik ben vegetariër. / Ik ben vegetarisch.
en: I'm a vegetarian. / I'm vegetarian.
de: Ich bin Vegetarier[|in].
fr: Je suis végétarien[|ne].
es: Soy vegetarian[o|a].

geen-vlees-vis
nl: Ik eet geen vlees en geen vis. / Ik eet geen vlees of vis. / Ik eet geen vlees en vis.
en: I don't eat meat or fish.
de: Ich esse kein Fleisch und keinen Fisch. / Ich esse weder Fleisch noch Fisch.
fr: Je ne mange ni viande ni poisson. / Je ne mange pas de viande ni de poisson.
es: No como carne ni pescado.

mooi-weer
nl: Het is mooi weer. / Het is lekker weer.
en: The weather is nice. / It's nice weather. / It's a nice day.
de: Das Wetter ist schön. / Es ist schönes Wetter.
fr: Il fait beau.
es: Hace buen tiempo. / Hace bueno.

wat-mooi-weer
nl: Wat een mooi weer! / Wat een lekker weer!
en: What lovely weather! / What nice weather!
de: Was für ein schönes Wetter! / So ein schönes Wetter!
fr: Quel beau temps !
es: ¡Qué buen tiempo!

koud
nl: Het is koud.
en: It's cold.
de: Es ist kalt.
fr: Il fait froid.
es: Hace frío.

erg-koud
nl: Het is erg koud. / Het is heel koud. / Wat is het koud! / Het is zo koud.
en: It's very cold. / It's really cold. / It's so cold.
de: Es ist sehr kalt. / Es ist so kalt.
fr: Il fait très froid.
es: Hace mucho frío. / ¡Qué frío hace!

warm
nl: Het is warm. / Het is heet.
en: It's hot. / It's warm.
de: Es ist warm. / Es ist heiß.
fr: Il fait chaud.
es: Hace calor.

regent
nl: Het regent.
en: It's raining.
de: Es regnet.
fr: Il pleut.
es: Está lloviendo. / Llueve.

gaat-regenen
nl: Het gaat regenen.
en: It's going to rain.
de: Es wird regnen. / Es gibt gleich Regen.
fr: Il va pleuvoir.
es: Va a llover.

hoe-weer
nl: Hoe is het weer? / Wat voor weer is het?
en: What's the weather like? / How's the weather?
de: Wie ist das Wetter?
fr: Quel temps fait-il ? / Il fait quel temps ?
es: ¿Qué tiempo hace?

gisteren
nl: Wat heb je gisteren gedaan? / Wat deed je gisteren?
en: What did you do yesterday?
de: Was hast du gestern gemacht?
fr: Qu'est-ce que tu as fait hier ? / Tu as fait quoi hier ?
es: ¿Qué hiciste ayer? / ¿Qué has hecho ayer?

al-gegeten
nl: Ik heb al gegeten.
en: I've already eaten. / I already ate.
de: Ich habe schon gegessen.
fr: J'ai déjà mangé.
es: Ya he comido. / Ya comí.

net-gegeten
nl: Ik heb net gegeten.
en: I just ate. / I've just eaten.
de: Ich habe gerade gegessen.
fr: Je viens de manger.
es: Acabo de comer.

goed-geslapen
nl: Heb je goed geslapen? / Heb jij goed geslapen?
en: Did you sleep well?
de: Hast du gut geschlafen?
fr: Tu as bien dormi ? / As-tu bien dormi ?
es: ¿Has dormido bien? / ¿Dormiste bien?

ziek
nl: Ik ben ziek.
en: I'm ill. / I'm sick.
de: Ich bin krank.
fr: Je suis malade.
es: Estoy enferm[o|a].

niet-lekker
nl: Ik voel me niet goed. / Ik voel me niet lekker. / Ik ben niet lekker.
en: I don't feel well. / I'm not feeling well.
de: Mir geht es nicht gut. / Ich fühle mich nicht gut.
fr: Je ne me sens pas bien.
es: No me encuentro bien. / No me siento bien.


beetje-hoofdpijn
nl: Ik heb een beetje hoofdpijn. / Ik heb wat hoofdpijn.
en: I have a slight headache. / I've got a bit of a headache.
de: Ich habe ein bisschen Kopfschmerzen. / Ich habe leichte Kopfschmerzen.
fr: J'ai un peu mal à la tête.
es: Me duele un poco la cabeza.

tandpijn
nl: Ik heb tandpijn. / Ik heb kiespijn.
en: I have a toothache. / I've got a toothache.
de: Ich habe Zahnschmerzen.
fr: J'ai mal aux dents.
es: Tengo dolor de muelas. / Me duelen las muelas.

dokter
nl: Ik moet naar de dokter. / Ik heb een dokter nodig. / Ik moet naar een dokter.
en: I need to see a doctor. / I need a doctor.
de: Ich muss zum Arzt. / Ich brauche einen Arzt.
fr: J'ai besoin d'un médecin. / Je dois voir un médecin.
es: Necesito un médico. / Necesito ir al médico.

heel-leuk
nl: Ik vind het heel leuk. / Ik vind het erg leuk. / Dat vind ik heel leuk.
en: I really like it. / I like it a lot.
de: Das gefällt mir sehr. / Es gefällt mir sehr gut.
fr: Ça me plaît beaucoup. / J'aime beaucoup.
es: Me gusta mucho.

helemaal-niet-leuk
nl: Ik vind het helemaal niet leuk. / Dat vind ik helemaal niet leuk.
en: I don't like it at all.
de: Das gefällt mir gar nicht. / Es gefällt mir überhaupt nicht.
fr: Ça ne me plaît pas du tout. / Je n'aime pas du tout ça.
es: No me gusta nada.

kan-ik-betalen
nl: Kan ik betalen? / Mag ik betalen?
en: Can I pay?
de: Kann ich zahlen? / Kann ich bezahlen?
fr: Je peux payer ?
es: ¿Puedo pagar?

water-graag
nl: Ik wil graag water. / Graag wat water.
en: I'd like some water.
de: Ich hätte gern Wasser. / Ich möchte Wasser.
fr: Je voudrais de l'eau.
es: Quiero agua. / Quisiera agua.

kan-me-niet-schelen
nl: Het kan me niet schelen. / Kan me niet schelen.
en: I don't care.
de: Das ist mir völlig egal. / Das kümmert mich nicht.
fr: Je m'en fiche.
es: No me importa.

wie-is-dat
nl: Wie is dat? / Wie is dat nou?
en: Who is that? / Who's that?
de: Wer ist das?
fr: C'est qui ? / Qui est-ce ?
es: ¿Quién es? / ¿Quién es ese?

hoeveel-personen
nl: Met hoeveel zijn jullie? / Met hoeveel personen zijn jullie? / Met z'n hoevelen zijn jullie?
en: How many of you are there? / How many people are you?
de: Wie viele seid ihr? / Wie viele Personen seid ihr?
fr: Vous êtes combien ? / Combien êtes-vous ?
es: ¿Cuántos sois? / ¿Cuántos son? / ¿Cuántas personas sois?

dank-hulp
nl: Bedankt voor je hulp. / Dank je voor je hulp. / Dank je wel voor je hulp. / Bedankt voor de hulp.
en: Thanks for your help. / Thank you for your help. / Thanks for the help.
de: Danke für deine Hilfe. / Danke für die Hilfe.
fr: Merci pour ton aide. / Merci de ton aide. / Merci pour l'aide.
es: Gracias por tu ayuda. / Gracias por la ayuda.

telefoon-leeg
nl: Mijn telefoon is leeg. / Mijn batterij is leeg. / Mijn mobiel is leeg.
en: My phone is dead. / My battery is dead. / My phone's battery is dead.
de: Mein Handy ist leer. / Mein Akku ist leer.
fr: Mon téléphone n'a plus de batterie. / Je n'ai plus de batterie. / Mon portable est déchargé.
es: Me he quedado sin batería. / Mi móvil no tiene batería. / No tengo batería.

zin-om
nl: Ik heb zin om te {V}.
en: I feel like {V:ing}.
de: Ich habe Lust zu {V}.
fr: J'ai envie de {V}.
es: Tengo ganas de {V}.

geen-zin-om
nl: Ik heb geen zin om te {V}.
en: I don't feel like {V:ing}.
de: Ich habe keine Lust zu {V}.
fr: Je n'ai pas envie de {V}.
es: No tengo ganas de {V}.

zin-om-vraag
nl: Heb je zin om te {V}?
en: Do you feel like {V:ing}?
de: Hast du Lust zu {V}?
fr: Tu as envie de {V} ?
es: ¿Tienes ganas de {V}?

zullen-we
nl: Zullen we {V}? / Gaan we {V}?
en: Shall we {V}?
de: Wollen wir {V}? / Sollen wir {V}?
fr: On {V:p2} ?
es: ¿{V:p3}?

zullen-we-samen
nl: Zullen we samen {V}?
en: Shall we {V} together?
de: Wollen wir zusammen {V}?
fr: On {V:p2} ensemble ?
es: ¿{V:p3} juntos?

zullen-we-morgen
nl: Zullen we morgen {V}?
en: Shall we {V} tomorrow?
de: Wollen wir morgen {V}?
fr: On {V:p2} demain ?
es: ¿{V:p3} mañana?

zullen-we-morgen-samen
nl: Zullen we morgen samen {V}? / Zullen we samen morgen {V}?
en: Shall we {V} together tomorrow?
de: Wollen wir morgen zusammen {V}?
fr: On {V:p2} ensemble demain ?
es: ¿{V:p3} juntos mañana?

wat-doe-je-nu
nl: Wat ben je aan het doen? / Waar ben je mee bezig? / Wat ben jij aan het doen?
en: What are you doing?
de: Was machst du gerade? / Was machst du?
fr: Qu'est-ce que tu fais ? / Tu fais quoi ?
es: ¿Qué estás haciendo? / ¿Qué haces?

zit-hier
nl: Mag ik hier zitten? / Kan ik hier zitten? / Is deze plek vrij?
en: Can I sit here? / May I sit here? / Is this seat free?
de: Darf ich mich hier hinsetzen? / Kann ich hier sitzen? / Ist hier frei?
fr: Je peux m'asseoir ici ? / Est-ce que cette place est libre ? / C'est libre ?
es: ¿Puedo sentarme aquí? / ¿Está libre este sitio? / ¿Está libre?

woon-al
nl: Ik woon hier al {N} jaar.
en: I've lived here for {N} years. / I have lived here for {N} years. / I've been living here for {N} years.
de: Ich wohne seit {N} Jahren hier. / Ich wohne hier seit {N} Jahren.
fr: J'habite ici depuis {N} ans.
es: Vivo aquí desde hace {N} años. / Llevo {N} años viviendo aquí.

werk-al
nl: Ik werk hier al {N} jaar.
en: I've worked here for {N} years. / I have worked here for {N} years. / I've been working here for {N} years.
de: Ich arbeite seit {N} Jahren hier. / Ich arbeite hier seit {N} Jahren.
fr: Je travaille ici depuis {N} ans.
es: Trabajo aquí desde hace {N} años. / Llevo {N} años trabajando aquí.

het-is-laat
nl: Het is laat. / Het is al laat. / Het wordt laat.
en: It's late. / It's getting late. / It's already late.
de: Es ist spät. / Es ist schon spät. / Es wird spät.
fr: Il est tard. / Il est déjà tard. / Il se fait tard.
es: Es tarde. / Ya es tarde. / Se está haciendo tarde.

ze-bezig
nl: Ze is aan het {V}.
en: She's {V:ing}.
de: Sie {V:p2} gerade.
fr: Elle est en train de {V}.
es: Está {V:ger}.

te-laat-het
nl: Het is te laat.
en: It's too late.
de: Es ist zu spät.
fr: C'est trop tard.
es: Es demasiado tarde.

te-laat-vraag
nl: Is het te laat?
en: Is it too late?
de: Ist es zu spät?
fr: C'est trop tard ?
es: ¿Es demasiado tarde?

vind-goed
nl: Ik vind het goed. / Dat vind ik goed. / Ik vind dat goed. / Dat vind ik prima.
en: I think it's good. / I think that's good. / That's fine with me.
de: Ich finde es gut. / Ich finde das gut. / Das finde ich gut.
fr: Je trouve ça bien. / Je trouve que c'est bien. / Ça me va.
es: Me parece bien. / Lo encuentro bien. / Eso me parece bien.

vind-goed-vraag
nl: Vind je het goed? / Vind je dat goed? / Is dat goed voor jou?
en: Do you think it's good? / Is that okay with you? / Is that fine with you?
de: Findest du es gut? / Findest du das gut? / Ist das okay für dich?
fr: Tu trouves ça bien ? / Ça te va ?
es: ¿Te parece bien? / ¿Lo encuentras bien?
`;

  var TALEN = ["nl", "en", "de", "fr", "es"];
  // Voornaamwoorden op een open plek {P}: 0 ik, 1 jij, 2 hij, 3 zij (enkelvoud), 4 wij, 5 jullie, 6 zij (meervoud), 7 u
  var PRON_IN = {
    nl: { pp: { me: 0, je: 1, hem: 2, haar: 3, ons: 4, jullie: 5, hen: 6, hun: 6, ze: 6, u: 7 } },
    en: { pp: { me: 0, you: 1, him: 2, her: 3, us: 4, them: 6 } },
    de: { pp: { mich: 0, dich: 1, ihn: 2, sie: 3, uns: 4, euch: 5 }, dat: { mir: 0, dir: 1, ihm: 2, ihr: 3, uns: 4, euch: 5, ihnen: 6 } },
    fr: { pp: { moi: 0, toi: 1, lui: 2, elle: 3, nous: 4, vous: 5, eux: 6, elles: 6 } },
    es: { pp: { mi: 0, ti: 1, el: 2, ella: 3, nosotros: 4, nosotras: 4, vosotros: 5, vosotras: 5, ustedes: 5, ellos: 6, ellas: 6, usted: 7 } }
  };
  var PRON_UIT = {
    nl: { pp: ["mij", "jou", "hem", "haar", "ons", "jullie", "hen", "u"] },
    en: { pp: ["me", "you", "him", "her", "us", "you", "them", "you"] },
    de: { pp: ["mich", "dich", "ihn", "sie", "uns", "euch", "sie", "Sie"], dat: ["mir", "dir", "ihm", "ihr", "uns", "euch", "ihnen", "Ihnen"] },
    fr: { pp: ["moi", "toi", "lui", "elle", "nous", "vous", "eux", "vous"] },
    es: { pp: ["mí", "ti", "él", "ella", "nosotros", "ustedes", "ellos", "usted"] }
  };
  // Beleefdheidswoord dat los voor of achter een zin kan staan
  var GRAAG_IN = { nl: /(^|,?\s+)(alsjeblieft|alstublieft|aub|a\.u\.b\.)\s*([.!?]*)$/i, en: /(^|,?\s+)please\s*([.!?]*)$/i, de: /(^|,?\s+)bitte\s*([.!?]*)$/i,
    fr: /(^|,?\s+)(s'il te plaît|s'il vous plaît|s’il te plaît|s’il vous plaît|stp|svp)\s*([.!?]*)$/i, es: /(^|,?\s+)por favor\s*([.!?]*)$/i };
  var GRAAG_UIT = { nl: "alsjeblieft", en: "please", de: "bitte", fr: "s'il te plaît", es: "por favor" };

  var EN_SAMEN = { "i'm": "i am", "you're": "you are", "we're": "we are", "they're": "they are", "it's": "it is", "that's": "that is",
    "what's": "what is", "how's": "how is", "where's": "where is", "there's": "there is", "he's": "he is", "she's": "she is",
    "don't": "do not", "doesn't": "does not", "didn't": "did not", "can't": "cannot", "won't": "will not", "isn't": "is not",
    "aren't": "are not", "i've": "i have", "you've": "you have", "i'll": "i will", "i'd": "i would", "let's": "let us", "couldn't": "could not", "wasn't": "was not" };
  var NL_WOORD = { jij: "je", jou: "je", wij: "we", zij: "ze", mij: "me", houd: "hou", "'t": "het", "m'n": "mijn", "z'n": "zijn", "d'r": "haar", okay: "oke", ok: "oke", "oké": "oke", effe: "even", ff: "even" };
  var EN_WOORD = { ok: "okay", okey: "okay", "alright": "all right" };
  var DE_WOORD = { hab: "habe", nochmal: "noch mal", ok: "okay" };
  var ES_WOORD = { ok: "okey", vale: "vale" };

  // Normaliseren: kleine letters, zonder accenten en leestekens, samentrekkingen uitgeschreven
  function woorden(s, lg) {
    s = String(s || "").toLowerCase().replace(/[’`´]/g, "'").replace(/\s+/g, " ").trim();
    if (lg === "en") s = s.replace(/\b[a-z]+'[a-z]+\b/g, function (w) { return EN_SAMEN[w] || w.replace(/n't$/, " not").replace(/'s$/, " is").replace(/'re$/, " are").replace(/'ll$/, " will").replace(/'ve$/, " have").replace(/'d$/, " would"); });
    if (lg === "de") s = s.replace(/([a-zäöüß]+)'s\b/g, "$1 es");
    if (lg === "fr") {
      s = s.replace(/\bt'(as|es|étais|avais)\b/g, "tu $1").replace(/\b(j|l|d|n|qu|s|m|t|c)'/g, function (_, p) { return { j: "je ", l: "le ", d: "de ", n: "ne ", qu: "que ", s: "se ", m: "me ", t: "te ", c: "ce " }[p]; });
      s = s.replace(/^est-ce que\s+/, "").replace(/-/g, " ");
    }
    if (lg === "es") s = s.replace(/\bconmigo\b/g, "con mí").replace(/\bcontigo\b/g, "con ti");
    if (lg === "nl") s = s.replace(/\b(m'n|z'n|d'r)\b/g, function (w) { return NL_WOORD[w]; }).replace(/(^|\s)'t\b/g, "$1het");
    s = s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss");
    s = s.replace(/-/g, " ").replace(/[^a-z0-9{}:\s]/g, " ").replace(/\s+/g, " ").trim();
    var ws = s ? s.split(" ") : [];
    var map = lg === "nl" ? NL_WOORD : lg === "en" ? EN_WOORD : lg === "de" ? DE_WOORD : lg === "es" ? ES_WOORD : null;
    if (map) ws = ws.map(function (w) { return map[w] || w; });
    if (lg === "fr") ws = ws.filter(function (w) { return w !== "ne"; });
    return ws.join(" ").split(" ").filter(Boolean);
  }
  function isVraag(s) { return /[?¿]/.test(String(s || "")); }
  function heeftSlot(s) { return /\{[PNXV]/.test(s); }
  function geslacht(s, g) { return s.replace(/\[([^\]|]*)\|([^\]]*)\]/g, function (_, m, f) { return g === "f" ? f : m; }); }
  function beideGeslachten(s) { var a = geslacht(s, "m"), b = geslacht(s, "f"); return a === b ? [a] : [a, b]; }

  // Lijst inlezen
  var BET = [];
  String(LIJST).trim().split(/\n\s*\n/).forEach(function (blok) {
    var r = blok.trim().split("\n"), b = { id: r[0].trim() };
    if (r.slice(1).some(function (x) { return !/^(nl|en|de|fr|es):/.test(x.trim()); })) b.fout = "blok zonder witregel bij " + b.id;
    r.slice(1).forEach(function (regel) {
      var m = regel.match(/^(nl|en|de|fr|es):\s*(.*)$/);
      if (m) b[m[1]] = m[2].split(" / ").map(function (x) { return x.trim(); }).filter(Boolean);
    });
    BET.push(b);
  });

  // Pijn per lichaamsdeel: de zinnen worden uit één tabel opgebouwd ("Ik heb buikpijn", "Mijn arm doet pijn",
  // "Me duele la tripa", "J'ai mal au ventre", "Mir tut der Bauch weh", "My arm hurts").
  // id|nl|nl samenstelling|en|en -ache|de geslacht|de|de samenstelling|fr geslacht|fr|es geslacht|es|es "dolor de"
  var LICHAAM = [
    "hoofd|hoofd|hoofdpijn|head|headache|m|Kopf|Kopfschmerzen|f|tête|f|cabeza|cabeza",
    "buik|buik|buikpijn|stomach|stomachache|m|Bauch|Bauchschmerzen|m|ventre|f|tripa|barriga",
    "keel|keel|keelpijn|throat|sore throat|m|Hals|Halsschmerzen|f|gorge|f|garganta|garganta",
    "rug|rug|rugpijn|back|backache|m|Rücken|Rückenschmerzen|m|dos|f|espalda|espalda",
    "oor|oor|oorpijn|ear|earache|n|Ohr|Ohrenschmerzen|f|oreille|m|oído|oídos",
    "arm|arm||arm||m|Arm||m|bras|m|brazo|",
    "been|been||leg||n|Bein||f|jambe|f|pierna|",
    "voet|voet||foot||m|Fuß||m|pied|m|pie|",
    "hand|hand||hand||f|Hand||f|main|f|mano|",
    "knie|knie||knee||n|Knie||m|genou|f|rodilla|",
    "schouder|schouder||shoulder||f|Schulter||f|épaule|m|hombro|",
    "nek|nek||neck||m|Nacken||m|cou|m|cuello|",
    "oog|oog||eye||n|Auge||m|œil|m|ojo|"
  ];
  LICHAAM.forEach(function (r) {
    var f = r.split("|"), nl = f[1], nlS = f[2], en = f[3], enA = f[4], dg = f[5], de = f[6], deS = f[7], fg = f[8], fr = f[9], eg = f[10], es = f[11], esD = f[12];
    var klinker = /^[aeéèiouœh]/i.test(fr);
    var frA = fg === "m" ? (klinker ? "à l'" + fr : "au " + fr) : (klinker ? "à l'" + fr : "à la " + fr);
    var frM = fg === "f" && !klinker ? "Ma " : "Mon ";
    var deArt = { m: "der", f: "die", n: "das" }[dg], deMijn = dg === "f" ? "Meine " : "Mein ";
    var esArt = eg === "f" ? "la " : "el ";
    var b = { id: "pijn-" + f[0] };
    b.nl = (nlS ? ["Ik heb " + nlS + "."] : ["Mijn " + nl + " doet pijn."]).concat(nlS ? ["Mijn " + nl + " doet pijn."] : [], ["Ik heb pijn in mijn " + nl + "."]);
    b.en = enA === "sore throat" ? ["I have a sore throat.", "My throat hurts.", "I've got a sore throat."] :
      (enA ? ["I have a " + enA + ".", "My " + en + " hurts.", "I've got a " + enA + "."] : ["My " + en + " hurts.", "I have a pain in my " + en + "."]);
    b.de = (deS ? ["Ich habe " + deS + "."] : [deMijn + de + " tut weh."]).concat(["Mir tut " + deArt + " " + de + " weh."], deS ? [deMijn + de + " tut weh."] : []);
    b.fr = ["J'ai mal " + frA + ".", frM + fr + " me fait mal."];
    b.es = ["Me duele " + esArt + es + "."].concat(esD ? ["Tengo dolor de " + esD + "."] : []);
    if (f[0] === "buik") { b.es.push("Me duele la barriga.", "Me duele el estómago."); b.en.push("I have a stomach ache.", "My tummy hurts."); }
    if (f[0] === "oor") b.es[0] = "Me duele el oído.";
    BET.push(b);
  });

  // "aan het … zijn" (bezig zijn) per persoon: "Ik ben aan het koken" = I'm cooking / Ich koche gerade / Je suis en train de cuisiner / Estoy cocinando
  [["ik", 0, "Ik ben", "I'm|I am", "Ich", "Je suis", "Estoy"], ["jij", 1, "Je bent|Jij bent", "You're|You are", "Du", "Tu es", "Estás"],
   ["hij", 2, "Hij is", "He's|He is", "Er", "Il est", "Está"], ["zij", 2, "Zij is", "She's|She is", "Sie", "Elle est", "Está"],
   ["wij", 3, "We zijn|Wij zijn", "We're|We are", "Wir", "Nous sommes|On est", "Estamos"], ["ze", 5, "Ze zijn|Zij zijn", "They're|They are", "Sie", "Ils sont", "Están"],
   ["jullie", 4, "Jullie zijn", "You're|You are", "Ihr", "Vous êtes", "Estáis"]].forEach(function (r) {
    BET.push({ id: "bezig-" + r[0],
      nl: r[2].split("|").map(function (x) { return x + " aan het {V}."; }),
      en: r[3].split("|").map(function (x) { return x + " {V:ing}."; }),
      de: [r[4] + " {V:p" + r[1] + "} gerade."],
      fr: r[5].split("|").map(function (x) { return x + " en train de {V}."; }),
      es: [r[6] + " {V:ger}."] });
  });

  // Werkwoorden voor de open plek {V}: uit de vertaalmotor (ZINC.VERB) en het Nederlandse woordenboek (DICTS.nl).
  // Alleen gewone werkwoorden: geen scheidbare ("anrufen", "get up") of wederkerende ("sich setzen", "s'asseoir").
  var WW = null;
  function werkwoorden() {
    if (WW) return WW;
    var Z = typeof ZINC !== "undefined" ? ZINC : null, D = typeof DICTS !== "undefined" && DICTS.nl ? DICTS.nl : null;
    if (!Z || !Z.VERB) return null;
    WW = { vorm: {}, uit: {} };
    TALEN.forEach(function (lg) { WW.vorm[lg] = {}; });
    var nlVan = {};
    // Nederlandse infinitieven die in het woordenboek ontbreken of daar als zelfstandig naamwoord staan ("eten" = comida)
    var NL_EXTRA = { comer: "eten", creer: "geloven", comprender: "begrijpen", reservar: "reserveren", mostrar: "laten zien", romper: "breken",
      sufrir: "lijden", aconsejar: "aanraden", temer: "vrezen", morir: "sterven", seguir: "volgen", probar: "proberen", preferir: "verkiezen",
      enviar: "sturen", nacer: "geboren worden", "soñar": "dromen", luchar: "vechten", informar: "informeren", tratar: "behandelen", convencer: "overtuigen", amar: "liefhebben", comenzar: "beginnen" };
    Object.keys(NL_EXTRA).forEach(function (l) { if (!/\s/.test(NL_EXTRA[l])) nlVan[l] = NL_EXTRA[l]; });
    if (D) Object.keys(D).forEach(function (k) { if (/^[a-z]+en$/.test(k) && typeof D[k] === "string" && Z.VERB[D[k]] && !nlVan[D[k]]) nlVan[D[k]] = k; });
    function zet(lg, soort, vorm, lemma) {
      if (!vorm) return;
      var k = woorden(vorm, lg).join(" ");
      WW.vorm[lg][soort] = WW.vorm[lg][soort] || {};
      if (k && !(k in WW.vorm[lg][soort])) WW.vorm[lg][soort][k] = lemma;
    }
    Object.keys(Z.VERB).forEach(function (lemma) {
      var v = Z.VERB[lemma];
      if (/se$/.test(lemma) || !v.en || !v.de || !v.fr || v.de.sep || v.en.tail || v.de.refl || v.fr.refl || !v.en.b || !nlVan[lemma]) return;
      if (/\s/.test(v.en.b) || /\s/.test(v.de.inf) || /\s/.test(v.fr.inf)) return;
      var u = { nl: { "": nlVan[lemma] }, en: { "": v.en.b, ing: Z.enIng(v.en) }, de: { "": v.de.inf }, fr: { "": v.fr.inf }, es: { "": lemma, ger: Z.esGer(lemma) } };
      for (var p = 0; p < 6; p++) {
        try { u.de["p" + p] = Z.dePres(v.de, p); } catch (e) { }
        try { u.fr["p" + p] = Z.frPres(v.fr, p); } catch (e) { }
        try { u.es["p" + p] = Z.esForm(lemma, "pres", p); } catch (e) { }
      }
      WW.uit[lemma] = u;
      TALEN.forEach(function (lg) { Object.keys(u[lg]).forEach(function (soort) { zet(lg, soort, u[lg][soort], lemma); }); });
    });
    return WW;
  }

  // Opzoektabellen per taal: vaste zinnen (sleutel + vraag/geen vraag) en zinnen met open plekken
  var VAST = {}, SJAB = {};
  TALEN.forEach(function (lg) { VAST[lg] = {}; SJAB[lg] = []; });
  BET.forEach(function (b, bi) {
    TALEN.forEach(function (lg) {
      (b[lg] || []).forEach(function (alt) {
        beideGeslachten(alt).forEach(function (v) {
          if (heeftSlot(v)) {
            var ws = woorden(v.replace(/\{P(:dat)?\}/g, function (_, d) { return d ? " {pdat} " : " {pp} "; }).replace(/\{N\}/g, " {n} ").replace(/\{X\}/g, " {x} ")
              .replace(/\{V(?::(\w+))?\}/g, function (_, t) { return " vslot" + (t || "") + " "; }), lg);
            SJAB[lg].push({ b: bi, w: ws, q: isVraag(v) });
          } else {
            var k = woorden(v, lg).join(" ") + (isVraag(v) ? "?" : "");
            if (!(k in VAST[lg])) VAST[lg][k] = bi;
          }
        });
      });
    });
  });

  function vulSjabloon(sjab, ws, lg, origWoorden) {
    var w = sjab.w, gevonden = {}, i = 0, j = 0;
    for (i = 0; i < w.length; i++, j++) {
      var t = w[i];
      if (t === "{pp}" || t === "{pdat}") {
        var tab = PRON_IN[lg][t === "{pdat}" ? "dat" : "pp"] || PRON_IN[lg].pp;
        if (j >= ws.length || !(ws[j] in tab)) return null;
        gevonden.p = tab[ws[j]];
      } else if (/^vslot/.test(t)) {
        var W = werkwoorden(), soort = t.slice(5);
        if (!W || j >= ws.length || !W.vorm[lg][soort] || !(ws[j] in W.vorm[lg][soort])) return null;
        gevonden.v = W.vorm[lg][soort][ws[j]];
      } else if (t === "{n}") {
        if (j >= ws.length || !/^\d{1,3}$/.test(ws[j])) return null;
        gevonden.n = ws[j];
      } else if (t === "{x}") {
        var rest = ws.length - j;
        if (i !== w.length - 1 || rest < 1 || rest > 3) return null;
        gevonden.x = origWoorden.slice(origWoorden.length - rest).join(" ");
        j = ws.length; i = w.length; break;
      } else if (ws[j] !== t) return null;
    }
    return j === ws.length ? gevonden : null;
  }

  function maakUit(b, naar, g, slot) {
    var uit = (b[naar] || [])[0];
    if (!uit) return null;
    uit = geslacht(uit, g);
    if (slot) {
      uit = uit.replace(/\{P(:dat)?\}/g, function (_, d) {
        var lijst = PRON_UIT[naar][d ? "dat" : "pp"] || PRON_UIT[naar].pp;
        return lijst[slot.p];
      }).replace(/\{N\}/g, slot.n || "").replace(/\{X\}/g, slot.x || "").replace(/\{V(?::(\w+))?\}/g, function (_, t) {
        var W = werkwoorden(), u = W && slot.v && W.uit[slot.v];
        return u && u[naar] && u[naar][t || ""] ? u[naar][t || ""] : "\u0000";
      });
      if (uit.indexOf("\u0000") >= 0) return null;
      // getal 1: enkelvoud ("1 year", "einem Jahr", "1 an", "1 año")
      if (slot.n === "1") uit = uit.replace(/\b1 years\b/, "1 year").replace(/\bseit 1 Jahren\b/, "seit einem Jahr").replace(/\b1 ans\b/, "1 an").replace(/\b1 años\b/, "1 año").replace(/\b1 Jahre\b/, "1 Jahr");
      if (/^¿\S/.test(uit)) uit = uit.replace(/^¿(\S)/, function (_, c) { return "¿" + c.toUpperCase(); });
      if (naar === "fr") uit = uit.replace(/\bde ([aeiouéèêhœ])/gi, "d'$1");
      if (naar === "es") uit = uit.replace(/\bcon mí\b/g, "conmigo").replace(/\bcon ti\b/g, "contigo");
      if (naar === "fr") uit = uit.replace(/\bde (elle|elles|eux)\b/g, "d'$1");
    }
    return uit;
  }

  function zoek(tekst, van) {
    if (!VAST[van]) return null;
    var ws = woorden(tekst, van), q = isVraag(tekst), k = ws.join(" ");
    if (!k) return null;
    var open = !/[.!?]\s*$/.test(String(tekst).trim());
    var kandidaten = [k + (q ? "?" : "")];
    if (open && !q) kandidaten.push(k + "?");
    for (var c = 0; c < kandidaten.length; c++) if (kandidaten[c] in VAST[van]) return { b: BET[VAST[van][kandidaten[c]]], slot: null };
    var orig = String(tekst).replace(/[.!?¿¡,]+/g, " ").trim().split(/\s+/);
    for (var s = 0; s < SJAB[van].length; s++) {
      var sj = SJAB[van][s];
      if (sj.q !== q && !(open && !q)) continue;
      var slot = vulSjabloon(sj, ws, van, orig);
      if (slot) return { b: BET[sj.b], slot: slot };
    }
    return null;
  }

  // Vertaal een hele zin via de bank; null als de zin er niet in staat
  function vertaal(tekst, van, naar, g) {
    if (!tekst || van === naar || !VAST[van] || !VAST[naar]) return null;
    g = g === "f" ? "f" : "m";
    var h = zoek(tekst, van);
    if (h) return maakUit(h.b, naar, g, h.slot);
    // Met "alsjeblieft / please / bitte …" erachter: de zin zonder dat woord opzoeken en het woord in de doeltaal terugzetten
    var gm = String(tekst).trim().match(GRAAG_IN[van]);
    if (gm && gm.index > 0) {
      var kaal = String(tekst).trim().slice(0, gm.index) + (isVraag(tekst) ? "?" : ".");
      var h2 = zoek(kaal, van);
      if (h2 && h2.b.id !== "alsjeblieft") {
        var u = maakUit(h2.b, naar, g, h2.slot);
        if (!u) return null;
        var m = u.match(/^(.*?)\s*([.!?]*)$/), p = m[2] || ".";
        return m[1] + ", " + GRAAG_UIT[naar] + (naar === "fr" && /[?!]/.test(p) ? " " : "") + p;
      }
    }
    return null;
  }

  var api = { vertaal: vertaal, woorden: woorden, lijst: BET, talen: TALEN, _zoek: zoek, _werkwoorden: werkwoorden };
  if (typeof window !== "undefined") window.BETEKENIS = api;
  if (typeof globalThis !== "undefined") globalThis.BETEKENIS = api;
})();
