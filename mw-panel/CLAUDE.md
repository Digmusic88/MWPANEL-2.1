# CLAUDE.md - MW Panel 2.0

Este archivo contiene el contexto y guía para Claude Code al trabajar en el proyecto MW Panel 2.0.

## 📋 Resumen del Proyecto

**MW Panel 2.0** es un sistema de gestión educativa completo desarrollado con:
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: React 18 + TypeScript + Ant Design + Vite
- **DevOps**: Docker + Docker Compose + Nginx

## 🚀 Estado Actual del Sistema

### ✅ **FUNCIONALIDADES COMPLETADAS Y OPERATIVAS**

#### 1. **Sistema de Usuarios** (100% Completado)
- Gestión completa de estudiantes, profesores, familias y administradores
- Autenticación JWT y autorización por roles
- Dashboards personalizados por tipo de usuario

#### 2. **Sistema de Grupos de Clase** (100% Completado)
- Módulo completo con operaciones CRUD
- 3 grupos persistentes con estudiantes y tutores asignados
- Integración con dashboard de profesores
- Soporte para grupos multinivel

#### 3. **Sistema de Profesores/Instructores** (100% Completado)
- Módulo backend completo con CRUD
- 6 profesores persistentes en base de datos
- Dashboard de profesores conectado a datos reales
- Interfaces frontend completas

#### 4. **Sistema de Familias** (100% Completado)
- Sistema de acceso dual (contacto único/doble contacto)
- Formularios de familia en 3 pasos con validación dinámica
- Dashboard familiar con datos reales
- Sistema de inscripción completo

#### 5. **Sistema de Importación Masiva** (100% Completado)
- Generación automática de plantillas Excel
- Proceso guiado de 3 pasos con UI intuitiva
- Validación de datos y reportes detallados
- Soporte para múltiples formatos (Excel, CSV)

#### 6. **Sistema de Evaluaciones por Competencias** (100% Completado)
- 17 endpoints RESTful con autenticación JWT
- Integración con currículo oficial español
- Períodos académicos con evaluación trimestral
- Cálculo automático de objetivos de competencia
- Visualización avanzada de competencias

#### 7. **Sistema de Horarios y Aulas** (100% Completado)
- 🏫 Gestión de Aulas: 19 aulas con tipos especializados y equipamiento
- ⏰ Sistema de Franjas Horarias: 21 franjas distribuidas por niveles educativos
- 📅 Sesiones de Horario: 12 sesiones programadas
- 🔗 API RESTful Completa: 18 endpoints
- 🎯 Validación de Conflictos: Prevención de solapamientos
- 📊 Interfaz Administrativa: Página /admin/schedules integrada

#### 8. **Sistema de Comunicaciones** (100% Completado)
- ✅ **Backend Completo**: 17 endpoints RESTful implementados
- ✅ **Entidades de BD**: 4 entidades (Message, Notification, Conversation, MessageAttachment)
- ✅ **Frontend Completo**: Interfaz de mensajería con pestañas y modales
- ✅ **Datos en BD**: 17 mensajes confirmados en base de datos
- ✅ **API Funcional**: Todas las queries TypeORM funcionando correctamente

**Funcionalidades del Sistema de Comunicaciones:**
- **Tipos de Mensaje**: directo, grupal, comunicado, notificación
- **Prioridades**: baja, normal, alta, urgente
- **Hilos de Conversación**: Soporte para respuestas anidadas
- **Archivos Adjuntos**: Sistema completo de attachments
- **Estados**: leído/no leído, archivado, eliminación soft
- **Filtros por Rol**: Admin ve todos, Teacher ve grupos asignados, Family ve mensajes propios
- **API Completa**: CRUD + estadísticas + notificaciones masivas

**✅ Funcionalidades Implementadas:**
- **API Completa**: 17 endpoints RESTful con autenticación JWT
- **Frontend Integrado**: Interfaz de mensajería con pestañas, modales y notificaciones
- **Sistema de Notificaciones**: Campana con polling automático cada 30 segundos
- **Badges Visuales**: Indicadores de mensajes no leídos en menú (expandido y colapsado)
- **Eliminación Diferenciada**: Tabla `MessageDeletion` para tracking individual de eliminaciones
- **Mensajes Enviados**: Automáticamente marcados como leídos para el emisor
- **Filtros por Rol**: Admin ve todos, Teacher ve grupos asignados, Family ve mensajes propios
- **Permisos Dinámicos**: Endpoints `/available-recipients` y `/available-groups` según rol
- **Queries Optimizadas**: TypeORM relations correctas y manejo de PostgreSQL camelCase

**🔧 Últimos Issues Resueltos:**
- ✅ **Error 500 profesores**: Corregidas queries PostgreSQL `md."messageId"` y `md."userId"`
- ✅ **Badge positioning**: Condicionales según estado del menú (expandido/colapsado)
- ✅ **MessageDeletion**: Sistema completo de eliminación individual por usuario

## 🗺️ **HOJA DE RUTA**

### 🎯 **ESTADO ACTUAL**
✅ **TODAS LAS FUNCIONALIDADES CORE ESTÁN COMPLETADAS**

