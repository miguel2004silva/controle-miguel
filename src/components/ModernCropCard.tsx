import React, { useState } from 'react';
import type { PlantType, GrowthStage } from '../types';
import { PLANT_CONFIGS } from '../types';
import { sound } from '../audio';
import { Sparkles, Sun, Moon, CloudSun, Droplets } from 'lucide-react';

interface ModernCropCardProps {
  plantType: PlantType | null;
  stage: GrowthStage | null;
  progressPercent: number;
  timeOfDay: 'dawn' | 'day' | 'sunset' | 'night';
  onHarvest?: () => void;
  onWaterPlant?: () => void;
}

export const ModernCropCard: React.FC<ModernCropCardProps> = ({
  plantType,
  stage,
  progressPercent,
  timeOfDay,
  onHarvest,
  onWaterPlant,
}) => {
  const [wateringEffect, setWateringEffect] = useState(false);
  const config = plantType ? PLANT_CONFIGS[plantType] : null;

  const ambientLabel = {
    dawn: 'Amanhecer no Vale',
    day: 'Dia Ensolarado',
    sunset: 'Pôr do Sol Dourado',
    night: 'Noite Estrelada',
  }[timeOfDay];

  const ambientIcon = {
    dawn: <CloudSun className="w-3.5 h-3.5 text-amber-400" />,
    day: <Sun className="w-3.5 h-3.5 text-sage" />,
    sunset: <Sun className="w-3.5 h-3.5 text-pumpkin" />,
    night: <Moon className="w-3.5 h-3.5 text-blue-300" />,
  }[timeOfDay];

  const handleWaterClick = () => {
    sound.playWater();
    setWateringEffect(true);
    setTimeout(() => setWateringEffect(false), 900);
    if (onWaterPlant) onWaterPlant();
  };

  const isReady = stage === 'ready';

  return (
    <section
      aria-label="Cena da Horta e Cultivo"
      className={`garden-scene garden-scene-${timeOfDay} cozy-card p-5 flex flex-col justify-between h-full relative overflow-hidden`}
    >
      {/* Vagalumes noturnos sutis em CSS */}
      {timeOfDay === 'night' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="firefly-particle" style={{ top: '22%', left: '18%', animationDelay: '0s' }} />
          <div className="firefly-particle" style={{ top: '35%', left: '78%', animationDelay: '1.8s' }} />
          <div className="firefly-particle" style={{ top: '55%', left: '42%', animationDelay: '3.2s' }} />
        </div>
      )}

      {/* Gotas de água da rega (microinteração curta) */}
      {wateringEffect && (
        <div className="absolute inset-0 pointer-events-none z-20 flex justify-center items-center" aria-hidden="true">
          <div className="flex gap-4 animate-bounce">
            <span className="text-petrol text-base">💧</span>
            <span className="text-petrol text-sm mt-2">💧</span>
            <span className="text-petrol text-base">💧</span>
          </div>
        </div>
      )}

      {/* Top Header: Clima e Estágio da Planta */}
      <div className="flex items-center justify-between z-10 mb-2">
        <div className="flex items-center gap-1.5 bg-surface-subtle px-3 py-1 rounded-full border border-subtle text-xs text-secondary">
          {ambientIcon}
          <span>{ambientLabel}</span>
        </div>

        {stage ? (
          <div
            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 border ${
              isReady
                ? 'bg-pumpkin-subtle text-pumpkin border-pumpkin'
                : 'bg-sage-subtle text-sage border-subtle'
            }`}
          >
            {isReady && <Sparkles className="w-3.5 h-3.5" />}
            <span>
              {stage === 'ready'
                ? 'Safra Pronta para Colher!'
                : stage === 'mature'
                ? 'Quase Madura (Estágio 4/5)'
                : stage === 'growing'
                ? 'Planta em Folhagem (Estágio 3/5)'
                : stage === 'sprout'
                ? 'Broto Jovem (Estágio 2/5)'
                : 'Semente na Terra (Estágio 1/5)'}
            </span>
          </div>
        ) : (
          <span className="text-xs text-tertiary">Horta em Descanso</span>
        )}
      </div>

      {/* Área Central da Horta e Plantação */}
      <div className="flex flex-col items-center justify-center my-3 relative z-10 flex-1">
        {plantType && config ? (
          <div className="relative flex flex-col items-center">
            {/* Solo e Sombra no chão */}
            <div className="relative z-10 crop-sway flex flex-col items-center">
              {/* Ilustrações SVG detalhadas com gomos, caule e folhas */}
              {plantType === 'pumpkin' ? (
                <svg width="150" height="150" viewBox="0 0 160 160" fill="none" role="img" aria-label="Abóbora em cultivo">
                  {/* Sombra suave no chão de terra */}
                  <ellipse cx="80" cy="142" rx="55" ry="10" fill="rgba(10, 16, 12, 0.55)" />

                  {/* Gavinha espiralada de abóbora */}
                  <path
                    d="M80 58 C85 45, 95 48, 102 38 C108 30, 114 36, 110 44 C106 50, 98 46, 96 56"
                    stroke="#588B4F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Caule lenhoso arqueado com estrias */}
                  <path
                    d="M74 68 C74 48, 88 40, 84 28 C80 26, 76 34, 76 46 C76 56, 70 65, 74 68 Z"
                    fill="#3F6D38"
                  />
                  <path d="M78 40 Q80 50 78 62" stroke="#2D5227" strokeWidth="1.2" strokeLinecap="round" />

                  {/* Folhas verdes aveludadas com nervuras */}
                  <path
                    d="M55 60 C38 48, 25 58, 28 72 C35 84, 52 75, 58 66 Z"
                    fill="#4D7F44"
                  />
                  <path d="M38 62 Q46 68 54 66" stroke="#689E5E" strokeWidth="1.5" strokeLinecap="round" />

                  <path
                    d="M102 62 C118 48, 132 58, 128 72 C122 84, 105 76, 98 66 Z"
                    fill="#46753D"
                  />
                  <path d="M120 62 Q112 68 102 66" stroke="#689E5E" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Gomos da Abóbora detalhados com camadas e luz natural */}
                  {/* Gomos de fundo */}
                  <ellipse cx="50" cy="104" rx="26" ry="32" fill="#BA5D15" />
                  <ellipse cx="110" cy="104" rx="26" ry="32" fill="#BA5D15" />

                  {/* Gomos intermediários */}
                  <ellipse cx="62" cy="106" rx="28" ry="33" fill="#D96E1A" />
                  <ellipse cx="98" cy="106" rx="28" ry="33" fill="#D96E1A" />

                  {/* Gomo frontal principal com luz suave */}
                  <ellipse cx="80" cy="108" rx="24" ry="34" fill="#E87C24" />

                  {/* Ranhuras e estrias dos gomos */}
                  <path d="M68 76 Q60 106 68 138" stroke="#A84F0E" strokeWidth="2" strokeLinecap="round" />
                  <path d="M92 76 Q100 106 92 138" stroke="#A84F0E" strokeWidth="2" strokeLinecap="round" />
                  <path d="M80 75 Q80 108 80 142" stroke="#BD5C13" strokeWidth="1.5" strokeLinecap="round" />

                  {/* Brilho quente suave no topo do gomo */}
                  <ellipse cx="76" cy="92" rx="10" ry="16" fill="#F49A46" opacity="0.45" />
                </svg>
              ) : plantType === 'carrot' ? (
                <svg width="140" height="140" viewBox="0 0 160 160" fill="none" role="img" aria-label="Cenoura em cultivo">
                  <ellipse cx="80" cy="142" rx="45" ry="9" fill="rgba(10, 16, 12, 0.55)" />
                  {/* Folhagem fresca de cenoura */}
                  <path d="M80 50 C70 30, 52 25, 48 14 C60 18, 70 32, 80 50 Z" fill="#4D7F44" />
                  <path d="M80 50 C80 25, 88 15, 90 8 C92 20, 86 35, 80 50 Z" fill="#689E5E" />
                  <path d="M80 50 C88 30, 108 25, 112 14 C100 18, 90 32, 80 50 Z" fill="#3F6D38" />
                  {/* Raiz de cenoura */}
                  <path d="M64 54 C64 50, 96 50, 96 54 C96 80, 86 122, 80 138 C74 122, 64 80, 64 54 Z" fill="#E87C24" />
                  <path d="M68 68 Q80 72 92 68" stroke="#A84F0E" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M72 86 Q80 89 88 86" stroke="#A84F0E" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M75 106 Q80 108 85 106" stroke="#A84F0E" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : plantType === 'potato' ? (
                <svg width="140" height="140" viewBox="0 0 160 160" fill="none" role="img" aria-label="Batata em cultivo">
                  <ellipse cx="80" cy="142" rx="50" ry="10" fill="rgba(10, 16, 12, 0.55)" />
                  <path d="M80 65 C68 40, 50 42, 45 28 C60 32, 72 48, 80 65 Z" fill="#4D7F44" />
                  <path d="M80 65 C92 40, 110 42, 115 28 C100 32, 88 48, 80 65 Z" fill="#3F6D38" />
                  <ellipse cx="70" cy="108" rx="30" ry="22" fill="#C99452" transform="rotate(-8 70 108)" />
                  <ellipse cx="94" cy="116" rx="26" ry="20" fill="#B58140" transform="rotate(12 94 116)" />
                  <circle cx="62" cy="104" r="2" fill="#694317" opacity="0.5" />
                  <circle cx="78" cy="112" r="2" fill="#694317" opacity="0.5" />
                  <circle cx="96" cy="120" r="2" fill="#694317" opacity="0.5" />
                </svg>
              ) : (
                <svg width="140" height="140" viewBox="0 0 160 160" fill="none" role="img" aria-label="Fruta estrela em cultivo">
                  <ellipse cx="80" cy="142" rx="50" ry="10" fill="rgba(10, 16, 12, 0.55)" />
                  <path d="M80 60 C78 40, 82 25, 80 15 C86 28, 84 45, 80 60 Z" fill="#3F6D38" />
                  <polygon
                    points="80,45 92,72 122,76 99,96 106,126 80,110 54,126 61,96 38,76 68,72"
                    fill="#E0A824"
                    stroke="#F2C94C"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="80" cy="85" r="9" fill="#FFF3CD" opacity="0.85" />
                </svg>
              )}
            </div>

            {/* Botão de colheita quando pronto */}
            {isReady && onHarvest && (
              <button
                type="button"
                onClick={onHarvest}
                className="mt-2 btn-primary py-2 px-4 text-xs font-semibold"
                aria-label="Colher safra pronta"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Colher {config.name}!</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4">
            {/* Terreno fértil em repouso */}
            <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="opacity-70 mb-1">
              <ellipse cx="60" cy="60" rx="50" ry="16" fill="#1C1510" />
              <path d="M25 58 Q60 66 95 58" stroke="#3D291C" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M35 52 Q60 58 85 52" stroke="#2B1E15" strokeWidth="2" strokeLinecap="round" />
              <circle cx="60" cy="46" r="3" fill="#8FBF8A" opacity="0.8" />
            </svg>
            <p className="text-sm font-semibold text-primary">Terra Pronta para Semeadura</p>
            <p className="text-xs text-secondary max-w-xs mt-0.5">
              Ao registrar uma refeição, uma semente é plantada e cresce a cada hora de jejum.
            </p>
          </div>
        )}
      </div>

      {/* Rodapé da Horta: Barra de Maturação e Ação de Regar */}
      <div className="pt-2.5 border-t border-subtle z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-secondary">
            Safra: <b className="text-primary">{config ? config.name : 'Terra arada'}</b>
          </span>
          <span className="font-mono text-sage font-semibold">
            {Math.round(progressPercent)}% maturação
          </span>
        </div>

        {/* Barra de maturação orgânica */}
        <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden border border-subtle" role="progressbar" aria-valuenow={Math.round(progressPercent)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              background: isReady ? 'var(--accent-pumpkin)' : 'var(--accent-sage)',
            }}
          />
        </div>

        {/* Botão de Regar Horta estilizado com o design system (sem azul padrão) */}
        {plantType && onWaterPlant && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-tertiary">Mantenha a terra hidratada</span>
            <button
              type="button"
              onClick={handleWaterClick}
              className="btn-subtle text-petrol flex items-center gap-1.5"
              aria-label="Regar a horta e registrar um copo de água de 250ml"
            >
              <Droplets className="w-3.5 h-3.5 text-petrol" />
              <span>Regar Horta (+250 ml)</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
