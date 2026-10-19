import React, { useState, useEffect } from 'react';
import type { HunterRank } from '../types';
import { RANK_INFO } from '../types';
import { sound } from '../audio';
import { Zap, Shield, Sparkles } from 'lucide-react';

interface SystemModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newRank: HunterRank;
  rankTitle: string;
  isRankUp?: boolean;
}

export const SystemModal: React.FC<SystemModalProps> = ({
  isOpen,
  onClose,
  newLevel,
  newRank,
  rankTitle,
  isRankUp = false,
}) => {
  const fullText = isRankUp
    ? `[SISTEMA] PARABÉNS! VOCÊ EVOLUIU SEU RANK PARA O RANK ${newRank}: "${rankTitle.toUpperCase()}"! SUA FAZENDA E CAPACIDADE METABÓLICA EXPANDIRAM!`
    : `[SISTEMA] VOCÊ SUBIU DE NÍVEL! NÍVEL ${newLevel} ALCANÇADO. SUA RESISTÊNCIA E DISCIPLINA CRESCEM A CADA JEJUM!`;

  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setDisplayedText('');
      return;
    }

    sound.playLevelUp();
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx++;
      setDisplayedText(fullText.slice(0, currentIdx));
      if (currentIdx % 2 === 0) {
        sound.playSystemBeep();
      }
      if (currentIdx >= fullText.length) {
        clearInterval(interval);
      }
    }, 22);

    return () => clearInterval(interval);
  }, [isOpen, fullText]);

  if (!isOpen) return null;

  const rankData = RANK_INFO[newRank];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Evolução de Nível">
      <div className="modal-content p-6">
        {/* System Header Banner */}
        <div className="flex items-center justify-center gap-2 py-2 px-4 mb-4 rounded-xl border border-[var(--accent-pumpkin-border)] bg-[var(--accent-pumpkin-subtle)]">
          <Zap className="w-4 h-4 text-[var(--accent-pumpkin)]" />
          <span className="font-heading font-bold text-xs uppercase tracking-widest text-[var(--accent-pumpkin)]">
            [SISTEMA DE EVOLUÇÃO]
          </span>
          <Sparkles className="w-4 h-4 text-[var(--accent-pumpkin)]" />
        </div>

        {/* Level and Rank Badge Display */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface-raised)] border-2 border-[var(--accent-pumpkin)] flex flex-col items-center justify-center shadow-lg shadow-black/40 mb-3">
            <span className="font-mono font-bold text-3xl text-[var(--accent-pumpkin)] leading-none">
              {newRank}
            </span>
            <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase mt-0.5 tracking-wider">
              Rank
            </span>
          </div>

          <div className="font-heading font-bold text-2xl text-[var(--text-primary)] tracking-tight">
            Nível {newLevel}
          </div>
          <div className="text-sm text-[var(--accent-sage)] font-semibold mt-0.5">
            {rankTitle}
          </div>
        </div>

        {/* Typewriter message box */}
        <div className="bg-[var(--bg-surface-subtle)] border border-[var(--border-subtle)] rounded-xl p-4 mb-4 min-h-[76px]">
          <p className="font-mono text-xs text-[var(--accent-sage)] leading-relaxed">
            {displayedText}
            {displayedText.length < fullText.length && (
              <span className="inline-block w-2 h-3 bg-[var(--accent-pumpkin)] ml-1 animate-pulse" />
            )}
          </p>
        </div>

        {/* Perk Box */}
        <div className="bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-xl p-3.5 mb-5 text-xs text-[var(--text-secondary)] flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-[var(--accent-pumpkin)] flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[var(--accent-pumpkin)]">Bônus de Rank: </span>
            <span className="text-[var(--text-primary)]">{rankData.perk}</span>
          </div>
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider"
        >
          Aceitar Recompensa
        </button>
      </div>
    </div>
  );
};
