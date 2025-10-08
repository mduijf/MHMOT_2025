# Windows Deployment Guide - Met het Mes op Tafel

## Overzicht
Deze handleiding beschrijft hoe je de "Met het Mes op Tafel" applicatie bouwt en installeert op Microsoft Surface tablets met Windows. De native Windows app biedt superieure pen input ondersteuning vergeleken met de browser-gebaseerde versie.

## Vereisten

### Voor het bouwen (Development Machine - Mac/PC)
- Node.js (versie 18 of hoger)
- Rust (installeer via https://rustup.rs)
- Tauri CLI

### Voor de doelmachines (Surface Tablets)
- Windows 10 of hoger
- Microsoft Surface met stylus ondersteuning

## Stap 1: Build de Windows/macOS Installer

### Optie A: GitHub Actions (Aanbevolen) ⭐

**Dit is de makkelijkste en meest betrouwbare methode!**

Zie **[README-GITHUB-RELEASE.md](README-GITHUB-RELEASE.md)** voor gedetailleerde instructies.

**Kort overzicht:**
1. Update versienummer in `src-tauri/tauri.conf.json`
2. Commit en push je changes
3. Maak een git tag: `git tag v1.0.1 && git push origin v1.0.1`
4. GitHub bouwt automatisch Windows `.msi` en macOS `.dmg` installers
5. Download de installers van de Releases pagina

**Voordelen:**
- ✅ Betrouwbaar - bouwt op echte Windows/Mac machines
- ✅ Automatisch - geen lokale setup nodig
- ✅ Meerdere platformen tegelijk
- ✅ Alle builds op één plek

### Optie B: Handmatig op Windows machine

Als je lokaal wilt bouwen op een Windows PC:

1. **Installeer vereisten op Windows:**
   - Visual Studio Build Tools: https://visualstudio.microsoft.com/downloads/
     - Selecteer "Desktop development with C++" workload
   - Rust: https://rustup.rs
   - Node.js: https://nodejs.org (versie 18 LTS of hoger)

2. **Clone en build:**
```bash
git clone [REPOSITORY_URL]
cd "MHMOT 2025"
npm install
npm run tauri:build
```

3. **Vind de installer:**
De `.msi` installer staat in: `src-tauri/target/release/bundle/msi/`

**Let op:** Dit proces duurt 10-20 minuten bij de eerste build.

## Stap 2: Installeer op Surface Tablets

### Netwerk Setup

Voor de beste ervaring hebben we een setup nodig met:
- 1 Quizmaster device (Mac/PC met de main app)
- 3 Surface tablets voor kandidaten

1. **Zorg dat alle devices op hetzelfde WiFi netwerk zitten**

2. **Noteer het IP adres van de Quizmaster machine:**
   - Mac: Systeemvoorkeuren → Netwerk
   - Windows: `ipconfig` in Command Prompt
   - Bijvoorbeeld: `192.168.1.193`

### Installatie op elke Surface Tablet

1. **Kopieer het `.msi` bestand naar de Surface tablet**
   - Via USB stick
   - Via netwerk share
   - Via cloud storage (OneDrive, etc.)

2. **Voer de installer uit:**
   - Dubbelklik op het `.msi` bestand
   - Volg de installatie wizard
   - Accepteer de security waarschuwingen indien nodig

3. **Start de applicatie:**
   - De app wordt geïnstalleerd in het Start Menu
   - Zoek naar "Met het Mes op Tafel"

## Stap 3: Configureer Kandidaat Weergaves

### Optie A: Dedicated Player URLs (aanbevolen voor tablets)

Elk tablet opent direct zijn eigen player view via de browser:

1. **Start de main app op de Quizmaster machine**

2. **Op Surface Tablet 1 (Kandidaat 1):**
   - Open Microsoft Edge
   - Navigeer naar: `http://[QUIZMASTER_IP]:1420/player1`
   - Bijvoorbeeld: `http://192.168.1.193:1420/player1`
   - Zet in fullscreen mode (F11)

3. **Op Surface Tablet 2 (Kandidaat 2):**
   - Open Microsoft Edge
   - Navigeer naar: `http://[QUIZMASTER_IP]:1420/player2`

4. **Op Surface Tablet 3 (Kandidaat 3):**
   - Open Microsoft Edge
   - Navigeer naar: `http://[QUIZMASTER_IP]:1420/player3`

### Optie B: Geïnstalleerde App met Tauri Windows

Als je de Windows app ook op de tablets installeert:

1. **Start de app op elk tablet**
2. **In de Quizmaster view:**
   - Klik op "Display Settings" tab
   - Klik op "Open Kandidaat 1 Window" voor tablet 1
   - Herhaal voor kandidaat 2 en 3

**Nadeel:** Dit vereist dat elke tablet de volledige app draait, wat meer resources gebruikt.

## Stap 4: OBS Graphics Setup

Voor live graphics output in OBS:

1. **In OBS, voeg een Browser Source toe:**
   - Naam: "MHMOT Fill Graphics"
   - URL: `http://localhost:1420/fill`
   - Width: 1920
   - Height: 1080
   - FPS: 60
   - Custom CSS: (leeg laten)
   - ✓ Refresh browser when scene becomes active

2. **Voor keying/transparantie, voeg een tweede Browser Source toe:**
   - Naam: "MHMOT Key Graphics"
   - URL: `http://localhost:1420/key`
   - Width: 1920
   - Height: 1080
   - Pas een Chroma Key filter toe (groen/zwart)

## Troubleshooting

### Pen Input werkt niet goed
- Zorg dat Windows Ink is ingeschakeld
- Update Surface firmware en drivers
- Kalibreer de stylus in Windows Settings

### Tablets kunnen niet verbinden
- Controleer firewall instellingen op de Quizmaster machine
- Zorg dat port 1420 en 3001 open staan
- Test verbinding: ping het IP adres vanaf de tablet

### App start niet op Windows
- Installeer Visual C++ Redistributables: https://aka.ms/vs/17/release/vc_redist.x64.exe
- Controleer Windows Defender of antivirus software

### Graphics updaten niet
- Ververs de browser (F5)
- Controleer of de HTTP API server draait (zie console logs)
- Controleer netwerk verbinding

## Alternatieve Setup: Volledige Native Windows App

Als de browser-based oplossing niet voldoende is, kunnen we de app verder optimaliseren:

### Toekomstige Verbetering: Native Windows Pen API

Voor optimale stylus ondersteuning kunnen we:

1. **Custom Tauri plugin maken voor Windows Ink API**
   - Directe toegang tot Windows Ink APIs
   - Lagere latency
   - Betere drukgevoeligheid
   - Vloeiendere lijnen

2. **Dedicated kandidaat applicatie:**
   - Aparte lightweight app alleen voor kandidaten
   - Optimalisatie voor touch/stylus input
   - Fullscreen kiosk mode

Dit vereist aanvullende Rust development en is een grotere investering.

## Performance Optimalisatie

### Voor beste resultaten:

1. **Sluit onnodige apps op de tablets**
2. **Zet Windows in High Performance mode**
3. **Schakel achtergrond updates uit tijdens opnames**
4. **Gebruik bekabeld netwerk indien mogelijk (USB-naar-Ethernet adapter)**

## Updates Uitrollen

Om de app te updaten op alle tablets:

1. Build een nieuwe versie (verhoog version number in `tauri.conf.json`)
2. Kopieer het nieuwe `.msi` bestand naar de tablets
3. Voer de nieuwe installer uit (oude versie wordt automatisch vervangen)

## Support

Voor technische vragen of problemen:
- Check de console logs in de browser (F12)
- Check de app logs in de Tauri console
- Documenteer exact welke stappen tot het probleem leiden

---

## Snelle Start Checklist

- [ ] Build Windows `.msi` installer
- [ ] Installeer op alle Surface tablets
- [ ] Noteer IP adres Quizmaster machine
- [ ] Configureer WiFi op alle devices (zelfde netwerk)
- [ ] Test verbinding: open `http://[IP]:1420/player1` op tablet 1
- [ ] Test stylus input op elke tablet
- [ ] Configureer OBS browser sources
- [ ] Test volledige workflow met alle kandidaten
- [ ] Maak backup van working configuration

## Licentie & Productie

Voor productie gebruik:
- Overweeg code signing certificate voor de Windows installer
- Test grondig op alle doelmachines
- Maak een recovery/reset procedure voor tijdens opnames
- Documenteer troubleshooting stappen voor de crew
