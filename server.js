const express = require('express');
const cors = require('cors');
const path = require('path'); // ✅ YOU FORGOT THIS LINE
require('dotenv').config();

const connectDB = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static files (your HTML, CSS, JS) from NestHaul root directory
app.use(express.static(path.join(__dirname, '..')));

// Debug log incoming requests
app.use((req, res, next) => {
  console.log('→', req.method, req.url);
  next();
});

// Connect to database
connectDB();

// API Routes
app.use('/api', authRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('NestHaul backend is running 🚀');
});

// Catch-all route to handle unknown paths (optional)
app.use((req, res) => {
  res.status(404).send('404 - Not Found');
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
