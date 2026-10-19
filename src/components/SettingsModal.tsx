import React from 'react';
import type { AppSettings } from '../types';
import { sound } from '../audio';
import { X, Volume2, VolumeX, Bell, Droplets, Palette, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleSoundToggle = () => {
    const next = !settings.sound;
    sound.setSoundEnabled(next);
    if (next) sound.playClick();
    onUpdateSettings({ ...settings, sound: next });
  };

  const handleNotificationToggle = async () => {
    sound.playClick();
    if (!settings.notifications) {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          new Notification('Fazenda do Jejum', {
            body: 'Notificações ativadas com sucesso!',
            icon: '/favicon.svg',
          });
          onUpdateSettings({ ...settings, notifications: true });
        } else {
          alert('Permissão de notificação não foi concedida no navegador.');
          onUpdateSettings({ ...settings, notifications: false });
        }
      } else {
        alert('Seu navegador não suporta notificações nativas.');
      }
    } else {
      onUpdateSettings({ ...settings, notifications: false });
    }
  };

  const handleWaterGoalChange = (goal: number) => {
    sound.playClick();
    onUpdateSettings({ ...settings, waterGoal: Math.max(1, Math.min(20, goal)) });
  };

  const handleThemeChange = (theme: 'auto' | 'day' | 'sunset' | 'night') => {
    sound.playClick();
    onUpdateSettings({ ...settings, theme });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Configurações">
      <div className="modal-content p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-5">
          <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
            Configurações da Plataforma
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar configurações"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3.5 mb-5">
          {/* Audio */}
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[var(--accent-sage)]">
                {settings.sound ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  Efeitos Sonoros
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Sintetizador Web Audio para cliques e colheita
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSoundToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                settings.sound
                  ? 'bg-[var(--accent-sage)] text-[#0d130e]'
                  : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
              }`}
            >
              {settings.sound ? 'Ativado' : 'Mudo'}
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[var(--accent-pumpkin)]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  Notificações de Conclusão
                </div>
                <div className="text-xs text-[var(--text-secondary)]">
                  Avisa quando sua meta de jejum for batida
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNotificationToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                settings.notifications
                  ? 'bg-[var(--accent-sage)] text-[#0d130e]'
                  : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]'
              }`}
            >
              {settings.notifications ? 'Ativas' : 'Inativas'}
            </button>
          </div>

          {/* Water Goal */}
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                <Droplets className="w-4 h-4 text-[var(--accent-petrol)]" />
                <span>Meta Diária de Hidratação</span>
              </div>
              <span className="font-mono text-xs font-bold text-[var(--accent-petrol)]">
                {settings.waterGoal} copos ({((settings.waterGoal * 250) / 1000).toFixed(1).replace('.', ',')} L)
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[4, 6, 8, 10, 12].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => handleWaterGoalChange(g)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    settings.waterGoal === g
                      ? 'bg-[var(--accent-petrol)] text-white border-[var(--accent-petrol-border)] shadow-sm'
                      : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Theme Override */}
          <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] mb-2.5">
              <Palette className="w-4 h-4 text-[var(--accent-sage)]" />
              <span>Ambiente do Cenário Virtual</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => handleThemeChange('auto')}
                className={`py-2.5 px-3 rounded-lg border text-center transition-all ${
                  settings.theme === 'auto'
                    ? 'bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)] border-[var(--accent-sage-border)] font-bold'
                    : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                }`}
              >
                Automático (Horário Real)
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('day')}
                className={`py-2.5 px-3 rounded-lg border text-center transition-all ${
                  settings.theme === 'day'
                    ? 'bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)] border-[var(--accent-sage-border)] font-bold'
                    : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                }`}
              >
                Sempre Dia ☀️
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('sunset')}
                className={`py-2.5 px-3 rounded-lg border text-center transition-all ${
                  settings.theme === 'sunset'
                    ? 'bg-[var(--accent-pumpkin-subtle)] text-[var(--accent-pumpkin)] border-[var(--accent-pumpkin-border)] font-bold'
                    : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                }`}
              >
                Pôr do Sol 🌅
              </button>
              <button
                type="button"
                onClick={() => handleThemeChange('night')}
                className={`py-2.5 px-3 rounded-lg border text-center transition-all ${
                  settings.theme === 'night'
                    ? 'bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)] border-[var(--accent-sage-border)] font-bold'
                    : 'bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                }`}
              >
                Sempre Noite 🌙
              </button>
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-xl p-3.5 mb-5 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] mb-1">
            <Info className="w-4 h-4 text-[var(--accent-sage)]" />
            <span>Sobre a Fazenda do Jejum</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Plataforma focada no acompanhamento de jejum intermitente com gamificação de hábitos rústicos e RPG.
          </p>
          <div className="mt-2.5 p-2.5 rounded-lg bg-[var(--bg-surface)] text-xs text-[var(--text-tertiary)] leading-relaxed border border-[var(--border-subtle)]">
            <b className="text-[var(--text-secondary)]">Aviso de Saúde:</b> Este aplicativo tem fins de acompanhamento pessoal e motivação diária.
            Não substitui a consulta ou acompanhamento de um médico, nutricionista ou profissional de saúde.
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="btn-secondary w-full py-2.5 text-xs font-bold"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
