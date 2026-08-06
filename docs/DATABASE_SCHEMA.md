# Esquema de Base de Datos — HeisenBar Ecosystem

Todas las tablas viven en Supabase (Postgres) y deben tener **RLS habilitado** — ver [`.claude/rules/supabase.md`](../.claude/rules/supabase.md). Este documento es el punto de partida; se debe mantener sincronizado con las migraciones reales.

## Entidades principales

### `clients` (Clientes)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` (PK) | |
| `auth_user_id` | `uuid` (FK → `auth.users.id`) | vincula el cliente a su cuenta de Supabase Auth |
| `full_name` | `text` | |
| `email` | `text` | único |
| `phone` | `text` | formato E.164, usado como identificador en WhatsApp Cloud API |
| `created_at` | `timestamptz` | default `now()` |

RLS: un cliente solo puede leer su propia fila (`auth.uid() = auth_user_id`).

### `events` (Eventos)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` (PK) | |
| `client_id` | `uuid` (FK → `clients.id`) | |
| `title` | `text` | |
| `event_date` | `timestamptz` | |
| `venue` | `text` | |
| `guest_count` | `integer` | |
| `status` | `text` | `draft` \| `quoted` \| `confirmed` \| `completed` \| `cancelled` |
| `created_at` | `timestamptz` | default `now()` |

RLS: un cliente solo puede leer eventos donde `auth.uid() = client_id` (vía join con `clients`, o desnormalizando `client_auth_user_id` si se prioriza rendimiento).

### `inventory_items` (Inventario)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` (PK) | |
| `name` | `text` | |
| `category` | `text` | ej. mobiliario, barra, decoración |
| `unit_cost` | `numeric` | **sensible** — solo legible vía Server Action admin |
| `unit_price` | `numeric` | precio de cara al cliente |
| `stock_quantity` | `integer` | |
| `created_at` | `timestamptz` | default `now()` |

RLS: lectura pública limitada a columnas no sensibles (nombre, categoría, disponibilidad) mediante una vista; `unit_cost` y márgenes solo accesibles vía Server Action con rol admin (ver regla de Supabase).

### `quotes` (Cotizaciones)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` (PK) | |
| `event_id` | `uuid` (FK → `events.id`) | |
| `generated_by` | `text` | `ai_agent` \| `staff` |
| `total_amount` | `numeric` | |
| `margin_pct` | `numeric` | **sensible**, solo admin |
| `status` | `text` | `draft` \| `sent` \| `accepted` \| `rejected` |
| `created_at` | `timestamptz` | default `now()` |

### `quote_items` (Líneas de cotización)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | `uuid` (PK) | |
| `quote_id` | `uuid` (FK → `quotes.id`) | |
| `inventory_item_id` | `uuid` (FK → `inventory_items.id`) | |
| `quantity` | `integer` | |
| `unit_price_snapshot` | `numeric` | precio congelado al momento de cotizar |

## Relaciones (resumen)
```
clients (1) ──< events (1) ──< quotes (1) ──< quote_items >── (1) inventory_items
```

## Pendiente de definir
- Tabla de conversaciones/mensajes de WhatsApp (`whatsapp_messages`) para trazabilidad del canal.
- Tabla de usuarios internos/roles del CRM (`staff_users`, `staff_roles`) si no se maneja vía metadata de Supabase Auth.
