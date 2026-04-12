document.querySelectorAll('.dropdown-toggle').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var parent = this.closest('.dropdown');
        var isActive = parent.classList.contains('active');
        document.querySelectorAll('.dropdown').forEach(function(d) {
            d.classList.remove('active');
        });
        if (!isActive) {
            parent.classList.add('active');
        }
    });
});

document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown').forEach(function(d) {
            d.classList.remove('active');
        });
    }
});

document.querySelectorAll('.exam-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
        var target = this.getAttribute('data-tab');
        var currentPanel = document.querySelector('.exam-panel.active');
        var nextPanel = document.getElementById(target);

        if (this.classList.contains('active') || !nextPanel) return;

        document.querySelectorAll('.exam-tab').forEach(function(t) {
            t.classList.remove('active');
        });
        this.classList.add('active');

        if (currentPanel) {
            currentPanel.classList.add('exam-hide');
            setTimeout(function() {
                currentPanel.classList.remove('active', 'exam-hide');
                nextPanel.classList.add('active', 'exam-show');
                setTimeout(function() {
                    nextPanel.classList.remove('exam-show');
                }, 400);
            }, 300);
        } else {
            nextPanel.classList.add('active', 'exam-show');
            setTimeout(function() {
                nextPanel.classList.remove('exam-show');
            }, 400);
        }
    });
});

document.querySelectorAll('.gender-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.gender-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        this.classList.add('active');
    });
});

document.querySelectorAll('.sphere-card').forEach(function(card) {
    var toggle = card.querySelector('.sphere-show-all');
    var tags = card.querySelector('.sphere-tags');

    if (!toggle || !tags) return;

    var isExpanded = false;

    tags.style.display = 'flex';
    tags.style.overflow = 'hidden';
    tags.style.maxHeight = '0px';
    tags.style.opacity = '0';
    tags.style.transition = 'max-height 0.35s ease, opacity 0.3s ease, margin-top 0.35s ease';
    tags.style.marginTop = '0px';

    toggle.innerHTML = 'Показать всем списком <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';

    toggle.addEventListener('click', function() {
        isExpanded = !isExpanded;
        if (isExpanded) {
            tags.style.maxHeight = tags.scrollHeight + 'px';
            tags.style.opacity = '1';
            tags.style.marginTop = '6px';
            toggle.innerHTML = 'Скрыть список <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 7.5l3-3 3 3" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
        } else {
            tags.style.maxHeight = '0px';
            tags.style.opacity = '0';
            tags.style.marginTop = '0px';
            toggle.innerHTML = 'Показать всем списком <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
        }
    });
});

var API = 'http://127.0.0.1:8000';

function createSuggestionBox(input) {
    var box = document.createElement('div');
    box.classList.add('suggestion-box');
    input.parentElement.appendChild(box);
    return box;
}

function closeSuggestionBox(box) {
    box.innerHTML = '';
    box.style.display = 'none';
}

document.querySelectorAll('.sphere-card').forEach(function(card) {
    var input = card.querySelector('.sphere-search-input');
    var sphere = card.getAttribute('data-sphere');

    if (!input || !sphere) return;

    var box = createSuggestionBox(input);
    var debounceTimer = null;

    input.addEventListener('input', function() {
        var query = this.value.trim();
        clearTimeout(debounceTimer);

        if (!query) {
            closeSuggestionBox(box);
            return;
        }

        debounceTimer = setTimeout(function() {
            fetch(API + '/subjects/search?sphere=' + encodeURIComponent(sphere) + '&q=' + encodeURIComponent(query))
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                box.innerHTML = '';

                if (data.length === 0) {
                    box.style.display = 'none';
                    return;
                }

                box.style.display = 'flex';

                data.forEach(function(subject) {
                    var item = document.createElement('div');
                    item.classList.add('suggestion-item');

                    var queryLower = query.toLowerCase();
                    var nameLower = subject.name.toLowerCase();
                    var index = nameLower.indexOf(queryLower);

                    if (index !== -1) {
                        var before = subject.name.slice(0, index);
                        var match = subject.name.slice(index, index + query.length);
                        var after = subject.name.slice(index + query.length);
                        item.innerHTML = before + '<strong>' + match + '</strong>' + after;
                    } else {
                        item.textContent = subject.name;
                    }

                    item.addEventListener('click', function() {
                        input.value = subject.name;
                        closeSuggestionBox(box);
                    });

                    box.appendChild(item);
                });
            })
            .catch(function(error) {
                console.error('Ошибка поиска:', error);
            });
        }, 250);
    });

    document.addEventListener('click', function(e) {
        if (!card.contains(e.target)) {
            closeSuggestionBox(box);
        }
    });

    input.addEventListener('focus', function() {
        if (this.value.trim() && box.children.length > 0) {
            box.style.display = 'flex';
        }
    });
});

