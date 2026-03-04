# PULSE - Design System & UI/UX Brief

## Design Philosophy

**Brutalist Minimalism** - Bold, unapologetic, zero-frills interface focused entirely on content and function. No rounded corners, no drop shadows, no gradients. Maximum contrast. Strong typography. Black and white with a single vibrant accent color.

**Anti-distraction** - The UI should disappear. User focuses on writing, not on UI chrome.

---

## Color Palette

### Primary Colors
| Role | Color | Usage |
|------|-------|-------|
| Background | `#ffffff` (white) | Main canvas, paper-like |
| Text/Foreground | `#18181b` (zinc-950) | Body text, all dark elements |
| Borders | `#18181b` (zinc-950) | All lines, 5px weight (bold) |
| Accent/Brand | `#FF00FF` (magenta neon) | CTA buttons, score badges, highlights, visual emphasis |

### Secondary Colors (Grayscale)
| Name | Hex | Usage |
|------|-----|-------|
| Zinc 100 | `#f4f4f5` | Hover states, subtle backgrounds |
| Zinc 200 | `#e4e4e7` | Dividers, borders (thin) |
| Zinc 300 | `#d4d4d8` | Disabled states |
| Zinc 400 | `#a1a1a6` | Secondary text, captions |
| Zinc 500 | `#71717a` | Tertiary text, timestamps |
| Zinc 700 | `#3f3f46` | Dark gray text |
| Zinc 800 | `#27272a` | Very dark |
| Zinc 950 | `#18181b` | Near black (primary foreground) |

### Status Colors (Light Touch)
- **Red:** `#dc2626` (hover/delete actions)
- **Amber:** `#f59e0b` (offline warning)
- **Green:** Reserved (not used currently)

### Visual Hierarchy by Color
1. **White** (background) = lowest emphasis
2. **Zinc 50-300** = subtle UI elements
3. **Zinc 400-700** = secondary text
4. **Zinc 950** = primary text & borders
5. **Magenta #FF00FF** = maximum emphasis (call-to-action)

---

## Typography

### Font Family
- **Primary:** System stack (no web fonts for perf)
  ```css
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
              Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  ```
- **Monospace:** `font-mono` (Tailwind: `ui-monospace, "Courier New"`)

### Type Hierarchy

| Role | Weight | Size | Line Height | Tracking | Notes |
|------|--------|------|-------------|----------|-------|
| H1 / Logo | 900 (black) | 20px-24px | 1 | `-0.02em` | UPPERCASE, tight |
| H2 / Section | 900 (black) | 13px-14px | 1.4 | `0.2em` (wider) | UPPERCASE |
| Body Text | 700 (bold) | 17px | 1.65 | normal | Content, readable |
| Secondary | 500 (medium) | 15px-16px | 1.6 | normal | Note text, smaller emphasis |
| Label | 900 (black) | 11px-13px | 1.4 | `0.25em` (wide) | UPPERCASE, very tight |
| Monospace | 600 (semibold) | 11px-12px | 1.4 | normal | Timestamps, counts, code |
| Small Text | 500 (medium) | 10px-11px | 1.4 | normal | Captions, descriptions |

### Font Weights Used Only
- 500 = Medium (secondary text)
- 600 = Semibold (monospace labels)
- 700 = Bold (body content)
- 900 = Black (headers, labels, emphasis)

**No:** 300, 400, 800 weights (keep palette tight)

### Text Styling Rules
- **All UI chrome:** UPPERCASE + letter-spacing (0.2em to 0.25em)
- **All body content:** sentence case + normal spacing
- **Timestamps:** monospace, smaller, zinc-400 to zinc-500
- **Counts/Badges:** monospace, font-black (900), right-aligned usually

---

## Spacing System

**Based on 4px baseline grid:**

| Name | Value | Usage |
|------|-------|-------|
| xs | 2px | Micro spacing |
| sm | 4px | Tight spacing |
| md | 8px | Standard spacing |
| lg | 12px | Medium spacing |
| xl | 16px | Large spacing |
| 2xl | 20px | Larger spacing |
| 3xl | 24px | Sections |
| 4xl | 32px | Major sections |
| 5xl | 40px | Full sections |
| 6xl | 48px | Page margins |

