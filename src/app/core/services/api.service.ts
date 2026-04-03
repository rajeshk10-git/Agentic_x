import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { DASHBOARD_VIEW_DATA } from '../data/dashboard-view.data';
import {
  AuthSessionResponse,
  ForgotPasswordOtpResponse,
  ForgotPasswordSendOtpBody,
  ForgotPasswordVerifyOtpBody,
  LoginRequest,
  RegisterRequest,
} from '../models/auth-api.model';
import { DashboardViewModel } from '../models/dashboard-view.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  /**
   * GET dashboard view. Falls back to bundled mock when API is unavailable.
   * Point `environment.apiUrl` at your Bizzy backend when ready.
   */
  getDashboardView$(): Observable<DashboardViewModel> {
    return this.http.get<DashboardViewModel>(`${environment.apiUrl}/dashboard`).pipe(
      catchError(() => of(DASHBOARD_VIEW_DATA))
    );
  }

  /** POST `/auth/login` — expects JSON body; stores token client-side on success via caller. */
  login$(body: LoginRequest): Observable<AuthSessionResponse> {
    return this.post<AuthSessionResponse>('/auth/login', body);
  }

  /** POST `/auth/register` */
  register$(body: RegisterRequest): Observable<AuthSessionResponse> {
    return this.post<AuthSessionResponse>('/auth/register', body);
  }

  /** POST `/auth/forgot-password/send-otp` — email receives verification code. */
  sendForgotPasswordOtp$(body: ForgotPasswordSendOtpBody): Observable<ForgotPasswordOtpResponse> {
    return this.post<ForgotPasswordOtpResponse>('/auth/forgot-password/send-otp', body);
  }

  /** POST `/auth/forgot-password/verify-otp` — validate code (backend may issue reset token or set session). */
  verifyForgotPasswordOtp$(body: ForgotPasswordVerifyOtpBody): Observable<ForgotPasswordOtpResponse> {
    return this.post<ForgotPasswordOtpResponse>('/auth/forgot-password/verify-otp', body);
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(this.url(path));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  private url(path: string): string {
    const base = environment.apiUrl.replace(/\/$/, '');
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
  }
}
