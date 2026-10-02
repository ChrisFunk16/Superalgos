# Plan „Wirkung“ – Feinheiten, damit Marke, Idee und Funktionen hängen bleiben

Stand: Fassung 72 s (Akt I entschleunigt). Dieser Plan sammelt, was den Film **erinnerbarer** macht und die Oberfläche
**intelligent, freundlich und zugeschnitten** wirken lässt – geordnet nach Wirkung und Aufwand, mit Fundstelle im Code.
Grundhaltung: keine Tricks *gegen* die Zuschauer*innen, sondern Mittel, die Erinnerung, Verständnis und Vertrauen stärken.
Alles bleibt überprüfbar (keine erfundenen Zahlen, keine Fake-Testimonials, keine Angst, keine künstliche Dringlichkeit).

---

## 0. Stand der Umsetzung (Fassung 76 s)

| Punkt | Status |
|---|---|
| Orange-Strich in der Lücke von „DAZWI SCHEN“ | umgesetzt (`act1.js`) |
| Callback „Alles funktioniert. *Auch* dazwischen.“ vor dem Kristall | umgesetzt (`finale.js`) |
| Kette (05) mit den Symbolen aus 02/03/04 | umgesetzt (`act2b.js`) |
| Rollen-Pillen mit Haken (Teams · IT · Geschäftsführung) | probeweise umgesetzt, **wieder entfernt** (störten das Bild) – bleibt als Idee, nur falls ein ruhigerer Ort gefunden wird |
| Lesezeit Szene 02 | durch den neuen Geräte-Beat davor entschärft (kein Umbau nötig) |
| Erfolgs-Chime = Sonic-Logo-Ton | nicht nötig – der Chime (E6 → A6) *ist* bereits der Schluss des Sonic Logos |
| **Neu:** Geräte-Beat „Ein Browser genügt“ (Zoom aus dem Gerät, 1 Tab, Handy) | umgesetzt (`devices.js`, `act2.js`) |
| **Neu:** eigene Kamerabewegung je Alltagsmoment in Akt I | umgesetzt (`act1.js`) |
| Entscheidungen (Du/Sie, „Daten bleiben in deiner Cloud“, Zahl für „mehr Zeit“, Stimme, Fotos) | offen – Abschnitt 7 |

### Perspektivwechsel und Kamera – Einschätzung

* **Ja, aber als Rhythmus, nicht als Dauerzustand.** Akt I ist eine flache Collage, Akt II eine Produktführung. Variation entsteht dort, wo die Kamera *etwas bedeutet*: Schub = „schau hin“, Rückzug = „so groß ist das Bild“, Schwenk = „es gibt mehr daneben“.
* **Genau fünf bewusste Blickwechsel im ganzen Film:** (1) Schub in den ersten Moment, (2) Rückzug im zweiten, (3) Schwenk im dritten, (4) der große **Rückzug aus dem Gerät** im Browser-Beat, (5) der Zoom ins Fenster zu 02. Mehr würde den entschleunigten Anfang wieder kippen.
* **Bewusst nicht gebaut (Ideen für eine zweite Runde):** 3D-Neigung der Geräte (Parallax), Draufsicht auf den Schreibtisch, „Handy-POV“ für die Talk-Szene (Hochkant im Querformat), Split-Screen Laptop | Handy bei der Suche. Jede dieser Ideen kostet etwa einen halben Tag und lohnt sich eher für die 9:16-Fassung.

### Browser-Beat – warum so

* Botschaft: **„Ein Browser genügt.“** – sie widerspricht direkt dem Chaos („36 TABS“, fünf Logins). Deshalb steht dort „1 TAB“ in Orange, genau an der Stelle, an der vorher die rote Zahl stand.
* Er kommt **nach** dem Wechsel Nextcloud → Linkado (01), weil der Satz erst dann etwas beweist: erst die Oberfläche, dann der Rahmen.
* Ohne Installationsversprechen formuliert („läuft im Browser – auf jedem Gerät“), damit nichts zugesagt wird, was nicht belegt ist.
* Alternativen, falls ihr es anders möchtet: (a) Beat *vor* 01 (Zoom aus dem Tab, danach Wechsel Nextcloud → Linkado) – wirkt direkter, verschiebt aber den Nextcloud-Satz nach hinten; (b) statt Laptop + Handy ein Tablet im Hochformat (mehr Gerätevielfalt, mehr Aufwand).

---

