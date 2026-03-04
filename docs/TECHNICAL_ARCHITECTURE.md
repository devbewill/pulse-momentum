# PULSE - Technical Architecture

## Stack Overview

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **State:** React Hooks (useState, useEffect, useCallback, useMemo, useContext)
- **Forms:** Native HTML elements (textarea, input)

### Backend
- **Database + API:** Convex.dev (realtime database, mutation/query/action pattern)
- **Vector Search:** Convex Vector Index (by_embedding)
- **Storage:** Convex Files API

### ML/Embeddings
- **Model:** all-MiniLM-L6-v2 (distiluse-base-multilingual-cased-v2)
- **Library:** @xenova/transformers (WASM, runs client-side)
- **Dimension:** 384-dimensional vectors
- **Execution:** 100% client-side (no API calls)

### Offline & PWA
- **Service Worker:** Custom (`public/sw.js`)
- **Local Storage:** IndexedDB per draft persistence
- **Manifest:** `manifest.json` per installazione

### Deployment
- **Hosting:** Vercel (Next.js native)
- **Domain:** N/A (dev mode)

---

## Database Schema

### `beats` table
```typescript
{
  _id: Id<"beats">
  content: string              // Full text with merged blocks
  embedding: number[]          // 384-dim float array (nullable)
  inputType: "text" | "voice" | "attachment"
  attachmentUrl?: string       // URL to file/image in Convex storage
  attachmentType?: "image" | "file" | "link"
  attachmentName?: string
  tags?: string[]              // Array of lowercase keywords
  isArchived: boolean          // Soft-delete flag
  interactionCount: number     // View count (incremented per select)
  lastViewedAt?: number        // Timestamp of last view
  createdAt: number            // Creation timestamp (ms)
  updatedAt: number            // Last modification timestamp (ms)
}
```

### Indexes
```typescript
// Order by creation, filter by archived status
withIndex('by_created', (q) =>
  includeArchived ? q : q.eq('isArchived', false)
)

// Vector similarity search
vectorIndex('by_embedding') {
  filterFields: ['isArchived']
}
```

---

## Core Data Flow

### 1. **Note Creation Flow**

```
User types in textarea (InputBar)
  ↓
onChange → handleInputChange
  ↓
Detect link attachment (useFileUpload hook)
  ↓
User clicks Save or presses Enter
  ↓
buildContent() assembles:
  - Input text
  - Merged blocks (with timestamps)
  ↓
If online:
  ├─ generateEmbedding(content) [client-side]
  ├─ Call createBeat mutation
  └─ Update UI, clear input
If offline:
  ├─ saveDraftOffline(IndexedDB)
  └─ Store locally until sync

createBeat mutation:
  ├─ Insert into beats table
  ├─ Store embedding vector
  └─ Return beat._id

On reconnect:
  ├─ useOfflineSync detects online
  ├─ Syncs all drafts to backend
  └─ Clears IndexedDB
```

### 2. **Semantic Search Flow**

```
User starts typing in input bar
  ↓ (every keystroke)
useSemanticSearch hook fires
  ↓
if (trimmed.length < MIN_SEARCH_CHARS: 30) return []
  ↓ (debounce 400ms)
generateEmbedding(queryText)
  - Tokenize text
  - Run WASM transformer model
  - Get 384-dim vector
  - Return embedding
  ↓
searchSimilarAction (Convex action):
  ├─ ctx.vectorSearch('beats', 'by_embedding')
  │  ├─ Input: embedding vector + limit: MAX_SUGGESTIONS*2
  │  ├─ Filter: isArchived == false
  │  └─ Return: top K results with _score (cosine similarity)
  │
  ├─ Fetch full beat documents
  └─ Return { beat, score: cosine_similarity }
  ↓
Client-side ranking (rankSuggestions):
  For each beat:
    ├─ similarity = raw cosine score
    ├─ recency = exp(-LN2 * ageMs / RECENCY_HALF_LIFE_MS)
    ├─ interaction = log1p(interactionCount) / log1p(10)
    ├─ keyword = wordMatchRatio(query, content)
    │
    └─ score = weights.similarity × similarity
             + weights.recency × recency
             + weights.interaction × interaction
             + weights.keyword × keyword
  ↓
filter(s => s.score >= MIN_COMPOSITE_SCORE: 0.30)
  ↓
.slice(0, MAX_SUGGESTIONS: 5)
  ↓
.sort by score DESC
  ↓
Display SuggestionCard components
```

