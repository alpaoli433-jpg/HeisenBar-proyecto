# Arquitectura — HeisenBar Ecosystem

## Superficies de la aplicación (`src/app`)
El App Router sirve tres superficies bajo el mismo proyecto Next.js:

- **Web pública** — landing, catálogo de servicios, formulario de contacto/cotización inicial.
- **Portal Cliente** — área autenticada donde cada cliente ve sus propios eventos, cotizaciones y estado de inventario reservado (protegido por RLS: `auth.uid() = client_id`).
- **CRM** — panel interno para el equipo de HeisenBar: gestión de clientes, eventos, inventario y márgenes (rutas de administrador, RLS con rol admin).

## Flujo de datos (ASCII)

```
                         ┌───────────────────────────┐
                         │        Next.js App        │
                         │   (App Router, src/app)   │
                         │                            │
   Usuario final ──────▶ │  Web Pública               │
   Cliente ─────────────▶│  Portal Cliente             │
   Equipo interno ──────▶│  CRM                        │
                         └────────────┬───────────────┘
                                      │
                     Server Actions / Route Handlers
                                      │
                 ┌────────────────────┼─────────────────────┐
                 ▼                    ▼                      ▼
        ┌─────────────────┐  ┌───────────────┐     ┌──────────────────┐
        │    Supabase      │  │  src/lib/ai    │     │  WhatsApp Cloud   │
        │ (Postgres, Auth, │  │ Vercel AI SDK  │◀───▶│       API         │
        │ Realtime, RLS)   │  │ + Anthropic    │     │ (canal de entrada │
        └─────────────────┘  └───────────────┘     │  y salida cliente) │
                 ▲                    │              └──────────────────┘
                 │                    ▼
                 │           Agentes / Cotizadores IA
                 │           (generan borradores de
                 │            cotización, responden
                 │            consultas de inventario)
                 └────────────── persisten resultado ─────┘
```

## Principios
1. **Server Actions como frontera de escritura.** Toda mutación (crear evento, generar cotización, actualizar inventario) pasa por una Server Action tipada en `src/lib/`, nunca por acceso directo a Supabase desde el cliente para escrituras.
2. **RLS como última línea de defensa**, no la única — ver [`.claude/rules/supabase.md`](../.claude/rules/supabase.md).
3. **Agentes de IA aislados en `src/lib/ai/`**, consumidos por Server Actions o Route Handlers; nunca se exponen claves de proveedor (`ANTHROPIC_API_KEY`) al cliente.
4. **WhatsApp Cloud API** actúa como canal adicional de entrada/salida hacia el mismo pipeline de cotizadores IA (un mensaje de WhatsApp puede disparar el mismo flujo que un formulario web).

## Referencias
- Esquema de datos: [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md)
- Contratos de endpoints/Server Actions: [`API_CONTRACTS.md`](./API_CONTRACTS.md)
