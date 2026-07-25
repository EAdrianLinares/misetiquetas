# ADR-001: Desplegar frontend en Vercel y backend en Render

## Status

Accepted

## Context

El proyecto necesita un despliegue sencillo, económico y rápido para el MVP. Se prioriza tiempo de puesta en marcha, facilidad de mantenimiento y mínima complejidad operativa.

## Decision

Se desplegará:

- el frontend en Vercel;
- el backend en Render;
- sin base de datos persistente en el MVP.

## Consequences

### Positives

- Despliegue rápido.
- Menor complejidad operacional.
- Adecuado para una primera versión del producto.

### Negatives

- La persistencia de datos depende de la sesión o de una futura implementación.
- Se necesita cuidar la configuración de CORS y variables de entorno.

## Alternatives considered

- Desplegar frontend y backend en una sola infraestructura.
- Usar una base de datos en el MVP.

## Notes

Esta decisión se revisará si el producto necesita persistencia real de generaciones o historial.