### 3. **Merge Flow**

```
User clicks on suggested card
  ↓
onSelect(beatId) → setSelectedIds
  ↓
User clicks "Merge" button
  ↓
handleMerge(selectedSuggestions[])
  ├─ For each suggestion:
  │  └─ Push to mergedBlocks state
  └─ Clear selectedIds
  ↓
Merged blocks display in InputBar with:
  - Divider with neon square
  - Timestamp
  - Editable textarea
  - Close button to remove from merge
  ↓
User clicks Save
  ↓
buildContent():
  ├─ Main input text
  └─ All merged blocks (formatted: "— timestamp —\ncontent")
  ↓
createBeat():
  ├─ Generate embedding for combined content
  ├─ Insert new beat
  └─ Return newBeatId
  ↓
For each source beat in selectedIds:
  └─ archiveBeat(id, archived: true)
  ↓
Set pendingUndo state (8s timeout)
  ↓
Show toast "Pulse saved · X notes merged"
  ├─ Undo button (calls handleUndo)
  └─ Close button (dismisses toast)
  ↓
If Undo clicked (within 8s):
  ├─ archiveBeat(newBeatId, true)
  └─ archiveBeat(sourceIds[], false)
```

### 4. **Archive List & Search Flow**

```
usePaginatedQuery(api.beats.listBeats)
  ├─ includeArchived: false
  └─ Fetch 30 items at a time
  ↓
Filter by searchQuery (case-insensitive):
  ├─ content includes query
  └─ tags include query
  ↓
topicGroups (when viewMode == 'topics'):
  For each beat:
    ├─ extractKeyword(content)
    │  └─ Remove stop words, find most frequent word > 3 chars
    └─ Group by keyword
  ↓
Render:
  - List view: all beats, newest first, collapsed
  - Topics view: grouped by keyword, collapsible, with count
  ↓
User clicks beat:
  └─ setIsExpanded(true)
  ↓
Expanded view shows:
  ├─ Full content (whitespace preserved)
  ├─ Merged blocks (if merged)
  ├─ Tag editor
  └─ Footer actions: Edit, Copy, Archive
```

### 5. **Edit Flow**

```
User clicks "Edit" button
  ↓
setIsEditing(true)
  ↓
Show textarea with beat.content
  ↓
User modifies text in textarea
  ↓
handleSaveEdit():
  ├─ If empty or unchanged: cancel
  ├─ generateEmbedding(newContent)
  └─ updateBeat({ id, content, embedding })
  ↓
Backend updates beat document
  ├─ New content
  ├─ New embedding (for updated relevance)
  └─ updatedAt timestamp
  ↓
UI closes edit mode
└─ Show updated content
```

---

## Key Algorithms

### Recency Score
```typescript
recencyScore(createdAt: number) {
  const ageMs = Date.now() - createdAt
  return Math.exp((-Math.LN2 * ageMs) / RECENCY_HALF_LIFE_MS)
  // Half-life: 60 days
  // 0 days old → ~1.0
  // 60 days old → ~0.5
  // 120 days old → ~0.25
}
```

### Interaction Score (Logarithmic)
```typescript
interactionScore(count: number) {
  return Math.min(Math.log1p(count) / Math.log1p(10), 1)
  // 0 interactions → 0
  // 1 interaction → ~0.30
  // 10 interactions → ~1.0
}
```

### Keyword Boost (Word Matching)
```typescript
keywordBoost(query: string, content: string) {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3)

  const hits = queryWords.filter(w =>
    content.toLowerCase().includes(w)
  ).length

  return hits / queryWords.length
  // 0 matches → 0
  // 50% words match → 0.5
  // 100% words match → 1.0
}
```

