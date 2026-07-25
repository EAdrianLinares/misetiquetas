# Testing

Este directorio documenta la estrategia de pruebas del proyecto.

## Objetivo

Asegurar que el flujo principal del MVP funcione de manera consistente.

## Cobertura propuesta

- Pruebas unitarias del parser.
- Pruebas de integración del flujo parse → review → preview.
- Pruebas de UI para los estados de carga, error y edición.
- Pruebas de contrato de API.

## Casos críticos a cubrir

- Texto tabulado válido.
- CSV válido.
- Datos incompletos.
- Precios inválidos.
- Errores de formato.
- Corrección manual de un registro.
