/* ============================================================
   SERBAND – „Es geht auch anders.“  Steuerung des Films.
   ============================================================ */
import { CONFIG } from "./config.js";
import { createStage } from "./stage.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Kleine Helfer (ohne Bibliothek) ----------
   Früher GSAP + ScrollTrigger (zusammen ~118 KB, lange Aufgaben beim Laden).
   Heute: Web Animations API für die kleinen Rückmeldungen und ein gemeinsamer
   Scroll-Taktgeber, der Positionen nur misst, wenn sich die Seite ändert. */
const EASE = "cubic-bezier(.33,1,.68,1)";
function einblenden(els, { y = 14, dauer = 500, abstand = 50 } = {}) {
  if (reducedMotion) return;
  els.forEach((el, k) => {
    if (el && el.animate) el.animate([{ opacity: 0, transform: `translateY(${y}px)` }, { opacity: 1, transform: "none" }],
      { duration: dauer, delay: k * abstand, easing: EASE, fill: "backwards" });
  });
}
// später erledigen, wenn der Browser Luft hat (nicht im ersten, wichtigen Moment)
const spaeter = (fn) => ("requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 1200 }) : setTimeout(fn, 60));
const skriptLaden = (src) => new Promise((ok, fehler) => {
  const s = document.createElement("script");
  s.src = src; s.async = true; s.onload = ok; s.onerror = fehler;
  document.head.append(s);
});
// einmal ausführen, sobald das Element in die Nähe kommt
function inDerNaehe(el, fn, abstand = "800px") {
  if (!el) return;
  if (!("IntersectionObserver" in window)) return fn();
  const io = new IntersectionObserver((en) => { if (en.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { rootMargin: `${abstand} 0px` });
  io.observe(el);
}

/* Scroll-Taktgeber: höchstens einmal pro Bild. Gemessen (Layout gelesen) wird nur
   nach Größenänderungen; beim Scrollen wird nur mit scrollY gerechnet. */
const scroller = (() => {
  const teile = [];
  // bereit: erst nach dem ersten gezeichneten Bild messen – sonst erzwingt das Messen das
  // allererste Seitenlayout vorzeitig und der erste Bildschirm erscheint später
  let raf = 0, neuMessen = true, bereit = false;
  const takt = () => {
    raf = 0;
    if (neuMessen) { neuMessen = false; teile.forEach((t) => t.messen && t.messen(scrollY)); }
    const y = scrollY, h = innerHeight;
    teile.forEach((t) => t.zeichnen(y, h));
  };
  const bald = () => { if (bereit && !raf) raf = requestAnimationFrame(takt); };
  const refresh = () => { neuMessen = true; bald(); };
  requestAnimationFrame(() => setTimeout(() => { bereit = true; bald(); }, 0));
  addEventListener("scroll", bald, { passive: true });
  addEventListener("resize", refresh);
  if ("ResizeObserver" in window) new ResizeObserver(refresh).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  return { add(t) { teile.push(t); refresh(); }, refresh };
})();
const oben = (el, y) => el.getBoundingClientRect().top + y;

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
  // Social-Profile (leer in der Konfiguration = kein Knopf).
  // Neues Fuß-Markup: #socialProfile mit a.social__link[data-net] – erst sichtbar, wenn eins gesetzt ist.
  // Ohne dieses Markup: wie früher vorne in #socialLinks einfügen.
  const profil = $("#socialProfile");
  if (profil) {
    let eins = false;
    $$(".social__link[data-net]", profil).forEach((a) => {
      const u = L[a.dataset.net];
      if (u) { a.href = u; a.hidden = false; eins = true; } else a.hidden = true;
    });
    profil.classList.toggle("is-hidden", !eins);
  } else if ($("#socialLinks")) {
    [["Facebook", L.facebook], ["YouTube", L.youtube], ["TikTok", L.tiktok], ["Instagram", L.instagram]].forEach(([n, u]) => {
      if (!u) return;
      const a = document.createElement("a");
      a.href = u; a.target = "_blank"; a.rel = "noopener"; a.textContent = n;
      $("#socialLinks").prepend(a);
    });
  }
  // Allgemein: <a data-link="instagram"> (oder jeder andere Schlüssel aus links) bekommt die
  // Adresse aus der Konfiguration; ist sie leer, verschwindet das Element
  $$("[data-link]").forEach((a) => {
    const u = L[a.dataset.link];
    if (u) a.href = u; else a.hidden = true;
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
  // QR-Code: die Bibliothek (57 KB) erst laden, wenn der Bereich in die Nähe kommt
  const qrBox = $("#qrCode");
  inDerNaehe(qrBox, async () => {
    try {
      if (!window.qrcode) await skriptLaden("vendor/qrcode.js");
      const qr = window.qrcode(0, "M");
      qr.addData(L.bewerten);
      qr.make();
      qrBox.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      $$("path", qrBox).forEach((p) => p.setAttribute("fill", "#0b1115"));
    } catch (e) {
      // ohne QR-Code bleibt der Knopf „Bewertung schreiben“ – den Kasten dann ausblenden
      const q = qrBox.closest(".qr"); if (q) q.hidden = true;
    }
  });
}

/* ---------- Bewertungen: Laufband ----------
   Läuft langsam von allein, wischen geht jederzeit. Bewegt wird die normale
   Scrollposition der Reihe (scrollLeft), keine verschobene Riesenebene: eine über
   20.000 px breite transform-Ebene zeichnete iPhone-Safari nach dem Hin- und
   Herscrollen nur noch in Teilen (Karten abgeschnitten). Die Karten stehen zweimal
   in der Reihe, damit sie ohne Sprung endlos läuft. Bei „Bewegung reduzieren“:
   nur wischen, nichts läuft von allein. */
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

  const row = document.createElement("div");
  row.className = "reviews__row";
  row.tabIndex = 0;
  row.setAttribute("aria-label", "Bewertungen von Fahrschülern, seitlich wischen");
  const laeuft = !reducedMotion;

  // Karten in kleinen Portionen zwischen zwei Bildern anlegen – alle auf einmal
  // blockierten auf schwächeren Handys spürbar das Scrollen
  const pause = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
  async function build() {
    box.replaceChildren(row);
    row.replaceChildren();
    const durchgaenge = laeuft ? 2 : 1;
    for (let d = 0; d < durchgaenge; d++) {
      for (let k = 0; k < list.length; k += 8) {
        const f = document.createDocumentFragment();
        list.slice(k, k + 8).forEach((b, n) => {
          const c = card(b, k + n);
          if (d) {
            // Kopie nur fürs endlose Laufen: für Vorleser und Tab-Taste unsichtbar, antippen geht
            c.setAttribute("aria-hidden", "true"); c.classList.add("is-copy");
            $(".review__more", c).tabIndex = -1;
          }
          f.append(c);
        });
        row.append(f);
        await pause();
      }
    }
    measure();
  }

  // Breite eines Durchgangs; lange Texte bekommen „Ganze Bewertung lesen“
  let haelfte = 0;
  function measure() {
    const karten = $$(".review", row);
    const orig = karten.filter((c) => !c.classList.contains("is-copy"));
    const kopie = karten.find((c) => c.classList.contains("is-copy"));
    haelfte = kopie ? kopie.offsetLeft - orig[0].offsetLeft : 0;
    // erst alles messen, dann alles ändern (sonst ein neues Seitenlayout je Karte)
    const lang = new Map(orig.map((c) => { const t = $(".review__text", c); return [c.dataset.i, !!c.dataset.gekuerzt || t.scrollHeight > t.clientHeight + 2]; }));
    karten.forEach((c) => c.classList.toggle("is-long", !!lang.get(c.dataset.i)));
  }

  // Tippen auf eine Karte öffnet die ganze Bewertung
  row.addEventListener("click", (e) => {
    const c = e.target.closest(".review");
    if (!c || !c.classList.contains("is-long")) return;
    const b = list[+c.dataset.i];
    $("#reviewTitle").textContent = b.name;
    $("#reviewFull").textContent = b.text;
    $("#reviewStars").textContent = "★".repeat(sterne(b));
    $("#reviewStars").setAttribute("aria-label", sterne(b) + " von 5 Sternen");
    $("#reviewSheet .sheet__body").scrollTop = 0;
    openSheet($("#reviewSheet"));
  });

  if (laeuft) {
    // Anhalten: Finger drauf, Maus drüber, Tastatur-Fokus, offenes Fenster;
    // nach dem Wischen kurz stehen lassen (auch während das Wischen ausrollt)
    let x = 0, gesetzt = -1, halt = 0, hover = false, fokus = false, finger = false, sichtbar = false, last = 0;
    const kurzHalten = (ms) => (halt = Math.max(halt, performance.now() + ms));
    row.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hover = true; });
    row.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") hover = false; });
    row.addEventListener("touchstart", () => { finger = true; }, { passive: true });
    addEventListener("touchend", () => { if (finger) { finger = false; kurzHalten(2500); } }, { passive: true });
    addEventListener("touchcancel", () => { finger = false; }, { passive: true });
    row.addEventListener("focusin", () => (fokus = true));
    row.addEventListener("focusout", (e) => { if (!row.contains(e.relatedTarget)) fokus = false; });
    row.addEventListener("wheel", () => kurzHalten(2500), { passive: true });
    // eigene Bewegung von Wischen unterscheiden: weicht die Position ab, war es der Mensch
    row.addEventListener("scroll", () => {
      if (Math.abs(row.scrollLeft - gesetzt) > 2) { x = row.scrollLeft; kurzHalten(1500); }
    }, { passive: true });
    new IntersectionObserver((en) => (sichtbar = en[0].isIntersecting)).observe(row);
    const schritt = (now) => {
      requestAnimationFrame(schritt);
      const dt = Math.min(64, now - (last || now)); last = now;
      if (!sichtbar || !haelfte) return;
      // endlos in beide Richtungen: immer innerhalb des ersten Durchgangs bleiben
      if (row.scrollLeft >= haelfte) { x = row.scrollLeft - haelfte; gesetzt = Math.round(x); row.scrollLeft = gesetzt; }
      else if (row.scrollLeft < 1 && (finger || now < halt)) { x = row.scrollLeft + haelfte; gesetzt = Math.round(x); row.scrollLeft = gesetzt; }
      if (finger || hover || fokus || now < halt || !$("#reviewSheet").hidden) return;
      x += 0.024 * dt; // rund 24 px pro Sekunde
      if (x >= haelfte) x -= haelfte;
      const ziel = Math.round(x);
      if (ziel !== row.scrollLeft) { gesetzt = ziel; row.scrollLeft = ziel; }
    };
    requestAnimationFrame(schritt);
  }

  // Bereich entfernen (nur wenn es wirklich nichts zu zeigen gibt: leer oder keine Freigabe)
  const weg = () => { $$("[data-kachel=stimmen]").forEach((k) => k.remove()); if ($("#stimmen")) { $("#stimmen").remove(); scroller.refresh(); } };
  // Netz weg oder Server gerade gestört: verständlich sagen und „Nochmal versuchen“ anbieten
  const stoerung = () => {
    box.innerHTML = '<p class="reviews__laden" role="status">Die Bewertungen konnten gerade nicht geladen werden. <button type="button" class="btn btn--small btn--ghost" data-nochmal><span>Nochmal versuchen</span></button></p>';
    $("[data-nochmal]", box).addEventListener("click", laden, { once: true });
    addEventListener("online", laden, { once: true });
  };
  // Zusammenfassung (Durchschnitt, Anzahl) – nur aus den echten, hier sichtbaren Bewertungen
  // (Auswahl aus der Verwaltung, nicht die Gesamtzahl bei Google). Nur wenn #reviewsSummary existiert.
  const zusammenfassen = () => {
    const box = $("#reviewsSummary");
    if (!box) return;
    const n = list.length;
    const schnitt = (list.reduce((s, b) => s + sterne(b), 0) / n).toFixed(1).replace(".", ",");
    const avg = $("#reviewsAvg"), cnt = $("#reviewsCount");
    if (avg) avg.textContent = schnitt;
    if (cnt) cnt.textContent = ` · ${n} ${n === 1 ? "Bewertung" : "Bewertungen"}`;
    box.setAttribute("role", "img");
    box.setAttribute("aria-label", `Durchschnitt ${schnitt} von 5 Sternen aus ${n} ${n === 1 ? "Bewertung" : "Bewertungen"} auf dieser Seite`);
    box.classList.remove("is-hidden");
  };
  let laedt = false;
  async function laden() {
    if (laedt) return; // Doppeltipp auf „Nochmal versuchen“
    laedt = true;
    box.innerHTML = '<p class="reviews__laden" role="status">Bewertungen werden geladen …</p>';
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 10000);
      const r = await fetch(`${B.url}/rest/v1/rpc/website_bewertungen_liste`, {
        method: "POST", headers: { apikey: B.key, "Content-Type": "application/json" }, body: "{}", signal: ctl.signal
      });
      clearTimeout(t);
      if (r.status >= 500) return stoerung();
      if (!r.ok) return weg(); // z. B. Funktion nicht freigegeben: lieber keine Bewertungen
      const d = await r.json();
      list = (Array.isArray(d) ? d : []).filter((b) => b && typeof b.name === "string" && typeof b.text === "string" && b.name && b.text);
      if (!list.length) return weg(); // alles ausgeblendet
      zusammenfassen();
      await build();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
      scroller.refresh();
    } catch (e) { stoerung(); } finally { laedt = false; }
  }
  inDerNaehe(box, laden, "1500px");
  let rt = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(measure, 150); });
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
    if ($("#bookBtn").dataset.cal === mode) return; // gleicher Knopf zweimal: nichts tun
    sw.classList.toggle("is-auto", auto);
    $$(".switch__opt", sw).forEach((b) => {
      const on = b.dataset.mode === mode;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    $("#gearSchalter").toggleAttribute("hidden", auto);
    $("#gearAutomatik").toggleAttribute("hidden", !auto);
    $("#bookBtn").dataset.cal = mode;
    $("#bookTitle").textContent = t.title;
    $("#bookText").textContent = t.text;
    einblenden([$("#bookTitle"), $("#bookText")], { y: 12, abstand: 60 });
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
   lesbar. Bewegung gibt es nur im Hintergrund-Video und bei kleinen Rückmeldungen.
   Sofort: was man oben sieht und anfassen kann. Der Rest kommt, wenn der Browser Luft hat. */
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
  setupSheets();
  setupBooking();
  setupVow();
  spaeter(() => { setupRoad(); setupTour(); setupQuiz(); setupReviews(); });
}

/* Kapitel: Bühne, Kopfzeile, Fortschritt.
   Aktiv ist das Kapitel, das die Linie bei 55 % der Bildschirmhöhe kreuzt. */
function setupChapters() {
  const num = $("#topNum"), name = $("#topName"), bar = $("#topBar");
  const links = $$("#menuList a");
  let bereiche = [], ende = 1, aktiv = -1, fortschritt = -1;
  scroller.add({
    messen(y) {
      bereiche = chapters.map((c) => { const r = c.getBoundingClientRect(); return [r.top + y, r.bottom + y]; });
      ende = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    },
    zeichnen(y, h) {
      const linie = y + h * 0.55;
      const i = bereiche.findIndex(([o, u]) => o <= linie && linie < u);
      if (i >= 0 && i !== aktiv) {
        const erstes = aktiv < 0;
        aktiv = i;
        const c = chapters[i];
        stage.show(c.id);
        num.textContent = c.dataset.kapitel;
        name.textContent = c.dataset.titel;
        links.forEach((l, k) => l.classList.toggle("is-current", k === i));
        if (!erstes) einblenden([num, name], { y: 8 });
      }
      const p = Math.min(1, Math.max(0, y / ende));
      if (Math.abs(p - fortschritt) > 0.0005) { fortschritt = p; bar.style.transform = `scaleX(${p.toFixed(4)})`; }
    }
  });
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
  // Aktiver Schritt = der letzte, dessen Oberkante die Linie bei 55 % überschritten hat.
  // Aus der Position berechnet – stimmt auch bei schnellem Scrollen und nach Sprüngen.
  let tops = [];
  set(0);
  scroller.add({
    messen(y) { tops = steps.map((s) => oben(s, y)); },
    zeichnen(y, h) {
      const linie = y + h * 0.55;
      let i = 0;
      tops.forEach((t, k) => { if (t < linie) i = k; });
      set(i);
    }
  });
}

/* Quiz „Wie möchtest du Rückmeldung bekommen?“ – Fragen, Antworten und Ergebnisse
   stehen in config.js → quiz. Vier Richtungen, je Frage eine Antwort pro Richtung. */
function setupQuiz() {
  const Q = CONFIG.quiz;
  const body = $("#quizBody"), step = $("#quizStep");
  if (!body || !step) return;
  if (!Q || !Q.fragen || !Q.fragen.length || !Q.ergebnisse) { const q = $("#quiz"); if (q) q.hidden = true; return; }
  const T = Object.assign({ frage: "Frage {n} von {gesamt}", ergebnis: "Dein Ergebnis", vorsatz: "", schluss: "", nochmal: "Nochmal machen" }, Q.texte);
  const richtungen = Object.keys(Q.ergebnisse);
  let i = 0, last = null, lockUntil = 0;
  const score = {};
  const nullen = () => richtungen.forEach((k) => (score[k] = 0));
  nullen();
  // gleichmäßig mischen (Fisher-Yates) – sort(Math.random) bevorzugt bestimmte Plätze
  const shuffle = (a) => { for (let j = a.length - 1; j > 0; j--) { const r = Math.floor(Math.random() * (j + 1)); [a[j], a[r]] = [a[r], a[j]]; } return a; };
  const render = (animieren = true) => {
    lockUntil = performance.now() + 350; // ein Doppeltipp überspringt keine Frage
    const f = Q.fragen[i];
    step.textContent = T.frage.replace("{n}", i + 1).replace("{gesamt}", Q.fragen.length);
    body.innerHTML = '<p class="quiz__q"></p><div class="quiz__opts"></div>';
    $(".quiz__q", body).textContent = f.q;
    // Reihenfolge der Antworten mischen, damit keine Richtung immer oben steht
    shuffle(Object.keys(f.a).filter((k) => k in score)).forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "quiz__opt";
      b.dataset.key = k;
      b.append(Object.assign(document.createElement("span"), { textContent: f.a[k] }));
      b.addEventListener("click", () => {
        if (performance.now() < lockUntil) return;
        lockUntil = Infinity;
        score[k]++; last = k; i++;
        i < Q.fragen.length ? render() : result();
      });
      $(".quiz__opts", body).append(b);
    });
    if (animieren) einblenden($$(".quiz__q, .quiz__opt", body), { y: 8, dauer: 350, abstand: 40 });
  };
  const result = () => {
    // Gleichstand: die zuletzt gewählte der gleichauf liegenden Richtungen
    const max = Math.max(...Object.values(score));
    const tied = Object.keys(score).filter((k) => score[k] === max);
    const top = tied.length === 1 ? tied[0] : tied.includes(last) ? last : tied[Math.floor(Math.random() * tied.length)];
    const t = Q.ergebnisse[top];
    step.textContent = T.ergebnis;
    // Symbol je Richtung (SVG aus config.js); ohne Symbol die alte Farbkugel
    const symbol = t.symbol
      ? `<div class="quiz__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${t.symbol}</svg></div>`
      : '<div class="quiz__orb"></div>';
    body.innerHTML = `<div class="quiz__result quiz__result--rueckmeldung">${symbol}<div><h4><small></small><span></span></h4><p></p><p class="quiz__so"></p><button class="quiz__again" type="button"></button></div></div>`;
    const box = $(".quiz__result", body);
    box.style.setProperty("--col", t.farbe || "var(--gold)");
    box.dataset.richtung = top;
    // Überschrift: kleine Zeile = Vorsatz („Dir hilft am meisten“), groß = Name der Richtung
    const klein = $("h4 small", body);
    if (T.vorsatz) klein.textContent = T.vorsatz; else klein.remove();
    $("h4 span", body).textContent = t.name;
    $(".quiz__result p", body).textContent = t.text;
    const so = $(".quiz__so", body);
    if (T.schluss) so.textContent = T.schluss; else so.remove();
    const again = $(".quiz__again", body);
    again.textContent = T.nochmal;
    again.addEventListener("click", () => { i = 0; last = null; nullen(); render(); });
    // kurzes Einblenden (unter 0,4 s), bei „Bewegung reduzieren“ keins
    einblenden($$(".quiz__icon, .quiz__orb, .quiz__result h4, .quiz__result p, .quiz__again", body), { y: 8, dauer: 350, abstand: 50 });
  };
  render(false);
}