function validateForm() {
    var isValid = true;

    var name = document.querySelector('.tutor-form [placeholder="Иванов Иван Иванович"]');
    var age = document.querySelector('.age-input');
    var email = document.querySelector('.tutor-form [placeholder="example@gmail.com"]');
    var phone = document.querySelector('.tutor-form [placeholder="+7(000)000-00-00"]');
    var subject = document.querySelector('.tutor-form [placeholder="Введите название предмета"]');

    clearErrors();

    if (!name || !name.value.trim()) {
        showError(name, 'Введите ФИО');
        isValid = false;
    } else if (/\d/.test(name.value)) {
        showError(name, 'ФИО не должно содержать цифры');
        isValid = false;
    } else if (name.value.trim().split(/\s+/).length < 2) {
        showError(name, 'Введите полное ФИО (минимум имя и фамилию)');
        isValid = false;
    }

    if (!age || !age.value.trim()) {
        showError(age, 'Введите возраст');
        isValid = false;
    } else if (/[a-zA-Zа-яёА-ЯЁ]/.test(age.value)) {
        showError(age, 'Возраст должен содержать только цифры');
        isValid = false;
    } else if (parseInt(age.value) > 99 || parseInt(age.value) < 18) {
        showError(age, 'Возраст должен быть от 18 до 99 лет');
        isValid = false;
    }

    if (!email || !email.value.trim()) {
        showError(email, 'Введите электронную почту');
        isValid = false;
    } else if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email.value)) {
        showError(email, 'Почта должна быть написана на английском и содержать @');
        isValid = false;
    }

    if (!phone || !phone.value.trim()) {
        showError(phone, 'Введите номер телефона');
        isValid = false;
    } else if (!/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(phone.value)) {
        showError(phone, 'Формат: +7(000)000-00-00');
        isValid = false;
    }

    var validSubjects = [
        'математика', 'русский язык', 'информатика', 'биология', 'химия',
        'физика', 'литература', 'география', 'обществознание', 'история',
        'гитара', 'электрогитара', 'скрипка', 'фортепиано', 'вокал',
        'сольфеджио', 'барабаны', 'баян', 'саксафон', 'флейта', 'труба',
        'кларнет', 'виолончель', 'испанский', 'китайский', 'арабский',
        'английский', 'немецкий', 'финский', 'французкий', 'польский',
        'японский', 'португальский', 'итальянский', 'высшая математика',
        'теория вероятности', 'сопромат', 'алгебра логики', 'экономика',
        'философия', 'программирование', 'журналистика', 'подготовка к школе',
        'танцы', 'компьютерная грамотность', 'изобразительное искусство',
        'начальная школа', 'логопед', 'английский язык', 'немецкий язык'
    ];

    if (!subject || !subject.value.trim()) {
        showError(subject, 'Введите предмет');
        isValid = false;
    } else if (/\d/.test(subject.value)) {
        showError(subject, 'Предмет не должен содержать цифры');
        isValid = false;
    } else if (!validSubjects.includes(subject.value.trim().toLowerCase())) {
        showError(subject, 'Укажите настоящий предмет из нашего списка');
        isValid = false;
    }

    return isValid;
}

function showError(input, message) {
    if (!input) return;
    var wrap = input.closest('.form-input-wrap') || input;
    wrap.classList.add('input-error');

    var err = document.createElement('div');
    err.classList.add('error-message');
    err.textContent = message;

    var parent = wrap.closest('.form-group') || wrap.closest('.form-group-inline') || wrap.parentElement;
    parent.appendChild(err);
}

function clearErrors() {
    document.querySelectorAll('.input-error').forEach(function(el) {
        el.classList.remove('input-error');
    });
    document.querySelectorAll('.error-message').forEach(function(el) {
        el.remove();
    });
}

function showSuccessModal() {
    var overlay = document.createElement('div');
    overlay.classList.add('modal-overlay');

    var modal = document.createElement('div');
    modal.classList.add('modal-box');

    var icon = document.createElement('div');
    icon.classList.add('modal-icon');
    icon.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#77bfa4" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var text = document.createElement('p');
    text.classList.add('modal-text');
    text.textContent = 'Ваша заявка была отправлена. Ожидайте ответа на вашей почте!';

    var closeBtn = document.createElement('button');
    closeBtn.classList.add('modal-close-btn');
    closeBtn.textContent = 'Закрыть';

    closeBtn.addEventListener('click', function() {
        overlay.classList.remove('modal-visible');
        setTimeout(function() {
            overlay.remove();
        }, 300);
    });

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.classList.remove('modal-visible');
            setTimeout(function() {
                overlay.remove();
            }, 300);
        }
    });

    modal.appendChild(icon);
    modal.appendChild(text);
    modal.appendChild(closeBtn);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(function() {
        overlay.classList.add('modal-visible');
    }, 10);
}

var phoneInput = document.querySelector('.tutor-form [placeholder="+7(000)000-00-00"]');
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

var submitBtn = document.getElementById('submitFormBtn');
if (submitBtn) {
    submitBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (!validateForm()) return;

        var nameInput = document.querySelector('.tutor-form [placeholder="Иванов Иван Иванович"]');
        var ageInput = document.querySelector('.age-input');
        var emailInput = document.querySelector('.tutor-form [placeholder="example@gmail.com"]');
        var phoneInputVal = document.querySelector('.tutor-form [placeholder="+7(000)000-00-00"]');
        var subjectInput = document.querySelector('.tutor-form [placeholder="Введите название предмета"]');
        var activeGender = document.querySelector('.gender-btn.active');

        var payload = {
            full_name: nameInput ? nameInput.value.trim() : '',
            gender: activeGender ? activeGender.textContent.trim() : 'М',
            age: ageInput ? parseInt(ageInput.value) : 0,
            email: emailInput ? emailInput.value.trim() : '',
            phone: phoneInputVal ? phoneInputVal.value.trim() : '',
            subject: subjectInput ? subjectInput.value.trim() : ''
        };

        fetch('http://127.0.0.1:8000/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(function(response) {
            if (response.ok) {
                return response.json();
            }
            return response.json().then(function(err) {
                throw err;
            });
        })
        .then(function() {
            showSuccessModal();
            document.querySelector('.tutor-form').reset();
        })
        .catch(function(error) {
            console.error('Ошибка:', error);
            alert('Не удалось подключиться к серверу. Проверьте что сервер запущен.');
        });
    });
}