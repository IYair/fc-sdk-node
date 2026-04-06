import { HttpClient } from '../client';
import {
  Cfdi,
  CreateCfdiParams,
  CancelCfdiParams,
  SatStatus,
  PaginatedResponse,
  ListParams,
} from '../types';

export class CfdisResource {
  constructor(private readonly client: HttpClient) {}

  create(params: CreateCfdiParams, idempotencyKey?: string): Promise<Cfdi> {
    return this.client.post<Cfdi>('/api/v1/cfdis', params, {
      idempotencyKey,
    });
  }

  list(params?: ListParams): Promise<PaginatedResponse<Cfdi>> {
    const queryParams: Record<string, string> = {};
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          queryParams[key] = String(value);
        }
      }
    }
    return this.client.get<PaginatedResponse<Cfdi>>('/api/v1/cfdis', {
      params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }

  get(uuid: string): Promise<Cfdi> {
    return this.client.get<Cfdi>(`/api/v1/cfdis/${uuid}`);
  }

  cancel(uuid: string, params: CancelCfdiParams): Promise<Cfdi> {
    return this.client.post<Cfdi>(`/api/v1/cfdis/${uuid}/cancel`, params);
  }

  downloadXml(uuid: string): Promise<Buffer> {
    return this.client.getRaw(`/api/v1/cfdis/${uuid}/xml`);
  }

  downloadPdf(uuid: string): Promise<Buffer> {
    return this.client.getRaw(`/api/v1/cfdis/${uuid}/pdf`);
  }

  satStatus(uuid: string): Promise<SatStatus> {
    return this.client.get<SatStatus>(`/api/v1/cfdis/${uuid}/sat-status`);
  }

  validate(params: CreateCfdiParams): Promise<{ valid: boolean; errors: string[] }> {
    return this.client.post<{ valid: boolean; errors: string[] }>(
      '/api/v1/cfdis/validate',
      params,
    );
  }

  async *listAutoPaginate(params?: ListParams): AsyncGenerator<Cfdi> {
    let cursor: string | null = null;

    do {
      const queryParams: ListParams = { ...params };
      if (cursor) {
        queryParams.cursor = cursor;
      }

      const page = await this.list(queryParams);

      for (const item of page.data) {
        yield item;
      }

      cursor = page.pagination.has_more ? page.pagination.next_cursor : null;
    } while (cursor !== null);
  }
}
