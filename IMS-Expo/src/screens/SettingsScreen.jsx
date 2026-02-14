import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import StylishLoader from '../components/StylishLoader';
import { useTheme } from '../context/ThemeContext';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { setStoredLanguage } from '../i18n';
import CustomSnackbar from '../components/Snackbar';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const { colors } = useTheme();
  const [saving, setSaving] = useState(false);
  const [pinData, setPinData] = useState({ currentPin: '', newPin: '', confirmPin: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [languageSwitchDialog, setLanguageSwitchDialog] = useState(null); // 'en' | 'kn' | null

  const handleLanguageSwitch = async (lang) => {
    await i18n.changeLanguage(lang);
    await setStoredLanguage(lang);
    setLanguageSwitchDialog(null);
  };

  const handlePinChange = async () => {
    if (pinData.newPin.length < 4) {
      setSnackbar({ open: true, message: t('settings.pinMinDigits'), severity: 'error' });
      return;
    }
    if (pinData.newPin !== pinData.confirmPin) {
      setSnackbar({ open: true, message: t('settings.pinMismatch'), severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      await authAPI.updatePin({ currentPin: pinData.currentPin, newPin: pinData.newPin });
      setPinData({ currentPin: '', newPin: '', confirmPin: '' });
      setSnackbar({ open: true, message: t('settings.pinChanged'), severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || t('settings.pinChangeFailed'), severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('language.title')}</Text>
        <View style={styles.languageRow}>
          <TouchableOpacity
            style={[styles.langBtn, i18n.language === 'en' && styles.langBtnActive]}
            onPress={() => i18n.language !== 'en' && setLanguageSwitchDialog('en')}
          >
            <Text style={[styles.langBtnText, i18n.language === 'en' && styles.langBtnTextActive]}>{t('language.english')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, i18n.language === 'kn' && styles.langBtnActive]}
            onPress={() => i18n.language !== 'kn' && setLanguageSwitchDialog('kn')}
          >
            <Text style={[styles.langBtnText, i18n.language === 'kn' && styles.langBtnTextActive]}>{t('language.kannada')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('settings.security')}</Text>
        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('settings.currentPin')}</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder={t('settings.currentPinPlaceholder')}
          placeholderTextColor={colors.placeholder}
          value={pinData.currentPin}
          onChangeText={(t) => setPinData({ ...pinData, currentPin: t })}
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
        />
        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('settings.newPin')}</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder={t('settings.newPinPlaceholder')}
          placeholderTextColor={colors.placeholder}
          value={pinData.newPin}
          onChangeText={(t) => setPinData({ ...pinData, newPin: t })}
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
        />
        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('settings.confirmPin')}</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          placeholder={t('settings.confirmPinPlaceholder')}
          placeholderTextColor={colors.placeholder}
          value={pinData.confirmPin}
          onChangeText={(t) => setPinData({ ...pinData, confirmPin: t })}
          keyboardType="numeric"
          secureTextEntry
          maxLength={6}
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handlePinChange} disabled={saving}>
          {saving ? <StylishLoader size="small" variant="dots" color="#fff" /> : <Text style={styles.saveBtnText}>{t('settings.changePin')}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutDialog(true)}>
          <Text style={styles.logoutBtnText}>{t('settings.logout')}</Text>
        </TouchableOpacity>
      </View>

      <ConfirmationDialog
        visible={!!languageSwitchDialog}
        title={t('language.title')}
        message={t('language.switchConfirm')}
        confirmText={t('language.switch')}
        cancelText={t('common.cancel')}
        variant="primary"
        icon="language-outline"
        onConfirm={() => languageSwitchDialog && handleLanguageSwitch(languageSwitchDialog)}
        onCancel={() => setLanguageSwitchDialog(null)}
      />
      <ConfirmationDialog
        visible={logoutDialog}
        title={t('settings.logout')}
        message={t('settings.logoutConfirm')}
        confirmText={t('settings.logout')}
        cancelText={t('common.cancel')}
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
  languageRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  langBtn: { flex: 1, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', backgroundColor: '#f1f5f9', borderWidth: 2, borderColor: 'transparent' },
  langBtnActive: { backgroundColor: '#667eea', borderColor: '#667eea' },
  langBtnText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
  langBtnTextActive: { color: 'white' },
  inputLabel: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 12 },
  saveBtn: { backgroundColor: '#11998e', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: 'white', fontWeight: '600' },
  logoutBtn: { backgroundColor: '#d32f2f', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  logoutBtnText: { color: 'white', fontWeight: '600' },
});
