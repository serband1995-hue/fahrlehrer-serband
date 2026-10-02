/* ============================================================
   SERBAND – „Es geht auch anders.“  Steuerung des Films.
   ============================================================ */
import { CONFIG } from "./config.js";
import { createStage } from "./stage.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

/* ---------- Farbtypen (angelehnt an Thomas Erikson) ---------- */
const FRAGEN = [
  { q: "Du sitzt zum ersten Mal am Steuer. Was geht dir durch den Kopf?",
    a: { r: "Los geht's. Wann darf ich schneller?", y: "Wie cool ist das denn!", g: "Hoffentlich mache ich nichts falsch.", b: "Erst mal: Wofür ist welcher Hebel?" } },
  { q: "Du hast einen Fehler gemacht. Was brauchst du jetzt?",
    a: { r: "Kurz sagen, was falsch war. Weiter.", y: "Ein aufmunterndes Wort.", g: "Einen Moment Ruhe.", b: "Eine genaue Erklärung, warum." } },
  { q: "Wie lernst du am liebsten?",
    a: { r: "Machen, machen, machen.", y: "Mit Spaß und Abwechslung.", g: "In meinem Tempo, Schritt für Schritt.", b: "Mit System und Hintergrundwissen." } },
  { q: "Wann war eine Fahrstunde für dich richtig gut?",
    a: { r: "Wenn ich etwas Neues geschafft habe.", y: "Wenn wir zwischendurch gelacht haben.", g: "Wenn ich mich sicher gefühlt habe.", b: "Wenn ich alles verstanden habe." } }
];
const TYPEN = {
  r: { name: "Rot", titel: "Die Macherin, der Macher", farbe: "var(--red)",
       text: "Du willst vorankommen. Wir setzen klare Ziele für jede Stunde, ich rede nicht drumherum, und du bekommst Tempo, sobald es sicher ist." },
  y: { name: "Gelb", titel: "Mit Herz und Begeisterung", farbe: "var(--yellow)",
       text: "Du lernst mit Freude. Wir halten die Stunden abwechslungsreich, feiern jeden Fortschritt, und ich sorge dafür, dass trotzdem nichts untergeht." },
  g: { name: "Grün", titel: "Ruhig und gründlich", farbe: "var(--green)",
       text: "Du brauchst Sicherheit. Wir fangen dort an, wo du dich wohlfühlst, ohne Druck und ohne Überraschungen. Schritt für Schritt, bis es sitzt." },
  b: { name: "Blau", titel: "Erst verstehen, dann fahren", farbe: "var(--blue)",
       text: "Du willst wissen, warum. Ich erkläre dir den Grund hinter jeder Regel, und in der Fahr-Akademie kannst du alles in Ruhe nachschauen." }
};

/* ---------- Inhalte aus der Konfiguration ---------- */
function fillContent() {
  const L = CONFIG.links;
  const setHref = (id, url) => { const el = document.getElementById(id); if (el && url) el.href = url; };
  setHref("akademieLink", L.akademie);
  setHref("rateLink", L.bewerten);
  setHref("reviewsLink", L.bewertungen || L.bewerten);
  setHref("priceLink", L.preise);
  setHref("waLink", L.whatsapp);
  // Links ohne Ziel (leer in der Konfiguration) nicht zeigen – sonst öffnet sich die Seite selbst
  $$('a[target="_blank"][href="#"]:not(#sheetExt)').forEach((a) => (a.hidden = true));
  const tel = $("#telLink");
  tel.href = "tel:" + L.telefon;
  tel.textContent = L.telefonAnzeige;
  const social = $("#socialLinks");
  [["Instagram", L.instagram], ["TikTok", L.tiktok]].forEach(([n, u]) => {
    if (!u) return;
    const a = document.createElement("a");
    a.href = u; a.target = "_blank"; a.rel = "noopener"; a.textContent = n;
    social.prepend(a);
  });
  // Fotos: groß und klein (Handy), leer = Foto ausblenden
  // (srcset/sizes stehen schon im HTML, damit nichts doppelt lädt; hier nur bei anderer Konfiguration)
  $$("[data-foto]").forEach((img) => {
    const f = (CONFIG.fotos || {})[img.dataset.foto];
    if (!f) {
      const story = img.closest(".story");
      if (story) story.classList.replace("story--shot", "story--solo");
      img.closest("figure").remove();
      return;
    }
    const src = typeof f === "string" ? f : f.src;
    const set = f.klein ? `${f.klein} ${f.kleinBreite}w, ${src} ${f.breite}w` : null;
    if (img.getAttribute("src") === (f.klein || src) && img.getAttribute("srcset") === set) return;
    if (set) img.srcset = set;
    else img.removeAttribute("srcset");
    img.src = f.klein || src;
  });
  // Sprachen der Fahr-Akademie aus der Konfiguration: Zahl der weiteren Sprachen und Liste
  const sp = (CONFIG.sprachen || []).map((x) => (typeof x === "string" ? { name: x } : x));
  if (sp.length) {
    $$("[data-sprachen-zahl]").forEach((el) => (el.textContent = sp.length - 1));
    $$("[data-sprachen-liste]").forEach((ul) => {
      ul.replaceChildren(...sp.map((x) => {
        const li = document.createElement("li");
        const b = document.createElement("bdi");
        b.textContent = x.name;
        if (x.code) b.lang = x.code;
        li.append(b);
        return li;
      }));
    });
  }
  try {
    const qr = window.qrcode(0, "M");
    qr.addData(L.bewerten);
    qr.make();
    $("#qrCode").innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    $$("#qrCode path").forEach((p) => p.setAttribute("fill", "#0b1115"));
  } catch (e) {}
}

