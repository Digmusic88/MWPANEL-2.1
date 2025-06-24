# CLAUDE.md - MW Panel 2.0

Sistema de gestión educativa completo con NestJS + React + PostgreSQL + Docker.

## 🚀 **ESTADO ACTUAL: TOTALMENTE FUNCIONAL**

### ✅ **SISTEMAS IMPLEMENTADOS (15/16)**
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
13. **Sistema de Tareas/Deberes COMPLETO** - Digital + "Test Yourself" diferenciado + notificaciones ✅
14. **🆕 Sistema de Configuración Modular** - Activación/desactivación módulos desde admin ✅
15. **🆕 Sistema de Expedientes + Boletines PDF** - Historial académico + generación automática ✅

## 🎯 **HOJA DE RUTA ACTUALIZADA**

### **🔥 MÁXIMA PRIORIDAD (Próximas 2 semanas)**
1. **📅 Calendario Académico Integrado**
   - Eventos centro + exámenes + fechas importantes
   - Sincronización tareas/evaluaciones + recordatorios
   - Vistas personalizadas por rol + integración "Test Yourself"
   - **IMPACTO**: Organización temporal institucional completa

### **⭐ ALTA PRIORIDAD (1-2 semanas)**
2. **📖 Portal Recursos Educativos**
   - Biblioteca digital + materiales compartidos por asignaturas
   - Integración con sistema archivos tareas existente
   - Gestión permisos acceso + categorización avanzada
   - **IMPACTO**: Centralización recursos pedagógicos

### **📋 MEDIA PRIORIDAD (1-2 meses)**
3. **📈 Dashboard Analytics** - Métricas centro + tendencias académicas
4. **💬 Chat Tiempo Real** - Comunicación instantánea WebSockets

### **🔮 FUTURO (6+ meses)**
5. **📱 App Móvil Nativa** - React Native iOS/Android
6. **🔒 Sistema Backup Automático** - Copias seguridad programadas

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

### **📅 2025-06-24 (SISTEMA EXPEDIENTES + CONFIGURACIÓN MODULAR)**
- ✅ **Sistema Configuración Modular**: Panel admin para activar/desactivar módulos del sistema
- ✅ **Sistema Expedientes Backend**: Entidades AcademicRecord, AcademicRecordEntry, AcademicRecordGrade
- ✅ **Generación Boletines PDF**: ReportGeneratorService con PDFKit + plantillas personalizables
- ✅ **Control Acceso Modular**: SettingsService con cache + verificación permisos por módulo
- ✅ **Diferenciación Test Yourself**: Tareas exam como notificaciones/recordatorios sin entrega
- ✅ **Migración BD Completa**: SystemSettings + AcademicRecords + enum types PostgreSQL
- ✅ **Frontend Admin Panel**: ModulesSettingsPage para gestión visual on/off módulos

## 📊 **RESUMEN EJECUTIVO**
- **Estado**: 15 sistemas operativos (94% completado)
- **Sistema Expedientes**: Con activación modular desde admin + generación boletines PDF automática
- **Sistema Configuración**: Control granular módulos + cache optimizado + verificación permisos
- **Próximo**: Calendario Académico integrado (organización temporal completa)
- **Arquitectura**: Microservicios dockerizados, PostgreSQL optimizado, PDFKit integrado
- **Progress**: +2 sistemas funcionales, control modular implementado

**🎯 Estrategia: Sistema modular configurable + cumplimiento normativo educativo**

---
*Actualizado: 2025-06-24 - Expedientes + Configuración Modular implementados 100%*