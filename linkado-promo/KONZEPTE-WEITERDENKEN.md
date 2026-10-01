# Konzepte zum Weiterdenken

Dieses Dokument entwickelt die Ideen aus [`PLAN.md`](PLAN.md) zu konkreten Konzepten aus – jeweils mit **Idee · Warum · Umsetzung im Projekt · Aufwand · Entscheidung nötig?**.
Status: **✔ umgesetzt** (steckt im aktuellen Film) · **◐ vorbereitet** (Struktur steht) · **○ Konzept** (noch nicht gebaut).

---

## 1. Leitidee „Dazwischen“ ✔

**Idee.** Die schärfste Aussage der Marke steht schon auf eurer Website: *„Ihre Programme funktionieren. Aber funktioniert Ihre Arbeit auch **dazwischen**?“*
Der Film erzählt genau das: Jeder gängige Ansatz (der Allrounder, das fertige Portal, die offene Basis) funktioniert – ein *Aber* bleibt immer im Zwischenraum. Linkado verbindet dieses Dazwischen.

**Wie sie durch den Film läuft.**

| Moment | Ausdruck der Idee |
|---|---|
| 0–2 s Hook | „Alles funktioniert. Nur nicht dazwischen.“ – das Wort *dazwischen* öffnet sich in der Mitte |
| 2–14 s | je Ansatz eine Stärke, dann *ABER:* – die Lücken sind das Dazwischen (bewusst ohne Produkt- oder Firmennamen) |
| 14–18 s | fünf Blickwinkel, in denen die Lücke wehtut (Login, Tool, Abo, KI, IT) |
| 18–20 s | der **Faden** erscheint als erstes Verbindendes |
| 40–46 s „Gesamtpaket“ | drei Kettenglieder greifen *ineinander* – das Dazwischen ist gefüllt |
| 54–64 s Finale | der Faden wird zum Steg im „A“ des Logos |

**Alternative Hooks** (Konstante in `src/scenes/act1.js`, Abschnitt *Hook*; Hits in `timeline.json`):

* A „Digitale Zusammenarbeit heute.“ (v1, neutral)
* B **„Alles funktioniert. Nur nicht dazwischen.“** (aktuell)
* C „Deine Programme funktionieren. Aber deine Arbeit?“ (länger, 3 s nötig → Takte verschieben)

**Entscheidung nötig:** B oder A? B ist mutiger und markennäher; A ist unverfänglicher.

---

## 2. Fünf Blickwinkel statt einer Perspektive ✔

**Idee.** Chaos ist subjektiv: Eine Mitarbeiterin erlebt es anders als die Geschäftsführung. Der Überforderungs-Block (14–18 s) zeigt deshalb fünf Rollen im 0,75-s-Raster,
jeweils mit **eigener Bildidee** und eigenem Akkord:

| Takt | Blickwinkel | Satz | Bild | Akkord |
|---|---|---|---|---|
| 14.00 | Mitarbeitende | Noch ein Login. | vier Login-Masken stapeln sich | Am |
| 14.75 | Teams | Noch ein Tool. | Tab-Leiste füllt sich (3 → 36 Tabs), Tool-Kacheln mit Badges | F |
| 15.50 | Geschäftsführung | Noch ein Abo. | Preisschilder „+ Lizenz / + Add-on / + KI-Zusatz …“, Zähler 2 → 9 Abos | C |
| 16.25 | Datenschutz | Noch eine KI. | Chat-, Notiz-, Bild-, Meeting-KI mit „sendet Daten …“, Pille „Wohin gehen die Daten?“ | G |
| 17.00 | IT | Noch eine Frage an die IT. | Fragen-Blasen („Darf die KI das?“), Glitch, Schnitt | Am |

**Weitere mögliche Blickwinkel** (austauschbar, je 1 Zeile + 1 Bild): *Neue Kollegin* („Wo finde ich was?“), *Außendienst* („Nur mit VPN.“), *Betriebsrat* („Wer sieht was?“),
*Einkauf* („Noch ein Vertrag.“), *Kunde* („Bitte nochmal als PDF.“). Für Zielgruppen-Versionen (Verwaltung, Mittelstand, Schule) ändert man nur diese Zeile.

**Aufwand klein** (Text + eine Karte je Blickwinkel in `act1.js`).

---

## 3. KI und Zeitgeist – ehrlich erzählt ◐

**Haltung.** Ihr seid ein KI-Unternehmen, der Film soll modern wirken – ohne Versprechen, die das Produkt (noch) nicht hält.

* **Chaos-Seite ✔:** KI-Wildwuchs als gesellschaftliches Thema (jede*r bringt die eigene KI mit, Daten fließen irgendwohin). Das ist erlebbar, kritisch und passt zur europäischen Haltung.
* **Lösungs-Seite ✔:** Der ✨ Assistent ist in der echten Oberfläche vorhanden (Kopfleiste, Einstellungen). Im Film taucht er an zwei Stellen auf: als erste Zeile der Suche
  („Assistent fragen: Wie ist der Stand beim Angebot für Hartmann?“) und als Antwortkarte im Support („So teilen Sie einen Ordner – Quelle: Anleitung“). Alles unter *Sneak Peek*.
