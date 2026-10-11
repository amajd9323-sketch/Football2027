# Football 2027 Arena

A personalized 1v1 side-view arcade football game starring Roksi in Real Madrid-inspired white-and-gold colors and Hema / Ibi in Barcelona-inspired blue-and-maroon colors. The central couple illustration is used as the game emblem, with custom avatar sprites. Inspired by the broad arcade-football genre without reusing Head Ball 2 game assets.

## Modes and extras
- Solo vs computer, offline after installation
- Local two-player on one phone
- Online peer-to-peer room codes using PeerJS/WebRTC (both players need internet; some networks may need a TURN relay)
- Rocket shot, freeze opponent, giant mode, and arena energy pickups
- Dedicated "Roksi × Hema Love Clasico" quick match
- Local couple match record saved on the device

## Controls
Move left/right, jump, shoot, and trigger the selected special power. Matches last 90 seconds.

## Android APK
Pushes to `main` trigger a GitHub Actions build. The workflow builds Vite, generates Capacitor Android, forces landscape orientation, and uploads a debug APK artifact.
