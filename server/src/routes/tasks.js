const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');

const router = express.Router();

// Only these fields can be written by clients (blocks mass-assignment of _id, timestamps, etc.)
const pick = (body) => {
  const out = {};
  for (const k of ['title', 'description', 'status', 'priority', 'dueDate']) {
    if (body[k] !== undefined) out[k] = body[k];
  }
  return out;
};

router.param('id', (req, res, next, id) => {
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: 'Invalid task id' });
  next();
});

router.get('/', async (req, res) => {
  const { status, priority, q } = req.query;
  const filter = {};
  if (typeof status === 'string' && status) filter.status = status;
  if (typeof priority === 'string' && priority) filter.priority = priority;
  if (typeof q === 'string' && q.trim()) {
    const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.title = { $regex: escaped, $options: 'i' };
  }
  res.json(await Task.find(filter).sort({ createdAt: -1 }));
});

router.post('/', async (req, res) => {
  const task = await Task.create(pick(req.body));
  res.status(201).json(task);
});

router.patch('/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, pick(req.body), {
    new: true,
    runValidators: true,
  });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.status(204).end();
});

module.exports = router;
