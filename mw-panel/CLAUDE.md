# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

MW Panel 2.0 is a comprehensive educational management system designed for Spanish educational institutions. It's a full-stack application built with NestJS backend, React frontend, PostgreSQL database, and Docker containerization. The system provides competency-based evaluation, multi-role dashboards, and complete school management functionality.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Frontend    │    │     Backend     │    │    Database     │
│   React + Vite  │◄──►│  NestJS + JWT   │◄──►│  PostgreSQL 15  │
│   TypeScript    │    │   TypeScript    │    │      Redis      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Nginx      │    │   WebSockets    │    │     Docker      │
│  Reverse Proxy  │    │   Socket.io     │    │  Containerized  │
│      SSL        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Commands

### Development Commands

```bash
# Quick start - entire system
./start-all.sh

# Start with cleanup
./start-all.sh --clean

# Development rebuilds after changes
# Backend:
docker-compose stop backend && docker-compose build --no-cache backend && docker-compose up -d backend

# Frontend:  
docker-compose stop frontend && docker-compose build --no-cache frontend && docker-compose up -d frontend

# View logs
docker-compose logs -f [service_name]

# Access containers
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Backend Commands (from inside backend container)

```bash
# Database migrations
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert

# Database seeding
npm run seed:run

# Development
npm run start:dev

# Testing
npm run test
npm run test:watch
npm run test:cov
npm run test:e2e

# Linting
npm run lint
```

### Frontend Commands (from inside frontend container or locally)

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

## Key Technologies

### Backend Stack
- **NestJS**: Node.js framework with TypeScript
- **TypeORM**: Database ORM with entities, migrations, seeds
- **PostgreSQL**: Primary database
- **Redis**: Caching and sessions
- **JWT**: Authentication and authorization
- **Socket.io**: WebSocket communications
- **Swagger**: API documentation at http://localhost:3000/api
- **PDFKit**: PDF generation for reports
- **Multer**: File uploads

### Frontend Stack
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **TypeScript**: Static typing
- **Ant Design**: UI component library
- **TailwindCSS**: Utility-first CSS
- **Zustand**: State management
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing
- **Recharts**: Data visualization
- **Framer Motion**: Animations

## Project Structure

### Backend Structure (`/backend/src/`)

```
modules/
├── auth/           # JWT authentication, login, refresh tokens
├── users/          # User management, profiles, roles
├── students/       # Student entities, enrollment
├── teachers/       # Teacher management, assignments
├── families/       # Family accounts, multi-child access
├── class-groups/   # Class organization
├── subjects/       # Subject and assignment management
├── schedules/      # Timetable, classrooms, time slots
├── evaluations/    # Competency-based evaluations
├── competencies/   # Educational competencies and areas
├── activities/     # Activities and rubrics system
├── tasks/          # Homework and digital assignments
├── communications/ # Messages, notifications, conversations
├── attendance/     # Attendance tracking and requests
├── calendar/       # Academic calendar events
├── settings/       # System configuration
├── academic-records/ # Student records and PDF reports
├── grades/         # Grading system
└── reports/        # Report generation
```

### Frontend Structure (`/frontend/src/`)

```
components/
├── animations/     # Framer Motion components
├── calendar/       # Calendar widgets
├── common/         # Shared components
├── evaluation/     # Competency evaluation UI
├── layout/         # Layout components
└── rubrics/        # Complete rubrics interface

pages/
├── admin/          # Admin dashboard and management
├── teacher/        # Teacher dashboard and tools
├── family/         # Family dashboard and activities
├── student/        # Student dashboard
├── auth/           # Login and authentication
├── communications/ # Messages and notifications
└── shared/         # Shared pages across roles

hooks/              # Custom React hooks
services/           # API clients and external services
store/              # Zustand state management
types/              # TypeScript type definitions
utils/              # Utility functions
```

## Database Architecture

### Key Entities

The system uses TypeORM with PostgreSQL. Major entities include:

- **User/UserProfile**: Multi-role user system
- **Student/Teacher/Family**: Role-specific profiles
- **ClassGroup/Subject/SubjectAssignment**: Academic structure
- **Evaluation/CompetencyEvaluation**: Competency-based assessment
- **Activity/Task**: Assignments and homework
- **Rubric/RubricAssessment**: Advanced evaluation system
- **Message/Notification**: Communications
- **AttendanceRecord/AttendanceRequest**: Attendance management
- **CalendarEvent**: Academic calendar
- **AcademicRecord**: Student history and reports

### Migrations & Seeds

- **Migrations**: Located in `backend/src/database/migrations/`
- **Seeds**: Located in `backend/src/database/seeds/` with comprehensive test data
- **Data Source**: Configuration in `backend/src/database/data-source.ts`

## Development Workflow

1. **System Requirements**: Docker & Docker Compose
2. **Environment Setup**: Copy `.env.example` to `.env` and configure
3. **Database Setup**: Migrations and seeds run automatically via `start-all.sh`
4. **Development**: Use hot reload - backend watches `src/`, frontend has Vite HMR
5. **Testing**: Backend has Jest tests, run `npm run test` in backend container
6. **API Documentation**: Available at `http://localhost:3000/api` (Swagger)

