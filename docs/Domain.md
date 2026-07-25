# Domain.md

# Dominio del Proyecto

## Introducción

Este documento define las entidades, conceptos y reglas de negocio del proyecto **Etiquetas**.

Su objetivo es establecer un lenguaje común para el equipo de desarrollo y describir cómo funciona el negocio antes de iniciar la implementación.

El dominio describe únicamente la lógica del negocio y las relaciones entre sus elementos, sin incluir detalles técnicos.

---

# Entidades

## FuenteDatos

Representa el contenido que el usuario pega en la aplicación para convertirlo en etiquetas.

Puede provenir de Excel, Google Sheets, CSV u otro texto tabulado o separado por comas.

### Atributos

| Campo       | Tipo           | Obligatorio | Descripción |
| ----------- | -------------- | ----------- | ----------- |
| id          | UUID           | Sí          | Identificador interno de la fuente de datos. |
| contenido   | string         | Sí          | Texto recibido desde la fuente externa. |
| formato     | string         | Sí          | Tipo de entrada reconocida por el sistema. |
| fecha       | DateTime       | Sí          | Momento en que se registró la fuente. |

---

## RegistroInterpretado

Representa una fila o registro extraído de la fuente de datos y ya convertido en una estructura utilizable por la aplicación.

### Atributos

| Campo             | Tipo           | Obligatorio | Descripción |
| ----------------- | -------------- | ----------- | ----------- |
| id                | UUID           | Sí          | Identificador interno del registro. |
| nombre            | string         | Sí          | Nombre que aparecerá en la etiqueta. |
| codigo            | string         | Sí          | Código asociado al registro. |
| precio            | decimal        | Sí          | Precio normal del registro. |
| precioDescuento   | decimal | null | No          | Precio promocional del registro. |
| estadoValidacion  | string         | Sí          | Estado de validación del registro. |
| orden             | number         | Sí          | Posición del registro dentro de la fuente. |

---

## PlantillaEtiqueta

Representa el formato físico utilizado para imprimir las etiquetas.

Define la distribución y dimensiones de las etiquetas dentro de una hoja o papel.

### Atributos

| Campo                | Tipo   | Descripción                         |
| -------------------- | ------ | ----------------------------------- |
| id                   | UUID   | Identificador de la plantilla.      |
| nombre               | string | Nombre de la plantilla.             |
| ancho                | number | Ancho de cada etiqueta.             |
| alto                 | number | Alto de cada etiqueta.              |
| filas                | number | Número de filas por hoja.           |
| columnas             | number | Número de columnas por hoja.        |
| margenSuperior       | number | Margen superior.                    |
| margenInferior       | number | Margen inferior.                    |
| margenIzquierdo      | number | Margen izquierdo.                   |
| margenDerecho        | number | Margen derecho.                     |
| separacionHorizontal | number | Espacio horizontal entre etiquetas. |
| separacionVertical   | number | Espacio vertical entre etiquetas.   |

---

## Generacion

Representa una sesión de generación de etiquetas a partir de uno o varios registros interpretados.

Todas las etiquetas generadas dentro de una misma generación comparten la misma plantilla y el mismo tipo de código.

### Atributos

| Campo      | Tipo                        |
| ---------- | --------------------------- |
| id         | UUID                        |
| fecha      | DateTime                    |
| plantilla  | PlantillaEtiqueta           |
| tipoCodigo | TipoCodigo                  |
| registros  | List<RegistroInterpretado>  |

---

## Etiqueta

Representa la etiqueta visual generada para impresión.

Una etiqueta se construye utilizando la información del registro interpretado, la plantilla seleccionada y el tipo de código elegido.

### Atributos

| Campo              | Tipo                  |
| ------------------ | --------------------- |
| registro           | RegistroInterpretado  |
| plantilla          | PlantillaEtiqueta     |
| tipoCodigo         | TipoCodigo            |
| cantidadCopias     | number                |

---

# Enumeraciones

## TipoCodigo

Valores permitidos:

* BARRAS
* QR

---

# Relaciones

* Una **FuenteDatos** puede producir uno o varios **RegistroInterpretado**.
* Un **RegistroInterpretado** puede participar en múltiples **Generacion**.
* Una **Generacion** contiene uno o varios **RegistroInterpretado**.
* Una **Generacion** utiliza una única **PlantillaEtiqueta**.
* Una **Generacion** utiliza un único **TipoCodigo**.
* Cada **RegistroInterpretado** puede producir una o varias **Etiqueta**, según la cantidad de copias indicada.

---

# Reglas de Negocio

## RN-001

Todo registro interpretado debe contener un nombre.

---

## RN-002

Todo registro interpretado debe contener un código.

---

## RN-003

El código interpretado será utilizado exactamente igual para generar el Código de Barras o el Código QR.

---

## RN-004

El precio debe ser mayor que cero.

---

## RN-005

El precio con descuento es opcional.

---

## RN-006

Si existe un precio con descuento, la etiqueta mostrará ambos precios.

---

## RN-007

Cuando exista un precio con descuento, el precio original deberá mostrarse visualmente tachado y el precio con descuento deberá destacarse como el precio vigente.

---

## RN-008

Si no existe precio con descuento, únicamente se mostrará el precio normal.

---

## RN-009

Todas las etiquetas pertenecientes a una misma generación utilizarán el mismo tipo de código.

---

## RN-010

Todas las etiquetas pertenecientes a una misma generación utilizarán la misma plantilla de impresión.

---

## RN-011

La cantidad de copias deberá ser un número entero mayor que cero.

---

## RN-012

El sistema deberá detectar y reportar los errores de formato detectados durante la interpretación de los datos.

---

## RN-013

El usuario podrá corregir la información interpretada antes de generar las etiquetas.

---

## RN-014

La plantilla únicamente define la presentación física de las etiquetas y nunca modifica la información del registro.

---

## RN-015

Toda plantilla deberá tener un nombre único.

---

## RN-016

Las dimensiones de una plantilla deberán ser mayores que cero.

---

## RN-017

Solo las plantillas activas podrán utilizarse para generar nuevas generaciones.

---

# Casos de Uso del Dominio

* Pegar datos desde una fuente externa.
* Interpretar los datos ingresados.
* Corregir registros interpretados.
* Seleccionar plantilla.
* Seleccionar tipo de código.
* Definir cantidad de copias.
* Generar etiquetas.
* Visualizar etiquetas.
* Imprimir etiquetas.

---

# Glosario

**Fuente de Datos:** texto o contenido pegado por el usuario desde otra herramienta.

**Registro Interpretado:** fila o elemento estructurado extraído de la fuente de datos.

**Etiqueta:** representación visual de un registro lista para impresión.

**Plantilla:** formato físico que determina el tamaño y distribución de las etiquetas.

**Generación:** proceso mediante el cual se generan etiquetas utilizando una configuración común y uno o varios registros interpretados.

**Código de Barras:** representación gráfica lineal del código del registro.

**Código QR:** representación gráfica bidimensional del código del registro.
