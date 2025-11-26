#!/bin/bash

# Script di setup per sviluppo BugSense
# Automatizza il setup iniziale del progetto

set -e

echo "🚀 BugSense Development Setup"
echo "================================"
echo ""

# Colori per output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funzione per stampare messaggi colorati
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check Node.js
echo "Verifico Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installato: $NODE_VERSION"
else
    print_error "Node.js non trovato. Installa Node.js 18+ prima di continuare."
    exit 1
fi

# Check PostgreSQL
echo ""
echo "Verifico PostgreSQL..."
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version)
    print_success "PostgreSQL installato: $PG_VERSION"
else
    print_warning "PostgreSQL non trovato. Assicurati di averlo installato."
fi

# Install dependencies
echo ""
echo "Installo dipendenze npm..."
npm install
print_success "Dipendenze installate"

# Check .env file
echo ""
if [ ! -f .env ]; then
    echo "Creo file .env da .env.example..."
    cp .env.example .env
    print_warning "File .env creato. IMPORTANTE: Configura le variabili d'ambiente!"
    echo ""
    echo "Devi configurare:"
    echo "  - DATABASE_URL (connessione PostgreSQL)"
    echo "  - NEXTAUTH_SECRET (genera con: openssl rand -base64 32)"
    echo "  - GITHUB_ID e GITHUB_SECRET (da GitHub OAuth App)"
    echo ""
else
    print_success "File .env già presente"
fi

# Check if database exists
echo ""
echo "Verifico database..."
DB_NAME="bugsense"

if command -v psql &> /dev/null; then
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        print_success "Database '$DB_NAME' esiste"
    else
        print_warning "Database '$DB_NAME' non trovato"
        read -p "Vuoi creare il database ora? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            createdb -U postgres $DB_NAME
            print_success "Database '$DB_NAME' creato"
        fi
    fi
fi

# Generate Prisma Client
echo ""
echo "Genero Prisma Client..."
npm run db:generate
print_success "Prisma Client generato"

# Setup database schema
echo ""
read -p "Vuoi sincronizzare lo schema del database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:push
    print_success "Schema database sincronizzato"
fi

echo ""
echo "================================"
echo -e "${GREEN}✓ Setup completato!${NC}"
echo ""
echo "Prossimi passi:"
echo "1. Configura il file .env con le tue credenziali"
echo "2. Crea una GitHub OAuth App su https://github.com/settings/developers"
echo "3. Esegui 'npm run dev' per avviare il server"
echo ""
echo "Per aiuto consulta: README.md e SETUP.md"
echo ""
