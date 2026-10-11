# www.fahrlehrer-serband.de

Webseite von Serband, Fahrlehrer in Offenbach am Main (Ausbildung über die Fahrschule Boost).
Statische Seite, veröffentlicht mit GitHub Pages aus `main` (Ordner `/`), eigene Domain über die Datei `CNAME`.
Bis Ende September 2026 lag die Seite im Ordner `serband/` des Repositorys Fahrlehrer-Kompass-.

# Serband – Landingpage

Landingpage als Film in Kapiteln: Start → I Ruhe statt Geschrei → II Du bist nicht wie alle (Quiz „Wie möchtest du Rückmeldung bekommen?“) → III Mein Versprechen → IV Die Werkzeuge dahinter (App-Tour) → V Langweilige Theorie war gestern → VI Dein Weg → VII Los geht's (Klassen, Buchen, Fragen, Bewertungen) → Epilog. Der Reaktionstest mit Bestenliste liegt auf `theorie.html` (Lektion 1).

Jedes Kapitel hat einen eigenen Hintergrund (`js/config.js` → `szenen`): ein Video quer (`video`) und eins hoch fürs Handy (`videoHandy`) als MP4 (`img/schleife-*.mp4`), dazu das erste Bild als Standbild (`bild`, `bildHandy`). Die Videos laufen ruhig in Endlosschleife: vorwärts, die letzten 0,8 s weich in den Anfang überblendet (kein Rückwärtslauf, sonst fahren Autos rückwärts). Die Kreuzung (Kapitel II) blendet an der Nahtstelle kurz über Dunkel, damit die Ampel nur in der richtigen Folge Rot → Rot-Gelb → Grün zu sehen ist. Quer 1600×900, hoch 720×1280, ohne Ton.

Die Szenen (Higgsfield, Kling 3.0, je 5 s) erzählen eine Fahrt von der Nacht in den Morgen: Tiefgarage → Stadtstraße → Kreuzung → Landstraße → Innenraum → Autobahn → Frankfurter Skyline. Der Epilog nutzt das Prolog-Video. Besonderheiten:

- **Kreuzung (Kapitel II):** Die KI konnte die deutsche Ampelfolge nicht zuverlässig darstellen. Das Video ist deshalb mit fester Kamera und roter Ampel erzeugt; Rot → Rot-Gelb → Grün samt Spiegelung auf der Straße ist nachträglich Bild für Bild eingesetzt. In der Hochformat-Fassung driftete die Kamera, sie ist stabilisiert (4 % Zoom); das Auto rollt erst bei Grün an.
- **Landstraße hoch (Kapitel III):** auf 3,3 s gekürzt, danach tauchte ein Fehler im Bild auf.
- **Skyline quer (Kapitel VII):** auf 4,5 s gekürzt, danach verzog sich die Schrift auf dem Dachschild.
- Die Videos enthalten das maschinenlesbare KI-Kennzeichen von Kling (AIGC-Metadaten), das bewusst übernommen und nicht entfernt wird.
- **Datensparmodus:** Ist am Handy „Datensparen“ an, zeigt die Seite nur die Standbilder (Android/Chrome; Safari meldet diesen Modus nicht).

Fotos stehen unter `fotos`: `portrait` (Kapitel III, „Mein Versprechen“), groß + klein fürs Handy; leer = Foto ausblenden. Das Unterrichtsfoto auf `theorie.html` steht fest im HTML (alle erkennbaren Personen haben eingewilligt).

## Inhalte ändern

Links, Fotos, Szenen, Klassen, Sprachen und die Quiz-Texte stehen in **`js/config.js`**.
Die übrigen Texte (Kapitel, Fragen und Antworten, Unterseiten) stehen direkt in den HTML-Dateien.
Was noch fehlt, ist in `config.js` mit `TODO` markiert:

