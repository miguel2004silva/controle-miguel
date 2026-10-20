import { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, LayoutDashboard, History, User, Sun, Moon } from 'lucide-react';
import { dataService } from './lib/dataService';
import type { AuthUser } from './lib/dataService';
import type { Fast, Profile, FastStats } from './types';
import { sound } from './lib/audio';
import { ToastProvider, useToast } from './components/Toast';
import { ThemeProvider, useTheme } from './components/ThemeContext';
import { AuthScreen } from './components/AuthScreen';
import { DashboardTab } from './components/DashboardTab';
import { HistoryTab } from './components/HistoryTab';
import { AccountTab } from './components/AccountTab';
import { StartFastModal } from './components/StartFastModal';
import { BreakFastModal } from './components/BreakFastModal';
import { EditFastModal } from './components/EditFastModal';
import './App.css';

function MainApp() {
  const { theme, setTheme } = useTheme();
  const { success } = useToast();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Navegação: 'dashboard' | 'history' | 'account'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'account'>('dashboard');

  // Estados de Jejum
  const [activeFast, setActiveFast] = useState<Fast | null>(null);
  const [historyFasts, setHistoryFasts] = useState<Fast[]>([]);

  // Modais
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [editingFast, setEditingFast] = useState<Fast | null>(null);

  // Carrega a sessão inicial e preferências
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const { user, profile: userProfile } = await dataService.getInitialSession();
        if (isMounted) {
          if (user) {
            setCurrentUser(user);
            setProfile(userProfile);
            if (userProfile?.sound_enabled !== undefined) {
              sound.setEnabled(userProfile.sound_enabled);
            }
            if (userProfile?.theme) {
              setTheme(userProfile.theme);
            }
          }
        }
      } catch {
        // Ignora
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    initSession();
    return () => { isMounted = false; };
  }, [setTheme]);

  // Carrega os jejuns quando o usuário estiver autenticado
  const refreshFasts = useCallback(async () => {
    if (!currentUser) return;
    try {
      const active = await dataService.getActiveFast(currentUser.id);
      const history = await dataService.getHistory(currentUser.id);
      setActiveFast(active);
      setHistoryFasts(history);
    } catch {
      // Ignora erro temporário de sync
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      refreshFasts();
    }
  }, [currentUser, refreshFasts]);

  // Cálculo de estatísticas consolidadas
  const stats: FastStats = useMemo(() => {
    const completed = historyFasts.filter(f => f.ended_at !== null);
    let totalHours = 0;
    let longestHours = 0;
    let metGoalsCount = 0;

    completed.forEach(f => {
      const durH = (new Date(f.ended_at!).getTime() - new Date(f.started_at).getTime()) / 3600000;
      totalHours += durH;
      if (durH > longestHours) longestHours = durH;
      if (durH >= f.goal_hours) metGoalsCount++;
    });

    const goalSuccessRate = completed.length > 0 ? Math.round((metGoalsCount / completed.length) * 100) : 100;
    const averageFastHours = completed.length > 0 ? totalHours / completed.length : 0;

    // Cálculo simplificado de sequência (streak) em dias
    let streak = 0;
    if (completed.length > 0) {
      const sorted = [...completed].sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
      // Se jejuou hoje ou ontem, conta como streak ativo
      const diffDays = Math.floor((new Date().getTime() - new Date(sorted[0].started_at).getTime()) / 86400000);
      if (diffDays <= 1 || activeFast) {
        streak = Math.min(completed.length, diffDays + 1);
      }
    } else if (activeFast) {
      streak = 1;
    }

    return {
      totalFasts: completed.length + (activeFast ? 1 : 0),
      completedFasts: completed.length,
      totalHoursFasted: totalHours,
      longestFastHours: longestHours,
      goalSuccessRate,
      currentStreakDays: streak,
      averageFastHours
    };
  }, [historyFasts, activeFast]);

  // Ações de Jejum
  const handleStartFast = async (startedAt: string, goalHours: number, notes?: string) => {
    if (!currentUser) return;
    const newFast = await dataService.startFast(currentUser.id, startedAt, goalHours, notes);
    setActiveFast(newFast);
    success('Jejum iniciado!', `Meta estipulada em ${goalHours} horas.`);
    await refreshFasts();
  };

  const handleBreakFast = async (fastId: string, endedAt: string, notes?: string) => {
    await dataService.breakFast(fastId, endedAt, notes);
    setActiveFast(null);
    success('Jejum concluído com sucesso!');
    await refreshFasts();
  };

  const handleSaveEditFast = async (fastId: string, updates: { started_at: string; ended_at?: string; goal_hours: number; notes?: string }) => {
    if (activeFast && activeFast.id === fastId) {
      const updated = await dataService.updateActiveFast(fastId, updates);
      setActiveFast(updated);
    } else {
      await dataService.updatePastFast(fastId, updates);
    }
    success('Registro atualizado');
    await refreshFasts();
  };

  const handleDeleteFast = async (fastId: string) => {
    await dataService.deleteFast(fastId);
    if (activeFast && activeFast.id === fastId) {
      setActiveFast(null);
    }
    success('Registro excluído');
    await refreshFasts();
  };

  const handleSignOut = async () => {
    sound.playClick();
    await dataService.signOut();
    setCurrentUser(null);
    setActiveFast(null);
    setHistoryFasts([]);
    success('Sessão encerrada');
  };

  if (isInitializing) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          <Clock size={20} className="animate-spin" />
          <span>Carregando Controle de Jejum...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={user => setCurrentUser(user)} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* CABEÇALHO SUPERIOR (HEADER) */}
      <header
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo e Nome da Aplicação */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--emerald-500)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={18} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Controle de Jejum
              </span>
            </div>
          </div>

          {/* Navegação por Abas (Desktop) */}
          <nav className="tabs-container" style={{ display: 'none' }} id="desktop-nav">
            <button
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setActiveTab('dashboard'); }}
            >
              <LayoutDashboard size={15} />
              <span>Painel</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setActiveTab('history'); }}
            >
              <History size={15} />
              <span>Histórico</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setActiveTab('account'); }}
            >
              <User size={15} />
              <span>Conta</span>
            </button>
          </nav>

          {/* Seletor rápido de tema no cabeçalho */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-ghost"
              onClick={() => {
                sound.playClick();
                setTheme(theme === 'dark' ? 'light' : 'dark');
              }}
              style={{ padding: '0.45rem', borderRadius: '50%' }}
              title="Alternar tema claro/escuro"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="app-container" style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardTab
            activeFast={activeFast}
            stats={stats}
            onOpenStartModal={() => setIsStartModalOpen(true)}
            onOpenBreakModal={() => setIsBreakModalOpen(true)}
            onOpenEditModal={fast => setEditingFast(fast)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            history={historyFasts}
            onEditFast={fast => setEditingFast(fast)}
            onDeleteFast={handleDeleteFast}
          />
        )}

        {activeTab === 'account' && (
          <AccountTab
            user={currentUser}
            profile={profile}
            history={historyFasts}
            onSignOut={handleSignOut}
            onRefreshData={refreshFasts}
          />
        )}
      </main>

      {/* BARRA DE NAVEGAÇÃO INFERIOR FIXA (MOBILE-FIRST) */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0.4rem 0.5rem calc(0.4rem + env(safe-area-inset-bottom)) 0.5rem',
          zIndex: 40
        }}
      >
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { sound.playClick(); setActiveTab('dashboard'); }}
          style={{ flexDirection: 'column', gap: '0.2rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
        >
          <LayoutDashboard size={18} />
          <span>Painel</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => { sound.playClick(); setActiveTab('history'); }}
          style={{ flexDirection: 'column', gap: '0.2rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
        >
          <History size={18} />
          <span>Histórico</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => { sound.playClick(); setActiveTab('account'); }}
          style={{ flexDirection: 'column', gap: '0.2rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
        >
          <User size={18} />
          <span>Conta</span>
        </button>
      </nav>

      {/* MODAIS DO SISTEMA */}
      <StartFastModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        onConfirm={handleStartFast}
        defaultGoalHours={profile?.preferred_goal_hours || 16}
      />

      <BreakFastModal
        isOpen={isBreakModalOpen}
        activeFast={activeFast}
        onClose={() => setIsBreakModalOpen(false)}
        onConfirm={handleBreakFast}
      />

      <EditFastModal
        isOpen={Boolean(editingFast)}
        fast={editingFast}
        onClose={() => setEditingFast(null)}
        onSave={handleSaveEditFast}
        onDelete={handleDeleteFast}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <MainApp />
      </ToastProvider>
    </ThemeProvider>
  );
}
