import React, { useRef } from 'react';
import { View, Animated, PanResponder, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { colors } from '../utils/styles';

const CAM_WIDTH = 120;
const CAM_HEIGHT = 90;

export function FaceCamOverlay({ stream, isSelf = false, initialX, initialY }) {
  const pan = useRef(new Animated.ValueXY({ x: initialX || 0, y: initialY || 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isSelf,
      onMoveShouldSetPanResponder: () => !isSelf,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => pan.extractOffset(),
    })
  ).current;

  const sizeStyle = isSelf ? selfStyles : friendStyles;

  return (
    <Animated.View
      style={[
        sizeStyle.container,
        !isSelf && { transform: pan.getTranslateTransform() },
        isSelf && { bottom: 100, right: 16 },
      ]}
      {...(isSelf ? {} : panResponder.panHandlers)}
    >
      {stream ? (
        <View style={sizeStyle.stream}>
          {/* RTCView renders here in production */}
        </View>
      ) : (
        <View style={sizeStyle.placeholder}>
          <Icon name={isSelf ? 'user' : 'video'} size={isSelf ? 20 : 24} color={colors.textMuted} />
          {isSelf && (
            <View style={sizeStyle.label}>
              <Icon name="user" size={10} color={colors.textMuted} />
            </View>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const friendStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: CAM_WIDTH,
    height: CAM_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
  stream: {
    flex: 1,
    backgroundColor: '#000',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
});

const selfStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 80,
    height: 60,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 20,
  },
  stream: {
    flex: 1,
    backgroundColor: '#000',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  label: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
});
