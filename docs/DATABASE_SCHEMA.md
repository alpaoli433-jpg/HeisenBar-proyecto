# Esquema de Base de Datos — HeisenBar Ecosystem

Todas las tablas viven en Supabase (Postgres) y deben tener **RLS habilitado** — ver [`.claude/rules/supabase.md`](../.claude/rules/supabase.md). Este SQL es la fuente de verdad del esquema; al aplicarlo como migración real (`supabase migration new init_schema`), no debe divergir de este documento.

## Relaciones (resumen)
```
staff_users (interno)

clients (1) ──< events (1) ──< quotes (1) ──< quote_items >── (1) inventory_items
   │
   └──< whatsapp_messages
```

## Estrategia de RLS
- Todas las tablas tienen `ROW LEVEL SECURITY` habilitado y **sin policy permisiva por defecto** (deny-by-default).
- `staff_users` guarda qué cuentas de Supabase Auth son personal interno (`staff`/`admin`) y alimenta las funciones `is_staff()` / `is_staff_admin()`, usadas en el resto de policies.
- Un cliente solo ve filas vinculadas a su propio `auth.uid()` (directamente en `clients`, o vía join en `events`/`quotes`/`quote_items`).
- **Columnas sensibles** (`inventory_items.unit_cost`, `quotes.margin_pct`) no se protegen a nivel de columna con RLS (Postgres RLS es por fila, no por columna). En su lugar:
  - El acceso de `staff`/`admin` a la tabla base (que incluye esas columnas) se controla con RLS normal.
  - El acceso de clientes/público se sirve **exclusivamente** a través de las vistas `inventory_items_public` y `client_quotes_view`, que excluyen esas columnas. La aplicación nunca debe darle a un cliente una query directa contra la tabla base.
  - Cualquier agregación financiera (márgenes, costos) se resuelve en una Server Action con rol admin, tal como exige `.claude/rules/supabase.md`.

## SQL — esquema completo

