# Plan „Feinschliff“ – zweiter Durchgang über die 76-s-Fassung

Grundlage: alle 152 Standbilder des fertigen Films (alle 0,5 s), zwölf Detailbilder in voller Auflösung an den
verdächtigen Stellen, dazu der Pegelverlauf des Tons in 0,25-s-Fenstern. Der Ton wurde **nur gemessen, nicht gehört**.

Kurzfazit: Dramaturgie, Tempo und Bildsprache stimmen. Was bleibt, sind **Nähte** – sechs Übergänge, die noch nicht
sauber sind, und ein paar kleine Bildfehler. Alles davon ist klein; zusammen ist es ein Nachmittag und ein Render.

---

## A. Übergänge und Timing – würde ich auf jeden Fall ändern

| # | Zeit | Befund (im Bild geprüft) | Änderung | Aufwand · Datei |
|---|---|---|---|---|
| 1 | 23,0–24,0 | **„Es geht auch anders.“ ist nur ~0,3 s komplett lesbar.** Die Buchstaben laufen bis 23,7 s ein, bei 24,0 kommt der Drop. Der wichtigste Satz des Films geht unter. | Satz bei **22,5 s** beginnen (direkt auf dem ersten Herzschlag-Kick, 0,5 s nach dem Schnitt), Buchstaben etwas schneller (25 ms statt 35 ms Abstand) → der Satz steht ≥ 1,1 s, Faden und Glühen bauen weiter bis 24,0 auf. | S · `timeline.json` (text-Hit), `act1.js` liest `ASK` |
| 2 | 27,2–28,0 | **Kamera „pumpt“ vor dem Geräte-Beat:** Sie zoomt erst in die Menü-Pose von Szene 02 hinein (Fenster wird rechts beschnitten), um 0,2 s später wieder aus dem Gerät herauszuziehen. Rein–raus–rein. | Kamera bleibt bis zum Beat in der Vollansicht; der Beat zieht aus der Vollansicht heraus und kehrt in sie zurück; die Fahrt in die Menü-Pose kommt **nach** dem Beat (32,0–32,7). Eine Richtung, kein Pumpen. | S · `act2.js` (`POSES`, `beatCam`) |
| 3 | 31,0–31,5 | **Handy und „1 TAB“-Chip werden am rechten Bildrand abgeschnitten**, während die Kamera zurück ins Fenster fährt – das Handy ist noch voll sichtbar und rutscht aus dem Bild. | Rückfahrt erst ab 31,0 (1 s statt 1,5 s), Handy gleitet 30,8–31,3 nach rechts hinaus und blendet aus, Browser-Leiste blendet 31,0–31,5 aus. Nichts wird beschnitten. | S · `act2.js` (Geräte-Beat) |
| 4 | 51,9–52,8 | **Talk-Fenster liegt noch unter der Kette.** Das Fenster fliegt in die „away“-Pose genau dorthin, wo die drei Glieder erscheinen; „05“ fährt über das halbtransparente Fenster hoch. | Fenster-Abgang direkt nach dem „Anruf verlassen“-Klick (51,5): 51,55–52,05 statt 51,9–52,8; Cursor 51,5–51,8 aus. Die Kette bleibt, wie sie ist. | S · `act2.js` (`wo`, `POSES` away) |
| 5 | 66,1–67,9 | **Callback „Alles funktioniert. Auch dazwischen.“ steht 1,8 s** – für sechs Wörter knapp, und er ist die Antwort auf den Hook. | Start bei **65,6** (sobald „06“ weg ist), Ausblenden erst mit dem Kristall-Blitz bei 68,0 → 2,4 s. | S · `finale.js` |
| 6 | 28,0–32,0 | **Fortschrittsfaden parkt 4 s** auf dem Knoten von 02, weil die Oberflächen-Zeit im Beat eingefroren ist. | Overlay läuft ungefroren; Knotenzeiten kommen aus `timeline.json`. Der Faden erreicht den Knoten 02 erst bei 32,0. | S · `act2.js` (`a2-ov`, `NODE_T`) |

## B. Bild und Komposition – klein, aber sichtbar

