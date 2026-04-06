import { HttpClient } from '../client';
import { CatalogItem } from '../types';

export class CatalogsResource {
  constructor(private readonly client: HttpClient) {}

  products(query: string): Promise<CatalogItem[]> {
    return this.client.get<CatalogItem[]>('/api/v1/catalogs/productos', {
      params: { q: query },
    });
  }

  units(query?: string): Promise<CatalogItem[]> {
    return this.client.get<CatalogItem[]>('/api/v1/catalogs/unidades', {
      params: query ? { q: query } : undefined,
    });
  }

  taxRegimes(): Promise<CatalogItem[]> {
    return this.client.get<CatalogItem[]>('/api/v1/catalogs/regimenes');
  }

  cfdiUsages(): Promise<CatalogItem[]> {
    return this.client.get<CatalogItem[]>('/api/v1/catalogs/usos-cfdi');
  }

  paymentForms(): Promise<CatalogItem[]> {
    return this.client.get<CatalogItem[]>('/api/v1/catalogs/formas-pago');
  }

  paymentMethods(): Promise<CatalogItem[]> {
    return this.client.get<CatalogItem[]>('/api/v1/catalogs/metodos-pago');
  }

  currencies(): Promise<CatalogItem[]> {
    return this.client.get<CatalogItem[]>('/api/v1/catalogs/monedas');
  }

  countries(): Promise<CatalogItem[]> {
    return this.client.get<CatalogItem[]>('/api/v1/catalogs/paises');
  }
}
