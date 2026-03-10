import 'package:flutter/material.dart';
import '../../proto_theme.dart';
import '../../shared/proto_image.dart';
import '../../prototype_state.dart';

class SocialStoryViewer extends StatelessWidget {
  const SocialStoryViewer({super.key});

  @override
  Widget build(BuildContext context) {
    final state = PrototypeStateProvider.of(context);
    final theme = ProtoTheme.of(context);

    return GestureDetector(
      onTap: () => state.pop(),
      child: Container(
        color: Colors.black,
        child: Stack(
          children: [
            // Story image placeholder
            Positioned.fill(
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      theme.primary.withValues(alpha: 0.6),
                      theme.secondary.withValues(alpha: 0.6),
                    ],
                  ),
                ),
                child: Center(
                  child: Icon(theme.icons.image, size: 48, color: Colors.white.withValues(alpha: 0.3)),
                ),
              ),
            ),

            // Progress bars
            Positioned(
              top: 56,
              left: 8,
              right: 8,
              child: Row(
                children: List.generate(3, (i) => Expanded(
                  child: Container(
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    height: 3,
                    decoration: BoxDecoration(
                      color: i == 0 ? Colors.white : Colors.white.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                )),
              ),
            ),

            // Author info
            Positioned(
              top: 68,
              left: 16,
              right: 16,
              child: Row(
                children: [
                  ProtoAvatar(radius: 16, imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'),
                  const SizedBox(width: 10),
                  Text('Maya', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
                  const SizedBox(width: 6),
                  Text('2h', style: TextStyle(fontSize: 12, color: Colors.white70)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => state.pop(),
                    child: Icon(theme.icons.close, size: 24, color: Colors.white),
                  ),
                ],
              ),
            ),

            // Tap zones hint
            Positioned(
              bottom: 40,
              left: 0,
              right: 0,
              child: Center(
                child: Text('Tap to close', style: TextStyle(fontSize: 12, color: Colors.white.withValues(alpha: 0.5))),
              ),
            ),

            // Reply bar
            Positioned(
              bottom: 60,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.white.withValues(alpha: 0.3)),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Text('Reply to story...', style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 14)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
