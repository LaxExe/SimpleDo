# SimpleDo Agent Protocol & API Reference (AGENTS.md)

This document provides complete instructions for autonomous AI agents (Claude, Gemini, ChatGPT, LangChain, AutoGPT, custom Python scripts, or cron workers) to inspect, automate, and manipulate **SimpleDo**.

---

## ⚡ Method 1 (Recommended): Direct Firebase REST API

SimpleDo uses Firebase Realtime Database for instant synchronization across all user devices (phone, laptop, tablet). 

**Any agent can read or write to SimpleDo directly via HTTP with ZERO dependencies or browser automation.**

When you write to this endpoint, the user's phone and laptop screens will update **live in under 50ms**.

### Endpoint Details
* **Database URL**: `https://simple-do-c5438-default-rtdb.firebaseio.com`
* **Data Path**: `/simpledo_data.json`

---

### Agent Operations

#### 1. Read All Current Data (Tasks, Events, Inboxes, Habits, Day Plans)
```bash
curl -s "https://simple-do-c5438-default-rtdb.firebaseio.com/simpledo_data.json"
```

#### 2. Write / Replace Entire Database
```bash
curl -X PUT "https://simple-do-c5438-default-rtdb.firebaseio.com/simpledo_data.json" \
  -H "Content-Type: application/json" \
  -d @updated_database.json
```

#### 3. Quick Python Helper for Agents
```python
import requests
import json
from datetime import date

FIREBASE_URL = "https://simple-do-c5438-default-rtdb.firebaseio.com/simpledo_data.json"

def get_simpledo_data():
    """Fetch current SimpleDo state"""
    res = requests.get(FIREBASE_URL)
    res.raise_for_status()
    return res.json() or {"tasks": [], "inboxes": [], "events": [], "habits": [], "dayPlans": {}}

def add_task(title, priority="medium", due_date=None, scheduled_today=True, inbox_id="inbox-general"):
    """Create a new task and sync to user's phone immediately"""
    today_str = date.today().isoformat()
    data = get_simpledo_data()
    
    new_task = {
        "id": f"task-{int(requests.utils.time.time()*1000)}",
        "title": title,
        "completed": False,
        "priority": priority,
        "inboxId": inbox_id,
        "scheduledDate": today_str if scheduled_today else None,
        "dueDate": due_date,
        "hasProgress": False,
        "totalParts": 4,
        "completedParts": 0,
        "createdAt": requests.utils.time.strftime('%Y-%m-%dT%H:%M:%SZ')
    }
    
    if "tasks" not in data or not isinstance(data["tasks"], list):
        data["tasks"] = []
    data["tasks"].insert(0, new_task)
    
    if scheduled_today:
        if "dayPlans" not in data or not isinstance(data["dayPlans"], dict):
            data["dayPlans"] = {}
        if today_str not in data["dayPlans"]:
            data["dayPlans"][today_str] = {"date": today_str, "plannedTaskIds": [], "plannedHabitIds": []}
        data["dayPlans"][today_str]["plannedTaskIds"].append(new_task["id"])
        
    requests.put(FIREBASE_URL, json=data).raise_for_status()
    print(f"Task '{title}' added and synced!")

def complete_task(task_id):
    """Mark a task complete"""
    data = get_simpledo_data()
    for task in data.get("tasks", []):
        if task.get("id") == task_id:
            task["completed"] = True
            task["completedParts"] = task.get("totalParts", 4)
            break
    requests.put(FIREBASE_URL, json=data).raise_for_status()
```

---

## 📦 Data Schema Specification

### 1. Root Object (`SimpleDoData`)
```json
{
  "tasks": [Task],
  "inboxes": [InboxGroup],
  "events": [InboxEvent],
  "habits": [Habit],
  "dayPlans": {
    "YYYY-MM-DD": DayPlan
  }
}
```

