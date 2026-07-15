document.addEventListener('DOMContentLoaded', () => {
  // Create the button element
  const scrollToTopBtn = document.createElement('button');
  scrollToTopBtn.innerHTML = '<i data-lucide="arrow-up" class="w-5 h-5 text-white"></i>';
  scrollToTopBtn.className = 'fixed bottom-6 right-6 z-40 bg-primary p-3 rounded-full shadow-[0_4px_14px_rgba(217,20,89,0.4)] opacity-0 pointer-events-none transform translate-y-4 transition-all duration-300 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center';
  scrollToTopBtn.setAttribute('aria-label', 'Scroll to top');
  
  // Append to body
  document.body.appendChild(scrollToTopBtn);
  
  // Render the Lucide icon
  if (typeof lucide !== 'undefined') {
    lucide.createIcons({
      nameAttr: 'data-lucide'
    });
  }

  // Toggle visibility on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
      scrollToTopBtn.classList.add('opacity-100', 'translate-y-0');
    } else {
      scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
      scrollToTopBtn.classList.remove('opacity-100', 'translate-y-0');
    }
  });

  // Scroll back to top on click
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});
