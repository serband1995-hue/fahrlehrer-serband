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
  // Aufruf mit Zeitlimit (10 s). Netzfehler → Fehler "netz", damit die Seite es verständlich sagen kann
  const call = async (fn, body) => {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 10000);
    let r;
    try {
      r = await fetch(`${B.url}/rest/v1/rpc/${fn}`, {
        method: "POST",
        headers: { apikey: B.key, "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
        signal: ctl.signal
      });
    } catch (e) { throw new Error("netz"); } finally { clearTimeout(t); }
    const data = await r.json().catch(() => null);
    if (!r.ok) throw new Error((data && data.message) || "fehler");
    return data;
  };
  const list = $("#board");
  // „Rekord“ = Platz 1 der Bestenliste; leuchtet kurz auf, wenn er gebrochen wird
  const rekordEl = $("#gameBest");
  let rekordMs = 0;
  // vor dem Laden keine Zahl zeigen, die nicht stimmt (im HTML steht ggf. noch ein Beispielwert)
  if (rekordEl) rekordEl.textContent = "–";
  function rekord(ms) {
    if (!rekordEl || !(ms > 0)) return;
    rekordEl.textContent = ms + " ms";
    if (rekordMs && ms < rekordMs) { rekordEl.classList.remove("neu"); void rekordEl.offsetWidth; rekordEl.classList.add("neu"); }
    rekordMs = ms;
  }
  let me = store.get("serband-name") || "";
  let laedt = false;
  async function load() {
    if (!list || laedt) return; // Doppeltipp auf „Nochmal versuchen“
    laedt = true;
    try {
      const rows = await call("website_reaktion_top");
      list.innerHTML = "";
      if (!Array.isArray(rows) || !rows.length) {
        list.innerHTML = '<li class="board__empty">Noch leer – sei die oder der Erste!</li>';
        return;
      }
      rekord(rows[0].ms);
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
      list.innerHTML = '<li class="board__empty is-fehler">Bestenliste gerade nicht erreichbar. <button type="button" class="btn btn--small btn--ghost" data-nochmal><span>Nochmal versuchen</span></button></li>';
      $("[data-nochmal]", list).addEventListener("click", load, { once: true });
      addEventListener("online", load, { once: true });
    } finally { laedt = false; }
  }
  const texte = {
    name_laenge: "Bitte 2 bis 15 Zeichen.",
    name_zeichen: "Bitte nur Buchstaben, Zahlen, Leerzeichen, Punkt oder Bindestrich.",
    name_unzulaessig: "Dieser Name geht leider nicht.",
    zeit_ungueltig: "Diese Zeit können wir nicht eintragen.",
    zu_viele_versuche: "Viele Versuche – probier es später noch einmal.",
    netz: "Keine Verbindung. Prüf dein Internet und tipp nochmal auf „Eintragen“."
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

/* ---------- Ergebnis teilen ----------
   Web Share (Handy: Teilen-Menü) mit Rückfall „Link kopieren“. Geteilt werden nur
   Zeit und Reaktionsweg – kein Name, keine Platzierung, nichts Persönliches. */
const teilen = (() => {
  const url = (CONFIG.teilen && CONFIG.teilen.reaktion) || location.href.split("#")[0] + "#test";
  let box = $("#share"), btn = $("#shareBtn"), note = $("#shareMsg"), daten = null, busy = false;
  // Fehlt der Bereich im HTML, legt das Skript ihn unter dem Eintragen-Feld an
  if (!btn && $("#entry")) {
    box = document.createElement("div");
    box.className = "share"; box.id = "share"; box.hidden = true;
    box.style.marginTop = "14px"; // bis css/style.css eine Regel für .share hat
    box.innerHTML = '<button class="btn btn--small btn--ghost share__btn" type="button" id="shareBtn"><span>Ergebnis teilen</span></button><p class="share__msg entry__msg" id="shareMsg" aria-live="polite"></p>';
    $("#entry").after(box);
    btn = $("#shareBtn"); note = $("#shareMsg");
  }
  if (!btn) return { zeigen() {}, verstecken() {} };
  const huelle = box || btn;
  const sagen = (t) => { if (note) note.textContent = t; };
  btn.addEventListener("click", async () => {
    if (!daten || busy) return; // Doppeltipp öffnet das Teilen-Menü nicht zweimal
    busy = true;
    const text = `Meine Reaktionszeit: ${daten.ms} ms. Bei 50 km/h fahre ich in der Zeit ${daten.weg} blind weiter. Schaffst du es schneller?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Reaktionstest", text, url });
        sagen("");
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(`${text} ${url}`);
        sagen("Text und Link kopiert – jetzt einfügen und verschicken.");
      } else {
        sagen(`Zum Kopieren: ${text} ${url}`);
      }
    } catch (e) {
      // abgebrochen: still bleiben; sonst den Text zum Kopieren zeigen
      if (!e || e.name !== "AbortError") sagen(`Zum Kopieren: ${text} ${url}`);
    } finally { busy = false; }
  });
  return {
    zeigen(ms, weg) { daten = { ms, weg }; btn.hidden = false; huelle.hidden = false; sagen(""); },
    verstecken() { daten = null; huelle.hidden = true; sagen(""); }
  };
})();

/* ---------- Reaktionstest ---------- */
function setupGame() {
  const btn = $("#light"), msg = $("#lightMsg");
  const lamps = $$(".light__lamp", btn);
  const tEl = $("#gameTime"), dEl = $("#gameDist");
  // gleiche Grenzen wie die Bestenliste auf dem Server: darunter geraten, darüber abgelenkt
  const MIN_MS = 100, MAX_MS = 1500;
  let state = "idle", timer = null, t0 = 0, swallow = false;
  const reset = () => lamps.forEach((l) => (l.className = "light__lamp"));
  const verdict = (ms) => ms < 230 ? "Blitzreflex!" : ms < 300 ? "Sehr stark!" : ms < 400 ? "Solide!" : "Nochmal, ganz ruhig";
  const shake = () => { btn.classList.remove("wackelt"); void btn.offsetWidth; btn.classList.add("wackelt"); };
  const go = () => {
    state = "wait";
    hideEntry();
    teilen.verstecken();
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
    teilen.zeigen(ms, dEl.textContent);
    showEntry(ms);
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
    $("label", form).textContent = `${ms} ms – ${verdict(ms)} Trag dich in die Bestenliste ein (nur Vor- oder Spitzname; unter 16 frag vorher deine Eltern):`;
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
