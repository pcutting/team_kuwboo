import 'package:flutter/material.dart';
import '../proto_theme.dart';
import '../../data/demo_data.dart';

/// Shared media widgets used by social feed and post detail screens.

// ─── Single media item at natural (clamped) aspect ratio ─────────────────

class ProtoSingleMedia extends StatelessWidget {
  final DemoMediaItem item;
  final ProtoTheme theme;

  const ProtoSingleMedia({super.key, required this.item, required this.theme});

  @override
  Widget build(BuildContext context) {
    return AspectRatio(
      aspectRatio: item.clampedRatio,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(theme.radiusMd),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.network(
              item.url,
              fit: BoxFit.cover,
              errorBuilder: (_, __, ___) => Container(
                color: theme.surface,
                child: Icon(Icons.broken_image_outlined, color: theme.textTertiary),
              ),
            ),
            if (item.isVideo) ProtoVideoOverlay(durationLabel: item.durationLabel),
          ],
        ),
      ),
    );
  }
}

// ─── Video play button + duration overlay ─────────────────────────────────

class ProtoVideoOverlay extends StatelessWidget {
  final String? durationLabel;
  const ProtoVideoOverlay({super.key, this.durationLabel});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Center(
          child: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.45),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withValues(alpha: 0.6), width: 1.5),
            ),
            child: const Icon(Icons.play_arrow_rounded, size: 30, color: Colors.white),
          ),
        ),
        if (durationLabel != null)
          Positioned(
            right: 8,
            bottom: 8,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                durationLabel!,
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.white),
              ),
            ),
          ),
      ],
    );
  }
}

// ─── Media carousel (locked to first item's clamped ratio) ───────────────

class ProtoMediaCarousel extends StatelessWidget {
  final List<DemoMediaItem> items;
  final ProtoTheme theme;
  final int currentIndex;
  final ValueChanged<int> onPageChanged;

  const ProtoMediaCarousel({
    super.key,
    required this.items,
    required this.theme,
    required this.currentIndex,
    required this.onPageChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AspectRatio(
          aspectRatio: items.first.clampedRatio,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(theme.radiusMd),
            child: PageView.builder(
              itemCount: items.length,
              onPageChanged: onPageChanged,
              itemBuilder: (context, i) {
                final item = items[i];
                return Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      item.url,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: theme.surface,
                        child: Icon(Icons.broken_image_outlined, color: theme.textTertiary),
                      ),
                    ),
                    if (item.isVideo) ProtoVideoOverlay(durationLabel: item.durationLabel),
                  ],
                );
              },
            ),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(items.length, (i) {
            final isActive = i == currentIndex;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: isActive ? 16 : 6,
              height: 6,
              margin: const EdgeInsets.symmetric(horizontal: 2),
              decoration: BoxDecoration(
                color: isActive ? theme.primary : theme.textTertiary.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(3),
              ),
            );
          }),
        ),
      ],
    );
  }
}
