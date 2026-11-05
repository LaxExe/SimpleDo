# SimpleDo Design Guide
*Current Live Design System & Interaction Specification*

---

## 1. Design Philosophy

SimpleDo’s design language is built on **high density, strict minimalism, and zero cognitive noise**, inspired by modern engineering tools like Vercel and Linear:

1. **High Signal, Zero Fluff**:
   - Strictly **no tutorial hints**, instructional subtitles, or redundant labels like `(collapse)`, `(expand)`, `hide`, or `show`.
   - Actions and states are self-explanatory through clean iconography, crisp typographic hierarchy, and direct visual affordances.
2. **Speed & Direct Manipulation**:
   - Every tap or click produces instant local feedback (<16ms) and synchronizes to Firebase Realtime Database in under 50ms across phones, tablets, and laptops.
3. **Mobile-First Parity**:
   - The desktop and mobile experiences offer identical capabilities. On mobile, the app provides a native iOS/Android feel with bottom tab navigation, bottom-sheet modals, and safe-area padding.
4. **Disciplined Color Accents**:
   - The foundation is calm and monochrome (`#fafafa` canvas, `#ffffff` cards, `#171717` ink, `#ebebeb` borders). Vibrant colors are reserved strictly for **functional semantics**: inbox/course identity, priority urgency, and completion states.

---

## 2. Color System & Surface Tokens

### 2.1 Neutral Foundation
| Token | Hex Value | Role / Usage |
| :--- | :--- | :--- |
| **Canvas** | `#fafafa` | Global background canvas for pages and navigation headers |
| **Card Surface** | `#ffffff` | Primary container background for task lists, inboxes, and forms |
| **Card Subtle** | `#fafafa` / `#f5f5f5` | Sub-cards, unselected pills, and inactive group backgrounds |
| **Border / Divider**| `#ebebeb` | Hairline 1px border for cards, inputs, pills, and row dividers |
| **Text Primary** | `#171717` | High-contrast body text, headings, and active elements |
| **Text Secondary**| `#525252` / `#737373` | Subheadings, active counts, and metadata |
| **Text Muted** | `#a3a3a3` / `#737373` | Empty states, inactive icons, and timestamps |
| **Text Strikethrough** | `#a3a3a3` | Completed task titles |

---

### 2.2 Semantic Accent Palette (Inboxes & Categories)
SimpleDo provides a curated 10-color palette for categorizing tasks and courses:

| Accent Color | Hex | Default Assignment / Semantic Role |
| :--- | :--- | :--- |
| **Neutral Black** | `#171717` | General Inbox / Catch-all |
| **Amber** | `#f59e0b` | Mathematics / Calc 117 |
| **Cyan** | `#06b6d4` | Linear Algebra / Math 115 |
| **Purple** | `#8b5cf6` | Physics / Ece 105 |
| **Crimson Red** | `#ef4444` | Programming / Ece 150 |
| **Electric Blue** | `#0070f3` | Communications / Commst 192 |
| **Emerald Green** | `#10b981` | Studio & Project / Ece 190 |
| **Slate Gray** | `#64748b` | Design Team / Wato |
| **Vercel Blue** | `#0068d6` | Career / Co-op |
| **Vibrant Pink** | `#ec4899` | Personal / Extra-curricular |

#### Functional Accent Application Rules:
* **Left Border Accent**: Every task row renders a `3.5px` or `4px` solid left border matching its parent inbox's color.
* **Colored Region Headers**: When grouping tasks by inbox, the card header receives a subtle `10% - 12%` opacity tint (`${inbox.color}12`), a solid `2.5px` circular color dot, and a `4px` left accent bar.
* **Badges**: Inbox tags across both mobile and desktop render a solid `2px` color dot followed by the truncated inbox title.

---

### 2.3 Status & Priority Accents
* **High Priority**: Soft red pill `bg-red-50 text-red-600 border border-red-200/50`.
* **Medium Priority**: Soft amber pill `bg-amber-50 text-amber-700 border border-amber-200/50`.
* **Today Planned State**: Soft green pill with checkmark `bg-green-50 text-green-700 border border-green-200/80 shadow-2xs`.
* **Due Today Accent**: High-contrast urgency card with full-color fill or inverted white-on-dark text and borders.

