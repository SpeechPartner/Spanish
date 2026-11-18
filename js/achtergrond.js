// Achtergrondband onderaan de pagina: silhouetten van gezichten in de kleuren van het gekozen thema.
// img/achtergrond-kaart.png is een kleurenkaart van de oorspronkelijke afbeelding (elf vlakkleuren).
// Per pixel: rood = kleur i * 16 + kleur j, groen = mengverhouding tussen i en j (voor zachte randen).
// Hier wordt elke oorspronkelijke kleur vervangen door een themakleur: donker blijft donker, licht blijft licht.
var ACHTERGROND = (function () {
  // De elf oorspronkelijke kleuren, in dezelfde volgorde als bij het maken van de kaart
  var BASE = ["#5c007d", "#01046d", "#0179b6", "#00808d", "#31c9ba", "#febd01", "#f6cd57", "#ff6300", "#f70906", "#de002f", "#f50163"];
  // Themakleuren (van donker naar licht). Elk palet bevat de drie knopkleuren van het thema (--bt1, --bt2, --bt3),
  // aangevuld met de overige themakleuren.
  var PAL = {
    "standaard-nl": ["#111111", "#21468B", "#7d121c", "#AE1C28", "#2f5fb3", "#D62B3A", "#e35a66", "#6f8fd0", "#f08a94", "#dfe8fb", "#fde3e6"],
    "standaard-en": ["#111111", "#ffffff", "#012169", "#8a0b20", "#C8102E", "#2b4a9e", "#e03a52", "#5a76c2", "#ee7a8b", "#9fb3e4", "#dfe6f7", "#f9dde1"],
    "standaard-de": ["#000000", "#2b2b2b", "#7a0000", "#a30000", "#DD0000", "#ff3b1f", "#ff7a3c", "#e0a800", "#FFCE00", "#ffe066", "#fff4cc"],
    "standaard-fr": ["#111111", "#002395", "#8f0f1a", "#b5111f", "#2d4fc4", "#ED2939", "#f25563", "#6d86dc", "#f5939c", "#dfe5f7", "#fbdde0"],
    cafe: ["#3b2a1e", "#5a3a26", "#6b4423", "#8b4a2b", "#a0613d", "#b9784f", "#c99a6e", "#dccab0", "#e8cfa8", "#f0dfc4", "#f8ecd8"],
    ijs: ["#0d2b45", "#174a73", "#2a6fa8", "#2a7fd4", "#3b8fd9", "#5aa9e6", "#7fbfe0", "#a9dcf6", "#bfe9ff", "#d4ebf7", "#e6f7ff"],
    jungle: ["#173a1f", "#2f6b33", "#7a2a12", "#c24a2b", "#4f9a3a", "#e4572e", "#7cb342", "#ec8a5c", "#f6c744", "#d9f2c2", "#e0b13a"],
    ruimte: ["#17153d", "#2b2766", "#5a45a0", "#c94a7a", "#ff5d8f", "#20b5cc", "#ff8fb1", "#c9a52f", "#ffd23f", "#c9c3ff", "#ffe88a"],
    donker: ["#1c1834", "#2d2656", "#2a2148", "#433a78", "#5a45a0", "#6e52b8", "#7f67d6", "#b05688", "#9d95bd", "#b8a9e8", "#d0c6f2"]
  };
  function rgb(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function lum(c) { return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; }
  var base = BASE.map(rgb);
  var baseRank = base.map(function (c, i) { return i; }).sort(function (a, b) { return lum(base[a]) - lum(base[b]); });
  var map = null, W = 0, H = 0, loading = null, cache = {}, wanted = null;

  function load() {
    if (loading) return loading;
    loading = new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        W = img.naturalWidth; H = img.naturalHeight;
        var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
        var cx = cv.getContext("2d");
        cx.drawImage(img, 0, 0);
        map = cx.getImageData(0, 0, W, H).data;
        resolve();
      };
      img.onerror = reject;
      img.src = "img/achtergrond-kaart.png";
    });
    return loading;
  }
  // Elke oorspronkelijke kleur krijgt de themakleur met dezelfde plaats in de volgorde van donker naar licht
  function paletteFor(key) {
    var pal = (PAL[key] || PAL["standaard-nl"]).map(rgb).sort(function (a, b) { return lum(a) - lum(b); });
    var out = [];
    baseRank.forEach(function (bi, rank) { out[bi] = pal[Math.min(rank, pal.length - 1)]; });
    return out;
  }
  function paint(key) {
    if (cache[key]) return Promise.resolve(cache[key]);
    return load().then(function () {
      var pal = paletteFor(key);
      var cv = document.createElement("canvas"); cv.width = W; cv.height = H;
      var cx = cv.getContext("2d");
      var out = cx.createImageData(W, H), d = out.data;
      for (var p = 0; p < d.length; p += 4) {
        var r = map[p], t = map[p + 1] / 255;
        var a = pal[r >> 4] || pal[0], b = pal[r & 15] || a;
        d[p] = a[0] + (b[0] - a[0]) * t;
        d[p + 1] = a[1] + (b[1] - a[1]) * t;
        d[p + 2] = a[2] + (b[2] - a[2]) * t;
        d[p + 3] = 255;
      }
      cx.putImageData(out, 0, 0);
      return new Promise(function (res) {
        if (cv.toBlob) cv.toBlob(function (blob) { res(cache[key] = blob ? URL.createObjectURL(blob) : cv.toDataURL("image/jpeg", 0.85)); }, "image/jpeg", 0.85);
        else res(cache[key] = cv.toDataURL("image/jpeg", 0.85));
      });
    });
  }
  // Zet de band in de kleuren van het thema (key: bijv. "standaard-nl", "cafe", "ijs")
  function set(key) {
    wanted = key;
    var band = document.getElementById("bgBand");
    if (!band) return;
    band.setAttribute("data-key", key);
    paint(key).then(function (url) {
      if (wanted !== key) return;
      band.style.backgroundImage = "url(" + url + ")";
      band.classList.add("on");
    }).catch(function () { band.classList.remove("on"); });
  }
  return { set: set, PAL: PAL, BASE: BASE };
})();
