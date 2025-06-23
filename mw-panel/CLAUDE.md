# CLAUDE.md - MW Panel 2.0

Sistema de gestión educativa completo con NestJS + React + PostgreSQL + Docker.

## 🚀 Estado Actual: 100% FUNCIONAL + UI MEJORADA

### ✅ **8 SISTEMAS CORE + MEJORAS UI**

1. **Sistema de Usuarios** - JWT, dashboards por rol
2. **Sistema de Grupos** - CRUD, 3 grupos persistentes  
3. **Sistema de Profesores** - 6 profesores BD, dashboard
4. **Sistema de Familias** - Formularios 3 pasos, acceso dual
5. **Sistema de Importación** - Plantillas Excel, validación
6. **Sistema de Evaluaciones** - 17 endpoints, competencias
7. **Sistema de Horarios** - 19 aulas, 21 franjas, anti-conflictos
8. **Sistema de Comunicaciones** - 17 endpoints, notificaciones tiempo real
9. **🌟 UI Aurora Login** - Efecto aurora boreal animado implementado

## 🎯 **PRÓXIMAS IMPLEMENTACIONES (PRIORIZADAS)**

### **🔥 ALTA PRIORIDAD**
1. **Sistema de Asistencia** - Control diario, justificaciones, reportes
2. **Sistema de Tareas** - Creación, entrega, corrección digital

### **⭐ MEDIA PRIORIDAD**  
3. **Calendario Academic** - Eventos, exámenes, vistas unificadas
4. **Reportes PDF** - Boletines automáticos, exportación

### **📈 BAJA PRIORIDAD**
5. **Chat Tiempo Real** - WebSockets, push notifications
6. **Portal Recursos** - Biblioteca digital, materiales

## 🛠️ **COMANDOS ESENCIALES**

**Reconstruir tras cambios:**
```bash
# Frontend: docker-compose stop frontend && docker-compose build --no-cache frontend && docker-compose up -d frontend
# Backend: docker-compose stop backend && docker-compose build --no-cache backend && docker-compose up -d backend
# Iniciar: docker-compose up -d
```

**Acceso:** Frontend http://localhost:5173 | Backend http://localhost:3000/api

## 📋 **RESUMEN**
✅ **COMPLETADO**: 8 sistemas + aurora UI, 100+ endpoints
🎯 **PRÓXIMO**: Asistencia → Tareas → Calendario → Reportes  
🔧 **DESARROLLO**: Reconstruir containers tras cambios