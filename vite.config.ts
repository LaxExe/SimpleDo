import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(__dirname, 'data');
const dbFilePath = path.join(dataDir, 'simpledo_db.json');

function ensureDataDirectory() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadDBFromDisk() {
  ensureDataDirectory();
  if (fs.existsSync(dbFilePath)) {
    try {
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error parsing simpledo_db.json:', e);
    }
  }
  return null;
}

function saveDBToDisk(data) {
  ensureDataDirectory();
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
}

function simpleDoStoragePlugin() {
  return {
    name: 'simpledo-storage-plugin',
    configureServer(server) {
      // Endpoint 1: Get all data from disk
      server.middlewares.use('/api/data', (req, res, next) => {
        if (req.method === 'GET') {
          const db = loadDBFromDisk();
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify(db));
        }

        // Endpoint 2: Save database to disk
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              saveDBToDisk(data);
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, timestamp: new Date().toISOString() }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });

      // Endpoint 3: Storage info / status
      server.middlewares.use('/api/status', (req, res) => {
        ensureDataDirectory();
        const exists = fs.existsSync(dbFilePath);
        let stat = null;
        if (exists) {
          stat = fs.statSync(dbFilePath);
        }
        res.setHeader('Content-Type', 'application/json');
        return res.end(
          JSON.stringify({
            exists,
            path: dbFilePath,
            size: stat ? stat.size : 0,
            lastModified: stat ? stat.mtime : null,
          })
        );
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), simpleDoStoragePlugin()],
});
