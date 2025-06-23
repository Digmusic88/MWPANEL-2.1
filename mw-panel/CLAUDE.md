# CLAUDE.md - MW Panel 2.0

Sistema de gestión educativa completo con NestJS + React + PostgreSQL + Docker.

## 🚀 **ESTADO ACTUAL: COMPLETAMENTE FUNCIONAL**

### ✅ **SISTEMAS IMPLEMENTADOS (10/16)**
1. **Sistema de Usuarios** - JWT, dashboards por rol ✅
2. **Sistema de Grupos** - CRUD, 3 grupos persistentes ✅
3. **Sistema de Profesores** - 6 profesores BD, dashboard ✅
4. **Sistema de Familias** - Formularios 3 pasos, acceso dual ✅
5. **Sistema de Importación** - Plantillas Excel, validación ✅
6. **Sistema de Evaluaciones** - 17 endpoints, competencias ✅
7. **Sistema de Horarios** - 19 aulas, 21 franjas, anti-conflictos ✅
8. **Sistema de Comunicaciones** - 17 endpoints + respuestas + eliminar notificaciones ✅
9. **UI Aurora Login** - Efecto aurora boreal animado ✅
10. **Sistema de Notificaciones** - Campana, eliminar individual/masivo ✅

## 🎯 **HOJA DE RUTA PRIORIZADA**

### **🔥 MÁXIMA PRIORIDAD (Semanas 1-2)**
1. **Sistema de Asistencia** 
   - Control diario por profesor
   - Justificaciones familiares
   - Reportes de ausencias
   - Dashboard de asistencia por clase

2. **Sistema de Tareas/Deberes**
   - Creación por profesores
   - Entrega digital por estudiantes
   - Corrección y calificación
   - Notificaciones automáticas

### **⭐ ALTA PRIORIDAD (Semanas 3-4)**
3. **Calendario Académico**
   - Eventos del centro
   - Exámenes programados
   - Fechas importantes
   - Vista unificada por rol

4. **Sistema de Expedientes**
   - Historial académico completo
   - Documentos del alumno
   - Seguimiento longitudinal

### **📋 MEDIA PRIORIDAD (Semanas 5-6)**
5. **Reportes y Boletines PDF**
   - Generación automática
   - Plantillas personalizables
   - Envío por email

6. **Portal de Recursos**
   - Biblioteca digital
   - Materiales por asignatura
   - Enlaces útiles

### **💬 BAJA PRIORIDAD (Futuro)**
7. **Chat Tiempo Real** - WebSockets, mensajería instantánea
8. **App Móvil** - React Native/Flutter
9. **Dashboard Analytics** - Métricas avanzadas del centro
10. **Sistema de Backup** - Copias automáticas programadas

## 🛠️ **COMANDOS ESENCIALES**

### **🚀 INICIO RÁPIDO**
```bash
# Un comando para todo el sistema
./start-all.sh

# Con reset completo
./start-all.sh --clean
```

### **🔧 DESARROLLO**
```bash
# Backend (tras cambios API)
docker-compose stop backend && docker-compose build --no-cache backend && docker-compose up -d backend

# Frontend (tras cambios UI)
docker-compose stop frontend && docker-compose build --no-cache frontend && docker-compose up -d frontend
```

**URLs:** Frontend http://localhost:5173 | Backend http://localhost:3000/api

## 📈 **ÚLTIMAS IMPLEMENTACIONES**

### **📅 2025-06-24**
- ✅ **Eliminar Notificaciones**: Botones eliminar individual/masivo, endpoints DELETE, UI mejorada
- ✅ **Sistema de Respuestas**: Threading mensajes, modal respuesta, auto-actualización
- ✅ **Restaurar Tipos de Mensaje**: Opciones mensaje grupal, notificación y comunicado oficial restauradas

### **📅 2025-06-23**
- ✅ **UI Aurora Login**: Efecto boreal animado implementado

## 📊 **RESUMEN EJECUTIVO**
- **Estado**: 10 sistemas core operativos (62% completado)
- **Arquitectura**: Microservicios dockerizados, alta disponibilidad
- **Base Datos**: PostgreSQL + Redis, seeds automáticos
- **Próximo**: Sistema de Asistencia (máxima prioridad educativa)
- **Usuarios**: 4 roles implementados, permisos granulares

**🎯 Enfoque: Completar sistemas pedagógicos esenciales antes de funcionalidades avanzadas**