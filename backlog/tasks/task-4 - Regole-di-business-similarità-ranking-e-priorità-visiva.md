---
id: TASK-4
title: 'Regole di business: similarità, ranking e priorità visiva'
status: Done
assignee: []
created_date: '2026-03-03 18:16'
updated_date: '2026-03-03 18:30'
labels:
  - business-logic
  - ai
milestone: m-0
dependencies:
  - TASK-3
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Definire e implementare le regole di business che governano il matching semantico e la presentazione dei suggerimenti. Include: soglia minima di similarità coseno per mostrare un suggerimento, formula di ranking combinata (similarità semantica + recency + frequenza di interazione + match parole chiave esatte), sistema di badge visivi ("match forte" vs "match concettuale"), numero di suggerimenti da mostrare (3-6), logica di priorità per ordinamento risultati.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Soglia minima di similarità definita (es. cosine similarity >= 0.7)
- [x] #2 Formula di ranking documentata: peso similarità + peso recency + peso interazione + boost keyword exact match
- [x] #3 Regole per badge: 'match forte' (similarity > X) vs 'match concettuale' (similarity > Y)
- [x] #4 Numero risultati configurabile, default 3-5, max 6
- [x] #5 Costanti/config centralizzate in un file dedicato (es. lib/config/matching.ts)
- [ ] #6 Test unitari sulla logica di ranking con casi d'esempio
<!-- AC:END -->
