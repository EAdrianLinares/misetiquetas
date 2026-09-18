# SPEC-TECH-002: Generación de vista previa y etiquetas

## Objetivo

Definir cómo se generan las etiquetas, la vista previa y el documento de impresión.

## Componentes

| Módulo | Responsabilidad |
|---|---|
| `domain/labels.ts` | `buildLabels`: copias, límites, compatibilidad del código; `resolveTemplateSize` |
| `utils/printLayout.ts` | `buildLayoutPlan`: columnas, filas, páginas, escala y avisos |
| `utils/labelMetrics.ts` | Medidas internas de la etiqueta; `codeSizeWarning` |
| `utils/codeRendering.ts` | SVG de código de barras y QR |
| `utils/printDocument.ts` | HTML de impresión con `@page` en mm |

## Flujo técnico

1. Las etiquetas se **derivan** con `useMemo` de los registros, el tipo de código y las copias. No se guardan en estado, así que la vista previa nunca queda desactualizada.
2. `buildLabels` sólo usa registros válidos y devuelve errores (copias fuera de rango, más de 5.000 etiquetas, códigos con tildes en código de barras) en lugar de etiquetas cuando algo impide imprimir.
3. `buildLayoutPlan` recibe el tamaño de la plantilla y los ajustes del papel y decide el tamaño real de la etiqueta.
4. La vista previa y `buildPrintDocumentHtml` usan el **mismo** plan y las **mismas** métricas.
5. «Imprimir» abre la ventana dentro del clic (para evitar el bloqueador de ventanas emergentes), genera el HTML y llama a `window.print()` cuando cargan las imágenes.

## Condiciones para imprimir

Se bloquea mientras haya: registros con errores, errores de generación, o texto modificado sin reinterpretar. Los motivos se muestran en la sección «Antes de imprimir».

## Criterios de aceptación

Cubiertos por `domain/labels.test.ts`, `utils/printLayout.test.ts` y `utils/labelMetrics.test.ts`, más el flujo manual de [testing/README.md](../../testing/README.md).
