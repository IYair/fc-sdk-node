# @facturacloud/node

SDK oficial de FacturaCloud para Node.js. Facturación electrónica (CFDI 4.0) con TypeScript nativo.

## Instalación

```bash
npm install @facturacloud/node
```

Requiere Node.js 18+.

## Quickstart

```typescript
import FacturaCloud from '@facturacloud/node';

const fc = new FacturaCloud({
  apiKey: 'sk_test_...',
});

// Emitir un CFDI
const { data: cfdi } = await fc.cfdis.create({
  tipo: 'I',
  receptor: {
    rfc: 'XAXX010101000',
    nombre: 'Cliente de Prueba',
    regimen_fiscal: '601',
    domicilio_fiscal: '06600',
    uso_cfdi: 'G03',
  },
  conceptos: [{
    clave_prod_serv: '43211503',
    descripcion: 'Laptop',
    cantidad: 1,
    clave_unidad: 'H87',
    valor_unitario: 15000,
  }],
});

console.log(cfdi.uuid);

// Descargar PDF
const pdf = await fc.cfdis.downloadPdf(cfdi.uuid);
```

## Recursos disponibles

| Recurso | Métodos |
|---------|---------|
| `fc.cfdis` | create, list, get, cancel, downloadXml, downloadPdf, satStatus, validate, listAutoPaginate |
| `fc.clients` | create, list, get, update, delete |
| `fc.certificates` | upload, list, get, update, delete |
| `fc.catalogs` | products, units, taxRegimes, cfdiUsages, paymentForms, paymentMethods, currencies, countries |
| `fc.webhooks` | create, list, update, delete, deliveries, test |
| `fc.ai` | createFromText, confirmInvoice, copilot |
| `fc.apiKeys` | create, list, revoke |

## Paginación automática

```typescript
for await (const cfdi of fc.cfdis.listAutoPaginate({ estado: 'timbrado' })) {
  console.log(cfdi.uuid);
}
```

## Manejo de errores

```typescript
import FacturaCloud, { ApiError, AuthError, RateLimitError } from '@facturacloud/node';

try {
  await fc.cfdis.create(params);
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Retry after ${err.retryAfter}s`);
  } else if (err instanceof AuthError) {
    console.log('API key inválida');
  } else if (err instanceof ApiError) {
    console.log(err.code, err.message, err.details);
  }
}
```

## Configuración

```typescript
const fc = new FacturaCloud({
  apiKey: 'sk_live_...',       // Requerido
  baseUrl: 'https://...',      // Default: https://api.facturacloud.mx
  timeout: 30_000,             // Default: 30s
  retries: 2,                  // Default: 2 reintentos en 429/5xx
});
```
