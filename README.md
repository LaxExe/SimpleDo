# SimpleDo 🎯

A minimalist, high-contrast daily goal tracker, habit streak builder, and aspect inbox hub. Built with a zero-auth, zero-SQL persistent on-disk data architecture following the minimalist monochrome design system of [UWExplorer](https://github.com/LaxExe/UWExplorer).

---

## 🌟 Features

- **Daily Goal Tracker & Check-Off**:
  - Write down today's primary goals and targets with priority tags (`low`, `medium`, `high`) and notes.
  - Interactive checkboxes with strikethrough feedback and instant progress metrics.
  - Remove individual goals as you meet them or archive them at the end of the day.

- **Daily Habit Streak Engine**:
  - Build long-term consistency with daily habits (water, deep work, reading, workouts).
  - 1-click check off for today's habits with streak counters and fire badges.
  - 30-day visual adherence timeline and best streak tracking.

- **Aspect Inboxes**:
  - Segment your life into distinct focus inboxes (`Work & Projects`, `Personal & Life`, `Fitness & Health`, `Learning & Study`, `Quick Capture`).
  - Create custom aspect inboxes with custom accent indicators.
  - Inline quick-capture inputs directly within each aspect card.

- **End-of-Day Ritual & Daily Sweep**:
  - Dedicated evening review workflow to assess today's accomplishments.
  - **"Sweep & Clear Completed Goals"**: Archives today's completed goals to persistent daily history and resets the active board for a fresh start tomorrow.
  - Optional evening reflection and journal notes saved to your archive.

- **Zero-Database Persistent Storage**:
  - Zero external databases (no PostgreSQL, MySQL, or MongoDB setup needed).
  - Zero authentication or passwords required.
  - All data is persisted directly to your local filesystem in `data/simpledo_db.json`.
  - Automatic dual synchronization with browser storage for instant load times and offline resilience.

- **Monochrome Design System (UWExplorer Style Guide)**:
  - Custom typography pairing: **Sora** for headings/body and **DM Mono** for metadata, badges, and controls.
  - High-contrast monochromatic color palette with custom CSS tokens (`--bg`, `--c1` through `--c5`, `--border`).
  - Dark mode and light mode switching (`data-theme="dark"`).
  - Reorderable sidebar navigation with directional controls.

---

## ⚙️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons |
| **Build & Dev Tooling** | Vite 6 |
| **Persistence** | File-backed JSON storage (`data/simpledo_db.json`) |
| **API Server** | Express.js / Vite storage middleware |
| **Style Tokens** | UWExplorer Minimalist Design Spec |

---

## 🚀 Quick Start Guide

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/LaxExe/SimpleDo.git
cd SimpleDo
npm install
```

### 2. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build & Server

To run the production Express server:

```bash
npm start
```

Runs on [http://localhost:3000](http://localhost:3000).

---

## 🗄️ On-Disk File Storage Schema (`data/simpledo_db.json`)

All application state is saved locally on disk:

```json
{
  "inboxes": [
    {
      "id": "work",
      "name": "Work & Projects",
      "description": "Career and development objectives",
      "color": "#3b82f6"
    }
  ],
  "habits": [
    {
      "id": "habit-1",
      "title": "Drink 2.5L of water",
      "streak": 5,
      "bestStreak": 14,
      "history": {
        "2026-11-02": true
      },
      "inboxId": "fitness"
    }
  ],
  "goals": [
    {
      "id": "goal-1",
      "title": "Finish SimpleDo setup",
      "completed": true,
      "priority": "high",
      "inboxId": "work"
    }
  ],
  "dailyLogs": [],
  "settings": {
    "theme": "light",
    "sidebarOrder": ["dashboard", "goals", "habits", "inboxes", "review", "settings"]
  }
}
```

---

## 📄 License

MIT License © 2026 LaxExe
