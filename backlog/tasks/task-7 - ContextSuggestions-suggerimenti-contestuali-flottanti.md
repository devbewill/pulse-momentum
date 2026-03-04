---
id: TASK-7
title: 'ContextSuggestions: suggerimenti contestuali flottanti'
status: Done
assignee: []
created_date: '2026-03-03 18:16'
updated_date: '2026-03-03 18:30'
labels:
  - frontend
  - ui
milestone: m-2
dependencies:
  - TASK-5
  - TASK-6
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementare il componente ContextSuggestions che mostra i battiti passati semanticamente rilevanti rispetto a ciò che l'utente sta scrivendo. La zona suggerimenti appare sopra l'input bar solo quando ci sono match rilevanti. Ogni suggerimento è una card compatta che mostra: data, primo rigo di testo (troncato), miniatura allegato se presente, badge "match forte" o "match concettuale". Toccando/cliccando un suggerimento → scroll automatico alla nota originale nel feed. Animazioni fluide di entrata/uscita dei suggerimenti.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Zona suggerimenti appare sopra l'input bar solo quando ci sono match (hidden se nessun match)
- [x] #2 Mostra 3-5 card suggerimento in layout orizzontale scrollabile o griglia compatta
- [x] #3 Ogni card mostra: data relativa, anteprima testo (max 2 righe), badge match forte/concettuale
- [x] #4 Se il battito ha un allegato, mostra miniatura nella card
- [x] #5 Click/tap su card: scroll smooth alla posizione del battito originale nel feed
- [x] #6 Il battito target viene evidenziato brevemente dopo lo scroll
- [x] #7 Animazione fluida di entrata (slide-up/fade-in) e uscita dei suggerimenti
- [x] #8 Score di similarità non visibile all'utente ma presente nel DOM per debug
<!-- AC:END -->
