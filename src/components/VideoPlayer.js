import React, { useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { PLAYBACK_CONTROL_SCRIPT } from '../utils/playbackScript';
import { colors } from '../utils/styles';

export function VideoPlayer({ url, onMessage, onReady, webviewRef: externalRef }) {
  const internalRef = useRef(null);
  const webviewRef = externalRef || internalRef;

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'ready' && onReady) {
        onReady(data);
      }
      if (onMessage) {
        onMessage(data);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [onMessage, onReady]);

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: url }}
        injectedJavaScript={PLAYBACK_CONTROL_SCRIPT}
        onMessage={handleMessage}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="always"
        originWhitelist={['*']}
        allowsFullscreenVideo={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
