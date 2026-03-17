import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("factory.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS layouts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    data TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '100mb' }));

  // API Routes
  app.get("/api/layouts", (req, res) => {
    try {
      const layouts = db.prepare("SELECT * FROM layouts ORDER BY updated_at DESC").all();
      res.json(layouts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch layouts" });
    }
  });

  app.get("/api/layouts/:name", (req, res) => {
    try {
      const layout = db.prepare("SELECT * FROM layouts WHERE name = ?").get(req.params.name);
      if (layout) {
        res.json(layout);
      } else {
        res.status(404).json({ error: "Layout not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch layout" });
    }
  });

  app.post("/api/layouts", (req, res) => {
    const { name, data } = req.body;
    if (!name || !data) {
      return res.status(400).json({ error: "Name and data are required" });
    }

    try {
      const id = Math.random().toString(36).substr(2, 9);
      db.prepare(`
        INSERT INTO layouts (id, name, data, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(name) DO UPDATE SET
          data = excluded.data,
          updated_at = CURRENT_TIMESTAMP
      `).run(id, name, JSON.stringify(data));
      res.json({ success: true, id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save layout" });
    }
  });

  app.delete("/api/layouts/:name", (req, res) => {
    try {
      db.prepare("DELETE FROM layouts WHERE name = ?").run(req.params.name);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete layout" });
    }
  });

  app.get("/api/settings/:key", (req, res) => {
    try {
      const setting = db.prepare("SELECT value FROM app_settings WHERE key = ?").get(req.params.key);
      res.json({ value: setting ? setting.value : null });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch setting" });
    }
  });

  app.post("/api/settings", (req, res) => {
    const { key, value } = req.body;
    try {
      db.prepare("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)").run(key, value);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
