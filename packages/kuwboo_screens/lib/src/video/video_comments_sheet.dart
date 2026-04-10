import 'package:flutter/material.dart';
import 'package:kuwboo_shell/kuwboo_shell.dart';

class VideoCommentsSheet extends StatefulWidget {
  const VideoCommentsSheet({super.key});

  @override
  State<VideoCommentsSheet> createState() => _VideoCommentsSheetState();
}

class _VideoCommentsSheetState extends State<VideoCommentsSheet> {
  final Set<int> _likedComments = {};
  bool _hasInput = false;

  @override
  Widget build(BuildContext context) {
    final state = PrototypeStateProvider.of(context);
    final theme = ProtoTheme.of(context);

    return Container(
      color: theme.surface,
      child: Column(
        children: [
          // Handle + header
          const SizedBox(height: 8),
          Container(width: 40, height: 4, decoration: BoxDecoration(color: theme.textTertiary.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Text('342 Comments', style: theme.title),
                const Spacer(),
                GestureDetector(onTap: () => state.pop(), child: Icon(theme.icons.close, size: 22, color: theme.textSecondary)),
              ],
            ),
          ),
          Divider(height: 1, color: theme.text.withValues(alpha: 0.06)),

          // Comments list
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: ProtoDemoData.comments.length,
              itemBuilder: (context, i) {
                final c = ProtoDemoData.comments[i];
                final isLiked = _likedComments.contains(i);
                final displayLikes = c.likes + (isLiked ? 1 : 0);

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ProtoAvatar(radius: 16, imageUrl: c.avatarUrl),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(c.author, style: theme.title.copyWith(fontSize: 15)),
                                const SizedBox(width: 8),
                                Text(c.timeAgo, style: theme.caption.copyWith(fontSize: 14)),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(c.text, style: theme.body.copyWith(fontSize: 16)),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                ProtoPressButton(
                                  onTap: () {
                                    setState(() {
                                      if (isLiked) {
                                        _likedComments.remove(i);
                                      } else {
                                        _likedComments.add(i);
                                      }
                                    });
                                  },
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        isLiked ? theme.icons.favoriteFilled : theme.icons.favoriteOutline,
                                        size: 14,
                                        color: isLiked ? theme.accent : theme.textTertiary,
                                      ),
                                      const SizedBox(width: 4),
                                      Text('$displayLikes', style: theme.caption.copyWith(fontSize: 14)),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 16),
                                GestureDetector(
                                  onTap: () => ProtoToast.show(context, theme.icons.reply, 'Reply thread would open here'),
                                  child: Text('Reply', style: theme.caption.copyWith(fontSize: 14, fontWeight: FontWeight.w600)),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          // Comment input
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: theme.surface,
              border: Border(top: BorderSide(color: theme.text.withValues(alpha: 0.06))),
            ),
            child: Row(
              children: [
                ProtoAvatar(radius: 14, imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'),
                const SizedBox(width: 10),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() => _hasInput = true);
                      ProtoToast.show(context, Icons.keyboard_rounded, 'Keyboard would open');
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(color: theme.background, borderRadius: BorderRadius.circular(20)),
                      child: Text(
                        _hasInput ? 'Great video! 🔥' : 'Add a comment...',
                        style: theme.body.copyWith(
                          fontSize: 16,
                          color: _hasInput ? theme.text : theme.textTertiary,
                        ),
                      ),
                    ),
                  ),
                ),
                if (_hasInput) ...[
                  const SizedBox(width: 8),
                  ProtoPressButton(
                    onTap: () {
                      setState(() => _hasInput = false);
                      ProtoToast.show(context, theme.icons.checkCircle, 'Comment posted!');
                    },
                    child: Icon(theme.icons.send, size: 22, color: theme.primary),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
