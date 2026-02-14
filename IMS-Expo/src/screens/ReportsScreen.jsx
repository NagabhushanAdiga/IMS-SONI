import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import StylishLoader from '../components/StylishLoader';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { productAPI, categoryAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import StatCard from '../components/StatCard';

export default function ReportsScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [allProducts, setAllProducts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      fetchReportsData();
    }, [])
  );

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        productAPI.getAll({ limit: 1000 }),
        categoryAPI.getAll(),
      ]);
      setAllProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredStats = () => {
    let products = allProducts;
    if (categoryFilter !== 'all') {
      products = products.filter((p) => (p.category?._id || p.category) === categoryFilter);
    }
    return {
      totalBoxes: products.length,
      soldBoxes: products.reduce((s, p) => s + (p.sold || 0), 0),
      returnedBoxes: products.reduce((s, p) => s + (p.returned || 0), 0),
      soldValue: products.reduce((s, p) => s + (p.sold || 0) * (p.price || 0), 0),
      returnedValue: products.reduce((s, p) => s + (p.returned || 0) * (p.price || 0), 0),
    };
  };

  const stats = getFilteredStats();
  const locale = i18n.language === 'kn' ? 'kn-IN' : 'en-IN';
  const monthName = new Date().toLocaleString(locale, { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <StylishLoader size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{monthName} {t('reports.report')}</Text>
      <Text style={styles.subtitle}>
        {categoryFilter === 'all' ? t('reports.allFolders') : categories.find((c) => c._id === categoryFilter)?.name || t('reports.selected')}
      </Text>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterChipWrapper}
          onPress={() => setCategoryFilter('all')}
          activeOpacity={0.8}
        >
          {categoryFilter === 'all' ? (
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.filterChipActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.filterTextActive}>{t('common.all')}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.filterChip}>
              <Text style={styles.filterText}>{t('common.all')}</Text>
            </View>
          )}
        </TouchableOpacity>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat._id}
            style={styles.filterChipWrapper}
            onPress={() => setCategoryFilter(cat._id)}
            activeOpacity={0.8}
          >
            {categoryFilter === cat._id ? (
              <LinearGradient colors={['#667eea', '#764ba2']} style={styles.filterChipActive} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.filterTextActive}>{cat.name}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.filterChip}>
                <Text style={styles.filterText}>{cat.name}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.cardsContainer}>
        <StatCard
          title={t('reports.totalBoxes')}
          value={stats.totalBoxes}
          gradient={['#667eea', '#764ba2']}
          icon="cube-outline"
        />
        <StatCard
          title={t('reports.boxesSold')}
          value={stats.soldBoxes}
          gradient={['#11998e', '#38ef7d']}
          icon="cart-outline"
        />
        <StatCard
          title={t('reports.boxesReturned')}
          value={stats.returnedBoxes}
          gradient={['#f093fb', '#f5576c']}
          icon="return-down-back-outline"
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>{t('reports.netSoldReturned')}</Text>
        <Text style={styles.summaryValue}>₹{(stats.soldValue - stats.returnedValue).toFixed(2)}</Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>{t('reports.returnRate')}</Text>
        <Text style={styles.summaryValue}>
          {stats.soldBoxes > 0 ? ((stats.returnedBoxes / stats.soldBoxes) * 100).toFixed(1) : 0}%
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, color: '#1e293b' },
  subtitle: { color: '#64748b', marginBottom: 16, fontSize: 16 },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    marginHorizontal: -6,
  },
  filterChipWrapper: {
    marginHorizontal: 6,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipActive: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
  },
  filterText: { fontSize: 15, fontWeight: '600', color: '#667eea' },
  filterTextActive: { fontSize: 15, fontWeight: '600', color: '#fff' },
  cardsContainer: { marginBottom: 8 },
  summary: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryLabel: { fontSize: 13, color: '#64748b', marginBottom: 6 },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: '#059669' },
});