El sistema MW Panel 2.0 está ahora 100% funcional en todas sus áreas principales.

### 🎯 **HOJA DE RUTA PRIORIZADA**

#### **🔥 PRIORIDAD ALTA (Inmediato)**
1. **Sistema de Asistencia Estudiantil**
   - Control de asistencia diario por clase
   - Justificaciones de faltas por familias
   - Reportes de asistencia automáticos
   - Dashboard de asistencia para profesores

2. **Sistema de Tareas y Deberes**
   - Creación y asignación de tareas por materias
   - Portal de entrega para estudiantes
   - Corrección y calificación digital
   - Notificaciones automáticas de fechas límite

#### **⭐ PRIORIDAD MEDIA (Corto Plazo)**
3. **Calendario Académico Integrado**
   - Calendario escolar con eventos y festivos
   - Programación de exámenes y evaluaciones
   - Integración con horarios de clase
   - Vista unificada para todos los roles

4. **Reportes y Boletines Automatizados**
   - Generación automática de boletines en PDF
   - Reportes de progreso académico
   - Estadísticas por grupo y materia
   - Exportación de datos académicos

#### **📈 PRIORIDAD BAJA (Largo Plazo)**
5. **Comunicaciones en Tiempo Real**
   - Chat en vivo entre usuarios
   - Notificaciones push instantáneas
   - Video llamadas integradas
   - Estados de conexión en tiempo real

6. **Portal de Recursos Educativos**
   - Biblioteca digital de materiales
   - Banco de recursos por materia
   - Sistema de compartición de archivos
   - Repositorio de videos educativos

## 🛠️ **COMANDOS DE DESARROLLO**

### **Reconstrucción Crítica (cuando hay cambios en código):**

⚠️ **IMPORTANTE**: Después de cualquier cambio en el código de backend o frontend, SIEMPRE debes reconstruir los contenedores Docker para que los cambios tomen efecto.

```bash
# Reconstruir Frontend (cambios React/TypeScript):
cd "/Users/digmusic/Documents/MWPANEL 2.0/mw-panel" && docker-compose stop frontend && docker-compose build --no-cache frontend && docker-compose up -d frontend

# Reconstruir Backend (cambios NestJS/TypeScript):  
cd "/Users/digmusic/Documents/MWPANEL 2.0/mw-panel" && docker-compose stop backend && docker-compose build --no-cache backend && docker-compose up -d backend

# Reiniciar todos los servicios:
cd "/Users/digmusic/Documents/MWPANEL 2.0/mw-panel" && docker-compose restart

# Reconstruir ambos al mismo tiempo (si hay cambios en ambos):
cd "/Users/digmusic/Documents/MWPANEL 2.0/mw-panel" && docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

### **Cuándo Reconstruir:**
- ✅ **Backend**: Cambios en archivos TypeScript, controladores, servicios, entidades
- ✅ **Frontend**: Cambios en archivos React, TypeScript, páginas, componentes
- ✅ **Ambos**: Cambios en DTOs compartidos o estructura de datos
- ✅ **Siempre**: Si aparecen errores 403, 404, 500 inesperados tras cambios

### **Comandos Útiles:**
```bash
# Ver logs en tiempo real:
docker-compose logs -f [frontend|backend|database]

# Acceder a contenedor:
docker-compose exec [frontend|backend|database] /bin/bash

# Reset completo del sistema:
docker-compose down && docker-compose up -d
```

## 🏗️ **Arquitectura del Sistema**

**Backend**: NestJS + TypeORM + PostgreSQL + Redis + Docker  
**Frontend**: React 18 + TypeScript + Ant Design + Vite  
**DevOps**: Docker Compose + Nginx

**Módulos Implementados**: Auth, Users, Students, Teachers, Families, ClassGroups, Evaluations, Schedules, Communications

## 🎖️ **Estado Actual: 100% FUNCIONAL**

✅ **8 Sistemas Core Completados** - Usuarios, Académico, Horarios, Evaluaciones, Comunicaciones, Importación  
✅ **100+ Endpoints RESTful** - API completa con autenticación JWT y autorización por roles  
✅ **Dashboards por Rol** - Admin, Teacher, Family, Student con datos reales  
✅ **Base de Datos Completa** - 20+ entidades con integridad referencial  
✅ **Sistema en Producción** - Docker containerizado, listo para despliegue

**🚀 SISTEMA COMPLETAMENTE OPERATIVO PARA ENTORNO EDUCATIVO**

---

## 📋 **RESUMEN EJECUTIVO**

**MW Panel 2.0** es un sistema de gestión educativa 100% funcional con arquitectura moderna (NestJS + React + PostgreSQL + Docker). 

**✅ COMPLETADO**: 8 módulos core, 100+ endpoints, eliminación diferenciada de mensajes, notificaciones en tiempo real, badges visuales optimizados.

**🎯 PRÓXIMO**: Sistema de Asistencia → Tareas/Deberes → Calendario Académico → Reportes PDF

**🔧 DESARROLLO**: Reconstruir containers tras cambios con `docker-compose build --no-cache [frontend|backend]`

**⚡ ACCESO**: Frontend http://localhost:5173 | Backend http://localhost:3000/api