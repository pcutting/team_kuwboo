import 'package:flutter/material.dart';
import '../../proto_theme.dart';
import '../../prototype_state.dart';
import '../../shared/proto_scaffold.dart';
import '../../shared/proto_press_button.dart';
import '../../shared/proto_dialogs.dart';

class ShopCreateListing extends StatefulWidget {
  const ShopCreateListing({super.key});

  @override
  State<ShopCreateListing> createState() => _ShopCreateListingState();
}

class _ShopCreateListingState extends State<ShopCreateListing> {
  int _photoCount = 0;

  @override
  Widget build(BuildContext context) {
    final state = PrototypeStateProvider.of(context);
    final theme = ProtoTheme.of(context);

    return Container(
      color: theme.surface,
      child: Column(
        children: [
          ProtoSubBar(
            title: 'New Listing',
            actions: [
              ProtoPressButton(
                onTap: () async {
                  final confirmed = await ProtoConfirmDialog.show(
                    context,
                    title: 'Publish Listing',
                    message: 'Post this item to the marketplace?',
                  );
                  if (confirmed && mounted) {
                    ProtoToast.show(context, theme.icons.checkCircle, 'Listing published!');
                    state.pop();
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(color: theme.primary, borderRadius: BorderRadius.circular(20)),
                  child: const Text('List', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white)),
                ),
              ),
            ],
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Photo upload area
                ProtoPressButton(
                  onTap: () {
                    setState(() => _photoCount = (_photoCount + 1).clamp(0, 10));
                    ProtoToast.show(context, theme.icons.addPhoto, 'Photo $_photoCount added');
                  },
                  child: Container(
                    height: 120,
                    decoration: BoxDecoration(
                      color: theme.background,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: theme.text.withValues(alpha: 0.1)),
                    ),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            _photoCount > 0 ? theme.icons.photoLibrary : theme.icons.addPhoto,
                            size: 32,
                            color: _photoCount > 0 ? theme.primary : theme.textTertiary,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _photoCount > 0
                                ? '$_photoCount photo${_photoCount == 1 ? '' : 's'} added (tap to add more)'
                                : 'Add Photos (up to 10)',
                            style: theme.caption.copyWith(
                              color: _photoCount > 0 ? theme.primary : null,
                              fontWeight: _photoCount > 0 ? FontWeight.w600 : null,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                _FormField(label: 'Title', hint: 'What are you selling?'),
                _FormField(label: 'Description', hint: 'Describe your item...', multiline: true),
                _FormField(label: 'Price', hint: '\$0.00'),
                _FormField(label: 'Category', hint: 'Select category'),
                _FormField(label: 'Condition', hint: 'New / Like New / Good / Fair'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _FormField extends StatelessWidget {
  final String label;
  final String hint;
  final bool multiline;
  const _FormField({required this.label, required this.hint, this.multiline = false});

  @override
  Widget build(BuildContext context) {
    final theme = ProtoTheme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: theme.title.copyWith(fontSize: 13)),
          const SizedBox(height: 6),
          GestureDetector(
            onTap: () => ProtoToast.show(context, theme.icons.edit, '$label field would open keyboard'),
            child: Container(
              padding: EdgeInsets.symmetric(horizontal: 14, vertical: multiline ? 14 : 10),
              height: multiline ? 80 : null,
              decoration: BoxDecoration(color: theme.background, borderRadius: BorderRadius.circular(10), border: Border.all(color: theme.text.withValues(alpha: 0.08))),
              child: Align(
                alignment: multiline ? Alignment.topLeft : Alignment.centerLeft,
                child: Text(hint, style: theme.body.copyWith(color: theme.textTertiary)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
