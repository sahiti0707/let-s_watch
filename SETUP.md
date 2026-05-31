# let's_watch -- step by step setup guide

**goal**: turn this code into a real app that you and your friend can use right now, even if you live far apart.

---

## what you're building

```
you (android phone)  <--->  friend (anywhere in world)
        |                          |
   uses apk                   uses website
   or website                 or apk
        |                          |
        |--- signaling server ----|   (free on render.com)
        |                          |
        |--- webrtc peer-to-peer --|   (direct, no server)
```

---

## the 30-minute path

this gets you a working app you can share in under an hour.

| step | time | what you do |
|------|------|-------------|
| 1 | 5 min | deploy signaling server |
| 2 | 2 min | update app with your server url |
| 3 | 10 min | build the website |
| 4 | 2 min | deploy the website |
| 5 | 10 min | build the apk |
| 6 | 1 min | send links to your friend |

---

## step 1: deploy the signaling server (free)

the signaling server is the tiny piece that helps your phones find each other. after that, they talk directly.

### option a: render.com (easiest, free)

1. go to https://render.com
2. sign up with github or google (30 seconds)
3. click "new +" > "web service"
4. click "build and deploy from a git repository"
5. connect your github account
6. select the `let's_watch` repository
7. in the settings page:

```
name: lets-watch-signaling
root directory: server
environment: node
build command: npm install
start command: npm start
plan: free
```

8. click "create web service"
9. wait 2-3 minutes for it to build
10. your url will be: `https://lets-watch-signaling.onrender.com`

**important**: the free tier goes to sleep after 15 minutes of inactivity. the first request after sleep takes 30 seconds to wake up. this only affects the initial connection -- once you're connected, it works fine.

### option b: railway.app (alternative, free)

1. go to https://railway.app
2. sign up with github
3. click "new project" > "deploy from github repo"
4. select your repo
5. set `root directory` to `server`
6. set `start command` to `npm start`
7. click "deploy"

railway gives $5 free credit monthly (enough to run this forever).

### option c: fly.io (alternative, free)

```bash
# install flyctl
curl -L https://fly.io/install.sh | sh

# login
fly auth login

# launch
cd server
fly launch --name lets-watch-signaling
fly deploy
```

fly.io free tier includes 3 shared-cpu VMs.

### option d: your own computer (if friend is nearby on same wifi)

```bash
cd let's_watch/server
npm install
npm start
```

find your local ip: `ip addr show | grep 192` (linux) or `ipconfig` (windows)
your server is at `http://192.168.x.x:3001`

this only works if both of you are on the same wifi network.

---

## step 2: update the app with your server url

once you have your server url, update it in the app:

1. open `src/services/signaling.js`
2. find this line:

```javascript
const SIGNALING_URL = Platform.select({
  web: 'http://localhost:3001',
  default: 'https://lets-watch-signaling.onrender.com',
});
```

3. change it to your actual server url:

```javascript
const SIGNALING_URL = Platform.select({
  web: 'https://your-app.onrender.com',
  default: 'https://your-app.onrender.com',
});
```

use `https://` for deployed servers, `http://localhost:3001` for local testing.

---

## step 3: build the website (free)

the website version works in any browser. your friend can use it without installing anything.

### option a: netlify (easiest, free)

1. push your code to a github repository
2. go to https://netlify.com
3. sign up with github
4. click "add new site" > "import existing project"
5. select your repository
6. build settings:

```
build command: npx expo export --platform web
publish directory: dist
```

7. click "deploy site"
8. your site is live at `https://random-name.netlify.app`

### option b: vercel (alternative, free)

```bash
# install vercel cli
npm install -g vercel

# login
vercel login

# deploy
cd let's_watch
npx expo export --platform web
vercel --prod
```

### option c: cloudflare pages (alternative, free)

1. go to https://pages.cloudflare.com
2. connect your github repo
3. build settings:

```
build command: npx expo export --platform web
build output: dist
```

4. deploy

### option d: github pages (alternative, free)

```bash
# build
cd let's_watch
npx expo export --platform web

# create a gh-pages branch
git checkout --orphan gh-pages
git rm -rf .
cp -r dist/* .
git add .
git commit -m "deploy"
git push origin gh-pages

# enable pages in repo settings > pages > branch: gh-pages
```

### option e: local sharing for testing

if you just want to test without deploying:

```bash
cd let's_watch
npx expo export --platform web
cd dist
npx serve .
```

your friend can access `http://your-ip:3000` on the same network.

---

## step 4: build the android apk (free)

your friend needs an apk file to install on their android phone.

