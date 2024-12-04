const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');

const app = express();
const prisma = new PrismaClient();

// Middleware to parse JSON request bodies
app.use(express.json());

// CORS configuration to allow credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Use environment variable for production
  credentials: true
}));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true if using HTTPS in production
    maxAge: 24 * 60 * 60 * 1000 // Session expiry time (1 day)
  }
}));
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Server is working' });
});

// Use routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);

// Server setup
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
