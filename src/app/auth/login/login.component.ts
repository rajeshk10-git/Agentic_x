import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { APP_NAME, APP_TAGLINE } from '../../app.constants';
import { AUTH_ACCESS_TOKEN_KEY, AUTH_USER_KEY } from '../../core/constants/auth-storage.constants';
import { LOGIN_UI } from '../../core/data/auth-ui.data';
import { ApiService } from '../../core/services/api.service';
import { extractAccessToken, mapHttpErrorToMessage } from '../../core/utils/api-helpers';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [],
})
export class LoginComponent implements OnInit {
  readonly appName = APP_NAME;
  readonly appTagline = APP_TAGLINE;
  readonly ui = LOGIN_UI;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submitted = false;
  loading = false;
  apiError: string | null = null;
  showPassword = false;

  constructor(private fb: FormBuilder, private router: Router, private api: ApiService) {}

  ngOnInit(): void {
    if (sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY)?.trim()) {
      void this.router.navigate(['/dashboard']);
    }
  }

  submit(): void {
    this.submitted = true;
    this.apiError = null;
    if (this.form.invalid) {
      return;
    }
    const { email, password } = this.form.getRawValue();
    this.loading = true;
    this.api
      .login$({ email: email as string, password: password as string })
      .pipe(
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: (res) => {
          if (res.success === false) {
            this.apiError = this.ui.genericApiError;
            return;
          }
          const token = extractAccessToken(res);
          if (!token) {
            this.apiError = this.ui.genericApiError;
            return;
          }
          sessionStorage.setItem(AUTH_ACCESS_TOKEN_KEY, token);
          if (res.user) {
            sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.apiError = mapHttpErrorToMessage(err, this.ui.genericApiError);
        },
      });
  }
}
