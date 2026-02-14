import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import App from './App';
import initI18n from './src/i18n';

function AppWrapper() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    initI18n().then(() => setReady(true));
  }, []);
  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }
  return <App />;
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
});

registerRootComponent(AppWrapper);
