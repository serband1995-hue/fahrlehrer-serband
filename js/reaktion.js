/* ============================================================
   Reaktionstest mit Bestenliste (Theorie, Lektion 1).
   Bestenliste über zwei öffentliche Supabase-Funktionen
   (website_reaktion_top, website_reaktion_eintragen).
   ============================================================ */
import { CONFIG } from "./config.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};

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
  const shake = () => { btn.classList.remove("wackelt"); void btn.offsetWidth; btn.classList.add("wackelt"); };
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
      bEl.classList.remove("neu"); void bEl.offsetWidth; bEl.classList.add("neu");
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
  // Bestenliste erst laden, wenn der Test in die Nähe kommt
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { io.disconnect(); board.load(); } }, { rootMargin: "600px 0px" });
    io.observe($("#test"));
  } else board.load();

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


if ($("#test")) setupGame();
