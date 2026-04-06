import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CatalogsResource } from '../../src/resources/catalogs';
import { HttpClient } from '../../src/client';
import { CatalogItem } from '../../src/types';

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

const sampleItems: CatalogItem[] = [
  { clave: '84111506', descripcion: 'Servicios de programacion' },
  { clave: '84111507', descripcion: 'Servicios de desarrollo de software' },
];

describe('CatalogsResource', () => {
  let client: HttpClient;
  let resource: CatalogsResource;

  beforeEach(() => {
    client = makeMockClient();
    resource = new CatalogsResource(client);
  });

  it('products GETs /api/v1/catalogs/productos with q param', async () => {
    vi.mocked(client.get).mockResolvedValue(sampleItems);

    const result = await resource.products('programacion');

    expect(client.get).toHaveBeenCalledWith('/api/v1/catalogs/productos', {
      params: { q: 'programacion' },
    });
    expect(result).toEqual(sampleItems);
  });

  it('taxRegimes GETs /api/v1/catalogs/regimenes', async () => {
    const regimes: CatalogItem[] = [
      { clave: '601', descripcion: 'General de Ley Personas Morales' },
      { clave: '616', descripcion: 'Sin obligaciones fiscales' },
    ];
    vi.mocked(client.get).mockResolvedValue(regimes);

    const result = await resource.taxRegimes();

    expect(client.get).toHaveBeenCalledWith('/api/v1/catalogs/regimenes');
    expect(result).toEqual(regimes);
  });

  it('cfdiUsages GETs /api/v1/catalogs/usos-cfdi', async () => {
    const usages: CatalogItem[] = [
      { clave: 'G01', descripcion: 'Adquisicion de mercancias' },
      { clave: 'S01', descripcion: 'Sin efectos fiscales' },
    ];
    vi.mocked(client.get).mockResolvedValue(usages);

    const result = await resource.cfdiUsages();

    expect(client.get).toHaveBeenCalledWith('/api/v1/catalogs/usos-cfdi');
    expect(result).toEqual(usages);
  });
});
