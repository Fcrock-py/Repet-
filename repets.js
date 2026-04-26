var API = 'http://127.0.0.1:8000';

function readAndApplySessionFilters() {
    var subject = sessionStorage.getItem('selected_subject') || sessionStorage.getItem('apply_subject');
    var goal = sessionStorage.getItem('selected_goal') || sessionStorage.getItem('apply_goal');
    var city = sessionStorage.getItem('selected_city') || sessionStorage.getItem('apply_city');

    console.log('Читаем фильтры:', subject, goal, city);

    if (subject) {
        var subjectField = document.querySelector('.filter-input[data-filter="subject"]');
        if (subjectField) {
            subjectField.value = subject;
            filters.subject = subject;
        }
        sessionStorage.removeItem('selected_subject');
        sessionStorage.removeItem('apply_subject');
    }

    if (goal) {
        var goalField = document.querySelector('.filter-input[data-filter="goal"]');
        if (goalField) {
            goalField.value = goal;
            filters.goal = goal;
        }
        sessionStorage.removeItem('selected_goal');
        sessionStorage.removeItem('apply_goal');
    }

    if (city) {
        var cityBtn = document.querySelector('[data-dropdown="city"] .dropdown-toggle');
        if (cityBtn) {
            cityBtn.childNodes[0].textContent = city + ' ';
        }
        sessionStorage.removeItem('selected_city');
        sessionStorage.removeItem('apply_city');
    }
}

var profileBtn = document.getElementById('profileBtn');
var profileMenu = document.getElementById('profileMenu');
var favoritesActive = false;
var favoritedCards = new Set();

if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isVisible = profileMenu.classList.contains('profile-menu-visible');
        if (isVisible) {
            profileMenu.classList.remove('profile-menu-visible');
            setTimeout(function() {
                if (!profileMenu.classList.contains('profile-menu-visible')) {
                    profileMenu.style.display = 'none';
                }
            }, 200);
            profileBtn.classList.remove('profile-btn-active');
        } else {
            profileMenu.style.display = 'flex';
            requestAnimationFrame(function() {
                profileMenu.classList.add('profile-menu-visible');
            });
            profileBtn.classList.add('profile-btn-active');
        }
    });

    document.addEventListener('click', function(e) {
        if (!document.getElementById('profileDropdown').contains(e.target)) {
            profileMenu.classList.remove('profile-menu-visible');
            setTimeout(function() {
                if (!profileMenu.classList.contains('profile-menu-visible')) {
                    profileMenu.style.display = 'none';
                }
            }, 200);
            profileBtn.classList.remove('profile-btn-active');
        }
    });
}

var favoritesBtn = document.getElementById('favoritesBtn');
if (favoritesBtn) {
    favoritesBtn.addEventListener('click', function() {
        favoritesActive = !favoritesActive;
        profileMenu.classList.remove('profile-menu-visible');
        profileMenu.style.display = 'none';
        profileBtn.classList.remove('profile-btn-active');

        var list = document.querySelector('.tutors-list');
        var found = document.querySelector('.tutors-found');

        if (favoritesActive) {
            this.style.color = '#e05555';
            this.querySelector('svg').setAttribute('fill', '#e05555');
            this.querySelector('svg').setAttribute('stroke', '#e05555');

            var cards = list.querySelectorAll('.tutor-card-item');
            var visibleCount = 0;

            cards.forEach(function(card) {
                var favSvg = card.querySelector('.tutor-favorite svg');
                var isFav = favSvg && favSvg.getAttribute('fill') === '#e05555';
                if (isFav) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            if (found) found.textContent = 'Понравившихся репетиторов: ' + visibleCount;

            if (visibleCount === 0) {
                var empty = document.createElement('div');
                empty.classList.add('tutors-empty');
                empty.id = 'fav-empty';
                empty.textContent = 'Вы ещё не добавили репетиторов в избранное';
                list.appendChild(empty);
            }

        } else {
            this.style.color = '';
            this.querySelector('svg').setAttribute('fill', 'none');
            this.querySelector('svg').setAttribute('stroke', 'currentColor');

            var cards = list.querySelectorAll('.tutor-card-item');
            cards.forEach(function(card) {
                card.style.display = 'flex';
            });

            var empty = document.getElementById('fav-empty');
            if (empty) empty.remove();

            fetchTutors();
        }
    });
}

var applyBtn = document.getElementById('applyBtn');
if (applyBtn) {
    applyBtn.addEventListener('click', function() {
        sessionStorage.setItem('scroll_to_apply', '1');
        window.location.href = 'indexMain.html';
    });
}

var logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'Auth.html';
    });
}

