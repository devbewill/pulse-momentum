---
id: TASK-15
title: Selezione e azione sui suggerimenti semantici
status: Done
assignee: []
created_date: '2026-03-03 23:15'
updated_date: '2026-03-03 23:17'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Aggiungere interazione multi-selezione sulle SuggestionCard con due azioni: Accorpa (appende contenuto all'input e archivia al submit) e Archivia (archivia immediatamente). Nessuna modifica a schema Convex. Solo UI + logica client.\n\nFile da modificare:\n- components/suggestions/SuggestionCard.tsx\n- components/suggestions/ContextSuggestions.tsx\n- components/PulseEditor.tsx
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementata selezione multi-card sui suggerimenti semantici con due azioni:\n\n- **SuggestionCard**: sostituito `onClick`/`onSuggestionClick` con `isSelected`/`onSelect`; aggiunto ring violet e checkmark quando selezionata\n- **ContextSuggestions**: aggiunto state `selectedIds`, action bar con "Seleziona tutti / Accorpa (n) / Archivia (n)", nuove props `onMerge` e `onArchive`\n- **PulseEditor**: aggiunto `pendingArchiveIds`, `handleMerge` (appende contenuto all'input), `handleArchiveSelected` (archivia subito); `handleSubmit` ora archivia i beat mergiati dopo il createBeat; rimosso codice morto (`trackInteraction`, `highlightedId`, `handleSuggestionClick`)
<!-- SECTION:FINAL_SUMMARY:END -->
