document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const counter = document.getElementById('counter');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Загружаем задачи из localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all'; // Текущий фильтр

    // Функция для форматирования даты
    function formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    }

    // Функция для обновления счетчика
    function updateCounter() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        counter.textContent = `Выполнено: ${completed} из ${total}`;
    }

    // Функция для рендера задач с учетом фильтра
    function renderTasks() {
        taskList.innerHTML = '';

        // Фильтруем задачи
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all'
        });

        filteredTasks.forEach((task) => {
            const originalIndex = tasks.indexOf(task); // Индекс в оригинальном массиве

            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');

            const contentDiv = document.createElement('div');
            contentDiv.style.flex = '1';

            const span = document.createElement('span');
            span.textContent = task.text;
            span.addEventListener('click', () => toggleTask(originalIndex));

            const dateSpan = document.createElement('span');
            dateSpan.classList.add('task-date');
            // Если даты нет (старые задачи), не показываем
            if (task.date) {
                dateSpan.textContent = `📅 ${formatDate(task.date)}`;
            }

            contentDiv.appendChild(span);
            contentDiv.appendChild(dateSpan);

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '✕';
            deleteBtn.classList.add('delete-btn');
            deleteBtn.addEventListener('click', () => deleteTask(originalIndex));

            li.appendChild(contentDiv);
            li.appendChild(deleteBtn);
            taskList.appendChild(li);
        });

        updateCounter();
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        tasks.push({
            text,
            completed: false,
            date: new Date().toISOString() // Сохраняем дату
        });
        taskInput.value = '';
        saveAndRender();
    }

    function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        saveAndRender();
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        saveAndRender();
    }

    function saveAndRender() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
    }

    // Обработчики событий
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // Обработчик фильтров
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Убираем active у всех
            filterBtns.forEach(b => b.classList.remove('active'));
            // Добавляем active текущей
            btn.classList.add('active');
            
            currentFilter = btn.dataset.filter;
            renderTasks(); // Перерисовываем
        });
    });

    // Первый рендер
    renderTasks();
});