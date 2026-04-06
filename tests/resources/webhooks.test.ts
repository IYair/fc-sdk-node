import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebhooksResource } from '../../src/resources/webhooks';
import { HttpClient } from '../../src/client';
import {
  WebhookEndpoint,
  CreateWebhookParams,
  UpdateWebhookParams,
  WebhookDelivery,
} from '../../src/types';

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

const sampleEndpoint: WebhookEndpoint = {
  id: 'wh-1',
  url: 'https://example.com/webhook',
  events: ['cfdi.timbrado', 'cfdi.cancelado'],
  estado: 'ACTIVO',
  consecutive_failures: 0,
  created_at: '2024-01-01T00:00:00Z',
};

const sampleDelivery: WebhookDelivery = {
  id: 'del-1',
  endpoint_id: 'wh-1',
  event_type: 'cfdi.timbrado',
  payload: { cfdi_id: 'cfdi-1' },
  response_code: 200,
  response_body: 'OK',
  attempts: 1,
  estado: 'ENTREGADO',
  created_at: '2024-01-01T00:01:00Z',
};

describe('WebhooksResource', () => {
  let client: HttpClient;
  let resource: WebhooksResource;

  beforeEach(() => {
    client = makeMockClient();
    resource = new WebhooksResource(client);
  });

  it('create POSTs to /api/v1/webhooks', async () => {
    vi.mocked(client.post).mockResolvedValue(sampleEndpoint);
    const params: CreateWebhookParams = {
      url: 'https://example.com/webhook',
      events: ['cfdi.timbrado'],
    };

    const result = await resource.create(params);

    expect(client.post).toHaveBeenCalledWith('/api/v1/webhooks', params);
    expect(result).toEqual(sampleEndpoint);
  });

  it('list GETs /api/v1/webhooks', async () => {
    vi.mocked(client.get).mockResolvedValue([sampleEndpoint]);

    const result = await resource.list();

    expect(client.get).toHaveBeenCalledWith('/api/v1/webhooks');
    expect(result).toEqual([sampleEndpoint]);
  });

  it('update PATCHes /api/v1/webhooks/:id', async () => {
    const updated = { ...sampleEndpoint, estado: 'PAUSADO' as const };
    vi.mocked(client.patch).mockResolvedValue(updated);
    const params: UpdateWebhookParams = { estado: 'PAUSADO' };

    const result = await resource.update('wh-1', params);

    expect(client.patch).toHaveBeenCalledWith('/api/v1/webhooks/wh-1', params);
    expect(result).toEqual(updated);
  });

  it('delete DELETEs /api/v1/webhooks/:id', async () => {
    vi.mocked(client.delete).mockResolvedValue(undefined);

    await resource.delete('wh-1');

    expect(client.delete).toHaveBeenCalledWith('/api/v1/webhooks/wh-1');
  });

  it('deliveries GETs /api/v1/webhooks/:id/deliveries', async () => {
    vi.mocked(client.get).mockResolvedValue([sampleDelivery]);

    const result = await resource.deliveries('wh-1');

    expect(client.get).toHaveBeenCalledWith('/api/v1/webhooks/wh-1/deliveries');
    expect(result).toEqual([sampleDelivery]);
  });

  it('test POSTs to /api/v1/webhooks/:id/test', async () => {
    vi.mocked(client.post).mockResolvedValue({ success: true });

    const result = await resource.test('wh-1');

    expect(client.post).toHaveBeenCalledWith('/api/v1/webhooks/wh-1/test');
    expect(result).toEqual({ success: true });
  });
});
