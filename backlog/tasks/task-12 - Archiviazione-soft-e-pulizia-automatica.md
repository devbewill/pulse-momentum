---
id: TASK-12
title: Archiviazione soft e pulizia automatica
status: Done
assignee: []
created_date: '2026-03-03 18:17'
updated_date: '2026-03-03 18:32'
labels:
  - frontend
  - backend
  - ux
milestone: m-4
dependencies:
  - TASK-5
  - TASK-6
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementare il sistema di archiviazione soft dei battiti. I battiti non spariscono mai del tutto, ma dopo X mesi senza visualizzazione o modifica vengono visivamente attenuati (opacità ridotta) o spostati in una sezione "meno recenti" in fondo al feed. L'utente può anche archiviare manualmente scrivendo "archivia X" o con un'azione esplicita sulla card. I battiti archiviati rimangono ricercabili semanticamente ma non occupano spazio visivo nel feed principale.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Battiti non visualizzati/modificati da X mesi mostrati con opacità ridotta (es. 50%)
- [x] #2 Soglia temporale configurabile (default: 3 mesi)
- [x] #3 Azione manuale 'archivia' disponibile su ogni card battito (swipe o menu contestuale)
- [x] #4 Battiti archiviati nascosti dal feed principale ma visibili con toggle 'mostra archiviati'
- [x] #5 Battiti archiviati rimangono nel database e sono ricercabili via vector search
- [x] #6 I battiti archiviati che risultano come suggerimento contestuale vengono mostrati con badge 'archiviato'
- [x] #7 Job/logica periodica che calcola quali battiti attenuare in base a lastViewedAt
<!-- AC:END -->
