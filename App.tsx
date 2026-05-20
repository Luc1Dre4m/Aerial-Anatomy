import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import * as SplashScreen from 'expo-splash-screen';
import { BottomTabNavigator } from './src/navigation';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { VerifyEmailScreen } from './src/screens/VerifyEmailScreen';
import { AnimatedSplashScreen } from './src/screens/AnimatedSplashScreen';
import { useAppStore } from './src/store/useAppStore';
import { initRevenueCat, getCurrentTier, onSubscriptionChange } from './src/services/revenueCat';
import { getSession, onAuthStateChange } from './src/services/supabase';
import { initCrashReporter, setUser as setCrashUser } from './src/services/crashReporter';
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';
import { colors } from './src/theme';
import './src/i18n';

// Boot temprano del crash reporter (antes de cualquier work async). Idempotente.
// Sin DSN configurada: usa console-only mode. Con DSN + SDK: reporta a backend.
initCrashReporter();

if (__DEV__) {
  const { validateAllData } = require('./src/utils/validateData');
  validateAllData();
}

SplashScreen.preventAutoHideAsync();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.accent.primary,
    background: colors.bg.primary,
    card: colors.bg.surface,
    text: colors.text.primary,
    border: colors.border,
    notification: colors.accent.primary,
  },
};

type AuthScreen = 'login' | 'register' | 'verify';

export default function App() {
  const [fontsLoaded, fontsError] = useFonts({ PlayfairDisplay_700Bold });
  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const setIsAuthenticated = useAppStore((s) => s.setIsAuthenticated);
  const setUserId = useAppStore((s) => s.setUserId);
  const setSubscription = useAppStore((s) => s.setSubscription);

  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingPassword, setPendingPassword] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  // Font loading fallback: if useFonts hangs (which happened in earlier
  // sessions and required a hack), unblock the app after 3 seconds. The UI
  // degrades gracefully to the system font for Playfair text rather than
  // staying blank forever. Real loading still sets fontsLoaded as soon as
  // expo-font finishes.
  const [fontsTimeout, setFontsTimeout] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setFontsTimeout(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsError) {
      console.warn('[App] useFonts error — falling back to system font:', fontsError);
    }
  }, [fontsError]);

  const fontsReady = fontsLoaded || !!fontsError || fontsTimeout;

  useEffect(() => {
    async function setup() {
      // Check existing session
      try {
        const session = await getSession();
        if (session?.user) {
          setUserId(session.user.id);
          setIsAuthenticated(true);
        }
      } catch {
        // No session — user will need to log in
      }
      setAuthChecked(true);

      // RevenueCat
      await initRevenueCat();
      const tier = await getCurrentTier();
      if (tier !== 'free') {
        setSubscription(tier);
      }
    }
    setup();

    const unsubRevenueCat = onSubscriptionChange((tier) => {
      setSubscription(tier);
    });

    const unsubAuth = onAuthStateChange((userId) => {
      if (userId) {
        setUserId(userId);
        setIsAuthenticated(true);
        setCrashUser({ id: userId });
      } else {
        setUserId(null);
        setIsAuthenticated(false);
        setCrashUser(null);
      }
    });

    return () => {
      unsubRevenueCat();
      unsubAuth();
    };
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsReady || !authChecked) return null;

  if (showAnimatedSplash) {
    return (
      <AnimatedSplashScreen onFinish={() => setShowAnimatedSplash(false)} />
    );
  }

  // Auth flow
  const renderAuthScreen = () => {
    switch (authScreen) {
      case 'register':
        return (
          <RegisterScreen
            onNavigateLogin={() => setAuthScreen('login')}
            onRegistered={(email, password) => {
              setPendingEmail(email);
              setPendingPassword(password);
              setAuthScreen('verify');
            }}
          />
        );
      case 'verify':
        return (
          <VerifyEmailScreen
            email={pendingEmail}
            password={pendingPassword}
            onBackToLogin={() => setAuthScreen('login')}
          />
        );
      default:
        return (
          <LoginScreen
            onNavigateRegister={() => setAuthScreen('register')}
          />
        );
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider onLayout={onLayoutRootView}>
          {isAuthenticated ? (
            <NavigationContainer theme={navTheme}>
              {onboardingComplete ? <BottomTabNavigator /> : <OnboardingScreen />}
              <StatusBar style="light" />
            </NavigationContainer>
          ) : (
            <>
              {renderAuthScreen()}
              <StatusBar style="light" />
            </>
          )}
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
