import { useState, useMemo } from 'react';
import type { FC } from 'react';
import { Search, Calendar, Edit3, Trash2, Clock } from 'lucide-react';
import type { Fast } from '../types';
import { sound } from '../lib/audio';

interface HistoryTabProps {
  history: Fast[];
  onEditFast: (fast: Fast) => void;
  onDeleteFast: (fastId: string) => void;
}

export const HistoryTab: FC<HistoryTabProps> = ({
  history,
  onEditFast,
  onDeleteFast
}) => {
  const [chartRange, setChartRange] = useState<'7d' | '30d'>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'achieved' | 'partial'>('all');

  // Cálculos para o gráfico de barras
  const chartDaysCount = chartRange === '7d' ? 7 : 30;
  
  const dailyData = useMemo(() => {
    const days: { label: string; dateStr: string; hours: number; isGoalMet: boolean }[] = [];
    const now = new Date();

    for (let i = chartDaysCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' });

      // Soma de horas de jejuns que iniciaram ou terminaram neste dia
      let totalH = 0;
      let metGoal = false;

      history.forEach(fast => {
        if (!fast.ended_at) return;
        const fastStart = fast.started_at.slice(0, 10);
        const fastEnd = fast.ended_at.slice(0, 10);

        if (fastStart === dateStr || fastEnd === dateStr) {
          const durationH = (new Date(fast.ended_at).getTime() - new Date(fast.started_at).getTime()) / 3600000;
          totalH += durationH;
          if (durationH >= fast.goal_hours) metGoal = true;
        }
      });

      days.push({ label, dateStr, hours: totalH, isGoalMet: metGoal });
    }
    return days;
  }, [history, chartDaysCount]);

  const maxChartHours = Math.max(24, ...dailyData.map(d => d.hours));

  // Mapa de calor (Heatmap - 28 dias em 4 semanas)
  const heatmapDays = useMemo(() => {
    const cells: { dateStr: string; hours: number; level: number }[] = [];
    const now = new Date();

    for (let i = 27; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      let h = 0;
      history.forEach(fast => {
        if (!fast.ended_at) return;
        if (fast.started_at.slice(0, 10) === dateStr) {
          h += (new Date(fast.ended_at).getTime() - new Date(fast.started_at).getTime()) / 3600000;
        }
      });

      let level = 0;
      if (h > 0 && h < 12) level = 1;
      else if (h >= 12 && h < 16) level = 2;
      else if (h >= 16 && h < 20) level = 3;
      else if (h >= 20) level = 4;

      cells.push({ dateStr, hours: h, level });
    }
    return cells;
  }, [history]);

  // Filtros da lista
  const filteredHistory = useMemo(() => {
    return history.filter(fast => {
      if (!fast.ended_at) return false;
      const durationHours = (new Date(fast.ended_at).getTime() - new Date(fast.started_at).getTime()) / 3600000;
      const isAchieved = durationHours >= fast.goal_hours;

      if (filterType === 'achieved' && !isAchieved) return false;
      if (filterType === 'partial' && isAchieved) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const dateStr = new Date(fast.started_at).toLocaleDateString('pt-BR');
        const notesMatch = fast.notes?.toLowerCase().includes(q) || false;
        return dateStr.includes(q) || notesMatch;
      }

      return true;
    });
  }, [history, filterType, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* GRÁFICO DE HORAS JEJUADAS */}
      <div className="ui-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Evolução Temporal
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Horas de jejum registradas por dia
            </p>
          </div>

          <div className="tabs-container">
            <button
              className={`tab-btn ${chartRange === '7d' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setChartRange('7d'); }}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              7 dias
            </button>
            <button
              className={`tab-btn ${chartRange === '30d' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setChartRange('30d'); }}
              style={{ padding: '0.35rem 0.65rem' }}
            >
              30 dias
            </button>
          </div>
        </div>

        {/* Barras do Gráfico */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: chartRange === '7d' ? '1rem' : '0.25rem',
            height: '160px',
            paddingTop: '1rem',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          {dailyData.map((d, idx) => {
            const heightPercent = maxChartHours > 0 ? (d.hours / maxChartHours) * 100 : 0;
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  position: 'relative'
                }}
                title={`${d.label}: ${d.hours.toFixed(1)}h`}
              >
                {/* Barra */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: chartRange === '7d' ? '36px' : '14px',
                    height: `${Math.max(d.hours > 0 ? 4 : 0, heightPercent)}%`,
                    backgroundColor: d.hours >= 16 ? 'var(--emerald-500)' : d.hours > 0 ? 'var(--emerald-700)' : 'var(--bg-surface-subtle)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.4s ease'
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Labels inferiores do gráfico */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>{dailyData[0]?.label}</span>
          <span>{dailyData[Math.floor(dailyData.length / 2)]?.label}</span>
          <span>Hoje</span>
        </div>
      </div>

      {/* MAPA DE CALOR (BENCHO HEATMAP MATRIX) */}
      <div className="ui-card">
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Consistência (Últimos 28 dias)
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Matriz de densidade diária de jejuns
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', maxWidth: '360px' }}>
          {heatmapDays.map((cell, idx) => {
            const colors = [
              'var(--bg-surface-subtle)',
              'rgba(16, 185, 129, 0.25)',
              'rgba(16, 185, 129, 0.50)',
              'rgba(16, 185, 129, 0.75)',
              'var(--emerald-500)'
            ];

            return (
              <div
                key={idx}
                style={{
                  aspectRatio: '1',
                  borderRadius: '4px',
                  backgroundColor: colors[cell.level],
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer'
                }}
                title={`${new Date(cell.dateStr + 'T12:00:00').toLocaleDateString('pt-BR')}: ${cell.hours.toFixed(1)}h jejuadas`}
              />
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Menos</span>
          <div style={{ display: 'flex', gap: '3px' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--bg-surface-subtle)' }} />
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(16, 185, 129, 0.3)' }} />
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(16, 185, 129, 0.6)' }} />
            <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--emerald-500)' }} />
          </div>
          <span>Mais</span>
        </div>
      </div>

      {/* LISTAGEM DE HISTÓRICO COM BUSCA E FILTROS */}
      <div className="ui-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Registros Anteriores ({filteredHistory.length})
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Gerencie, altere ou exclua qualquer registro passado
              </p>
            </div>

            {/* Filtros rápidos */}
            <div className="tabs-container">
              <button
                className={`tab-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => { sound.playClick(); setFilterType('all'); }}
                style={{ padding: '0.35rem 0.65rem' }}
              >
                Todos
              </button>
              <button
                className={`tab-btn ${filterType === 'achieved' ? 'active' : ''}`}
                onClick={() => { sound.playClick(); setFilterType('achieved'); }}
                style={{ padding: '0.35rem 0.65rem' }}
              >
                Metas Batidas
              </button>
              <button
                className={`tab-btn ${filterType === 'partial' ? 'active' : ''}`}
                onClick={() => { sound.playClick(); setFilterType('partial'); }}
                style={{ padding: '0.35rem 0.65rem' }}
              >
                Parciais
              </button>
            </div>
          </div>

          {/* Barra de Busca */}
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por data ou notas..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        {/* Lista de Itens */}
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Calendar size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Nenhum registro encontrado</p>
            <p style={{ fontSize: '0.8125rem' }}>Quando você concluir seu primeiro jejum, ele aparecerá aqui.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {filteredHistory.map(fast => {
              const start = new Date(fast.started_at);
              const end = fast.ended_at ? new Date(fast.ended_at) : new Date();
              const durationMs = Math.max(0, end.getTime() - start.getTime());
              const durationH = durationMs / 3600000;
              const h = Math.floor(durationH);
              const m = Math.floor((durationMs % 3600000) / 60000);
              const isGoalMet = durationH >= fast.goal_hours;

              return (
                <div
                  key={fast.id}
                  className="ui-card-subtle"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isGoalMet ? 'var(--emerald-50)' : 'var(--bg-surface)',
                        color: isGoalMet ? 'var(--emerald-600)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-subtle)',
                        flexShrink: 0
                      }}
                    >
                      <Clock size={18} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="tabular-nums" style={{ fontSize: '1.0625rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {h}h {m}min
                        </span>
                        <span className={`badge ${isGoalMet ? 'badge-emerald' : 'badge-muted'}`}>
                          {isGoalMet ? 'Meta de ' + fast.goal_hours + 'h batida' : 'Meta: ' + fast.goal_hours + 'h'}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {start.toLocaleDateString('pt-BR')} • {start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} até {end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>

                      {fast.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                          "{fast.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações: Editar e Excluir */}
                  <div style={{ display: 'flex', gap: '0.35rem', marginLeft: 'auto' }}>
                    <button
                      className="btn btn-secondary"
                      onClick={() => { sound.playClick(); onEditFast(fast); }}
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                      title="Editar registro"
                    >
                      <Edit3 size={14} />
                      <span>Editar</span>
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => { sound.playClick(); onDeleteFast(fast.id); }}
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }}
                      title="Excluir registro"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
