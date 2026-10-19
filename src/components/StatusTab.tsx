import React, { useMemo } from 'react';
import type { AppState, PlayerDerivedStats, PlantType } from '../types';
import { PLANT_CONFIGS } from '../types';
import { deriveCollection } from '../storage';
import { Shield, Zap, Target, Droplets, Trophy, Lock, CheckCircle2 } from 'lucide-react';

interface StatusTabProps {
  state: AppState;
  stats: PlayerDerivedStats;
}

export const StatusTab: React.FC<StatusTabProps> = ({ state, stats }) => {
  const collection = useMemo(() => deriveCollection(state.history), [state.history]);

  const totalWaterCups = useMemo(() => {
    return Object.values(state.water).reduce((sum, cups) => sum + Math.max(0, cups), 0);
  }, [state.water]);

  const achievements = useMemo(() => {
    return [
      {
        id: 'ach_first_harvest',
        title: 'Primeira Colheita',
        desc: 'Complete seu 1º jejum na plataforma',
        icon: '🌱',
        isUnlocked: state.history.length >= 1,
      },
      {
        id: 'ach_16h_fast',
        title: 'Mestre da Queima',
        desc: 'Complete com sucesso um jejum de 16h ou mais',
        icon: '🔥',
        isUnlocked: state.history.some((f) => f.completedGoal && f.goalHours >= 16),
      },
      {
        id: 'ach_24h_fast',
        title: 'Vontade Inabalável',
        desc: 'Complete com sucesso um jejum de 24h ou mais',
        icon: '⭐',
        isUnlocked: state.history.some((f) => f.completedGoal && f.goalHours >= 24),
      },
      {
        id: 'ach_streak_3',
        title: 'Chama Constante',
        desc: 'Mantenha uma sequência de 3 dias seguidos com meta batida',
        icon: '⚡',
        isUnlocked: stats.bestStreak >= 3,
      },
      {
        id: 'ach_streak_7',
        title: 'Hábito Lendário',
        desc: 'Mantenha uma sequência de 7 dias consecutivos',
        icon: '👑',
        isUnlocked: stats.bestStreak >= 7,
      },
      {
        id: 'ach_water_vitality',
        title: 'Fonte da Vida',
        desc: 'Bata a meta diária de copos de água',
        icon: '💧',
        isUnlocked: Object.values(state.water).some((cups) => cups >= state.settings.waterGoal),
      },
      {
        id: 'ach_early_bird',
        title: 'Madrugador',
        desc: 'Inicie ou encerre um jejum antes das 08h da manhã',
        icon: '🌅',
        isUnlocked: state.history.some((f) => {
          const hStart = new Date(f.startTs).getHours();
          const hEnd = new Date(f.endTs).getHours();
          return hStart < 8 || hEnd < 8;
        }),
      },
      {
        id: 'ach_rank_d',
        title: 'Evolução de Lavrador',
        desc: 'Suba para o Rank D no Sistema',
        icon: '🚜',
        isUnlocked: stats.level >= 5,
      },
      {
        id: 'ach_perfect_5',
        title: 'Colheita Farta',
        desc: 'Complete 5 colheitas com meta 100% batida',
        icon: '🌾',
        isUnlocked: stats.perfectHarvestsCount >= 5,
      },
    ];
  }, [state.history, state.water, state.settings.waterGoal, stats.bestStreak, stats.level, stats.perfectHarvestsCount]);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-6">
      {/* Profile Overview Card */}
      <div className="cozy-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface-raised)] border-2 border-[var(--accent-pumpkin)] flex flex-col items-center justify-center shadow-lg shadow-black/30">
            <span className="font-mono font-bold text-3xl text-[var(--accent-pumpkin)] leading-none">
              {stats.rank}
            </span>
            <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase mt-0.5 tracking-wider">
              Rank
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
                {stats.rankTitle}
              </h2>
              <span className="text-xs font-bold text-[var(--accent-sage)] bg-[var(--accent-sage-subtle)] px-2.5 py-0.5 rounded-full border border-[var(--accent-sage-border)]">
                Nível {stats.level}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Identificação de Guardião do Solo • {stats.totalHarvests} colheitas realizadas
            </p>

            {/* XP progress */}
            <div className="mt-3 flex items-center gap-3">
              <div className="w-48 bg-[var(--bg-surface-raised)] h-2.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div
                  className="bg-gradient-to-r from-[var(--accent-sage-dark)] to-[var(--accent-sage)] h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.progressPercent}%` }}
                />
              </div>
              <span className="font-mono text-xs text-[var(--text-secondary)]">
                {stats.currentLevelXp} / {stats.nextLevelXp} XP ({stats.progressPercent}%)
              </span>
            </div>
          </div>
        </div>

        <div className="text-left md:text-right">
          <div className="text-xs text-[var(--text-tertiary)]">Experiência Acumulada</div>
          <div className="font-mono text-2xl font-bold text-[var(--accent-sage)]">
            {stats.totalXp} XP
          </div>
        </div>
      </div>

      {/* Core Attributes Grid */}
      <div>
        <h3 className="text-base font-bold font-heading text-[var(--text-primary)] mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[var(--accent-sage)]" />
          <span>Atributos Fundamentais de Resistência</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Resistência */}
          <div className="cozy-card p-4 flex items-center gap-3.5">
            <div className="text-[var(--accent-sage)]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] font-medium">Resistência Total</div>
              <div className="font-mono text-xl font-bold text-[var(--text-primary)] mt-0.5">
                {stats.totalFastedHours}h
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">Horas em jejum registradas</div>
            </div>
          </div>

          {/* Disciplina */}
          <div className="cozy-card p-4 flex items-center gap-3.5">
            <div className="text-[var(--accent-pumpkin)]">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] font-medium">Disciplina (Sequência)</div>
              <div className="font-mono text-xl font-bold text-[var(--text-primary)] mt-0.5">
                {stats.streak} dias
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">Melhor recorde: {stats.bestStreak} dias</div>
            </div>
          </div>

          {/* Constância */}
          <div className="cozy-card p-4 flex items-center gap-3.5">
            <div className="text-[var(--accent-sage)]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] font-medium">Constância (30 Dias)</div>
              <div className="font-mono text-xl font-bold text-[var(--text-primary)] mt-0.5">
                {stats.consistency30Days}%
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">Taxa de sucesso nas metas</div>
            </div>
          </div>

          {/* Vitalidade */}
          <div className="cozy-card p-4 flex items-center gap-3.5">
            <div className="text-[var(--accent-petrol)]">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] font-medium">Vitalidade (Água)</div>
              <div className="font-mono text-xl font-bold text-[var(--text-primary)] mt-0.5">
                {totalWaterCups} copos
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">Total de {(totalWaterCups * 0.25).toFixed(1).replace('.', ',')} L consumidos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop Inventory Collection */}
      <div className="cozy-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
              Silo de Safras Colhidas
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Seu estoque de colheitas bem-sucedidas
            </p>
          </div>
          <span className="text-xs text-[var(--text-tertiary)] font-mono">
            Total: {stats.totalHarvests} safras
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['carrot', 'potato', 'pumpkin', 'starfruit'] as PlantType[]).map((type) => {
            const conf = PLANT_CONFIGS[type];
            const count = collection[type] || 0;

            return (
              <div
                key={type}
                className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col items-center justify-center text-center"
              >
                <div className="text-2xl mb-1">
                  {type === 'carrot' ? '🥕' : type === 'potato' ? '🥔' : type === 'pumpkin' ? '🎃' : '⭐'}
                </div>
                <div className="text-xs font-bold text-[var(--text-primary)] mt-1">
                  {conf.name}
                </div>
                <div className="font-mono text-base font-bold text-[var(--accent-sage)] mt-0.5">
                  x{count}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Meta {conf.minHours > 0 ? `${conf.minHours}h+` : 'básica'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="cozy-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[var(--accent-pumpkin)]" />
              <span>Conquistas & Distintivos</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Marcos alcançados ao longo da sua evolução
            </p>
          </div>
          <span className="text-xs font-semibold text-[var(--accent-pumpkin)] bg-[var(--accent-pumpkin-subtle)] px-3 py-1 rounded-full border border-[var(--accent-pumpkin-border)]">
            {unlockedCount} de {achievements.length} Desbloqueadas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                ach.isUnlocked
                  ? 'bg-[var(--bg-surface-raised)] border-[var(--border-medium)] shadow-sm'
                  : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] opacity-45'
              }`}
            >
              <div className="text-2xl flex-shrink-0 mt-0.5">
                {ach.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {ach.title}
                  </h4>
                  {ach.isUnlocked ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-sage)] flex-shrink-0" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[var(--text-tertiary)] flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-snug">
                  {ach.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
