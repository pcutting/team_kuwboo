import 'package:flutter/material.dart';
import '../../proto_theme.dart';
import '../../shared/proto_image.dart';
import '../../prototype_state.dart';
import '../../prototype_routes.dart';
import '../../prototype_demo_data.dart';
import '../../shared/proto_scaffold.dart';
import '../../shared/proto_press_button.dart';
import '../../shared/proto_dialogs.dart';

/// Filtered chat inbox showing only dating conversations
class DatingChatScreen extends StatelessWidget {
  const DatingChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = PrototypeStateProvider.of(context);
    final theme = ProtoTheme.of(context);
    final datingConvos = ProtoDemoData.conversations
        .where((c) => c.moduleContext == 'Dating')
        .toList();

    return ProtoScaffold(
      activeModule: ProtoModule.dating,
      activeTab: 3,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Text('Dating Chat', style: theme.headline.copyWith(fontSize: 24)),
          ),
          // Search
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: GestureDetector(
              onTap: () => ProtoToast.show(context, theme.icons.search, 'Search keyboard would open'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: theme.surface,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Row(
                  children: [
                    Icon(theme.icons.search, size: 20, color: theme.textTertiary),
                    const SizedBox(width: 10),
                    Text('Search conversations...', style: theme.body.copyWith(color: theme.textTertiary)),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: datingConvos.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(theme.icons.chatBubbleOutline, size: 48, color: theme.textTertiary),
                        const SizedBox(height: 12),
                        Text('No dating conversations yet', style: theme.body.copyWith(color: theme.textSecondary)),
                        const SizedBox(height: 4),
                        Text('Match with someone to start chatting', style: theme.caption),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: datingConvos.length,
                    itemBuilder: (context, i) {
                      final conv = datingConvos[i];
                      return ProtoPressButton(
                        onTap: () => state.push(ProtoRoutes.chatConversation),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: theme.cardDecoration,
                          child: Row(
                            children: [
                              Stack(
                                children: [
                                  ProtoAvatar(radius: 24, imageUrl: conv.avatarUrl),
                                  // Online indicator
                                  Positioned(
                                    right: 0,
                                    bottom: 0,
                                    child: Container(
                                      width: 12,
                                      height: 12,
                                      decoration: BoxDecoration(
                                        color: i == 0 ? theme.successColor : theme.textTertiary,
                                        shape: BoxShape.circle,
                                        border: Border.all(color: theme.surface, width: 2),
                                      ),
                                    ),
                                  ),
                                  if (conv.unreadCount > 0)
                                    Positioned(
                                      right: 0,
                                      top: 0,
                                      child: Container(
                                        width: 16,
                                        height: 16,
                                        decoration: BoxDecoration(
                                          color: theme.accent,
                                          shape: BoxShape.circle,
                                          border: Border.all(color: theme.surface, width: 2),
                                        ),
                                        child: Center(
                                          child: Text('${conv.unreadCount}', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: Colors.white)),
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(conv.name, style: theme.title.copyWith(fontSize: 14)),
                                    const SizedBox(height: 2),
                                    Text(conv.lastMessage, style: theme.body, maxLines: 1, overflow: TextOverflow.ellipsis),
                                  ],
                                ),
                              ),
                              Text(conv.timeAgo, style: theme.caption),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
