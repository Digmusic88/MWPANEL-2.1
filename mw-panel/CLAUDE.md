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
11. **🆕 Sistema de Asistencia COMPLETO** - Control diario + solicitudes familia + bulk actions ✅

## 🎯 **HOJA DE RUTA ACTUALIZADA**

### **🔥 MÁXIMA PRIORIDAD (Próximas 1-2 semanas)**
1. **📚 Sistema de Tareas/Deberes**
   - Creación por profesores
   - Entrega digital estudiantes
   - Corrección y calificación
   - Notificaciones automáticas
   - **IMPACTO**: Digitalización proceso pedagógico core

### **⭐ ALTA PRIORIDAD (Semanas 3-4)**
3. **📅 Calendario Académico**
   - Eventos del centro
   - Exámenes programados
   - Fechas importantes
   - Vistas por rol
   - **IMPACTO**: Organización temporal institucional

4. **📊 Sistema de Expedientes**
   - Historial académico completo
   - Documentos digitales
   - Seguimiento longitudinal
   - **IMPACTO**: Cumplimiento normativo y trazabilidad

### **📋 MEDIA PRIORIDAD (Semanas 5-6)**
5. **📄 Reportes y Boletines PDF** - Generación automática, plantillas
6. **📖 Portal de Recursos** - Biblioteca digital, materiales

### **💬 BAJA PRIORIDAD (Futuro)**
7. **Chat Tiempo Real** - WebSockets, mensajería instantánea
8. **📱 App Móvil** - React Native/Flutter
9. **📈 Dashboard Analytics** - Métricas centro
10. **💾 Sistema de Backup** - Copias automáticas

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

### **📅 2025-06-24 (SISTEMA DE ASISTENCIA)**
- ✅ **Backend Completo**: Módulo attendance con 2 entidades (AttendanceRecord, AttendanceRequest)
- ✅ **12 Endpoints API**: CRUD completo + estadísticas + bulk actions
- ✅ **Frontend Familias**: Solicitudes justificación con validación 10+ caracteres
- ✅ **Frontend Profesores**: Control diario + revisión solicitudes + estadísticas
- ✅ **Integración Comunicaciones**: Notificaciones automáticas aprobación/rechazo
- ✅ **Menús Navegación**: Acceso directo desde sidebar familias y profesores
- ✅ **Validaciones**: Fechas límite, duplicados, relaciones familia-estudiante

## 📊 **RESUMEN EJECUTIVO**
- **Estado**: 11 sistemas operativos (69% completado)
- **Asistencia**: Sistema completo con control diario + solicitudes + notificaciones automáticas
- **Próximo**: Sistema de Tareas/Deberes (digitalización proceso pedagógico)
- **Arquitectura**: Microservicios dockerizados, PostgreSQL + Redis
- **Usuarios**: 4 roles, permisos granulares, JWT + verificación relaciones familia-estudiante

**🎯 Estrategia: Priorizar funcionalidades pedagógicas core sobre sistemas auxiliares**

---
*Actualizado: 2025-06-24 - Sistema de asistencia implementado al 100%*