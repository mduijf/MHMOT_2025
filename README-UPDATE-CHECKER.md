# Auto-Update Functie

De app heeft nu een automatische update checker die controleert of er een nieuwe versie beschikbaar is op GitHub.

## 🎯 Hoe het werkt

### Automatische Controle
- Bij het opstarten van de app wordt automatisch gecontroleerd op updates
- Elke 6 uur wordt opnieuw gecontroleerd
- Gebruikt de GitHub Releases API

### Update Notificatie
Wanneer een nieuwe versie beschikbaar is:
- Verschijnt rechtsboven een mooie notificatie
- Toont huidige en nieuwe versie
- Toont release notes (als beschikbaar)
- "Download" knop opent de GitHub Releases pagina
- "Later" knop om de notificatie te sluiten

## 🔧 Technische Details

### Backend (Rust)
- Nieuwe module: `src-tauri/src/updater.rs`
- GitHub API endpoint: `https://api.github.com/repos/mduijf/MHMOT_2025/releases/latest`
- Semantic versioning vergelijking (1.0.0 vs 1.0.1)
- Versie wordt automatisch gelezen uit `Cargo.toml`

### Frontend (React)
- Component: `src/components/UpdateNotification.tsx`
- Styling: `src/components/UpdateNotification.css`
- Geïntegreerd in hoofdapp (`App.tsx`)

### API Response
```typescript
interface UpdateInfo {
  available: boolean;
  current_version: string;
  latest_version: string;
  download_url: string;
  release_notes: string;
}
```

## 📝 Versie Management

### Huidige Versie
De huidige versie wordt bepaald door:
- `src-tauri/Cargo.toml` → `version = "1.0.0"`
- `src-tauri/tauri.conf.json` → `version: "1.0.0"`

**Belangrijk:** Deze moeten altijd gelijk zijn!

### Nieuwe Release Maken

1. **Update versienummer:**
   ```bash
   # Beide bestanden aanpassen naar nieuwe versie
   src-tauri/Cargo.toml: version = "1.0.1"
   src-tauri/tauri.conf.json: "version": "1.0.1"
   ```

2. **Commit en tag:**
   ```bash
   git add .
   git commit -m "Bump version to 1.0.1"
   git tag v1.0.1
   git push origin main
   git push origin v1.0.1
   ```

3. **GitHub Actions bouwt automatisch:**
   - Windows `.msi` installer
   - macOS `.dmg` installer
   - Maakt een nieuwe GitHub Release

4. **Users krijgen automatisch notificatie:**
   - Bij volgende app start
   - Of binnen 6 uur

## 🎨 UI/UX

### Notificatie Design
- Modern gradient achtergrond (paars/blauw)
- Slide-in animatie van rechts
- Responsive voor kleine schermen
- Duidelijke call-to-action knoppen
- Release notes in uitklapbare sectie

### User Flow
1. App start op
2. Background check naar GitHub API
3. Als update beschikbaar → toon notificatie
4. User klikt "Download" → opent releases pagina
5. User installeert nieuwe versie
6. Bij volgende start ziet user geen notificatie (up-to-date)

## 🔒 Privacy & Performance

### Geen Data Verzameling
- Geen analytics
- Geen tracking
- Alleen een simpele GET request naar GitHub

### Performance
- Async/non-blocking
- Caching: check max 1x per 6 uur
- Lightweight: <5KB extra code
- Geen impact op app startup

## 🚀 Toekomstige Verbeteringen

### Mogelijk toe te voegen:
- [ ] In-app update installatie (zonder handmatige download)
- [ ] Changelog viewer in de app
- [ ] Update reminder voor kritische updates
- [ ] Beta/nightly channel support
- [ ] Automatic rollback bij crashes

### Tauri Auto-Updater
Voor volledige in-app updates kan Tauri's ingebouwde updater gebruikt worden:
- Vereist code signing (macOS/Windows)
- Automatische installatie zonder user interactie
- Zie: https://tauri.app/v1/guides/distribution/updater

## 🐛 Troubleshooting

### Update check faalt
- Check internet verbinding
- Verificeer GitHub repository is publiek toegankelijk
- Check of `https://api.github.com/repos/mduijf/MHMOT_2025/releases/latest` bereikbaar is

### Verkeerde versie getoond
- Zorg dat `Cargo.toml` en `tauri.conf.json` versies gelijk zijn
- Rebuild de app na versie wijziging

### Notificatie blijft verschijnen
- Check of de versie correct is geüpdatet
- Versie vergelijking is strikt: "1.0.0" ≠ "1.0.0-beta"

## 📚 Broncode Locaties

```
src-tauri/src/updater.rs              # Backend update checker
src-tauri/src/commands.rs             # check_for_updates command
src-tauri/src/lib.rs                  # Command registratie
src-tauri/Cargo.toml                  # Versie definitie

src/components/UpdateNotification.tsx # React component
src/components/UpdateNotification.css # Styling
src/App.tsx                          # Integratie in main app
```

## ✅ Testing

Test de update functie:

1. **Simuleer nieuwe versie:**
   - Wijzig `Cargo.toml` versie naar "0.9.0"
   - Build en run de app
   - De app zou nu een update moeten detecteren (1.0.0 > 0.9.0)

2. **Test API endpoint:**
   ```bash
   curl https://api.github.com/repos/mduijf/MHMOT_2025/releases/latest
   ```

3. **Check logs:**
   - Open Developer Tools (in dev mode)
   - Check console voor update check logs

## 🎉 Done!

De app heeft nu een professionele update functie die:
- ✅ Automatisch checkt op updates
- ✅ Gebruikers vriendelijk informeert
- ✅ Naar download pagina leidt
- ✅ Geen impact heeft op performance
- ✅ Privacy-vriendelijk is

