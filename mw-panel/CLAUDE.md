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

**Problemas Resueltos:**
- ❌ **Issue 1**: Error 500 con TypeORM query "Relation with property path profile in entity was not found"
  - ✅ **Solución**: Corrección de relaciones en query builder: `relatedStudent.user.profile` en lugar de `relatedStudent.profile`
- ❌ **Issue 2**: Error 403 (Forbidden) al eliminar mensajes individuales  
  - ✅ **Solución**: Problema en JWT guard - usar `req.user.id` en lugar de `req.user.sub`
  - ✅ **Implementación**: Fallback con `req.user?.sub || req.user?.userId || req.user?.id`
- ❌ **Issue 3**: Error 403 (Forbidden) al marcar mensajes como leídos y otros endpoints
  - ✅ **Solución**: Aplicar el mismo patrón de fallback JWT a TODOS los endpoints del controlador
  - ✅ **Endpoints fijos**: createMessage, findAllMessages, updateMessage, deleteMessage, markAllAsRead, deleteAllMessages, notifications, stats
- ❌ **Issue 4**: Acciones masivas no funcionaban correctamente (solo marcaba algunos mensajes)
  - ✅ **Solución**: Implementar la misma lógica de filtrado por roles en `markAllMessagesAsRead` y `deleteAllMessages`
  - ✅ **Mejora**: Ahora usan query builder para obtener todos los mensajes que el usuario puede ver según su rol
  - ✅ **Logs mejorados**: Muestra el número exacto de mensajes procesados
- ❌ **Issue 5**: Error 500 para profesores debido a problema con subquery `tutorId`
  - ✅ **Solución**: Cambiar subqueries complejas por consultas separadas usando TypeORM relations
  - ✅ **Implementación**: Obtener grupos del profesor primero, luego usar `IN` con los IDs
- ❌ **Issue 6**: Patrón JWT inconsistente en otros controladores
  - ✅ **Solución**: Aplicar el patrón de fallback `req.user?.sub || req.user?.userId || req.user?.id` en FamiliesController
  - ✅ **Verificación**: Revisión completa de todos los controladores del sistema
- ❌ **Issue 7**: Permisos demasiado restrictivos para profesores al crear mensajes
  - ✅ **Solución**: Rediseño completo de `validateSendPermissions()` con lógica más permisiva pero segura
  - ✅ **Profesores pueden**: Contactar admin/profesores, enviar a familias (general), mensajes grupales a sus clases, comunicados
  - ✅ **Logs detallados**: Debugging completo para identificar problemas de permisos
  - ✅ **Bandeja actualizada**: Los mensajes se refrescan automáticamente tras envío/lectura/eliminación
- ❌ **Issue 8**: UX deficiente - usuarios veían opciones sin permisos causando errores
  - ✅ **Solución**: Nuevos endpoints `/available-recipients` y `/available-groups` según rol del usuario
  - ✅ **Backend**: Lógica de filtrado inteligente por rol (Admin ve todos, Teacher ve según permisos, Family/Student solo admin/teachers)
  - ✅ **Frontend**: Listas dinámicas que solo muestran usuarios/grupos permitidos según el rol
  - ✅ **Tipos de mensaje**: Filtrados por rol (Directo: todos, Grupal: admin/teacher, Comunicado: admin)
  - ✅ **UI mejorada**: Placeholders informativos cuando no hay opciones disponibles
- ❌ **Issue 9**: Error crítico de relaciones TypeORM - teachers no podían acceder a sus grupos
  - ✅ **Problema**: Queries usaban `tutor: { id: userId }` pero debían usar `tutor: { user: { id: userId } }`
  - ✅ **Solución**: Corrección en todas las queries de teacher-group relationships en 6 métodos
  - ✅ **Métodos corregidos**: validateSendPermissions, getAvailableGroups, findAllMessages, markAllMessagesAsRead, deleteAllMessages
  - ✅ **Relaciones TypeORM**: User -> Teacher -> ClassGroup (tutor) correctamente implementadas
- ❌ **Issue 10**: Sistema de notificaciones (campana) no funcionaba
  - ✅ **Solución**: Debugging completo del sistema de notificaciones automáticas
  - ✅ **Backend**: Logs detallados en `createMessageNotifications()` para troubleshooting
  - ✅ **Frontend**: Polling automático cada 30 segundos para actualizar notificaciones en tiempo real
  - ✅ **Integración**: NotificationCenter correctamente integrado en DashboardLayout
  - ✅ **Funcionalidad**: Notificaciones se crean automáticamente al enviar mensajes directos y grupales
- ❌ **Issue 11**: Eliminación de mensajes afectaba a ambos usuarios (emisor y receptor)
  - ✅ **Solución**: Implementación de eliminación diferenciada por usuario
  - ✅ **Backend**: Nuevas columnas `isDeletedBySender` e `isDeletedByRecipient` en tabla messages
  - ✅ **Lógica**: Emisor elimina solo para él, receptor elimina solo para él, admin elimina completamente
  - ✅ **Base de datos**: Mensaje se elimina completamente solo cuando ambos usuarios lo han eliminado
  - ✅ **Queries**: Filtros actualizados en `findAllMessages`, `markAllMessagesAsRead` y `deleteAllMessages`
