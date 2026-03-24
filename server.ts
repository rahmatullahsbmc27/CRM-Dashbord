import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import cron from 'node-cron';
import nodemailer from 'nodemailer';

const db = new Database('agency.db');

// Extend session type
declare module 'express-session' {
  interface SessionData {
    user: { id: number; name: string; email: string; role: string };
  }
}

// Initialize Database
function initDb() {
  // 1. Users Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'client',
      reminders_enabled INTEGER DEFAULT 1,
      reminder_days INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Add columns if they don't exist (for existing databases)
  try { db.prepare("ALTER TABLE users ADD COLUMN reminders_enabled INTEGER DEFAULT 1").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE users ADD COLUMN reminder_days INTEGER DEFAULT 1").run(); } catch(e) {}

  // 2. Projects Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      service_type TEXT DEFAULT 'SEO',
      client_id INTEGER,
      status TEXT DEFAULT 'Pending',
      stage TEXT DEFAULT 'Discovery',
      probability INTEGER DEFAULT 20,
      value INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES users(id)
    )
  `).run();

  // 3. Tasks Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'To Do',
      due_date TEXT,
      assigned_to_email TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Add columns if they don't exist
  try { db.prepare("ALTER TABLE tasks ADD COLUMN due_date TEXT").run(); } catch(e) {}
  try { db.prepare("ALTER TABLE tasks ADD COLUMN assigned_to_email TEXT").run(); } catch(e) {}

  // 4. Team Members Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      avatar_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // 5. Notes Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `).run();

  // 6. Knowledge Base Table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS kb_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Seed some projects if not exists
  const projectsCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as any;
  if (projectsCount.count === 0) {
    const clients = db.prepare("SELECT id FROM users WHERE role = 'client'").all() as any[];
    if (clients.length > 0) {
      db.prepare('INSERT INTO projects (title, service_type, client_id, stage, probability, value) VALUES (?, ?, ?, ?, ?, ?)').run(
        'Meta Ads Campaign', 'Social Media', clients[0].id, 'Proposal', 60, 2500
      );
      db.prepare('INSERT INTO projects (title, service_type, client_id, stage, probability, value) VALUES (?, ?, ?, ?, ?, ?)').run(
        'SEO Optimization', 'SEO', clients[0].id, 'Discovery', 20, 1500
      );
    }
  }

  // Seed an admin if not exists
  const adminExists = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
      'Admin User',
      'admin@nexus.com',
      hashedPassword,
      'admin'
    );
    console.log('Admin user created: admin@nexus.com / admin123');
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  initDb();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use(session({
    secret: 'nexus-secret-key',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: { 
      secure: true,
      sameSite: 'none',
      httpOnly: true
    }
  }));

  // Middleware to protect routes
  const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session.user) {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Auth Routes
  app.post('/api/register', (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    try {
      db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
      res.json({ success: true, message: 'Registration successful' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Email already exists' });
    }
  });

  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
      res.json({ success: true, user: req.session.user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.get('/api/me', (req, res) => {
    if (req.session.user) {
      res.json({ success: true, user: req.session.user });
    } else {
      res.status(401).json({ success: false, error: "Unauthorized" });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // User Preferences
  app.post('/api/user/preferences', requireAuth, (req, res) => {
    const { reminders_enabled, reminder_days } = req.body;
    try {
      db.prepare('UPDATE users SET reminders_enabled = ?, reminder_days = ? WHERE id = ?')
        .run(reminders_enabled ? 1 : 0, reminder_days, req.session.user!.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  app.get('/api/user/preferences', requireAuth, (req, res) => {
    const prefs = db.prepare('SELECT reminders_enabled, reminder_days FROM users WHERE id = ?').get(req.session.user!.id) as any;
    res.json({ success: true, preferences: { 
      reminders_enabled: !!prefs.reminders_enabled, 
      reminder_days: prefs.reminder_days 
    }});
  });

  // API Routes
  app.get('/api/stats', requireAuth, (req, res) => {
    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'client'").get() as any;
    const activeDeals = db.prepare("SELECT COUNT(*) as count FROM projects WHERE stage != 'Closed Won'").get() as any;
    const totalRevenue = db.prepare("SELECT SUM(value) as sum FROM projects WHERE stage = 'Closed Won'").get() as any;
    
    res.json({
      totalCustomers: totalCustomers.count,
      activeDeals: activeDeals.count,
      totalRevenue: totalRevenue.sum || 0,
      conversionRate: 24.8
    });
  });

  app.get('/api/customers', requireAuth, (req, res) => {
    const customers = db.prepare("SELECT id, name, email, role as status, created_at as lastContact FROM users").all();
    res.json(customers);
  });

  app.get('/api/projects', requireAuth, (req, res) => {
    const projects = db.prepare(`
      SELECT p.*, u.name as clientName 
      FROM projects p 
      LEFT JOIN users u ON p.client_id = u.id
    `).all();
    res.json(projects);
  });

  app.post('/api/update_task_status', requireAuth, (req, res) => {
    const { task_id, new_status } = req.body;
    if (!task_id || !new_status) {
      return res.status(400).json({ status: "error", message: "Missing task_id or new_status" });
    }
    db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(new_status, task_id);
    res.json({ status: "success" });
  });

  app.get('/api/get_tasks', requireAuth, (req, res) => {
    const tasks = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC').all();
    res.json(tasks);
  });

  app.get('/api/get_team', requireAuth, (req, res) => {
    const team = db.prepare('SELECT * FROM team_members ORDER BY created_at DESC').all();
    res.json(team);
  });

  app.post('/api/add_team', requireAuth, (req, res) => {
    const { name, email, role } = req.body;
    
    if (!name || !email || !role) {
      return res.status(400).json({ status: "error", message: "Name, email, and role are required" });
    }
    
    const avatar_url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
    
    try {
      db.prepare(`
        INSERT INTO team_members (name, email, role, avatar_url) 
        VALUES (?, ?, ?, ?)
      `).run(name, email, role, avatar_url);
      res.json({ status: "success", message: "Team member added successfully!" });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ status: "error", message: "A team member with this email already exists" });
      } else {
        res.status(500).json({ status: "error", message: "Failed to add team member" });
      }
    }
  });

  app.post('/api/update_team_role', requireAuth, (req, res) => {
    const { id, role } = req.body;
    
    if (!id || !role) {
      return res.status(400).json({ status: "error", message: "ID and role are required" });
    }
    
    try {
      db.prepare('UPDATE team_members SET role = ? WHERE id = ?').run(role, id);
      res.json({ status: "success", message: "Team member role updated successfully!" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to update team member role" });
    }
  });

  app.post('/api/add_task', requireAuth, (req, res) => {
    const { title, description, priority, status, due_date, assigned_to_email } = req.body;
    
    if (!title) {
      return res.status(400).json({ status: "error", message: "Title is required" });
    }
    
    try {
      db.prepare(`
        INSERT INTO tasks (title, description, priority, status, due_date, assigned_to_email) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        title, 
        description || '', 
        priority || 'Medium', 
        status || 'To Do',
        due_date || null,
        assigned_to_email || req.session.user!.email
      );
      res.json({ status: "success", message: "Task added successfully!" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to add task" });
    }
  });

  app.post('/api/add_project', requireAuth, (req, res) => {
    const { title, service_type, client_id, stage, value, probability } = req.body;
    
    if (!title) {
      return res.status(400).json({ status: "error", message: "Title is required" });
    }
    
    try {
      db.prepare(`
        INSERT INTO projects (title, service_type, client_id, stage, value, probability) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        title, 
        service_type || 'SEO',
        client_id || null, 
        stage || 'Discovery', 
        value || 0, 
        probability || 20
      );
      res.json({ status: "success", message: "Project added successfully!" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to add project" });
    }
  });

  app.post('/api/add_note', requireAuth, (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ status: "error", message: "Title and content are required" });
    }
    try {
      db.prepare('INSERT INTO notes (title, content, user_id) VALUES (?, ?, ?)').run(title, content, req.session.user!.id);
      res.json({ status: "success", message: "Note saved successfully" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to save note" });
    }
  });

  app.get('/api/get_notes', requireAuth, (req, res) => {
    const notes = db.prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC').all(req.session.user!.id);
    res.json(notes);
  });

  app.post('/api/add_kb', requireAuth, (req, res) => {
    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ status: "error", message: "Title, content, and category are required" });
    }
    try {
      db.prepare('INSERT INTO kb_entries (title, content, category) VALUES (?, ?, ?)').run(title, content, category);
      res.json({ status: "success", message: "Article saved successfully" });
    } catch (error) {
      res.status(500).json({ status: "error", message: "Failed to save article" });
    }
  });

  app.get('/api/get_kb', requireAuth, (req, res) => {
    const entries = db.prepare('SELECT * FROM kb_entries ORDER BY created_at DESC').all();
    res.json(entries);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Task Reminder Scheduler
  // Runs every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running task reminder check...');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || 'mock_user',
        pass: process.env.SMTP_PASS || 'mock_pass',
      },
    });

    const users = db.prepare('SELECT id, email, reminders_enabled, reminder_days FROM users WHERE reminders_enabled = 1').all() as any[];

    for (const user of users) {
      const days = user.reminder_days || 1;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      const upcomingTasks = db.prepare(`
        SELECT * FROM tasks 
        WHERE (assigned_to_email = ? OR assigned_to_email IS NULL) 
        AND due_date = ? 
        AND status != 'Completed'
      `).all(user.email, targetDateStr) as any[];

      if (upcomingTasks.length > 0) {
        const taskList = upcomingTasks.map(t => `- ${t.title} (Due: ${t.due_date})`).join('\n');
        
        try {
          await transporter.sendMail({
            from: '"Nexus Agency CRM" <reminders@nexus.com>',
            to: user.email,
            subject: `Task Reminder: ${upcomingTasks.length} tasks due in ${days} day(s)`,
            text: `Hello,\n\nYou have the following tasks due soon:\n\n${taskList}\n\nBest regards,\nNexus Agency CRM`,
          });
          console.log(`Reminder sent to ${user.email}`);
        } catch (err) {
          console.error(`Failed to send email to ${user.email}:`, err);
        }
      }
    }
  });
}

startServer();
