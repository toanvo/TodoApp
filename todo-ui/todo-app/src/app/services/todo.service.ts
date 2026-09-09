import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TodoItem } from '../models/TodoItem';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5190/api/todoitems';

  getTodos(): Observable<TodoItem[]> {
    return this.http.get<TodoItem[]>(this.apiUrl);
  }

  addTodo(title: string): Observable<TodoItem> {
    return this.http.post<TodoItem>(this.apiUrl, JSON.stringify(title), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  updateTodo(id: string, title: string): Observable<TodoItem> {
    return this.http.put<TodoItem>(`${this.apiUrl}/${id}`, JSON.stringify(title), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