* **Gestalterisch ✔:** moderner Schnitt (Blickwinkel-Rhythmus), mikro-interaktive UI (Cursor, Tippen, Schalter, Flüge), Dateinamen-Chips mit `prompt_final_v7.txt`.
* **Optionale Zeile ○:** im Finale eine zusätzliche Zeile *„Mit KI, die bei Ihnen zuhause bleibt.“* – **nur** wenn belegbar (lokale Modelle / EU-Hosting). Platz wäre zwischen 56.0 und 57.0 s.

**Entscheidung nötig:** Welche KI-Aussagen sind produktseitig gedeckt? Alles andere bleibt Bild, nicht Behauptung.

---

## 4. Der Faden als echtes Bildelement ○

**Idee.** Bisher läuft der Faden unten als Fortschrittsleiste. Er soll im Produkt **Dinge verbinden** – das Dazwischen sichtbar machen.

| Szene | Choreografie |
|---|---|
| 02 Menü-Suche | Cursor zieht den Faden vom Suchfeld des großen Menüs → Datei → Termin → Talk (vier Treffer werden nacheinander verbunden), Faden bleibt als dünne Linie stehen |
| 03 Apps | Beim Hinzufügen läuft der Faden von der Karte in die Leiste und bleibt dort als orange Kante des Eintrags (heute fliegt nur das Icon) |
| 04 Support | Faden verbindet Frage → Antwortkarte → Anfrage; die Antwort des Supports „rastet“ ans Ende des Fadens |
| 05 Gesamtpaket | die Kette wird vom Faden durchzogen (Faden = Gelenk) |

**Umsetzung.** Ein Pfad pro Szene im Fensterraum (`act2.js`, wie `trailSvg` bei den App-Flügen), Länge per `stroke-dasharray` – deterministisch und billig. **Aufwand mittel** (halber Tag).

---

## 5. Ein „Wow“-Moment pro Akt ◐

* **Act I:** Überforderung + Tape-Stop ✔ (der Schnitt bei 18.0 s ist der stärkste Kontrast im Film).
* **Act II ○:** ein 3-Sekunden-Heldenschuss der Oberfläche: Kamera schwenkt in leichter 3D-Neigung (Perspective 1800 px, rotateY −8°), Parallaxe zwischen Rail, Hero und Karten,
  Cursor mit Spur. Vorschlag: 24.0–27.0 s (Startseite), danach normale Zoom-Kamera.
* **Finale ✔:** Kristallisation, Logo-Signatur (Ton und Bild).

---

## 6. Bewegungsunschärfe und 60 fps ○

Der Renderer ist deterministisch (jedes Bild = Funktion der Zeit). Dadurch geht echte Bewegungsunschärfe **ohne Qualitätsverlust**:

* Pro Ausgabebild 4 Zeitpunkte im Verschlussfenster (z. B. 180°) rendern und mitteln → filmische Unschärfe bei Wischern, Kamerafahrten, Flügen, Kristall.
* oder 60 fps ausgeben (Social/Display), Renderzeit ×2.

**Aufwand:** Skript `tools/blend.mjs` (Frames mitteln, ffmpeg) + Renderzeit ×4 (4K ≈ 4× so lange wie jetzt). Empfehlung: erst nach Freigabe der Bildinhalte als letzter Schritt.

---

## 7. Fassungen ○ (alle aus demselben Projekt)

### 7.1 30 Sekunden (Web-Anzeigen, Messe-Loop)

| Zeit | Inhalt |
|---|---|
| 0–2 | Hook „Alles funktioniert. Nur nicht dazwischen.“ |
| 2–8 | drei Karten im Schnelldurchlauf (je 2 s: Stärke + *Aber* + eine Lücke) |
| 8–12 | Blickwinkel-Montage verkürzt (Login · Abo · KI · IT) |
| 12–14 | „Es geht auch anders.“ + Faden |
| 14–24 | drei Kernbilder: Suche mit Assistent · Apps hinzufügen · Support-Antwort (je ~3 s) |
| 24–30 | Finale ab dem Kristall (Sonic Logo, Zeilen, Tagline, CTA) |

### 7.2 15 Sekunden (Pre-Roll, Stories)

Hook (2 s) → *Noch ein Login. Noch eine KI. Noch eine Frage.* (3 s) → *Es geht auch anders.* (1 s) → Suche mit Assistent (3 s) → Finale (6 s).

**Umsetzung:** zweite `timeline-30.json` / `timeline-15.json` mit eigenen Szenenfenstern; Szenen sind bereits eigenständige Funktionen der Zeit (`E.scene({start,end})`),
Zeitabbildung per `E.map`. Ton: Schnittpunkte auf Taktgrenzen (Anfang/Ende der Loops auf 2 s). **Aufwand mittel je Fassung.**

### 7.3 9:16 (Reels, Shorts, Stories)

