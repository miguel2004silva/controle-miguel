import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { X, Clock, Target, Sparkles } from 'lucide-react';
import { sound } from '../lib/audio';

interface StartFastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startedAt: string, goalHours: number, notes?: string) => Promise<void>;
  defaultGoalHours?: number;
}

export const StartFastModal: FC<StartFastModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultGoalHours = 16
}) => {
  if (!isOpen) return null;

  // Inicializa com a hora atual formatada localmente para datetime-local
  const getNowLocalDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - offset);
    return local.toISOString().slice(0, 16);
  };

  const [dateTimeValue, setDateTimeValue] = useState<string>(getNowLocalDateTime);
  const [selectedGoal, setSelectedGoal] = useState<number>(() => {
    const saved = localStorage.getItem('controle_jejum_last_goal');
    return saved ? parseFloat(saved) : defaultGoalHours;
  });
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const standardGoals = [12, 14, 16, 18, 20, 24, 36];

  // Atalhos rápidos de tempo
  const setQuickTime = (minutesAgo: number) => {
    sound.playClick();
    const target = new Date(Date.now() - minutesAgo * 60000);
    const offset = target.getTimezoneOffset() * 60000;
    const local = new Date(target.getTime() - offset);
    setDateTimeValue(local.toISOString().slice(0, 16));
  };

  // Verifica se o horário escolhido está no futuro
  const chosenDate = new Date(dateTimeValue);
  const isFuture = chosenDate.getTime() > Date.now();

  // Se o usuário digitou uma hora que ainda não ocorreu hoje (ex: jantou ontem às 22:00 e agora são 10:00 da manhã)
  let effectiveDate = chosenDate;
  let wasShiftedToYesterday = false;
  if (isFuture) {
    // Horário no futuro vira o dia anterior automaticamente conforme requisito
    effectiveDate = new Date(chosenDate.getTime() - 24 * 3600000);
    wasShiftedToYesterday = true;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isNaN(effectiveDate.getTime())) {
      setErrorMsg('Por favor, informe uma data e horário válidos.');
      return;
    }

    if (selectedGoal < 1 || selectedGoal > 72) {
      setErrorMsg('A meta de horas deve ser entre 1 e 72.');
      return;
    }

    try {
      setIsSubmitting(true);
      localStorage.setItem('controle_jejum_last_goal', selectedGoal.toString());
      sound.playStartFast();
      await onConfirm(effectiveDate.toISOString(), selectedGoal, notes);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao iniciar jejum.';
      setErrorMsg(msg);
    } finally {
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
              Registrar Última Refeição
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Inicie a contagem do seu novo ciclo de jejum
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Seletor de Horário */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <Clock size={15} />
              Horário do Término da Refeição
            </label>

            {/* Atalhos rápidos (MicroKit / Bencho style) */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setQuickTime(0)}
              >
                Agora
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setQuickTime(30)}
              >
                Há 30 min
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setQuickTime(60)}
              >
                Há 1h
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                onClick={() => setQuickTime(120)}
              >
                Há 2h
              </button>
            </div>

            <input
              type="datetime-local"
              className="input-field"
              value={dateTimeValue}
              onChange={e => setDateTimeValue(e.target.value)}
              required
            />

            {wasShiftedToYesterday && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--emerald-600)', marginTop: '0.35rem' }}>
                <Sparkles size={13} />
                <span>Horário futuro ajustado automaticamente para ontem ({effectiveDate.toLocaleDateString('pt-BR')}).</span>
              </div>
            )}
          </div>

          {/* Seleção de Meta de Horas */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                <Target size={15} />
                Meta Deste Jejum
              </label>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--emerald-600)' }}>
                {selectedGoal} horas
              </span>
            </div>

            {/* Chips de Metas pré-definidas */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {standardGoals.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => { sound.playClick(); setSelectedGoal(g); }}
                  className={`btn ${selectedGoal === g ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    fontSize: '0.8125rem',
                    padding: '0.35rem 0.65rem',
                    flex: '1 0 18%'
                  }}
                >
                  {g}h
                </button>
              ))}
            </div>

            {/* Controle de arrastar/stepper fino para meta personalizada (MicroKit style) */}
            <div className="ui-card-subtle" style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Meta personalizada</span>
                <span>1h – 72h</span>
              </div>
              <input
                type="range"
                min="1"
                max="72"
                step="0.5"
                value={selectedGoal}
                onChange={e => setSelectedGoal(parseFloat(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--emerald-500)',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>

          {/* Observações opcionais */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
              Observações (opcional)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ex: Jantar leve, foco em hidratação com eletrólitos"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={150}
            />
          </div>

          {/* Botões de Ação */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Iniciando...' : 'Iniciar Jejum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
