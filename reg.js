var API = 'http://127.0.0.1:8000';

var phoneInput = document.getElementById('reg-phone');
if (phoneInput) {
    phoneInput.addEventListener('input', function() {
        var value = this.value.replace(/\D/g, '');
        if (value.startsWith('7') || value.startsWith('8')) {
            value = value.slice(1);
        }
        var formatted = '+7';
        if (value.length > 0) formatted += '(' + value.slice(0, 3);
        if (value.length >= 3) formatted += ')' + value.slice(3, 6);
        if (value.length >= 6) formatted += '-' + value.slice(6, 8);
        if (value.length >= 8) formatted += '-' + value.slice(8, 10);
        this.value = formatted;
    });
}

function clearErrors() {
    ['email', 'phone', 'password', 'password-confirm', 'general'].forEach(function(field) {
        var err = document.getElementById('err-' + field);
        var wrap = document.getElementById('wrap-' + field);
        if (err) err.textContent = '';
        if (wrap) wrap.classList.remove('input-error');
    });
}

function showError(field, message) {
    var err = document.getElementById('err-' + field);
    var wrap = document.getElementById('wrap-' + field);
    if (err) err.textContent = message;
    if (wrap) wrap.classList.add('input-error');
}

function validateFront() {
    var email = document.getElementById('reg-email').value.trim();
    var phone = document.getElementById('reg-phone').value.trim();
    var password = document.getElementById('reg-password').value;
    var confirm = document.getElementById('reg-password-confirm').value;
    var valid = true;

    clearErrors();

    if (!email && !phone) {
        showError('general', 'Введите почту или номер телефона');
        valid = false;
    }

    if (email) {
        var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            showError('email', 'Некорректная электронная почта');
            valid = false;
        }
    }

    if (phone) {
        var phoneRegex = /^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/;
        if (!phoneRegex.test(phone)) {
            showError('phone', 'Формат: +7(000)000-00-00');
            valid = false;
        }
    }

    if (!password) {
        showError('password', 'Введите пароль');
        valid = false;
    } else if (password.length < 6) {
        showError('password', 'Пароль должен быть не менее 6 символов');
        valid = false;
    }

    if (!confirm) {
        showError('password-confirm', 'Повторите пароль');
        valid = false;
    } else if (password !== confirm) {
        showError('password-confirm', 'Пароли не совпадают');
        valid = false;
    }

    return valid;
}

document.getElementById('registerBtn').addEventListener('click', function() {
    if (!validateFront()) return;

    var email = document.getElementById('reg-email').value.trim();
    var phone = document.getElementById('reg-phone').value.trim();
    var password = document.getElementById('reg-password').value;
    var confirm = document.getElementById('reg-password-confirm').value;

    var payload = {
        email: email || null,
        phone: phone || null,
        password: password,
        password_confirm: confirm
    };

    fetch(API + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(function(response) {
        return response.json().then(function(data) {
            return { status: response.status, data: data };
        });
    })
    .then(function(result) {
        if (result.status === 200) {
            localStorage.setItem('token', result.data.access_token);
            localStorage.setItem('user', JSON.stringify(result.data.user));
            applySessionFilters();
            setTimeout(function() {
                window.location.href = 'repets.html';
            }, 50);
        } else {
            var detail = result.data.detail;
            if (typeof detail === 'object') {
                Object.keys(detail).forEach(function(key) {
                    showError(key, detail[key]);
                });
            } else {
                showError('general', detail || 'Ошибка регистрации');
            }
        }
    })
    .catch(function(error) {
        console.error('Ошибка:', error);
        showError('general', 'Не удалось подключиться к серверу');
    });
});