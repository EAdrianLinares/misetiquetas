# API

Este directorio documenta los contratos de API del backend.

## Endpoints propuestos

### POST /api/parse

Interpreta texto pegado y devuelve registros estructurados.

#### Request

```json
{
  "content": "nombre\tcodigo\tprecio\nProducto A\t001\t1200"
}
```

#### Response

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

### POST /api/preview

Genera la vista previa de etiquetas a partir de registros, plantilla y configuración.

#### Request

```json
{
  "records": [
    {
      "id": "record-1",
      "name": "Producto A",
      "code": "001",
      "price": 1200,
      "discountPrice": null
    }
  ],
  "template": "standard",
  "codeType": "barcode",
  "copies": 2
}
```

#### Response

```json
{
  "labels": [
    {
      "id": "label-1",
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

### POST /api/print

Prepara el contenido listo para impresión.

#### Request

```json
{
  "labels": [
    {
      "id": "label-1",
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

#### Response

```json
{
  "status": "ready-for-print",
  "printDocument": {
    "title": "Etiquetas listas para imprimir",
    "template": "standard",
    "widthMm": 80,
    "heightMm": 50,
    "labels": [
      {
        "id": "label-1",
        "recordId": "record-1",
        "name": "Producto A",
        "code": "001",
        "price": 1200,
        "discountPrice": null,
        "template": "standard",
        "codeType": "barcode",
        "templateWidthMm": 80,
        "templateHeightMm": 50
      }
    ],
    "generatedAt": "2026-07-25T20:00:00.000Z"
}
```