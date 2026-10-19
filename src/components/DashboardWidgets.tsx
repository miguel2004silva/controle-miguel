import React from 'react';
import type { PlayerDerivedStats } from '../types';
import { sound } from '../audio';
import { Droplets, Flame, Award, CheckCircle2, Circle, Plus, Sparkles } from 'lucide-react';

interface DashboardWidgetsProps {
  stats: PlayerDerivedStats;
  todayWaterCups: number;
  waterGoal: number;
  onAddWater: (delta: number) => void;
  hasHitGoalToday: boolean;
  onNavigateQuests: () => void;
}

export const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({
  stats,
  todayWaterCups,
  waterGoal,
  onAddWater,
  hasHitGoalToday,
  onNavigateQuests,
}) => {
  // Safe clamped values for display
  const clampedWaterCups = Math.max(0, todayWaterCups);
  const totalMl = clampedWaterCups * 250;
  const goalMl = waterGoal * 250;

  const litersCurrent = (totalMl / 1000).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const litersGoal = (goalMl / 1000).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const bonusCups = Math.max(0, clampedWaterCups - waterGoal);

  const handleCupToggle = (cupIndex: number) => {
    sound.playWater();
    const targetCups = cupIndex + 1;
    if (targetCups === clampedWaterCups) {
      onAddWater(-1);
    } else {
      const diff = targetCups - clampedWaterCups;
      onAddWater(diff);
    }
  };

  return (
    <aside
      aria-label="Painel de Hábitos e Evolução"
      className="flex flex-col gap-4 command-center-col-side h-full justify-between"
    >
      {/* Bloco 1: Hidratação com Copos Animados */}
      <div className="cozy-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-petrol" />
            <h3 className="text-xs font-bold text-primary font-heading">
              Hidratação Diária
            </h3>
          </div>
          <span className="font-mono text-xs font-semibold text-petrol">
            {litersCurrent} L de {litersGoal} L
          </span>
        </div>

        {/* 8 Copos que enchem com transição fluida */}
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-4 gap-1.5 my-1.5" role="group" aria-label="Copos de água do dia">
          {Array.from({ length: Math.min(8, waterGoal) }).map((_, idx) => {
            const isFilled = idx < clampedWaterCups;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleCupToggle(idx)}
                className={`water-glass-btn ${isFilled ? 'filled' : ''}`}
                aria-label={`Copo ${idx + 1} de 250ml: ${isFilled ? 'cheio' : 'vazio'}`}
                title={`Copo ${idx + 1} (250 ml)`}
              >
                <div
                  className="water-glass-fill"
                  style={{ height: isFilled ? '100%' : '0%' }}
                />
                <Droplets className={`w-3.5 h-3.5 relative z-10 ${isFilled ? 'text-petrol fill-current' : 'text-tertiary'}`} />
                <span className="text-[10px] font-mono relative z-10 leading-none">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>

        {/* Linha de rodapé com botão único de +250ml */}
        <div className="flex items-center justify-between pt-2 border-t border-subtle mt-1 text-xs text-secondary">
          <span>
            {bonusCups > 0 ? (
              <span className="text-petrol font-medium">Meta batida! (+{bonusCups * 250} ml bônus)</span>
            ) : clampedWaterCups >= waterGoal ? (
              <span className="text-sage font-medium">Meta completa ({waterGoal} copos)</span>
            ) : (
              <span>{clampedWaterCups} de {waterGoal} copos</span>
            )}
          </span>

          <button
            type="button"
            onClick={() => {
              sound.playWater();
              onAddWater(1);
            }}
            className="btn-secondary py-1 px-2.5 text-xs font-medium flex items-center gap-1 text-primary"
            aria-label="Registrar mais 250ml de água"
          >
            <Plus className="w-3.5 h-3.5 text-petrol" />
            <span>+250 ml</span>
          </button>
        </div>
      </div>

      {/* Bloco 2: Rank e Nível RPG Expressivo */}
      <div className="cozy-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            {/* Brasão de nível com destaque */}
            <div className="w-9 h-9 rounded-md bg-pumpkin-subtle border border-pumpkin flex flex-col items-center justify-center font-bold text-pumpkin">
              <span className="text-xs leading-none font-mono font-extrabold">{stats.rank}</span>
            </div>
            <div>
              <div className="text-xs font-bold text-primary flex items-center gap-1.5">
                <span>Rank {stats.rank}</span>
                <span className="text-xs text-secondary font-mono">• Nível {stats.level}</span>
              </div>
              <p className="text-xs text-sage font-medium">{stats.rankTitle}</p>
            </div>
          </div>
          <span className="font-mono text-xs text-tertiary font-medium">
            {stats.totalXp} XP
          </span>
        </div>

        {/* Barra de XP com gradiente suave */}
        <div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden border border-subtle my-1" role="progressbar" aria-valuenow={stats.progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, stats.progressPercent))}%`,
              background: 'linear-gradient(90deg, var(--accent-sage) 0%, var(--accent-pumpkin) 100%)',
            }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-tertiary font-mono">
          <span>{stats.currentLevelXp} / {stats.nextLevelXp} XP</span>
          <span className="text-sage font-semibold">{stats.progressPercent}%</span>
        </div>
      </div>

      {/* Bloco 3: Missões de Hoje (Checklist Simples e Elegante) */}
      <div className="cozy-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary font-heading">
            <Award className="w-4 h-4 text-pumpkin" />
            <span>Missões de Hoje</span>
          </div>
          <button
            type="button"
            onClick={onNavigateQuests}
            className="btn-subtle text-xs py-0.5 px-2"
          >
            Ver todas
          </button>
        </div>

        {/* Checklist simples */}
        <div className="space-y-1.5 my-1" role="list">
          <div className="flex items-center justify-between p-2 rounded-md bg-surface-subtle border border-subtle text-xs">
            <div className="flex items-center gap-2 truncate">
              {hasHitGoalToday ? (
                <CheckCircle2 className="w-4 h-4 text-sage flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-tertiary flex-shrink-0" />
              )}
              <span className={hasHitGoalToday ? 'text-secondary line-through' : 'text-primary'}>
                Bater meta de jejum
              </span>
            </div>
            <span className="font-mono text-xs text-sage font-medium flex-shrink-0">+30 XP</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-md bg-surface-subtle border border-subtle text-xs">
            <div className="flex items-center gap-2 truncate">
              {clampedWaterCups >= waterGoal ? (
                <CheckCircle2 className="w-4 h-4 text-sage flex-shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-tertiary flex-shrink-0" />
              )}
              <span className={clampedWaterCups >= waterGoal ? 'text-secondary line-through' : 'text-primary'}>
                Beber {waterGoal} copos ({clampedWaterCups}/{waterGoal})
              </span>
            </div>
            <span className="font-mono text-xs text-sage font-medium flex-shrink-0">+25 XP</span>
          </div>
        </div>

        {/* Linha da Sequência */}
        <div className="flex items-center justify-between pt-2 border-t border-subtle mt-1 text-xs text-secondary">
          <span className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-pumpkin fill-current" />
            <span>Sequência: <b className="text-primary font-mono">{stats.streak} dias</b></span>
          </span>
          <span className="text-pumpkin text-xs font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Bônus ativo
          </span>
        </div>
      </div>
    </aside>
  );
};
