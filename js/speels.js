/* Speels gedrag: de onderste balk verdwijnt en komt terug met een veeg omhoog, en de mascotte
   reageert op het gesprek. Raakt de logica van de app niet aan. */
(function () {
  var nav = document.getElementById("nav");
  if (!nav) return;

  // ---------- Mascotte (uil) in de koptekst ----------
  var brand = document.querySelector("header.top .brand");
  var owl = document.createElement("div");
  owl.id = "owl";
  owl.setAttribute("aria-hidden", "true");
  owl.innerHTML =
    '<svg viewBox="0 0 64 64" width="52" height="52">' +
    '<path d="M13 26 Q10 8 24 12 Q29 14 30 24 Z M51 26 Q54 8 40 12 Q35 14 34 24 Z" fill="var(--p)" stroke="var(--ink-k)" stroke-width="3" stroke-linejoin="round"/>' +
    '<ellipse cx="32" cy="36" rx="22" ry="24" fill="var(--p)" stroke="var(--ink-k)" stroke-width="3"/>' +
    '<ellipse cx="32" cy="44" rx="13" ry="13" fill="var(--card)" stroke="var(--ink-k)" stroke-width="2.5"/>' +
    '<g class="eyes-open eye-blink">' +
      '<circle cx="23" cy="28" r="9" fill="#fff" stroke="var(--ink-k)" stroke-width="2.5"/>' +
      '<circle cx="41" cy="28" r="9" fill="#fff" stroke="var(--ink-k)" stroke-width="2.5"/>' +
      '<circle cx="24" cy="29" r="4" fill="var(--ink-k)"/><circle cx="42" cy="29" r="4" fill="var(--ink-k)"/>' +
    '</g>' +
    '<g class="eyes-happy">' +
      '<path d="M15 30 Q23 19 31 30" fill="none" stroke="var(--ink-k)" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M33 30 Q41 19 49 30" fill="none" stroke="var(--ink-k)" stroke-width="3.5" stroke-linecap="round"/>' +
    '</g>' +
    '<g class="eyes-oops">' +
      '<circle cx="23" cy="30" r="9" fill="#fff" stroke="var(--ink-k)" stroke-width="2.5"/>' +
      '<circle cx="41" cy="30" r="9" fill="#fff" stroke="var(--ink-k)" stroke-width="2.5"/>' +
      '<circle cx="23" cy="31" r="4" fill="var(--ink-k)"/><circle cx="41" cy="31" r="4" fill="var(--ink-k)"/>' +
      '<path d="M13 19 L27 23 M51 19 L37 23" stroke="var(--ink-k)" stroke-width="3" stroke-linecap="round"/>' +
    '</g>' +
    '<path d="M28 38 L36 38 L32 44 Z" fill="#ffb703" stroke="var(--ink-k)" stroke-width="2.5" stroke-linejoin="round"/>' +
    '</svg>';
  if (brand) brand.insertBefore(owl, brand.querySelector("h1"));

  // ---------- Installeren: alleen op de Info-pagina, en alleen met toestemming van de gebruiker ----------
  var deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferredPrompt = e; fillInstall(); });
  window.addEventListener("appinstalled", function () { deferredPrompt = null; fillInstall(); });
  var INSTALL_TXT = {
    nl: { title: "Zet de app op je telefoon", android: "Installeer de app, dan staat hij als eigen app op je beginscherm.", button: "Installeer de app",
          ios: ["Open deze pagina in Safari.", "Tik onderin op het deelicoon.", "Kies 'Zet op beginscherm'."],
          android: ["Open deze pagina in Chrome.", "Tik rechtsboven op de drie puntjes.", "Kies 'App installeren' of 'Toevoegen aan startscherm'."] },
    en: { title: "Put the app on your phone", android: "Install the app so it sits on your home screen like its own app.", button: "Install the app",
          ios: ["Open this page in Safari.", "Tap the share icon at the bottom.", "Choose 'Add to Home Screen'."],
          android: ["Open this page in Chrome.", "Tap the three dots at the top right.", "Choose 'Install app' or 'Add to Home screen'."] },
    de: { title: "App auf dein Telefon legen", android: "Installiere die App, damit sie wie eine eigene App auf dem Startbildschirm liegt.", button: "App installieren",
          ios: ["Öffne diese Seite in Safari.", "Tippe unten auf das Teilen-Symbol.", "Wähle 'Zum Home-Bildschirm'."],
          android: ["Öffne diese Seite in Chrome.", "Tippe oben rechts auf die drei Punkte.", "Wähle 'App installieren' oder 'Zum Startbildschirm hinzufügen'."] },
    es: { title: "Pon la app en tu teléfono", android: "Instala la app para que aparezca en tu pantalla de inicio como una app propia.", button: "Instalar la app",
          ios: ["Abre esta página en Safari.", "Toca el icono de compartir, abajo.", "Elige «Añadir a pantalla de inicio»."],
          android: ["Abre esta página en Chrome.", "Toca los tres puntos, arriba a la derecha.", "Elige «Instalar aplicación» o «Añadir a pantalla de inicio»."] },
    fr: { title: "Installer l'application sur ton téléphone", android: "Installe l'application pour qu'elle apparaisse sur ton écran d'accueil comme une vraie application.", button: "Installer l'application",
          ios: ["Ouvre cette page dans Safari.", "Touche l'icône de partage en bas.", "Choisis « Sur l'écran d'accueil »."],
          android: ["Ouvre cette page dans Chrome.", "Touche les trois points en haut à droite.", "Choisis « Installer l'application » ou « Ajouter à l'écran d'accueil »."] }
  };
  function isStandalone() { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
  function isIOSDevice() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); }
  function fillInstall() {
    var slot = document.getElementById("installSlot");
    if (!slot || slot.childElementCount) return;
    if (isStandalone()) return;
    // Op telefoons zorgt de melding (showHomeNotice) voor de uitleg; de kaart op de Info-pagina is dan overbodig
    if (isIOSDevice() || /Android/i.test(navigator.userAgent)) return;
    var t = INSTALL_TXT[(document.body.getAttribute("data-lang") || document.body.getAttribute("data-taal")) || "nl"] || INSTALL_TXT.nl;
    var card = document.createElement("div");
    card.className = "card install-card";
    var h = document.createElement("div"); h.className = "sec-title"; h.textContent = t.title; card.appendChild(h);
    if (deferredPrompt) {
      var p = document.createElement("div"); p.textContent = t.android; card.appendChild(p);
      var b = document.createElement("button");
      b.type = "button"; b.className = "btn primary"; b.textContent = t.button;
      b.addEventListener("click", function () {
        var ev = deferredPrompt; deferredPrompt = null;
        ev.prompt();
        ev.userChoice.then(function () { slot.innerHTML = ""; fillInstall(); });
      });
      card.appendChild(b);
    } else if (isIOSDevice() || /Android/i.test(navigator.userAgent)) {
      var steps = isIOSDevice() ? t.ios : t.android;
      var ol = document.createElement("ol"); ol.className = "guide-list";
      steps.forEach(function (s0) { var li = document.createElement("li"); li.textContent = s0; ol.appendChild(li); });
      card.appendChild(ol);
    } else {
      return; // computer zonder installatieaanbod: niets tonen
    }
    slot.appendChild(card);
  }

  // Eenmalige melding in de browser (Safari of Chrome): zet de app op het beginscherm.
  // Na 'Begrepen' komt de melding niet meer terug; de uitleg blijft staan op de Info-pagina.
  // Teksten per browser: Safari (iOS 26: deelknop achter de drie puntjes), Chrome op iPhone (deelicoon in de adresbalk),
  // Chrome op Android (drie puntjes rechtsboven) en andere browsers (daar kan het niet: open de pagina in Safari of Chrome).
  var HOME_TXT = {
    nl: { title: "Zet de app op je beginscherm", body: "Dan opent hij als eigen app.",
          safari: "Tik in Safari op de drie puntjes (•••) naast de adresbalk, kies 'Deel' en daarna 'Zet op beginscherm'. Zie je onderin al het deelicoon, tik daar dan meteen op.",
          chromeIOS: "Tik in Chrome in de adresbalk op het deelicoon en kies 'Zet op beginscherm'.",
          chromeAndroid: "Tik in Chrome rechtsboven op de drie puntjes en kies de optie om de app te installeren of aan je startscherm toe te voegen.",
          iosAnders: "In deze browser kan dat niet. Open deze pagina in Safari of Chrome en zet hem daar op je beginscherm.",
          androidAnders: "Open deze pagina in Chrome en zet hem daar op je startscherm.",
          install: "Installeer de app", ok: "Begrepen",
          opnieuw: "Nieuwe versie: zet de app opnieuw op je beginscherm", verwijder: "Houd het oude icoon ingedrukt en verwijder het. Daarna:" },
    en: { title: "Put the app on your home screen", body: "Then it opens like its own app.",
          safari: "In Safari, tap the three dots (•••) next to the address bar, choose 'Share' and then 'Add to Home Screen'. If you already see the share icon at the bottom, tap that instead.",
          chromeIOS: "In Chrome, tap the share icon in the address bar and choose 'Add to Home Screen'.",
          chromeAndroid: "In Chrome, tap the three dots at the top right and choose the option to install the app or add it to your home screen.",
          iosAnders: "This browser can't do that. Open this page in Safari or Chrome and add it to your home screen there.",
          androidAnders: "Open this page in Chrome and add it to your home screen there.",
          install: "Install the app", ok: "Got it",
          opnieuw: "New version: put the app on your home screen again", verwijder: "Press and hold the old icon and remove it. Then:" },
    de: { title: "Leg die App auf deinen Home-Bildschirm", body: "Dann öffnet sie sich wie eine eigene App.",
          safari: "Tippe in Safari auf die drei Punkte (•••) neben der Adressleiste, wähle 'Teilen' und dann 'Zum Home-Bildschirm'. Siehst du unten schon das Teilen-Symbol, tippe direkt darauf.",
          chromeIOS: "Tippe in Chrome in der Adressleiste auf das Teilen-Symbol und wähle 'Zum Home-Bildschirm'.",
          chromeAndroid: "Tippe in Chrome oben rechts auf die drei Punkte und wähle die Option, die App zu installieren oder zum Startbildschirm hinzuzufügen.",
          iosAnders: "In diesem Browser geht das nicht. Öffne diese Seite in Safari oder Chrome und lege sie dort auf den Home-Bildschirm.",
          androidAnders: "Öffne diese Seite in Chrome und lege sie dort auf den Startbildschirm.",
          install: "App installieren", ok: "Verstanden",
          opnieuw: "Neue Version: Lege die App erneut auf deinen Home-Bildschirm", verwijder: "Halte das alte Symbol gedrückt und entferne es. Danach:" },
    fr: { title: "Mets l'app sur ton écran d'accueil", body: "Elle s'ouvrira alors comme une vraie application.",
          safari: "Dans Safari, touche les trois points (•••) à côté de la barre d'adresse, choisis « Partager » puis « Sur l'écran d'accueil ». Si tu vois déjà l'icône de partage en bas, touche-la directement.",
          chromeIOS: "Dans Chrome, touche l'icône de partage dans la barre d'adresse et choisis « Sur l'écran d'accueil ».",
          chromeAndroid: "Dans Chrome, touche les trois points en haut à droite et choisis l'option pour installer l'application ou l'ajouter à l'écran d'accueil.",
          iosAnders: "Ce navigateur ne le permet pas. Ouvre cette page dans Safari ou Chrome et ajoute-la là à ton écran d'accueil.",
          androidAnders: "Ouvre cette page dans Chrome et ajoute-la là à ton écran d'accueil.",
          install: "Installer l'application", ok: "Compris",
          opnieuw: "Nouvelle version : remets l'app sur ton écran d'accueil", verwijder: "Maintiens l'ancienne icône appuyée et supprime-la. Ensuite :" },
    es: { title: "Pon la app en tu pantalla de inicio", body: "Así se abrirá como una app propia.",
          safari: "En Safari, toca los tres puntos (•••) junto a la barra de direcciones, elige «Compartir» y después «Añadir a pantalla de inicio». Si ya ves el icono de compartir abajo, tócalo directamente.",
          chromeIOS: "En Chrome, toca el icono de compartir en la barra de direcciones y elige «Añadir a pantalla de inicio».",
          chromeAndroid: "En Chrome, toca los tres puntos arriba a la derecha y elige la opción para instalar la app o añadirla a la pantalla de inicio.",
          iosAnders: "Este navegador no lo permite. Abre esta página en Safari o Chrome y añádela allí a tu pantalla de inicio.",
          androidAnders: "Abre esta página en Chrome y añádela allí a tu pantalla de inicio.",
          install: "Instalar la app", ok: "Entendido",
          opnieuw: "Nueva versión: vuelve a poner la app en tu pantalla de inicio", verwijder: "Mantén pulsado el icono antiguo y elimínalo. Después:" }
  };
  // Welke browser: alleen echte Safari en Chrome kunnen een pagina op het beginscherm zetten
  function browserSoort() {
    var ua = navigator.userAgent || "";
    if (isIOSDevice()) {
      if (/CriOS\//.test(ua)) return "chromeIOS";
      if (/Safari\//.test(ua) && !/FxiOS|EdgiOS|OPiOS|OPT\/|YaBrowser|GSA\/|FBAN|FBAV|Instagram|Line\/|DuckDuckGo|Brave|Snapchat|WhatsApp/i.test(ua)) return "safari";
      return "iosAnders";
    }
    if (/Android/i.test(ua)) {
      if (/Chrome\/\d/.test(ua) && !/; wv\)|SamsungBrowser|EdgA|OPR\/|Firefox|YaBrowser|Brave|UCBrowser|MiuiBrowser|DuckDuckGo|Instagram|FBAN|FBAV|Version\/\d/i.test(ua)) return "chromeAndroid";
      return "androidAnders";
    }
    return null;
  }
  // Taal van de melding: de taal van de telefoon; staat die er niet bij, dan de taal van de app
  function meldingTaal() {
    var ls = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < ls.length; i++) { var c = String(ls[i] || "").slice(0, 2).toLowerCase(); if (HOME_TXT[c]) return c; }
    var d = (document.body.getAttribute("data-lang") || document.body.getAttribute("data-taal"));
    return HOME_TXT[d] ? d : "nl";
  }
  // Voor de melding bij een nieuwe versie (app.js): zelfde taal en dezelfde stap voor deze browser als de melding hieronder
  window.THUIS_MELDING = function () {
    var t = HOME_TXT[meldingTaal()], soort = browserSoort();
    return { titel: t.opnieuw, tekst: t.verwijder + " " + (t[soort] || (isIOSDevice() ? t.safari : t.chromeAndroid)), ok: t.ok };
  };
  var HOME_KEY = "thuisMeldingGezien";
  function showHomeNotice() {
    if (isStandalone()) return;
    try { if (localStorage.getItem(HOME_KEY)) return; } catch (e) {}
    if (document.querySelector(".thuis-note")) return;
    var ios = isIOSDevice(), android = /Android/i.test(navigator.userAgent);
    if (!ios && !android && !deferredPrompt) return;   // computer: geen melding
    var t = HOME_TXT[meldingTaal()], soort = browserSoort();
    var box = document.createElement("div");
    box.className = "card reinstall-note thuis-note";
    box.setAttribute("role", "dialog");
    var h = document.createElement("div"); h.className = "sec-title"; h.textContent = t.title; box.appendChild(h);
    var p = document.createElement("div"); p.textContent = t.body; box.appendChild(p);
    if (!deferredPrompt || ios) {
      var ol = document.createElement("ol"); ol.className = "guide-list";
      var li = document.createElement("li"); li.textContent = t[soort] || (ios ? t.safari : t.chromeAndroid); ol.appendChild(li);
      box.appendChild(ol);
    }
    function klaar() { try { localStorage.setItem(HOME_KEY, "1"); } catch (e) {} if (box.parentNode) box.parentNode.removeChild(box); }
    if (deferredPrompt && !ios) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "btn primary"; b.textContent = t.install;
      b.addEventListener("click", function () {
        var ev = deferredPrompt; deferredPrompt = null;
        ev.prompt();
        ev.userChoice.then(function () { klaar(); fillInstall(); });
      });
      box.appendChild(b);
    }
    var ok = document.createElement("button");
    ok.type = "button"; ok.className = "btn"; ok.textContent = t.ok; ok.addEventListener("click", klaar);
    box.appendChild(ok);
    document.body.appendChild(box);
  }
  setTimeout(showHomeNotice, 1200);
  window.addEventListener("beforeinstallprompt", function () { setTimeout(showHomeNotice, 300); });

  // Hoogte van koptekst en onderste balk, zodat de vaste tabbladen en de ruimte onderaan kloppen
  var header = document.querySelector("header.top");
  var root = document.documentElement;
  function measure() {
    if (header) root.style.setProperty("--hh", header.offsetHeight + "px");
    root.style.setProperty("--navh", nav.offsetHeight + "px");
  }
  measure();
  window.addEventListener("resize", measure);
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(measure);
    if (header) ro.observe(header);
    ro.observe(nav);
  }

  var moodTimer = null;
  function setMood(m, ms) {
    owl.className = "mood-" + m;
    clearTimeout(moodTimer);
    if (ms) moodTimer = setTimeout(function () { owl.className = "mood-idle"; }, ms);
  }
  owl.className = "mood-idle";
  owl.addEventListener("click", function () { setMood("happy", 1400); });

  // Reageer op nieuwe beurten (blij), fouten (verward) en opnemen (oplettend)
  var lastTurns = document.querySelectorAll(".turn").length;
  var lastBad = "";
  var obs = new MutationObserver(function () {
    var turns = document.querySelectorAll(".turn").length;
    if (turns > lastTurns) setMood("happy", 1600);
    lastTurns = turns;
    var bad = document.querySelector(".bad");
    var badTxt = bad ? bad.textContent : "";
    if (badTxt && badTxt !== lastBad) setMood("oops", 2200);
    lastBad = badTxt;
    fillInstall();
    if (document.querySelector(".btn.mic.rec, .btn.rec")) { if (owl.className !== "mood-think") setMood("think"); }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  // ---------- Onderste balk, Vastlopen, Zinnen en Gesprek ----------
  // Verdwijnen bij een paginawissel, bij een tik op een leeg stuk van de pagina en bij scrollen.
  // Komen terug als je onderaan de pagina bent, of met een tik op het belletje.
  // Het belletje blijft altijd zichtbaar, ook over de pagina's heen.
  // Het belletje is de knop van de geselecteerde pagina; app.js vult de tekst (renderNav) en maakt hem aan als hij ontbreekt
  var handle = document.getElementById("navHandle");
  if (!handle) {
    handle = document.createElement("button");
    handle.id = "navHandle";
    handle.type = "button";
    handle.setAttribute("aria-label", "Menu tonen");
    document.body.appendChild(handle);
  }

  // Drie standen: alles zichtbaar; alleen de onderste rij (aan het einde van de pagina); alles verborgen
  function hideChrome() { document.body.classList.remove("nav-end"); document.body.classList.add("nav-away"); }
  function showEnd() { document.body.classList.remove("nav-away"); document.body.classList.add("nav-end"); }
  function showChrome() { document.body.classList.remove("nav-away", "nav-end"); }
  window.speelsHideChrome = hideChrome;   // app.js roept dit aan bij paginawissel en bij een tik op de pagina
  // Scrollen verbergt de knoppen; alleen onderaan de pagina komen ze terug
  var lastScrollY = window.scrollY;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (Math.abs(y - lastScrollY) < 4) return;
    lastScrollY = y;
    var atEnd = y + window.innerHeight >= document.documentElement.scrollHeight - 8;
    if (atEnd) showEnd(); else hideChrome();
  }, { passive: true });
  handle.addEventListener("click", showChrome);
})();
