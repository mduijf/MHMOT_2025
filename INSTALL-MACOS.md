# macOS Installatie Instructies

## ⚠️ "macOS kan niet verifiëren" Foutmelding

Als je deze foutmelding krijgt bij het installeren van de `.dmg`:

> "Met het Mes op Tafel.dmg kan niet worden geopend omdat macOS niet kan verifiëren of het malware bevat"

Dit komt omdat de app niet code signed is met een Apple Developer certificaat.

## 🔓 Oplossing 1: Rechtsklik → Open (Aanbevolen)

1. **Zoek de `.dmg` file** in Finder
2. **Rechtsklik** op het bestand (of Control+klik)
3. Kies **"Open"** uit het menu
4. Je krijgt een dialoog met de optie **"Open"**
5. Klik **"Open"** om de installer te starten

✅ Dit werkt omdat macOS meer opties geeft bij rechtsklik.

## 🔓 Oplossing 2: Beveiliging & Privacy

1. **Dubbelklik de `.dmg`** (krijg foutmelding)
2. Ga naar **Systeemvoorkeuren** → **Beveiliging & Privacy**
3. **Klik op het slotje** onderaan en voer je wachtwoord in
4. Je ziet: *"Met-het-Mes-op-Tafel.dmg" was blocked from use because it is not from an identified developer.*
5. Klik op **"Open Anyway"**
6. Bevestig in de volgende dialoog

## 🔓 Oplossing 3: Terminal (Geavanceerd)

Als bovenstaande niet werken, verwijder de quarantaine attribuut:

```bash
# Navigeer naar de Downloads folder
cd ~/Downloads

# Verwijder quarantaine van DMG
xattr -d com.apple.quarantine "Met-het-Mes-op-Tafel_1.1.0_universal.dmg"

# Nu dubbelklikken werkt normaal
```

Of als de app al geïnstalleerd is in Applications:

```bash
# Verwijder quarantaine van de app
xattr -cr "/Applications/Met het Mes op Tafel.app"
```

## 🔓 Oplossing 4: Spctl Disable (Niet Aanbevolen)

⚠️ **Tijdelijk Gatekeeper uitschakelen (GEBRUIK MET VOORZICHTIGHEID):**

```bash
# Schakel Gatekeeper uit
sudo spctl --master-disable

# Installeer de app

# Schakel Gatekeeper weer in (BELANGRIJK!)
sudo spctl --master-enable
```

**Let op:** Dit schakelt alle app verificatie uit. Schakel het daarna weer in!

## ✅ Na Installatie

1. Sleep de app naar **Applications** folder
2. Start de app vanuit Applications
3. Bij eerste start: Bevestig opnieuw "Open"

## 🔐 Voor Productie: Code Signing

### Waarom gebeurt dit?

macOS Gatekeeper blokkeert apps die niet zijn ondertekend met een geldig Apple Developer certificaat. Voor productie gebruik moet de app code signed zijn.

### Code Signing Implementeren

**Vereisten:**
- Apple Developer Account ($99/jaar)
- Developer ID Application Certificate

**Stappen:**

1. **Verkrijg Developer ID Certificate:**
   - Meld aan bij https://developer.apple.com
   - Certificates, Identifiers & Profiles
   - Create Developer ID Application certificate
   - Download en installeer in Keychain

2. **Update GitHub Actions workflow** (`.github/workflows/release.yml`):

```yaml
- platform: 'macos-latest'
  args: '--target universal-apple-darwin'
```

Wordt:

```yaml
- platform: 'macos-latest'
  args: '--target universal-apple-darwin'
  
env:
  APPLE_CERTIFICATE: ${{ secrets.APPLE_CERTIFICATE }}
  APPLE_CERTIFICATE_PASSWORD: ${{ secrets.APPLE_CERTIFICATE_PASSWORD }}
  APPLE_SIGNING_IDENTITY: "Developer ID Application: Yellowspot BV (TEAM_ID)"
  APPLE_ID: ${{ secrets.APPLE_ID }}
  APPLE_PASSWORD: ${{ secrets.APPLE_PASSWORD }}
```

3. **Tauri configuratie** (`tauri.conf.json`):

```json
"bundle": {
  "macOS": {
    "signing": {
      "identity": "Developer ID Application: Yellowspot BV (TEAM_ID)"
    }
  }
}
```

4. **Notarisatie toevoegen:**

Nadat de app is signed, moet het ook genotariseerd worden bij Apple:

```bash
# Sign
codesign --deep --force --verify --verbose --sign "Developer ID Application: Yellowspot BV" "Met het Mes op Tafel.app"

# Create DMG
# ...

# Notarize
xcrun notarytool submit "Met-het-Mes-op-Tafel.dmg" \
  --apple-id "email@example.com" \
  --password "app-specific-password" \
  --team-id "TEAM_ID" \
  --wait

# Staple
xcrun stapler staple "Met-het-Mes-op-Tafel.dmg"
```

### Kosten

- **Apple Developer Program:** $99/jaar
- **Code Signing:** Inbegrepen in Developer Program
- **Notarisatie:** Gratis

## 📝 Huidige Status

De app is momenteel **niet code signed**. Voor intern gebruik zijn de bovenstaande workarounds voldoende. Voor distributie naar klanten is code signing sterk aanbevolen.

## 🔗 Meer Informatie

- [macOS Code Signing](https://developer.apple.com/support/code-signing/)
- [Notarizing macOS Apps](https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution)
- [Tauri Code Signing](https://tauri.app/v1/guides/distribution/sign-macos)
- [Gatekeeper Troubleshooting](https://support.apple.com/guide/mac-help/open-a-mac-app-from-an-unidentified-developer-mh40616/mac)

## 🆘 Hulp Nodig?

Als bovenstaande oplossingen niet werken:

1. Check macOS versie: `sw_vers`
2. Check quarantaine status: `xattr "Met-het-Mes-op-Tafel.dmg"`
3. Check System Integrity Protection: `csrutil status`
4. Probeer in Safe Mode (hold Shift tijdens boot)

