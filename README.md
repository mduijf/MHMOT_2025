# Met het Mes op Tafel - Desktop Applicatie

Een Nederlandse kennisquiz desktop applicatie gecombineerd met poker-elementen, gebaseerd op het populaire TV-programma.

## 📋 Over het Spel

**Met het Mes op Tafel** is een spannende combinatie van algemene kennis en strategisch bluffen. Drie spelers beginnen met €750 en doorlopen 7 rondes waarin ze vragen beantwoorden en strategisch inzetten op hun antwoorden.

### Spelregels

- **3 spelers** per spel
- Elke speler begint met **€750**
- **7 rondes** met elk **4 vragen**
- Verplichte begininzet per ronde: 10, 20, 40, en daarna telkens 80 euro
- Inzetten tussen **€10 en €50**
- **Twee inzetrondes**: voor en na het zien van antwoorden
- Winnaar per ronde wint de volledige pot

## 🚀 Technische Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Rust met Tauri framework
- **Database**: SQLite (inclusief 30+ voorbeeldvragen)
- **Platform**: Cross-platform desktop (Windows, macOS, Linux)

## 📦 Installatie

### Vereisten

1. **Node.js** (v18 of hoger)
2. **Rust** (installeer via https://rustup.rs/)
3. **Platform-specifieke dependencies**:
   - **macOS**: Xcode Command Line Tools
   - **Windows**: Microsoft Visual C++ Build Tools
   - **Linux**: webkit2gtk-4.1, build-essential

### Setup

```bash
# Installeer dependencies
npm install

# Start development server
npm run tauri:dev

# Build productie versie
npm run tauri:build
```

## 🎮 Functionaliteiten

### Geïmplementeerde Features

✅ **Spelopzet**
- Invoer van 3 spelersnamen
- Automatische initialisatie met €750 per speler
- Moderne, Nederlandse UI

✅ **Spelmechanismen**
- 7 rondes met elk 4 vragen
- Twee inzetrondes per ronde
- Automatische winnaarsbepaling
- Real-time saldo tracking

✅ **Vraagdatabase**
- SQLite database met 30+ voorbeeldvragen
- Categorieën: Aardrijkskunde, Geschiedenis, Sport, Muziek, Televisie, Film, Wetenschap, Algemeen
- Willekeurige vraagkeuze per ronde

✅ **Inzetsysteem**
- Verplichte inzetten per ronde
- Vrijwillige inzetten (€10-€50)
- Pas-functionaliteit
- Visuele feedback van inzetten

✅ **UI/UX**
- Nederlandse styling met oranje accenten
- Responsive design
- Real-time spelstatus updates
- Eindstand met winnaar

## 📁 Projectstructuur

```
met-het-mes-op-tafel/
├── src/                      # Frontend React code
│   ├── components/           # React componenten
│   │   ├── GameSetup.tsx    # Spelopzet scherm
│   │   ├── GameTable.tsx    # Hoofd speltafel
│   │   ├── PlayerPanel.tsx  # Speler informatie
│   │   ├── QuestionDisplay.tsx  # Vragen weergave
│   │   └── BettingControls.tsx  # Inzetopties
│   ├── hooks/
│   │   └── useGame.ts       # Game state management
│   ├── types/
│   │   └── game.ts          # TypeScript types
│   └── App.tsx              # Hoofd app component
│
├── src-tauri/               # Rust backend code
│   ├── src/
│   │   ├── game/            # Game logic modules
│   │   │   ├── player.rs    # Speler logica
│   │   │   ├── round.rs     # Ronde management
│   │   │   ├── questions.rs # Vraag types
│   │   │   └── state.rs     # Game state
│   │   ├── database.rs      # SQLite integratie
│   │   ├── commands.rs      # Tauri commands
│   │   └── lib.rs           # Hoofd library
│   └── Cargo.toml           # Rust dependencies
│
├── package.json
└── README.md
```

## 🎯 Tauri Commands (API)

De frontend communiceert met de Rust backend via de volgende commands:

- `start_new_game(player_names: Vec<String>)` - Start nieuw spel
- `get_game_state()` - Haal huidige spelstatus op
- `submit_answers(player_id: String, answers: Vec<String>)` - Dien antwoorden in
- `place_bet(player_id: String, amount: i32)` - Plaats inzet
- `player_fold(player_id: String)` - Pas
- `advance_phase()` - Ga naar volgende fase
- `complete_round()` - Rond huidige ronde af
- `start_next_round()` - Start volgende ronde
- `save_game()` - Sla spel op

## 🎨 Design Principes

- **Nederlandse stijl**: Oranje accenten (#ff6b35) en Nederlandse typografie
- **TV-esthetiek**: Geïnspireerd op het originele TV-programma
- **Intuïtieve bediening**: Duidelijke knoppen en feedback
- **Responsive**: Werkt op verschillende schermformaten

## 📊 Database Schema

### Questions Table
```sql
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    question TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    difficulty INTEGER NOT NULL,
    round_type INTEGER NOT NULL
);
```

### Game Sessions Table
```sql
CREATE TABLE game_sessions (
    id TEXT PRIMARY KEY,
    players TEXT NOT NULL,
    current_round INTEGER NOT NULL,
    game_state TEXT NOT NULL,
    created_at TEXT NOT NULL
);
```

## 🔧 Development

### Hot Reload Development

```bash
npm run tauri:dev
```

Dit start zowel de Vite development server als de Tauri app met hot reload.

### Building

```bash
npm run tauri:build
```

Genereert platform-specifieke binaries in `src-tauri/target/release/bundle/`.

## 📝 TODO / Toekomstige Features

- [ ] Quizmaster modus met aparte interface
- [ ] Meer vraagcategorieën en grotere vraagdatabase
- [ ] Statistieken en geschiedenis van gespeelde spellen
- [ ] Customizable spelregels (startbedrag, aantal rondes)
- [ ] Multiplayer over netwerk
- [ ] Audio effecten en achtergrondmuziek
- [ ] Animaties voor winnaar bepaling
- [ ] Import/export van eigen vragen
- [ ] Dark mode

## 🤝 Bijdragen

Dit is een private project voor Yellowspot BV. Neem contact op voor vragen of suggesties.

## 📄 Licentie

Copyright © 2025 Yellowspot BV. Alle rechten voorbehouden.

## 🙏 Credits

Gebaseerd op het TV-programma "Met het Mes op Tafel" van MAX/NPO.

---

**Ontwikkeld met ❤️ door Yellowspot BV**
