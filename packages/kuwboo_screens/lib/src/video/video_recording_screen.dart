import 'dart:async';
import 'package:flutter/material.dart';
import 'package:kuwboo_shell/kuwboo_shell.dart';

class VideoRecordingScreen extends StatefulWidget {
  const VideoRecordingScreen({super.key});

  @override
  State<VideoRecordingScreen> createState() => _VideoRecordingScreenState();
}

class _VideoRecordingScreenState extends State<VideoRecordingScreen> {
  bool _flashOn = false;
  int _timerMode = 0; // 0=Off, 1=3s, 2=10s
  int _speedMode = 0; // 0=1x, 1=2x, 2=3x, 3=0.5x
  int _selectedFilter = 0;
  int _selectedMode = 0; // 0=Effects, 1=Filters, 2=Beauty, 3=Timer
  bool _isFrontCamera = false;

  // Recording state
  bool _isRecording = false;
  int _recordingSeconds = 0;
  Timer? _recordingTimer;

  static const _timerLabels = ['Off', '3s', '10s'];
  static const _speedLabels = ['1x', '2x', '3x', '0.5x'];
  static const _modeLabels = ['Effects', 'Filters', 'Beauty', 'Timer'];

  static const _animDuration = Duration(milliseconds: 250);

  void _startRecording() {
    setState(() {
      _isRecording = true;
      _recordingSeconds = 0;
    });
    _recordingTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _recordingSeconds++);
    });
  }

  void _stopRecording() {
    _recordingTimer?.cancel();
    _recordingTimer = null;
    setState(() => _isRecording = false);
    final state = PrototypeStateProvider.of(context);
    state.push(ProtoRoutes.videoEdit);
  }

  String get _formattedTime {
    final m = _recordingSeconds ~/ 60;
    final s = _recordingSeconds % 60;
    return '$m:${s.toString().padLeft(2, '0')}';
  }

  @override
  void dispose() {
    _recordingTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = PrototypeStateProvider.of(context);
    final theme = ProtoTheme.of(context);

    final filterColors = [theme.primary, theme.tertiary, const Color(0xFF6366f1), Colors.grey];
    final filterLabels = ['Normal', 'Warm', 'Cool', 'B&W'];

    return Container(
      color: Colors.black,
      child: Stack(
        children: [
          // Camera preview placeholder
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(theme.icons.videocam, size: 48, color: Colors.white.withValues(alpha: 0.3)),
                const SizedBox(height: 8),
                Text('Camera Preview', style: TextStyle(color: Colors.white.withValues(alpha: 0.3), fontSize: 14)),
              ],
            ),
          ),

          // Top controls — fade out during recording
          Positioned(
            top: 56,
            left: 16,
            right: 16,
            child: AnimatedOpacity(
              opacity: _isRecording ? 0.0 : 1.0,
              duration: _animDuration,
              child: IgnorePointer(
                ignoring: _isRecording,
                child: Row(
                  children: [
                    GestureDetector(
                      onTap: () => state.pop(),
                      child: Icon(theme.icons.close, size: 28, color: Colors.white),
                    ),
                    const Spacer(),
                    _TopButton(
                      icon: _flashOn ? theme.icons.flashOn : theme.icons.flashOff,
                      label: _flashOn ? 'On' : 'Off',
                      isActive: _flashOn,
                      accentColor: theme.tertiary,
                      onTap: () => setState(() => _flashOn = !_flashOn),
                    ),
                    const SizedBox(width: 16),
                    _TopButton(
                      icon: theme.icons.timerOutline,
                      label: _timerLabels[_timerMode],
                      isActive: _timerMode != 0,
                      accentColor: theme.primary,
                      onTap: () => setState(() => _timerMode = (_timerMode + 1) % 3),
                    ),
                    const SizedBox(width: 16),
                    _TopButton(
                      icon: theme.icons.speedOutline,
                      label: _speedLabels[_speedMode],
                      isActive: _speedMode != 0,
                      accentColor: theme.primary,
                      onTap: () => setState(() => _speedMode = (_speedMode + 1) % 4),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Right side filters — fade out during recording
          Positioned(
            right: 16,
            top: 140,
            child: AnimatedOpacity(
              opacity: _isRecording ? 0.0 : 1.0,
              duration: _animDuration,
              child: IgnorePointer(
                ignoring: _isRecording,
                child: Column(
                  children: List.generate(filterColors.length, (i) {
                    final isSelected = i == _selectedFilter;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedFilter = i),
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: Column(
                          children: [
                            Container(
                              width: 32,
                              height: 32,
                              decoration: BoxDecoration(
                                color: filterColors[i],
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isSelected ? Colors.white : Colors.white38,
                                  width: isSelected ? 3 : 2,
                                ),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              filterLabels[i],
                              style: TextStyle(
                                fontSize: 8,
                                color: isSelected ? Colors.white : Colors.white60,
                                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ),
            ),
          ),

          // Bottom controls
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Column(
              children: [
                // Recording timer pill — visible only when recording
                AnimatedOpacity(
                  opacity: _isRecording ? 1.0 : 0.0,
                  duration: _animDuration,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black54,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: Color(0xFFFF3B30),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Text(
                          _formattedTime,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 12),

                // Mode bar — fade out during recording
                AnimatedOpacity(
                  opacity: _isRecording ? 0.0 : 1.0,
                  duration: _animDuration,
                  child: IgnorePointer(
                    ignoring: _isRecording,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_modeLabels.length, (i) {
                        final isSelected = i == _selectedMode;
                        return GestureDetector(
                          onTap: () => setState(() => _selectedMode = i),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Column(
                              children: [
                                Text(
                                  _modeLabels[i],
                                  style: TextStyle(
                                    color: isSelected ? Colors.white : Colors.white70,
                                    fontSize: 12,
                                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  width: 16,
                                  height: 2,
                                  color: isSelected ? Colors.white : Colors.transparent,
                                ),
                              ],
                            ),
                          ),
                        );
                      }),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // Record button + gallery + flip
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Gallery — fade out during recording
                    AnimatedOpacity(
                      opacity: _isRecording ? 0.0 : 1.0,
                      duration: _animDuration,
                      child: IgnorePointer(
                        ignoring: _isRecording,
                        child: ProtoPressButton(
                          onTap: () => ProtoToast.show(context, theme.icons.photoLibrary, 'Gallery would open'),
                          child: Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.white38, width: 2)),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(6),
                              child: Container(color: Colors.grey.shade800),
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Record / Stop button
                    GestureDetector(
                      onTap: _isRecording ? _stopRecording : _startRecording,
                      child: AnimatedContainer(
                        duration: _animDuration,
                        curve: Curves.easeInOut,
                        width: _isRecording ? 64 : 72,
                        height: _isRecording ? 64 : 72,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: _isRecording ? 3 : 4),
                        ),
                        child: Center(
                          child: AnimatedContainer(
                            duration: _animDuration,
                            curve: Curves.easeInOut,
                            width: _isRecording ? 24 : 0,
                            height: _isRecording ? 24 : 0,
                            decoration: BoxDecoration(
                              color: _isRecording ? const Color(0xFFFF3B30) : Colors.transparent,
                              borderRadius: BorderRadius.circular(_isRecording ? 6 : 28),
                            ),
                          ),
                        ),
                      ),
                    ),

                    // Flip camera — fade out during recording
                    AnimatedOpacity(
                      opacity: _isRecording ? 0.0 : 1.0,
                      duration: _animDuration,
                      child: IgnorePointer(
                        ignoring: _isRecording,
                        child: ProtoPressButton(
                          onTap: () => setState(() => _isFrontCamera = !_isFrontCamera),
                          child: AnimatedRotation(
                            turns: _isFrontCamera ? 0.5 : 0.0,
                            duration: const Duration(milliseconds: 300),
                            curve: Curves.easeInOut,
                            child: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), shape: BoxShape.circle),
                              child: Icon(theme.icons.flipCamera, size: 22, color: Colors.white),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _TopButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final Color accentColor;
  final VoidCallback onTap;

  const _TopButton({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.accentColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Icon(icon, size: 24, color: isActive ? accentColor : Colors.white),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              color: isActive ? accentColor : Colors.white70,
              fontWeight: isActive ? FontWeight.w700 : FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }
}
