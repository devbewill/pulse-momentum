---
id: TASK-13
title: PWA e offline-first con Service Worker e IndexedDB
status: Done
assignee: []
created_date: '2026-03-03 18:17'
updated_date: '2026-03-03 18:32'
labels:
  - frontend
  - pwa
  - offline
milestone: m-5
dependencies:
  - TASK-6
  - TASK-8
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rendere Pulse una Progressive Web App installabile con supporto offline-first. Implementare service worker per caching delle risorse statiche e delle risposte API. Usare IndexedDB per salvare bozze di battiti quando l'utente è offline, con sincronizzazione automatica quando torna online. Manifest PWA per installazione su home screen mobile. L'app deve essere utilizzabile (almeno in scrittura) anche senza connessione.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Manifest PWA configurato (nome, icone, theme color, display: standalone)
- [x] #2 Service worker registrato con caching delle risorse statiche (App Shell)
- [ ] #3 Installabile su mobile (prompt 'Aggiungi a Home') e desktop
- [x] #4 IndexedDB usato per salvare bozze di battiti offline
- [x] #5 Battiti scritti offline sincronizzati automaticamente al ritorno online
- [x] #6 Indicatore visivo dello stato di connessione (online/offline)
- [x] #7 L'app si carica anche senza connessione (shell statica)
- [x] #8 Nessuna perdita di dati in caso di disconnessione durante la scrittura
<!-- AC:END -->