## Access URLs & Authentication

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Documentation**: http://localhost:3000/api

### Test Users (created by seeds):
- **Admin**: admin@mwpanel.com / Admin123!
- **Teacher**: profesor@mwpanel.com / Profesor123!
- **Student**: estudiante@mwpanel.com / Estudiante123!
- **Family**: familia@mwpanel.com / Familia123!

## System Status

The system is **100% FUNCTIONAL** with 19 complete modules:
- User Management (JWT, role-based dashboards)
- Class Groups & Teachers Management
- Family Management (multi-step forms, dual access)
- Excel Import System with validation
- Competency-based Evaluations (complete backend + frontend)
- Schedule System (19 classrooms, 21 time slots)
- Complete Communications System (4 message types + responses)
- Notifications System
- Attendance System (daily control + requests)
- Family Activities System
- Tasks/Homework System (digital + "Test Yourself")
- Modular Configuration System
- Academic Records + PDF Reports
- Complete Rubrics System (backend + frontend)
- **Shared Rubrics System (NEW)** - Complete sharing and collaboration platform
- **Teacher Evaluations System** - Full CRUD with competency assessment
- Complete Grades System (real database integration)
- Advanced Calendar with touch navigation
- Responsive Design System (mobile/tablet/desktop)

## System Features

### Core Features (100% Functional)
- **Multi-Role Authentication**: JWT-based with refresh tokens
- **Competency-Based Evaluation**: Spanish educational levels support
- **Complete Rubrics System**: Pedagogical evaluation with ChatGPT import
- **Shared Rubrics Platform**: Complete teacher collaboration system
- **Teacher Evaluations System**: Full CRUD for competency-based student assessment
- **Responsive Design**: Mobile-first with touch navigation
- **Real-time Communications**: WebSocket integration
- **Academic Records**: PDF generation for reports
- **Modular Configuration**: Admin can enable/disable features

### Recent Implementations
- **Shared Rubrics System**: Complete collaboration platform for teachers to share and adapt rubrics
- **Teacher Evaluations System**: Complete page for managing student evaluations
- **Advanced Calendar**: Touch navigation with swipe gestures
- **Rubrics System**: Complete backend + frontend with weighted scoring
- **Responsive Tables**: Adaptive views for mobile devices
- **Module Settings**: Granular control over system features
- **Grades System**: Real database integration across all user roles

## Production Deployment

The system includes comprehensive deployment automation:

- **Scripts**: `deploy/install-vps.sh` for automated VPS setup
- **Docker Compose**: Production configuration with Nginx, SSL, backups
- **Monitoring**: Automated health checks and alerting
- **Security**: SSL certificates, firewall configuration, system hardening
- **Backups**: Automated database and file backups

## 📈 **ÚLTIMAS IMPLEMENTACIONES**

### **📝 2025-07-01 (CALENDAR PERMISSIONS + CHARTS & EVALUATIONS FIXED)**
**Calendar Role-Based Restrictions (100%):**
- ✅ **Family Event Restrictions**: Solo pueden crear recordatorios familiares y eventos generales privados
- ✅ **Student Event Restrictions**: Solo pueden crear recordatorios personales y fechas límite privadas
- ✅ **Teacher Event Permissions**: Pueden crear eventos públicos y para clases específicas
- ✅ **Admin Event Permissions**: Control completo sobre todos los tipos de eventos
- ✅ **Private Visibility Enforcement**: Familias y estudiantes solo crean eventos privados
- ✅ **Dynamic Form Fields**: Campos de formulario adaptados según el rol del usuario
- ✅ **Button Text Updates**: Botones cambian de "Nuevo" a "Recordatorio" para familias/estudiantes
- ✅ **Alert Messages**: Información clara sobre la privacidad de eventos para cada rol

