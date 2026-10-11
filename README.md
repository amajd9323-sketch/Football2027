# EuroKick 2D

A mobile-first 2D football arcade starter built with HTML Canvas, Vite, and Capacitor for Android.

## Modes
- Quick match against AI (offline)
- Two players on the same phone
- Online room-code screen is currently a placeholder; real online play requires Firebase Realtime Database integration and security rules.

## Teams
Real Madrid, Barcelona, Manchester City, Liverpool, Arsenal, Manchester United, Bayern Munich, Borussia Dortmund, Paris Saint-Germain, Juventus. This is a curated 2026/27-themed selection, not an official ranking. Names are text-only; no official club crests or licensed player assets are included.

## Run locally
```bash
npm install
npm run dev
```

## Build Android APK
Requires Node.js 20+, Java 17, and Android SDK via GitHub Actions:
1. Open the repository's Actions tab.
2. Select **Build Android APK**.
3. Press **Run workflow** (or push a commit to main).
4. Download the `EuroKick2D-debug-apk` artifact from the completed run.

The workflow creates the Android project if missing, syncs Capacitor, and builds a debug APK.

## Current limitation
Online room-code multiplayer is not connected to a real server yet. Offline AI and same-device play are available in the starter project.
