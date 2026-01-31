import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const DURATION = 600;
const DOT_DELAY = 120;

function BouncingDots({ size = 8, color = '#667eea' }) {
  const d1 = useSharedValue(0.5);
  const d2 = useSharedValue(0.5);
  const d3 = useSharedValue(0.5);

  useEffect(() => {
    const bounce = (v) =>
      withRepeat(
        withSequence(
          withTiming(1, { duration: DURATION / 2, easing: Easing.out(Easing.cubic) }),
          withTiming(0.5, { duration: DURATION / 2, easing: Easing.in(Easing.cubic) })
        ),
        -1,
        true
      );
    d1.value = bounce(d1.value);
    d2.value = withDelay(DOT_DELAY, bounce(d2.value));
    d3.value = withDelay(DOT_DELAY * 2, bounce(d3.value));
  }, []);

  const dotStyle = (v) =>
    useAnimatedStyle(() => ({
      transform: [{ scale: v.value }],
      opacity: 0.5 + v.value * 0.5,
    }));

  const s1 = dotStyle(d1);
  const s2 = dotStyle(d2);
  const s3 = dotStyle(d3);

  return (
    <View style={styles.dotsRow}>
      <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, s1]} />
      <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color, marginHorizontal: size * 0.6 }, s2]} />
      <Animated.View style={[styles.dot, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, s3]} />
    </View>
  );
}

function SpinningRing({ size = 48, color = '#667eea' }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const borderW = Math.max(3, size * 0.08);

  return (
    <View style={[styles.ringWrapper, { width: size, height: size }]}>
      <View
        style={[
          styles.ringBg,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: borderW,
            borderColor: '#e2e8f0',
          },
        ]}
      />
      <Animated.View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: borderW,
            borderTopColor: color,
            borderRightColor: color,
            borderBottomColor: 'transparent',
            borderLeftColor: 'transparent',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}

export default function StylishLoader({
  fullScreen = false,
  size = 'large',
  color = '#667eea',
  message = 'Loading...',
  variant = 'ring',
  backgroundColor,
}) {
  const isLarge = size === 'large' || fullScreen;
  const ringSize = isLarge ? 56 : 32;
  const dotSize = isLarge ? 10 : 6;

  const content =
    variant === 'dots' ? (
      <BouncingDots size={dotSize} color={color} />
    ) : (
      <SpinningRing size={ringSize} color={color} />
    );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, backgroundColor && { backgroundColor }]}>
        {content}
        {message ? <Text style={[styles.message, { color }]}>{message}</Text> : null}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {},
  ring: { position: 'absolute' },
  ringWrapper: { position: 'relative' },
  ringBg: { position: 'absolute' },
});
