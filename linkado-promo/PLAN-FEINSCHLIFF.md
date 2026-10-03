# Plan „Feinschliff“ (v2, geprüft) – 76-s-Fassung

> **Abnahme:** Sechs unabhängige Prüfer haben den neu gerenderten Film gegen diese Liste geprüft (22 von 33 Punkten sofort bestanden, 10 teilweise, 1 Kommentar-Rest). Die Restpunkte (Kettenglied 1 über der Überschrift und 0,3 s vor dem Ton, Beat-Untertitel zu kurz, Handy am Rand, Chat-Standzeit, graue Labels beim Schrumpfen, Zipfel hinter der „L“-Kachel, Portal-Blase/Fenster, Laptop-Sockel am Rand, Drone-Restschwankung, Boom der Kette) sind in einem zweiten Durchgang behoben.
>
> **Stand der Umsetzung:** Welle 1 (M1–M7) und Welle 2 (S1–S15) sind umgesetzt, dazu die Entscheidungen D1 („SNEAK PEEK“ ganz entfernt), D2 (gekürzte Sätze), D3 (Datenschutz-Zeile in der Assistent-Antwort) und D5 (Hook +4 dB). Offen: Welle 3 und D4 (Du/Sie).

**Stand:** Die erste Fassung dieses Plans (13 Befunde) wurde von **8 unabhängigen Gutachten** geprüft: 5 Prüfer
(Pause · Geräte-Beat · Schluss · Akt I · Ton) haben jeden Befund am fertigen MP4 und im Code nachgemessen,
3 „frische Augen“ (Lesbarkeit · Bildfehler · Dramaturgie) haben nach Übersehenem gesucht.
Der Ton wurde **nur gemessen, nicht gehört**. Alle Zeiten sind globale Filmzeit.

## 0. Ergebnis der Prüfung

* **Kein Befund wurde widerlegt.** 8 von 13 bestätigt, 5 teilweise (Zahl oder Lösung war zu knapp).
* **Zwei echte Fehler, die ich selbst übersehen hatte** (Abschnitt 1, M1 und M5):
  * **Die Kette in Szene 05 baut sich nie auf.** Vier Ton-/Bild-Hits stehen noch auf alten Zeiten (49/50/51/52 statt 53/54/55/56), seit ich die Akt-II-Hits verschoben habe. Ich hatte das im ersten Plan als „2 s Ruhe, gewollt“ gelesen – es war ein Datenfehler. Folge: Kette steht 6 s fertig und statisch im Bild, die Glockenleiter A–C–E und der Lock-Boom fehlen im Ton.
  * **Loch im Drone bei 5,25–6,0 s.** Zwei fast gleich laute, leicht verstimmte Töne löschen sich aus; danach springt der Kick um +11,5 dB. Der „12 dB hohe Herzschlag“ war keine Absicht, sondern ein Mischfehler (Plan C hatte ihn als gewollt durchgewinkt).
* **Zahlen im ersten Plan, die nicht stimmten:** „Es geht auch anders“ steht mit 22,5 s / 25 ms nicht ≥ 1,1 s, sondern 0,78 s (mit 20 ms / 0,35 s: ≈ 0,93 s). Der Callback hat 4 Wörter, nicht 6, und steht heute 1,4 s (nicht 1,8). Der Beat-Untertitel steht 1,2 s (nicht 1,4). „Tickets“ ist nur 3–23 px beschnitten; größer ist der Beschnitt rechts bei Posteingang/Tabelle (17–52 px).
* **Größter Hebel in Akt I ist nicht Zeit, sondern Text:** Die Alltagssätze haben pro Moment 23–29 Wörter in ≈ 3,4 s (einer 14 Wörter in 2,6 s). Kürzen wirkt mehr als länger stehen lassen.
* Meine Kontaktblätter liefen stellenweise bis 0,4 s vor dem MP4; die Prüfer haben deshalb direkt am MP4 gemessen.

---

## 1. MUSS – echte Fehler (Welle 1)

