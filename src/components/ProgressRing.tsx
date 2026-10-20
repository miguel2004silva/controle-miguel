import type { FC } from 'react';
import { Clock } from 'lucide-react';

interface ProgressRingProps {
  isActive: boolean;
  elapsedMs: number;
  goalHours: number;
  startedAt?: string;
  onStartClick?: () => void;
}

export const ProgressRing: FC<ProgressRingProps> = ({
  isActive,
  elapsedMs,
  goalHours,
  startedAt,
  onStartClick
}) => {
  // Configuração geométrica do anel SVG
  const size = 300;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Cálculos de tempo
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Cálculo de progresso percentual baseado na meta
  const goalMs = goalHours * 3600 * 1000;
  const rawProgress = goalMs > 0 ? elapsedMs / goalMs : 0;
  const progressPercent = Math.min(Math.round(rawProgress * 100), 999);
  const ringProgress = Math.min(rawProgress, 1.0);
  const strokeDashoffset = circumference - ringProgress * circumference;

  // Tempo restante ou excedente
  const remainingMs = goalMs - elapsedMs;
  const isGoalReached = remainingMs <= 0;
  
  let remainingText = '';
  if (isGoalReached) {
    const extraHours = Math.floor(Math.abs(remainingMs) / 3600000);
    const extraMin = Math.floor((Math.abs(remainingMs) % 3600000) / 60000);
    remainingText = `+${extraHours}h ${extraMin}m além da meta`;
  } else {
    const remHours = Math.floor(remainingMs / 3600000);
    const remMin = Math.floor((remainingMs % 3600000) / 60000);
    remainingText = `Faltam ${remHours}h ${remMin}m`;
  }

  // Horário previsto de término
  let targetEndTimeStr = '';
  if (startedAt) {
    const targetDate = new Date(new Date(startedAt).getTime() + goalMs);
    targetEndTimeStr = targetDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // Ticks circulares (60 divisões sutis)
  const ticksCount = 48;
  const ticks = Array.from({ length: ticksCount }).map((_, i) => {
    const angle = (i / ticksCount) * 360;
    const rad = (angle * Math.PI) / 180;
    const innerR = radius - 16;
    const outerR = radius - 11;
    const cx = size / 2;
    const cy = size / 2;

    const x1 = cx + innerR * Math.cos(rad);
    const y1 = cy + innerR * Math.sin(rad);
    const x2 = cx + outerR * Math.cos(rad);
    const y2 = cy + outerR * Math.sin(rad);

    const isPassed = (i / ticksCount) <= rawProgress;

    return {
      x1, y1, x2, y2,
      stroke: isPassed ? 'var(--emerald-500)' : 'var(--border-subtle)',
      opacity: isPassed ? 0.7 : 0.35
    };
  });

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, margin: '0 auto' }}>
      <svg
        width={size}
        height={size}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      >
        {/* Ticks segmentados discretos (Bencho progress ticks) */}
        {isActive && ticks.map((t, idx) => (
          <line
            key={idx}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.stroke}
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={t.opacity}
          />
        ))}

        {/* Trilha do anel de fundo */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-surface-subtle)"
          strokeWidth={strokeWidth}
        />

        {/* Anel de progresso ativo */}
        {isActive && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--emerald-500)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        )}
      </svg>

      {/* Conteúdo central do contador */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem'
        }}
      >
        {isActive ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-emerald">
                Meta: {goalHours}h ({progressPercent}%)
              </span>
            </div>

            {/* Contador HH:MM:SS com números tabulares */}
            <div
              className="tabular-nums"
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                lineHeight: 1.1
              }}
            >
              {formattedTime}
            </div>

            {/* Indicador de tempo restante */}
            <div
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isGoalReached ? 'var(--emerald-500)' : 'var(--text-secondary)',
                marginTop: '0.4rem'
              }}
            >
              {remainingText}
            </div>

            {targetEndTimeStr && (
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Clock size={12} />
                <span>Previsão: {targetEndTimeStr}</span>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
                marginBottom: '0.75rem'
              }}
            >
              <Clock size={24} />
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Pronto para iniciar
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', maxWidth: '200px' }}>
              Registre a hora da sua última refeição para começar o monitoramento
            </div>
            {onStartClick && (
              <button
                className="btn btn-primary"
                onClick={onStartClick}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
              >
                Registrar refeição
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
