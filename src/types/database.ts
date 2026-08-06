/**
 * Tipos correspondientes al esquema SQL en docs/DATABASE_SCHEMA.md.
 * Mantener sincronizado manualmente con ese archivo hasta que exista un
 * proyecto Supabase real, momento en el que este archivo puede regenerarse
 * con `supabase gen types typescript`.
 */

export type StaffRole = "staff" | "admin";
export type EventStatus = "draft" | "quoted" | "confirmed" | "completed" | "cancelled";
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";
export type QuoteGeneratedBy = "ai_agent" | "staff";
export type WhatsappDirection = "inbound" | "outbound";

export interface StaffUserRow {
  id: string;
  auth_user_id: string;
  role: StaffRole;
  full_name: string;
  created_at: string;
}
export type StaffUserInsert = Omit<StaffUserRow, "id" | "created_at"> &
  Partial<Pick<StaffUserRow, "id" | "created_at">>;
export type StaffUserUpdate = Partial<StaffUserInsert>;

export interface ClientRow {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}
export type ClientInsert = Omit<ClientRow, "id" | "created_at"> &
  Partial<Pick<ClientRow, "id" | "created_at">>;
export type ClientUpdate = Partial<ClientInsert>;

export interface EventRow {
  id: string;
  client_id: string;
  title: string;
  event_date: string;
  venue: string | null;
  guest_count: number;
  status: EventStatus;
  created_at: string;
}
export type EventInsert = Omit<EventRow, "id" | "created_at" | "status" | "guest_count"> &
  Partial<Pick<EventRow, "id" | "created_at" | "status" | "guest_count">>;
export type EventUpdate = Partial<EventInsert>;

/** Incluye `unit_cost` — solo accesible vía Server Action con rol admin (tabla base). */
export interface InventoryItemRow {
  id: string;
  name: string;
  category: string;
  unit_cost: number;
  unit_price: number;
  stock_quantity: number;
  created_at: string;
}
export type InventoryItemInsert = Omit<InventoryItemRow, "id" | "created_at"> &
  Partial<Pick<InventoryItemRow, "id" | "created_at">>;
export type InventoryItemUpdate = Partial<InventoryItemInsert>;

/** Vista `inventory_items_public` — sin `unit_cost`, segura para clientes. */
export type InventoryItemPublicRow = Omit<InventoryItemRow, "unit_cost">;

/** Incluye `margin_pct` — solo accesible vía Server Action con rol admin (tabla base). */
export interface QuoteRow {
  id: string;
  event_id: string;
  generated_by: QuoteGeneratedBy;
  total_amount: number;
  margin_pct: number | null;
  status: QuoteStatus;
  created_at: string;
}
export type QuoteInsert = Omit<QuoteRow, "id" | "created_at" | "status" | "total_amount"> &
  Partial<Pick<QuoteRow, "id" | "created_at" | "status" | "total_amount">>;
export type QuoteUpdate = Partial<QuoteInsert>;

/** Vista `client_quotes_view` — sin `margin_pct`, segura para clientes. */
export type ClientQuoteRow = Omit<QuoteRow, "margin_pct">;

export interface QuoteItemRow {
  id: string;
  quote_id: string;
  inventory_item_id: string;
  quantity: number;
  unit_price_snapshot: number;
}
export type QuoteItemInsert = Omit<QuoteItemRow, "id"> & Partial<Pick<QuoteItemRow, "id">>;
export type QuoteItemUpdate = Partial<QuoteItemInsert>;

export interface WhatsappMessageRow {
  id: string;
  client_id: string | null;
  direction: WhatsappDirection;
  wa_message_id: string | null;
  body: string | null;
  created_at: string;
}
export type WhatsappMessageInsert = Omit<WhatsappMessageRow, "id" | "created_at"> &
  Partial<Pick<WhatsappMessageRow, "id" | "created_at">>;
export type WhatsappMessageUpdate = Partial<WhatsappMessageInsert>;

/**
 * Forma compatible con el tipo `Database` que espera
 * `createClient<Database>()` de `@supabase/supabase-js`.
 */
export interface Database {
  public: {
    Tables: {
      staff_users: {
        Row: StaffUserRow;
        Insert: StaffUserInsert;
        Update: StaffUserUpdate;
      };
      clients: {
        Row: ClientRow;
        Insert: ClientInsert;
        Update: ClientUpdate;
      };
      events: {
        Row: EventRow;
        Insert: EventInsert;
        Update: EventUpdate;
      };
      inventory_items: {
        Row: InventoryItemRow;
        Insert: InventoryItemInsert;
        Update: InventoryItemUpdate;
      };
      quotes: {
        Row: QuoteRow;
        Insert: QuoteInsert;
        Update: QuoteUpdate;
      };
      quote_items: {
        Row: QuoteItemRow;
        Insert: QuoteItemInsert;
        Update: QuoteItemUpdate;
      };
      whatsapp_messages: {
        Row: WhatsappMessageRow;
        Insert: WhatsappMessageInsert;
        Update: WhatsappMessageUpdate;
      };
    };
    Views: {
      inventory_items_public: {
        Row: InventoryItemPublicRow;
      };
      client_quotes_view: {
        Row: ClientQuoteRow;
      };
    };
    Enums: {
      staff_role: StaffRole;
      event_status: EventStatus;
      quote_status: QuoteStatus;
      quote_generated_by: QuoteGeneratedBy;
      whatsapp_direction: WhatsappDirection;
    };
  };
}
