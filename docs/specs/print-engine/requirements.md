# Print Engine

## Objetivo

Garantizar impresión física 1:1 de etiquetas desde Preview Web y PDF, con un solo motor de render.

## Problema actual

La impresión depende del navegador y puede aplicar escalado o ajustes automáticos, rompiendo las medidas físicas reales.

## Alcance (MVP v2)

- Usar inicialmente las plantillas ya existentes del sistema.
- Soportar papel:
  - A4.
  - Continuo: 58mm, 80mm, 100mm.
- Márgenes:
  - Por defecto: 5mm.
  - En continuo: permitir 0mm cuando esté habilitado por configuración.
- Distribución automática de etiquetas.
- Fuente de verdad visual: Preview Web.
- PDF generado como representación 1:1 del Preview Web.

## Reglas de layout obligatorias

- Mantener tamaño físico exacto (unidades en mm).
- Mantener orientación definida por la plantilla.
- Separación configurable entre etiquetas (default 2mm, configurable por plantilla).
- Alineación superior izquierda.
- Nunca escalar.
- Nunca deformar.
- Si una etiqueta no cabe en la fila actual: mover a la siguiente fila.
- Si una nueva fila no cabe en la página: crear nueva página.

## Requisitos funcionales

1. El sistema debe calcular columnas y filas según:
   - tamaño de papel,
   - márgenes,
   - dimensiones físicas de etiqueta,
   - separación configurada.
2. El sistema debe producir el mismo layout en:
   - Preview Web,
   - impresión del navegador,
   - PDF exportado.
3. El sistema debe usar un único contrato de datos/layout para Preview y PDF (sin doble motor).
4. Debe permitir configuración por plantilla de:
   - separación,
   - orientación,
   - márgenes (cuando aplique).

## Requisitos de calidad de códigos

- Preferencia de render: SVG.
- Fallback permitido: PNG mínimo 300dpi (ideal 600dpi).
- Tamaños mínimos:
  - QR: 20x20mm.
  - Barcode: 30mm ancho x 10mm alto.

## Requisitos no funcionales

- Precisión física aceptable: ±1mm máximo.
- Consistencia entre navegadores objetivo (Chrome/Edge en Windows).
- Compatibilidad con impresora A4 y térmica continua (58/80/100).

## Criterios de aceptación

1. Una etiqueta de 50x30mm imprime físicamente en 50x30mm con desviación máxima ±1mm.
2. No existe reducción automática ni “fit to page” en el flujo recomendado de impresión.
3. El PDF coincide visual y dimensionalmente con el Preview Web (1:1).
4. El layout respeta orientación, separación y alineación superior izquierda.
5. Cuando el contenido no cabe, se hace salto de fila/página según reglas.
6. QR y barcode cumplen tamaños mínimos y legibilidad en impresión física.