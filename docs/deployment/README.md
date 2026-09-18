# Despliegue

La aplicación es un sitio estático ([ADR-002](../adr/adr-002-logica-en-frontend.md)). No hay backend, base de datos ni variables de entorno.

## Vercel

| Ajuste | Valor |
|---|---|
| Framework preset | Vite |
| Root directory | `frontend` |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Variables de entorno | Ninguna |

Cada push a `main` despliega a producción y cada PR genera una vista previa.

## Antes de desplegar

La CI (`.github/workflows/ci.yml`) debe estar en verde: lint, tests y build.

Tras un cambio en layout, métricas o impresión, repetir el checklist físico de [testing/README.md](../testing/README.md).

## Local

```bash
cd frontend
npm ci
npm run dev       # desarrollo
npm run build     # build de producción en dist/
npm run preview   # sirve dist/ localmente
```
