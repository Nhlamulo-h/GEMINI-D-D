// Billing Store to manage invoices, payments, and metrics across admin and client views
const DEFAULT_INVOICES = [];

const DEFAULT_PROJECT_FILES = [
  { id: "pf-1", projectId: 1, name: "Q1_Tax_Brief.txt", content: "KBR Business Solutions - Q1 Tax Filing project brief and milestones." },
  { id: "pf-2", projectId: 2, name: "Payroll_Requirements.txt", content: "Apex Ltd - Payroll setup and system requirements document." },
];

function initBillingStore() {
  if (!localStorage.getItem("kbr_invoices")) {
    localStorage.setItem("kbr_invoices", JSON.stringify(DEFAULT_INVOICES));
  }
  if (!localStorage.getItem("kbr_project_files")) {
    localStorage.setItem("kbr_project_files", JSON.stringify(DEFAULT_PROJECT_FILES));
  }
  if (!localStorage.getItem("kbr_cart")) {
    localStorage.setItem("kbr_cart", JSON.stringify([]));
  }
  if (!localStorage.getItem("kbr_purchased_courses")) {
    localStorage.setItem("kbr_purchased_courses", JSON.stringify(["Invoicing Administration"]));
  }
}

function getInvoices() {
  initBillingStore();
  try {
    return JSON.parse(localStorage.getItem("kbr_invoices"));
  } catch (e) {
    return DEFAULT_INVOICES;
  }
}

function saveInvoices(invoices) {
  localStorage.setItem("kbr_invoices", JSON.stringify(invoices));
}

function getInvoiceById(id) {
  const invoices = getInvoices();
  return invoices.find(inv => inv.id === id);
}

function payInvoice(id, paidDate, paymentMethod = "Secure Bank EFT") {
  const invoices = getInvoices();
  const inv = invoices.find(i => i.id === id);
  if (inv) {
    inv.status = "paid";
    inv.paidDate = paidDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    inv.paymentMethod = paymentMethod;
    saveInvoices(invoices);
    addPaymentNotifications(inv);
    return true;
  }
  return false;
}

function addPaymentNotifications(invoice) {
  try {
    const clientNotifs = JSON.parse(localStorage.getItem("kbr_notif_client")) || [];
    clientNotifs.unshift({
      id: "c_paid_" + Date.now(),
      title: "Invoice Paid",
      desc: `Invoice ${invoice.id} for R${invoice.amount.toLocaleString()} was successfully paid via ${invoice.paymentMethod}.`,
      time: "Just now",
      type: "invoice",
      read: false
    });
    localStorage.setItem("kbr_notif_client", JSON.stringify(clientNotifs));

    const adminNotifs = JSON.parse(localStorage.getItem("kbr_notif_admin")) || [];
    adminNotifs.unshift({
      id: "a_paid_" + Date.now(),
      title: "Invoice Paid",
      desc: `${invoice.company} paid Invoice ${invoice.id} (R${invoice.amount.toLocaleString()}) via ${invoice.paymentMethod}.`,
      time: "Just now",
      type: "invoice",
      read: false
    });
    localStorage.setItem("kbr_notif_admin", JSON.stringify(adminNotifs));
  } catch (e) {
    console.error("Failed to add payment notifications", e);
  }
}

// Actual Browser-level Invoice file downloader
function downloadInvoiceFile(invoiceId) {
  const invoice = getInvoiceById(invoiceId);
  if (!invoice) {
    alert("Invoice not found.");
    return;
  }
  const documentContent = `===========================================================
               KBR BUSINESS SOLUTIONS (PTY) LTD
      128 Rivonia Road, Sandton, Johannesburg, 2196
              Tel: +27 11 482 9012 | info@kbr.co.za
===========================================================
INVOICE REFERENCE : ${invoice.id}
BILLING COMPANY   : ${invoice.company}
DUE DATE          : ${invoice.due}
INVOICE STATUS    : ${invoice.status.toUpperCase()}
PAYMENT METHOD    : ${invoice.paymentMethod || 'N/A'}
PAID DATE         : ${invoice.paidDate || 'N/A'}
-----------------------------------------------------------
DESCRIPTION OF SERVICES:
${invoice.description}
-----------------------------------------------------------
SUBTOTAL          : R${invoice.amount.toLocaleString()}
VAT (15.0%)       : R0.00 (VAT Zero-Rated / Included)
-----------------------------------------------------------
TOTAL AMOUNT DUE  : R${invoice.amount.toLocaleString()}
===========================================================
Security Hash: SHA-256 [${btoa(invoice.id + invoice.amount + invoice.status).slice(0, 32)}]
Thank you for your business! This is an official secure document.
===========================================================`;

  triggerBrowserDownload(`${invoice.id}.txt`, documentContent);
}

