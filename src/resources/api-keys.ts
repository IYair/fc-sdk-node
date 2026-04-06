import { HttpClient } from '../client';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
}

export interface CreateApiKeyParams {
  name: string;
}

export class ApiKeysResource {
  constructor(private readonly client: HttpClient) {}

  create(params: CreateApiKeyParams): Promise<ApiKey & { key: string }> {
    return this.client.post<ApiKey & { key: string }>('/api/v1/api-keys', params);
  }

  list(): Promise<ApiKey[]> {
    return this.client.get<ApiKey[]>('/api/v1/api-keys');
  }

  revoke(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/api-keys/${id}`);
  }
}
