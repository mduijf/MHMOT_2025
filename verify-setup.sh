#!/bin/bash

# Verificatie script voor Met het Mes op Tafel
# Dit script controleert of alle dependencies correct zijn geïnstalleerd

echo "🔍 Met het Mes op Tafel - Setup Verificatie"
echo "==========================================="
echo ""

# Kleur codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} $NODE_VERSION"
else
    echo -e "${RED}✗ Niet gevonden${NC}"
    echo "  → Installeer Node.js van https://nodejs.org/"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} v$NPM_VERSION"
else
    echo -e "${RED}✗ Niet gevonden${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check Rust
echo -n "Checking Rust... "
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version)
    echo -e "${GREEN}✓${NC} $RUST_VERSION"
else
    echo -e "${RED}✗ Niet gevonden${NC}"
    echo "  → Installeer Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    ERRORS=$((ERRORS + 1))
fi

# Check Cargo
echo -n "Checking Cargo... "
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version)
    echo -e "${GREEN}✓${NC} $CARGO_VERSION"
else
    echo -e "${RED}✗ Niet gevonden${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check if node_modules exists
echo -n "Checking npm packages... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Geïnstalleerd"
else
    echo -e "${YELLOW}⚠${NC}  Nog niet geïnstalleerd"
    echo "  → Run: npm install"
fi

# Check platform-specific dependencies
echo ""
echo "Platform: $(uname -s)"
case "$(uname -s)" in
    Darwin)
        echo -n "Checking Xcode Command Line Tools... "
        if xcode-select -p &> /dev/null; then
            echo -e "${GREEN}✓${NC} Geïnstalleerd"
        else
            echo -e "${RED}✗ Niet gevonden${NC}"
            echo "  → Run: xcode-select --install"
            ERRORS=$((ERRORS + 1))
        fi
        ;;
    Linux)
        echo -n "Checking webkit2gtk... "
        if pkg-config --exists webkit2gtk-4.1; then
            echo -e "${GREEN}✓${NC} Geïnstalleerd"
        else
            echo -e "${RED}✗ Niet gevonden${NC}"
            echo "  → Run: sudo apt install libwebkit2gtk-4.1-dev"
            ERRORS=$((ERRORS + 1))
        fi
        ;;
    MINGW*|MSYS*|CYGWIN*)
        echo "Windows platform gedetecteerd"
        echo "Zorg ervoor dat Microsoft Visual C++ Build Tools geïnstalleerd is"
        ;;
esac

echo ""
echo "==========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Alle dependencies zijn correct geïnstalleerd!${NC}"
    echo ""
    echo "Volgende stappen:"
    echo "  1. npm install           # Als je dit nog niet hebt gedaan"
    echo "  2. npm run tauri:dev     # Start de applicatie"
    echo ""
else
    echo -e "${RED}✗ $ERRORS problemen gevonden${NC}"
    echo ""
    echo "Los de bovenstaande problemen op en run dit script opnieuw."
    echo ""
fi

