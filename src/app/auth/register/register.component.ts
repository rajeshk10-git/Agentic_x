import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize, take } from 'rxjs/operators';
import { APP_NAME, APP_TAGLINE } from '../../app.constants';
import { REGISTER_UI } from '../../core/data/auth-ui.data';
import { ApiService } from '../../core/services/api.service';
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
export class RegisterComponent {
  readonly appName = APP_NAME;
  readonly appTagline = APP_TAGLINE;
  readonly ui = REGISTER_UI;

  form = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', [Validators.required]],
    },
    { validators: passwordsMatch }
  );

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
    const v = this.form.getRawValue();
    this.loading = true;
    this.api
      .register$({
        fullName: v.fullName as string,
        email: v.email as string,
        password: v.password as string,
      })
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
