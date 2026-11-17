// Maakt een opname schoner voordat de spraakherkenning ernaar luistert.
// Alleen de netbrom wordt weggefilterd: notches op 50 en 60 Hz met hun eerste harmonischen.
// Getest met twee echte opnames uit rumoerige omgevingen (Healthy en Food at school): de harmonischen
// op 100 tot 150 Hz daalden met 6 tot 7 dB, de brom op 50 Hz met 2 dB, en het spraakniveau bleef gelijk.
// Een ruisdemper (gate) en een hoogdoorlaatfilter zijn bewust NIET toegepast: bij de test verlaagden ze de
// herkenning licht en kunnen zachte of verre sprekers wegfilteren. Een hoogdoorlaatfilter bij 100 Hz is ook
// getest: neutraal, dus niet toegepast.
(function () {
  var SR_DEFAULT = 16000;

  // Biquad-coëfficiënten (RBJ-cookbook), geleverd als [b0,b1,b2,a1,a2] met a0 = 1
  function coefNotch(fc, sr, q) {
    var w = 2 * Math.PI * fc / sr, c = Math.cos(w), al = Math.sin(w) / (2 * q);
    var a0 = 1 + al;
    return [1 / a0, -2 * c / a0, 1 / a0, -2 * c / a0, (1 - al) / a0];
  }
  function applyBiquad(x, k) {
    var y = new Float64Array(x.length), x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (var i = 0; i < x.length; i++) {
      var v = k[0] * x[i] + k[1] * x1 + k[2] * x2 - k[3] * y1 - k[4] * y2;
      y[i] = v; x2 = x1; x1 = x[i]; y2 = y1; y1 = v;
    }
    return y;
  }

  function filterChain(x, sr) {
    var y = x;
    // Netstroom: 50 Hz (Europa) en 60 Hz (VS) met de eerste harmonischen
    [50, 100, 150, 200, 60, 120, 180].forEach(function (f) {
      if (f < sr / 2 - 100) y = applyBiquad(y, coefNotch(f, sr, 25));
    });
    return y;
  }

  window.SpraakSchoon = {
    clean: function (samples, sr) {
      sr = sr || SR_DEFAULT;
      if (!samples || !samples.length) return samples;
      var out = filterChain(samples, sr), res = new Float32Array(out.length);
      for (var i = 0; i < out.length; i++) res[i] = out[i];
      return res;
    }
  };
})();
