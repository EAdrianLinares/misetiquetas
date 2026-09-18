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
- Si un valor es inválido, el registro se marca con su error al instante y la impresión queda bloqueada hasta corregirlo o quitarlo (RN-018).
- La validación es la misma que al interpretar ([SPEC-FUNC-006](spec-input-format.md) §5).

## Salida esperada

- Registro actualizado.
- Estado validado del registro.
- Continuidad del flujo sin perder los cambios.

## Criterios de aceptación

- El usuario puede editar un registro interpretado.
- El sistema no permite imprimir mientras haya registros inválidos.
- Los cambios corregidos se reflejan en la generación posterior.
