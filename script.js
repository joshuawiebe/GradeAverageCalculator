const grades = JSON.parse(localStorage.getItem('grades') || '[]');

// ========== DOM ELEMENTS ==========

const form = document.getElementById('newSubjectForm');
const subjectSelect = document.getElementById('subjectSelect');
const customInput = document.getElementById('customSubjectInput');
const gradeInput = document.getElementById('addGradeInput');
const subjectsDiv = document.getElementById('subjectsDiv');

// ========== FORM BEHAVIOR ==========

subjectSelect.addEventListener('change', () => {
    if (subjectSelect.value === 'other') {
    customInput.style.display = 'block';
    customInput.required = true;
    customInput.focus();
    } else {
    customInput.style.display = 'none';
    customInput.required = false;
    customInput.value = '';
    }
    saveForm();
});

customInput.addEventListener('input', saveForm);
gradeInput.addEventListener('input', saveForm);

// ========== FORM SUBMISSION ==========

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const subject = (subjectSelect.value === 'other')
    ? customInput.value.trim()
    : subjectSelect.value;

    const grade = parseFloat(gradeInput.value);

    if (!subject) {
    alert('Please enter or select a subject.');
    return;
    }

    if (grades.find(entry => entry.subject.toLowerCase() === subject.toLowerCase())) {
    alert('Subject is already taken!');
    return;
    }

    if (isNaN(grade) || grade < 1 || grade > 6) {
    alert('Please enter a valid grade (1–6).');
    return;
    }

    grades.push({ subject, grade: parseFloat(gradeInput.value) });
    updateList();
    updateAvailableSubjects();
    saveState();

    form.reset();
    customInput.style.display = 'none';
    saveForm();
});

// ========== LIST RENDERING ==========

function updateList() {
    subjectsDiv.innerHTML = '';

    grades.forEach((entry, index) => {
    const container = document.createElement('div');

    const label = document.createElement('span');
    label.textContent = `${entry.subject}: ${entry.grade}`;
    container.appendChild(label);

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.style.marginLeft = '1em';
    editBtn.onclick = () => editEntry(index);
    container.appendChild(editBtn);

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.style.marginLeft = '0.5em';
    removeBtn.onclick = () => deleteEntry(index);
    container.appendChild(removeBtn);

    subjectsDiv.appendChild(container);
    });

    if (grades.length > 0) {
    const sum = grades.reduce((acc, cur) => acc + parseFloat(cur.grade), 0);
    const avg = (sum / grades.length).toFixed(2);
    const avgP = document.createElement('p');
    avgP.innerHTML = `<strong>Average Grade: ${avg}</strong>`;
    subjectsDiv.appendChild(avgP);
    }

    saveState();
}

// ========== DELETE / EDIT ==========

function deleteEntry(index) {
    grades.splice(index, 1);
    updateList();
    updateAvailableSubjects();
    saveState();
}

function editEntry(index) {
    const entry = grades[index];
    grades.splice(index, 1);
    updateList();
    updateAvailableSubjects();

    // Restore into form
    const isCustom = !Array.from(subjectSelect.options).some(opt => opt.value === entry.subject);

    if (isCustom) {
    subjectSelect.value = 'other';
    customInput.style.display = 'block';
    customInput.required = true;
    customInput.value = entry.subject;
    } else {
    subjectSelect.value = entry.subject;
    customInput.style.display = 'none';
    customInput.required = false;
    customInput.value = '';
    }

    gradeInput.value = entry.grade;
    saveForm();
}

// ========== PERSISTENCE ==========

function saveState() {
    localStorage.setItem('grades', JSON.stringify(grades));
}

function saveForm() {
    const formState = {
    subject: subjectSelect.value,
    custom: customInput.value,
    grade: gradeInput.value
    };
    localStorage.setItem('form', JSON.stringify(formState));
}

function updateAvailableSubjects() {
    const used = grades.map(e => e.subject.toLowerCase());
    for (const opt of subjectSelect.options) {
    if (opt.value && opt.value !== 'other') {
        opt.disabled = used.includes(opt.value.toLowerCase());
    }
    }
}

// ========== INIT ==========

window.onload = () => {
    const savedGrades = localStorage.getItem('grades');
    if (savedGrades) {
    try {
        grades.push(...JSON.parse(savedGrades));
        updateList();
    } catch (e) {
        console.error('Could not parse grades from localStorage');
    }
    }

    const savedForm = localStorage.getItem('form');
    if (savedForm) {
    try {
        const { subject, custom, grade } = JSON.parse(savedForm);
        subjectSelect.value = subject || '';
        gradeInput.value = grade || '';
        if (subject === 'other') {
        customInput.style.display = 'block';
        customInput.required = true;
        customInput.value = custom || '';
        }
    } catch (e) {
        console.error('Could not parse form state from localStorage');
    }
    }

    updateAvailableSubjects();
};
