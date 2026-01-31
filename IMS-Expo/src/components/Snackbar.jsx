import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const getBgColor = (severity) => {
  switch (severity) {
    case 'error': return '#d32f2f';
    case 'warning': return '#ed6c02';
    case 'info': return '#0288d1';
    default: return '#2e7d32';
  }
};

export default function CustomSnackbar({ open, message, severity = 'success', onClose }) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open && message) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => onClose?.());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [open, message]);

  if (!open || !message) return null;

  return (
    <Animated.View style={[styles.container, { backgroundColor: getBgColor(severity), opacity }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    zIndex: 9999,
  },
  message: {
    color: 'white',
    fontSize: 14,
  },
});
