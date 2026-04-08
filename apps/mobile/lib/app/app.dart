import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'router.dart';
import 'theme.dart';

/// Root widget for the Kuwboo mobile application.
class KuwbooApp extends ConsumerWidget {
  const KuwbooApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'Kuwboo',
      debugShowCheckedModeBanner: false,
      theme: KuwbooTheme.light,
      routerConfig: router,
    );
  }
}
