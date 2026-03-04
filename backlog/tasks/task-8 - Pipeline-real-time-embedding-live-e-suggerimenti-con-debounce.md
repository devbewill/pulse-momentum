---
id: TASK-8
title: 'Pipeline real-time: embedding live e suggerimenti con debounce'
status: Done
assignee: []
created_date: '2026-03-03 18:17'
updated_date: '2026-03-03 18:30'
labels:
  - frontend
  - ai
  - performance
milestone: m-2
dependencies:
  - TASK-5
  - TASK-7
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementare la pipeline completa che collega l'input dell'utente ai suggerimenti contestuali in tempo reale. Mentre l'utente scrive nella textarea: (1) debounce del testo (300-500ms dopo l'ultimo carattere), (2) generazione embedding del testo parziale lato client, (3) query vettoriale a Convex con l'embedding generato, (4) applicazione della formula di ranking (similarità + recency + interazione), (5) aggiornamento dei suggerimenti nel componente ContextSuggestions. Usare useQuery di Convex per subscription reattiva o alternativa con fetch manuale debounced. Gestire stati di loading e testo troppo corto (minimo N caratteri prima di cercare).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Debounce configurabile (default 400ms) sull'input utente
- [x] #2 Soglia minima di caratteri prima di attivare la ricerca (es. 10 chars)
- [x] #3 Embedding generato lato client dal testo parziale
- [x] #4 Query vettoriale Convex invocata con l'embedding generato
- [x] #5 Risultati filtrati per soglia minima di similarità e rankati secondo formula di business
- [x] #6 Suggerimenti aggiornati nel componente ContextSuggestions senza flickering
- [x] #7 Stato di loading visibile (indicatore discreto) durante la ricerca
- [x] #8 Nessuna race condition: solo l'ultima query in-flight conta
- [x] #9 Performance: l'intero ciclo (input → suggerimenti) completa entro 1-2 secondi
<!-- AC:END -->
