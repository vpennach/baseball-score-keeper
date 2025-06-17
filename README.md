# Baseball Score Keeper

A simple iPhone app for tracking baseball scores using Expo Go. The app allows you to:
- Set up teams and players
- Track game scores and player statistics
- View game history

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- iOS Simulator (for Mac users)
- Expo Go app (for physical device testing)

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Start the development server:
```bash
npm start
# or
yarn start
```

## Running on iOS Simulator

1. Make sure you have Xcode installed on your Mac
2. Open the iOS Simulator:
   - Press `i` in the terminal where Expo is running
   - Or click "Run on iOS simulator" in the Expo Dev Tools browser window
   - Or open Xcode → Xcode menu → Open Developer Tool → Simulator

## Development

The app is built with:
- React Native
- Expo
- TypeScript
- React Navigation

## Project Structure

```
src/
  ├── screens/         # Screen components
  │   ├── HomeScreen.tsx
  │   ├── GameSetupScreen.tsx
  │   ├── GameScreen.tsx
  │   └── HistoryScreen.tsx
  └── ...
```

## Next Steps

- MongoDB integration for data persistence
- Game scoring functionality
- Game details view
- Player statistics tracking 