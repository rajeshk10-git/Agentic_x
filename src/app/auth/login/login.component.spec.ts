import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AUTH_ACCESS_TOKEN_KEY, AUTH_USER_KEY } from '../../core/constants/auth-storage.constants';
import { LOGIN_UI } from '../../core/data/auth-ui.data';
import { AuthSessionResponse } from '../../core/models/auth-api.model';
import { ApiService } from '../../core/services/api.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let api: jasmine.SpyObj<ApiService>;
  let router: Router;

  const validBody = { email: 'user@example.com', password: 'any' };

  beforeEach(async () => {
    sessionStorage.clear();
    api = jasmine.createSpyObj('ApiService', ['login$']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [LoginComponent],
      providers: [{ provide: ApiService, useValue: api }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to dashboard when a token already exists', () => {
    sessionStorage.setItem(AUTH_ACCESS_TOKEN_KEY, 'existing-token');
    component.ngOnInit();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should not call login when the form is invalid', () => {
    component.submit();
    expect(api.login$).not.toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should store session and navigate on successful login', () => {
    const res: AuthSessionResponse = {
      success: true,
      token: 'jwt-1',
      user: { id: '1', name: 'Pat Lee', email: validBody.email },
    };
    api.login$.and.returnValue(of(res));

    component.form.patchValue(validBody);
    component.submit();

    expect(api.login$).toHaveBeenCalledWith(validBody);
    expect(sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY)).toBe('jwt-1');
    expect(sessionStorage.getItem(AUTH_USER_KEY)).toContain('Pat Lee');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.apiError).toBeNull();
    expect(component.loading).toBeFalse();
  });

  it('should accept access_token shape from API', () => {
    api.login$.and.returnValue(of({ success: true, access_token: 'at-2' }));
    component.form.patchValue(validBody);
    component.submit();
    expect(sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY)).toBe('at-2');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should set apiError when success is false', () => {
    api.login$.and.returnValue(of({ success: false }));
    component.form.patchValue(validBody);
    component.submit();
    expect(component.apiError).toBe(LOGIN_UI.genericApiError);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should set apiError when no token is returned', () => {
    api.login$.and.returnValue(of({ success: true }));
    component.form.patchValue(validBody);
    component.submit();
    expect(component.apiError).toBe(LOGIN_UI.genericApiError);
  });

  it('should map HTTP errors to a message', () => {
    const err = new HttpErrorResponse({ status: 401, error: { message: 'Invalid credentials' } });
    api.login$.and.returnValue(throwError(err));
    component.form.patchValue(validBody);
    component.submit();
    expect(component.apiError).toBe('Invalid credentials');
    expect(component.loading).toBeFalse();
  });
});
