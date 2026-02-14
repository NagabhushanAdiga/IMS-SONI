import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import StylishLoader from '../components/StylishLoader';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { productAPI, categoryAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import CustomSnackbar from '../components/Snackbar';
import ConfirmationDialog from '../components/ConfirmationDialog';

const GRADIENTS = [
  ['#667eea', '#764ba2'],
  ['#11998e', '#38ef7d'],
  ['#3a7bd5', '#00d2ff'],
  ['#f093fb', '#f5576c'],
];

const getStatusColor = (status) => {
  const colors = { 'In Stock': '#2e7d32', 'Low Stock': '#ed6c02', 'Out of Stock': '#d32f2f' };
  return colors[status] || '#666';
};

export default function FolderItemsScreen({ route, navigation }) {
  const { t } = useTranslation();
  const { folderId, folderName } = route.params || {};
  const { colors } = useTheme();
  const [folder, setFolder] = useState(null);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', totalStock: '', sold: '0', returned: '0', price: '' });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (folderId) {
        fetchFolder();
        fetchItems();
        fetchCategories();
      }
    }, [folderId])
  );

  const fetchFolder = async () => {
    try {
      const { data } = await categoryAPI.getOne(folderId);
      setFolder(data);
    } catch (error) {
      console.error('Error fetching folder:', error);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await productAPI.getAll();
      const allItems = data.products || [];
      const folderItems = allItems.filter((item) => (item.category?._id || item.category) === folderId);
      setItems(folderItems);
    } catch (error) {
      console.error('Error fetching items:', error);
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

  const getFilteredItems = () => {
    let filtered = items.filter((item) => item.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filter === 'inStock') filtered = filtered.filter((i) => i.status === 'In Stock');
    if (filter === 'sold') filtered = filtered.filter((i) => (i.sold || 0) > 0);
    if (filter === 'returned') filtered = filtered.filter((i) => (i.returned || 0) > 0);
    return filtered;
  };

  const filteredItems = getFilteredItems();

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        totalStock: product.totalStock?.toString() || '',
        sold: product.sold?.toString() || '0',
        returned: product.returned?.toString() || '0',
        price: product.price?.toString() || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', totalStock: '', sold: '0', returned: '0', price: '' });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setSnackbar({ open: true, message: t('folderItems.boxNameRequired'), severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      const itemName = formData.name.trim();
      const sku = editingProduct?.sku || `${itemName}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const productData = {
        name: itemName,
        sku,
        category: folderId,
        totalStock: parseInt(formData.totalStock || 0),
        sold: parseInt(formData.sold || 0),
        returned: parseInt(formData.returned || 0),
        price: parseFloat(formData.price || 0),
      };
      if (editingProduct) {
        await productAPI.update(editingProduct._id, productData);
      } else {
        await productAPI.create(productData);
      }
      setOpenDialog(false);
      fetchItems();
      setSnackbar({ open: true, message: editingProduct ? t('folderItems.boxUpdated') : t('folderItems.boxAdded'), severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || t('folderItems.errorSaving'), severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product) => setDeleteTarget(product);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productAPI.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchItems();
      setSnackbar({ open: true, message: t('folderItems.boxDeleted'), severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || t('folderItems.errorDeleting'), severity: 'error' });
    }
  };

  const renderItem = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(350).springify()}>
      <View style={[styles.card, { borderTopColor: GRADIENTS[index % GRADIENTS.length][0] }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.stats}>
          <View style={styles.stat}><Text style={styles.statLabel}>{t('folderItems.total')}</Text><Text style={styles.statValue}>{item.totalStock || 0}</Text></View>
          <View style={styles.stat}><Text style={[styles.statLabel, { color: '#d32f2f' }]}>{t('folderItems.sold')}</Text><Text style={[styles.statValue, { color: '#d32f2f' }]}>{item.sold || 0}</Text></View>
          <View style={styles.stat}><Text style={[styles.statLabel, { color: '#ed6c02' }]}>{t('folderItems.return')}</Text><Text style={[styles.statValue, { color: '#ed6c02' }]}>{item.returned || 0}</Text></View>
          <View style={styles.stat}><Text style={[styles.statLabel, { color: '#2e7d32' }]}>{t('folderItems.stock')}</Text><Text style={[styles.statValue, { color: '#2e7d32' }]}>{item.stock || 0}</Text></View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenDialog(item)}><Text style={styles.editBtnText}>{t('common.edit')}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.delBtn} onPress={() => handleDelete(item)}><Text style={styles.delBtnText}>{t('common.delete')}</Text></TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInUp.delay(0).duration(300).springify()}>
        <Text style={[styles.header, { color: colors.text }]}>{folder?.name || folderName || t('common.loading')}</Text>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(80).duration(300).springify()}>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenDialog()}>
          <Text style={styles.addBtnText}>{t('folderItems.addBox')}</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(160).duration(300).springify()}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('folderItems.searchBoxes')}</Text>
        <TextInput
          style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder={t('folderItems.searchPlaceholder')}
          placeholderTextColor={colors.placeholder}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(240).duration(300).springify()} style={styles.filterRow}>
        {['all', 'inStock', 'sold', 'returned'].map((f) => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f === 'all' ? t('common.all') : f === 'inStock' ? t('folderItems.inStock') : t(`folderItems.${f}`)}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
      {loading ? (
        <View style={styles.loader}>
          <StylishLoader size="large" color="#667eea" />
        </View>
      ) : (
        <FlatList data={filteredItems} keyExtractor={(item) => item._id} renderItem={renderItem} contentContainerStyle={styles.list} />
      )}

      <Modal visible={openDialog} transparent animationType="slide" onRequestClose={() => setOpenDialog(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingProduct ? t('folderItems.editBox') : t('folderItems.addBoxTitle')}</Text>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" style={styles.modalScroll}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('folderItems.boxName')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder={t('folderItems.boxNamePlaceholder')}
              placeholderTextColor={colors.placeholder}
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
            />
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('folderItems.totalStock')}</Text>
            <View style={styles.soldRow}>
              <TouchableOpacity
                style={[styles.incDecBtn, { backgroundColor: colors.border || '#e2e8f0' }]}
                onPress={() => {
                  const v = Math.max(0, parseInt(formData.totalStock || 0, 10) - 1);
                  setFormData({ ...formData, totalStock: String(v) });
                }}
              >
                <Text style={styles.incDecText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.soldInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder={t('folderItems.totalStockPlaceholder')}
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={formData.totalStock}
                onChangeText={(t) => setFormData({ ...formData, totalStock: t })}
              />
              <TouchableOpacity
                style={[styles.incDecBtn, { backgroundColor: colors.border || '#e2e8f0' }]}
                onPress={() => {
                  const v = parseInt(formData.totalStock || 0, 10) + 1;
                  setFormData({ ...formData, totalStock: String(v) });
                }}
              >
                <Text style={styles.incDecText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('folderItems.sold')}</Text>
            <View style={styles.soldRow}>
              <TouchableOpacity
                style={[styles.incDecBtn, { backgroundColor: colors.border || '#e2e8f0' }]}
                onPress={() => {
                  const v = Math.max(0, parseInt(formData.sold || 0, 10) - 1);
                  setFormData({ ...formData, sold: String(v) });
                }}
              >
                <Text style={styles.incDecText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.soldInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder={t('folderItems.soldCount')}
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={formData.sold}
                onChangeText={(t) => setFormData({ ...formData, sold: t })}
              />
              <TouchableOpacity
                style={[styles.incDecBtn, { backgroundColor: colors.border || '#e2e8f0' }]}
                onPress={() => {
                  const v = parseInt(formData.sold || 0, 10) + 1;
                  setFormData({ ...formData, sold: String(v) });
                }}
              >
                <Text style={styles.incDecText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('folderItems.returned')}</Text>
            <View style={styles.soldRow}>
              <TouchableOpacity
                style={[styles.incDecBtn, { backgroundColor: colors.border || '#e2e8f0' }]}
                onPress={() => {
                  const v = Math.max(0, parseInt(formData.returned || 0, 10) - 1);
                  setFormData({ ...formData, returned: String(v) });
                }}
              >
                <Text style={styles.incDecText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.soldInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder={t('folderItems.returnedPlaceholder')}
                placeholderTextColor={colors.placeholder}
                keyboardType="numeric"
                value={formData.returned}
                onChangeText={(t) => setFormData({ ...formData, returned: t })}
              />
              <TouchableOpacity
                style={[styles.incDecBtn, { backgroundColor: colors.border || '#e2e8f0' }]}
                onPress={() => {
                  const v = parseInt(formData.returned || 0, 10) + 1;
                  setFormData({ ...formData, returned: String(v) });
                }}
              >
                <Text style={styles.incDecText}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('folderItems.price')}</Text>
            <View style={styles.soldRow}>
              <TouchableOpacity
                style={[styles.incDecBtn, { backgroundColor: colors.border || '#e2e8f0' }]}
                onPress={() => {
                  const v = Math.max(0, parseFloat(formData.price || 0) - 1);
                  setFormData({ ...formData, price: String(v) });
                }}
              >
                <Text style={styles.incDecText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={[styles.soldInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                placeholder={t('folderItems.pricePlaceholder')}
                placeholderTextColor={colors.placeholder}
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(t) => setFormData({ ...formData, price: t })}
              />
              <TouchableOpacity
                style={[styles.incDecBtn, { backgroundColor: colors.border || '#e2e8f0' }]}
                onPress={() => {
                  const v = parseFloat(formData.price || 0) + 1;
                  setFormData({ ...formData, price: String(v) });
                }}
              >
                <Text style={styles.incDecText}>+</Text>
              </TouchableOpacity>
            </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setOpenDialog(false)}>
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? t('common.loading') : editingProduct ? t('common.update') : t('common.add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmationDialog
        visible={!!deleteTarget}
        title={t('folderItems.deleteBox')}
        message={deleteTarget ? t('folderItems.deleteBoxConfirm', { name: deleteTarget.name }) : ''}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        variant="destructive"
        icon="trash-outline"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <CustomSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  addBtn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#667eea', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16, width: '100%' },
  addBtnText: { color: '#667eea', fontWeight: '600', fontSize: 14 },
  search: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, marginBottom: 12 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  filterChip: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#f0f0f0', borderRadius: 8 },
  filterChipActive: { backgroundColor: '#667eea' },
  filterText: { fontSize: 15, fontWeight: '500' },
  filterTextActive: { color: 'white' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  list: { paddingBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, marginBottom: 14, borderTopWidth: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 24, fontWeight: 'bold', flex: 1 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  statusText: { color: 'white', fontSize: 17, fontWeight: '600' },
  stats: { flexDirection: 'row', marginTop: 20, marginBottom: 20 },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 17, color: '#666', marginBottom: 6 },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  cardActions: { flexDirection: 'row', gap: 10 },
  editBtn: { flex: 1, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#667eea', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  editBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  delBtn: { flex: 1, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#d32f2f', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  delBtnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: 'white', borderRadius: 12, padding: 24 },
  modalScroll: { maxHeight: 400 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  inputLabel: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  soldRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  incDecBtn: { width: 44, height: 48, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  incDecText: { fontSize: 24, fontWeight: '600', color: '#333' },
  soldInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, fontSize: 16, textAlign: 'center' },
  modalActions: { marginTop: 20, gap: 12 },
  cancelBtn: { width: '100%', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  cancelBtnText: { color: '#64748b', fontWeight: '600', fontSize: 17 },
  saveBtn: { width: '100%', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', backgroundColor: '#667eea' },
  saveBtnText: { color: 'white', fontWeight: '600', fontSize: 17 },
});
