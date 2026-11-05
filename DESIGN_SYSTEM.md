# Minimalist Engineering Design System & Style Specification
*A portable, high-density, zero-clutter interface standard for modern web applications.*

> **Usage for AI Agents & Developers**:  
> You can drop this entire document directly into any `AGENTS.md`, system prompt, or design reference. When instructed to redesign or build an application, adhere strictly to the philosophy, color tokens, typographic hierarchy, component patterns, and interaction rules outlined below.

---

## 1. Core Philosophy: The Engineering Standard

This design system is modeled after elite developer tooling (Vercel, Linear, Supabase) and focused on **speed, information density, and zero cognitive friction**:

1. **High Signal, Zero Fluff**:
   - **Strictly eliminate visual clutter**: Never include tutorial hints, instructional subtext, or redundant state labels (e.g. `(click to edit)`, `(collapse)`, `(expand)`, `(hide/show)`).
   - Interface states and controls must be immediately obvious through crisp iconography, clear visual contrast, and direct manipulation affordances.
   - Empty states must be quiet and single-lined (e.g. `text-xs text-neutral-400 font-mono py-12 text-center`), never filled with giant illustrations or patronizing paragraphs.

2. **Speed & Native Tactility**:
   - Every clickable button, pill, checkbox, and navigation tab must provide immediate spring feedback: `active:scale-95 transition-all duration-150`.
   - Pages and panels transition with subtle opacity and scale entries (`animate-fadeIn`, `animate-scaleIn`), avoiding slow, distracting slide effects.

3. **Neutral Canvas with Disciplined Semantic Color**:
   - The interface is predominantly monochrome: a calm, off-white canvas (`#fafafa`), bright crisp white card surfaces (`#ffffff`), hairline borders (`#ebebeb`), and deep near-black ink (`#171717`).
   - Vibrant color is never used as decoration or background noise; it is strictly reserved for **functional semantics** (categories, tags, priority status, and completion state).

4. **Desktop & Mobile Parity**:
   - Mobile is never a stripped-down afterthought. The desktop experience uses floating pill docks and clean split views; the mobile experience seamlessly transforms into an iOS-grade native feel with bottom tab navigation, bottom-sheet modals, and safe-area padding (`pb-safe`, `pt-safe`).

---

## 2. Color System & Surface Tokens

### 2.1 Neutral Foundation Tokens
| Token Name | Hex Code | Tailwind Equivalent | Purpose & Role |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#fafafa` | `bg-[#fafafa]` | Global page canvas, sticky header backdrop, and soft input wells |
| **Surface Card** | `#ffffff` | `bg-white` | Primary container surface for lists, forms, modals, and active pills |
| **Subtle Surface** | `#f5f5f5` | `bg-neutral-100` | Inactive pill trays, hovering rows, and secondary backgrounds |
| **Hairline Border** | `#ebebeb` | `border-[#ebebeb]` | Crisp 1px borders on cards, inputs, tabs, dividers, and modal frames |
| **Divider Line** | `#ebebeb` / `70%` | `divide-[#ebebeb]/70` | Subtle horizontal dividers separating list rows |
| **Ink Primary** | `#171717` | `text-neutral-900` | Primary headings, active item text, solid black buttons, dark icons |
| **Ink Secondary** | `#525252` | `text-neutral-600` | Subtitles, field labels, inactive tabs, and secondary actions |
| **Ink Muted / Mono** | `#737373` | `text-neutral-500` | Quantities, monospace dates, filter labels, and inactive icons |
| **Ink Disabled** | `#a8a8a8` | `text-neutral-400` | Strikethrough completed text, empty state messages, disabled buttons |

---

### 2.2 Curated Semantic Accent Palette
Use these 10 distinct, calibrated colors whenever the application requires tags, categories, projects, channels, or course identities:

