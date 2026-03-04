---
id: TASK-6
title: 'Layout app e PulseEditor: feed verticale infinito con input bar'
status: Done
assignee: []
created_date: '2026-03-03 18:16'
updated_date: '2026-03-03 18:30'
labels:
  - frontend
  - ui
milestone: m-2
dependencies:
  - TASK-1
  - TASK-5
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementare il layout principale dell'app e il componente PulseEditor. L'app ha una schermata unica con: (1) feed verticale infinito che mostra tutti i battiti passati dall'alto verso il basso in ordine cronologico, (2) input bar fissa in basso con textarea grande + bottone microfono. Il feed deve supportare scroll infinito (caricamento progressivo), auto-scroll verso il basso quando si aggiunge un nuovo battito, e virtualizzazione per performance con molti battiti. Ogni battito nel feed mostra: contenuto, data/ora, eventuale badge tipo input, miniatura allegato se presente.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Layout full-screen con feed scrollabile e input bar fissa in basso
- [x] #2 Feed verticale mostra battiti in ordine cronologico (più vecchi in alto, recenti in basso)
- [x] #3 Ogni card battito mostra: contenuto testuale, data relativa, icona tipo input
- [x] #4 Scroll infinito con caricamento progressivo (paginazione)
- [x] #5 Auto-scroll al nuovo battito appena inserito
- [x] #6 Input bar: textarea auto-espandibile + bottone microfono (placeholder) + bottone invio
- [x] #7 Invio con Enter (Shift+Enter per newline) o click bottone
- [x] #8 Il nuovo battito viene salvato via mutation Convex e appare nel feed in real-time
- [x] #9 Stile pulito e minimale con Tailwind CSS
<!-- AC:END -->