* Eigenes Layout je Szene (1080×1920): Text **oben**, Oberfläche **unten** und größer (Kamera auf den relevanten Ausschnitt), Sicherheitsränder 150 px oben/unten.
* Chaos-Teil: Karten untereinander statt nebeneinander; Blickwinkel-Montage wirkt im Hochformat besonders gut.
* Technisch: `tl.meta.width/height` + zweite Layout-Konstanten (`L` in `kit.js`, Kameraposen in `act2.js`). **Aufwand groß** (ein Tag).

### 7.4 Stumm-Fassung mit Untertiteln ○

Alle Aussagen stehen bereits im Bild. Zusätzlich eingebrannte Kurztitel für Social (Autoplay stumm): 6 Zeilen aus `timeline.json`-Texten, unten mittig, 40 px. **Aufwand klein.**

### 7.5 Sprecherfassung ○

Text liegt vor ([`Sprechertext-Vorschlag.md`](Sprechertext-Vorschlag.md), aktualisiert). Musik per **Stems** unter die Stimme absenken (Drums/Bass bleiben, Pad/Arps −6 dB).

### 7.6 Englische Fassung ○

Alle Texte stehen in den Szenendateien (`act1.js`, `act2.js`, `act2b.js`, `finale.js`, UI-Demo in `ui.js`). Hook englisch: *„Everything works. Just not in between.“* **Aufwand mittel** (Übersetzung + Längenprüfung der Headlines).

---

## 8. Ton ✔ / ○

### 8.1 Umgesetzt (v3)

* **Allgemeinerer Aufbau:** klassisch in A-Moll, keine Clash-Intervalle, kein Polymeter.
* **Insel-Töne:** Allrounder = A, fertiges Portal = C, offene Basis = E → erst der Drop ergibt den Akkord (Sonic Logo in Moll, 20.0 s).
* **Übergang in den Drop:** Herzschlag-Kick ab 18.5 s, das A–C–E-Motiv steigt in der Pause, Rim-Wirbel und Riser, 80 ms Vakuum (auch der Hall atmet ein), dann Crash, breiter Akkord, Sonic Logo und voller Groove ab Takt 11.
* **Sonic Logo** (Signatur, Wiedererkennung): **A5 – C♯6 – E6 – A6**, vier Glockentöne im Abstand von 0,25 s, der letzte klingt aus; erscheint beim Kristall (54.0–54.75 s) und als Schlusssignatur (57.0–57.75 s).
* **UI-Klangebene:** Tap, Add (zwei steigende Marimba-Töne), Toggle (zwei Blips), Swipe (Filter-Rauschen), Flug, Landung, Tippen (Tastenticks), Chime bei „Antwort vom Support“.
* **Breite:** Seitenanteil von Pad, Arps, Stabs, Glocken, UI angehoben (Korrelation oberhalb 400 Hz 0,55).
* **Stems** (`audio/stems/`): drums · bass · pad · music · bells (inkl. UI) · fx.
* **Zwei Mischungen:** `soundtrack.wav` (−14 LUFS, Web/Social) und `soundtrack-leise.wav` (−20 LUFS, Messe/Empfang).

### 8.2 Als Nächstes ○

* **Echte Sprecherstimme + Ducking:** Sidechain der Stems auf die Stimme (Pad/Arps −6 dB).
* **Audio-Logo-Version solo** (3 s) für Intros/Outros anderer Videos: `audio/sonic-logo.wav` aus dem Skript exportieren.
* **Loop-fähige Messefassung:** 64 s mit sanftem Ausklang → Einstieg (Crossfade 2 s).

---

## 9. Detailpolitur ○ (wirkt „teuer“)

* Leichte Tiefenunschärfe im Hintergrund, konsistente Schatten, Mikro-Interaktionen (Hover-Zustände, Fokus-Ringe, Tastendruck-Tiefe).
* Dezentes Korn/Vignette, wärmere Creme-Töne, tiefere Navy-Fläche im Act I.
* Fensterspiegelung (diagonales Licht) beim Hero-Schuss.
* Titel: Hervorhebung des orangen Wortes mit Unterstreichung, Zahlen, die zählen (01 → 06).

---

## 10. Offene Entscheidungen (bitte kurz bestätigen)

1. **Hook:** „Alles funktioniert. Nur nicht dazwischen.“ beibehalten?
2. **KI-Aussagen:** Reicht das Bild (Assistent im Suchfeld/Support), oder soll eine Textzeile dazu?
3. **Tagline im Logo:** „Der europäische digitale Arbeitsplatz“ (steht jetzt, entspricht dem Logo) oder „Der offene Arbeitsplatz“ (Briefing).
4. **Oberfläche:** Demo-Daten sind erfunden; bitte prüfen, ob Funktionen, die nur als *Sneak Peek* laufen (Assistent-Antwort, Anfrage-Flow), so gezeigt werden dürfen.
5. **Reihenfolge der Fassungen:** erst 30 s und 15 s (Social-Reichweite) oder 9:16?
6. **Aussagen zu den drei Ansätzen** (Allrounder, fertiges Portal, offene Basis) inhaltlich freigeben – sie sind allgemein gehalten und nennen niemanden.