## 1. Was im Kopf bleiben soll (und woran man es misst)

Nach einmaligem Sehen sollen drei Dinge sitzen – in dieser Reihenfolge:

| Ziel | Soll nach 24 h erinnert werden | Woran wir es im Film festmachen |
|---|---|---|
| **Idee** | „Alles funktioniert – nur nicht dazwischen. Linkado verbindet das Dazwischen.“ | Hook → Faden → Logo (ein Gedanke, dreimal in Varianten) |
| **Marke** | Name *Linkado*, Orange auf Creme/Navy, der Faden mit Flagge, das Vier-Ton-Motiv | Logo 8 s stehend, Sonic Logo dreimal, Orange als einziges Signal |
| **Funktionen** | „Nextcloud-Basis, verständliche Oberfläche, Apps und Hilfe an einem Ort“ – plus ein konkretes Bild (Assistent antwortet / Anruf) | 01, 03, 04 als Bilder, 05 als Zusammenfassung in drei Gliedern |

**Messvorschlag (klein, ehrlich):** fünf Personen aus der Zielgruppe sehen den Film einmal. Am nächsten Tag drei Fragen:
*Was macht Linkado in einem Satz? Welche Farbe? Welcher Satz / welches Bild ist geblieben?* Jede Fassung, die hier besser abschneidet, gewinnt.
Das ersetzt Bauchgefühl beim Streit um Sekunden.

---

## 2. Gedächtnis-Mechanismen, die wir bewusst nutzen

