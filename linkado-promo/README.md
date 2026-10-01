# Linkado – Werbefilm (60 s)

Ein Werbefilm für **Linkado**, den europäischen digitalen Arbeitsplatz auf Nextcloud-Basis:
**Chaos der Insellösungen → Klarheit → das Linkado-Logo kristallisiert heraus.** Mit ruhigem, schrittweise
wachsendem Techno. Konzept und Dramaturgie: [`KONZEPT.md`](KONZEPT.md).

| Datei | Inhalt |
|---|---|
| `out/linkado-werbefilm-4k.mp4` | Master, 3840×2160, 30 fps, H.264, AAC 256 kbit/s |
| `out/linkado-werbefilm-1080p.mp4` | Web-Fassung, 1920×1080, 30 fps |
| `out/poster.png` | Standbild (Endkarte) |
| `audio/soundtrack.mp3` | Musik als eigene Tonspur (48 kHz, −14 LUFS, Spitzen ≤ −1 dBFS); die verlustfreie `soundtrack.wav` erzeugt `python3 audio/soundtrack.py` |
| `Sprechertext-Vorschlag.md` | optionaler Sprechertext mit Zeitmarken |

> **Platzhalter / bitte prüfen**
> * Das **Logo** ist aus den gelieferten Abbildungen als Vektor nachgezeichnet (`src/logo.js`). Liegt das Original-SVG vor,
>   die Pfade in `LOGO.parts` ersetzen – alle Szenen greifen nur auf `LOGO` zu.
> * **Farben** sind aus Screenshots/Logo geschätzt (`src/brand.css`, Block `:root`). Exakte Hex-Werte dort eintragen.
> * Die **Oberflächen** (Startseite, Dateien) sind nach den Screenshots von linkado.de nachgebaut; **Appshop und
>   Hilfe/Support** sind eine Interpretation und deshalb mit „SNEAK PEEK“ gekennzeichnet. Alle Namen/Inhalte sind Demo-Daten.
> * Die Aussagen zu Microsoft 365, openDesk und Nextcloud sind bewusst fair formuliert („erst Stärke, dann *Aber:*“).
>   Die Nextcloud-Zeile zielt auf den *ungepflegten Standard-Alltag*, nicht auf die Software – bitte final freigeben.
> * Im Logo-Lockup steht „Der europäische digitale Arbeitsplatz“; im Briefing war von „offenem Arbeitsplatz“ die Rede.
>   Umstellen: Konstante `TAGLINE` in `src/scenes/finale.js`.

## Aufbau

```
timeline.json            Zeitplan: 30 Takte à 2 s (120 BPM), Szenen und „hits“ (Bild-/Ton-Akzente) – der Vertrag zwischen Bild und Ton
src/                     der Film als HTML-Animation (jedes Bild ist eine reine Funktion der Zeit t)
  engine.js kit.js ui.js   Mini-Engine, Act-II-Bausteine, nachgebaute Linkado-Oberfläche
  logo.js brand.css        Logo (Vektor) und Marken-Variablen (Farben, Schriften)
  scenes/act1.js           Chaos: Hook, Microsoft 365, openDesk, Nextcloud, Überforderung, Pause
  scenes/act2.js           Klarheit 01–04: Rohfassung→Linkado, Übersicht/Suche, Appshop, Hilfe + Fortschrittsfaden
  scenes/act2b.js          05 Gesamtpaket (Kettenglieder), 06 Mehr Zeit (Zeitleiste), Übergabe-Knoten
  scenes/finale.js         Kristallisation, Logo, Schlusszeilen, Tagline, CTA
audio/soundtrack.py      synthetischer Soundtrack (numpy/scipy), liest die hits aus timeline.json
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

* **Texte:** in den Szenendateien (Versalien-Titel in `act2.js`/`act2b.js` über `K.headline`, Chaos-Karten in `act1.js`, Schlusszeilen in `finale.js`).
* **Farben/Schrift:** `src/brand.css` (`:root`) und `src/logo.js` (`BRAND`).
* **Zeiten:** `timeline.json` (Szenen + hits). Das Ton-Skript liest die hits zur Laufzeit; danach `python3 audio/soundtrack.py`.
* **Mischung des Tons:** Wörterbuch `MIX` am Anfang von `audio/soundtrack.py`.

## Qualitätssicherung

* Alle Frames sind deterministisch (keine Zufallswerte ohne Seed): zweimal rendern → identische Bilder.
* Ton: exakt 2 880 000 Samples, −14 LUFS, Spitzen ≤ −1 dBFS, Akkorde per Chroma-Analyse gegen die Komposition geprüft,
  Struktur im Spektrogramm (`audio/spektrogramm.png`).
* Lesbarkeit: Titel 74–80 px, Untertitel 36 px, Chips ≥ 24 px (bei 1080p). Test mit 640-px-Kontaktbogen (Smartphone-Größe) – siehe `tools/sheet.py`.

## Offene Wünsche (leicht nachzuziehen)

* **9:16-Fassung** für Smartphone/Social: Szenen sind in 1920×1080 komponiert; für Hochformat Textspalte über die Oberfläche legen (eigene Layout-Variante je Szene).
* **15-Sekunden-Schnitt:** Hook → Überforderung → „Es geht auch anders.“ → Drei Kernbilder → Logo; dafür eigene Kurz-Zeitleiste + Kurzfassung des Tons.
* **Sprecherstimme und Untertitel:** Text liegt bei; Einsprechen, dann Mischen (Musik absenken) und SRT erzeugen.
* **Englische Fassung:** Texte in den Szenen ersetzen (alle Strings stehen zentral in den Szenendateien).

Lizenzen: Schriften Outfit, Inter, Barlow Condensed (SIL OFL), Icons Lucide (ISC), Musik und Bild selbst erzeugt.
