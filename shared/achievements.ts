export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'entries' | 'words' | 'category' | 'community';
  requirement: number;
  checkUnlocked: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalEntries: number;
  totalWords: number;
  currentStreak: number;
  longestStreak: number;
  featureSuggestions: number;
  categoryCounts: {
    Life: number;
    Career: number;
    Gratitude: number;
    Creativity: number;
    Mindfulness: number;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_entry',
    title: 'First Words',
    description: 'Write your first journal entry',
    icon: 'pencil',
    category: 'entries',
    requirement: 1,
    checkUnlocked: (stats) => stats.totalEntries >= 1,
  },
  {
    id: 'entries_10',
    title: 'Building Momentum',
    description: 'Complete 10 journal entries',
    icon: 'layers',
    category: 'entries',
    requirement: 10,
    checkUnlocked: (stats) => stats.totalEntries >= 10,
  },
  {
    id: 'entries_25',
    title: 'Consistent Writer',
    description: 'Complete 25 journal entries',
    icon: 'book',
    category: 'entries',
    requirement: 25,
    checkUnlocked: (stats) => stats.totalEntries >= 25,
  },
  {
    id: 'entries_50',
    title: 'Prolific Journalist',
    description: 'Complete 50 journal entries',
    icon: 'library',
    category: 'entries',
    requirement: 50,
    checkUnlocked: (stats) => stats.totalEntries >= 50,
  },
  {
    id: 'entries_100',
    title: 'Century Club',
    description: 'Complete 100 journal entries',
    icon: 'trophy',
    category: 'entries',
    requirement: 100,
    checkUnlocked: (stats) => stats.totalEntries >= 100,
  },
  {
    id: 'streak_3',
    title: 'Getting Started',
    description: 'Write for 3 days in a row',
    icon: 'flame',
    category: 'streak',
    requirement: 3,
    checkUnlocked: (stats) => stats.longestStreak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Week Warrior',
    description: 'Write for 7 days in a row',
    icon: 'calendar',
    category: 'streak',
    requirement: 7,
    checkUnlocked: (stats) => stats.longestStreak >= 7,
  },
  {
    id: 'streak_14',
    title: 'Fortnight Focus',
    description: 'Write for 14 days in a row',
    icon: 'star',
    category: 'streak',
    requirement: 14,
    checkUnlocked: (stats) => stats.longestStreak >= 14,
  },
  {
    id: 'streak_30',
    title: 'Monthly Master',
    description: 'Write for 30 days in a row',
    icon: 'crown',
    category: 'streak',
    requirement: 30,
    checkUnlocked: (stats) => stats.longestStreak >= 30,
  },
  {
    id: 'words_1000',
    title: 'Thousand Words',
    description: 'Write 1,000 words total',
    icon: 'type',
    category: 'words',
    requirement: 1000,
    checkUnlocked: (stats) => stats.totalWords >= 1000,
  },
  {
    id: 'words_5000',
    title: 'Wordsmith',
    description: 'Write 5,000 words total',
    icon: 'pen-tool',
    category: 'words',
    requirement: 5000,
    checkUnlocked: (stats) => stats.totalWords >= 5000,
  },
  {
    id: 'words_10000',
    title: 'Storyteller',
    description: 'Write 10,000 words total',
    icon: 'feather',
    category: 'words',
    requirement: 10000,
    checkUnlocked: (stats) => stats.totalWords >= 10000,
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Write in all 5 categories',
    icon: 'compass',
    category: 'category',
    requirement: 5,
    checkUnlocked: (stats) => {
      const categories = Object.values(stats.categoryCounts);
      return categories.filter(c => c > 0).length >= 5;
    },
  },
  {
    id: 'grateful_heart',
    title: 'Grateful Heart',
    description: 'Write 10 gratitude entries',
    icon: 'heart',
    category: 'category',
    requirement: 10,
    checkUnlocked: (stats) => stats.categoryCounts.Gratitude >= 10,
  },
  {
    id: 'mindful_moment',
    title: 'Mindful Moments',
    description: 'Write 10 mindfulness entries',
    icon: 'sun',
    category: 'category',
    requirement: 10,
    checkUnlocked: (stats) => stats.categoryCounts.Mindfulness >= 10,
  },
  {
    id: 'idea_maker',
    title: 'Idea Maker',
    description: 'Suggest a feature idea',
    icon: 'lightbulb',
    category: 'community',
    requirement: 1,
    checkUnlocked: (stats) => stats.featureSuggestions >= 1,
  },
];

export function getUnlockedAchievements(stats: UserStats): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.checkUnlocked(stats));
}

export function getLockedAchievements(stats: UserStats): Achievement[] {
  return ACHIEVEMENTS.filter(a => !a.checkUnlocked(stats));
}

export function getProgress(achievement: Achievement, stats: UserStats): number {
  switch (achievement.id) {
    case 'first_entry':
    case 'entries_10':
    case 'entries_25':
    case 'entries_50':
    case 'entries_100':
      return Math.min(stats.totalEntries / achievement.requirement, 1);
    case 'streak_3':
    case 'streak_7':
    case 'streak_14':
    case 'streak_30':
      return Math.min(stats.longestStreak / achievement.requirement, 1);
    case 'words_1000':
    case 'words_5000':
    case 'words_10000':
      return Math.min(stats.totalWords / achievement.requirement, 1);
    case 'explorer':
      return Math.min(Object.values(stats.categoryCounts).filter(c => c > 0).length / 5, 1);
    case 'grateful_heart':
      return Math.min(stats.categoryCounts.Gratitude / 10, 1);
    case 'mindful_moment':
      return Math.min(stats.categoryCounts.Mindfulness / 10, 1);
    case 'idea_maker':
      return Math.min(stats.featureSuggestions / 1, 1);
    default:
      return 0;
  }
}
