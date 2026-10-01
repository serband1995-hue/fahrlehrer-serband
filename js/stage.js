/* ============================================================
   Die Bühne: pro Kapitel ein Hintergrund (Video oder Bild).
   - Videos laufen ruhig in Endlosschleife (vorwärts; das Ende ist weich in den
     Anfang überblendet), nur das aktive Kapitel spielt.
   - Geladen wird erst kurz bevor ein Kapitel kommt.
   - Datensparmodus oder kein Autoplay (z. B. Stromsparmodus): Standbild.
   ============================================================ */
import { CONFIG } from "./config.js";

export function createStage(ids) {
  const root = document.getElementById("stage");
  const portrait = matchMedia("(max-aspect-ratio: 9/10)").matches;
  const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sparen = ruhig || !!(navigator.connection && navigator.connection.saveData);
  const scenes = {};

  ids.forEach((id) => {
    const cfg = CONFIG.szenen[id] || CONFIG.szenen.standard;
    const el = document.createElement("div");
    el.className = "scene";
    el.dataset.id = id;
    const img = document.createElement("img");
    img.alt = "";
    img.decoding = "async";
    img.dataset.src = (portrait && cfg.bildHandy) || cfg.bild;
    if (cfg.fokus) img.style.objectPosition = portrait ? cfg.fokusHandy || cfg.fokus : cfg.fokus;
    el.append(img);
    let video = null;
    const vsrc = !sparen && ((portrait && cfg.videoHandy) || cfg.video);
    if (vsrc) {
      video = document.createElement("video");
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.preload = "none";
      video.dataset.src = vsrc;
      video.style.objectPosition = img.style.objectPosition;
      video.style.opacity = 0;
      el.append(video);
    }
    root.append(el);
    scenes[id] = { el, img, video, loaded: false, ready: false };
  });

  function loadStill(id) {
    const s = scenes[id];
    if (!s || s.still) return;
    s.still = true;
    s.img.src = s.img.dataset.src;
  }

  function load(id) {
    const s = scenes[id];
    if (!s || s.loaded) return;
    s.loaded = true;
    loadStill(id);
    if (!s.video) return;
    s.video.src = s.video.dataset.src;
    s.video.preload = "auto";
    s.video.addEventListener("playing", () => { s.ready = true; s.video.style.opacity = 1; }, { once: true });
    s.video.load();
    if (active === id && running) play(s);
  }

  // Abspielen darf scheitern (Stromsparmodus, Datensparen) – dann bleibt das Standbild
  function play(s) {
    if (!s || !s.video || !s.loaded) return;
    const p = s.video.play();
    if (p && p.catch) p.catch(() => {});
  }

  let active = null, loadTimer = 0, running = true;
  function show(id) {
    if (active === id) return;
    const first = active === null;
    const prev = scenes[active];
    active = id;
    const i = ids.indexOf(id);
    loadStill(id);
    clearTimeout(loadTimer);
    // altes Video erst nach dem Überblenden anhalten
    if (prev && prev.video) setTimeout(() => { if (scenes[active] !== prev) prev.video.pause(); }, 1200);
    const go = () => {
      if (active !== id) return;
      load(id);
      if (running) play(scenes[id]);
      if (!portrait) load(ids[i + 1]); // am Computer nächstes Kapitel schon vorladen (am Handy Daten sparen)
    };
    // bei schnellem Durchscrollen nicht jedes Video unterwegs laden
    if (first) go(); else loadTimer = setTimeout(go, 400);
    Object.values(scenes).forEach((x) => x.el.classList.toggle("is-on", x.el.dataset.id === id));
  }

  return {
    show,
    pause(v) {
      running = !v;
      const s = scenes[active];
      if (!s || !s.video) return;
      if (running) play(s); else s.video.pause();
    }
  };
}
