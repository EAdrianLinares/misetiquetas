# MVP.md

# Producto Mínimo Viable (MVP)

## Objetivo

Entregar una aplicación funcional que permita transformar información ya existente en etiquetas listas para imprimir de forma rápida y sencilla.

---

# Funcionalidades Incluidas

## Ingreso de Datos

El usuario podrá:

* pegar información desde una fuente de texto;
* utilizar datos provenientes de Excel, Google Sheets, CSV u otro texto tabulado o separado por comas;
* corregir la información directamente sobre el texto ingresado antes de procesarla.

---

## Interpretación de Datos

La aplicación deberá:

* interpretar automáticamente los registros presentes en la entrada;
* detectar errores de formato o estructura;
* mostrar los registros interpretados para revisión.

---

## Configuración de la Generación

El usuario podrá seleccionar:

* Tipo de código:

  * Código de Barras.
  * Código QR.

* Plantilla de impresión.

* Cantidad de copias por registro.

---

## Generación de Etiquetas

La aplicación deberá:

* generar el código correspondiente;
* construir las etiquetas;
* mostrar el nombre del registro;
* mostrar el precio;
* mostrar el precio con descuento cuando exista;
* mostrar el precio original tachado cuando exista descuento.

---

## Vista Previa

Antes de imprimir, el usuario podrá visualizar todas las etiquetas generadas desde los registros interpretados.

---

## Impresión

La aplicación permitirá imprimir todas las etiquetas generadas utilizando la plantilla seleccionada.

---

## Infraestructura de despliegue

Para el MVP la aplicación se desplegará con una arquitectura simple:

* Frontend en Vercel.
* Backend en Render.
* Sin base de datos persistente.

La información necesaria para la sesión se manejará sin persistencia externa, lo que reduce la complejidad del despliegue y acelera la puesta en marcha.

---

# Criterios de Aceptación

El MVP será considerado terminado cuando un usuario pueda:

1. Pegar información desde una fuente externa.
2. Obtener una interpretación automática de los datos.
3. Corregir la información interpretada de forma rápida.
4. Seleccionar una plantilla.
5. Elegir Código de Barras o Código QR.
6. Definir la cantidad de copias.
7. Generar todas las etiquetas.
8. Visualizar el resultado.
9. Imprimir las etiquetas.

Todo el proceso deberá completarse sin utilizar herramientas externas.

---

# Funcionalidades Fuera del MVP

No harán parte de la primera versión:

* Inicio de sesión.
* Gestión de usuarios.
* Catálogo persistente de productos.
* CRUD de productos.
* Formularios extensos para registrar productos uno por uno.
* Historial de impresiones.
* Inventario.
* Ventas.
* Reportes.
* Estadísticas.
* Exportación a Excel.
* Importación masiva desde Excel o CSV.
* API pública.
* Múltiples idiomas.

---

# Mejoras Futuras

Las siguientes funcionalidades podrán incorporarse en versiones posteriores:

* Guardar generaciones y resultados previos.
* Reimpresión de etiquetas.
* Múltiples plantillas.
* Personalización de colores y fuentes.
* Logo de la empresa.
* Exportación a PDF.
* Interpretación más avanzada de formatos complejos.
* Códigos Data Matrix.
* Código GS1-128.
* Integración con sistemas POS o ERP.
* Historial de impresiones.

