import 'package:flutter/material.dart';

void main() {
  runApp(const KuwbooMobileApp());
}

class KuwbooMobileApp extends StatelessWidget {
  const KuwbooMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kuwboo',
      debugShowCheckedModeBanner: false,
      home: const Scaffold(
        body: Center(
          child: Text('Kuwboo Mobile — Coming Soon'),
        ),
      ),
    );
  }
}
