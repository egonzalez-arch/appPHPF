# 🧠 Instrucciones para GitHub Copilot

Este repositorio contiene un sistema con:

- **Backend:** NestJS + TypeORM  
- **Frontend:** Next.js + React + TypeScript  

Tu tarea es **analizar todo el código del proyecto y mejorarlo aplicando las mejores prácticas de desarrollo, arquitectura, seguridad y rendimiento**, sin romper la lógica existente.  

---

## ⚙️ BACKEND (NestJS + TypeORM)
- Reorganizar la arquitectura en **módulos, servicios, controladores, entidades y DTOs** bien definidos.
- Añadir **validaciones en DTOs con `class-validator` y `ValidationPipe` global.**
- Configurar **manejo de excepciones centralizado** con `ExceptionFilter` y `HttpException`.
- Implementar **autenticación y autorización con JWT** y guards para roles (doctor, paciente, administrador).
- Configurar las **credenciales de base de datos con variables de entorno** (`.env`) y **centralizar en `config/typeorm.config.ts`.**
- Garantizar **consistencia de datos** con relaciones bien definidas, constraints y validaciones de integridad.
- Implementar **migraciones con TypeORM** para versionar el esquema de base de datos.
- Aplicar principios **SOLID, DRY, KISS y clean code.**

---

## 💻 FRONTEND (Next.js)
- Crear un **layout base de dashboard con sidebar y header persistentes**, y renderizar el resto de páginas dentro de este layout.
- Componentizar la UI en bloques reutilizables y consistentes.
- Añadir **validaciones de formularios con `react-hook-form` y `Yup`.**
- Usar **Context API o Zustand** para manejo global de estado si es necesario.
- Implementar **rutas protegidas** que solo muestren contenido a usuarios autenticados.
- Optimizar el rendimiento (lazy loading, code splitting, optimización de imágenes y fuentes).
- Mantener el **diseño actual pero mejorando la coherencia y experiencia de usuario (UI/UX).**

---

## 🧪 GENERAL
- Mantener los nombres de archivos, clases y carpetas **coherentes y semánticos**.
- Eliminar **código duplicado, muerto o sin uso.**
- Añadir **pruebas unitarias con Jest** tanto en backend como en frontend.
- Añadir comentarios y documentación básica en los módulos principales.
- No cambiar el stack ni romper funcionalidades existentes.

⚠️ **IMPORTANTE:**  
Haz todos estos cambios de forma progresiva y segura. Antes de eliminar o renombrar archivos, comprueba que no rompan otras partes del sistema.

