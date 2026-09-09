import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from './services/todo.service';
import { TodoItem } from './models/TodoItem';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  template: ` <div class="container">
    <h1>My TODO List</h1>
    <!-- Add Todo -->
    <div class="input-group">
      <input
        type="text"
        [(ngModel)]="newTodoTitle"
        (keyup.enter)="addTodo()"
        placeholder="What needs to be done?"
      />
      <button (click)="addTodo()" [disabled]="!newTodoTitle().trim()">Add</button>
    </div>
    <!-- Todo List -->
    <ul class="todo-list">
      @for (todo of todos(); track todo.id) {
        <li>
          @if (editingTodoId() === todo.id) {
            <!-- Edit Mode -->
            <div class="edit-group">
              <input
                type="text"
                [(ngModel)]="editTitle"
                (keyup.enter)="saveTodo(todo.id)"
                (keyup.escape)="cancelEdit()"
              />
              <button class="save-btn" (click)="saveTodo(todo.id)" [disabled]="!editTitle().trim()">
                Save
              </button>
              <button class="cancel-btn" (click)="cancelEdit()">Cancel</button>
            </div>
          } @else {
            <!-- Display Mode -->
            <span class="todo-title"> {{ todo.title }} </span>
            <div class="actions">
              <button class="edit-btn" (click)="startEdit(todo)">Edit</button>
              <button class="delete-btn" (click)="deleteTodo(todo.id)">Delete</button>
            </div>
          }
        </li>
      } @empty {
        <p>Your list is empty! Add a task above.</p>
      }
    </ul>
  </div>`,
  styles: [
    `
      .container {
        max-width: 600px;
        margin: 2rem auto;
        font-family: sans-serif;
      }
      .input-group {
        display: flex;
        gap: 10px;
        margin-bottom: 1rem;
      }
      input {
        flex: 1;
        padding: 8px;
        font-size: 1rem;
      }
      button {
        padding: 8px 16px;
        cursor: pointer;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
      }
      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }
      ul {
        list-style: none;
        padding: 0;
      }
      li {
        display: flex;
        justify-content: space-between;
        padding: 10px;
        border-bottom: 1px solid #eee;
        align-items: center;
        gap: 10px;
      }
      .todo-title {
        flex: 1;
      }
      .actions {
        display: flex;
        gap: 5px;
      }
      .edit-group {
        display: flex;
        width: 100%;
        gap: 5px;
      }
      .edit-group input {
        flex: 1;
      }
      .edit-btn {
        background: #6c757d;
        padding: 4px 8px;
      }
      .save-btn {
        background: #28a745;
        padding: 4px 8px;
      }
      .cancel-btn {
        background: #6c757d;
        padding: 4px 8px;
      }
      .delete-btn {
        background: #dc3545;
        padding: 4px 8px;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private todoService = inject(TodoService);

  todos = signal<TodoItem[]>([]);
  newTodoTitle = signal('');

  // Editing state
  editingTodoId = signal<string | null>(null);
  editTitle = signal('');

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe({
      next: (data) => this.todos.set(data),
      error: (err) => console.error('Failed to fetch todos', err),
    });
  }

  addTodo(): void {
    const title = this.newTodoTitle().trim();
    if (!title) return;

    this.todoService.addTodo(title).subscribe({
      next: (newTodo) => {
        this.todos.update((current) => [...current, newTodo]);
        this.newTodoTitle.set('');
      },
      error: (err) => console.error('Failed to add todo', err),
    });
  }

  startEdit(todo: TodoItem): void {
    this.editingTodoId.set(todo.id);
    this.editTitle.set(todo.title);
  }

  cancelEdit(): void {
    this.editingTodoId.set(null);
    this.editTitle.set('');
  }

  saveTodo(id: string): void {
    const title = this.editTitle().trim();
    if (!title) return;
    this.todoService.updateTodo(id, title).subscribe({
      next: (updatedTodo) => {
        this.todos.update((current) =>
          current.map((todo) => (todo.id === id ? updatedTodo : todo)),
        );
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Failed to update todo', err);
      },
    });
  }

  deleteTodo(id: string): void {
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos.update((current) => current.filter((t) => t.id !== id));
      },
      error: (err) => console.error('Failed to delete todo', err),
    });
  }
}