var filters = {
    name: '',
    subject: '',
    price_from: null,
    price_to: null,
    schedule: '',
    experience: null,
    level: '',
    birth_year_from: null,
    birth_year_to: null,
    goal: ''
};

var filterDebounce = null;

function buildQueryString() {
    var params = [];
    if (filters.name) params.push('name=' + encodeURIComponent(filters.name));
    if (filters.subject) params.push('subject=' + encodeURIComponent(filters.subject));
    if (filters.price_from !== null) params.push('price_from=' + filters.price_from);
    if (filters.price_to !== null) params.push('price_to=' + filters.price_to);
    if (filters.schedule) params.push('schedule=' + encodeURIComponent(filters.schedule));
    if (filters.experience !== null) params.push('experience=' + filters.experience);
    if (filters.level) params.push('level=' + encodeURIComponent(filters.level));
    if (filters.birth_year_from !== null) params.push('birth_year_from=' + filters.birth_year_from);
    if (filters.birth_year_to !== null) params.push('birth_year_to=' + filters.birth_year_to);
    if (filters.goal) params.push('goal=' + encodeURIComponent(filters.goal));
    return params.join('&');
}

function getBadgeHTML(badge) {
    if (badge === 'leading') {
        return '<span class="badge badge-teal">Ведущий специалист</span><span class="badge badge-purple">Рекомендованный репетитор</span>';
    }
    if (badge === 'pro') {
        return '<span class="badge badge-blue">Профессионал</span><span class="badge badge-purple">Рекомендованный репетитор</span>';
    }
    return '';
}

function showBookingModal(tutorId, tutorName, requestType) {
    var token = localStorage.getItem('token');

    fetch(API + '/booking?tutor_id=' + tutorId + '&tutor_name=' + encodeURIComponent(tutorName) + '&request_type=' + encodeURIComponent(requestType), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? 'Bearer ' + token : ''
        }
    })
    .then(function(r) { return r.json(); })
    .catch(function(e) { console.error('Ошибка бронирования:', e); });

    var overlay = document.createElement('div');
    overlay.classList.add('booking-overlay');

    var isLesson = requestType === 'lesson';

    overlay.innerHTML = '\
        <div class="booking-modal">\
            <div class="booking-modal-icon">\
                ' + (isLesson
                    ? '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#77bfa4" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14l2 2 4-4"/></svg>'
                    : '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#5b6abf" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
                ) + '\
            </div>\
            <div class="booking-modal-title">' + (isLesson ? 'Заявка отправлена!' : 'Сообщение отправлено!') + '</div>\
            <div class="booking-modal-tutor">' + tutorName + '</div>\
            <div class="booking-modal-type ' + (isLesson ? 'type-lesson' : 'type-message') + '">\
                ' + (isLesson ? '📅 Пробный урок' : '💬 Сообщение репетитору') + '\
            </div>\
            <div class="booking-modal-text">\
                ' + (isLesson
                    ? 'Репетитор <strong>' + tutorName + '</strong> скоро с вами свяжется для согласования времени пробного урока!'
                    : 'Ваше сообщение получено. Репетитор <strong>' + tutorName + '</strong> ответит вам в ближайшее время!'
                ) + '\
            </div>\
            <button class="booking-modal-close">Отлично!</button>\
        </div>\
    ';

    document.body.appendChild(overlay);

    setTimeout(function() {
        overlay.classList.add('booking-visible');
    }, 10);

    overlay.querySelector('.booking-modal-close').addEventListener('click', function() {
        overlay.classList.remove('booking-visible');
        setTimeout(function() { overlay.remove(); }, 300);
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.classList.remove('booking-visible');
            setTimeout(function() { overlay.remove(); }, 300);
        }
    });
}

