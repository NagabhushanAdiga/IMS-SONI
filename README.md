# IMS-SONI - Soni Traders Inventory Management System

This folder contains **two complete React Native mobile apps** based on the [IMS web project](https://github.com/NagabhushanAdiga/IMS-fronend):

1. **IMS-Expo** - Built with Expo (managed workflow)
2. **IMSReactNative** - Built with React Native CLI (bare workflow)

Both apps connect to the same backend API: `https://ims-backend-bay.vercel.app/api`

## Features (Both Apps)

- **PIN Authentication** - 4-digit PIN login
- **Dashboard** - Total stock, boxes sold, returned, remaining
- **Folders** - Category management (add, edit, delete)
- **Folder Items** - Box/product management within folders
- **Sales** - View and update sale status
- **Returns** - View returned boxes with stats
- **Search** - Date range search with filters
- **Reports** - Monthly reports and analytics
- **Settings** - Change PIN, logout
- **Developer** - Developer profile page

## Default Login PIN

Use **1234** for demo (or whatever PIN is configured in your backend).

---

## IMS-Expo (Expo Project)

### Run

```bash
cd IMS-Expo
npm start
```

Then press:
- `i` for iOS simulator
- `a` for Android emulator
- Or scan QR code with Expo Go app

### Dependencies

- expo-linear-gradient
- @react-navigation/native, native-stack, drawer
- axios, @react-native-async-storage/async-storage

---

## IMSReactNative (Bare React Native)

### Run iOS

```bash
cd IMSReactNative
cd ios && bundle install && bundle exec pod install && cd ..
npx react-native run-ios
```

### Run Android

```bash
cd IMSReactNative
npx react-native run-android
```

### Dependencies

- react-native-linear-gradient
- @react-navigation/native, native-stack, drawer
- axios, @react-native-async-storage/async-storage

---

## Project Structure (Both)

```
src/
├── services/api.js       # API client (auth, products, categories, sales, returns)
├── context/AuthContext.js
├── components/
│   ├── StatCard.js
│   └── Snackbar.js
└── screens/
    ├── LoginScreen.js
    ├── DashboardScreen.js
    ├── FolderScreen.js
    ├── FolderItemsScreen.js
    ├── SalesScreen.js
    ├── ReturnsScreen.js
    ├── SearchScreen.js
    ├── ReportsScreen.js
    ├── SettingsScreen.js
    └── DeveloperScreen.js
```

---

## Web Reference

The original web app is cloned in `ims-web-reference/` for reference.
