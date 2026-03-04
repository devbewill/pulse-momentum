---
id: TASK-5
title: 'Convex mutations e queries: CRUD battiti e ricerca vettoriale'
status: Done
assignee: []
created_date: '2026-03-03 18:16'
updated_date: '2026-03-03 18:30'
labels:
  - backend
  - convex
milestone: m-1
dependencies:
  - TASK-2
  - TASK-3
  - TASK-4
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementare tutte le Convex mutations e queries necessarie per il ciclo di vita dei battiti. Mutations: creare un nuovo battito (con embedding), aggiornare contenuto, archiviare/disarchiviare, incrementare contatore interazioni, aggiornare lastViewedAt. Queries: lista battiti ordinati per data (feed principale), ricerca vettoriale per similarità semantica (con filtri e ranking), query singolo battito per ID.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Mutation createBeat: salva contenuto + embedding + metadata, ritorna ID
- [x] #2 Mutation updateBeat: aggiorna contenuto e ricalcola embedding
- [x] #3 Mutation archiveBeat: setta isArchived=true
- [x] #4 Mutation trackInteraction: incrementa interactionCount e aggiorna lastViewedAt
- [x] #5 Query listBeats: ritorna battiti ordinati per createdAt desc, paginati, esclude archiviati di default
- [x] #6 Query searchSimilar: riceve un embedding, ritorna top-N battiti più simili sopra soglia minima con score di similarità
- [x] #7 Query getBeat: ritorna singolo battito per ID
- [ ] #8 Tutte le query/mutation testate con Convex dashboard
<!-- AC:END -->
