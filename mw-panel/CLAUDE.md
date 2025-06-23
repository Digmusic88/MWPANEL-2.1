# CLAUDE.md - MW Panel 2.0

Sistema de gestión educativa completo desarrollado con NestJS + React + PostgreSQL + Docker.

## 🚀 Estado Actual: 100% FUNCIONAL

### ✅ **8 SISTEMAS CORE COMPLETADOS**

1. **Sistema de Usuarios** - Gestión completa con JWT y dashboards por rol
2. **Sistema de Grupos de Clase** - CRUD completo con 3 grupos persistentes
3. **Sistema de Profesores** - 6 profesores en BD con dashboard integrado
4. **Sistema de Familias** - Formularios 3 pasos, acceso dual, inscripción completa
5. **Sistema de Importación Masiva** - Plantillas Excel, validación, reportes
6. **Sistema de Evaluaciones** - 17 endpoints, currículo español, competencias
7. **Sistema de Horarios y Aulas** - 19 aulas, 21 franjas, 18 endpoints, anti-conflictos
8. **Sistema de Comunicaciones** - 17 endpoints, 4 entidades BD, notificaciones tiempo real, badges optimizados

## 🎯 **HOJA DE RUTA PRIORIZADA**

### **🔥 PRIORIDAD ALTA (Próximas 2 implementaciones)**
1. **Sistema de Asistencia Estudiantil**
   - Control asistencia diaria por clase
   - Justificaciones por familias
   - Reportes automáticos
   - Dashboard profesores

2. **Sistema de Tareas y Deberes**
   - Creación/asignación por materias
   - Portal entrega estudiantes
   - Corrección digital
   - Notificaciones fechas límite

### **⭐ PRIORIDAD MEDIA**
3. **Calendario Académico** - Eventos, exámenes, vista unificada
4. **Reportes PDF** - Boletines automáticos, exportación datos

### **📈 PRIORIDAD BAJA**
5. **Chat Tiempo Real** - WebSockets, notificaciones push
6. **Portal Recursos** - Biblioteca digital, repositorio materiales

## 🛠️ **COMANDOS CRÍTICOS**

⚠️ **RECONSTRUIR TRAS CAMBIOS** (obligatorio):
```bash
# Frontend:
cd "/Users/digmusic/Documents/MWPANEL 2.0/mw-panel" && docker-compose stop frontend && docker-compose build --no-cache frontend && docker-compose up -d frontend

# Backend:
cd "/Users/digmusic/Documents/MWPANEL 2.0/mw-panel" && docker-compose stop backend && docker-compose build --no-cache backend && docker-compose up -d backend

# Ambos:
cd "/Users/digmusic/Documents/MWPANEL 2.0/mw-panel" && docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

**Iniciar servicios:**
```bash
cd "/Users/digmusic/Documents/MWPANEL 2.0/mw-panel" && docker-compose up -d
```

## 📊 **ARQUITECTURA**
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Frontend**: React 18 + TypeScript + Ant Design + Vite  
- **DevOps**: Docker + Nginx
- **Acceso**: Frontend http://localhost:5173 | Backend http://localhost:3000/api

## 📋 **RESUMEN EJECUTIVO**
✅ **COMPLETADO**: 8 módulos core, 100+ endpoints, sistema completamente operativo
🎯 **PRÓXIMO**: Asistencia → Tareas → Calendario → Reportes
🔧 **DESARROLLO**: Siempre reconstruir containers tras cambios de código