**Technical Implementation:**
- **useCalendar Hook Extensions**: Nuevas funciones `getAllowedEventTypes()`, `getAllowedVisibilityLevels()`, `getDefaultVisibility()`
- **CalendarWidget Restrictions**: Formulario dinámico que solo muestra opciones permitidas por rol
- **Event Type Filtering**: Tipos de eventos filtrados según permisos del usuario
- **Visibility Control**: Visibilidad automática establecida como privada para familias/estudiantes
- **UI/UX Adaptado**: Textos e iconos específicos para cada tipo de usuario

**Event Type Permissions by Role:**
- **Admin**: Todos los tipos (activity, evaluation, test_yourself, general_event, holiday, meeting, excursion, festival, deadline, reminder)
- **Teacher**: 7 tipos (activity, evaluation, test_yourself, general_event, meeting, deadline, reminder)
- **Family**: 2 tipos (reminder, general_event) - Solo privados
- **Student**: 2 tipos (reminder, deadline) - Solo privados

**Visibility Permissions by Role:**
- **Admin/Teacher**: Todos los niveles de visibilidad (public, teachers_only, students_only, families_only, admin_only, class_specific, subject_specific, private)
- **Family/Student**: Solo eventos privados (private)

### **📝 2025-07-01 (CHARTS ERROR FIXED + SISTEMA EVALUACIONES COMPLETO)**
**Charts & Null Reference Errors Resolution (100%):**
- ✅ **@ant-design/plots Invalid Grid Data**: Error "Invalid grid data" completamente solucionado
- ✅ **FamilyGradesPage Radar Chart**: Validación de datos y manejo de arrays vacíos
- ✅ **FamilyGradesPage Line Chart**: Protección contra null/undefined y NaN values
- ✅ **FamilyGradesPage History Tab**: Null reference error en averageGrade.toFixed() resuelto
- ✅ **Subject Details Panel**: Protección para lastUpdated, gradedTasks, pendingTasks null
- ✅ **AdminGradesPage All Charts**: Pie, Column, Line charts con validación robusta
- ✅ **TeacherGradesPage Column Chart**: Distribución de calificaciones con datos válidos
- ✅ **Empty States**: Componentes Empty apropiados cuando no hay datos
- ✅ **Data Validation**: Filtros exhaustivos para tipos de datos y valores válidos
- ✅ **Tooltip Enhancement**: Tooltips mejorados con formateo seguro

**Technical Fixes Applied:**
- **Null/Undefined Safety**: Verificación de existencia de datos antes de procesamiento
- **NaN Protection**: Conversión segura de números y manejo de valores inválidos
- **Array Validation**: Filtrado de elementos null/undefined en arrays de datos
- **Type Checking**: Verificación de tipos antes de operaciones matemáticas
- **Grid Configuration**: Configuración explícita de ejes y grillas para prevenir errores
- **Error Boundaries**: Renderizado condicional con estados de error y vacío

### **📝 2025-07-01 (SISTEMA DE EVALUACIONES PARA PROFESORES COMPLETO + EDIT FIXED)**
**Frontend (100%):**
- ✅ **TeacherEvaluationsPage**: Página completa de gestión de evaluaciones para profesores
- ✅ **Dashboard de estadísticas**: Total, finalizadas, borradores, promedio automático
- ✅ **Tabla filterable avanzada**: Por estado, asignatura, período, búsqueda en tiempo real
- ✅ **Modal de creación**: Formulario completo para nueva evaluación con competencias
- ✅ **Drawer de visualización/edición**: Ver y editar evaluaciones existentes **[EDIT FUNCTIONALITY FIXED]**
- ✅ **Separación View/Edit Modes**: Drawer con dos modos distintos - solo lectura vs formulario editable
- ✅ **Form Edit Implementation**: Formulario completo con estado, observaciones y competencias editables
- ✅ **Sistema de competencias**: Evaluación con puntuaciones 1-5 estrellas + observaciones
- ✅ **Estados de evaluación**: Borrador, Enviada, Revisada, Finalizada
- ✅ **Integración Dashboard**: Botón "Nueva Evaluación" + sección "Evaluaciones Recientes"
- ✅ **Navegación completa**: Menú lateral "Evaluaciones" + rutas funcionales
- ✅ **Error handling robusto**: Manejo de datos null/undefined sin errores
- ✅ **Container Deployment**: Frontend reconstruido y desplegado con edit functionality

