import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormatService {
  formatCurrency(amount: number, currencyCode: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  formatPercent(value: number, fractionDigits = 1): string {
    return `${value.toFixed(fractionDigits)}%`;
  }

  formatLongDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  maskSensitive(_value: number): string {
    return '*****';
  }

  displayCurrencyOrMasked(amount: number, currency: string, show: boolean): string {
    return show ? this.formatCurrency(amount, currency) : this.maskSensitive(amount);
  }
}
