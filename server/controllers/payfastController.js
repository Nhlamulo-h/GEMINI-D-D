const crypto = require('crypto');

/**
 * Helper function to generate PayFast signature.
 * Concatenates sorted non-empty key-value pairs, appends passphrase, and generates MD5.
 */
function generatePayfastSignature(data, passphrase) {
  let parameterString = "";
  
  // Sort the keys alphabetically as required by PayFast
  const sortedKeys = Object.keys(data).sort();
  
  for (const key of sortedKeys) {
    const value = data[key];
    // Exclude empty values, undefined values, and the signature itself
    if (value !== undefined && value !== null && value.toString().trim() !== "" && key !== "signature") {
      // PayFast signature encoding rules: URL-encode and replace %20 with +
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

  // Remove the trailing '&'
  let signatureString = parameterString.slice(0, -1);

  // Append secure passphrase if configured
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

  // Return the MD5 hash signature
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

/**
 * Express Controller to handle signing the PayFast checkout payload.
 */
exports.generateCheckoutPayload = (req, res) => {
  try {
    const { amount, itemName, itemDescription, paymentId, customer } = req.body;

    if (!amount || !itemName || !paymentId) {
      return res.status(400).json({ error: "Missing required fields: amount, itemName, or paymentId." });
    }

    // Load credentials from Env (fallback to PayFast Sandbox default credentials)
    const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '10000100'; // Default PayFast Sandbox ID
    const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '46f0db50e68d4'; // Default PayFast Sandbox Key
    const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || 'jt776uhHtS'; // Default PayFast Sandbox Passphrase
    const IS_SANDBOX = process.env.PAYFAST_SANDBOX !== 'false'; // Default to sandbox/testing mode

    const returnUrl = process.env.PAYFAST_RETURN_URL || 'http://localhost:3000/pages/training.html?purchased=true';
    const cancelUrl = process.env.PAYFAST_CANCEL_URL || 'http://localhost:3000/pages/checkout.html';
    const notifyUrl = process.env.PAYFAST_NOTIFY_URL || 'http://localhost:5000/api/payfast/notify';

    // Construct checkout payload object
    const payload = {
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: notifyUrl,
      m_payment_id: paymentId,
      amount: parseFloat(amount).toFixed(2),
      item_name: itemName,
      item_description: itemDescription || itemName,
    };

    // Add customer details if provided
    if (customer) {
      if (customer.firstName) payload.name_first = customer.firstName;
      if (customer.lastName) payload.name_last = customer.lastName;
      if (customer.email) payload.email_address = customer.email;
    }

    // Generate MD5 signature securely on the backend using passphrase
    const signature = generatePayfastSignature(payload, PASSPHRASE);
    
    // Add signature to the payload object
    payload.signature = signature;

    // Define PayFast redirect endpoint url based on environment
    const checkoutUrl = IS_SANDBOX
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    // Return the response to the frontend client
    return res.status(200).json({
      success: true,
      checkoutUrl,
      payload
    });

  } catch (error) {
    console.error("Error signing PayFast payload:", error);
    return res.status(500).json({ error: "Failed to generate signed PayFast checkout payload." });
  }
};
