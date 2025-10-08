# Quick Start Guide - Met het Mes op Tafel

## 🚀 Snel aan de slag

### Stap 1: Installeer Dependencies

#### 1.1 Installeer Rust (verplicht voor Tauri)

**macOS en Linux:**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Windows:**
Download en installeer van: https://rustup.rs/

Verifieer de installatie:
```bash
rustc --version
cargo --version
```

#### 1.2 Installeer Node.js

Download Node.js v18 of hoger van: https://nodejs.org/

Verifieer:
```bash
node --version
npm --version
```

#### 1.3 Platform-specifieke dependencies

**macOS:**
```bash
xcode-select --install
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

**Windows:**
Installeer Microsoft Visual C++ Build Tools van:
https://visualstudio.microsoft.com/visual-cpp-build-tools/

### Stap 2: Installeer Project Dependencies

```bash
cd "/Users/martijnduijf/Yellowspot BV Dropbox/Martijn Duijf/Yellowspot/Yellowspot Werkmap Actuele Projecten/Mes op Tafel/Ontwikkeling/MHMOT 2025"

# Installeer npm packages
npm install
```

### Stap 3: Start de Applicatie

**Development mode (met hot reload):**
```bash
npm run tauri:dev
```

Dit zal:
1. De Vite development server starten (frontend)
2. De Rust backend compileren
3. De Tauri applicatie openen
4. Automatisch herladen bij code wijzigingen

**Productie build:**
```bash
npm run tauri:build
```

De gebouwde applicatie staat in:
- **macOS**: `src-tauri/target/release/bundle/dmg/`
- **Windows**: `src-tauri/target/release/bundle/msi/`
- **Linux**: `src-tauri/target/release/bundle/deb/` of `appimage/`

## 🎮 Hoe te spelen

1. **Start het spel**
   - Vul 3 spelersnamen in
   - Klik op "Start Spel"

2. **Beantwoord vragen**
   - Elke ronde heeft 4 vragen
   - Type je antwoorden in de tekstvelden
   - Klik "Antwoorden Indienen"

3. **Inzetten**
   - **Eerste inzetronde**: Zet in op basis van je vertrouwen in je antwoorden
   - **Antwoorden bekijken**: Zie alle antwoorden en correcte oplossingen
   - **Tweede inzetronde**: Nog een kans om in te zetten of te passen
   - Inzetten tussen €10 en €50
   - Of klik "Passen" om uit de ronde te gaan

4. **Winnaar**
   - Speler met meeste goede antwoorden wint de pot
   - Na 7 rondes: Speler met hoogste saldo wint!

## 🔧 Troubleshooting

### Rust niet gevonden
```bash
# Controleer of Rust in PATH staat
echo $PATH | grep cargo

# Herstart terminal of run:
source $HOME/.cargo/env
```

### Port 1420 al in gebruik
```bash
# Kill het proces op poort 1420
lsof -ti:1420 | xargs kill -9

# Of start opnieuw
npm run tauri:dev
```

### Compilation errors
```bash
# Clean build
cd src-tauri
cargo clean
cd ..
npm run tauri:dev
```

### Database errors
```bash
# Verwijder oude database
rm mhmot.db
rm -rf src-tauri/target

# Herstart
npm run tauri:dev
```

## 📝 Development Tips

### Hot Reload
Bij wijzigingen in:
- **Frontend (src/)**: Automatisch reload
- **Backend (src-tauri/src/)**: Automatische recompile + restart

### Debugging

**Rust logs bekijken:**
```bash
# In src-tauri/src/commands.rs, voeg toe:
println!("Debug: {:#?}", game_state);
```

**Browser DevTools:**
- Rechtermuisklik in de app → "Inspect Element"
- Console logs van de frontend

**Rust backtrace:**
```bash
RUST_BACKTRACE=1 npm run tauri:dev
```

### Database inspecteren
```bash
# Installeer sqlite3
brew install sqlite3  # macOS
sudo apt install sqlite3  # Ubuntu

# Open database
sqlite3 mhmot.db
.tables
SELECT * FROM questions;
.quit
```

## 🎨 Customization

### Eigen vragen toevoegen

Edit `src-tauri/src/database.rs`, voeg toe aan `insert_sample_questions()`:

```rust
("Categorie", "Wat is je vraag?", "Antwoord", 1, 1),
```

Parameters:
- Categorie: Een van de 10 categorieën
- Vraag: De vraag tekst
- Antwoord: Het correcte antwoord
- Difficulty: 1 (makkelijk) tot 3 (moeilijk)
- Round type: 1-3 (vroege, midden, late rondes)

### Kleuren aanpassen

Edit `src/App.css` en component CSS files:
```css
/* Primaire kleur */
--primary-color: #ff6b35;

/* Achtergrond */
background: linear-gradient(135deg, #ff6b35 0%, #ff8e53 100%);
```

### Spelregels aanpassen

Edit `src-tauri/src/game/player.rs`:
```rust
balance: 750, // Startbedrag
```

Edit `src-tauri/src/game/round.rs`:
```rust
let min_bet = match round_number {
    1 => 10,  // Ronde 1 inzet
    2 => 20,  // Ronde 2 inzet
    3 => 40,  // Ronde 3 inzet
    _ => 80,  // Ronde 4-7 inzet
};
```

## 📚 Meer Informatie

- **Tauri Docs**: https://tauri.app/
- **React Docs**: https://react.dev/
- **Rust Book**: https://doc.rust-lang.org/book/

## 🆘 Hulp Nodig?

Contact: Yellowspot BV

---

**Veel spelplezier! 🎉**

