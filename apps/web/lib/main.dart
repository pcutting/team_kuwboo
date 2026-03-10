import 'package:flutter/material.dart';
import 'prototype/prototype_app.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const KuwbooApp());
}

class KuwbooApp extends StatelessWidget {
  const KuwbooApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kuwboo',
      debugShowCheckedModeBanner: false,
      home: const PrototypeApp(
        designIndex: 0, // Urban Warmth — locked
      ),
    );
  }
}