| # | Zeit | Befund | Änderung (Datei) |
|---|---|---|---|
| M1 | 49–58 | **Kette 05 animiert nicht**, Ton ohne Glockenleiter A–C–E und Lock-Boom. Test mit korrigierten Hits: ein Glied je Sekunde (52,4–55,0), Einrasten 56, Halt bis 57,5 – genau der gedachte Rhythmus. | `timeline.json`: snap 49/50/51 → **53/54/55**, lock 52 → **56**, swipe „Fenster verlässt das Bild“ 48,0 → **51,55**. Ton danach neu rendern (liest `snap` in 53–55,1 und `lock`). |
| M2 | 51,9–52,8 | Talk-Fenster liegt unter der Kette, „05“ fährt über das halbtransparente Fenster. **Nur zusammen mit M1.** | `act2.js` Z. 205: `wo = tw(t, 43.55, 44.05, ease.io2)` (nicht `in3`, sonst ruckt es); optional `[44.8,'away']` aus `POSES` streichen. |
| M3 | 22,5–24,0 | „Es geht auch anders.“ ist nur ≈ 0,1–0,3 s komplett lesbar, davor 1,0 s leerer Bildschirm. | `timeline.json`: text-Hit 23,0 → **22,5**; `act1.js`: Buchstabenabstand 35 → **20 ms**, Dauer 0,45 → **0,35 s**; Faden/Glühen/Flagge an `build` (23,0) koppeln (`BUILD = E.hits('build')[0].t`), sonst ändert sich der Look. Ton: keine Änderung. Nicht vor 22,4 beginnen. |
| M4 | 27,2–32,0 | **Kamera pumpt** (zoomt ab 27,2 in die Menü-Pose, fährt bei 28,0 wieder heraus; Fenster 336 px über den Rand). Dazu: Rückfahrt schneidet **Handy und „1 TAB“-Chip am Rand ab**; **Widgets stehen im Beat schief** (Einrast-Vorstufe eingefroren); **1-%-Maßstabssprung** an fünf Kamera-Starts (27,2 · 35,4 · 41,4 · 45,4 · 51,4). | `act2.js`: neue Pose `full2 {s:0.7084, px:872, py:214}`, `POSES` = `[[20,'full'],[24.0,'full2'],[24.8,'search'],…]`; Rückfahrt `BEATN − 1.0`; Leiste/Bezel 31,0–31,5; Handy 30,8–31,3; `drift = 1`; `loose` nur in der letzten Beat-Sekunde. `timeline.json`: swipe 30,5 → **30,8**. |
| M5 | 4–8 · 0–4 | **Drone-Loch 5,25–6,0 s** (siehe 0). **Hook sehr leise** (−35 LUFS, ≈ 21 LU unter dem Groove; auf Laptop-Lautsprechern fast unhörbar). | `soundtrack.py` Z. 279/280: Detune-Partner × 0,35, Gesamtpegel × 1,85. Hook: Drone und Marimba um ≈ 4 dB anheben (Rampe bis 8 s), danach nach Gehör. Dazu: 1-ms-Rampe nach dem Vakuum (24,0), Ausklang 0,7 → 1,6 s. |
| M6 | 58,4–61,2 | **06: Beschriftungen mitten im Wort abgeschnitten** (ANMELD, PROJEK, TOOL WECHSE, AUST, FOKU) – 2,5 s lang. | `act2b.js`: Labels kürzen (LOGIN · WECHSELN · IT-FRAGE), Schrift 14 px, bunte Labels erst ab Blockbreite (PROJEKT 125 · AUSTAUSCH 165 · FOKUS 100 px). |
| M7 | 66,8 | **„SNEAK PEEK“-Chip verschwindet hart** (Bild 66,7 voll, 66,8 weg). | `act2.js` Z. 83: ausblenden statt hartem Ende (Zeitpunkt: Entscheidung D1). |

## 2. SOLLTE – Lesbarkeit und Komposition (Welle 2)

