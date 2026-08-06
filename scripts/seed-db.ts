/**
 * Semilla de prueba: puebla inventario y cotizaciones de ejemplo en Supabase.
 * Uso: npx tsx scripts/seed-db.ts
 * Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.
 */
import { createClient } from "@supabase/supabase-js";

interface SeedInventoryItem {
  name: string;
  category: string;
  unit_cost: number;
  unit_price: number;
  stock_quantity: number;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const sampleInventory: SeedInventoryItem[] = [
  { name: "Barra móvil premium", category: "barra", unit_cost: 400, unit_price: 950, stock_quantity: 3 },
  { name: "Set de mobiliario lounge", category: "mobiliario", unit_cost: 250, unit_price: 600, stock_quantity: 10 },
  { name: "Iluminación neón decorativa", category: "decoración", unit_cost: 80, unit_price: 220, stock_quantity: 20 },
];

async function seed(): Promise<void> {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { error } = await supabase.from("inventory_items").insert(sampleInventory);

  if (error) {
    throw new Error(`Failed to seed inventory_items: ${error.message}`);
  }

  console.log(`Seeded ${sampleInventory.length} inventory items.`);
}

seed().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
