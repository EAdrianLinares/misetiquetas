# Architecture.md

# Arquitectura del Proyecto

## Objetivo

La aplicación es una SPA estática: toda la lógica se ejecuta en el navegador y no depende de ningún servidor propio ([ADR-002](adr/adr-002-logica-en-frontend.md)).

Cada módulo tiene una única responsabilidad, para facilitar el mantenimiento, las pruebas y la incorporación de nuevas funcionalidades.

---

# Arquitectura General

```text
+------------------------------------------+
|  Vercel (hosting estático)               |
|                                          |
|  Navegador del usuario                   |
|  React + Vite                            |
|   ├─ domain/   interpretación, reglas    |
|   ├─ utils/    layout, métricas, códigos |
|   └─ App.tsx   interfaz                  |
|                                          |
|  → ventana de impresión del navegador    |
+------------------------------------------+
```

Los datos del usuario nunca salen del navegador.

---

# Persistencia

No hay base de datos. El estado vive en memoria durante la sesión y se reconstruye a partir de la entrada del usuario.

---

# Módulos (`frontend/src`)

| Módulo | Archivos | Responsabilidad |
|---|---|---|
| Interpretación | `domain/parseInput.ts`, `domain/amount.ts` | Convertir el texto pegado en registros ([SPEC-FUNC-006](specs/functional/spec-input-format.md)) |
| Registros | `domain/records.ts` | Validación única de un registro (al interpretar y al editar) |
| Generación | `domain/labels.ts` | Plantillas, copias, límites y etiquetas resultantes |
| Layout | `utils/printLayout.ts` | Perfiles de papel, columnas, filas, páginas y escala de la etiqueta |
| Métricas | `utils/labelMetrics.ts` | Medidas internas de la etiqueta y mínimos de legibilidad del código |
| Códigos | `utils/codeRendering.ts` | Código de barras (CODE128, SVG) y QR |
| Impresión | `utils/printDocument.ts` | Documento HTML con `@page` en mm para la ventana de impresión |
| Interfaz | `App.tsx`, `components/` | Flujo de 3 pasos: pegar, revisar, configurar e imprimir |

## Regla principal

**Una sola implementación por regla.** La vista previa y la impresión usan el mismo `buildLayoutPlan` y el mismo `buildLabelMetrics`, así que no pueden divergir.

`domain/` y `utils/` son funciones puras sin dependencias de React: se prueban con Vitest sin navegador.

---

# Principios

* Separación de responsabilidades.
* Funciones puras para las reglas; la interfaz sólo compone.
* Código sencillo y proporcional a la etapa del producto.
* Desarrollo guiado por especificaciones (SDD).

---

# Evolución

Si en el futuro se necesita persistencia, cuentas o una API pública (Roadmap 2.x), se añadirá un backend mediante un nuevo ADR. Los módulos de `domain/` están aislados para poder reutilizarse o portarse.
