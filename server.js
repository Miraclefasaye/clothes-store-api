const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();

// Middleware to parse JSON request bodies
app.use(express.json());

// POST route for user login
app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is blank
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Check if the user with the provided email exists in the database
    const user = await prisma.customer.findUnique({
      where: { email },
    });

    // If the user does not exist, return 404 (Not Found)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(password, user.password);

    // If the passwords don't match, return 401 (Unauthorized)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // If login is successful, return the user's email
    return res.status(200).json({ message: 'Login successful', email: user.email });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error during login', error });
  }
});

// Server setup
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
