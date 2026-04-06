import { HttpClient } from '../client';
import { Certificate, UploadCertificateParams, PaginatedResponse } from '../types';

export class CertificatesResource {
  constructor(private readonly client: HttpClient) {}

  upload(params: UploadCertificateParams): Promise<Certificate> {
    const formData = new FormData();
    formData.append('cer', new Blob([new Uint8Array(params.cer)]), 'cert.cer');
    formData.append('key', new Blob([new Uint8Array(params.key)]), 'cert.key');
    formData.append('password', params.password);
    return this.client.postMultipart<Certificate>('/api/v1/certificates', formData);
  }

  list(): Promise<PaginatedResponse<Certificate>> {
    return this.client.get<PaginatedResponse<Certificate>>('/api/v1/certificates');
  }

  get(id: string): Promise<Certificate> {
    return this.client.get<Certificate>(`/api/v1/certificates/${id}`);
  }

  update(id: string, params: Partial<Pick<Certificate, 'es_default'>>): Promise<Certificate> {
    return this.client.patch<Certificate>(`/api/v1/certificates/${id}`, params);
  }

  delete(id: string): Promise<void> {
    return this.client.delete<void>(`/api/v1/certificates/${id}`);
  }
}