| # | Zeit | Befund | Änderung |
|---|---|---|---|
| S1 | 4–17,5 | Alltagssätze zu lang für ihre Standzeit. Satz 3 steht nur 1,85 s. | `timeline.json`: shove 8,0/12,5/17,0 → **8,25/12,75/17,25**; `act1.js`: Schub 0,55 → 0,30 s, Satz-Fade (shove+0,05 … +0,30). **Texte kürzen** (siehe D2): „Jede Erweiterung kostet extra.“ · „Mail, Chat, Dateien – alles sieht anders aus.“ · „Mächtig – aber im Alltag noch roh.“ |
| S2 | 20,5–22,0 | „NOCH EINE FRAGE AN DIE IT.“ ist 6 Wörter (Serie: 3), liegt auf hellen Chips; Datenschutz-Chip „WOHIN GEHEN DIE DATEN?“ steht nur 0,4 s. | „NOCH EINE IT-FRAGE.“ + Text-Schatten; Chip früher/länger (≈ 1,0 s). |
| S3 | 1,0–3,9 | Rote Zähler „3 · 12 · 7“ schweben frei; „12“ klebt am Punkt von „FUNKTIONIERT.“ | An die Hintergrund-Fenster hängen (Posteingang 3, Chat 12, Kalender 7), `zIndex: 3`, Fenster 0,4 s früher einblenden. |
| S4 | 2,9–3,9 | **Schlusspunkt von „DAZWISCHEN.“ ist beschnitten** (rechte Hälfte wandert 34 px über das Wort-Fenster). | `act1.js`: `w4` `paddingRight: 56px; marginRight: −56px`. |
| S5 | 10,7–12,5 | Posteingang/Tabelle rechts 17–52 px beschnitten, „Tickets“ unten bis 23 px. | `AROUND`: mail 1596/170 (w 290), sheet 1604/580 (w 280), ticket 975/810 (w 280); Spread-Array `[-24,-20,6,6,-10]`. |
| S6 | 14,5–17 | Werkzeug-Symbole sitzen auf dem Laptop-Rahmen; „Dateien“/„Tickets“ oben beschnitten. | Symbole `left 1000 + k·96`, `top 148`; Tickets `left 1580, top 60`; Dateien `left 1290, top 54`. |
| S7 | 6,5–8,0 | Peek-Fenster Posteingang/Kalender oben 5–19 px beschnitten. | y 84 / 76. |
| S8 | 8,5–22 | Beschnittene Geister-Titel („R ALLROUNDER“) stehen 13 s neben dem aktiven Titel. | Titel/„ALLES AUS EINER HAND“ der weggeschobenen Gruppen ausblenden (`1 − sh` statt `1 − 0,5·sh`). |
| S9 | 28,0–31,5 | Beat-Untertitel 10 Wörter, steht 1,2 s; sagt nicht, *was* drin ist. Chip „1 TAB“ nur ≈ 9 px hoch. | Untertitel **„Dateien, Kalender, Chat – in einem Tab.“** (7 Wörter), `tOut` 27,2; Chip 17 → 22 px. |
| S10 | 29,3–31,5 | Handy und Laptop widersprechen sich (Uhr 9:41 vs. 09:13; „Projektbesprechung“ vs. „Teamtermin“; 3 vs. 5 Termine; „Dateien“ vs. „Deck“); Adresse „ihre-firma“. | `devices.js`: 09:13, „10:00 · Teamtermin“, „5 Termine, 2 Aufgaben“, „Fällig heute · Deck“, **cloud.musterfirma.de**; `KONZEPT.md` nachziehen. |
| S11 | 65,6–68,0 | Callback steht 1,4 s, ist 60 px klein (Hook: 100 px) und sitzt am Rand. | `finale.js`: Start **65,6**, Ausblenden 67,8–68,0, Schrift **76 px**, `top 235`. Dazu M7 (Chip nicht daneben). |
| S12 | 46,4–48,3 | Talk-Chat: Avatar der gesendeten Nachrichten überlappt die Blase; Text nur 15 px, Antwort 1,3 s. | `ui.js`: `.ui-tm.out { right: 62px }`, Schrift 19 px, `max-width 580`. |
| S13 | 28–52 | Untertitel enden in Witwen („machen.“, „entstehen.“, „in Talk.“). | `kit.js`: `.a2-sub { text-wrap: balance }`. |
| S14 | 28–32 · 64–66,8 | Faden parkt 4 s im Beat; am Übergang 06 → Finale überdeckt der Fadenkopf die „L“-Kachel, die Namensfahnen verschwinden in einem Bild. | `a2-ov` ohne `map`, `NODE_T` + 4 s (Zeiten ≥ 58 mitziehen); Kachel `zIndex`, Fahnen 0,3 s ausblenden. |
| S15 | 4,0 | Laptop erscheint mit leerem Fenster. | Kacheln früher: `tw(a, 0.05 + k·0.05, 0.45 + k·0.05)` (der Fensterkopf aus dem ersten Plan ist nicht nötig). |

## 3. KANN – nach Gehör oder nach Entscheidung (Welle 3)

