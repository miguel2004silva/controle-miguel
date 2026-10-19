import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  AppState,
  FastRecord,
  HunterRank,
} from './types';
import {
  getRankFromLevel,
  calculateLevelFromXp,
  getPlantForHours,
} from './types';
import {
  loadState,
  saveState,
  derivePlayerStats,
  calculateFastReward,
  getTodayKey,
} from './storage';
import { sound } from './audio';

// Modern Components
import { ModernTimer } from './components/ModernTimer';
import { ModernCropCard } from './components/ModernCropCard';
import { DashboardWidgets } from './components/DashboardWidgets';
import { FastingPhasesTimeline } from './components/FastingPhasesTimeline';
import { StartFastModal } from './components/StartFastModal';
import { BreakFastModal } from './components/BreakFastModal';
import { SystemModal } from './components/SystemModal';
import { QuestsTab } from './components/QuestsTab';
import { StatusTab } from './components/StatusTab';
import { HistoryTab } from './components/HistoryTab';
import { SettingsModal } from './components/SettingsModal';
import { PixelConfetti } from './components/PixelConfetti';

// Icons
import {
  Sprout,
  Flame,
  Settings,
  Volume2,
  VolumeX,
  LayoutDashboard,
  Award,
  Shield,
  BarChart2,
  CheckCircle,
} from 'lucide-react';

type TabType = 'farm' | 'quests' | 'status' | 'history';

interface Toast {
  id: number;
  message: string;
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [activeTab, setActiveTab] = useState<TabType>('farm');
  const [currentTs, setCurrentTs] = useState<number>(Date.now());
  const [toast, setToast] = useState<Toast | null>(null);

