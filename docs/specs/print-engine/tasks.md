# Backlog de implementación (por fases)

## Fase 1 - Motor único de layout

- [x] Contratos compartidos (`PrintSettings`, `PaperProfile`, `LayoutPlan`).
- [x] Cálculo de layout en mm (`buildLayoutPlan`).
- [x] Papeles: A4, Carta, continuo 58/80/100.
- [x] Márgenes por perfil; 0 mm en continuo cuando se habilita.
- [x] Separación configurable.
- [x] Saltos de fila y de página.
- [x] Modos de ajuste (`contain`, `fill`, `none`) y de página continua (`content`, `label`, `fixed`).
- [x] Una sola implementación: se eliminó la copia del backend (ADR-002).

## Fase 2 - Render Preview/Print

- [x] Vista previa y documento de impresión con el mismo plan y las mismas métricas.
- [x] `@page` por tipo de papel, unidades en mm, sin deformación.
- [ ] Generar la vista previa y la impresión desde el mismo HTML (hoy la vista previa es React y la impresión es HTML generado; comparten cálculos, no el marcado).

## Fase 3 - Exportación PDF 1:1 (fuera del MVP)

- [ ] Exportar a PDF desde el mismo HTML (Playwright/Puppeteer).

## Fase 4 - Códigos

- [x] Código de barras en SVG.
- [x] Aviso de tamaños mínimos (QR ≥ 20 mm, barras ≥ 30 × 10 mm).
- [ ] QR en SVG (hoy PNG de 512 px, suficiente para etiquetas de hasta ~40 mm a 300 dpi).

## Fase 5 - Validación

- [x] Tests unitarios de layout, métricas y avisos.
- [ ] Checklist físico ejecutado y registrado (A4 y térmica 58/80/100).

## Definición de terminado

- [x] Vista previa e impresión usan los mismos cálculos.
- [x] Sin deformación; el escalado es explícito y avisado.
- [x] Avisos de tamaño mínimo del código.
- [ ] Validación física dentro de ±1 mm.
