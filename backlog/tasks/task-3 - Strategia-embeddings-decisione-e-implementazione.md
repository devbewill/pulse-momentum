---
id: TASK-3
title: 'Strategia embeddings: decisione e implementazione'
status: Done
assignee: []
created_date: '2026-03-03 18:16'
updated_date: '2026-03-03 18:30'
labels:
  - ai
  - backend
milestone: m-0
dependencies:
  - TASK-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Decidere e implementare la strategia per la generazione degli embeddings vettoriali dei battiti. Valutare le due opzioni principali: (1) modello locale/edge con transformers.js (all-MiniLM-L6-v2 o simile) per privacy e zero latenza di rete, (2) API esterna (OpenAI text-embedding-3-small, Voyage AI, o Groq + nomic-embed-text) per qualità superiore. Implementare un servizio/utility che astragga la generazione di embeddings per poter cambiare provider in futuro. Considerare: costo, latenza, qualità del matching, dimensione del vettore, funzionamento offline.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Documento decisionale con pro/contro di ogni opzione (locale vs API)
- [x] #2 Scelta finale motivata e approvata
- [x] #3 Servizio/utility di embedding implementato con interfaccia astratta (generateEmbedding(text) => number[])
- [x] #4 Dimensione del vettore definita e coerente con lo schema Convex
- [x] #5 Test funzionale: dato un testo, produce un embedding valido
- [x] #6 Gestione errori e fallback implementati
<!-- AC:END -->