### Component Spacing Examples
- **Input bar:** `px-4 py-3` (16px horizontal, 12px vertical) = breathing room
- **Card padding:** `px-5 py-4` (20px horizontal, 16px vertical) = comfortable
- **Button padding:** `px-3 py-2` (12px horizontal, 8px vertical) = compact
- **Gap between cards:** `gap-1.5` or `gap-2` (6-8px)
- **Section borders:** 5px thick (magenta or black)

---

## Borders & Dividers

### Border Weight
| Class | Weight | Usage |
|-------|--------|-------|
| `border` | 1px | Subtle, secondary elements |
| `border-[3px]` | 3px | Stat boxes, medium emphasis |
| `border-[5px]` | 5px | **Major UI elements** (input, sidebar, separators, cards) |

### Border Color
- **Primary:** `border-zinc-950` (black, 5px) = strongest
- **Secondary:** `border-zinc-200` (light gray, 1px) = subtle
- **Accent:** None (never use magenta as border, reserved for fill)

### Dividers
- Horizontal: `border-t` or `border-b` (1px gray)
- Between notes: `divide-y-[5px] divide-zinc-950` (5px black separator)
- Visual breathing room with padding above/below

---

## Components

### Buttons

**Base style:**
```css
/* All buttons */
display: flex;
align-items: center;
gap: 0.5rem; /* 8px between icon and text */
font-weight: 700 (bold);
font-size: 13px;
text-transform: uppercase;
letter-spacing: 0.1em (wider);
padding: 8px 12px (py-2 px-3);
border: 1px solid;
transition: all 150ms;
cursor: pointer;
```

**Button Variants:**

#### Primary CTA (Send button)
```
Background: var(--neon) #FF00FF
Text: zinc-950 (black)
Border: none
Hover: inverted (bg white, text black)
Style: send-btn class with bold tracking
```

#### Secondary Button (Copy, Edit, Archive)
```
Background: white
Text: zinc-500
Border: zinc-200
Hover: bg-zinc-50 → bg-zinc-950 (if action btn) or
       border-zinc-950, text-zinc-950
```

#### Danger Button (Archive)
```
Background: white
Text: zinc-500
Border: zinc-200
Hover: bg-red-50, border-red-400, text-red-600
Disabled: opacity-30
```

#### Merge Button (in suggestions)
```
Background: zinc-950
Text: white
Border: zinc-950
Hover: bg-white, text-zinc-950
Style: bold, strong call-to-action
```

### Input Fields

**Textarea (note writing):**
```css
width: 100%;
background: white;
border: 5px solid zinc-950; /* BOLD */
padding: 16px (px-4);
font-size: 18px (text-[18px]);
font-weight: 900 (black);
line-height: 1.75;
color: zinc-950;
outline: none;
resize: none;
min-height: 120px;
max-height: 260px (grows dynamically);

placeholder:
  color: zinc-300;
  font-weight: 700 (bold);
```

**Text input (search):**
```css
background: white;
border: none;
padding: 0 (no padding, sits in flex row);
font-size: 15px;
font-weight: 700 (bold);
color: zinc-950;
outline: none;

placeholder:
  color: zinc-300;
```

### Cards & Containers

**Suggestion card (match):**
```css
width: 100%;
display: flex flex-col;
border: 5px solid zinc-950; /* BOLD */
padding: 12px (px-3 py-3.5);
gap: 12px;

Background:
  - Default: white
  - Hover: zinc-50
  - Selected: zinc-950 text-white

Content:
  - Header: small uppercase label + timestamp
  - Score badge: neon background, zinc-950 text
  - Body text: bold, readable
  - Breakdown bars: visual score decomposition
```

**Pulse card (archive):**
```css
width: 100%;
border-bottom: 5px solid zinc-950; /* BOLD separator */
padding: 24px (py-6 px-5);

Collapsed:
  - 2 lines of text (clamp)
  - Meta row: type icon, timestamp, merge count, chevron
  - Tags preview (neon backgrounds)
  - Hover: bg-zinc-50

Expanded:
  - Full content (whitespace preserved)
  - Merged blocks (divider + smaller text)
  - Tag editor
  - Footer actions
```

### Badges & Labels

