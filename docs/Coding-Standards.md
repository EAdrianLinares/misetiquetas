# Coding-Standards.md

Convenciones que sigue el código actual. Si cambian, se actualiza este documento en el mismo commit.

## Idioma

- Código (identificadores, tipos): inglés. `ParsedRecord`, `buildLabels`, `discountPrice`.
- Textos de la interfaz, mensajes de error, comentarios y documentación: español.

## Nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones | camelCase | `parseAmount`, `labelMetrics` |
| Componentes React y sus archivos | PascalCase | `BarcodePreview.tsx` |
| Módulos no-componente | camelCase | `printLayout.ts` |
| Tipos e interfaces | PascalCase | `PrintSettings` |
| Constantes de configuración | UPPER_SNAKE_CASE | `MAX_COPIES` |
| Tests | junto al módulo, `*.test.ts` | `parseInput.test.ts` |

## Dónde va cada cosa

- **Reglas de negocio** (validaciones, límites, interpretación): `frontend/src/domain/`, como funciones puras.
- **Cálculos físicos** (layout, métricas, códigos, documento de impresión): `frontend/src/utils/`.
- **Interfaz**: `App.tsx` y `components/`. La interfaz no implementa reglas; llama a `domain/` y `utils/`.
- Una regla se implementa **una sola vez**. Antes de escribirla, busca si ya existe.

## Reglas

- TypeScript estricto; no se usa `any`.
- Los límites y medidas son constantes con nombre, no números sueltos.
- Los mensajes de error indican qué falla y cómo corregirlo, y citan la fila cuando aplica.
- Todo texto del usuario que se inserta en HTML pasa por `escapeHtml`.
- Los comentarios explican el porqué, no el qué.

## Flujo de trabajo (SDD)

1. Una regla nueva o un cambio de comportamiento se escribe primero en la spec correspondiente (`docs/specs/`).
2. Los ejemplos de la spec se convierten en tests.
3. Después se implementa.
4. Antes de subir: `npm run lint`, `npm test` y `npm run build` en `frontend/` (la CI lo repite).