---

## 3. Typography & Hierarchy

SimpleDo uses clean system font stacks with strict differentiation between prose and quantitative data:

* **Primary Stack**: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
* **Monospace Stack**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace` (strictly used for numbers, dates, counters, badges, and progress fractions).

### Typographic Scale
| Element | Size & Weight | Classes | Notes |
| :--- | :--- | :--- | :--- |
| **Brand Logo** | `16px - 18px` / 600 | `text-base sm:text-lg font-semibold tracking-tight lowercase` | Strictly lowercase: `simple do` |
| **Page Title (Today)**| `30px - 48px` / 700 | `text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900` | Clean, bold headline |
| **Page Title (Hub/Tasks)**| `24px` / 600 | `text-2xl font-semibold tracking-tight text-neutral-900` | Standard page heading |
| **Region / Section** | `12px - 14px` / 600 | `text-xs sm:text-sm font-semibold tracking-tight` | Inbox headers & section dividers |
| **Task Title** | `12px - 14px` / 500 | `text-xs sm:text-sm font-medium text-neutral-900 leading-snug` | Truncates cleanly on small screens |
| **Badges & Counts** | `10px - 11px` / 500 | `text-[10px] sm:text-[11px] font-mono font-medium` | Counters, dates, streaks, parts |

---

## 4. Navigation Architecture

### 4.1 Sticky Top Bar (Desktop & Mobile)
* **Classes**: `sticky top-0 z-40 bg-[#fafafa]/90 backdrop-blur-md border-b border-[#ebebeb] pt-safe`
* **Brand**: `simple do` in lowercase sans-serif on the left.
* **Desktop Navigation Pills**: Centered floating pill bar `bg-[#ebebeb]/60 rounded-full border border-[#ebebeb] p-1`.
  * Inactive tabs: `text-neutral-600 hover:text-neutral-900 hover:bg-white/50 px-3.5 py-1.5 text-xs rounded-full`.
  * Active tab: `bg-white text-neutral-900 shadow-sm font-medium`.
  * Badges: Pill counter in `bg-neutral-200 text-neutral-900 text-[10px] font-mono font-medium rounded-full px-1.5`.

### 4.2 Native Mobile Bottom Bar
* **Classes**: `fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ebebeb] px-3 py-1.5 pb-safe shadow-modal`
* **Layout**: 4-column balanced grid with icons and compact labels:
  * **Today** (`Sun` icon)
  * **Tasks / Inbox** (`CheckSquare` / `Inbox` icon — defaults to the Inbox Hub)
  * **Tracker** (`Activity` icon)
* **Active State**: Inset pill highlight `bg-neutral-100/70 text-neutral-900 font-semibold`, icon stroke switches from `stroke-[1.75]` to `stroke-[2.5]`.
* **Badge Counter**: Overlaid solid black pill `bg-neutral-900 text-white text-[9px] font-mono font-bold rounded-full`.

---

## 5. Core Component Specifications

### 5.1 Task Item Anatomy (`renderTaskItem`)
Each task is an interactive row inside a `divide-y divide-[#ebebeb]/70` card:

1. **Left Inbox Color Bar**:
   - `style={{ borderLeft: "3.5px solid " + inboxColor }}` provides instant color anchoring.
2. **Checkbox Toggle**:
   - Active: Outline circle `Circle className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500"`.
   - Completed: Solid filled dark circle with checkmark `CheckCircle2 className="w-4 h-4 text-neutral-900 fill-neutral-200"`.
3. **Task Title**:
   - Active: `text-neutral-900 font-medium text-xs sm:text-sm`.
   - Completed: `line-through text-neutral-400`.
   - **Click Action**: Clicking the title cycles the 5-stage progress bar.
4. **4-Part Segmented Progress Bar**:
   - Dismissible 5-stage cycle:
     `No Progress Bar` ➔ `0/4` ➔ `1/4` ➔ `2/4` ➔ `3/4` ➔ `4/4` ➔ `No Progress Bar`.
   - Features 4 hairline segmented blocks with progress fills.
5. **Action Pills & Badges**:
   - **Priority**: High (Red) or Med (Amber).
   - **Inbox**: Colored dot (`2px`) + Inbox name (`inline-flex` across mobile and desktop).
   - **Due Date**: Calendar icon + `YYYY-MM-DD` date.
   - **Today Toggle**: Green checkmark button when active (`Planned for Today`); sun icon button when unassigned.
   - **Quick Edit & Delete**: Edit pencil and delete trash icon (revealed on hover on desktop, always accessible).

---

### 5.2 Inbox Hub & Regional Cards
The **Inbox Hub** organizes coursework into manageable scopes:
* **Inbox Selector**: Pill carousel with inbox color indicators, active counts, and an "All Inboxes" view.
* **Grouped Inbox Cards**: When sorting tasks by inbox, each inbox receives a distinct card with:
  * Colored header bar with `10%` background tint.
  * Solid color indicator dot and bold uppercase title.
  * Mono task counter badge.
  * Task list nested cleanly inside with row dividers.
* **Sub-View Switcher**: Clean pill toggle at top of page allowing instant switching between:
  * `[ Inboxes ]` (Default hub view organized by course with events)
  * `[ All Tasks ]` (Comprehensive list view with sorting and filters)

---

### 5.3 Today Page & Planning Shelf
1. **Today Section**:
   - Clean header with dynamic active task counter.
   - Scheduled tasks list.
   - Highlighted **Due Today** card for items whose hard calendar deadline is today.
2. **Plan Section ("Available")**:
   - Horizontal scrolling track of available tasks grouped by inbox.
   - Smooth `<` and `>` scroll buttons for mobile and desktop tracks.
   - Draggable cards with grip handles and one-click `+ Add` buttons to schedule into Today.
   - Available habits shelf with streak flame icons.

---

### 5.4 Habits & Streak Tracker
* **Rule**: Streaks only count days where a habit was explicitly planned/dragged into that day's plan.
* **Streak Pill**: Monospace streak counter with Flame icon `Flame className="w-3.5 h-3.5"`.
* **7-Day History Track**: Clean horizontal row of circular day nodes (filled black for done, ring for scheduled, dot for resting).

---

### 5.5 Modals & Dialogs
* **Desktop**: Centered floating modal `sm:rounded-xl max-w-lg border border-[#ebebeb] shadow-modal`.
* **Mobile**: Bottom sheet sliding up from bottom `rounded-t-2xl max-h-[92vh] pb-safe`.
* **Backdrop**: `bg-neutral-900/40 backdrop-blur-sm animate-fadeIn`.

---

## 6. Elevation & Motion Tokens

| Token | CSS / Tailwind | Application |
| :--- | :--- | :--- |
| **Hairline Border** | `border border-[#ebebeb]` | All cards, inputs, and pills |
| **Subtle Shadow** | `shadow-subtle` (`0 1px 2px 0 rgba(0, 0, 0, 0.05)`) | Cards, forms, and floating headers |
| **Micro Shadow** | `shadow-2xs` (`0 1px 1px 0 rgba(0, 0, 0, 0.03)`) | Pills, small buttons, and badges |
| **Modal Shadow** | `shadow-modal` (`0 10px 25px -5px rgba(0, 0, 0, 0.1)`) | Popovers, modals, bottom sheets |
| **Fade In** | `animate-fadeIn` (`opacity: 0 -> 1`, 150ms) | Page transitions and tab changes |
| **Scale In** | `animate-scaleIn` (`transform: scale(0.98) -> scale(1)`) | Modals, inline forms, popovers |

---

## 7. Zero-Fluff Rule Summary for Future Contributions

When modifying or adding features to SimpleDo, maintain strict compliance with these invariants:
1. **Never re-introduce verbose instructional text**, hints, or subtitles under headers.
2. **Never add textual state toggles** like `(collapse)` or `(expand)` — use clean chevrons (`ChevronDown`) that rotate on toggle.
3. **Always preserve the 5-stage progress bar cycle** (`No Bar` ➔ `0/4` ➔ `1/4` ➔ `2/4` ➔ `3/4` ➔ `4/4` ➔ `No Bar`).
4. **Never pass `undefined` values** to Firebase Realtime Database. Always deep-clone and serialize payloads cleanly via `JSON.parse(JSON.stringify(data))`.
5. **Tasks default to the Inbox Hub** as the primary organizational structure for user coursework and categories.
