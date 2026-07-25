# EPIC-002 - Gestión de Plantillas

## Objetivo

Permitir al usuario seleccionar la plantilla que será utilizada para generar e imprimir las etiquetas a partir de los registros interpretados.

Las plantillas definen la distribución física de las etiquetas sobre la hoja o medio de impresión, garantizando que todas las etiquetas sean generadas con el tamaño y la ubicación correctos.

---

# Alcance

Esta épica incluye las funcionalidades necesarias para trabajar con las plantillas disponibles en el sistema.

Comprende:

- Consultar las plantillas disponibles.
- Seleccionar una plantilla.
- Visualizar la información de la plantilla.
- Utilizar la plantilla seleccionada durante la generación de etiquetas.

---

# Flujo Principal

1. El usuario accede a la generación de etiquetas.
2. El sistema muestra las plantillas disponibles.
3. El usuario selecciona una plantilla.
4. El sistema registra la plantilla activa.
5. La plantilla será utilizada para construir la vista previa.
6. La misma plantilla será utilizada durante la impresión.

---

# Información de la Plantilla

Cada plantilla deberá definir como mínimo:

- Nombre.
- Descripción.
- Tamaño de papel.
- Número de filas.
- Número de columnas.
- Ancho de la etiqueta.
- Alto de la etiqueta.
- Márgenes.
- Separación horizontal.
- Separación vertical.

---

# Reglas de Negocio

- Siempre deberá existir una plantilla seleccionada antes de generar etiquetas.
- Solo podrá existir una plantilla activa por generación.
- La plantilla determinará completamente la distribución de las etiquetas.
- Todas las etiquetas de una misma generación utilizarán la misma plantilla.

---

# Validaciones

El sistema impedirá generar etiquetas cuando:

- No exista una plantilla seleccionada.
- La plantilla sea inválida.
- La plantilla no pueda representar correctamente las etiquetas.

---

# Casos Especiales

El sistema deberá soportar correctamente:

- Cambio de plantilla antes de generar.
- Cambio de plantilla después de modificar registros interpretados.
- Plantillas con diferentes tamaños de papel.
- Plantillas con diferentes cantidades de etiquetas por página.

---

# Criterios de Aceptación

La épica se considerará completada cuando:

- Sea posible consultar las plantillas disponibles.
- Sea posible seleccionar una plantilla.
- La plantilla seleccionada permanezca activa durante la generación.
- La vista previa utilice la plantilla seleccionada.
- La impresión respete la distribución definida por la plantilla.

---

# Dependencias

Depende de:

- EPIC-001 - Ingreso e Interpretación de Datos.

Es utilizada por:

- EPIC-003 - Gestión de Generaciones.
- EPIC-004 - Generación de Etiquetas.
- EPIC-005 - Impresión de Etiquetas.

---

# Fuera del Alcance

No forma parte de esta épica:

- Crear plantillas.
- Editar plantillas.
- Eliminar plantillas.
- Editor visual de plantillas.
- Personalización de colores.
- Personalización de tipografías.
- Plantillas compartidas.

Estas funcionalidades podrán incorporarse en versiones posteriores.

---

# Historias de Usuario Relacionadas

- US-006 Consultar plantillas disponibles.
- US-007 Seleccionar plantilla.
- US-008 Visualizar información de una plantilla.

---

# Resultado Esperado

Al finalizar esta épica, el usuario podrá seleccionar una plantilla válida que será utilizada durante la generación, vista previa e impresión de etiquetas.

---

# Trazabilidad

## Documentos Relacionados

- Vision.md
- Domain.md
- MVP.md
- Roadmap.md
- Technology.md

## Entidades Involucradas

- PlantillaEtiqueta
- Generacion

## Épicas Relacionadas

- EPIC-001 - Ingreso e Interpretación de Datos
- EPIC-003 - Gestión de Generaciones
- EPIC-004 - Generación de Etiquetas
- EPIC-005 - Impresión de Etiquetas