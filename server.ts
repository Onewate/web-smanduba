import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Create placeholder images if they don't exist
const createPlaceholder = (name: string, text: string, color: string) => {
  const filePath = path.join(uploadDir, name);
  if (!fs.existsSync(filePath)) {
    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}"/>
        <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em">${text}</text>
      </svg>
    `;
    fs.writeFileSync(filePath, svg);
  }
};

createPlaceholder('placeholder-teacher.svg', 'Teacher Photo', '#2563eb'); // Blue-600
createPlaceholder('placeholder-news.svg', 'News Image', '#1d4ed8'); // Blue-700


// Database Setup
const db = new Database('school.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    position TEXT,
    photoUrl TEXT
  );
  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    imageUrl TEXT,
    date TEXT,
    author TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    value TEXT,
    icon TEXT
  );
  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, imageUrl TEXT NOT NULL, createdAt TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT DEFAULT '', fileUrl TEXT NOT NULL, createdAt TEXT NOT NULL
  );
`);

// Seed Admin if not exists
const adminCheck = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');
if (!adminCheck) {
  const initialUsername = process.env.ADMIN_USERNAME || 'admin';
  const initialPassword = process.env.ADMIN_PASSWORD || 'GantiPasswordIni123!';
  db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run(initialUsername, initialPassword);
  console.warn(`Admin awal dibuat dengan username: ${initialUsername}. Segera ubah kredensial sebelum website dipublikasikan.`);
}

// Seed Settings if not exists
const schoolNameCheck = db.prepare("SELECT * FROM settings WHERE key = 'school_name'").get();
if (!schoolNameCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('school_name', 'SMAN 2 Batang Anai');
}
const heroImageCheck = db.prepare("SELECT * FROM settings WHERE key = 'hero_image'").get();
if (!heroImageCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('hero_image', 'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80');
}
const visiCheck = db.prepare("SELECT * FROM settings WHERE key = 'visi'").get();
if (!visiCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('visi', 'Terwujudnya lulusan yang beriman dan bertakwa, berkarakter, berprestasi, berwawasan lingkungan, serta mampu bersaing di era global.');
}
const misiCheck = db.prepare("SELECT * FROM settings WHERE key = 'misi'").get();
if (!misiCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('misi', JSON.stringify([
    'Menyelenggarakan pembelajaran yang bermutu, aktif, kreatif, dan berpusat pada peserta didik.',
    'Menumbuhkan karakter, disiplin, kejujuran, dan sikap gotong royong.',
    'Mengembangkan potensi akademik dan nonakademik melalui kegiatan intrakurikuler dan ekstrakurikuler.',
    'Membangun budaya literasi, numerasi, serta pemanfaatan teknologi secara bijak.',
    'Mewujudkan lingkungan sekolah yang aman, inklusif, bersih, dan berwawasan lingkungan.'
  ]));
}
const registrationLinkCheck = db.prepare("SELECT * FROM settings WHERE key = 'registration_link'").get();
if (!registrationLinkCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('registration_link', '#');
}
const contactAddressCheck = db.prepare("SELECT * FROM settings WHERE key = 'contact_address'").get();
if (!contactAddressCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('contact_address', 'Batang Anai, Kabupaten Padang Pariaman, Sumatera Barat (lengkapi alamat resmi sekolah)');
}
const contactPhoneCheck = db.prepare("SELECT * FROM settings WHERE key = 'contact_phone'").get();
if (!contactPhoneCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('contact_phone', 'Nomor telepon sekolah belum diisi');
}
const contactEmailCheck = db.prepare("SELECT * FROM settings WHERE key = 'contact_email'").get();
if (!contactEmailCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('contact_email', 'Email resmi sekolah belum diisi');
}
const socialFacebookCheck = db.prepare("SELECT * FROM settings WHERE key = 'social_facebook'").get();
if (!socialFacebookCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('social_facebook', '#');
}
const socialInstagramCheck = db.prepare("SELECT * FROM settings WHERE key = 'social_instagram'").get();
if (!socialInstagramCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('social_instagram', '#');
}
const socialTwitterCheck = db.prepare("SELECT * FROM settings WHERE key = 'social_twitter'").get();
if (!socialTwitterCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('social_twitter', '#');
}
const socialLinkedinCheck = db.prepare("SELECT * FROM settings WHERE key = 'social_linkedin'").get();
if (!socialLinkedinCheck) {
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run('social_linkedin', '#');
}

// Seed Initial Data if empty
const statsCheck = db.prepare('SELECT count(*) as count FROM stats').get() as { count: number };
if (statsCheck.count === 0) {
  const insertStat = db.prepare('INSERT INTO stats (label, value, icon) VALUES (?, ?, ?)');
  insertStat.run('Peserta Didik', '—', '🎓');
  insertStat.run('Guru & Tendik', '—', '👩‍🏫');
  insertStat.run('Rombongan Belajar', '—', '🏫');
  insertStat.run('Prestasi', '—', '🏆');
}

const teacherCheck = db.prepare('SELECT count(*) as count FROM teachers').get() as { count: number };
if (teacherCheck.count === 0) {
  const insertTeacher = db.prepare('INSERT INTO teachers (name, position, photoUrl) VALUES (?, ?, ?)');
  // Data guru sengaja tidak diisi dengan nama contoh. Tambahkan data resmi melalui dashboard admin.
}

