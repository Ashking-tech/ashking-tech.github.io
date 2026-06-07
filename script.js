document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.project-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 400ms ease, transform 400ms ease';
    observer.observe(card);
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const sakuraContainer = document.getElementById('sakura');
  const petalCount = 20;
  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    const size = 8 + Math.random() * 12;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = 8 + Math.random() * 12;
    const hueShift = Math.random() * 30 - 15;
    petal.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size * 0.7}px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      filter: blur(${0.5 + Math.random() * 2}px) hue-rotate(${hueShift}deg);
      opacity: ${0.1 + Math.random() * 0.2};
    `;
    sakuraContainer.appendChild(petal);
  }

  const modal = document.getElementById('resume-modal');
  const trigger = document.getElementById('resume-trigger');
  const closeBtn = document.getElementById('modal-close');

  function openModal() {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });
});
