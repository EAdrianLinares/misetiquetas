# EPIC-005

# Impresión de Etiquetas

---

# Información General

**Código:** EPIC-005

**Nombre:**
Impresión de Etiquetas

**Prioridad:**
Alta

**Estado:**
Pendiente

**Versión objetivo:**
MVP

---

# Objetivo

Permitir al usuario imprimir las etiquetas previamente generadas, garantizando que el contenido corresponda con la plantilla utilizada y con la información de los registros interpretados de la generación.

---

# Descripción

Una vez que las etiquetas han sido generadas, el usuario podrá revisar una vista previa e iniciar el proceso de impresión.

El sistema enviará todas las etiquetas de la generación a la impresora seleccionada y registrará que la generación ha sido impresa.

---

# Alcance

Esta épica incluye:

* Visualizar las etiquetas antes de imprimir.
* Iniciar la impresión de una generación.
* Imprimir todas las etiquetas generadas.
* Actualizar el estado de la generación a **Impresa**.

No incluye:

* Diseño de plantillas.
* Generación de etiquetas.
* Reimpresión.
* Exportación a otros formatos.

---

# Flujo Principal

1. El usuario selecciona una generación en estado **Generada**.
2. Visualiza las etiquetas.
3. Selecciona **Imprimir**.
4. El sistema envía las etiquetas a la impresora.
5. Finaliza el proceso de impresión.
6. La generación cambia a estado **Impresa**.

---

# Validaciones

El sistema deberá impedir:

* imprimir una generación que no tenga etiquetas generadas;
* imprimir una generación en estado **Borrador**;
* imprimir una generación inexistente.

---

# Reglas de Negocio

## RN-501

Solo podrán imprimirse generaciones en estado **Generada**.

---

## RN-502

Todas las etiquetas de una generación deberán enviarse a impresión en un único proceso.

---

## RN-503

La información impresa deberá corresponder exactamente a las etiquetas generadas.

---

## RN-504

Al finalizar correctamente la impresión, la generación cambiará automáticamente al estado **Impresa**.

---

# Casos Especiales

## Generación sin etiquetas

El sistema no permitirá iniciar la impresión.

---

## Generación ya impresa

La generación permanecerá disponible únicamente para consulta.

---

# Criterios de Aceptación

## CA-501

El usuario puede visualizar las etiquetas antes de imprimir.

---

## CA-502

El sistema imprime todas las etiquetas de la generación.

---

## CA-503

La información impresa coincide con la información generada.

---

## CA-504

Al finalizar correctamente la impresión, la generación cambia al estado **Impresa**.

---

## CA-505

Las generaciones impresas permanecen disponibles para consulta.

---

# Dependencias

Esta épica depende de:

* EPIC-004 Generación de Etiquetas.

---

# Fuera del Alcance

No incluye:

* Reimpresión.
* Exportación a PDF.
* Envío por correo electrónico.
* Historial de impresiones.
* Configuración avanzada de impresoras.

---

# Historias de Usuario Relacionadas

US-501 Visualizar etiquetas antes de imprimir.

US-502 Imprimir etiquetas.

US-503 Consultar generaciones impresas.

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

EPIC-005 Impresión de Etiquetas

↓

US-501 a US-503

↓

Specs

↓

Implementación
