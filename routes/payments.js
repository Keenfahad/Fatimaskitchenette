/**
 * routes/payments.js
 *
 * Payment endpoints & callbacks (example for JazzCash sandbox).
 *
 * ENV:
 *  JAZZCASH_MERCHANT_ID
 *  JAZZCASH_PASSWORD
 *  JAZZCASH_INTEGRITY_SALT
 *
 * Important:
 * - This file contains example signature/flow. Confirm exact param names with JazzCash docs.
 * - Do not put secrets in frontend. Keep integrity salt & keys here.
 *
 * Flow (example):
 *  POST /api/payments/jazzcash/create    -> create payment (server builds signed request or calls provider)
 *  POST /api/payments/jazzcash/callback  -> remote provider calls to notify payment result (webhook)
 *
 * In production: validate signatures, verify amounts, update DB (orders table).
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fetch = require('node-fetch'); // optional if calling provider APIs
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { sendSmsAndEmailOnSuccess } = require('../utils/notify');

const DB_FILE = process.env.DATABASE_FILE || path.join(__dirname, '..', 'data', 'app.db');
const db = new Database(DB_FILE);

// Utility: compute signature/hmac depending on gateway spec
function computeJazzCashHash(paramsString, integritySalt) {
  // Example: JazzCash uses HMAC or MD5+salt depending on integration; check docs.
  // This implementation is placeholder: HMAC-SHA256 over payload string.
  return crypto.createHmac('sha256', integritySalt).update(paramsString).digest('hex');
}

/**
 * Create payment request for JazzCash (server-side).
 * This endpoint demonstrates how to prepare a signed payload and return a hosted URL or form data.
 * Frontend should POST order details to /api/orders first, then call this endpoint with orderId.
 */
router.post('/jazzcash/create', async (req, res) => {
  try {
    const { orderId, amount, customer } = req.body;
    if (!orderId || !amount) return res.status(400).json({ error: 'orderId & amount required' });

    // Build JazzCash payload according to their docs (fields vary).
    const merchantId = process.env.JAZZCASH_MERCHANT_ID || 'YOUR_MERCHANT_ID';
    const password = process.env.JAZZCASH_PASSWORD || 'PWD';
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT || 'SALT';

    // Example payload fields - confirm with JazzCash docs and sandbox.
    const payload = {
      pp_MerchantID: merchantId,
      pp_Password: password,
      pp_Amount: Math.round(amount * 100).toString(), // amount in paisa or per provider spec
      pp_TxnCurrency: 'PKR',
      pp_TxnRefNo: orderId,
      pp_TxnDateTime: new Date().toISOString(),
      pp_BillReference: 'billRef',
      pp_Description: `Payment for ${orderId}`,
      pp_ReturnURL: `${process.env.PUBLIC_URL || 'http://localhost:3000'}/api/payments/jazzcash/return`, // optional
      // ... other required fields
    };

    // Create a canonical string to sign - exact format depends on JazzCash.
    const signString = Object.keys(payload).sort().map(k => `${k}=${payload[k]}`).join('&');
    const signature = computeJazzCashHash(signString, integritySalt);

    // For hosted checkout: you usually POST these fields (including signature) to JazzCash hosted URL.
    // Here we return the fields so frontend can build a form and submit, or the server can server-side POST.
    res.json({
      ok: true,
      gateway: 'JazzCash',
      action: 'hosted',
      hostedUrl: 'https://sandbox.jazzcash.com.pk/CustomerPortal/merchant/merTransId', // placeholder: replace with real hosted URL
      payload,
      signature
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

/**
 * JazzCash callback endpoint (provider -> your server)
 *
 * This route will be called by JazzCash (according to their webhook/callback configuration).
 * IMPORTANT: Validate signature/integrity exactly per JazzCash docs before trusting payload values.
 */
router.post('/jazzcash/callback', (req, res) => {
  try {
    const payload = req.body;
    console.log('JazzCash callback payload:', payload);

    // Example: payload should include transaction ref (pp_TxnRefNo or txnref) and status fields.
    const txnRef = payload.pp_TxnRefNo || payload.orderId || payload.txnRef;
    const txnStatus = payload.pp_ResponseCode || payload.responseCode || payload.status;

    // Validate signature - example only
    const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT || '';
    // const expectedHash = computeJazzCashHash(/* canonical payload */, integritySalt);
    // if (expectedHash !== payload.signature) return res.status(400).send('invalid signature');

    // Update order in DB
    if (txnRef) {
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(txnRef);
      if (order) {
        const newStatus = (txnStatus === '000' || txnStatus === 'SUCCESS' || txnStatus === '00') ? 'paid' : 'failed';
        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(newStatus, txnRef);

        if (newStatus === 'paid') {
          // send SMS/email
          const items = JSON.parse(order.items_json || '[]');
          const orderObj = {
            id: order.id,
            items,
            total: order.total,
            customer: { name: order.customer_name, email: order.customer_email, phone: order.customer_phone }
          };
          // send notification (fire-and-forget)
          sendSmsAndEmailOnSuccess(orderObj).catch(console.error);
        }
      }
    }

    // Respond according to JazzCash expected response (check docs). Acknowledge receipt.
    res.json({ ok: true });
  } catch (err) {
    console.error('callback error', err);
    res.status(500).json({ error: 'server error' });
  }
});

// EasyPaisa callback placeholder
router.post('/easypaisa/callback', (req, res) => {
  console.log('EasyPaisa callback', req.body);
  // Validate signature, update DB similar to JazzCash callback
  res.json({ ok: true });
});

module.exports = router;
