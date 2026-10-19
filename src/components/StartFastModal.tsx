import React, { useState, useEffect } from 'react';
import { getPlantForHours, PLANT_CONFIGS } from '../types';
import { sound } from '../audio';
import { X, Clock, Sprout } from 'lucide-react';

interface StartFastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startTs: number, goalHours: number) => void;
  defaultGoalHours?: number;
  isEditing?: boolean;
  currentStartTs?: number;
}

const PRESET_GOALS = [12, 14, 16, 18, 20, 24, 36];

export const StartFastModal: React.FC<StartFastModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultGoalHours = 16,
  isEditing = false,
  currentStartTs,
}) => {
  const [dateTimeStr, setDateTimeStr] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<number>(defaultGoalHours);
  const [customGoalInput, setCustomGoalInput] = useState<string>(String(defaultGoalHours));

  useEffect(() => {
    if (!isOpen) return;
    const initialTs = currentStartTs || Date.now();
    const d = new Date(initialTs);
    const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDateTimeStr(localIso);
    setSelectedGoal(defaultGoalHours);
    setCustomGoalInput(String(defaultGoalHours));
  }, [isOpen, defaultGoalHours, currentStartTs]);

  if (!isOpen) return null;

  const setRelativeTime = (minutesAgo: number) => {
    sound.playClick();
    const target = new Date(Date.now() - minutesAgo * 60 * 1000);
    const localIso = new Date(target.getTime() - target.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setDateTimeStr(localIso);
  };

  const handleSelectPreset = (hours: number) => {
    sound.playClick();
    setSelectedGoal(hours);
    setCustomGoalInput(String(hours));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomGoalInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setSelectedGoal(num);
    }
  };

  const handleConfirm = () => {
    const selectedDate = new Date(dateTimeStr);
    const startTs = selectedDate.getTime();
    if (isNaN(startTs)) {
      alert('Por favor, informe uma data e hora válidas.');
      return;
    }
    const finalGoal = Math.max(1, selectedGoal);
    sound.playPlant();
    onConfirm(startTs, finalGoal);
    onClose();
  };

  const plantType = getPlantForHours(selectedGoal);
  const plantConfig = PLANT_CONFIGS[plantType];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="start-fast-title">
      <div className="modal-content p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-subtle">
          <div>
            <h2 id="start-fast-title" className="text-base font-bold font-heading text-primary">
              {isEditing ? 'Ajustar Horário de Início' : 'Registrar Última Refeição'}
            </h2>
            <p className="text-xs text-secondary mt-0.5">
              Defina quando você terminou de comer e sua meta desta vez
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

        {/* Section 1: Horário da Refeição */}
        <div className="my-4">
          <label className="block text-xs font-semibold text-primary mb-2">
            Horário da Última Refeição:
          </label>

          {/* Atalhos Rápidos */}
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            <button
              type="button"
              onClick={() => setRelativeTime(0)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              Agora
            </button>
            <button
              type="button"
              onClick={() => setRelativeTime(30)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              Há 30 min
            </button>
            <button
              type="button"
              onClick={() => setRelativeTime(60)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              Há 1h
            </button>
            <button
              type="button"
              onClick={() => setRelativeTime(120)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              Há 2h
            </button>
          </div>

          <input
            type="datetime-local"
            value={dateTimeStr}
            onChange={(e) => setDateTimeStr(e.target.value)}
            className="w-full rounded-md px-3 py-2 text-sm font-mono text-primary bg-surface-subtle border border-medium focus:outline-none"
            style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
          />
        </div>

        {/* Section 2: Seleção de Meta */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-primary mb-2">
            Meta de Horas Desta Vez:
          </label>

          <div className="grid grid-cols-4 gap-2 mb-2.5">
            {PRESET_GOALS.map((hours) => {
              const isSelected = selectedGoal === hours;
              return (
                <button
                  key={hours}
                  type="button"
                  onClick={() => handleSelectPreset(hours)}
                  className={`py-2 rounded-md text-xs font-mono font-bold transition-all border ${
                    isSelected
                      ? 'bg-pumpkin text-slate-950 border-pumpkin font-extrabold'
                      : 'bg-surface-subtle text-secondary border-subtle hover:border-medium'
                  }`}
                  style={{
                    background: isSelected ? 'var(--accent-pumpkin)' : 'var(--bg-surface-subtle)',
                    color: isSelected ? '#14120D' : 'var(--text-secondary)',
                    borderColor: isSelected ? 'var(--accent-pumpkin)' : 'var(--border-subtle)',
                  }}
                >
                  {hours}h
                </button>
              );
            })}
          </div>

          {/* Campo personalizado */}
          <div className="flex items-center gap-2 text-xs text-secondary">
            <span>Personalizado:</span>
            <input
              type="number"
              min="1"
              max="168"
              value={customGoalInput}
              onChange={handleCustomChange}
              className="w-20 px-2 py-1 rounded-md text-center font-mono text-primary"
              style={{ background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}
            />
            <span>horas</span>
          </div>
        </div>

        {/* Prévia da Planta */}
        <div className="bg-surface-subtle border border-subtle rounded-md p-3 mb-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-sage-subtle border border-subtle flex items-center justify-center text-sage flex-shrink-0">
            <Sprout className="w-5 h-5 text-sage" />
          </div>
          <div>
            <div className="text-xs font-bold text-primary">
              Safra Vinculada: {plantConfig.name}
            </div>
            <div className="text-xs text-secondary leading-snug">
              {plantConfig.description}
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 py-2 text-xs"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Salvar Horário' : 'Confirmar & Plantar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
