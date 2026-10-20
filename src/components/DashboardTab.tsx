import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Play, Utensils, Edit3, Flame, CheckCircle, BarChart3, TrendingUp, Info } from 'lucide-react';
import { getPhaseForHours } from '../types';
import type { Fast, FastStats } from '../types';
import { ProgressRing } from './ProgressRing';
import { sound } from '../lib/audio';

interface DashboardTabProps {
  activeFast: Fast | null;
  stats: FastStats;
  onOpenStartModal: () => void;
  onOpenBreakModal: () => void;
  onOpenEditModal: (fast: Fast) => void;
}

export const DashboardTab: FC<DashboardTabProps> = ({
  activeFast,
  stats,
  onOpenStartModal,
  onOpenBreakModal,
  onOpenEditModal
}) => {
  // Tempo decorrido em milissegundos calculado estritamente: Date.now() - started_at
  const [elapsedMs, setElapsedMs] = useState<number>(0);

  useEffect(() => {
    if (!activeFast) {
      setElapsedMs(0);
      return;
    }

    const startTimestamp = new Date(activeFast.started_at).getTime();

    const updateTimer = () => {
      const now = Date.now();
      setElapsedMs(Math.max(0, now - startTimestamp));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeFast]);

  const elapsedHours = elapsedMs / 3600000;
  const currentPhase = getPhaseForHours(elapsedHours);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* SEÇÃO PRINCIPAL: CONTADOR EM ANEL */}
      <div className="ui-card" style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
        <ProgressRing
          isActive={Boolean(activeFast)}
          elapsedMs={elapsedMs}
          goalHours={activeFast ? activeFast.goal_hours : 16}
          startedAt={activeFast?.started_at}
          onStartClick={onOpenStartModal}
        />

        {/* AÇÕES CONTEXTUAIS DO JEJUM */}
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {activeFast ? (
            <>
              <button
                className="btn btn-primary"
                onClick={() => { sound.playClick(); onOpenBreakModal(); }}
                style={{ padding: '0.75rem 1.75rem', fontSize: '0.9375rem' }}
              >
                <Utensils size={18} />
                <span>Quebrar Jejum</span>
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => { sound.playClick(); onOpenEditModal(activeFast); }}
                style={{ padding: '0.75rem 1.25rem', fontSize: '0.9375rem' }}
              >
                <Edit3 size={16} />
                <span>Ajustar Início</span>
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => { sound.playClick(); onOpenStartModal(); }}
              style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
            >
              <Play size={18} />
              <span>Registrar Última Refeição</span>
            </button>
          )}
        </div>
      </div>

      {/* FASE BIOLÓGICA DO JEJUM (INFORMATIVA) */}
      {activeFast && (
        <div className="ui-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={16} color="var(--emerald-500)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Fase Metabólica Atual
              </span>
            </div>
            <span className="badge badge-emerald">{currentPhase.badge}</span>
          </div>

          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {currentPhase.title}
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {currentPhase.fullDesc}
          </p>
        </div>
      )}

      {/* CARTÕES DE RESUMO E MÉTRICAS ANALÍTICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="ui-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            <BarChart3 size={14} />
            <span>HORAS JEJUADAS</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.totalHoursFasted.toFixed(1)}h
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Média: {stats.averageFastHours.toFixed(1)}h/jejum
          </div>
        </div>

        <div className="ui-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            <CheckCircle size={14} />
            <span>CONCLUÍDOS</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.completedFasts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Total de ciclos
          </div>
        </div>

        <div className="ui-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            <TrendingUp size={14} />
            <span>METAS BATIDAS</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--emerald-600)' }}>
            {stats.goalSuccessRate}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Taxa de sucesso
          </div>
        </div>

        <div className="ui-card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            <Flame size={14} color="#F59E0B" />
            <span>SEQUÊNCIA</span>
          </div>
          <div className="tabular-nums" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {stats.currentStreakDays} {stats.currentStreakDays === 1 ? 'dia' : 'dias'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            Recorde pessoal
          </div>
        </div>
      </div>
    </div>
  );
};
