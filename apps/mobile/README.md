# Kuwboo Mobile

Flutter cross-platform mobile app (iOS + Android) for Kuwboo.

## Requirements

- Flutter 3.35.0 or later (check `.github/workflows/ios-testflight.yml` for the pinned version)
- Xcode 16.0+ (for iOS builds)
- CocoaPods 1.15+ (`sudo gem install cocoapods`)
- Ruby 3.2+ (for Fastlane)

## Local development

```bash
# From the monorepo root
cd apps/mobile

# Install dependencies
flutter pub get

# Run on an iOS simulator (uses dev environment by default)
flutter run -d "iPhone 15 Pro"

# Run against staging API
flutter run --dart-define=KUWBOO_ENV=staging

# Run against production API
flutter run --dart-define=KUWBOO_ENV=prod
```

## Environment configuration

The API base URL is selected at build time via `--dart-define=KUWBOO_ENV=<env>`:

| Env | API URL |
|-----|---------|
| `dev` (default) | `https://kuwboo-api.codiantdev.com` |
| `staging` | `https://kuwboo-api.codiantdev.com` |
| `prod` | `https://api.kuwboo.com` |

You can also override the URL directly with `--dart-define=KUWBOO_API_URL=https://...`.

See `lib/config/environment.dart` for the full configuration.

## iOS build and signing

Bundle ID: `com.kuwboo.mobile`
Team ID: `5GQA38WHMY`
Minimum iOS version: 15.0

The app uses **automatic signing** in Xcode and **App Store Connect API key** authentication for CI.

### Building locally

```bash
cd apps/mobile/ios
bundle install  # Install Fastlane + CocoaPods
bundle exec pod install

cd ..
flutter build ipa --release --dart-define=KUWBOO_ENV=prod
```

The `.ipa` will be at `build/ios/ipa/kuwboo_mobile.ipa`.

### Uploading to TestFlight via Fastlane (locally)

Set the required environment variables, then run the `beta` lane:

```bash
export APP_STORE_CONNECT_API_KEY_ID=3B764CRX7S
export APP_STORE_CONNECT_API_ISSUER_ID=6461be03-feb0-432f-9a9d-8e074ac2ffec
export APP_STORE_CONNECT_API_KEY_CONTENT="$(cat ~/path/to/AuthKey_3B764CRX7S.p8)"

cd apps/mobile/ios
bundle exec fastlane beta
```

This will:
1. Clean + pub get + pod install
2. Build a signed release `.ipa`
3. Upload to TestFlight
4. Generate a changelog from recent git commits

### Uploading to TestFlight via GitHub Actions (recommended)

1. Ensure GitHub Secrets are set (see `docs/team/internal/TESTFLIGHT_RUNBOOK.md`)
2. Go to the Actions tab → "iOS TestFlight" workflow → "Run workflow"
3. Select environment (prod/staging) and build number (or leave blank for auto)

## Android

Android scaffolding exists but TestFlight is iOS-only. For Google Play setup, see (TODO: Android runbook).

```bash
flutter build apk --release --dart-define=KUWBOO_ENV=prod
```

## Project structure

```
apps/mobile/
├── lib/
│   ├── main.dart              # Entry point
│   ├── app/                   # Router, theme, root widget
│   ├── config/
│   │   └── environment.dart   # Build-time env config
│   ├── providers/             # Riverpod providers (auth, API, yoyo)
│   └── features/              # Feature modules (auth, video, social, etc.)
├── ios/
│   ├── Runner/                # iOS app target
│   │   └── Info.plist         # Bundle config, privacy strings
│   ├── Runner.xcodeproj       # Xcode project
│   ├── Runner.xcworkspace     # CocoaPods workspace (open this in Xcode)
│   ├── Podfile                # CocoaPods dependencies
│   ├── ExportOptions.plist    # App Store export config
│   ├── Gemfile                # Ruby dependencies (Fastlane, CocoaPods)
│   └── fastlane/              # CI lanes
│       ├── Fastfile           # Lane definitions (beta, build, tests)
│       └── Appfile            # Bundle ID + Team ID
├── android/                   # Android scaffolding
├── pubspec.yaml               # Flutter dependencies
└── README.md                  # This file
```

## Testing

```bash
flutter test
```

## Troubleshooting

**`pod install` fails with SSL errors**
Try `pod repo update` first, then `pod install`.

**`flutter build ios` fails with "No valid code signing certificates"**
Open `ios/Runner.xcworkspace` in Xcode, select the Runner target, go to Signing & Capabilities, and make sure "Automatically manage signing" is checked with Team set to Guess This Ltd (5GQA38WHMY).

**Build number conflict on TestFlight upload**
The workflow auto-increments using GitHub run number. If you're uploading manually, set `BUILD_NUMBER=<higher>` before running fastlane.

**Deployment target mismatch on pod install**
The `Podfile` `post_install` hook forces all pods to iOS 15.0. If a pod requires a higher version, bump `IPHONEOS_DEPLOYMENT_TARGET` in both `project.pbxproj` and `Podfile`.
