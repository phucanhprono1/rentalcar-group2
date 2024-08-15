import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Observable, forkJoin, throwError} from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService<T> {
  constructor(private http: HttpClient) {
  }
  get<R>(url: string, mapFunc?: (response: any) => R): Observable<R> {
    return this.http.get<any>(url).pipe(
      map(mapFunc ? mapFunc : (data) => data as R),
      catchError(this.handleError)
    );
  }

  getAll(url: string, mapFunc?: (response: any) => T[]): Observable<T[]> {
    return this.http.get<any>(url).pipe(
      map(mapFunc ? mapFunc : (data) => data as T[]),
      catchError(this.handleError)
    );
  }

  getById(url: string, id: String, mapFunc?: (response: any) => T): Observable<T> {
    const apiUrl = `${url}/${id}`;
    return this.http.get<any>(apiUrl).pipe(
      map(mapFunc ? mapFunc : (data) => data as T),
      catchError(this.handleError)
    );
  }
  search(url: string, searchParams: { [key: string]: string | string[] }, mapFunc?: (response: any) => T[]): Observable<T[]> {
    let params = new HttpParams();
    for (const key in searchParams) {
      const value = searchParams[key];
      if (Array.isArray(value)) {
        value.forEach(v => params = params.append(key, v));
      } else {
        params = params.append(key, value);
      }
    }
    return this.http.get<any>(url, { params }).pipe(
      map(mapFunc ? mapFunc : (data) => data as T[]),
      catchError(this.handleError)
    );
  }


  add(url: string, item: T, mapFunc?: (response: any) => T): Observable<T> { // Add optional mapFunc
    return this.http.post<any>(url, item).pipe(
      map(mapFunc ? mapFunc : (data) => data as T), // Map if needed
      catchError(this.handleError)
    );
  }

  update(url: string, id: String, item: any, mapFunc?: (response: any) => T): Observable<T> { // Add optional mapFunc
    const apiUrl = `${url}/${id}`;
    return this.http.put<any>(apiUrl, item).pipe(
      map(mapFunc ? mapFunc : (data) => data as T), // Map if needed
      catchError(this.handleError)
    );
  }

  delete(url: string, id: String): Observable<T> { // No need for mapFunc
    const apiUrl = `${url}/${id}`;
    return this.http.delete<T>(apiUrl).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred.';

    if (error.error instanceof ErrorEvent) {
      // Client-side error (e.g., network issues)
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error (e.g., 500 Internal Server Error)
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      // Additional error handling for specific status codes
      switch (error.status) {
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 401:
          errorMessage = 'Unauthorized access.';
          break;
        case 403:
          errorMessage = 'Forbidden access.';
          break;
        // Add more cases for other status codes if needed
      }
    }

    console.error(errorMessage);

    // Here you can add more custom error handling logic:
    // - Show a user-friendly error message in your UI
    // - Log the error to a server-side logging service
    // - Retry the request (if applicable)

    return throwError(() => new Error(errorMessage));
  }
}

