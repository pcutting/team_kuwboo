import 'package:flutter/material.dart';
import 'package:kuwboo_shell/kuwboo_shell.dart';

class DatingFiltersSheet extends StatefulWidget {
  const DatingFiltersSheet({super.key});

  @override
  State<DatingFiltersSheet> createState() => _DatingFiltersSheetState();
}

class _DatingFiltersSheetState extends State<DatingFiltersSheet> {
  double _distance = 5.0;
  RangeValues _ageRange = const RangeValues(22, 32);
  Set<String> _selectedInterests = {'Music', 'Travel', 'Photography'};
  String _showMe = 'Everyone';

  static const _allInterests = [
    'Music', 'Travel', 'Photography', 'Cooking', 'Fitness',
    'Art', 'Gaming', 'Reading', 'Coffee', 'Nature',
  ];

  @override
  Widget build(BuildContext context) {
    final state = PrototypeStateProvider.of(context);
    final theme = ProtoTheme.of(context);

    return Container(
      color: theme.surface,
      child: Column(
        children: [
          const SizedBox(height: 8),
          Container(width: 40, height: 4, decoration: BoxDecoration(color: theme.textTertiary.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2))),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Text('Filters', style: theme.headline.copyWith(fontSize: 22)),
                const Spacer(),
                ProtoPressButton(
                  onTap: () {
                    ProtoToast.show(context, theme.icons.checkCircle, 'Filters applied');
                    state.pop();
                  },
                  child: Text('Done', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: theme.primary)),
                ),
              ],
            ),
          ),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                // Distance slider
                _FilterSection(
                  title: 'Distance',
                  trailing: '${_distance.round()} km',
                  child: SliderTheme(
                    data: SliderThemeData(
                      activeTrackColor: theme.primary,
                      thumbColor: theme.primary,
                      inactiveTrackColor: theme.background,
                    ),
                    child: Slider(
                      value: _distance / 50, // Normalize to 0-1 for slider
                      onChanged: (v) => setState(() => _distance = (v * 50).roundToDouble().clamp(1, 50)),
                    ),
                  ),
                ),

                // Age range slider
                _FilterSection(
                  title: 'Age Range',
                  trailing: '${_ageRange.start.round()} - ${_ageRange.end.round()}',
                  child: SliderTheme(
                    data: SliderThemeData(
                      activeTrackColor: theme.primary,
                      thumbColor: theme.primary,
                      inactiveTrackColor: theme.background,
                    ),
                    child: RangeSlider(
                      values: RangeValues(
                        (_ageRange.start - 18) / 42, // Normalize 18-60 to 0-1
                        (_ageRange.end - 18) / 42,
                      ),
                      onChanged: (v) {
                        setState(() {
                          _ageRange = RangeValues(
                            (v.start * 42 + 18).roundToDouble(),
                            (v.end * 42 + 18).roundToDouble(),
                          );
                        });
                      },
                    ),
                  ),
                ),

                // Interest chips
                _FilterSection(
                  title: 'Interests',
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _allInterests.map((interest) {
                      final isSelected = _selectedInterests.contains(interest);
                      return ProtoPressButton(
                        onTap: () {
                          setState(() {
                            if (isSelected) {
                              _selectedInterests.remove(interest);
                            } else {
                              _selectedInterests.add(interest);
                            }
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? theme.primary : theme.background,
                            borderRadius: BorderRadius.circular(20),
                            border: isSelected ? null : Border.all(color: theme.text.withValues(alpha: 0.1)),
                          ),
                          child: Text(
                            interest,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: isSelected ? Colors.white : theme.textSecondary,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),

                // Show me
                _FilterSection(
                  title: 'Show Me',
                  child: Column(
                    children: ['Everyone', 'Women', 'Men'].map((option) {
                      final isSelected = option == _showMe;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: GestureDetector(
                          onTap: () => setState(() => _showMe = option),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              color: isSelected ? theme.primary.withValues(alpha: 0.1) : theme.background,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: isSelected ? theme.primary : theme.text.withValues(alpha: 0.1)),
                            ),
                            child: Row(
                              children: [
                                Text(
                                  option,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w500,
                                    color: isSelected ? theme.primary : theme.text,
                                  ),
                                ),
                                const Spacer(),
                                if (isSelected) Icon(theme.icons.check, size: 18, color: theme.primary),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
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

class _FilterSection extends StatelessWidget {
  final String title;
  final String? trailing;
  final Widget child;
  const _FilterSection({required this.title, this.trailing, required this.child});

  @override
  Widget build(BuildContext context) {
    final theme = ProtoTheme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(title, style: theme.title),
              if (trailing != null) ...[
                const Spacer(),
                Text(trailing!, style: theme.body.copyWith(color: theme.primary, fontWeight: FontWeight.w600)),
              ],
            ],
          ),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }
}
