import React, { useMemo } from 'react';
import type { ActiveFast } from '../types';
import { getFastingPhase, PLANT_CONFIGS, getPlantForHours } from '../types';

interface FastTimerProps {
  activeFast: ActiveFast | null;
  elapsedSeconds: number;
  onStartFastClick: () => void;
  onBreakFastClick: () => void;
  onEditStartClick: () => void;
  onHarvestClick: () => void;
}

export const FastTimer: React.FC<FastTimerProps> = ({
  activeFast,
  elapsedSeconds,
  onStartFastClick,
  onBreakFastClick,
  onEditStartClick,
  onHarvestClick,
}) => {
  // Format elapsed time as HH:MM:SS
  const timeFormatted = useMemo(() => {
    if (!activeFast) return '00:00:00';
    const totalSecs = Math.max(0, elapsedSeconds);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [activeFast, elapsedSeconds]);

  // Goal metrics
  const goalMetrics = useMemo(() => {
    if (!activeFast) {
      return {
        percent: 0,
        isCompleted: false,
        remainingText: '',
        expectedEndTimeStr: '',
        goalHours: 16,
      };
    }

    const goalSecs = activeFast.goalHours * 3600;
    const percent = Math.min(100, Math.floor((elapsedSeconds / goalSecs) * 100));
    const isCompleted = elapsedSeconds >= goalSecs;

    // Remaining text
    const remainingSecs = Math.max(0, goalSecs - elapsedSeconds);
    const remHours = Math.floor(remainingSecs / 3600);
    const remMins = Math.floor((remainingSecs % 3600) / 60);

    const remainingText = isCompleted
      ? 'Meta alcançada!'
      : `Faltam ${remHours}h ${remMins}m`;

    // Expected end timestamp
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

  // Current fasting phase flavor text
  const elapsedHours = activeFast ? elapsedSeconds / 3600 : 0;
  const phaseInfo = useMemo(() => getFastingPhase(elapsedHours), [elapsedHours]);
  const plantType = activeFast ? getPlantForHours(activeFast.goalHours) : null;
  const plantConfig = plantType ? PLANT_CONFIGS[plantType] : null;

  // Stardew style segmented bar (10 segments)
  const totalSegments = 10;
  const filledSegments = Math.round((goalMetrics.percent / 100) * totalSegments);

  return (
    <div className="fast-timer-panel flex flex-col items-center w-full px-2">
      {/* Giant Pixel Timer */}
      <div className="w-full text-center py-2">
        <div className="text-[11px] font-pixel text-[#8b5a2b] uppercase tracking-wider mb-1">
          {activeFast ? 'Tempo em Jejum' : 'Nenhum jejum em andamento'}
        </div>
        <div className="pixel-timer-display text-5xl md:text-6xl font-vt323 tracking-widest text-[#3b2412] leading-none drop-shadow-sm select-none">
          {timeFormatted}
        </div>
      </div>

      {/* Progress & Target Section */}
      {activeFast ? (
        <div className="w-full max-w-sm mt-1 mb-2">
          {/* Segmented Stardew Energy Bar */}
          <div className="flex items-center justify-between text-xs font-pixel text-[#5b3a1e] mb-1.5 px-0.5">
            <span className="font-bold">{goalMetrics.remainingText}</span>
            <span className="bg-[#f3e2b3] px-1.5 py-0.5 border border-[#8b5a2b] text-[11px]">
              {goalMetrics.expectedEndTimeStr} ({goalMetrics.goalHours}h)
            </span>
          </div>

          {/* Stardew Square Segments Progress Bar */}
          <div className="stardew-energy-bar flex gap-1 p-1 bg-[#5b3a1e] border-2 border-[#2a1708] shadow-pixel">
            {Array.from({ length: totalSegments }).map((_, idx) => {
              const isFilled = idx < filledSegments;
              const isFinalAndGoal = idx === totalSegments - 1 && goalMetrics.isCompleted;

              return (
                <div
                  key={idx}
                  className={`h-4 flex-1 border border-[#2a1708] transition-colors duration-200 ${
                    isFinalAndGoal
                      ? 'bg-[#f1c40f] animate-pulse'
                      : isFilled
                      ? 'bg-[#8cc152]'
                      : 'bg-[#3e230f]/60'
                  }`}
                  style={{
                    boxShadow: isFilled ? 'inset 0 1px 0 rgba(255,255,255,0.4)' : 'none',
                  }}
                />
              );
            })}
          </div>

          <div className="flex justify-between items-center mt-1 text-[10px] font-pixel text-[#8b5a2b] px-0.5">
            <span>Progresso: {goalMetrics.percent}%</span>
            <button
              onClick={onEditStartClick}
              className="underline hover:text-[#3b2412] active:text-[#c0392b] cursor-pointer"
            >
              Ajustar início
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center text-xs font-pixel text-[#8b5a2b] my-2 bg-[#f3e2b3]/60 p-2 border border-[#dcc393] w-full max-w-sm">
          Plante uma nova semente ao registrar sua última refeição.
        </div>
      )}

      {/* Fasting Phase Ambient Flavor Box */}
      {activeFast && (
        <div className="w-full max-w-sm mb-3 bg-[#fdf6e2] border-2 border-[#8b5a2b] p-2.5 shadow-pixel text-left relative overflow-hidden">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#4f8a3c] text-[#fff4d6] text-[10px] font-pixel px-1.5 py-0.5 border border-[#2d5320]">
              FASE {phaseInfo.phase}
            </span>
            <span className="font-pixel text-xs font-bold text-[#3b2412]">
              {phaseInfo.name}
            </span>
          </div>
          <p className="text-[11px] font-pixel text-[#5b3a1e] leading-snug">
            {phaseInfo.desc}
          </p>
          <div className="mt-1 text-[9px] font-pixel text-[#8b5a2b] italic">
            * Flavor RPG de imersão. Não substitui acompanhamento de saúde.
          </div>
        </div>
      )}

      {/* Primary Big Pixel Action Buttons */}
      <div className="w-full max-w-sm flex flex-col gap-2 mt-1">
        {activeFast ? (
          <>
            {goalMetrics.isCompleted && (
              <button
                onClick={onHarvestClick}
                className="pixel-btn pixel-btn-harvest w-full py-3.5 text-base font-pixel font-bold flex items-center justify-center gap-2 tracking-wide text-[#3b2412]"
              >
                <span>🌾</span>
                <span>COLHER {plantConfig?.name.toUpperCase()}!</span>
                <span>✨</span>
              </button>
            )}

            <button
              onClick={onBreakFastClick}
              className={`pixel-btn ${
                goalMetrics.isCompleted ? 'pixel-btn-secondary' : 'pixel-btn-danger'
              } w-full py-3 text-sm font-pixel font-bold tracking-wide flex items-center justify-center gap-2`}
            >
              <span>🍽️</span>
              <span>Quebrar jejum (comer)</span>
            </button>
          </>
        ) : (
          <button
            onClick={onStartFastClick}
            className="pixel-btn pixel-btn-primary w-full py-4 text-base font-pixel font-bold tracking-wider flex items-center justify-center gap-2 text-[#fff4d6]"
          >
            <span>🌱</span>
            <span>Registrar última refeição</span>
          </button>
        )}
      </div>
    </div>
  );
};
