# SPEC-TECH-001: Pipeline de interpretación de datos

## Objetivo

Definir la arquitectura técnica del flujo de ingreso y interpretación de datos.

## Alcance

Este spec cubre la lógica de parsing de texto/CSV, transformación a registros interpretados y validación básica.

## Componentes

- Frontend: pantalla de ingreso de datos.
- Backend: servicio de interpretación.
- Modelo de estado: entrada, registros, errores, plantilla, configuración de impresión.

## Flujo técnico

1. El frontend envía el contenido pegado al backend.
2. El backend analiza el contenido y detecta si es texto tabulado, CSV o similar.
3. El backend transforma la entrada en una lista de registros interpretados.
4. El backend devuelve:
   - registros
   - errores
   - advertencias
   - estado de validación
5. El frontend muestra estos resultados al usuario.

## Reglas técnicas

- La interpretación debe ser determinista para el mismo input.
- Debe manejarse errores de parsing con mensajes claros.
- El backend debe devolver los campos en un formato consistente.
- El frontend debe conservar los cambios del usuario en memoria durante la sesión.

## Formato de datos

```json
{
  "records": [
    {
      "id": "uuid",
      "name": "Producto A",
      "code": "001",
      "price": 1200,
      "discountPrice": null,
      "validationState": "valid"
    }
  ],
  "errors": []
}
```

## Criterios de aceptación

- El flujo funciona con texto tabulado y CSV básico.
- El sistema devuelve un resultado estructurado y consistente.
- El frontend puede mostrar los resultados y permitir edición.