**Score badge (neon):**
```css
background: var(--neon) #FF00FF;
color: zinc-950;
font-family: monospace;
font-weight: 900 (black);
padding: 4px 8px;
border-radius: 0; /* NO ROUNDING */
font-size: 13px;
```

**Tag:**
```css
background: var(--neon) #FF00FF;
color: white;
font-weight: 900 (black);
font-size: 11px;
text-transform: uppercase;
letter-spacing: 0.1em;
padding: 6px 10px;
border-radius: 0;
```

**Type dot (voice/attachment/text):**
```css
width: 8px;
height: 8px;
border-radius: 50%; /* ONLY rounded element */

voice → amber-400
attachment → blue-400
text → magenta (var --neon)
```

**Match strength label:**
```css
font-size: 12px;
font-weight: 900 (black);
text-transform: uppercase;
letter-spacing: 0.2em;

"Strong Match" → zinc-950
"Conceptual" → zinc-400
```

---

## Layout & Spacing Patterns

### Desktop Layout (md: 768px+)

```
┌─────────────────────────────────────────┐
│ Sidebar (w-52=208px)  │  Main Content  │
├──────────────────────┼────────────────┤
│ Logo + Payoff        │                │
│ Nav (Capture/Archive)│                │
│ Stats boxes (3px brd)│  [Content]     │
│ v0.1 footer          │                │
└──────────────────────┴────────────────┘
```

**Sidebar:**
- Width: `w-52` (208px) fixed
- Right border: `border-r-[5px] border-zinc-950` (bold)
- Padding: `px-5 pt-8 pb-6` (comfortable)
- Divider between nav and stats: `mx-4 my-5 h-px bg-zinc-100` (subtle gray line)

**Main content:**
- Full width minus sidebar
- Padding: varies by page
- Max width for readability: none (full width)

### Mobile Layout (< md: 768px)

```
┌──────────────────┐
│ TopBar (logo)    │
├──────────────────┤
│  [Content]       │
│  (full screen)   │
├──────────────────┤
│ Bottom nav       │
│ (Capture/Archive)│
└──────────────────┘
```

**Top bar:** `h-14` (56px), `py-3.5`, border-b
**Bottom nav:** Safe area inset, `py-3`, `gap-1` between items
**Divider in bottom nav:** `w-px bg-zinc-100 self-stretch my-2` (vertical line)

---

## Interaction & Motion

### Transitions
- **Duration:** 100ms to 300ms (no slow animations)
- **Easing:** ease-out (quick response)
- **Properties:** color, background, transform, opacity

### Hover States
- **Buttons:** Border and text color change to zinc-950
- **Cards:** Subtle `bg-zinc-50` highlight
- **Archive expand:** Cursor pointer, highlight background

### Focus States
- **Textareas:** Already have outline: none (no default blue ring)
- **Buttons:** No focus ring styling (kept minimal)

### Loading States
- **Spinner:** CSS animation `animate-spin`
  ```css
  border: 2px solid zinc-700 (light);
  border-top: 2px solid var(--neon) (magenta);
  border-radius: 50%;
  ```
- **Toast:** Fade in/out with `toast-enter` animation

### Animations
- **Card enter:** `animation-delay: index * 25ms` (stagger effect)
- **Block enter:** `animation-delay: index * 60ms + 30ms`
- **Expansion:** `aria-expanded` attribute controls `pulse-expand` animation
- **Chevron:** `rotate-180` on open

### Gestures (Mobile)
- Tap/click to expand
- Swipe (future - not implemented)
- Long-press (future - not implemented)

---

## Visual Elements & Icons

### Decorative Elements
- **Star (✦):** Main symbol for Pulse
  - Logo: `text-[24px]` with `star-glow` animation
  - Empty state: `text-4xl` centered
  - Text type indicator: monospace small
  - Section header: `text-[13px] leading-none font-black`

- **Neon square:** Magenta 3x3px box
  - Next to topic names (visual brand anchor)
  - Next to merged block dividers (visual hierarchy)

- **Chevron (▼/▶):** Expand/collapse indicator
  - Rotates 180° when expanded

- **Spinner:** Loading state
  - Magenta border-top on gray border

