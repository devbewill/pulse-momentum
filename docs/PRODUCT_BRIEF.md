# PULSE - Product Brief

## Overview

Pulse is a progressive web application (PWA) that enables users to capture, organize, and rediscover their thoughts, ideas, and notes through an intelligent semantic suggestion system. The app works both online and offline, with automatic synchronization when connectivity returns.

**Tagline:** "Your ideas, connected"

---

## Core Value Proposition

1. **Instant capture** - Write thoughts, ideas, or notes quickly without friction
2. **Intelligent rediscovery** - The system automatically suggests previously-related notes as you write
3. **Flexible organization** - Manage notes through tags, archive, or theme-based grouping
4. **Distraction-free** - Minimal, brutalist interface focused entirely on writing
5. **Offline-first** - Works completely offline with automatic synchronization

---

## Feature Breakdown

### 1. **Note Capture (Capture)**
Users can create new notes in three modalities:
- **Manual text** - Type directly into the textarea
- **Voice** - Use the device microphone to dictate (Web Speech API)
- **Attachments** - Upload images, PDFs, text files, links (drag-and-drop or click)

**Behavior:**
- Textarea grows dynamically with content (max 260px)
- Auto-saves as offline draft if offline
- After save, note appears immediately in archive

**Minimum input:** 1 character (but system suggests only from 30+ characters)

---

### 2. **Contextual Suggestions in Real-Time**
As the user types, the system analyzes content and suggests previously-related notes.

**How it works:**
1. After 400ms of inactivity and with at least 30 characters
2. Generates a vector embedding of the text (semantic representation)
3. Searches database for notes with similar embeddings
4. Applies 4 ranking metrics:
   - **Semantic similarity** (70%) - how similar the content is at a conceptual level
   - **Recency** (10%) - recent notes have higher weight
   - **Interaction** (10%) - frequently viewed/consulted notes have more weight
   - **Keyword matching** (10%) - bonus if query words appear in the note

**Final score:** Weighted sum of 4 factors (min 0.30 to display)

**Suggestion UI:**
- Card for each note with: content, score, 4-factor breakdown
- Overall score in neon badge
- "Strong Match" vs "Conceptual" badge based on similarity + keyword matching
- Multiple selection available

---

### 3. **Note Merging (Consolidation)**
Users can combine previous notes with the new one they're writing.

**Process:**
1. From input bar, click a suggested note → "Select"
2. Note appears as "merged block" in editor with divider and timestamp
3. Can edit merged block text inline
4. On save:
   - Creates new note containing new text + all merged blocks
   - Archives original notes (soft-archive, not deleted)
5. Toast appears "Pulse saved · X notes merged" with "Undo" button (8 sec)

**Value:** Consolidate related ideas without losing temporal context of each

---

### 4. **Archive (Archive View)**
Dedicated view for all saved notes, with two display modes.

#### **List View**
- Chronologically ordered (most recent first)
- Each note shows:
  - Type icon (voice 🎙, attachment 📎, text ✦)
  - Relative timestamp (e.g., "2 min ago")
  - "+X" badge if created via merge (merged blocks count)
  - Text preview (2 lines max)
  - Tag preview (if present)
- Click to expand and see full details

#### **Topics View**
- Automatic grouping by keyword
- Each topic shows:
  - Highlighted keyword
  - Count of notes in topic
  - Neon square next to name (visual branding)
  - Notes grouped with gray background
- Collapsible to compact topics

**Search:** Input to filter by content or tag (case-insensitive)

---

### 5. **Expanded Note Management**
When you click a note to expand it, you see:

**Main section:**
- Full content with whitespace preserved
- If contains merged blocks: divider with each timestamp
- Attached image (if present)

**Tag editor:**
- Display existing tags (neon background)
- Input to add new tags (Enter to add)
- Click tag to remove
- Tags auto-lowercase and spaces converted to dashes

**Footer actions:**
- **Edit** - Modify note content
- **Copy** - Copy text to clipboard (feedback "Copied!" for 2 sec)
- **Archive** - Soft-archive the note (hides from list, not deleted)
- **Type badge** - Shows input type (voice/attachment/text)

**Edit mode:**
- Textarea with full content
- Save (saves and regenerates embedding) and Cancel buttons
- Prevents other actions while editing

---

### 6. **Export**
Export all notes as markdown file.

**Format:**
```
# Pulse Export

## [Date] · [Type]

[Content]

Tags: [tag1, tag2]

---

## [Date] · [Type]
...
```

**Location:** Download button in Archive toolbar

---

### 7. **Matching Weights Customization**
Users can dynamically personalize the 4 ranking factors.

