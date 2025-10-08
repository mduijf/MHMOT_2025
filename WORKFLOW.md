# Met het Mes op Tafel - Workflow Gids

## 🎯 Overzicht

Deze applicatie ondersteunt de live afname van "Met het Mes op Tafel" met een moderne workflow:

- **Kandidaten** typen hun antwoorden op **Surface tablets**
- **Antwoorden** verschijnen **live** in de quizmaster view
- **Quizmaster** keurt antwoorden **handmatig** goed/fout
- **Geen vraag/antwoord database** - jullie hebben vragen op papier

## 📱 Setup voor Live Afname

### Apparaten Nodig

1. **1x Hoofdscherm** (Quizmaster view)
   - Voor quizmaster om antwoorden te beoordelen
   - Spelverloop beheren
   - Live overzicht van alle kandidaten

2. **3x Surface Tablets** (Kandidaat views)
   - Voor kandidaten om antwoorden te typen
   - Groot, tablet-vriendelijk keyboard
   - Real-time opslaan van antwoorden

3. **Optioneel: Extra scherm** voor inzetcontroles

## 🎮 Spelverloop Stap-voor-stap

### 1. Spel Starten

1. Start de applicatie op alle apparaten
2. Op het hoofdscherm: kies "Quizmaster" view
3. Voer 3 spelersnamen in
4. Klik "Start Spel"

### 2. Tablets Instellen

Op elk tablet:
1. Klik op de speler tab (📱 Speler 1, 📱 Speler 2, 📱 Speler 3)
2. Kandidaat ziet zijn/haar naam en 4 antwoordvelden
3. **Tablets blijven op deze view staan**

### 3. Ronde Verloop

#### A. Vragenronde
```
Quizmaster leest vragen voor → Kandidaten typen antwoorden op tablets
                            → Antwoorden verschijnen automatisch live
```

- Quizmaster leest vraag voor (vanaf papier)
- Kandidaten typen antwoord in het juiste veld
- Bij elke toetsaanslag wordt antwoord opgeslagen
- ✓ "Opgeslagen" verschijnt naast het veld

#### B. Eerste Inzetronde
```
Quizmaster: "Start Eerste Inzetronde"
           ↓
Kandidaten zien hun antwoorden niet → Bluffen!
```

1. Quizmaster klikt "Start Eerste Inzetronde"
2. Kandidaten kunnen inzetten op 💰 Inzetten tab
3. Of op tablet: zie saldo, kan passen/inzetten

#### C. Antwoorden Beoordelen
```
Quizmaster: "Toon Antwoorden"
           ↓
Alle antwoorden verschijnen met ✓/✗ knoppen
```

1. Quizmaster klikt "Toon Antwoorden"
2. Alle antwoorden van alle kandidaten zijn zichtbaar
3. **Keur elk antwoord goed/fout:**
   - ✓ Goed (groen) = antwoord is correct
   - ✗ Fout (rood) = antwoord is fout
4. Score wordt automatisch bijgehouden

#### D. Tweede Inzetronde
```
Kandidaten hebben antwoorden gezien → Nu inzetten met kennis!
```

1. Quizmaster klikt "Start Tweede Inzetronde"
2. Kandidaten kunnen nog een keer inzetten
3. Nu weten ze wat anderen hebben geantwoord

#### E. Showdown
```
Quizmaster: "Bepaal Winnaar"
           ↓
Systeem telt goedgekeurde antwoorden
           ↓
Meeste goede antwoorden wint de pot!
```

1. Quizmaster klikt "Bepaal Winnaar"
2. Winnaar wordt automatisch bepaald op basis van ✓ goedgekeurde antwoorden
3. Pot wordt toegekend

#### F. Volgende Ronde
```
Quizmaster: "Volgende Ronde"
           ↓
Nieuwe ronde start, antwoordvelden worden geleegd
```

## 🎙️ Quizmaster View Functies

### Live Kandidaat Overzicht

Voor elke kandidaat zie je:
- **Naam** en **saldo**
- **Alle 4 antwoorden** live bijgewerkt
- **Goedkeuring status** per antwoord
- **Score** (X/4 goedgekeurd)
- **Inzet status** (gepast of bedrag)

### Fase Controles

De quizmaster kan het spel door de fases leiden:
1. ▶️ Start Eerste Inzetronde
2. 👁️ Toon Antwoorden (+ keur goed/fout)
3. ▶️ Start Tweede Inzetronde  
4. 🏆 Bepaal Winnaar
5. ⏭️ Volgende Ronde

## 📱 Tablet Views

### Voor Kandidaten

**Groot, duidelijk scherm met:**
- Eigen naam bovenaan
- 4 invoervelden voor vragen 1-4
- "✓ Opgeslagen" feedback
- Saldo en inzet onderaan

**Tablet-vriendelijk:**
- Grote touch-targets
- Auto-save bij typen
- Geen submit knop nodig
- Werkt met on-screen keyboard

### Inzetten View

Kandidaten kunnen switchen naar 💰 Inzetten tab voor:
- Snel inzetten (€10, €20, €30, €40, €50)
- Aangepast bedrag
- Passen knop
- Saldo check

## 🔄 Live Updates

**Automatische synchronisatie:**
- Antwoorden verschijnen direct bij quizmaster
- Inzetten worden live bijgewerkt
- Saldi worden real-time getoond
- Elke 2 seconden refresh

**Geen refresh knop nodig!**

## 💡 Tips voor Gebruik

### Setup Tips

1. **Netwerk**: Alle apparaten op hetzelfde WiFi netwerk
2. **Browsers**: Chrome of Edge (nieuwste versie)
3. **Schermstand tablets**: Landscape voor beste weergave
4. **Test eerst**: Doe een test-ronde voor de opname

### Tijdens Opname

1. **Tablets op hun plek**: Kandidaten kunnen niet elkaars scherm zien
2. **Quizmaster scherm groot**: Goed zichtbaar voor crew
3. **Paper backup**: Houd papier bij voor noodgevallen
4. **Save regelmatig**: Systeem slaat automatisch op

### Troubleshooting

**Antwoord verschijnt niet:**
- Check WiFi verbinding
- Herlaad pagina (data blijft behouden)

**Kandidaat ziet verkeerde view:**
- Klik op juiste speler tab bovenaan

**Inzet lukt niet:**
- Check of saldo voldoende is (€10-€50)
- Kandidaat mag niet al gepast hebben

## 📊 Spelverloop Schema

```
RONDE START
↓
Quizmaster leest 4 vragen voor
↓
Kandidaten typen antwoorden (live op tablets)
↓
[Fase 1] Eerste Inzetronde (blind)
↓
Quizmaster toont antwoorden
↓
Quizmaster keurt antwoorden goed/fout (✓/✗)
↓
[Fase 2] Tweede Inzetronde (met kennis)
↓
Showdown → Winnaar bepaald
↓
Pot toegekend → Volgende ronde
```

## 🎯 Voordelen Nieuwe Systeem

✅ **Geen database nodig** - vragen blijven op papier
✅ **Live updates** - antwoorden verschijnen direct
✅ **Flexibele beoordeling** - quizmaster beslist goed/fout
✅ **Tablet friendly** - grote, makkelijke invoer
✅ **Multi-view** - elke deelnemer heeft eigen scherm
✅ **Automatische sync** - alles blijft up-to-date

---

**Ready to go! 🎬**

