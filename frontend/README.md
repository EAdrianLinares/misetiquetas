# Mis Etiquetas — frontend

Convierte datos pegados desde Excel, Google Sheets o CSV en etiquetas de precio con código de barras o QR, listas para imprimir en rollo térmico (58/80/100 mm) o en hoja (A4/Carta).

Es un sitio estático: toda la lógica corre en el navegador ([ADR-002](../docs/adr/adr-002-logica-en-frontend.md)).

## Comandos

```bash
npm ci
npm run dev       # desarrollo en http://localhost:5173
npm test          # tests (Vitest)
npm run lint      # oxlint
npm run build     # comprobación de tipos + build en dist/
```

## Estructura

```text
src/
  domain/       reglas de negocio: interpretación, validación, generación de etiquetas
  utils/        layout de impresión, métricas de etiqueta, códigos, documento de impresión
  components/   componentes de React
  App.tsx       flujo de 3 pasos: pegar, revisar, configurar e imprimir
```

## Documentación

- Arquitectura: [docs/Architecture.md](../docs/Architecture.md)
- Formato de entrada: [docs/specs/functional/spec-input-format.md](../docs/specs/functional/spec-input-format.md)
- Motor de impresión: [docs/specs/print-engine/requirements.md](../docs/specs/print-engine/requirements.md)
- Convenciones: [docs/Coding-Standards.md](../docs/Coding-Standards.md)
- Pruebas y checklist físico: [docs/testing/README.md](../docs/testing/README.md)
