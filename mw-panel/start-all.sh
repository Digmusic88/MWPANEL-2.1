#!/bin/bash

# =============================================================================
# MW PANEL 2.0 - SCRIPT DE INICIO COMPLETO
# =============================================================================
# Este script inicia todo el sistema: PostgreSQL + Redis + Backend + Frontend
# y ejecuta las semillas de datos automáticamente
# =============================================================================

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar banner
show_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                    MW PANEL 2.0                          ║"
    echo "║              INICIO COMPLETO DEL SISTEMA                 ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Función para mostrar mensajes con formato
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${CYAN}🚀 $1${NC}"
}

# Función para verificar si Docker está corriendo
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker no está corriendo. Por favor inicia Docker Desktop."
        exit 1
    fi
    log_success "Docker está corriendo"
}

# Función para verificar archivos necesarios
check_files() {
    if [ ! -f "docker-compose.yml" ]; then
        log_error "No se encontró docker-compose.yml en el directorio actual"
        exit 1
    fi
    
    if [ ! -f ".env" ]; then
        log_warning "No se encontró .env, usando valores por defecto"
    fi
    
    log_success "Archivos de configuración encontrados"
}

# Función para limpiar containers anteriores si es necesario
cleanup_if_needed() {
    if [ "$1" = "--clean" ]; then
        log_step "Limpiando containers anteriores..."
        docker-compose down -v --remove-orphans 2>/dev/null || true
        log_success "Limpieza completada"
    fi
}

# Función para esperar que un servicio esté listo
wait_for_service() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    log_info "Esperando que $service esté listo..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T $service echo "ready" > /dev/null 2>&1; then
            log_success "$service está listo"
            return 0
        fi
        
        echo -ne "${YELLOW}Intento $attempt/$max_attempts...${NC}\r"
        sleep 2
        ((attempt++))
    done
    
    log_error "$service no está respondiendo después de $max_attempts intentos"
    return 1
}

# Función para verificar salud de PostgreSQL
wait_for_postgres() {
    local max_attempts=30
    local attempt=1
    
    log_info "Verificando conexión a PostgreSQL..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T postgres pg_isready -U mwpanel > /dev/null 2>&1; then
            log_success "PostgreSQL está listo y aceptando conexiones"
            return 0
        fi
        
        echo -ne "${YELLOW}Verificando PostgreSQL... $attempt/$max_attempts${NC}\r"
        sleep 2
        ((attempt++))
    done
    
    log_error "PostgreSQL no está respondiendo"
    return 1
}

# Función para verificar salud de Redis
wait_for_redis() {
    local max_attempts=15
    local attempt=1
    
    log_info "Verificando conexión a Redis..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
            log_success "Redis está listo y respondiendo"
            return 0
        fi
        
        echo -ne "${YELLOW}Verificando Redis... $attempt/$max_attempts${NC}\r"
        sleep 2
        ((attempt++))
    done
    
    log_error "Redis no está respondiendo"
    return 1
}

# Función para ejecutar semillas
run_seeds() {
    log_step "Ejecutando semillas de la base de datos..."
    
    if docker-compose exec backend npm run seed; then
        log_success "Semillas ejecutadas exitosamente"
        echo ""
        log_info "Usuarios de prueba creados:"
        echo -e "  ${GREEN}👨‍💼 Admin:${NC} admin@mwpanel.com / Admin123!"
        echo -e "  ${GREEN}👨‍🏫 Profesor:${NC} profesor@mwpanel.com / Profesor123!"
        echo -e "  ${GREEN}👨‍🎓 Estudiante:${NC} estudiante@mwpanel.com / Estudiante123!"
        echo -e "  ${GREEN}👨‍👩‍👧‍👦 Familia:${NC} familia@mwpanel.com / Familia123!"
    else
        log_error "Error ejecutando las semillas"
        return 1
    fi
}

# Función para mostrar estado de servicios
show_services_status() {
    echo ""
    log_step "Estado de los servicios:"
    echo ""
    docker-compose ps
    echo ""
    
    log_info "URLs de acceso:"
    echo -e "  ${CYAN}🌐 Frontend:${NC} http://localhost:5173"
    echo -e "  ${CYAN}⚙️  Backend API:${NC} http://localhost:3000"
    echo -e "  ${CYAN}📊 API Docs:${NC} http://localhost:3000/api"
    echo -e "  ${CYAN}🗄️  PostgreSQL:${NC} localhost:5432"
    echo -e "  ${CYAN}🔴 Redis:${NC} localhost:6379"
}

# Función principal
main() {
    show_banner
    
    # Verificaciones previas
    log_step "Verificando requisitos..."
    check_docker
    check_files
    
    # Limpiar si se solicita
    cleanup_if_needed $1
    
    # Iniciar servicios
    log_step "Iniciando servicios con Docker Compose..."
    if docker-compose up -d; then
        log_success "Servicios iniciados"
    else
        log_error "Error iniciando servicios"
        exit 1
    fi
    
    # Esperar a que las bases de datos estén listas
    wait_for_postgres || exit 1
    wait_for_redis || exit 1
    
    # Esperar a que el backend esté listo
    log_info "Esperando que el backend esté listo..."
    sleep 10
    
    # Ejecutar semillas
    run_seeds || exit 1
    
    # Mostrar estado final
    show_services_status
    
    echo ""
    log_success "🎉 ¡Sistema MW Panel 2.0 iniciado completamente!"
    log_info "El sistema está listo para usar. ¡Disfruta desarrollando!"
    echo ""
}

# Función para mostrar ayuda
show_help() {
    echo "MW Panel 2.0 - Script de Inicio Completo"
    echo ""
    echo "Uso:"
    echo "  ./start-all.sh          # Inicio normal"
    echo "  ./start-all.sh --clean  # Limpia containers antes de iniciar"
    echo "  ./start-all.sh --help   # Muestra esta ayuda"
    echo ""
    echo "Este script:"
    echo "  ✅ Verifica Docker"
    echo "  ✅ Inicia PostgreSQL + Redis"
    echo "  ✅ Inicia Backend + Frontend"
    echo "  ✅ Ejecuta semillas de datos"
    echo "  ✅ Muestra URLs de acceso"
}

# Manejo de argumentos
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    *)
        main $1
        ;;
esac