### Match Strength Badge
```typescript
matchStrength(similarity: number, keywordScore = 0) {
  return similarity >= 0.25 && keywordScore > 0
    ? 'strong'
    : 'conceptual'
  // Requires both:
  // 1. High semantic similarity (>= 0.25)
  // 2. At least one word overlap
}
```

---

## Configuration Constants

**File:** `lib/config/matching.ts`

```typescript
MIN_SIMILARITY_THRESHOLD = 0.10        // Pre-ranking filter (was 0.15)
MIN_COMPOSITE_SCORE = 0.30              // Post-ranking filter
STRONG_MATCH_THRESHOLD = 0.25           // Badge threshold
CONCEPTUAL_MATCH_THRESHOLD = 0.15      // Minimum match threshold

MIN_SUGGESTIONS = 3
MAX_SUGGESTIONS = 5

WEIGHT_SIMILARITY = 0.70                // Most important
WEIGHT_RECENCY = 0.10
WEIGHT_INTERACTION = 0.10
WEIGHT_KEYWORD_BOOST = 0.10

RECENCY_HALF_LIFE_MS = 60 * 24 * 60 * 60 * 1000  // 60 days

SEARCH_DEBOUNCE_MS = 400                // Wait time before search
MIN_SEARCH_CHARS = 30                   // Minimum query length

SOFT_ARCHIVE_MONTHS = 3                 // Auto-fade threshold
```

---

## Component Architecture

### Page Structure
```
app/
  ├─ layout.tsx (Server Component)
  │  └─ AppShell (Client Component)
  │     ├─ Desktop Sidebar
  │     ├─ Mobile TopBar/BottomNav
  │     └─ Main content area
  │
  ├─ page.tsx (Capture Page)
  │  └─ PulseEditor (Dynamic, SSR:false)
  │     ├─ InputBar
  │     ├─ ContextSuggestions
  │     │  └─ SuggestionCard[] (with breakdown)
  │     └─ OnboardingPrompts (if empty)
  │
  └─ pulses/page.tsx (Archive Page)
     └─ PulsesView
        ├─ Header (search, view toggle)
        ├─ PulseCard[] (list mode)
        │  └─ MergedBlocksContent
        │  └─ TagEditor
        └─ TopicsView (topic mode)
           └─ PulseCard[] (grouped)
```

### State Management

**useMatchingWeights Hook:**
```typescript
- weights: { similarity, recency, interaction, keyword }
- updateWeight(key, value)
- reset()
- Auto-normalization logic
- localStorage persistence
```

**useSemanticSearch Hook:**
```typescript
- suggestions: BeatSuggestion[]
- isSearching: boolean
- Debounced embedding generation
- Vector search integration
- Client-side ranking
```

**useBeats Hook:**
```typescript
- usePaginatedQuery(listBeats)
- useCreateBeat()
- useArchiveBeat()
- useTrackInteraction()
- useUpdateTags()
```

**useFileUpload Hook:**
```typescript
- upload(file): Promise<UploadedAttachment>
- detectLinkAttachment(text)
- isUploading: boolean
```

**useOfflineSync Hook:**
```typescript
- isOnline: boolean
- Offline draft sync logic
- ServiceWorker coordination
```

---

## Embedding Generation Process

**Client-side only, using @xenova/transformers:**

```typescript
async function generateEmbedding(text: string): Promise<number[]> {
  // 1. Lazy load model (cached after first use)
  const extractor = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2'
  )

  // 2. Tokenize + encode (input text → token IDs)

  // 3. Run transformer layers
  //    - Token embeddings
  //    - Positional embeddings
  //    - Attention mechanism
  //    - Linear projection

  // 4. Mean pooling (tokens → 384-dim vector)

  // 5. L2 normalization (normalize to unit vector)

  // 6. Return array of 384 floats
}
```