function loadMyBookings() {
    var user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return;

    fetch(API + '/booking?user_id=' + user.id, {
        headers: {
            'Authorization': 'Bearer ' + (localStorage.getItem('token') || '')
        }
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        console.log('Мои заявки:', data);
    });
}

function renderTutors(tutors) {
    var list = document.querySelector('.tutors-list');
    var found = document.querySelector('.tutors-found');

    if (!list) return;

    found.textContent = 'Найдено ' + tutors.length + ' репетитор(ов)';

    if (tutors.length === 0) {
        list.innerHTML = '<div class="tutors-empty">По вашему запросу репетиторы не найдены</div>';
        return;
    }

    list.innerHTML = '';

    tutors.forEach(function(t) {
        var card = document.createElement('div');
        card.classList.add('tutor-card-item');
        
        var imgHTML = t.image_url
            ? '<img src="' + t.image_url + '" class="tutor-card-img" alt="' + t.name + '">'
            : '<div class="tutor-card-img tutor-card-img-placeholder"></div>';

         card.innerHTML = '\
            ' + imgHTML + '\
            <div class="tutor-card-info">\
                <div class="tutor-card-header">\
                    <span class="tutor-name">' + t.name + '</span>\
                    <div class="tutor-badges">' + getBadgeHTML(t.badge) + '</div>\
                </div>\
                <div class="tutor-subject">\
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" stroke="#999"><g id="_01_align_center" data-name="01 align center"><path d="M20,0H5A3,3,0,0,0,2,3V21a3,3,0,0,0,3,3H22V2A2,2,0,0,0,20,0Zm0,18H8V2H20ZM5,2H6V18H5.017A3,3,0,0,0,4,18.187V3A1,1,0,0,1,5,2ZM5,22a1,1,0,0,1-1-.992h.015a1,1,0,0,1,1-1.008H20v2Z"/></g></svg>\
                    ' + t.subject + '\
                </div>\
                <div class="tutor-languages">Языки: ' + t.languages + '</div>\
                <div class="tutor-desc">\
                    <?xml version="1.0" encoding="UTF-8"?><svg id="svg" fill="#000000" stroke="#000000" width="16px" height="16px" version="1.1" viewBox="144 144 512 512" xmlns="http://www.w3.org/2000/svg"><g id="IconSvg_bgCarrier" stroke-width="0"></g><g id="IconSvg_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC"></g><g id="IconSvg_iconCarrier"><path xmlns="http://www.w3.org/2000/svg" d="m409.57 173.29c-119.73 0-217.14 85.422-217.14 190.42 0.33594 45.055 17.934 88.262 49.172 120.73l-68.324 142.28 169.98-81.605c21.586 6.0273 43.898 9.0625 66.309 9.0273 119.73 0 217.14-85.426 217.14-190.43 0-105-97.406-190.42-217.14-190.42zm0 347.07v0.003907c-21.266 0.046875-42.414-3.125-62.727-9.4102l-6.3438-1.9805-95.133 45.672 37.203-77.465-8.9805-8.4727c-29.688-26.898-46.852-64.934-47.379-104.99 0-86.375 82.258-156.64 183.36-156.64 101.11 0 183.36 70.27 183.36 156.64 0.003906 86.375-82.254 156.65-183.36 156.65z"/></g></svg>\
                    ' + t.description + '\
                </div>\
                <a href="#" class="tutor-more">Узнать больше</a>\
            </div>\
            <div class="tutor-card-right">\
                <div class="tutor-card-price-row">\
                    <span class="tutor-price">' + t.price + ' рублей</span>\
                    <button class="tutor-favorite">\
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>\
                    </button>\
                </div>\
                <div class="tutor-price-desc">За один урок 60 минут</div>\
                <div class="tutor-stats">\
                    <div class="tutor-stat">\
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#f5a623" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>\
                        ' + t.rating + '\
                    </div>\
                    <div class="tutor-stat">\
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>\
                        ' + t.students + ' учеников\
                    </div>\
                    <div class="tutor-stat">\
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>\
                        ' + t.lessons + ' уроков\
                    </div>\
                </div>\
                <div class="tutor-reviews">' + t.reviews + '</div>\
                <button class="book-btn" data-tutor-id="' + t.id + '" data-tutor-name="' + t.name + '" data-type="lesson">Забронировать пробный урок</button>\
                <button class="message-btn" data-tutor-id="' + t.id + '" data-tutor-name="' + t.name + '" data-type="message">Написать сообщение</button>\
            </div>\
        ';

        var favBtn = card.querySelector('.tutor-favorite');
        if (favBtn) {
            var favActive = false;
            favBtn.addEventListener('click', function() {
                favActive = !favActive;
                var svg = this.querySelector('svg');
                if (favActive) {
                    svg.setAttribute('fill', '#e05555');
                    svg.setAttribute('stroke', '#e05555');
                } else {
                    svg.setAttribute('fill', 'none');
                    svg.setAttribute('stroke', '#ccc');
                }
            });
        }

        card.querySelectorAll('.book-btn, .message-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
            var tutorId = parseInt(this.getAttribute('data-tutor-id'));
            var tutorName = this.getAttribute('data-tutor-name');
            var requestType = this.getAttribute('data-type');
            showBookingModal(tutorId, tutorName, requestType);
            });
        });
        list.appendChild(card);
    });
}

