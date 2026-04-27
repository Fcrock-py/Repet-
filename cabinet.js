var API = 'http://127.0.0.1:8000';
var token = localStorage.getItem('token');
var user = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user) {
    window.location.href = 'auth.html';
}

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token };
}

document.querySelectorAll('.cab-nav-item').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.cab-nav-item').forEach(function(b) { b.classList.remove('active'); });
        document.querySelectorAll('.cab-section').forEach(function(s) { s.classList.remove('active'); });
        this.classList.add('active');
        var section = document.getElementById('section-' + this.getAttribute('data-section'));
        if (section) section.classList.add('active');

        var s = this.getAttribute('data-section');
        if (s === 'bookings') loadBookings();
        if (s === 'favorites') loadFavorites();
        if (s === 'profile') loadProfile();
        if (s === 'account') loadAccount();
    });
});

function loadProfile() {
    var contactEl = document.getElementById('cab-user-contact');
    if (user) {
        contactEl.textContent = user.email || user.phone || '';
    }

    fetch(API + '/profile', { headers: authHeaders() })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        document.getElementById('prof-lastname').value = data.last_name || '';
        document.getElementById('prof-firstname').value = data.first_name || '';
        document.getElementById('prof-middlename').value = data.middle_name || '';
        document.getElementById('prof-about').value = data.about || '';
        document.getElementById('prof-subjects').value = data.subjects || '';
    });
}

document.getElementById('saveProfileBtn').addEventListener('click', function() {
    var payload = {
        last_name: document.getElementById('prof-lastname').value.trim() || null,
        first_name: document.getElementById('prof-firstname').value.trim() || null,
        middle_name: document.getElementById('prof-middlename').value.trim() || null,
        about: document.getElementById('prof-about').value.trim() || null,
        subjects: document.getElementById('prof-subjects').value.trim() || null
    };

    fetch(API + '/profile', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(payload)
    })
    .then(function(r) { return r.json(); })
    .then(function() {
        showCabModal('Профиль обновлён!', 'Ваши данные успешно сохранены.', '#77bfa4');
    });
});

function loadAccount() {
    var emailInput = document.getElementById('acc-email');
    var hint = document.getElementById('acc-email-hint');
    if (user && user.email) {
        emailInput.value = user.email;
        hint.textContent = 'На данный момент вы используете данную почту';
    }
    var phoneInput = document.getElementById('acc-phone');
    if (user && user.phone) {
        phoneInput.value = user.phone;
    }
}

var accPhoneInput = document.getElementById('acc-phone');
if (accPhoneInput) {
    accPhoneInput.addEventListener('input', function() {
        var value = this.value.replace(/\D/g, '');
        if (value.startsWith('7') || value.startsWith('8')) value = value.slice(1);
        var formatted = '+7';
        if (value.length > 0) formatted += '(' + value.slice(0, 3);
        if (value.length >= 3) formatted += ')' + value.slice(3, 6);
        if (value.length >= 6) formatted += '-' + value.slice(6, 8);
        if (value.length >= 8) formatted += '-' + value.slice(8, 10);
        this.value = formatted;
    });
}

document.getElementById('changeEmailBtn').addEventListener('click', function() {
    var email = document.getElementById('acc-email').value.trim();
    fetch(API + '/account/email?email=' + encodeURIComponent(email), {
        method: 'PUT',
        headers: authHeaders()
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.email) {
            user.email = data.email;
            localStorage.setItem('user', JSON.stringify(user));
            document.getElementById('acc-email-hint').textContent = 'На данный момент вы используете данную почту';
            showCabModal('Готово!', 'Электронная почта успешно изменена.', '#77bfa4');
        } else {
            showCabModal('Ошибка', data.detail || 'Не удалось изменить почту.', '#e05555');
        }
    });
});

document.getElementById('changePhoneBtn').addEventListener('click', function() {
    var phone = document.getElementById('acc-phone').value.trim();
    fetch(API + '/account/phone?phone=' + encodeURIComponent(phone), {
        method: 'PUT',
        headers: authHeaders()
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.phone) {
            user.phone = data.phone;
            localStorage.setItem('user', JSON.stringify(user));
            showCabModal('Готово!', 'Номер телефона успешно прикреплён.', '#77bfa4');
        } else {
            showCabModal('Ошибка', data.detail || 'Не удалось прикрепить номер.', '#e05555');
        }
    });
});

document.getElementById('cabLogoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'auth.html';
});

document.getElementById('deleteAccountBtn').addEventListener('click', function() {
    if (!confirm('Вы уверены? Аккаунт будет удалён безвозвратно.')) return;
    fetch(API + '/account', {
        method: 'DELETE',
        headers: authHeaders()
    })
    .then(function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'auth.html';
    });
});