**Characteristics:**
- Multilingual (supports Italian + 100+ languages)
- 384 dimensions
- Optimized for sentence similarity
- First run takes 1-2s (model loading), subsequent calls are instant
- Warmup on app load via `warmupEmbeddingModel()`

---

## Vector Search Details

**Convex vectorSearch API:**

```typescript
const vectorResults = await ctx.vectorSearch('beats', 'by_embedding', {
  vector: embedding,        // 384-dim query vector
  limit: 10,               // Fetch top 10
  filter: (q) => q.eq('isArchived', false)
})

// Returns:
// [
//   { _id, _score (cosine similarity -1 to 1) },
//   ...
// ]
```

**Similarity Calculation:**
- Cosine similarity between vectors
- Value range: -1 to 1 (usually 0 to 1)
- 1.0 = identical vectors
- 0.5 = partially similar
- 0.0 = orthogonal
- < 0.10 = filtered out

---

## Offline Architecture

### Service Worker Flow
```
sw.js (public/sw.js)
├─ Install: Cache app shell
├─ Fetch: Intercept network requests
│  ├─ If online: Pass through to network
│  └─ If offline: Serve from cache
└─ Message: Receive sync commands
```

### IndexedDB Draft Storage
```typescript
Database: 'pulse-drafts'
Stores:
  - drafts: { id, content, inputType, attachment, createdAt }

Operations:
  - saveDraftOffline(draft)
  - getDraftsOffline()
  - deleteDraftOffline(id)
```

### Online/Offline Detection
```typescript
useOnlineStatus() {
  - Listen to 'online' / 'offline' events
  - Fallback: try fetch to detect
  - Poll every 5s when offline
}
```

---

## Performance Optimizations

1. **Debounced Search** - 400ms debounce prevents excessive computation
2. **Lazy Loading Embeddings Model** - WASM model loaded on first search
3. **Memoized Weights** - `useMemo` prevents unnecessary re-renders
4. **Vector Index** - Convex optimizes similarity search
5. **Pagination** - Load 30 items at a time in archive
6. **CSS Animations** - GPU-accelerated (transform, opacity)
7. **Inline SVG Icons** - No external image requests
8. **Dynamic Textarea Height** - Only updates when content changes

---

## Security Considerations

- **No API Keys exposed** - Convex handles auth via session
- **HTTPS only** - Vercel automatic
- **CORS** - Convex API protected
- **Input Sanitization** - User text is escaped when rendered
- **No sensitive data** - Notes are personal, no user auth system yet
- **Offline data** - IndexedDB isolated per origin

---

## Error Handling

```typescript
// Search errors
try {
  const embedding = generateEmbedding(query)
} catch (err) {
  console.error('[Pulse] Embedding error:', err)
  setSuggestions([]) // Fallback to empty
}

// File upload errors
if (uploadError) {
  // Show error toast in InputBar
}

// Network errors
if (!isOnline) {
  // Switch to offline mode
  saveDraftOffline()
}
```

---

## Testing Strategy (Recommended)

- **Unit Tests:** Ranking functions, embedding validation
- **Integration Tests:** Search flow, merge logic
- **E2E Tests:** User flows (capture → merge → archive)
- **Performance Tests:** Embedding generation time, search latency
- **Offline Tests:** IndexedDB sync, ServiceWorker caching

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Convex project linked
- [ ] Vector index deployed
- [ ] Service Worker cached
- [ ] Lighthouse PWA audit passes
- [ ] Mobile tested (iOS + Android)
- [ ] Offline mode tested
- [ ] Bundle size analyzed (WASM model impact)

---

## Future Technical Improvements

- [ ] WebWorker for embedding generation (offload from main thread)
- [ ] Shared embeddings cache (avoid recomputing same query)
- [ ] Incremental vector search (get more results progressively)
- [ ] Real-time collaboration (Convex sync engine)
- [ ] Full-text search layer (Elasticsearch or Typesense)
- [ ] Image OCR (extract text from uploaded images)
- [ ] Voice model fine-tuning (improve Italian recognition)
