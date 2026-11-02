import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.resolve(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'simpledo_db.json');

function ensureDataDirectory() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

app.use(express.json({ limit: '10mb' }));

// API: Get data from disk
app.get('/api/data', (req, res) => {
  ensureDataDirectory();
  if (fs.existsSync(dbFilePath)) {
    try {
      const content = fs.readFileSync(dbFilePath, 'utf8');
      return res.json(JSON.parse(content));
    } catch (e) {
      return res.status(500).json({ error: 'Failed to read database file' });
    }
  }
  return res.json(null);
});

// API: Save data to disk
app.post('/api/data', (req, res) => {
  try {
    ensureDataDirectory();
    fs.writeFileSync(dbFilePath, JSON.stringify(req.body, null, 2), 'utf8');
    return res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// API: Disk storage status
app.get('/api/status', (req, res) => {
  ensureDataDirectory();
  const exists = fs.existsSync(dbFilePath);
  let stat = null;
  if (exists) {
    stat = fs.statSync(dbFilePath);
  }
  return res.json({
    exists,
    path: dbFilePath,
    size: stat ? stat.size : 0,
    lastModified: stat ? stat.mtime : null,
  });
});

// Serve frontend build in production
const distDir = path.resolve(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[SimpleDo] Server running on http://localhost:${PORT}`);
  console.log(`[SimpleDo] Persistent disk storage: ${dbFilePath}`);
});
