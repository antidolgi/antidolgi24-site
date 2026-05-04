// assets/js/main.js

document.addEventListener('DOMContentLoaded', () => {
  // === Прелоадер ===
  const preloader = document.getElementById('preloader');
  const preloaderText = document.querySelector('.preloader-text');
  const scalesSVG = document.querySelector('.preloader-scales svg');

  // Анимация весов: чаши раскачиваются и приходят в равновесие
  const tlPreloader = gsap.timeline({
    onComplete: () => {
      gsap.to(preloader, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => {
          preloader.style.display = 'none';
        }
      });
    }
  });

  tlPreloader
    .from(scalesSVG.querySelectorAll('line, path, circle'), {
      opacity: 0,
      strokeDasharray: 200,
      strokeDashoffset: 200,
      duration: 1,
      stagger: 0.1,
      ease: 'power2.inOut'
    })
    .to('.preloader-text', {
      opacity: 1,
      duration: 0.5,
      y: -10
    }, '-=0.3')
    .to('.preloader-scales', {
      rotate: -4,
      duration: 0.8,
      yoyo: true,
      repeat: 1,
      transformOrigin: '50% 35%',
      ease: 'sine.inOut'
    })
    .to('.preloader-scales', {
      rotate: 0,
      duration: 0.6,
      ease: 'elastic.out(1, 0.5)'
    });

  // === Кастомный курсор ===
  const cursor = document.querySelector('.cursor');
  const cursorTrail = document.querySelector('.cursor-trail');

  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.1
      });
      gsap.to(cursorTrail, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.4
      });
    });

    // Эффект при наведении на ссылки/кнопки
    const hoverElements = document.querySelectorAll('a, button, .service-card, .accordion-header, input, select, .logo');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
  } else {
    cursor.style.display = 'none';
    cursorTrail.style.display = 'none';
  }

  // === Частицы (tsParticles) ===
  tsParticles.load("particles-js", {
    fullScreen: { enable: false },
    fpsLimit: 60,
    particles: {
      number: { value: 60, density: { enable: true, value_area: 800 } },
      color: { value: "#CBA468" },
      shape: { type: "circle" },
      opacity: { value: 0.4, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.1 } },
      size: { value: 2, random: true, anim: { enable: true, speed: 1, size_min: 0.5 } },
      move: { enable: true, speed: 0.6, direction: "top", random: true, straight: false, outModes: { default: "out" } },
      line_linked: { enable: false }
    },
    detectRetina: true
  }).catch(console.error);

  // Мобильным отключаем частицы (в CSS уже скрыто, но можно выгрузить)
  if (window.matchMedia('(max-width: 768px)').matches) {
    tsParticles.domItem(0)?.destroy();
  }

  // === Хедер: прозрачность при скролле ===
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // === Мобильное меню ===
  const burger = document.querySelector('.burger');
  const navList = document.querySelector('.nav__list');
  if (burger) {
    burger.addEventListener('click', () => {
      navList.style.display = navList.style.display === 'flex' ? 'none' : 'flex';
      burger.classList.toggle('active');
    });
    // Закрыть меню по клику на ссылку
    navList.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navList.style.display = 'none';
        burger.classList.remove('active');
      });
    });
  }

  // === Splitting.js анимация заголовка ===
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    Splitting({ target: heroTitle, by: 'words' });
    gsap.from(heroTitle.querySelectorAll('.word'), {
      opacity: 0,
      y: 30,
      stagger: 0.08,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.5 // после прелоадера
    });
  }

  // === Tilt на карточках услуг (только не мобильные) ===
  if (window.matchMedia('(min-width: 769px)').matches) {
    VanillaTilt.init(document.querySelectorAll('.service-card'), {
      max: 8,
      speed: 400,
      glare: false,
      'max-glare': 0.2,
      scale: 1.02
    });
  }

  // === Анимация появления секций при скролле ===
  gsap.utils.toArray('.section').forEach(section => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: 'power2.out'
    });
  });

  // === Таймлайн: линия прогресса и появление шагов ===
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    // Создаём элемент линии прогресса
    const progressLine = document.createElement('div');
    progressLine.classList.add('timeline__progress-line');
    progressLine.style.cssText = `
      position: absolute;
      left: 50%;
      top: 0;
      transform: translateX(-50%);
      width: 2px;
      height: 0;
      background: #CBA468;
      z-index: 0;
    `;
    timeline.prepend(progressLine);

    // Анимируем высоту линии по мере скролла
    gsap.to(progressLine, {
      scrollTrigger: {
        trigger: timeline,
        start: 'top 70%',
        end: 'bottom 70%',
        scrub: 0.5
      },
      height: '100%',
      ease: 'none'
    });

    // Появление элементов таймлайна
    const items = timeline.querySelectorAll('.timeline__item');
    items.forEach((item, i) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        x: i % 2 === 0 ? -30 : 30,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  }

  // === Аккордеон FAQ ===
  document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling;
      const isActive = body.classList.contains('active');

      // Закрываем все
      document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('active'));

      if (!isActive) {
        body.classList.add('active');
      }
    });
  });

  // === Калькулятор стоимости ===
  const debtorType = document.getElementById('debtorType');
  const calcFields = document.getElementById('calcFields');
  const debtSumInput = document.getElementById('debtSum');
  const hasPropertyCheck = document.getElementById('hasProperty');
  const calcBtn = document.getElementById('calcBtn');
  const calcResult = document.getElementById('calcResult');

  debtorType.addEventListener('change', () => {
    if (debtorType.value === 'legal') {
      calcFields.style.display = 'none';
      calcResult.innerHTML = 'Для юридических лиц расчёт индивидуален. <br> Позвоните: <a href="tel:89957886668">8 995 788-66-68</a>';
      calcResult.style.display = 'block';
    } else {
      calcFields.style.display = 'block';
      calcResult.innerHTML = '';
      calcResult.style.display = 'none';
    }
  });

  calcBtn.addEventListener('click', () => {
    const type = debtorType.value;
    if (type === 'legal') {
      calcResult.innerHTML = 'Для юридических лиц расчёт индивидуален. <br> Позвоните: <a href="tel:89957886668">8 995 788-66-68</a>';
      calcResult.style.display = 'block';
      return;
    }

    const debt = parseFloat(debtSumInput.value);
    if (isNaN(debt) || debt <= 0) {
      calcResult.innerHTML = 'Введите корректную сумму долга.';
      calcResult.style.display = 'block';
      return;
    }

    const hasProp = hasPropertyCheck.checked;
    let workCostMin, workCostMax;

    if (debt <= 1500000) {
      workCostMin = 75000;
      workCostMax = 150000;
    } else if (debt <= 5000000) {
      workCostMin = 100000;
      workCostMax = 250000;
    } else {
      workCostMin = 'индивидуально';
      workCostMax = 'индивидуально';
    }

    if (hasProp && typeof workCostMin === 'number') {
      // Допустим, сохранение имущества увеличивает стоимость на 20%
      workCostMin = Math.round(workCostMin * 1.2);
      workCostMax = Math.round(workCostMax * 1.2);
    } else if (hasProp && workCostMin === 'индивидуально') {
      // при крупных долгах + имущество — тоже индивидуально
    }

    const deposit = '25 000 – 50 000 ₽';
    const postalExpenses = '20 000 – 40 000 ₽';

    let resultHTML = '';
    resultHTML += `<p><strong>Стоимость работ:</strong> ${typeof workCostMin === 'number' ? `от ${workCostMin.toLocaleString()} до ${workCostMax.toLocaleString()} ₽` : 'рассчитывается индивидуально'}</p>`;
    resultHTML += `<p><strong>Депозит суда:</strong> ${deposit}</p>`;
    resultHTML += `<p><strong>Почтовые и иные расходы:</strong> ${postalExpenses}</p>`;
    if (hasProp) {
      resultHTML += `<p><em>Наличие имущества учтено. Точная стоимость после консультации.</em></p>`;
    }
    if (debt > 5000000) {
      resultHTML += `<p>Для точного расчёта свяжитесь с нами: <a href="tel:89957886668">8 995 788-66-68</a></p>`;
    }
    calcResult.innerHTML = resultHTML;
    calcResult.style.display = 'block';
  });

  // === Плавный скролл для якорных ссылок (учитываем фиксированный хедер) ===
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        const headerHeight = header.offsetHeight;
        const yOffset = -headerHeight - 10;
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });

});
