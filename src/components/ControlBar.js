import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors } from '../utils/styles';

export function ControlBar({
  isPlaying,
  isMuted,
  isCameraOn,
  onTogglePlay,
  onToggleMute,
  onToggleCamera,
  onEnd,
  currentTime,
  duration,
}) {
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity onPress={onTogglePlay} style={styles.btn}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={22} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleMute} style={styles.btn}>
          <Icon
            name={isMuted ? 'mic-off' : 'mic'}
            size={20}
            color={isMuted ? colors.danger : colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onToggleCamera} style={styles.btn}>
          <Icon
            name={isCameraOn ? 'video' : 'video-off'}
            size={20}
            color={isCameraOn ? colors.text : colors.danger}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onEnd} style={styles.btn}>
          <Icon name="logout" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <Text style={styles.timestamp}>
        {formatTime(currentTime)} / {formatTime(duration)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
    fontFamily: 'monospace',
    textAlign: 'center',
    paddingBottom: 8,
  },
});
