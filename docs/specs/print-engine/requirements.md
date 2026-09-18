# Print Engine

## Objetivo

Imprimir las etiquetas con medidas físicas fiables (±1 mm) en rollo térmico y en hoja, desde la ventana de impresión del navegador, y que la vista previa muestre exactamente lo que se imprimirá.

## Alcance

- Plantillas de etiqueta: Estándar 80 × 50 mm, Compacta 50 × 30 mm y Personalizada (ancho 15–200 mm, alto 10–300 mm).
- Papeles: A4, Carta, continuo 58, 80 y 100 mm; orientación vertical u horizontal en hoja.
- Perfiles de papel predefinidos (`PAPER_PROFILES` en `utils/printLayout.ts`) y un perfil Personalizado.
- **Fuera del MVP:** exportación a PDF (Roadmap).

## Perfiles y márgenes

| Perfil | Columnas | Márgenes (sup/inf/lat) | Separación |
|---|---|---|---|
| Continuo 58 / 80 / 100 mm | 1 | 1 / 2 / 2 mm | 0 horizontal, 2 vertical |
| Continuo 100 mm, 2 o 3 columnas | 2 o 3 | 1 / 2 / 2 mm | 2 mm |
| Carta, A4 | 2 | 10 mm | 3 mm |
| Personalizado | 1–4 | Mínimo 5 mm; 0 mm en continuo si el usuario lo habilita | Configurable 0–20 mm |

Los márgenes se acotan a 0–25 mm y las columnas a 1–4.

## Reglas de layout

1. **Columnas:** si el hueco de cada columna queda por debajo de 18 mm, se reducen columnas y se avisa.
2. **Ajuste de la etiqueta** (`labelFitMode`):
   - `contain` (por defecto): se reduce proporcionalmente sólo si no cabe. Nunca se amplía.
   - `fill`: se ajusta siempre al ancho disponible (reduce o amplía).
   - `none`: tamaño exacto; si no cabe se avisa de que se recortará.
   - Nunca se deforma: ancho y alto usan el mismo factor. El factor se trunca a milésimas para no exceder el hueco.
3. **Longitud de página en continuo** (`continuousPageMode`):
   - `content` (por defecto): una página con el alto exacto del lote (menos papel).
   - `label`: una fila por página.
   - `fixed`: longitud declarada en mm (paso del troquel o tamaño del driver), respetada al milímetro.
4. En hoja, las filas por página se calculan con el alto imprimible; una fila que no cabe pasa a la página siguiente.
5. Si la página continua derivada del contenido queda más ancha que alta, se alarga para que el navegador no la gire, y se avisa. Con longitud fija no se alarga; sólo se avisa.
6. **Alineación:** filas desde arriba; cada etiqueta centrada horizontalmente en su columna.

## Códigos

- Código de barras: CODE128 en SVG, zona muda de 10 módulos. Sólo ASCII imprimible (sin tildes ni ñ).
- QR: corrección de errores M, 512 px.
- **Tamaños mínimos recomendados:** QR 20 × 20 mm; código de barras 30 × 10 mm. Por debajo se muestra un aviso; no bloquea la impresión.

## Requisitos

1. La vista previa y el documento de impresión usan el mismo `buildLayoutPlan` y el mismo `buildLabelMetrics` (una sola implementación).
2. El documento de impresión declara `@page` con el tamaño exacto del papel en mm y margen 0; los márgenes se aplican como padding.
3. La ventana de impresión explica cómo configurar el tamaño del papel, márgenes «Ninguno» y escala 100 % en el driver.
4. Precisión física: ±1 mm en Chrome y Edge sobre Windows.

## Criterios de aceptación

1. Los casos de `utils/printLayout.test.ts` y `utils/labelMetrics.test.ts` pasan.
2. El checklist físico de [testing/README.md](../../testing/README.md) se cumple dentro de ±1 mm.
3. Diez etiquetas seguidas en papel troquelado con página fija no se desplazan.
