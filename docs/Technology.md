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

CSS plano (`App.css`, `index.css`) con variables CSS en mm para las etiquetas.

### Motivo

- Sin dependencias adicionales.
- Las medidas físicas (mm) se expresan directamente en CSS y se comparten con el documento de impresión.

---

# Backend

No hay backend ([ADR-002](adr/adr-002-logica-en-frontend.md)). Toda la lógica corre en el navegador.

---

# Despliegue

Vercel, como sitio estático (ver [deployment/README.md](deployment/README.md)).

### Motivo

- Hosting simple y gratuito para una SPA de Vite.
- Despliegues automáticos desde GitHub.

---

## Base de Datos

No se utiliza base de datos. El estado vive en memoria durante la sesión.

Si una versión futura necesita persistencia, se evaluará (SQLite o PostgreSQL) mediante un ADR.

---

# Generación de Códigos

- Código de barras: `jsbarcode` (CODE128, SVG).
- Código QR: `qrcode` (PNG de 512 px como data URL).

---

# Impresión

Ventana de impresión nativa del navegador, con `@page` en mm. No depende de software externo.

---

# Gestión del Estado

`useState` / `useMemo` de React en `App.tsx`. Las reglas viven en funciones puras (`domain/`, `utils/`).

### Motivo

El MVP es una sola pantalla; Context, Redux o Zustand no aportan nada todavía.

---

# Calidad de Código

| Herramienta | Uso | Comando (en `frontend/`) |
|---|---|---|
| TypeScript (estricto) | Tipado | `npm run build` |
| oxlint | Linter | `npm run lint` |
| Vitest | Tests unitarios | `npm test` |
| GitHub Actions | CI: lint, tests y build en cada push y PR | `.github/workflows/ci.yml` |

---

# Control de Versiones

Git, repositorio en GitHub.

---

# Convenciones

Ver [Coding-Standards.md](Coding-Standards.md).

---

# Estructura del Proyecto

```text
/frontend   aplicación React + Vite
/docs       documentación (SDD)
/.github    CI
```

---

# Dependencias Principales

- React, React DOM, Vite
- jsbarcode, qrcode
- Desarrollo: TypeScript, oxlint, Vitest

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
