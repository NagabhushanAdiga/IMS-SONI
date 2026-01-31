import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import StylishLoader from '../components/StylishLoader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authAPI, productAPI, categoryAPI, saleAPI } from '../services/api';
import ConfirmationDialog from '../components/ConfirmationDialog';
import CustomSnackbar from '../components/Snackbar';

const MENU_ITEMS = [
  { name: 'Folders', screen: 'Folders', icon: 'folder-outline' },
  { name: 'Sales', screen: 'Sales', icon: 'cart-outline' },
  { name: 'Returns', screen: 'Returns', icon: 'return-down-back-outline' },
  { name: 'Reports', screen: 'Reports', icon: 'bar-chart-outline' },
  { name: 'Settings', screen: 'Settings', icon: 'settings-outline' },
  { name: 'Developer', screen: 'Developer', icon: 'code-slash-outline' },
];

export default function MoreMenuScreen({ navigation }) {
  const { logout } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [clearDataDialog, setClearDataDialog] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [profileData, setProfileData] = useState({ fullName: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await authAPI.getProfile();
      setProfileData({
        fullName: data.fullName || data.name || '',
        email: data.email || '',
      });
    } catch (error) {
      setProfileData({ fullName: 'User', email: '' });
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    setClearing(true);
    try {
      const salesRes = await saleAPI.getAll({ limit: 1000 });
      const sales = salesRes.data?.sales || salesRes.data?.orders || salesRes.data || [];
      const salesList = Array.isArray(sales) ? sales : [];
      for (const sale of salesList) {
        try {
          await saleAPI.delete(sale._id);
        } catch (e) {}
      }
      const productsRes = await productAPI.getAll({ limit: 5000 });
      const products = productsRes.data?.products || productsRes.data || [];
      const productsList = Array.isArray(products) ? products : [];
      for (const product of productsList) {
        try {
          await productAPI.delete(product._id);
        } catch (e) {}
      }
      const categoriesRes = await categoryAPI.getAll();
      const categories = categoriesRes.data || [];
      const categoriesList = Array.isArray(categories) ? categories : [];
      for (const cat of categoriesList) {
        try {
          await categoryAPI.delete(cat._id);
        } catch (e) {}
      }
      setClearDataDialog(false);
      setSnackbar({ open: true, message: 'All data cleared successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to clear data. Please try again.',
        severity: 'error',
      });
    } finally {
      setClearing(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.profileHeader}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            {loading ? (
              <StylishLoader size="small" variant="dots" color="rgba(255,255,255,0.9)" />
            ) : (
              <Text style={styles.avatarText}>
                {profileData.fullName ? profileData.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
              </Text>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{loading ? 'Loading...' : profileData.fullName || 'User'}</Text>
            <Text style={styles.profileRole}>Administrator</Text>
            {profileData.email ? <Text style={styles.profileEmail}>{profileData.email}</Text> : null}
          </View>
        </View>
      </LinearGradient>

      <View style={styles.quickSection}>
        <View style={[styles.themeRow, { backgroundColor: colors.card }]}>
          <Ionicons name={isDark ? 'moon' : 'sunny-outline'} size={22} color={colors.primary} style={styles.quickIcon} />
          <Text style={[styles.themeLabel, { color: colors.text }]}>Dark / Light mode</Text>
          <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
        </View>
      </View>

      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.screen}
          style={[styles.item, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.7}
        >
          <Ionicons name={item.icon} size={22} color={colors.primary} style={styles.icon} />
          <Text style={[styles.label, { color: colors.text }]}>{item.name}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.clearDataBtn}
        onPress={() => setClearDataDialog(true)}
        disabled={clearing}
        activeOpacity={0.7}
      >
        {clearing ? (
          <StylishLoader size="small" variant="dots" color="#dc2626" />
        ) : (
          <>
            <Ionicons name="trash-outline" size={22} color="#dc2626" style={styles.icon} />
            <Text style={styles.clearDataText}>Delete All Data</Text>
          </>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.logoutItem} onPress={() => setLogoutDialog(true)} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={22} color="#dc2626" style={styles.icon} />
        <Text style={styles.logoutLabel}>Logout</Text>
      </TouchableOpacity>
      <ConfirmationDialog
        visible={logoutDialog}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        variant="destructive"
        icon="log-out-outline"
        onConfirm={() => { setLogoutDialog(false); logout(); }}
        onCancel={() => setLogoutDialog(false)}
      />
      <ConfirmationDialog
        visible={clearDataDialog}
        title="Delete All Data"
        message="This will permanently delete all folders, boxes, sales, and report data. Your user account and PIN will NOT be affected. This action cannot be undone."
        confirmText="Delete All"
        cancelText="Cancel"
        variant="destructive"
        icon="trash-outline"
        loading={clearing}
        onConfirm={clearAllData}
        onCancel={() => setClearDataDialog(false)}
      />
      <CustomSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  profileHeader: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: 'white' },
  profileRole: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  profileEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  quickSection: { marginBottom: 20 },
  clearDataBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fecaca',
  },
  quickIcon: { marginRight: 12 },
  clearDataText: { fontSize: 16, fontWeight: '600', color: '#dc2626' },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  themeLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: { marginRight: 16 },
  label: { fontSize: 16, fontWeight: '500', color: '#1e293b' },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutLabel: { fontSize: 16, fontWeight: '600', color: '#dc2626' },
});
