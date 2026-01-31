import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import StylishLoader from '../components/StylishLoader';
import { useTheme } from '../context/ThemeContext';
import { returnAPI, categoryAPI } from '../services/api';

const GRADIENTS = [
  ['#667eea', '#764ba2'],
  ['#f093fb', '#f5576c'],
  ['#fa709a', '#fee140'],
];

export default function ReturnsScreen() {
  const { colors } = useTheme();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [searchTerm]);

  useFocusEffect(
    useCallback(() => {
      fetchReturns();
    }, [searchTerm])
  );

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const { data } = await returnAPI.getProducts({ keyword: searchTerm, limit: 100 });
      setItems(data.products || data || []);
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await categoryAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const categoryFilteredItems = categoryFilter === 'all' ? items : items.filter((i) => (i.category?._id || i.category) === categoryFilter);
  const filteredItems = categoryFilteredItems.filter(
    (i) =>
      (i.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.category?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalReturns: filteredItems.reduce((s, i) => s + (i.returned || 0), 0),
    totalValue: filteredItems.reduce((s, i) => s + (i.returned || 0) * (i.price || 0), 0),
  };

  const renderItem = ({ item, index }) => (
    <View style={[styles.card, { borderTopColor: GRADIENTS[index % GRADIENTS.length][0] }]}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardCat}>{item.category?.name || item.category}</Text>
      <View style={styles.stats}>
        <View style={styles.stat}><Text style={styles.statLabel}>Total</Text><Text style={styles.statValue}>{item.totalStock || 0}</Text></View>
        <View style={styles.stat}><Text style={[styles.statLabel, { color: '#ed6c02' }]}>Return</Text><Text style={[styles.statValue, { color: '#ed6c02' }]}>{item.returned || 0}</Text></View>
        <View style={styles.stat}><Text style={styles.statLabel}>Price</Text><Text style={styles.statValue}>₹{(item.price || 0).toFixed(2)}</Text></View>
        <View style={styles.stat}><Text style={[styles.statLabel, { color: '#d32f2f' }]}>Value</Text><Text style={[styles.statValue, { color: '#d32f2f' }]}>₹{((item.returned || 0) * (item.price || 0)).toFixed(2)}</Text></View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Total returns</Text>
          {loading ? <StylishLoader size="small" variant="dots" color="#ed6c02" /> : <Text style={[styles.statCardValue, { color: '#ed6c02' }]}>{stats.totalReturns}</Text>}
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Total value</Text>
          {loading ? <StylishLoader size="small" variant="dots" color="#d32f2f" /> : <Text style={[styles.statCardValue, { color: '#d32f2f' }]}>₹{stats.totalValue.toFixed(2)}</Text>}
        </View>
      </View>
      <Text style={[styles.inputLabel, { color: colors.text }]}>Search returned boxes</Text>
      <TextInput
        style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        placeholder="Search returned boxes..."
        placeholderTextColor={colors.placeholder}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, categoryFilter === 'all' && styles.filterChipActive]} onPress={() => setCategoryFilter('all')}>
          <Text style={[styles.filterText, categoryFilter === 'all' && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map((c) => (
          <TouchableOpacity key={c._id} style={[styles.filterChip, categoryFilter === c._id && styles.filterChipActive]} onPress={() => setCategoryFilter(c._id)}>
            <Text style={[styles.filterText, categoryFilter === c._id && styles.filterTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <View style={styles.loader}>
          <StylishLoader size="large" color="#667eea" />
        </View>
      ) : (
        <FlatList data={filteredItems} keyExtractor={(item) => item._id} renderItem={renderItem} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No returned boxes</Text>} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  statCardLabel: { fontSize: 14, color: '#666', marginBottom: 4 },
  statCardValue: { fontSize: 22, fontWeight: 'bold' },
  inputLabel: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  search: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  filterChip: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#f0f0f0', borderRadius: 8 },
  filterChipActive: { backgroundColor: '#667eea' },
  filterText: { fontSize: 15, fontWeight: '500' },
  filterTextActive: { color: 'white' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  list: { paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#666', marginTop: 40, fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderTopWidth: 4 },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  cardCat: { fontSize: 14, color: '#666', marginTop: 4 },
  stats: { flexDirection: 'row', marginTop: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 12, color: '#666' },
  statValue: { fontSize: 16, fontWeight: 'bold' },
});
