# SPEC-FUNC-006: Formato de entrada e interpretación

Complementa [SPEC-FUNC-001](spec-parse-data.md). Define de forma exacta cómo se interpreta el texto pegado. Implementación: `frontend/src/domain/parseInput.ts` (ver [ADR-002](../../adr/adr-002-logica-en-frontend.md)).

## Principio

**Ante la duda, marcar error; nunca adivinar.** Un precio mal interpretado que se imprime como válido es peor que un registro marcado para revisión.

## 1. Filas

- Cada línea no vacía es una fila. Las líneas vacías o compuestas solo de separadores se ignoran.
- Cada registro conserva su número de línea original (`Fila N`) para los mensajes de error.

## 2. Separador (se decide una vez para todo el texto)

| Prioridad | Si el texto contiene… | Separador | Uso típico |
|---|---|---|---|
| 1 | Tabulación | `\t` | Copiar desde Excel o Google Sheets |
| 2 | `;` | `;` | CSV de Excel en configuración regional es-CO |
| 3 | `,` | `,` | CSV estándar |
| 4 | Ninguno de los anteriores | Espacios | Texto escrito a mano |

- Con tabulación, `;` o `,`, **las celdas vacías se conservan**: una celda vacía nunca desplaza las demás columnas.
- Con `,` y `;` se respetan las comillas dobles de CSV: `"Arroz, 500g",001,2500` tiene 3 campos y `""` dentro de comillas es una comilla literal.
- Con espacios, el formato es **nombre código precio**: el último valor es el precio, el penúltimo el código y el resto es el nombre (puede tener varias palabras). **El descuento no se admite con espacios**, porque sería ambiguo; para usar descuento hay que separar con tabulación, `;` o `,`.

## 3. Cabecera

- La primera fila es cabecera si contiene, al menos, una columna de nombre, una de código y una de precio.
- La comparación ignora mayúsculas, tildes y espacios de los extremos.

| Campo | Nombres aceptados |
|---|---|
| Nombre | nombre, name, producto, descripcion, articulo |
| Código | codigo, code, sku, referencia, ref |
| Precio | precio, price, valor, pvp |
| Descuento | descuento, discount, precio descuento, precio oferta, oferta |

- Con cabecera, las columnas pueden venir en cualquier orden y las columnas no reconocidas se ignoran.
- Sin cabecera, el orden es: nombre, código, precio, descuento (opcional). Una fila con más columnas de las esperadas se marca con error.
- La cabecera con espacios como separador no se admite: con espacios, la primera fila siempre es un dato.

## 4. Números (precio y descuento)

Formato colombiano (es-CO): `.` separa miles y `,` separa decimales. Antes de interpretar se eliminan los espacios, `$` y `COP`.

| Entrada | Valor | Regla |
|---|---|---|
| `2500` | 2500 | Entero |
| `1.500` / `1.500.000` | 1500 / 1500000 | `.` seguido de grupos de exactamente 3 dígitos = miles |
| `12,50` | 12,5 | `,` seguida de 1–2 dígitos = decimales |
| `1.500,50` | 1500,5 | Si aparecen los dos, el último es el decimal |
| `1,500` | 1500 | `,` seguida de grupos de 3 dígitos = miles (formato en-US) |
| `12.5` | 12,5 | `.` que no forma grupos de miles = decimal |
| `$ 2.500` / `2500 COP` | 2500 | Símbolos eliminados |
| `abc`, `-5`, `1.50.0` | Error | No es un número válido |

## 5. Validación de cada registro

Es la misma validación al interpretar y al editar en la tabla (`validateRecord`).

| Regla | Mensaje |
|---|---|
| Nombre no vacío (RN-001) | El nombre es obligatorio. |
| Código no vacío (RN-002) | El código es obligatorio. |
| Precio numérico > 0 (RN-004) | El precio debe ser un número mayor que cero. |
| Descuento vacío o `0` = sin descuento (RN-005) | — |
| Descuento no numérico o negativo | El precio con descuento no es un número válido. |
| Descuento ≤ precio | El descuento no puede ser mayor que el precio normal. |
| Columnas de más (sin cabecera) | La fila tiene más columnas de las esperadas. |

## 6. Generación de etiquetas

- Copias: número entero entre 1 y 500 (RN-011).
- Máximo 5.000 etiquetas por impresión (registros × copias).
- Con código de barras (CODE128), el código solo puede contener caracteres ASCII imprimibles; si no, error: «Usa QR o quita tildes y ñ».
- **No se puede imprimir mientras haya registros con errores.** El usuario los corrige en la tabla o los quita con «Quitar registros con errores»; nunca se omiten en silencio.

## Criterios de aceptación

Cubiertos por `frontend/src/domain/*.test.ts`:

- Todos los ejemplos de las secciones 2–5 producen el resultado indicado.
- Una celda vacía en la columna de código produce el error «El código es obligatorio» y no desplaza el precio.
- Editar un registro en la tabla lo revalida y la vista previa se actualiza al instante.
