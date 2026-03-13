import 'dotenv/config';
import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// MySQL connection
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

// Create quiz_results table if it doesn't exist
await db.execute(`
  CREATE TABLE IF NOT EXISTS quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    chapter_id INT NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    answers JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);


// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Όλα τα πεδία είναι υποχρεωτικά.' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );
    res.json({ message: 'Εγγραφή επιτυχής!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Το όνομα χρήστη υπάρχει ήδη.' });
    }
    res.status(500).json({ error: 'Σφάλμα κατά την εγγραφή.' });
  }
});


// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Όλα τα πεδία είναι υποχρεωτικά.' });

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Λάθος όνομα χρήστη ή κωδικός.' });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Λάθος όνομα χρήστη ή κωδικός.' });

    res.json({
      message: 'Επιτυχής είσοδος',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Σφάλμα διακομιστή.' });
  }
});


// Save quiz result endpoint
app.post('/save-quiz-result', async (req, res) => {
  const { userId, chapterId, score, totalQuestions, answers } = req.body;

  if (userId == null || chapterId == null || score == null || totalQuestions == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO quiz_results (user_id, chapter_id, score, total_questions, answers) VALUES (?, ?, ?, ?, ?)',
      [userId, chapterId, score, totalQuestions, JSON.stringify(answers || {})]
    );
    res.json({ success: true, resultId: result.insertId });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database operation failed', details: err.message });
  }
});


// Save challenge result endpoint
app.post('/save-challenge-result', async (req, res) => {
  const { userId, score, totalQuestions, answers } = req.body;

  if (userId == null || score == null || totalQuestions == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [result] = await db.execute(
      'INSERT INTO quiz_results (user_id, chapter_id, score, total_questions, answers) VALUES (?, 5, ?, ?, ?)',
      [userId, score, totalQuestions, JSON.stringify(answers || {})]
    );
    res.json({ success: true, resultId: result.insertId });
  } catch (err) {
    console.error('Challenge save error:', err);
    res.status(500).json({ error: 'Σφάλμα αποθήκευσης.' });
  }
});


// Get user progress endpoint
app.get('/api/progress/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!userId) return res.status(400).json({ error: 'Invalid user ID' });

  try {
    const [rows] = await db.execute(
      'SELECT chapter_id, score, total_questions FROM quiz_results WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );

    const chapterMap = { 1: 'chapter1', 2: 'chapter2', 3: 'chapter3', 4: 'final', 5: 'challenge' };
    const result = {};

    for (const [chapterId, key] of Object.entries(chapterMap)) {
      const entries = rows.filter(r => r.chapter_id === parseInt(chapterId));
      if (entries.length === 0) continue;

      const percentages = entries.map(e => Math.round((e.score / e.total_questions) * 100));
      result[key] = {
        percentage: percentages[percentages.length - 1],
        average: Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length),
        highest: Math.max(...percentages),
        attempts: entries.length
      };
    }

    res.json(result);
  } catch (err) {
    console.error('Progress error:', err);
    res.status(500).json({ error: 'Σφάλμα φόρτωσης προόδου.' });
  }
});


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


// RUN "node user.js" in terminal
