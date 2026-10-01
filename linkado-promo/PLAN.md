# Plan: Vom guten Film zum Film, der in Erinnerung bleibt

Stand: Basis steht (Dramaturgie, Marke, Oberfläche, Finale, Ton). Dieser Plan nennt, was ich zusätzlich anpassen oder
hinzufügen würde – nach Wirkung und Aufwand sortiert. **S** = ca. 1 Stunde, **M** = halber Tag, **L** = ein Tag oder mehr.

## 0. Ton – erster Teil (bereits überarbeitet, Hörprobe liegt bei)

**Befund (gemessen):** Der Chaos-Teil klang eher nach verstreuten Piepsern als nach Techno. Bis 6 s gab es keinen Puls, danach nur einen
Herzschlag; 60–65 % der Energie lagen unter 120 Hz (Drone, gedämpfter Kick), und der Drop bei 20 s war nur 2 dB lauter als 16–18 s –
es fehlte der Kontrast, die „Erlösung“.

**Neu (v2, „dekonstruierter Groove“):**
* Puls ab der ersten Sekunde (gedämpfter Kick, Filter öffnet sich bis 18 s), Hats ab 6 s, offene Hats ab 10 s, „falscher“ Bass-Puls ab 10 s (Gis/Tritonus statt A).
* Drei Stimmen bleiben auf dem Raster (3/16, 5/16, 7/16) und stehen harmonisch gegeneinander (Gis – Es – G gegen A-Moll), laufen aber jetzt durch Delay, Hall und Sidechain – sie „atmen“ mit dem Kick.
* Weniger Tiefbass im Chaos (Halbton-Dyade A/B statt 55-Hz-Drone). Der erste echte Sub kommt im Atemzug (18–20 s); der Drop löst das B♭ nach A auf.
* Rim-Wirbel (16–18 s) und **Tape-Stop** in den letzten 0,6 s statt hartem Schnitt; Rückwärts-Becken in den Drop; Kontrast Chaos → Drop jetzt ≈ 5 dB.

**Weitere Ton-Ideen:**
1. **Sonic Logo** (S): ein 4-Ton-Motiv (A – C♯ – E – A) als Glocke im Finale; im Chaos taucht es zerstückelt/verstimmt auf, bei 54 s ist es vollständig und rein. Das ist der Ohrwurm-Anker.
2. **UI-Klangebene** (M): Klicks, Swipes, Einrasten, Fenster-Whoosh – tonal in A-Moll, sehr sparsam, synchron zu Cursor, Appshop-Flug, Kettenglied-Snaps.
3. **Stereobreite und Tiefe** (S): aktuell ist der Mix stark mittig (Korrelation 0,95); Pad/Arps breiter, Hall-Rückführung differenzierter.
4. **Stems** (S): Drums, Bass, Pad, Arps, FX, Glocken als Einzelspuren für den Schnitt (und späteres Absenken unter eine Sprecherstimme).
5. **Zwei Mischungen** (S): −14 LUFS (Social/Web) und eine leisere Fassung für Messe/Empfang.

## 1. Idee schärfen – ein Satz, der hängen bleibt (hohe Wirkung)

* **„Dazwischen“ als Leitgedanke** (S, Text/Dramaturgie): Eure Website fragt „Ihre Programme funktionieren. Aber funktioniert Ihre Arbeit auch
  *dazwischen*?“ – das ist die schärfste Markenidee. Der **Faden** ist genau dieses Dazwischen. Vorschlag: Hook statt „Digitale Zusammenarbeit heute.“ →
  **„Deine Programme funktionieren. Aber funktioniert deine Arbeit auch dazwischen?“** (3 s, zweiteilig, letztes Wort orange), und der Faden
  zeigt sich schon bei 0,0 s als kurzes Aufblitzen zwischen zwei Chips. Alles Weitere erzählt, wie Linkado das Dazwischen verbindet.
* **Chaos kürzer, stärker** (M): 20 s → ca. 15–16 s. Drei gleichartige Karten wirken beim zweiten Mal wiederholend. Besser: Karte 1 voll (3 s), Karte 2 und 3
  kompakter und mit eigener Bildidee (nicht dreimal Karte + Fenster rechts), dazu weniger Text pro Karte (zwei statt drei Lücken). Gewonnene Sekunden gehen an Act II.
* **Ein „Wow“-Moment pro Akt** (M): Act I = Überforderung mit Beat-Sync und Tape-Stop; Act II = ein 3-Sekunden-Heldenschuss der Oberfläche (volles Bild, leichte 3D-Neigung,
  Parallaxe, Cursor-Spur); Finale = Kristall (steht). Aktuell liegen die sechs Nutzen auf gleicher Dichte.

## 2. Bild – moderner und lebendiger

