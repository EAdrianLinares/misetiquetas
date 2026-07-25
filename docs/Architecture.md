# Architecture.md

# Arquitectura del Proyecto

## Objetivo

La aplicación seguirá una arquitectura modular cliente-servidor.

Cada módulo tendrá una única responsabilidad y estará desacoplado del resto del sistema.

El objetivo es facilitar el mantenimiento, las pruebas y la incorporación de nuevas funcionalidades sin afectar el código existente.

---

# Arquitectura General

```text
+-------------------------+
|      Vercel             |
|   Frontend React        |
+------------+------------+
            |
        HTTP / JSON
            |
+------------+------------+
|       Render            |
|   Backend NestJS        |
+------------+------------+
            |
      Generación de
      códigos y etiquetas
```

---

# Despliegue propuesto

## Frontend

- Se desplegará en Vercel.
- Servirá la aplicación web React/Vite.
- Recibirá las peticiones del usuario y consumirá la API del backend.

## Backend

- Se desplegará en Render.
- Expondrá la API REST para la interpretación de datos, generación de etiquetas y demás lógica de negocio.

## Persistencia

- Para el MVP no se utilizará base de datos persistente.
- La información se manejará en memoria durante la sesión o se reconstruirá a partir de la entrada del usuario.
- En futuras versiones se podría evaluar agregar almacenamiento persistente si se requiere guardar generaciones o resultados.

---

# Frontend

Responsable de:

* Capturar la información pegada por el usuario.
* Interpretar y revisar los datos ingresados.
* Administrar la generación.
* Mostrar la vista previa.
* Solicitar la impresión.
* Consumir la API.

## Módulos

### Datos

Recibe la información fuente y la prepara para su interpretación.

---

### Generación

Administra la configuración de una impresión.

* Plantilla
* Tipo de código
* Cantidad de copias

---

### Etiquetas

Construye la vista previa de las etiquetas.

---

### Impresión

Genera el documento listo para imprimir.

---

# Backend

Responsable de:

* Validar la información recibida.
* Interpretar datos provenientes de texto o CSV.
* Generar códigos de barras.
* Generar códigos QR.
* Construir las etiquetas.
* Generar el documento final.

---

# Comunicación

La comunicación entre Frontend y Backend será mediante una API REST utilizando JSON.

---

# Organización

Cada módulo será independiente.

Ejemplo:

```text
Frontend

Datos
Generacion
Etiquetas
Impresion
Plantillas
```

```text
Backend

Datos
Generacion
Etiquetas
Plantillas
Codigos
```

---

# Principios

* Separación de responsabilidades.
* Alta cohesión.
* Bajo acoplamiento.
* Componentes reutilizables.
* Código sencillo.
* Arquitectura modular.
* Desarrollo guiado por especificaciones (SDD).

---

# Escalabilidad

Aunque el proyecto es un MVP, la arquitectura permitirá incorporar posteriormente:

* Base de datos.
* Usuarios.
* Historial de impresiones.
* Exportación a PDF.
* Importación desde Excel o CSV.
* Nuevas plantillas.
* Nuevos formatos de códigos.

