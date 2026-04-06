import { HttpClient } from '../client';
import {
  WebhookEndpoint,
  CreateWebhookParams,
  UpdateWebhookParams,
  WebhookDelivery,
} from '../types';

export class WebhooksResource {
  constructor(private readonly client: HttpClient) {}

  create(params: CreateWebhookParams): Promise<WebhookEndpoint> {
    return this.client.post<WebhookEndpoint>('/api/v1/webhooks', params);
  }

  list(): Promise<WebhookEndpoint[]> {
    return this.client.get<WebhookEndpoint[]>('/api/v1/webhooks');
  }

  update(id: string, params: UpdateWebhookParams): Promise<WebhookEndpoint> {
    return this.client.patch<WebhookEndpoint>(`/api/v1/webhooks/${id}`, params);
  }

  delete(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/webhooks/${id}`);
  }

  deliveries(id: string): Promise<WebhookDelivery[]> {
    return this.client.get<WebhookDelivery[]>(`/api/v1/webhooks/${id}/deliveries`);
  }

  test(id: string): Promise<{ success: boolean }> {
    return this.client.post<{ success: boolean }>(`/api/v1/webhooks/${id}/test`);
  }
}
