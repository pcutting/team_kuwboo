import 'package:flutter/material.dart';
import 'package:kuwboo_shell/kuwboo_shell.dart';

class SocialStumbleScreen extends StatelessWidget {
  const SocialStumbleScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = ProtoTheme.of(context);
    return Container(
      color: theme.background,
      child: Column(
        children: [
          ProtoSubBar(
            title: 'Stumble',
            actions: [
              _FilterIcon(icon: Icons.wc_rounded, label: 'Gender', theme: theme),
              const SizedBox(width: 4),
              _FilterIcon(icon: theme.icons.locationOn, label: 'Nearby', theme: theme),
              const SizedBox(width: 4),
              _FilterIcon(icon: theme.icons.personAdd, label: 'New', theme: theme),
            ],
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text('Discover new friends nearby', style: theme.body),
                const SizedBox(height: 16),
                ...DemoData.nearbyUsers.map((user) => Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: theme.cardDecoration,
                  child: Column(
                    children: [
                      Container(
                        height: 180,
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                          image: DecorationImage(image: NetworkImage(user.imageUrl.replaceAll('100', '400')), fit: BoxFit.cover, onError: (_, __) {}),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(14),
                        child: Row(
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(user.name, style: theme.title),
                                Text(user.distance, style: theme.caption),
                              ],
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(color: theme.primary, borderRadius: BorderRadius.circular(20)),
                              child: Text('Add Friend', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                )),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterIcon extends StatelessWidget {
  final IconData icon;
  final String label;
  final ProtoTheme theme;

  const _FilterIcon({required this.icon, required this.label, required this.theme});

  @override
  Widget build(BuildContext context) {
    return ProtoPressButton(
      onTap: () => ProtoToast.show(context, icon, '$label filter'),
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: theme.surface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: theme.textTertiary.withValues(alpha: 0.2)),
        ),
        child: Icon(icon, size: 16, color: theme.textSecondary),
      ),
    );
  }
}
