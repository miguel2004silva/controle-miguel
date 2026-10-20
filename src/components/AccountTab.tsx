import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { User, Lock, Download, Trash2, LogOut, Volume2, VolumeX, Moon, Sun, Monitor, Shield, Check } from 'lucide-react';
import { dataService } from '../lib/dataService';
import type { AuthUser } from '../lib/dataService';
import type { Fast, Profile } from '../types';
import { sound } from '../lib/audio';
import { useTheme } from './ThemeContext';
import type { Theme } from './ThemeContext';
import { useToast } from './Toast';

interface AccountTabProps {
  user: AuthUser;
  profile: Profile | null;
  history: Fast[];
  onSignOut: () => void;
  onRefreshData: () => void;
}

export const AccountTab: FC<AccountTabProps> = ({
  user,
  profile: _profile,
  history,
  onSignOut,
  onRefreshData
}) => {
  const { theme, setTheme } = useTheme();
  const { success, error: toastError } = useToast();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound.getEnabled());
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Toggle de som
  const handleToggleSound = async () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sound.setEnabled(nextVal);
    if (nextVal) sound.playClick();

    try {
      await dataService.updateProfile(user.id, { sound_enabled: nextVal });
    } catch {
      // Ignora erro de sync
    }
  };

  // Mudança de tema
  const handleThemeChange = async (t: Theme) => {
    sound.playClick();
    setTheme(t);
    try {
      await dataService.updateProfile(user.id, { theme: t });
    } catch {
      // Ignora
    }
  };

  // Alteração de senha
  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toastError('Senha muito curta', 'A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await dataService.updatePassword(newPassword);
      setPasswordSuccess(true);
      setNewPassword('');
      success('Senha alterada', 'Sua senha foi atualizada com sucesso.');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao alterar senha.';
      toastError('Erro', msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Exportação CSV
  const handleExportCSV = () => {
    sound.playClick();
    if (history.length === 0) {
      toastError('Sem dados', 'Você ainda não possui histórico para exportar.');
      return;
    }

    const headers = ['ID', 'Início (UTC)', 'Término (UTC)', 'Duração (Horas)', 'Meta (Horas)', 'Meta Alcançada', 'Observações'];
    const rows = history.map(f => {
      const start = new Date(f.started_at);
      const end = f.ended_at ? new Date(f.ended_at) : null;
      const durationHours = end ? ((end.getTime() - start.getTime()) / 3600000).toFixed(2) : 'Em andamento';
      const isMet = end ? ((end.getTime() - start.getTime()) / 3600000 >= f.goal_hours ? 'Sim' : 'Não') : 'Não';
      const notesEscaped = `"${(f.notes || '').replace(/"/g, '""')}"`;

      return [
        f.id,
        f.started_at,
        f.ended_at || '',
        durationHours,
        f.goal_hours,
        isMet,
        notesEscaped
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `export-jejuns-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    success('Download concluído', 'Seu arquivo CSV de histórico foi exportado.');
  };

  // Apagar todos os dados
  const handleDeleteAllData = async () => {
    sound.playClick();
    const confirmed = window.confirm('ATENÇÃO: Deseja apagar PERMANENTEMENTE todo o seu histórico de jejuns? Esta ação não pode ser desfeita.');
    if (!confirmed) return;

    const doubleConfirmed = window.confirm('Por favor confirme pela segunda vez: todos os seus registros serão excluídos agora.');
    if (!doubleConfirmed) return;

    try {
      await dataService.deleteAllUserData(user.id);
      success('Histórico apagado', 'Todos os seus registros de jejum foram removidos.');
      onRefreshData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao limpar dados.';
      toastError('Erro', msg);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '680px', margin: '0 auto' }}>
      {/* INFORMAÇÕES DA CONTA */}
      <div className="ui-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald-500)'
            }}
          >
            <User size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Perfil de Usuário
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {user.email}
            </p>
          </div>
        </div>

        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
            <Shield size={16} color="var(--emerald-500)" />
            <span>Segurança RLS Ativa (PostgreSQL)</span>
          </div>
          <span className="badge badge-emerald">Autenticado</span>
        </div>
      </div>

      {/* PREFERÊNCIAS DO SISTEMA: TEMA E SONS */}
      <div className="ui-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Preferências do Aplicativo
        </h3>

        {/* Seletor de Tema */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Tema Visual</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Claro, escuro ou sincronizado com o sistema</div>
          </div>

          <div className="tabs-container">
            <button
              type="button"
              className={`tab-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <Sun size={14} />
              <span>Claro</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <Moon size={14} />
              <span>Escuro</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${theme === 'system' ? 'active' : ''}`}
              onClick={() => handleThemeChange('system')}
            >
              <Monitor size={14} />
              <span>Sistema</span>
            </button>
          </div>
        </div>

        {/* Toggle de Sons da Interface */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Efeitos Sonoros</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Feedback sutil em cliques, início e término</div>
          </div>

          <button
            type="button"
            className={`btn ${soundEnabled ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleToggleSound}
            style={{ padding: '0.45rem 0.875rem', fontSize: '0.8125rem' }}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            <span>{soundEnabled ? 'Ativados' : 'Desativados'}</span>
          </button>
        </div>
      </div>

      {/* SEGURANÇA: ALTERAÇÃO DE SENHA */}
      <div className="ui-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Segurança da Conta
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Defina uma nova senha forte de acesso
        </p>

        <form onSubmit={handleChangePassword} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px' }}>
            <input
              type="password"
              className="input-field"
              placeholder="Nova senha (mínimo 8 caracteres)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={isChangingPassword}
          >
            <Lock size={15} />
            <span>{isChangingPassword ? 'Salvando...' : 'Alterar Senha'}</span>
          </button>
        </form>

        {passwordSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald-600)', fontSize: '0.8125rem', marginTop: '0.5rem' }}>
            <Check size={14} />
            <span>Senha atualizada com sucesso!</span>
          </div>
        )}
      </div>

      {/* EXPORTAÇÃO DE DADOS */}
      <div className="ui-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Exportação de Histórico
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Baixe seus registros completos no formato CSV para planilha
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportCSV}
          >
            <Download size={16} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* ZONA DE PERIGO E ENCERRAMENTO */}
      <div className="ui-card" style={{ border: '1px solid var(--danger-border)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--danger-text)', marginBottom: '0.25rem' }}>
          Área Crítica
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Ações irreversíveis sobre a sua conta e registros
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDeleteAllData}
          >
            <Trash2 size={16} />
            <span>Apagar Todos os Meus Dados</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onSignOut}
            style={{ marginLeft: 'auto' }}
          >
            <LogOut size={16} />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
