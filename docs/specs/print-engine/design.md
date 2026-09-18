# Diseño técnico (motor único Preview/PDF)

> **Estado (2026-09-17):** diseño objetivo. Lo implementado está en [requirements.md](requirements.md) y [SPEC-TECH-002](../technical/spec-preview-generation.md); lo pendiente (PDF, QR en SVG, marcado único) en [tasks.md](tasks.md). Los nombres `LayoutCalculator` y `RenderBuilder` corresponden hoy a `buildLayoutPlan` y `buildPrintDocumentHtml`.

## Principio clave

Debe existir un solo motor de layout/render para evitar divergencias entre Preview Web y PDF.

## Flujo objetivo

Editor  
↓  
Templates + Configuración (tamaño, orientación, separación, márgenes)  
↓  
Print Engine (único)

- Layout Calculator
- Render Builder (HTML + CSS print-safe)
- Asset Renderer (SVG preferido / PNG fallback)

↓  
Salidas

- Preview Web (fuente de verdad)
- Browser Print (sin escalado)
- PDF 1:1 (Playwright/Puppeteer renderizando el mismo HTML)

## Arquitectura propuesta

### 1) Layout Calculator

Responsable de calcular una grilla física en mm:

- Input:
  - `paperSize` (A4 | continuous-58 | continuous-80 | continuous-100)
  - `marginsMm` (default 5, continuo opcional 0)
  - `labelWidthMm`, `labelHeightMm`
  - `gapMm` (default 2, configurable)
  - orientación de plantilla
- Output:
  - `columns`, `rowsPerPage`
  - `itemsPerPage`
  - `pages[]` con posición física `{xMm, yMm}` por etiqueta

### 2) Render Builder (single source)

Genera un documento HTML/CSS que se usa exactamente para:

- Vista previa en navegador.
- Impresión del navegador.
- Conversión a PDF con Playwright/Puppeteer.

Debe incluir:

- Variables CSS en mm.
- `@page` configurado según papel y márgenes.
- Reglas para evitar escalado y deformación.
- Saltos de página físicos (`page-break` / `break-after` controlado por layout).

### 3) Asset Renderer

- QR / barcode en SVG como primera opción.
- Si no aplica SVG, render en PNG >=300dpi.
- Verificar tamaño mínimo en mm antes de render:
  - QR >=20x20mm.
  - Barcode >=30x10mm.

## Contratos de datos sugeridos

- `PrintTemplateConfig`
- `PaperConfig`
- `LayoutPlan`
- `RenderedPrintDocument`

Todos compartidos entre Preview y exportación PDF.

## Estrategia PDF

- Playwright/Puppeteer carga el HTML final del Preview.
- Exporta a PDF sin recalcular layout.
- Configuración explícita:
  - tamaño de página,
  - márgenes,
  - escala = 1,
  - print background habilitado cuando aplique.

## Estrategia de validación

1. Validación visual automática Preview vs PDF.
2. Pruebas físicas en A4 y térmicas 58/80/100.
3. Medición de muestra (regla/calibrador) para tolerancia ±1mm.