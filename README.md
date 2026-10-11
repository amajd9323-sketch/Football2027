# Football 2027 Arena — Phase 1

Personalized offline 1v1 arcade football starring Roksi (Real Madrid-inspired colors) and Hema / Ibi (Barcelona-inspired colors), with original custom artwork and original code-drawn characters. This game is inspired by the broad genre of side-view arcade football; it does not reuse other games' names, characters, sounds, or assets.

## Phase 1 scope
- Canvas 2D landscape football with fixed-step 60 Hz simulation
- 3-2-1 kickoff, bouncing ball, goalposts/nets, head collision, timed shoe kick, air kick, stomp, player collision, short goal celebration and golden goal
- Offline AI with three difficulty profiles and local two-player mode
- Eight character choices and three of six selected special powers per match
- Settings: sound, synthesized music, vibration, button side/size and language labels
- Local match rewards, daily coin reward and saved statistics
- No online server in this phase

## Android build
Pushes to `main` trigger GitHub Actions. The workflow builds Vite, creates Capacitor Android, forces landscape orientation, builds a debug APK and uploads the `Football2027-debug-apk` artifact.

## Phase 2 and 3
Online rooms/server matchmaking, progression, upgrades, leagues and missions are intentionally deferred until approved.
