import { useState, useRef, useEffect, useCallback } from 'react';
import type { FC, TouchEvent as ReactTouchEvent, MouseEvent as ReactMouseEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { sound } from '../lib/audio';

interface SlideToConfirmProps {
  label: string;
  confirmedLabel?: string;
  onConfirm: () => void;
  disabled?: boolean;
}

export const SlideToConfirm: FC<SlideToConfirmProps> = ({
  label,
  confirmedLabel = 'Confirmado!',
  onConfirm,
  disabled = false
}) => {
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);

  const handleTouchStart = (e: ReactTouchEvent | ReactMouseEvent) => {
    if (disabled || isConfirmed) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
  };

  const handleTouchMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging || isConfirmed || disabled || !containerRef.current) return;

    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const containerWidth = containerRef.current.clientWidth;
    const maxDrag = containerWidth - 48; // thumb width (44px) + margin (4px)
    const delta = Math.max(0, Math.min(clientX - startXRef.current, maxDrag));
    const progress = maxDrag > 0 ? delta / maxDrag : 0;

    setDragProgress(progress);

    if (progress >= 0.88) {
      setIsConfirmed(true);
      setIsDragging(false);
      setDragProgress(1);
      sound.playSlideConfirm();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([15, 30, 20]);
        } catch {
          // Ignora
        }
      }
      onConfirm();
    }
  }, [isDragging, isConfirmed, disabled, onConfirm]);

  const handleTouchEnd = useCallback(() => {
    if (!isConfirmed) {
      setIsDragging(false);
      setDragProgress(0);
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleTouchMove);
      window.addEventListener('mouseup', handleTouchEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleTouchMove);
      window.removeEventListener('mouseup', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  const thumbOffset = containerRef.current
    ? dragProgress * (containerRef.current.clientWidth - 48)
    : 0;

  return (
    <div
      ref={containerRef}
      className="slide-to-confirm"
      style={{
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div
        className="slide-track-fill"
        style={{
          width: `${Math.max(48, thumbOffset + 44)}px`,
          backgroundColor: isConfirmed ? 'rgba(16, 185, 129, 0.3)' : undefined
        }}
      />

      <div
        className="slide-thumb"
        style={{
          transform: `translateX(${thumbOffset}px)`,
          transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundColor: isConfirmed ? 'var(--emerald-600)' : 'var(--emerald-500)'
        }}
        onMouseDown={handleTouchStart}
        onTouchStart={handleTouchStart}
      >
        {isConfirmed ? (
          <Check size={20} strokeWidth={2.5} />
        ) : (
          <ArrowRight size={20} strokeWidth={2.5} />
        )}
      </div>

      <div
        className="slide-label"
        style={{
          opacity: 1 - dragProgress * 0.9,
          transition: 'opacity 0.15s ease'
        }}
      >
        {isConfirmed ? confirmedLabel : label}
      </div>
    </div>
  );
};
