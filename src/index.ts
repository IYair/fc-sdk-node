import { HttpClient } from './client';
import { CfdisResource } from './resources/cfdis';
import { ClientsResource } from './resources/clients';
import { CertificatesResource } from './resources/certificates';
import { CatalogsResource } from './resources/catalogs';
import { WebhooksResource } from './resources/webhooks';
import { AiResource } from './resources/ai';
import { ApiKeysResource } from './resources/api-keys';
import type { FacturaCloudConfig } from './types';

export default class FacturaCloud {
  private readonly client: HttpClient;

  readonly cfdis: CfdisResource;
  readonly clients: ClientsResource;
  readonly certificates: CertificatesResource;
  readonly catalogs: CatalogsResource;
  readonly webhooks: WebhooksResource;
  readonly ai: AiResource;
  readonly apiKeys: ApiKeysResource;

  constructor(config: FacturaCloudConfig) {
    this.client = new HttpClient(config);
    this.cfdis = new CfdisResource(this.client);
    this.clients = new ClientsResource(this.client);
    this.certificates = new CertificatesResource(this.client);
    this.catalogs = new CatalogsResource(this.client);
    this.webhooks = new WebhooksResource(this.client);
    this.ai = new AiResource(this.client);
    this.apiKeys = new ApiKeysResource(this.client);
  }
}

export { FacturaCloudError, ApiError, AuthError, RateLimitError } from './errors';
export type {
  FacturaCloudConfig,
  Cfdi,
  CreateCfdiParams,
  CancelCfdiParams,
  Client,
  CreateClientParams,
  Certificate,
  UploadCertificateParams,
  WebhookEndpoint,
  CreateWebhookParams,
  UpdateWebhookParams,
  WebhookDelivery,
  CatalogItem,
  AiInvoicePreview,
  AiCopilotResponse,
  SatStatus,
  PaginatedResponse,
  ListParams,
} from './types';
