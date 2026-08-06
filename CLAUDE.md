# Constitución del Proyecto: HeisenBar - Ecosistema Inteligente

## Stack Técnico
- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Antigravity / Framer Motion.
- **Backend & DB:** Supabase (PostgreSQL, Auth, Realtime, Storage).
- **IA & Agents:** Vercel AI SDK, Anthropic API, WhatsApp Cloud API.

## Comandos Obligatorios
- `npm run dev`: Inicia el servidor de desarrollo local.
- `npm run build`: Valida tipos de TypeScript y compila para producción.
- `npm run lint`: Ejecuta ESLint para verificar reglas de código.
- `npm run test`: Ejecuta la suite de pruebas unitarias con Vitest.

## Convenciones de Código
- Usar **TypeScript estricto** (`strict: true`). Prohibido el uso de `any`.
- Arquitectura de componentes: `src/components/ui/` (base) y `src/components/features/` (negocio).
- Estilos UI: Tema oscuro *High-End / Luxury*. Usar variables Tailwind (`bg-brand-dark`, `text-brand-cyan`).
- Commits: Formato Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`).

## Reglas de Ejecución del Agente
- NUNCA dar por completada una tarea sin ejecutar `npm run build` y `npm run test` con evidencia explícita.
- Si una modificación afecta a más de 3 archivos, cambiar obligatoriamente a **Plan Mode**.
