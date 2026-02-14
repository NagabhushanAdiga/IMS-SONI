import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { productAPI, categoryAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import CustomSnackbar from '../components/Snackbar';

const getCurrentMonthDates = () => {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: fmt(first), end: fmt(last) };
};

const formatDisplayDate = (dateStr, locale = 'en-IN') => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};

const parseDateStr = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export default function SearchScreen() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const dateLocale = i18n.language === 'kn' ? 'kn-IN' : 'en-IN';
  const defaultDates = getCurrentMonthDates();
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState(null);
  const [items, setItems] = useState([]);
  const [searching, setSearching] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showPicker, setShowPicker] = useState(null); // 'start' | 'end' | null

  const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowPicker(null);
    if (event.type === 'dismissed') return;
    const dateStr = fmt(selectedDate);
    if (showPicker === 'start') setStartDate(dateStr);
    else if (showPicker === 'end') setEndDate(dateStr);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await categoryAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      setSnackbar({ open: true, message: t('search.selectDates'), severity: 'error' });
      return;
    }
    setSearching(true);
    try {
      const { data } = await productAPI.getAll({ startDate, endDate });
      const allItems = data.products || [];
      const itemsSold = allItems.reduce((s, i) => s + (i.sold || 0), 0);
      const itemsReturned = allItems.reduce((s, i) => s + (i.returned || 0), 0);
      const itemsAvailable = allItems.reduce((s, i) => s + (i.stock || 0), 0);
      const soldValue = allItems.reduce((s, i) => s + (i.sold || 0) * (i.price || 0), 0);
      const returnedValue = allItems.reduce((s, i) => s + (i.returned || 0) * (i.price || 0), 0);
      const availableValue = allItems.reduce((s, i) => s + (i.stock || 0) * (i.price || 0), 0);
      setResults({ itemsSold, itemsReturned, itemsAvailable, soldValue, returnedValue, availableValue });
      setItems(allItems);
      setSnackbar({ open: true, message: t('search.foundBoxes', { count: allItems.length }), severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || t('search.searchFailed'), severity: 'error' });
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    const d = getCurrentMonthDates();
    setStartDate(d.start);
    setEndDate(d.end);
    setFilter('all');
    setCategoryFilter('all');
    setResults(null);
    setItems([]);
  };

  const getFilteredItems = () => {
    let f = items;
    if (categoryFilter !== 'all') f = f.filter((i) => (i.category?._id || i.category) === categoryFilter);
    if (filter === 'sold') return f.filter((i) => (i.sold || 0) > 0);
    if (filter === 'returned') return f.filter((i) => (i.returned || 0) > 0);
    if (filter === 'inStock') return f.filter((i) => (i.stock || 0) > 0);
    return f;
  };

  const filteredItems = getFilteredItems();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.form}>
        <TouchableOpacity
          style={[styles.datePickerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowPicker('start')}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={28} color={colors.primary} style={styles.dateIcon} />
          <Text style={[styles.datePickerText, { color: colors.text }]}>{t('search.start')}: {formatDisplayDate(startDate, dateLocale)}</Text>
          <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.datePickerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowPicker('end')}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={28} color={colors.primary} style={styles.dateIcon} />
          <Text style={[styles.datePickerText, { color: colors.text }]}>{t('search.end')}: {formatDisplayDate(endDate, dateLocale)}</Text>
          <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        {showPicker && (
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={showPicker === 'start' ? parseDateStr(startDate) : parseDateStr(endDate)}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              onChange={handleDateChange}
              maximumDate={showPicker === 'start' ? parseDateStr(endDate) : new Date()}
              minimumDate={showPicker === 'end' ? parseDateStr(startDate) : undefined}
              style={Platform.OS === 'ios' ? styles.iosPicker : undefined}
            />
          </View>
        )}
        {Platform.OS === 'ios' && showPicker && (
          <TouchableOpacity style={styles.doneBtn} onPress={() => setShowPicker(null)}>
            <Text style={styles.doneBtnText}>{t('common.done')}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset} disabled={searching}>
            <Text style={styles.resetBtnText}>{t('common.reset')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} disabled={searching}>
            <Text style={styles.searchBtnText}>{searching ? t('common.searching') : t('common.search')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {results && (
        <>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderLeftColor: '#11998e' }]}>
              <Text style={styles.statLabel}>{t('search.sold')}</Text>
              <Text style={styles.statValue}>{results.itemsSold}</Text>
              <Text style={styles.statSub}>₹{results.soldValue.toFixed(2)}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#f5576c' }]}>
              <Text style={styles.statLabel}>{t('search.returned')}</Text>
              <Text style={styles.statValue}>{results.itemsReturned}</Text>
              <Text style={styles.statSub}>₹{results.returnedValue.toFixed(2)}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#667eea' }]}>
              <Text style={styles.statLabel}>{t('search.inStock')}</Text>
              <Text style={styles.statValue}>{results.itemsAvailable}</Text>
              <Text style={styles.statSub}>₹{results.availableValue.toFixed(2)}</Text>
            </View>
          </View>
          <Text style={styles.netLabel}>{t('search.net')}: ₹{(results.soldValue - results.returnedValue).toFixed(2)}</Text>
          <View style={styles.filterRow}>
            {['all', 'sold', 'returned', 'inStock'].map((f) => (
              <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f === 'all' ? t('common.all') : f === 'inStock' ? t('search.inStock') : t(`search.${f}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemCat}>{item.category?.name || item.category}</Text>
                <View style={styles.itemStats}>
                  <Text style={styles.itemStat}>{t('search.total')}: {item.totalStock || 0}</Text>
                  <Text style={[styles.itemStat, { color: '#d32f2f' }]}>{t('search.sold')}: {item.sold || 0}</Text>
                  <Text style={[styles.itemStat, { color: '#ed6c02' }]}>{t('search.returned')}: {item.returned || 0}</Text>
                  <Text style={[styles.itemStat, { color: '#2e7d32' }]}>{t('search.inStock')}: {item.stock || 0}</Text>
                </View>
              </View>
            )}
            contentContainerStyle={styles.list}
          />
        </>
      )}

      {!results && !searching && (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{t('search.hint')}</Text>
      )}

      <CustomSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  form: { marginBottom: 24 },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  dateIcon: { marginRight: 14 },
  datePickerText: { flex: 1, fontSize: 18, fontWeight: '500' },
  pickerWrapper: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 1.15 }],
  },
  iosPicker: {
    width: '100%',
    height: 360,
  },
  doneBtn: { paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  doneBtnText: { fontSize: 17, fontWeight: '600', color: '#667eea' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  resetBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetBtnText: { color: '#667eea', fontWeight: '600', fontSize: 16 },
  searchBtn: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, borderLeftWidth: 4 },
  statLabel: { fontSize: 13, color: '#666' },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statSub: { fontSize: 14, color: '#666' },
  netLabel: { fontSize: 18, fontWeight: 'bold', color: '#2e7d32', marginBottom: 16 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  filterChip: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#f0f0f0', borderRadius: 8 },
  filterChipActive: { backgroundColor: '#667eea' },
  filterText: { fontSize: 15, fontWeight: '500' },
  filterTextActive: { color: 'white' },
  list: { paddingBottom: 24 },
  itemCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#667eea' },
  itemTitle: { fontSize: 18, fontWeight: 'bold' },
  itemCat: { fontSize: 14, color: '#666', marginTop: 4 },
  itemStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  itemStat: { fontSize: 14 },
  hint: { textAlign: 'center', color: '#666', marginTop: 40, fontSize: 16 },
});
