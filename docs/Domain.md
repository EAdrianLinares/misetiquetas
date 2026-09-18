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

No se persiste: existe sólo durante la sesión.

| Campo        | Tipo                           | Obligatorio | Descripción |
| ------------ | ------------------------------ | ----------- | ----------- |
| contenido    | string                         | Sí          | Texto recibido desde la fuente externa. |
| separador    | tabulación \| ; \| , \| espacios | Sí          | Detectado según [SPEC-FUNC-006](specs/functional/spec-input-format.md). |
| tieneCabecera | boolean                       | Sí          | Si la primera fila nombra las columnas. |

---

## RegistroInterpretado

Representa una fila o registro extraído de la fuente de datos y ya convertido en una estructura utilizable por la aplicación.

### Atributos

| Campo             | Tipo           | Obligatorio | Descripción |
| ----------------- | -------------- | ----------- | ----------- |
| id                | string         | Sí          | `record-<fila>`; estable mientras no se vuelva a interpretar. |
| fila              | number         | Sí          | Línea de la fuente de la que proviene; se usa en los mensajes de error. |
| nombre            | string         | Sí          | Nombre que aparecerá en la etiqueta. |
| codigo            | string         | Sí          | Código asociado al registro. |
| precio            | decimal        | Sí          | Precio normal del registro. |
| precioDescuento   | decimal \| null | No         | Precio promocional del registro. |
| estadoValidacion  | valido \| invalido | Sí      | Resultado de aplicar las reglas RN-001 a RN-005. |
| errores           | string[]       | Sí          | Motivos por los que el registro es inválido. |

---

## PlantillaEtiqueta

Define **sólo el tamaño** de cada etiqueta. La distribución sobre el papel la define el PerfilPapel.

| Plantilla     | Ancho × alto |
| ------------- | ------------ |
| Estándar      | 80 × 50 mm   |
| Compacta      | 50 × 30 mm   |
| Personalizada | Ancho 15–200 mm, alto 10–300 mm (p. ej. la medida del troquel) |

---

## PerfilPapel

Define dónde se imprime: tipo de papel y distribución. Hay perfiles predefinidos y uno Personalizado ([print-engine](specs/print-engine/requirements.md)).

| Campo                | Descripción |
| -------------------- | ----------- |
| tipoPapel            | A4, Carta, continuo 58/80/100 mm. |
| orientacion          | Vertical u horizontal (sólo en hoja). |
| columnas             | 1–4. |
| margenes             | Superior, inferior, izquierdo y derecho, en mm. |
| separaciones         | Horizontal y vertical entre etiquetas, en mm. |
| modoAjuste           | Cómo se adapta la etiqueta al papel: contain, fill o none. |
| modoPagina           | En continuo: ajustada al contenido, una etiqueta por página o longitud fija. |
| longitudPagina       | mm; sólo con longitud fija. |

Las filas por página se calculan; no se declaran.

---

## Generacion

Representa una sesión de generación de etiquetas a partir de uno o varios registros interpretados.

Todas las etiquetas generadas dentro de una misma generación comparten la misma plantilla y el mismo tipo de código.

### Atributos

En el MVP no se persiste: es el estado actual de la pantalla.

| Campo       | Tipo                        |
| ----------- | --------------------------- |
| plantilla   | PlantillaEtiqueta           |
| perfilPapel | PerfilPapel                 |
| tipoCodigo  | TipoCodigo                  |
| copias      | number                      |
| registros   | List<RegistroInterpretado>  |

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

El precio con descuento es opcional. Vacío o 0 significa "sin descuento". Si existe, debe ser mayor que cero y no mayor que el precio normal.

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

La cantidad de copias deberá ser un número entero entre 1 y 500. Una impresión admite como máximo 5.000 etiquetas.

---

## RN-012

El sistema deberá detectar y reportar los errores de formato detectados durante la interpretación de los datos.

---

## RN-013

El usuario podrá corregir la información interpretada antes de generar las etiquetas. Cada corrección se valida con las mismas reglas que la interpretación.

---

## RN-014

La plantilla únicamente define la presentación física de las etiquetas y nunca modifica la información del registro.

---

## RN-015

Toda plantilla deberá tener un nombre único.

*No aplica en el MVP: las plantillas son fijas (sin editor de plantillas).*

---

## RN-016

Las dimensiones de una plantilla deberán ser mayores que cero.

---

## RN-017

Solo las plantillas activas podrán utilizarse para generar nuevas generaciones.

*No aplica en el MVP: todas las plantillas están activas.*

---

## RN-018

No se puede imprimir mientras exista algún registro inválido. El usuario lo corrige o lo quita explícitamente; nunca se omite en silencio.

---

## RN-019

Los precios se interpretan en formato colombiano: el punto separa miles y la coma decimales (`1.500` = mil quinientos). Ante una entrada ambigua o no numérica, el registro se marca como inválido; nunca se adivina.

---

## RN-020

Con el código de barras (CODE128), el código sólo puede contener caracteres ASCII imprimibles. Para códigos con tildes o ñ se debe usar QR.

---

## RN-021

Cuando los datos se separan con espacios, el formato es "nombre código precio" y no se admite descuento. Para incluir descuento se separa con tabulación, punto y coma o coma.

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
