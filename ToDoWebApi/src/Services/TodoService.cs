
using System.Collections.Concurrent;
using ToDoWebApi.Domains;

namespace ToDoWebApi.Services;

public class TodoService : ITodoService
{
    private readonly ConcurrentDictionary<Guid, TodoItem> _todos = new();

    public IEnumerable<TodoItem> GetAll() => _todos.Values;

    public TodoItem Create(string title)
    {
        if (string.IsNullOrEmpty(title))
        {
            throw new ArgumentException("The title of Todo item cannot be null.");
        }

        var newTodoItem = new TodoItem
        {
            Id = Guid.NewGuid(),
            Title = title,
            IsCompleted = false
        };

        if (!_todos.TryAdd(newTodoItem.Id, newTodoItem))
        {
            throw new InvalidOperationException(
                $"Could not add todo item with id {newTodoItem.Id}");
        }

        return newTodoItem;
    }

    public TodoItem Update(TodoItem item)
    {
        ArgumentNullException.ThrowIfNull(item);

        if (!_todos.TryGetValue(item.Id, out var existingItem))
        {
            throw new KeyNotFoundException(
                $"Could not find the todo item with id {item.Id}");
        }

        var updatedItem = new TodoItem
        {
            Id = existingItem.Id,
            Title = item.Title,
            IsCompleted = item.IsCompleted
        };

        if (!_todos.TryUpdate(item.Id, updatedItem, existingItem))
        {
            throw new InvalidOperationException(
                $"The todo item with id {item.Id} was modified concurrently.");
        }

        return updatedItem;
    }

    public bool Delete(Guid id)
    {
        return _todos.TryRemove(id, out _);
    }

    public TodoItem GetById(Guid id)
    {
        if (!_todos.TryGetValue(id, out var existingItem))
        {
            throw new KeyNotFoundException(
                $"Could not find the todo item with id {id}");
        }

        return existingItem;
    }
}