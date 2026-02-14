import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import StylishLoader from '../components/StylishLoader';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login: onLogin } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(120);
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.92);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 600 });

    cardTranslateY.value = withDelay(
      400,
      withSpring(0, { damping: 18, stiffness: 80 })
    );
    cardOpacity.value = withDelay(350, withTiming(1, { duration: 450 }));
    cardScale.value = withDelay(
      400,
      withSpring(1, { damping: 18, stiffness: 80 })
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: cardTranslateY.value },
      { scale: cardScale.value },
    ],
    opacity: cardOpacity.value,
  }));

  const handleSubmit = async () => {
    if (pin.length < 4) {
      setError(t('login.errorMinDigits'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.login(pin);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || t('login.errorInvalidPin'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0f0c29', '#1a1a2e', '#16213e', '#24243e']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar style="light" />
      <View style={[styles.hero, { paddingTop: insets.top + 80 }]}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoRing}>
            <View style={styles.logoInner}>
              <Text style={styles.logoEmoji}>🔧</Text>
            </View>
          </View>
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.delay(200).duration(500).springify()}
          style={styles.brandName}
        >
          {t('login.brand')}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(350).duration(500).springify()}
          style={styles.tagline}
        >
          {t('login.tagline')}
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(450).duration(500).springify()}
          style={styles.location}
        >
          {t('login.location')}
        </Animated.Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.formWrapper, { paddingBottom: insets.bottom }]}
      >
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <Text style={styles.welcome}>{t('login.welcome')}</Text>
          <Text style={styles.hint}>{t('login.hint')}</Text>

          {error ? (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={styles.errorBanner}
            >
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="••••"
              placeholderTextColor="#94a3b8"
              value={pin}
              onChangeText={setPin}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (pin.length < 4 || loading) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={pin.length < 4 || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={
                pin.length >= 4 && !loading
                  ? ['#6366f1', '#8b5cf6']
                  : ['#64748b', '#475569']
              }
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <StylishLoader size="small" variant="dots" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>{t('login.signIn')}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footer}>{t('login.footer')}</Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 40,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    letterSpacing: 1,
  },
  location: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  formWrapper: {
    flex: 1,
    paddingHorizontal: 0,
    marginTop: 0,
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  hint: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 24,
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 18,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
    color: '#0f172a',
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footer: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
  },
});