| Color Accent | Hex Value | 10% Background Tint (`hex12`) | Semantic Examples |
| :--- | :--- | :--- | :--- |
| **Ink Black** | `#171717` | `#17171712` | General, default, system, root |
| **Amber** | `#f59e0b` | `#f59e0b12` | Mathematics, warnings, finance, calculation |
| **Cyan** | `#06b6d4` | `#06b6d412` | Engineering, algebra, infrastructure |
| **Purple** | `#8b5cf6` | `#8b5cf612` | Science, physics, intelligence, AI |
| **Crimson** | `#ef4444` | `#ef444412` | Programming, urgent bugs, critical paths |
| **Electric Blue** | `#0070f3` | `#0070f312` | Communications, client syncs, product |
| **Emerald** | `#10b981` | `#10b98112` | Studio, design, creative projects, success |
| **Slate Gray** | `#64748b` | `#64748b12` | Documentation, governance, architecture |
| **Cobalt** | `#0068d6` | `#0068d612` | Career, recruitment, executive goals |
| **Vibrant Pink** | `#ec4899` | `#ec489912` | Personal, community, extracurricular |

---

### 2.3 Status & Priority Pills
* **Urgent / High Priority**:  
  `bg-red-50 text-red-600 border border-red-200/50 text-[10px] font-medium px-2 py-0.5 rounded-full`
* **Medium Priority**:  
  `bg-amber-50 text-amber-700 border border-amber-200/50 text-[10px] font-medium px-2 py-0.5 rounded-full`
* **Low / Normal Priority**:  
  `bg-neutral-100 text-neutral-600 border border-[#ebebeb] text-[10px] font-medium px-2 py-0.5 rounded-full`
* **Confirmed / Active Status**:  
  `bg-green-50 text-green-700 border border-green-200/80 text-[11px] font-medium px-2 py-0.5 rounded shadow-2xs`
* **Due Today / High Urgency Card**:  
  Solid dark card or inverted card with white text and high-contrast accents.

---

## 3. Typography & Hierarchy

### 3.1 Font Stacks
1. **Sans-Serif (Primary UI Stack)**:
   ```css
   font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
   ```
   Used for all interface text, labels, headlines, buttons, and navigation.
2. **Monospace (Data & Precision Stack)**:
   ```css
   font-family: 'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;
   ```
   Strictly used for dates, time stamps, quantity counters, badges, progress fractions, and ID tags.

### 3.2 Typographic Hierarchy Reference Table
| Level | Font Size & Leading | Weight | Tracking | Classes |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Logo** | `16px` – `18px` | `font-semibold` | `tracking-tight` | `text-base sm:text-lg font-semibold tracking-tight text-neutral-900 lowercase` |
| **Hero Page Title** | `30px` – `48px` | `font-bold` | `tracking-tight` | `text-3xl sm:text-5xl font-bold tracking-tight text-neutral-900` |
| **Standard Page Title** | `24px` | `font-semibold` | `tracking-tight` | `text-2xl font-semibold tracking-tight text-neutral-900` |
| **Card / Region Title** | `13px` – `14px` | `font-semibold` | `tracking-tight` | `text-xs sm:text-sm font-semibold tracking-tight text-neutral-900` |
| **Item Title** | `13px` – `14px` | `font-medium` | normal | `text-xs sm:text-sm font-medium text-neutral-900 leading-snug` |
| **Input / Field Label** | `12px` | `font-medium` | normal | `text-xs font-medium text-neutral-700 mb-1` |
| **Badge / Counter (Mono)** | `10px` – `11px` | `font-medium` | normal | `text-[10px] sm:text-[11px] font-mono font-medium text-neutral-500` |
| **Strikethrough / Completed**| `13px` | `font-normal` | normal | `line-through text-neutral-400` |

---

## 4. Shadows, Borders & Zero-Clipping Rules

### 4.1 Shadow Tokens
Avoid heavy, blurry drop shadows. Use delicate layered hairlines:
```js
boxShadow: {
  '2xs': '0 1px 2px rgba(0, 0, 0, 0.04)',
  'subtle': '0 0 0 1px #00000014, 0px 2px 2px #0000000a',
  'subtle-hover': '0 0 0 1px #00000020, 0px 4px 6px #0000000f',
  'modal': '0 0 0 1px #00000014, 0px 8px 16px -4px #0000000a, 0px 24px 32px -8px #0000000f'
}
```

### 4.2 Border Radii Hierarchy
* **Full Outer Cards**: `rounded-xl` (`12px` or `16px`)
* **Inner Form Panels & Inputs**: `rounded-lg` (`8px`) or `rounded-md` (`6px`)
* **Buttons, Tags & Pills**: `rounded-full` (`9999px`)
* **Hairline Thickness**: Standard border is always `1px solid #ebebeb`.