| # | Zeit | Befund | Änderung | Aufwand · Datei |
|---|---|---|---|---|
| 7 | 0,8–3,9 | Die roten Zähler **„3 · 12 · 7“ schweben frei** über dem Hook – ohne Bezug wirken sie wie Flecken. | An die Hintergrund-Fenster hängen (Team-Chat 12, Kalender 7, Posteingang 3) – dann sind es Benachrichtigungen und erzählen „alles funktioniert“. | S · `act1.js` |
| 8 | 11,0–12,5 | **„Tickets“-Fenster am unteren Bildrand beschnitten** (Das fertige Portal). | 60 px höher (y 820). | XS · `act1.js` (`AROUND`) |
| 9 | 14,5–17,0 | Werkzeug-Symbole **sitzen auf dem Laptop-Rahmen**; die Fenster „Dateien“/„Tickets“ kleben am oberen Rand (Die offene Basis). | Symbole auf y 150, Fenster auf y 50/60. | XS · `act1.js` (`vBase`) |
| 10 | je Moment | Der **dritte Alltagssatz** steht nur 1,75 s, bevor der Moment weggeschoben wird. | Shove 0,25 s später (S + 4,25 statt S + 4,0); der Übergang zum nächsten Schlag bleibt sauber. | XS · `timeline.json` |
| 11 | 29,5–30,9 | Untertitel des Beats („Ein Tab genügt: Linkado läuft im Browser – auf jedem Gerät.“, 10 Wörter) steht 1,4 s. | Kürzer: **„Ein Tab genügt – auf jedem Gerät.“**, steht bis 31,2. | XS · `act2.js` |
| 12 | 28–32 | **Uhrzeit** auf dem Handy „9:41“, auf dem Laptop „Jetzt 09:13“; Adresse „cloud.ihre-firma.de“ sagt „Sie“, der Film sagt „du“. | Handy auf 09:13; Adresse **cloud.musterfirma.de** (neutral, unabhängig von Du/Sie). | XS · `devices.js` |
| 13 | 4,0–4,25 | Laptop erscheint mit **leerem weißem Fenster**, die App-Kacheln kommen 0,25 s später. | Fensterkopf „Alle Apps“ und schwache Kacheln ab 4,0, Kacheln rasten dann ein. *(optional, fällt kaum auf)* | XS · `act1.js` (`vSuite`) |

## C. Ton – nur gemessen

* **Keine Löcher, keine ungewollten Sprünge.** Alle Pegelsprünge > 7 dB liegen an gewollten Stellen: Schnitt 22,0, Herzschlag 22,5, Aufbau 23,0, Drop-out 67,5, Kristall 68,0. Der Übergang Geräte-Beat → 02 (30–33 s) ist gleichmäßig.
* **4–8 s:** Der halbe Kick steht ~12 dB über dem Bett (Drone + Ticks). Das ist der „Herzschlag“ und so gewollt – falls er beim Hören zu einzeln wirkt: Drone in diesem Fenster +3 dB oder Kick −2 dB. **Entscheidung nach Gehör.**
* Punkt 1 (Satz bei 22,5) legt den Satz genau auf den ersten Herzschlag – Bild und Ton setzen gemeinsam ein.

## D. Was ich bewusst so lasse

* **05 (Kette) steht 2 s still (55,5–57,5).** Das ist die Ruhe vor 06; Bewegung dort würde dem ruhigeren Takt widersprechen.
* **02 ist die dichteste Szene (Titel + Untertitel + Menü + Tippen + Treffer in 4 s).** Mit dem Beat davor kommt das Auge ruhiger an. Erst ändern, wenn es nach dem nächsten Sehen noch hetzt (dann: Tippen 0,3 s früher, Treffer länger stehen).
* **Schlussbild 4,5 s statisch** mit Lichtreflex: richtig so.
* **Hook-Rhythmus** (0,25 · 1,0 · 2,0 · 2,5 s) und die 24 s von Akt I: passen jetzt.
* **„SNEAK PEEK“-Chip** bleibt, bis die Funktionen freigegeben sind.

## E. Vorgehen

1. **A1–A6 und B7–B12 in einem Durchgang** (ca. 1–2 h Arbeit), ein Render (≈ 15 min), dann wieder 1080p zum Ansehen.
2. **C nach Gehör:** Ihr hört 4–8 s und 22–24 s; ich ziehe nach, falls nötig.
3. Danach ist die Fassung aus meiner Sicht **abnahmereif** – offen bleiben nur eure Entscheidungen (Du/Sie, Sprecher, Fotos, Cutdowns).

## F. Worauf ihr beim nächsten Ansehen achten könnt

* 22–24 s: Ist der Satz jetzt lesbar, und sitzt er auf dem Herzschlag?
* 27–32 s: Fährt die Kamera in einer Linie (raus – halten – rein), ohne Pumpen, nichts beschnitten?
* 51–53 s: Ist das Talk-Fenster weg, bevor die Kette kommt?
* 65–68 s: Reicht die Zeit für „Alles funktioniert. Auch dazwischen.“?
* Akt I: Lassen sich die drei Sätze je Moment lesen?
* Musik 4–8 s: Trägt der halbe Kick, oder steht er zu allein?