function fetchTutors() {
    var qs = buildQueryString();
    fetch(API + '/tutors' + (qs ? '?' + qs : ''))
    .then(function(r) { return r.json(); })
    .then(function(data) { renderTutors(data); })
    .catch(function(e) { console.error('Ошибка загрузки репетиторов:', e); });
}

function triggerFilter() {
    clearTimeout(filterDebounce);
    filterDebounce = setTimeout(function() {
        fetchTutors();
    }, 300);
}

function createDropBox(input) {
    var box = document.createElement('div');
    box.classList.add('suggestion-box');
    box.style.display = 'none';
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(box);
    return box;
}

function closeBox(box) {
    box.innerHTML = '';
    box.style.display = 'none';
}

function highlightMatch(text, query) {
    var lower = text.toLowerCase();
    var idx = lower.indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + '<strong>' + text.slice(idx, idx + query.length) + '</strong>' + text.slice(idx + query.length);
}

var headerSearchInput = document.querySelector('.tutors-header-search input');
if (headerSearchInput) {
    var nameBox = createDropBox(headerSearchInput);
    var nameDebounce = null;

    headerSearchInput.addEventListener('input', function() {
        var query = this.value.trim();
        filters.name = query;
        triggerFilter();

        clearTimeout(nameDebounce);
        if (!query) { closeBox(nameBox); return; }

        nameDebounce = setTimeout(function() {
            fetch(API + '/tutors/search-name?q=' + encodeURIComponent(query))
            .then(function(r) { return r.json(); })
            .then(function(data) {
                nameBox.innerHTML = '';
                if (data.length === 0) { nameBox.style.display = 'none'; return; }
                nameBox.style.display = 'flex';
                data.forEach(function(t) {
                    var item = document.createElement('div');
                    item.classList.add('suggestion-item');
                    var nameSpan = document.createElement('span');
                    nameSpan.classList.add('suggestion-name');
                    nameSpan.innerHTML = highlightMatch(t.name, query);
                    var subSpan = document.createElement('span');
                    subSpan.classList.add('suggestion-sphere');
                    subSpan.textContent = t.subject;
                    item.appendChild(nameSpan);
                    item.appendChild(subSpan);
                    item.addEventListener('click', function() {
                        headerSearchInput.value = t.name;
                        filters.name = t.name;
                        closeBox(nameBox);
                        triggerFilter();
                    });
                    nameBox.appendChild(item);
                });
            });
        }, 250);
    });

    document.addEventListener('click', function(e) {
        if (!headerSearchInput.parentElement.contains(e.target)) closeBox(nameBox);
    });
}

