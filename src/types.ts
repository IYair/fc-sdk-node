export interface FacturaCloudConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    has_more: boolean;
    next_cursor: string | null;
    limit: number;
  };
}

export interface Cfdi {
  id: string;
  uuid: string;
  tipo: 'I' | 'E' | 'P' | 'N' | 'T';
  serie: string | null;
  folio: number | null;
  subtotal: number;
  total: number;
  estado: string;
  receptor_rfc: string;
  receptor_nombre: string;
  fecha_emision: string;
  fecha_timbrado: string | null;
  created_at: string;
}

export interface CreateCfdiParams {
  tipo: 'I' | 'E' | 'P' | 'N' | 'T';
  receptor: {
    rfc: string;
    nombre: string;
    regimen_fiscal: string;
    domicilio_fiscal: string;
    uso_cfdi: string;
  };
  conceptos: Array<{
    clave_prod_serv: string;
    descripcion: string;
    cantidad: number;
    clave_unidad: string;
    valor_unitario: number;
    objeto_impuesto?: string;
  }>;
  serie?: string;
  forma_pago?: string;
  metodo_pago?: string;
  moneda?: string;
  tipo_cambio?: number;
  condiciones_de_pago?: string;
}

export interface CancelCfdiParams {
  motivo: '01' | '02' | '03' | '04';
  sustitucion?: string;
}

export interface Client {
  id: string;
  rfc: string;
  nombre: string;
  regimen_fiscal: string;
  domicilio_fiscal: string;
  uso_cfdi: string;
  email: string | null;
  created_at: string;
}

export interface CreateClientParams {
  rfc: string;
  nombre: string;
  regimen_fiscal: string;
  domicilio_fiscal: string;
  uso_cfdi: string;
  email?: string;
}

export interface Certificate {
  id: string;
  numero_certificado: string;
  rfc: string;
  vigente_desde: string;
  vigente_hasta: string;
  estado: string;
  es_default: boolean;
}

export interface UploadCertificateParams {
  cer: Buffer;
  key: Buffer;
  password: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  estado: string;
  consecutive_failures: number;
  created_at: string;
}

export interface CreateWebhookParams {
  url: string;
  events: string[];
}

export interface UpdateWebhookParams {
  url?: string;
  events?: string[];
  estado?: 'ACTIVO' | 'PAUSADO' | 'DESHABILITADO';
}

export interface WebhookDelivery {
  id: string;
  endpoint_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  response_code: number | null;
  response_body: string | null;
  attempts: number;
  estado: string;
  created_at: string;
}

export interface CatalogItem {
  clave: string;
  descripcion: string;
}

export interface AiInvoicePreview {
  preview: Record<string, unknown>;
  confidence: number;
  warnings: string[];
  confirmation_token: string;
}

export interface AiCopilotResponse {
  answer: string;
  sources: Array<{ type: string; reference: string }>;
  conversation_id: string;
  disclaimer: string;
}

export interface SatStatus {
  estado: string;
  es_cancelable: string;
  estatus_cancelacion: string | null;
}

export interface ListParams {
  limit?: number;
  cursor?: string;
  [key: string]: unknown;
}
