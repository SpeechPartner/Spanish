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

  function available(voice) {
    return !failed[voice] && !!window.PIPER && typeof window.PIPER.predict === "function" && typeof WebAssembly !== "undefined";
  }

  // Alle synthese-aanvragen één voor één, zodat de werker niet door elkaar loopt.
  function synth(text, voice) {
    chain = chain.then(function () { return window.PIPER.predict({ text: text, voiceId: voice }); });
    return chain;
  }

  function warm(voice) {
    if (ready[voice] || warming[voice]) return;
    warming[voice] = true;
    synth("Hola.", voice).then(function () {
      ready[voice] = true;
    }, function () {
      failed[voice] = true;
    }).then(function () {
      warming[voice] = false;
    });
  }

  function stop() {
    if (cur) { try { cur.pause(); } catch (e) {} cur = null; }
  }

  // Geeft true terug als Piper de zin afspeelt. Anders false: de aanroeper gebruikt dan de ingebouwde stem.
  // De ingebouwde stem wordt ook gebruikt als het afspelen zelf mislukt (fallback).
  function speak(text, code, rate, fallback) {
    var voice = VOICES[code];
    if (!voice || !available(voice)) return false;
    if (!ready[voice]) { warm(voice); return false; }
    stop();
    synth(text, voice).then(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = new Audio(url);
      a.playbackRate = Math.min(1.5, Math.max(0.5, rate || 1));
      cur = a;
      a.onended = function () { URL.revokeObjectURL(url); if (cur === a) cur = null; };
      return a.play();
    }).catch(function () {
      if (fallback) fallback();
    });
    return true;
  }

  window.PiperTTS = { speak: speak, stop: stop, voices: VOICES };
})();
