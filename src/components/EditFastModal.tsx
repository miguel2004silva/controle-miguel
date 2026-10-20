import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { X, Trash2, Target, Clock, FileText } from 'lucide-react';
import type { Fast } from '../types';
import { sound } from '../lib/audio';

interface EditFastModalProps {
  isOpen: boolean;
  fast: Fast | null;
  onClose: () => void;
  onSave: (fastId: string, updates: { started_at: string; ended_at?: string; goal_hours: number; notes?: string }) => Promise<void>;
  onDelete?: (fastId: string) => Promise<void>;
}

export const EditFastModal: FC<EditFastModalProps> = ({
  isOpen,
  fast,
  onClose,
  onSave,
  onDelete
}) => {
  if (!isOpen || !fast) return null;

  const toLocalDateTime = (isoStr: string) => {
    const d = new Date(isoStr);
    const offset = d.getTimezoneOffset() * 60000;
    const local = new Date(d.getTime() - offset);
    return local.toISOString().slice(0, 16);
  };

  const [startedAt, setStartedAt] = useState<string>(() => toLocalDateTime(fast.started_at));
  const [endedAt, setEndedAt] = useState<string>(() => fast.ended_at ? toLocalDateTime(fast.ended_at) : '');
  const [goalHours, setGoalHours] = useState<number>(fast.goal_hours);
  const [notes, setNotes] = useState<string>(fast.notes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const sDate = new Date(startedAt);
    if (isNaN(sDate.getTime())) {
      setErrorMsg('Data de início inválida.');
      return;
    }

    let eDateIso: string | undefined = undefined;
    if (endedAt) {
      const eDate = new Date(endedAt);
      if (isNaN(eDate.getTime()) || eDate.getTime() < sDate.getTime()) {
        setErrorMsg('Data de término deve ser posterior ao início.');
        return;
      }
      eDateIso = eDate.toISOString();
    }

    try {
      setIsSubmitting(true);
      sound.playClick();
      await onSave(fast.id, {
        started_at: sDate.toISOString(),
        ended_at: eDateIso,
        goal_hours: goalHours,
        notes: notes.trim() || undefined
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao salvar alterações.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!window.confirm('Tem certeza que deseja excluir permanentemente este registro de jejum?')) return;

    try {
      setIsDeleting(true);
      sound.playClick();
      await onDelete(fast.id);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao excluir.';
      setErrorMsg(msg);
    } finally {
      setIsDeleting(false);
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
              Editar Registro de Jejum
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Ajuste horários, meta ou anotações
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

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <Clock size={15} />
              Início do Jejum
            </label>
            <input
              type="datetime-local"
              className="input-field"
              value={startedAt}
              onChange={e => setStartedAt(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <Clock size={15} />
              Término do Jejum {fast.ended_at === null ? '(Em andamento)' : ''}
            </label>
            <input
              type="datetime-local"
              className="input-field"
              value={endedAt}
              onChange={e => setEndedAt(e.target.value)}
              disabled={fast.ended_at === null}
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <Target size={15} />
              Meta (Horas)
            </label>
            <input
              type="number"
              min="1"
              max="72"
              step="0.5"
              className="input-field"
              value={goalHours}
              onChange={e => setGoalHours(parseFloat(e.target.value) || 16)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              <FileText size={15} />
              Notas
            </label>
            <input
              type="text"
              className="input-field"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={150}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
            {onDelete ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
              >
                <Trash2 size={15} />
                Excluir
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
