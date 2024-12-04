const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const PasswordValidator = require('password-validator');

const prisma = new PrismaClient();
const router = express.Router();

// Password validation schema
const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(8)
  .is().max(20)
  .has().uppercase()
  .has().lowercase()
  .has().digits()
  .has().not().spaces();

// POST route for user signup
router.post('/signup', async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate password
  if (!passwordSchema.validate(password)) {
    return res.status(400).json({ message: 'Password does not meet the required policy' });
  }

  try {
    const existingUser = await prisma.customer.findUnique({ where: { email } });

    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.customer.create({
      data: {
        email,
        password: hashedPassword,
        first_name,
        last_name,
      },
    });

    const { password: _, ...userData } = user;
    res.status(201).json({ message: 'User created successfully', user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// POST route for user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await prisma.customer.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.customer_id = user.customer_id;
    req.session.email = user.email;
    req.session.first_name = user.first_name;
    req.session.last_name = user.last_name;

    const { password: _, ...userData } = user;
    res.status(200).json({ message: 'Login successful', user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error during login', error });
  }
});

// POST route for completing a purchase
router.post('/purchase', async (req, res) => {
  const { street, city, province, country, postal_code, credit_card, credit_expire, credit_cvv, cart, invoice_amt, invoice_tax, invoice_total } = req.body;

  // Ensure all required fields are provided
  if (!street || !city || !province || !country || !postal_code || !credit_card || !credit_expire || !credit_cvv || !cart || !invoice_amt || !invoice_tax || !invoice_total) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Your purchase logic here...
});

// POST route to log out (clear session)
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error during logout', error: err });
    }
    res.status(200).json({ message: 'Logout successful' });
  });
});

// GET route to check if the user is logged in
router.get('/getSession', (req, res) => {
  if (req.session.customer_id) {
    res.status(200).json({
      customer_id: req.session.customer_id,
      email: req.session.email,
      first_name: req.session.first_name,
      last_name: req.session.last_name,
    });
  } else {
    res.status(401).json({ message: 'No active session' });
  }
});

module.exports = router;