| Mechanismus | Was er bewirkt | Stand im Film | Feinheit (Vorschlag) |
|---|---|---|---|
| **Primacy / Recency** – Anfang und Ende prägen am stärksten | Marke muss *früh* angedeutet und *zuletzt* gezeigt werden | Ende: Logo 8 s, 5 s ruhig stehend ✔ · Anfang: Marke bewusst abwesend (nur Dunkel, keine Markenfarbe) | **Orange-Ahnung im Hook:** Wenn sich „DAZWI SCHEN“ öffnet, erscheint in der Lücke ein winziger oranger Strich – *der Faden* zum ersten Mal. Kein Logo, kein Name, nur das Signal. Bei 22 s kommt er als Linie wieder, bei 64 s wird er zum A im Logo. **Aufwand S** (`act1.js`, Hook-Teil). |
| **Zeigarnik / offene Schleife** – ein offener Satz bleibt im Kopf, bis er geschlossen wird | Der Hook stellt die Frage, das Finale muss sie *wörtlich* beantworten | Antwort ist implizit (Faden, Kette), aber nicht ausgesprochen | **Callback vor dem Kristall (ca. 62–64 s):** „Alles funktioniert. **Auch** dazwischen.“ – eine Zeile, gleiche Schrift wie der Hook, die beiden Wort-Hälften schließen sich und werden zur Linie, aus der das Logo kristallisiert. Die Schlusszeile des Kunden bleibt unverändert. **Aufwand S–M** (`finale.js`, `timeline.json` ein `text`-Hit). |
| **Dreierregel** | Drei Dinge merkt man sich, sechs nicht | Drei Ansätze, drei Sätze je Moment, drei Kettenglieder, drei Töne A–C–E ✔ · sechs Nutzen 01–06 | Die sechs Nutzen bleiben als Fortschritt sichtbar, aber die **Kette (05)** ist die eigentliche Merkhilfe: *Oberfläche · Erweiterungen · Betreuung*. Feinheit: die drei Glied-Symbole **exakt** aus den Szenen 02/03/04 übernehmen (gleiche Icons, gleiche Farbe), damit das Gehirn „das hab ich gerade gesehen“ verknüpft. **Aufwand S** (`act2b.js`, `kit.js`). |
| **Problem → Lösung, Paar für Paar** | Ein Schmerz, der sichtbar gelöst wird, bleibt besser als eine Funktionsliste | Fünf Blickwinkel (Login · Tool · Abo · KI · IT-Frage) im Chaos; in Akt II werden sie nur indirekt beantwortet | **Die fünf Rollen-Pillen kehren zurück und bekommen ihren Haken:** 01 „Noch ein Login“ → *ein* Login (Haken) · 03 „Noch ein Tool“ → Apps an einem Ort · 04 „Noch eine Frage an die IT“ → Antwort im Support · 05 „Noch ein Abo“ → ein Paket · Assistent „Noch eine KI“ → eine KI, Daten bleiben in der Cloud. Jeweils ein kleiner Chip am unteren Rand, 1 s, mit dem Rollen-Icon aus Akt I. Das schließt fünf Schleifen und macht die Nutzenversprechen *persönlich*. **Aufwand M** (`act2.js` Overlay, `act2b.js`). |
| **Peak-End-Regel** | Erinnert werden Höhepunkt und Ende | Höhepunkt = Drop (24 s) und Kristall (64 s), Ende ruhig ✔ | Der Kristall sollte der *emotionale* Höhepunkt sein, nicht der Drop. Feinheit: beim Kristall 0,3 s länger Weiß halten und das Sonic Logo in Dur **allein** stehen lassen (Kick setzt erst danach ein). **Aufwand S** (`soundtrack.py` Kick-Fenster, `finale.js`). |
| **Distinctive Brand Assets** (Romaniuk) – wiedererkennbare Markenbausteine statt nur Logo | Jedes Asset braucht Konsistenz und Wiederholung | Faden + Flagge ✔ (Fortschrittsleiste, Cursor-Spur, Pause), Orange/Creme/Navy ✔, Sonic Logo A–C–E–A ✔ | **Sonic Logo an drei Stellen gleich:** Drop (Moll), Kristall (Dur), Tagline (Dur) – in der 68-s-Fassung fehlte das dritte durch einen Zeitfehler, jetzt behoben. **Flagge als Cursor:** Der Mauszeiger in Akt II trägt die kleine orange Flagge, sodass jede Aktion „die Marke“ ausführt. **Aufwand S** (`ui.js` cursor). |
| **Von-Restorff-Effekt** (Isolation) – das eine Andersfarbige bleibt | Orange darf pro Bild nur **ein** Ding markieren | In Akt II konkurrieren: Em-Wort im Titel, Faden, Buttons, Cursor-Spur, Logo in der Leiste | **Orange-Disziplin:** je Bild genau ein oranges Signal im Vordergrund (das Em-Wort *oder* die Aktion, nie beides gleichzeitig); Faden bleibt dünn und unten. Buttons in der Oberfläche in Orange nur, wenn der Cursor sie gerade drückt. **Aufwand M** (Durchgang durch `act2.js`, `ui.js`). |
| **Verarbeitungsflüssigkeit** – was leicht zu lesen ist, wirkt wahrer und bleibt | Lesezeit: ~1 s Einstieg + 0,3 s pro Wort | Hook jetzt 4 s ✔, Alltagssätze 0,9 s Abstand ✔, Titel 02 (4 s) mit Untertitel + Menüaktion knapp | **Lesezeit-Audit** (Tabelle unten): Szene 02 um 1 s auf 5 s, oder Untertitel erst einblenden, wenn das Menü offen ist. **Aufwand S** (`timeline.json`, `act2.js`). |
| **Gesichter und Blickrichtung** – Augen ziehen Aufmerksamkeit, Blicke lenken sie | Menschen im Bild erhöhen Verweildauer; wohin sie schauen, schaut auch der Betrachter | Illustrierte Porträts ✔ in Akt I, Talk, Oberfläche | **Blickrichtung zum Text:** Die Porträts in Akt I minimal zum Satz hin neigen (Kopf 4–6°, Pupillen 1 px versetzt). In Talk schaut die große Kachel (Mira) leicht zur Chat-Spalte. **Aufwand S** (`ui.js` `portraitSVG`, Parameter `gaze`). |
| **Konkretheit** – Bilder schlagen Abstrakta | „Mehr Zeit fürs Wesentliche“ ist abstrakt | 06 zeigt den Tag als Blöcke ✔ | Eine Zahl nur, wenn belegbar (z. B. aus einer Kundenmessung): „–40 Min Suchen am Tag“. Ohne Beleg: keine Zahl, lieber das Bild. **Entscheidung Kunde.** |
| **Wiederholung mit Variation** – dreimal, nie gleich | Ein Gedanke in drei Formen prägt sich ein | „dazwischen“ 1×, Faden 3× | „dazwischen“ **3×**: Hook (Wort) · Pause („Es geht auch anders.“ → kleiner Zusatz darunter: *für alles dazwischen*) · Finale (Callback, s. o.). **Aufwand S**. |
| **Stille nach dem Signal** – was in Ruhe steht, wird gespeichert | Nach dem Sonic Logo Platz lassen | Endbild 5 s ruhig ✔, Ausklang nur Glocke + Pad ✔ | Keine Änderung; beim Schnitt für Social (15/30 s) **nicht** kürzen. |

