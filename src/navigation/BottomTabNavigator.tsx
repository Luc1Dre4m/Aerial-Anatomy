import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  CuerpoScreen,
  MusculosScreen,
  MovimientosScreen,
  CadenasScreen,
  EstudioScreen,
} from '../screens';
import { MuscleDetailScreen } from '../screens/MuscleDetailScreen';
import { MovementDetailScreen } from '../screens/MovementDetailScreen';
import { ChainDetailScreen } from '../screens/ChainDetailScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { PreTrainingScreen } from '../screens/PreTrainingScreen';
import { TrainingLogScreen } from '../screens/TrainingLogScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { PoseAnalysisScreen } from '../screens/PoseAnalysisScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS: Record<string, React.ComponentProps<typeof MaterialCommunityIcons>['name']> = {
  CuerpoTab: 'human',
  MusculosTab: 'arm-flex',
  MovimientosTab: 'yoga',
  CadenasTab: 'link-variant',
  EstudioTab: 'cards-outline',
};

const stackScreenOptions = {
  headerShown: false,
  animation: 'slide_from_right' as const,
  animationDuration: 250,
};

function CuerpoStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="CuerpoMain" component={CuerpoScreen} />
      <Stack.Screen name="MuscleDetail" component={MuscleDetailScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

function CadenasStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="CadenasMain" component={CadenasScreen} />
      <Stack.Screen name="ChainDetail" component={ChainDetailScreen} />
      <Stack.Screen name="MovementDetail" component={MovementDetailScreen} />
      <Stack.Screen name="MuscleDetail" component={MuscleDetailScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

function MovimientosStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="MovimientosMain" component={MovimientosScreen} />
      <Stack.Screen name="MovementDetail" component={MovementDetailScreen} />
      <Stack.Screen name="MuscleDetail" component={MuscleDetailScreen} />
      <Stack.Screen name="PreTraining" component={PreTrainingScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

function MusculosStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="MusculosMain" component={MusculosScreen} />
      <Stack.Screen name="MuscleDetail" component={MuscleDetailScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

function EstudioStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="EstudioMain" component={EstudioScreen} />
      <Stack.Screen name="MuscleDetail" component={MuscleDetailScreen} />
      <Stack.Screen name="MovementDetail" component={MovementDetailScreen} />
      <Stack.Screen name="TrainingLog" component={TrainingLogScreen} />
      <Stack.Screen name="PoseAnalysis" component={PoseAnalysisScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
    </Stack.Navigator>
  );
}

function TabIcon({ name, size, color, focused }: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  size: number;
  color: string;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      Animated.spring(scale, {
        toValue: 1.15,
        friction: 5,
        tension: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [focused, scale]);

  return (
    <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
      {focused && (
        <View style={{
          position: 'absolute',
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${colors.accent.primary}15`,
          top: -4,
        }} />
      )}
      <MaterialCommunityIcons name={name} size={size} color={color} />
      {focused && (
        <View style={{
          width: 4,
          height: 4,
          borderRadius: 2,
          backgroundColor: colors.accent.primary,
          marginTop: 2,
        }} />
      )}
    </Animated.View>
  );
}

export function BottomTabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => (
          <TabIcon
            name={TAB_ICONS[route.name] ?? 'help-circle'}
            size={size}
            color={color}
            focused={focused}
          />
        ),
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarStyle: {
          backgroundColor: colors.bg.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600' as const,
        },
      })}
    >
      <Tab.Screen
        name="CuerpoTab"
        component={CuerpoStack}
        options={{ tabBarLabel: t('tabs.cuerpo') }}
      />
      <Tab.Screen
        name="MusculosTab"
        component={MusculosStack}
        options={{ tabBarLabel: t('tabs.musculos') }}
      />
      <Tab.Screen
        name="MovimientosTab"
        component={MovimientosStack}
        options={{ tabBarLabel: t('tabs.movimientos') }}
      />
      <Tab.Screen
        name="CadenasTab"
        component={CadenasStack}
        options={{ tabBarLabel: t('tabs.cadenas') }}
      />
      <Tab.Screen
        name="EstudioTab"
        component={EstudioStack}
        options={{ tabBarLabel: t('tabs.estudio') }}
      />
    </Tab.Navigator>
  );
}
