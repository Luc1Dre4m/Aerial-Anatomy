// Crash reporting shim — Sprint A2 #6 (junta directiva 2026-05-15, Mauricio).
//
// API shape coincide deliberadamente con la de @sentry/react-native para que
// plugar Sentry (u otro provider compatible: Bugsnag, Crashlytics) sea
// reemplazar este archivo sin tocar callers. Hoy SIN SDK instalado: las
// llamadas hacen console-log y nada más. Apenas el user agregue la DSN y el
// SDK real, las funciones reportan a backend remoto.
//
// Razón para el shim ahora (vs esperar al SDK):
//   1. Centraliza el "punto de logging" — sin esto, cada throw queda
//      esparcido en console.error sin estructura.
//   2. Cuando se agregue Sentry, los callers ya están en su lugar (App.tsx
//      init, ErrorBoundary capture, futuros captureException en flujos
//      críticos como compras y auth).
//   3. ESLint + TS pueden detectar quién llama qué — facilita auditoría.
//
// Para enchufar Sentry real:
//   1. `npx expo install @sentry/react-native` (o sentry-expo)
//   2. Agregar `EXPO_PUBLIC_SENTRY_DSN=...` a .env.local
//   3. Reemplazar este archivo con bindings a Sentry.captureException, etc.

export type CrashSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface CrashContext {
  // Tags arbitrarios para filtrar en el dashboard (e.g. { screen: '3D', muscleId: 'm_pectoral_mayor' })
  tags?: Record<string, string>;
  // Datos extra que no son tags pero ayudan al debug (e.g. payload de la API que falló)
  extra?: Record<string, unknown>;
  // Severidad — Sentry default es 'error'
  level?: CrashSeverity;
}

export interface CrashUser {
  id: string;
  email?: string;
  // No mandar PII innecesaria. id + email es suficiente para correlación.
}

interface CrashReporterState {
  initialized: boolean;
  dsn: string | null;
  env: 'development' | 'production' | 'preview';
}

const state: CrashReporterState = {
  initialized: false,
  dsn: null,
  env: 'development',
};

/**
 * Inicializa el crash reporter. Llamar UNA vez al boot de la app, antes que
 * cualquier captureException. Idempotente — segunda llamada es no-op.
 */
export function initCrashReporter(): void {
  if (state.initialized) return;
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN ?? null;
  const env: CrashReporterState['env'] = __DEV__
    ? 'development'
    : process.env.EXPO_PUBLIC_ENV === 'preview'
      ? 'preview'
      : 'production';
  state.initialized = true;
  state.dsn = dsn;
  state.env = env;

  if (!dsn) {
    if (__DEV__) {
      console.log('[CrashReporter] No DSN configured — running in console-only mode.');
    }
    return;
  }
  // SI HAY DSN: pero no hay SDK instalado todavía. Loguear que faltaría wirearlo.
  console.warn(
    '[CrashReporter] DSN detected but no provider SDK is wired. ' +
    'Install @sentry/react-native and replace this shim.'
  );
}

export function captureException(error: unknown, context?: CrashContext): void {
  const tagsStr = context?.tags ? JSON.stringify(context.tags) : '';
  const extraStr = context?.extra ? JSON.stringify(context.extra) : '';
  console.error(
    `[CrashReporter] ${context?.level ?? 'error'}:`,
    error instanceof Error ? error.message : error,
    tagsStr && `tags=${tagsStr}`,
    extraStr && `extra=${extraStr}`,
    error instanceof Error ? error.stack : undefined,
  );
  // Cuando se enchufe Sentry:
  //   Sentry.captureException(error, { tags: context?.tags, extra: context?.extra, level: context?.level });
}

export function captureMessage(message: string, context?: CrashContext): void {
  const level = context?.level ?? 'info';
  console.log(
    `[CrashReporter] ${level}:`,
    message,
    context?.tags ? `tags=${JSON.stringify(context.tags)}` : '',
  );
  // Cuando se enchufe Sentry:
  //   Sentry.captureMessage(message, { tags: context?.tags, extra: context?.extra, level });
}

export function setUser(user: CrashUser | null): void {
  if (__DEV__) {
    console.log('[CrashReporter] setUser:', user?.id ?? '(cleared)');
  }
  // Cuando se enchufe Sentry:
  //   if (user) Sentry.setUser({ id: user.id, email: user.email });
  //   else Sentry.setUser(null);
}

/**
 * Útil para debug local: confirma si el reporter está activo con un provider real.
 * Sin DSN, retorna false aunque init() haya corrido.
 */
export function isRemoteReportingActive(): boolean {
  return state.initialized && state.dsn !== null;
}
