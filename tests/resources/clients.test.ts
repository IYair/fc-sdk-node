import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientsResource } from '../../src/resources/clients';
import { HttpClient } from '../../src/client';
import { Client, CreateClientParams, PaginatedResponse } from '../../src/types';

function makeMockClient() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    getRaw: vi.fn(),
    postMultipart: vi.fn(),
  } as unknown as HttpClient;
}

const sampleClient: Client = {
  id: 'client-1',
  rfc: 'XAXX010101000',
  nombre: 'PUBLICO EN GENERAL',
  regimen_fiscal: '616',
  domicilio_fiscal: '06600',
  uso_cfdi: 'S01',
  email: null,
  created_at: '2024-01-01T00:00:00Z',
};

const createParams: CreateClientParams = {
  rfc: 'XAXX010101000',
  nombre: 'PUBLICO EN GENERAL',
  regimen_fiscal: '616',
  domicilio_fiscal: '06600',
  uso_cfdi: 'S01',
};

describe('ClientsResource', () => {
  let client: HttpClient;
  let resource: ClientsResource;

  beforeEach(() => {
    client = makeMockClient();
    resource = new ClientsResource(client);
  });

  it('create POSTs to /api/v1/clients', async () => {
    vi.mocked(client.post).mockResolvedValue(sampleClient);

    const result = await resource.create(createParams);

    expect(client.post).toHaveBeenCalledWith('/api/v1/clients', createParams);
    expect(result).toEqual(sampleClient);
  });

  it('list GETs /api/v1/clients with q param', async () => {
    const page: PaginatedResponse<Client> = {
      data: [sampleClient],
      pagination: { has_more: false, next_cursor: null, limit: 20 },
    };
    vi.mocked(client.get).mockResolvedValue(page);

    const result = await resource.list({ q: 'PUBLICO' });

    expect(client.get).toHaveBeenCalledWith('/api/v1/clients', {
      params: { q: 'PUBLICO' },
    });
    expect(result).toEqual(page);
  });

  it('get GETs /api/v1/clients/:id', async () => {
    vi.mocked(client.get).mockResolvedValue(sampleClient);

    const result = await resource.get('client-1');

    expect(client.get).toHaveBeenCalledWith('/api/v1/clients/client-1');
    expect(result).toEqual(sampleClient);
  });

  it('update PATCHes /api/v1/clients/:id', async () => {
    const updated = { ...sampleClient, email: 'test@example.com' };
    vi.mocked(client.patch).mockResolvedValue(updated);

    const result = await resource.update('client-1', { email: 'test@example.com' });

    expect(client.patch).toHaveBeenCalledWith('/api/v1/clients/client-1', {
      email: 'test@example.com',
    });
    expect(result).toEqual(updated);
  });

  it('delete DELETEs /api/v1/clients/:id', async () => {
    vi.mocked(client.delete).mockResolvedValue(undefined);

    await resource.delete('client-1');

    expect(client.delete).toHaveBeenCalledWith('/api/v1/clients/client-1');
  });
});