- `links` – Buchungskalender (Schaltung/Automatik), Fahr-Akademie, Google-Bewertungen, Telefon, WhatsApp, Social-Profile `instagram`, `tiktok`, `youtube` (leer = Knopf wird nicht gezeigt). Jedes `<a data-link="schlüssel">` auf der Startseite bekommt die Adresse aus `links`, leer = ausgeblendet.
- `quiz` – Fragen, vier Richtungen (`sofort`, `ende`, `ruhe`, `bild`) und Ergebnistexte des Quiz in Kapitel II
- `teilen.reaktion` – Adresse, die beim Teilen des Reaktionstest-Ergebnisses mitgeschickt wird
- `klassen` – Fahrlehrerlaubnis-Klassen mit Bleistift-Skizze (Kapitel VII und Impressum, Zeichnungen in `js/klassen.js`)
- `sprachen` – Sprachen der Fahr-Akademie, erscheinen in der App-Tour (Kapitel IV). App-Bilder: `img/app-*.jpg` (Beispieldaten „Lea Beispiel“, keine echten Schüler, keine Bestehensquote)
- `links.bewerten` – direkter Google-Link „Rezension schreiben“ (wird auch als QR-Code gezeigt)
- `videos.*` und `zahlen` stehen noch in der Konfiguration, werden von der Seite aber derzeit nicht angezeigt
- Bewertungen – werden in der Verwaltung der Fahr-Akademie gepflegt (Reiter „Bewertungen“, nur Super-Admin) und beim Heranscrollen über `website_bewertungen_liste()` geladen. Laufband „Frag nicht mich. Frag meine Fahrschüler.“ über dem Epilog. Ist alles ausgeblendet, verschwindet der Bereich; bei Netz- oder Serverstörung erscheint „Nochmal versuchen“. `links.bewertungen` = Knopf „Alle Bewertungen auf Google“
- `datenschutz.html` Abschnitt 4 – Zwischentext ersetzen, sobald die Fahrschule Boost schriftlich nennt, wer für die Buchungsdaten verantwortlich ist und auf welcher Grundlage Daten in die USA gehen
- **Social-Profil oder Fragen geändert?** Dann das JSON-LD im `<head>` von `index.html` anpassen (`sameAs` bzw. `FAQPage` muss wörtlich zu den sichtbaren Fragen passen).

## Aufbau

| Datei | Inhalt |
|---|---|
| `index.html` | Seitenstruktur und Texte der Abschnitte |
| `ueber-mich.html`, `praxis.html`, `theorie.html` | Unterseiten (Texte aus Serbands eigenen Antworten, Theorie mit echten Unterrichtsfolien in `img/theorie/`) |
| `css/style.css` | Design (Farben oben in `:root`) |
| `js/stage.js` | Bühne: Hintergrund je Kapitel, Video in Endlosschleife |
| `js/main.js` | Kapitelanzeige, App-Tour, Quiz, Bewertungen, Kalender (ruhig: kein Vorspann, kein Nachgleiten). Ohne Animations-Bibliothek: eigener sparsamer Scroll-Taktgeber, kleine Animationen per Web Animations API |
| `js/klassen.js` | Bleistift-Skizzen der Klassen (Startseite, Impressum) |
| `js/theorie.js` | Theorie-Seite: Folien groß ansehen |
| `js/reaktion.js` | Reaktionstest mit Bestenliste und „Ergebnis teilen“ (Theorie-Seite, Lektion 1) |
| `db/bestenliste.sql` | Datenbank-Teil der Bestenliste (Supabase-Projekt der Fahr-Akademie) |
| `vendor/qrcode.js`, `fonts/` | QR-Code-Bibliothek (wird erst beim Heranscrollen geladen) und Schriften, lokal gespeichert (keine Google-Server) |

Die Seite setzt keine Cookies und nutzt kein Tracking. Der Buchungskalender wird erst nach einem Klick geladen.
Im Browser gespeichert werden nur: `localStorage` `serband-name` (zuletzt in der Bestenliste eingetragener Name) und `sessionStorage` `serband-cal-ok` (Kalender in diesem Tab freigegeben).
