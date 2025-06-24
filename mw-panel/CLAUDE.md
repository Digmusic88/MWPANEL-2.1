# CLAUDE.md - MW Panel 2.0

Sistema de gestión educativa completo con NestJS + React + PostgreSQL + Docker.

## 🚀 **ESTADO ACTUAL: TOTALMENTE FUNCIONAL**

### ✅ **SISTEMAS IMPLEMENTADOS (11/16)**
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
11. **🆕 Sistema de Asistencia COMPLETO** - Control diario + solicitudes + notificaciones + badges ✅

## 🎯 **HOJA DE RUTA PRIORIZADA**

### **🔥 MÁXIMA PRIORIDAD (1-2 semanas)**
1. **📚 Sistema de Tareas/Deberes** - Digitalización pedagógica core
   - Creación por profesores con fechas límite
   - Entrega digital de archivos por estudiantes
   - Corrección online con calificación
   - Dashboard de seguimiento y estadísticas
   - Notificaciones automáticas familia/estudiante

### **⭐ ALTA PRIORIDAD (2-4 semanas)**
2. **📊 Sistema de Expedientes Académicos** - Cumplimiento normativo
   - Historial completo por estudiante
   - Generación automática de boletines PDF
   - Gestión de documentos digitales
   - Exportación datos oficiales

3. **📅 Calendario Académico Integrado** - Organización institucional
   - Eventos, exámenes, fechas importantes
   - Sincronización con evaluaciones y horarios
   - Vistas personalizadas por rol

### **📋 MEDIA PRIORIDAD (1-2 meses)**
4. **📖 Portal de Recursos Educativos** - Biblioteca digital
5. **📈 Dashboard Analytics Avanzado** - Métricas y KPIs centro
6. **💬 Chat Tiempo Real** - Comunicación instantánea

### **🔮 FUTURO**
7. **📱 App Móvil** - React Native
8. **🔒 Sistema de Backup Automático**

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

### **📅 2025-06-24 (SISTEMA DE ASISTENCIA + NOTIFICACIONES)**
- ✅ **Backend Completo**: Módulo attendance con 2 entidades + 12 endpoints API
- ✅ **Frontend Familias**: Solicitudes justificación con protección datos LOPD
- ✅ **Frontend Profesores**: Dashboard con widget solicitudes + acciones rápidas
- ✅ **Sistema de Badges**: Notificaciones naranjas en menú lateral profesor
- ✅ **Integración Comunicaciones**: Notificaciones automáticas + hook tiempo real
- ✅ **Relaciones Familiares**: Simplificado a Padre/Madre, Tutor/a, Otro
- ✅ **UX Optimizada**: Revisión solicitudes sin motivo obligatorio

## 📊 **RESUMEN EJECUTIVO**
- **Estado**: 11 sistemas operativos (69% completado)
- **Asistencia**: Sistema completo con notificaciones tiempo real + protección datos
- **Próximo**: Sistema de Tareas/Deberes (máxima prioridad pedagógica)
- **Arquitectura**: Microservicios dockerizados, PostgreSQL + Redis
- **Usuarios**: 4 roles, permisos granulares, JWT + hooks tiempo real

**🎯 Estrategia: Funcionalidades pedagógicas core + UX profesores optimizada**

---
*Actualizado: 2025-06-24 - Asistencia + Notificaciones completo 100%*