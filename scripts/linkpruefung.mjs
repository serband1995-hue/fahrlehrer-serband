// Linkprüfung ohne Netz: Jeder lokale Verweis (href, src, srcset, poster) in den
// HTML-Dateien und jedes url(...) in den CSS-Dateien muss auf eine Datei im Repo zeigen.
// Externe Adressen (http, https, mailto, tel, data, //) werden nicht geprüft.
// Aufruf: node scripts/linkpruefung.mjs   (Rückgabe 0 = in Ordnung, 1 = fehlende Dateien)
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname, relative, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const wurzel = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const AUSLASSEN = new Set([".git", "node_modules"]);

function dateien(ordner) {
  const liste = [];
  for (const name of readdirSync(ordner)) {
    if (AUSLASSEN.has(name)) continue;
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) liste.push(...dateien(pfad));
    else liste.push(pfad);
  }
  return liste;
}

function istExtern(ziel) {
  return /^([a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ziel) || ziel.includes("${") || ziel === "";
}

function aufloesen(datei, ziel) {
  const ohne = decodeURI(ziel.split("#")[0].split("?")[0]);
  if (ohne === "") return null;
  let pfad = ohne.startsWith("/") ? join(wurzel, ohne) : join(dirname(datei), ohne);
  if (existsSync(pfad) && statSync(pfad).isDirectory()) pfad = join(pfad, "index.html");
  return pfad;
}

const fehlend = [];
let geprueft = 0;
for (const datei of dateien(wurzel)) {
  const art = extname(datei);
  if (art !== ".html" && art !== ".css") continue;
  const text = readFileSync(datei, "utf8");
  const ziele = [];
  if (art === ".html") {
    for (const m of text.matchAll(/\s(?:href|src|poster)\s*=\s*["']([^"']*)["']/gi)) ziele.push(m[1].trim());
    for (const m of text.matchAll(/\ssrcset\s*=\s*["']([^"']*)["']/gi))
      for (const teil of m[1].split(",")) ziele.push(teil.trim().split(/\s+/)[0]);
  }
  for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) ziele.push(m[1].trim());
  for (const ziel of ziele) {
    if (istExtern(ziel)) continue;
    const pfad = aufloesen(datei, ziel);
    if (!pfad) continue;
    geprueft++;
    if (!existsSync(pfad)) fehlend.push(`${relative(wurzel, datei)}: ${ziel}`);
  }
}

if (fehlend.length) {
  console.log(`Linkprüfung: ${fehlend.length} fehlende Dateien (von ${geprueft} Verweisen):`);
  for (const f of fehlend) console.log("  " + f);
  process.exit(1);
}
console.log(`Linkprüfung: ${geprueft} lokale Verweise, 0 fehlen.`);
