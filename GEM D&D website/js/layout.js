// Shared layout: sidebar + header. Renders into #app-layout.
// Usage: call renderAppLayout({ title, current, content, session })

const NAV_ITEMS = [
  { icon: "layout-dashboard", label: "Dashboard", path: "dashboard.html", roles: ["admin", "employee"] },
  { icon: "layout-dashboard", label: "Dashboard", path: "client-dashboard.html", roles: ["client"] },
  { icon: "calendar", label: "Calendar", path: "calendar.html", roles: ["admin", "employee"] },
  { icon: "calendar", label: "Calendar", path: "client-calendar.html", roles: ["client"] },
  { icon: "folder-open", label: "Projects", path: "projects.html", roles: ["admin", "employee"] },
  { icon: "folder-open", label: "Projects", path: "client-projects.html", roles: ["client"] },
  { icon: "credit-card", label: "Billing", path: "billing.html", roles: ["admin"] },
  { icon: "credit-card", label: "Billing", path: "client-billing.html", roles: ["client"] },
  { icon: "graduation-cap", label: "Training", path: "training.html", roles: ["admin", "client"] },
  { icon: "file-bar-chart", label: "Reports", path: "reports.html", roles: ["admin", "employee"] },
  { icon: "settings", label: "Settings", path: "settings.html", roles: ["admin", "employee"] },
  { icon: "settings", label: "Settings", path: "client-settings.html", roles: ["client"] },
  { icon: "users", label: "Users", path: "admin-users.html", roles: ["admin"] },
];

const DEFAULT_NOTIFICATIONS = {
  admin: [
    { id: "a1", title: "New Appointment Booked", desc: "Client Smith Co. booked an appointment with Sipho Ndlovu.", time: "Just now", type: "calendar", read: false },
    { id: "a2", title: "New Client Signup", desc: "A new client Smith Co. has registered an account.", time: "1 hour ago", type: "user", read: false },
    { id: "a3", title: "System Backup Completed", desc: "Daily automated system database backup completed successfully.", time: "5 hours ago", type: "system", read: true },
    { id: "a4", title: "Invoice Paid", desc: "Invoice #1042 was paid by TechStart (R5,500).", time: "1 day ago", type: "invoice", read: true },
    { id: "a5", title: "Task Overdue Notice", desc: "Completed task 'Reconcile bank statements' is awaiting review.", time: "2 days ago", type: "task", read: true }
  ],
  employee: [
    { id: "e1", title: "New Appointment Assigned", desc: "An appointment was assigned to you by Smith Co. for March 18, 2026.", time: "Just now", type: "calendar", read: false },
    { id: "e2", title: "Task Assignment", desc: "You have been assigned the task: 'Complete Q1 VAT return for Apex Ltd'.", time: "2 hours ago", type: "task", read: false },
    { id: "e3", title: "Project Update", desc: "Client Smith Co. sent a message on project Q1 Tax Filing.", time: "4 hours ago", type: "message", read: true },
    { id: "e4", title: "Leave Approval", desc: "Your annual leave request has been approved by the Admin.", time: "2 days ago", type: "leave", read: true }
  ],
  client: [
    { id: "c1", title: "Appointment Status Updated", desc: "Your appointment for March 18, 2026 was confirmed.", time: "Just now", type: "calendar", read: false },
    { id: "c2", title: "Invoice Issued", desc: "New invoice #1043 has been generated for bookkeeping services (R1,500).", time: "3 hours ago", type: "invoice", read: false },
    { id: "c3", title: "Project Phase Complete", desc: "Phase 1 of Q1 Tax Filing project has been marked as complete.", time: "1 day ago", type: "project", read: true },
    { id: "c4", title: "Welcome to KBR", desc: "Your KBR business account has been set up successfully. Welcome aboard!", time: "3 days ago", type: "welcome", read: true }
  ]
};

function getNotificationsForRole(role) {
  let notifications = JSON.parse(localStorage.getItem(`kbr_notif_${role}`));
  if (!notifications) {
    notifications = DEFAULT_NOTIFICATIONS[role] || [];
    localStorage.setItem(`kbr_notif_${role}`, JSON.stringify(notifications));
  }
  return notifications;
}