**Backend (100%):**
- ✅ **API REST Completa**: Endpoints para profesores `/evaluations/teacher/{teacherId}`
- ✅ **Estadísticas automáticas**: `/evaluations/stats` con cálculos en tiempo real
- ✅ **Sistema de períodos**: `/evaluations/periods` para trimestres académicos
- ✅ **Integración competencias**: Evaluación por competencias educativas españolas
- ✅ **Estados workflow**: Draft → Submitted → Reviewed → Finalized
- ✅ **Autenticación JWT**: Control de acceso por roles (admin, teacher)
- ✅ **Validación completa**: DTOs con validación de datos de entrada
- ✅ **Cálculo automático**: Puntuación general basada en competencias individuales

**Funcionalidades Clave:**
- **Gestión Completa CRUD**: Crear, leer, actualizar, eliminar evaluaciones
- **Evaluación por Competencias**: 8 competencias educativas españolas estándar
- **Filtros Avanzados**: Estado, asignatura, período, búsqueda por nombre
- **Dashboard Interactivo**: Estadísticas en tiempo real con widgets visuales
- **Vista Previa Detallada**: Drawer con información completa de evaluación
- **Responsive Design**: Adaptado para mobile, tablet, desktop
- **Error Resilience**: Manejo robusto de datos incompletos o inconsistentes

### **📅 Correcciones Técnicas Implementadas:**
- ✅ **React Hooks Rules**: Orden correcto de hooks para evitar violaciones
- ✅ **Ant Design Components**: Eliminado warnings de props deprecated (tip)
- ✅ **Null Safety**: Operador encadenamiento opcional en propiedades anidadas
- ✅ **NaN Protection**: Verificación de tipos para componentes Rate
- ✅ **Import Management**: Iconos correctamente importados
- ✅ **Performance**: Cálculos optimizados para evitar división por cero

### **📝 2025-07-01 (SISTEMA RÚBRICAS COMPARTIDAS COMPLETO + CORRECCIONES TÉCNICAS)**
**Sistema de Rúbricas Compartidas (100%):**
- ✅ **SharedRubricsPage**: Página completa para visualizar rúbricas compartidas por otros profesores
- ✅ **Navegación Funcional**: Menú "Rúbricas Compartidas" accesible desde DashboardLayout
- ✅ **Copy Functionality**: Sistema completo para copiar rúbricas a cuaderno personal
- ✅ **Customize & Edit**: Opción para personalizar rúbricas antes de copiar
- ✅ **Authentication Fixed**: Corregido flujo de autenticación en SharedRubricsPage y RubricsPage
- ✅ **API Endpoints**: `/api/rubrics/shared-with-me` funcionando correctamente
- ✅ **Database Relationships**: Sistema de compartir configurado con array PostgreSQL `sharedWith`
- ✅ **Shared Badges**: Badges "Compartido (X)" para rúbricas propias compartidas con otros
- ✅ **Statistics Dashboard**: Estadísticas de rúbricas compartidas con métricas en tiempo real

**Problemas Críticos Resueltos:**
- ✅ **401 Authentication Errors**: Eliminado uso incorrecto de `/api/teachers/dashboard/my-dashboard`
- ✅ **400 Bad Request**: Corregido orden de rutas en RubricsController (`shared-with-me` antes que `:id`)
- ✅ **Route Interception**: Rutas específicas movidas antes que rutas parametrizadas
- ✅ **Backend Route Ordering**: `@Get('shared-with-me')` y `@Get('colleagues')` antes de `@Get(':id')`
- ✅ **Templates Not Showing**: RubricsPage ya incluía `includeTemplates=true` por defecto
- ✅ **Ant Design Warnings**: Deprecated `TabPane` convertido a formato moderno `items` prop

**Technical Implementations:**
- **RubricsController.ts**: Reordenación crítica de rutas para evitar interceptación UUID
- **SharedRubricsPage.tsx**: Autenticación corregida usando `/auth/me` + `/teachers` pattern
- **RubricsPage.tsx**: Aplicada misma corrección de autenticación
- **RubricEditor.tsx**: Convertido de `<TabPane>` a `<Tabs items={[]}/>` format
- **Database**: Configuradas relaciones de compartir para demostrar funcionalidad
- **Container Rebuilds**: Backend y Frontend reconstruidos con `--no-cache`

**Funcionalidades del Sistema:**
- **View Shared Rubrics**: Visualizar rúbricas compartidas con filtros avanzados
- **Copy to Personal**: Copiar rúbricas exactas o personalizadas
- **Share Management**: Gestión completa de permisos de compartir
- **Colleague Directory**: Lista de profesores disponibles para compartir
- **Usage Statistics**: Métricas de uso y adopción de rúbricas compartidas
- **Responsive Design**: Interface adaptada para mobile/tablet/desktop

