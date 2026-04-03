import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { finalize, take } from 'rxjs/operators';
import { APP_NAME, APP_TAGLINE } from '../../app.constants';
import { FORGOT_UI } from '../../core/data/auth-ui.data';
import { ApiService } from '../../core/services/api.service';
import { mapHttpErrorToMessage } from '../../core/utils/api-helpers';

type ForgotStep = 'email' | 'otp' | 'success';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styles: [],
})
export class ForgotPasswordComponent {
  readonly appName = APP_NAME;
  readonly appTagline = APP_TAGLINE;
  readonly ui = FORGOT_UI;

  step: ForgotStep = 'email';
  cachedEmail = '';

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  otpArray!: FormArray<FormControl<string>>;

  submittedEmail = false;
  otpTouched = false;
  loadingSend = false;
  loadingVerify = false;
  loadingResend = false;
  apiError: string | null = null;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.otpArray = this.fb.array(
      Array.from({ length: 6 }, () => this.fb.control('', { nonNullable: true }))
    );
  }

  sendCode(): void {
    this.submittedEmail = true;
    this.apiError = null;
    if (this.emailForm.invalid) {
      return;
    }
    const email = this.emailForm.get('email')?.value as string;
    this.loadingSend = true;
    this.api
      .sendForgotPasswordOtp$({ email })
      .pipe(
        take(1),
        finalize(() => (this.loadingSend = false))
      )
      .subscribe({
        next: () => {
          this.cachedEmail = email;
          this.step = 'otp';
          this.resetOtpInputs();
          this.queueFocusOtp(0);
        },
        error: (err) => {
          this.apiError = mapHttpErrorToMessage(err, this.ui.genericSendError);
        },
      });
  }

  resendCode(): void {
    if (!this.cachedEmail) {
      return;
    }
    this.apiError = null;
    this.loadingResend = true;
    this.api
      .sendForgotPasswordOtp$({ email: this.cachedEmail })
      .pipe(
        take(1),
        finalize(() => (this.loadingResend = false))
      )
      .subscribe({
        error: (err) => {
          this.apiError = mapHttpErrorToMessage(err, this.ui.genericSendError);
        },
      });
  }

  verifyOtp(): void {
    this.otpTouched = true;
    this.apiError = null;
    const code = this.otpDigits.join('');
    if (code.length !== 6) {
      return;
    }
    this.loadingVerify = true;
    this.api
      .verifyForgotPasswordOtp$({ email: this.cachedEmail, code })
      .pipe(
        take(1),
        finalize(() => (this.loadingVerify = false))
      )
      .subscribe({
        next: () => {
          this.step = 'success';
        },
        error: (err) => {
          this.apiError = mapHttpErrorToMessage(err, this.ui.genericVerifyError);
        },
      });
  }

  changeEmail(): void {
    this.step = 'email';
    this.apiError = null;
    this.otpTouched = false;
    this.resetOtpInputs();
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);
    input.value = digit;
    this.otpArray.at(index).setValue(digit || '');
    this.otpArray.at(index).markAsTouched();
    if (digit && index < 5) {
      this.queueFocusOtp(index + 1);
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      this.queueFocusOtp(index - 1);
    }
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const digits = text.replace(/\D/g, '').slice(0, 6).split('');
    digits.forEach((d, i) => {
      if (i < 6) {
        this.otpArray.at(i).setValue(d);
      }
    });
    const next = Math.min(digits.length, 5);
    this.queueFocusOtp(next);
    for (let i = digits.length; i < 6; i++) {
      this.otpArray.at(i).setValue('');
    }
  }

  get otpDigits(): string[] {
    return this.otpArray.controls.map((c) => c.value);
  }

  get otpIncomplete(): boolean {
    return this.otpTouched && this.otpDigits.join('').length !== 6;
  }

  private resetOtpInputs(): void {
    this.otpArray.controls.forEach((c) => c.setValue(''));
    this.otpTouched = false;
  }

  private queueFocusOtp(index: number): void {
    setTimeout(() => {
      document.getElementById(`forgot-otp-${index}`)?.focus();
    }, 0);
  }
}
