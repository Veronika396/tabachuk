(() => {
  'use strict';

  /* ============================================================
     0. ТЕМА (темна за замовчуванням, перемикач на світлу)
     ============================================================ */
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'tabachuk-theme';

  function applyTheme(theme){
    if(theme === 'light'){ root.setAttribute('data-theme','light'); }
    else{ root.removeAttribute('data-theme'); }
  }

  let savedTheme = null;
  try{ savedTheme = localStorage.getItem(STORAGE_KEY); }catch(e){ /* storage unavailable */ }
  applyTheme(savedTheme === 'light' ? 'light' : 'dark');

  themeToggle && themeToggle.addEventListener('click', () => {
    const isLight = root.getAttribute('data-theme') === 'light';
    const next = isLight ? 'dark' : 'light';
    applyTheme(next);
    try{ localStorage.setItem(STORAGE_KEY, next); }catch(e){}
  });

  /* ============================================================
     1. ЕКРАН ЗАВАНТАЖЕННЯ
     ============================================================ */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader && loader.classList.add('is-hidden');
      document.body.classList.add('is-loaded');
    }, 650);
  });
  // запобіжник: якщо load довго не настає
  setTimeout(() => { loader && loader.classList.add('is-hidden'); }, 3500);

  /* ============================================================
     2. КАСТОМНИЙ КУРСОР
     ============================================================ */
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  let cursorEnabled = window.matchMedia('(hover:hover) and (pointer:fine)').matches;

  if(cursorEnabled && dot && ring){
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      document.body.classList.add('cursor-active');
    }, { passive:true });

    function animateRing(){
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const hoverTargets = 'a, button, input, textarea, select, .faq-item__q, .service-card, .case-card, .problem-card';
    document.addEventListener('mouseover', (e) => {
      if(e.target.closest(hoverTargets)){ ring.classList.add('is-hover'); }
    });
    document.addEventListener('mouseout', (e) => {
      if(e.target.closest(hoverTargets)){ ring.classList.remove('is-hover'); }
    });
    document.addEventListener('mouseleave', () => { document.body.classList.remove('cursor-active'); });
  }

  /* ============================================================
     3. ХЕДЕР: фон при скролі + прогрес-бар + активний пункт меню
     ============================================================ */
  const header = document.getElementById('siteHeader');
  const progress = document.getElementById('scrollProgress');
  const sections = document.querySelectorAll('main .section, .hero');
  const navLinks = document.querySelectorAll('.main-nav__link');

  function onScroll(){
    const y = window.scrollY;
    if(header){ header.classList.toggle('is-scrolled', y > 40); }

    if(progress){
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (y / docH) * 100 : 0;
      progress.style.width = pct + '%';
    }

    let current = '';
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if(rect.top <= 140 && rect.bottom >= 140){ current = sec.id; }
    });
    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ============================================================
     4. БУРГЕР / МОБІЛЬНЕ МЕНЮ
     ============================================================ */
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobileNav');

  function closeMobileNav(){
    burger && burger.classList.remove('is-open');
    mobileNav && mobileNav.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  burger && burger.addEventListener('click', () => {
    const willOpen = !mobileNav.classList.contains('is-open');
    burger.classList.toggle('is-open', willOpen);
    mobileNav.classList.toggle('is-open', willOpen);
    document.body.style.overflow = willOpen ? 'hidden' : '';
  });

  mobileNav && mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMobileNav);
  });

  /* ============================================================
     5. SCROLL REVEAL АНІМАЦІЇ
     ============================================================ */
  const revealEls = document.querySelectorAll('.reveal, .process-step');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.05, rootMargin:'0px 0px -2% 0px' });

    revealEls.forEach((el, i) => {
      // невеликий ступінчастий delay для елементів що йдуть групами
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + 'ms';
      io.observe(el);
    });

    // запасний механізм: елементи, що вже у вʼюпорті при завантаженні
    // (або потрапляють в останню секцію, де бракує простору для тригера) —
    // примусово показуємо ті, що практично у видимій зоні
    function forceShowInViewport(){
      const vh = window.innerHeight;
      revealEls.forEach(el => {
        if(el.classList.contains('is-visible')) return;
        const r = el.getBoundingClientRect();
        if(r.top < vh && r.bottom > 0){
          el.classList.add('is-visible');
        }
      });
    }
    window.addEventListener('load', forceShowInViewport);
    window.addEventListener('resize', forceShowInViewport, { passive:true });
    window.addEventListener('scroll', forceShowInViewport, { passive:true });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ============================================================
     6. ФОТО ГЕРОЯ — перевірка завантаження / fallback
     ============================================================ */
  const heroPhoto = document.getElementById('heroPhoto');
  if(heroPhoto){
    heroPhoto.addEventListener('load', () => {
      if(heroPhoto.naturalWidth > 0){ heroPhoto.classList.add('has-loaded'); }
    });
    heroPhoto.addEventListener('error', () => {
      heroPhoto.style.display = 'none';
    });
    if(heroPhoto.complete && heroPhoto.naturalWidth > 0){
      heroPhoto.classList.add('has-loaded');
    }
  }

  /* ============================================================
     7. FAQ АКОРДЕОН
     ============================================================ */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-item__q');
    const a = item.querySelector('.faq-item__a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item.is-open').forEach(openItem => {
        if(openItem !== item){
          openItem.classList.remove('is-open');
          openItem.querySelector('.faq-item__a').style.maxHeight = null;
        }
      });
      if(isOpen){
        item.classList.remove('is-open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ============================================================
     8. ФОРМА ЗАПИСУ
     ============================================================ */
  const form = document.getElementById('bookingForm');
  const formSuccess = document.getElementById('formSuccess');

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!form.checkValidity()){ form.reportValidity(); return; }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Надсилаємо…</span>';

    // Імітація відправки (тут можна підʼєднати реальний бекенд / formspree / телеграм-бот)
    setTimeout(() => {
      formSuccess.classList.add('is-visible');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      setTimeout(() => { formSuccess.classList.remove('is-visible'); }, 4500);
    }, 700);
  });

  /* ============================================================
     9. ПОТОЧНИЙ РІК У ФУТЕРІ
     ============================================================ */
  const yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  /* ============================================================
     10. ПЛАВНА АНІМАЦІЯ "НОМЕРА СПРАВИ" В HERO (декоративна)
     ============================================================ */
  const caseNum = document.getElementById('caseNum');
  if(caseNum){
    const year = new Date().getFullYear();
    caseNum.textContent = year + '‑ВП';
  }

})();