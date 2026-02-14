import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import StylishLoader from '../components/StylishLoader';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { categoryAPI, productAPI } from '../services/api';
import { useTranslation } from 'react-i18next';
import CustomSnackbar from '../components/Snackbar';
import ConfirmationDialog from '../components/ConfirmationDialog';

const GRADIENTS = [
  ['#667eea', '#764ba2'],
  ['#11998e', '#38ef7d'],
  ['#3a7bd5', '#00d2ff'],
  ['#f093fb', '#f5576c'],
  ['#fa709a', '#fee140'],
  ['#30cfd0', '#330867'],
];

export default function FolderScreen({ navigation }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([categoryAPI.getAll(), productAPI.getAll()]);
      const cats = catRes.data || [];
      const products = prodRes.data?.products || [];
      const totalStockByCategory = {};
      products.forEach((p) => {
        const catId = p.category?._id || p.category;
        if (catId) {
          totalStockByCategory[catId] = (totalStockByCategory[catId] || 0) + (p.stock || 0);
        }
      });
      setCategories(
        cats.map((c) => ({ ...c, totalRemainingStock: totalStockByCategory[c._id] || 0 }))
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setFormData({ name: cat.name, description: cat.description || t('folders.configureFolder') });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: t('folders.configureFolder') });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setSnackbar({ open: true, message: t('folders.folderNameRequired'), severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData);
      } else {
        await categoryAPI.create(formData);
      }
      setOpenDialog(false);
      fetchCategories();
      setSnackbar({ open: true, message: editingCategory ? t('folders.folderUpdated') : t('folders.folderAdded'), severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || t('folders.errorSaving'), severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category) => setDeleteTarget(category);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await categoryAPI.delete(deleteTarget._id);
      setDeleteTarget(null);
      fetchCategories();
      setSnackbar({ open: true, message: t('folders.folderDeleted'), severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || t('folders.errorDeleting'), severity: 'error' });
    }
  };

  const renderCategory = ({ item, index }) => (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(350).springify()}>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('FolderItems', { folderId: item._id, folderName: item.name })}
        activeOpacity={0.8}
      >
        <LinearGradient colors={GRADIENTS[index % GRADIENTS.length]} style={styles.cardGradient}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.totalRemainingStock ?? 0}</Text>
              <Text style={styles.badgeLabel}>{t('folders.stock')}</Text>
            </View>
          </View>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={(e) => { e.stopPropagation(); handleOpenDialog(item); }}>
              <Text style={styles.actionText}>{t('common.edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={(e) => { e.stopPropagation(); handleDelete(item); }}>
              <Text style={styles.deleteText}>{t('common.delete')}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInUp.delay(0).duration(300).springify()}>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenDialog()}>
          <Text style={styles.addBtnText}>{t('folders.addFolder')}</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(80).duration(300).springify()}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('folders.searchFolders')}</Text>
        <TextInput
          style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder={t('folders.searchPlaceholder')}
          placeholderTextColor={colors.placeholder}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </Animated.View>
      {loading ? (
        <View style={styles.loader}>
          <StylishLoader size="large" color="#667eea" />
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item._id}
          renderItem={renderCategory}
          contentContainerStyle={styles.list}
        />
      )}

      <Modal visible={openDialog} transparent animationType="slide" onRequestClose={() => setOpenDialog(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingCategory ? t('folders.editFolder') : t('folders.addFolderTitle')}</Text>
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('folders.folderName')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder={t('folders.folderNamePlaceholder')}
              placeholderTextColor={colors.placeholder}
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
            />
            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('folders.description')}</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder={t('folders.descriptionPlaceholder')}
              placeholderTextColor={colors.placeholder}
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setOpenDialog(false)}>
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? t('common.loading') : editingCategory ? t('common.update') : t('common.add')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmationDialog
        visible={!!deleteTarget}
        title={t('folders.deleteFolder')}
        message={deleteTarget ? t('folders.deleteFolderConfirm', { name: deleteTarget.name }) : ''}
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
  addBtn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#667eea', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', marginBottom: 16, width: '100%' },
  addBtnText: { color: '#667eea', fontWeight: '600', fontSize: 16 },
  search: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  list: { paddingBottom: 24 },
  card: { marginBottom: 12, borderRadius: 8, overflow: 'hidden' },
  cardGradient: { padding: 20, minHeight: 150 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: 'white', flex: 1 },
  badge: { backgroundColor: 'rgba(255,255,255,0.35)', paddingVertical: 14, paddingHorizontal: 18, borderRadius: 10, minWidth: 72, alignItems: 'center' },
  badgeText: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  badgeLabel: { fontSize: 15, color: 'white', fontWeight: '600', marginTop: 2 },
  cardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
  cardActions: { flexDirection: 'row', marginTop: 12, gap: 8, alignSelf: 'flex-start' },
  actionBtn: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: 'white', fontSize: 13, fontWeight: '600' },
  deleteBtn: { backgroundColor: 'rgba(0,0,0,0.2)' },
  deleteText: { color: 'white', fontSize: 13, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: 'white', borderRadius: 12, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  inputLabel: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 12, fontSize: 16 },
  textArea: { height: 80 },
  modalActions: { marginTop: 20, gap: 12 },
  cancelBtn: { width: '100%', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' },
  cancelBtnText: { color: '#64748b', fontWeight: '600', fontSize: 17 },
  saveBtn: { width: '100%', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', backgroundColor: '#667eea' },
  saveBtnText: { color: 'white', fontWeight: '600', fontSize: 17 },
});
