import 'dart:async';
import 'package:flutter/material.dart';
import 'package:kuwboo_shell/kuwboo_shell.dart';

class ShopAuctionDetail extends StatefulWidget {
  const ShopAuctionDetail({super.key});

  @override
  State<ShopAuctionDetail> createState() => _ShopAuctionDetailState();
}

class _ShopAuctionDetailState extends State<ShopAuctionDetail> {
  int _currentBid = 95;
  int _bidIncrement = 5;
  int _secondsRemaining = 9252; // ~2h 34m 12s
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _countdownText {
    final h = _secondsRemaining ~/ 3600;
    final m = (_secondsRemaining % 3600) ~/ 60;
    final s = _secondsRemaining % 60;
    return '${h}h ${m}m ${s}s remaining';
  }

  Future<void> _handlePlaceBid() async {
    final bidAmount = _currentBid + _bidIncrement;
    final confirmed = await ProtoConfirmDialog.show(
      context,
      title: 'Place Bid',
      message: 'Bid \$$bidAmount on Vintage Leather Weekend Bag?',
    );
    if (confirmed && mounted) {
      setState(() {
        _currentBid = bidAmount;
        _bidIncrement = 5;
      });
      ProtoToast.show(context, ProtoTheme.of(context).icons.gavel, 'Bid placed: \$$bidAmount');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = ProtoTheme.of(context);

    return Container(
      color: theme.background,
      child: Column(
        children: [
          ProtoSubBar(
            title: 'Auction',
            actions: [
              ProtoPressButton(
                onTap: () => ProtoShareSheet.show(context),
                child: Icon(theme.icons.share, size: 20, color: theme.text),
              ),
            ],
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Item image
                Container(
                  height: 200,
                  decoration: BoxDecoration(
                    color: theme.primary.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(theme.radiusMd),
                  ),
                  child: Center(child: Icon(theme.icons.gavel, size: 48, color: theme.primary.withValues(alpha: 0.4))),
                ),
                const SizedBox(height: 16),

                Text('Vintage Leather Weekend Bag', style: theme.headline.copyWith(fontSize: 22)),
                const SizedBox(height: 8),

                // Countdown (live)
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: theme.accent.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: theme.accent.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(theme.icons.timerFilled, size: 18, color: theme.accent),
                      const SizedBox(width: 8),
                      Text(_countdownText, style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: theme.accent)),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Current bid
                Row(
                  children: [
                    Text('Current Bid', style: theme.body),
                    const Spacer(),
                    Text('\$$_currentBid.00', style: theme.headline.copyWith(color: theme.primary, fontSize: 24)),
                  ],
                ),
                const SizedBox(height: 12),

                // Bid increment selector
                Row(
                  children: [
                    Text('Your bid:', style: theme.body),
                    const Spacer(),
                    for (final inc in [5, 10, 25]) ...[
                      ProtoPressButton(
                        duration: const Duration(milliseconds: 100),
                        onTap: () => setState(() => _bidIncrement = inc),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          margin: const EdgeInsets.only(left: 6),
                          decoration: BoxDecoration(
                            color: _bidIncrement == inc ? theme.primary : theme.background,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: _bidIncrement == inc ? theme.primary : theme.text.withValues(alpha: 0.1),
                            ),
                          ),
                          child: Text(
                            '+\$$inc',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: _bidIncrement == inc ? Colors.white : theme.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 16),

                // Bid history
                Text('Bid History', style: theme.title),
                const SizedBox(height: 8),
                ...ProtoDemoData.bids.map((bid) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Row(
                    children: [
                      CircleAvatar(radius: 14, backgroundColor: theme.primary.withValues(alpha: 0.1), child: Text(bid.bidder[0], style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: theme.primary))),
                      const SizedBox(width: 10),
                      Text(bid.bidder, style: theme.body.copyWith(color: theme.text)),
                      const Spacer(),
                      Text('\$${bid.amount.toStringAsFixed(0)}', style: theme.title.copyWith(fontSize: 14)),
                      const SizedBox(width: 8),
                      Text(bid.timeAgo, style: theme.caption),
                    ],
                  ),
                )),
              ],
            ),
          ),

          // Place bid
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: theme.surface, border: Border(top: BorderSide(color: theme.text.withValues(alpha: 0.06)))),
            child: ProtoPressButton(
              onTap: _handlePlaceBid,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(color: theme.primary, borderRadius: BorderRadius.circular(12)),
                child: Center(child: Text('Place Bid  \$${_currentBid + _bidIncrement}', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white))),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
