# API

**No hay API.** Desde [ADR-002](../adr/adr-002-logica-en-frontend.md) la interpretación, la generación y el layout se ejecutan en el navegador. Los endpoints `/api/parse`, `/api/preview` y `/api/print` se eliminaron junto con el backend NestJS (disponibles en el historial de git hasta el commit `655ebfe`).

Los contratos de datos actuales son los tipos TypeScript:

| Contrato | Definición |
|---|---|
| Registro interpretado | `ParsedRecord` en `frontend/src/domain/records.ts` |
| Etiqueta | `PreviewLabel` en `frontend/src/domain/labels.ts` |
| Ajustes de impresión | `PrintSettings` en `frontend/src/types.ts` |
| Plan de layout | `LayoutPlan` en `frontend/src/utils/printLayout.ts` |

Si una versión futura necesita una API pública (Roadmap 2.1), se documentará aquí tras un nuevo ADR.
