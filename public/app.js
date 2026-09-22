document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const list = document.getElementById('todo-list');
  const counter = document.getElementById('items-counter');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  let todos = [];
  let currentFilter = 'all';

  // Fetch all tasks (Read)
  const fetchTodos = async () => {
    try {
      const response = await fetch('/api/todos');
      todos = await response.json();
      render();
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  // Create task
  const addTodo = async (text) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (response.ok) {
        const newTodo = await response.json();
        todos.push(newTodo);
        render();
      }
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  // Toggle status (Update)
  const toggleTodo = async (id, completed) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (response.ok) {
        const updated = await response.json();
        todos = todos.map(t => t.id === id ? updated : t);
        render();
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // Edit task text (Update)
  const updateTodoText = async (id, text) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (response.ok) {
        const updated = await response.json();
        todos = todos.map(t => t.id === id ? updated : t);
        render();
      }
    } catch (error) {
      console.error('Failed to update task content:', error);
    }
  };

  // Delete task (Delete)
  const deleteTodo = async (id, element) => {
    element.classList.add('deleting');
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
        if (response.ok) {
          todos = todos.filter(t => t.id !== id);
          render();
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }, 150);
  };

  // Clear completed tasks (Bulk Delete)
  const clearCompleted = async () => {
    try {
      const response = await fetch('/api/todos?scope=completed', { method: 'DELETE' });
      if (response.ok) {
        todos = todos.filter(t => !t.completed);
        render();
      }
    } catch (error) {
      console.error('Failed to clear completed tasks:', error);
    }
  };

  // Enable inline editing mode
  const startEditing = (todo, spanElement) => {
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = todo.text;

    spanElement.replaceWith(editInput);
    editInput.focus();

    const save = () => {
      const newText = editInput.value.trim();
      if (newText && newText !== todo.text) {
        updateTodoText(todo.id, newText);
      } else {
        render();
      }
    };

    editInput.addEventListener('blur', save);
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') save();
      if (e.key === 'Escape') render();
    });
  };

  // Render task list
  const render = () => {
    list.innerHTML = '';

    const filtered = todos.filter(t => {
      if (currentFilter === 'active') return !t.completed;
      if (currentFilter === 'completed') return t.completed;
      return true;
    });

    if (filtered.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'empty-state';
      emptyLi.textContent = 'No tasks found.';
      list.appendChild(emptyLi);
    } else {
      filtered.forEach(todo => {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'todo-content';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'todo-checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(todo.id, checkbox.checked));

        const span = document.createElement('span');
        span.className = 'todo-text';
        span.textContent = todo.text;
        span.title = "Click to edit";
        span.addEventListener('dblclick', () => startEditing(todo, span));

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(span);

        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'actions-group';

        const editBtn = document.createElement('button');
        editBtn.className = 'action-btn';
        editBtn.textContent = 'edit';
        editBtn.addEventListener('click', () => startEditing(todo, span));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn';
        deleteBtn.textContent = 'delete';
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id, li));

        actionsGroup.appendChild(editBtn);
        actionsGroup.appendChild(deleteBtn);

        li.appendChild(contentDiv);
        li.appendChild(actionsGroup);
        list.appendChild(li);
      });
    }

    const activeCount = todos.filter(t => !t.completed).length;
    counter.textContent = `${activeCount} ${activeCount === 1 ? 'item' : 'items'} remaining`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (text) {
      addTodo(text);
      input.value = '';
    }
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  fetchTodos();
});