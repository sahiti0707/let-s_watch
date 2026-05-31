import { Platform, PermissionsAndroid } from 'react-native';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

let peerConnection = null;
let dataChannel = null;
let localStream = null;

export function getPeerConnection() {
  return peerConnection;
}

export function getDataChannel() {
  return dataChannel;
}

export function getLocalStream() {
  return localStream;
}

export async function requestPermissions() {
  if (Platform.OS === 'android') {
    try {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      return (
        grants[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted' &&
        grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted'
      );
    } catch {
      return false;
    }
  }
  // iOS permissions handled via Info.plist
  return true;
}

export async function createLocalStream(audio = true, video = false) {
  try {
    // In production, use react-native-webrtc's mediaDevices
    // This is a placeholder for the native module
    const { mediaDevices } = await import('react-native-webrtc');

    const stream = await mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: video
        ? { width: 320, height: 240, frameRate: 15, facingMode: 'user' }
        : false,
    });

    localStream = stream;
    return stream;
  } catch (err) {
    console.warn('could not create local stream:', err.message);
    return null;
  }
}

export function createPeerConnection(onRemoteStream, onDataChannel) {
  try {
    const RTCPeerConnection = require('react-native-webrtc').RTCPeerConnection;

    peerConnection = new RTCPeerConnection(ICE_SERVERS);

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
    }

    peerConnection.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        onRemoteStream(event.streams[0]);
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ice-candidate', event.candidate);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        cleanupConnection();
      }
    };

    // Create data channel for sync
    dataChannel = peerConnection.createDataChannel('sync', {
      ordered: true,
    });

    dataChannel.onopen = () => {
      console.log('data channel open');
    };

    dataChannel.onclose = () => {
      console.log('data channel closed');
    };

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSyncMessage(data);
      } catch (e) {
        // ignore
      }
    };

    peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onmessage = (msg) => {
        try {
          const data = JSON.parse(msg.data);
          handleSyncMessage(data);
        } catch (e) {
          // ignore
        }
      };
      if (onDataChannel) onDataChannel(channel);
    };

    return peerConnection;
  } catch (err) {
    console.warn('could not create peer connection:', err.message);
    return null;
  }
}

export async function createOffer() {
  if (!peerConnection) return null;
  try {
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await peerConnection.setLocalDescription(offer);
    return offer;
  } catch (err) {
    console.warn('could not create offer:', err.message);
    return null;
  }
}

export async function handleOffer(offer) {
  if (!peerConnection) return null;
  try {
    await peerConnection.setRemoteDescription(new (require('react-native-webrtc').RTCSessionDescription)(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  } catch (err) {
    console.warn('could not handle offer:', err.message);
    return null;
  }
}

export async function handleAnswer(answer) {
  if (!peerConnection) return null;
  try {
    await peerConnection.setRemoteDescription(new (require('react-native-webrtc').RTCSessionDescription)(answer));
  } catch (err) {
    console.warn('could not handle answer:', err.message);
  }
}

export async function handleIceCandidate(candidate) {
  if (!peerConnection) return;
  try {
    await peerConnection.addIceCandidate(new (require('react-native-webrtc').RTCIceCandidate)(candidate));
  } catch (err) {
    console.warn('could not add ice candidate:', err.message);
  }
}

export function cleanupConnection() {
  try {
    if (dataChannel) {
      dataChannel.close();
      dataChannel = null;
    }
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
      localStream = null;
    }
  } catch (e) {
    // ignore cleanup errors
  }
}

function sendSignal(event, data) {
  const { sendSignal } = require('./signaling');
  sendSignal(event, data);
}

const syncHandlers = [];

export function onSyncMessage(handler) {
  syncHandlers.push(handler);
}

function handleSyncMessage(data) {
  syncHandlers.forEach((handler) => handler(data));
}
