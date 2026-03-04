---
id: TASK-10
title: 'Allegati: foto, file e link per battito'
status: Done
assignee: []
created_date: '2026-03-03 18:17'
updated_date: '2026-03-03 18:32'
labels:
  - frontend
  - backend
  - media
milestone: m-3
dependencies:
  - TASK-6
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementare la possibilità di allegare un singolo file (foto, documento o link URL) a ciascun battito. L'utente può: (1) caricare una foto/file tramite bottone clip o drag-and-drop, (2) incollare un URL che viene salvato come allegato link. Gli allegati vengono salvati su Convex file storage. Nel feed, i battiti con allegati mostrano una miniatura (per immagini) o un'icona tipo file. I link mostrano un preview basico (titolo se disponibile).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Bottone clip/allegato nell'input bar per selezionare file
- [x] #2 Supporto upload immagini (jpg, png, webp) e documenti comuni (pdf)
- [x] #3 Drag-and-drop file sulla textarea funzionante
- [x] #4 Rilevamento automatico URL nel testo e opzione di salvarli come allegato link
- [x] #5 File caricati su Convex file storage con URL persistente
- [x] #6 Anteprima immagine inline nel feed (miniatura cliccabile per full-size)
- [x] #7 Icona tipo file per allegati non-immagine
- [x] #8 Limite dimensione file ragionevole (es. 10MB) con feedback utente
- [x] #9 Un solo allegato per battito (come da spec)
<!-- AC:END -->
