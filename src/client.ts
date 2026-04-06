import { FacturaCloudConfig } from './types';
import { ApiError, AuthError, RateLimitError } from './errors';

const DEFAULT_BASE_URL = 'https://api.facturacloud.mx';
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 2;
const SDK_VERSION = '0.1.0';

interface RequestOptions {
  idempotencyKey?: string;
  params?: Record<string, string>;
}

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;

  constructor(config: FacturaCloudConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = config.retries ?? DEFAULT_RETRIES;
  }

  async get<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  async post<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  async patch<T = unknown>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  async delete<T = unknown>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  async getRaw(path: string): Promise<Buffer> {
    const url = this.buildUrl(path);
    const headers = this.buildHeaders();

    const response = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      throw await this.buildError(response);
    }

    const ab = await response.arrayBuffer();
    return Buffer.from(ab);
  }

  async postMultipart<T = unknown>(path: string, formData: FormData): Promise<T> {
    const url = this.buildUrl(path);
    // Build headers without Content-Type — browser/node sets it with boundary
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'User-Agent': `@facturacloud/node/${SDK_VERSION}`,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: AbortSignal.timeout(this.timeout),
    });

    return this.handleResponse<T>(response);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const headers = this.buildHeaders(options);

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      if (attempt > 0) {
        const backoff = Math.min(1000 * 2 ** (attempt - 1), 10_000);
        await sleep(backoff);
      }

      let response: Response;
      try {
        response = await fetch(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(this.timeout),
        });
      } catch (err) {
        // Network-level error — don't retry
        throw err;
      }

      if (!response.ok && RETRYABLE_STATUS.has(response.status) && attempt < this.maxRetries) {
        lastError = await this.buildError(response);
        continue;
      }

      if (!response.ok) {
        throw await this.buildError(response);
      }

      return this.handleResponse<T>(response);
    }

    throw lastError!;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw await this.buildError(response);
    }
    return response.json() as Promise<T>;
  }

  private async buildError(response: Response): Promise<ApiError> {
    if (response.status === 401) {
      return new AuthError();
    }

    if (response.status === 429) {
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
      return new RateLimitError(isNaN(retryAfter) ? 60 : retryAfter);
    }

    let code = 'API_ERROR';
    let message = `HTTP ${response.status}`;
    let details: unknown[] = [];

    try {
      const body = (await response.json()) as {
        error?: { code?: string; message?: string; details?: unknown[] };
      };
      if (body?.error) {
        code = body.error.code ?? code;
        message = body.error.message ?? message;
        details = body.error.details ?? details;
      }
    } catch {
      // ignore JSON parse errors
    }

    return new ApiError(response.status, code, message, details);
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  private buildHeaders(options?: RequestOptions): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': `@facturacloud/node/${SDK_VERSION}`,
    };

    if (options?.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    return headers;
  }
}
