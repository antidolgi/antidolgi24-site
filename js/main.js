/**
 * ========================================
 * MAIN.JS - Основной JavaScript файл
 * Для сайта АнтиДолги24
 * ========================================
 * 
 * Что делает этот файл:
 * 1. Управление мобильным меню
 * 2. Анимации при прокрутке
 * 3. Модальные окна
 * 4. Отправка форм в Telegram и на почту
 * 5. Счётчики статистики
 * 6. Плавная прокрутка к якорям
 */

// ========================================
// 1. ЖДЁМ ЗАГРУЗКИ СТРАНИЦЫ
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initScrollAnimations();
    initModals();
    initCounters();
    initSmoothScroll();
    initFormHandler();
    initHeaderScroll();
});

// ========================================
// 2. МОБИЛЬНОЕ МЕНЮ (Гамбургер)
// ========================================
function initMobileMenu() {
    const burger = document.getElementById('burger');
    const nav = document.getElementById('nav');
    
    if (!burger || !nav) return;
    
    burger.addEventListener('click', function() {
        // Переключаем класс active для анимации гамбургера
        this.classList.toggle('active');
        
        // Показываем/скрываем меню
        // На мобильных меню будет выпадать снизу
        if (nav.style.display === 'block') {
            nav.style.display = '';
        } else {
            nav.style.display = 'block';
            nav.style.position = 'absolute';
            nav.style.top = '100%';
            nav.style.left = '0';
            nav.style.right = '0';
            nav.style.background = '#fff';
            nav.style.padding = '20px';
            nav.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }
    });
    
    // Закрываем меню при клике на ссылку
    nav.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', function() {
            burger.classList.remove('active');
            nav.style.display = '';
        });
    });
}

// ========================================
// 3. АНИМАЦИИ ПРИ ПРОКРУТКЕ (Intersection Observer)
// ========================================
function initScrollAnimations() {
    // Проверяем поддержку Intersection Observer (есть во всех современных браузерах)
    if (!('IntersectionObserver' in window)) {
        // Если не поддерживается - просто показываем все элементы
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.add('animate');
        });
        return;
    }
    
    // Создаём наблюдатель
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Если элемент появился в области видимости
            if (entry.isIntersecting) {
                // Добавляем класс для запуска анимации
                entry.target.classList.add('animate');
                // Перестаём наблюдать за элементом (анимация только один раз)
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Срабатывает, когда видно 10% элемента
        rootMargin: '0px 0px -50px 0px' // Небольшой отступ снизу
    });
    
    // Наблюдаем за всеми элементами с data-animate
    document.querySelectorAll('[data-animate]').forEach(el => {
        // Добавляем задержку, если указана в data-delay
        const delay = el.dataset.delay;
        if (delay) {
            el.style.transitionDelay = delay;
        }
        observer.observe(el);
    });
}

// ========================================
// 4. МОДАЛЬНЫЕ ОКНА
// ========================================
// Глобальная функция для открытия модального окна (вызывается из HTML onclick)
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        // Блокируем прокрутку фона
        document.body.style.overflow = 'hidden';
        // Фокус на первое поле формы
        const firstInput = modal.querySelector('input');
        if (firstInput) firstInput.focus();
    }
};

// Глобальная функция для закрытия модального окна
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Возвращаем прокрутку
        document.body.style.overflow = '';
    }
};

function initModals() {
    // Закрытие по клавише Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    });
    
    // Закрытие по клику на оверлей
    document.querySelectorAll('.modal__overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
}

// ========================================
// 5. СЧЁТЧИКИ СТАТИСТИКИ (анимация чисел)
// ========================================
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    
    // Проверяем поддержку Intersection Observer
    if (!('IntersectionObserver' in window)) {
        // Если нет - просто показываем финальные значения
        counters.forEach(counter => {
            counter.textContent = counter.dataset.count;
        });
        return;
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000; // 2 секунды
    const step = target / (duration / 16); // ~60 FPS
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target.toLocaleString('ru-RU');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current).toLocaleString('ru-RU');
        }
    }, 16);
}

