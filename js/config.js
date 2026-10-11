/* ============================================================
   INHALTE DER SEITE – hier änderst du Links, Bilder, Videos,
   Klassen, Sprachen und die Texte des Rückmeldungs-Quiz.
   Die übrigen Texte stehen direkt in den HTML-Dateien.
   Alles, was mit  TODO  markiert ist, fehlt noch von Serband.
   ============================================================ */

export const CONFIG = {
  links: {
    // Die beiden Buchungskalender
    kalenderSchalter: "https://service.fahrschule-boost.de/widget/bookings/fahrlehrer-serband",
    kalenderAutomatik: "https://service.fahrschule-boost.de/widget/bookings/geteilter-kalender-1?user_id=HAT9XdpG8Zo71cfatl5L",
    // Die Fahr-Akademie (Lern-App mit Videos)
    akademie: "https://serband1995-hue.github.io/Fahr-Akademie-/",
    // Google-Profil der Fahrschule Boost: direkt „Rezension schreiben“ (auch der QR-Code)
    bewerten: "https://search.google.com/local/writereview?placeid=ChIJ0UPFLoIPvUcREq2efNEsxEg",
    // Alle Bewertungen lesen (Profil in Google Maps)
    bewertungen: "https://maps.app.goo.gl/aHvbCk1vxRKHfqxP9",
    preise: "https://fahrschule-boost.de/",
    telefon: "+496936605670",
    telefonAnzeige: "069 · 36 60 56 70",
    whatsapp: "https://wa.me/496936605670",
    // Social-Profile: leer ("") = Knopf wird nicht gezeigt.
    // Wer eins ändert, ändert es auch in index.html im <head> (JSON-LD → "sameAs").
    instagram: "https://www.instagram.com/fahrlehrerserband/",
    tiktok: "",    // TODO: noch keins
    youtube: "",   // TODO: noch keins
    facebook: ""   // TODO: noch keins
  },

  // Adresse, unter der ein geteiltes Ergebnis des Reaktionstests landet
  teilen: {
    reaktion: "https://www.fahrlehrer-serband.de/theorie.html#test"
  },

  // Quiz in Kapitel II: „Wie möchtest du Rückmeldung bekommen?“
  // Vier Richtungen (Schlüssel): sofort, ende, ruhe, bild.
  // Jede Frage hat zu jeder Richtung eine Antwort; die Reihenfolge wird gemischt.
  // symbol = Innenteil eines SVG (24×24, nur Linien), erscheint beim Ergebnis.
  // PLATZHALTER: Texte werden noch von Serband / Agent 2 ersetzt.
  quiz: {
    fragen: [
      { q: "Du hast in der Fahrstunde einen Fehler gemacht. Was hilft dir am meisten?",
        a: { sofort: "Sag es mir gleich, kurz und klar.", ende: "Lass uns nach der Fahrt in Ruhe darüber reden.", ruhe: "Erst mal anhalten und durchatmen.", bild: "Zeig es mir, am besten mit einer Skizze." } },
      { q: "Eine neue Aufgabe steht an, zum Beispiel Einparken. Wie fängst du am liebsten an?",
        a: { sofort: "Einfach probieren, du korrigierst mich unterwegs.", ende: "Erst einmal machen, danach gehen wir es durch.", ruhe: "Langsam, mit Pausen zwischen den Versuchen.", bild: "Vorher ein Bild oder Video ansehen." } },
      { q: "Was nimmst du nach einer Stunde gern mit?",
        a: { sofort: "Einen Satz: Das war gut, das üben wir noch.", ende: "Eine ausführliche Rückmeldung zu allem.", ruhe: "Das Gefühl, dass ich in meinem Tempo lernen darf.", bild: "Etwas zum Nachschauen in der App." } },
      { q: "Im Verkehr wird es hektisch. Was brauchst du dann?",
        a: { sofort: "Klare, kurze Ansagen.", ende: "Erst fahren, später erklären.", ruhe: "Eine ruhige Stimme und etwas Zeit.", bild: "Hinterher eine Zeichnung, wie es richtig gewesen wäre." } }
    ],
    ergebnisse: {
      sofort: { name: "Sofort und kurz", titel: "Sag es mir gleich", farbe: "var(--red)",
        symbol: '<path d="M13 3 5 14h6l-1 7 8-11h-6l1-7z"/>',
        text: "Du willst gleich wissen, was los war. Dann sage ich es dir kurz und klar, direkt an der Stelle, und wir fahren weiter." },
      ende: { name: "Am Ende und ausführlich", titel: "Erst fahren, dann reden", farbe: "var(--blue)",
        symbol: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 9h6M9 13h6M9 17h4"/>',
        text: "Während der Fahrt bleibt es ruhig. Nach der Stunde gehen wir alles in Ruhe durch, Punkt für Punkt." },
      ruhe: { name: "Mit Ruhepausen", titel: "Durchatmen, dann weiter", farbe: "var(--green)",
        symbol: '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>',
        text: "Wenn es zu viel wird, halten wir an. Erst durchatmen, dann besprechen, dann geht es weiter." },
      bild: { name: "Mit Bildern und Skizzen", titel: "Zeig es mir", farbe: "var(--yellow)",
        symbol: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="9.5" r="1.5"/>',
        text: "Ich zeige es dir auf dem iPad oder zeichne es auf. In der Fahr-Akademie kannst du dir die Stelle danach noch einmal ansehen." }
    },
    texte: {
      frage: "Frage {n} von {gesamt}",
      ergebnis: "Dein Ergebnis",
      vorsatz: "Dir hilft am meisten:",
      schluss: "Das ist ein Anfang. Wie es dir wirklich hilft, finden wir in der ersten Stunde zusammen heraus.",
      nochmal: "Nochmal machen"
    }
  },

  // Hintergrund pro Kapitel: ein Video quer (Computer, Tablet quer) und eins hoch (Handy).
  // Die Videos laufen in Endlosschleife: vorwärts, das Ende weich in den Anfang überblendet.
  //   video / videoHandy: MP4 (H.264)
  //   bild / bildHandy: Standbild = erstes Bild des Videos (wird gezeigt, bis das Video läuft)
  //   fokus / fokusHandy: Bildausschnitt, wenn das Seitenverhältnis nicht genau passt
  szenen: {
    standard: { bild: "img/hero.jpg", bildHandy: "img/hero-mobile.jpg", fokus: "70% 50%" },
    prolog: { video: "img/schleife-prolog.mp4", videoHandy: "img/schleife-prolog-hoch.mp4", bild: "img/szene-prolog.jpg", bildHandy: "img/szene-prolog-hoch.jpg", fokus: "68% 50%", fokusHandy: "50% 50%" },
    ruhe: { video: "img/schleife-ruhe.mp4", videoHandy: "img/schleife-ruhe-hoch.mp4", bild: "img/szene-ruhe.jpg", bildHandy: "img/szene-ruhe-hoch.jpg", fokus: "68% 50%", fokusHandy: "50% 50%" },
    typ: { video: "img/schleife-typ.mp4", videoHandy: "img/schleife-typ-hoch.mp4", bild: "img/szene-typ.jpg", bildHandy: "img/szene-typ-hoch.jpg", fokus: "60% 30%", fokusHandy: "22% 50%" },
    versprechen: { video: "img/schleife-versprechen.mp4", videoHandy: "img/schleife-versprechen-hoch.mp4", bild: "img/szene-versprechen.jpg", bildHandy: "img/szene-versprechen-hoch.jpg", fokus: "68% 50%", fokusHandy: "50% 50%" },
    werkzeuge: { video: "img/schleife-werkzeuge.mp4", videoHandy: "img/schleife-werkzeuge-hoch.mp4", bild: "img/szene-werkzeuge.jpg", bildHandy: "img/szene-werkzeuge-hoch.jpg", fokus: "50% 50%", fokusHandy: "50% 50%" },
    unterricht: { video: "img/schleife-werkzeuge.mp4", videoHandy: "img/schleife-werkzeuge-hoch.mp4", bild: "img/szene-werkzeuge.jpg", bildHandy: "img/szene-werkzeuge-hoch.jpg", fokus: "50% 50%", fokusHandy: "50% 50%" },
    weg: { video: "img/schleife-weg.mp4", videoHandy: "img/schleife-weg-hoch.mp4", bild: "img/szene-weg.jpg", bildHandy: "img/szene-weg-hoch.jpg", fokus: "58% 50%", fokusHandy: "50% 50%" },
    los: { video: "img/schleife-los.mp4", videoHandy: "img/schleife-los-hoch.mp4", bild: "img/szene-los.jpg", bildHandy: "img/szene-los-hoch.jpg", fokus: "65% 50%", fokusHandy: "50% 50%" },
    epilog: { video: "img/schleife-prolog.mp4", videoHandy: "img/schleife-prolog-hoch.mp4", bild: "img/szene-prolog.jpg", bildHandy: "img/szene-prolog-hoch.jpg", fokus: "68% 50%", fokusHandy: "50% 50%" }
  },

  // Fahrlehrerlaubnis: jede Klasse mit Bleistift-Skizze (js/klassen.js → SKIZZEN).
  // Neue Klasse = neue Zeile; für eine neue Fahrzeugart muss die Skizze erst gezeichnet werden.
  klassen: [
    { klasse: "B", name: "Auto", skizze: "auto" },
    { klasse: "BE", name: "Auto mit Anhänger", skizze: "anhaenger" }
  ],

  // Sprachen der Fahr-Akademie (App-Tour, Kapitel IV). Neue Sprache einfach anhängen.
  // Sprachen der Fahr-Akademie, Namen wie in der App (Stand 02.10.2026: Deutsch + 17).
  // Neue Sprache in der Akademie = hier eine Zeile ergänzen; Zahl und Liste auf der Seite folgen.
  sprachen: [
    { code: "de", name: "Deutsch" }, { code: "tr", name: "Türkçe" }, { code: "en", name: "English" },
    { code: "ar", name: "العربية" }, { code: "es", name: "Español" }, { code: "ru", name: "Русский" },
    { code: "sr", name: "Srpski" }, { code: "ckb", name: "کوردی (سۆرانی)" }, { code: "kmr", name: "Kurdî (Kurmancî)" },
    { code: "hi", name: "हिन्दी" }, { code: "ur", name: "اردو" }, { code: "vi", name: "Tiếng Việt" },
    { code: "rif", name: "Tarifit" }, { code: "fa", name: "فارسی" }, { code: "ps", name: "پښتو" },
    { code: "el", name: "Ελληνικά" }, { code: "am", name: "አማርኛ" }, { code: "ti", name: "ትግርኛ" }
  ],

  // Bestenliste des Reaktionstests (Supabase-Projekt „fahr-akademie“, getrennte Tabelle).
  // Öffentlicher Schlüssel (für Webseiten gedacht). Was er darf, regeln die Datenbankregeln:
  // Besucher können nur die Top 5 lesen und eine Zeit eintragen, sonst nichts.
  bestenliste: {
    url: "https://fxgljvhpikjcejhghgbp.supabase.co",
    key: "sb_publishable_XiBZufRB7XMpxhJwfWxKFA_PmtFC6ly"
  },

  // Fotos: groß (src) und klein fürs Handy. Leer ("") = Foto wird ausgeblendet.
  //   portrait: „Mein Versprechen“ (Kapitel III, img[data-foto="portrait"])
  // (Das Unterrichtsfoto auf theorie.html steht fest im HTML.)
  fotos: {
    portrait: { src: "img/serband-portrait-1000.jpg", klein: "img/serband-portrait-640.jpg", breite: 1000, kleinBreite: 640 }
  },

  // TODO (Entscheidung Serband): Videos aus der Ausbildung (mp4 in img/) – oder Feld streichen.
  // Wird derzeit von keinem Skript gelesen, also auf der Seite NICHT angezeigt.
  videos: {
    theorie: "",
    fahrstunde: "",
    pruefung: ""
  },

  // TODO (Entscheidung Serband): echte Zahlen – oder Feld streichen. Keine erfundenen Werte.
  // Wird derzeit von keinem Skript gelesen, also auf der Seite NICHT angezeigt.
  zahlen: [
    { wert: null, suffix: "+", label: "bestandene Prüfungen" },
    { wert: null, suffix: "", label: "Jahre am Steuer" },
    { wert: null, suffix: "", label: "Sterne bei Google", dezimal: 1, stern: true },
    { wert: 90, suffix: " Min", label: "pro Doppelstunde" }
  ],

  // Bewertungen: werden in der Verwaltung der Fahr-Akademie gepflegt (Reiter „Bewertungen“)
  // und von dort geladen (Supabase-Funktion website_bewertungen_liste). Hier steht bewusst
  // nichts mehr – sonst würden ausgeblendete Bewertungen weiter auf der Seite auftauchen.
};
