import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { colors } from '../utils/styles';
import { PLAYBACK_CONTROL_SCRIPT } from '../utils/playbackScript';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CAM_SIZE = 120;
const SELF_CAM_SIZE = 80;
const INITIAL_CAM_POS = { x: SCREEN_WIDTH - CAM_SIZE - 20, y: 100 };

export function WatchTogetherScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { videoUrl, roomId, friendName } = route.params || {};

  const webviewRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);

  const [remoteStream, setRemoteStream] = useState(null);
  const [localStream, setLocalStream] = useState(null);

  // Draggable face cam position
  const pan = useRef(new Animated.ValueXY(INITIAL_CAM_POS)).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.extractOffset();
      },
    })
  ).current;

  // WebView message handler
  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'play':
          setIsPlaying(true);
          sendSyncCommand({ type: 'play', time: data.time });
          break;
        case 'pause':
          setIsPlaying(false);
          sendSyncCommand({ type: 'pause', time: data.time });
          break;
        case 'seeked':
          setCurrentTime(data.time);
          break;
        case 'timeupdate':
          setCurrentTime(data.time);
          break;
        case 'ready':
          setDuration(data.duration || 0);
          break;
        case 'ended':
          setIsPlaying(false);
          handleMovieEnded();
          break;
        case 'buffering':
          break;
        case 'playing':
          setIsPlaying(true);
          break;
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Send command to WebView
  const sendToWebView = useCallback((command) => {
    if (webviewRef.current) {
      webviewRef.current.injectJavaScript(`
        window.postMessage(${JSON.stringify(command)}, '*');
        true;
      `);
    }
  }, []);

  // Send sync command to peer via WebRTC data channel
  const sendSyncCommand = useCallback((command) => {
    // WebRTC data channel send happens here
    if (dataChannel && dataChannel.readyState === 'open') {
      dataChannel.send(JSON.stringify(command));
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    sendToWebView({ type: 'toggle' });
  }, [sendToWebView]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    // Toggle local audio track
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted;
      });
    }
  }, [isMuted, localStream]);

  const toggleCamera = useCallback(() => {
    setIsCameraOn((prev) => !prev);
    // Toggle local video track
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isCameraOn;
      });
    }
  }, [isCameraOn, localStream]);

  const endWatchParty = useCallback(() => {
    Alert.alert(
      'end watch party',
      'are you sure you want to leave?',
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'end',
          style: 'destructive',
          onPress: () => {
            // Clean up WebRTC
            if (peerConnection) {
              peerConnection.close();
            }
            if (localStream) {
              localStream.getTracks().forEach((t) => t.stop());
            }
            navigation.goBack();
          },
        },
      ]
    );
  }, [navigation, localStream]);

  const handleMovieEnded = useCallback(() => {
    Alert.alert(
      'credits rolling',
      'one thought about what you just watched?',
      [
        { text: 'skip', style: 'cancel' },
        {
          text: 'write',
          onPress: () => {
            // Navigate to reflection screen
            navigation.navigate('DMs');
          },
        },
      ]
    );
  }, [navigation]);

  if (!videoUrl) {
    return (
      <View style={[containerStyles.container, { paddingTop: insets.top }]}>
        <View style={containerStyles.centered}>
          <Icon name="movie" size={48} color={colors.textMuted} />
          <Text style={containerStyles.emptyText}>no video selected</Text>
          <TouchableOpacity
            style={containerStyles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={containerStyles.backText}>go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[containerStyles.container, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={containerStyles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="logout" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
        <View style={containerStyles.roomInfo}>
          <View style={[containerStyles.statusDot, { backgroundColor: isConnected ? colors.success : colors.textMuted }]} />
          <Text style={containerStyles.statusText}>
            {isConnected ? `connected with ${friendName || 'friend'}` : 'connecting...'}
          </Text>
        </View>
        <Text style={containerStyles.roomLabel}>
          {roomId || ''}
        </Text>
      </View>

      {/* WebView video player */}
      <View style={containerStyles.videoContainer}>
        <WebView
          ref={webviewRef}
          source={{ uri: videoUrl }}
          injectedJavaScript={PLAYBACK_CONTROL_SCRIPT}
          onMessage={handleWebViewMessage}
          style={containerStyles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          mixedContentMode="always"
          originWhitelist={['*']}
        />
      </View>

      {/* Remote face cam overlay (draggable) */}
      {remoteStream && (
        <Animated.View
          style={[
            containerStyles.faceCam,
            { transform: pan.getTranslateTransform() },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={containerStyles.camPlaceholder}>
            <Icon name="video" size={24} color={colors.textMuted} />
          </View>
        </Animated.View>
      )}

      {/* Self face cam (PIP) */}
      {localStream && isCameraOn && (
        <View style={containerStyles.selfCam}>
          <View style={containerStyles.camPlaceholder}>
            <Icon name="user" size={20} color={colors.textMuted} />
          </View>
        </View>
      )}

      {/* Control bar */}
      <View style={containerStyles.controlBar}>
        <TouchableOpacity onPress={togglePlayPause} style={containerStyles.controlBtn}>
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={22}
            color={colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleMute} style={containerStyles.controlBtn}>
          <Icon
            name={isMuted ? 'mic-off' : 'mic'}
            size={20}
            color={isMuted ? colors.danger : colors.text}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleCamera} style={containerStyles.controlBtn}>
          <Icon
            name={isCameraOn ? 'video' : 'video-off'}
            size={20}
            color={isCameraOn ? colors.text : colors.danger}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={endWatchParty} style={containerStyles.controlBtn}>
          <Icon name="logout" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>

      {/* Timestamp */}
      <View style={containerStyles.timestampRow}>
        <Text style={containerStyles.timestamp}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// WebRTC globals (set from signaling service)
let peerConnection = null;
let dataChannel = null;

const containerStyles = {
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: {
    color: colors.textSecondary,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  roomLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  faceCam: {
    position: 'absolute',
    width: CAM_SIZE,
    height: CAM_SIZE * 0.75,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selfCam: {
    position: 'absolute',
    width: SELF_CAM_SIZE,
    height: SELF_CAM_SIZE * 0.75,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    bottom: 120,
    right: 16,
  },
  camPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  controlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestampRow: {
    alignItems: 'center',
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  timestamp: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
};
