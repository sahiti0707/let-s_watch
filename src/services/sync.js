import { Platform } from 'react-native';

let dataChannel = null;

export function setDataChannel(channel) {
  dataChannel = channel;
}

export function sendSyncCommand(command) {
  if (dataChannel && dataChannel.readyState === 'open') {
    try {
      dataChannel.send(JSON.stringify(command));
      return true;
    } catch (e) {
      console.warn('failed to send sync command:', e.message);
      return false;
    }
  }
  return false;
}

export function createRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function validateVideoUrl(url) {
  if (!url || typeof url !== 'string') return false;

  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+/,
    /^https?:\/\/youtu\.be\/.+/,
    /^https?:\/\/(www\.)?netflix\.com\/watch\/.+/,
    /^https?:\/\/(www\.)?primevideo\.com\/.+/,
    /^https?:\/\/(www\.)?disneyplus\.com\/.+/,
    /^https?:\/\/(www\.)?hulu\.com\/.+/,
    /^https?:\/\/(www\.)?hbomax\.com\/.+/,
    /^https?:\/\/.+\.(mp4|webm|m3u8)(\?.*)?$/,
  ];

  return patterns.some((p) => p.test(url));
}

export function extractVideoId(url) {
  // YouTube
  const ytMatch = url.match(/(?:v=|\/)([\w-]{11})(?:\?|&|\/|$)/);
  if (ytMatch) return ytMatch[1];
  return null;
}

export function generateShareLink(roomId) {
  const base = Platform.select({
    web: window.location.origin,
    default: 'letswatch://',
  });
  return `${base}/join/${roomId}`;
}
