// WhatsApp Floating Chat Widget Integration
// Dynamically builds and injects the WhatsApp widget elements.

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Determine paths dynamically based on page location
    const isSubpage = window.location.pathname.includes('/pages/');
    const logoPath = isSubpage ? '../assets/gemini-logo.jpg' : 'assets/gemini-logo.jpg';
    
    // 2. Create wrapper container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'whatsapp-widget-container';
    
    // 3. Define HTML structure
    widgetContainer.innerHTML = `
      <!-- WhatsApp Floating Button -->
      <div id="wa-float-btn" class="whatsapp-float-btn" title="Chat with us on WhatsApp">
        <i data-lucide="message-circle" class="w-7 h-7"></i>
        <span class="whatsapp-chat-badge animate-pulse">1</span>
      </div>

      <!-- WhatsApp Chat Box -->
      <div id="wa-chat-box" class="whatsapp-chat-box">
        <!-- Header -->
        <div class="bg-[#25D366] text-white p-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-white">
              <img src="${logoPath}" alt="Gemini Logo" class="w-full h-full object-cover">
            </div>
            <div>
              <h4 class="font-bold text-xs font-heading tracking-wide">Nhlamulo H.</h4>
              <p class="text-[9px] font-semibold opacity-90 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-white inline-block animate-pulse"></span>
                Lead Developer (Online)
              </p>
            </div>
          </div>
          <button id="wa-close-btn" class="text-white hover:opacity-85 focus:outline-none" aria-label="Close Chat">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Chat Area -->
        <div class="p-4 bg-[#E5DDD5] dark:bg-[#1f191f] flex-1 max-h-60 overflow-y-auto space-y-3 font-body">
          <!-- Incoming message -->
          <div class="bg-white dark:bg-[#2e262e] text-[#241D24] dark:text-gray-100 p-3 rounded-lg text-xs max-w-[85%] shadow-sm relative">
            <span class="font-semibold text-[9px] text-[#25D366] block mb-1">Gemini Digital</span>
            Hi there! 👋 How can we help you bridge the digital divide today? Let us know what you need.
            <span class="text-[8px] text-gray-400 dark:text-gray-500 block text-right mt-1">Just now</span>
          </div>
        </div>

        <!-- Input / Send Area -->
        <div class="p-3 bg-white dark:bg-[#241D24] border-t border-[#6B3064]/5 dark:border-white/5 flex items-center gap-2">
          <textarea id="wa-input-msg" placeholder="Type a message..." rows="1"
            class="flex-1 bg-[#FDFBF7]/50 dark:bg-black/20 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#25D366] resize-none dark:text-gray-100 placeholder:text-gray-400"></textarea>
          <button id="wa-send-btn" class="bg-[#25D366] hover:bg-[#20ba59] text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0" aria-label="Send WhatsApp">
            <i data-lucide="send" class="w-4 h-4"></i>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(widgetContainer);

    // 4. Toggle Event Handlers
    const floatBtn = document.getElementById('wa-float-btn');
    const chatBox = document.getElementById('wa-chat-box');
    const closeBtn = document.getElementById('wa-close-btn');
    const sendBtn = document.getElementById('wa-send-btn');
    const inputMsg = document.getElementById('wa-input-msg');
    const badge = widgetContainer.querySelector('.whatsapp-chat-badge');

    if (floatBtn && chatBox) {
      floatBtn.addEventListener('click', () => {
        chatBox.classList.toggle('active');
        // Hide badge when opened
        if (badge) badge.style.display = 'none';
        
        // Focus the text area
        if (chatBox.classList.contains('active') && inputMsg) {
          setTimeout(() => inputMsg.focus(), 150);
        }
      });
    }

    if (closeBtn && chatBox) {
      closeBtn.addEventListener('click', () => {
        chatBox.classList.remove('active');
      });
    }

    // 5. Send logic
    function sendWhatsAppMessage() {
      const text = inputMsg.value.trim();
      if (!text) return;

      // South Africa phone number for Gemini Digital & Design
      const phoneNumber = '27721234567'; // Placeholder active number matching agency context
      const encodedMsg = encodeURIComponent(text);
      const url = `https://wa.me/${phoneNumber}?text=${encodedMsg}`;
      
      window.open(url, '_blank');
      
      // Reset input and close panel
      inputMsg.value = '';
      chatBox.classList.remove('active');
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', sendWhatsAppMessage);
    }

    if (inputMsg) {
      inputMsg.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendWhatsAppMessage();
        }
      });
    }

    // Refresh icons inside the dynamic HTML
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  });
})();
