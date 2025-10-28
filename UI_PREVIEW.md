# Expediente Clínico - UI Preview

## Page Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ Dashboard Header                                                 │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR     │  MAIN CONTENT                                     │
│  (Sticky)    │                                                   │
│              │  ┌──────────────────────────────────────────────┐ │
│ Expediente   │  │ Juan Pérez                                    │ │
│              │  │ ID: abc-123               [Ir a Citas]        │ │
│ • Resumen    │  └──────────────────────────────────────────────┘ │
│ • Tendencias │                                                   │
│ • Encuentros │  ┌─ RESUMEN ────────────────────────────────────┐ │
│ • Vitales    │  │ Próxima cita | Encuentros | Últimos vitales  │ │
│ • Problemas  │  │ 15/11 10:00  | 5          | 70kg/175cm       │ │
│ • Alergias   │  └──────────────────────────────────────────────┘ │
│ • Medicación │                                                   │
│ • Documentos │  ┌─ TENDENCIAS ─────────────────────────────────┐ │
│              │  │                                               │ │
│              │  │  Peso e IMC                                   │ │
│              │  │  ╭─────────────────────────────────────────╮  │ │
│              │  │  │   ●────●────●         (Peso - azul)     │  │ │
│              │  │  │        ■────■────■    (IMC - verde)     │  │ │
│              │  │  ╰─────────────────────────────────────────╯  │ │
│              │  │                                               │ │
│              │  │  Frecuencia Cardíaca                          │ │
│              │  │  ╭─────────────────────────────────────────╮  │ │
│              │  │  │   ▲────▲────▲         (HR - naranja)    │  │ │
│              │  │  ╰─────────────────────────────────────────╯  │ │
│              │  │                                               │ │
│              │  │  Presión Arterial                             │ │
│              │  │  ╭─────────────────────────────────────────╮  │ │
│              │  │  │   ♦────♦────♦         (BP - rojo)       │  │ │
│              │  │  ╰─────────────────────────────────────────╯  │ │
│              │  │                                               │ │
│              │  │  Saturación de Oxígeno                        │ │
│              │  │  ╭─────────────────────────────────────────╮  │ │
│              │  │  │   ★────★────★         (SpO2 - morado)   │  │ │
│              │  │  ╰─────────────────────────────────────────╯  │ │
│              │  └──────────────────────────────────────────────┘ │
│              │                                                   │
│              │  ┌─ ENCUENTROS ─────────────────────────────────┐ │
│              │  │ Fecha       | Motivo  | Diagnóstico | Estado │ │
│              │  │ 10/11 14:00 | Dolor   | Gripe       | COMP.  │ │
│              │  │ 05/11 09:30 | Control | -           | COMP.  │ │
│              │  │ ...                                           │ │
│              │  │                                               │ │
│              │  │ [Anterior]  Página 1 de 2  [Siguiente]       │ │
│              │  └──────────────────────────────────────────────┘ │
│              │                                                   │
│              │  ┌─ SIGNOS VITALES ─────────────────────────────┐ │
│              │  │ • 10/11/2024 14:15: 175cm, 70kg, IMC 22.86,  │ │
│              │  │   HR 72, BP 120/80, SpO2 98%                 │ │
│              │  │ • 05/11/2024 09:45: 175cm, 71kg, IMC 23.18,  │ │
│              │  │   HR 75, BP 118/78, SpO2 97%                 │ │
│              │  │ ...                                           │ │
│              │  │                                               │ │
│              │  │ [Anterior]  Página 1 de 2  [Siguiente]       │ │
│              │  └──────────────────────────────────────────────┘ │
│              │                                                   │
│              │  ┌─ PROBLEMAS / DIAGNÓSTICOS ACTIVOS ───────────┐ │
│              │  │ Sin registros.                                │ │
│              │  │ // TODO: Implementar lista de problemas       │ │
│              │  └──────────────────────────────────────────────┘ │
│              │                                                   │
│              │  ┌─ ALERGIAS ───────────────────────────────────┐ │
│              │  │ Sin registros.                                │ │
│              │  │ // TODO: Implementar con severidad            │ │
│              │  └──────────────────────────────────────────────┘ │
│              │                                                   │
│              │  ┌─ MEDICACIÓN ACTIVA ──────────────────────────┐ │
│              │  │ Sin registros.                                │ │
│              │  │ // TODO: Implementar lista de medicación      │ │
│              │  └──────────────────────────────────────────────┘ │
│              │                                                   │
│              │  ┌─ DOCUMENTOS ─────────────────────────────────┐ │
│              │  │ Sin documentos adjuntos.                      │ │
│              │  │ // TODO: Implementar carga de archivos        │ │
│              │  └──────────────────────────────────────────────┘ │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

## Color Scheme (Tailwind)
- **Primary**: Teal-700 (links, accents)
- **Backgrounds**: White cards on gray-50 background
- **Text**: Gray-900 (headers), Gray-600 (secondary)
- **Borders**: Gray-200

## Charts Color Scheme (Recharts)
1. **Peso**: #3b82f6 (blue-500)
2. **IMC**: #10b981 (green-500)
3. **HR**: #f59e0b (amber-500)
4. **BP**: #ef4444 (red-500)
5. **SpO2**: #8b5cf6 (violet-500)

## Interactive Elements
- ✅ Sidebar links scroll to sections (smooth scroll)
- ✅ Pagination buttons: disabled state when at edges
- ✅ "Ir a Citas" button navigates to appointments page
- ✅ "Ver/Editar" buttons in encounters table
- ✅ Hover states on all interactive elements

## Responsive Behavior
- **Desktop (>768px)**: Sidebar + Main layout
- **Tablet/Mobile**: Stack layout (sidebar becomes top nav)
- **Charts**: ResponsiveContainer adapts to screen width
- **Tables**: Horizontal scroll on small screens

## Data States
1. **Loading**: "Cargando expediente..."
2. **Error**: Red error message
3. **Empty data**: "Sin registros" messages
4. **With data**: Full UI with all sections populated

## Accessibility
- ✅ Semantic HTML (sections, nav, tables)
- ✅ Anchor links for keyboard navigation
- ✅ Descriptive button text
- ✅ Table headers for screen readers
- ✅ Color contrast meets WCAG standards

## Performance Optimizations
- ✅ React Query cache (5-10min)
- ✅ Pagination (only 10 items rendered)
- ✅ useMemo for expensive calculations
- ✅ Lazy loading of chart library
- ✅ Optimized re-renders with proper keys
