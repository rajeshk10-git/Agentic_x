import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AUTH_ACCESS_TOKEN_KEY, AUTH_USER_KEY } from '../../core/constants/auth-storage.constants';
import { REGISTER_UI } from '../../core/data/auth-ui.data';
import { AuthSessionResponse } from '../../core/models/auth-api.model';
import { ApiService } from '../../core/services/api.service';
import { RegisterComponent } from './register.component';

/** Satisfies strongPasswordValidator (length, cases, digit, symbol). */
const STRONG_PASSWORD = 'ValidPass1!';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let api: jasmine.SpyObj<ApiService>;
  let router: Router;

  beforeEach(async () => {
    sessionStorage.clear();
    api = jasmine.createSpyObj('ApiService', ['register$']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [RegisterComponent],
      providers: [{ provide: ApiService, useValue: api }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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

  it('should not call register when the form is invalid', () => {
    component.submit();
    expect(api.register$).not.toHaveBeenCalled();
  });

  it('should POST name, email, password and navigate on success', () => {
    const res: AuthSessionResponse = {
      success: true,
      token: 'jwt-reg',
      user: { id: 'u1', name: 'Alex Smith', email: 'alex@example.com' },
    };
    api.register$.and.returnValue(of(res));

    component.form.patchValue({
      fullName: '  Alex Smith  ',
      email: 'alex@example.com',
      password: STRONG_PASSWORD,
      confirm: STRONG_PASSWORD,
    });
    component.submit();

    expect(api.register$).toHaveBeenCalledWith({
      name: 'Alex Smith',
      email: 'alex@example.com',
      password: STRONG_PASSWORD,
    });
    expect(sessionStorage.getItem(AUTH_ACCESS_TOKEN_KEY)).toBe('jwt-reg');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.apiError).toBeNull();
  });

  it('should set apiError when success is false', () => {
    api.register$.and.returnValue(of({ success: false }));
    component.form.patchValue({
      fullName: 'Alex Smith',
      email: 'alex@example.com',
      password: STRONG_PASSWORD,
      confirm: STRONG_PASSWORD,
    });
    component.submit();
    expect(component.apiError).toBe(REGISTER_UI.genericApiError);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should set apiError when no token is returned', () => {
    api.register$.and.returnValue(of({ success: true }));
    component.form.patchValue({
      fullName: 'Alex Smith',
      email: 'alex@example.com',
      password: STRONG_PASSWORD,
      confirm: STRONG_PASSWORD,
    });
    component.submit();
    expect(component.apiError).toBe(REGISTER_UI.genericApiError);
  });

  it('should map HTTP errors to a message', () => {
    api.register$.and.returnValue(throwError(new HttpErrorResponse({ status: 409, error: 'Email taken' })));
    component.form.patchValue({
      fullName: 'Alex Smith',
      email: 'alex@example.com',
      password: STRONG_PASSWORD,
      confirm: STRONG_PASSWORD,
    });
    component.submit();
    expect(component.apiError).toBe('Email taken');
  });
});
