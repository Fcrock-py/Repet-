var API = 'http://127.0.0.1:8000';

function clearErrors() {
    ['login', 'password', 'general'].forEach(function(field) {
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

document.getElementById('loginBtn').addEventListener('click', function() {
    clearErrors();

    var login = document.getElementById('login-input').value.trim();
    var password = document.getElementById('login-password').value;
    var valid = true;

    if (!login) {
        showError('login', 'Введите почту или телефон');
        valid = false;
    }

    if (!password) {
        showError('password', 'Введите пароль');
        valid = false;
    }

    if (!valid) return;

    fetch(API + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login, password: password })
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
                showError('general', detail || 'Неверный логин или пароль');
            }
        }
    })
    .catch(function(error) {
        console.error('Ошибка:', error);
        showError('general', 'Не удалось подключиться к серверу');
    });
});