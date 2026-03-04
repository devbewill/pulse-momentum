Sei un senior full-stack developer + product thinker con forte esperienza in applicazioni di note-taking potenziate da AI (Mem, Reflect, Tana, Obsidian con plugin AI, Notion AI, Anytype, Logseq).

Devi progettare e guidare lo sviluppo passo-passo di un'applicazione web/mobile chiamata **Pulse**.

Concetto centrale di Pulse (molto importante – leggilo attentamente)
───────────────────────────────────────────────────────────────
Pulse è un'app di note con un unico flusso verticale infinito (stile chat con te stesso).
Non esistono cartelle, progetti, tag visibili, sidebar, grafi, database relazionali espliciti dall'utente.

L'elemento distintivo e il motivo per cui l'utente dovrebbe abbandonare Notion / Obsidian / Apple Notes / Bear / Evernote è:

→ Mentre scrivi (o detti) un nuovo pensiero, l'app mostra in tempo reale (o con pochissimo ritardo)
2–5 note / battiti precedenti che sono semanticamente rilevanti al testo che stai scrivendo in questo momento.

Esempio reale:
Scrivi: "progetto alpha cliente vuole cambiare il blu del mockup perché troppo corporate"

Mentre stai scrivendo o subito dopo invio, appaiono in alto (o in zona flottante) preview di:
• nota di 12 giorni fa: "brief progetto alpha – primary color blu #0033A0"
• nota vocale trascritta di 3 settimane: "cliente alpha preferisce toni caldi, evitare look troppo istituzionale"
• foto mockup con scritta a mano: "blu da rivedere – cliente ha detto corporate"
• messaggio: "riunione designer – palette alternative proposte"

L'utente non deve MAI fare Ctrl+F o aprire una ricerca. Deve solo scrivere nel flusso e l'app gli "serve" il contesto rilevante automaticamente.

Requisiti funzionali principali
──────────────────────────────

1. Interfaccia
   - Schermata unica: un editor di testo verticale infinito (molto alto)
   - Input sempre visibile in basso (grande textarea + bottone microfono)
   - Sopra l'input: zona "contesto suggerito" che appare solo quando c'è match rilevante
   - I suggerimenti sono card piccole / snippet con: data, primo rigo di testo, eventuale immagine miniatura, badge "match forte" / "match concettuale"
   - Toccando un suggerimento → scroll automatico alla nota originale nel flusso

2. Input
   - Testo digitato
   - Dettatura vocale (Web Speech API + fallback)
   - Possibilità di allegare 1 foto / 1 file / 1 link per battito

3. Matching semantico in tempo reale
   - Mentre l'utente scrive (o entro 1–2 secondi dall'invio), calcolare embedding del testo corrente
   - Cercare i battiti passati più simili semanticamente (vector search)
   - Mostrare top 3–6 risultati (con soglia minima di similarità)
   - Dare priorità a: recency + frequenza di interazione con quel battito + parole chiave esatte

4. Archiviazione / pulizia automatica soft
   - I battiti non spariscono mai del tutto
   - Dopo X mesi senza visualizzazione / modifica → opacità bassa o spostati in fondo
   - Se l'utente scrive "archivia X" o "nascondi X" → li sposta visivamente più in basso

5. Architettura tecnologica desiderata (2026)
   - Frontend: Next.js 14+ App Router, TypeScript, Tailwind
   - Editor: Tiptap / Lexical / TipTap con estensioni minimali
   - Backend + DB realtime: Convex.dev (fortemente raccomandato per subscription + vector search)
   - Alternative accettabili: Supabase + pgvector, Firebase + vector extension, ma Convex è la prima scelta
   - Embeddings:
     - Opzione 1: modello piccolo locale/edge (all-MiniLM-L6-v2 via transformers.js o simile)
     - Opzione 2: API veloce ed economica (OpenAI text-embedding-3-small, Groq + nomic-embed-text, Voyage AI)
   - PWA + offline-first (service worker + IndexedDB per bozze)

Compiti sequenziali che devi eseguire (vai uno alla volta – aspetta mia conferma)
───────────────────────────────────────────────────────────────────────────────

1. Scrivi lo schema Convex completo (tabella principale + eventuali indici vettoriali)
2. Definisci le regole di business per il colore / priorità / soglia di similarità
3. Proponi la struttura delle cartelle del progetto Next.js
4. Scrivi il componente principale: PulseEditor + ContextSuggestions
5. Scrivi la logica client-side per generare embedding live del testo parziale
6. Scrivi le Convex query/mutation per salvare battito + cercare vettorialmente
7. Spiega come implementare la visualizzazione live dei suggerimenti (useQuery + debounce)
8. Suggerisci UX per mobile vs desktop (dove mettere la zona contesto)
9. Proponi nome alternativo se "Pulse" è troppo generico + slogan breve

Inizia dallo schema Convex + decisione su come gestire gli embeddings (locale vs API).

Pronto quando vuoi. Parti pure.
