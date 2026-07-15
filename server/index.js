const http = require('http');
const crypto = require('crypto');

// Configuration (can also be loaded from process.env)
const PORT = process.env.PORT || 5000;
const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '10000100'; // Default Sandbox
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '46f0db50e68d4'; // Default Sandbox
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || 'jt776uhHtS'; // Default Sandbox
const IS_SANDBOX = process.env.PAYFAST_SANDBOX !== 'false';

const RETURN_URL = process.env.PAYFAST_RETURN_URL || 'http://localhost:3000/pages/training.html?purchased=true';
const CANCEL_URL = process.env.PAYFAST_CANCEL_URL || 'http://localhost:3000/pages/checkout.html';
const NOTIFY_URL = process.env.PAYFAST_NOTIFY_URL || 'http://localhost:5000/api/payfast/notify';

/**
 * PayFast Signature Helper
 */
function generatePayfastSignature(data, passphrase) {
  let parameterString = "";
  const sortedKeys = Object.keys(data).sort();
  for (const key of sortedKeys) {
    const value = data[key];
    if (value !== undefined && value !== null && value.toString().trim() !== "" && key !== "signature") {
      const encodedValue = encodeURIComponent(value.toString().trim())
        .replace(/%20/g, "+")
        .replace(/%2A/g, "*")
        .replace(/%7E/g, "~")
        .replace(/!/g, "%21")
        .replace(/'/g, "%27")
        .replace(/\(/g, "%28")
        .replace(/\)/g, "%29");
      parameterString += `${key}=${encodedValue}&`;
    }
  }
  let signatureString = parameterString.slice(0, -1);
  if (passphrase) {
    const encodedPassphrase = encodeURIComponent(passphrase.trim())
      .replace(/%20/g, "+")
      .replace(/%2A/g, "*")
      .replace(/%7E/g, "~")
      .replace(/!/g, "%21")
      .replace(/'/g, "%27")
      .replace(/\(/g, "%28")
      .replace(/\)/g, "%29");
    signatureString += `&passphrase=${encodedPassphrase}`;
  }
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

/**
 * Native HTTP Server
 */
const server = http.createServer((req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Request logging
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Route: POST /api/payfast/checkout
  if (req.method === 'POST' && req.url === '/api/payfast/checkout') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payloadData = JSON.parse(body);
        const { amount, itemName, itemDescription, paymentId, customer } = payloadData;

        if (!amount || !itemName || !paymentId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "Missing required fields: amount, itemName, or paymentId." }));
          return;
        }

        const payload = {
          merchant_id: MERCHANT_ID,
          merchant_key: MERCHANT_KEY,
          return_url: RETURN_URL,
          cancel_url: CANCEL_URL,
          notify_url: NOTIFY_URL,
          m_payment_id: paymentId,
          amount: parseFloat(amount).toFixed(2),
          item_name: itemName,
          item_description: itemDescription || itemName,
        };

        if (customer) {
          if (customer.firstName) payload.name_first = customer.firstName;
          if (customer.lastName) payload.name_last = customer.lastName;
          if (customer.email) payload.email_address = customer.email;
        }

        const signature = generatePayfastSignature(payload, PASSPHRASE);
        payload.signature = signature;

        const checkoutUrl = IS_SANDBOX
          ? 'https://sandbox.payfast.co.za/eng/process'
          : 'https://www.payfast.co.za/eng/process';

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          checkoutUrl,
          payload
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Malformed JSON body in request." }));
      }
    });
    return;
  }

  // API Route: POST /api/payfast/notify (ITN callback)
  if (req.method === 'POST' && req.url === '/api/payfast/notify') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      console.log("=== PayFast ITN Callback Webhook Notification Received ===");
      console.log("Body Payload:", body);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end("OK");
    });
    return;
  }

  // Route: GET /health
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: "OK", message: "PayFast Signing native backend server is active." }));
    return;
  }

  // Route: GET /
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end("KBR Secure PayFast Signature Signer Backend. Use POST /api/payfast/checkout");
    return;
  }

  // 404 Route
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: "Route not found" }));
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Native KBR PayFast Signing Server running on port ${PORT}`);
  console.log(` Zero external dependencies. Portability active.`);
  console.log(` Endpoint: http://localhost:${PORT}/api/payfast/checkout`);
  console.log(`====================================================`);
});
