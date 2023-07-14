
const express = require('express');
const app = express();
const multer = require('multer');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'jira ticket',
    password: '1234',
    port: 5432,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.static('public'));

app.post('/api/create-ticket', upload.single('attachment'), async (req, res) => {
  try {
    const { title, description, priority } = req.body;
    const attachment = req.file ? req.file.filename : null;

    const query = 'INSERT INTO tasks (title, description, priority, attachment) VALUES ($1, $2, $3, $4)';
    const values = [title, description, priority, attachment];

    await pool.query(query, values);

    res.status(201).json({ message: 'Jira ticket created successfully' });
  } catch (error) {
    console.error('Error creating Jira ticket:', error);
    res.status(500).json({ message: 'Failed to create Jira ticket' });
  }
});

app.get('/api/get-ticket', async (req, res) => {
  try {
    const query = 'SELECT * FROM task';
    const result = await pool.query(query);

    res.status(200).json({ tickets: result.rows });
  } catch (error) {
    console.error('Error retrieving tickets:', error);
    res.status(500).json({ message: 'Failed to retrieve tickets' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
