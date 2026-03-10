import 'package:flutter/material.dart';
import '../../proto_theme.dart';

/// Shared V2 badge used across all YoYo screens when variant == 1.
Widget yoyoV2Badge(ProtoTheme theme) => Container(
  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
  decoration: BoxDecoration(
    color: theme.primary,
    borderRadius: BorderRadius.circular(8),
  ),
  child: const Text(
    'V2',
    style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white),
  ),
);
