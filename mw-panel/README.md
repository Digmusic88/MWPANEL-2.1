# MW Panel 2.0 - Sistema de Gestión Escolar

<div align="center">

![MW Panel Logo](https://via.placeholder.com/200x120/2563eb/ffffff?text=MW+Panel)

**Sistema de Gestión Escolar Completo con Evaluación por Competencias**

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue?logo=typescript)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-Latest-red?logo=nestjs)](https://nestjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?logo=postgresql)](https://postgresql.org)

</div>

## 📋 Descripción

MW Panel 2.0 es un sistema integral de gestión escolar diseñado específicamente para centros educativos de España, cumpliendo con la normativa de evaluación por competencias para Educación Infantil, Primaria y Secundaria según los currículos oficiales.

### 🌟 Características Principales

- **🔐 Autenticación Multi-Rol**: Sistema seguro con 4 tipos de usuario (Admin, Profesor, Estudiante, Familia)
- **📊 Evaluación por Competencias**: Evaluación visual tipo "diana" según normativa educativa
- **🎯 Dashboards Personalizados**: Interfaces específicas para cada rol de usuario
- **📱 Responsive Design**: Funciona perfectamente en dispositivos móviles y tablets
- **🔄 Tiempo Real**: Actualizaciones en vivo con WebSockets
- **📈 Informes Automáticos**: Generación de boletines y expedientes académicos
- **🐳 Docker Ready**: Instalación en un solo comando
- **🔒 Seguridad Avanzada**: JWT, HTTPS, validaciones, y backups automáticos

## 🚀 Instalación Rápida

### Prerrequisitos

- **Docker** y **Docker Compose**
- **Git**
- **Dominio** (opcional, para SSL)

### Instalación Automática

```bash
# Clonar el repositorio
git clone https://github.com/your-org/mw-panel.git
cd mw-panel

# Ejecutar instalación automática (requiere sudo)
sudo ./install.sh
```

### Instalación Manual

```bash
# 1. Configurar variables de entorno
cp .env.example .env
nano .env  # Editar configuración

# 2. Construir e iniciar servicios
docker-compose build
docker-compose up -d

# 3. Ejecutar migraciones y seeds
docker-compose exec backend npm run migration:run
docker-compose exec backend npm run seed:run
```

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Frontend    │    │     Backend     │    │    Database     │
│   React + Vite  │◄──►│  NestJS + JWT   │◄──►│  PostgreSQL 15  │
│   TypeScript    │    │   TypeScript    │    │      Redis      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Nginx      │    │   WebSockets    │    │     Backups     │
│  Reverse Proxy  │    │   Socket.io     │    │   Automáticos   │
│      SSL        │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 👥 Roles y Funcionalidades

### 🔴 Administrador
- ✅ Gestión completa de usuarios (CRUD)
- ✅ Configuración de competencias por nivel educativo
- ✅ Gestión de períodos de evaluación
- ✅ Generación de informes globales
- ✅ Configuración del sistema
- ✅ Auditoría y logs

### 🔵 Profesor
- ✅ Gestión de clases asignadas
- ✅ Evaluación por competencias con diana visual
- ✅ Creación de observaciones personalizadas
- ✅ Generación de informes de clase
- ✅ Comunicación con familias
- ✅ Seguimiento del progreso estudiantil

### 🟢 Estudiante
- ✅ Consulta de calificaciones y progreso
- ✅ Visualización de competencias (diana)
- ✅ Acceso al expediente académico
- ✅ Calendario de evaluaciones
- ✅ Recursos educativos

### 🟡 Familia
- ✅ Seguimiento de múltiples hijos
- ✅ Consulta de evaluaciones y competencias
- ✅ Descarga de boletines en PDF
- ✅ Comunicación con tutores
- ✅ Justificación de ausencias
- ✅ Calendario escolar

## 📊 Sistema de Evaluación por Competencias

### Niveles Educativos Soportados

#### 🎨 Educación Infantil
- **8 Competencias Clave** según normativa
- **3 Áreas Curriculares**:
  - Crecimiento en Armonía
  - Descubrimiento y Exploración del Entorno
  - Comunicación y Representación de la Realidad

#### 📚 Educación Primaria
- **8 Competencias Clave**
- **Áreas por ciclos** (1º, 2º, 3º ciclo)
- **Evaluación trimestral y anual**

#### 🎓 Educación Secundaria
- **8 Competencias Clave**
- **Materias específicas** por curso
- **Evaluación continua y extraordinaria**

### 🎯 Visualización Diana (Radar Chart)

```javascript
// Ejemplo de datos de competencias
{
  competencies: [
    { name: "Competencia Matemática", score: 8.5, maxScore: 10 },
    { name: "Competencia Lingüística", score: 9.0, maxScore: 10 },
    { name: "Competencia Digital", score: 7.8, maxScore: 10 },
    // ...
  ]
}
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **NestJS** - Framework Node.js escalable
- **TypeScript** - Tipado estático
- **PostgreSQL** - Base de datos relacional
- **Redis** - Cache y sesiones
- **JWT** - Autenticación segura
- **Socket.io** - WebSockets
- **TypeORM** - ORM para TypeScript

### Frontend
- **React 18** - Librería UI moderna
- **Vite** - Build tool rápido
- **TypeScript** - Tipado estático
- **Ant Design** - Componentes UI profesionales
- **TailwindCSS** - Estilos utilitarios
- **Zustand** - Gestión de estado
- **React Query** - Cache y sincronización
- **Recharts** - Gráficos y visualizaciones

### DevOps & Infraestructura
- **Docker & Docker Compose** - Contenedores
- **Nginx** - Proxy inverso y SSL
- **Let's Encrypt** - Certificados SSL gratuitos
- **Cron Jobs** - Backups automáticos

## 📱 Capturas de Pantalla

<div align="center">

### Login Screen
![Login](https://via.placeholder.com/800x500/f8fafc/64748b?text=Pantalla+de+Login)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/800x500/dbeafe/1e40af?text=Panel+de+Administración)

### Teacher Evaluation
![Teacher Evaluation](https://via.placeholder.com/800x500/dcfce7/15803d?text=Evaluación+por+Competencias)

### Student Progress
![Student Progress](https://via.placeholder.com/800x500/fef3c7/a16207?text=Progreso+del+Estudiante)

</div>

## 🔧 Configuración Avanzada

### Variables de Entorno Principales

```env
# Aplicación
NODE_ENV=production
DOMAIN=panel.tuescuela.com
SSL_EMAIL=admin@tuescuela.com

# Base de Datos
DB_NAME=mwpanel
DB_USER=mwpanel
DB_PASSWORD=tu-password-seguro

# JWT
JWT_SECRET=tu-jwt-secret-muy-seguro
JWT_REFRESH_SECRET=tu-refresh-secret-muy-seguro

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@tuescuela.com
SMTP_PASS=tu-password-email
```

### Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Backup manual de la base de datos
./scripts/backup.sh

# Restaurar backup
./scripts/restore.sh backup_file.sql.gz

# Acceder al contenedor backend
docker-compose exec backend bash

# Ejecutar migraciones
docker-compose exec backend npm run migration:run

# Resetear datos de prueba
docker-compose exec backend npm run seed:run
```

## 📚 API Documentation

Una vez instalado, la documentación completa de la API estará disponible en:
- **Desarrollo**: http://localhost:3000/api/docs
- **Producción**: https://tu-dominio.com/api/docs

### Endpoints Principales

```bash
# Autenticación
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/me

# Usuarios
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

# Estudiantes
GET    /api/students
POST   /api/students
GET    /api/students/:id/evaluations

# Evaluaciones
GET    /api/evaluations
POST   /api/evaluations
PUT    /api/evaluations/:id
GET    /api/evaluations/:id/radar

# Competencias
GET    /api/competencies
POST   /api/competencies
GET    /api/competencies/by-level/:levelId
```

## 🔐 Seguridad

### Medidas Implementadas

- ✅ **Autenticación JWT** con refresh tokens
- ✅ **HTTPS obligatorio** en producción
- ✅ **Validación de datos** en frontend y backend
- ✅ **Rate limiting** para APIs
- ✅ **Headers de seguridad** con Helmet
- ✅ **Sanitización de inputs**
- ✅ **Logs de auditoría**
- ✅ **Backups automáticos cifrados**

### Usuarios de Prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@mwpanel.com | Admin123! |
| Profesor | profesor@mwpanel.com | Profesor123! |
| Estudiante | estudiante@mwpanel.com | Estudiante123! |
| Familia | familia@mwpanel.com | Familia123! |

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📋 Roadmap

### v2.1 (Q2 2024)
- [ ] Módulo de comunicaciones avanzado
- [ ] Integración con calendarios externos
- [ ] App móvil nativa
- [ ] Informes avanzados con BI

### v2.2 (Q3 2024)
- [ ] Integración con sistemas externos (LDAP, Google Workspace)
- [ ] Módulo de biblioteca digital
- [ ] Sistema de tareas y deberes
- [ ] Gamificación del aprendizaje

### v2.3 (Q4 2024)
- [ ] IA para recomendaciones pedagógicas
- [ ] Análisis predictivo de rendimiento
- [ ] Portfolio digital del estudiante
- [ ] Evaluación entre pares

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 🆘 Soporte

- 📧 **Email**: soporte@mwpanel.com
- 📞 **Teléfono**: +34 900 123 456
- 💬 **Chat**: [Discord Community](https://discord.gg/mwpanel)
- 📖 **Documentación**: [docs.mwpanel.com](https://docs.mwpanel.com)

## 👏 Agradecimientos

- Ministerio de Educación y Formación Profesional de España
- Comunidades Autónomas por los currículos oficiales
- Comunidad open source de React, NestJS y PostgreSQL
- Todos los educadores que hacen posible este proyecto

---

<div align="center">

**[⬆️ Volver al inicio](#mw-panel-20---sistema-de-gestión-escolar)**

Hecho con ❤️ por el equipo de MW Panel

</div>