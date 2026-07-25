# SPEC-FUNC-001: Pegar e interpretar datos

## Objetivo

Permitir que el usuario pegue información en el sistema y obtenga registros interpretados para generar etiquetas.

## Contexto

El usuario ya posee información en hojas de cálculo o texto. El sistema debe convertirla en registros estructurados sin exigirle reescribirla manualmente.

## Entrada esperada

- Texto pegado desde Excel, Google Sheets, CSV o texto tabulado.
- El contenido puede incluir múltiples filas y columnas.

## Comportamiento esperado

1. El sistema recibe el texto pegado.
2. El sistema detecta el formato de entrada.
3. El sistema intenta interpretar los registros.
4. El sistema muestra los registros interpretados con su estado de validación.
5. El usuario puede corregir los registros antes de continuar.

## Reglas de negocio

- Debe aceptarse texto tabulado, CSV o contenido similar.
- Cada registro interpretado debe tener nombre y código.
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
