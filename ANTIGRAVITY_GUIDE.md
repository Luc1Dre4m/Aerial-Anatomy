# Guia de Ejecucion Optima en Antigravity + Claude

## Estrategia de Agentes Paralelos

Antigravity permite orquestar multiples agentes en paralelo. Para este proyecto, la estrategia optima es **Plan > Execute > Verify** con agentes especializados.

### Configuracion recomendada de agentes:

```
AGENTE 1 (Claude Opus) → Arquitectura + Data Model + Contenido anatomico
AGENTE 2 (Claude Sonnet) → Componentes UI React Native
AGENTE 3 (Gemini) → SVGs del cuerpo + stick figures (visual)
AGENTE 4 (Claude Sonnet) → Testing + Validacion
```

### Flujo de trabajo por Sprint:

```
Sprint 1: Foundation
├── Agente 1: Setup Expo + navegacion + tema + data model
├── Agente 2: Componentes UI base (cards, tags, badges, theme)
└── Verificar: La app renderiza con tema oscuro y 5 tabs vacios

Sprint 2: Core Data
├── Agente 1: Poblar 33 musculos + 20 movimientos + 5 cadenas en JSON/TS
├── Agente 2: BodyMap SVG interactivo (frontal/posterior)
└── Verificar: Tocar zona del cuerpo → musculo aparece

Sprint 3: Screens principales
├── Agente 1: Tab Explorar (mapa corporal + panel de info)
├── Agente 2: Tab Movimientos (catalogo + detalle)
├── Agente 3: Tab Musculos (busqueda + filtros)
└── Verificar: Navegacion musculo <> movimiento funciona

Sprint 4: Diferenciacion
├── Agente 1: Tab Cadenas biomecanicas + animacion de flujo
├── Agente 2: Secuencia de activacion animada
├── Agente 3: Modo pre-entrenamiento
└── Verificar: La Cadena de Suspension se visualiza correctamente

Sprint 5: Engagement
├── Agente 1: Sistema de estudio (flashcards + quizzes)
├── Agente 2: Offline mode con WatermelonDB
├── Agente 3: Paywall con RevenueCat
└── Verificar: App funciona sin conexion, paywall bloquea contenido premium
```

## Regla de Oro para Antigravity

**Un contexto por tarea. Termina feature, cierra sesion, abre nueva.**

Esto evita que el contexto se contamine y mantiene la calidad alta. Cada agente trabaja con su porcion del `CLAUDE.md` + el `agent_doc` relevante.

## Prompt para iniciar sesion en Antigravity:

Al abrir un agente para una tarea especifica, pegar:

```
Lee CLAUDE.md y luego lee agent_docs/[doc_relevante].md antes de empezar.
Tarea: [descripcion especifica]
Criterio de aceptacion: [que debe funcionar al terminar]
```

Ejemplo:
```
Lee CLAUDE.md y luego lee agent_docs/ui_design_system.md y agent_docs/existing_artifact.md.
Tarea: Crear el componente BodyMap que renderiza un SVG interactivo del cuerpo humano con vista frontal y posterior. Las regiones musculares deben ser paths SVG clicables que se resaltan con el color del rol muscular al ser seleccionados.
Criterio de aceptacion: Al tocar una zona muscular, se emite un evento con el muscle_id y la zona se ilumina con animacion de 200ms.
```