function renderAppLayout({ title, current, contentHTML, session }) {
  const role = session.role;



  // Set document title dynamically
  document.title = `${title} — KBR`;

  const navItems = NAV_ITEMS.filter(i => i.roles.includes(role)).map(item => {
    let label = item.label;
    if (role === "admin") {
      if (item.path === "training.html") {
        label = "Courses";
      }
      if (item.path === "billing.html") {
        label = "Invoices";
      }
      if (item.path === "calendar.html") {
        label = "Overview";
      }
    }
    return { ...item, label };
  });
  const roleBadgeClass =
    role === "admin" ? "bg-primary/20 text-primary" :
      role === "employee" ? "bg-success/20 text-success" :
        "bg-warning/20 text-warning";

  const notifications = getNotificationsForRole(role);
  const unreadCount = notifications.filter(n => !n.read).length;

  document.body.innerHTML = `
    <div class="min-h-screen bg-background font-body">
      <div id="sidebar-overlay" class="hidden fixed inset-0 z-40 bg-foreground/50"></div>

      <aside id="sidebar" class="fixed top-0 left-0 z-50 h-full w-72 bg-sidebar text-sidebar-foreground transform -translate-x-full transition-transform duration-300 flex flex-col">
        <div class="p-6 flex-1 overflow-y-auto">
          <div class="flex items-center gap-3 mb-10 shrink-0">
            <div class="flex items-center justify-center shrink-0">
              <img src="../assets/logo2.png" alt="KBR Logo" class="h-12 w-auto object-contain">
            </div>
            <div class="shrink-0">
              <div class="font-heading font-bold text-lg whitespace-nowrap">KBR</div>
              <div class="text-sm text-primary whitespace-nowrap">Business Solutions</div>
            </div>
          </div>
          <div class="mb-4 px-4 shrink-0">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleBadgeClass} whitespace-nowrap">
              ${role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          </div>
          <nav class="space-y-1">
            ${navItems.map(item => `
              <a href="${item.path}" class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${current === item.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent/50'}">
                <i data-lucide="${item.icon}" class="w-5 h-5 shrink-0"></i>
                <span class="font-medium whitespace-nowrap">${item.label}</span>
              </a>
            `).join("")}
          </nav>
        </div>
        <div class="p-6 mt-auto border-t border-sidebar-accent/20 shrink-0">
          <button id="signout-btn" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-sidebar-accent/50 w-full">
            <i data-lucide="log-out" class="w-5 h-5 shrink-0"></i>
            <span class="font-medium whitespace-nowrap">Sign Out</span>
          </button>
        </div>
      </aside>

      <header class="sticky top-0 z-30 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <button id="open-sidebar"><i data-lucide="menu" class="w-6 h-6"></i></button>
          ${(current === 'dashboard.html' || current === 'client-dashboard.html') ? '' : `<a href="${role === 'client' ? 'client-dashboard.html' : 'dashboard.html'}"><i data-lucide="arrow-left" class="w-5 h-5"></i></a>`}
          <h1 class="font-heading font-bold text-xl">KBR Portal</h1>
        </div>
        <div class="flex items-center gap-3 relative">
          <div class="relative" id="notif-container">
            <button id="notif-btn" class="p-1.5 rounded-full hover:bg-muted transition-colors relative outline-none focus:ring-2 focus:ring-primary/50">
              <i data-lucide="bell" class="w-5 h-5 text-foreground"></i>
              <span id="notif-badge" class="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-background ${unreadCount > 0 ? '' : 'hidden'}">${unreadCount}</span>
            </button>
            <div id="notif-dropdown" class="hidden absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden transform origin-top-right transition-all">
              <div class="p-3 border-b border-border bg-muted/30 flex justify-between items-center">
                <span class="font-bold text-sm text-foreground">Notifications</span>
                <button id="mark-read-btn" class="text-xs text-primary hover:underline font-medium">Mark all as read</button>
              </div>
              <div class="max-h-[60vh] overflow-y-auto">
                ${notifications.length > 0 ? notifications.map(n => {
    let iconName = "bell";
    let iconBg = "bg-primary/10 text-primary";
    if (n.type === "calendar") { iconName = "calendar"; iconBg = "bg-primary/10 text-primary"; }
    else if (n.type === "task") { iconName = "check-square"; iconBg = "bg-success/10 text-success"; }
    else if (n.type === "user") { iconName = "user"; iconBg = "bg-blue-500/10 text-blue-500"; }
    else if (n.type === "invoice") { iconName = "credit-card"; iconBg = "bg-warning/10 text-warning"; }
    else if (n.type === "system") { iconName = "shield"; iconBg = "bg-muted-foreground/10 text-muted-foreground"; }
    else if (n.type === "project") { iconName = "folder"; iconBg = "bg-primary/10 text-primary"; }
    else if (n.type === "message") { iconName = "message-square"; iconBg = "bg-primary/10 text-primary"; }

    return `
                    <div class="notif-item p-3 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors ${n.read ? '' : 'bg-primary/5'}" data-id="${n.id}">
                      <div class="flex items-start gap-3">
                        <div class="w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0 mt-0.5">
                          <i data-lucide="${iconName}" class="w-4 h-4"></i>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-foreground">${n.title}</p>
                          <p class="text-xs text-muted-foreground mt-0.5">${n.desc}</p>
                          <p class="text-[10px] ${n.read ? 'text-muted-foreground' : 'text-primary'} font-medium mt-1">${n.time}</p>
                        </div>
                      </div>
                    </div>
                  `;
  }).join("") : `
                  <div class="p-6 text-center text-sm text-muted-foreground">
                    <i data-lucide="bell-off" class="w-8 h-8 mx-auto mb-2 opacity-50"></i>
                    No notifications
                  </div>
                `}
              </div>
              <div class="p-2 border-t border-border text-center bg-muted/30">
                <a href="activities.html" class="text-xs text-primary font-medium hover:underline">View all activities</a>
              </div>
            </div>
          </div>
          ${role === 'client' ? `
          <div class="relative" id="cart-container">
            <button id="cart-btn" class="p-1.5 rounded-full hover:bg-muted transition-colors relative outline-none focus:ring-2 focus:ring-primary/50" aria-label="Cart">
              <i data-lucide="shopping-cart" class="w-5 h-5 text-foreground"></i>
              <span id="cart-badge" class="absolute top-0 right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-background hidden">0</span>
            </button>
            <div id="cart-dropdown" class="hidden absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden transform origin-top-right transition-all">
              <div class="p-3 border-b border-border bg-muted/30 flex justify-between items-center">
                <span class="font-bold text-sm text-foreground">Shopping Cart</span>
                <span id="cart-qty-text" class="text-xs text-muted-foreground">0 items</span>
              </div>
              <div id="cart-items-list" class="max-h-[50vh] overflow-y-auto divide-y divide-border bg-card">
                <!-- Cart items populated here -->
              </div>
              <div class="p-3 border-t border-border bg-muted/20 space-y-3">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-muted-foreground">Subtotal</span>
                  <span id="cart-subtotal" class="font-bold text-primary">R0.00</span>
                </div>
                <a href="checkout.html" class="block w-full bg-primary hover:opacity-90 active:scale-95 text-center text-primary-foreground text-xs font-bold py-2 rounded-lg transition-all">
                  Proceed to Checkout
                </a>
              </div>
            </div>
          </div>
          ` : ''}
          <button id="theme-toggle" type="button" class="p-1.5 rounded-full text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors" aria-label="Toggle Dark Mode">
          </button>
        </div>
      </header>

      <main class="pb-20">${contentHTML}</main>

    </div>
  `;

  lucide.createIcons();
  document.getElementById("open-sidebar").onclick = () => {
    document.getElementById("sidebar").classList.remove("-translate-x-full");
    document.getElementById("sidebar-overlay").classList.remove("hidden");
  };
  document.getElementById("sidebar-overlay").onclick = () => {
    document.getElementById("sidebar").classList.add("-translate-x-full");
    document.getElementById("sidebar-overlay").classList.add("hidden");
  };
  document.getElementById("signout-btn").onclick = signOut;

  const notifBtn = document.getElementById("notif-btn");
  const notifDropdown = document.getElementById("notif-dropdown");
  const markReadBtn = document.getElementById("mark-read-btn");
  const notifBadge = document.getElementById("notif-badge");

  if (notifBtn && notifDropdown) {
    notifBtn.onclick = (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle("hidden");
    };

    // Close when clicking outside
    document.addEventListener("click", (e) => {
      if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
        notifDropdown.classList.add("hidden");
      }
    });

    if (markReadBtn) {
      markReadBtn.onclick = (e) => {
        e.stopPropagation();
        let notifs = JSON.parse(localStorage.getItem(`kbr_notif_${role}`)) || [];
        notifs.forEach(n => n.read = true);
        localStorage.setItem(`kbr_notif_${role}`, JSON.stringify(notifs));
        if (notifBadge) notifBadge.classList.add("hidden");
        document.querySelectorAll('.notif-item').forEach(item => {
          item.classList.remove("bg-primary/5");
          const timeText = item.querySelector('p:last-child');
          if (timeText) {
            timeText.classList.remove("text-primary");
            timeText.classList.add("text-muted-foreground");
          }
        });
      };
    }

    document.querySelectorAll('.notif-item').forEach(item => {
      item.onclick = (e) => {
        e.stopPropagation();
        const id = item.dataset.id;
        let notifs = JSON.parse(localStorage.getItem(`kbr_notif_${role}`)) || [];
        const n = notifs.find(x => x.id === id);
        if (n && !n.read) {
          n.read = true;
          localStorage.setItem(`kbr_notif_${role}`, JSON.stringify(notifs));
          item.classList.remove("bg-primary/5");
          const timeText = item.querySelector('p:last-child');
          if (timeText) {
            timeText.classList.remove("text-primary");
            timeText.classList.add("text-muted-foreground");
          }
          // Recalculate badge
          const unreads = notifs.filter(x => !x.read).length;
          if (unreads === 0) {
            if (notifBadge) notifBadge.classList.add("hidden");
          } else {
            if (notifBadge) {
              notifBadge.classList.remove("hidden");
              notifBadge.innerText = unreads;
            }
          }
        }
      };
    });
  }

  // Cart Dropdown controls for Client
  if (role === 'client') {
    const cartBtn = document.getElementById("cart-btn");
    const cartDropdown = document.getElementById("cart-dropdown");

    if (cartBtn && cartDropdown) {
      cartBtn.onclick = (e) => {
        e.stopPropagation();
        cartDropdown.classList.toggle("hidden");
      };

      document.addEventListener("click", (e) => {
        if (!cartDropdown.contains(e.target) && e.target !== cartBtn) {
          cartDropdown.classList.add("hidden");
        }
      });

      window.refreshCartUI = function () {
        if (typeof getCart === 'undefined') return;
        const cart = getCart();
        const badge = document.getElementById("cart-badge");
        const qtyText = document.getElementById("cart-qty-text");
        const listContainer = document.getElementById("cart-items-list");
        const subtotalText = document.getElementById("cart-subtotal");

        if (cart.length > 0) {
          if (badge) {
            badge.classList.remove("hidden");
            badge.innerText = cart.length;
          }
          if (qtyText) qtyText.innerText = `${cart.length} course${cart.length > 1 ? 's' : ''}`;

          let total = 0;
          if (listContainer) {
            listContainer.innerHTML = cart.map(item => {
              const cleanPrice = Number(item.price.replace(/[^\d]/g, ""));
              total += cleanPrice;
              return `
                <div class="p-3 flex justify-between items-start gap-3 text-xs bg-card hover:bg-muted/30 transition-colors">
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-foreground truncate">${item.title}</p>
                    <p class="text-primary font-medium mt-0.5">${item.price}</p>
                  </div>
                  <button onclick="removeFromCart('${item.id}'); window.refreshCartUI();" class="text-destructive hover:underline text-[10px] font-semibold shrink-0">
                    Remove
                  </button>
                </div>
              `;
            }).join("");
          }
          if (subtotalText) subtotalText.innerText = `R${total.toLocaleString()}`;
        } else {
          if (badge) badge.classList.add("hidden");
          if (qtyText) qtyText.innerText = `0 items`;
          if (listContainer) {
            listContainer.innerHTML = `
              <div class="p-6 text-center text-xs text-muted-foreground bg-card">
                <i data-lucide="shopping-cart" class="w-6 h-6 mx-auto mb-1.5 opacity-50 text-muted-foreground"></i>
                Your cart is empty
              </div>
            `;
            lucide.createIcons();
          }
          if (subtotalText) subtotalText.innerText = `R0.00`;
        }
      };

      window.refreshCartUI();
      window.addEventListener("storage", () => {
        window.refreshCartUI();
      });
    }
  }
}
