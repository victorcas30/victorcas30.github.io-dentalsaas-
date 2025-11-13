# Instrucciones para instalar FullCalendar

Para que las páginas de agenda funcionen correctamente, necesitas instalar las siguientes dependencias:

## Instalación

Ejecuta el siguiente comando en la terminal (en la raíz del proyecto):

```bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction @fullcalendar/core
```

O si usas yarn:

```bash
yarn add @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

## ¿Qué se ha implementado?

1. **Estilos CSS de MaterialPro**: Se creó el archivo `src/app/agenda-calendar.css` con todos los estilos de la plantilla MaterialPro para FullCalendar.

2. **Página Agenda Día** (`src/app/agenda-dia/page.jsx`):
   - Usa FullCalendar con vista `timeGridDay`
   - Muestra las citas del día en formato de línea de tiempo
   - Permite hacer clic en eventos para editarlos
   - Permite seleccionar rangos de tiempo para crear nuevas citas

3. **Página Agenda Semana** (`src/app/agenda-semana/page.jsx`):
   - Usa FullCalendar con vista `timeGridWeek`
   - Muestra las citas de la semana en formato de calendario semanal
   - Misma funcionalidad que la vista de día

4. **Página Agenda Mes** (`src/app/agenda-mes/page.jsx`):
   - Usa FullCalendar con vista `dayGridMonth`
   - Muestra las citas del mes en formato de calendario mensual
   - Las citas muestran el nombre del paciente y la hora

## Características

- ✅ Diseño moderno de MaterialPro
- ✅ Colores por estado de cita (Programada, Confirmada, En Proceso, etc.)
- ✅ Navegación entre vistas (Día/Semana/Mes)
- ✅ Integración completa con las APIs existentes
- ✅ Modal de crear/editar citas funcional
- ✅ Detección de conflictos de horarios
- ✅ Responsive design

## Notas

- Las páginas cargan FullCalendar dinámicamente para evitar problemas de SSR (Server-Side Rendering)
- Los estilos están basados en la plantilla MaterialPro que proporcionaste
- Toda la funcionalidad existente (APIs, modales, validaciones) se mantiene intacta

