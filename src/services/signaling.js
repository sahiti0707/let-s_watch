import { io } from 'socket.io-client';
import { Platform } from 'react-native';

let socket = null;

const SIGNALING_URL = Platform.select({
  web: 'http://localhost:3001',
  default: 'https://lets-watch-signaling.onrender.com',
});

export function connectSignaling(roomId, username) {
  return new Promise((resolve, reject) => {
    socket = io(SIGNALING_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      socket.emit('join-room', { roomId, username });
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      console.warn('signaling connection error:', err.message);
      reject(err);
    });

    socket.on('error', (err) => {
      console.warn('signaling error:', err.message);
    });

    socket.on('user-joined', ({ username }) => {
      console.log(`user joined: ${username}`);
    });

    socket.on('user-left', ({ username }) => {
      console.log(`user left: ${username}`);
    });

    socket.on('room-full', () => {
      console.warn('room is full');
    });
  });
}

export function getSocket() {
  return socket;
}

export function disconnectSignaling() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function sendSignal(event, data) {
  if (socket && socket.connected) {
    socket.emit(event, data);
  }
}

export function onSignal(event, callback) {
  if (socket) {
    socket.on(event, callback);
  }
}

export function offSignal(event, callback) {
  if (socket) {
    socket.off(event, callback);
  }
}
