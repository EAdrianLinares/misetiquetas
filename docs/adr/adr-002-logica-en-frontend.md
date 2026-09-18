# ADR-002: La lógica de interpretación y de layout vive solo en el frontend

## Status

Accepted — 2026-09-17. Reemplaza la parte "backend en Render" de ADR-001.

## Context

La auditoría del 2026-09-17 (`docs/audit/report-2026-09-17.md`) encontró que:

- el motor de layout estaba duplicado (`backend/src/print-layout.ts` y `frontend/src/utils/printLayout.ts`) y ya divergía;
- el frontend descartaba el layout que devolvía `/api/print` y lo recalculaba;
- los códigos de barras/QR y el documento de impresión ya se generaban en el navegador;
- el backend solo aportaba el parser y multiplicar registros por copias, a cambio de CORS, arranque en frío en Render y exposición a DoS (copias sin límite).

El MVP no tiene usuarios ni persistencia, y la impresión depende del navegador por diseño.

## Decision

- El parser, la validación, la generación de etiquetas (copias) y el layout se ejecutan en el frontend.
- Existe una única implementación de cada regla, en `frontend/src/domain/` y `frontend/src/utils/`.
- El frontend se despliega como sitio estático (Vercel) sin depender de ninguna API.
- El backend NestJS deja de usarse. Su eliminación del repositorio es un paso aparte.

## Consequences

### Positives

- Una sola fuente de verdad para el layout: la vista previa y la impresión no pueden divergir.
- Sin CORS, sin arranque en frío, sin superficie de DoS en servidor.
- Despliegue más simple (un solo sitio estático).
- Los datos del usuario no salen del navegador.

### Negatives

- Si en el futuro se necesita API pública o persistencia (Roadmap 2.x), habrá que reintroducir un backend.
- Los límites (copias, registros) se aplican en el cliente; esto es suficiente porque no hay recurso compartido que proteger.

## Alternatives considered

- **Backend como fuente de verdad:** requería DTOs, límites y una petición por cada cambio en la vista previa, sin beneficio para un MVP sin estado.
- **Mantener ambos:** perpetúa la duplicación y la divergencia.
