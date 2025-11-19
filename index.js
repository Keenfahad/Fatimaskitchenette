/**
 * index.js - main Express server
 *
 * ENV variables (create .env):
 *  PORT=4000
 *  DATABASE_FILE=./data/app.db
 *  JAZZCASH_MERCHANT_ID=your_sandbox_mid
 *  JAZZCASH_PASSWORD=your_password
 *  JAZZCASH_INTEGRITY_SALT=your_salt
 *  TWILIO_SID=...
 *  TWILIO_TOKEN=...
 *  TWILIO_FROM=+92...
 *  SMTP_HOST=smtp.example.com
 *  SMTP_PORT=587
 *  SMTP_USER=...
 *  SMTP_PASS=...
 *
 * Start: node index.js
 */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Simple static serving for frontend build (optional)
// Put your React build into ./client/build
app.use(express.static(path.join(__dirname, 'client', 'build')));

// API routes
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);

// Fallback to frontend for SPA routing (optional)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'client', 'build', 'index.html');
  res.sendFile(indexPath, err => {
    if (err) res.status(404).send('Not found');
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
