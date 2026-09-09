
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;
using ToDoWebApi.Domains;
using ToDoWebApi.Services;
using ToDoWebApi.Controllers;


namespace ToDoWebApi.Tests.Controllers;

public class TodoItemsControllerTests
{
    private readonly Mock<ITodoService> _todoServiceMock;
    private readonly TodoItemsController _controller;

    public TodoItemsControllerTests()
    {
        _todoServiceMock = new Mock<ITodoService>();
        _controller = new TodoItemsController(_todoServiceMock.Object);
    }

    [Fact]
    public void Get_ShouldReturnOk_WithTodoItems()
    {
        // Arrange
        var todos = new[]
        {
            new TodoItem { Id = Guid.NewGuid(), Title = "Todo 1" },
            new TodoItem { Id = Guid.NewGuid(), Title = "Todo 2" }
        };

        _todoServiceMock
            .Setup(x => x.GetAll())
            .Returns(todos);

        // Act
        var result = _controller.GetTodoItems();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var returnedTodos =
            Assert.IsAssignableFrom<IEnumerable<TodoItem>>(okResult.Value);

        Assert.Equal(2, returnedTodos.Count());

        _todoServiceMock.Verify(
            x => x.GetAll(),
            Times.Once);
    }

    [Fact]
    public void Get_ShouldReturnOk_WhenTodoExists()
    {
        var newGuid = Guid.NewGuid();
        // Arrange
        var todo = new TodoItem
        {
            Id = newGuid,
            Title = "Buy milk"
        };

        _todoServiceMock
            .Setup(x => x.GetById(newGuid))
            .Returns(todo);

        // Act
        var result = _controller.GetTodoItem(newGuid);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);

        var returnedTodo =
            Assert.IsType<TodoItem>(okResult.Value);

        Assert.Equal(newGuid, returnedTodo.Id);
        Assert.Equal("Buy milk", returnedTodo.Title);

        _todoServiceMock.Verify(
            x => x.GetById(newGuid),
            Times.Once);
    }

    [Fact]
    public void Get_ShouldReturnNotFound_WhenTodoDoesNotExist()
    {
        var newGuid = Guid.NewGuid();
        // Arrange
        _todoServiceMock
            .Setup(x => x.GetById(newGuid))
            .Returns((TodoItem?)null);

        // Act
        var result = _controller.GetTodoItem(newGuid);

        // Assert
        Assert.IsType<NotFoundResult>(result.Result);

        _todoServiceMock.Verify(
            x => x.GetById(newGuid),
            Times.Once);
    }

    [Fact]
    public void Post_ShouldReturnCreatedAtAction_WithCreatedTodo()
    {
        var newGuid = Guid.NewGuid();
        // Arrange
        var todo = new TodoItem
        {
            Title = "Buy milk"
        };

        var createdTodo = new TodoItem
        {
            Id = newGuid,
            Title = "Buy milk"
        };

        _todoServiceMock
            .Setup(x => x.Create(todo.Title))
            .Returns(createdTodo);

        // Act
        var result = _controller.CreateTodoItem(todo.Title);

        // Assert
        var createdResult =
            Assert.IsType<CreatedAtActionResult>(result.Result);

        Assert.Equal(nameof(TodoItemsController.CreateTodoItem), createdResult.ActionName);
        Assert.Equal(createdTodo, createdResult.Value);

        Assert.NotNull(createdResult.RouteValues);
        Assert.Equal(newGuid, createdResult.RouteValues["id"]);

        _todoServiceMock.Verify(
            x => x.Create(todo.Title),
            Times.Once);
    }

    [Fact]
    public void Delete_ShouldReturnNoContent_WhenTodoExists()
    {
        var newGuid = Guid.NewGuid();
        // Arrange
        _todoServiceMock
            .Setup(x => x.Delete(newGuid))
            .Returns(true);

        // Act
        var result = _controller.DeleteTodoItem(newGuid);

        // Assert
        Assert.IsType<NoContentResult>(result);

        _todoServiceMock.Verify(
            x => x.Delete(newGuid),
            Times.Once);
    }

    [Fact]
    public void Delete_ShouldReturnNotFound_WhenTodoDoesNotExist()
    {
        var newGuid = Guid.NewGuid();
        // Arrange
        _todoServiceMock
            .Setup(x => x.Delete(newGuid))
            .Returns(false);

        // Act
        var result = _controller.DeleteTodoItem(newGuid);

        // Assert
        Assert.IsType<NotFoundResult>(result);

        _todoServiceMock.Verify(
            x => x.Delete(newGuid),
            Times.Once);
    }
}