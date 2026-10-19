import React, { useState } from 'react';
import { CheckCircle2, Circle, Flame, Activity, Zap, RefreshCw, ShieldCheck, Heart, Sparkles } from 'lucide-react';

interface FastingPhasesTimelineProps {
  elapsedHours: number;
}

const PHASES = [
  {
    phase: 1,
    hours: '0-4h',
    name: 'Digestão & Nutrição',
    min: 0,
    max: 4,
    icon: <Heart className="w-3.5 h-3.5" />,
    cellularState: 'Nível ativo de glicose e insulina.',
    fullDesc: 'O sistema digestivo processa a última refeição. A glicose entra na corrente sanguínea e a insulina atinge o pico normal para estocar energia no fígado e tecidos.',
  },
  {
    phase: 2,
    hours: '4-8h',
    name: 'Queda de Insulina',
    min: 4,
    max: 8,
    icon: <Activity className="w-3.5 h-3.5" />,
    cellularState: 'Uso das reservas de glicogênio hepático.',
    fullDesc: 'A insulina diminui e o corpo passa a queimar o glicogênio armazenado no fígado para manter a energia constante sem picos glicêmicos.',
  },
  {
    phase: 3,
    hours: '8-12h',
    name: 'Transição Metabólica',
    min: 8,
    max: 12,
    icon: <Zap className="w-3.5 h-3.5" />,
    cellularState: 'Esgotamento de glicose e ativação lipídica.',
    fullDesc: 'As reservas de glicogênio hepático se esgotam. O organismo inicia o recrutamento de ácidos graxos do tecido adiposo como combustível principal.',
  },
  {
    phase: 4,
    hours: '12-16h',
    name: 'Cetose & Foco Mental',
    min: 12,
    max: 16,
    icon: <Flame className="w-3.5 h-3.5" />,
    cellularState: 'Produção de corpos cetônicos (BHB).',
    fullDesc: 'A queima de gordura ganha velocidade total. O fígado sintetiza corpos cetônicos para nutrir o cérebro, elevando a saciedade e a clareza mental.',
  },
  {
    phase: 5,
    hours: '16-24h',
    name: 'Autofagia Celular',
    min: 16,
    max: 24,
    icon: <RefreshCw className="w-3.5 h-3.5" />,
    cellularState: 'Faxina e reciclagem de componentes celulares.',
    fullDesc: 'Ativação profunda da autofagia celular (processo Nobel 2016): as células eliminam proteínas defeituosas e reciclam organelas antigas para regeneração.',
  },
  {
    phase: 6,
    hours: '24h+',
    name: 'Renovação Profunda',
    min: 24,
    max: 999,
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    cellularState: 'Pico de hormônio do crescimento (HGH).',
    fullDesc: 'O hormônio do crescimento (HGH) atinge níveis elevados protegendo massa magra, e células-tronco iniciam renovação do sistema imunológico.',
  },
];

export const FastingPhasesTimeline: React.FC<FastingPhasesTimelineProps> = ({
  elapsedHours,
}) => {
  // Encontra a fase ativa atual em curso
  const activePhaseObj = PHASES.find((p) => elapsedHours >= p.min && elapsedHours < p.max) || PHASES[0];

  // Inicia selecionada na fase ATUAL (resolvendo o bug de mostrar Fase 3 enquanto a atual é a 1)
  const [selectedPhase, setSelectedPhase] = useState<number>(activePhaseObj.phase);

  const displayedPhase = PHASES.find((p) => p.phase === selectedPhase) || activePhaseObj;

  return (
    <section aria-label="Jornada Metabólica do Jejum" className="cozy-card p-5 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold font-heading text-primary flex items-center gap-2">
            <span>Jornada Metabólica do Jejum</span>
            <span className="text-xs font-mono text-sage bg-sage-subtle px-2.5 py-0.5 rounded-full border border-subtle">
              {elapsedHours.toFixed(1)}h decorridas
            </span>
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Linha do tempo das transformações celulares e hormonais durante o jejum
          </p>
        </div>

        <div className="text-xs font-semibold text-pumpkin flex items-center gap-1.5 self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-pumpkin" />
          <span>Fase Atual: Fase {activePhaseObj.phase} ({activePhaseObj.name})</span>
        </div>
      </div>

      {/* Stepper Horizontal com Estados Claros (Concluída, Ativa, Futura) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" role="tablist">
        {PHASES.map((p) => {
          const isPassed = elapsedHours >= p.max;
          const isActive = elapsedHours >= p.min && elapsedHours < p.max;
          const isSelected = selectedPhase === p.phase;

          return (
            <button
              key={p.phase}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedPhase(p.phase)}
              className={`p-3 rounded-md border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-pumpkin-subtle border-pumpkin shadow-sm'
                  : isPassed
                  ? 'bg-surface-subtle border-subtle text-secondary hover:border-medium'
                  : 'bg-canvas border-subtle opacity-60 hover:opacity-85 text-tertiary'
              } ${isSelected && !isActive ? 'border-sage' : ''}`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold">
                    {p.hours}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-sage" aria-label="Fase concluída" />
                  ) : isActive ? (
                    <span className="w-2 h-2 rounded-full bg-pumpkin animate-pulse" aria-label="Fase em curso" />
                  ) : (
                    <Circle className="w-3 h-3 text-tertiary" aria-label="Fase futura" />
                  )}
                </div>

                <div className={`text-xs font-bold leading-tight ${isActive ? 'text-pumpkin' : isPassed ? 'text-primary' : 'text-secondary'}`}>
                  {p.name}
                </div>
              </div>

              {isActive ? (
                <span className="mt-2 text-[10px] font-mono font-semibold text-pumpkin uppercase">
                  ● Em curso
                </span>
              ) : isPassed ? (
                <span className="mt-2 text-[10px] font-mono text-sage">
                  ✓ Concluída
                </span>
              ) : (
                <span className="mt-2 text-[10px] font-mono text-tertiary">
                  Futura
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Painel Único de Descrição da Fase Selecionada */}
      <div className="mt-3 p-3.5 rounded-md bg-surface-subtle border border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-primary font-heading">
              Fase {displayedPhase.phase}: {displayedPhase.name} ({displayedPhase.hours})
            </span>
            {displayedPhase.phase === activePhaseObj.phase && (
              <span className="text-[10px] font-mono bg-pumpkin-subtle text-pumpkin px-2 py-0.5 rounded-full border border-pumpkin">
                Em andamento agora
              </span>
            )}
          </div>
          <p className="text-secondary leading-relaxed">
            {displayedPhase.fullDesc}
          </p>
        </div>
      </div>
    </section>
  );
};
