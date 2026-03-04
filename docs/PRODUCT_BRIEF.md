# PULSE - Product Brief

## Overview

Pulse è un'applicazione web progressiva (PWA) che consente agli utenti di catturare, organizzare e riscoprire i propri pensieri, idee e note attraverso un sistema intelligente di suggerimenti semantici. L'app funziona sia online che offline, con sincronizzazione automatica quando la connessione torna disponibile.

**Tagline:** "Le tue idee, connesse"

---

## Core Value Proposition

1. **Cattura istantanea** - Scrivi rapidamente pensieri, idee o appunti senza attesa
2. **Riscoperta intelligente** - Il sistema suggerisce automaticamente note precedenti correlate mentre scrivi
3. **Organizzazione flessibile** - Gestisci note tramite tag, archivio, o raggruppamento per tema
4. **Senza distrazioni** - Interfaccia minimale e brutale focalizzata sulla scrittura
5. **Offline-first** - Funziona completamente offline con sincronizzazione automatica

---

## Feature Principali

### 1. **Cattura di Note (Capture)**
L'utente può creare nuove note in tre modalità:
- **Testo manuale** - Digita direttamente nella textarea
- **Voce** - Usa il microfono del dispositivo per dettare (Web Speech API)
- **Allegati** - Carica immagini, PDF, file di testo, link (drag-and-drop o click)

**Comportamento:**
- La textarea cresce dinamicamente con il contenuto (max 260px)
- Auto-salvataggio come draft offline se offline
- Dopo il salvataggio, la nota appare immediatamente nell'archivio

**Input minimo:** 1 carattere (ma il sistema suggerisce solo da 30+ caratteri)

---

### 2. **Suggerimenti Contestuali in Tempo Reale**
Mentre l'utente digita, il sistema analizza il contenuto e suggerisce note precedenti correlate.

**Come funziona:**
1. Dopo 400ms dall'ultima digitazione e con almeno 30 caratteri
2. Genera un embedding vettoriale del testo (rappresentazione semantica)
3. Cerca nel database note con embedding simile
4. Applica 4 metriche di ranking:
   - **Similarità semantica** (70%) - quanto il contenuto è simile a livello di significato
   - **Recency** (10%) - le note recenti hanno più peso
   - **Interaction** (10%) - le note visualizzate/consultate spesso hanno più peso
   - **Keyword matching** (10%) - bonus se le parole della query appaiono nella nota

**Score finale:** Somma ponderata dei 4 fattori (min 0.30 per mostrarsi)

**UI dei suggerimenti:**
- Card per ogni nota con: contenuto, score, breakdown dei 4 fattori
- Score complessivo in badge neon
- Badge "Strong Match" vs "Conceptual" basato su similarità + keyword matching
- Selezione multipla disponibile

---

### 3. **Merge di Note (Accorpamento)**
L'utente può unire note precedenti con quella nuova che sta scrivendo.

**Processo:**
1. Dall'input bar, clicca su una nota suggerita → "Select"
2. La nota appare come "merged block" nell'editor con divider e timestamp
3. Può modificare il testo dei merged blocks (inline editing)
4. Al salvataggio:
   - Crea una nuova nota che contiene il testo nuovo + tutti i merged blocks
   - Archiva le note originali (soft-archive, non eliminate)
5. Appare un toast "Pulse saved · X notes merged" con bottone "Undo" (8 sec)

**Valore:** Consolidare idee correlate senza perdere il contesto temporale di ognuna

---

### 4. **Archivio (Archive View)**
Vista dedicata per tutte le note salvate, con due modalità di visualizzazione.

#### **Vista Lista (List)**
- Elenco ordinato cronologicamente (più recenti in alto)
- Ogni nota mostra:
  - Icona di tipo (voce 🎙, allegato 📎, testo ✦)
  - Timestamp relativo (es. "2 min ago")
  - Badge "+X" se è stata creata tramite merge (vedi merged blocks)
  - Anteprima testo (2 righe max)
  - Tag preview (se presenti)
- Click per espandere e vedere dettagli completi

#### **Vista Temi (Topics)**
- Raggruppamento automatico per keyword principale
- Ogni tema mostra:
  - Keyword evidenziato
  - Numero di note nel tema
  - Quadratino neon accanto al nome (visual branding)
  - Note raggruppate con sfondo grigio
- Collapsible per compattare temi

**Ricerca:** Input per filtrare per contenuto o tag (case-insensitive)

---

### 5. **Gestione Nota Espansa**
Quando clicchi su una nota per espanderla, vedi:

**Sezione principale:**
- Contenuto completo con preservazione del formatting (whitespace)
- Se contiene merged blocks: divider con timestamp di ognuno
- Immagine allegata (se presente)

**Tag editor:**
- Visualizza tag esistenti (sfondo neon)
- Input per aggiungere nuovi tag (Enter per aggiungere)
- Click su tag per rimuovere
- Tag auto-lowercase e spazi convertiti in dash

**Footer actions:**
- **Edit** - Modifica il contenuto della nota
- **Copy** - Copia il testo negli appunti (feedback "Copied!" per 2 sec)
- **Archive** - Soft-archiva la nota (nasconde da lista, ma non elimina)
- **Type badge** - Mostra tipo di input (voice/attachment/text)

**Edit mode:**
- Textarea con tutto il contenuto
- Bottoni Save (salva e rigenera embedding) e Cancel
- Impedisce altre azioni mentre in edit

---

### 6. **Export**
Esporta tutte le note come markdown file.

**Formato:**
```
# Pulse Export

## [Date] · [Type]

[Content]

Tags: [tag1, tag2]

---

## [Date] · [Type]
...
```

**Quando:** Bottone download nella toolbar di Archive

---

