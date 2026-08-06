# Contratos de API — HeisenBar Ecosystem

Este documento describe el esqueleto inicial de Server Actions / Route Handlers y de los endpoints de IA. Se debe ampliar a medida que se implementan las features reales; cada contrato debe reflejar tipos TypeScript explícitos (ver [`.claude/rules/typescript.md`](../.claude/rules/typescript.md)).

## Convenciones
- Las mutaciones (crear/actualizar/borrar) se implementan como **Server Actions** (`'use server'`) en `src/lib/`, no como Route Handlers públicos, salvo que deban ser consumidas por un sistema externo (ej. webhook de WhatsApp).
- Toda Server Action retorna un tipo `Result<T, E>` (o equivalente tipado) — nunca lanza excepciones sin capturar hacia el cliente.
- Los endpoints que exponen datos financieros (`unit_cost`, `margin_pct`) requieren verificación de rol admin dentro de la propia Server Action.

## Server Actions — Portal Cliente

### `getClientEvents(): Promise<Result<Event[], string>>`
Devuelve los eventos del cliente autenticado (filtrado por RLS + `auth.uid()`).

### `getEventQuote(eventId: string): Promise<Result<Quote, string>>`
Devuelve la cotización vigente de un evento, validando que pertenezca al cliente autenticado.

## Server Actions — CRM (admin)

### `createEvent(input: CreateEventInput): Promise<Result<Event, string>>`
Crea un evento para un cliente existente. Requiere sesión con rol admin/staff.

### `generateQuoteDraft(eventId: string): Promise<Result<Quote, string>>`
Invoca al agente cotizador de IA (`src/lib/ai/`) para generar un borrador de cotización basado en el inventario disponible y los datos del evento. Persiste el resultado como `quotes.generated_by = 'ai_agent'`, `status = 'draft'`.

### `updateInventoryItem(input: UpdateInventoryInput): Promise<Result<InventoryItem, string>>`
Actualiza stock/precio/costo de un ítem de inventario. Requiere rol admin (ver regla RLS de agregaciones financieras).

## Endpoints de IA (`src/lib/ai/`)

### Cotizador de eventos
- **Entrada:** datos del evento (tipo, invitados, fecha, preferencias) + inventario disponible.
- **Salida:** propuesta de líneas de cotización (`quote_items` sugeridos) + total estimado.
- **Implementación:** Vercel AI SDK (`ai`) con proveedor Anthropic, invocado desde una Server Action — nunca desde el cliente.

### Agente de WhatsApp
- **Entrada:** Route Handler `POST /api/whatsapp/webhook` que recibe mensajes de WhatsApp Cloud API.
- **Procesamiento:** el mensaje se enruta al mismo agente cotizador o a un agente de FAQ/soporte, según intención.
- **Salida:** respuesta enviada de vuelta vía WhatsApp Cloud API; si corresponde, se crea/actualiza un `event`/`quote` asociado al cliente (matcheado por `phone`).

## Pendiente de definir
- Esquema exacto de `CreateEventInput`, `UpdateInventoryInput` en `src/types/`.
- Contrato de paginación/filtrado para listados del CRM (eventos, inventario).
- Rate limiting y validación de firma del webhook de WhatsApp Cloud API.