### 2. Task Model (`Task`)
* `id` (`string`, required): Unique ID (e.g. `task-1730600000000`).
* `title` (`string`, required): Task description.
* `completed` (`boolean`, required): `true` if completed, `false` otherwise.
* `priority` (`"high" | "medium" | "low"`, required): Priority weighting.
* `inboxId` (`string`, optional): Target inbox ID (default `"inbox-general"`).
* `scheduledDate` (`string` `"YYYY-MM-DD"`, optional): Day scheduled into Plan Mode.
* `dueDate` (`string` `"YYYY-MM-DD"`, optional): Hard calendar deadline date.
* `hasProgress` (`boolean`, optional): `true` if 4-stage fraction progress is enabled.
* `totalParts` (`number`, optional): Always `4`.
* `completedParts` (`number`, optional): `0`, `1`, `2`, `3`, or `4`.
* `createdAt` (`string` ISO timestamp).

### 3. Inbox Group Model (`InboxGroup`)
* `id` (`string`): Unique ID (`inbox-general`, `inbox-work`, etc.).
* `name` (`string`): Display name.
* `description` (`string`, optional): Subtitle.
* `color` (`string`, hex color code e.g. `#0068d6`, `#171717`, `#10b981`).
* `createdAt` (`string` ISO timestamp).

### 4. Event Model (`InboxEvent`)
Events sit inside an inbox and on the Calendar view, but cannot be assigned to Plan Mode.
* `id` (`string`): Unique ID.
* `title` (`string`): Event name.
* `date` (`string` `"YYYY-MM-DD"`): Calendar date.
* `time` (`string`, optional): e.g. `"14:30"` or `"2:30 PM"`.
* `location` (`string`, optional): Physical location or virtual link.
* `inboxId` (`string`): Matching inbox ID.
* `createdAt` (`string` ISO timestamp).

### 5. Habit Model (`Habit`)
* `id` (`string`): Unique ID.
* `name` (`string`): Habit name.
* `frequency` (`"daily" | "weekly"`).
* `streak` (`number`): Consecutive scheduled days completed.
* `bestStreak` (`number`): All-time high streak.
* `completedDates` (`string[]`): Array of `"YYYY-MM-DD"` dates on which habit was completed.
* `createdAt` (`string` ISO timestamp).

### 6. Day Plan Model (`DayPlan`)
Maps `"YYYY-MM-DD"` to planned tasks & habits for that specific day:
```json
{
  "date": "2026-11-02",
  "plannedTaskIds": ["task-123", "task-456"],
  "plannedHabitIds": ["habit-abc"]
}
```

---

## 🌐 Method 2: Browser Manipulation & In-App `.Agents` Console

If your agent interacts via a web browser (Puppeteer, Playwright, Chrome DevTools, Browserbase):
* **Live App URL**: `https://laxexe.github.io/SimpleDo/`
* **Agent Dashboard**: Navigate to `https://laxexe.github.io/SimpleDo/#agents`
* **Global Console API**:
  The app exposes `window.storage` with synchronous functions:
  ```javascript
  // Read
  window.storage.load();

  // Add Task
  window.storage.addTask({ title: "Automated task", completed: false, priority: "high" });

  // Add Event
  window.storage.addEvent({ title: "Sync Meeting", date: "2026-11-03", time: "10:00 AM", inboxId: "inbox-general" });

  // Toggle Task
  window.storage.toggleTask("task-id");

  // Save full state (triggers instant Firebase upload to phone automatically)
  window.storage.save(updatedData);
  ```

---

## 🎨 Method 3: General UI & Frontend Design Standard

For agents tasked with redesigning, expanding, or implementing frontend components, see **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)**.

`DESIGN_SYSTEM.md` contains the portable, application-agnostic Minimalist Engineering Design System (Geist typography, `#fafafa` canvas, `#ffffff` cards, `#ebebeb` borders, 10-color semantic scale, zero-clipping border architectures, and mobile/desktop navigation docks) ready to be dropped into any repo or agent instruction set.