// ========================================
// 6. ПЛАВНАЯ ПРОКРУТКА К ЯКОРЯМ
// ========================================
function initSmoothScroll() {
    // Для ссылок с # в начале
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Если это не просто #, а якорь на странице
            if (href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    // Прокручиваем с учётом высоты фиксированного хедера
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ========================================
// 7. ОБРАБОТКА ФОРМ (Telegram + Почта)
// ========================================
function initFormHandler() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', async function(e) {
            e.preventDefault(); // Останавливаем стандартную отправку
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            try {
                // Показываем состояние загрузки
                submitBtn.disabled = true;
                submitBtn.innerHTML = 'Отправка...';
                
                // Собираем данные формы
                const formData = new FormData(this);
                const data = Object.fromEntries(formData.entries());
                
                // Добавляем служебные данные
                data.timestamp = new Date().toLocaleString('ru-RU');
                data.page = window.location.href;
                
                // === ОТПРАВКА В TELEGRAM ===
                // Для этого нужно создать бота в @BotFather и получить токен
                // И добавить бота в чат, куда будут приходить заявки
                await sendToTelegram(data);
                
                // === ОТПРАВКА НА ПОЧТУ ===
                // Вариант 1: Через Formspree (бесплатно до 50 заявок/месяц)
                // await sendToEmail(data);
                
                // Вариант 2: Через EmailJS (бесплатно до 200 заявок/месяц)
                // await sendViaEmailJS(data);
                
                // Показываем успех
                showSuccessMessage(this);
                
            } catch (error) {
                console.error('Ошибка отправки формы:', error);
                showErrorMessage(this, 'Не удалось отправить заявку. Попробуйте позвонить нам.');
            } finally {
                // Возвращаем кнопку в исходное состояние
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    });
}

/**
 * Отправка данных в Telegram
 * 
 * ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:
 * 1. Откройте @BotFather в Telegram
 * 2. Отправьте команду /newbot
 * 3. Придумайте имя и юзернейм для бота (должен заканчиваться на bot)
 * 4. Скопируйте полученный токен (выглядит как: 123456789:AAHdA...xyz)
 * 5. Откройте созданного бота, нажмите Start
 * 6. Узнайте свой chat_id через @userinfobot или @getmyid_bot
 * 7. Вставьте токен и chat_id ниже
 */
