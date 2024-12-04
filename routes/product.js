const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// POST route for adding a product
router.post('/', async (req, res) => {
  const { name, description, cost, image_filename } = req.body;

  if (!name || !description || !cost || !image_filename) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (isNaN(cost) || cost <= 0) {
    return res.status(400).json({ message: 'Cost must be a positive number' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        cost,
        image_filename,
      },
    });
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding product', error });
  }
});

// GET route for fetching all products
router.get('/all', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products', error });
  }
});

// GET route to fetch a product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const productId = Number(id);

  if (isNaN(productId)) {
    return res.status(400).json({ message: 'Invalid product ID, must be an integer' });
  }

  try {
    const product = await prisma.product.findUnique({ where: { product_id: productId } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching product', error });
  }
});

module.exports = router;
