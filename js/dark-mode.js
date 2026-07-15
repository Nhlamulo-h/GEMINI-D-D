// Override native window.alert with a custom toast system
(function() {
  const style = document.createElement('style');
  style.innerHTML = `
    #custom-alert-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 420px;
      width: calc(100% - 3rem);
      pointer-events: none;
      font-family: 'Inter', sans-serif;
    }
    .custom-toast {
      background-color: hsl(var(--primary, 340 82% 52%));
      color: #ffffff;
      padding: 1rem;
      border-radius: 1rem;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
      transform: translateX(120%);
      opacity: 0;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
      pointer-events: auto;
      position: relative;
    }
    .custom-toast.show {
      transform: translateX(0);
      opacity: 1;
    }
    .custom-toast.hide {
      transform: translateY(-20px);
      opacity: 0;
    }
    .custom-toast-icon-wrapper {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.75rem;
      background-color: rgba(255, 255, 255, 0.2);
    }
    .custom-toast-content {
      flex-grow: 1;
      padding-right: 1.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 2.75rem;
    }
    .custom-toast-title {
      font-weight: 700;
      font-size: 0.9375rem;
      line-height: 1.25;
      color: #ffffff;
    }
    .custom-toast-message {
      font-size: 0.8125rem;
      line-height: 1.35;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 0.125rem;
    }
    .custom-toast-close {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.25rem;
      color: rgba(255, 255, 255, 0.8);
      transition: color 0.2s, background-color 0.2s;
      border-radius: 0.375rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .custom-toast-close:hover {
      color: #ffffff;
      background-color: rgba(255, 255, 255, 0.1);
    }
    @media (max-width: 640px) {
      #custom-alert-container {
        top: 1rem;
        right: 50%;
        transform: translateX(50%);
        width: calc(100% - 2rem);
        max-width: 100%;
      }
      .custom-toast {
        transform: translateY(-120%);
      }
      .custom-toast.show {
        transform: translateY(0);
      }
    }

    /* Confirm Modal CSS */
    .custom-confirm-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999999;
      background-color: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      opacity: 0;
      transition: opacity 0.3s ease;
      font-family: 'Inter', sans-serif;
      pointer-events: auto;
    }
    .custom-confirm-overlay.show {
      opacity: 1;
    }
    .custom-confirm-card {
      background-color: hsl(var(--primary, 340 82% 52%));
      color: #ffffff;
      padding: 1.25rem;
      border-radius: 1rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transform: scale(0.95);
      opacity: 0;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
    }
    .custom-confirm-card.show {
      transform: scale(1);
      opacity: 1;
    }
    .custom-confirm-header {
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
    }
    .custom-confirm-icon-wrapper {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.75rem;
      background-color: rgba(255, 255, 255, 0.2);
    }
    .custom-confirm-content {
      flex-grow: 1;
    }
    .custom-confirm-title {
      font-weight: 700;
      font-size: 0.9375rem;
      line-height: 1.25;
      color: #ffffff;
    }
    .custom-confirm-message {
      font-size: 0.8125rem;
      line-height: 1.35;
      color: rgba(255, 255, 255, 0.9);
      margin-top: 0.25rem;
    }
    .custom-confirm-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.625rem;
      margin-top: 0.5rem;
    }
    .custom-confirm-btn {
      padding: 0.5rem 1.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .custom-confirm-cancel {
      border: 1px solid rgba(255, 255, 255, 0.4);
      background: none;
      color: #ffffff;
    }
    .custom-confirm-cancel:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.6);
    }
    .custom-confirm-ok {
      background-color: #ffffff;
      color: hsl(var(--primary, 340 82% 52%));
      border: 1px solid #ffffff;
      font-weight: 700;
    }
    .custom-confirm-ok:hover {
      background-color: rgba(255, 255, 255, 0.9);
    }
  `;
  (document.head || document.documentElement).appendChild(style);

  window.alert = function(message) {
    let container = document.getElementById('custom-alert-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'custom-alert-container';
      document.body.appendChild(container);
    }

    let title = 'Notification';
    let iconSvg = '';
    const msgLower = message.toLowerCase();

    // Determine title & icon
    if (msgLower.includes('cart') || msgLower.includes('course added')) {
      title = 'Added to Cart';
      iconSvg = `<svg class="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 22px; height: 22px;"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`;
    } else if (msgLower.includes('copied')) {
      title = 'Copied to Clipboard';
      iconSvg = `<svg class="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 22px; height: 22px;"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>`;
    } else if (msgLower.includes('success') || msgLower.includes('saved') || msgLower.includes('completed') || msgLower.includes('uploaded') || msgLower.includes('updated') || msgLower.includes('clocked')) {
      title = 'Success';
      iconSvg = `<svg class="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 22px; height: 22px;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`;
    } else if (msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('invalid') || msgLower.includes('wrong') || msgLower.includes('cannot') || msgLower.includes('fill in') || msgLower.includes('provide') || msgLower.includes('empty') || msgLower.includes('declined') || msgLower.includes('please')) {
      title = 'Alert';
      iconSvg = `<svg class="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 22px; height: 22px;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
    } else {
      title = 'Notification';
      iconSvg = `<svg class="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 22px; height: 22px;"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `
      <div class="custom-toast-icon-wrapper">
        ${iconSvg}
      </div>
      <div class="custom-toast-content">
        <div class="custom-toast-title">${title}</div>
        <div class="custom-toast-message">${message}</div>
      </div>
      <button class="custom-toast-close" aria-label="Close">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" style="width: 16px; height: 16px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;
    toast.classList.add('show');

    const dismiss = () => {
      if (toast.classList.contains('hide')) return;
      toast.classList.remove('show');
      toast.classList.add('hide');
      toast.addEventListener('transitionend', () => {
        toast.remove();
      });
    };

    toast.querySelector('.custom-toast-close').addEventListener('click', dismiss);
    setTimeout(dismiss, 5000);
  };

  // Add global showConfirmModal
  window.showConfirmModal = function(message, onConfirm, onCancel) {
    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';
    
    let title = 'Confirm Action';
    let iconSvg = '';
    const msgLower = message.toLowerCase();

    if (msgLower.includes('delete') || msgLower.includes('remove') || msgLower.includes('clear')) {
      title = 'Delete Confirmation';
      iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px;"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`;
    } else if (msgLower.includes('cancel')) {
      title = 'Cancel Confirmation';
      iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px;"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else {
      title = 'Confirm Action';
      iconSvg = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px;"><path stroke-linecap="round" stroke-linejoin="round" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8v4" /></svg>`;
    }

    overlay.innerHTML = `
      <div class="custom-confirm-card">
        <div class="custom-confirm-header">
          <div class="custom-confirm-icon-wrapper">
            ${iconSvg}
          </div>
          <div class="custom-confirm-content">
            <div class="custom-confirm-title">${title}</div>
            <div class="custom-confirm-message">${message}</div>
          </div>
        </div>
        <div class="custom-confirm-buttons">
          <button class="custom-confirm-btn custom-confirm-cancel">Cancel</button>
          <button class="custom-confirm-btn custom-confirm-ok">Confirm</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    const card = overlay.querySelector('.custom-confirm-card');

    // Force reflow
    overlay.offsetHeight;
    overlay.classList.add('show');
    card.classList.add('show');

    let callbackCalled = false;
    const close = (confirmed) => {
      card.classList.remove('show');
      overlay.classList.remove('show');
      
      const finalize = () => {
        if (callbackCalled) return;
        callbackCalled = true;
        overlay.remove();
        if (confirmed && typeof onConfirm === 'function') {
          onConfirm();
        } else if (!confirmed && typeof onCancel === 'function') {
          onCancel();
        }
      };

      const timeoutId = setTimeout(finalize, 400);

      overlay.addEventListener('transitionend', () => {
        finalize();
        clearTimeout(timeoutId);
      });
    };

    overlay.querySelector('.custom-confirm-cancel').addEventListener('click', () => close(false));
    overlay.querySelector('.custom-confirm-ok').addEventListener('click', () => close(true));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close(false);
    });
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  // Check local storage or system preference
  if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
  } else {
      document.documentElement.classList.remove('dark');
  }

  // Set the correct icon on load
  function updateIcon() {
      if (!themeToggleBtn) return;
      const isDark = document.documentElement.classList.contains('dark');
      themeToggleBtn.innerHTML = isDark 
          ? '<i data-lucide="sun" class="w-5 h-5 text-gray-300 hover:text-white transition-colors"></i>' 
          : '<i data-lucide="moon" class="w-5 h-5 text-gray-600 hover:text-gray-900 transition-colors"></i>';
      lucide.createIcons();
  }
  
  updateIcon();

  if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', function() {
          // toggle icons inside button
          if (localStorage.getItem('color-theme')) {
              if (localStorage.getItem('color-theme') === 'light') {
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('color-theme', 'dark');
              } else {
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('color-theme', 'light');
              }
          // if NOT set via local storage previously
          } else {
              if (document.documentElement.classList.contains('dark')) {
                  document.documentElement.classList.remove('dark');
                  localStorage.setItem('color-theme', 'light');
              } else {
                  document.documentElement.classList.add('dark');
                  localStorage.setItem('color-theme', 'dark');
              }
          }
          updateIcon();
      });
  }
});
