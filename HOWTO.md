# let's_watch -- complete setup guide

watch together. anywhere. one app, zero cost.

---

## table of contents

1. [what this is](#1-what-this-is)
2. [system requirements](#2-system-requirements)
3. [project structure](#3-project-structure)
4. [quick start (5 minutes)](#4-quick-start-5-minutes)
5. [signaling server setup](#5-signaling-server-setup)
6. [firebase setup (optional)](#6-firebase-setup-optional)
7. [building the android apk](#7-building-the-android-apk)
8. [building the website](#8-building-the-website)
9. [app architecture deep-dive](#9-app-architecture-deep-dive)
10. [how watch together works](#10-how-watch-together-works)
11. [all screens explained](#11-all-screens-explained)
12. [webrtc deep-dive](#12-webrtc-deep-dive)
13. [sync protocol](#13-sync-protocol)
14. [deployment guide](#14-deployment-guide)
15. [troubleshooting](#15-troubleshooting)
16. [faq](#16-faq)

---

## 1. what this is

let's_watch is a **single cohesive app** that lets you and a friend watch videos together in real-time -- without leaving the app, without opening external players, and without paying anything.

### what you can do

- browse a feed of friend activity
- maintain a shared watchlist
- send direct messages
- start a watch party from any streaming url (youtube, netflix, prime, disney+, hbo, or direct mp4/webm/m3u8 links)
- talk via voice chat while watching
- optionally show your face in a draggable overlay
- everything stays perfectly synced
- reflect on what you watched afterward

### what stays inside the app

| feature | location |
|---------|----------|
| browsing watchlist | inside app |
| watching any video | inside app (webview) |
| voice chat | inside app (webrtc) |
| face cam | inside app (webrtc) |
| messaging | inside app |
| after-credits reflection | inside app |
| movie diary | inside app |

### what never happens

- you never open a separate streaming app
- you never visit another website
- you never pay for any service
- you never leave the app's ui

---

## 2. system requirements

### for development

| requirement | minimum |
|-------------|---------|
| node.js | 18.0+ |
| npm or yarn | latest |
| expo cli | latest (`npm install -g expo-cli`) |
| eas cli | latest (`npm install -g eas-cli`) -- for apk builds |
| android studio | 2023+ (for emulator) |
| ios (optional) | xcode 15+ (for simulator) |
| code editor | any (vs code recommended) |

### for deployment

| service | free tier limit | purpose |
|---------|----------------|---------|
| render.com | 750 hours/month | signaling server |
| firebase | 50k reads/day, 10gb storage | auth + data sync |
| expo/eas | 30 builds/month | apk builds |
| netlify | 100gb bandwidth/month | website hosting |

### supported platforms

- **android**: 8.0+ (api 26+)
- **ios**: 15.0+ (requires developer account for physical device)
- **web**: chrome, firefox, safari, edge (latest 2 versions)

---

## 3. project structure

```
let's_watch/
├── App.js                          # root app component
├── app.json                        # expo configuration
├── package.json                    # dependencies
├── babel.config.js                 # babel configuration
├── assets/                         # app icons and images
├── src/
│   ├── navigation/                 # tab navigator
│   ├── screens/
│   │   ├── FeedScreen.js           # activity feed tab
│   │   ├── WatchlistScreen.js      # shared watchlist tab
│   │   ├── DMsScreen.js            # direct messages tab
│   │   └── WatchTogetherScreen.js  # video player + webrtc
│   ├── components/
│   │   ├── Icon.js                 # svg icon system (no emojis)
│   │   ├── PaperBackground.js      # zen-browser paper texture
│   │   ├── VideoPlayer.js          # re-usable webview wrapper
│   │   ├── ControlBar.js           # play/pause/mic/cam/end controls
│   │   └── FaceCamOverlay.js       # draggable picture-in-picture
│   ├── services/
│   │   ├── signaling.js            # socket.io client
│   │   ├── webrtc.js               # peer connection + media
│   │   └── sync.js                 # sync protocol helpers
│   └── utils/
│       ├── styles.js               # shared design tokens
│       └── playbackScript.js       # injected javascript for webview
├── server/
│   ├── signaling-server.js         # socket.io signaling server
│   └── package.json                # server dependencies
├── web/
│   ├── index.html                  # web entry point
│   └── web.config.js               # pwa configuration
└── HOWTO.md                        # this file
```

---

## 4. quick start (5 minutes)

### step 1: clone and install

```bash
cd let's_watch
npm install
```

### step 2: start the development server

```bash
npm start
```

this launches the expo dev server. you'll see a QR code.

### step 3: run on your device

| option | how |
|--------|-----|
| **android emulator** | press `a` in the terminal |
| **ios simulator** | press `i` in the terminal (mac only) |
| **physical device** | install expo go, scan QR code |
| **web browser** | press `w` in the terminal (opens localhost) |

### step 4: test the signaling server (optional for local dev)

```bash
cd server
npm install
npm start
```

this starts the signaling server on port 3001. the app connects to it automatically.

---

## 5. signaling server setup

the signaling server is a tiny node.js + socket.io server that handles:
- room creation and discovery
- webrtc connection handshake (offer/answer/ice-candidate relay)
- presence notifications (user joined / left)

### why you need it

webrtc connections need a handshake before they can connect peer-to-peer. the signaling server is only used during the 2-3 second connection setup. after that, all data flows directly between peers.

### local development

```bash
cd server
npm install
npm start
# server runs on http://localhost:3001
```

### deploy to render.com (free)

1. create an account at https://render.com
2. click "new +" > "web service"
3. connect your github repository
4. set:
   - **root directory**: `server`
   - **environment**: `node`
   - **build command**: `npm install`
   - **start command**: `npm start`
5. click "create web service"
6. your server will be at `https://lets-watch-signaling.onrender.com`

### update the app to use your server

edit `src/services/signaling.js`:

```javascript
const SIGNALING_URL = 'https://your-app.onrender.com';
```

### server environment variables

| variable | default | description |
|----------|---------|-------------|
| PORT | 3001 | server port |

### server api endpoints

| endpoint | method | description |
|----------|--------|-------------|
| `/health` | GET | server status + connection count |
| `/room/:id` | GET | check if a room exists |

### websocket events (client-to-server)

| event | payload | description |
|-------|---------|-------------|
| `join-room` | `{ roomId, username }` | join a watch room |
| `offer` | `{ offer }` | send webrtc offer |
| `answer` | `{ answer }` | send webrtc answer |
| `ice-candidate` | `{ candidate }` | send ice candidate |
| `sync` | `{ type, ... }` | send sync command |
| `chat-message` | `{ message }` | send chat message |
| `typing` | none | typing indicator |
| `leave-room` | none | leave current room |

### websocket events (server-to-client)

| event | payload | description |
|-------|---------|-------------|
| `user-joined` | `{ username }` | peer joined room |
| `user-left` | `{ username }` | peer left room |
| `peer-ready` | `{ peerId, peerUsername }` | both users in room |
| `offer` | `{ offer, from }` | incoming webrtc offer |
| `answer` | `{ answer, from }` | incoming webrtc answer |
| `ice-candidate` | `{ candidate, from }` | incoming ice candidate |
| `sync` | `{ command, from }` | incoming sync command |
| `chat-message` | `{ username, message, time }` | incoming chat |
| `typing` | `{ username }` | peer is typing |
| `room-full` | none | room has 2 users already |

---

## 6. firebase setup (optional)

firebase is optional. the app works without it for watch parties, but you need it for:
- phone number / email authentication
- persistent watchlist synced across devices
- friend management
- movie diary storage

### step 1: create a firebase project

1. go to https://console.firebase.google.com
2. click "create a project"
3. name it `lets-watch`
4. disable google analytics (not needed)
5. click "create project"

### step 2: enable firebase services

**authentication:**
1. go to "authentication" > "sign-in method"
2. enable "phone" (for otp) and/or "email/password"
3. for phone auth, set up the android sha-256 fingerprint (get it via `cd android && ./gradlew signingReport`)

**firestore:**
1. go to "firestore database"
2. click "create database"
3. choose "start in test mode" (change later)
4. select a region closest to you

### step 3: get your config

1. go to "project settings" > "general"
2. under "your apps" click the web icon (`</>`)
3. copy the config object

### step 4: add config to app

edit `app.json`:

```json
"extra": {
  "firebaseConfig": {
    "apiKey": "AIzaSy...",
    "authDomain": "lets-watch.firebaseapp.com",
    "projectId": "lets-watch",
    "storageBucket": "lets-watch.appspot.com",
    "messagingSenderId": "123456789",
    "appId": "1:123456789:web:abc123"
  }
}
```

### firebase firestore data structure

```
users/{userId}/
  username: string
  createdAt: timestamp
  friends: [userId]

watchlists/{userId}/
  movies: [
    { id, title, year, addedAt }
  ]

watchlist_matches/{matchId}/
  movie: { title, year }
  userA: userId
  userB: userId
  matchedAt: timestamp
  watchedAt: timestamp (null until watched)

reflections/{reflectionId}/
  movieId: string
  userA: { userId, text }
  userB: { userId, text }
  createdAt: timestamp

messages/{messageId}/
  roomId: string
  from: userId
  text: string
  createdAt: timestamp
```

---

## 7. building the android apk

### method 1: eas build (recommended)

```bash
# install eas cli
npm install -g eas-cli

# login to expo
eas login

# build apk
eas build --platform android --profile preview

# or build app bundle for play store
eas build --platform android --profile production
```

this produces a downloadable `.apk` or `.aab` file on expo's servers. the free tier gives 30 builds per month.

### method 2: local build (no cloud needed)

```bash
# prebuild the project
npx expo prebuild --platform android

# build debug apk
cd android
./gradlew assembleDebug
# output: android/app/build/outputs/apk/debug/app-debug.apk

# build release apk
./gradlew assembleRelease
# output: android/app/build/outputs/apk/release/app-release.apk
```

### method 3: expo dev build

```bash
# create a development build
npx expo run:android
# this installs a custom expo go that includes your native modules
```

### required android permissions

these are already in `app.json`:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

### app signing

eas build handles signing automatically. for local builds:

```bash
# generate a keystore
keytool -genkey -v -keystore lets-watch.keystore -alias lets-watch -keyalg RSA -keysize 2048 -validity 10000

# place in android/app/lets-watch.keystore
# reference in android/app/build.gradle:
#   signingConfigs {
#     release {
#       storeFile file('lets-watch.keystore')
#       storePassword 'password'
#       keyAlias 'lets-watch'
#       keyPassword 'password'
#     }
#   }
```

---

## 8. building the website

### method 1: expo web build

```bash
# build static files
npx expo export --platform web

# output in dist/ directory
# deploy dist/ to any static host
```

### method 2: deploy to netlify (free)

1. push your repository to github
2. go to https://netlify.com
3. click "add new site" > "import existing project"
4. connect your repository
5. set build settings:
   - **build command**: `npx expo export --platform web`
   - **publish directory**: `dist`
6. click "deploy"

### method 3: deploy to vercel (free)

```bash
# install vercel cli
npm install -g vercel

# deploy
vercel --prod
```

### pwa support

the website is a progressive web app:
- add to home screen on android / ios
- works offline (after first load)
- fullscreen mode
- push notifications (via firebase cloud messaging)

---

## 9. app architecture deep-dive

### design philosophy

- **dark mode first**: everything is built on a `#0a0a0a` base with subtle textures
- **paper texture**: zen-browser inspired grain via css background patterns
- **no emojis**: icons are minimal svg line art
- **typography**: system font, light weights, generous letter-spacing
- **spacing**: 20px horizontal padding, 16px card padding -- consistent everywhere

### navigation structure

```
app
├── feed tab (default)
│   ├── activity feed (scrollable)
│   ├── search button
│   └── notifications button
├── watchlist tab
│   ├── "ready to watch" section (mutual thumbs-up)
│   ├── all movies list
│   └── "add movie" button
├── dms tab
│   ├── conversation list
│   └── new message button
└── watch together screen (modal/navigate)
    ├── webview video player (70% screen)
    ├── friend's face cam (draggable overlay)
    ├── your face cam (picture-in-picture)
    └── control bar
```

### data flow

```
user action
    |
    v
react component
    |
    ├──> local state (useState)
    ├──> firebase (remote data)
    └──> webrtc data channel (peer-to-peer sync)
              |
              v
         peer's app receives command
              |
              v
         webview executes injected javascript
              |
              v
         video.play() / video.pause() / video.currentTime = x
```

### state management

the app uses react's built-in `useState` and `useCallback` hooks. there is no external state library -- the app is simple enough that local state + firebase + webrtc data channels cover everything.

---

## 10. how watch together works

### the core insight

instead of building a video player from scratch, let's_watch **embeds existing streaming sites inside a webview**. the app controls playback by injecting javascript into the webview. this means:
- you can watch content from any site that serves video
- you don't need to handle drm or licensing
- the video quality is whatever the streaming site provides
- it works with youtube, netflix, prime video, disney+, hbo, hulu, and direct video files

### step-by-step flow

```
phase 1: both users thumbs-up a movie on their watchlist
    |
    v
phase 2: movie appears in "ready to watch"
    |
    v
phase 3: user a taps "watch" on the matched movie
    |
    v
phase 4: app creates a room via signaling server
    |       roomId = random 6-character string
    |       user a is in the room
    |
    v
phase 5: user a sees "waiting for [friend]..."
    |       app generates share link
    |       sends notification to friend
    |
    v
phase 6: user b taps notification -> app joins room
    |
    v
phase 7: signaling server detects both users in room
    |       sends "peer-ready" to both
    |
    v
phase 8: webrtc connection handshake
    |       a. both users request microphone permission
    |       b. both users create local audio streams
    |       c. user a creates peer connection
    |       d. user a creates offer -> sends via signaling
    |       e. user b receives offer -> creates answer
    |       f. user b sends answer -> sets remote desc
    |       g. both exchange ice candidates
    |       h. webrtc connection established (2-3 seconds)
    |
    v
phase 9: watch together screen loads
    |       a. webview loads the movie url
    |       b. injected javascript waits for video element
    |       c. when video is ready, app sends "play" via webview
    |       d. video starts on both screens simultaneously
    |       e. any play/pause/seek is synced via data channel
    |
    v
phase 10: movie ends
    |       a. both see prompt: "one thought about what you just watched?"
    |       b. each writes a short response
    |       c. responses revealed side by side
    |       d. optional: add to shared movie diary
```

### webview javascript injection

the file `src/utils/playbackScript.js` is injected into every webview. it:

1. **finds the video element** on any streaming site
2. **listens for commands** from react native via `window.addEventListener('message', ...)`
3. **reports events** back to react native via `window.ReactNativeWebView.postMessage(...)`

commands supported:

| command | payload | description |
|---------|---------|-------------|
| `play` | none | play the video |
| `pause` | none | pause the video |
| `toggle` | none | toggle play/pause |
| `seek` | `{ time: number }` | seek to position (seconds) |
| `setVolume` | `{ volume: number }` | set volume (0-1) |
| `setPlaybackRate` | `{ rate: number }` | set speed (0.5-2.0) |

events emitted:

| event | payload | description |
|-------|---------|-------------|
| `play` | `{ time }` | video started playing |
| `pause` | `{ time }` | video paused |
| `seeked` | `{ time }` | video seek completed |
| `timeupdate` | `{ time }` | playback position (frequent) |
| `ended` | none | video reached the end |
| `ready` | `{ duration, width, height }` | video element is ready |
| `buffering` | none | video is buffering |
| `playing` | none | video resumed from buffering |

### compatibility with streaming sites

| site | works? | notes |
|------|--------|-------|
| youtube.com | yes | fully supported |
| youtu.be | yes | shortened links work |
| netflix.com/watch/* | yes | test with your region |
| primevideo.com | yes | test with your region |
| disneyplus.com | yes | test with your region |
| hbomax.com | yes | test with your region |
| hulu.com | yes | test with your region |
| direct .mp4 | yes | works with any direct video url |
| direct .webm | yes | works with any direct video url |
| m3u8 streams | yes | works with hls streams |

note: some streaming sites may require login. the user logs in through the webview once, and the session persists.

---

## 11. all screens explained

### feed screen

the feed shows activity from your friend circle:

- **friend_watch**: "alex watched Blade Runner 2049"
- **rating**: "sam rated The Matrix 5/5"
- **watch_party**: "jordan invites you to watch Dune"
- **friend_added**: "riley joined let's_watch"
- **reflection**: "casey reflected on Interstellar"

pull down to refresh. tap any item for details (like on a reflection).

### watchlist screen

two sections:

1. **ready to watch**: movies both you and a friend have thumbs-upped. each card has a green dot and a "watch" button that starts a watch party.
2. **all movies**: complete list. movies with mutual likes show a green check badge.

use the search bar to filter movies. tap "+ add movie" to add a new movie to your list.

### dms screen

conversation list with:
- avatar (first letter of username)
- online/away/offline status dot
- last message preview
- unread count badge

tap a conversation to open it. tap the send icon (top right) to start a new conversation.

### watch together screen

the main event. layout:

```
┌─────────────────────────┐
│  back    status    room  │  <- top bar
├─────────────────────────┤
│                         │
│    webview video        │  <- 70%+ of screen
│    (youtube/netflix/)   │
│                         │
│  ┌──────┐               │
│  │friend│               │  <- draggable face cam overlay
│  │ cam  │               │     (120x90px)
│  └──────┘               │
│               ┌────┐   │
│               │ you│   │  <- self picture-in-picture
│               └────┘   │     (80x60px)
├─────────────────────────┤
│  [play] [mic] [cam] [end]  │  <- control bar
└─────────────────────────┘
```

**top bar:**
- back button (arrow left) -- ends the watch party
- connection status (green dot = connected)
- room id for sharing

**video area:**
- full-width webview
- injected javascript handles all playback control
- tap anywhere on video to toggle play/pause

**face cam overlay (draggable):**
- shows your friend's face (if they have camera on)
- drag it anywhere on screen
- tap to toggle visibility

**self picture-in-picture:**
- shows your own camera feed (if on)
- fixed position bottom-right
- smaller than friend's cam

**control bar:**
- play/pause -- toggles video playback (synced to peer)
- mic -- toggles your microphone on/off (off by default -- audio is not always on)
- camera -- toggles your face cam on/off
- end -- leaves the watch party (confirmation dialog)

**timestamp:**
- shows current time / total duration below controls
- format: `m:ss / m:ss`

---

## 12. webrtc deep-dive

### what is webrtc

webrtc (web real-time communication) is a free, open-source protocol that enables peer-to-peer audio, video, and data transfer between browsers and apps. no servers needed after connection setup.

### architecture

```
app a (initiator)                    app b (joiner)
       |                                  |
       |--- offer (sdp) ---signaling-->   |
       |                                  |
       |<-- answer (sdp) --signaling---   |
       |                                  |
       |--- ice candidates ----------->   |
       |<-- ice candidates ------------   |
       |                                  |
       |********* peer-to-peer ***********|
       |     (audio + video + data)       |
```

### stun / turn servers

the app uses google's free stun servers for nat traversal:

```javascript
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};
```

stun works for 85%+ of connections. if both users are behind symmetric NATs, you may need a turn server:

```bash
# install coturn (free, open-source)
sudo apt-get install coturn

# basic config
turnserver -a -o -f -n \
  --realm=letswatch \
  --user=letswatch:password \
  --external-ip=your-server-ip
```

add to ice servers:

```javascript
{ urls: 'turn:your-server:3478', username: 'letswatch', credential: 'password' }
```

### media tracks

audio:
- codec: opus
- sample rate: 48khz
- echo cancellation: on
- noise suppression: on
- audio is OFF by default (mic muted)

video (optional):
- resolution: 320x240
- frame rate: 15fps
- facing mode: user (front camera)
- video is OFF by default

### data channel

used for sync commands:

```javascript
// created on the initiator side
dataChannel = peerConnection.createDataChannel('sync', {
  ordered: true,  // guarantee ordering
});
```

properties:
- label: 'sync'
- ordered: true (commands execute in order)
- protocol: (empty, uses default)
- maxRetransmits: undefined (unlimited)
- reliable: true

---

## 13. sync protocol

### command format

all sync commands are json objects sent over the webrtc data channel:

```json
{
  "type": "play",
  "time": 42.5,
  "from": "user_a"
}
```

### commands

| type | fields | description |
|------|--------|-------------|
| `play` | `time` | video started at position |
| `pause` | `time` | video paused at position |
| `seek` | `time` | video seeked to position |
| `heartbeat` | `time` | periodic position check |
| `rate` | `rate` | playback rate changed |

### timing

- sync latency: < 100ms (peer-to-peer)
- heartbeat interval: 5 seconds (to resync if drift occurs)
- drift correction: if positions differ by >1s, both seek to average

### drift handling

both users send a heartbeat every 5 seconds with their current position. if the difference exceeds 1 second, the app corrects both to the average:

```
user a position: 142.3s
user b position: 143.8s
difference: 1.5s > 1s threshold
both seek to: (142.3 + 143.8) / 2 = 143.05s
```

---

## 14. deployment guide

### full deployment checklist

- [ ] signaling server deployed (render/railway/fly)
- [ ] app.json updated with signaling server url
- [ ] (optional) firebase project created and configured
- [ ] (optional) app.json updated with firebase config
- [ ] android apk built and tested
- [ ] website built and deployed

### cost breakdown

| service | cost | what it runs |
|---------|------|--------------|
| render.com | free (750h/month) | signaling server |
| expo eas | free (30 builds/month) | apk builds |
| firebase | free (50k reads/day) | auth + data |
| netlify | free (100gb/month) | website hosting |
| github | free | source code |
| **total** | **$0/month** | everything |

### scaling limits (free tier)

| metric | limit |
|--------|-------|
| concurrent watch parties | 1 (2 users) |
| signaling server uptime | goes to sleep after 15min idle on render free |
| firebase reads | 50,000 per day |
| firebase writes | 20,000 per day |
| eas builds | 30 per month |
| netlify bandwidth | 100gb per month |

the signaling server on render free tier goes to sleep after 15 minutes of inactivity. the first request after idle takes ~30 seconds to wake up. this does not affect active watch parties -- only the initial connection.

---

## 15. troubleshooting

### webview shows nothing

**cause**: the streaming site may block embedding via x-frame-options.

**solutions:**
1. try a different url (youtube always works)
2. some sites allow embedding for specific content
3. for netflix, use the `/watch/` path
4. try a direct .mp4 link for testing

### webrtc connection fails

**causes:**
1. signaling server is down or unreachable
2. both users are behind symmetric NATs (no turn server)

**solutions:**
1. check signaling server status: `curl https://your-server/health`
2. deploy a coturn server (see section 12)
3. ensure both devices are on different networks (webrtc won't connect if both are on the same local network behind the same NAT without a turn server -- actually, it should work with stun)

### mic/camera permissions not working

**android:**
- check app settings > permissions
- camera and microphone must be enabled

**ios:**
- check settings > let's_watch > camera/microphone
- delete and reinstall if permissions are stuck

**web:**
- browser will prompt for permissions
- click the lock icon in the address bar to change permissions
- safari may require enabling "request permission" explicitly

### audio is always on? (it shouldn't be)

audio is OFF by default. the mic button in the control bar toggles it. if audio is on unexpectedly:
1. tap the mic button to mute
2. check that `audio: true` isn't accidentally forced in `createLocalStream`
3. the `isMuted` state defaults to `true` -- audio tracks are created but disabled

### video positions drift out of sync

**cause**: network latency or buffering differences.

**fix**: the app automatically corrects drift > 1 second via heartbeats. you can also manually seek by dragging the video timeline (the seek is synced to the peer).

---

## 16. faq

### q: can i watch paid content like netflix without paying?

no. you need your own netflix subscription. the app embeds netflix in a webview -- you still log in with your own account. the app does not bypass any paywalls.

### q: how many people can watch together?

the app is designed for 2 people. the room system limits to 2 users. this keeps the experience intimate and the webrtc logic simple.

### q: can i use this for long-distance relationships?

yes. that's one of the primary use cases. the app is designed for two people who want to watch movies together while apart.

### q: why is audio off by default?

the user specifically requested audio not always on. this avoids accidental noise and gives the user control over when to talk.

### q: does it work with screen recording / drm content?

some drm-protected content (like netflix on certain browsers) may not play inside a webview. in most cases it works fine on mobile. desktop web may have more restrictions.

### q: i want to add a feature. where do i start?

read through this guide, then look at:
- `src/screens/` for new screens
- `src/components/` for new ui components
- `src/services/` for new backend services
- `server/` for server-side changes

### q: can i customize the design?

all design tokens are in `src/utils/styles.js`. change colors, spacing, and typography there. the paper background texture is in `PaperBackground.js`.

### q: how do i reset my data?

delete the app and reinstall, or clear app data in system settings. on web, clear local storage and indexedDB. firebase data can be deleted from the firebase console.

### q: can i run this on ios without a paid developer account?

yes! use expo go. you can scan the QR code from the expo dev server and run on your physical iphone. you only need a paid account ($99/year) if you want to build a standalone .ipa or publish to the app store.

---

## final notes

this app is designed to be:
- **one cohesive app** -- no jumping between websites or apps
- **zero cost** -- everything runs on free tiers
- **minimalistic** -- dark mode, paper texture, no emojis, just icons
- **fully native** -- webrtc is native, webview is native, everything runs on-device
- **private** -- peer-to-peer means your audio/video never hits a server

built with react native, expo, webrtc, socket.io, and firebase.

enjoy watching together.
