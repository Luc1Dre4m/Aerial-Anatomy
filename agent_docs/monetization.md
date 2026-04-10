# Monetizacion - Aerial Anatomy

## Modelo: Freemium + Suscripcion (3 tiers)

### Tier FREE
Suficiente para enganchar, no para aprender en profundidad.

**Incluye:**
- Mapa corporal interactivo (completo, sin restriccion)
- 10 musculos principales con info basica (sin latin, sin cues de activacion)
- 5 movimientos fundamentals (colgada, depresion escapular, activacion core, foot lock, subida basica)
- Vista general de las 5 cadenas biomecanicas (solo descripcion, sin animacion)
- Bilingue ES/EN completo
- 1 quiz diario

**No incluye:**
- Detalle completo de musculos (33+)
- Movimientos intermedios y avanzados (45+)
- Animacion de secuencia de activacion
- Cadenas biomecanicas animadas
- Pre-entrenamiento personalizado
- Flashcards y sistema de estudio
- Evaluador de riesgo
- Modo offline (solo con conexion)
- Notas personalizadas

### Tier PREMIUM - $1.99 USD/mes o $14.99 USD/ano

**Incluye todo de Free MAS:**
- 33+ musculos con informacion completa (triple nomenclatura, cues, lesiones)
- 50+ movimientos de todas las disciplinas y niveles
- Animacion de secuencia de activacion muscular
- Cadenas biomecanicas con flujo animado
- Modo Pre-Entrenamiento con calentamiento personalizado
- Sistema de estudio completo (flashcards, quizzes ilimitados, progreso)
- Musculo del dia con notificacion
- Evaluador de riesgo muscular
- Modo offline completo
- Favoritos y colecciones
- Diario de entrenamiento
- Notas personalizadas en cada movimiento
- Seccion de prevencion de lesiones
- Actualizaciones mensuales de contenido

### Tier INSTRUCTOR - $4.99 USD/mes o $39.99 USD/ano

**Incluye todo de Premium MAS:**
- Modo Instructor en Vivo (proyeccion en pantalla grande)
- Generador de PDF de movimientos para compartir con alumnos
- Notas compartibles con estudiantes
- Acceso anticipado a nuevas features (2 semanas antes)
- Badge de "Instructor Verificado" en perfil
- Capacidad de crear colecciones de movimientos para sus clases
- Soporte prioritario

## Implementacion tecnica con RevenueCat

```typescript
// Offerings
const OFFERINGS = {
  premium_monthly: 'rc_premium_monthly_199',
  premium_annual: 'rc_premium_annual_1499',
  instructor_monthly: 'rc_instructor_monthly_499',
  instructor_annual: 'rc_instructor_annual_3999',
};

// Entitlements
const ENTITLEMENTS = {
  premium: 'premium_access',
  instructor: 'instructor_access', // incluye premium
};

// Feature flags por entitlement
const FEATURES = {
  free: {
    muscles_limit: 10,
    movements_limit: 5,
    chain_animation: false,
    activation_sequence: false,
    pre_training: false,
    study_system: false,
    offline_mode: false,
    risk_evaluator: false,
    personal_notes: false,
    daily_quiz_limit: 1,
  },
  premium: {
    muscles_limit: Infinity,
    movements_limit: Infinity,
    chain_animation: true,
    activation_sequence: true,
    pre_training: true,
    study_system: true,
    offline_mode: true,
    risk_evaluator: true,
    personal_notes: true,
    daily_quiz_limit: Infinity,
  },
  instructor: {
    // todo de premium +
    live_mode: true,
    pdf_generator: true,
    shareable_notes: true,
    early_access: true,
    verified_badge: true,
    custom_collections: true,
    priority_support: true,
  },
};
```

## Estrategia de conversion

1. **Soft paywall**: No bloquear agresivamente. Mostrar contenido premium con blur + boton "Desbloquear con Premium".
2. **Trial de 7 dias**: Ofrecer trial gratis de Premium al completar onboarding.
3. **Natural moment paywalls**: Mostrar upgrade cuando el usuario intenta acceder a feature premium de forma natural (no pop-ups random).
4. **Annual push**: Descuento del 37% en plan anual vs mensual. Mostrar ahorro claramente.
5. **Instructor upsell**: Cuando un usuario premium busca muchos movimientos seguidos o crea muchas notas, sugerir tier Instructor.

## Justificacion del precio

- $1.99/mes = menos del 5% de una clase de aereos ($40-80)
- Muscle & Motion cobra $9.99/mes por contenido generico
- El libro de Dra. Scherb cuesta $25 y es estatico
- El curso de Circus Doc cuesta $200+ y no es portatil
- Unica app en el mundo con anatomia especifica de aereos
- Uso frecuente (diario/cada sesion) = alto valor percibido
