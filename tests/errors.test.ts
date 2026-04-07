import { describe, it, expect } from 'vitest';
import { FactuLinkError, ApiError, AuthError, RateLimitError } from '../src/errors';

describe('errors', () => {
  it('FactuLinkError should be an Error with message', () => {
    const err = new FactuLinkError('something broke');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('something broke');
    expect(err.name).toBe('FactuLinkError');
  });

  it('ApiError should contain status, code, and details', () => {
    const err = new ApiError(422, 'VALIDATION_ERROR', 'Campo inválido', [{ field: 'rfc' }]);
    expect(err).toBeInstanceOf(FactuLinkError);
    expect(err.status).toBe(422);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual([{ field: 'rfc' }]);
  });

  it('AuthError should be 401', () => {
    const err = new AuthError('Token inválido');
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(401);
    expect(err.code).toBe('AUTH_ERROR');
  });

  it('RateLimitError should include retryAfter', () => {
    const err = new RateLimitError(23);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(429);
    expect(err.retryAfter).toBe(23);
  });
});
