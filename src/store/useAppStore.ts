import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';
import { MovementLevel } from '../utils/types';
import { MotionSession } from '../services/motionAnalysis';

const DEV_PREMIUM = process.env.EXPO_PUBLIC_DEV_PREMIUM === 'true';

// Safeguard de release (junta directiva 2026-05-15, Mauricio): el flag de
// unlock premium en dev es útil para QA local, pero shippearlo activo en
// una build de producción daría premium gratis a todos los usuarios. Esta
// guarda crashea la app temprano y con un mensaje claro si alguien arma
// una build no-dev con el flag puesto — imposible no notarlo antes del
// release.
if (DEV_PREMIUM && !__DEV__) {
  throw new Error(
    'EXPO_PUBLIC_DEV_PREMIUM=true detectado en una build NO-dev. ' +
    'Este flag salta el paywall y NUNCA debe shipearse a producción. ' +
    'Quitá el env var o ponelo en "false" antes de hacer eas build.'
  );
}

interface AppState {
  language: 'es' | 'en';
  setLanguage: (lang: 'es' | 'en') => void;
  selectedMuscleId: string | null;
  setSelectedMuscleId: (id: string | null) => void;
  selectedMovementId: string | null;
  setSelectedMovementId: (id: string | null) => void;
  onboardingComplete: boolean;
  completeOnboarding: () => void;
  tutorial3DComplete: boolean;
  completeTutorial3D: () => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  userDisciplines: string[];
  setUserDisciplines: (ids: string[]) => void;
  userLevel: MovementLevel;
  setUserLevel: (level: MovementLevel) => void;
  favoriteMuscles: string[];
  toggleFavoriteMuscle: (id: string) => void;
  favoriteMovements: string[];
  toggleFavoriteMovement: (id: string) => void;
  subscription: 'free' | 'premium' | 'instructor';
  setSubscription: (tier: 'free' | 'premium' | 'instructor') => void;
  instructorNotes: Record<string, string>;
  setInstructorNote: (movementId: string, note: string) => void;
  deleteInstructorNote: (movementId: string) => void;
  trainingLog: TrainingEntry[];
  addTrainingEntry: (entry: TrainingEntry) => void;
  studyStreak: number;
  lastStudyDate: string | null;
  recordStudySession: () => void;
  motionSessions: MotionSession[];
  addMotionSession: (session: MotionSession) => void;
  visitedMuscles: string[];
  markMuscleVisited: (id: string) => void;
  recentMuscles: string[];
  addRecentMuscle: (id: string) => void;
}

export interface TrainingEntry {
  id: string;
  date: string;
  movementIds: string[];
  notes: string;
  duration: number;
  rating: 1 | 2 | 3 | 4 | 5;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'es',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
      selectedMuscleId: null,
      setSelectedMuscleId: (id) => set({ selectedMuscleId: id }),
      selectedMovementId: null,
      setSelectedMovementId: (id) => set({ selectedMovementId: id }),
      onboardingComplete: false,
      completeOnboarding: () => set({ onboardingComplete: true }),
      tutorial3DComplete: false,
      completeTutorial3D: () => set({ tutorial3DComplete: true }),
      userId: null,
      setUserId: (id) => set({ userId: id }),
      isAuthenticated: false,
      setIsAuthenticated: (val) => set({ isAuthenticated: val }),
      userDisciplines: [],
      setUserDisciplines: (ids) => set({ userDisciplines: ids }),
      userLevel: 'basico',
      setUserLevel: (level) => set({ userLevel: level }),
      favoriteMuscles: [],
      toggleFavoriteMuscle: (id) => {
        const current = get().favoriteMuscles;
        set({
          favoriteMuscles: current.includes(id)
            ? current.filter((m) => m !== id)
            : [...current, id],
        });
      },
      favoriteMovements: [],
      toggleFavoriteMovement: (id) => {
        const current = get().favoriteMovements;
        set({
          favoriteMovements: current.includes(id)
            ? current.filter((m) => m !== id)
            : [...current, id],
        });
      },
      subscription: DEV_PREMIUM ? 'premium' : 'free',
      setSubscription: (tier) => set({ subscription: tier }),
      instructorNotes: {},
      setInstructorNote: (movementId, note) => {
        const current = get().instructorNotes;
        set({ instructorNotes: { ...current, [movementId]: note } });
      },
      deleteInstructorNote: (movementId) => {
        const current = { ...get().instructorNotes };
        delete current[movementId];
        set({ instructorNotes: current });
      },
      trainingLog: [],
      addTrainingEntry: (entry) => {
        set({ trainingLog: [entry, ...get().trainingLog].slice(0, 100) });
      },
      motionSessions: [],
      addMotionSession: (session) => {
        set({ motionSessions: [session, ...get().motionSessions].slice(0, 50) });
      },
      visitedMuscles: [],
      markMuscleVisited: (id) => {
        const current = get().visitedMuscles;
        if (!current.includes(id)) {
          set({ visitedMuscles: [...current, id] });
        }
      },
      recentMuscles: [],
      addRecentMuscle: (id) => {
        const current = get().recentMuscles.filter((m) => m !== id);
        set({ recentMuscles: [id, ...current].slice(0, 20) });
      },
      studyStreak: 0,
      lastStudyDate: null,
      recordStudySession: () => {
        const today = new Date().toISOString().split('T')[0];
        const last = get().lastStudyDate;
        if (last === today) return; // Already recorded today

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const streak = last === yesterday ? get().studyStreak + 1 : 1;
        set({ studyStreak: streak, lastStudyDate: today });
      },
    }),
    {
      name: 'aerial-anatomy-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        onboardingComplete: state.onboardingComplete,
        tutorial3DComplete: state.tutorial3DComplete,
        userId: state.userId,
        isAuthenticated: state.isAuthenticated,
        userDisciplines: state.userDisciplines,
        userLevel: state.userLevel,
        favoriteMuscles: state.favoriteMuscles,
        favoriteMovements: state.favoriteMovements,
        subscription: state.subscription,
        instructorNotes: state.instructorNotes,
        trainingLog: state.trainingLog,
        motionSessions: state.motionSessions,
        studyStreak: state.studyStreak,
        lastStudyDate: state.lastStudyDate,
        visitedMuscles: state.visitedMuscles,
        recentMuscles: state.recentMuscles,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
        }
      },
    },
  ),
);