---

## 3. Oberfläche: intelligent, freundlich, zugeschnitten

Die Oberfläche ist das Produkt – sie muss *im Film* zeigen, dass sie mitdenkt, ohne besserwisserisch zu wirken.

| Feinheit | Warum | Umsetzung |
|---|---|---|
| **Die Oberfläche wächst mit** | „Zugeschnitten“ sieht man nur im Vergleich | In 01 ist die Startseite neutral („Guten Morgen“ ohne Namen, wenige Kacheln); bis 06 wird sie persönlich: Name, Team-Avatare, nächste Schritte, Favoriten im Menü. Die Kamera zeigt am Ende von 04 kurz dieselbe Startseite wie in 01 – jetzt gefüllt. **Aufwand M** (`ui.js` `home({ stage })`, `act2.js`). |
| **Vorschlag statt Automatik** | Intelligenz wirkt freundlich, wenn die Person entscheidet | Assistent schlägt vor („Soll ich die Unterlagen zum 10-Uhr-Termin bereitlegen?“) mit *Ja, gern* / *Später* – der Cursor klickt *Ja*. Kein stilles „Die KI hat gemacht“. **Aufwand S** (Textbaustein in `ui.js` home/support). |
| **Transparenz beim Assistenten** | Vertrauen entsteht durch Nachvollziehbarkeit | Unter jeder Assistent-Antwort eine Quelle („Aus: Handbuch › Dateien teilen“) und ein Chip **„Daten bleiben in deiner Cloud“** (nur, wenn das zutrifft – bitte bestätigen). Passt zur Tagline *Der europäische digitale Arbeitsplatz*. **Aufwand S** (`ui.js` support/menu). |
| **Anrede: Du oder Sie?** | Inkonsistenz fällt unbewusst auf | Schlusszeile sagt „deinen Alltag“ (du), die Oberfläche sagt „Was möchten Sie tun?“ (Sie, aus den echten Screenshots). Empfehlung: Film-Stimme „du“, Produkt-Oberfläche so lassen, wie das Produkt spricht – oder bewusst beides auf „du“. **Entscheidung Kunde.** |
| **Mikro-Freundlichkeit** | Kleine Sätze machen den Ton | Leere Zustände („Noch keine Anfragen – gut so.“), Erfolgsmeldungen („Erledigt. Mira meldet sich in Talk.“), Begrüßung nach Tageszeit. Zwei bis drei solcher Sätze reichen im Film. **Aufwand S**. |
| **Eine Aktion pro Szene, vom Cursor geführt** | Zuschauer*innen lernen die Oberfläche durch *Zuschauen beim Tun* | Bereits so gebaut ✔ (Suche → Menü, App hinzufügen, Frage → Antwort → Chat → Anruf). Feinheit: nach jeder Aktion 0,4 s Ruhe, bevor der Titel wechselt (Lesezeit-Audit). |
| **Rollen-Zuschnitt zeigen, ohne zu verzetteln** | „Für den Kunden zugeschnitten“ heißt: ich sehe *meinen* Fall | Die fünf Rollen aus Akt I (Mitarbeitende, Teams, Geschäftsführung, Datenschutz, IT) tauchen in Akt II als die fünf Personen wieder auf, deren Problem gelöst wird (s. Abschnitt 2, „Problem → Lösung“). Für Branchen-Varianten (Handwerk, Verwaltung, Kanzlei) nur Demo-Inhalte austauschen (`ui.js` DEMO-Daten) – Layout bleibt. **Aufwand S pro Variante.** |
| **Ton der Oberfläche** | UI-Klänge machen die Oberfläche „greifbar“ | Vorhanden ✔ (Klick, Tippen, Swipe, Chime, Klingeln). Feinheit: die Erfolgsmeldungen bekommen den **ersten Ton des Sonic Logos** (A5) – so wird selbst ein Klick zur Marke. **Aufwand S** (`soundtrack.py`, hit `chime`). |

---

## 4. Lesezeit-Audit (Titel und Sätze, Stand 72 s)

Faustregel: sichtbar ≥ 1 s + 0,3 s je Wort; Titel in Versalien eher 0,4 s je Wort.

