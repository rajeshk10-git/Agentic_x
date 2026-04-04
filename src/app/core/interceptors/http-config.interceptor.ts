import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AUTH_ACCESS_TOKEN_KEY, AUTH_USER_KEY } from '../constants/auth-storage.constants';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let headers = req.headers;
    const token = sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    const jsonBody =
      req.body !== null &&
      req.body !== undefined &&
      !(req.body instanceof FormData) &&
      !(req.body instanceof Blob) &&
      typeof req.body === 'object';
    if (jsonBody && !headers.has('Content-Type')) {
      headers = headers.set('Content-Type', 'application/json');
    }
    const clone = req.clone({ headers });
    return next.handle(clone).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            sessionStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
            sessionStorage.removeItem(AUTH_USER_KEY);
          }
          if (!environment.production) {
            console.warn('[HTTP]', err.status, req.method, req.url);
          }
        }
        return throwError(() => err);
      })
    );
  }
}
