/// Build-time environment configuration for Kuwboo mobile.
///
/// Values are injected via `--dart-define` at build time. Example:
///
/// ```bash
/// flutter run --dart-define=KUWBOO_ENV=dev
/// flutter build ipa --dart-define=KUWBOO_ENV=prod
/// ```
///
/// CI workflows pass these in the fastlane `beta` lane.
class Environment {
  const Environment._();

  /// The current environment name: `dev`, `staging`, or `prod`.
  ///
  /// Defaults to `dev` for local `flutter run` without flags.
  static const String current = String.fromEnvironment(
    'KUWBOO_ENV',
    defaultValue: 'dev',
  );

  /// API base URL. Can be overridden via `--dart-define=KUWBOO_API_URL=...`
  /// but defaults to the correct URL for the [current] environment.
  static String get apiBaseUrl {
    const override = String.fromEnvironment('KUWBOO_API_URL');
    if (override.isNotEmpty) return override;

    switch (current) {
      case 'prod':
        return 'https://api.kuwboo.com';
      case 'staging':
        return 'https://kuwboo-api.codiantdev.com';
      case 'dev':
      default:
        return 'https://kuwboo-api.codiantdev.com';
    }
  }

  /// Whether this build should show debug UI, extra logging, etc.
  static bool get isProduction => current == 'prod';

  /// Whether this build is a local development build.
  static bool get isDev => current == 'dev';
}
