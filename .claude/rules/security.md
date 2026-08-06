# Reglas de Seguridad (SAST & Secrets)

## Secretos
- Prohibido volcar, imprimir o citar en texto plano el valor de claves secretas: `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`, `ANTHROPIC_API_KEY`, tokens de WhatsApp Cloud API, o cualquier otro valor de `.env*`/`.claude/settings.local.json`.
- Al depurar o verificar que una variable de entorno existe, confirmar solo su presencia (`echo $VAR | wc -c`, o listar el nombre) — nunca su valor.
- Nunca escribir un secreto real dentro de un archivo que se vaya a commitear (`.mcp.json`, `.eslintrc*`, `eslint.config.*`, docs, etc.). Los secretos van únicamente en archivos gitignoreados (`.env.local`, `.claude/settings.local.json`) y se referencian desde archivos versionados vía `${VAR}`.
- Antes de cada `git add`/commit, revisar el diff en busca de valores que parezcan claves (prefijos `sbp_`, `sk-`, `eyJ...` JWT, etc.) aunque el archivo no esté en la lista de "obviamente sensible".

## RLS y sanitización de inputs
- Toda tabla nueva de Supabase debe habilitar RLS antes de mergear el cambio (ver `.claude/rules/supabase.md`); si una migración crea una tabla sin políticas RLS explícitas, señalarlo como bloqueante.
- En Server Actions y API Routes: validar y sanear todo input externo (body, query params, headers) antes de usarlo en queries, comandos de shell o URLs — nunca interpolar input de usuario directamente.
- Tratar cualquier consulta con SQL/RPC dinámico, `dangerouslySetInnerHTML`, `eval`, construcción dinámica de rutas de archivo o regex a partir de input de usuario como hallazgo de severidad alta (OWASP Top 10: Injection, XSS, SSRF, Broken Access Control) y proponer la corrección antes de continuar.
- Verificar que los endpoints/Server Actions que exponen datos financieros o de otros usuarios validen el rol (`is_staff()`/`is_staff_admin()`) y no confíen únicamente en el filtrado del lado del cliente.
