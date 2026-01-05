# Expediente Clínico - Documentación

## Descripción General

El módulo de Expediente Clínico permite visualizar la información completa de un paciente, incluyendo:
- Resumen del paciente
- Gráficas de tendencias de signos vitales
- Historial de encuentros médicos
- Registro de signos vitales
- Secciones para problemas, alergias, medicación y documentos (en desarrollo)

## Arquitectura

### Frontend (Next.js)

#### Rutas
- `/dashboard/patients/[patientid]/record` - Página principal del expediente clínico

#### Componentes

##### `Trends.tsx`
Componente que muestra gráficas de tendencias de signos vitales usando Recharts:
- Peso e IMC (dual axis)
- Frecuencia cardíaca (HR)
- Presión arterial (BP - sistólica)
- Saturación de oxígeno (SpO2)

**Características:**
- Calcula BMI automáticamente si no está disponible (peso/altura²)
- Maneja BP como string (ej: "120/80") extrayendo la sistólica
- Ordena datos cronológicamente
- Muestra mensaje cuando no hay suficientes datos

##### `PatientRecordPage`
Página principal del expediente con:
- Navegación lateral (sidebar) con anchors a secciones
- Paginación para encuentros y vitales (10 items por página)
- Secciones placeholder para funcionalidad futura

#### Hooks

##### `usePatientRecord(patientId)`
Hook principal que agrega datos del paciente desde múltiples fuentes:

**Optimizaciones implementadas:**
- Cache configurado con `staleTime` diferenciado por tipo de dato
- Intenta usar filtros server-side `?patientId=` cuando están disponibles
- Fallback a filtrado client-side para compatibilidad backward

**Datos retornados:**
```typescript
{
  patient: Patient | null,
  appointments: AppointmentEntity[],
  encounters: EncounterEntity[],
  vitals: VitalsEntity[],
  summary: {
    lastVitals: VitalsEntity | null,
    nextAppointment: AppointmentEntity | null,
    encountersCount: number
  }
}
```

### API Endpoints

#### Filtrado por `patientId`

Los siguientes endpoints ahora soportan el parámetro opcional `patientId`:

##### `GET /appointments?patientId={id}`
Filtra citas por ID de paciente.

**Comportamiento:**
- Si el backend soporta el filtro, devuelve solo las citas del paciente especificado
- Si el backend NO soporta el filtro (error), el frontend hace fallback a traer todas las citas y filtrar en cliente

##### `GET /encounters?patientId={id}`
Filtra encuentros por ID de paciente.

**Comportamiento:**
- Si el backend soporta el filtro, devuelve solo los encuentros del paciente especificado
- Si el backend NO soporta el filtro (error), el frontend hace fallback a traer todos los encuentros y filtrar en cliente

##### `GET /vitals?patientId={id}`
Filtra signos vitales por ID de paciente.

**Comportamiento:**
- Si el backend soporta el filtro, devuelve solo los vitales del paciente especificado
- Si el backend NO soporta el filtro, mantiene comportamiento actual (filtrado por `encounterId`)

## Configuración de Cache (React Query)

### Configuración Global
```typescript
{
  queries: {
    staleTime: 5 * 60 * 1000,      // 5 minutos
    gcTime: 10 * 60 * 1000,         // 10 minutos (garbage collection)
    refetchOnWindowFocus: false,
    retry: 1
  }
}
```

### Configuración Específica por Recurso

#### Paciente
- `staleTime: 10 * 60 * 1000` (10 minutos) - Datos relativamente estables

#### Citas y Encuentros
- `staleTime: 2 * 60 * 1000` (2 minutos) - Datos más dinámicos

#### Vitales
- Usa configuración por defecto - Se refrescan según encuentro

## Paginación en UI

### Encuentros
- **Page size:** 10 encuentros por página
- **Ordenamiento:** Fecha descendente (más recientes primero)
- **Controles:** Anterior / Siguiente con número de página

