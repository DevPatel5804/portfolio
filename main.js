document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. LENIS SMOOTH SCROLLING
  // ==========================================
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Synchronize Lenis with GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // GSAP Scroll Reveals (Sections)
    const sections = gsap.utils.toArray('.section');
    sections.forEach(section => {
      gsap.fromTo(section,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // GSAP Editorial Project Card Reveals
    const projectCards = gsap.utils.toArray('.project-card');
    projectCards.forEach(card => {
      gsap.fromTo(card,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power4.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }

    // ==========================================
    // 2. WEBGL / CANVAS INTERACTIVE BACKGROUND
    // ==========================================
    const canvas = document.getElementById('webgl-bg');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let width = canvas.width = window.innerWidth;
      let height = canvas.height = window.innerHeight;
      let particles = [];

      const mouse = { x: null, y: null, radius: 150 };

      window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
      });

      window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initParticles();
      });

      class Particle {
        constructor(x, y, dx, dy, size) {
          this.x = x;
          this.y = y;
          this.dx = dx;
          this.dy = dy;
          this.size = size;
          this.baseX = this.x;
          this.baseY = this.y;
          this.density = (Math.random() * 30) + 1;
        }
        draw() {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.closePath();
          ctx.fill();
        }
        update() {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          let forceDirectionX = dx / distance;
          let forceDirectionY = dy / distance;
          let maxDistance = mouse.radius;
          let force = (maxDistance - distance) / maxDistance;
          let directionX = forceDirectionX * force * this.density;
          let directionY = forceDirectionY * force * this.density;

          if (distance < mouse.radius) {
            this.x -= directionX;
            this.y -= directionY;
          } else {
            if (this.x !== this.baseX) {
              let dx = this.x - this.baseX;
              this.x -= dx / 10;
            }
            if (this.y !== this.baseY) {
              let dy = this.y - this.baseY;
              this.y -= dy / 10;
            }
          }
          this.draw();
        }
      }

      function initParticles() {
        particles = [];
        let numberOfParticles = (canvas.width * canvas.height) / 15000;
        for (let i = 0; i < numberOfParticles; i++) {
          let size = (Math.random() * 2) + 1;
          let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
          let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
          let dx = (Math.random() * 0.4) - 0.2;
          let dy = (Math.random() * 0.4) - 0.2;
          particles.push(new Particle(x, y, dx, dy, size));
        }
      }

      function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for (let i = 0; i < particles.length; i++) {
          particles[i].update();
        }
      }

      initParticles();
      animateParticles();
    }

  // ==========================================
  // 3. COMMAND PALETTE (⌘K)
  // ==========================================
  const paletteOverlay = document.getElementById('commandPalette');
  const paletteInput = document.getElementById('commandInput');
  const paletteClose = document.getElementById('commandClose');
  const paletteItems = document.querySelectorAll('.command-item');

  if (paletteOverlay) {
    // Toggle Palette
    const togglePalette = () => {
      paletteOverlay.classList.toggle('active');
      if (paletteOverlay.classList.contains('active')) {
        setTimeout(() => paletteInput.focus(), 50);
        document.body.style.overflow = 'hidden'; // Stop scrolling
      } else {
        document.body.style.overflow = '';
      }
    };

    // Keyboard shortcut (Cmd+K or Ctrl+K)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === 'Escape' && paletteOverlay.classList.contains('active')) {
        togglePalette();
      }
    });

    // Close button
    if (paletteClose) {
      paletteClose.addEventListener('click', togglePalette);
    }

    // Close on clicking outside
    paletteOverlay.addEventListener('click', (e) => {
      if (e.target === paletteOverlay) {
        togglePalette();
      }
    });

    // Filtering logic
    if (paletteInput) {
      paletteInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        paletteItems.forEach(item => {
          const text = item.textContent.toLowerCase();
          if (text.includes(query)) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
        });
      });
    }

    // Handle Item clicks
    paletteItems.forEach(item => {
      item.addEventListener('click', () => {
        togglePalette();
      });
    });
  }

  // ==========================================
  // 4. MAGNETIC BUTTONS
  // ==========================================
  const magneticElements = document.querySelectorAll('.btn, .nav-logo, .footer-social-link, .nav-link, .tech-card');
  magneticElements.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const position = el.getBoundingClientRect();
      const x = e.clientX - position.left - position.width / 2;
      const y = e.clientY - position.top - position.height / 2;

      gsap.to(el, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.5,
        ease: "power3.out",
        overwrite: true
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 1.2,
        ease: "elastic.out(1, 0.3)",
        overwrite: true
      });
    });
  });

  // ==========================================
  // 5. THEME SWITCHER LOGIC
  // ==========================================
  const themeToggleBtn = document.querySelector('.theme-btn');
  const themeToggleContainer = document.getElementById('themeToggle');
  const themeOptions = document.querySelectorAll('.theme-option');

  if (themeToggleBtn && themeToggleContainer) {
    // Toggle dropdown
    themeToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      themeToggleContainer.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!themeToggleContainer.contains(e.target)) {
        themeToggleContainer.classList.remove('open');
      }
    });

    // Function to apply theme
    function applyTheme(theme) {
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }

      // Update active option UI
      themeOptions.forEach(opt => {
        if (opt.getAttribute('data-value') === theme) {
          opt.classList.add('active');
        } else {
          opt.classList.remove('active');
        }
      });
    }

    // Load saved theme or default to system
    const savedTheme = localStorage.getItem('portfolio-theme') || 'system';
    applyTheme(savedTheme);

    // Handle Option clicks
    themeOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const selectedTheme = e.target.getAttribute('data-value');
        localStorage.setItem('portfolio-theme', selectedTheme);
        applyTheme(selectedTheme);
        themeToggleContainer.classList.remove('open');
      });
    });

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (localStorage.getItem('portfolio-theme') === 'system') {
        applyTheme('system');
      }
    });
  }

});
