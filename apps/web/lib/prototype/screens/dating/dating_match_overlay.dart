import 'package:flutter/material.dart';
import '../../proto_theme.dart';
import '../../shared/proto_image.dart';
import '../../../data/demo_data.dart';
import '../../prototype_state.dart';
import '../../prototype_routes.dart';
import '../../shared/proto_press_button.dart';

class DatingMatchOverlay extends StatefulWidget {
  const DatingMatchOverlay({super.key});

  @override
  State<DatingMatchOverlay> createState() => _DatingMatchOverlayState();
}

class _DatingMatchOverlayState extends State<DatingMatchOverlay>
    with SingleTickerProviderStateMixin {
  late final AnimationController _entranceController;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _scaleAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _entranceController, curve: Curves.elasticOut),
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _entranceController, curve: const Interval(0.0, 0.4)),
    );
    _entranceController.forward();
  }

  @override
  void dispose() {
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = PrototypeStateProvider.of(context);
    final theme = ProtoTheme.of(context);
    final profile = DemoData.mainProfile;

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            theme.primary.withValues(alpha: 0.9),
            theme.accent.withValues(alpha: 0.9),
          ],
        ),
      ),
      child: AnimatedBuilder(
        animation: _entranceController,
        builder: (context, child) {
          return Opacity(
            opacity: _fadeAnimation.value,
            child: child,
          );
        },
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Spacer(flex: 2),
            // Animated hearts + title
            AnimatedBuilder(
              animation: _scaleAnimation,
              builder: (context, child) {
                return Transform.scale(
                  scale: _scaleAnimation.value,
                  child: child,
                );
              },
              child: Column(
                children: [
                  Icon(theme.icons.favoriteFilled, size: 48, color: Colors.white.withValues(alpha: 0.5)),
                  const SizedBox(height: 16),
                  Text("IT'S A MATCH!", style: theme.display.copyWith(fontSize: 36)),
                  const SizedBox(height: 8),
                  Text(
                    'You and ${profile.name} liked each other',
                    style: TextStyle(fontSize: 15, color: Colors.white.withValues(alpha: 0.8)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Avatars
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ProtoAvatar(
                  radius: 48,
                  imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
                ),
                const SizedBox(width: 20),
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(theme.icons.favoriteFilled, size: 20, color: Colors.white),
                ),
                const SizedBox(width: 20),
                ProtoAvatar(
                  radius: 48,
                  imageUrl: profile.imageUrl,
                ),
              ],
            ),

            const Spacer(),

            // Action buttons
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Column(
                children: [
                  ProtoPressButton(
                    onTap: () {
                      state.pop();
                      state.push(ProtoRoutes.chatConversation);
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(theme.radiusFull),
                      ),
                      child: Center(
                        child: Text(
                          'Send a Message',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: theme.primary),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  ProtoPressButton(
                    onTap: () => state.pop(),
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.white.withValues(alpha: 0.5)),
                        borderRadius: BorderRadius.circular(theme.radiusFull),
                      ),
                      child: Center(
                        child: Text('Keep Swiping', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.white)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Spacer(),
          ],
        ),
      ),
    );
  }
}