```sql
-- Requiere gen_random_uuid()
create extension if not exists pgcrypto;

-- ==========================================================
-- Enums
-- ==========================================================
create type staff_role as enum ('staff', 'admin');
create type event_status as enum ('draft', 'quoted', 'confirmed', 'completed', 'cancelled');
create type quote_status as enum ('draft', 'sent', 'accepted', 'rejected');
create type quote_generated_by as enum ('ai_agent', 'staff');
create type whatsapp_direction as enum ('inbound', 'outbound');

-- ==========================================================
-- staff_users — personal interno del CRM
-- ==========================================================
create table staff_users (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid not null unique references auth.users (id) on delete cascade,
  role          staff_role not null default 'staff',
  full_name     text not null,
  created_at    timestamptz not null default now()
);

-- ==========================================================
-- clients — Clientes
-- ==========================================================
create table clients (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users (id) on delete set null,
  full_name     text not null,
  email         text not null unique,
  phone         text not null unique, -- E.164, identificador en WhatsApp Cloud API
  created_at    timestamptz not null default now()
);

-- ==========================================================
-- events — Eventos
-- ==========================================================
create table events (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients (id) on delete cascade,
  title         text not null,
  event_date    timestamptz not null,
  venue         text,
  guest_count   integer not null default 0 check (guest_count >= 0),
  status        event_status not null default 'draft',
  created_at    timestamptz not null default now()
);

create index events_client_id_idx on events (client_id);

-- ==========================================================
-- inventory_items — Inventario (unit_cost es sensible)
-- ==========================================================
create table inventory_items (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  category        text not null, -- ej. mobiliario, barra, decoración
  unit_cost       numeric(10, 2) not null check (unit_cost >= 0),   -- sensible
  unit_price      numeric(10, 2) not null check (unit_price >= 0),
  stock_quantity  integer not null default 0 check (stock_quantity >= 0),
  created_at      timestamptz not null default now()
);

-- Vista pública/cliente: sin unit_cost.
create view inventory_items_public as
  select id, name, category, unit_price, stock_quantity, created_at
  from inventory_items;

-- ==========================================================
-- quotes — Cotizaciones (margin_pct es sensible)
-- ==========================================================
create table quotes (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references events (id) on delete cascade,
  generated_by  quote_generated_by not null default 'ai_agent',
  total_amount  numeric(10, 2) not null default 0 check (total_amount >= 0),
  margin_pct    numeric(5, 2), -- sensible
  status        quote_status not null default 'draft',
  created_at    timestamptz not null default now()
);

create index quotes_event_id_idx on quotes (event_id);

-- Vista cliente: sin margin_pct.
create view client_quotes_view as
  select id, event_id, generated_by, total_amount, status, created_at
  from quotes;

-- ==========================================================
-- quote_items — Líneas de cotización
-- ==========================================================
create table quote_items (
  id                    uuid primary key default gen_random_uuid(),
  quote_id              uuid not null references quotes (id) on delete cascade,
  inventory_item_id     uuid not null references inventory_items (id) on delete restrict,
  quantity              integer not null check (quantity > 0),
  unit_price_snapshot   numeric(10, 2) not null check (unit_price_snapshot >= 0)
);

create index quote_items_quote_id_idx on quote_items (quote_id);
create index quote_items_inventory_item_id_idx on quote_items (inventory_item_id);

-- ==========================================================
-- whatsapp_messages — Trazabilidad del canal de WhatsApp
-- ==========================================================
create table whatsapp_messages (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid references clients (id) on delete set null,
  direction     whatsapp_direction not null,
  wa_message_id text,
  body          text,
  created_at    timestamptz not null default now()
);

create index whatsapp_messages_client_id_idx on whatsapp_messages (client_id);

-- ==========================================================
-- Funciones auxiliares de rol (usadas por las policies de RLS)
-- ==========================================================
create or replace function is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff_users su where su.auth_user_id = auth.uid()
  );
$$;

create or replace function is_staff_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from staff_users su
    where su.auth_user_id = auth.uid() and su.role = 'admin'
  );
$$;

-- ==========================================================
-- Row Level Security
-- ==========================================================
alter table staff_users enable row level security;
alter table clients enable row level security;
alter table events enable row level security;
alter table inventory_items enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table whatsapp_messages enable row level security;

-- staff_users: cada staff ve su propia fila; admin ve todas.
create policy staff_users_select on staff_users
  for select using (auth.uid() = auth_user_id or is_staff_admin());
create policy staff_users_admin_write on staff_users
  for insert with check (is_staff_admin());
create policy staff_users_admin_update on staff_users
  for update using (is_staff_admin());

-- clients: el cliente ve su propia fila; staff ve/gestiona todas.
create policy clients_select on clients
  for select using (auth.uid() = auth_user_id or is_staff());
create policy clients_staff_insert on clients
  for insert with check (is_staff());
create policy clients_staff_update on clients
  for update using (is_staff());

-- events: el cliente ve solo eventos de su propio client_id; staff ve/gestiona todos.
create policy events_select on events
  for select using (
    is_staff()
    or exists (
      select 1 from clients c
      where c.id = events.client_id and c.auth_user_id = auth.uid()
    )
  );
create policy events_staff_insert on events
  for insert with check (is_staff());
create policy events_staff_update on events
  for update using (is_staff());

-- inventory_items (tabla base, incluye unit_cost): solo staff.
-- Clientes/público leen inventario a través de inventory_items_public.
create policy inventory_items_staff_select on inventory_items
  for select using (is_staff());
create policy inventory_items_staff_insert on inventory_items
  for insert with check (is_staff());
create policy inventory_items_staff_update on inventory_items
  for update using (is_staff());

-- quotes (tabla base, incluye margin_pct): solo staff.
-- Clientes leen cotizaciones a través de client_quotes_view.
create policy quotes_staff_select on quotes
  for select using (is_staff());
create policy quotes_staff_insert on quotes
  for insert with check (is_staff());
create policy quotes_staff_update on quotes
  for update using (is_staff());

-- quote_items: el cliente ve líneas de sus propias cotizaciones; staff ve/gestiona todas.
create policy quote_items_select on quote_items
  for select using (
    is_staff()
    or exists (
      select 1 from quotes q
      join events e on e.id = q.event_id
      join clients c on c.id = e.client_id
      where q.id = quote_items.quote_id and c.auth_user_id = auth.uid()
    )
  );
create policy quote_items_staff_insert on quote_items
  for insert with check (is_staff());
create policy quote_items_staff_update on quote_items
  for update using (is_staff());

-- whatsapp_messages: solo staff (canal operado por el equipo interno).
create policy whatsapp_messages_staff_select on whatsapp_messages
  for select using (is_staff());
create policy whatsapp_messages_staff_insert on whatsapp_messages
  for insert with check (is_staff());

-- Las vistas heredan los privilegios del owner (no de RLS del invocador),
-- por lo que deben exponerse explícitamente a los roles de Supabase:
grant select on inventory_items_public to authenticated, anon;
grant select on client_quotes_view to authenticated;
```

## Notas de implementación
- Este SQL vive solo en este documento hasta que exista un proyecto Supabase real; al conectarlo, se debe mover a `supabase/migrations/<timestamp>_init_schema.sql` vía `supabase migration new`.
- Los tipos TypeScript correspondientes están en [`src/types/database.ts`](../src/types/database.ts) y deben mantenerse sincronizados manualmente con este archivo (o regenerarse con `supabase gen types typescript` una vez exista el proyecto).
- `client_quotes_view` y `inventory_items_public` son vistas "security definer" implícitas (heredan permisos del owner): por eso NO tienen RLS propio y en su lugar se controla el acceso con `GRANT`/`REVOKE` a los roles `anon`/`authenticated`. No agregar columnas sensibles a estas vistas sin revisar este comentario.