var subjectInput = document.querySelector('.filter-input[data-filter="subject"]');
if (subjectInput) {
    var subjectBox = createDropBox(subjectInput);
    var subjectDebounce = null;

    subjectInput.addEventListener('input', function() {
        var query = this.value.trim();
        filters.subject = query;
        triggerFilter();

        clearTimeout(subjectDebounce);
        if (!query) { closeBox(subjectBox); return; }

        subjectDebounce = setTimeout(function() {
            fetch(API + '/subjects/search-all?q=' + encodeURIComponent(query))
            .then(function(r) { return r.json(); })
            .then(function(data) {
                subjectBox.innerHTML = '';
                if (data.length === 0) { subjectBox.style.display = 'none'; return; }
                subjectBox.style.display = 'flex';
                data.forEach(function(s) {
                    var item = document.createElement('div');
                    item.classList.add('suggestion-item');
                    var nameSpan = document.createElement('span');
                    nameSpan.classList.add('suggestion-name');
                    nameSpan.innerHTML = highlightMatch(s.name, query);
                    item.appendChild(nameSpan);
                    item.addEventListener('click', function() {
                        subjectInput.value = s.name;
                        filters.subject = s.name;
                        closeBox(subjectBox);
                        triggerFilter();
                        updateLevelOptions(s.sphere);
                    });
                    subjectBox.appendChild(item);
                });
            });
        }, 250);
    });

    document.addEventListener('click', function(e) {
        if (!subjectInput.parentElement.contains(e.target)) closeBox(subjectBox);
    });
}

var priceInput = document.querySelector('.filter-input[data-filter="price"]');
if (priceInput) {
    priceInput.addEventListener('input', function() {
        var val = this.value.replace(/[^\d\-]/g, '');
        var parts = val.split('-');
        filters.price_from = parts[0] ? parseInt(parts[0]) : null;
        filters.price_to = parts[1] ? parseInt(parts[1]) : null;
        triggerFilter();
    });

    priceInput.addEventListener('keypress', function(e) {
        var allowed = /[\d\-]/;
        if (!allowed.test(e.key)) e.preventDefault();
    });

    priceInput.addEventListener('blur', function() {
        var digits = this.value.replace(/[^\d]/g, '');
        if (digits.length > 0 && !this.value.includes('-')) {
            this.value = digits + '-';
        }
    });
}

var scheduleInput = document.querySelector('.filter-input[data-filter="schedule"]');
if (scheduleInput) {
    var scheduleOptions = [
        'в любое время',
        'три раза в неделю',
        'два раза в неделю',
        'один раз в неделю',
        'другое'
    ];

    var scheduleBox = document.createElement('div');
    scheduleBox.classList.add('suggestion-box');
    scheduleBox.style.display = 'none';
    scheduleInput.parentElement.style.position = 'relative';
    scheduleInput.parentElement.appendChild(scheduleBox);

    function renderScheduleOptions(query) {
        scheduleBox.innerHTML = '';
        var filtered = scheduleOptions.filter(function(o) {
            return !query || o.toLowerCase().includes(query.toLowerCase());
        });
        if (filtered.length === 0) { scheduleBox.style.display = 'none'; return; }
        scheduleBox.style.display = 'flex';
        filtered.forEach(function(opt) {
            var item = document.createElement('div');
            item.classList.add('suggestion-item');
            var nameSpan = document.createElement('span');
            nameSpan.classList.add('suggestion-name');
            nameSpan.textContent = opt;
            item.appendChild(nameSpan);
            item.addEventListener('click', function() {
                scheduleInput.value = opt;
                filters.schedule = opt;
                scheduleBox.style.display = 'none';
                triggerFilter();
            });
            scheduleBox.appendChild(item);
        });
    }

    scheduleInput.addEventListener('focus', function() {
        renderScheduleOptions(this.value.trim());
    });

    scheduleInput.addEventListener('input', function() {
        filters.schedule = this.value.trim();
        renderScheduleOptions(this.value.trim());
        triggerFilter();
    });

    document.addEventListener('click', function(e) {
        if (!scheduleInput.parentElement.contains(e.target)) {
            scheduleBox.style.display = 'none';
        }
    });
}

var experienceInput = document.querySelector('.filter-input[data-filter="experience"]');
if (experienceInput) {
    experienceInput.addEventListener('keypress', function(e) {
        if (!/[\d]/.test(e.key)) e.preventDefault();
    });

    experienceInput.addEventListener('input', function() {
        var val = this.value.replace(/\D/g, '');
        this.value = val;
        filters.experience = val ? parseInt(val) : null;

        var suffix = this.parentElement.querySelector('.input-suffix');
        if (!suffix) {
            suffix = document.createElement('span');
            suffix.classList.add('input-suffix');
            suffix.textContent = 'лет';
            this.parentElement.appendChild(suffix);
        }
        suffix.style.display = val ? 'flex' : 'none';

        triggerFilter();
    });
}

