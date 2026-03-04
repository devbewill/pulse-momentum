---
id: TASK-11
title: 'UX responsive: mobile vs desktop'
status: Done
assignee: []
created_date: '2026-03-03 18:17'
updated_date: '2026-03-03 18:32'
labels:
  - frontend
  - ux
  - responsive
milestone: m-4
dependencies:
  - TASK-7
  - TASK-8
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Progettare e implementare l'adattamento dell'interfaccia per mobile e desktop. Decidere il posizionamento ottimale della zona suggerimenti contestuali su schermi piccoli vs grandi. Su desktop: possibile zona suggerimenti laterale o flottante sopra l'input. Su mobile: suggerimenti come drawer/sheet dal basso o overlay compatto. Gestire la tastiera virtuale mobile che riduce lo spazio visibile. Assicurarsi che l'input bar rimanga sempre accessibile e che l'esperienza sia fluida su entrambi i form factor.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Layout desktop: feed centrato con max-width, suggerimenti sopra input bar o in sidebar
- [x] #2 Layout mobile: feed full-width, suggerimenti in overlay/drawer compatto sopra input
- [x] #3 Input bar visibile e usabile anche con tastiera virtuale aperta su mobile
- [x] #4 Breakpoint responsive definiti (mobile < 768px, desktop >= 768px)
- [x] #5 Touch-friendly: target tap minimo 44px su mobile
- [x] #6 Suggerimenti scrollabili orizzontalmente su mobile per risparmiare spazio verticale
- [ ] #7 Testato su viewport iPhone SE (375px) e iPad (768px) come riferimento
- [ ] #8 Nessun contenuto tagliato o overflow su schermi piccoli
<!-- AC:END -->
