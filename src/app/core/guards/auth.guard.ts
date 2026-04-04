import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AUTH_ACCESS_TOKEN_KEY } from '../constants/auth-storage.constants';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
    if (token?.trim()) {
      return true;
    }
    return this.router.createUrlTree(['/auth/login']);
  }
}