### Signos Vitales
- **Page size:** 10 registros por página
- **Ordenamiento:** Fecha descendente (más recientes primero)
- **Controles:** Anterior / Siguiente con número de página

## Secciones en Desarrollo

Las siguientes secciones están estructuradas pero pendientes de implementación completa:

### Problemas / Diagnósticos Activos
**Estado:** Placeholder con TODOs
**Requiere:**
- Modelo de datos backend
- Endpoint `/problems` o similar
- UI para crear/editar/eliminar problemas

### Alergias
**Estado:** Placeholder con TODOs
**Requiere:**
- Modelo de datos backend con severidad (alta/media/baja)
- Endpoint `/allergies` o similar
- UI para registrar alergias con nivel de severidad

### Medicación Activa
**Estado:** Placeholder con TODOs
**Requiere:**
- Modelo de datos backend
- Endpoint `/medications` o similar
- UI para registrar medicamentos activos

### Documentos
**Estado:** Placeholder con TODOs
**Requiere:**
- Sistema de file upload en backend
- Storage para PDF e imágenes
- Endpoint `/documents` o similar
- UI para cargar y visualizar documentos

## Activar Filtrado Server-Side

Cuando el backend implemente el filtrado por `patientId`, la transición será transparente:

1. El frontend ya envía `?patientId=` en las requests
2. Si el backend responde exitosamente, se usa el resultado filtrado
3. Si el backend retorna error (no implementado), se hace fallback automático

### Verificación
Para verificar que el filtrado server-side está activo:
1. Abrir DevTools > Network
2. Navegar a `/dashboard/patients/{patientId}/record`
3. Buscar requests a `/appointments`, `/encounters`, `/vitals`
4. Verificar que incluyan `?patientId=` en la URL
5. Si la respuesta es exitosa y contiene solo datos del paciente, el filtro server-side está activo

## Testing Manual

### Prerrequisitos
- Backend corriendo con datos de prueba
- Al menos un paciente con encuentros y vitales

### Pasos
1. Navegar a `/dashboard/patients/{patientId}/record`
2. Verificar:
   - ✓ Sección Resumen muestra datos correctos
   - ✓ Sección Tendencias muestra gráficas (si hay datos)
   - ✓ Sección Encuentros muestra tabla con paginación (si > 10)
   - ✓ Sección Signos Vitales muestra lista con paginación (si > 10)
   - ✓ Navegación lateral funciona (scroll a secciones)
   - ✓ Nuevas secciones visibles (Problemas, Alergias, Medicación, Documentos)

### Casos Edge
- Sin datos: Debe mostrar mensajes "Sin registros"
- Datos incompletos: Debe manejar campos opcionales gracefully
- Paginación: Debe funcionar con 1 item y con muchos items

## Performance

### Mejoras Implementadas
- ✅ Cache de catálogos (pacientes, citas, encuentros)
- ✅ Paginación UI para listas grandes
- ✅ Filtrado server-side con fallback client-side
- ✅ Queries específicas por patientId evitan traer datos innecesarios

### Próximas Optimizaciones
- [ ] Implementar virtual scrolling para listas muy grandes
- [ ] Lazy loading de secciones no visibles
- [ ] Implementar filtrado server-side en backend (issue #9)

## Issues Relacionados

- #14 - Gráficas de tendencias ✅ (Closes)
- #13 - Optimización con cache y paginación ✅ (Closes)
- #11 - Secciones adicionales 🚧 (Partially addresses)
- #9 - Filtros server-side 🚧 (Partially addresses)

## Mantenimiento

### Añadir Nueva Métrica a Tendencias
1. Actualizar `Trends.tsx`
2. Añadir nueva serie Line con dataKey apropiado
3. Ajustar colores y labels

### Implementar Nueva Sección
1. Crear modelo de datos en backend
2. Crear endpoint en API
3. Crear función fetch en `/lib/api`
4. Actualizar `usePatientRecord` para incluir nuevos datos
5. Reemplazar placeholder en `PatientRecordPage`
6. Actualizar navegación lateral si es necesario
