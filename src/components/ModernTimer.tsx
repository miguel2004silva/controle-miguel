import React, { useMemo, useState } from 'react';
import type { ActiveFast } from '../types';
import { getFastingPhase } from '../types';
import { Play, Clock, Sparkles, AlertCircle } from 'lucide-react';

interface ModernTimerProps {
  activeFast: ActiveFast | null;
  elapsedSeconds: number;
  onStartFastClick: () => void;
  onBreakFastClick: () => void;
  onEditStartClick: () => void;
  onHarvestClick: () => void;
}

export const ModernTimer: React.FC<ModernTimerProps> = ({
  activeFast,
  elapsedSeconds,
  onStartFastClick,
  onBreakFastClick,
  onEditStartClick,
  onHarvestClick,
}) => {
  // Confirm before breaking fast prematurely
  const [showConfirmBreak, setShowConfirmBreak] = useState(false);

  // Format elapsed time as HH:MM:SS
  const timeFormatted = useMemo(() => {
    if (!activeFast) return '00:00:00';
    const totalSecs = Math.max(0, elapsedSeconds);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [activeFast, elapsedSeconds]);

  const goalMetrics = useMemo(() => {
    if (!activeFast) {
      return {
        percent: 0,
        isCompleted: false,
        remainingText: 'Nenhum jejum em andamento',
        expectedEndTimeStr: '',
        goalHours: 16,
      };
    }

    const goalSecs = activeFast.goalHours * 3600;
    const percent = Math.min(100, Math.max(0, (elapsedSeconds / goalSecs) * 100));
    const isCompleted = elapsedSeconds >= goalSecs;

    const remainingSecs = Math.max(0, goalSecs - elapsedSeconds);
    const remHours = Math.floor(remainingSecs / 3600);
    const remMins = Math.floor((remainingSecs % 3600) / 60);

    const remainingText = isCompleted
      ? 'Meta alcançada!'
      : `Faltam ${remHours}h ${remMins}min`;

    const expectedEndTs = activeFast.startTs + goalSecs * 1000;
    const endDate = new Date(expectedEndTs);
    const expectedEndTimeStr = `Meta às ${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    return {
      percent,
      isCompleted,
      remainingText,
      expectedEndTimeStr,
      goalHours: activeFast.goalHours,
    };
  }, [activeFast, elapsedSeconds]);

  const elapsedHours = activeFast ? elapsedSeconds / 3600 : 0;
  const phaseInfo = useMemo(() => getFastingPhase(elapsedHours), [elapsedHours]);

  // Clean, thin ring dimensions
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  // Progress arc: clamp so it never overflows or draws artifact
  const safePercent = Math.min(100, Math.max(0, goalMetrics.percent));
  const strokeDashoffset = circumference - (safePercent / 100) * circumference;

  const handleBreakClick = () => {
    if (!goalMetrics.isCompleted) {
      setShowConfirmBreak(true);
    } else {
      onHarvestClick();
    }
  };

  return (
    <section
      aria-label="Temporizador de Jejum"
      className="cozy-card p-5 flex flex-col items-center justify-between h-full relative"
    >
      {/* Top Header: Meta e Ajuste */}
      <div className="w-full flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-secondary">
          {activeFast ? `Meta: ${activeFast.goalHours} horas` : 'Aguardando Início'}
        </span>
        {activeFast && (
          <button
            type="button"
            onClick={onEditStartClick}
            className="btn-subtle"
            aria-label="Ajustar horário de início do jejum"
          >
            <Clock className="w-3.5 h-3.5 mr-1 text-sage" />
            <span>Ajustar início</span>
          </button>
        )}
      </div>

      {/* SVG Progress Ring: parte do topo (12h), fino e limpo */}
      <div className="relative my-3 flex items-center justify-center">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          className="select-none"
          role="progressbar"
          aria-valuenow={Math.round(goalMetrics.percent)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          {/* Trilho de fundo sutil */}
          <circle
            cx="110"
            cy="110"
            r={radius}
            stroke="rgba(143, 191, 138, 0.1)"
            strokeWidth="5"
            fill="transparent"
          />

          {/* Arco de progresso ativo: parte do topo (-90deg), sem ponto verde solto quando zero */}
          {activeFast && safePercent > 0.5 && (
            <circle
              cx="110"
              cy="110"
              r={radius}
              stroke={goalMetrics.isCompleted ? 'var(--accent-pumpkin)' : 'var(--accent-sage)'}
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform="rotate(-90 110 110)"
              style={{
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), stroke 0.4s ease',
              }}
            />
          )}
        </svg>

        {/* Informações Centrais: Número enorme com tabular-nums */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          <span className="text-xs uppercase tracking-wider text-tertiary mb-1 font-medium">
            {activeFast ? 'Tempo em Jejum' : 'Sem Jejum Ativo'}
          </span>

          <span
            className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-primary leading-none"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {timeFormatted}
          </span>

          {activeFast ? (
            <div className="mt-2 flex flex-col items-center gap-0.5">
              <span
                className={`text-xs font-semibold ${
                  goalMetrics.isCompleted ? 'text-pumpkin' : 'text-primary'
                }`}
              >
                {goalMetrics.remainingText}
              </span>
              <span className="text-xs text-secondary font-mono">
                {goalMetrics.expectedEndTimeStr}
              </span>
            </div>
          ) : (
            <span className="text-xs text-secondary mt-2">
              Pronto para plantar uma safra
            </span>
          )}
        </div>
      </div>

      {/* Fase Metabólica em Curso (resumo discreto) */}
      {activeFast && (
        <div className="w-full bg-surface-subtle border border-subtle rounded-md p-3 mb-3 text-left">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs font-semibold text-sage">
              Fase {phaseInfo.phase}: {phaseInfo.name}
            </span>
            <span className="text-xs text-tertiary font-mono">
              {Math.round(goalMetrics.percent)}% da meta
            </span>
          </div>
          <p className="text-xs text-secondary line-clamp-2 leading-relaxed">
            {phaseInfo.desc}
          </p>
        </div>
      )}

      {/* Ações: Primário proeminente, secundário discreto */}
      <div className="w-full flex flex-col gap-2">
        {activeFast ? (
          <>
            {goalMetrics.isCompleted && (
              <button
                type="button"
                onClick={onHarvestClick}
                className="btn-primary w-full"
                aria-label="Colher safra dourada e registrar jejum"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Colher Safra Dourada (+50% XP)</span>
              </button>
            )}

            {!showConfirmBreak ? (
              <button
                type="button"
                onClick={handleBreakClick}
                className={goalMetrics.isCompleted ? 'btn-secondary w-full' : 'btn-danger-subtle w-full'}
                aria-label="Quebrar jejum"
              >
                <span>Quebrar Jejum (Comer)</span>
              </button>
            ) : (
              <div className="bg-surface-subtle p-3 rounded-md border border-subtle flex flex-col gap-2">
                <div className="flex items-start gap-2 text-xs text-secondary">
                  <AlertCircle className="w-4 h-4 text-pumpkin flex-shrink-0 mt-0.5" />
                  <span>Deseja encerrar antes da meta? O ganho de XP será proporcional ao tempo decorrido.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmBreak(false)}
                    className="btn-secondary flex-1 py-1 text-xs"
                  >
                    Continuar Jejuando
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowConfirmBreak(false);
                      onBreakFastClick();
                    }}
                    className="btn-danger-subtle flex-1 py-1 text-xs"
                  >
                    Confirmar Término
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onStartFastClick}
            className="btn-primary w-full py-3"
            aria-label="Iniciar novo jejum"
          >
            <Play className="w-4 h-4 mr-2 fill-current" />
            <span>Iniciar Jejum & Plantar</span>
          </button>
        )}
      </div>
    </section>
  );
};
