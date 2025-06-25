# CLAUDE.md - MW Panel 2.0

Sistema de gestión educativa completo con NestJS + React + PostgreSQL + Docker.

## 🚀 **ESTADO ACTUAL: TOTALMENTE FUNCIONAL**

### ✅ **SISTEMAS IMPLEMENTADOS (17/17)**
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
16. **🆕 Sistema de Rúbricas BACKEND** - Evaluación por rúbricas + ChatGPT import + colores automáticos ✅
17. **🆕 Sistema de Rúbricas FRONTEND COMPLETO** - Interfaz hoja cálculo + evaluación clic + vistas familias ✅

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

## 📈 **ÚLTIMAS IMPLEMENTACIONES**

### **📝 2025-06-25 (SISTEMA DE RÚBRICAS COMPLETO)**
**Backend (100%):**
- ✅ **6 Entidades TypeORM Completas**: Rubric, RubricCriterion, RubricLevel, RubricCell, RubricAssessment, RubricAssessmentCriterion
- ✅ **API REST Completa**: 10+ endpoints con autenticación JWT + documentación Swagger
- ✅ **Parser ChatGPT**: Importación automática desde tablas Markdown y CSV
- ✅ **Sistema Colores Automático**: Gradiente dinámico rojo→verde según niveles
- ✅ **Cálculo Ponderado**: Puntuaciones automáticas con pesos por criterio
- ✅ **Integración Actividades**: Nuevo tipo valoración 'rubric' + relaciones BD
- ✅ **Migración Completa**: CreateRubricSystem con índices optimizados

**Frontend (100%):**
- ✅ **useRubrics Hook**: API integration completa con CRUD, import, colores y cálculos
- ✅ **RubricGrid**: Tabla editable tipo hoja cálculo con clic selección + colores dinámicos
- ✅ **RubricEditor**: Interfaz creación/edición con preview + configuración criterios/niveles
- ✅ **RubricImporter**: Importación ChatGPT con instrucciones + preview + validación
- ✅ **RubricsPage**: Gestión completa con búsqueda, filtros, estadísticas y acciones
- ✅ **RubricAssessment**: Evaluación por clic con comentarios + puntuación automática + progress
- ✅ **RubricFamilyView**: Vista familias con análisis + fortalezas/mejoras + recomendaciones
- ✅ **Integración COMPLETA**: Tipo 'rubric' en ActivitiesPage + drawer evaluación + navegación
- ✅ **Rutas y Navegación**: RubricsPage en TeacherDashboard + menú lateral con ícono TableOutlined
- ✅ **Evaluación Unificada**: 3 tipos (emoji, score, rubric) funcionales en panel gestión tareas

### **📅 2025-06-24 (SISTEMA EXPEDIENTES + CONFIGURACIÓN MODULAR)**  
- ✅ **Sistema Configuración Modular**: Panel admin para activar/desactivar módulos del sistema
- ✅ **Sistema Expedientes Backend**: Entidades AcademicRecord, AcademicRecordEntry, AcademicRecordGrade
- ✅ **Generación Boletines PDF**: ReportGeneratorService con PDFKit + plantillas personalizables
- ✅ **Control Acceso Modular**: SettingsService con cache + verificación permisos por módulo
- ✅ **Diferenciación Test Yourself**: Tareas exam como notificaciones/recordatorios sin entrega
- ✅ **Migración BD Completa**: SystemSettings + AcademicRecords + enum types PostgreSQL
- ✅ **Frontend Admin Panel**: ModulesSettingsPage para gestión visual on/off módulos

## 📊 **RESUMEN EJECUTIVO**
- **Estado**: 17 sistemas operativos (100% completado) 🎉
- **Sistema Rúbricas**: Frontend + Backend 100% completo - evaluación pedagógica avanzada funcional
- **Sistema Expedientes**: Con activación modular desde admin + generación boletines PDF automática  
- **Sistema Configuración**: Control granular módulos + cache optimizado + verificación permisos
- **Próximo**: Calendario Académico Integrado (organización temporal completa)
- **Arquitectura**: Microservicios dockerizados, PostgreSQL optimizado, PDFKit + sistema rúbricas completo
- **Progress**: +4 sistemas funcionales, plataforma educativa integral 100% operativa

