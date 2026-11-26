// Spraakherkenning in een aparte werker, zodat de app zelf niet vastloopt tijdens laden en verwerken.
let pipe = null;
const files = {};
self.onmessage = async (ev) => {
  const d = ev.data || {};
  try {
    if (d.type === "load") {
      // De software (transformers.js en onnxruntime) staat in de app zelf (js/vendor/whisper), niet op een CDN.
      // Alleen het spraakmodel (gegevens, geen code) komt eenmalig van Hugging Face.
      const base = new URL("./vendor/whisper/", self.location.href).href;
      const lib = await import(base + "transformers.min.js");
      lib.env.allowLocalModels = false;
      lib.env.backends.onnx.wasm.wasmPaths = base;
      pipe = await lib.pipeline("automatic-speech-recognition", d.model, {
        dtype: "q8",
        device: "wasm",
        progress_callback: (p) => {
          if (!p || p.status !== "progress" || !p.total) return;
          files[p.file] = [p.loaded || 0, p.total];
          let l = 0, t = 0;
          for (const k in files) { l += files[k][0]; t += files[k][1]; }
          self.postMessage({ type: "progress", loaded: l, total: t });
        }
      });
      self.postMessage({ type: "ready" });
    } else if (d.type === "run") {
      const opts = { language: d.language || "spanish", task: "transcribe" };
      if (d.audio.length > 30 * 16000) opts.chunk_length_s = 30;
      const out = await pipe(d.audio, opts);
      self.postMessage({ type: "result", id: d.id, text: out && out.text ? String(out.text) : "" });
    }
  } catch (e) {
    self.postMessage({ type: "error", id: d.id, phase: d.type, message: String((e && (e.message || e.name)) || e) });
  }
};
