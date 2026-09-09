namespace ToDoWebApi.Domains;

public class TodoItem
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public bool IsCompleted { get; set; }
}