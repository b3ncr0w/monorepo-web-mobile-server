# Monorepo Project

A modern Yarn Workspaces monorepo with server, web, mobile, and shared packages.

## Platform Support

This project is optimized for development on:
- macOS
- Windows

The development environment and build scripts are specifically configured to provide the best experience on these platforms.

## 📁 Structure

```
.
├── apps/
│   ├── server/     # Express.js server
│   ├── web/        # Vite + React web
│   └── mobile/     # React Native + Expo
├── packages/
│   ├── core/       # Shared core
│   └── ui/         # Shared UI
├── scripts/        # Build and dev scripts
├── config/         # Config files
└── dist/           # Build outputs
```

## 🚀 Features

- **Web Application**: React + Vite app with:
  - Fast HMR with Vite
  - TypeScript support
  - React Native Web compatibility
  - Shared UI components

- **Mobile Application**: React Native + Expo app with:
  - Expo SDK and development tools
  - File-based routing with Expo Router
  - Native UI components
  - Cross-platform compatibility (iOS/Android)
  - Development client support
  - EAS Build configuration

## 🛠️ Requirements

- Node.js >= 18.x (LTS)
- Yarn
- Expo CLI (`yarn global add expo-cli`)
- For mobile development:
  - iOS: XCode and iOS Simulator
  - Android: Android Studio and Android SDK
  - Expo Go app on physical devices (optional)

## 🏃‍♂️ Getting Started

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Start development environment:
   ```bash
   # Start everything (server, web, and mobile)
   yarn dev

   # Or start specific combinations:
   yarn dev:web    # server + web
   yarn dev:mobile # server + mobile
   ```

   For iOS/Android specific development:
   ```bash
   yarn dev:ios     # server + iOS simulator (Mac only)
   yarn dev:android # server + Android emulator
   ```

## 🎮 Server Commands

The development server supports runtime commands:

- `p` - Pause/Resume server
- `d <ms>` - Set request delay (e.g., `d 2000` for 2s delay)
- `d` - Remove delay

## ⚙️ Configuration

### API Endpoints (`config/api.config.json`)

```json
{
  "autoSetApiDevEndpoint": true,
  "autoSetApiEndpoint": false,
  "apiDevEndpoint": "http://localhost:3000",
  "apiEndpoint": "http://localhost:3000"
}
```

- `autoSetApiDevEndpoint`: Automatically set development endpoint to server's network address
- `autoSetApiEndpoint`: Automatically set production endpoint to server's network address
- `apiDevEndpoint`: Development API endpoint
- `apiEndpoint`: Production API endpoint

## 📜 Available Scripts

### Development
- `yarn dev` - Start all applications (server, web, mobile)
- `yarn dev:web` - Start web app with server
- `yarn dev:mobile` - Start Expo development with server
- `yarn dev:ios` - Start iOS simulator with server (Mac only)
- `yarn dev:android` - Start Android emulator with server

### Building
- `yarn build:web` - Build web application
- `yarn build:server` - Build server
- `yarn build:android` - Build Android APK (local build)
- `yarn build:android:dev` - Build Android development build (EAS)
- `yarn build:android:prod` - Build Android production build (EAS)
- `yarn build:ios` - Build iOS app (local build with EAS)
- `yarn build:ios:dev` - Build iOS development build (EAS)
- `yarn build:ios:prod` - Build iOS production build (EAS)

### Utilities
- `yarn clean` - Clean project (builds, dependencies, native folders, and caches)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 