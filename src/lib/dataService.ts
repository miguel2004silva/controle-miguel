import { supabase, isSupabaseConfigured } from './supabase';
import type { Fast, Profile } from '../types';

export interface AuthUser {
  id: string;
  email: string;
}

const LOCAL_STORAGE_KEY_USER = 'controle_jejum_local_user';
const LOCAL_STORAGE_KEY_FASTS = 'controle_jejum_local_fasts';
const LOCAL_STORAGE_KEY_PROFILE = 'controle_jejum_local_profile';

// Exemplos iniciais realistas para o modo local de teste
function getInitialLocalFasts(userId: string): Fast[] {
  const now = new Date();
  const d1 = new Date(now.getTime() - 2 * 86400000);
  const d2 = new Date(now.getTime() - 4 * 86400000);
  const d3 = new Date(now.getTime() - 6 * 86400000);

  return [
    {
      id: 'fast-demo-1',
      user_id: userId,
      started_at: new Date(d1.setHours(20, 0, 0, 0)).toISOString(),
      ended_at: new Date(d1.getTime() + 16.5 * 3600000).toISOString(),
      goal_hours: 16,
      notes: 'Jejum noturno 16h concluído com facilidade.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'fast-demo-2',
      user_id: userId,
      started_at: new Date(d2.setHours(21, 30, 0, 0)).toISOString(),
      ended_at: new Date(d2.getTime() + 18 * 3600000).toISOString(),
      goal_hours: 18,
      notes: 'Excelente foco mental pela manhã.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'fast-demo-3',
      user_id: userId,
      started_at: new Date(d3.setHours(22, 0, 0, 0)).toISOString(),
      ended_at: new Date(d3.getTime() + 14 * 3600000).toISOString(),
      goal_hours: 16,
      notes: 'Finalizado um pouco antes devido a almoço em família.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
}

class DataService {
  // ==========================================
  // AUTENTICAÇÃO
  // ==========================================
  async getInitialSession(): Promise<{ user: AuthUser | null; profile: Profile | null }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) return { user: null, profile: null };

        const user: AuthUser = {
          id: session.user.id,
          email: session.user.email || 'usuario@exemplo.com'
        };

        const profile = await this.getProfile(user.id);
        return { user, profile };
      } catch {
        return { user: null, profile: null };
      }
    }

    // Modo local / demonstração
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (stored) {
        const user = JSON.parse(stored) as AuthUser;
        const profile = await this.getProfile(user.id);
        return { user, profile };
      }
    } catch {
      // Ignora erro de parse
    }
    return { user: null, profile: null };
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    if (password.length < 8) {
      throw new Error('A senha deve conter no mínimo 8 caracteres.');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('E-mail ou senha incorretos.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Por favor, confirme seu e-mail antes de entrar.');
        }
        throw new Error('Não foi possível entrar. Verifique seus dados.');
      }

      if (!data.user) throw new Error('Usuário não localizado.');

      return {
        id: data.user.id,
        email: data.user.email || email
      };
    }

    // Modo local / demo
    const mockUser: AuthUser = {
      id: 'usr_local_demo',
      email: email.trim().toLowerCase()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(mockUser));
    return mockUser;
  }

  async signUp(email: string, password: string): Promise<{ user: AuthUser; needsConfirmation: boolean }> {
    if (password.length < 8) {
      throw new Error('A senha deve possuir no mínimo 8 caracteres.');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Este endereço de e-mail já está cadastrado.');
        }
        throw new Error('Falha ao criar conta. Tente novamente em alguns instantes.');
      }

      if (!data.user) throw new Error('Erro ao gerar credenciais.');

      const needsConfirmation = !data.session;
      return {
        user: { id: data.user.id, email: data.user.email || email },
        needsConfirmation
      };
    }

    // Modo local / demo
    const mockUser: AuthUser = {
      id: 'usr_local_demo',
      email: email.trim().toLowerCase()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(mockUser));
    
    // Inicia histórico com exemplos realistas
    if (!localStorage.getItem(LOCAL_STORAGE_KEY_FASTS)) {
      localStorage.setItem(LOCAL_STORAGE_KEY_FASTS, JSON.stringify(getInitialLocalFasts(mockUser.id)));
    }

    return { user: mockUser, needsConfirmation: false };
  }

  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
  }

  async resetPassword(email: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/`
      });
      if (error) {
        throw new Error('Erro ao enviar e-mail de recuperação.');
      }
      return;
    }

    // Simulação no modo local
    await new Promise(r => setTimeout(r, 600));
  }

  async updatePassword(newPassword: string): Promise<void> {
    if (newPassword.length < 8) {
      throw new Error('A nova senha deve ter no mínimo 8 caracteres.');
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error('Não foi possível alterar a senha.');
      return;
    }

    await new Promise(r => setTimeout(r, 400));
  }

  // ==========================================
  // PERFIL & PREFERÊNCIAS
  // ==========================================
  async getProfile(userId: string): Promise<Profile> {
    const defaultProfile: Profile = {
      id: userId,
      email: null,
      preferred_goal_hours: 16,
      sound_enabled: true,
      theme: 'system'
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (data) return data as Profile;
        
        // Se ainda não existir perfil no banco, tenta criar
        const { data: created } = await supabase
          .from('profiles')
          .insert({ id: userId, preferred_goal_hours: 16, sound_enabled: true, theme: 'system' })
          .select()
          .maybeSingle();
        
        return (created as Profile) || defaultProfile;
      } catch {
        return defaultProfile;
      }
    }

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROFILE);
      if (stored) return JSON.parse(stored) as Profile;
    } catch {
      // Ignora
    }
    return defaultProfile;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw new Error('Falha ao atualizar preferências.');
      return data as Profile;
    }

    const current = await this.getProfile(userId);
    const updated: Profile = { ...current, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(LOCAL_STORAGE_KEY_PROFILE, JSON.stringify(updated));
    return updated;
  }

  // ==========================================
  // JEJUNS (FASTS)
  // ==========================================
  async getActiveFast(userId: string): Promise<Fast | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('fasts')
        .select('*')
        .is('ended_at', null)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return null;
      return (data as Fast) || null;
    }

    const fasts = this.getLocalFasts(userId);
    const active = fasts.find(f => f.ended_at === null);
    return active || null;
  }

  async startFast(userId: string, startedAt: string, goalHours: number, notes?: string): Promise<Fast> {
    if (goalHours < 1 || goalHours > 72) {
      throw new Error('A meta deve ser entre 1 e 72 horas.');
    }

    // Validação temporal
    const startDate = new Date(startedAt);
    if (isNaN(startDate.getTime())) {
      throw new Error('Horário de início inválido.');
    }

    if (isSupabaseConfigured && supabase) {
      // O user_id é preenchido com default auth.uid() no banco
      const { data, error } = await supabase
        .from('fasts')
        .insert({
          started_at: startDate.toISOString(),
          goal_hours: goalHours,
          notes: notes?.trim() || null
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes('one_active_fast_per_user')) {
          throw new Error('Você já possui um jejum em andamento.');
        }
        throw new Error('Erro ao iniciar jejum.');
      }

      return data as Fast;
    }

    // Local
    const fasts = this.getLocalFasts(userId);
    if (fasts.some(f => f.ended_at === null)) {
      throw new Error('Você já possui um jejum em andamento.');
    }

    const newFast: Fast = {
      id: 'fast_' + Date.now(),
      user_id: userId,
      started_at: startDate.toISOString(),
      ended_at: null,
      goal_hours: goalHours,
      notes: notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    fasts.unshift(newFast);
    this.saveLocalFasts(fasts);
    return newFast;
  }

  async updateActiveFast(fastId: string, updates: { started_at?: string; goal_hours?: number; notes?: string }): Promise<Fast> {
    if (updates.goal_hours !== undefined && (updates.goal_hours < 1 || updates.goal_hours > 72)) {
      throw new Error('A meta deve estar entre 1 e 72 horas.');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('fasts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', fastId)
        .select()
        .single();

      if (error) throw new Error('Não foi possível atualizar o jejum.');
      return data as Fast;
    }

    const fasts = this.getAllLocalFasts();
    const idx = fasts.findIndex(f => f.id === fastId);
    if (idx === -1) throw new Error('Jejum não encontrado.');

    fasts[idx] = {
      ...fasts[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveLocalFasts(fasts);
    return fasts[idx];
  }

  async breakFast(fastId: string, endedAt: string, notes?: string): Promise<Fast> {
    const endDate = new Date(endedAt);
    if (isNaN(endDate.getTime())) {
      throw new Error('Horário de término inválido.');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('fasts')
        .update({
          ended_at: endDate.toISOString(),
          notes: notes?.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', fastId)
        .select()
        .single();

      if (error) throw new Error('Erro ao quebrar jejum.');
      return data as Fast;
    }

    const fasts = this.getAllLocalFasts();
    const idx = fasts.findIndex(f => f.id === fastId);
    if (idx === -1) throw new Error('Jejum não encontrado.');

    fasts[idx] = {
      ...fasts[idx],
      ended_at: endDate.toISOString(),
      notes: notes !== undefined ? (notes?.trim() || null) : fasts[idx].notes,
      updated_at: new Date().toISOString()
    };
    this.saveLocalFasts(fasts);
    return fasts[idx];
  }

  async getHistory(userId: string): Promise<Fast[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('fasts')
        .select('*')
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false });

      if (error) return [];
      return (data as Fast[]) || [];
    }

    return this.getLocalFasts(userId).filter(f => f.ended_at !== null);
  }

  async updatePastFast(fastId: string, updates: { started_at?: string; ended_at?: string; goal_hours?: number; notes?: string }): Promise<Fast> {
    if (updates.goal_hours !== undefined && (updates.goal_hours < 1 || updates.goal_hours > 72)) {
      throw new Error('A meta deve ser entre 1 e 72 horas.');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('fasts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', fastId)
        .select()
        .single();

      if (error) throw new Error('Erro ao atualizar registro.');
      return data as Fast;
    }

    const fasts = this.getAllLocalFasts();
    const idx = fasts.findIndex(f => f.id === fastId);
    if (idx === -1) throw new Error('Registro não encontrado.');

    fasts[idx] = {
      ...fasts[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.saveLocalFasts(fasts);
    return fasts[idx];
  }

  async deleteFast(fastId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('fasts')
        .delete()
        .eq('id', fastId);

      if (error) throw new Error('Não foi possível excluir o jejum.');
      return;
    }

    const fasts = this.getAllLocalFasts().filter(f => f.id !== fastId);
    this.saveLocalFasts(fasts);
  }

  async deleteAllUserData(userId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('fasts')
        .delete()
        .eq('user_id', userId);

      if (error) throw new Error('Falha ao limpar histórico.');
      return;
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY_FASTS);
  }

  // ==========================================
  // HELPERS LOCAIS
  // ==========================================
  private getAllLocalFasts(): Fast[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY_FASTS);
      if (raw) return JSON.parse(raw) as Fast[];
    } catch {
      // Ignora
    }
    return [];
  }

  private getLocalFasts(userId: string): Fast[] {
    const fasts = this.getAllLocalFasts();
    if (fasts.length === 0) {
      const initial = getInitialLocalFasts(userId);
      this.saveLocalFasts(initial);
      return initial;
    }
    return fasts;
  }

  private saveLocalFasts(fasts: Fast[]): void {
    localStorage.setItem(LOCAL_STORAGE_KEY_FASTS, JSON.stringify(fasts));
  }
}

export const dataService = new DataService();
