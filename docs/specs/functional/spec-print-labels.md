# SPEC-FUNC-004: Imprimir etiquetas

## Objetivo

Permitir que el usuario imprima las etiquetas generadas desde la vista previa.

## Contexto

Una vez validada la vista previa, el sistema debe enviar el contenido preparado a la impresora del navegador o a la vista de impresión.

## Entrada esperada

- Etiquetas previamente generadas.
- Plantilla seleccionada.
- Configuración de impresión.

## Comportamiento esperado

1. El usuario selecciona la opción de impresión.
2. El sistema prepara el documento de impresión.
3. El navegador muestra la vista de impresión.
4. El usuario confirma o cancela la impresión.

## Reglas de negocio

- Debe imprimirse el contenido visible en la vista previa.
- No deben perderse los datos ni la plantilla al imprimir.
- La generación debe marcarse como lista o completada luego de la impresión.

## Salida esperada

- Documento de impresión listo.
- Estado de la generación actualizado según el resultado del flujo.

## Criterios de aceptación

- El usuario puede iniciar la impresión desde la vista previa.
- El contenido impreso coincide con la vista previa.
- El flujo permite cancelar o confirmar el proceso.
