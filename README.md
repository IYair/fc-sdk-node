# @facturacloud/node

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-native-3178C6.svg)](https://www.typescriptlang.org)

SDK oficial de [FactuLink](https://factulink.com.mx) para Node.js y TypeScript. Facturación electrónica CFDI 4.0 conforme al Anexo 20 del SAT (México), con tipos nativos, auto-paginación y manejo de errores tipado.

## Instalación

```bash
npm install @facturacloud/node
# o con pnpm
pnpm add @facturacloud/node
# o con yarn
yarn add @facturacloud/node
```

Requiere **Node.js 18+**. Soporta CommonJS y ESM.

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
  baseUrl: 'https://...',      // Default: https://api.factulink.com.mx
  timeout: 30_000,             // Default: 30s
  retries: 2,                  // Default: 2 reintentos en 429/5xx
});
```

## Ambientes

- **Sandbox** — usa API Keys con prefijo `sk_test_...`. Las llamadas usan MockPAC y no consumen folios reales. Ideal para pruebas e integración.
- **Producción** — usa API Keys con prefijo `sk_live_...`. Las llamadas timbran con el PAC real (Finkok).

El mismo `baseUrl` (`https://api.factulink.com.mx`) atiende ambos ambientes — el prefijo de la API Key determina cuál usar.

## Documentación

- **Portal de developers:** [docs.factulink.com.mx](https://docs.factulink.com.mx) (próximamente)
- **OpenAPI spec:** [openapi.json](https://docs.factulink.com.mx/openapi.json)
- **Quickstart REST:** ver el [README de FacturaCloud Docs](https://github.com/IYair/fc-docs)

## Reportar bugs y feature requests

Abre un issue en [github.com/IYair/fc-sdk-node/issues](https://github.com/IYair/fc-sdk-node/issues). Incluye:

- Versión del SDK (`@facturacloud/node`)
- Versión de Node.js
- Snippet mínimo reproducible
- Mensaje de error completo (sin tu API Key)

## Contribuir

Pull requests son bienvenidos. Antes de enviar:

```bash
pnpm install
pnpm test           # 35 tests con vitest
pnpm typecheck      # tsc --noEmit
pnpm build          # tsup
```

Sigue [Conventional Commits](https://www.conventionalcommits.org) en los mensajes de commit (`fix(client):`, `feat(webhooks):`, etc.).

## Licencia

[MIT](LICENSE) © 2026 Yair Chan and FactuLink contributors
