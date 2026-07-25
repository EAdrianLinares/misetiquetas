# SPEC-FUNC-003: Generar vista previa de etiquetas

## Objetivo

Permitir que el usuario revise visualmente las etiquetas generadas a partir de los registros interpretados antes de imprimir.

## Contexto

El flujo debe ofrecer una validación visual del resultado antes de enviar la impresión. La vista previa reduce errores y permite corregir el contenido antes de finalizar.

## Entrada esperada

- Registros interpretados y corregidos.
- Plantilla seleccionada.
- Tipo de código elegido.
- Cantidad de copias por registro.

## Comportamiento esperado

1. El usuario selecciona la opción de vista previa.
2. El sistema genera una representación visual de las etiquetas.
3. El sistema muestra el resultado en pantalla.
4. El usuario puede volver a corregir datos si detecta un problema.

## Reglas de negocio

- Debe mostrarse una etiqueta por cada copia solicitada.
- La plantilla debe aplicarse a todas las etiquetas.
- El contenido mostrado debe corresponder exactamente con los datos del registro.
- Si faltan datos requeridos, la vista previa debe advertirlo.

## Salida esperada

- Vista previa renderizada de etiquetas.
- Estado de generación listo para imprimir.

## Criterios de aceptación

- El usuario puede ver una vista previa correcta de las etiquetas.
- La vista previa refleja los datos corregidos del usuario.
- La vista previa se genera a partir de la plantilla seleccionada.