/* ---------- Bestenliste (Supabase, nur zwei öffentliche Funktionen) ---------- */
const board = (() => {
  const B = CONFIG.bestenliste;
  const call = async (fn, body) => {
    const r = await fetch(`${B.url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: B.key, "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    });
    const data = await r.json().catch(() => null);
    if (!r.ok) throw new Error((data && data.message) || "fehler");
    return data;
  };
  const list = $("#board");
  let me = store.get("serband-name") || "";
  async function load() {
    if (!list) return;
    try {
      const rows = await call("website_reaktion_top");
      list.innerHTML = "";
      if (!rows.length) {
        list.innerHTML = '<li class="board__empty">Noch leer – sei die oder der Erste!</li>';
        return;
      }
      rows.forEach((r) => {
        const li = document.createElement("li");
        li.innerHTML = "<b></b><span></span><em></em>";
        $("b", li).textContent = r.platz + ".";
        $("span", li).textContent = r.name;
        $("em", li).textContent = r.ms + " ms";
        if (me && r.name.toLowerCase() === me.toLowerCase()) li.classList.add("is-me");
        list.append(li);
      });
    } catch (e) {
      list.innerHTML = '<li class="board__empty">Bestenliste gerade nicht erreichbar.</li>';
    }
  }
  const texte = {
    name_laenge: "Bitte 2 bis 15 Zeichen.",
    name_zeichen: "Bitte nur Buchstaben, Zahlen, Leerzeichen, Punkt oder Bindestrich.",
    name_unzulaessig: "Dieser Name geht leider nicht.",
    zeit_ungueltig: "Diese Zeit können wir nicht eintragen.",
    zu_viele_versuche: "Viele Versuche – probier es später noch einmal."
  };
  async function submit(name, ms) {
    const platz = await call("website_reaktion_eintragen", { p_name: name, p_ms: ms });
    me = name;
    store.set("serband-name", name);
    await load();
    return platz;
  }
  return { load, submit, texte, get me() { return me; } };
})();

/* ---------- Reaktionstest ---------- */
function setupGame() {
  const btn = $("#light"), msg = $("#lightMsg");
  const lamps = $$(".light__lamp", btn);
  const tEl = $("#gameTime"), bEl = $("#gameBest"), dEl = $("#gameDist");
  // gleiche Grenzen wie die Bestenliste auf dem Server: darunter geraten, darüber abgelenkt
  const MIN_MS = 100, MAX_MS = 1500;
  let state = "idle", timer = null, t0 = 0, swallow = false;
  const best = parseInt(store.get("serband-best") || "", 10);
  if (best >= MIN_MS && best <= MAX_MS) bEl.textContent = best + " ms";
  const reset = () => lamps.forEach((l) => (l.className = "light__lamp"));
  const verdict = (ms) => ms < 230 ? "Blitzreflex!" : ms < 300 ? "Sehr stark!" : ms < 400 ? "Solide!" : "Nochmal, ganz ruhig";
  const shake = () => gsap.fromTo(btn, { x: -10 }, { x: 0, duration: 0.5, ease: "elastic.out(1, .3)" });
  const go = () => {
    state = "wait";
    hideEntry();
    reset();
    msg.textContent = "Warte auf Grün …";
    lamps[0].classList.add("red");
    timer = setTimeout(() => {
      lamps[1].classList.add("amber");
      timer = setTimeout(() => {
        reset();
        lamps[2].classList.add("green");
        state = "go";
        msg.textContent = "JETZT!";
        t0 = performance.now();
        // gemessen wird ab dem Bild, in dem das Grün wirklich zu sehen ist
        const armed = t0;
        requestAnimationFrame(() => requestAnimationFrame(() => { if (state === "go" && t0 === armed) t0 = performance.now(); }));
      }, 600 + Math.random() * 2200);
    }, 900);
  };
  const press = (at) => {
    if (state === "wait") {
      clearTimeout(timer);
      reset();
      lamps[0].classList.add("red");
      state = "done";
      msg.textContent = "Zu früh! Nochmal?";
      tEl.textContent = "Rot!";
      dEl.textContent = "–";
      shake();
      return;
    }
    if (state !== "go") return;
    const ms = Math.round(at - t0);
    state = "done";
    if (ms < MIN_MS) {
      // schneller als ein Mensch reagieren kann: das war geraten
      reset();
      lamps[0].classList.add("red");
      msg.textContent = "Geraten! Nochmal?";
      tEl.textContent = "Rot!";
      dEl.textContent = "–";
      shake();
      return;
    }
    tEl.textContent = ms + " ms";
    const dist = (50 / 3.6) * (ms / 1000);
    dEl.textContent = dist.toFixed(1).replace(".", ",") + " m";
    if (ms > MAX_MS) { msg.textContent = "Abgelenkt? Nochmal!"; return; }
    msg.textContent = verdict(ms) + " Nochmal?";
    showEntry(ms);
    const prev = parseInt(store.get("serband-best") || "", 10);
    if (!(prev >= MIN_MS && prev <= MAX_MS) || ms < prev) {
      store.set("serband-best", ms);
      bEl.textContent = ms + " ms";
      gsap.fromTo(bEl, { scale: 1.4, color: "#8fe6bf" }, { scale: 1, color: "#f1dca6", duration: 0.8, ease: "back.out(2)" });
    }
  };
  // Eintragen in die Bestenliste
  const form = $("#entry"), input = $("#entryName"), note = $("#entryMsg"), sendBtn = $("button", form);
  let lastMs = 0, hideTimer = 0;
  input.value = board.me;
  function hideEntry() { clearTimeout(hideTimer); form.hidden = true; lastMs = 0; }
  function showEntry(ms) {
    clearTimeout(hideTimer);
    lastMs = ms;
    note.textContent = "";
    sendBtn.disabled = false;
    form.hidden = false;
    $("label", form).textContent = `${ms} ms – ${verdict(ms)} Trag dich in die Bestenliste ein:`;
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!lastMs || sendBtn.disabled) return;
    const name = input.value.trim(), ms = lastMs;
    sendBtn.disabled = true;
    try {
      const platz = await board.submit(name, ms);
      lastMs = 0; // diese Zeit ist eingetragen – kein zweites Mal
      note.textContent = platz <= 5 ? `Du bist auf Platz ${platz}!` : `Eingetragen – dein Platz: ${platz}. Für die Top 5 geht noch was.`;
      hideTimer = setTimeout(() => (form.hidden = true), 2600);
    } catch (err) {
      note.textContent = board.texte[err.message] || "Das hat nicht geklappt. Bitte später nochmal.";
      sendBtn.disabled = false;
    }
  });
  ScrollTrigger.create({ trigger: "#test", start: "top bottom", once: true, onEnter: () => board.load() });

  // Messen beim Aufsetzen des Fingers (genau), Starten erst beim Tippen (click) –
  // so startet ein Wischen über die Ampel beim Scrollen keinen Test.
  // swallow: dieser Tipp wurde schon beim Aufsetzen gewertet, sein click startet nicht neu
  btn.addEventListener("pointerdown", (e) => {
    swallow = false;
    if (e.button !== 0 || (state !== "wait" && state !== "go")) return;
    e.preventDefault();
    swallow = true;
    press(e.timeStamp || performance.now());
  });
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (swallow) { swallow = false; return; }
    if (state === "idle" || state === "done") go();
    else press(e.timeStamp || performance.now());
  });
  // Tastatur: sofort beim Drücken werten; gehaltene Taste zählt nicht als neue Eingabe
  btn.addEventListener("keydown", (e) => {
    if (e.repeat) { e.preventDefault(); return; }
    if (e.key !== " " && e.key !== "Enter") return;
    swallow = false;
    if (state === "wait" || state === "go") {
      e.preventDefault();
      swallow = true;
      press(e.timeStamp || performance.now());
    }
  });
}

/* ---------- Bewertungen: Laufband ----------
   Zwei Reihen gegenläufig (am Handy eine). Jede Reihe enthält die Karten doppelt,
   damit sie ohne Sprung endlos läuft. Anfassen, Maus darüber oder Tastatur-Fokus
   hält sie an; ziehen/wischen geht auch. Bei „Bewegung reduzieren“: normale Wischliste. */
function setupReviews() {
  const box = $("#reviews");
  // Einzige Quelle ist die Verwaltung der Fahr-Akademie (Supabase): nur dort sichtbare
  // Bewertungen erscheinen. Geladen wird, sobald man in die Nähe scrollt. Ohne Antwort
  // verschwindet der Bereich – lieber keine Bewertungen als ausgeblendete.
  let list = [];
  const B = CONFIG.bestenliste;
  if (!box) return;
  if (!B || !B.url) { $("#stimmen").remove(); $$("[data-kachel=stimmen]").forEach((k) => k.remove()); return; }
  const sterne = (b) => Math.max(1, Math.min(5, parseInt(b.sterne, 10) || 5));
  const card = (b, i) => {
    const el = document.createElement("article");
    el.className = "review";
    const n = sterne(b);
    el.innerHTML = `<div class="review__stars" role="img" aria-label="${n} von 5 Sternen">${"★".repeat(n)}</div>
      <p class="review__text"></p>
      <button class="review__more" type="button">Ganze Bewertung lesen</button>
      <div class="review__who"><i aria-hidden="true"></i><div><span></span><small>Google-Bewertung</small></div></div>`;
    // auf der Karte als Fließtext (spart Zeilen), im Fenster mit Absätzen. Nur der Anfang:
    // sichtbar sind ohnehin höchstens 8 Zeilen, den ganzen Text zu setzen kostet spürbar Zeit
    const fliess = b.text.replace(/\s*\n\s*/g, " ");
    const kurz = fliess.length > 420 ? fliess.slice(0, fliess.lastIndexOf(" ", 420)) + " …" : fliess;
    $(".review__text", el).textContent = kurz;
    if (kurz !== fliess) el.dataset.gekuerzt = "1";
    $(".review__who span", el).textContent = b.name;
    $(".review__who i", el).textContent = (b.name || "?").trim().charAt(0).toUpperCase();
    el.dataset.i = i;
    return el;
  };
  const wide = matchMedia("(min-width: 760px)");
  let rows = [];

  let spaeter = false, bauNr = 0;
  // Karten in kleinen Portionen zwischen zwei Bildern anlegen – alle auf einmal
  // blockierten auf schwächeren Handys spürbar das Scrollen
  const pause = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  async function build() {
    if (rows.some((r) => r.drag)) { spaeter = true; return; }
    spaeter = false;
    const nr = ++bauNr;
    rows = [];
    box.replaceChildren();
    const n = wide.matches && list.length > 5 ? 2 : 1;
    const neu = [];
    for (let r = 0; r < n; r++) {
      const row = document.createElement("div");
      row.className = "reviews__row";
      const rail = document.createElement("div");
      rail.className = "reviews__rail";
      row.append(rail);
      box.append(row);
      neu.push({ row, rail, items: list.map((b, i) => [b, i]).filter((_, i) => i % n === r) });
    }
    const portion = async (rail, items, kopie) => {
      for (let k = 0; k < items.length; k += 8) {
        const f = document.createDocumentFragment();
        items.slice(k, k + 8).forEach(([b, i]) => {
          const c = card(b, i);
          if (kopie) {
            // Kopien nur fürs endlose Laufen: für Vorleser und Tab-Taste unsichtbar, antippen geht
            c.setAttribute("aria-hidden", "true"); c.classList.add("is-copy");
            $(".review__more", c).tabIndex = -1;
          }
          f.append(c);
        });
        rail.append(f);
        await pause();
        if (nr !== bauNr) return false;
      }
      return true;
    };
    for (const { row, rail, items } of neu) {
      if (!(await portion(rail, items, false))) return;
      if (!reducedMotion) {
        // eine Hälfte muss breiter sein als die Reihe, sonst läuft eine Lücke mit
        const satz = rail.scrollWidth + 16;
        const mal = Math.max(1, Math.ceil(row.clientWidth / satz));
        for (let k = 1; k < mal * 2; k++) if (!(await portion(rail, items, true))) return;
        // Fokus darf die Reihe nicht selbst verschieben – das macht die Laufband-Position
        row.addEventListener("scroll", () => (row.scrollLeft = 0));
      }
    }
    if (nr !== bauNr) return;
    rows = neu.map(({ row, rail }, r) => ({ row, rail, x: 0, vx: 0, dir: r % 2 ? 1 : -1, w: 0, hover: false, focus: false, until: 0, drag: null }));
    measure();
  }

  // Breite einer Hälfte; lange Texte bekommen „Ganze Bewertung lesen“
  function measure() {
    let zuSchmal = false;
    rows.forEach((o) => {
      const cards = $$(".review", o.rail), half = cards.length / 2;
      o.w = reducedMotion || !half ? 0 : cards[half].offsetLeft - cards[0].offsetLeft;
      if (o.w && o.w < o.row.clientWidth) zuSchmal = true;
      if (o.dir > 0 && o.w && o.x === 0) o.x = -o.w; // rechtslaufende Reihe startet versetzt
    });
    // erst alles messen, dann alles ändern – abwechselnd messen/ändern zwingt den
    // Browser bei jeder Karte zu einem neuen Seitenlayout (bei 74 Karten spürbar)
    const karten = $$(".review", box), orig = karten.filter((c) => !c.classList.contains("is-copy"));
    const lang = new Map(orig.map((c) => { const t = $(".review__text", c); return [c.dataset.i, !!c.dataset.gekuerzt || t.scrollHeight > t.clientHeight + 2]; }));
    karten.forEach((c) => c.classList.toggle("is-long", !!lang.get(c.dataset.i)));
    if (zuSchmal) build();
  }

  // Tippen auf eine Karte öffnet die ganze Bewertung (nicht nach dem Ziehen)
  box.addEventListener("click", (e) => {
    const c = e.target.closest(".review");
    if (!c || !c.classList.contains("is-long")) return;
    const o = rows.find((r) => r.row.contains(c));
    if (o && o.moved > 6) return;
    const b = list[+c.dataset.i];
    $("#reviewTitle").textContent = b.name;
    $("#reviewFull").textContent = b.text;
    $("#reviewStars").textContent = "★".repeat(sterne(b));
    $("#reviewStars").setAttribute("aria-label", sterne(b) + " von 5 Sternen");
    $("#reviewSheet .sheet__body").scrollTop = 0;
    openSheet($("#reviewSheet"));
  });

  if (!reducedMotion) {
    const rowOf = (el) => rows.find((r) => r.row.contains(el));
    box.addEventListener("pointerover", (e) => { const o = rowOf(e.target); if (o && e.pointerType === "mouse") o.hover = true; });
    box.addEventListener("pointerout", (e) => { const o = rowOf(e.target); if (o && e.pointerType === "mouse" && !o.row.contains(e.relatedTarget)) o.hover = false; });
    box.addEventListener("pointerdown", (e) => {
      const o = rowOf(e.target);
      if (!o || e.button > 0) return;
      o.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, pos: o.x, last: e.clientX, on: false };
      o.moved = 0; o.vx = 0;
    });
    box.addEventListener("pointermove", (e) => {
      const o = rows.find((r) => r.drag && r.drag.id === e.pointerId);
      if (!o) return;
      if (e.pointerType === "mouse" && e.buttons === 0) return up(e); // außerhalb losgelassen
      const d = o.drag, dx = e.clientX - d.x0;
      if (!d.on) {
        // erst waagerecht ziehen, dann festhalten – senkrecht bleibt normales Scrollen
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - d.y0)) return;
        d.on = true;
        try { o.row.setPointerCapture(e.pointerId); } catch (err) {}
        o.row.classList.add("is-drag");
      }
      o.vx = e.clientX - d.last; d.last = e.clientX;
      o.moved = Math.abs(dx);
      o.x = d.pos + dx;
    });
    const up = (e) => {
      const o = rows.find((r) => r.drag && r.drag.id === e.pointerId);
      if (!o) return;
      o.drag = null;
      o.row.classList.remove("is-drag");
      o.until = performance.now() + (e.pointerType === "mouse" ? 0 : 1800); // nach dem Wischen kurz stehen lassen
      setTimeout(() => (o.moved = 0), 0);
      if (spaeter) build();
    };
    // auf dem ganzen Fenster hören: Loslassen außerhalb der Reihe beendet das Ziehen auch
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    // Tastatur: fokussierte Karte ins Bild holen und die Reihe anhalten
    box.addEventListener("focusin", (e) => {
      const o = rowOf(e.target), c = e.target.closest(".review");
      if (!o || !c) return;
      o.focus = true;
      o.row.scrollLeft = 0;
      const left = c.offsetLeft + o.x, room = o.row.clientWidth - c.offsetWidth;
      if (left < 16 || left > room - 16) o.x = -c.offsetLeft + Math.max(16, room / 2);
    });
    box.addEventListener("focusout", (e) => { const o = rowOf(e.target); if (o && !o.row.contains(e.relatedTarget)) o.focus = false; });

    let visible = false, last = 0;
    new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(box);
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(64, now - (last || now)); last = now;
      if (!visible) return;
      const halt = !$("#reviewSheet").hidden;
      rows.forEach((o) => {
        if (!o.w) return;
        if (!o.drag) {
          o.x += o.vx; o.vx *= 0.92;
          if (!o.hover && !o.focus && !halt && now > o.until && Math.abs(o.vx) < 0.3) o.x += o.dir * 0.02 * dt; // rund 20 px pro Sekunde
        }
        // endlos: immer innerhalb einer Hälfte bleiben
        while (o.x > 0) o.x -= o.w;
        while (o.x <= -o.w) o.x += o.w;
        if (o.drag && o.drag.on) o.drag.pos = o.x - (o.drag.last - o.drag.x0);
        o.rail.style.transform = `translate3d(${o.x.toFixed(2)}px,0,0)`;
      });
    });
  }

  box.innerHTML = '<p class="reviews__laden">Bewertungen werden geladen …</p>';
  // Bereich entfernen; die Seite wird kürzer, also Scroll-Auslöser neu berechnen
  const weg = () => { $$("[data-kachel=stimmen]").forEach((k) => k.remove()); if ($("#stimmen")) { $("#stimmen").remove(); ScrollTrigger.refresh(); } };
  const laden = async () => {
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 10000);
      const r = await fetch(`${B.url}/rest/v1/rpc/website_bewertungen_liste`, {
        method: "POST", headers: { apikey: B.key, "Content-Type": "application/json" }, body: "{}", signal: ctl.signal
      });
      clearTimeout(t);
      if (!r.ok) return weg();
      const d = await r.json();
      list = (Array.isArray(d) ? d : []).filter((b) => b && b.name && b.text);
      if (!list.length) return weg(); // alles ausgeblendet
      await build();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
      ScrollTrigger.refresh();
    } catch (e) { weg(); }
  };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); laden(); } }, { rootMargin: "1500px 0px" });
    io.observe(box);
  } else laden();
  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(measure, 150); });
  const neu = () => list.length && build();
  wide.addEventListener ? wide.addEventListener("change", neu) : wide.addListener(neu);
}

/* ---------- Buchen: Umschalter Schaltung / Automatik ---------- */
function setupBooking() {
  const sw = $(".switch");
  if (!sw) return;
  const texts = {
    schalter: { word: "SCHALTUNG", title: "Schaltwagen", text: "Du lernst kuppeln und schalten und darfst später Schalt- und Automatikwagen fahren." },
    automatik: { word: "AUTOMATIK", title: "Automatik", text: "Kein Kuppeln, kein Abwürgen. Du konzentrierst dich ganz auf den Verkehr." }
  };
  const setMode = (mode) => {
    const t = texts[mode];
    const auto = mode === "automatik";
    sw.classList.toggle("is-auto", auto);
    $$(".switch__opt", sw).forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    $("#gearSchalter").toggleAttribute("hidden", auto);
    $("#gearAutomatik").toggleAttribute("hidden", !auto);
    $("#bookBtn").dataset.cal = mode;
    gsap.fromTo([$("#bookTitle"), $("#bookText")], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out", onStart: () => { $("#bookTitle").textContent = t.title; $("#bookText").textContent = t.text; } });
  };
  $$(".switch__opt", sw).forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
}


/* ---------- Start ---------- */
fillContent();
const chapters = $$("main section[data-kapitel]");
const ids = chapters.map((c) => c.id);
const stage = createStage(ids);
stage.show("prolog");

// Inhaltsverzeichnis
chapters.forEach((c, i) => {
  const li = document.createElement("li");
  li.innerHTML = `<a href="#${c.id}" style="--i:${i}"><small></small><span></span></a>`;
  $("small", li).textContent = c.dataset.kapitel;
  $("span", li).textContent = c.dataset.titel;
  $("#menuList").append(li);
});
document.addEventListener("visibilitychange", () => stage.pause(document.hidden));

/* ---------- Die Seite ----------
   Ruhig: normales Scrollen (kein Nachgleiten), Texte stehen still und sind sofort
   lesbar. Bewegung gibt es nur im Hintergrund-Video und bei kleinen Rückmeldungen. */
function start() {
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href") || "";
    if (id[0] !== "#" || id.length < 2) return; // z. B. „In neuem Tab“ zeigt inzwischen auf eine Adresse
    let target = null;
    try { target = document.querySelector(id); } catch (err) {}
    if (!target) return;
    e.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
    history.replaceState(null, "", id);
  }));

  setupChapters();
  setupTour();
  setupQuiz();
  setupVow();
  setupGame();
  setupReviews();
  setupSheets();
  setupBooking();
  ScrollTrigger.refresh();
}

/* Kapitel: Bühne, Kopfzeile, Fortschritt */
function setupChapters() {
  const num = $("#topNum"), name = $("#topName"), bar = $("#topBar");
  const links = $$("#menuList a");
  chapters.forEach((c, i) => {
    ScrollTrigger.create({
      trigger: c, start: "top 55%", end: "bottom 55%",
      onToggle: (self) => {
        if (!self.isActive) return;
        stage.show(c.id);
        num.textContent = c.dataset.kapitel;
        name.textContent = c.dataset.titel;
        links.forEach((l, k) => l.classList.toggle("is-current", k === i));
        gsap.fromTo([num, name], { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" });
      }
    });
  });
  ScrollTrigger.create({ start: 0, end: "max", onUpdate: (self) => (bar.style.transform = `scaleX(${self.progress.toFixed(4)})`) });
}

/* App-Tour (Kapitel IV): der Schritt in der Bildschirmmitte bestimmt das Bild im Handy */
function setupTour() {
  const tour = $("#tour");
  if (!tour) return;
  const steps = $$(".tour__step", tour), shots = $$(".tour__shot", tour), dots = $$("#tourDots i"), label = $("#tourLabel");
  const names = { kompass: "Fahrlehrer-Kompass", akademie: "Fahr-Akademie" };
  let cur = -1;
  const set = (i) => {
    if (i === cur) return;
    cur = i;
    shots.forEach((s, k) => s.classList.toggle("is-on", k === i));
    dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
    steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
    label.textContent = names[steps[i].dataset.app] || "";
    // nächstes Bild schon laden, damit der Wechsel ohne Lücke klappt
    [shots[i], shots[i + 1]].forEach((s) => { if (s) s.loading = "eager"; });
  };
  // Aktiver Schritt = der letzte, dessen Oberkante die Bildschirmmitte überschritten hat.
  // Aus der Position berechnet statt aus Ein-/Austritt je Schritt – bei schnellem
  // Scrollen oder Sprüngen feuern diese sonst in beliebiger Reihenfolge.
  const aktuell = () => {
    const linie = innerHeight * 0.55;
    let i = 0;
    steps.forEach((s, k) => { if (s.getBoundingClientRect().top < linie) i = k; });
    set(i);
  };
  set(0);
  ScrollTrigger.create({ trigger: tour, start: "top bottom", end: "bottom top", onUpdate: aktuell, onRefresh: aktuell });
}

/* Farbtypen-Quiz */
function setupQuiz() {
  const body = $("#quizBody"), step = $("#quizStep");
  let i = 0, last = null, lockUntil = 0;
  const score = { r: 0, y: 0, g: 0, b: 0 };
  // gleichmäßig mischen (Fisher-Yates) – sort(Math.random) bevorzugt bestimmte Plätze
  const shuffle = (a) => { for (let j = a.length - 1; j > 0; j--) { const r = Math.floor(Math.random() * (j + 1)); [a[j], a[r]] = [a[r], a[j]]; } return a; };
  const render = () => {
    lockUntil = performance.now() + 350; // ein Doppeltipp überspringt keine Frage
    const f = FRAGEN[i];
    step.textContent = `Frage ${i + 1} von ${FRAGEN.length}`;
    body.innerHTML = '<p class="quiz__q"></p><div class="quiz__opts"></div>';
    $(".quiz__q", body).textContent = f.q;
    // Reihenfolge der Antworten mischen, damit keine Farbe immer oben steht
    const keys = shuffle(Object.keys(f.a));
    keys.forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz__opt";
      b.textContent = f.a[k];
      b.addEventListener("click", () => {
        if (performance.now() < lockUntil) return;
        lockUntil = Infinity;
        score[k]++; last = k; i++;
        i < FRAGEN.length ? render() : result();
      });
      $(".quiz__opts", body).append(b);
    });
    gsap.from($$(".quiz__q, .quiz__opt", body), { y: 14, opacity: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" });
  };
  const result = () => {
    // Gleichstand: die zuletzt gewählte der gleichauf liegenden Farben (nicht immer Rot)
    const max = Math.max(...Object.values(score));
    const tied = Object.keys(score).filter((k) => score[k] === max);
    const top = tied.length === 1 ? tied[0] : tied.includes(last) ? last : tied[Math.floor(Math.random() * tied.length)];
    const t = TYPEN[top];
    step.textContent = "Dein Ergebnis";
    body.innerHTML = `<div class="quiz__result" style="--col:${t.farbe}"><div class="quiz__orb"></div><div><h4><small></small><span></span></h4><p></p><p class="quiz__so">So fahren wir zusammen. Den Rest besprechen wir in der ersten Stunde.</p><button class="quiz__again" type="button">Nochmal machen</button></div></div>`;
    $("h4 small", body).textContent = "Du bist eher " + t.name;
    $("h4 span", body).textContent = t.titel;
    $(".quiz__result p", body).textContent = t.text;
    $(".quiz__again", body).addEventListener("click", () => { i = 0; last = null; Object.keys(score).forEach((k) => (score[k] = 0)); render(); });
    gsap.from(".quiz__orb", { scale: 0, duration: 1, ease: "back.out(2)" });
    gsap.from($$(".quiz__result h4, .quiz__result p, .quiz__again", body), { y: 14, opacity: 0, duration: 0.6, stagger: 0.08 });
  };
  render();
}

/* Versprechen: Foto, Satz und Unterschrift stehen ruhig da */
function setupVow() {
  if (!$("#vowPhoto")) $("#vow").classList.add("vow--text");
}

/* Kalender- und Hinweisfenster, Menü */
let openSheet = () => {};
function setupSheets() {
  const sheet = $("#sheet"), frame = $("#sheetFrame"), consent = $("#sheetConsent");
  let lastFocus = null, currentUrl = "";
  // Hinter dem Fenster ist nichts bedienbar (Tab-Taste bleibt im Fenster)
  const hinten = (an) => { $$(".top, main").forEach((x) => (x.inert = an)); if (!an && menuOpen()) $("main").inert = true; };
  const open = (el) => { lastFocus = document.activeElement; el.hidden = false; el._offenSeit = performance.now(); hinten(true); lockScroll(true); setTimeout(() => $(".sheet__close", el).focus(), 50); };
  const close = (el) => { el.hidden = true; if (!sheetOpen()) hinten(false); lockScroll(menuOpen()); lastFocus && lastFocus.focus(); };
  // gleiche Adresse nicht neu laden – ein angefangener Buchungsvorgang bleibt erhalten
  const loadFrame = () => { consent.hidden = true; frame.hidden = false; if (frame.getAttribute("src") !== currentUrl) frame.src = currentUrl; try { sessionStorage.setItem("serband-cal-ok", "1"); } catch (e) {} };
  $$("[data-cal]").forEach((b) => b.addEventListener("click", () => {
    const auto = b.dataset.cal === "automatik";
    currentUrl = auto ? CONFIG.links.kalenderAutomatik : CONFIG.links.kalenderSchalter;
    $("#sheetKind").textContent = auto ? "Automatik" : "Schaltwagen";
    $("#sheetTitle").textContent = "Fahrstunde buchen";
    $("#sheetExt").href = currentUrl;
    let ok = false;
    try { ok = sessionStorage.getItem("serband-cal-ok") === "1"; } catch (e) {}
    if (ok) loadFrame(); else { consent.hidden = false; frame.hidden = true; frame.removeAttribute("src"); }
    open(sheet);
  }));
  openSheet = open;
  $("#sheetLoad").addEventListener("click", loadFrame);
  $("#installBtn").addEventListener("click", () => open($("#installSheet")));
  $$(".sheet").forEach((s) => $$("[data-close]", s).forEach((c) => c.addEventListener("click", () => {
    // Doppeltipp: der zweite Tipp landet auf dem Hintergrund und würde sofort wieder schließen
    if (c.classList.contains("sheet__backdrop") && performance.now() - (s._offenSeit || 0) < 450) return;
    close(s);
  })));
  document.addEventListener("keydown", (e) => { if (e.key !== "Escape") return; $$(".sheet").forEach((s) => { if (!s.hidden) close(s); }); closeMenu(); });
  $("#menuBtn").addEventListener("click", () => setMenu(!menuOpen()));
}
const menuOpen = () => $("#menu").classList.contains("is-open");
const sheetOpen = () => $$(".sheet").some((s) => !s.hidden);
// Seite hinter Menü oder Fenster festhalten
function lockScroll(on) {
  document.body.style.overflow = on ? "hidden" : "";
}
function setMenu(openNow) {
  const m = $("#menu");
  m.classList.toggle("is-open", openNow);
  m.setAttribute("aria-hidden", openNow ? "false" : "true");
  $("#menuBtn").setAttribute("aria-expanded", openNow ? "true" : "false");
  // Tab-Taste bleibt im Menü statt im verdeckten Inhalt
  $("main").toggleAttribute("inert", openNow);
  lockScroll(openNow || sheetOpen());
}
function closeMenu() {
  if (menuOpen()) setMenu(false);
}

// erst ganz am Ende starten: alle Funktionen und Variablen oben sind dann angelegt
start();
