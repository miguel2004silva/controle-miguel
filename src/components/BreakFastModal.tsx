import { useState } from 'react';
import type { FC } from 'react';
import { X, CheckCircle2, Clock, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Fast } from '../types';
import { sound } from '../lib/audio';
import { SlideToConfirm } from './SlideToConfirm';

interface BreakFastModalProps {
  isOpen: boolean;
  activeFast: Fast | null;
  onClose: () => void;
  onConfirm: (fastId: string, endedAt: string, notes?: string) => Promise<void>;
}

export const BreakFastModal: FC<BreakFastModalProps> = ({
  isOpen,
  activeFast,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !activeFast) return null;

  const getNowLocalDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - offset);
    return local.toISOString().slice(0, 16);
  };

  const [endedAtValue, setEndedAtValue] = useState<string>(getNowLocalDateTime);
  const [notes, setNotes] = useState<string>(activeFast.notes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Cálculo da duração estimada com base no horário de término selecionado
  const startDate = new Date(activeFast.started_at);
  const endDate = new Date(endedAtValue);
  const durationMs = Math.max(0, endDate.getTime() - startDate.getTime());
  const totalHours = durationMs / 3600000;
  const h = Math.floor(totalHours);
  const m = Math.floor((durationMs % 3600000) / 60000);

  const isGoalReached = totalHours >= activeFast.goal_hours;
  const diffHours = (totalHours - activeFast.goal_hours).toFixed(1);

  const handleExecuteBreak = async () => {
    if (endDate.getTime() < startDate.getTime()) {
      setErrorMsg('O horário de término não pode ser anterior ao início do jejum.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      // Se a meta foi batida, dispara celebração discreta (paleta esmeralda / neutra)
      if (isGoalReached) {
        sound.playCompleteFast();
        try {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#10B981', '#059669', '#34D399', '#F8FAFC']
          });
        } catch {
          // Ignora
        }
      } else {
        sound.playClick();
      }

      await onConfirm(activeFast.id, endDate.toISOString(), notes);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao quebrar jejum.';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={e => e.stopPropagation()}
        style={{ padding: '1.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Quebrar Jejum
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Confirme o encerramento e registre o horário da sua refeição
            </p>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="btn btn-ghost"
            style={{ padding: '0.35rem', borderRadius: '50%' }}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.625rem 0.875rem',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--danger-text)',
              fontSize: '0.8125rem',
              marginBottom: '1rem'
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Resumo do Jejum */}
        <div className="ui-card-subtle" style={{ padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              DURAÇÃO TOTAL
            </span>
            <span className={`badge ${isGoalReached ? 'badge-emerald' : 'badge-muted'}`}>
              {isGoalReached ? <CheckCircle2 size={12} /> : null}
              {isGoalReached ? 'Meta alcançada!' : 'Meta parcial'}
            </span>
          </div>

          <div className="tabular-nums" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {h}h {m}min
          </div>

          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Meta estipulada: <strong>{activeFast.goal_hours}h</strong>
            {isGoalReached ? (
              <span style={{ color: 'var(--emerald-600)', marginLeft: '0.4rem' }}>
                (+{diffHours}h acima da meta)
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                (faltaram {Math.abs(parseFloat(diffHours))}h)
              </span>
            )}
          </div>
        </div>

        {/* Ajuste do horário de término real */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            <Clock size={15} />
            Horário da Primeira Garfada / Refeição
          </label>
          <input
            type="datetime-local"
            className="input-field"
            value={endedAtValue}
            onChange={e => setEndedAtValue(e.target.value)}
          />
        </div>

        {/* Anotações da quebra de jejum */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
            <FileText size={15} />
            Notas sobre a refeição ou como se sentiu (opcional)
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="Ex: Almoço rico em proteínas e gorduras boas, muita disposição"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            maxLength={150}
          />
        </div>

        {/* Slide para confirmar (Bencho style) */}
        <div>
          <SlideToConfirm
            label="Deslize para quebrar o jejum"
            confirmedLabel="Quebrando jejum..."
            onConfirm={handleExecuteBreak}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
