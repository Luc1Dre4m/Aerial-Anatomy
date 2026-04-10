# Aerial Anatomy App

App movil de anatomia aplicada a artes aereas circenses. Visualiza musculos, cadenas biomecanicas y movimientos de todas las disciplinas aereas (tela, trapecio, aro/lira, cuerda, straps, trapecio volante).

## Stack

- **Framework**: React Native + Expo (SDK 52+)
- **Visualizacion corporal**: SVG interactivo con `react-native-svg`. Base: `react-native-body-highlighter` extendido con paths anatomicos custom.
- **Animaciones**: `react-native-reanimated` 3+ y `lottie-react-native`
- **DB local (offline-first)**: WatermelonDB
- **Backend**: Supabase (PostgreSQL + Auth + Realtime sync)
- **Pagos**: RevenueCat
- **Navegacion**: React Navigation 7 (bottom tabs + stack)
- **State**: Zustand
- **i18n**: `react-i18next` (ES/EN obligatorio en todo contenido)

## Arquitectura

```
src/
  components/      # Componentes reutilizables
    body/          # SVG del cuerpo, zonas clicables, highlights
    muscles/       # Cards de musculos, tags de rol
    movements/     # Cards de movimientos, stick figures
    chains/        # Visualizacion de cadenas biomecanicas
    study/         # Flashcards, quizzes
    ui/            # Botones, modals, search, filters
  screens/         # Pantallas principales (5 tabs)
  data/            # JSON/TS con musculos, movimientos, cadenas
  hooks/           # Custom hooks
  utils/           # Helpers, constantes, tipos
  i18n/            # Traducciones ES/EN
  theme/           # Tokens de diseno (colores, fonts, spacing)
  services/        # Supabase, RevenueCat, analytics
```

## Reglas criticas

1. **Bilingue obligatorio**: TODO texto visible al usuario debe existir en ES y EN. Usar claves i18n, nunca strings hardcodeados.
2. **Nomenclatura anatomica triple**: Cada musculo lleva nombre en espanol + ingles + latin. Ej: "Dorsal ancho / Latissimus Dorsi / Musculus latissimus dorsi".
3. **Roles musculares siempre**: Cada musculo en un movimiento tiene rol: `agonista | sinergista | estabilizador | antagonista`.
4. **Offline-first**: Toda la data anatomica debe funcionar sin conexion. Solo sync, auth y analytics requieren red.
5. **Tema oscuro con dorados**: Background `#1A1A2E`, cards `#2C2C44`, acentos `#D4A843` / `#C49B3C`, texto principal `#F5E6C4`. Titulos en serif (Georgia/Playfair). Body en sans-serif (system font).
6. **Rendimiento**: Apuntar a 60fps. Lazy load de SVGs pesados. Listas con FlashList. Imagenes optimizadas.
7. **Nota de seguridad obligatoria**: Cada movimiento DEBE incluir al menos una nota de prevencion de lesiones.
8. **Credito de autora**: "Rubi Lueiza Fuentes - Instructorado de Artes Aereas Circenses" visible en About y footer.

## Comandos

```bash
npx expo start                    # Dev server
npx expo run:ios                  # iOS build
npx expo run:android              # Android build
npm test                          # Jest + React Native Testing Library
npx expo export                   # Production build
```

## Docs de referencia

Antes de trabajar en un area, lee el doc correspondiente:

- `agent_docs/data_model.md` - Modelo de datos completo (musculos, movimientos, cadenas, activaciones)
- `agent_docs/muscles_database.md` - Base de datos de 33+ musculos con toda la info anatomica
- `agent_docs/movements_database.md` - Base de datos de movimientos por disciplina y nivel
- `agent_docs/biomechanical_chains.md` - Las 5 cadenas biomecanicas (incluye Cadena de Suspension Aerea)
- `agent_docs/ui_design_system.md` - Tokens de diseno, componentes, paleta, tipografia
- `agent_docs/expert_guidelines.md` - Perspectivas de expertos senior (biomecanica, instructora, UX, kinesiologia)
- `agent_docs/feature_roadmap.md` - Roadmap en 3 fases con prioridades
- `agent_docs/existing_artifact.md` - Analisis del artefacto base existente (que conservar, que mejorar)
- `agent_docs/monetization.md` - Tiers freemium/premium/instructor y logica de paywall
