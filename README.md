# Ritmo — calendario mensual

Calendario web para programar actividades y calificarlas como **logradas**, **logradas con atraso** o **no ejecutadas**. Incluye balance mensual, diseño adaptable y persistencia offline; en producción sincroniza con Cloudflare D1 mediante un Worker.

## Desarrollo

```bash
pnpm install
pnpm dev
```

## Arquitectura y despliegue

- Frontend React + Vite en Vercel.
- API REST en Cloudflare Workers.
- Base de datos Cloudflare D1, definida en `cloudflare/schema.sql`.

La API de producción está desplegada en `https://ritmo-api.ritmo-api.workers.dev`. En Vercel configura `VITE_API_BASE_URL` con esa URL y despliega el proyecto raíz.

Para recrear la infraestructura de Cloudflare, crea `ritmo-db`, coloca su ID en `cloudflare/wrangler.toml`, ejecuta `pnpm db:remote` y luego `pnpm deploy` dentro de `cloudflare/`.
