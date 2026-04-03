export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
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

/** Backend may use snake_case or camelCase for tokens. */
export interface AuthSessionResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  refresh_token?: string;
  refreshToken?: string;
  user?: unknown;
}
