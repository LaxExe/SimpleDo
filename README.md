# SimpleDo — Minimalist Task, Habit & Calendar Manager

SimpleDo is a clean, local-first productivity app that combines tasks, inboxes, events, and habit tracking in one fast interface. It syncs live across your devices through Firebase and installs as a PWA. It also exposes an agent-friendly REST interface, so AI agents can read and write your to-dos directly.

🌐 **Live app:** [laxexe.github.io/SimpleDo](https://laxexe.github.io/SimpleDo/)

---

## Key Features

- ✅ **Today View**: A focused daily plan with your scheduled tasks, events, and habits.
- 📥 **Inboxes**: Group tasks and events into custom inboxes (like School, Work, or General).
- 📅 **Calendar & Events**: Month calendar view with event times, locations, and descriptions.
- 🔁 **Habit Tracker**: Daily check-ins with current and best streak counts.
- 📊 **Task Progress Bars**: See at a glance how far along each inbox or day is.
- ⚡ **Realtime Sync**: Firebase Realtime Database pushes changes to your phone, laptop, and tablet in well under a second.
- 💾 **Local-First**: Data is saved locally first, so the app stays fast and works offline.
- 📲 **Installable PWA**: Add it to your home screen with standalone display and a manifest.
- 🔗 **QR / Link Sync**: Move data between devices with a `#sync=` payload link.
- 🤖 **Agent API**: A dedicated Agents page and [`AGENTS.md`](AGENTS.md) document how Claude, Gemini, ChatGPT, or any script can automate SimpleDo over plain HTTP.
- 🎨 **Design System**: Documented tokens and principles in [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) and [`SIMPLE_DO_DESIGN_GUIDE.md`](SIMPLE_DO_DESIGN_GUIDE.md).

---

## 🤖 Agent Access

Every part of your data lives at one Firebase Realtime Database path, so agents need no SDK and no browser automation:

```bash
# Read tasks, events, inboxes, habits and day plans
curl -s "https://<your-project>-default-rtdb.firebaseio.com/simpledo_data.json"
```

Writes show up live on every open device. Full operations, a Python helper, and the data schema are in [`AGENTS.md`](AGENTS.md).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18, TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 3, `clsx`, `tailwind-merge`, Lucide icons |
| Sync | Firebase Realtime Database |
| Hosting | GitHub Pages (via GitHub Actions) |

---

## 🚀 How to Build & Run

### Prerequisites
- **Node.js** 20+

### 1. Install dependencies
```bash
npm install
```

### 2. Run the dev server
```bash
npm run dev
```

### 3. Production build
```bash
npm run build
npm run preview
```
The build runs `tsc` first, then `vite build`, and outputs to `dist/`.

### 4. Use your own Firebase backend (optional)
Replace the config in [`src/services/firebase.ts`](src/services/firebase.ts) with your own Firebase project and enable the Realtime Database.

### Deployment
Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the app and publishes it to GitHub Pages.

---

## 🏗️ Architecture

```
SimpleDo/
├── .github/workflows/
│   └── deploy.yml            # Build & deploy to GitHub Pages
├── public/
│   ├── manifest.json         # PWA manifest
│   └── database.json         # Seed / site database
├── AGENTS.md                 # Agent protocol & REST API reference
├── DESIGN_SYSTEM.md          # Design tokens & guidelines
└── src/
    ├── App.tsx               # Shell, hash routing, sync status banner
    ├── pages/
    │   ├── TodayPage.tsx     # Daily plan
    │   ├── InboxPage.tsx     # Inboxes, tasks & events
    │   ├── TasksPage.tsx     # All tasks
    │   ├── TrackerPage.tsx   # Habit tracker
    │   └── AgentsPage.tsx    # Agent API & database tools
    ├── components/           # CalendarView, TaskEditModal, EventEditModal, TaskProgressBar, Navigation
    ├── hooks/
    │   └── useSimpleDoData.ts  # Central data hook
    ├── services/
    │   ├── storage.ts        # Local-first persistence & sync strings
    │   └── firebase.ts       # Realtime Database sync & status
    └── types/index.ts        # Task, Habit, InboxEvent, DayPlan, SimpleDoData
```