const articleCheck = db.prepare('SELECT count(*) as count FROM articles').get() as { count: number };
if (articleCheck.count === 0) {
  const insertArticle = db.prepare('INSERT INTO articles (title, content, imageUrl, date, author) VALUES (?, ?, ?, ?, ?)');
  insertArticle.run(
    'Informasi Penerimaan Murid Baru',
    'Informasi jadwal, persyaratan, dan alur Penerimaan Murid Baru akan diumumkan melalui kanal resmi sekolah. Silakan perbarui berita ini dengan informasi yang telah diverifikasi.',
    '/uploads/placeholder-news.svg',
    new Date().toISOString().split('T')[0],
    'Admin'
  );
  insertArticle.run(
    'Publikasi Prestasi Sekolah',
    'Gunakan bagian berita ini untuk mempublikasikan prestasi akademik dan nonakademik peserta didik setelah data prestasi terverifikasi.',
    '/uploads/placeholder-news.svg',
    new Date().toISOString().split('T')[0],
    'Admin'
  );
}

// Fix placeholder extensions if they are wrong (Migration)
db.prepare("UPDATE teachers SET photoUrl = REPLACE(photoUrl, '.jpg', '.svg') WHERE photoUrl LIKE '%placeholder-teacher.jpg'").run();
db.prepare("UPDATE articles SET imageUrl = REPLACE(imageUrl, '.jpg', '.svg') WHERE imageUrl LIKE '%placeholder-news.jpg'").run();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // API Routes
  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM admins WHERE username = ? AND password = ?').get(username, password);
    if (user) {
      res.json({ success: true, token: 'dummy-token' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.get('/api/gallery', (_req, res) => { res.json(db.prepare('SELECT * FROM gallery ORDER BY id DESC').all()); });
  app.post('/api/gallery', upload.single('image'), (req, res) => {
    const title = String(req.body.title || '').trim();
    if (!title || !req.file) return res.status(400).json({ message: 'Judul dan foto wajib diisi.' });
    const imageUrl = `/uploads/${req.file.filename}`;
    const result = db.prepare('INSERT INTO gallery (title, imageUrl, createdAt) VALUES (?, ?, ?)').run(title, imageUrl, new Date().toISOString().slice(0,10));
    res.status(201).json({ id: result.lastInsertRowid, title, imageUrl, createdAt: new Date().toISOString().slice(0,10) });
  });
  app.delete('/api/gallery/:id', (req, res) => { db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id); res.json({ success: true }); });
  app.get('/api/documents', (_req, res) => { res.json(db.prepare('SELECT * FROM documents ORDER BY id DESC').all()); });
  app.post('/api/documents', upload.single('file'), (req, res) => {
    const title = String(req.body.title || '').trim(); const description = String(req.body.description || '').trim();
    if (!title || !req.file) return res.status(400).json({ message: 'Judul dan file wajib diisi.' });
    const fileUrl = `/uploads/${req.file.filename}`; const createdAt = new Date().toISOString().slice(0,10);
    const result = db.prepare('INSERT INTO documents (title, description, fileUrl, createdAt) VALUES (?, ?, ?, ?)').run(title, description, fileUrl, createdAt);
    res.status(201).json({ id: result.lastInsertRowid, title, description, fileUrl, createdAt });
  });
  app.delete('/api/documents/:id', (req, res) => { db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id); res.json({ success: true }); });

  app.get('/api/teachers', (req, res) => {
    const teachers = db.prepare('SELECT * FROM teachers').all();
    res.json(teachers);
  });

  app.post('/api/teachers', upload.single('photo'), (req, res) => {
    const { name, position } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/placeholder-teacher.svg';
    const result = db.prepare('INSERT INTO teachers (name, position, photoUrl) VALUES (?, ?, ?)').run(name, position, photoUrl);
    res.json({ id: result.lastInsertRowid, name, position, photoUrl });
  });

  app.put('/api/teachers/:id', upload.single('photo'), (req, res) => {
    const { id } = req.params;
    const { name, position } = req.body;
    
    let query = 'UPDATE teachers SET name = ?, position = ?';
    let params = [name, position];

    if (req.file) {
        query += ', photoUrl = ?';
        params.push(`/uploads/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(id);

    db.prepare(query).run(...params);
    res.json({ success: true });
  });

  app.delete('/api/teachers/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM teachers WHERE id = ?').run(id);
    res.json({ success: true });
  });

  app.get('/api/articles', (req, res) => {
    const articles = db.prepare('SELECT * FROM articles ORDER BY id DESC').all();
    res.json(articles);
  });

  app.post('/api/articles', upload.single('image'), (req, res) => {
    const { title, content, author } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/placeholder-news.svg';
    const date = new Date().toISOString().split('T')[0];
    const result = db.prepare('INSERT INTO articles (title, content, imageUrl, date, author) VALUES (?, ?, ?, ?, ?)').run(title, content, imageUrl, date, author);
    res.json({ id: result.lastInsertRowid, title, content, imageUrl, date, author });
  });

   app.delete('/api/articles/:id', (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM articles WHERE id = ?').run(id);
    res.json({ success: true });
  });

  app.get('/api/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj: any = {};
    settings.forEach((s: any) => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  });

  app.put('/api/settings', (req, res) => {
    const { key, value } = req.body;
    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
    res.json({ success: true });
  });

  app.get('/api/stats', (req, res) => {
    const stats = db.prepare('SELECT * FROM stats').all();
    res.json(stats);
  });

  app.put('/api/stats/:id', (req, res) => {
    const { id } = req.params;
    const { label, value, icon } = req.body;
    db.prepare('UPDATE stats SET label = ?, value = ?, icon = ? WHERE id = ?').run(label, value, icon, id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve built assets (if we were building)
    // For this environment, we mostly rely on dev mode or static serving
    app.use(express.static('dist'));
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
