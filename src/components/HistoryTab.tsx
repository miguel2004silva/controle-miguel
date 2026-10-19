import React, { useState, useMemo, useRef } from 'react';
import type { AppState, FastRecord } from '../types';
import { PLANT_CONFIGS } from '../types';
import { exportBackup, importBackup, calculateFastReward } from '../storage';
import { sound } from '../audio';
import { Download, Upload, Trash2, Edit3, BarChart3, AlertTriangle, X, Check } from 'lucide-react';

interface HistoryTabProps {
  state: AppState;
  onUpdateHistory: (newHistory: FastRecord[]) => void;
  onRestoreState: (newState: AppState) => void;
  onResetProgress: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  state,
  onUpdateHistory,
  onRestoreState,
  onResetProgress,
}) => {
  const [editingRecord, setEditingRecord] = useState<FastRecord | null>(null);
  const [editStartStr, setEditStartStr] = useState<string>('');
  const [editEndStr, setEditEndStr] = useState<string>('');
  const [editGoalHours, setEditGoalHours] = useState<number>(16);

  const [resetConfirmCount, setResetConfirmCount] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Past 14 days chart data
  const chartDays = useMemo(() => {
    const days: { dateStr: string; label: string; totalHours: number }[] = [];
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const weekday = d.toLocaleDateString('pt-BR', { weekday: 'narrow' });

      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      let totalMins = 0;
      state.history.forEach((rec) => {
        if (rec.endTs >= dayStart.getTime() && rec.endTs <= dayEnd.getTime()) {
          totalMins += rec.durationMinutes;
        }
      });

      days.push({
        dateStr,
        label: `${weekday} ${day}`,
        totalHours: Math.round((totalMins / 60) * 10) / 10,
      });
    }

    return days;
  }, [state.history]);

  const maxChartHours = Math.max(16, ...chartDays.map((d) => d.totalHours));

  const handleStartEdit = (record: FastRecord) => {
    sound.playClick();
    setEditingRecord(record);
    const dStart = new Date(record.startTs);
    const dEnd = new Date(record.endTs);
    setEditStartStr(new Date(dStart.getTime() - dStart.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setEditEndStr(new Date(dEnd.getTime() - dEnd.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setEditGoalHours(record.goalHours);
  };

  const handleSaveEdit = () => {
    if (!editingRecord) return;
    const startTs = new Date(editStartStr).getTime();
    const endTs = new Date(editEndStr).getTime();

    if (isNaN(startTs) || isNaN(endTs) || endTs <= startTs) {
      alert('Data/hora final deve ser posterior à data/hora inicial.');
      return;
    }

    const durationMinutes = Math.max(1, Math.floor((endTs - startTs) / (1000 * 60)));
    const reward = calculateFastReward(durationMinutes, editGoalHours, 0);

    const updated = state.history.map((r) => {
      if (r.id === editingRecord.id) {
        return {
          ...r,
          startTs,
          endTs,
          goalHours: editGoalHours,
          durationMinutes,
          completedGoal: reward.completedGoal,
          xpEarned: reward.xpEarned,
          harvestQuality: reward.harvestQuality,
        };
      }
      return r;
    });

    sound.playConfirmSound();
    onUpdateHistory(updated);
    setEditingRecord(null);
  };

  const handleDeleteRecord = (id: string) => {
    sound.playClick();
    if (confirm('Tem certeza que deseja excluir este registro de jejum? O progresso será recalculado com consistência.')) {
      const updated = state.history.filter((r) => r.id !== id);
      onUpdateHistory(updated);
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importBackup(
      file,
      (importedState) => {
        sound.playHarvest();
        alert('Backup importado com sucesso!');
        onRestoreState(importedState);
      },
      (msg) => {
        alert(msg);
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* 14-Day Chart Card */}
      <div className="cozy-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--accent-sage)]" />
            <div>
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                Horas em Jejum por Dia
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Acompanhamento das suas últimas 2 semanas de disciplina
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-[var(--text-tertiary)]">
            Escala máxima: <b className="text-[var(--accent-sage)]">{maxChartHours}h</b>
          </span>
        </div>

        {/* Modern Bar Chart Container */}
        <div className="h-44 flex items-end gap-1.5 sm:gap-2.5 pt-4 pb-2 px-1 border-b border-[var(--border-subtle)]">
          {chartDays.map((d, i) => {
            const heightPercent = maxChartHours > 0 ? Math.min(100, (d.totalHours / maxChartHours) * 100) : 0;
            const isToday = i === chartDays.length - 1;

            return (
              <div key={d.dateStr} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Modern Hover Tooltip */}
                <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-[var(--bg-surface-raised)] text-[var(--text-primary)] text-xs font-mono px-2 py-1 rounded-md border border-[var(--border-subtle)] shadow-xl z-20 pointer-events-none whitespace-nowrap">
                  <span>{d.totalHours}h</span>
                  <span className="text-[11px] text-[var(--text-tertiary)]">{d.dateStr}</span>
                </div>

                {/* Animated Rounded Bar */}
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    d.totalHours >= 16
                      ? 'bg-[var(--accent-sage)]'
                      : d.totalHours > 0
                      ? 'bg-[var(--accent-pumpkin)]'
                      : 'bg-[var(--bg-surface-raised)]'
                  } ${isToday ? 'ring-1 ring-[var(--accent-sage)]' : ''}`}
                  style={{
                    height: `${Math.max(d.totalHours > 0 ? 8 : 4, heightPercent)}%`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Labels under chart */}
        <div className="flex justify-between text-xs font-mono text-[var(--text-tertiary)] mt-2 px-1">
          <span>Há 14 dias</span>
          <span>Hoje</span>
        </div>
      </div>

      {/* Backup and Data Management */}
      <div className="cozy-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            Exportação e Segurança de Dados
          </h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Seus dados ficam salvos localmente. Baixe uma cópia JSON para levar para outro dispositivo.
          </p>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              exportBackup(state);
            }}
            className="btn-secondary flex-1 sm:flex-none py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[var(--accent-sage)]" />
            <span>Exportar JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              fileInputRef.current?.click();
            }}
            className="btn-secondary flex-1 sm:flex-none py-2 text-xs font-semibold flex items-center justify-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-[var(--accent-petrol)]" />
            <span>Importar Backup</span>
          </button>
        </div>
      </div>

      {/* History Table List */}
      <div className="cozy-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
            Histórico de Sessões ({state.history.length})
          </h3>
          <span className="text-xs text-[var(--text-tertiary)]">
            Clique no ícone de lápis para corrigir horários passados
          </span>
        </div>

        {state.history.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)]">
            <p className="text-sm font-medium">Nenhum jejum concluído ainda.</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Inicie e finalize sua primeira sessão para ver seu registro detalhado aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...state.history].reverse().map((rec) => {
              const plantConf = PLANT_CONFIGS[rec.plant] || PLANT_CONFIGS.carrot;
              const dStart = new Date(rec.startTs);
              const dEnd = new Date(rec.endTs);
              const durationHours = Math.floor(rec.durationMinutes / 60);
              const durationMins = rec.durationMinutes % 60;

              return (
                <div
                  key={rec.id}
                  className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[var(--border-medium)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-xl flex-shrink-0">
                      {rec.plant === 'carrot' ? '🥕' : rec.plant === 'potato' ? '🥔' : rec.plant === 'pumpkin' ? '🎃' : '⭐'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {plantConf.name}
                        </span>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            rec.completedGoal
                              ? 'bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)] border-[var(--accent-sage-border)]'
                              : 'bg-[var(--accent-pumpkin-subtle)] text-[var(--accent-pumpkin)] border-[var(--accent-pumpkin-border)]'
                          }`}
                        >
                          {rec.completedGoal ? 'Meta Batida' : 'Parcial'}
                        </span>
                      </div>

                      <div className="text-xs text-[var(--text-secondary)] mt-0.5 font-mono">
                        {dStart.toLocaleDateString('pt-BR')} das {dStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às {dEnd.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-[var(--border-subtle)]">
                    <div className="text-left sm:text-right">
                      <div className="font-mono text-sm font-bold text-[var(--text-primary)]">
                        {durationHours}h {durationMins}m <span className="text-xs text-[var(--text-tertiary)]">/ {rec.goalHours}h</span>
                      </div>
                      <div className="font-mono text-xs text-[var(--accent-sage)] font-bold">
                        +{rec.xpEarned} XP
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(rec)}
                        className="p-2 rounded-lg bg-[var(--bg-surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-medium)] border border-[var(--border-subtle)] transition-colors"
                        title="Editar horário deste registro"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="p-2 rounded-lg bg-[var(--bg-surface-subtle)] text-[var(--text-tertiary)] hover:text-[var(--accent-danger)] border border-[var(--border-subtle)] transition-colors"
                        title="Excluir registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="p-4 rounded-xl border border-[var(--accent-danger)]/30 bg-[var(--accent-danger-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-[#E57368] flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>Zona Crítica: Reiniciar Dados</span>
          </h4>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Apaga todo o histórico, atributos e safras guardadas neste navegador.
          </p>
        </div>

        {resetConfirmCount === 0 ? (
          <button
            type="button"
            onClick={() => setResetConfirmCount(1)}
            className="btn-danger-subtle text-xs"
          >
            Resetar Progresso
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setResetConfirmCount(0)}
              className="btn-secondary py-1 px-3 text-xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => {
                onResetProgress();
                setResetConfirmCount(0);
              }}
              className="btn-danger-subtle py-1 px-3 text-xs bg-[#c04d3f] text-white"
            >
              Confirmar Exclusão
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Editar Registro">
          <div className="modal-content p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-4">
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                Editar Registro de Jejum
              </h3>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Horário de Início:
                </label>
                <input
                  type="datetime-local"
                  value={editStartStr}
                  onChange={(e) => setEditStartStr(e.target.value)}
                  className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-medium)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Horário de Fim:
                </label>
                <input
                  type="datetime-local"
                  value={editEndStr}
                  onChange={(e) => setEditEndStr(e.target.value)}
                  className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-medium)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                  Meta em Horas:
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={editGoalHours}
                  onChange={(e) => setEditGoalHours(Number(e.target.value))}
                  className="w-full bg-[var(--bg-surface-raised)] border border-[var(--border-medium)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] font-mono"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="btn-secondary flex-1 py-2 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="btn-primary flex-1 py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
