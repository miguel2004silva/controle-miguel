import type {
  AppState,
  FastRecord,
  PlayerDerivedStats,
  PlantType,
} from './types';
import {
  calculateLevelFromXp,
  getRankFromLevel,
} from './types';

const STORAGE_KEY = 'fazenda_do_jejum_v2';
const LEGACY_KEY = 'fazenda_do_jejum_v1';

export const DEFAULT_STATE: AppState = {
  activeFast: null,
  history: [],
  water: {},
  settings: {
    sound: true,
    notifications: true,
    waterGoal: 8,
    theme: 'auto',
    lastGoal: 16,
    reducedMotion: false,
  },
  unlockedAchievements: [],
};

export function getTodayKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadState(): AppState {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    // Backward compatibility migration from v1 if v2 doesn't exist
    if (!raw) {
      raw = localStorage.getItem(LEGACY_KEY);
    }
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw);

    // Sanitize water dictionary (fixing any corrupted counts like 44 cups)
    const sanitizedWater: Record<string, number> = {};
    if (parsed.water && typeof parsed.water === 'object') {
      for (const [k, v] of Object.entries(parsed.water)) {
        if (typeof v === 'number' && !isNaN(v)) {
          // Normal human daily water is 4-16 glasses (1L-4L). Clamping protects against bug loops
          sanitizedWater[k] = Math.max(0, Math.min(16, Math.round(v)));
        }
      }
    }

    const state: AppState = {
      activeFast: parsed.activeFast || null,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      water: sanitizedWater,
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : [],
    };

    // Save under current schema
    saveState(state);
    return state;
  } catch (err) {
    console.warn('Failed to load state, using default:', err);
    return DEFAULT_STATE;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

/**
 * Derives player stats directly from history and water logs
 * Ensures integrity: Level, rank, and streaks are derived, not independent.
 */
export function derivePlayerStats(state: AppState): PlayerDerivedStats {
  const history = state.history;

  let totalXp = 0;
  let totalFastedMinutes = 0;
  let longestFastMinutes = 0;
  let perfectHarvestsCount = 0;

  const goalSuccessDays = new Set<string>();

  history.forEach((record) => {
    totalXp += record.xpEarned;
    totalFastedMinutes += record.durationMinutes;
    if (record.durationMinutes > longestFastMinutes) {
      longestFastMinutes = record.durationMinutes;
    }
    if (record.completedGoal) {
      perfectHarvestsCount++;
      const dateStr = new Date(record.endTs).toISOString().split('T')[0];
      goalSuccessDays.add(dateStr);
    }
  });

  // Calculate streak: consecutive calendar days with completed goal
  const sortedDays = Array.from(goalSuccessDays).sort();
  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dayStr of sortedDays) {
    const currentDate = new Date(dayStr + 'T12:00:00');
    if (prevDate) {
      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    prevDate = currentDate;
  }

  // Check if today or yesterday was in the streak to know if currentStreak is active
  if (sortedDays.length > 0) {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (goalSuccessDays.has(todayStr) || goalSuccessDays.has(yesterdayStr)) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }
  }

  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recentFasts = history.filter((r) => r.endTs >= thirtyDaysAgo);
  const consistency30Days =
    recentFasts.length > 0
      ? Math.round(
          (recentFasts.filter((r) => r.completedGoal).length / recentFasts.length) * 100
        )
      : 100;

  const levelInfo = calculateLevelFromXp(totalXp);
  const rankInfo = getRankFromLevel(levelInfo.level);

  return {
    totalXp,
    level: levelInfo.level,
    currentLevelXp: levelInfo.currentLevelXp,
    nextLevelXp: levelInfo.nextLevelXp,
    progressPercent: levelInfo.progressPercent,
    rank: rankInfo.rank,
    rankTitle: rankInfo.title,
    streak: currentStreak,
    bestStreak,
    totalFastedHours: Math.round((totalFastedMinutes / 60) * 10) / 10,
    longestFastHours: Math.round((longestFastMinutes / 60) * 10) / 10,
    totalHarvests: history.length,
    consistency30Days,
    perfectHarvestsCount,
  };
}

/**
 * Calculates XP earned for a finished fast:
 * - 10 XP per complete hour (and proportional per minute)
 * - Goal bonus: +50% of session XP if goal was reached
 * - Streak bonus: +5% per consecutive day with goal reached (cap +50%)
 */
export function calculateFastReward(
  durationMinutes: number,
  goalHours: number,
  currentStreak: number
): {
  xpEarned: number;
  completedGoal: boolean;
  baseXp: number;
  goalBonusXp: number;
  streakBonusXp: number;
  harvestQuality: 'perfect' | 'wilted';
} {
  const durationHours = durationMinutes / 60;
  const completedGoal = durationHours >= goalHours;

  const baseXp = Math.floor(durationHours * 10);
  const goalBonusXp = completedGoal ? Math.floor(baseXp * 0.5) : 0;
  const streakPercent = Math.min(50, currentStreak * 5);
  const streakBonusXp = completedGoal ? Math.floor((baseXp * streakPercent) / 100) : 0;

  const xpEarned = Math.max(1, baseXp + goalBonusXp + streakBonusXp);
  const harvestQuality = completedGoal ? 'perfect' : 'wilted';

  return {
    xpEarned,
    completedGoal,
    baseXp,
    goalBonusXp,
    streakBonusXp,
    harvestQuality,
  };
}

export function deriveCollection(history: FastRecord[]): Record<PlantType, number> {
  const col: Record<PlantType, number> = {
    carrot: 0,
    potato: 0,
    pumpkin: 0,
    starfruit: 0,
  };
  history.forEach((r) => {
    if (r.plant && col[r.plant] !== undefined) {
      col[r.plant]++;
    }
  });
  return col;
}

export function exportBackup(state: AppState): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute('href', dataStr);
  const dateStr = getTodayKey();
  dlAnchorElem.setAttribute('download', `fazenda_do_jejum_backup_${dateStr}.json`);
  dlAnchorElem.click();
}

export function importBackup(
  file: File,
  onSuccess: (importedState: AppState) => void,
  onError: (msg: string) => void
): void {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const parsed = JSON.parse(content);
      if (parsed && (parsed.history || parsed.settings)) {
        const validatedState: AppState = {
          activeFast: parsed.activeFast || null,
          history: Array.isArray(parsed.history) ? parsed.history : [],
          water: parsed.water || {},
          settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
          unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
            ? parsed.unlockedAchievements
            : [],
        };
        saveState(validatedState);
        onSuccess(validatedState);
      } else {
        onError('Arquivo JSON inválido. Estrutura não reconhecida.');
      }
    } catch {
      onError('Erro ao ler arquivo JSON. Verifique se o formato está correto.');
    }
  };
  reader.readAsText(file);
}