**🎯 Estrategia: Plataforma educativa integral + evaluación pedagógica avanzada + cumplimiento normativo completo**

---

## 🧠 **ESTRUCTURA SISTEMA DE RÚBRICAS IMPLEMENTADO**

### **📦 Backend (100% Completo)**
```
backend/src/modules/activities/
├── entities/
│   ├── rubric.entity.ts ✅              // Rúbrica principal
│   ├── rubric-criterion.entity.ts ✅    // Criterios evaluación
│   ├── rubric-level.entity.ts ✅        // Niveles desempeño 
│   ├── rubric-cell.entity.ts ✅         // Celdas individuales
│   ├── rubric-assessment.entity.ts ✅   // Evaluaciones
│   └── rubric-assessment-criterion.entity.ts ✅ // Criterios evaluados
├── dto/
│   ├── create-rubric.dto.ts ✅          // Creación manual
│   ├── import-rubric.dto.ts ✅          // Importación ChatGPT
│   └── rubric-assessment.dto.ts ✅      // Evaluación estudiantes
├── services/
│   ├── rubrics.service.ts ✅            // CRUD + evaluaciones
│   └── rubric-utils.service.ts ✅       // Colores + parsers
├── controllers/
│   └── rubrics.controller.ts ✅         // API REST completa
└── migrations/
    └── CreateRubricSystem.ts ✅         // BD + índices
```

### **⚡ Funcionalidades Backend Implementadas**
- ✅ **Creación Manual**: Criterios + niveles + pesos personalizables
- ✅ **Importación ChatGPT**: Parser Markdown/CSV automático  
- ✅ **Colores Dinámicos**: Gradiente rojo→verde según cantidad niveles
- ✅ **Evaluación Clic**: Sistema puntuación por selección celda
- ✅ **Cálculo Ponderado**: Puntuaciones automáticas con pesos criterio
- ✅ **Integración Actividades**: Tipo valoración 'rubric' añadido
- ✅ **Visibilidad Familias**: Control acceso configurable
- ✅ **Plantillas Reutilizables**: Sistema templates para rúbricas
- ✅ **API Segura**: JWT + roles + validación completa

### **🎯 Frontend Implementado (100% Completo)**
```
frontend/src/
├── components/rubrics/
│   ├── RubricEditor.tsx          // ✅ Interfaz hoja cálculo con preview
│   ├── RubricImporter.tsx        // ✅ Import ChatGPT + instrucciones
│   ├── RubricGrid.tsx            // ✅ Vista tabla editable + colores
│   ├── RubricAssessment.tsx      // ✅ Evaluación por clic + comentarios
│   ├── RubricFamilyView.tsx      // ✅ Vista familias + análisis
│   └── index.ts                  // ✅ Export centralizado
├── pages/teacher/
│   ├── RubricsPage.tsx           // ✅ Gestión completa + estadísticas
│   └── ActivitiesPage.tsx        // ✅ Integrado tipo 'rubric'
└── hooks/
    └── useRubrics.ts             // ✅ Hook API completo
```

### **🔥 Funcionalidades Frontend Implementadas**
- ✅ **RubricGrid**: Tabla spreadsheet editable + clic selección + colores automáticos
- ✅ **RubricEditor**: Creación/edición con preview + configuración criterios/niveles dinámicos
- ✅ **RubricImporter**: Importación ChatGPT paso a paso + prompt + preview Markdown/CSV
- ✅ **RubricsPage**: Dashboard gestión con filtros + búsqueda + estadísticas + acciones CRUD
- ✅ **RubricAssessment**: Evaluación interactiva por clic + comentarios + progreso + scoring
- ✅ **RubricFamilyView**: Vista familias con análisis + fortalezas + mejoras + recomendaciones
- ✅ **Integración Activities**: Tipo valoración 'rubric' + selección rúbricas activas + UI
- ✅ **useRubrics Hook**: API integration + CRUD + colores + cálculos + import + utilities

---
*Actualizado: 2025-06-25 - Sistema Rúbricas COMPLETO 100% - Frontend + Backend operativo*