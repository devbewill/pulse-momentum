---
id: TASK-2
title: 'Schema Convex: tabella battiti e indice vettoriale'
status: Done
assignee: []
created_date: '2026-03-03 18:16'
updated_date: '2026-03-03 18:30'
labels:
  - backend
  - database
milestone: m-0
dependencies:
  - TASK-1
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Progettare e implementare lo schema Convex completo per Pulse. Tabella principale "beats" (battiti) con tutti i campi necessari: contenuto testuale, embedding vettoriale, timestamp, metadata (tipo di input, allegati). Configurare l'indice vettoriale per la ricerca semantica. Eventuale tabella utenti se necessario per multi-tenancy futura.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Schema Convex definito in convex/schema.ts con tabella beats
- [x] #2 Campi beat: content (string), embedding (vector), createdAt, updatedAt, inputType (text/voice/attachment), attachmentUrl, attachmentType, isArchived, lastViewedAt, interactionCount
- [x] #3 Indice vettoriale configurato sulla tabella beats per ricerca semantica
- [x] #4 Indici standard su createdAt e isArchived per query ordinate
- [ ] #5 Schema validato e deployato su Convex dev
<!-- AC:END -->
