using Microsoft.AspNetCore.Mvc;
using ToDoWebApi.Domains;
using ToDoWebApi.Services;

namespace ToDoWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodoItemsController : ControllerBase
{
    private readonly ITodoService _todoService;

    public TodoItemsController(ITodoService todoService)
    {
        _todoService = todoService;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public ActionResult<IEnumerable<TodoItem>> GetTodoItems()
    {
        var items = _todoService.GetAll();

        return Ok(items);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<TodoItem> GetTodoItem(Guid id)
    {
        var item = _todoService.GetById(id);

        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<TodoItem> CreateTodoItem([FromBody] string title)
    {
        var createdItem = _todoService.Create(title);

        return CreatedAtAction(
            nameof(CreateTodoItem),
            new { id = createdItem.Id },
            createdItem);
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public ActionResult<TodoItem> UpdateTodoItem(
        Guid id,
        [FromBody] string title)
    {
        var updatedItem = _todoService.Update(new TodoItem
        {
            Id = id,
            Title = title
        });
        return Ok(updatedItem);
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public IActionResult DeleteTodoItem(Guid id)
    {
        var deleted = _todoService.Delete(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}