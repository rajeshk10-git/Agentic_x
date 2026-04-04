import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Minimum length for strong-password rules (in addition to character classes). */
export const STRONG_PASSWORD_MIN_LENGTH = 8;

/** Max length to avoid unbounded input / ReDoS concerns. */
export const STRONG_PASSWORD_MAX_LENGTH = 15;

/**
 * Requires: min/max length, uppercase, lowercase, digit, and one symbol from a common safe set.
 * Empty value returns null (use `Validators.required` separately).
 */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value;
    if (raw == null || raw === '') {
      return null;
    }
    const v = String(raw);
    const flags: Record<string, true> = {};

    if (v.length < STRONG_PASSWORD_MIN_LENGTH) {
      flags['minLength'] = true;
    }
    if (v.length > STRONG_PASSWORD_MAX_LENGTH) {
      flags['maxLength'] = true;
    }
    if (!/[a-z]/.test(v)) {
      flags['lowercase'] = true;
    }
    if (!/[A-Z]/.test(v)) {
      flags['uppercase'] = true;
    }
    if (!/\d/.test(v)) {
      flags['digit'] = true;
    }
    // Symbols commonly allowed by backends (avoid whitespace as the “special” rule)
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(v)) {
      flags['special'] = true;
    }

    return Object.keys(flags).length ? { strongPassword: flags } : null;
  };
}
