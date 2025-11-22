/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
type Filter = 'all' | 'active' | 'completed';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getTodos();

      setTodos(data || []);
    } catch {
      setError('Unable to load todos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!mounted) {
        return;
      }

      await loadTodos();
    })();

    return () => {
      mounted = false;
    };
  }, [loadTodos]);

  useEffect(() => {
    if (!error) {
      return;
    }

    const id = window.setTimeout(() => {
      setError(null);
    }, 3000);

    return () => {
      clearTimeout(id);
    };
  }, [error]);

  const visibleTodos = useMemo(() => {
    return todos.filter(todo => {
      if (filter === 'all') {
        return true;
      }

      if (filter === 'active') {
        return !todo.completed;
      }

      return todo.completed;
    });
  }, [todos, filter]);

  const activeCount = useMemo(
    () => todos.filter(t => !t.completed).length,
    [todos],
  );

  const completedCount = useMemo(
    () => todos.filter(t => t.completed).length,
    [todos],
  );

  const onSetFilter = (next: Filter) => (e: React.MouseEvent) => {
    e.preventDefault();
    setFilter(next);
  };

  const toggleAllActive = todos.length > 0 && todos.every(t => t.completed);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            type="button"
            className={`todoapp__toggle-all ${toggleAllActive ? 'active' : ''}`}
            data-cy="ToggleAllButton"
            //  toggle all
          />

          <form
            onSubmit={e => {
              e.preventDefault();
              // додавання todo
            }}
          >
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {loading && (
            <div className="todoapp__loading">
              {/* Можеш використати існуючий loader або свій */}
              Loading...
            </div>
          )}

          {!loading && visibleTodos.length === 0 && todos.length === 0 && (
            <div className="todoapp__empty">No todos</div>
          )}

          {!loading &&
            visibleTodos.map(todo => (
              <div
                key={todo.id}
                data-cy="Todo"
                className={`todo ${todo.completed ? 'completed' : ''}`}
              >
                <label className="todo__status-label">
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                    readOnly
                    // onChange, який викликатиме client.patch(...)
                  />
                </label>

                <span data-cy="TodoTitle" className="todo__title">
                  {todo.title}
                </span>

                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                  // видалення
                >
                  ×
                </button>

                {/* TODO: покривати цей overlay під час операцій з цим todo */}
                <div data-cy="TodoLoader" className="modal overlay">
                  <div className="modal-background has-background-white-ter" />
                  <div className="loader" />
                </div>
              </div>
            ))}
        </section>

        {todos.length > 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              {activeCount} item{activeCount !== 1 ? 's' : ''} left
            </span>

            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filter === 'all' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={onSetFilter('all')}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${filter === 'active' ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={onSetFilter('active')}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${filter === 'completed' ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={onSetFilter('completed')}
              >
                Completed
              </a>
            </nav>

            <button
              type="button"
              className="todoapp__clear-completed"
              data-cy="ClearCompletedButton"
              disabled={completedCount === 0}
              // onClick={() => clearCompleted()}
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* Notification: додавай клас hidden коли немає помилки */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${
          error ? '' : 'hidden'
        }`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setError(null)}
        />
        {error ?? (
          <>
            Unable to load todos
            <br />
            Title should not be empty
            <br />
            Unable to add a todo
            <br />
            Unable to delete a todo
            <br />
            Unable to update a todo
          </>
        )}
      </div>
    </div>
  );
};
