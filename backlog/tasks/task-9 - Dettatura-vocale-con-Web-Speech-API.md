---
id: TASK-9
title: Dettatura vocale con Web Speech API
status: Done
assignee: []
created_date: '2026-03-03 18:17'
updated_date: '2026-03-03 18:30'
labels:
  - frontend
  - voice
milestone: m-3
dependencies:
  - TASK-6
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementare la funzionalità di dettatura vocale nell'input bar. L'utente preme il bottone microfono e detta il proprio pensiero, che viene trascritto in tempo reale nella textarea. Usare Web Speech API (SpeechRecognition) come implementazione primaria con fallback per browser non supportati. La trascrizione completata viene trattata come un normale battito testuale (con inputType="voice"). Gestire permessi microfono, stati (idle/recording/processing), feedback visivo durante la registrazione.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Bottone microfono nell'input bar attiva la dettatura vocale
- [x] #2 Trascrizione in tempo reale visibile nella textarea mentre l'utente parla
- [x] #3 Feedback visivo chiaro dello stato: idle, recording (pulsante rosso/animato), processing
- [x] #4 Richiesta permesso microfono gestita con UX chiara (messaggio se negato)
- [x] #5 Trascrizione completata salvabile come battito con inputType='voice'
- [x] #6 Fallback graceful se Web Speech API non supportata (bottone disabilitato + tooltip)
- [x] #7 Supporto lingue: almeno italiano e inglese
- [x] #8 Stop automatico dopo N secondi di silenzio
<!-- AC:END -->
