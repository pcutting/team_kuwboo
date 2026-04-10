import 'package:flutter/material.dart';
import 'package:kuwboo_shell/kuwboo_shell.dart';

class ShopProductDetail extends StatefulWidget {
  const ShopProductDetail({super.key});

  @override
  State<ShopProductDetail> createState() => _ShopProductDetailState();
}

class _ShopProductDetailState extends State<ShopProductDetail> {
  bool _isWishlisted = false;

  @override
  Widget build(BuildContext context) {
    final state = PrototypeStateProvider.of(context);
    final theme = ProtoTheme.of(context);
    final product = DemoDataExtended.products[0];

    return Container(
      color: theme.background,
      child: Column(
        children: [
          ProtoSubBar(
            title: 'Product',
            actions: [
              ProtoPressButton(
                onTap: () => ProtoShareSheet.show(context),
                child: Icon(theme.icons.share, size: 20, color: theme.text),
              ),
            ],
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                // Photo
                ProtoNetworkImage(imageUrl: product.imageUrl.replaceAll('200', '400'), height: 280, width: double.infinity),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text('\$${product.price.toStringAsFixed(0)}', style: theme.headline.copyWith(color: theme.primary, fontSize: 28)),
                          const Spacer(),
                          ProtoPressButton(
                            onTap: () {
                              setState(() => _isWishlisted = !_isWishlisted);
                              ProtoToast.show(
                                context,
                                _isWishlisted ? theme.icons.favoriteFilled : theme.icons.favoriteOutline,
                                _isWishlisted ? 'Added to wishlist' : 'Removed from wishlist',
                              );
                            },
                            child: AnimatedSwitcher(
                              duration: const Duration(milliseconds: 200),
                              child: Icon(
                                _isWishlisted ? theme.icons.favoriteFilled : theme.icons.favoriteOutline,
                                key: ValueKey(_isWishlisted),
                                size: 24,
                                color: _isWishlisted ? theme.accent : theme.textSecondary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(product.title, style: theme.title.copyWith(fontSize: 18)),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: theme.secondary.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                        child: Text(product.condition, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: theme.secondary)),
                      ),
                      const SizedBox(height: 16),

                      // Seller row
                      ProtoPressButton(
                        onTap: () => state.push(ProtoRoutes.shopSeller),
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: theme.cardDecoration,
                          child: Row(
                            children: [
                              ProtoAvatar(radius: 20, imageUrl: DemoData.nearbyUsers[0].imageUrl),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(product.seller, style: theme.title.copyWith(fontSize: 14)),
                                    Row(
                                      children: [
                                        Icon(theme.icons.starFilled, size: 14, color: theme.tertiary),
                                        Text(' 4.8 (23 reviews)', style: theme.caption),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              Icon(theme.icons.chevronRight, color: theme.textTertiary),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),

                      Text('Description', style: theme.title),
                      const SizedBox(height: 6),
                      Text('Great condition vintage camera. Works perfectly, comes with original case and strap. Battery included.', style: theme.body),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Buy / Make offer buttons
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: theme.surface,
              border: Border(top: BorderSide(color: theme.text.withValues(alpha: 0.06))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: ProtoPressButton(
                    onTap: () => ProtoToast.show(context, theme.icons.localOffer, 'Offer dialog would open'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(border: Border.all(color: theme.primary), borderRadius: BorderRadius.circular(12)),
                      child: Center(child: Text('Make Offer', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: theme.primary))),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ProtoPressButton(
                    onTap: () async {
                      final confirmed = await ProtoConfirmDialog.show(
                        context,
                        title: 'Confirm Purchase',
                        message: 'Buy ${product.title} for \$${product.price.toStringAsFixed(0)}?',
                      );
                      if (confirmed && mounted) {
                        ProtoToast.show(context, theme.icons.shoppingBag, 'Purchase confirmed!');
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      decoration: BoxDecoration(color: theme.primary, borderRadius: BorderRadius.circular(12)),
                      child: const Center(child: Text('Buy Now', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Colors.white))),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