* **Antwort auf „Noch eine KI. Wohin gehen die Daten?“** (zwei der fünf Chaos-Klagen werden nie beantwortet; „Noch ein Abo“ kann ohne Preisangaben nicht beantwortet werden). Da bestätigt ist, dass die Daten in der eigenen Cloud bleiben: **als Zeile in der Assistent-Antwort der Oberfläche** (kein neues Overlay), z. B. „Antwort aus dem Handbuch · Daten bleiben in deiner Cloud“.
* **Szene 06:** untere Kartenhälfte 3,8 s leer (Dokument kommt erst 62,2) → Zeitleiste tiefer setzen oder Dokument 0,6 s früher; Beschriftung „· BEISPIEL“ und kein „Technik = 0“-Versprechen (schmaler Rest bleibt).
* **Ton:** Callback hat keinen Klangakzent (optional Dur-Motiv A–C♯–E); Marimba-Ping bei 44,3 liegt durch die 16tel-Rundung 50 ms **vor** dem Bild (aufrunden); Kick 4–8 s nach Gehör −1,5 dB (erst nach dem Drone-Fix beurteilen).
* **Fenster 02–04 steht rechts über den Bildrand** (Menü-Pose 0,95): Absicht (Zoom auf das Menü) oder `search` auf 0,86 wie `shop`? Erst nach Ansehen entscheiden.
* **Marke früher:** Wortmarke erscheint erst bei 68,5 s (nur Orange/Faden/Flagge davor) – optional „LINKADO“ am Fadenende.
* **Formulierungen zu „Das fertige Portal“** als Erlebnis der Kolleg*innen („Für mich fühlt sich das nicht wie ein Ganzes an.“) statt Feststellung; vor Veröffentlichung kurz juristisch ansehen (vergleichende Werbung).
* **Aufräumen:** toter Code `ASK` in `soundtrack.py`, veraltete Kommentare (act1.js „0–20 s“, „3.5“), ungenutzte Rasterwerte in der Pause.

## 4. Gestrichen / bewusst so lassen

* **A1-Konflikt mit dem harten Schnitt:** kein Problem (0,5 s Dunkel + Hall-Schwanz genügen, der Satz setzt auf dem ersten Herzschlag ein). Nicht früher als 22,4.
* **Ton-Raster, Stereo, Pegelgrenzen:** unauffällig (Kicks σ 0,4 ms, Bass exakt mono, Spitze −2,4 dBFS, 0 Samples > −1 dBFS).
* **Hook-Rhythmus, Dramaturgie-Reihenfolge, Titelsystem Akt II, Schlussbild:** tragen. Zu bewahren laut Gutachten: Lücke in „DAZWI|SCHEN“, „1 TAB“ als Spiegel zu „36 TABS“, Drop-Blitz, Callback als Klammer, ein einziger CTA.
* **Szene 02** bleibt dicht – erst nach neuem Sehen ändern.

## 5. Entscheidungen (von euch)

* **D1 – „SNEAK PEEK“-Chip:** bis 66 s lassen (wie jetzt, nur weich ausblenden) · **ab 52 s ausblenden** (05/06 sind Konzeptgrafiken, keine Oberfläche) · in „VORSCHAU“ umbenennen? *(Mein Vorschlag: ab 52 s ausblenden.)*
* **D2 – Gekürzte Alltagssätze** (S1): so in Ordnung?
* **D3 – Datenschutz-Zeile in der Assistent-Antwort** (Welle 3): ja/nein?
* **D4 – Du/Sie:** Die Oberfläche siezt, „Dein Arbeitstag“, die Support-Antwort und die Schlusszeile duzen – teils in derselben Szene. Die Schlusszeile ist euer Wortlaut („deinen“). Eine Vereinheitlichung auf „Sie“ wären 4 Strings, auf „du“ ca. 25 in der Oberfläche. Nach dem 5-Personen-Test entscheiden.
* **D5 – Hook-Lautstärke:** nach Gehör (Vorschlag +4 dB, Rampe bis 8 s).

## 6. Vorgehen

1. **Welle 1 + 2 in einem Durchgang** (M1–M7, S1–S15; ca. 2–3 h Arbeit), danach Ton neu rendern (M1/M3/M4/M5 betreffen ihn) und **ein** voller Render + Kodierung (≈ 25 min).
2. Danach 1080p zum Ansehen; **Welle 3** nach eurem Gehör-/Seheindruck und den Entscheidungen D1–D5.
3. **Abnahme-Check nach dem Render:** Kette 52–58 s baut sich auf (Glied 1/2/3 bei 53/54/55, Boom 56) · Talk-Fenster vor 52,4 weg · 22,5–24,0 s Satz lesbar und auf dem Herzschlag · 27–32 s Kamera in einer Linie, nichts beschnitten · 58–61 s Beschriftungen vollständig · Hook (0–4 s) hörbar.

## 7. Welle 3 – Gesamtdurchgang (umgesetzt)

