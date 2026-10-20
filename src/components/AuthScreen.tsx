import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { Eye, EyeOff, ShieldCheck, Zap, Activity, Clock, Lock, Mail, ArrowRight } from 'lucide-react';
import { dataService } from '../lib/dataService';
import type { AuthUser } from '../lib/dataService';
import { isSupabaseConfigured } from '../lib/supabase';
import { sound } from '../lib/audio';
import { useToast } from './Toast';

interface AuthScreenProps {
  onAuthSuccess: (user: AuthUser) => void;
}

export const AuthScreen: FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const { success, error: toastError, info } = useToast();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal Esqueci minha senha
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      sound.playClick();

      if (tab === 'signin') {
        const user = await dataService.signIn(email, password);
        success('Bem-vindo de volta!', `Sessão iniciada como ${user.email}`);
        onAuthSuccess(user);
      } else {
        const result = await dataService.signUp(email, password);
        if (result.needsConfirmation) {
          info('Confirme seu e-mail', 'Enviamos um link de confirmação para sua caixa de entrada.');
          setTab('signin');
        } else {
          success('Conta criada com sucesso!', 'Seu perfil foi configurado.');
          onAuthSuccess(result.user);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha na autenticação.';
      setErrorMessage(msg);
      toastError('Não foi possível continuar', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    try {
      setIsSendingForgot(true);
      await dataService.resetPassword(forgotEmail);
      setForgotSent(true);
      success('E-mail enviado', 'Verifique sua caixa de entrada com as instruções de redefinição.');
    } catch (err: unknown) {
      toastError('Erro ao recuperar senha', 'Verifique o e-mail digitado e tente novamente.');
    } finally {
      setIsSendingForgot(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div
        className="ui-card"
        style={{
          width: '100%',
          maxWidth: '960px',
          padding: 0,
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* COLUNA ESQUERDA: APRESENTAÇÃO INSTITUCIONAL DA MARCA (DESKTOP) */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRight: '1px solid var(--border-subtle)'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--emerald-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF'
                }}
              >
                <Clock size={20} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Controle de Jejum
              </span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Sua saúde metabólica com precisão analítica.
            </h1>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Monitore seus ciclos de jejum intermitente em tempo real. Registros seguros na nuvem protegidos por Row Level Security (RLS) e sincronizados em qualquer dispositivo.
            </p>

            {/* Diferenciais em lista limpa */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', color: 'var(--emerald-500)', flexShrink: 0 }}>
                  <Zap size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Contagem em Milissegundos</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Calculado a partir de timestamps UTC estritos, nunca defasado ao fechar a aba.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', color: 'var(--emerald-500)', flexShrink: 0 }}>
                  <Activity size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Fases Biológicas Reais</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Acompanhe a transição glicêmica, queima de gordura e autofagia celular.</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface)', color: 'var(--emerald-500)', flexShrink: 0 }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Isolamento Criptográfico RLS</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Políticas no Postgres garantem que nenhum usuário tenha acesso aos seus dados.</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>PWA Instalável • Vercel Ready</span>
            <span>Supabase v2</span>
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO DE AUTENTICAÇÃO */}
        <div style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Alerta de demonstração se Supabase ainda não estiver com chaves preenchidas */}
          {!isSupabaseConfigured && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)'
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--emerald-600)', marginBottom: '0.2rem' }}>
                Modo Demonstração Ativo
              </div>
              Você pode se cadastrar ou entrar com qualquer e-mail de teste. Para persistência em nuvem, adicione as chaves no <code style={{ color: 'var(--text-primary)' }}>.env</code>.
            </div>
          )}

          {/* Abas Entrar / Criar Conta (MicroKit style) */}
          <div className="tabs-container" style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className={`tab-btn ${tab === 'signin' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setTab('signin'); setErrorMessage(''); }}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
              onClick={() => { sound.playClick(); setTab('signup'); setErrorMessage(''); }}
            >
              Criar conta
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {tab === 'signin' ? 'Acesse seu painel' : 'Comece gratuitamente'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {tab === 'signin'
                ? 'Insira suas credenciais para continuar seu acompanhamento.'
                : 'Cadastre-se para registrar refeições e sincronizar seu histórico.'}
            </p>
          </div>

          {errorMessage && (
            <div
              style={{
                padding: '0.625rem 0.875rem',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--danger-text)',
                fontSize: '0.8125rem',
                marginBottom: '1.25rem'
              }}
            >
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <Mail size={14} />
                E-mail
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <Lock size={14} />
                  Senha
                </label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(true)}
                    style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--emerald-600)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
            >
              {isLoading ? (
                'Processando...'
              ) : (
                <>
                  <span>{tab === 'signin' ? 'Entrar no Sistema' : 'Criar Conta Grátis'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL DE RECUPERAÇÃO DE SENHA */}
      {isForgotOpen && (
        <div className="modal-backdrop" onClick={() => setIsForgotOpen(false)}>
          <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Recuperação de Senha
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Digite seu e-mail cadastrado para receber o link seguro de redefinição de senha.
            </p>

            {forgotSent ? (
              <div>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--emerald-50)', border: '1px solid var(--emerald-100)', borderRadius: 'var(--radius-md)', color: 'var(--emerald-600)', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                  E-mail enviado! Verifique sua caixa de entrada e siga as instruções.
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => { setIsForgotOpen(false); setForgotSent(false); }}
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="email"
                  className="input-field"
                  placeholder="seu.email@exemplo.com"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsForgotOpen(false)}
                    disabled={isSendingForgot}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSendingForgot}
                  >
                    {isSendingForgot ? 'Enviando...' : 'Enviar Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