async function sendToTelegram(data) {
    // ⚠️ ВНИМАНИЕ: В реальном проекте не храните токен в открытом JS-коде!
    // Для продакшена используйте серверный прокси (Cloudflare Workers, Vercel Functions)
    
    const BOT_TOKEN = 'ВАШ_ТОКЕН_БОТА'; // Замените на реальный токен
    const CHAT_ID = 'ВАШ_CHAT_ID';      // Замените на реальный chat_id
    
    if (BOT_TOKEN === 'ВАШ_ТОКЕН_БОТА') {
        console.warn('Telegram токен не настроен. Заявка не отправлена.');
        return;
    }
    
    // Формируем красивое сообщение
    const message = `
🔔 <b>Новая заявка с сайта АнтиДолги24</b>

👤 <b>Имя:</b> ${data.name || 'Не указано'}
📱 <b>Телефон:</b> ${data.phone || 'Не указано'}
💰 <b>Сумма долга:</b> ${data.debt || 'Не указано'}
📍 <b>Город:</b> ${data.city || 'Не указано'}
💬 <b>Сообщение:</b> ${data.message || 'Не указано'}

🕐 <b>Время:</b> ${data.timestamp}
🔗 <b>Страница:</b> ${data.page}
    `.trim();
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true
        })
    });
    
    if (!response.ok) {
        throw new Error(`Telegram API error: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Отправка на почту через Formspree (альтернатива)
 * Регистрация: https://formspree.io/
 */
async function sendToEmail(data) {
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/ВАШ_ID_ФОРМЫ';
    
    if (FORMSPREE_ENDPOINT.includes('ВАШ_ID_ФОРМЫ')) {
        console.warn('Formspree не настроен');
        return;
    }
    
    const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error('Formspree error');
    }
    
    return await response.json();
}

/**
 * Показ сообщения об успехе
 */
function showSuccessMessage(form) {
    // Создаём элемент сообщения
    const successMsg = document.createElement('div');
    successMsg.className = 'form__success';
    successMsg.style.cssText = `
        background: #d4edda;
        color: #155724;
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
        text-align: center;
        border: 1px solid #c3e6cb;
    `;
    successMsg.innerHTML = `
        <strong>✓ Заявка отправлена!</strong><br>
        Мы свяжемся с вами в ближайшее время.
    `;
    
    // Очищаем форму и добавляем сообщение
    form.reset();
    form.appendChild(successMsg);
    
    // Убираем сообщение через 5 секунд
    setTimeout(() => {
        successMsg.remove();
    }, 5000);
}

/**
 * Показ сообщения об ошибке
 */
function showErrorMessage(form, text) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'form__error';
    errorMsg.style.cssText = `
        background: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
        text-align: center;
        border: 1px solid #f5c6cb;
    `;
    errorMsg.textContent = text;
    
    form.appendChild(errorMsg);
    
    setTimeout(() => {
        errorMsg.remove();
    }, 5000);
}
// ========================================
// COOKIE BANNER (152-ФЗ)
// ========================================
function initCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    
    if (!banner || !acceptBtn) return;
    
    // Проверяем, принимал ли пользователь уже
    if (localStorage.getItem('cookieConsent')) {
        banner.style.display = 'none';
        return;
    }
    
    // Показываем баннер с задержкой
    setTimeout(() => {
        banner.classList.add('show');
    }, 2000);
    
    // Обработка клика "Принять"
    acceptBtn.addEventListener('click', function() {
        // Сохраняем согласие
        localStorage.setItem('cookieConsent', 'true');
        localStorage.setItem('cookieConsentDate', new Date().toISOString());
        
        // Скрываем баннер
        banner.classList.remove('show');
        setTimeout(() => {
            banner.style.display = 'none';
        }, 300);
        
        // Инициализируем аналитику только после согласия
        if (typeof initAnalytics === 'function') {
            initAnalytics();
        }
    });
}

// Функция инициализации Яндекс.Метрики (вызывается только после согласия)
function initAnalytics() {
    // Вставь сюда код Яндекс.Метрики, если есть
    // Пример:
    /*
    (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        // ... код Метрики
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    ym(YOUR_COUNTER_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
    */
    console.log('✅ Аналитика инициализирована');
}

// Вызываем при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // ... другие функции ...
    initCookieBanner();
});

// ========================================
// 8. ЭФФЕКТ ХЕДЕРА ПРИ ПРОКРУТКЕ
// ========================================
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        // Добавляем тень при прокрутке
        if (currentScroll > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

// ========================================
// УТИЛИТЫ
// ========================================

/**
 * Проверка валидации телефона (простая)
 */
function validatePhone(phone) {
    // Удаляем всё кроме цифр и +
    const cleaned = phone.replace(/[^\d+]/g, '');
    // Проверяем длину (российские номера: +7 и 10 цифр)
    return /^(\+7|8)?\d{10}$/.test(cleaned);
}
// ========================================
// ОБРАТНЫЙ ОТСЧЁТ (COUNTDOWN TIMER)
// ========================================
function initCountdown() {
    const countdownElement = document.getElementById('countdownTimer');
    if (!countdownElement) return;
    
    // Устанавливаем дату окончания акции (14 дней от сегодня)
    // Можно изменить на конкретную дату: new Date('2026-04-29T23:59:59')
    const endDate = getEndDate();
    
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = endDate - now;
        
        // Если время вышло
        if (distance < 0) {
            // Показываем сообщение об окончании
            countdownElement.innerHTML = `
                <div style="color: #e53e3e; font-weight: 600; font-size: 1.2rem;">
                    ⏰ Акция завершена
                </div>
            `;
            document.querySelector('.countdown-banner').classList.add('urgent');
            return;
        }
        
        // Вычисляем дни, часы, минуты, секунды
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Обновляем DOM
        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
        
        // Если остаётся меньше 3 дней — делаем красным (срочно!)
        if (days < 3) {
            document.querySelector('.countdown-banner').classList.add('urgent');
        }
    }
    
    // Обновляем каждую секунду
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// Функция для расчёта даты окончания (14 дней от сегодня)
function getEndDate() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14); // 14 дней
    endDate.setHours(23, 59, 59, 999); // До конца дня
    return endDate.getTime();
    
    // АЛЬТЕРНАТИВА: конкретная дата
    // return new Date('2024-02-01T23:59:59').getTime();
}

// Вызываем при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // ... другие функции ...
    initCountdown();
});

/**
 * Форматирование телефона в реальном времени
 */
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.startsWith('8')) value = value.slice(1);
    if (value.startsWith('7')) value = value.slice(1);
    
    let formatted = '+7 ';
    if (value.length > 0) formatted += '(' + value.slice(0, 3);
    if (value.length >= 3) formatted += ') ' + value.slice(3, 6);
    if (value.length >= 6) formatted += '-' + value.slice(6, 8);
    if (value.length >= 8) formatted += '-' + value.slice(8, 10);
    
    input.value = formatted;
}

// Экспортируем функции для глобального доступа
window.formatPhone = formatPhone;
