import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { APP_NAME, APP_TAGLINE } from '../../app.constants';
import { AUTH_ACCESS_TOKEN_KEY, AUTH_USER_KEY } from '../../core/constants/auth-storage.constants';
import { REGISTER_UI } from '../../core/data/auth-ui.data';
import { ApiService } from '../../core/services/api.service';
import {
  STRONG_PASSWORD_MAX_LENGTH,
  STRONG_PASSWORD_MIN_LENGTH,
  strongPasswordValidator,
} from '../../core/validators/password.validators';
import { extractAccessToken, mapHttpErrorToMessage } from '../../core/utils/api-helpers';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const p = group.get('password');
  const c = group.get('confirm');
  if (!p || !c) {
    return null;
  }
  if (!p.value || !c.value) {
    return null;
  }
  return p.value === c.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styles: [],
})
export class RegisterComponent implements OnInit {
  readonly appName = APP_NAME;
  readonly appTagline = APP_TAGLINE;
  readonly ui = REGISTER_UI;
  readonly minPwd = STRONG_PASSWORD_MIN_LENGTH;
  readonly maxPwd = STRONG_PASSWORD_MAX_LENGTH;

  form = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, strongPasswordValidator()]],
      confirm: ['', [Validators.required]],
    },
    { validators: passwordsMatch }
  );

  submitted = false;
  loading = false;
  apiError: string | null = null;
  showPassword = false;
  showConfirmPassword = false;

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
    const v = this.form.getRawValue();
    this.loading = true;
    this.api
      .register$({
        name: (v.fullName as string).trim(),
        email: (v.email as string).trim(),
        password: v.password as string,
      })
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
