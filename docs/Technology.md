# Technology.md

# Stack Tecnológico

## Objetivo

Definir las tecnologías oficiales utilizadas en el proyecto para garantizar consistencia durante el desarrollo y facilitar el mantenimiento futuro.

---

# Filosofía

El proyecto prioriza:

- Simplicidad.
- Bajo consumo de recursos.
- Facilidad de mantenimiento.
- Rápido desarrollo.
- Facilidad de instalación para el usuario final.
- Tecnologías ampliamente soportadas.

---

# Frontend

## Framework

React

### Motivo

- Gran ecosistema.
- Excelente rendimiento.
- Componentes reutilizables.
- Fácil integración con impresión.
- Amplia documentación.

---

## Lenguaje

TypeScript

### Motivo

- Tipado estático.
- Menos errores.
- Mejor autocompletado.
- Código más mantenible.

---

## Herramienta de construcción

Vite

### Motivo

- Inicio inmediato.
- Compilaciones rápidas.
- Configuración sencilla.
- Excelente experiencia de desarrollo.

---

## Estilos

CSS Modules

### Motivo

- Sin dependencias adicionales.
- Evita conflictos de nombres.
- Fácil mantenimiento.

---

# Backend

## Framework

NestJS

### Motivo

- Arquitectura modular.
- Basado en TypeScript.
- Escalable.
- Excelente organización del código.
- Muy adecuado para APIs REST.

---

## Lenguaje

TypeScript

---

# Despliegue

## Frontend

Vercel

### Motivo

- Hosting simple y rápido para aplicaciones React/Vite.
- Despliegues automáticos desde GitHub.
- Ideal para una SPA o una interfaz web estática con peticiones a la API.

---

## Backend

Render

### Motivo

- Hosting sencillo para servicios Node.js/NestJS.
- Permite desplegar la API REST con infraestructura mínima.
- Facilita el ciclo de despliegue continuo desde el repositorio.

---

## Base de Datos

## MVP

No se utilizará base de datos persistente.

Toda la información relevante para la sesión permanecerá en memoria, y la aplicación se apoyará en la entrada del usuario para reconstruir el flujo de trabajo.

---

## Versiones futuras

Se evaluará incorporar:

- SQLite
- PostgreSQL

dependiendo de las necesidades del producto y del nivel de persistencia requerido.
---

# Comunicación

## API

REST

Formato:

JSON

---

# Generación de Códigos

Se utilizarán librerías compatibles con:

- Código de Barras
- Código QR

La librería definitiva será seleccionada durante la implementación, siempre que cumpla:

- Licencia permisiva.
- Buen rendimiento.
- Mantenimiento activo.
- Compatibilidad con React.

---

# Impresión

La impresión se realizará utilizando las capacidades nativas del navegador.

No dependerá de software externo.

---

# Gestión del Estado

React Context

### Motivo

El MVP no requiere una solución más compleja como Redux o Zustand.

---

# Calidad de Código

## Linter

ESLint

---

## Formateador

Prettier

---

# Control de Versiones

Git

Repositorio:

GitHub

---

# Convenciones

## Idioma del código

Inglés

Ejemplos:

- Product
- Label
- Template
- Barcode
- DiscountPrice

---

## Idioma de la documentación

Español

---

## Convención de nombres

### Variables

camelCase

### Funciones

camelCase

### Componentes

PascalCase

### Interfaces

PascalCase

### Archivos

kebab-case

Ejemplo:

product-card.tsx

---

# Estructura del Proyecto

/client
/server
/docs

---

# Dependencias Principales

Frontend

- React
- React DOM
- Vite

Backend

- NestJS

Desarrollo

- TypeScript
- ESLint
- Prettier

---

# Compatibilidad

La aplicación deberá ejecutarse correctamente en:

- Google Chrome
- Microsoft Edge

Las versiones futuras podrán ampliar el soporte a otros navegadores.

---

# Decisiones Tecnológicas

Durante el desarrollo podrán registrarse nuevas decisiones mediante documentos ADR.

Technology.md únicamente refleja el estado actual del stack tecnológico.