1. **Echte Bewegungsunschärfe + 60 fps** (M, großer Qualitätssprung): Mein Renderer ist deterministisch, ich kann pro Bild 4 Unterbilder mitteln (echte Motion-Blur) oder in 60 fps ausgeben.
   Kosten: Renderzeit ×4 (4K ≈ 25 Min.). Wirkt sofort „teuer“ und flüssig, vor allem bei Kamerafahrten, Wischern und dem Kristall.
2. **Act II abwechslungsreicher** (M–L): Alle sechs Szenen haben „Text links, Fenster rechts“. Varianten: Szene 02 mit Fenster vollflächig und Text als Overlay, Szene 03 Appshop mit 3D-Karussell,
   Szene 04 Hilfe als Split-Screen (Frage → Antwort), 05 Kette größer/zentral, 06 Zeitleiste quer über das ganze Bild. Textspalte wechselt Seite.
3. **Der Faden als echtes Bildelement** (M): Er soll nicht nur unten laufen, sondern **Dinge verbinden**: zieht den Cursor, verbindet Suche → Datei → Termin (02), die Apps mit der Leiste (03), Frage → Antwort (04). Aktuell ist er zu dezent.
3. **Typografie in Bewegung** (S–M): Die Headlines kommen immer gleich (Zeilenmaske). Variation: kinetische Wörter, Hervorhebung des orangen Worts mit Unterstreichung, Zahlen, die „zählen“ (01 → 06).
4. **Detailpolitur** (M): leichte Tiefenunschärfe im Hintergrund, konsistente Schatten/Licht, Mikro-Interaktionen (Hover, Ripple, Fokus-Ring), dezentes Korn/Vignette, Farbkorrektur (Creme wärmer, Navy tiefer), echte Fenster-Spiegelung.
5. **Poster-/Anfangsbild** (S): Das erste Bild ist leer; ein starkes Standbild (Hook oder Logo-Ahnung) für Thumbnails und Autoplay-Vorschau.
6. **Echte Produktbilder** (M): Wenn ihr eine Bildschirmaufnahme der echten Oberfläche (Startseite, Dateien, Appshop-Entwurf) liefert, ersetze ich die Nachbauten – das erhöht die Glaubwürdigkeit am meisten.
7. **Schlussbild** (S): sanfter Lichtreflex über das Logo bei ~58,5 s, Claim „Hier entscheiden wir selbst.“ (aus der Website) als Eyebrow über dem Logo prüfen.

## 3. Marke und Inhalt absichern

* Original-Logo (SVG) und exakte Farbwerte einsetzen (S). Schluss-Tagline entscheiden: „Der europäische digitale Arbeitsplatz“ (Logo) oder „offener Arbeitsplatz“ (Briefing).
* Aussagen zu Microsoft 365 / openDesk / Nextcloud rechtlich/inhaltlich freigeben; Nextcloud-Zeile entschärft oder entfernen (S).
* Appshop-/Hilfe-Ansichten gegen den echten Funktionsstand prüfen; was nicht existiert, bleibt als „Sneak Peek/Ausblick“ markiert (S).
* Kundenstimme oder Kennzahl nur, wenn belegbar (nicht erfunden).

## 4. Fassungen und Auslieferung

| Fassung | Aufwand | Anmerkung |
|---|---|---|
| 9:16 (Reels/Stories/Shorts) | L | eigenes Layout je Szene (Text oben, Oberfläche unten), größere Schrift, sichere Ränder |
| 15 s und 30 s Cutdowns | M | Hook → Überforderung → „Es geht auch anders.“ → 3 Kernbilder → Logo; eigener Kurzschnitt des Tons |
| Eingebrannte Untertitel/Kurzfassung ohne Ton | S | für stummes Autoplay in Social Media |
| Sprecherfassung | M | Text liegt vor; Einsprechen, Musik absenken (Stems) |
| Englische Fassung | M | alle Texte zentral in den Szenendateien |
| Standbild-Set, GIF-Loop (Kristall), Endkarte als PNG | S | Social/Website |

## 5. Qualitätssicherung (laufend)

Smartphone-Test auf echtem Gerät, Lautheit/Plattform-Check, Farbkontrast/Barrierefreiheit der Schrift, Gegenhören auf Laptop-Lautsprechern und Kopfhörern, Review in drei Stufen
(Animatic → Bildschnitt → Tonabnahme).

## Empfohlene Reihenfolge

1. Ton Act I abnehmen (Hörprobe) und **Sonic Logo** + UI-Klänge ergänzen.
2. **„Dazwischen“-Hook** und gestraffter Chaos-Teil; Faden als verbindendes Element.
3. **Motion Blur / 60 fps**, Act-II-Varianten, Detailpolitur.
4. Marke finalisieren (Logo, Farben, Echtbilder), danach Fassungen (15 s, 9:16, Untertitel).