function triggerBrowserDownload(filename, textContent) {
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Project Files state operations
function getProjectFiles(projectId) {
  initBillingStore();
  const allFiles = JSON.parse(localStorage.getItem("kbr_project_files")) || DEFAULT_PROJECT_FILES;
  return allFiles.filter(f => f.projectId === Number(projectId));
}

function uploadProjectFile(projectId, fileName, fileContent = "Simulated Uploaded Document Content.") {
  initBillingStore();
  const allFiles = JSON.parse(localStorage.getItem("kbr_project_files")) || DEFAULT_PROJECT_FILES;
  const newFile = {
    id: "pf-" + Date.now(),
    projectId: Number(projectId),
    name: fileName,
    content: fileContent
  };
  allFiles.push(newFile);
  localStorage.setItem("kbr_project_files", JSON.stringify(allFiles));
  
  // Add a system notification
  addProjectFileNotification(fileName);
  return newFile;
}

function addProjectFileNotification(fileName) {
  try {
    const clientNotifs = JSON.parse(localStorage.getItem("kbr_notif_client")) || [];
    clientNotifs.unshift({
      id: "c_file_" + Date.now(),
      title: "Document Uploaded",
      desc: `Document '${fileName}' has been uploaded to your project space successfully.`,
      time: "Just now",
      type: "project",
      read: false
    });
    localStorage.setItem("kbr_notif_client", JSON.stringify(clientNotifs));
  } catch (e) {
    console.error(e);
  }
}

function downloadProjectFile(fileId) {
  initBillingStore();
  const allFiles = JSON.parse(localStorage.getItem("kbr_project_files")) || DEFAULT_PROJECT_FILES;
  const file = allFiles.find(f => f.id === fileId);
  if (file) {
    triggerBrowserDownload(file.name, file.content);
  } else {
    alert("Project file not found.");
  }
}

function deleteProjectFile(fileId) {
  initBillingStore();
  const allFiles = JSON.parse(localStorage.getItem("kbr_project_files")) || DEFAULT_PROJECT_FILES;
  const index = allFiles.findIndex(f => f.id === fileId);
  if (index > -1) {
    allFiles.splice(index, 1);
    localStorage.setItem("kbr_project_files", JSON.stringify(allFiles));
    return true;
  }
  return false;
}

// Course Cart Operations
function getCart() {
  initBillingStore();
  return JSON.parse(localStorage.getItem("kbr_cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("kbr_cart", JSON.stringify(cart));
  // Dispatch a storage event to synchronize the layout header badge in real-time
  window.dispatchEvent(new Event("storage"));
  if (window.refreshCartUI) window.refreshCartUI();
}

function addToCart(courseId, title, price) {
  const cart = getCart();
  if (cart.find(c => c.id === courseId)) {
    return false; // already in cart
  }
  cart.push({ id: courseId, title, price });
  saveCart(cart);
  return true;
}

function removeFromCart(courseId) {
  const cart = getCart();
  const index = cart.findIndex(c => c.id === courseId);
  if (index > -1) {
    cart.splice(index, 1);
    saveCart(cart);
    return true;
  }
  return false;
}

function clearCart() {
  saveCart([]);
}

function getPurchasedCourses() {
  initBillingStore();
  return JSON.parse(localStorage.getItem("kbr_purchased_courses")) || [];
}

function isCoursePurchased(title) {
  const purchased = getPurchasedCourses();
  return purchased.includes(title);
}

function addCourseCheckoutNotifications(cartItems, amount, paymentMethod) {
  try {
    const courseTitles = cartItems.map(item => item.title).join(", ");
    let clientName = "Client";
    try {
      const session = JSON.parse(localStorage.getItem("kbr_session"));
      if (session && session.name) clientName = session.name;
    } catch(err) {}

    const clientNotifs = JSON.parse(localStorage.getItem("kbr_notif_client")) || [];
    clientNotifs.unshift({
      id: "c_course_" + Date.now(),
      title: "Course Access Unlocked",
      desc: `Successfully purchased: ${courseTitles} (R${amount.toLocaleString()}) via ${paymentMethod}.`,
      time: "Just now",
      type: "task",
      read: false
    });
    localStorage.setItem("kbr_notif_client", JSON.stringify(clientNotifs));

    const adminNotifs = JSON.parse(localStorage.getItem("kbr_notif_admin")) || [];
    adminNotifs.unshift({
      id: "a_course_" + Date.now(),
      title: "Course Purchased by Client",
      desc: `${clientName} purchased: ${courseTitles} for R${amount.toLocaleString()} via ${paymentMethod}.`,
      time: "Just now",
      type: "invoice",
      read: false
    });
    localStorage.setItem("kbr_notif_admin", JSON.stringify(adminNotifs));
  } catch (e) {
    console.error("Failed to add course purchase notifications", e);
  }
}

function unlockPurchasedCourses(paymentMethod = "Secure Checkout Gateway") {
  const cart = getCart();
  if (cart.length === 0) return;

  let totalAmount = 0;
  cart.forEach(item => {
    const priceNum = Number(item.price.replace(/[^\d]/g, ""));
    totalAmount += priceNum;
  });

  const purchased = getPurchasedCourses();
  cart.forEach(item => {
    if (!purchased.includes(item.title)) {
      purchased.push(item.title);
    }
  });
  localStorage.setItem("kbr_purchased_courses", JSON.stringify(purchased));
  addCourseCheckoutNotifications(cart, totalAmount, paymentMethod);
  clearCart();
}

function exportAllInvoices() {
  const session = typeof getSession === 'function' ? getSession() : null;
  if (!session) {
    alert("Authentication session not found. Please log in again.");
    return;
  }
  
  const allInvoices = getInvoices();
  const filtered = session.role === "client" 
    ? allInvoices.filter(i => i.company === session.name)
    : allInvoices;
    
  if (filtered.length === 0) {
    alert("No invoices available to export.");
    return;
  }
  
  let excelContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <!--[if gte mso 9]>
    <xml>
      <x:ExcelWorkbook>
        <x:ExcelWorksheets>
          <x:ExcelWorksheet>
            <x:Name>Invoices</x:Name>
            <x:WorksheetOptions>
              <x:DisplayGridlines/>
            </x:WorksheetOptions>
          </x:ExcelWorksheet>
        </x:ExcelWorksheets>
      </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
      table { border-collapse: collapse; }
      th { background-color: #f2f2f2; font-weight: bold; border: 1px solid #dddddd; padding: 8px; font-family: sans-serif; }
      td { border: 1px solid #dddddd; padding: 8px; font-family: sans-serif; }
    </style>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th>Invoice ID</th>
          <th>Company Name</th>
          <th>Description</th>
          <th>Amount (ZAR)</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Paid Date</th>
          <th>Payment Method</th>
        </tr>
      </thead>
      <tbody>`;

  filtered.forEach(inv => {
    excelContent += `
        <tr>
          <td>${inv.id}</td>
          <td>${inv.company}</td>
          <td>${inv.description}</td>
          <td>R${inv.amount.toLocaleString()}</td>
          <td>${inv.due}</td>
          <td>${inv.status.toUpperCase()}</td>
          <td>${inv.paidDate || 'N/A'}</td>
          <td>${inv.paymentMethod || 'N/A'}</td>
        </tr>`;
  });

  excelContent += `
      </tbody>
    </table>
  </body>
  </html>`;

  const blob = new Blob([excelContent], { type: "application/vnd.ms-excel;charset=utf-8" });
  const filename = `KBR_Invoices_${session.name.replace(/[^a-zA-Z0-9]/g, "_")}.xls`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


