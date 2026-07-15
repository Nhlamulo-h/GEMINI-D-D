/**
 * Frontend PayFast Secure Redirection Utility.
 * Communicates with the secure signing backend server to generate and sign the payload.
 */

window.payWithPayfast = async function(checkoutData) {
  const BACKEND_URL = 'http://localhost:5000/api/payfast/checkout';

  try {
    // Show a loading/processing panel in KBR checkout wizard
    if (typeof showPanel === 'function') {
      showPanel("panel-processing");
      const procHeader = document.querySelector("#panel-processing h3");
      const procText = document.querySelector("#panel-processing p");
      if (procHeader) procHeader.innerText = "Securing Signature";
      if (procText) procText.innerText = "Generating encrypted PayFast payload and signature. Redirecting...";
    }

    // Call backend endpoint to sign the payload
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(checkoutData)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to sign the payment payload.');
    }

    const { checkoutUrl, payload } = await response.json();

    // Create a hidden form dynamically and submit it to PayFast
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = checkoutUrl;

    // Append fields as hidden inputs
    for (const key in payload) {
      if (payload.hasOwnProperty(key)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = payload[key];
        form.appendChild(input);
      }
    }

    document.body.appendChild(form);

    // Save pending flags in localStorage for simple client-side success landing demonstration.
    // In production, the ITN webhook on the backend does the status update.
    if (checkoutData.paymentId && checkoutData.paymentId.startsWith("INV-")) {
      // It is an invoice payment
      localStorage.setItem("kbr_pending_payfast_invoice", checkoutData.paymentId);
    } else {
      // It is a course cart payment
      localStorage.setItem("kbr_pending_payfast_cart", "true");
    }

    // Redirect customer to PayFast gateway
    form.submit();

  } catch (error) {
    console.error("PayFast redirection failed:", error);
    alert(`Payment gateway error: ${error.message || 'Could not connect to the signing server. Please check if the local server is running on port 5000.'}`);
    
    // Go back to the payment selection wizard step
    if (typeof showPanel === 'function') {
      showPanel("panel-method");
      if (typeof updateStepIndicator === 'function') {
        updateStepIndicator(2);
      }
    }
  }
};
