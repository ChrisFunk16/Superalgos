# Linkado-Werbefilm – Konzept (Stand v3)

**60 Sekunden · 16:9 · 30 fps · deutsch · ruhiger Techno, der sich Schritt für Schritt aufbaut.**
Idee: **Alles funktioniert – nur nicht dazwischen. Linkado verbindet das Dazwischen, und am Ende kristallisiert das Logo heraus.**
Weiterführende Konzepte (Cutdowns, 9:16, KI-Ebene, Faden als Bildelement, Ton): [`KONZEPTE-WEITERDENKEN.md`](KONZEPTE-WEITERDENKEN.md).

## Dramaturgie (30 Takte à 2 s bei 120 BPM)

| Takte | Zeit | Szene | Bild | Ton |
|---|---|---|---|---|
| 1 | 0–2 s | Hook | „**Alles funktioniert. Nur nicht dazwischen.**“ – das Wort „dazwischen“ öffnet sich in der Mitte; schwebende Dateinamen (auch `prompt_final_v7.txt`, `KI-Zusammenfassung (2).pdf`) | Uhr-Ticks, Moll-Dreiklang A – C – E auf den drei Textschlägen (bleibt offen) |
| 2–3 | 2–6 s | Microsoft 365 | *Bekannt und verbreitet. Aber:* abhängig von US-Konzernen · teuer · nicht zugeschnitten (Preisschilder inkl. „+ KI-Zusatz“) | Kartenschlag auf **A**, Zupfton-Figur |
| 4–5 | 6–10 s | openDesk | *Deutsche Lösung. Aber:* nur Oberfläche und Login · für fremde Open-Source-Software · kein durchgängiges Erlebnis | Kartenschlag auf **C**, Marimba-Figur, Hats |
| 6–7 | 10–14 s | Nextcloud | *Starke Open-Source-Basis. Aber:* oft nur auf dem Nötigsten · roh im Alltag · viel Technik | Kartenschlag auf **E**, Glocken-Figur, Offbeat-Bass (A–C–E) |
| 8–9 | 14–18 s | Überforderung in **fünf Blickwinkeln** (Raster 0,75 s) | Mitarbeitende: *Noch ein Login.* · Teams: *Noch ein Tool.* (Tabs füllen sich) · Geschäftsführung: *Noch ein Abo.* · Datenschutz: *Noch eine KI.* („Wohin gehen die Daten?“) · IT: *Noch eine Frage an die IT.* | fünf Akkord-Stabs Am – F – C – G – Am, 16tel-Arpeggio, Rim-Wirbel, Riser, Tape-Stop |
| 10 | 18–20 s | Atempause | harter Schnitt, „Es geht auch anders.“ – der **orange Faden** erscheint | Stille, Sub-Swell, Rückwärts-Hall |
| 11–12 | 20–24 s | **01** Nextcloud als Basis · Linkado als Benutzererlebnis | Lichtflut, graues „Nextcloud-Standard“-Fenster wird zur Linkado-Startseite | **Drop** + Sonic Logo (Moll) A – C – E – A |
| 13–14 | 24–28 s | **02** Mehr Übersicht im Arbeitsalltag | Startseite „Ihr Tag“ rastet ein, Suche „Angebot“ findet Assistent-Antwort, Datei, Termin, Talk, Person | UI-Klicks, Tippen, Offbeat-Hats, Bass |
| 15–17 | 28–34 s | **03** Passende Werkzeuge an einem Ort | „Apps und Pakete“: Deck und Formulare hinzufügen (Icons fliegen in die Leiste), Scroll zu den Paketen, Schalter | Add-Klänge, Arpeggio, Dub-Akkorde |
| 18–20 | 34–40 s | **04** Hilfe direkt in der Cloud | Support: Frage tippen → Antwort des Assistenten in drei Schritten → Anfrage → Antwort vom Support | Chime bei der Antwort, Arpeggio dunkler |
| 21–23 | 40–46 s | **05** Ein stimmiges Gesamtpaket | drei Kettenglieder greifen ineinander | zweite Arpeggio-Stimme, drei Glockentöne, Einrasten |
| 24–26 | 46–52 s | **06** Mehr Zeit fürs Wesentliche | Technik-Reibung schrumpft, Wesentliches wächst; gemeinsam im Dokument | „ruhiger Höhepunkt“, Schimmern |
| 27 | 52–54 s | Aufbau | alles löst sich in Knoten, der Faden verbindet sie | Riser, Fill, Halbtakt-Drop-out |
| 28–30 | 54–60 s | **Finale** | Kristall → LINKADO · *Die Möglichkeiten von Nextcloud. Einfach für deinen Alltag.* · Tagline · ein CTA | Aufhellung A-Moll → A-Dur, **Sonic Logo A – C♯ – E – A**, Ausklang |

Das Schlussbild (Logo, Zeilen, Tagline, CTA) steht **ab 57.0 s volle 3 Sekunden**; es gibt **genau eine** Handlungsaufforderung.

## Was sich gegenüber v2 geändert hat

* **Oberfläche nach den echten Screenshots** (Startseite „Ihr Tag“, Apps und Pakete, Support, Leiste mit gefüllten Icons). Die Instanz war leer – alle
  Inhalte (Termine, Dateien, Anfragen, Namen) sind erfunden. **Kein** Echtdatum, keine Preise, keine Adressen der echten Instanz im Film.
