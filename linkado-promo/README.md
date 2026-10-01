# Linkado – Werbefilm (64 s)

Ein Werbefilm für **Linkado**, den europäischen digitalen Arbeitsplatz auf Nextcloud-Basis:
**Chaos der Insellösungen → Klarheit → das Linkado-Logo kristallisiert heraus.** Mit ruhigem, schrittweise
wachsendem Techno. Konzept und Dramaturgie: [`KONZEPT.md`](KONZEPT.md).

| Datei | Inhalt |
|---|---|
| `out/linkado-werbefilm-4k.mp4` | Master, 3840×2160, 30 fps, H.264, AAC 256 kbit/s |
| `out/linkado-werbefilm-1080p.mp4` | Web-Fassung, 1920×1080, 30 fps |
| `out/poster.png` | Standbild (Endkarte) |
| `audio/soundtrack.mp3` | Musik als eigene Tonspur (48 kHz, −14 LUFS, Spitzen ≤ −1 dBFS); die verlustfreie `soundtrack.wav` erzeugt `python3 audio/soundtrack.py` |
| `audio/soundtrack-leise.mp3` | dieselbe Musik, −20 LUFS (Messe / Empfang / Hintergrund) |
| `audio/stems/*.wav` | Stems für den Schnitt: drums · bass · pad · music · bells (inkl. UI) · fx (24 Bit, ohne Sättigung/Limiter; Summe ≈ Master) – entstehen beim Ton-Rendern |
| `KONZEPT.md` · `KONZEPTE-WEITERDENKEN.md` · `PLAN.md` | Dramaturgie, weitergedachte Konzepte (Fassungen, Faden, KI, Ton), priorisierter Plan |
| `Sprechertext-Vorschlag.md` | optionaler Sprechertext mit Zeitmarken |

> **Platzhalter / bitte prüfen**
> * Das **Logo** ist aus den gelieferten Abbildungen als Vektor nachgezeichnet (`src/logo.js`). Liegt das Original-SVG vor,
>   die Pfade in `LOGO.parts` ersetzen – alle Szenen greifen nur auf `LOGO` zu.
> * **Farben** sind aus Screenshots/Logo geschätzt (`src/brand.css`, Block `:root`). Exakte Hex-Werte dort eintragen.
> * Die **Oberflächen** (Startseite „Ihr Tag“, Apps und Pakete, Support, Leiste) sind nach **echten Screenshots der Cloud** nachgebaut (`src/ui.js`). Die Instanz war leer;
>   **alle Inhalte (Termine, Dateien, Anfragen, Namen, Assistent-Antworten) sind erfundene Demo-Daten**. Szenen 02–04 tragen „SNEAK PEEK“.
>   Die Original-Screenshots liegen lokal in `refs/` (nicht im Repository: enthalten Instanz-Daten).
> * Im Chaos-Teil werden **keine Produkt- oder Firmennamen** genannt: drei allgemeine Ansätze (Allrounder, fertiges Portal, offene Basis), jeweils „erst Stärke, dann *Aber:*“. Bitte inhaltlich freigeben.
>   Nextcloud kommt nur als eure eigene Basis vor (Szene 01, Schlusszeile).
> * Im Logo-Lockup steht „Der europäische digitale Arbeitsplatz“; im Briefing war von „offenem Arbeitsplatz“ die Rede.
>   Umstellen: Konstante `TAGLINE` in `src/scenes/finale.js`.

## Aufbau

