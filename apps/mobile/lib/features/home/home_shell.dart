import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Bottom navigation shell that wraps the five main tabs.
///
/// Uses [GoRouter]'s shell pattern so each tab preserves its own
/// navigation stack independently.
class HomeShell extends StatelessWidget {
  const HomeShell({required this.child, super.key});

  final Widget child;

  static const _tabs = <_TabItem>[
    _TabItem(label: 'Video', icon: Icons.play_circle_outline, path: '/video'),
    _TabItem(label: 'Social', icon: Icons.people_outline, path: '/social'),
    _TabItem(
      label: 'Shop',
      icon: Icons.storefront_outlined,
      path: '/shop',
    ),
    _TabItem(label: 'YoYo', icon: Icons.explore_outlined, path: '/yoyo'),
    _TabItem(label: 'Profile', icon: Icons.person_outline, path: '/profile'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    for (var i = 0; i < _tabs.length; i++) {
      if (location.startsWith(_tabs[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final index = _currentIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: index,
        type: BottomNavigationBarType.fixed,
        onTap: (i) => context.go(_tabs[i].path),
        items: [
          for (final tab in _tabs)
            BottomNavigationBarItem(
              icon: Icon(tab.icon),
              label: tab.label,
            ),
        ],
      ),
    );
  }
}

class _TabItem {
  const _TabItem({
    required this.label,
    required this.icon,
    required this.path,
  });

  final String label;
  final IconData icon;
  final String path;
}
