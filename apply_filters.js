function applySessionFilters() {
    var subject = sessionStorage.getItem('selected_subject');
    var goal = sessionStorage.getItem('selected_goal');
    var city = sessionStorage.getItem('selected_city');

    console.log('Сохранка', subject, goal, city);

    if (subject) {
        sessionStorage.setItem('apply_subject', subject);
        sessionStorage.removeItem('selected_subject');
    }
    if (goal) {
        sessionStorage.setItem('apply_goal', goal);
        sessionStorage.removeItem('selected_goal');
    }
    if (city) {
        sessionStorage.setItem('apply_city', city);
        sessionStorage.removeItem('selected_city');
    }
}