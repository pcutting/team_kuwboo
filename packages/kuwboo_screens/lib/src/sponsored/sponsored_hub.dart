import 'package:flutter/material.dart';
import 'package:kuwboo_shell/kuwboo_shell.dart';

class SponsoredHub extends StatelessWidget {
  const SponsoredHub({super.key});

  @override
  Widget build(BuildContext context) {
    final state = PrototypeStateProvider.of(context);
    final theme = ProtoTheme.of(context);

    return Container(
      color: theme.background,
      child: Column(
        children: [
          ProtoSubBar(title: 'Promote'),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                const SizedBox(height: 16),

                // Stats overview cards
                _StatsRow(theme: theme),

                const SizedBox(height: 20),

                // Action buttons
                Row(
                  children: [
                    Expanded(
                      child: ProtoPressButton(
                        onTap: () => state.push(ProtoRoutes.sponsoredCreate),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          decoration: BoxDecoration(
                            color: theme.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(theme.icons.add, size: 20, color: Colors.white),
                              const SizedBox(width: 8),
                              Text(
                                'Create Campaign',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // Section header
                Row(
                  children: [
                    Text(
                      'My Campaigns',
                      style: theme.title.copyWith(fontSize: 18),
                    ),
                    const Spacer(),
                    Text(
                      '3 active',
                      style: theme.caption.copyWith(color: theme.primary),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Campaign cards
                _CampaignCard(
                  theme: theme,
                  title: 'Summer Collection Launch',
                  type: 'Product Spotlight',
                  status: 'Active',
                  statusColor: Colors.green,
                  impressions: '12.4K',
                  clicks: '348',
                  spent: '\u00a345.20',
                  budget: '\u00a3100.00',
                  onTap: () => state.push(ProtoRoutes.sponsoredCampaign),
                ),
                const SizedBox(height: 10),
                _CampaignCard(
                  theme: theme,
                  title: 'New Store Opening',
                  type: 'Video Ad',
                  status: 'Active',
                  statusColor: Colors.green,
                  impressions: '8.7K',
                  clicks: '195',
                  spent: '\u00a332.80',
                  budget: '\u00a375.00',
                  onTap: () => state.push(ProtoRoutes.sponsoredCampaign),
                ),
                const SizedBox(height: 10),
                _CampaignCard(
                  theme: theme,
                  title: 'Weekend Flash Sale',
                  type: 'Promoted Post',
                  status: 'Paused',
                  statusColor: Colors.orange,
                  impressions: '5.2K',
                  clicks: '87',
                  spent: '\u00a318.50',
                  budget: '\u00a350.00',
                  onTap: () => state.push(ProtoRoutes.sponsoredCampaign),
                ),
                const SizedBox(height: 10),
                _CampaignCard(
                  theme: theme,
                  title: 'Spring Clearance',
                  type: 'Banner Ad',
                  status: 'Completed',
                  statusColor: Colors.grey,
                  impressions: '22.1K',
                  clicks: '614',
                  spent: '\u00a3100.00',
                  budget: '\u00a3100.00',
                  onTap: () => state.push(ProtoRoutes.sponsoredCampaign),
                ),

                const SizedBox(height: 80),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final ProtoTheme theme;
  const _StatsRow({required this.theme});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(child: _StatCard(theme: theme, label: 'Impressions', value: '48.4K', icon: Icons.visibility_outlined)),
        const SizedBox(width: 10),
        Expanded(child: _StatCard(theme: theme, label: 'Clicks', value: '1,244', icon: Icons.touch_app_outlined)),
        const SizedBox(width: 10),
        Expanded(child: _StatCard(theme: theme, label: 'Spend', value: '\u00a3196', icon: Icons.payments_outlined)),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final ProtoTheme theme;
  final String label;
  final String value;
  final IconData icon;
  const _StatCard({required this.theme, required this.label, required this.value, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: theme.cardDecoration,
      child: Column(
        children: [
          Icon(icon, size: 22, color: theme.primary),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: theme.text,
              fontFamily: theme.displayFont,
            ),
          ),
          const SizedBox(height: 2),
          Text(label, style: theme.caption.copyWith(fontSize: 11)),
        ],
      ),
    );
  }
}

class _CampaignCard extends StatelessWidget {
  final ProtoTheme theme;
  final String title;
  final String type;
  final String status;
  final Color statusColor;
  final String impressions;
  final String clicks;
  final String spent;
  final String budget;
  final VoidCallback onTap;

  const _CampaignCard({
    required this.theme,
    required this.title,
    required this.type,
    required this.status,
    required this.statusColor,
    required this.impressions,
    required this.clicks,
    required this.spent,
    required this.budget,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: theme.cardDecoration,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title row
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: theme.title.copyWith(fontSize: 15)),
                      const SizedBox(height: 2),
                      Text(type, style: theme.caption),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: statusColor,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            // Stats row
            Row(
              children: [
                _CampaignStat(theme: theme, label: 'Impressions', value: impressions),
                const SizedBox(width: 16),
                _CampaignStat(theme: theme, label: 'Clicks', value: clicks),
                const Spacer(),
                Text(
                  '$spent / $budget',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: theme.primary,
                    fontFamily: theme.displayFont,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _CampaignStat extends StatelessWidget {
  final ProtoTheme theme;
  final String label;
  final String value;
  const _CampaignStat({required this.theme, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: theme.title.copyWith(fontSize: 13)),
        Text(label, style: theme.caption.copyWith(fontSize: 10)),
      ],
    );
  }
}
