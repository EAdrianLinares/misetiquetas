# SPEC-FUNC-002: Corregir registros interpretados

## Objetivo

Permitir que el usuario corrija manualmente los registros interpretados antes de generar etiquetas.

## Contexto

La interpretación automática puede fallar o ser incompleta. El flujo debe permitir ajustes rápidos sin salir del proceso principal.

## Entrada esperada

- Lista de registros interpretados.
- Un registro seleccionado para edición.

## Comportamiento esperado

1. El usuario revisa los registros interpretados.
2. Selecciona un registro con errores o valores incompletos.
3. Modifica los campos requeridos.
4. El sistema valida la corrección.
5. El sistema actualiza el registro y lo mantiene disponible para la generación.

## Reglas de negocio

- El nombre y código no pueden quedar vacíos.
- El precio debe ser mayor que cero.
- El precio con descuento debe ser menor o igual al precio normal si existe.
- Si un valor es inválido, el sistema debe mostrar el error antes de permitir continuar.

## Salida esperada

- Registro actualizado.
- Estado validado del registro.
- Continuidad del flujo sin perder los cambios.

## Criterios de aceptación

- El usuario puede editar un registro interpretado.
- El sistema impide guardar cambios inválidos.
- Los cambios corregidos se reflejan en la generación posterior.
