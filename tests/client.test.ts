import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpClient } from '../src/client';
import { ApiError, AuthError, RateLimitError } from '../src/errors';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ 'content-type': 'application/json', ...headers }),
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  };
}

describe('HttpClient', () => {
  let client: HttpClient;

  beforeEach(() => {
    vi.useFakeTimers();
    mockFetch.mockReset();
    client = new HttpClient({
      apiKey: 'sk_test_abc123',
      baseUrl: 'https://api.factulink.com.mx',
      timeout: 5000,
      retries: 2,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('GET sends Authorization header', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: '1', name: 'test' }));

    await client.get('/v1/clients');

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.factulink.com.mx/v1/clients');
    expect(init.headers['Authorization']).toBe('Bearer sk_test_abc123');
    expect(init.method).toBe('GET');
  });

  it('POST sends JSON body and returns parsed response', async () => {
    const responseBody = { id: '42', rfc: 'XAXX010101000' };
    mockFetch.mockResolvedValueOnce(jsonResponse(responseBody, 201));

    const result = await client.post('/v1/clients', { rfc: 'XAXX010101000', nombre: 'Test' });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.factulink.com.mx/v1/clients');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ rfc: 'XAXX010101000', nombre: 'Test' });
    expect(result).toEqual(responseBody);
  });

  it('401 response throws AuthError', async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({ error: { code: 'AUTH_ERROR', message: 'No autenticado', details: [] } }, 401),
    );

    await expect(client.get('/v1/clients')).rejects.toThrow(AuthError);
  });

  it('429 response throws RateLimitError with retryAfter from Retry-After header', async () => {
    // All attempts (initial + 2 retries) return 429 so we exhaust retries and get the error
    mockFetch.mockResolvedValue(
      jsonResponse(
        { error: { code: 'RATE_LIMIT', message: 'Rate limit exceeded', details: [] } },
        429,
        { 'retry-after': '30' },
      ),
    );

    const [error] = await Promise.all([
      client.get('/v1/clients').catch((e) => e),
      vi.runAllTimersAsync(),
    ]);

    expect(error).toBeInstanceOf(RateLimitError);
    expect(error.retryAfter).toBe(30);
  });

  it('500 response retries and succeeds on 2nd attempt', async () => {
    const successBody = { id: '1' };
    mockFetch
      .mockResolvedValueOnce(
        jsonResponse({ error: { code: 'SERVER_ERROR', message: 'Internal error', details: [] } }, 500),
      )
      .mockResolvedValueOnce(jsonResponse(successBody));

    const [result] = await Promise.all([
      client.get('/v1/clients'),
      vi.runAllTimersAsync(),
    ]);

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual(successBody);
  });

  it('exhausts retries (3 total calls) and throws ApiError', async () => {
    mockFetch.mockResolvedValue(
      jsonResponse({ error: { code: 'SERVER_ERROR', message: 'Internal error', details: [] } }, 500),
    );

    const [error] = await Promise.all([
      client.get('/v1/clients').catch((e) => e),
      vi.runAllTimersAsync(),
    ]);

    expect(error).toBeInstanceOf(ApiError);
    // 1 initial attempt + 2 retries = 3 total calls
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('includes Idempotency-Key header when provided', async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ id: '1' }));

    await client.post('/v1/cfdis', {}, { idempotencyKey: 'idem-key-xyz' });

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers['Idempotency-Key']).toBe('idem-key-xyz');
  });

  it('getRaw returns a Buffer for binary responses', async () => {
    const bytes = new Uint8Array([37, 80, 68, 70]); // %PDF
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/pdf' }),
      arrayBuffer: () => Promise.resolve(bytes.buffer),
    });

    const result = await client.getRaw('/v1/cfdis/123/pdf');

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result[0]).toBe(37); // %
    expect(result[1]).toBe(80); // P
  });
});