  // Modals state
  const [isStartFastOpen, setIsStartFastOpen] = useState(false);
  const [isEditingStart, setIsEditingStart] = useState(false);
  const [isBreakFastOpen, setIsBreakFastOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // System Level-Up / Rank-Up Modal
  const [systemModal, setSystemModal] = useState<{
    isOpen: boolean;
    newLevel: number;
    newRank: HunterRank;
    rankTitle: string;
    isRankUp: boolean;
  }>({
    isOpen: false,
    newLevel: 1,
    newRank: 'E',
    rankTitle: 'Colono Novato',
    isRankUp: false,
  });

  const [showConfetti, setShowConfetti] = useState(false);
  const [claimedQuests, setClaimedQuests] = useState<string[]>([]);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ id, message });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 2800);
  }, []);

  useEffect(() => {
    sound.setSoundEnabled(state.settings.sound);
  }, [state.settings.sound]);

  // Real-time second clock tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => derivePlayerStats(state), [state]);

  const elapsedSeconds = useMemo(() => {
    if (!state.activeFast) return 0;
    return Math.max(0, Math.floor((currentTs - state.activeFast.startTs) / 1000));
  }, [state.activeFast, currentTs]);

  const progressPercent = useMemo(() => {
    if (!state.activeFast) return 0;
    const goalSecs = state.activeFast.goalHours * 3600;
    return Math.min(100, Math.floor((elapsedSeconds / goalSecs) * 100));
  }, [state.activeFast, elapsedSeconds]);

  const elapsedHours = state.activeFast ? elapsedSeconds / 3600 : 0;

  // Time of day detection
  const timeOfDay = useMemo<'dawn' | 'day' | 'sunset' | 'night'>(() => {
    if (state.settings.theme !== 'auto') return state.settings.theme;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19.5) return 'sunset';
    return 'night';
  }, [state.settings.theme]);

  // Crop stage determination
  const cropStage = useMemo(() => {
    if (!state.activeFast) return null;
    if (progressPercent >= 100) return 'ready';
    if (progressPercent >= 75) return 'mature';
    if (progressPercent >= 45) return 'growing';
    if (progressPercent >= 20) return 'sprout';
    return 'seed';
  }, [state.activeFast, progressPercent]);

  const activePlantType = state.activeFast
    ? getPlantForHours(state.activeFast.goalHours)
    : null;

  // Check goal reached notification
  useEffect(() => {
    if (!state.activeFast) return;
    const goalSecs = state.activeFast.goalHours * 3600;
    if (elapsedSeconds >= goalSecs) {
      const notifiedKey = `notified_goal_${state.activeFast.startTs}`;
      if (!sessionStorage.getItem(notifiedKey)) {
        sessionStorage.setItem(notifiedKey, 'true');
        sound.playHarvest();
        showToast('🌾 Parabéns! Sua meta foi alcançada e a safra está pronta!');
        if (state.settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Fazenda do Jejum 🌾', {
            body: `Parabéns! Sua meta de ${state.activeFast.goalHours}h foi alcançada! Sua safra está pronta para colheita!`,
            icon: '/favicon.svg',
          });
        }
      }
    }
  }, [state.activeFast, elapsedSeconds, state.settings.notifications, showToast]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const checkLevelUp = (oldXp: number, newXp: number) => {
    const oldLvl = calculateLevelFromXp(oldXp);
    const newLvl = calculateLevelFromXp(newXp);

    if (newLvl.level > oldLvl.level) {
      const oldRank = getRankFromLevel(oldLvl.level);
      const newRank = getRankFromLevel(newLvl.level);
      const isRankUp = newRank.rank !== oldRank.rank;

      setShowConfetti(true);
      setSystemModal({
        isOpen: true,
        newLevel: newLvl.level,
        newRank: newRank.rank,
        rankTitle: newRank.title,
        isRankUp,
      });
    }
  };

  const handleStartFast = (startTs: number, goalHours: number) => {
    updateState((prev) => ({
      ...prev,
      activeFast: { startTs, goalHours },
      settings: { ...prev.settings, lastGoal: goalHours },
    }));
    showToast(`🌱 Jejum de ${goalHours}h iniciado com sucesso!`);
  };

  const handleBreakFast = (adjustedEndTs: number) => {
    if (!state.activeFast) return;

    const durationMinutes = Math.max(1, Math.floor((adjustedEndTs - state.activeFast.startTs) / (1000 * 60)));
    const reward = calculateFastReward(durationMinutes, state.activeFast.goalHours, stats.streak);

    const newRecord: FastRecord = {
      id: 'fast_' + Date.now(),
      startTs: state.activeFast.startTs,
      endTs: adjustedEndTs,
      goalHours: state.activeFast.goalHours,
      durationMinutes,
      completedGoal: reward.completedGoal,
      xpEarned: reward.xpEarned,
      plant: getPlantForHours(state.activeFast.goalHours),
      harvestQuality: reward.harvestQuality,
    };

    const oldTotalXp = stats.totalXp;
    const newTotalXp = oldTotalXp + reward.xpEarned;

    updateState((prev) => ({
      ...prev,
      activeFast: null,
      history: [...prev.history, newRecord],
    }));

    setIsBreakFastOpen(false);
    setShowConfetti(true);
    sound.playHarvest();
    showToast(`🌾 Safra colhida! +${reward.xpEarned} XP conquistados`);

    checkLevelUp(oldTotalXp, newTotalXp);
  };

  const handleAddWater = (delta: number) => {
    const todayKey = getTodayKey();
    updateState((prev) => {
      const current = Math.max(0, prev.water[todayKey] || 0);
      const next = Math.max(0, current + delta);
      return {
        ...prev,
        water: { ...prev.water, [todayKey]: next },
      };
    });
    if (delta > 0) {
      showToast('💧 +250 ml de água registrados!');
    }
  };

  const handleClaimQuestXp = (questId: string, xp: number) => {
    if (claimedQuests.includes(questId)) return;

    const oldTotalXp = stats.totalXp;
    const newTotalXp = oldTotalXp + xp;

    setClaimedQuests((prev) => [...prev, questId]);
    setShowConfetti(true);

    const questRecord: FastRecord = {
      id: 'quest_' + Date.now(),
      startTs: Date.now(),
      endTs: Date.now(),
      goalHours: 0,
      durationMinutes: 0,
      completedGoal: true,
      xpEarned: xp,
      plant: 'carrot',
      harvestQuality: 'perfect',
    };

    updateState((prev) => ({
      ...prev,
      history: [...prev.history, questRecord],
    }));

    showToast(`✨ Recompensa de missão: +${xp} XP!`);
    checkLevelUp(oldTotalXp, newTotalXp);
  };

  const todayKey = getTodayKey();
  const todayWaterCups = Math.max(0, state.water[todayKey] || 0);

  // Check today's completed fasts
  const todayFasts = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayTs = startOfDay.getTime();
    return state.history.filter((f) => f.endTs >= startOfDayTs);
  }, [state.history]);

  const hasHitGoalToday = todayFasts.some((f) => f.completedGoal);

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-sage-subtle)] selection:text-[var(--accent-sage)] font-sans">
      {/* Toast Alert Feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-16 right-5 z-50 bg-[var(--bg-surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] py-2.5 px-4 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-medium animate-fadeIn"
        >
          <CheckCircle className="w-4 h-4 text-[var(--accent-sage)] flex-shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] py-3">
        <div className="container-xl flex items-center justify-between gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-pumpkin-subtle)] border border-[var(--accent-pumpkin-border)] flex items-center justify-center text-[var(--accent-pumpkin)]">
              <Sprout className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold font-heading tracking-tight text-[var(--text-primary)]">
                  Fazenda do Jejum
                </span>
                <span className="hidden sm:inline-flex text-xs font-semibold px-2 py-0.5 rounded-full border border-[var(--accent-sage-border)] bg-[var(--accent-sage-subtle)] text-[var(--accent-sage)]">
                  Horta RPG
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                Gamificação & Cultivo Intermitente
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tab Pills */}
          <nav className="hidden md:flex items-center gap-1 bg-[var(--bg-surface-subtle)] p-1 rounded-xl border border-[var(--border-subtle)]" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'farm'}
              onClick={() => {
                sound.playClick();
                setActiveTab('farm');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'farm'
                  ? 'bg-[var(--accent-pumpkin)] text-[#14120D] font-bold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Horta & Timer</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'quests'}
              onClick={() => {
                sound.playClick();
                setActiveTab('quests');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'quests'
                  ? 'bg-[var(--accent-pumpkin)] text-[#14120D] font-bold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Missões Diárias</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'status'}
              onClick={() => {
                sound.playClick();
                setActiveTab('status');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'status'
                  ? 'bg-[var(--accent-pumpkin)] text-[#14120D] font-bold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Status & Ranks</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'history'}
              onClick={() => {
                sound.playClick();
                setActiveTab('history');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === 'history'
                  ? 'bg-[var(--accent-pumpkin)] text-[#14120D] font-bold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Histórico</span>
            </button>
          </nav>

          {/* Right Header Badges & Actions */}
          <div className="flex items-center gap-2">
            {/* Streak Badge */}
            <div
              className="flex items-center gap-1.5 bg-[var(--accent-pumpkin-subtle)] border border-[var(--accent-pumpkin-border)] px-2.5 py-1 rounded-xl text-[var(--accent-pumpkin)] text-xs font-bold font-mono"
              title="Sequência de dias com meta concluída"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>{stats.streak}d</span>
            </div>

            {/* Rank / Level Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-xl">
              <span className="font-mono font-bold text-xs text-[var(--accent-pumpkin)]">
                {stats.rank}
              </span>
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                Nv. {stats.level}
              </span>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !state.settings.sound;
                sound.setSoundEnabled(next);
                if (next) sound.playClick();
                updateState((prev) => ({
                  ...prev,
                  settings: { ...prev.settings, sound: next },
                }));
              }}
              className="btn-icon"
              aria-label={state.settings.sound ? 'Silenciar Áudio' : 'Ativar Áudio'}
              title={state.settings.sound ? 'Silenciar Áudio' : 'Ativar Áudio'}
            >
              {state.settings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Settings Modal Toggle */}
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsSettingsOpen(true);
              }}
              className="btn-icon"
              aria-label="Configurações e Sobre"
              title="Configurações e Sobre"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dynamic Workspace */}
      <main className="container-xl py-5 pb-24 md:pb-8 flex-1">
        {activeTab === 'farm' && (
          <div className="space-y-6">
            {/* Asymmetrical Hero Layout: Timer (Clean) + Horta (Living Center) + Side Widgets */}
            <div className="dashboard-hero-grid">
              {/* Col 1: Fasting Timer Gauge */}
              <ModernTimer
                activeFast={state.activeFast}
                elapsedSeconds={elapsedSeconds}
                onStartFastClick={() => {
                  sound.playClick();
                  setIsEditingStart(false);
                  setIsStartFastOpen(true);
                }}
                onBreakFastClick={() => {
                  sound.playClick();
                  setIsBreakFastOpen(true);
                }}
                onEditStartClick={() => {
                  sound.playClick();
                  setIsEditingStart(true);
                  setIsStartFastOpen(true);
                }}
                onHarvestClick={() => {
                  sound.playHarvest();
                  setIsBreakFastOpen(true);
                }}
              />

              {/* Col 2: Virtual Living Garden & Growing Crop (Protagonist) */}
              <ModernCropCard
                plantType={activePlantType}
                stage={cropStage}
                progressPercent={progressPercent}
                timeOfDay={timeOfDay}
                onHarvest={() => {
                  sound.playHarvest();
                  setIsBreakFastOpen(true);
                }}
                onWaterPlant={() => handleAddWater(1)}
              />

              {/* Col 3: Side Widgets (Hydration, Rank Bar & Daily Quests Checklist) */}
              <DashboardWidgets
                stats={stats}
                todayWaterCups={todayWaterCups}
                waterGoal={state.settings.waterGoal}
                onAddWater={handleAddWater}
                hasHitGoalToday={hasHitGoalToday}
                onNavigateQuests={() => setActiveTab('quests')}
              />
            </div>

            {/* Metabolic Journey Timeline */}
            <FastingPhasesTimeline elapsedHours={elapsedHours} />
          </div>
        )}

        {activeTab === 'quests' && (
          <QuestsTab
            state={state}
            onAddWater={handleAddWater}
            onClaimQuestXp={handleClaimQuestXp}
            claimedQuests={claimedQuests}
          />
        )}

        {activeTab === 'status' && (
          <StatusTab state={state} stats={stats} />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            state={state}
            onUpdateHistory={(newHistory) => {
              updateState((prev) => ({ ...prev, history: newHistory }));
            }}
            onRestoreState={(newState) => {
              setState(newState);
            }}
            onResetProgress={() => {
              localStorage.clear();
              window.location.reload();
            }}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Tab Bar (Responsive UX) */}
      <nav
        aria-label="Navegação inferior mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] py-2 px-3 flex justify-around items-center"
      >
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveTab('farm');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 text-xs font-semibold transition-colors ${
            activeTab === 'farm'
              ? 'text-[var(--accent-pumpkin)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Horta</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveTab('quests');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 text-xs font-semibold transition-colors ${
            activeTab === 'quests'
              ? 'text-[var(--accent-pumpkin)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>Missões</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveTab('status');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 text-xs font-semibold transition-colors ${
            activeTab === 'status'
              ? 'text-[var(--accent-pumpkin)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span>Status</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setActiveTab('history');
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[48px] gap-1 text-xs font-semibold transition-colors ${
            activeTab === 'history'
              ? 'text-[var(--accent-pumpkin)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span>Histórico</span>
        </button>
      </nav>

      {/* Desktop Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/80 py-3.5">
        <div className="container-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-tertiary)]">
          <div>
            Fazenda do Jejum • Rastreamento de Jejum Intermitente com Gamificação
          </div>
          <div className="flex items-center gap-3">
            <span>Solo Leveling RPG</span>
            <span>•</span>
            <span>Armazenamento Local v2</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StartFastModal
        isOpen={isStartFastOpen}
        onClose={() => setIsStartFastOpen(false)}
        onConfirm={handleStartFast}
        defaultGoalHours={state.settings.lastGoal || 16}
        isEditing={isEditingStart}
        currentStartTs={isEditingStart ? state.activeFast?.startTs : undefined}
      />

      {state.activeFast && (
        <BreakFastModal
          isOpen={isBreakFastOpen}
          onClose={() => setIsBreakFastOpen(false)}
          activeFast={state.activeFast}
          currentStreak={stats.streak}
          onConfirmBreak={handleBreakFast}
        />
      )}

      <SystemModal
        isOpen={systemModal.isOpen}
        onClose={() => setSystemModal((prev) => ({ ...prev, isOpen: false }))}
        newLevel={systemModal.newLevel}
        newRank={systemModal.newRank}
        rankTitle={systemModal.rankTitle}
        isRankUp={systemModal.isRankUp}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={state.settings}
        onUpdateSettings={(newSettings) => {
          updateState((prev) => ({ ...prev, settings: newSettings }));
        }}
      />

      <PixelConfetti
        active={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />
    </div>
  );
}