**Slider panel:**
- 4 sliders, one per factor (0-100%)
- **Auto-normalization:** When you change a value, others adjust proportionally to maintain sum = 1.0
- Description of each metric
- "Reset defaults" button to restore (0.70, 0.10, 0.10, 0.10)
- "Close" button

**Access:** Gear icon in input bar (during capture)

**Storage:** Choices saved in localStorage, persist across sessions

---

### 8. **Sidebar Stats (Desktop Only)**
On desktop, left sidebar shows:
- Pulse logo with payoff "Your ideas, connected"
- Navigation: Capture, Archive
- **Statistics:**
  - **Total** - Count of unarchived notes
  - **Merged** - Count of notes soft-archived via merge
- Version link ("v0.1 · PWA · Offline")

---

### 9. **Offline Support**
App works completely offline.

**Behavior:**
- **Online:** Saves directly to Convex backend
- **Offline:** Saves drafts to IndexedDB (browser database)
- **Status bar:** Yellow banner "Offline — sync pending" when offline
- **Sync:** When back online, drafts automatically synchronize
- **Suggestions:** Offline, suggestions use cached client-side embeddings

---

### 10. **Onboarding**
On first opening (when stats.total === 0), app shows:

**First Note screen:**
- Title "First note"
- Description "Start with a thought, a goal, or an idea."
- 3 interactive starter prompts:
  - 📌 "A monthly goal" → "My main goal this month is "
  - 💡 "An idea on my mind" → "I have an idea on my mind: "
  - 🎯 "A problem to solve" → "I'm trying to figure out how to solve "
- Click to insert text into input and start

---

### 11. **Soft Archive vs Hard Delete**
No hard delete. When you archive a note:
- Note remains in database with flag `isArchived = true`
- Doesn't appear in list or suggestions
- Can be recovered (theoretically - future feature?)
- Counts in "Merged" counter

---

### 12. **Voice Input**
Uses browser's Web Speech API to dictate notes.

**Process:**
1. Click microphone icon
2. Icon turns red with pulsing animation
3. Real-time dictation
4. On completion, text appends to input bar
5. Continue typing or save

**Limitations:** Depends on browser/OS language

---

### 13. **Auto-Archive on Inactivity**
Notes not viewed/modified for 3 months auto-archive.

**Visual effect:** Opacity 40% (hover 70%) to distinguish

**Purpose:** Keep focus on recent and relevant notes

---

## User Flows

### Flow 1: Quick Capture
1. User opens app (or already open)
2. Types into textarea
3. System suggests related notes (after 30 char + 400ms)
4. User clicks Save (or Enter)
5. Note saved, textarea cleared, suggestions disappear

### Flow 2: Conscious Merge
1. User types new note
2. System suggests previously-related note
3. User clicks suggested card → selects it
4. Note appears as merged block with timestamp
5. User can edit merged block content
6. Clicks Save
7. New note created with all merged blocks, originals archived
8. "Undo" toast available for 8 sec

### Flow 3: Archive Search
1. User opens Archive view
2. Sees last 30 notes (paginated)
3. Types query in search
4. List filters by content match + tag match (case-insensitive)
5. Clicks note to expand
6. Sees content, tags, and footer actions

### Flow 4: Weight Customization
1. During capture, clicks gear icon
2. Slider panel appears
3. Moves one slider (e.g., similarity 0.70 → 0.50)
4. Others auto-adjust (recency, interaction, keyword)
5. Suggestions update in real-time with new weights
6. Choices saved in localStorage
7. Closes panel

---

## User Segments

1. **Thought Capturer** - Writes random thoughts, wants quick capture
2. **Idea Organizer** - Seeks to connect related ideas (merge)
3. **Knowledge Manager** - Wants to find previously-related notes
4. **Voice-first User** - Prefers dictation
5. **Offline User** - Works without stable connectivity

---

## Key Metrics

- **Engagement:** Notes/day, merge rate
- **Retention:** DAU, MAU
- **Quality:** Suggestion relevance (user feedback?)
- **Performance:** Suggestion latency, offline sync success rate
- **Adoption:** Voice recordings used, attachments used

---

## Future Roadmap (Potential)

- [ ] Note sharing (public link)
- [ ] Collaboration (multiple users)
- [ ] Auto-intelligent tagging
- [ ] Multiple export formats (PDF, JSON)
- [ ] Advanced full-text search + filtering
- [ ] Notifications for important notes
- [ ] Custom themes
- [ ] Native mobile apps

---

## Success Criteria

✅ User can capture note in < 5 sec
✅ Relevant suggestions appear while typing
✅ Merge preserves context of all notes
✅ App works offline without lag
✅ UI doesn't distract from writing
✅ Archive search is instant
