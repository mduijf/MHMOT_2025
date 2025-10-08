# Multi-Device Setup: Mac + Surface Tablets

Deze handleiding beschrijft hoe je "Met het Mes op Tafel" gebruikt met een Mac als quizmaster en 3 Microsoft Surface tablets voor de kandidaten.

## 🎯 Setup Overzicht

```
┌─────────────────────┐
│   Mac (Quizmaster)  │ ← Hoofdapp draait hier
│   IP: 192.168.1.X   │    - Quizmaster view
│   Port: 3001        │    - HTTP API server
└──────────┬──────────┘
           │ WiFi
           ├──────────────────┬──────────────────┐
           │                  │                  │
    ┌──────▼─────┐    ┌──────▼─────┐    ┌──────▼─────┐
    │  Surface 1 │    │  Surface 2 │    │  Surface 3 │
    │ Kandidaat 1│    │ Kandidaat 2│    │ Kandidaat 3│
    │ /player1   │    │ /player2   │    │ /player3   │
    └────────────┘    └────────────┘    └────────────┘
```

## 📋 Stap-voor-Stap Instructies

### Stap 1: Start de Quizmaster App op de Mac

1. **Open de app** op de Mac
2. **Start een nieuw spel** met 3 spelers
3. **Noteer het IP-adres van de Mac:**
   - Klik op Apple menu → Systeemvoorkeuren → Netwerk
   - Noteer het IP-adres (bijv. `192.168.1.193`)

### Stap 2: Configureer Surface Tablet 1 (Kandidaat 1)

1. **Open een browser** (Microsoft Edge of Chrome) op Surface 1
2. **Navigeer naar:** `http://localhost:1420/player1`
   - Of als je de Windows app hebt geïnstalleerd, open die
3. **Klik op het ⚙️ icoon** linksboven (paarse knop)
4. **Klik op "Wijzigen"**
5. **Voer het Mac IP-adres in:**
   - Format: `192.168.1.193:3001`
   - (vervang 192.168.1.193 met jouw Mac IP)
6. **Klik "Opslaan & Verbinden"**
7. **Wacht op groene status:** ✅ Verbonden
8. **Zet in fullscreen:** Druk F11 (in browser)

### Stap 3: Herhaal voor Surface Tablet 2 & 3

**Surface Tablet 2:**
- URL: `http://localhost:1420/player2`
- Server: `192.168.1.193:3001`

**Surface Tablet 3:**
- URL: `http://localhost:1420/player3`
- Server: `192.168.1.193:3001`

## 🔧 Server Configuratie Panel

### Features

**Status Indicator:**
- ✅ Groen = Verbonden met server
- ❌ Rood = Geen verbinding
- 🔄 Oranje = Bezig met testen

**Functies:**
- ✏️ **Wijzigen** - IP-adres aanpassen
- 🔄 **Test Verbinding** - Connectie controleren
- 💾 **Opslaan & Verbinden** - Nieuwe server instellen
- 🔄 **Reset naar Localhost** - Terug naar standaard

### Automatische Functies

- Server URL wordt opgeslagen in browser (localStorage)
- Blijft bewaard na refresh/herstart
- Automatische verbindingstest bij opstarten
- Elke 100ms game state update

## 🌐 Netwerk Vereisten

### WiFi Setup
- **Alle devices op hetzelfde WiFi netwerk**
- 2.4 GHz of 5 GHz WiFi (5 GHz aanbevolen voor stabiliteit)
- Minimaal 10 Mbps per tablet

### Firewall Settings (Mac)

Zorg dat de Mac inkomende verbindingen toestaat:

1. Open **Systeemvoorkeuren** → **Beveiliging & Privacy** → **Firewall**
2. Klik op het slotje en unlock
3. Klik **Firewall-opties**
4. Zorg dat "Met het Mes op Tafel" is toegestaan
5. Of schakel firewall uit voor het lokale netwerk

### Poorten

De app gebruikt deze poorten:
- **1420** - Frontend (alleen localhost, niet extern)
- **3001** - HTTP API server (voor tablets)

## 🎮 Gebruik

### Op de Mac (Quizmaster)

1. Start het spel
2. Stel vragen
3. Controleer antwoorden
4. Ken scores toe
5. Alle game state wordt automatisch gesynchroniseerd naar tablets

### Op de Surface Tablets (Kandidaten)

1. Zie vragen verschijnen
2. Teken antwoorden met stylus
3. Antwoorden worden automatisch gesynchroniseerd
4. Zie feedback (goed/fout) verschijnen
5. Zie saldo en pot updates

## 🔍 Troubleshooting

### Tablet kan niet verbinden

**❌ Symptoom:** Rode status indicator, "Geen verbinding"