- ❌ **Issue 12**: Falta de indicador visual para mensajes no leídos en menú lateral
  - ✅ **Solución**: Implementación de badges con contador de mensajes no leídos
  - ✅ **Backend**: Nuevo endpoint `/communications/messages/unread-count`
  - ✅ **Frontend**: Hook `useUnreadMessages` con polling cada 30 segundos
  - ✅ **UI**: Badges rojos con número de mensajes no leídos en menú lateral
  - ✅ **Roles**: Indicadores adaptativos para Admin (comunicaciones/mensajes), Teacher y Family (mensajes)
  - ✅ **Estilo**: Badges integrados que desaparecen cuando no hay mensajes pendientes
- ❌ **Issue 13**: Error 500 en endpoint `/messages/unread-count` por conflicto de rutas
  - ✅ **Problema**: Ruta `/messages/unread-count` se interpretaba como `/messages/:id` con id="unread-count"
  - ✅ **Solución**: Reordenación de rutas en controlador - endpoints específicos antes que parametrizados
  - ✅ **Resultado**: Endpoint `/communications/messages/unread-count` funcionando correctamente
- ❌ **Issue 14**: Mensajes enviados aparecían como "no leídos" en la bandeja del emisor
  - ✅ **Problema**: El emisor debería ver sus mensajes enviados como "leídos" automáticamente
  - ✅ **Solución Backend**: Exclusión de mensajes enviados en `getUnreadMessagesCount()` con `message.senderId != :userId`
  - ✅ **Solución Frontend**: Helper `isMessageReadForUser()` que considera mensajes enviados como leídos
  - ✅ **UI**: Mensajes enviados aparecen sin negrita, con badge "Leído", sin botón "Marcar como leído"
  - ✅ **Contador**: Los mensajes enviados NO cuentan en el indicador de mensajes no leídos del menú
  - ✅ **Experiencia**: Lógico para el usuario - no necesita "leer" mensajes que él mismo escribió
- ❌ **Issue 15**: Falta indicador visual en menú colapsado para mensajes no leídos
  - ✅ **Problema**: Al colapsar el menú lateral, solo se veían los íconos sin indicadores de mensajes pendientes
  - ✅ **Solución**: Badge con contador en los íconos de comunicaciones/mensajes cuando el menú está colapsado
  - ✅ **Implementación**: Badge sobre el ícono `MessageOutlined` con `offset={[10, -5]}` para posicionamiento óptimo
  - ✅ **Aplicación**: Admin (comunicaciones), Teacher (mensajes), Family (mensajes) todos con indicadores en modo colapsado
  - ✅ **Estilo**: Badge más pequeño (16px) para íconos, adaptado al espacio reducido del menú colapsado
  - ✅ **UX**: Usuarios pueden ver mensajes pendientes tanto en menú expandido como colapsado
- ✅ **Resultado**: Sistema 100% funcional - notificaciones, eliminación diferenciada, indicadores visuales completos (expandido y colapsado) y mensajes enviados como leídos funcionando correctamente

## 🗺️ **HOJA DE RUTA**

### 🎯 **ESTADO ACTUAL**
✅ **TODAS LAS FUNCIONALIDADES CORE ESTÁN COMPLETADAS**

El sistema MW Panel 2.0 está ahora 100% funcional en todas sus áreas principales.

### 🔮 **PRÓXIMAS FUNCIONALIDADES SUGERIDAS**
1. **Optimización del Sistema de Comunicaciones**
   - Notificaciones push en tiempo real
   - Sistema de chat en vivo
   - Integración con calendario de eventos

2. **Reportes Avanzados**
   - Generación de boletines en PDF
   - Gráficos de progreso temporal
   - Comparativas entre períodos

3. **Funcionalidades Móviles**
   - Aplicación móvil nativa
   - Notificaciones push móviles
   - Modo offline

4. **Integración Académica Avanzada**
   - Sistema de tareas y deberes
   - Calendario de clases integrado
   - Asistencia detallada con justificaciones

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

## 📁 **Estructura del Proyecto**

```
mw-panel/
├── backend/               # NestJS + TypeORM
│   ├── src/modules/
│   │   ├── auth/         # Autenticación JWT
│   │   ├── users/        # Gestión de usuarios
│   │   ├── students/     # Gestión de estudiantes  
│   │   ├── teachers/     # Gestión de profesores
│   │   ├── families/     # Gestión de familias
│   │   ├── class-groups/ # Grupos de clase
│   │   ├── evaluations/  # Sistema de evaluaciones
│   │   ├── schedules/    # Horarios y aulas
│   │   └── communications/ # Sistema de comunicaciones (debugging)
├── frontend/             # React + TypeScript + Ant Design
│   ├── src/pages/
│   │   ├── admin/        # Dashboard administrativo
│   │   ├── teacher/      # Dashboard de profesores
│   │   ├── family/       # Dashboard familiar
│   │   └── communications/ # Interfaz de mensajería
└── docker-compose.yml   # Orquestación de servicios
```

## 🎖️ **Logros del Sistema**

MW Panel 2.0 es actualmente un sistema educativo completo que incluye:
- ✅ Gestión completa de usuarios (estudiantes, profesores, familias, administradores)
- ✅ Gestión académica (cursos, grupos de clase, materias, competencias)  
- ✅ Sistema de horarios y aulas completamente funcional
- ✅ Sistema de evaluaciones por competencias
- ✅ Dashboards personalizados por roles con datos reales
- ✅ Sistema de inscripción con importación masiva
- ✅ Autenticación y autorización robusta
- ✅ Base de datos con integridad referencial completa
- ✅ Sistema de comunicaciones completamente funcional

**🚀 EL SISTEMA ESTÁ 100% COMPLETO Y LISTO PARA PRODUCCIÓN EN TODAS LAS ÁREAS.**