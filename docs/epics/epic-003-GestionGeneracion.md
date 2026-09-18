# EPIC-003
# Gestión de Generaciones

> **Alcance en el MVP:** una generación es el estado actual de la pantalla (registros, plantilla, papel, tipo de código y copias). Los estados Borrador/Generada/Impresa, guardar cambios e histórico requieren persistencia y quedan para la versión 1.1 del Roadmap ("Guardar generaciones").

---

# Información General

**Código:** EPIC-003

**Nombre:**
Gestión de Generaciones

**Prioridad:**
Alta

**Estado:**
Pendiente

**Versión objetivo:**
MVP

---

# Objetivo

Permitir al usuario crear una generación de etiquetas a partir de los registros interpretados desde una fuente de datos.

Una generación representa un proceso de trabajo que agrupa información ya estructurada para producir e imprimir etiquetas de forma rápida.

---

# Descripción

La generación es el núcleo del flujo principal del sistema.

En ella el usuario podrá:

- crear una nueva generación;
- seleccionar la plantilla que utilizará;
- incluir registros interpretados;
- definir la cantidad de etiquetas por registro;
- revisar un resumen antes de generar las etiquetas.

Una generación puede contener uno o varios registros interpretados.

---

# Alcance

Esta épica incluye:

- Crear generación.
- Consultar generaciones.
- Visualizar detalle.
- Editar una generación mientras no haya sido generada.
- Eliminar una generación.
- Incluir registros interpretados.
- Modificar cantidades.
- Eliminar registros de la generación.

No incluye:

- Construcción física de etiquetas.
- Impresión.

Estas funcionalidades pertenecen a las siguientes épicas.

---

# Flujo Principal

## Crear generación

1. El usuario cuenta con registros interpretados listos.
2. Selecciona "Nueva generación".
3. Elige la plantilla.
4. Incluye los registros interpretados deseados.
5. Define la cantidad de etiquetas por registro.
6. Guarda la generación.
7. La generación queda lista para generar etiquetas.

---

# Información de la Generación

Cada generación tendrá como mínimo:

- Fecha de creación.
- Plantilla utilizada.
- Estado.
- Total de registros.
- Total de etiquetas.

---

# Estados de una Generación

## Borrador

La generación puede modificarse.

Se pueden:

- agregar registros;
- eliminar registros;
- cambiar cantidades;
- cambiar plantilla.

---

## Generada

Las etiquetas ya fueron construidas.

No podrán modificarse los registros.

---

## Impresa

Las etiquetas fueron enviadas a impresión.

La generación queda como histórico.

---

# Gestión de Registros Interpretados

Dentro de una generación será posible:

1. agregar un registro interpretado;
2. definir la cantidad de etiquetas;
3. guardar el cambio;
4. actualizar totales.

---

# Validaciones

El sistema deberá impedir:

- crear generaciones sin plantilla;
- incluir registros inexistentes;
- registrar cantidades menores a 1;
- duplicar un mismo registro dentro de la generación.

Si un registro ya existe, el sistema deberá permitir actualizar su cantidad en lugar de crear un duplicado.

---

# Reglas de Negocio

## RN-301

Toda generación debe tener una plantilla asignada.

---

## RN-302

Una generación puede contener múltiples registros interpretados.

---

## RN-303

Un registro no podrá repetirse dentro de la misma generación.

---

## RN-304

La cantidad de etiquetas debe ser mayor que cero.

---

## RN-305

El total de etiquetas corresponde a la suma de las cantidades de todos los registros.

---

## RN-306

Una generación en estado Generada no podrá modificarse.

---

## RN-307

Una generación Impresa será considerada de solo lectura.

---

# Casos Especiales

## Generación vacía

Puede existir temporalmente mientras el usuario agrega registros.

---

## Sin registros

No podrá ejecutarse la generación de etiquetas.

---

## Cambio de plantilla

Solo será permitido mientras la generación permanezca en estado Borrador.

---

# Criterios de Aceptación

## CA-301

El usuario puede crear una generación a partir de registros interpretados.

---

## CA-302

Debe ser obligatorio seleccionar una plantilla.

---

## CA-303

El usuario puede agregar múltiples registros.

---

## CA-304

No deben existir registros duplicados.

---

## CA-305

El sistema calcula automáticamente el total de etiquetas.

---

## CA-306

Las generaciones generadas no podrán editarse.

---

## CA-307

Las generaciones impresas serán únicamente consultables.

---

# Dependencias

Esta épica depende de:

- EPIC-001 Ingreso e Interpretación de Datos.
- EPIC-002 Gestión de Plantillas.

Y habilita:

- EPIC-004 Generación de Etiquetas.
- EPIC-005 Impresión de Etiquetas.

---

# Fuera del Alcance

No incluye:

- PDF.
- Exportación.
- Impresión.
- Historial de impresiones.
- Reimpresión.

---

# Historias de Usuario Relacionadas

- US-301 Crear generación a partir de datos interpretados.
- US-302 Editar generación.
- US-303 Eliminar generación.
- US-304 Consultar generaciones.
- US-305 Agregar registro interpretado.
- US-306 Modificar cantidad.
- US-307 Eliminar registro.
- US-308 Consultar detalle.

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

EPIC-003 Gestión de Generaciones

↓

US-301 a US-308

↓

Specs

↓

Implementación