**Base de Datos Configurada:**
- **profesor@mwpanel.com**: 2 rúbricas propias (1 compartida con lengua@mwpanel.com)
- **lengua@mwpanel.com**: 1 rúbrica compartida con profesor@mwpanel.com
- **Shared Relationships**: Array PostgreSQL funcionando correctamente
- **Badge Display**: Sistema puede mostrar "Compartido (1)" para rúbricas propias compartidas

### **📝 2025-07-01 (LOGOUT MEJORADO + ERRORES POST-LOGOUT RESUELTOS)**
**Sistema de Logout Robusto (100%):**
- ✅ **Logout API Fixed**: Envío correcto de refreshToken al endpoint `/auth/logout`
- ✅ **Error Suppression**: Errores 401 post-logout eliminados completamente
- ✅ **Smart Interceptor**: Interceptor no intenta refresh después de logout
- ✅ **Silent Endpoints**: Lista expandida de endpoints silenciosos
- ✅ **Auth State Validation**: Verificación de estado de autenticación antes de operaciones
- ✅ **Graceful Degradation**: Manejo elegante de localStorage corrupto o inválido
- ✅ **No More 401s**: Eliminados errores "Failed to load resource: 401 Unauthorized"

**Problemas Críticos Resueltos:**
- ✅ **Post-Logout 401 Errors**: Errores en `/api/class-groups` y otros endpoints después de logout
- ✅ **Unauthorized Notifications**: Eliminadas notificaciones "No autorizado" después de logout
- ✅ **Refresh Token Logic**: Interceptor solo intenta refresh si usuario está autenticado
- ✅ **localStorage Safety**: Manejo seguro de datos corruptos en localStorage
- ✅ **Error Message Filtering**: Filtrado inteligente de errores 401 post-logout

**Technical Implementations:**
- **apiClient.ts**: Interceptor mejorado con verificación de estado de autenticación
- **authService.ts**: Envío de refreshToken en logout + manejo de errores 401
- **authStore.ts**: Pase correcto de refreshToken al service
- **Silent Endpoints**: Agregados `/auth/logout` y `/auth/refresh` a lista silenciosa
- **Error Context Aware**: Interceptor consciente del contexto de autenticación

**Smart Error Handling:**
- **Authenticated State Check**: Verificación de `isAuthenticated` antes de mostrar errores
- **Graceful localStorage**: Try/catch para datos de localStorage corruptos
- **Context-Aware Refresh**: Solo intenta refresh si usuario debería estar autenticado
- **Error Suppression**: No mostrar errores 401 cuando usuario no está autenticado
- **Clean Logout Flow**: Logout completamente silencioso sin errores residuales

## Important Notes

- **TypeScript**: Both frontend and backend are fully typed
- **Authentication**: JWT-based with refresh tokens and role-based access
- **Database**: PostgreSQL with Redis for caching
- **File Uploads**: Handled via Multer in backend, stored in `backend/uploads/`
- **API Security**: All endpoints protected with JWT guards and role validation
- **Real-time**: WebSocket integration for live notifications and updates
- **PDF Generation**: Automated report generation for academic records
- **Import System**: Excel-based bulk import with validation
- **Teacher Evaluations**: Complete competency-based assessment system integrated

## 📊 **RESUMEN EJECUTIVO**
- **Estado**: 19 sistemas operativos (100% completado) 🎉
- **Sistema Rúbricas Compartidas**: Frontend + Backend 100% completo - plataforma colaboración docente funcional
- **Sistema Evaluaciones Profesor**: Frontend + Backend 100% completo - gestión pedagógica avanzada funcional
- **Sistema Calificaciones**: Integración base de datos real completada en todos los roles de usuario
- **Sistema Rúbricas**: Frontend + Backend 100% completo - evaluación pedagógica avanzada funcional
- **Sistema Expedientes**: Con activación modular desde admin + generación boletines PDF automática  
- **Sistema Configuración**: Control granular módulos + cache optimizado + verificación permisos
- **Responsive Design**: 100% optimizado mobile/tablet/desktop con navegación táctil completa
- **Arquitectura**: Microservicios dockerizados, PostgreSQL optimizado, UI táctil + sistema completo
- **Progress**: +1 sistema funcional (Rúbricas Compartidas), plataforma educativa integral 100% operativa

**🎯 Estrategia: Plataforma educativa integral + colaboración docente + evaluación pedagógica avanzada + cumplimiento normativo completo**

---

*Actualizado: 2025-07-01 - Sistema Rúbricas Compartidas COMPLETO + Correcciones Técnicas + Ant Design Updates + Estabilidad Total*