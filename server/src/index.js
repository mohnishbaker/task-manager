require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const tasksRouter = require('./routes/tasks');

const PORT = process.env.PORT || 5050;

async function resolveMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  // Zero-setup fallback: embedded MongoDB persisted under server/.data
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const dbPath = path.join(__dirname, '..', '.data');
  require('fs').mkdirSync(dbPath, { recursive: true });
  const mongod = await MongoMemoryServer.create({
    instance: { dbPath, storageEngine: 'wiredTiger', port: 27018 },
  });
  console.log('No MONGODB_URI set - using embedded MongoDB (data in server/.data)');
  return mongod.getUri('taskmanager');
}

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/tasks', tasksRouter);

// Express 5 forwards rejected async handlers here
app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join(', ');
    return res.status(400).json({ error: message });
  }
  if (err.name === 'CastError') return res.status(400).json({ error: `Invalid ${err.path}` });
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

resolveMongoUri()
  .then((uri) => mongoose.connect(uri))
  .then(() => app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to start:', err);
    process.exit(1);
  });
