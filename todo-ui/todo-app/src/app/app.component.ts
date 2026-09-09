import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from './services/todo.service';
import { TodoItem } from './models/TodoItem';

@Component({
  selector: 'app-root',  
  imports: [FormsModule],
  template: `
    <div class="container">
      <h1>My TODO List</h1>
      
      <div class="input-group">
        <input 
          type="text" 
          [(ngModel)]="newTodoTitle" 
          (keyup.enter)="addTodo()"
          placeholder="What needs to be done?" 
        />
        <button (click)="addTodo()" [disabled]="!newTodoTitle().trim()">Add</button>
      </div>

      <ul class="todo-list">
        @for (todo of todos(); track todo.id) {
          <li>
            <span>{{ todo.title }}</span>
            <button class="delete-btn" (click)="deleteTodo(todo.id)">Delete</button>
          </li>
        }
        @empty {
          <p>Your list is empty! Add a task above.</p>
        }
      </ul>
    </div>
  `,
  styles: [`
    .container { max-width: 500px; margin: 2rem auto; font-family: sans-serif; }
    .input-group { display: flex; gap: 10px; margin-bottom: 1rem; }
    input { flex: 1; padding: 8px; font-size: 1rem; }
    button { padding: 8px 16px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px; }
    button:disabled { background: #ccc; }
    .delete-btn { background: #dc3545; padding: 4px 8px; color: white; border: none; border-radius: 4px; cursor: pointer; }
    ul { list-style: none; padding: 0; }
    li { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; align-items: center; }
  `]
})
export class AppComponent implements OnInit {
  private todoService = inject(TodoService);
  
  todos = signal<TodoItem[]>([]);
  // Binding forms directly to WritableSignals
  newTodoTitle = signal('');

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe({
      next: (data) => this.todos.set(data),
      error: (err) => console.error('Failed to fetch todos', err)
    });
  }

  addTodo(): void {
    const title = this.newTodoTitle().trim();
    if (!title) return;

    this.todoService.addTodo(title).subscribe({
      next: (newTodo) => {
        this.todos.update(current => [...current, newTodo]);
        this.newTodoTitle.set('');
      },
      error: (err) => console.error('Failed to add todo', err)
    });
  }

  deleteTodo(id: string): void {
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos.update(current => current.filter(t => t.id !== id));
      },
      error: (err) => console.error('Failed to delete todo', err)
    });
  }
}