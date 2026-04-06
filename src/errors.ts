export class FacturaCloudError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FacturaCloudError';
  }
}

export class ApiError extends FacturaCloudError {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details: unknown[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthError extends ApiError {
  constructor(message: string = 'No autenticado') {
    super(401, 'AUTH_ERROR', message);
    this.name = 'AuthError';
  }
}

export class RateLimitError extends ApiError {
  public readonly retryAfter: number;
  constructor(retryAfter: number) {
    super(429, 'RATE_LIMIT', `Rate limit exceeded. Retry after ${retryAfter}s`);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}