function loadBookings() {
    var list = document.getElementById('cab-bookings-list');
    list.innerHTML = '<div class="cab-empty">Загрузка...</div>';

    fetch(API + '/booking?user_id=' + user.id, { headers: authHeaders() })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        list.innerHTML = '';
        if (data.length === 0) {
            list.innerHTML = '<div class="cab-empty">У вас пока нет отправленных заявок</div>';
            return;
        }
        data.forEach(function(b) {
            var card = document.createElement('div');
            card.classList.add('cab-booking-card');
            card.innerHTML = '\
                <div class="cab-booking-tutor">' + b.tutor_name + '</div>\
                <div class="cab-booking-type">' + (b.request_type === 'lesson' ? '📅 Пробный урок' : '💬 Сообщение') + '</div>\
                <div class="cab-booking-date">' + b.created_at + '</div>\
            ';
            list.appendChild(card);
        });
    });
}

function getBadgeHTML(badge) {
    if (badge === 'leading') return '<span class="cab-badge cab-badge-teal">Ведущий специалист</span><span class="cab-badge cab-badge-purple">Рекомендованный</span>';
    if (badge === 'pro') return '<span class="cab-badge cab-badge-blue">Профессионал</span>';
    return '';
}

function loadFavorites() {
    var list = document.getElementById('cab-favorites-list');
    list.innerHTML = '<div class="cab-empty">Загрузка...</div>';

    fetch(API + '/favorites', { headers: authHeaders() })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        list.innerHTML = '';
        if (data.length === 0) {
            list.innerHTML = '<div class="cab-empty">У вас пока нет сохранённых репетиторов</div>';
            return;
        }
        data.forEach(function(t) {
            var card = document.createElement('div');
            card.classList.add('cab-fav-card');
            var imgHTML = t.tutor_image_url
                ? '<img src="' + t.tutor_image_url + '" class="cab-fav-img" alt="' + t.tutor_name + '">'
                : '<div class="cab-fav-img"></div>';
            card.innerHTML = '\
                ' + imgHTML + '\
                <div class="cab-fav-info">\
                    <div class="cab-fav-name">' + t.tutor_name + '</div>\
                    <div>' + getBadgeHTML(t.tutor_badge) + '</div>\
                    <div class="cab-fav-subject">' + t.tutor_subject + '</div>\
                    <div class="cab-fav-subject">' + t.tutor_languages + '</div>\
                </div>\
                <div class="cab-fav-right">\
                    <div class="cab-fav-price">' + t.tutor_price + ' руб.</div>\
                    <svg class="cab-fav-heart" width="20" height="20" viewBox="0 0 24 24" fill="#e05555" stroke="#e05555" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>\
                    <div style="font-size:12px;color:#aaa;">⭐ ' + t.tutor_rating + ' · ' + t.tutor_lessons + ' уроков</div>\
                </div>\
            ';
            list.appendChild(card);
        });
    });
}

var chatInput = document.getElementById('cab-chat-input');
var chatSend = document.getElementById('cab-chat-send');
var chatMessages = document.getElementById('cab-chat-messages');

var botReplies = [
    'Понимаю вашу проблему, мы обязательно разберёмся с данной ситуацией!',
    'Спасибо за обращение! Наши специалисты скоро свяжутся с вами.',
    'Мы получили ваш запрос и уже работаем над решением.',
    'Ваш вопрос очень важен для нас. Мы ответим в ближайшее время!',
    'Приносим извинения за неудобства. Проблема будет решена!'
];

function sendChatMessage() {
    var text = chatInput.value.trim();
    if (!text) return;

    var userMsg = document.createElement('div');
    userMsg.classList.add('cab-chat-msg', 'cab-chat-user');
    userMsg.textContent = text;
    chatMessages.appendChild(userMsg);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(function() {
        var botMsg = document.createElement('div');
        botMsg.classList.add('cab-chat-msg', 'cab-chat-bot');
        botMsg.textContent = botReplies[Math.floor(Math.random() * botReplies.length)];
        chatMessages.appendChild(botMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);
}

chatSend.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendChatMessage();
});

function showCabModal(title, text, color) {
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0);display:flex;align-items:center;justify-content:center;z-index:9999;transition:background 0.3s ease;';
    overlay.innerHTML = '\
        <div style="background:#fff;border-radius:20px;padding:40px 50px;display:flex;flex-direction:column;align-items:center;gap:16px;max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.15);transform:translateY(30px);opacity:0;transition:transform 0.35s ease,opacity 0.35s ease;">\
            <div style="font-size:20px;font-weight:800;color:' + color + ';text-align:center;">' + title + '</div>\
            <div style="font-size:14px;color:#888;text-align:center;line-height:1.6;">' + text + '</div>\
            <button onclick="this.closest(\'div[style*=fixed]\').remove()" style="padding:12px 40px;background:' + color + ';color:#fff;border:none;border-radius:24px;font-size:14px;font-weight:700;cursor:pointer;margin-top:6px;">Закрыть</button>\
        </div>\
    ';
    document.body.appendChild(overlay);
    setTimeout(function() {
        overlay.style.background = 'rgba(0,0,0,0.5)';
        var modal = overlay.querySelector('div');
        modal.style.transform = 'translateY(0)';
        modal.style.opacity = '1';
    }, 10);
}

loadProfile();