import { BotBehaviorConfig } from '../entities/bot-profile.entity';

export const PERSONA_PRESETS: Record<string, BotBehaviorConfig> = {
  social_butterfly: {
    actionWeights: {
      createPost: 0.15,
      likeContent: 0.25,
      commentOnContent: 0.2,
      viewContent: 0.1,
      followUser: 0.1,
      sendWave: 0.08,
      respondToWave: 0.05,
      moveLocation: 0.05,
      sendMessage: 0.02,
    },
    minActionIntervalMs: 30_000,
    maxActionIntervalMs: 180_000,
    activeHoursStart: 7,
    activeHoursEnd: 23,
    postTemplates: [
      'Having an amazing day! Who else is out and about? ✨',
      'Just discovered the coolest spot! You have to check it out.',
      'Love meeting new people here. Drop a wave if you see me!',
      'Weekend vibes hitting different today 🌟',
      'Anyone else exploring the neighborhood?',
      'Good morning beautiful people! What are we up to today?',
      'Grateful for all the connections I have made here 💛',
      'Tag someone who needs to see this view!',
    ],
    commentTemplates: [
      'Love this! 🔥',
      'So cool, thanks for sharing!',
      'This made my day 😊',
      'Absolutely agree!',
      'Great post!',
      'You always share the best stuff!',
      'Need more of this content!',
      'Can totally relate to this.',
    ],
    waveMessages: [
      'Hey! Love the energy around here 👋',
      'Hi there! New in the area?',
      'Wave! Let us connect!',
    ],
    movementStyle: 'wander',
    movementSpeedKmH: 4.5,
  },

  content_creator: {
    actionWeights: {
      createPost: 0.35,
      likeContent: 0.1,
      commentOnContent: 0.1,
      viewContent: 0.15,
      followUser: 0.05,
      sendWave: 0.03,
      respondToWave: 0.05,
      moveLocation: 0.12,
      sendMessage: 0.05,
    },
    minActionIntervalMs: 60_000,
    maxActionIntervalMs: 300_000,
    activeHoursStart: 9,
    activeHoursEnd: 22,
    postTemplates: [
      'Just finished working on something exciting. Sharing my latest project soon!',
      'Behind the scenes of today is shoot. Stay tuned for the full drop.',
      'New content dropping this week. What kind of posts do you want to see?',
      'Tried something completely different today. Let me know your thoughts!',
      'Morning routine complete. Time to create 📸',
      'Inspiration can hit anywhere. Today it was right around the corner.',
      'Process over perfection. Here is the raw, unfiltered version.',
      'Quick tip: the best content comes from authentic moments.',
    ],
    commentTemplates: [
      'The composition on this is fire 🔥',
      'Great work! What setup did you use?',
      'Love the creative direction here.',
      'This is inspiring, keep it up!',
      'The lighting is perfect.',
    ],
    waveMessages: [
      'Hey fellow creator! Love your work.',
      'Collab sometime?',
    ],
    movementStyle: 'commute',
    movementSpeedKmH: 5.0,
  },

  lurker: {
    actionWeights: {
      createPost: 0.02,
      likeContent: 0.15,
      commentOnContent: 0.03,
      viewContent: 0.55,
      followUser: 0.08,
      sendWave: 0.01,
      respondToWave: 0.05,
      moveLocation: 0.1,
      sendMessage: 0.01,
    },
    minActionIntervalMs: 120_000,
    maxActionIntervalMs: 600_000,
    activeHoursStart: 10,
    activeHoursEnd: 1,
    postTemplates: [
      'Nice day.',
      '...',
      'Checking in.',
    ],
    commentTemplates: [
      '👍',
      'Nice.',
      'Cool.',
      '😊',
      'Interesting.',
    ],
    waveMessages: [
      'Hi.',
    ],
    movementStyle: 'stationary',
    movementSpeedKmH: 2.0,
  },

  explorer: {
    actionWeights: {
      createPost: 0.1,
      likeContent: 0.1,
      commentOnContent: 0.05,
      viewContent: 0.1,
      followUser: 0.05,
      sendWave: 0.15,
      respondToWave: 0.1,
      moveLocation: 0.3,
      sendMessage: 0.05,
    },
    minActionIntervalMs: 20_000,
    maxActionIntervalMs: 120_000,
    activeHoursStart: 6,
    activeHoursEnd: 22,
    postTemplates: [
      'New neighborhood unlocked! The views here are incredible.',
      'Miles walked today and still going. Adventure never stops.',
      'Found a hidden gem on my walk today. Sharing the spot!',
      'Sunrise hike complete. This city is beautiful at dawn.',
      'Every corner has a story. Today I found a great one.',
      'Out exploring again. Drop suggestions for must-see spots!',
    ],
    commentTemplates: [
      'Where is this? I need to visit!',
      'Adding this to my list!',
      'Been there! Such a great spot.',
      'How far is this from downtown?',
      'The best discoveries are the unexpected ones.',
    ],
    waveMessages: [
      'Hey neighbor! Just passing through 🚶',
      'Explorer checking in! What is good around here?',
      'Wave from the trail!',
    ],
    movementStyle: 'random_walk',
    movementSpeedKmH: 5.5,
  },

  shopper: {
    actionWeights: {
      createPost: 0.08,
      likeContent: 0.15,
      commentOnContent: 0.12,
      viewContent: 0.25,
      followUser: 0.05,
      sendWave: 0.03,
      respondToWave: 0.05,
      moveLocation: 0.12,
      sendMessage: 0.15,
    },
    minActionIntervalMs: 45_000,
    maxActionIntervalMs: 240_000,
    activeHoursStart: 9,
    activeHoursEnd: 21,
    postTemplates: [
      'Just scored an amazing deal! Who else loves a good find?',
      'Looking for vintage furniture. Anyone selling?',
      'Haul post incoming! Check out what I found today.',
      'Best thrift stores in the area? Drop your favorites!',
      'New listing up! Check my profile for details.',
      'Deal of the day. You do not want to miss this one.',
    ],
    commentTemplates: [
      'Is this still available?',
      'Great price!',
      'Would you take an offer?',
      'Love this piece!',
      'How is the quality?',
      'Just bought one, totally worth it!',
    ],
    waveMessages: [
      'Hey! I saw your listing, looks great!',
      'Fellow shopper here 👋',
    ],
    movementStyle: 'commute',
    movementSpeedKmH: 4.0,
  },
};

export const PERSONA_NAMES = Object.keys(PERSONA_PRESETS);

export function getPreset(persona: string): BotBehaviorConfig {
  const preset = PERSONA_PRESETS[persona];
  if (!preset) {
    throw new Error(`Unknown persona: ${persona}. Available: ${PERSONA_NAMES.join(', ')}`);
  }
  return JSON.parse(JSON.stringify(preset));
}
