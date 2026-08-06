# Reglas de Base de Datos y Supabase
- Habilitar **Row Level Security (RLS)** en absolutamente todas las tablas.
- Los clientes solo pueden leer sus propios eventos (`auth.uid() = client_id`).
- Consultas con agregaciones financieras o márgenes de rentabilidad deben ser Server Actions autenticados con rol de administrador.
