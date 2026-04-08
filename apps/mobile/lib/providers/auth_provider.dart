import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

// ─── Auth State ──────────────────────────────────────────────────────────

/// Immutable authentication state.
class AuthState {
  final String? accessToken;
  final String? refreshToken;
  final String? userId;
  final bool isLoading;
  final bool isNewUser;

  const AuthState({
    this.accessToken,
    this.refreshToken,
    this.userId,
    this.isLoading = false,
    this.isNewUser = false,
  });

  bool get isAuthenticated => accessToken != null;

  AuthState copyWith({
    String? accessToken,
    String? refreshToken,
    String? userId,
    bool? isLoading,
    bool? isNewUser,
  }) {
    return AuthState(
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      userId: userId ?? this.userId,
      isLoading: isLoading ?? this.isLoading,
      isNewUser: isNewUser ?? this.isNewUser,
    );
  }
}

// ─── Storage Keys ────────────────────────────────────────────────────────

const _keyAccessToken = 'access_token';
const _keyRefreshToken = 'refresh_token';
const _keyUserId = 'user_id';

// ─── Auth Notifier ───────────────────────────────────────────────────────

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState(isLoading: true)) {
    _init();
  }

  final _storage = const FlutterSecureStorage();

  /// Read stored tokens on startup.
  Future<void> _init() async {
    final accessToken = await _storage.read(key: _keyAccessToken);
    final refreshToken = await _storage.read(key: _keyRefreshToken);
    final userId = await _storage.read(key: _keyUserId);

    state = AuthState(
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: userId,
    );
  }

  /// Verify OTP and persist tokens.
  ///
  /// In the real implementation this calls the backend. For now it
  /// accepts a pre-fetched token pair so the UI layer can integrate
  /// once the API client is ready.
  Future<void> login({
    required String accessToken,
    required String refreshToken,
    required String userId,
    bool isNewUser = false,
  }) async {
    state = state.copyWith(isLoading: true);

    await _storage.write(key: _keyAccessToken, value: accessToken);
    await _storage.write(key: _keyRefreshToken, value: refreshToken);
    await _storage.write(key: _keyUserId, value: userId);

    state = AuthState(
      accessToken: accessToken,
      refreshToken: refreshToken,
      userId: userId,
      isNewUser: isNewUser,
    );
  }

  /// Clear tokens and return to unauthenticated state.
  Future<void> logout() async {
    await _storage.deleteAll();
    state = const AuthState();
  }

  /// Re-check stored credentials (e.g. after app resume).
  Future<void> checkAuth() async {
    await _init();
  }
}

// ─── Provider ────────────────────────────────────────────────────────────

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(),
);
