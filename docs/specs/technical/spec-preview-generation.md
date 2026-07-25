# SPEC-TECH-002: Generación de vista previa y etiquetas

## Objetivo

Definir la arquitectura técnica para generar la vista previa y las etiquetas finales.

## Alcance

Este spec cubre la transformación de registros a etiquetas renderizables, el uso de la plantilla y la preparación para impresión.

## Componentes

- Frontend: render de etiquetas y vista previa.
- Backend: servicio de generación de payload de etiquetas.
- Modelo de estado: registros, plantilla, tipo de código, cantidad de copias.

## Flujo técnico

1. El frontend envía el conjunto de registros seleccionados al backend.
2. El backend construye un objeto de etiquetas con:
   - contenido textual
   - código a dibujar
   - plantilla asociada
   - cantidad de copias
3. El backend devuelve un payload listo para renderizar.
4. El frontend presenta la vista previa y prepara el documento de impresión.

## Reglas técnicas

- La vista previa debe reflejar exactamente el contenido final.
- La plantilla debe aplicarse de manera consistente a todas las etiquetas.
- El render debe ser independiente del almacenamiento persistente.
- El payload debe incluir suficiente información para dibujar sin depender de otra llamada.

## Formato de datos

```json
{
  "labels": [
    {
      "id": "uuid",
      "recordId": "record-1",
      "name": "Producto A",
      "code": "001",
      "price": 1200,
      "discountPrice": null,
      "template": "standard",
      "codeType": "barcode"
    }
  ]
}
```

## Criterios de aceptación

- El sistema genera un payload consistente para vista previa.
- La vista previa y la impresión usan el mismo contenido base.
- El contenido es reproducible para la misma entrada.