**Oplossingen:**
1. Controleer dat Mac app draait
2. Controleer IP-adres klopt (kan veranderen bij WiFi wissel)
3. Ping de Mac vanaf tablet:
   ```
   ping 192.168.1.193
   ```
4. Controleer firewall op Mac
5. Zorg dat beide devices op hetzelfde WiFi netwerk zitten

### Antwoorden synchroniseren niet

**❌ Symptoom:** Tekeningen verschijnen niet op quizmaster view

**Oplossingen:**
1. Check groene status indicator op tablet
2. Refresh de tablet browser (F5)
3. Controleer console logs (F12 in browser)
4. Herstart de Mac app

### Trage updates

**❌ Symptoom:** Vertraging tussen tablet en quizmaster

**Oplossingen:**
1. Gebruik 5 GHz WiFi (sneller dan 2.4 GHz)
2. Sluit andere WiFi devices uit
3. Plaats tablets dichter bij WiFi router
4. Check WiFi signaalsterkte

### IP-adres verandert

**❌ Symptoom:** Verbinding verbroken na herstart Mac

**Oplossingen:**
1. Stel statisch IP in op de Mac:
   - Systeemvoorkeuren → Netwerk → Geavanceerd
   - TCP/IP → Configureer IPv4: Handmatig
   - Stel vast IP in (bijv. 192.168.1.193)
2. Of: update IP op alle tablets via server config

## 📱 Alternative Setup: Browser-Only

Je kunt ook volledig browser-based werken **zonder** Windows installers:

### Op Mac (Quizmaster):
```
http://localhost:1420
```

### Op Surface Tablets:
1. Open browser
2. Ga naar: `http://192.168.1.193:1420/player1` (of player2/player3)
3. Klik op ⚙️ icon
4. Configureer server naar: `192.168.1.193:3001`
5. Fullscreen (F11)

**Voordeel:** Geen installatie nodig op tablets  
**Nadeel:** Minder optimale stylus integratie

## 🎯 Best Practices

### Voor Opnames

1. **Pre-opname check:**
   - Test alle 3 tablets verbinden
   - Test stylus werkt op elke tablet
   - Test antwoorden synchroniseren
   - Check batterijniveau tablets (>50%)

2. **Backup plan:**
   - Noteer IP-adres op papier
   - Print deze handleiding
   - Heb USB-C laders bij de hand
   - Backup WiFi hotspot (telefoon)

3. **Tijdens opname:**
   - Tablets in vliegtuigmodus (WiFi aan, notificaties uit)
   - "Niet storen" modus
   - Automatische updates uitschakelen
   - Achtergrond apps sluiten

## 🔐 Security

### Lokaal Netwerk Only

De HTTP API server is **NIET** bedoeld voor publiek internet:
- Geen authenticatie
- Geen encryptie
- Alleen voor trusted local network

**⚠️ WAARSCHUWING:** Gebruik alleen op vertrouwd WiFi netwerk!

### Productie Gebruik

Voor productie met publiek netwerk:
- Gebruik VPN tussen devices
- Of: Implementeer authenticatie (JWT tokens)
- Gebruik HTTPS met certificates

## 📊 Technical Details

### API Endpoints

De Mac exposeert deze endpoints op port 3001:

```
GET  /api/gamestate           - Haal game state op
POST /api/update_answer       - Update kandidaat antwoord
```

### Data Flow

```
Surface Tablet                    Mac (Quizmaster)
─────────────────────────────────────────────────
1. Fetch /api/gamestate  ──────→  Return game state
2. User draws answer
3. POST /api/update_answer ────→  Update game state
4. Fetch /api/gamestate  ──────→  Return updated state
5. Display feedback
```

### Update Frequency

- Game state polling: **100ms** (10x per seconde)
- Drawing sync: **Real-time** (na elke stroke)
- Connection check: **Bij opstarten**

## ✅ Setup Checklist

Print deze checklist voor bij opnames:

- [ ] Mac app gestart
- [ ] IP-adres Mac genoteerd: `_____._____._____.____`
- [ ] Tablet 1 verbonden (groene status)
- [ ] Tablet 2 verbonden (groene status)
- [ ] Tablet 3 verbonden (groene status)
- [ ] Stylus werkt op alle tablets
- [ ] Testantwoord gesynchroniseerd
- [ ] Tablets volledig opgeladen
- [ ] WiFi stabiel (5 GHz)
- [ ] Firewall Mac geconfigureerd
- [ ] Backup plan klaar

## 🎉 Klaar!

Je hebt nu een volledig werkende multi-device setup!

- **Quizmaster** beheert het spel op Mac
- **Kandidaten** spelen op Surface tablets
- **Real-time synchronisatie** tussen alle devices
- **Professionele workflow** voor live productie

Voor vragen of problemen, zie troubleshooting sectie of check console logs (F12).

