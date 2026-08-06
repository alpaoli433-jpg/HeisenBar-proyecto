# Reglas para Antigravity & Animaciones
- Mantener animaciones en 60 FPS delegando transformaciones exclusivamente a la GPU (`transform`, `opacity`).
- En dispositivos móviles, reducir la densidad de partículas 3D o simplificar efectos de neón.
- Encapsular librerías pesadas de animación dentro de Client Components aislados (`'use client'`).
