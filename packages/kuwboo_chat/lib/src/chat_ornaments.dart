/// Per-module visual ornaments for chat conversations.
///
/// Each module may show different badges and indicators on conversation
/// cards. This class captures those differences so [ChatInboxScreen] and
/// [ProtoConversationCard] can render module-specific UI without
/// hard-coding module names.
class ChatOrnaments {
  final bool showEncryptionBadge;
  final bool showRetentionTimer;
  final bool showEncounterPin;
  final bool showOnlineIndicator;

  const ChatOrnaments({
    this.showEncryptionBadge = false,
    this.showRetentionTimer = false,
    this.showEncounterPin = false,
    this.showOnlineIndicator = false,
  });

  static const yoyo = ChatOrnaments(
    showEncryptionBadge: true,
    showRetentionTimer: true,
    showEncounterPin: true,
  );

  static const dating = ChatOrnaments();

  static const shop = ChatOrnaments(showOnlineIndicator: true);
}