Anlass: „noch Renderfehler fixen, Kleinigkeiten überarbeiten, Sound besser“. Vorgehen: (1) Einzelbilder aus dem Master, Übergänge im 0,1-s-Raster; (2) `tools/domcheck.mjs` (Texte im Bild vermessen); (3) Ton **gemessen** (Bänder je Szene, Stems, Akzent-Abstand, Mono-Summe) statt nur nach Gefühl.

| Befund | Maßnahme |
| --- | --- |
| Menü (02) schiebt sich angeschnitten über Rail und Überschrift (33,0–33,2 s, Text halb abgeschnitten) | wird von der Leiste aus aufgedeckt (`clip-path`), 0,53 s |
| Szene 06: untere Kartenhälfte 3,8 s leer | Karte wächst mit dem Dokument (340 → 700 px) und fährt nach oben |
| Überschriften 01/02 berühren fast das Fenster (28–36 px) | Schrift 74 → 70 / 80 → 74 (jetzt 75–85 px Luft) |
| Laptop „flackert“ bei 14,4 s (Deckkraft-Strobe) | ein einziger weicher Einbruch |
| Hintergrundfenster („video“, „cal“) liegen hinter den Titeln | aus der Titelzone verschoben |
| Überblendung 02 → 03 zeigt zwei Oberflächen übereinander | Ausblenden 0,28 s, Einblenden beginnt 0,12 s später |
| Lichtband beim Einrasten der Kette unsichtbar | Verlauf folgt jetzt dem Rechteck |
| „Support-Zeiten: Mo–Fr 9–17 Uhr“ in der Oberfläche | entfernt (unbelegtes Versprechen) |
| Schlussbild 5 s starr | Push-in 1,2 % |
| Ton: Akt I −32 … −19 LUFS (Hook praktisch unhörbar auf Laptop/Talk), Akt II ≈ −13 | Pegelkurve `ACT1_GAIN`: Hook −24, Alltagsmomente −22 … −18, Überforderung −16 |
| Ton: Melodie 12 dB unter den Drums, Sub +16 dB über den Mitten | Pult: Kick/Bass −3 dB, Melodie/Glocken +3…4 dB, Hats +3 dB, UI +4 dB; Sub-Band jetzt ≈ +10 dB über den Mitten |
| Ton: Kick 4–8 s nur im Tiefbass | Mitten-Anschlag (`knock`), Filter ab 240 Hz |
| Ton: Bild-Akzente gehen im Groove unter | Akzent-Ducking (Arpeggio/Hats/Pad), Kettenklack, Clap auf 2/4 |
| Ton: Callback ohne Akzent | Aufschwung + C6/E6 bei 65,625 s |
| Ton: Soft-Clipping | Look-ahead-Limiter, −1,5 dBFS, max. Absenkung 2,4 dB (Drop) |

Bewusst offen geblieben (Entscheidung nötig): Du/Sie · Fenster ab 02 steht rechts über den Bildrand (Absicht: Zoom) · Wortmarke erst bei 68,5 s · juristische Prüfung „Das fertige Portal“.

## 8. Nachtrag (nach Welle 3): Marke allein + Kamera-Schwenk

* **Endbild ohne „Nextcloud“:** die Zeile „Die Möglichkeiten von Nextcloud.“ entfällt; einzige Schlusszeile ist „Einfach für deinen Alltag.“ (66 px, Strich unter „Alltag.“ auf dem zweiten Glockenton 70,0 s; Timeline-Hits unverändert, damit Ton und Sonic Logo bei 71,0 s bleiben). Im Film kommt „Nextcloud“ jetzt nur noch in Szene 01 vor („Nextcloud als Basis“, Beschriftung „NEXTCLOUD · BASIS“).
* **Kamera-Schwenk am Drop (Perspektivwechsel):** Text- und Fenster-Ebene liegen in einer 3D-Welt (`world` in `a2-ui`), 24,0 → 25,8 s (zuerst kräftiger gebaut – 34° Drehung, Rollen, Zoom, Anschnitt –, auf Wunsch „modern, nicht zu kräftig, damit ältere Menschen damit klarkommen“ zurückgenommen): Drehung ≈ 9° (Y), 2,5° (X), keine Rollbewegung, Zoom +4,5 %, Tiefenstaffelung Text +70 px / Fenster −55 px (leichte Parallaxe), Ease-out; nichts wird angeschnitten; ab 25,8 s `transform: none` (Szenen 01–06 pixelgleich zur Vorfassung). Ton: neuer Hit `orbit` (24,1–25,7 s) mit leisem Schwenk-Hauch (Rauschen, Mitte fällt 3,2 kHz → 0,45 kHz, links → rechts, −4 dB gegenüber der ersten Fassung).