### Icons (All inline SVG)
- **Attachment:** Paper clip `📎`
- **Microphone:** Mic button with pulse animation when recording
- **Gear/Settings:** Matching weights panel toggle
- **Export:** Download arrow
- **Close (×):** Remove, archive, dismiss
- **Check (✓):** Selected state

### Emojis (Deliberate Use)
- 📌 "A monthly goal" starter prompt
- 💡 "An idea on my mind" starter prompt
- 🎯 "A problem to solve" starter prompt
- 🎙 Voice input icon
- 📎 Attachment icon
- 📄 File icon
- 🔗 Link icon
- ✦ Pulse star symbol

---

## Responsive Breakpoints

**Tailwind breakpoints used:**
- `md` (768px) = sidebar appears, desktop layout
- Below `md` = mobile layout with bottom nav

**No adaptive changes** beyond layout:
- Font sizes stay same
- Spacing stays same
- Colors stay same

---

## Dark Mode

**No dark mode.** Design is intentionally light with maximum contrast.

---

## Accessibility

### Contrast Ratios
- Black (#18181b) on white: **21:1** (WCAG AAA) ✅
- Magenta (#FF00FF) on white: **3.8:1** (WCAG AA, not AAA)
  - Used only for CTA, not body text

### Keyboard Navigation
- Tab through buttons → natural order
- Enter on buttons, textareas
- Escape to close modals (future)
- No custom focus styles (keep default outline or none)

### Screen Reader (Aria)
- `aria-expanded` on collapsible cards
- `aria-label` on icon buttons
- Semantic HTML (button, input, etc.)
- No hidden text via `display: none` (use `sr-only` if needed)

### Testing
- Lighthouse accessibility audit: target 90+
- Manual testing with keyboard only
- Screen reader testing (NVDA/JAWS)

---

## UI Behaviors

### Empty States
- **No notes:** Large star, "No pulses", link to Capture
- **No search results:** "No results for '{query}'"
- **No suggestions while typing:** Nothing shown until match appears

### Error States
- **Upload error:** Red border bar above input, error message
- **Network error:** Offline banner at top
- **Validation:** Input constraints only (no error messages for empty)

### Loading States
- **Search:** Spinner while generating embedding + waiting for results
- **Save:** Button becomes disabled, shows "Saving…"
- **Archive:** Button shows "Archiving…"

### Success States
- **Copy:** Button text changes to "Copied!" for 2 sec
- **Merge:** Toast "Pulse saved · X notes merged" with Undo option

---

## Design Tokens (Tailwind CSS)

### Color Tokens
```javascript
// In globals.css :root
--neon: #FF00FF; // Magenta
```

### Size Tokens
```javascript
text-[10px] through text-[18px] (explicit)
px-1 through px-6 (standard padding)
py-1 through py-6 (standard padding)
gap-1 through gap-4 (element gaps)
border, border-[3px], border-[5px] (explicit widths)
```

### Animation Tokens
```css
animate-spin (180 rotate, continuous)
animate-pulse (opacity fade)
transition-all 150ms (standard)
duration-100 (quick feedback)
```

---

## Quality Checklist

✅ **No rounded corners** (except type dots which are circles)
✅ **No shadows**
✅ **No gradients**
✅ **No transparencies** (except animations)
✅ **Bold black borders** (5px on major elements)
✅ **Uppercase UI chrome only**
✅ **Monospace for numbers/timestamps**
✅ **Neon accent for maximum emphasis**
✅ **Full width on mobile, sidebar on desktop**
✅ **High contrast** (white ↔ black, or black + neon)
✅ **No animations longer than 300ms**
✅ **Consistent spacing on 4px grid**

---

## Future Design Directions (Optional)

- [ ] Dark mode variant (if needed)
- [ ] Custom fonts (Google Fonts serif for contrast?)
- [ ] Animated illustrations (micro-interactions)
- [ ] Color themes (vs. fixed magenta)
- [ ] Sticker/emoji reactions
- [ ] Custom cursor
- [ ] Glassmorphism (unlikely - against brutalist style)

---

## Design System Documentation

This brief should be your source of truth for:
- Color selections
- Typography choices
- Spacing decisions
- Component styling
- Interaction patterns
- Responsive behavior

When in doubt, refer back to the **Design Philosophy** at the top:
**Brutalist Minimalism + Anti-distraction.**