/* Dein Weg: die goldene Linie wächst mit dem Scrollen bis zur Linie bei 60 %;
   jede Nummer, die sie erreicht, wird größer und golden. Rein aus der Position
   berechnet – stimmt auch nach Sprüngen und in beide Richtungen. */
function setupRoad() {
  const road = $("#road");
  if (!road) return;
  const steps = $$(".road__step", road);
  let rOben = 0, rHoehe = 1, mitten = [], prog = -1;
  const erreicht = steps.map(() => null);
  scroller.add({
    messen(y) {
      const r = road.getBoundingClientRect();
      rOben = r.top + y; rHoehe = r.height;
      // Mitte der Nummer ohne die Vergrößerung (transform) – also aus dem Layout
      mitten = steps.map((s) => { const n = $(".road__n", s); return oben(s, y) + n.offsetTop + n.offsetHeight / 2; });
    },
    zeichnen(y, h) {
      const linie = y + h * 0.6;
      const p = Math.min(1, Math.max(0, (linie - rOben - 10) / Math.max(1, rHoehe - 20)));
      if (Math.abs(p - prog) > 0.0005) { prog = p; road.style.setProperty("--prog", p.toFixed(4)); }
      steps.forEach((s, k) => {
        const an = mitten[k] <= linie;
        if (erreicht[k] !== an) { erreicht[k] = an; s.classList.toggle("is-reached", an); }
      });
    }
  });
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
  const open = (el) => { if (!el.hidden) return; lastFocus = document.activeElement; el.hidden = false; el._offenSeit = performance.now(); hinten(true); lockScroll(true); setTimeout(() => $(".sheet__close", el).focus(), 50); };
  const close = (el) => { el.hidden = true; if (!sheetOpen()) hinten(false); lockScroll(menuOpen()); lastFocus && lastFocus.focus(); };
  // gleiche Adresse nicht neu laden – ein angefangener Buchungsvorgang bleibt erhalten
  const loadFrame = () => { consent.hidden = true; frame.hidden = false; if (frame.getAttribute("src") !== currentUrl) frame.src = currentUrl; try { sessionStorage.setItem("serband-cal-ok", "1"); } catch (e) {} };
  $$("[data-cal]").forEach((b) => b.addEventListener("click", () => {
    if (!sheet.hidden) return; // Doppeltipp: Fenster ist schon offen
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