* **Hook „Alles funktioniert. Nur nicht dazwischen.“** statt „Digitale Zusammenarbeit heute.“ – greift die Website-Frage „Funktioniert Ihre Arbeit auch *dazwischen*?“ auf
  und gibt dem Faden und der Kette später ihren Sinn. (Zurückstellen: Konstante in `src/scenes/act1.js`, Abschnitt Hook.)
* **Überforderung als fünf Blickwinkel** (Mitarbeitende, Teams, Geschäftsführung, Datenschutz, IT) statt vier gleichförmiger Zeilen – eigene Bildidee je Blickwinkel,
  Rhythmus 0,75 s („3–3–2“-Gefühl), jeder Schlag ein Akkord.
* **KI-/Zeitgeist-Ebene:** Chaos-Seite zeigt den KI-Wildwuchs („Noch eine KI. – Wohin gehen die Daten?“); Lösungsseite zeigt den ✨ Assistenten in Suche und Support
  (die Oberfläche trägt ihn bereits in der Kopfleiste und in den Einstellungen). Alles in Act II bleibt als **Sneak Peek** gekennzeichnet.
* **Ton allgemeiner:** keine Tritonus-Cluster, kein Polymeter, keine FM-Blips mehr. Klassischer A-Moll-Aufbau; die drei Insellösungen bringen je einen Ton des Akkords (A · C · E).
  Sonic Logo A – C – E – A (Moll beim Drop, Dur im Finale). Sparsame UI-Klangebene. Stems und zwei Mischungen.

## Marke (aus den Screenshots und Logo-Abbildungen von linkado.de)

* Creme `#FAF6EF` · Navy `#1F2532` · Orange `#E67E22` (Orange = Linkado; im Chaos-Teil kommt es bewusst nicht vor, außer als erster „Faden“ in der Pause) · Begrüßungsfläche der Cloud `#C76A19`.
* **Outfit** (Versalien-Headlines, enge Laufweite) + **Inter** (Text); Logo-Tagline in **Barlow Condensed**.
* Markenelemente: die schräge **Flagge** (Keil im „A“), Buttons und Marker mit schräger Kante, nummerierte Abschnitte **01–06**,
  der **Faden** („Folgen Sie dem Faden“), Dateinamen-Chips, Navy-Leiste + orange Begrüßungsfläche der Oberfläche, schräg schraffiertes Tagesband.

## Die zusätzliche Inspiration (Produktfilm-Spezifikation) – was übernommen wurde

| Idee | Umsetzung im Film |
|---|---|
| Eine orange Linie führt durch den Film und endet beim Logo | Der **Faden**: erscheint in der Pause, wird zum Fortschrittsfaden mit sechs Knoten (01–06) am unteren Rand, setzt sich im Finale als geschwungene Linie fort und rastet mit seiner Spitze als Flaggen-Steg ins „A“ |
| Produkt im Mittelpunkt, große Ausschnitte, kontrollierte Zooms | Ein durchgehendes Linkado-Fenster; Kamerafahrten auf Suche, Apps und Pakete, Support; je Szene eine Auswahl, eine Aktion, ein Ergebnis mit Haltezeit |
| Funktionen schrittweise und im Kontext zeigen | Der Assistent antwortet genau dort, wo die Frage entsteht (Suchfeld, Support) |
| Geplante Funktionen gekennzeichnet | „SNEAK PEEK“-Marke in allen Oberflächen-Szenen |
| Pro Einstellung eine kurze Aussage (3–7 Wörter), gut lesbar | Titel 74–80 px, Untertitel 36 px, Aussagen exakt aus dem Briefing |
| Übergänge aus vorhandenen Formen | Das Fenster wird zur Rohfassung und zurück; Kettenglieder; Kartenform löst sich in Knoten, aus denen das Logo kristallisiert |
| Schluss ≥ 3 s, genau ein CTA | ab 57.0 s; CTA „Linkado entdecken“ + Adresse |
| Ton ohne Sprache verständlich, Sounddesign sparsam | alles als Schrift im Bild; wenige tonale Klicks; optionaler Sprechertext liegt bei |
| 4K-Master, Web-Fassung | 3840×2160 und 1920×1080 |

**Bewusst nicht übernommen:** 40 Sekunden Länge (das ursprüngliche Briefing nennt eine Minute, mit Chaos-Intro),
eine eingebaute Sprecherstimme (keine natürliche deutsche Stimme in dieser Umgebung erzeugbar → Sprechertext als Vorschlag),
9:16-Fassung und 15-Sekunden-Schnitt (siehe Konzepte-Dokument – das Projekt ist dafür vorbereitet).

## Ton

120 BPM, A-Moll (Am9 – Fmaj7 – Cmaj7 – Gadd9), ab 54.0 s A-Dur (Amaj9). Act I: weicher Kick, Uhr-Ticks, Achtel-Hats, Offbeat-Bass, hohle Quinte A–E als Drone, die drei Stimmen
verzahnen sich im 16tel-Raster zur Figur A – C – E – A – E – C. Bei 20.0 s löst sich alles im Drop auf (Sub, Breite, Konsonanz). Schichten kommen nacheinander:
Kick → Pad/Sub → Offbeat-Hats/Rim/Bass → Arpeggio → Dub-Akkorde → zweite Stimme → Schimmern; vor dem Kristall ein halber Takt Drop-out.
Alle Bild-Akzente stehen in `timeline.json` und werden vom Ton-Skript zur Laufzeit gelesen (auch Klicks, Tippen, Swipes, Flüge, Chime).
