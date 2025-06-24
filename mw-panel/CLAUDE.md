# CLAUDE.md - MW Panel 2.0

Sistema de gestión educativa completo con NestJS + React + PostgreSQL + Docker.

## 🚀 **ESTADO ACTUAL: TOTALMENTE FUNCIONAL**

### ✅ **SISTEMAS IMPLEMENTADOS (13/16)**
1. **Sistema de Usuarios** - JWT, dashboards por rol ✅
2. **Sistema de Grupos** - CRUD, 3 grupos persistentes ✅
3. **Sistema de Profesores** - 6 profesores BD, dashboard ✅
4. **Sistema de Familias** - Formularios 3 pasos, acceso dual ✅
5. **Sistema de Importación** - Plantillas Excel, validación ✅
6. **Sistema de Evaluaciones** - 17 endpoints, competencias ✅
7. **Sistema de Horarios** - 19 aulas, 21 franjas, anti-conflictos ✅
8. **Sistema de Comunicaciones COMPLETO** - 4 tipos mensaje + respuestas + notificaciones ✅
9. **UI Aurora Login** - Efecto aurora boreal animado ✅
10. **Sistema de Notificaciones** - Campana, eliminar, gestión completa ✅
11. **Sistema de Asistencia COMPLETO** - Control diario + solicitudes + notificaciones ✅
12. **Sistema de Actividades Familiares COMPLETO** - Vista asignaturas + multi-hijo + dashboard ✅
13. **🆕 Sistema de Tareas/Deberes COMPLETO** - Creación profesores + entrega estudiantes + supervisión familias ✅

## 🎯 **HOJA DE RUTA ACTUALIZADA**

### **🔥 MÁXIMA PRIORIDAD (Próximas 2 semanas)**
1. **📊 Sistema Expedientes + Boletines PDF**
   - Historial académico completo + documentos oficiales
   - Generación automática boletines personalizados
   - Exportación datos normativa educativa
   - **IMPACTO**: Cumplimiento legal + gestión administrativa

### **⭐ ALTA PRIORIDAD (2-4 semanas)**
2. **📅 Calendario Académico Integrado**
   - Eventos centro + exámenes + fechas importantes
   - Sincronización evaluaciones/horarios + recordatorios
   - Vistas personalizadas por rol (profesor/familia/admin)
   - **IMPACTO**: Organización temporal institucional

### **📋 MEDIA PRIORIDAD (1-2 meses)**
4. **📖 Portal Recursos Educativos** - Biblioteca digital + materiales compartidos
5. **📈 Dashboard Analytics** - Métricas centro + tendencias académicas
6. **💬 Chat Tiempo Real** - Comunicación instantánea WebSockets

### **🔮 FUTURO (6+ meses)**
7. **📱 App Móvil Nativa** - React Native iOS/Android
8. **🔒 Sistema Backup Automático** - Copias seguridad programadas

## 🛠️ **COMANDOS ESENCIALES**

```bash
# INICIO RÁPIDO - Todo el sistema
./start-all.sh

# DESARROLLO - Tras cambios
# Backend: docker-compose stop backend && docker-compose build --no-cache backend && docker-compose up -d backend
# Frontend: docker-compose stop frontend && docker-compose build --no-cache frontend && docker-compose up -d frontend
```

**URLs:** Frontend http://localhost:5173 | Backend http://localhost:3000/api

## 📈 **ÚLTIMA IMPLEMENTACIÓN**

### **📅 2025-06-24 (SISTEMA TAREAS/DEBERES COMPLETO)**
- ✅ **Sistema Backend Completo**: Entidades Task, TaskSubmission, TaskAttachment + 19 endpoints funcionales
- ✅ **Frontend Profesores**: Crear/editar/publicar tareas + gestión archivos adjuntos + estadísticas
- ✅ **Frontend Estudiantes**: Ver tareas asignadas + entrega digital + seguimiento calificaciones
- ✅ **Frontend Familias**: Supervisión progreso hijos + vista por asignaturas + notificaciones
- ✅ **Navegación Integrada**: Módulo tareas accesible desde todos los dashboards por rol
- ✅ **Fix Subject Dropdown**: Profesores pueden seleccionar asignaturas asignadas correctamente
- ✅ **Fix latePenalty Validation**: Conversión automática porcentaje ↔ decimal (backend/frontend)
- ✅ **Sistema Archivos**: Upload/download adjuntos + validación tipos/tamaños + almacenamiento seguro

## 📊 **RESUMEN EJECUTIVO**
- **Estado**: 13 sistemas operativos (81% completado)
- **Sistema Tareas/Deberes**: Totalmente funcional con interfaces completas para todos los roles
- **Próximo**: Sistema Expedientes + Boletines PDF (cumplimiento normativo)
- **Arquitectura**: Microservicios dockerizados, PostgreSQL optimizado
- **Progress**: +1 sistema funcional core, digitalización pedagógica avanzada

**🎯 Estrategia: Digitalización procesos pedagógicos + gestión académica integral**

---
*Actualizado: 2025-06-24 - Sistema Tareas/Deberes implementado 100%*