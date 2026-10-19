import React, { useState, useEffect, useMemo } from 'react';
import type { AppState } from '../types';
import { getTodayKey } from '../storage';
import { sound } from '../audio';
import { Droplets, CheckCircle2, Award, Clock, Plus, Minus, Sparkles } from 'lucide-react';

interface QuestsTabProps {
  state: AppState;
  onAddWater: (cups: number) => void;
  onClaimQuestXp: (questId: string, xp: number) => void;
  claimedQuests: string[];
}

export const QuestsTab: React.FC<QuestsTabProps> = ({
  state,
  onAddWater,
  onClaimQuestXp,
  claimedQuests,
}) => {
  const todayKey = getTodayKey();
  const todayWater = Math.max(0, state.water[todayKey] || 0);
  const waterGoal = state.settings.waterGoal || 8;

  // Countdown to midnight reset
  const [resetCountdown, setResetCountdown] = useState<string>('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffSecs = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
      const hours = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      const secs = diffSecs % 60;
      setResetCountdown(
        `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Today's fasts
  const todayFasts = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayTs = startOfDay.getTime();

    return state.history.filter((f) => f.endTs >= startOfDayTs);
  }, [state.history]);

  const hasHitGoalToday = todayFasts.some((f) => f.completedGoal);
  const hasHit12hToday = todayFasts.some((f) => f.durationMinutes >= 12 * 60);

  // Weekly 16h fasts
  const weeklyFasts16h = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return state.history.filter((f) => f.endTs >= sevenDaysAgo && f.durationMinutes >= 16 * 60).length;
  }, [state.history]);

  const quests = [
    {
      id: 'quest_fast_goal',
      title: 'Meta Diária Concluída',
      desc: 'Bata com sucesso a meta de jejum escolhida hoje',
      xp: 30,
      isCompleted: hasHitGoalToday,
      progress: hasHitGoalToday ? '1/1' : '0/1',
      isWeekly: false,
    },
    {
      id: 'quest_water',
      title: 'Hidratação Essencial',
      desc: `Beba pelo menos ${waterGoal} copos de água (${((waterGoal * 250) / 1000).toFixed(1).replace('.', ',')} L) hoje`,
      xp: 25,
      isCompleted: todayWater >= waterGoal,
      progress: `${todayWater}/${waterGoal}`,
      isWeekly: false,
    },
    {
      id: 'quest_12h',
      title: 'Disciplina Rústica',
      desc: 'Complete uma sessão de jejum de pelo menos 12 horas',
      xp: 20,
      isCompleted: hasHit12hToday,
      progress: hasHit12hToday ? '1/1' : '0/1',
      isWeekly: false,
    },
    {
      id: 'quest_weekly_16h',
      title: 'Desafio Semanal: Colhedor Veterano',
      desc: 'Complete 3 jejuns de 16h ou mais nos últimos 7 dias',
      xp: 100,
      isCompleted: weeklyFasts16h >= 3,
      progress: `${Math.min(3, weeklyFasts16h)}/3`,
      isWeekly: true,
    },
  ];

  const handleWaterClick = (delta: number) => {
    sound.playWater();
    onAddWater(delta);
  };

  const handleClaim = (questId: string, xp: number) => {
    sound.playQuestDone();
    onClaimQuestXp(questId, xp);
  };

  const litersCurrent = ((todayWater * 250) / 1000).toFixed(1).replace('.', ',');
  const litersGoal = ((waterGoal * 250) / 1000).toFixed(1).replace('.', ',');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cozy-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--accent-pumpkin)]" />
            <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">
              Missões & Hábitos do Lavrador
            </h2>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Cumpra as rotinas da fazenda todos os dias para acelerar seu avanço de Rank e resistência.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--bg-surface-raised)] px-4 py-2 rounded-xl border border-[var(--border-subtle)] font-mono text-xs">
          <Clock className="w-4 h-4 text-[var(--accent-sage)]" />
          <span className="text-[var(--text-tertiary)]">Reinício diário em:</span>
          <span className="font-bold text-[var(--text-primary)]">{resetCountdown}</span>
        </div>
      </div>

      {/* Water Logger Card */}
      <div className="cozy-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="text-[var(--accent-petrol)]">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                Registro de Hidratação
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                A água preserva a autofagia e alivia a fome fisiológica
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="font-mono text-xl font-bold text-[var(--accent-petrol)]">
              {litersCurrent} L
            </span>
            <span className="text-xs text-[var(--text-tertiary)] ml-1">/ {litersGoal} L</span>
            <div className="text-xs text-[var(--text-secondary)] font-mono">
              {todayWater} de {waterGoal} copos {todayWater > waterGoal && `(+${todayWater - waterGoal} bônus)`}
            </div>
          </div>
        </div>

        {/* Visual Cups Indicator */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
          {Array.from({ length: waterGoal }).map((_, idx) => {
            const isDrunk = idx < todayWater;
            return (
              <div
                key={idx}
                className={`py-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isDrunk
                    ? 'bg-[var(--accent-petrol-subtle)] border-[var(--accent-petrol-border)] text-[var(--accent-petrol)]'
                    : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] text-[var(--text-tertiary)] opacity-60'
                }`}
              >
                <Droplets className={`w-4 h-4 ${isDrunk ? 'fill-current' : 'opacity-40'}`} />
                <span className="text-xs font-mono font-medium">
                  {idx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleWaterClick(1)}
            className="btn-primary flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 bg-[var(--accent-petrol)] text-white hover:bg-[var(--accent-petrol-hover)]"
          >
            <Plus className="w-4 h-4" />
            <span>Beber +250 ml (1 Copo)</span>
          </button>
          {todayWater > 0 && (
            <button
              type="button"
              onClick={() => handleWaterClick(-1)}
              className="btn-secondary px-4 py-3 text-xs font-semibold flex items-center justify-center gap-1 text-[var(--text-tertiary)] hover:text-[var(--accent-danger)]"
              title="Corrigir -1 copo"
            >
              <Minus className="w-4 h-4" />
              <span>Remover 1</span>
            </button>
          )}
        </div>
      </div>

      {/* Quests Checklist Layout */}
      <div className="cozy-card p-6">
        <div className="mb-4">
          <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
            Checklist de Objetivos
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Complete cada meta para resgatar bônus de experiência
          </p>
        </div>

        <div className="space-y-3">
          {quests.map((q) => {
            const isClaimed = claimedQuests.includes(q.id);

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isClaimed
                    ? 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)] opacity-70'
                    : q.isCompleted
                    ? 'bg-[var(--bg-surface-raised)] border-[var(--accent-pumpkin-border)] shadow-sm'
                    : 'bg-[var(--bg-surface-subtle)] border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-[var(--accent-sage)]">
                    {isClaimed || q.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-[var(--accent-sage)]" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[var(--border-strong)] flex-shrink-0" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">
                        {q.title}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          q.isWeekly
                            ? 'bg-[var(--accent-pumpkin-subtle)] text-[var(--accent-pumpkin)] border-[var(--accent-pumpkin-border)]'
                            : 'bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)] border-[var(--accent-sage-border)]'
                        }`}
                      >
                        {q.isWeekly ? 'Semanal' : 'Diária'}
                      </span>
                      <span className="font-mono text-xs font-bold text-[var(--accent-sage)]">
                        +{q.xp} XP
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                      {q.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                  <span className="text-xs font-mono text-[var(--text-tertiary)]">
                    Progresso: <b className="text-[var(--text-primary)]">{q.progress}</b>
                  </span>

                  {isClaimed ? (
                    <span className="text-xs font-semibold text-[var(--accent-sage)] flex items-center gap-1 bg-[var(--accent-sage-subtle)] px-3 py-1 rounded-full border border-[var(--accent-sage-border)]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resgatado</span>
                    </span>
                  ) : q.isCompleted ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(q.id, q.xp)}
                      className="btn-primary text-xs px-3.5 py-1.5 font-bold flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Resgatar XP</span>
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-surface-raised)] px-3 py-1 rounded-full border border-[var(--border-subtle)]">
                      Em andamento
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
