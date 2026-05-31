import React from 'react';
import { View, StyleSheet } from 'react-native';

export function PaperBackground({ children, style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.texture} pointerEvents="none" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  texture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.035,
    backgroundColor: '#ffffff',
    backgroundImage: `
      linear-gradient(45deg, #ffffff 1px, transparent 1px),
      linear-gradient(-45deg, #ffffff 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    backgroundPosition: '0 0, 20px 20px',
  },
});
