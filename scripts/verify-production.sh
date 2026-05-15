#!/bin/bash

# ===========================================
# Tinkuy - Production Verification Script
# ===========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
BACKEND_URL="${BACKEND_URL:-https://api.tinkuy.com.ar}"
FRONTEND_URL="${FRONTEND_URL:-https://tinkuy.com.ar}"
TIMEOUT=15
FAILURES=0

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILURES++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

check_http() {
    local url=$1
    local name=$2
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
    if [ "$response" = "200" ]; then
        print_success "$name - HTTP $response"
        return 0
    else
        print_error "$name - HTTP $response"
        return 1
    fi
}

# ===========================================
# VERIFICATION START
# ===========================================

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║       Tinkuy - Production Verification             ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo "Timeout:  ${TIMEOUT}s"
echo ""

# ===========================================
# 1. BACKEND HEALTH CHECK
# ===========================================

print_header "1. BACKEND HEALTH CHECK"

health_response=$(curl -s --max-time $TIMEOUT "$BACKEND_URL/health" 2>/dev/null)
health_status=$?

if [ $health_status -ne 0 ]; then
    print_error "Backend no responde"
    print_info "Verificar que el backend esté desplegado y el dominio apunte correctamente"
else
    if echo "$health_response" | grep -q '"status":"ok"'; then
        print_success "Backend /health - OK"

        if echo "$health_response" | grep -q '"database":"connected"'; then
            print_success "Database - Connected"
        else
            print_error "Database - No conectada"
        fi

        if echo "$health_response" | grep -q '"redis":"connected"'; then
            print_success "Redis - Connected"
        else
            print_warning "Redis - No conectada (verificar si es requerido)"
        fi
    else
        print_error "/health response inesperada"
        echo "  Response: $health_response"
    fi
fi

# ===========================================
# 2. FRONTEND CHECK
# ===========================================

print_header "2. FRONTEND CHECK"

check_http "$FRONTEND_URL" "Frontend homepage"

if [ $health_status -eq 0 ]; then
    html_response=$(curl -s --max-time $TIMEOUT "$FRONTEND_URL" 2>/dev/null)
    if echo "$html_response" | grep -q 'html\|<!DOCTYPE\|<html'; then
        print_success "Frontend - HTML válido"
    else
        print_warning "Frontend - No se pudo verificar HTML"
    fi
fi

# ===========================================
# 3. SSL CHECK
# ===========================================

print_header "3. SSL CERTIFICATE"

ssl_info=$(echo | openssl s_client -connect "${BACKEND_URL#https://}:443" -servername "${BACKEND_URL#https://}" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)

if [ -n "$ssl_info" ]; then
    not_after=$(echo "$ssl_info" | grep 'notAfter' | cut -d= -f2)
    print_success "SSL - Certificado válido"
    print_info "Expira: $not_after"

    expires_epoch=$(date -d "$not_after" +%s 2>/dev/null || date -j -f "%b %d %H:%M:%S %Y %Z" "$not_after" +%s 2>/dev/null)
    now_epoch=$(date +%s)
    days_until=$(( (expires_epoch - now_epoch) / 86400 ))

    if [ $days_until -lt 30 ]; then
        print_warning "SSL expira en $days_until días - renovar pronto"
    elif [ $days_until -lt 0 ]; then
        print_error "SSL EXPIRADO"
    else
        print_success "SSL - $days_until días hasta expiración"
    fi
else
    print_error "SSL - No se pudo verificar certificado"
fi

# Frontend SSL
frontend_ssl=$(echo | openssl s_client -connect "${FRONTEND_URL#https://}:443" -servername "${FRONTEND_URL#https://}" 2>/dev/null | openssl x509 -no_out -dates 2>/dev/null)
if [ -n "$frontend_ssl" ]; then
    print_success "Frontend SSL - Válido"
else
    print_error "Frontend SSL - Problemas detectados"
fi

# ===========================================
# 4. GRAPHQL CHECK
# ===========================================

print_header "4. GRAPHQL ENDPOINT"

graphql_response=$(curl -s -X POST \
    --max-time $TIMEOUT \
    -H "Content-Type: application/json" \
    -d '{"query":"{ __typename }"}' \
    "$BACKEND_URL/graphql" 2>/dev/null)

if echo "$graphql_response" | grep -q '"data"'; then
    print_success "/graphql - Respondiendo correctamente"

    mutation_test=$(curl -s -X POST \
        --max-time $TIMEOUT \
        -H "Content-Type: application/json" \
        -d '{"query":"mutation { __typename }"}' \
        "$BACKEND_URL/graphql" 2>/dev/null)

    if echo "$mutation_test" | grep -q '__typename'; then
        print_success "GraphQL - Queries y Mutations funcionan"
    fi
elif echo "$graphql_response" | grep -q '"errors"'; then
    if echo "$graphql_response" | grep -qi 'introspection'; then
        print_warning "Introspección deshabilitada (ok en producción)"
        print_success "/graphql - Endpoint respondiendo"
    else
        print_warning "/graphql - Responde con errores"
        echo "  $graphql_response"
    fi
else
    print_error "/graphql - No responde correctamente"
    echo "  Response: $graphql_response"
fi

# ===========================================
# 5. KEY ENDPOINTS
# ===========================================

print_header "5. KEY ENDPOINTS"

endpoints=(
    "/admin:Admin panel"
)

for entry in "${endpoints[@]}"; do
    endpoint="${entry%%:*}"
    name="${entry##*:}"
    check_http "$FRONTEND_URL$endpoint" "$name"
done

# ===========================================
# 6. DNS CHECK
# ===========================================

print_header "6. DNS CHECK"

backend_dns=$(dig +short "${BACKEND_URL#https://}" 2>/dev/null | tail -1 || host "${BACKEND_URL#https://}" 2>/dev/null | tail -1 || echo "")
frontend_dns=$(dig +short "${FRONTEND_URL#https://}" 2>/dev/null | tail -1 || host "${FRONTEND_URL#https://}" 2>/dev/null | tail -1 || echo "")

if [ -n "$backend_dns" ]; then
    print_success "Backend DNS resuelto: $backend_dns"
else
    print_warning "Backend DNS - No se pudo verificar"
fi

if [ -n "$frontend_dns" ]; then
    print_success "Frontend DNS resuelto: $frontend_dns"
else
    print_warning "Frontend DNS - No se pudo verificar"
fi

# ===========================================
# SUMMARY
# ===========================================

print_header "VERIFICATION SUMMARY"

echo ""
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   ALL CHECKS PASSED ✓${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
    echo ""
    echo "Producción verificada correctamente"
    echo ""
    echo "Recordar:"
    echo "  • Verificar emails en spam"
    echo "  • Hacer primera compra test (\$1 peso real)"
    echo "  • Revisar Sentry por errores"
    echo "  • Configurar UptimeRobot si no está"
    echo ""
    exit 0
else
    echo -e "${RED}═══════════════════════════════════════════════════${NC}"
    echo -e "${RED}   $FAILURES CHECK(S) FAILED${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════${NC}"
    echo ""
    echo "Revisar errores arriba antes de proceder"
    echo ""
    exit 1
fi
