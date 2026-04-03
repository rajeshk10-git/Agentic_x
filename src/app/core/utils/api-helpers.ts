import { HttpErrorResponse } from '@angular/common/http';
import { AuthSessionResponse } from '../models/auth-api.model';

export function extractAccessToken(res: AuthSessionResponse | null | undefined): string | null {
  if (!res) {
    return null;
  }
  const candidates = [res.access_token, res.accessToken, res.token];
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) {
      return c;
    }
  }
  return null;
}

export function mapHttpErrorToMessage(err: unknown, fallback: string): string {
  const http = err as HttpErrorResponse;
  if (http?.error != null) {
    const e = http.error;
    if (typeof e === 'string' && e.trim()) {
      return e;
    }
    if (typeof e === 'object' && e !== null && 'message' in e) {
      const m = (e as { message?: string }).message;
      if (typeof m === 'string' && m.trim()) {
        return m;
      }
    }
  }
  if (typeof http?.status === 'number' && http.status >= 400) {
    return fallback;
  }
  return fallback;
}
