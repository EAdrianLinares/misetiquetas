# SPEC-TECH-001: Pipeline de interpretación de datos

## Objetivo

Definir cómo se implementa el ingreso e interpretación de datos. Las reglas funcionales están en [SPEC-FUNC-006](../functional/spec-input-format.md).

## Componentes

| Módulo | Responsabilidad |
|---|---|
| `domain/parseInput.ts` | Filas, separador, comillas CSV, cabecera, lectura de campos |
| `domain/amount.ts` | Importes en formato es-CO |
| `domain/records.ts` | `buildRecord` (validación única) y `updateRecordField` (edición) |
| `App.tsx` | Textarea, botón «Interpretar datos», tabla de revisión |

## Flujo técnico

1. El usuario pulsa «Interpretar datos».
2. `parseInput(texto)` devuelve `{ records, errors, separator, hasHeader }`. Es síncrono y no hace llamadas de red.
3. `App` guarda los registros y el texto que los produjo.
4. Cada edición en la tabla llama a `updateRecordField`, que revalida el registro con las mismas reglas.
5. Si el textarea cambia después de interpretar, se muestra un aviso y se bloquea la impresión hasta volver a interpretar.

## Reglas técnicas

- La interpretación es determinista: la misma entrada produce la misma salida.
- `ParsedRecord` guarda el texto original de los importes (`priceText`, `discountText`) para que la tabla muestre lo que el usuario escribió, y los valores numéricos interpretados (`price`, `discountPrice`).
- Nombre y código se guardan sin recortar (para editar con espacios); se recortan al generar las etiquetas.
- El id de un registro es `record-<fila>`, estable mientras no se vuelva a interpretar.

## Formato de datos

```ts
interface ParsedRecord {
  id: string;            // "record-3"
  row: number;           // línea de la entrada original
  name: string;
  code: string;
  priceText: string;     // "1.500"
  discountText: string;
  price: number | null;  // 1500; null si falta o es inválido
  discountPrice: number | null;
  validationState: 'valid' | 'invalid';
  errors: string[];
}
```

## Criterios de aceptación

Cubiertos por `domain/parseInput.test.ts` y `domain/amount.test.ts`.