### 4.3 ⚠️ Critical Architectural Rule: Eliminating 4px Border Clipping
When applying a 4px colored accent border to an entity (e.g. category card, status box, or inbox):
1. **Apply to the Outer Container**:
   Place `borderLeftWidth: '4px'`, `borderLeftColor: <color>`, and `borderLeftStyle: 'solid'` directly on the outer card container:
   ```tsx
   <div 
     className="bg-white rounded-xl border border-[#ebebeb] shadow-subtle overflow-hidden"
     style={{ borderLeftWidth: '4px', borderLeftColor: categoryColor, borderLeftStyle: 'solid' }}
   >
     {/* Inner Header */}
     <div className="px-4 py-3 border-b border-[#ebebeb]" style={{ backgroundColor: `${categoryColor}12` }}>
       ...
     </div>
     {/* Inner List */}
     <ul className="divide-y divide-[#ebebeb]/70">...</ul>
   </div>
   ```
   *Why*: The CSS `rounded-xl` on the container curves the 4px border naturally with zero jagged clipping at the top-left and bottom-left corners. The internal `border-b` horizontal line ends at the inside edge of the box and **never slices a white notch** through the colored border.
2. **For Flat Lists / Row Items**:
   Never put a `border-left` on individual `<li>` rows inside a card. Instead, use an **inset rounded vertical pill bar**:
   ```tsx
   <span 
     className="w-1 self-stretch rounded-full flex-shrink-0 my-0.5" 
     style={{ backgroundColor: itemColor }} 
   />
   ```
   This guarantees that dividers and rounded corners remain pristine.

---

## 5. Iconography Standards

1. **Vector Set**: Lucide or Heroicons outline standard.
2. **Standard Sizes**:
   - Micro action / Tag icons: `w-3.5 h-3.5`
   - Navigation / Controls: `w-4 h-4` (Desktop) or `w-5 h-5` (Mobile)
   - Section / Modal Headers: `w-5 h-5`
3. **Stroke Weight Rules**:
   - **Inactive / Default Icons**: `stroke-[1.75]` with muted color `text-neutral-500` or `text-neutral-400`.
   - **Active / Selected Icons**: `stroke-[2.5]` with high contrast `text-neutral-900`.
   - **Confirmations / Checks**: `stroke-[3]` for high-clarity checkmarks.

---

## 6. Navigation Architecture

### 6.1 Desktop Top Bar (Sticky, Translucent, Centered Dock)
```tsx
<header className="sticky top-0 z-40 bg-[#fafafa]/90 backdrop-blur-md border-b border-[#ebebeb] pt-safe">
  <div className="max-w-5xl mx-auto px-4 sm:px-6 h-12 sm:h-16 flex items-center justify-between">
    {/* Brand: Pure lowercase typography */}
    <div className="cursor-pointer select-none">
      <span className="font-semibold text-base sm:text-lg tracking-tight text-neutral-900 lowercase hover:opacity-80 transition-opacity">
        app name
      </span>
    </div>

    {/* Centered Floating Pill Navigation Dock */}
    <nav className="hidden sm:flex items-center p-1 bg-[#ebebeb]/60 rounded-full border border-[#ebebeb]">
      {navTabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs rounded-full transition-all duration-150 select-none active:scale-95 ${
              isActive
                ? 'bg-white text-neutral-900 shadow-sm font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/50 font-normal'
            }`}
          >
            <tab.icon className={`w-3.5 h-3.5 ${isActive ? 'text-neutral-900 stroke-[2.5]' : 'text-neutral-500 stroke-[1.75]'}`} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                isActive ? 'bg-neutral-200 text-neutral-900 font-bold' : 'bg-neutral-200/70 text-neutral-600 font-medium'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </nav>

    {/* Right Date / Profile Utility */}
    <div className="hidden sm:flex items-center text-xs text-neutral-500 font-mono">
      {currentDate}
    </div>
  </div>
</header>
```

### 6.2 Mobile Bottom App Bar (Native iOS App Quality)
```tsx
<nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ebebeb] px-3 py-1.5 pb-safe shadow-modal">
  <div className="grid grid-cols-3 gap-2">
    {navTabs.map((tab) => {
      const isActive = currentTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all relative active:scale-95 ${
            isActive
              ? 'text-neutral-900 font-semibold bg-neutral-100/70'
              : 'text-neutral-500 hover:text-neutral-900 font-normal'
          }`}
        >
          <div className="relative">
            <tab.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
            {tab.count !== undefined && (
              <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-neutral-900 text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-tight mt-1 transition-all ${
            isActive ? 'font-semibold text-neutral-900' : 'font-normal text-neutral-500'
          }`}>
            {tab.label}
          </span>
        </button>
      );
    })}
  </div>
