export interface Fast {
  id: string;
  user_id: string;
  started_at: string; // ISO 8601 UTC string
  ended_at: string | null; // ISO 8601 UTC string or null if currently active
  goal_hours: number; // 1 to 72 hours
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  email: string | null;
  preferred_goal_hours: number;
  sound_enabled: boolean;
  theme: 'system' | 'dark' | 'light';
  created_at?: string;
  updated_at?: string;
}

export interface FastingPhase {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  startHour: number;
  endHour: number;
  badge: string;
}

export const FASTING_PHASES: FastingPhase[] = [
  {
    id: 'glucose',
    title: 'Estabilização Glicêmica',
    shortDesc: 'Açúcar no sangue e insulina retornam aos níveis basais.',
    fullDesc: 'Seu corpo digere a última refeição. A glicose circulante cai e os níveis de insulina diminuem gradativamente.',
    startHour: 0,
    endHour: 4,
    badge: '0h – 4h'
  },
  {
    id: 'glycogen',
    title: 'Consumo de Glicogênio',
    shortDesc: 'O fígado queima reservas de glicose para manter a energia.',
    fullDesc: 'As reservas de glicogênio hepático começam a ser consumidas para abastecer os tecidos essenciais.',
    startHour: 4,
    endHour: 8,
    badge: '4h – 8h'
  },
  {
    id: 'transition',
    title: 'Transição Cetogênica',
    shortDesc: 'O metabolismo inicia a transição para queima de gordura.',
    fullDesc: 'Com o glicogênio em declínio, o corpo passa a mobilizar ácidos graxos como combustível primário.',
    startHour: 8,
    endHour: 12,
    badge: '8h – 12h'
  },
  {
    id: 'ketosis',
    title: 'Cetose e Queima de Gordura',
    shortDesc: 'Produção ativa de corpos cetônicos para energia.',
    fullDesc: 'Taxa máxima de lipólise. Corpos cetônicos fornecem energia para o cérebro, reduzindo a sensação de fome.',
    startHour: 12,
    endHour: 16,
    badge: '12h – 16h'
  },
  {
    id: 'autophagy',
    title: 'Autofagia Celular',
    shortDesc: 'Reciclagem e limpeza de proteínas danificadas.',
    fullDesc: 'Processo natural de regeneração celular (Nobel de Medicina 2016). Células reciclam componentes defeituosos.',
    startHour: 16,
    endHour: 24,
    badge: '16h – 24h'
  },
  {
    id: 'deep_autophagy',
    title: 'Reparo Imunológico Profundo',
    shortDesc: 'Renovação do sistema imune e estresse oxidativo mínimo.',
    fullDesc: 'Diminuição acentuada de marcadores inflamatórios e estímulo à biogênese de novas células saudáveis.',
    startHour: 24,
    endHour: 72,
    badge: '24h+'
  }
];

export function getPhaseForHours(hours: number): FastingPhase {
  if (hours < 4) return FASTING_PHASES[0];
  if (hours < 8) return FASTING_PHASES[1];
  if (hours < 12) return FASTING_PHASES[2];
  if (hours < 16) return FASTING_PHASES[3];
  if (hours < 24) return FASTING_PHASES[4];
  return FASTING_PHASES[5];
}

export interface FastStats {
  totalFasts: number;
  completedFasts: number;
  totalHoursFasted: number;
  longestFastHours: number;
  goalSuccessRate: number; // percentage 0-100
  currentStreakDays: number;
  averageFastHours: number;
}
