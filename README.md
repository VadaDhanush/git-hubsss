# Dhanush Jaddu — Daily Tracker App
## Setup Guide (Step by Step)

---

### STEP 1 — Install Node.js
Download from: https://nodejs.org  (pick LTS version)
After install, open Command Prompt and verify:
```
node -v
npm -v
```

---

### STEP 2 — Install Expo tools
```
npm install -g expo-cli eas-cli
```

---

### STEP 3 — Create project and copy files

```
npx create-expo-app DhanushJaddu --template blank
cd DhanushJaddu
```

Now **copy all files** from this folder into your DhanushJaddu folder:
- App.js              → replace the default one
- src/                → copy the entire src folder
- app.json            → replace the default one
- package.json        → replace the default one

---

### STEP 4 — Install dependencies
```
npm install
npx expo install expo-sensors react-native-svg
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-navigation/native @react-navigation/bottom-tabs
```

---

### STEP 5 — Test on your phone RIGHT NOW (No APK needed)

1. Install **Expo Go** from Play Store on your phone
2. Make sure phone and PC are on the same WiFi
3. Run:
```
npx expo start
```
4. Scan the QR code shown in terminal with your phone camera
5. App opens on your phone instantly!

---

### STEP 6 — Build real APK

1. Create free account at: https://expo.dev

2. Login and build:
```
eas login
eas build:configure
eas build -p android --profile preview
```

3. Wait ~10-15 minutes → you get a download link for the .apk

---

### STEP 7 — Install APK on phone

1. Download the .apk file
2. Send to phone (WhatsApp, Drive, USB)
3. Open file on phone → tap Install
4. If blocked: Settings → Security → Allow unknown sources → Install

---

### LIVE STEPS
Steps are automatically tracked from your phone's built-in pedometer.
No manual entry needed!
The Habits tab → shows live step count updating in real time.

---

### Features
- Home: Steps arc, study stats, water, mood, quick habits
- Study: Live focus timer with session logging
- Gym: Workout logger + Body/BMI tracker
- Diet: Macros + meal logging + water
- Habits: Live steps (auto) + habit tracker + sleep schedule
- Dark / Light mode toggle
- All data saved locally on device
- 5-bar charts on every section
