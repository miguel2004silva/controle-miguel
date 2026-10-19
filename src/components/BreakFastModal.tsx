import React, { useState, useMemo, useEffect } from 'react';
import type { ActiveFast } from '../types';
import { getPlantForHours, PLANT_CONFIGS } from '../types';
import { calculateFastReward } from '../storage';
import { sound } from '../audio';
import { X, Sparkles, CheckCircle2, AlertCircle, Utensils } from 'lucide-react';

interface BreakFastModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeFast: ActiveFast;
  currentStreak: number;
  onConfirmBreak: (adjustedEndTs: number) => void;
}

export const BreakFastModal: React.FC<BreakFastModalProps> = ({
  isOpen,
  onClose,
  activeFast,
  currentStreak,
  onConfirmBreak,
}) => {
  const [endDateTimeStr, setEndDateTimeStr] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    const now = new Date();
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEndDateTimeStr(localIso);
  }, [isOpen]);

  const setAdjustMinutesAgo = (minutesAgo: number) => {
    sound.playClick();
    const target = new Date(Date.now() - minutesAgo * 60 * 1000);
    if (target.getTime() < activeFast.startTs) {
      target.setTime(activeFast.startTs + 60 * 1000);
    }
    const localIso = new Date(target.getTime() - target.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setEndDateTimeStr(localIso);
  };

  const metrics = useMemo(() => {
    const chosenEndTs = new Date(endDateTimeStr).getTime();
    const safeEndTs = isNaN(chosenEndTs) ? Date.now() : chosenEndTs;
    const durationMinutes = Math.max(1, Math.floor((safeEndTs - activeFast.startTs) / (1000 * 60)));
    const durationHours = Math.floor(durationMinutes / 60);
    const durationMins = durationMinutes % 60;

    const reward = calculateFastReward(durationMinutes, activeFast.goalHours, currentStreak);
    const plantType = getPlantForHours(activeFast.goalHours);
    const plantConfig = PLANT_CONFIGS[plantType];

    return {
      safeEndTs,
      durationHours,
      durationMins,
      ...reward,
      plantType,
      plantConfig,
    };
  }, [endDateTimeStr, activeFast, currentStreak]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="break-fast-title">
      <div className="modal-content p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-subtle">
          <div>
            <h2 id="break-fast-title" className="text-base font-bold font-heading text-primary flex items-center gap-2">
              <Utensils className="w-4 h-4 text-pumpkin" />
              <span>Concluir Jejum & Colheita</span>
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Revise o resumo da jornada e confirme a quebra do jejum
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon"
            aria-label="Fechar janela"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ajuste do Horário da Refeição */}
        <div className="my-4">
          <label className="block text-xs font-semibold text-primary mb-2">
            Horário Real da Refeição:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <button
              type="button"
              onClick={() => setAdjustMinutesAgo(0)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              Agora
            </button>
            <button
              type="button"
              onClick={() => setAdjustMinutesAgo(15)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              -15 min
            </button>
            <button
              type="button"
              onClick={() => setAdjustMinutesAgo(30)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              -30 min
            </button>
            <button
              type="button"
              onClick={() => setAdjustMinutesAgo(60)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              -1h
            </button>
          </div>
          <input
            type="datetime-local"
            value={endDateTimeStr}
            onChange={(e) => setEndDateTimeStr(e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm font-mono text-primary"
            style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Card de Resumo */}
        <div className="bg-surface-subtle border border-subtle rounded-md p-4 mb-5">
          <div className="flex items-center justify-between pb-3 border-b border-subtle mb-3">
            <div>
              <div className="text-xs font-bold text-primary">
                {metrics.plantConfig.name}
              </div>
              <div
                className={`text-xs font-medium flex items-center gap-1.5 mt-0.5 ${
                  metrics.completedGoal ? 'text-sage' : 'text-pumpkin'
                }`}
              >
                {metrics.completedGoal ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-sage" />
                    <span>Meta Concluída (Colheita Perfeita)!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-pumpkin" />
                    <span>Colheita Parcial (antes da meta)</span>
                  </>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono text-lg font-bold text-sage">
                +{metrics.xpEarned} XP
              </span>
            </div>
          </div>

          {/* Discriminação de XP */}
          <div className="space-y-1.5 text-xs text-secondary font-medium">
            <div className="flex justify-between">
              <span>Duração Total:</span>
              <span className="font-mono text-primary">
                {metrics.durationHours}h {metrics.durationMins}min / {activeFast.goalHours}h
              </span>
            </div>
            <div className="flex justify-between">
              <span>XP Base ({metrics.durationHours}h):</span>
              <span>+{metrics.baseXp} XP</span>
            </div>
            {metrics.goalBonusXp > 0 && (
              <div className="flex justify-between text-sage">
                <span>Bônus de Meta (+50%):</span>
                <span>+{metrics.goalBonusXp} XP</span>
              </div>
            )}
            {metrics.streakBonusXp > 0 && (
              <div className="flex justify-between text-pumpkin">
                <span>Bônus de Sequência ({currentStreak} dias):</span>
                <span>+{metrics.streakBonusXp} XP</span>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 py-2 text-xs"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={() => onConfirmBreak(metrics.safeEndTs)}
            className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Confirmar & Salvar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
