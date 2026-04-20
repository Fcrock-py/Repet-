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

document.querySelectorAll('.tutor-favorite').forEach(function(btn) {
    var active = false;
    btn.addEventListener('click', function() {
        active = !active;
        var svg = this.querySelector('svg');
        if (active) {
            svg.setAttribute('fill', '#e05555');
            svg.setAttribute('stroke', '#e05555');
        } else {
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', '#ccc');
        }
    });
});