import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import StylishLoader from '../components/StylishLoader';
import { useTheme } from '../context/ThemeContext';
import { saleAPI } from '../services/api';
import CustomSnackbar from '../components/Snackbar';

const getStatusColor = (status) => {
  const colors = { Completed: '#2e7d32', Processing: '#0288d1', Shipped: '#667eea', Pending: '#ed6c02', Cancelled: '#d32f2f' };
  return colors[status] || '#666';
};

export default function SalesScreen() {
  const { colors } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchSales();
  }, [searchTerm]);

  useFocusEffect(
    useCallback(() => {
      fetchSales();
    }, [searchTerm])
  );

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data } = await saleAPI.getAll({ keyword: searchTerm });
      const salesData = data.sales || data || [];
      setOrders(Array.isArray(salesData) ? salesData : []);
    } catch (error) {
      setOrders([]);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error loading sales', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      (o.saleId || o._id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerName || o.customer || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    try {
      setSaving(true);
      await saleAPI.update(selectedOrder._id, { status: newStatus });
      setOrders(orders.map((o) => (o._id === selectedOrder._id ? { ...o, status: newStatus } : o)));
      setSelectedOrder({ ...selectedOrder, status: newStatus });
      setSnackbar({ open: true, message: 'Status updated!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Error updating', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const statusOptions = ['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedOrder(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.saleId || `SALE-${item._id?.slice(-6)}`}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.customer}>{item.customerName || item.customer}</Text>
      <Text style={styles.amount}>₹{(item.totalAmount || item.total || 0).toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>Search sales</Text>
      <TextInput
        style={[styles.search, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        placeholder="Search sales..."
        placeholderTextColor={colors.placeholder}
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
      {loading ? (
        <View style={styles.loader}>
          <StylishLoader size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList data={filteredOrders} keyExtractor={(item) => item._id} renderItem={renderItem} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>No sales found</Text>} />
      )}

      <Modal visible={!!selectedOrder} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Sale details</Text>
            {selectedOrder && (
              <>
                <Text style={styles.detail}>ID: {selectedOrder.saleId || `SALE-${selectedOrder._id?.slice(-6)}`}</Text>
                <Text style={styles.detail}>Customer: {selectedOrder.customerName || selectedOrder.customer}</Text>
                <Text style={styles.detail}>Amount: ₹{(selectedOrder.totalAmount || selectedOrder.total || 0).toFixed(2)}</Text>
                <Text style={styles.detail}>Status: {selectedOrder.status}</Text>
                <Text style={styles.label}>Change status:</Text>
                <View style={styles.statusRow}>
                  {statusOptions.map((s) => (
                    <TouchableOpacity key={s} style={[styles.statusBtn, selectedOrder.status === s && styles.statusBtnActive]} onPress={() => handleStatusChange(s)} disabled={saving}>
                      <Text style={[styles.statusBtnText, selectedOrder.status === s && styles.statusBtnTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedOrder(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  inputLabel: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  search: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  list: { paddingBottom: 24 },
  empty: { textAlign: 'center', color: '#666', marginTop: 40, fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#667eea' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  statusText: { color: 'white', fontSize: 13 },
  customer: { color: '#666', marginTop: 4, fontSize: 15 },
  amount: { fontSize: 20, fontWeight: 'bold', color: '#667eea', marginTop: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: 'white', borderRadius: 12, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  detail: { marginBottom: 8, fontSize: 15 },
  label: { marginTop: 16, marginBottom: 8, fontWeight: '600', fontSize: 15 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 8 },
  statusBtnActive: { backgroundColor: '#667eea' },
  statusBtnText: { fontSize: 14 },
  statusBtnTextActive: { color: 'white' },
  closeBtn: { marginTop: 24, backgroundColor: '#667eea', padding: 14, borderRadius: 8, alignItems: 'center' },
  closeBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
