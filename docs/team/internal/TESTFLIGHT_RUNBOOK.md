# TestFlight Runbook

**Last updated:** 2026-04-09
**Owner:** Philip Cutting (LionPro Dev)
**App:** Kuwboo Mobile (iOS)

This runbook covers everything needed to ship Kuwboo iOS builds to TestFlight.

---

## Key facts

| Item | Value |
|------|-------|
| Bundle ID | `com.kuwboo.mobile` |
| Apple Team ID | `5GQA38WHMY` |
| App Store Connect Key ID | `3B764CRX7S` |
| App Store Connect Issuer ID | `6461be03-feb0-432f-9a9d-8e074ac2ffec` |
| Minimum iOS version | 15.0 |
| Flutter version | 3.35.0 |
| Signing | Automatic, via App Store Connect API key |

---

## One-time setup

### 1. Apple Developer / App Store Connect

These must be done in a browser by a team admin:

1. **Confirm Apple Developer Program membership** is active (Guess This Ltd, team `5GQA38WHMY`)
2. **Register the Bundle ID** `com.kuwboo.mobile`:
   - Go to [developer.apple.com/account/resources/identifiers](https://developer.apple.com/account/resources/identifiers/list)
   - Click "+" → App IDs → App → Continue
   - Description: "Kuwboo Mobile"
   - Bundle ID: Explicit → `com.kuwboo.mobile`
   - Enable capabilities if needed (Push Notifications, Associated Domains, Sign in with Apple)
3. **Create the app in App Store Connect**:
   - Go to [appstoreconnect.apple.com/apps](https://appstoreconnect.apple.com/apps)
   - "+" → New App → iOS
   - Name: "Kuwboo"
   - Primary language: English (UK)
   - Bundle ID: select `com.kuwboo.mobile`
   - SKU: `kuwboo-mobile-ios` (or any unique string)
   - User Access: Full Access
4. **Complete the App Store Connect privacy questionnaire** (required before first TestFlight upload)
5. **Add internal TestFlight testers**:
   - App Store Connect → My Apps → Kuwboo → TestFlight → Internal Testing
   - Create a group, add team member Apple IDs

### 2. GitHub Secrets

The GitHub Actions workflow needs 4 secrets. Go to:
**https://github.com/pcutting/team_kuwboo/settings/secrets/actions**

Click "New repository secret" for each:

| Secret name | Value |
|-------------|-------|
| `APPLE_KEY_ID` | `3B764CRX7S` |
| `APPLE_ISSUER_ID` | `6461be03-feb0-432f-9a9d-8e074ac2ffec` |
| `APPLE_TEAM_ID` | `5GQA38WHMY` |
| `APPLE_KEY_P8_BASE64` | **See below** |

**Generating `APPLE_KEY_P8_BASE64`:**

On the Mac where the `.p8` file lives (`/Users/philipcutting/Projects/clients/active/neil_douglas/AuthKey_3B764CRX7S.p8`), run:

```bash
base64 -i /Users/philipcutting/Projects/clients/active/neil_douglas/AuthKey_3B764CRX7S.p8 | pbcopy
```

This copies the base64-encoded key to your clipboard. Paste it into the `APPLE_KEY_P8_BASE64` GitHub secret.

> **Alternative (if the file was already base64-encoded to `~/Desktop/kuwboo-apple-key-base64.txt`):**
> ```bash
> cat ~/Desktop/kuwboo-apple-key-base64.txt | pbcopy
> ```

**Do not commit the .p8 file or its base64 encoding to the repo.** The `.gitignore` already excludes `*.p8` and `AuthKey_*.p8`.

---

## Triggering a TestFlight build

### Option A: GitHub Actions (recommended)

1. Go to [Actions tab](https://github.com/pcutting/team_kuwboo/actions/workflows/ios-testflight.yml)
2. Click **"Run workflow"**
3. Choose:
   - **Environment**: `prod` (or `staging`)
   - **Build number**: leave blank for auto (uses GitHub run number)
4. Click "Run workflow"
5. Monitor the build (~15-25 min on `macos-latest`)
6. On success: build appears in App Store Connect → TestFlight within ~5 minutes (Apple processing)
7. Once Apple processing completes, add testers (if not already added to a group) and distribute

### Option B: Local Fastlane

On any Mac with the `.p8` file:

```bash
cd apps/mobile/ios
bundle install
export APP_STORE_CONNECT_API_KEY_ID=3B764CRX7S
export APP_STORE_CONNECT_API_ISSUER_ID=6461be03-feb0-432f-9a9d-8e074ac2ffec
export APP_STORE_CONNECT_API_KEY_CONTENT="$(cat /Users/philipcutting/Projects/clients/active/neil_douglas/AuthKey_3B764CRX7S.p8)"
export KUWBOO_ENV=prod
bundle exec fastlane beta
```

### Option C: Tag-triggered release

```bash
git tag ios-v1.0.0
git push origin ios-v1.0.0
```

This triggers the `push` tag filter in `.github/workflows/ios-testflight.yml`.

---

## Version and build number strategy

| Field | Source | Format |
|-------|--------|--------|
| `CFBundleShortVersionString` (marketing version) | `pubspec.yaml` `version:` field (before `+`) | `1.0.0` |
| `CFBundleVersion` (build number) | `GITHUB_RUN_NUMBER` in CI, timestamp locally | Integer, monotonic |

To bump the marketing version before a release:

```yaml
# apps/mobile/pubspec.yaml
version: 1.0.0
```

The build number auto-increments on every GitHub Actions run. If you need to reset it (e.g., after a marketing version bump), pass `build_number` explicitly when triggering the workflow.

---

## Troubleshooting

### Build fails with "No signing certificate"

- Check GitHub Secret `APPLE_KEY_P8_BASE64` is set correctly
- Verify the `.p8` file has not been revoked in App Store Connect → Users & Access → Keys
- Confirm Team ID `5GQA38WHMY` in `ios/fastlane/Appfile` matches your actual team

### "Build number already used" error from Apple

Apple requires strictly increasing build numbers. Options:
1. Re-run the workflow (GitHub run number will be higher)
2. Manually specify a higher build number when triggering the workflow
3. If you've exhausted the range, bump the marketing version in `pubspec.yaml`

### `pod install` fails on CI

Usually a transient CocoaPods CDN issue. Re-run the workflow. If persistent:
- Clear the CocoaPods cache: add `pod cache clean --all` to the workflow
- Pin the CocoaPods version in `ios/Gemfile`

### Export compliance banner on TestFlight

Info.plist sets `ITSAppUsesNonExemptEncryption=false` because the app only uses standard HTTPS. This avoids the manual compliance questionnaire. If you add custom encryption (e.g., for E2E messaging), you must:
1. Change this to `true` in `Info.plist`
2. Complete the export compliance questionnaire in App Store Connect
3. Potentially file an annual self-classification report with BIS

### App rejected for privacy string

Review `ios/Runner/Info.plist` — every permission the app requests must have a usage description. The current set covers:
- Camera, Microphone, Photo Library (read + add)
- Location (when in use)
- Contacts
- User Tracking (iOS 14.5+)
- Face ID

If you add a new plugin that requests something else (HealthKit, Bluetooth, Motion, Calendar, Reminders, HomeKit, etc.), add the corresponding `NS*UsageDescription` key.

### TestFlight build stuck "Processing" for over an hour

Normal processing is 5-15 min. Over an hour usually means:
- Missing export compliance info (check the build in App Store Connect)
- Missing required icon size (check `ios/Runner/Assets.xcassets/AppIcon.appiconset/`)
- Invalid bitcode (we disable bitcode in ExportOptions.plist, should be fine)

Check the App Store Connect → TestFlight → Builds page for specific warnings.

---

## Security notes

- **The `.p8` file is a private key** with significant privileges. Anyone with it can upload builds, read app data, and manage certificates.
- **Only store it in:**
  1. The original download location on the owner's Mac (never shared)
  2. GitHub Secrets (encrypted at rest, only decrypted at workflow runtime)
- **Rotate the key** from App Store Connect → Users & Access → Keys if it's ever been exposed in a log, chat, or commit.
- **The key has no expiry** — rotate annually as good hygiene.
- **`.gitignore` blocks `*.p8` files** at the repo root to prevent accidents.

---

## Next steps after first TestFlight build

1. [ ] First build uploaded and visible in App Store Connect
2. [ ] Complete privacy questionnaire
3. [ ] Add internal testers
4. [ ] Install Kuwboo from TestFlight on a physical iPhone
5. [ ] Test the full sign-up flow
6. [ ] Test each feature (video, social, shop, yoyo)
7. [ ] Submit for external TestFlight review (if beta will include non-team members)
8. [ ] Prepare App Store listing assets (screenshots, description, keywords)
