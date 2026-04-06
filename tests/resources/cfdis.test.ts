import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CfdisResource } from '../../src/resources/cfdis';
import { HttpClient } from '../../src/client';
import { Cfdi, CreateCfdiParams, PaginatedResponse } from '../../src/types';

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

const sampleCfdi: Cfdi = {
  id: 'cfdi-1',
  uuid: 'test-uuid-1234',
  tipo: 'I',
  serie: 'A',
  folio: 1,
  subtotal: 100,
  total: 116,
  estado: 'TIMBRADO',
  receptor_rfc: 'XAXX010101000',
  receptor_nombre: 'PUBLICO EN GENERAL',
  fecha_emision: '2024-01-01T00:00:00Z',
  fecha_timbrado: '2024-01-01T00:01:00Z',
  created_at: '2024-01-01T00:00:00Z',
};

const createParams: CreateCfdiParams = {
  tipo: 'I',
  receptor: {
    rfc: 'XAXX010101000',
    nombre: 'PUBLICO EN GENERAL',
    regimen_fiscal: '616',
    domicilio_fiscal: '06600',
    uso_cfdi: 'S01',
  },
  conceptos: [
    {
      clave_prod_serv: '84111506',
      descripcion: 'Servicio',
      cantidad: 1,
      clave_unidad: 'E48',
      valor_unitario: 100,
    },
  ],
};

describe('CfdisResource', () => {
  let client: HttpClient;
  let resource: CfdisResource;

  beforeEach(() => {
    client = makeMockClient();
    resource = new CfdisResource(client);
  });

  it('create POSTs to /api/v1/cfdis', async () => {
    vi.mocked(client.post).mockResolvedValue(sampleCfdi);

    const result = await resource.create(createParams, 'idem-key-1');

    expect(client.post).toHaveBeenCalledWith('/api/v1/cfdis', createParams, {
      idempotencyKey: 'idem-key-1',
    });
    expect(result).toEqual(sampleCfdi);
  });

  it('list GETs with query params', async () => {
    const page: PaginatedResponse<Cfdi> = {
      data: [sampleCfdi],
      pagination: { has_more: false, next_cursor: null, limit: 20 },
    };
    vi.mocked(client.get).mockResolvedValue(page);

    const result = await resource.list({ limit: 10, cursor: 'abc' });

    expect(client.get).toHaveBeenCalledWith('/api/v1/cfdis', {
      params: { limit: '10', cursor: 'abc' },
    });
    expect(result).toEqual(page);
  });

  it('get GETs /api/v1/cfdis/:uuid', async () => {
    vi.mocked(client.get).mockResolvedValue(sampleCfdi);

    const result = await resource.get('test-uuid-1234');

    expect(client.get).toHaveBeenCalledWith('/api/v1/cfdis/test-uuid-1234');
    expect(result).toEqual(sampleCfdi);
  });

  it('cancel POSTs to /api/v1/cfdis/:uuid/cancel', async () => {
    const cancelled = { ...sampleCfdi, estado: 'CANCELADO' };
    vi.mocked(client.post).mockResolvedValue(cancelled);

    const result = await resource.cancel('test-uuid-1234', { motivo: '02' });

    expect(client.post).toHaveBeenCalledWith('/api/v1/cfdis/test-uuid-1234/cancel', {
      motivo: '02',
    });
    expect(result).toEqual(cancelled);
  });

  it('downloadXml returns Buffer', async () => {
    const buf = Buffer.from('<cfdi/>');
    vi.mocked(client.getRaw).mockResolvedValue(buf);

    const result = await resource.downloadXml('test-uuid-1234');

    expect(client.getRaw).toHaveBeenCalledWith('/api/v1/cfdis/test-uuid-1234/xml');
    expect(result).toEqual(buf);
  });

  it('downloadPdf returns Buffer', async () => {
    const buf = Buffer.from('%PDF');
    vi.mocked(client.getRaw).mockResolvedValue(buf);

    const result = await resource.downloadPdf('test-uuid-1234');

    expect(client.getRaw).toHaveBeenCalledWith('/api/v1/cfdis/test-uuid-1234/pdf');
    expect(result).toEqual(buf);
  });

  it('validate POSTs to /api/v1/cfdis/validate', async () => {
    const validationResult = { valid: true, errors: [] };
    vi.mocked(client.post).mockResolvedValue(validationResult);

    const result = await resource.validate(createParams);

    expect(client.post).toHaveBeenCalledWith('/api/v1/cfdis/validate', createParams);
    expect(result).toEqual(validationResult);
  });

  it('satStatus GETs /api/v1/cfdis/:uuid/sat-status', async () => {
    const status = { estado: 'Vigente', es_cancelable: 'Cancelable sin aceptación', estatus_cancelacion: null };
    vi.mocked(client.get).mockResolvedValue(status);

    const result = await resource.satStatus('test-uuid-1234');

    expect(client.get).toHaveBeenCalledWith('/api/v1/cfdis/test-uuid-1234/sat-status');
    expect(result).toEqual(status);
  });

  it('listAutoPaginate yields items from multiple pages', async () => {
    const page1: PaginatedResponse<Cfdi> = {
      data: [{ ...sampleCfdi, id: 'cfdi-1' }],
      pagination: { has_more: true, next_cursor: 'cursor-2', limit: 1 },
    };
    const page2: PaginatedResponse<Cfdi> = {
      data: [{ ...sampleCfdi, id: 'cfdi-2' }],
      pagination: { has_more: false, next_cursor: null, limit: 1 },
    };

    vi.mocked(client.get).mockResolvedValueOnce(page1).mockResolvedValueOnce(page2);

    const collected: Cfdi[] = [];
    for await (const cfdi of resource.listAutoPaginate()) {
      collected.push(cfdi);
    }

    expect(collected).toHaveLength(2);
    expect(collected[0].id).toBe('cfdi-1');
    expect(collected[1].id).toBe('cfdi-2');
    expect(client.get).toHaveBeenCalledTimes(2);
    // Second call should pass cursor
    expect(client.get).toHaveBeenNthCalledWith(2, '/api/v1/cfdis', {
      params: { cursor: 'cursor-2' },
    });
  });
});
