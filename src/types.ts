// Types for Fazenda do Jejum

export type PlantType = 'carrot' | 'potato' | 'pumpkin' | 'starfruit';

export type GrowthStage = 'seed' | 'sprout' | 'growing' | 'mature' | 'ready' | 'wilted';

export type HunterRank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export interface PlantConfig {
  type: PlantType;
  name: string;
  minHours: number;
  maxHours: number;
  description: string;
  color: string;
}

export const PLANT_CONFIGS: Record<PlantType, PlantConfig> = {
  carrot: {
    type: 'carrot',
    name: 'Cenoura Silvestre',
    minHours: 0,
    maxHours: 14,
    description: 'Cultivo rápido e nutritivo. Ideal para iniciantes no Vale.',
    color: '#e67e22',
  },
  potato: {
    type: 'potato',
    name: 'Batata Rústica',
    minHours: 14.1,
    maxHours: 17,
    description: 'Um clássico robusto. Fortalece a determinação do fazendeiro.',
    color: '#d4a373',
  },
  pumpkin: {
    type: 'pumpkin',
    name: 'Abóbora de Ouro',
    minHours: 17.1,
    maxHours: 23,
    description: 'Grande e resistente. Exige disciplina e paciência para maturar.',
    color: '#d9772b',
  },
  starfruit: {
    type: 'starfruit',
    name: 'Fruta Estrela Ancestral',
    minHours: 23.1,
    maxHours: 999,
    description: 'Uma relíquia lendária. Requer uma vontade inabalável de jejuar.',
    color: '#f1c40f',
  },
};

export interface ActiveFast {
  startTs: number;
  goalHours: number;
}

export interface FastRecord {
  id: string;
  startTs: number;
  endTs: number;
  goalHours: number;
  durationMinutes: number;
  completedGoal: boolean;
  xpEarned: number;
  plant: PlantType;
  harvestQuality: 'perfect' | 'wilted';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp: number;
  current: number;
  target: number;
  unit: string;
  isCompleted: boolean;
  isWeekly?: boolean;
}

export interface PlayerDerivedStats {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  rank: HunterRank;
  rankTitle: string;
  streak: number;
  bestStreak: number;
  totalFastedHours: number;
  longestFastHours: number;
  totalHarvests: number;
  consistency30Days: number;
  perfectHarvestsCount: number;
}

export interface AppSettings {
  sound: boolean;
  notifications: boolean;
  waterGoal: number;
  theme: 'auto' | 'day' | 'sunset' | 'night';
  lastGoal: number;
  reducedMotion: boolean;
}

export interface AppState {
  activeFast: ActiveFast | null;
  history: FastRecord[];
  water: Record<string, number>; // "YYYY-MM-DD" -> cups
  settings: AppSettings;
  unlockedAchievements: string[];
}

export const RANK_INFO: Record<HunterRank, { title: string; minLevel: number; maxLevel: number; perk: string }> = {
  E: { title: 'Colono Novato', minLevel: 1, maxLevel: 4, perk: 'Cerca de madeira básica e horta inicial' },
  D: { title: 'Lavrador', minLevel: 5, maxLevel: 9, perk: 'Caminho de pedra e celeiro rústico' },
  C: { title: 'Fazendeiro', minLevel: 10, maxLevel: 15, perk: 'Moinho de vento e flores coloridas' },
  B: { title: 'Mestre da Colheita', minLevel: 16, maxLevel: 22, perk: 'Estufa aconchegante e animais extras' },
  A: { title: 'Guardião do Vale', minLevel: 23, maxLevel: 29, perk: 'Fonte de pedra e iluminação mágica' },
  S: { title: 'Lenda do Vale', minLevel: 30, maxLevel: 999, perk: 'Castelo do Vale com aura dourada' },
};

// Level curve: XP to advance to next level = Math.floor(100 * Math.pow(level, 1.4))
export function calculateLevelFromXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  let level = 1;
  let accumulatedXp = 0;

  while (true) {
    const xpNeededForThisLevel = Math.floor(100 * Math.pow(level, 1.4));
    if (totalXp < accumulatedXp + xpNeededForThisLevel) {
      const currentLevelXp = totalXp - accumulatedXp;
      const progressPercent = Math.min(100, Math.max(0, Math.floor((currentLevelXp / xpNeededForThisLevel) * 100)));
      return {
        level,
        currentLevelXp,
        nextLevelXp: xpNeededForThisLevel,
        progressPercent,
      };
    }
    accumulatedXp += xpNeededForThisLevel;
    level++;
    if (level > 100) {
      // Safety cap
      return { level: 100, currentLevelXp: 0, nextLevelXp: 100000, progressPercent: 100 };
    }
  }
}

export function getRankFromLevel(level: number): { rank: HunterRank; title: string } {
  if (level >= 30) return { rank: 'S', title: RANK_INFO.S.title };
  if (level >= 23) return { rank: 'A', title: RANK_INFO.A.title };
  if (level >= 16) return { rank: 'B', title: RANK_INFO.B.title };
  if (level >= 10) return { rank: 'C', title: RANK_INFO.C.title };
  if (level >= 5) return { rank: 'D', title: RANK_INFO.D.title };
  return { rank: 'E', title: RANK_INFO.E.title };
}

export function getPlantForHours(hours: number): PlantType {
  if (hours <= 14) return 'carrot';
  if (hours <= 17) return 'potato';
  if (hours <= 23) return 'pumpkin';
  return 'starfruit';
}

export function getFastingPhase(elapsedHours: number): {
  phase: number;
  name: string;
  tagline: string;
  desc: string;
} {
  if (elapsedHours < 4) {
    return {
      phase: 1,
      name: 'Digestão & Nutrição',
      tagline: 'O corpo digere a última refeição',
      desc: 'Os níveis de glicose e insulina no sangue estão no pico digestivo.',
    };
  }
  if (elapsedHours < 8) {
    return {
      phase: 2,
      name: 'Queda de Insulina',
      tagline: 'Estabilização de glicose',
      desc: 'A insulina diminui e o corpo passa a queimar o glicogênio estocado no fígado.',
    };
  }
  if (elapsedHours < 12) {
    return {
      phase: 3,
      name: 'Transição Metabólica',
      tagline: 'Preparando a fornalha',
      desc: 'O estoque de carboidratos está esgotando. O metabolismo começa a buscar gordura.',
    };
  }
  if (elapsedHours < 16) {
    return {
      phase: 4,
      name: 'Cetose Inicial & Foco',
      tagline: 'Queima ativa de gordura',
      desc: 'Corpos cetônicos começam a nutrir o cérebro. Maior clareza mental e energia estável.',
    };
  }
  if (elapsedHours < 24) {
    return {
      phase: 5,
      name: 'Autofagia Celular',
      tagline: 'Faxina e regeneração celular',
      desc: 'As células começam a reciclar componentes velhos e danificados. Renovação profunda.',
    };
  }
  return {
    phase: 6,
    name: 'Renovação Profunda',
    tagline: 'Modo sobrevivência lendário',
    desc: 'O hormônio do crescimento (HGH) sobe e o sistema imunológico entra em regeneração.',
  };
}
