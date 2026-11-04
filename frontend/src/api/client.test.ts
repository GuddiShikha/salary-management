import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, buildUrl, request } from './client';

const mockFetch = (status: number, body?: unknown) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), { status }),
  );

afterEach(() => vi.restoreAllMocks());

describe('buildUrl', () => {
  it('drops empty query values', () => {
    expect(buildUrl('/employees', { page: 1, q: '', country: undefined, sort: 'salary' })).toBe(
      '/api/v1/employees?page=1&sort=salary',
    );
  });
});

describe('request', () => {
  it('returns parsed JSON on success', async () => {
    mockFetch(200, { data: [1] });
    await expect(request('/x')).resolves.toEqual({ data: [1] });
  });

  it('sends JSON bodies', async () => {
    const fetchSpy = mockFetch(201, { data: {} });
    await request('/employees', { method: 'POST', body: { employee: { full_name: 'A' } } });

    const [, init] = fetchSpy.mock.calls[0]!;
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('{"employee":{"full_name":"A"}}');
  });

  it('returns undefined for 204', async () => {
    mockFetch(204);
    await expect(request('/employees/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('raises ApiError with field errors on 422', async () => {
    mockFetch(422, { errors: { email: ['has already been taken'] } });

    const error = await request('/employees').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(422);
    expect((error as ApiError).fieldErrors).toEqual({ email: ['has already been taken'] });
  });
});
