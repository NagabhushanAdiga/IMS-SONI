import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import StylishLoader from '../components/StylishLoader';
import StatCard from '../components/StatCard';
import { useTheme } from '../context/ThemeContext';
import { productAPI } from '../services/api';

const CARDS = [
  { key: 'totalStockAdded', title: 'Total stock added', gradient: ['#667eea', '#764ba2'], icon: 'add-circle-outline' },
  { key: 'totalSold', title: 'Boxes Sold', gradient: ['#11998e', '#38ef7d'], icon: 'cart-outline' },
  { key: 'totalReturned', title: 'Boxes Returned', gradient: ['#f093fb', '#f5576c'], icon: 'return-down-back-outline' },
  { key: 'totalRemaining', title: 'Boxes Remaining', gradient: ['#3a7bd5', '#00d2ff'], icon: 'cube-outline' },
];

export default function DashboardScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const statsRes = await productAPI.getStats();
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <StylishLoader size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {CARDS.map(({ key, title, gradient, icon }, index) => (
        <Animated.View
          key={key}
          entering={FadeInUp.delay(index * 100).duration(400).springify()}
        >
          <StatCard
            title={title}
            value={stats?.[key] ?? 0}
            gradient={gradient}
            icon={icon}
          />
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
