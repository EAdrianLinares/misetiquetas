# SPEC-FUNC-005: Flujo completo del MVP

## Objetivo

Definir el flujo end-to-end del MVP para que sirva como referencia de implementación y validación del producto.

## Alcance

Este spec describe el recorrido completo del usuario desde que pega los datos hasta que obtiene la vista previa y puede imprimir las etiquetas.

## Actores

- Usuario final.
- Sistema de interpretación de datos.
- Sistema de generación de etiquetas.
- Sistema de impresión.

## Flujo principal

1. El usuario accede a la aplicación.
2. El usuario pega información desde una fuente externa (Excel, Sheets, CSV o texto tabulado).
3. El sistema interpreta la información y genera registros estructurados.
4. El sistema muestra los registros interpretados para revisión.
5. El usuario corrige los datos que necesite.
6. El usuario selecciona la plantilla y el tipo de código.
7. El usuario define la cantidad de copias por registro.
8. El sistema genera una vista previa de las etiquetas.
9. El usuario revisa la vista previa.
10. El usuario inicia la impresión.
11. El sistema prepara el documento y lo deja listo para imprimir.

## Reglas de negocio

- El usuario no debe volver a escribir manualmente toda la información si ya la tiene en otra fuente.
- La entrada puede venir de texto pegado o CSV.
- Cada registro interpretado debe tener nombre y código válidos.
- El precio debe ser mayor que cero.
- El precio con descuento, si existe, no puede ser mayor que el precio normal.
- La plantilla debe aplicarse de manera uniforme a todas las etiquetas.
- La vista previa debe reflejar el contenido final que se imprimirá.

## Estados del flujo

- InputReady: el usuario ha pegado información.
- Parsed: los datos fueron interpretados.
- Review: el usuario está revisando o corrigiendo registros.
- PreviewReady: la vista previa está lista.
- PrintReady: el documento de impresión está preparado.

## Requisitos funcionales

- Ingreso de datos desde texto.
- Detección básica de formato.
- Interpretación de registros.
- Mostrar errores y advertencias.
- Edición manual de registros.
- Selección de plantilla.
- Selección de tipo de código.
- Configuración de cantidad de copias.
- Generación de vista previa.
- Preparación para impresión.

## Requisitos no funcionales

- El flujo debe ser rápido.
- La interfaz debe ser simple y directa.
- El sistema debe tolerar entradas incompletas sin romper el flujo.
- Los errores deben ser claros y accionables.
- La experiencia debe funcionar sin base de datos persistente en el MVP.

## Criterios de aceptación

- Un usuario puede completar el flujo completo desde la entrada hasta la impresión sin reescribir manualmente los datos.
- El sistema interpreta correctamente entradas simples de texto tabulado o CSV.
- El usuario puede corregir errores antes de generar la vista previa.
- La vista previa coincide con el contenido que se imprimirá.
- El flujo puede ejecutarse sin persistencia externa en el MVP.

## Datos de ejemplo

### Entrada

```text
nombre	codigo	precio
Producto A	001	1200
Producto B	002	800
```

### Resultado esperado

- Dos registros interpretados.
- Dos etiquetas listas para vista previa.
- Plantilla y código aplicados correctamente.
