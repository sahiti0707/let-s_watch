// Firebase service stub
// Configure with your credentials in app.json -> extra.firebaseConfig

import { Platform } from 'react-native';

let firebaseApp = null;
let db = null;
let auth = null;

export async function initFirebase() {
  try {
    const firebase = require('firebase/app');
    require('firebase/auth');
    require('firebase/firestore');

    const config = getFirebaseConfig();
    if (!config || !config.apiKey || config.apiKey.startsWith('YOUR_')) {
      console.warn('firebase not configured -- set up in app.json extra.firebaseConfig');
      return null;
    }

    firebaseApp = firebase.initializeApp(config);
    auth = firebase.getAuth(firebaseApp);
    db = firebase.getFirestore(firebaseApp);

    console.log('firebase initialized');
    return firebaseApp;
  } catch (err) {
    console.warn('firebase init failed:', err.message);
    return null;
  }
}

function getFirebaseConfig() {
  try {
    const Constants = require('expo-constants');
    return Constants.default.expoConfig?.extra?.firebaseConfig || null;
  } catch {
    return null;
  }
}

export function getAuth() {
  return auth;
}

export function getDb() {
  return db;
}

// Auth helpers
export async function signInWithPhone(phoneNumber) {
  if (!auth) return null;
  try {
    const { signInWithPhoneNumber } = require('firebase/auth');
    // In production, use RecaptchaVerifier for web
    const confirmation = await signInWithPhoneNumber(auth, phoneNumber);
    return confirmation;
  } catch (err) {
    console.warn('phone sign in failed:', err.message);
    return null;
  }
}

export async function verifyOtp(confirmation, code) {
  if (!confirmation) return null;
  try {
    const result = await confirmation.confirm(code);
    return result.user;
  } catch (err) {
    console.warn('otp verification failed:', err.message);
    return null;
  }
}

export async function signOut() {
  if (!auth) return;
  try {
    const { signOut: fbSignOut } = require('firebase/auth');
    await fbSignOut(auth);
  } catch (err) {
    console.warn('sign out failed:', err.message);
  }
}

// Firestore helpers
export async function addToWatchlist(userId, movie) {
  if (!db) return;
  try {
    const { doc, setDoc, arrayUnion } = require('firebase/firestore');
    const ref = doc(db, 'watchlists', userId);
    await setDoc(ref, {
      movies: arrayUnion({
        id: movie.id,
        title: movie.title,
        year: movie.year,
        addedAt: Date.now(),
      }),
    }, { merge: true });
  } catch (err) {
    console.warn('add to watchlist failed:', err.message);
  }
}

export async function getWatchlist(userId) {
  if (!db) return [];
  try {
    const { doc, getDoc } = require('firebase/firestore');
    const ref = doc(db, 'watchlists', userId);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().movies || [] : [];
  } catch (err) {
    console.warn('get watchlist failed:', err.message);
    return [];
  }
}

export async function saveReflection(movieId, userId, text) {
  if (!db) return;
  try {
    const { collection, addDoc } = require('firebase/firestore');
    await addDoc(collection(db, 'reflections'), {
      movieId,
      userId,
      text,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('save reflection failed:', err.message);
  }
}
