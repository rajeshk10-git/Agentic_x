export interface LoginRequest {
  email: string;
  password: string;
}

/** POST /auth/register — Agentic-X expects `name` (not fullName). */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** Step 1: request a reset code to the email inbox. */
export interface ForgotPasswordSendOtpBody {
  email: string;
}

/** Step 2: confirm the 6-digit code (and optional new password on your backend). */
export interface ForgotPasswordVerifyOtpBody {
  email: string;
  code: string;
}

export interface ForgotPasswordOtpResponse {
  message?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Login/register response — supports Cloud Run agentic-x shape:
 * `{ success, user, token }` plus common alternates.
 */
export interface AuthSessionResponse {
  success?: boolean;
  user?: AuthUser;
  access_token?: string;
  accessToken?: string;
  token?: string;
  refresh_token?: string;
  refreshToken?: string;
}