### 7. **Matching Weights Customization**
L'utente può personalizzare i 4 pesi del ranking dinamicamente.

**Slider panel:**
- 4 slider, ognuno per un fattore (0-100%)
- **Auto-normalizzazione:** Quando cambi un valore, gli altri si adeguano proporzionalmente per mantenere somma = 1.0
- Descrizione di ogni metrica
- Bottone "Reset defaults" per ripristinare (0.70, 0.10, 0.10, 0.10)
- Bottone "Close"

**Dove accedere:** Icon ingranaggio nell'input bar (durante la cattura)

**Storage:** Le scelte vengono salvate in localStorage, persistono tra sessioni

---

### 8. **Sidebar Stats (Desktop Only)**
Sul desktop, la sidebar sinistra mostra:
- Logo Pulse con payoff "Your ideas, connected"
- Navigazione: Capture, Archive
- **Statistiche:**
  - **Total** - Numero di note non archiviate
  - **Merged** - Numero di note che sono state soft-archiviate tramite merge
- Link versione ("v0.1 · PWA · Offline")

---

### 9. **Offline Support**
L'app funziona completamente offline.

**Comportamento:**
- **Online:** Salva direttamente nel backend Convex
- **Offline:** Salva i draft in IndexedDB (browser database)
- **Status bar:** Banner giallo "Offline — sync pending" quando offline
- **Sincronizzazione:** Quando torna online, i draft si sincronizzano automaticamente
- **Suggerimenti:** In offline, i suggerimenti utilizzano embeddings cached client-side

---

### 10. **Onboarding**
Alla prima apertura (quando stats.total === 0), l'app mostra:

**First Note screen:**
- Titulo "First note"
- Descrizione "Start with a thought, a goal, or an idea."
- 3 starter prompts interattivi:
  - 📌 "A monthly goal" → "My main goal this month is "
  - 💡 "An idea on my mind" → "I have an idea on my mind: "
  - 🎯 "A problem to solve" → "I'm trying to figure out how to solve "
- Click per inserire il testo nell'input e iniziare

---

### 11. **Soft Archive vs Hard Delete**
Nessun hard delete. Quando archivi una nota:
- La nota rimane nel database con flag `isArchived = true`
- Non appare in lista né nei suggerimenti
- Puoi recuperarla (teoricamente - feature futura?)
- Conta nei counter "Merged"

---

### 12. **Voice Input**
Usa Web Speech API del browser per dettare note.

**Processo:**
1. Click icona microfono
2. Icona diventa rossa con animazione pulse
3. Dittatura in tempo reale
4. Al termine, il testo si aggiunge all'input bar
5. Puoi continuare a digitare o salvare

**Limitazioni:** Dipende da browser/lingua del SO

---

### 13. **Soft Archive per Inattività**
Note non visualizzate/modificate per 3 mesi scadono in soft-archive automatico.

**Effetto visivo:** Opacity 40% (hover 70%) per distinguerle

**Scopo:** Mantenere focus su note recenti e rilevanti

---

## User Flows

### Flow 1: Cattura Rapida
1. Utente apre app (o è già aperta)
2. Digita nella textarea
3. Sistema suggerisce note correlate (dopo 30 char + 400ms)
4. Utente clicca Save (o Enter)
5. Nota salvata, textarea clearata, suggerimenti scompaiono

### Flow 2: Merge Consapevole
1. Utente digita nuova nota
2. Sistema suggerisce nota precedente correlata
3. Utente clicca su suggested card → seleziona
4. Nota appare come merged block con timestamp
5. Utente può modificare il contenuto del merged block
6. Clicca Save
7. Nuova nota creata con tutti i merged blocks, originali archiviate
8. Toast "Undo" disponibile per 8 sec

### Flow 3: Ricerca in Archivio
1. Utente apre Archive view
2. Vede ultima 30 note (paginate)
3. Digita query in search
4. Lista si filtra per content match + tag match (case-insensitive)
5. Clicca su nota per espanderla
6. Vede contenuto, tag, e footer actions

### Flow 4: Customizzazione Pesi
1. Durante cattura, clicca ingranaggio
2. Panel slider appare
3. Muove uno slider (es. similarity da 0.70 a 0.50)
4. Gli altri si auto-aggiustano (recency, interaction, keyword)
5. Suggerimenti si aggiornano in tempo reale con nuovi pesi
6. Scelte salvate in localStorage
7. Chiude panel

---

## User Segments

1. **Thought Capturer** - Chi scrive pensieri random, vuole catturare rapidamente
2. **Idea Organizer** - Chi cerca di connettere idee correlate (merge)
3. **Knowledge Manager** - Chi vuole ritrovare note precedenti correlate
4. **Voice-first User** - Chi preferisce dettare
5. **Offline User** - Chi lavora senza connessione stabile

---

## Key Metrics

- **Engagement:** Numero di note/giorno, merge rate
- **Retention:** DAU, MAU
- **Quality:** Relevance dei suggerimenti (feedback user?)
- **Performance:** Latency suggerimenti, offline sync success rate
- **Adoption:** Voci registrate, allegati utilizzati

---

## Future Roadmap (Potential)

- [ ] Sharing di note (public link)
- [ ] Collaboration (multiple users)
- [ ] Tagging auto-intelligente
- [ ] Export formati diversi (PDF, JSON)
- [ ] Ricerca full-text + filtering avanzato
- [ ] Notifications per notes importanti
- [ ] Themes personalizzati
- [ ] Mobile app nativa

---

## Success Criteria

✅ Utente riesce a catturare note in < 5 sec
✅ Suggerimenti rilevanti appaiono mentre digita
✅ Merge di note conserva il contesto
✅ App funziona offline senza lag
✅ UI non distrae dalla scrittura
✅ Ricerca in archivio è istantanea
