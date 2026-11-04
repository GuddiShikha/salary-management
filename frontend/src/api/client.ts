import type { FieldErrors } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: FieldErrors;

  constructor(status: number, message: string, fieldErrors: FieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

type Query = Record<string, string | number | undefined | null>;

export const buildUrl = (path: string, query: Query = {}): string => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const search = params.toString();
  return `${BASE_URL}${path}${search ? `?${search}` : ''}`;
};

export const request = async <T>(
  path: string,
  { method = 'GET', query, body }: { method?: string; query?: Query; body?: unknown } = {},
): Promise<T> => {
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload.error ?? `Request failed (${response.status})`,
      payload.errors ?? {},
    );
  }
  return payload as T;
};
