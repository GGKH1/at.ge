const express = require('express');
const cors = require('cors');  // Add cors
const app = express();

// Environment variables with defaults
const NODE_ENV = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;

// Log the environment
console.log(`Server running in ${NODE_ENV} mode`);

// Middleware
app.use(cors());  // Enable CORS
app.use(express.json());
require('dotenv').config();

// Development logging
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// In-memory storage (replace with database in production)
let athletes = [];
let coaches = [];
let athleteId = 1;
let coachId = 1;

// Athletes endpoints
app.get('/api/athletes', (req, res) => {
console.log('GET /api/athletes called');
  res.json({ data: athletes });
});

app.post('/api/athletes', (req, res) => {
  const newAthlete = {
    id: athleteId++,
    ...req.body
  };
  athletes.push(newAthlete);
  console.log('Athletes after addition:', athletes);
  res.status(201).json({ data: newAthlete });
});

app.delete('/api/athletes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  athletes = athletes.filter(athlete => athlete.id !== id);
  res.json({ message: 'Athlete deleted successfully' });
});

// Coaches endpoints
app.get('/api/coaches', (req, res) => {
  res.json({ data: coaches });
});

app.post('/api/coaches', (req, res) => {
  const newCoach = {
    id: coachId++,
    ...req.body
  };
  coaches.push(newCoach);
  res.status(201).json({ data: newCoach });
});

app.delete('/api/coaches/:id', (req, res) => {
  const id = parseInt(req.params.id);
  coaches = coaches.filter(coach => coach.id !== id);
  res.json({ message: 'Coach deleted successfully' });
});

// Your existing routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello World!',
    environment: NODE_ENV
  });
});

app.get('/echo', (req, res) => {
  res.json({ 
    message: 'Echo endpoint',
    query: req.query
  });
});

app.post('/test', (req, res) => {
  res.json({ 
    message: 'Received POST request',
    body: req.body 
  });
});

app.get('/items/:id', (req, res) => {
  res.json({ 
    message: 'Item endpoint',
    id: req.params.id
  });
});

app.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

app.get('/error', (req, res) => {
  res.status(500).json({
    error: 'Test error endpoint',
    timestamp: new Date()
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port} in ${NODE_ENV} mode`);
});