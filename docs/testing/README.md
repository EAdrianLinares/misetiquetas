# Testing

## Automatizado

Vitest, en `frontend/`: `npm test`. La CI lo ejecuta en cada push y PR.

| Archivo | Cubre |
|---|---|
| `domain/amount.test.ts` | Importes en formato es-CO (miles, decimales, símbolos) |
| `domain/parseInput.test.ts` | Separadores, celdas vacías, comillas CSV, cabeceras, validación y edición de registros |
| `domain/labels.test.ts` | Copias, límites, códigos incompatibles con código de barras, tamaños de plantilla |
| `utils/printLayout.test.ts` | Columnas, filas, páginas y escala por perfil de papel; márgenes del perfil personalizado |
| `utils/labelMetrics.test.ts` | El contenido nunca excede la etiqueta; avisos de tamaño mínimo del código |

Regla: cada ejemplo de una spec (`docs/specs/`) tiene su test.

## Sin cobertura automatizada

- `App.tsx` (interfaz). Se valida con el flujo manual de abajo.
- Impresión física. No se puede automatizar; usa el checklist.

## Flujo manual (tras cambios en la interfaz)

1. Pegar desde Excel una tabla con cabecera, una celda de código vacía y un precio con punto de miles (`1.500`).
2. Pulsar «Interpretar datos»: la fila con el código vacío aparece con error y «Imprimir» está deshabilitado.
3. Escribir el código en la tabla: la fila pasa a OK y la vista previa se actualiza.
4. Cambiar la plantilla, el tipo de código y las copias: la vista previa cambia al instante.
5. Pulsar «Imprimir»: se abre la ventana de impresión con el mismo número de etiquetas.

## Checklist de impresión física

Tras cambiar layout, métricas o el documento de impresión. Tolerancia: ±1 mm.

| Papel | Plantilla | Verificar |
|---|---|---|
| Continuo 58 mm | Estándar (se reduce) | Medida impresa = la que indica la vista previa; el código se lee con el lector |
| Continuo 80 mm | Compacta | Medida exacta; sin avance de papel sobrante |
| Continuo 100 mm, 2 columnas | Compacta | Columnas alineadas; ninguna etiqueta partida |
| Troquelado (página fija) | Personalizada = medida del troquel | 10 etiquetas seguidas sin desplazarse |
| A4 | Estándar | Filas y páginas iguales a la vista previa |

En cada caso: tamaño del papel configurado en el driver, márgenes «Ninguno» y escala 100 %.
