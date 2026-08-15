# Ritmo — calendario mensual

Calendario mensual de marketing para programar **reels**, **historias**, **publicaciones de propiedades** y **pautas**. Cada contenido se evalúa con 100 puntos si salió a tiempo, 50 si se publicó con atraso y 0 si no se realizó.

El KPI mensual usa la ponderación acordada: reels 50%, historias 20%, publicaciones de propiedades 20% y pautas 10%. Incluye desglose por categoría, diseño adaptable y sincronización con Cloudflare D1 mediante un Worker.

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