var levelInput = document.querySelector('.filter-input[data-filter="level"]');
var currentSphere = '';

var levelMap = {
    languages: ['B2', 'C1', 'C2'],
    school: ['Среднее образование', 'Высшее образование', 'Кандидат наук'],
    higher: ['Высшее образование', 'Кандидат наук', 'Доктор наук'],
    music: ['Музыкальная школа', 'Музыкальное училище', 'Музыкальное образование'],
    art: ['Художественная школа', 'Художественное училище'],
    dance: ['Спортивный разряд', 'Гимнастические достижения'],
    speech: ['Медицинское образование', 'Логопедическое образование'],
    other: ['Среднее образование', 'Высшее образование']
};

function updateLevelOptions(sphere) {
    currentSphere = sphere;
}

if (levelInput) {
    var levelBox = document.createElement('div');
    levelBox.classList.add('suggestion-box');
    levelBox.style.display = 'none';
    levelInput.parentElement.style.position = 'relative';
    levelInput.parentElement.appendChild(levelBox);

    function getLevelOptions() {
        return levelMap[currentSphere] || levelMap['other'];
    }

    function renderLevelOptions(query) {
        levelBox.innerHTML = '';
        var opts = getLevelOptions().filter(function(o) {
            return !query || o.toLowerCase().includes(query.toLowerCase());
        });
        if (opts.length === 0) { levelBox.style.display = 'none'; return; }
        levelBox.style.display = 'flex';
        opts.forEach(function(opt) {
            var item = document.createElement('div');
            item.classList.add('suggestion-item');
            var nameSpan = document.createElement('span');
            nameSpan.classList.add('suggestion-name');
            nameSpan.innerHTML = query ? highlightMatch(opt, query) : opt;
            item.appendChild(nameSpan);
            item.addEventListener('click', function() {
                levelInput.value = opt;
                filters.level = opt;
                levelBox.style.display = 'none';
                triggerFilter();
            });
            levelBox.appendChild(item);
        });
    }

    levelInput.addEventListener('focus', function() {
        renderLevelOptions(this.value.trim());
    });

    levelInput.addEventListener('input', function() {
        filters.level = this.value.trim();
        renderLevelOptions(this.value.trim());
        triggerFilter();
    });

    document.addEventListener('click', function(e) {
        if (!levelInput.parentElement.contains(e.target)) {
            levelBox.style.display = 'none';
        }
    });
}

var birthInput = document.querySelector('.filter-input[data-filter="birth_year"]');
if (birthInput) {
    birthInput.addEventListener('keypress', function(e) {
        if (!/[\d\-]/.test(e.key)) e.preventDefault();
    });

    birthInput.addEventListener('input', function() {
        var val = this.value.replace(/[^\d\-]/g, '');
        this.value = val;
        var parts = val.split('-');
        filters.birth_year_from = parts[0] && parts[0].length === 4 ? parseInt(parts[0]) : null;
        filters.birth_year_to = parts[1] && parts[1].length === 4 ? parseInt(parts[1]) : null;
        triggerFilter();
    });

    birthInput.addEventListener('blur', function() {
        var digits = this.value.replace(/[^\d]/g, '');
        if (digits.length === 4 && !this.value.includes('-')) {
            this.value = digits + '-';
        }
    });
}

var goalInput = document.querySelector('.filter-input[data-filter="goal"]');
if (goalInput) {
    goalInput.addEventListener('input', function() {
        filters.goal = this.value.trim();
        triggerFilter();
    });
}

document.querySelectorAll('.dropdown-toggle').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var parent = this.closest('.dropdown');
        var isActive = parent.classList.contains('active');
        document.querySelectorAll('.dropdown').forEach(function(d) {
            d.classList.remove('active');
        });
        if (!isActive) parent.classList.add('active');
    });
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(function(d) {
            d.classList.remove('active');
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    readAndApplySessionFilters();
    fetchTutors();
    loadMyBookings();
});