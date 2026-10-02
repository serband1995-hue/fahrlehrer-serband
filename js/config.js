/* ============================================================
   INHALTE DER SEITE – hier änderst du Texte, Links und Bilder.
   Alles, was mit  TODO  markiert ist, fehlt noch von Serband.
   ============================================================ */

export const CONFIG = {
  name: "Serband",
  rolle: "Fahrlehrer",
  schule: "Fahrschule Boost",
  ort: "Offenbach am Main",

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
    schule: "https://fahrschule-boost.de/",
    preise: "https://fahrschule-boost.de/",
    telefon: "+496936605670",
    telefonAnzeige: "069 · 36 60 56 70",
    whatsapp: "https://wa.me/496936605670",
    instagram: "https://www.instagram.com/fahrlehrerserband/",
    tiktok: "",    // noch keins – leer = Knopf wird nicht gezeigt
    impressum: "impressum.html",     // TODO: markierte Stellen in impressum.html ausfüllen
    datenschutz: "datenschutz.html"  // TODO: markierte Stellen in datenschutz.html ausfüllen
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

  // Fotos: jeweils groß (src) und klein fürs Handy. Leer ("") = Foto wird ausgeblendet.
  //   portrait:   „Mein Versprechen“ (Kapitel III)
  //   unterricht: Theorieunterricht (Kapitel I) – alle erkennbaren Personen haben eingewilligt
  fotos: {
    portrait: { src: "img/serband-portrait-1000.jpg", klein: "img/serband-portrait-640.jpg", breite: 1000, kleinBreite: 640 },
    unterricht: { src: "img/serband-unterricht-1600.jpg", klein: "img/serband-unterricht-900.jpg", breite: 1600, kleinBreite: 900 }
  },

  // TODO: Videos aus der Ausbildung (mp4 in serband/img oder leer lassen).
  // Leer = es läuft eine Animation an dieser Stelle.
  videos: {
    theorie: "",
    fahrstunde: "",
    pruefung: ""
  },

  // TODO: echte Zahlen. Einträge mit wert: null werden nicht angezeigt.
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
