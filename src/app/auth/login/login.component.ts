import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { APP_NAME, APP_TAGLINE } from '../../app.constants';
import { LOGIN_UI } from '../../core/data/auth-ui.data';
import { ApiService } from '../../core/services/api.service';
import { extractAccessToken, mapHttpErrorToMessage } from '../../core/utils/api-helpers';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: [],
})
export class LoginComponent {
  readonly appName = APP_NAME;
  readonly appTagline = APP_TAGLINE;
  readonly ui = LOGIN_UI;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submitted = false;
  loading = false;
  apiError: string | null = null;

  constructor(private fb: FormBuilder, private router: Router, private api: ApiService) {}

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
          const token = extractAccessToken(res);
          if (token) {
            sessionStorage.setItem('access_token', token);
          }
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.apiError = mapHttpErrorToMessage(err, this.ui.genericApiError);
        },
      });
  }
}
