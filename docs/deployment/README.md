# Despliegue

Este directorio documenta la estrategia de despliegue del proyecto.

## Entorno propuesto

- Frontend: Vercel
- Backend: Render
- Persistencia: sin base de datos persistente en el MVP

## Variables de entorno

- FRONTEND_URL
- API_BASE_URL
- NODE_ENV

## Consideraciones

- Configurar CORS entre frontend y backend.
- Definir health checks en Render.
- Asegurar que el backend acepte peticiones desde Vercel.
- Mantener el flujo sin dependencias externas para el MVP.