</nav>
```

### 6.3 Sub-View Segmented Switcher (In-Page Toggles)
For switching between views on the same page (e.g. *Inboxes* vs *To Do*, or *Grid* vs *List*):
```tsx
<div className="flex items-center p-0.5 bg-[#ebebeb]/60 rounded-full border border-[#ebebeb] text-xs">
  <button
    onClick={() => setView('primary')}
    className={`px-3 py-1 rounded-full text-xs transition-all active:scale-95 ${
      view === 'primary'
        ? 'bg-white text-neutral-900 shadow-sm font-semibold'
        : 'text-neutral-500 hover:text-neutral-900 font-normal'
    }`}
  >
    Primary View
  </button>
  <button
    onClick={() => setView('secondary')}
    className={`px-3 py-1 rounded-full text-xs transition-all active:scale-95 ${
      view === 'secondary'
        ? 'bg-white text-neutral-900 shadow-sm font-semibold'
        : 'text-neutral-500 hover:text-neutral-900 font-normal'
    }`}
  >
    Secondary View
  </button>
</div>
```

---

## 7. Interactive Component Patterns

### 7.1 Filter Pill Trays
```tsx
<div className="flex items-center gap-1 bg-[#ebebeb]/50 p-1 rounded-full border border-[#ebebeb] overflow-x-auto no-scrollbar">
  {filterOptions.map((opt) => (
    <button
      key={opt}
      onClick={() => setFilter(opt)}
      className={`px-3 py-1 text-xs rounded-full capitalize transition-all active:scale-95 ${
        filter === opt
          ? 'bg-white text-neutral-900 shadow-sm font-semibold'
          : 'text-neutral-600 hover:text-neutral-900 font-normal'
      }`}
    >
      {opt}
    </button>
  ))}
</div>
```

### 7.2 The Standard Form Pattern (Creation & Edit Panels)
All inline creation or edit forms must follow this clean structured grid pattern:
```tsx
<form onSubmit={handleSave} className="bg-white p-5 rounded-lg border border-[#ebebeb] shadow-subtle space-y-4 animate-scaleIn">
  {/* Header */}
  <div className="text-xs font-semibold text-neutral-900">
    Create New Item
  </div>

  {/* Primary Full-Width Input */}
  <div>
    <label className="block text-xs font-medium text-neutral-700 mb-1">
      Title or Name
    </label>
    <input
      type="text"
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      placeholder="Item description..."
      autoFocus
      className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 transition-colors shadow-2xs"
    />
  </div>

  {/* Multi-Column Parameter Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1">
        Category
      </label>
      <select 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 cursor-pointer"
      >
        <option value="cat-1">Category 1</option>
        <option value="cat-2">Category 2</option>
      </select>
    </div>

    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1">
        Priority
      </label>
      <select 
        value={priority} 
        onChange={(e) => setPriority(e.target.value)}
        className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 cursor-pointer"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>

    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1">
        Target Date
      </label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full px-3 py-2 text-xs bg-[#fafafa] border border-[#ebebeb] rounded-md focus:outline-none focus:border-neutral-900 font-mono"
      />
    </div>
  </div>

  {/* Footer Action Bar with Divider */}
  <div className="flex justify-end gap-2 pt-2 border-t border-[#ebebeb]">
    <button
      type="button"
      onClick={handleCancel}
      className="px-3.5 py-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors active:scale-95"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={!title.trim()}
      className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-md transition-colors disabled:opacity-40 shadow-subtle active:scale-95"
    >
      Save Item
    </button>
  </div>
