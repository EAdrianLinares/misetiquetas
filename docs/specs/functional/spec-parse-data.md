# SPEC-FUNC-001: Pegar e interpretar datos

## Objetivo

Permitir que el usuario pegue información en el sistema y obtenga registros interpretados para generar etiquetas.

## Contexto

El usuario ya posee información en hojas de cálculo o texto. El sistema debe convertirla en registros estructurados sin exigirle reescribirla manualmente.

## Entrada esperada

- Texto pegado desde Excel, Google Sheets, CSV o texto simple por filas.
- Cada fila representa un producto.
- Los campos deben venir en este orden: nombre, código, precio y descuento opcional.
- Los valores pueden separarse por comas, tabulaciones o espacios.

## Comportamiento esperado

1. El sistema recibe el texto pegado.
2. El sistema separa el contenido por filas.
3. El sistema interpreta cada fila usando el orden definido de campos.
4. El sistema muestra los registros interpretados con su estado de validación.
5. El usuario puede corregir los registros antes de continuar.

## Reglas de negocio

- Debe aceptarse texto por filas separado por comas, tabulaciones o espacios.
- Cada registro interpretado debe mantener el orden nombre, código, precio y descuento opcional.
- Si falta información crítica, debe marcarse como inválido o con error.
- El sistema debe informar claramente los problemas de formato.

## Salida esperada

- Lista de registros interpretados.
- Lista de errores o advertencias de formato.
- Posibilidad de continuar con la generación de etiquetas.

## Criterios de aceptación

- El usuario puede pegar información válida y obtener registros interpretados.
- El sistema reporta errores cuando el formato es incompleto o inválido.
- El usuario puede corregir registros antes de pasar al siguiente paso.
