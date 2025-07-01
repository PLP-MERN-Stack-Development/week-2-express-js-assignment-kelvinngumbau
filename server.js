// server.js - Week 2 Express REST API with logging, auth & error handling

// Load environment variables from .env file (used for the API key)
require('dotenv').config();             

// Import required modules
const express     = require('express');
const bodyParser  = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app  = express();
const PORT = process.env.PORT || 3000;

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Middleware setup

// Custom logger middleware that logs the request method, URL, and timestamp
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Authentication middleware that checks for an API key in the request headers
app.use('/api', (req, res, next) => {
  const key = req.get('x-api-key');
  if (!key || key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized – invalid or missing API key' });
  }
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('Hello World! Go to /api/products to see all products.');
});

// GET /api/products - Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', (req, res, next) => {
  const p = products.find(x => x.id === req.params.id);
  if (!p) return next({ status: 404, message: 'Product not found' });
  res.json(p);
});

// POST /api/products - Create a new product
app.post('/api/products', (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;

  // Simple validation
  if (!name || typeof price !== 'number') {
    return next({ status: 400, message: 'Name & numeric price are required' });
  }

  // Create new product and add to database
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock: !!inStock
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id - Update an existing product (full replace)
app.put('/api/products/:id', (req, res, next) => {
  const idx = products.findIndex(x => x.id === req.params.id);
  if (idx === -1) return next({ status: 404, message: 'Product not found' });

  const { name, description, price, category, inStock } = req.body;

  // Simple validation
  if (!name || typeof price !== 'number') {
    return next({ status: 400, message: 'Name & numeric price are required' });
  }

  // Replace product while keeping the same ID
  products[idx] = {
    id: products[idx].id,
    name,
    description,
    price,
    category,
    inStock: !!inStock
  };
  res.json(products[idx]);
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', (req, res, next) => {
  const idx = products.findIndex(x => x.id === req.params.id);
  if (idx === -1) return next({ status: 404, message: 'Product not found' });

  products.splice(idx, 1);
  res.sendStatus(204);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err); // Log the full error details
  res
    .status(err.status || 500)
    .json({ error: err.message || 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Export the app for testing purposes
module.exports = app;