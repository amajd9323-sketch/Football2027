# Football 2027 Arena

A mobile-first side-view 2D arcade football game with original Canvas-drawn characters and stadium art. Inspired by the general 1v1 arcade football genre; no Head Ball 2 art, sounds, or branding are reused.

## Modes
- Solo vs AI, playable offline after installation
- Local two-player match on one device
- Private online room using PeerJS WebRTC (both devices need internet; some networks need a TURN relay)

## Controls
Move left/right, jump, shoot and use one of three powers: rocket shot, freeze, or giant mode. Match lasts 90 seconds.

## Android build
GitHub Actions builds on every push to `main`. The workflow installs Node and Java, installs Android SDK platform/build tools, builds the web bundle, creates Capacitor Android, applies landscape orientation to MainActivity, builds the debug APK and uploads `Football2027-debug-apk`.

## Current limits
This is an arcade prototype. Online peer rooms use a public signaling service and are not guaranteed to connect on every network. Official club badges and player likenesses are not used.
