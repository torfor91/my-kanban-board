class KanbanBoard {
    constructor() {
        // --- ЭТАП 4.2: Загрузка (Load) из LocalStorage ---
        const savedData = localStorage.getItem('kanban_data');
        this.tasksList = savedData ? JSON.parse(savedData) : [];

        // Получаем ссылки на элементы DOM
        this.form = document.getElementById('task-form');
        this.titleInput = document.getElementById('task-title');
        this.statusSelect = document.getElementById('task-status');
        this.deadlineInput = document.getElementById('task-deadline');
        this.errorMessage = document.getElementById('error-message');
        this.board = document.querySelector('.board');

        // Привязываем контекст (this) к методам-обработчикам
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleBoardClick = this.handleBoardClick.bind(this);

        // Назначаем слушатели событий
        this.form.addEventListener('submit', this.handleSubmit);
        
        // --- ЭТАП 3.2: Делегирование событий на контейнер доски ---
        this.board.addEventListener('click', this.handleBoardClick);

        // Первоначальный рендеринг при загрузке
        this.renderTasks();
    }

    // --- ЭТАП 4.1: Сохранение (Save) ---
    saveToLocalStorage() {
        localStorage.setItem('kanban_data', JSON.stringify(this.tasksList));
    }

    // --- ЭТАП 2.2 и 2.3: Обработка формы и Валидация ---
    handleSubmit(event) {
        event.preventDefault(); // Отменяем перезагрузку страницы

        const title = this.titleInput.value.trim();

        // Валидация
        if (title.length < 3) {
            this.errorMessage.classList.remove('error-hidden');
            return; // Прерываем выполнение
        }
        
        // Скрываем ошибку, если всё ок
        this.errorMessage.classList.add('error-hidden');

        // --- ЭТАП 2.4: Генерация объекта ---
        const newTask = {
            id: Date.now(), // Уникальный ID
            title: title,
            status: this.statusSelect.value,
            deadline: this.deadlineInput.value
        };

        this.tasksList.push(newTask);
        this.saveToLocalStorage(); // Сохраняем изменения
        this.renderTasks();        // Перерисовываем доску
        this.form.reset();         // Очищаем форму
    }

    // --- ЭТАП 2.4 и 4.3: Генерация DOM-узлов и Подсветка дедлайнов ---
    createTaskElement(task) {
        // Создаем пустой div для карточки
        const card = document.createElement('div');
        card.classList.add('task-card');
        card.dataset.id = task.id; // Обязательно записываем id в dataset

        // Логика дедлайнов (Этап 4.3)
        if (task.deadline) {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Обнуляем время для корректного сравнения дат
            const deadlineDate = new Date(task.deadline);
            
            // Разница в миллисекундах переводится в дни
            const diffTime = deadlineDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays < 0) {
                card.classList.add('overdue'); // Просрочено
            } else if (diffDays === 0 || diffDays === 1) {
                card.classList.add('warning'); // Остался 1 день или сегодня
            }
        }

        // --- ЭТАП 3.1: Кнопки удаления и перемещения ---
        let moveButtonText = task.status === 'todo' ? 'В работу →' : 
                             task.status === 'in-progress' ? 'Завершить →' : '';
                             
        const moveBtnHTML = moveButtonText ? `<button class="btn-move" data-action="move">${moveButtonText}</button>` : `<div></div>`;

        // Наполняем карточку HTML кодом
        card.innerHTML = `
            <div class="task-title">${task.title}</div>
            <div class="task-deadline">${task.deadline ? 'Дедлайн: ' + task.deadline : 'Без дедлайна'}</div>
            <div class="task-actions">
                ${moveBtnHTML}
                <button class="btn-delete" data-action="delete">Удалить ✕</button>
            </div>
        `;

        return card; // Возвращаем готовый DOM-узел
    }

    // --- ЭТАП 2.5: Рендеринг ---
    renderTasks() {
        // 1. Очищаем содержимое всех колонок
        document.querySelectorAll('.column-content').forEach(col => col.innerHTML = '');

        // 2. Проходимся по массиву задач
        this.tasksList.forEach(task => {
            // 3. Вызываем функцию создания DOM-узла
            const taskElement = this.createTaskElement(task);
            
            // Находим нужную колонку по data-status и помещаем туда карточку
            const column = document.querySelector(`.column[data-status="${task.status}"] .column-content`);
            if (column) {
                column.appendChild(taskElement);
            }
        });
    }

    // --- ЭТАП 3.3 и 3.4: Обработка кликов (Делегирование) ---
    handleBoardClick(event) {
        // Находим ближайшую карточку, по которой кликнули
        const card = event.target.closest('.task-card');
        if (!card) return; // Если клик не по карточке - игнорируем

        const taskId = Number(card.dataset.id); // Считываем ID из data-id

        // Если клик по кнопке "Удалить"
        if (event.target.dataset.action === 'delete') {
            this.tasksList = this.tasksList.filter(task => task.id !== taskId);
            this.saveToLocalStorage();
            this.renderTasks();
        }

        // Если клик по кнопке "Переместить"
        if (event.target.dataset.action === 'move') {
            const task = this.tasksList.find(t => t.id === taskId);
            
            // Меняем статус логически
            if (task.status === 'todo') {
                task.status = 'in-progress';
            } else if (task.status === 'in-progress') {
                task.status = 'done';
            }
            
            this.saveToLocalStorage();
            this.renderTasks();
        }
    }
}

const app = new KanbanBoard();