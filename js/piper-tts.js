// Natuurlijke stem met Piper (open source, gratis, draait in de browser op het toestel).
// Eerste keer per taal wordt het stemmodel (±60 MB) eenmalig gedownload en daarna bewaard.
// Zolang het model nog niet klaar is, of als Piper faalt, spreekt de app met de ingebouwde stem.
(function () {
  // Stemmen met een vrije licentie (CC0, CC BY 4.0 of public domain). Zie README voor de vermelding.
  var VOICES = {
    nl: "nl_NL-pim-medium",
    de: "de_DE-thorsten-medium",
    fr: "fr_FR-siwis-medium",
    en: "en_US-joe-medium",
    es: "es_ES-davefx-medium"
  };
  var ready = {}, warming = {}, failed = {}, chain = Promise.resolve(), cur = null;
  // Pas na toestemming (Instellingen > Natuurlijke stem) wordt het stemmodel gedownload. Zonder toestemming
  // gebruikt de app de ingebouwde stem van het toestel en maakt Piper geen contact met internet.
  var allowed = false;
  function setAllowed(b) { allowed = !!b; }
  // Elke nieuwe zin krijgt een volgnummer. Een zin die later klaar is dan een nieuwere, wordt niet meer
  // afgespeeld: zo lopen twee voorbeelden nooit door elkaar.
  var gen = 0;

  function available(voice) {
    return !failed[voice] && !!window.PIPER && typeof window.PIPER.predict === "function" && typeof WebAssembly !== "undefined";
  }

  // Alle synthese-aanvragen één voor één, zodat de werker niet door elkaar loopt.
  function synth(text, voice, progress) {
    chain = chain.then(function () { return window.PIPER.predict({ text: text, voiceId: voice }, progress); });
    return chain;
  }

  // Stemmodel downloaden en klaarzetten, met voortgang: onProgress(0..1), onDone(true/false)
  var luisteraars = {};
  function prepare(code, onProgress, onDone) {
    var voice = VOICES[code];
    if (!voice || !available(voice)) { if (onDone) onDone(false); return; }
    if (ready[voice]) { if (onDone) onDone(true); return; }
    (luisteraars[voice] = luisteraars[voice] || []).push({ p: onProgress, d: onDone });
    if (warming[voice]) return;
    warming[voice] = true;
    var files = {};
    function meld(type, waarde) { (luisteraars[voice] || []).forEach(function (l) { var f = l[type]; if (f) try { f(waarde); } catch (e) {} }); }
    synth("Hola.", voice, function (pr) {
      if (!pr || !pr.url || !pr.total) return;
      files[pr.url] = [pr.loaded || 0, pr.total];
      var l = 0, t = 0;
      for (var k in files) { l += files[k][0]; t += files[k][1]; }
      meld("p", t ? l / t : 0);
    }).then(function () {
      ready[voice] = true; warming[voice] = false; meld("d", true); luisteraars[voice] = [];
    }, function () {
      failed[voice] = true; warming[voice] = false; meld("d", false); luisteraars[voice] = [];
    });
  }
  function isReady(code) { return !!ready[VOICES[code]]; }

  function stop() {
    gen++;
    if (cur) { try { cur.pause(); } catch (e) {} cur = null; }
  }

  // Geeft true terug als Piper de zin afspeelt. Anders false: de aanroeper gebruikt dan de ingebouwde stem.
  // De ingebouwde stem wordt ook gebruikt als het afspelen zelf mislukt (fallback).
  function speak(text, code, rate, fallback) {
    var voice = VOICES[code];
    if (!allowed || !voice || !available(voice)) return false;
    if (!ready[voice]) { prepare(code); return false; }
    stop();
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) {}
    var mijn = gen;
    synth(text, voice).then(function (blob) {
      if (mijn !== gen) return;        // intussen is er een andere zin gevraagd
      var url = URL.createObjectURL(blob);
      var a = new Audio(url);
      a.playbackRate = Math.min(1.5, Math.max(0.5, rate || 1));
      cur = a;
      a.onended = function () { URL.revokeObjectURL(url); if (cur === a) cur = null; };
      return a.play();
    }).catch(function () {
      if (mijn === gen && fallback) fallback();
    });
    return true;
  }

  window.PiperTTS = { speak: speak, stop: stop, voices: VOICES, setAllowed: setAllowed, prepare: prepare, isReady: isReady };
})();
