# Football 2027 Arena

A mobile-first 2D arcade football game inspired by the broad genre of fast 1v1 head-to-head football games. It uses original Canvas-drawn characters and UI, not Head Ball 2 assets or branding.

## Modes
- Solo vs computer (offline after the app is installed)
- Local two-player mode on one device
- Online private room using PeerJS WebRTC data channels (requires both devices to have internet and a browser/WebView with WebRTC support)

Online rooms use the free PeerJS Cloud signaling service by default. Peer-to-peer connection can fail on networks that require a TURN relay; if that happens, a custom signaling/TURN service is needed.

## Build Android APK
GitHub Actions automatically builds on each push to `main`, or manually:
1. Open the **Actions** tab.
2. Choose **Build Android APK**.
3. Choose **Run workflow**.
4. After it finishes successfully, download **Football2027-debug-apk** from **Artifacts**.

The workflow installs TypeScript (required by `capacitor.config.ts`), builds the Vite bundle, creates the Android platform, syncs it and compiles a debug APK.

## Gameplay
90-second matches, jump, kick, a super move on cooldown, three character styles, and a team-color selector. Clubs are represented only by text names/colors; official badges and player likenesses are not included.