```
timeline.json            Zeitplan: 32 Takte à 2 s (120 BPM), Szenen und „hits“ (Bild-/Ton-Akzente) – der Vertrag zwischen Bild und Ton
src/                     der Film als HTML-Animation (jedes Bild ist eine reine Funktion der Zeit t)
  engine.js kit.js ui.js   Mini-Engine, Act-II-Bausteine, nachgebaute Linkado-Oberfläche (home / apps / support)
  logo.js brand.css        Logo (Vektor) und Marken-Variablen (Farben, Schriften)
  scenes/act1.js           Chaos: Hook, drei allgemeine Ansätze (ohne Namen), Überforderung in fünf Blickwinkeln, Pause/Sog in den Drop
  scenes/act2.js           Klarheit 01–04: Rohfassung→Linkado, Übersicht + großes Menü mit Suche und Assistent, Apps und Pakete, Support + Fortschrittsfaden
  scenes/act2b.js          05 Gesamtpaket (Kettenglieder), 06 Mehr Zeit (Zeitleiste), Übergabe-Knoten
  scenes/finale.js         Kristallisation, Logo, Schlusszeilen, Tagline, CTA
audio/soundtrack.py      synthetischer Soundtrack v3 (numpy/scipy), liest die hits aus timeline.json (auch Klicks, Tippen, Swipes, Flüge)
audio/alt/               frühere Fassungen des Tons (v1, v2)
render.mjs               rendert Frame für Frame mit Headless-Chromium (Playwright)
build.sh                 komplette Produktion (Ton → Bilder → ffmpeg)
```

## Neu rendern

```bash
npm install                          # Playwright, Schriften, Icons (Chromium liegt unter /opt/pw-browsers)
pip install numpy scipy soundfile matplotlib pyloudnorm
bash build.sh                        # 4K + 1080p nach out/
# oder einzeln:
python3 audio/soundtrack.py          # Ton (≈ 30 s) inkl. Spektrogramm
node render.mjs --times 21.5,54.3 --out out/preview/x --debug     # Standbilder zum Prüfen
node render.mjs --from 20 --to 25 --out out/preview/seq            # Ausschnitt
node render.mjs --scale 2                                           # 4K (deviceScaleFactor 2)
```

Im Browser ansehen: `node render.mjs` startet einen lokalen Server nur während des Renderns; zum Anschauen reicht
`npx http-server src -p 8080` plus `/index.html?play&fit` (Zeitplan wird aus `/timeline.json` geladen → Datei dorthin kopieren/serven).

## Texte, Farben, Zeiten ändern

* **Texte:** in den Szenendateien (Versalien-Titel in `act2.js`/`act2b.js` über `K.headline`, Chaos-Karten, Hook und Blickwinkel in `act1.js`, Schlusszeilen in `finale.js`, Demo-Inhalte der Oberfläche in `ui.js`).
* **Farben/Schrift:** `src/brand.css` (`:root`) und `src/logo.js` (`BRAND`).
* **Zeiten:** `timeline.json` (Szenen + hits). Das Ton-Skript liest die hits zur Laufzeit; danach `python3 audio/soundtrack.py`.
* **Mischung des Tons:** Wörterbuch `MIX` am Anfang von `audio/soundtrack.py`.

## Qualitätssicherung

* Alle Frames sind deterministisch (keine Zufallswerte ohne Seed): zweimal rendern → identische Bilder.
* Ton: exakt 3 072 000 Samples (64 s), −14 LUFS, Spitzen ≤ −1 dBFS, Akkorde per Chroma-Analyse gegen die Komposition geprüft,
  Struktur im Spektrogramm (`audio/spektrogramm.png`).
* Lesbarkeit: Titel 74–80 px, Untertitel 36 px, Chips ≥ 24 px (bei 1080p). Test mit 640-px-Kontaktbogen (Smartphone-Größe) – siehe `tools/sheet.py`.

## Offene Wünsche (leicht nachzuziehen)

* **9:16-Fassung** für Smartphone/Social: Szenen sind in 1920×1080 komponiert; für Hochformat Textspalte über die Oberfläche legen (eigene Layout-Variante je Szene).
* **15-Sekunden-Schnitt:** Hook → Überforderung → „Es geht auch anders.“ → Drei Kernbilder → Logo; dafür eigene Kurz-Zeitleiste + Kurzfassung des Tons.
* **Sprecherstimme und Untertitel:** Text liegt bei; Einsprechen, dann Mischen (Musik absenken) und SRT erzeugen.
* **Englische Fassung:** Texte in den Szenen ersetzen (alle Strings stehen zentral in den Szenendateien).

Lizenzen: Schriften Outfit, Inter, Barlow Condensed (SIL OFL), Icons Lucide (ISC), Musik und Bild selbst erzeugt.
