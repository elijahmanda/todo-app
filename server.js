const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let todos = [];
let nextId = 1;

// GET /api/todos - Retrieve all tasks
app.get('/api/todos', (req, res) => {
  res.json(todos);
});

// POST /api/todos - Create a new task
app.post('/api/todos', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Task content cannot be empty.' });
  }

  const todo = {
    id: String(nextId++),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(todo);
  res.status(201).json(todo);
});

// PATCH /api/todos/:id - Update status or text content
app.patch('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const { completed, text } = req.body;

  const todo = todos.find(item => item.id === id);
  if (!todo) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  if (typeof completed === 'boolean') {
    todo.completed = completed;
  }

  if (typeof text === 'string') {
    if (!text.trim()) {
      return res.status(400).json({ error: 'Task text cannot be empty.' });
    }
    todo.text = text.trim();
  }

  res.json(todo);
});

// DELETE /api/todos/:id - Delete a specific task
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(item => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  todos.splice(index, 1);
  res.status(204).send();
});

// DELETE /api/todos - Clear completed tasks
app.delete('/api/todos', (req, res) => {
  const { scope } = req.query;

  if (scope === 'completed') {
    todos = todos.filter(item => !item.completed);
    return res.status(200).json({ message: 'Completed tasks removed.' });
  }

  res.status(400).json({ error: 'Invalid query parameter.' });
});

app.listen(PORT, () => {
  console.log(`Server executing on http://localhost:${PORT}`);
});