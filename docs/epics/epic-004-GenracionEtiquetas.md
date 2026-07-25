# EPIC-004

# Generación de Etiquetas

---

# Información General

**Código:** EPIC-004

**Nombre:**
Generación de Etiquetas

**Prioridad:**
Alta

**Estado:**
Pendiente

**Versión objetivo:**
MVP

---

# Objetivo

Permitir al usuario generar las etiquetas correspondientes a una generación previamente creada, utilizando la plantilla seleccionada y los registros interpretados asociados.

---

# Descripción

Una vez que una generación se encuentra completa, el usuario podrá iniciar el proceso de generación de etiquetas.

El sistema construirá una etiqueta por cada cantidad definida para cada registro interpretado, utilizando el diseño de la plantilla seleccionada.

Al finalizar el proceso, las etiquetas quedarán disponibles para su revisión e impresión.

---

# Alcance

Esta épica incluye:

* Generar etiquetas a partir de una generación.
* Construir las etiquetas utilizando la plantilla seleccionada.
* Generar una etiqueta por cada cantidad indicada.
* Consultar las etiquetas generadas.
* Visualizar una vista previa de las etiquetas.

No incluye:

* Impresión.
* Exportación.
* Reimpresión.

Estas funcionalidades pertenecen a la siguiente épica.

---

# Flujo Principal

1. El usuario selecciona una generación.
2. El sistema valida que la generación tenga registros interpretados.
3. El usuario inicia la generación.
4. El sistema construye todas las etiquetas.
5. Las etiquetas quedan asociadas a la generación.
6. La generación cambia a estado **Generada**.
7. El usuario puede visualizar las etiquetas creadas.

---

# Información de la Etiqueta

Cada etiqueta contendrá la información definida por la plantilla, incluyendo los datos del registro interpretado y el código correspondiente.

---

# Validaciones

El sistema deberá impedir:

* generar etiquetas de una generación sin registros;
* generar etiquetas de una generación que ya fue generada;
* generar etiquetas si la plantilla asociada no existe.

---

# Reglas de Negocio

## RN-401

Solo podrán generarse etiquetas de generaciones en estado **Borrador**.

---

## RN-402

Toda etiqueta deberá construirse utilizando la plantilla asignada a la generación.

---

## RN-403

La cantidad de etiquetas generadas deberá coincidir con la cantidad definida para cada registro.

---

## RN-404

Todas las etiquetas generadas quedarán asociadas a la generación que las originó.

---

## RN-405

Al finalizar correctamente el proceso, la generación cambiará a estado **Generada**.

---

# Casos Especiales

## Generación sin registros

El sistema no permitirá iniciar la generación.

---

## Generación previamente procesada

El sistema informará que las etiquetas ya fueron generadas.

---

# Criterios de Aceptación

## CA-401

El usuario puede generar las etiquetas de una generación válida.

---

## CA-402

El sistema genera la cantidad correcta de etiquetas.

---

## CA-403

Cada etiqueta utiliza la plantilla seleccionada.

---

## CA-404

Las etiquetas quedan asociadas a la generación correspondiente.

---

## CA-405

La generación cambia automáticamente al estado **Generada**.

---

## CA-406

El usuario puede consultar las etiquetas generadas antes de imprimirlas.

---

# Dependencias

Esta épica depende de:

* EPIC-001 Ingreso e Interpretación de Datos.
* EPIC-002 Gestión de Plantillas.
* EPIC-003 Gestión de Generaciones.

Y habilita:

* EPIC-005 Impresión de Etiquetas.

---

# Fuera del Alcance

No incluye:

* Impresión.
* Exportación.
* Envío por correo.
* Reimpresión.
* Historial de impresiones.

---

# Historias de Usuario Relacionadas

US-401 Generar etiquetas.

US-402 Consultar etiquetas generadas.

US-403 Visualizar vista previa de etiquetas.

---

# Trazabilidad

Vision.md

↓

Domain.md

↓

MVP.md

↓

Roadmap.md

↓

EPIC-004 Generación de Etiquetas

↓

US-401 a US-403

↓

Specs

↓

Implementación
