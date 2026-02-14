import React from 'react';
import { useTranslation } from 'react-i18next';
import { View, StyleSheet, Platform } from 'react-native';
import StylishLoader from './src/components/StylishLoader';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import FolderScreen from './src/screens/FolderScreen';
import FolderItemsScreen from './src/screens/FolderItemsScreen';
import ReturnsScreen from './src/screens/ReturnsScreen';
import SearchScreen from './src/screens/SearchScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DeveloperScreen from './src/screens/DeveloperScreen';
import MoreMenuScreen from './src/screens/MoreMenuScreen';
import SalesScreen from './src/screens/SalesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const HEADER_BG = '#16213e';

function FoldersStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: HEADER_BG },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen name="FolderList" component={FolderScreen} options={{ title: t('nav.folders') }} />
      <Stack.Screen
        name="FolderItems"
        component={FolderItemsScreen}
        options={({ route }) => ({ title: route.params?.folderName || t('nav.folder') })}
      />
    </Stack.Navigator>
  );
}

function MoreStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: HEADER_BG },
        headerTintColor: '#fff',
      }}
    >
      <Stack.Screen
        name="MoreMenu"
        component={MoreMenuScreen}
        options={{ title: t('nav.more'), headerShown: true }}
      />
      <Stack.Screen name="Folders" component={FolderScreen} options={{ title: t('nav.folders') }} />
      <Stack.Screen
        name="FolderItems"
        component={FolderItemsScreen}
        options={({ route }) => ({ title: route.params?.folderName || t('nav.folder') })}
      />
      <Stack.Screen name="Sales" component={SalesScreen} options={{ title: t('nav.sales') }} />
      <Stack.Screen name="Returns" component={ReturnsScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('nav.settings'), headerShown: true }}
      />
      <Stack.Screen name="Developer" component={DeveloperScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const bottomInset = Platform.OS === 'android' ? Math.max(24, insets.bottom) : insets.bottom;
  const tabBarPaddingBottom = 8 + bottomInset;
  const tabBarHeight = 60 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: HEADER_BG },
        headerTintColor: '#fff',
        headerTitleStyle: { fontSize: 18, fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 2,
          borderTopColor: colors.border,
          height: tabBarHeight,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 8,
          elevation: 12,
          shadowColor: '#16213e',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600' },
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Folders') iconName = focused ? 'folder' : 'folder-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'More') iconName = focused ? 'menu' : 'menu-outline';
          return <Ionicons name={iconName} size={26} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Soni Traders', tabBarLabel: t('tabs.home') }}
      />
      <Tab.Screen
        name="Folders"
        component={FoldersStack}
        options={{ headerShown: false, tabBarLabel: t('tabs.folders') }}
      />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: t('tabs.search') }} />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{ headerShown: false, tabBarLabel: t('tabs.more') }}
      />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return <StylishLoader fullScreen color={colors.primary} message={t('common.loading')} backgroundColor={colors.background} />;
}

function AppContent() {
  const { navTheme, isDark } = useTheme();
  return (
    <NavigationContainer theme={navTheme}>
      <AppNavigator />
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}

function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});
