# GitHub Actions Release Build

Deze repository is nu geconfigureerd om automatisch Windows en macOS installers te bouwen via GitHub Actions.

## 🚀 Hoe een release maken

### Stap 1: Verhoog het versienummer

Update het versienummer in `src-tauri/tauri.conf.json`:

```json
{
  "version": "1.0.1"
}
```

### Stap 2: Commit en push je changes

```bash
git add .
git commit -m "Bump version to 1.0.1"
git push
```

### Stap 3: Maak een git tag

```bash
# Maak een tag met het versienummer (moet beginnen met 'v')
git tag v1.0.1

# Push de tag naar GitHub
git push origin v1.0.1
```

### Stap 4: Wacht op de build

1. Ga naar je GitHub repository
2. Klik op **Actions**
3. Je ziet nu de "Release Build" workflow draaien
4. De build duurt ongeveer 10-15 minuten

### Stap 5: Download de installers

1. Ga naar **Releases** in je repository (rechterkant)
2. Je ziet een nieuwe draft release met naam "Met het Mes op Tafel v1.0.1"
3. Download de bestanden:
   - **Windows**: `.msi` bestand (bijvoorbeeld `Met-het-Mes-op-Tafel_1.0.1_x64_en-US.msi`)
   - **macOS**: `.dmg` bestand (universal binary voor Intel + Apple Silicon)

### Stap 6: Publiceer de release (optioneel)

1. Bewerk de draft release
2. Voeg release notes toe indien gewenst
3. Klik op **Publish release**

## 📦 Wat wordt er gebouwd?

### Windows
- `.msi` installer voor 64-bit Windows
- Te installeren op Surface tablets en andere Windows machines

### macOS  
- `.dmg` installer (universal binary)
- Werkt op zowel Intel als Apple Silicon Macs

## 🔧 Handmatige trigger

Je kunt de workflow ook handmatig starten zonder tag:

1. Ga naar **Actions** tab
2. Selecteer **Release Build** workflow
3. Klik op **Run workflow**
4. Kies de branch en klik **Run workflow**

**Let op**: Bij handmatige trigger wordt er geen release aangemaakt, maar de artifacts zijn wel beschikbaar onder de workflow run.

## 🛠️ Troubleshooting

### Build faalt

- Check de logs in de Actions tab
- Zorg dat alle dependencies correct zijn in `package.json` en `Cargo.toml`
- Controleer of `tauri.conf.json` geldig is

### Tag bestaat al

Als je een tag opnieuw wilt maken:

```bash
# Verwijder lokale tag
git tag -d v1.0.1

# Verwijder remote tag
git push origin :refs/tags/v1.0.1

# Maak nieuwe tag
git tag v1.0.1
git push origin v1.0.1
```

### Geen schrijfrechten

Zorg dat GitHub Actions schrijfrechten heeft:
1. Ga naar **Settings** → **Actions** → **General**
2. Onder "Workflow permissions"
3. Selecteer "Read and write permissions"
4. Klik **Save**

## 📝 Versie Conventie

Gebruik [Semantic Versioning](https://semver.org/):

- **1.0.0** - Eerste release
- **1.0.1** - Bugfixes
- **1.1.0** - Nieuwe features (backwards compatible)
- **2.0.0** - Breaking changes

Tags moeten altijd beginnen met `v`, bijvoorbeeld: `v1.0.0`

## 🔄 Update Workflow

De workflow in `.github/workflows/release.yml` kan aangepast worden om:
- Linux builds toe te voegen
- Code signing toe te voegen (Windows/macOS)
- Automatische release notes te genereren
- Notificaties te versturen

## 📚 Meer informatie

- [Tauri GitHub Action](https://github.com/tauri-apps/tauri-action)
- [GitHub Releases Documentation](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [Tauri Build Documentation](https://tauri.app/v1/guides/building/)

