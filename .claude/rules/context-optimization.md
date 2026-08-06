# Reglas de Optimización de Contexto y Tokens
- Al ejecutar `npm run build`, `npm run test`/`vitest` o `npm run lint`, no pegar el log completo en la respuesta: aplicar truncado inteligente y mostrar solo errores, warnings y confirmaciones finales (tiempos de compilación, rutas generadas, resumen de tests pasados/fallidos, conteo de problemas de ESLint).
- Si la salida es exitosa y sin errores, resumir en una línea (ej. "build OK, 0 errores TS" / "lint OK, 0 problemas") en vez de citar la consola completa.
- Si hay errores, citar únicamente las líneas relevantes del stack trace o del mensaje de error, no el log circundante.
- Preferir herramientas de búsqueda dirigida (Grep/Glob) sobre volcar archivos completos cuando solo se necesita confirmar un dato puntual.
- Antes de leer un archivo completo, evaluar si alcanza con una lectura granular: usar Grep para localizar la firma/símbolo exacto (función, tipo, componente) y, si el archivo es grande, usar el rango `offset`/`limit` de Read acotado a esa sección en vez de cargarlo entero. Nunca leer una carpeta completa (archivo por archivo) cuando Grep/Glob puede acotar primero a los archivos relevantes.
- Delegar exploraciones amplias del repositorio a subagentes cuando el resultado esperado sea extenso, para no inflar el contexto principal con resultados intermedios.
