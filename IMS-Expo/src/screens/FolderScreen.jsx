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
import { categoryAPI } from '../services/api';
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
  const { colors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: 'Configure folder' });
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
      const { data } = await categoryAPI.getAll();
      setCategories(data);
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
      setFormData({ name: cat.name, description: cat.description || 'Configure folders' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: 'Configure folders' });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setSnackbar({ open: true, message: 'Folder name is required', severity: 'error' });
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
      setSnackbar({ open: true, message: editingCategory ? 'Folder updated!' : 'Folder added!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error saving folder', severity: 'error' });
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
      setSnackbar({ open: true, message: 'Folder deleted!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error deleting', severity: 'error' });
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
              <Text style={styles.badgeText}>{item.productCount || 0}</Text>
              <Text style={styles.badgeLabel}>Boxes</Text>
            </View>
          </View>
          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={(e) => { e.stopPropagation(); handleOpenDialog(item); }}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={(e) => { e.stopPropagation(); handleDelete(item); }}>
              <Text style={styles.deleteText}>Delete</Text>
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
          <Text style={styles.addBtnText}>+ Add folder</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View entering={FadeInUp.delay(80).duration(300).springify()}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Search folders</Text>
        <TextInput
          style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Search folders..."
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

      <Modal visible={openDialog} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingCategory ? 'Edit folder' : 'Add folder'}</Text>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Folder name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter folder name"
              placeholderTextColor={colors.placeholder}
              value={formData.name}
              onChangeText={(t) => setFormData({ ...formData, name: t })}
            />
            <Text style={[styles.inputLabel, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              placeholder="Enter description"
              placeholderTextColor={colors.placeholder}
              value={formData.description}
              onChangeText={(t) => setFormData({ ...formData, description: t })}
              multiline
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setOpenDialog(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : editingCategory ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmationDialog
        visible={!!deleteTarget}
        title="Delete folder"
        message={deleteTarget ? `Are you sure you want to delete folder "${deleteTarget.name}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
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
  cardActions: { flexDirection: 'row', marginTop: 12, gap: 10 },
  actionBtn: { flex: 1, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: 'white', fontSize: 15, fontWeight: '600' },
  deleteBtn: { backgroundColor: 'rgba(0,0,0,0.2)' },
  deleteText: { color: 'white', fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: 'white', borderRadius: 8, padding: 24 },
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