| Stelle | Wörter | Soll | Ist | Bewertung |
|---|---|---|---|---|
| Hook „Alles funktioniert. Nur nicht dazwischen.“ | 5 | ≈ 3,0 s | 4,0 s (letztes Wort 1,6 s) | ✔ |
| Alltagssatz (z. B. „Jede Erweiterung kostet extra – und die nächste auch.“) | 8 | 3,4 s | 2,7–3,6 s (bis Shove) | ✔ (dritter Satz knapp – ggf. Shove 0,2 s später) |
| „NOCH EIN LOGIN.“ u. a. | 3 | 2,2 s | 0,75 s | bewusst zu schnell (Überforderung) – ok, weil Wiederholung |
| „ES GEHT AUCH ANDERS.“ | 4 | 2,6 s | 1,0 s + Nachhall bis 24 s | ✔ |
| 01 Titel + Caption-Wechsel | 7 | 3,8 s | 4,0 s | ✔ |
| 02 Titel + Untertitel + Menüaktion | 11 | 4,3 s | 4,0 s | **knapp** → 5 s oder Untertitel später |
| 03 Titel + Untertitel | 11 | 4,3 s | 6,0 s | ✔ |
| 04 Titel + Untertitel + zweite Zeile (Talk) | 17 | 6,1 s | 10,0 s | ✔ |
| 05 Titel + drei Glieder | 10 | 4,0 s | 6,0 s | ✔ |
| 06 Titel + Untertitel | 11 | 4,3 s | 8,0 s | ✔ |
| Schluss: Zeile 1, Zeile 2, Tagline, CTA | 14 | 5,2 s | 7,25 s | ✔ |

---

## 5. Ehrlichkeit als Wirkmittel – was wir bewusst **nicht** tun

* Keine erfundenen Zahlen, Logos oder Kundenstimmen. Die Alltagssätze sind klar als *Beispiele* erkennbar (erfundene Personen, illustriert, keine Firmen).
* Keine Produkt- oder Firmennamen im Chaos-Teil, keine Angstbilder, keine „Nur heute“-Dringlichkeit.
* Geplante Funktionen bleiben als **Sneak Peek** markiert.
* Echte Fotos nur mit Lizenz oder Einverständnis – die Illustrationen sind dafür ein sauberer Platzhalter.

Warum das Wirkung ist: Vertrauen ist die Voraussetzung dafür, dass die Marke überhaupt gespeichert wird; ein einziger erkennbarer Bluff löscht den Rest.

---

## 6. Umsetzungsreihenfolge (Vorschlag)

**Welle 1 – klein, großer Effekt (je < 1 h):**
1. Callback „Alles funktioniert. Auch dazwischen.“ vor dem Kristall.
2. Orange-Ahnung in der Lücke von „DAZWI SCHEN“.
3. Kette (05) mit exakt den Icons aus 02/03/04.
4. Flagge am Cursor; Erfolgs-Chime = erster Ton des Sonic Logos.
5. Szene 02 auf 5 s (oder Untertitel später) – Film dann 73 s, Takt bleibt (halber Takt mehr).
6. Entscheidung Du/Sie und „Daten bleiben in deiner Cloud“-Chip (nur wenn zutreffend).

**Welle 2 – mittel:**
7. Rollen-Pillen kehren mit Haken zurück (fünf Schleifen schließen).
8. „Die Oberfläche wächst mit“ (neutral in 01, persönlich in 06).
9. Orange-Disziplin je Bild; Blickrichtung der Porträts.
10. Kristall als emotionaler Höhepunkt (Kick setzt nach dem Sonic Logo ein).

**Welle 3 – größer / Entscheidungen:**
11. Sprecherstimme (Vorschlag liegt in `Sprechertext-Vorschlag.md`) – stärkt Erinnerung an die *Idee*, kostet Internationalität.
12. 30-s- und 15-s-Schnitte, 9:16 für Social (siehe `KONZEPTE-WEITERDENKEN.md`).
13. Branchen-Varianten über Demo-Daten.
14. Der 5-Personen-Test aus Abschnitt 1 – vor der finalen Abnahme.

---

## 7. Offene Fragen an euch

1. Darf der Assistent so gezeigt werden (Antworten, Chat, Anruf) – und stimmt „Daten bleiben in deiner Cloud“?
2. Du oder Sie in der Oberfläche?
3. Gibt es eine belegbare Zahl für „mehr Zeit“ (Minuten pro Tag, Tickets pro Monat)? Sonst bleibt es beim Bild.
4. Sprecherstimme ja/nein?
5. Echte (lizenzierte) Fotos statt Illustrationen?
