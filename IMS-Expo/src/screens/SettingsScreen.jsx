import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import StylishLoader from '../components/StylishLoader';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CustomSnackbar from '../components/Snackbar';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);
  const [pinData, setPinData] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [logoutDialog, setLogoutDialog] = useState(false);

  const handlePinChange = async () => {
    if (pinData.newPin.length < 4) {
      setSnackbar({ open: true, message: 'PIN must be at least 4 digits', severity: 'error' });
      return;
    }
    if (pinData.newPin !== pinData.confirmPin) {
      setSnackbar({ open: true, message: 'PINs do not match', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      await authAPI.updatePin({ currentPin: pinData.currentPin, newPin: pinData.newPin });
      setPinData({ currentPin: '', newPin: '', confirmPin: '' });
      setSnackbar({ open: true, message: 'PIN changed successfully!', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Failed to change PIN', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Current PIN</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Enter current PIN"
          placeholderTextColor={colors.placeholder}
          value={pinData.currentPin}
          onChangeText={(t) => setPinData({ ...pinData, currentPin: t })}
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
        />
        <Text style={[styles.inputLabel, { color: colors.text }]}>New PIN</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Enter new PIN"
          placeholderTextColor={colors.placeholder}
          value={pinData.newPin}
          onChangeText={(t) => setPinData({ ...pinData, newPin: t })}
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
        />
        <Text style={[styles.inputLabel, { color: colors.text }]}>Confirm new PIN</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder="Enter confirm PIN"
          placeholderTextColor={colors.placeholder}
          value={pinData.confirmPin}
          onChangeText={(t) => setPinData({ ...pinData, confirmPin: t })}
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handlePinChange} disabled={saving}>
          {saving ? <StylishLoader size="small" variant="dots" color="#fff" /> : <Text style={styles.saveBtnText}>Change PIN</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutDialog(true)}>
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

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
      <CustomSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  section: { borderRadius: 12, padding: 20, borderWidth: 1, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  inputLabel: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 12 },
  saveBtn: { backgroundColor: '#11998e', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: 'white', fontWeight: '600' },
  logoutBtn: { backgroundColor: '#d32f2f', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  logoutBtnText: { color: 'white', fontWeight: '600' },
});
