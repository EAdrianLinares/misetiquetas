# Backlog de implementación (por fases)

## Fase 1 - Motor único de layout

- [ ] Definir contratos compartidos (`PrintTemplateConfig`, `PaperConfig`, `LayoutPlan`).
- [ ] Implementar `LayoutCalculator` en mm.
- [ ] Soportar papeles: A4, continuo 58/80/100.
- [ ] Implementar márgenes por defecto (5mm) y continuo configurable a 0mm.
- [ ] Implementar separación default 2mm configurable por plantilla.
- [ ] Implementar reglas de salto:
  - [ ] Si no cabe etiqueta -> siguiente fila.
  - [ ] Si no cabe fila -> nueva página.

## Fase 2 - Render único Preview/Print

- [ ] Crear `RenderBuilder` único basado en el `LayoutPlan`.
- [ ] Unificar Preview Web para consumir ese render.
- [ ] Implementar CSS de impresión:
  - [ ] `@page` por tipo de papel.
  - [ ] unidades físicas en mm.
  - [ ] evitar escalado/deformación.
  - [ ] mantener alineación superior izquierda.

## Fase 3 - Exportación PDF 1:1

- [ ] Integrar Playwright/Puppeteer para exportar PDF del mismo HTML.
- [ ] Configurar exportación PDF:
  - [ ] escala 1.
  - [ ] tamaño de página según papel.
  - [ ] márgenes según config.
- [ ] Verificar no duplicación de motores de render.

## Fase 4 - Códigos (calidad de impresión)

- [ ] Forzar SVG para QR/barcode cuando sea posible.
- [ ] Implementar fallback PNG >=300dpi (ideal 600dpi).
- [ ] Validar mínimos físicos:
  - [ ] QR >=20x20mm.
  - [ ] Barcode >=30x10mm.

## Fase 5 - Validación y pruebas

- [ ] Pruebas unitarias de layout (columnas, filas, paginación, saltos).
- [ ] Pruebas de snapshot HTML/CSS para estabilidad visual.
- [ ] Pruebas de equivalencia Preview vs PDF.
- [ ] Protocolo de prueba física en:
  - [ ] A4.
  - [ ] térmica 58mm.
  - [ ] térmica 80mm.
  - [ ] térmica 100mm.
- [ ] Validar tolerancia final ±1mm.

## Definición de terminado (DoD)

- [ ] Preview y PDF usan el mismo render.
- [ ] No hay escalado automático ni deformación.
- [ ] Se cumplen tamaños mínimos de QR/barcode.
- [ ] Validación física dentro de ±1mm.