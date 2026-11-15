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
    var t = INSTALL_TXT[document.body.getAttribute("data-lang") || "nl"] || INSTALL_TXT.nl;
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
  // Knop links van het belletje: toont de pagina waar je op zit (alleen ter info, niet aan te tikken)
  var pageInfo = document.createElement("div");
  pageInfo.id = "pageInfo";
  pageInfo.setAttribute("aria-hidden", "true");
  document.body.appendChild(pageInfo);
  var handle = document.createElement("button");
  handle.id = "navHandle";
  handle.type = "button";
  handle.setAttribute("aria-label", "Menu tonen");
  document.body.appendChild(handle);

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