### option a: eas build (easiest, free)

```bash
# install eas cli
npm install -g eas-cli

# login to expo
eas login
# create account at https://expo.dev if you dont have one

# build apk
cd let's_watch
eas build --platform android --profile preview
```

this takes 5-10 minutes. when done, you get a download link:

```
√ build successful
√ upload to expo servers
your apk: https://expo.dev/artifacts/.../app-release.apk
```

send this link to your friend. they download and install directly.

### option b: expo dev build (free, no cloud needed)

```bash
cd let's_watch
npx expo prebuild --platform android
cd android
./gradlew assembleDebug
```

the apk will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

you'll need java 17+ and android sdk installed.

### option c: github actions (free, automated)

create `.github/workflows/build-apk.yml`:

```yaml
name: build apk
on: [push, workflow_dispatch]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npx expo prebuild --platform android
      - run: cd android && ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
```

push to github, go to actions tab, download the apk artifact.

### option d: share via expo go (no build needed, but limited)

if you just want to test without building:

```bash
cd let's_watch
npm start
```

scan the qr code with expo go on your phone. your friend needs expo go too.

**limitation**: expo go doesn't support all native modules (webrtc may not work).

---

## step 5: how to share with your friend

### what to send

send these two things:

1. **website url**: `https://your-site.netlify.app` (friend opens in browser)
2. **apk download link**: `https://expo.dev/artifacts/.../app-release.apk` (friend installs on android)

### friend installs the apk (android)

android will warn "this app is from an unknown source." this is normal. tell them:

1. download the apk from the link you sent
2. open it
3. android will show a warning -- tap "install anyway" or "settings"
4. enable "install from unknown sources"
5. go back and tap install

### friend opens the website (ios / android / desktop)

no installation needed. they just open the link in their browser.

**ios note**: the website version has limited webrtc support on safari. for best ios experience, they should use chrome or firefox. or you can help them add it to home screen (share menu > "add to home screen") which makes it act like a real app.

### connecting for the first time

1. open the app / website
2. one of you creates a room (tap "watch together" on a movie)
3. app generates a 6-character room code: `x7k3m9`
4. send the room code to your friend (text, whatsapp, telegram, whatever)
5. friend enters the room code
6. you're connected

### troubleshooting the first connection

| problem | fix |
|---------|-----|
| "connecting..." never connects | check signaling server is running: `curl https://your-server.onrender.com/health` |
| webview is blank | try a youtube url first (always works) |
| no audio | tap the mic button (audio is off by default) |
| camera not working | check browser/app permissions |
| "room not found" | make sure both use the same room code |

---

## step 6: one-time setup per person

### you (the deployer)

1. deploy signaling server
2. build website
3. build apk
4. send links to friend

### your friend

1. open website link OR download and install apk
2. (optional) allow camera/mic permissions when asked
3. thats it. no account needed. no sign up.

---

## cost summary

| service | cost | what it runs |
|---------|------|--------------|
| render.com | free | signaling server |
| netlify | free | website hosting |
| expo eas | free (30 builds/month) | apk builder |
| github | free | source code + actions |
| **your total** | **$0** | everything |

---

## what to do when something breaks

| error | most likely fix |
|-------|-----------------|
| "cannot connect to signaling server" | render.com server went to sleep. wait 30s and retry. or upgrade to a $7/month plan to keep it awake. |
| apk download link expired | run `eas build --platform android --profile preview` again |
| website shows blank page | run `npx expo export --platform web` and redeploy |
| webrtc not connecting on friend's phone | both of you switch to the **website version** (websites are easier to debug) |
| "audio is cracking" | both of you make sure you're on stable wifi, not mobile data |

---

## the simplest possible path (5 minutes)

if you want to test right now with zero configuration:

1. both of you install **expo go** from the app store
2. on your computer: `cd let's_watch && npm start`
3. you scan the QR code -> app opens on your phone
4. your friend needs to be on the same wifi network
5. your friend scans the same QR code from their phone (use a messaging app to send them the QR image)
6. the app opens on both phones on the same local wifi

this works for testing but doesn't support webrtc fully. for the real experience, deploy the signaling server and build the apk.

---

## tl;dr (summary for non-technical people)

1. **sign up** at render.com, netlify.com, expo.dev (all free)
2. **deploy signaling server** on render (takes 3 minutes)
3. **deploy website** on netlify (takes 2 minutes)
4. **build apk** with expo (takes 10 minutes)
5. **send the website url and apk download link** to your friend
6. both of you open the app, share a room code, start watching

you don't need to know how to code. you don't need to pay anything. the whole thing runs for free forever.