</form>
```

### 7.3 List Row Items
```tsx
<li className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#fafafa]/80 transition-colors group relative">
  {/* Left: Optional Color Accent Bar (inset, rounded) */}
  <span className="w-1 self-stretch rounded-full flex-shrink-0 my-0.5" style={{ backgroundColor: itemColor }} />

  {/* Checkbox / Toggle */}
  <button onClick={handleToggle} className="flex-shrink-0 transition-transform active:scale-95">
    {isCompleted ? (
      <CheckCircle2 className="w-4 h-4 text-neutral-900 fill-neutral-200" />
    ) : (
      <Circle className="w-4 h-4 text-neutral-300 group-hover:text-neutral-500" />
    )}
  </button>

  {/* Main Text Content */}
  <div className="min-w-0 flex-1">
    <p className={`text-xs font-medium truncate ${isCompleted ? 'line-through text-neutral-400' : 'text-neutral-900'}`}>
      {item.title}
    </p>
  </div>

  {/* Right: Badges & Quick Action Icons */}
  <div className="flex items-center gap-2 flex-shrink-0">
    {/* Colored Category Tag */}
    <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-700 bg-white border border-[#ebebeb] px-2 py-0.5 rounded shadow-2xs">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: itemColor }} />
      <span>{item.categoryName}</span>
    </span>

    {/* Secondary Action / Delete (fades in on row hover on desktop) */}
    <button 
      onClick={handleDelete}
      className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
</li>
```

### 7.4 Segmented Progress Bar (Direct Multi-Part Fraction)
For tracking fraction completion (e.g. 0/4, 2/4, 4/4):
* Display a cycleable 4-segment pill bar with hairline gaps between progress cells.
* Inverted and high-contrast on active cards.
* Clean monospace count: `<span className="text-[10px] font-mono text-neutral-500">{completedParts}/{totalParts}</span>`.

---

## 8. Micro-Interactions & CSS Animation Tokens

Ensure these core animations are present in your Tailwind config or CSS:

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fadeIn {
  animation: fadeIn 0.15s ease-out forwards;
}

.animate-scaleIn {
  animation: scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

* **Tactile Spring Feedback**: Always include `active:scale-95 transition-all duration-150` on interactive triggers.
* **Focus Ring Standard**:
  ```css
  :root {
    --ds-focus-ring: 0 0 0 2px #ffffff, 0 0 0 4px #171717;
  }
  ```

---

## 9. Strict Anti-Patterns (Forbidden Behaviors)

When applying this design system, you must strictly reject:

1. ❌ **No Textual Helper Hints**: Never write `(click to toggle)`, `(collapse)`, `(expand)`, `Press enter to save`, or subtitle descriptions under basic headers. Let the UI speak for itself.
2. ❌ **No Heavy Drop Shadows**: Never use generic Tailwind `shadow-lg` or colored glow shadows. Stick strictly to `shadow-2xs`, `shadow-subtle`, and `shadow-modal`.
3. ❌ **No Bright Saturated Backgrounds**: Never paint navigation headers or whole screen backgrounds in loud primary colors (e.g. blue or purple nav bars). Keep surfaces calm (`#fafafa` / `#ffffff`).
4. ❌ **No Inconsistent Tab/Pill Bolding**: Active navigation tabs and active filter pills must always use `font-semibold text-neutral-900 bg-white shadow-sm`. Inactive items must be `font-normal text-neutral-500`.
5. ❌ **No Border Clipping**: Never attach a colored left border to an inner element inside a rounded box with horizontal divider lines (`border-b`). Keep the 4px border on the outer container (`rounded-xl overflow-hidden`) or use inset rounded pill bars.
6. ❌ **No Redundant Repetitive Headers**: Avoid having a top title and an immediate sub-title that say the exact same thing (e.g. `Tasks` followed by `All Tasks`).

---

## 10. Agent Prompting Template

To apply this design system to any project, simply paste the following instruction into your agent prompt:

```text
Please redesign the interface according to the Minimalist Engineering Design System (DESIGN_SYSTEM.md):
- Enforce the #fafafa canvas, #ffffff card surfaces, and #ebebeb hairline borders.
- Replace all navigation with the sticky desktop pill dock and native mobile bottom app bar.
- Unify all active tabs, pills, and switches to use `font-semibold text-neutral-900 bg-white shadow-sm` with `active:scale-95 transition-all`.
- Use the standard 10-color semantic palette for categories, ensuring any 4px left border is placed on the outer container to eliminate corner clipping and divider white notches.
- Standardize all inline creation and edit forms into the clean labeled grid pattern with separated action footers.
- Strip all unnecessary instructional text, verbose empty states, and (collapse)/(expand) labels.
```
