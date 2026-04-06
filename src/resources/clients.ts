import { HttpClient } from '../client';
import { Client, CreateClientParams, PaginatedResponse, ListParams } from '../types';

export class ClientsResource {
  constructor(private readonly client: HttpClient) {}

  create(params: CreateClientParams): Promise<Client> {
    return this.client.post<Client>('/api/v1/clients', params);
  }

  list(params?: ListParams & { q?: string }): Promise<PaginatedResponse<Client>> {
    const queryParams: Record<string, string> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryParams[key] = String(value);
        }
      }
    }
    return this.client.get<PaginatedResponse<Client>>('/api/v1/clients', {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }

  get(id: string): Promise<Client> {
    return this.client.get<Client>(`/api/v1/clients/${id}`);
  }

  update(id: string, params: Partial<CreateClientParams>): Promise<Client> {
    return this.client.patch<Client>(`/api/v1/clients/${id}`, params);
  }

  delete(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/clients/${id}`);
  }
}
