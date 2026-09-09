using ToDoWebApi.Domains;

namespace ToDoWebApi.Services;

public interface ITodoService
{
    IEnumerable<TodoItem> GetAll();

    TodoItem GetById(Guid id);

    TodoItem Create(string title);

    TodoItem Update(TodoItem item);

    bool Delete(Guid id);
}