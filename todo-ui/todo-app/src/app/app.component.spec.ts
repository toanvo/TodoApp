import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AppComponent } from './app.component';
import { TodoService } from './services/todo.service';
import { TodoItem } from './models/TodoItem';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let todoService: {
    getTodos: ReturnType<typeof vi.fn>;
    addTodo: ReturnType<typeof vi.fn>;
    deleteTodo: ReturnType<typeof vi.fn>;
  };

  const mockTodos: TodoItem[] = [
    {
      id: '1',
      title: 'Learn Angular',
      isCompleted: false
    },
    {
      id: '2',
      title: 'Write unit tests',
      isCompleted: false
    }
  ];

  beforeEach(async () => {
    todoService = {
      getTodos: vi.fn(),
      addTodo: vi.fn(),
      deleteTodo: vi.fn()
    };

    todoService.getTodos.mockReturnValue(of(mockTodos));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: TodoService,
          useValue: todoService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // ============================================================
  // Component creation
  // ============================================================

  describe('Component creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with an empty todo title', () => {
      expect(component.newTodoTitle()).toBe('');
    });

    it('should load todos during initialization', () => {
      expect(todoService.getTodos).toHaveBeenCalledTimes(1);
      expect(component.todos()).toEqual(mockTodos);
    });
  });

  // ============================================================
  // Template rendering
  // ============================================================

  describe('Template', () => {
    it('should display the page title', () => {
      const heading = fixture.nativeElement.querySelector('h1');

      expect(heading).toBeTruthy();
      expect(heading.textContent.trim()).toBe('My TODO List');
    });

    it('should display all todos', () => {
      const todoElements =
        fixture.nativeElement.querySelectorAll('.todo-list li');

      expect(todoElements.length).toBe(2);
      expect(todoElements[0].textContent).toContain('Learn Angular');
      expect(todoElements[1].textContent).toContain('Write unit tests');
    });

    it('should display the empty message when there are no todos', () => {
      component.todos.set([]);

      fixture.detectChanges();

      const emptyMessage =
        fixture.nativeElement.querySelector('.todo-list p');

      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent.trim())
        .toBe('Your list is empty! Add a task above.');
    });

    it('should not display the empty message when todos exist', () => {
      const emptyMessage =
        fixture.nativeElement.querySelector('.todo-list p');

      expect(emptyMessage).toBeNull();
    });

    it('should render a delete button for every todo', () => {
      const deleteButtons =
        fixture.nativeElement.querySelectorAll('.delete-btn');

      expect(deleteButtons.length).toBe(2);
    });
  });

  // ============================================================
  // Input / ngModel
  // ============================================================

  describe('Todo title input', () => {
    it('should initially have an empty input', () => {
      const input =
        fixture.nativeElement.querySelector('input');

      expect(input.value).toBe('');
    });

    it('should update the signal when the user enters text', () => {
      const input =
        fixture.nativeElement.querySelector('input');

      input.value = 'Buy milk';
      input.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      expect(component.newTodoTitle()).toBe('Buy milk');
    });

    it('should update the input when the signal changes', async () => {
      component.newTodoTitle.set('Learn Angular');
      await fixture.whenStable();
      fixture.detectChanges();
      
      const input =
        fixture.nativeElement.querySelector('input');

      expect(input.value).toBe('Learn Angular');
    });
  });

  // ============================================================
  // Add button
  // ============================================================

  describe('Add button', () => {
    it('should be disabled when the title is empty', () => {
      component.newTodoTitle.set('');

      fixture.detectChanges();

      const button =
        fixture.nativeElement.querySelector(
          '.input-group button'
        ) as HTMLButtonElement;

      expect(button.disabled).toBe(true);
    });

    it('should be disabled when the title contains only whitespace', () => {
      component.newTodoTitle.set('   ');

      fixture.detectChanges();

      const button =
        fixture.nativeElement.querySelector(
          '.input-group button'
        ) as HTMLButtonElement;

      expect(button.disabled).toBe(true);
    });

    it('should be enabled when the title contains text', () => {
      component.newTodoTitle.set('Buy milk');

      fixture.detectChanges();

      const button =
        fixture.nativeElement.querySelector(
          '.input-group button'
        ) as HTMLButtonElement;

      expect(button.disabled).toBe(false);
    });

    it('should call addTodo when the Add button is clicked', () => {
      const addTodoSpy = vi
        .spyOn(component, 'addTodo')
        .mockImplementation(() => {});

      component.newTodoTitle.set('Buy milk');

      fixture.detectChanges();

      const button =
        fixture.nativeElement.querySelector(
          '.input-group button'
        ) as HTMLButtonElement;

      button.click();

      expect(addTodoSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // Enter key
  // ============================================================

  describe('Enter key', () => {
    it('should call addTodo when Enter is pressed', () => {
      const addTodoSpy = vi
        .spyOn(component, 'addTodo')
        .mockImplementation(() => {});

      const input =
        fixture.nativeElement.querySelector('input');

      input.dispatchEvent(
        new KeyboardEvent('keyup', {
          key: 'Enter'
        })
      );

      expect(addTodoSpy).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================================
  // loadTodos()
  // ============================================================

  describe('loadTodos', () => {
    it('should update todos when the service succeeds', () => {
      const todos: TodoItem[] = [
        {
          id: '3',
          title: 'New task',
          isCompleted: false
        }
      ];

      todoService.getTodos.mockReturnValue(of(todos));

      component.loadTodos();

      expect(component.todos()).toEqual(todos);
    });

    it('should handle an error when loading todos', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const error = new Error('Failed to fetch todos');

      todoService.getTodos.mockReturnValue(
        throwError(() => error)
      );

      component.loadTodos();

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to fetch todos',
        error
      );

      consoleError.mockRestore();
    });
  });

  // ============================================================
  // addTodo()
  // ============================================================

  describe('addTodo', () => {
    it('should not call the service when the title is empty', () => {
      component.newTodoTitle.set('');

      component.addTodo();

      expect(todoService.addTodo).not.toHaveBeenCalled();
    });

    it('should not call the service when the title is whitespace', () => {
      component.newTodoTitle.set('   ');

      component.addTodo();

      expect(todoService.addTodo).not.toHaveBeenCalled();
    });

    it('should trim the title before calling the service', () => {
      const newTodo: TodoItem = {
        id: '3',
        title: 'Buy milk',
        isCompleted: false
      };

      todoService.addTodo.mockReturnValue(of(newTodo));

      component.newTodoTitle.set('  Buy milk  ');

      component.addTodo();

      expect(todoService.addTodo)
        .toHaveBeenCalledWith('Buy milk');
    });

    it('should add the new todo to the signal', () => {
      const newTodo: TodoItem = {
        id: '3',
        title: 'Buy milk',
        isCompleted: false
      };

      todoService.addTodo.mockReturnValue(of(newTodo));

      component.newTodoTitle.set('Buy milk');

      component.addTodo();

      expect(component.todos()).toEqual([
        ...mockTodos,
        newTodo
      ]);
    });

    it('should clear the input after successfully adding a todo', () => {
      const newTodo: TodoItem = {
        id: '3',
        title: 'Buy milk',
        isCompleted: false
      };

      todoService.addTodo.mockReturnValue(of(newTodo));

      component.newTodoTitle.set('Buy milk');

      component.addTodo();

      expect(component.newTodoTitle()).toBe('');
    });

    it('should handle an error when adding a todo', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const error = new Error('Failed to add todo');

      todoService.addTodo.mockReturnValue(
        throwError(() => error)
      );

      component.newTodoTitle.set('Buy milk');

      component.addTodo();

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to add todo',
        error
      );

      // The title should remain because the operation failed.
      expect(component.newTodoTitle()).toBe('Buy milk');

      consoleError.mockRestore();
    });
  });

  // ============================================================
  // Add todo - DOM interaction
  // ============================================================

  describe('Add todo - DOM interaction', () => {
    it('should add a todo when the user enters a title and clicks Add', async () => {
      const newTodo: TodoItem = {
        id: '3',
        title: 'Buy groceries',
        isCompleted: false
      };

      todoService.addTodo.mockReturnValue(of(newTodo));

      const input =
        fixture.nativeElement.querySelector('input');

      const button =
        fixture.nativeElement.querySelector(
          '.input-group button'
        ) as HTMLButtonElement;

      input.value = 'Buy groceries';
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      fixture.detectChanges();
      
      expect(button.disabled).toBe(false);

      button.click();
      
      fixture.detectChanges();

      await fixture.whenStable();

      expect(todoService.addTodo)
        .toHaveBeenCalledWith('Buy groceries');

      const todoElements =
        fixture.nativeElement.querySelectorAll('.todo-list li');

      expect(todoElements.length).toBe(3);
      expect(todoElements[2].textContent)
        .toContain('Buy groceries');
    });

    it('should clear the input after adding a todo through the UI', async () => {
      const newTodo: TodoItem = {
        id: '3',
        title: 'Buy groceries',
        isCompleted: false
      };

      todoService.addTodo.mockReturnValue(of(newTodo));

      const input =
        fixture.nativeElement.querySelector('input');

      const button =
        fixture.nativeElement.querySelector(
          '.input-group button'
        ) as HTMLButtonElement;

      input.value = 'Buy groceries';
      input.dispatchEvent(new Event('input'));

      fixture.detectChanges();

      button.click();

      await fixture.detectChanges();
      fixture.whenStable();
      expect(input.value).toBe('');
    });
  });

  // ============================================================
  // deleteTodo()
  // ============================================================

  describe('deleteTodo', () => {
    it('should call the service with the correct id', () => {
      todoService.deleteTodo.mockReturnValue(of(void 0));

      component.deleteTodo('1');

      expect(todoService.deleteTodo)
        .toHaveBeenCalledWith('1');
    });

    it('should remove the todo after successful deletion', () => {
      todoService.deleteTodo.mockReturnValue(of(void 0));

      component.todos.set(mockTodos);

      component.deleteTodo('1');

      expect(component.todos()).toEqual([
        mockTodos[1]
      ]);
    });

    it('should not remove the todo when deletion fails', () => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const error = new Error('Failed to delete todo');

      todoService.deleteTodo.mockReturnValue(
        throwError(() => error)
      );

      component.todos.set(mockTodos);

      component.deleteTodo('1');

      expect(component.todos()).toEqual(mockTodos);

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to delete todo',
        error
      );

      consoleError.mockRestore();
    });
  });

  // ============================================================
  // Delete todo - DOM interaction
  // ============================================================

  describe('Delete todo - DOM interaction', () => {
    it('should delete the correct todo when Delete is clicked', () => {
      todoService.deleteTodo.mockReturnValue(of(void 0));

      const deleteButtons =
        fixture.nativeElement.querySelectorAll('.delete-btn');

      expect(deleteButtons.length).toBe(2);

      // Delete "Learn Angular"
      deleteButtons[0].click();

      fixture.detectChanges();

      expect(todoService.deleteTodo)
        .toHaveBeenCalledWith('1');

      const todoElements =
        fixture.nativeElement.querySelectorAll('.todo-list li');

      expect(todoElements.length).toBe(1);
      expect(todoElements[0].textContent)
        .toContain('Write unit tests');

      expect(todoElements[0].textContent)
        .not.toContain('Learn Angular');
    });

    it('should update the empty state after deleting the last todo', async () => {
      const singleTodo: TodoItem[] = [
        {
          id: '1',
          title: 'Learn Angular',
          isCompleted: false
        }
      ];

      component.todos.set(singleTodo);

      todoService.deleteTodo.mockReturnValue(of(void 0));

      fixture.detectChanges();

      const deleteButton =
        fixture.nativeElement.querySelector(
          '.delete-btn'
        ) as HTMLButtonElement;

      deleteButton.click();

      await fixture.whenStable();

      fixture.detectChanges();

      const emptyMessage =
        fixture.nativeElement.querySelector('.todo-list p');

      expect(emptyMessage).toBeTruthy();
      expect(emptyMessage.textContent.trim())
        .toBe('Your list is empty! Add a task above.');
    });

    it('should keep the todo visible when deletion fails', () => {
      vi.spyOn(console, 'error')
        .mockImplementation(() => {});

      todoService.deleteTodo.mockReturnValue(
        throwError(() => new Error('Delete failed'))
      );

      fixture.detectChanges();

      const deleteButton =
        fixture.nativeElement.querySelector(
          '.delete-btn'
        ) as HTMLButtonElement;

      deleteButton.click();

      fixture.detectChanges();

      const todoElements =
        fixture.nativeElement.querySelectorAll('.todo-list li');

      expect(todoElements.length).toBe(2);
      expect(todoElements[0].textContent)
        .toContain('Learn Angular');
    });
  });
});


