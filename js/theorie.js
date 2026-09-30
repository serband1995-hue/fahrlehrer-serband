// Theorie-Seite: Folie antippen = groß ansehen (ohne JS öffnet der Link einfach das Bild)
(() => {
  const links = [...document.querySelectorAll(".folie__bild")];
  const lupe = document.getElementById("lupe");
  const bild = document.getElementById("lupeBild");
  const text = document.getElementById("lupeText");
  const zu = document.getElementById("lupeZu");
  const weiter = document.getElementById("lupeWeiter");
  const zurueck = document.getElementById("lupeZurueck");
  if (!lupe || !links.length) return;
  let nr = -1, vorher = null;

  function zeigen(i) {
    nr = (i + links.length) % links.length;
    const a = links[nr], img = a.querySelector("img");
    bild.src = a.getAttribute("href");
    bild.alt = img.alt;
    const cap = a.closest("figure").querySelector("figcaption");
    text.textContent = cap ? cap.textContent : "";
  }
  function oeffnen(i) {
    vorher = document.activeElement;
    zeigen(i);
    lupe.hidden = false;
    document.body.classList.add("lupe-offen");
    document.querySelectorAll(".legal-nav, main").forEach((el) => (el.inert = true));
    zu.focus();
  }
  function schliessen() {
    lupe.hidden = true;
    document.body.classList.remove("lupe-offen");
    document.querySelectorAll(".legal-nav, main").forEach((el) => (el.inert = false));
    bild.removeAttribute("src");
    if (vorher && vorher.focus) vorher.focus();
  }

  links.forEach((a, i) => a.addEventListener("click", (e) => { e.preventDefault(); oeffnen(i); }));
  zu.addEventListener("click", schliessen);
  weiter.addEventListener("click", () => zeigen(nr + 1));
  zurueck.addEventListener("click", () => zeigen(nr - 1));
  lupe.addEventListener("click", (e) => { if (e.target === lupe) schliessen(); });
  document.addEventListener("keydown", (e) => {
    if (lupe.hidden) return;
    if (e.key === "Escape") schliessen();
    else if (e.key === "ArrowRight") zeigen(nr + 1);
    else if (e.key === "ArrowLeft") zeigen(nr - 1);
  });
  let x0 = null;
  lupe.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lupe.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const d = e.changedTouches[0].clientX - x0;
    x0 = null;
    if (Math.abs(d) > 60) zeigen(nr + (d < 0 ? 1 : -1));
  });
})();
