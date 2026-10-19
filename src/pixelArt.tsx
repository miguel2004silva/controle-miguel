import React from 'react';
import type { PlantType, GrowthStage, HunterRank } from './types';

// Pixel Art SVGs with shape-rendering="crispEdges"
// Creates authentic Stardew Valley 8-bit / 16-bit cozy retro feel!

interface PixelIconProps {
  size?: number;
  className?: string;
}

export const PixelWaterDrop: React.FC<PixelIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={`pixel-art ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="7" y="2" width="2" height="2" fill="#2980b9" />
    <rect x="6" y="4" width="4" height="2" fill="#3498db" />
    <rect x="5" y="6" width="6" height="3" fill="#3498db" />
    <rect x="4" y="9" width="8" height="4" fill="#5dade2" />
    <rect x="5" y="13" width="6" height="1" fill="#2980b9" />
    {/* Highlight */}
    <rect x="6" y="8" width="2" height="3" fill="#ffffff" opacity="0.8" />
  </svg>
);

export const PixelHeart: React.FC<PixelIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={`pixel-art ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="3" y="3" width="4" height="2" fill="#c0392b" />
    <rect x="9" y="3" width="4" height="2" fill="#c0392b" />
    <rect x="2" y="5" width="12" height="3" fill="#e74c3c" />
    <rect x="3" y="8" width="10" height="2" fill="#e74c3c" />
    <rect x="4" y="10" width="8" height="2" fill="#c0392b" />
    <rect x="6" y="12" width="4" height="2" fill="#c0392b" />
    <rect x="7" y="14" width="2" height="1" fill="#962d22" />
    {/* Shine */}
    <rect x="4" y="5" width="2" height="2" fill="#ffffff" opacity="0.7" />
  </svg>
);

export const PixelClock: React.FC<PixelIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={`pixel-art ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="5" y="2" width="6" height="2" fill="#5b3a1e" />
    <rect x="3" y="4" width="10" height="2" fill="#8b5a2b" />
    <rect x="2" y="6" width="12" height="6" fill="#fff4d6" />
    <rect x="3" y="12" width="10" height="2" fill="#8b5a2b" />
    <rect x="5" y="14" width="6" height="1" fill="#5b3a1e" />
    {/* Outer border dark */}
    <rect x="2" y="6" width="1" height="6" fill="#5b3a1e" />
    <rect x="13" y="6" width="1" height="6" fill="#5b3a1e" />
    {/* Clock hands */}
    <rect x="7" y="6" width="2" height="3" fill="#3b2412" />
    <rect x="7" y="8" width="4" height="2" fill="#3b2412" />
  </svg>
);

export const PixelWheat: React.FC<PixelIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={`pixel-art ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="7" y="1" width="2" height="2" fill="#f1c40f" />
    <rect x="5" y="3" width="2" height="2" fill="#e8b923" />
    <rect x="9" y="3" width="2" height="2" fill="#e8b923" />
    <rect x="7" y="4" width="2" height="3" fill="#d9772b" />
    <rect x="4" y="6" width="3" height="2" fill="#e8b923" />
    <rect x="9" y="6" width="3" height="2" fill="#e8b923" />
    <rect x="7" y="7" width="2" height="3" fill="#d9772b" />
    <rect x="5" y="9" width="2" height="2" fill="#e8b923" />
    <rect x="9" y="9" width="2" height="2" fill="#e8b923" />
    <rect x="7" y="10" width="2" height="5" fill="#4f8a3c" />
  </svg>
);

export const PixelScroll: React.FC<PixelIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={`pixel-art ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="3" y="2" width="10" height="2" fill="#8b5a2b" />
    <rect x="4" y="4" width="8" height="8" fill="#f3e2b3" />
    <rect x="3" y="12" width="10" height="2" fill="#8b5a2b" />
    <rect x="2" y="3" width="2" height="2" fill="#5b3a1e" />
    <rect x="12" y="3" width="2" height="2" fill="#5b3a1e" />
    <rect x="2" y="11" width="2" height="2" fill="#5b3a1e" />
    <rect x="12" y="11" width="2" height="2" fill="#5b3a1e" />
    {/* Ink writing */}
    <rect x="5" y="6" width="5" height="1" fill="#78532f" />
    <rect x="5" y="8" width="6" height="1" fill="#78532f" />
    <rect x="5" y="10" width="4" height="1" fill="#78532f" />
  </svg>
);

export const PixelTrophy: React.FC<PixelIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={`pixel-art ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="4" y="2" width="8" height="2" fill="#f1c40f" />
    <rect x="2" y="4" width="12" height="4" fill="#f39c12" />
    <rect x="2" y="4" width="2" height="3" fill="#e8b923" />
    <rect x="12" y="4" width="2" height="3" fill="#e8b923" />
    <rect x="4" y="8" width="8" height="2" fill="#f39c12" />
    <rect x="6" y="10" width="4" height="2" fill="#d9772b" />
    <rect x="7" y="12" width="2" height="2" fill="#8b5a2b" />
    <rect x="4" y="14" width="8" height="2" fill="#5b3a1e" />
    {/* Star inside */}
    <rect x="7" y="5" width="2" height="2" fill="#ffffff" />
  </svg>
);

export const PixelGear: React.FC<PixelIconProps> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    className={`pixel-art ${className}`}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect x="7" y="1" width="2" height="2" fill="#5b3a1e" />
    <rect x="7" y="13" width="2" height="2" fill="#5b3a1e" />
    <rect x="1" y="7" width="2" height="2" fill="#5b3a1e" />
    <rect x="13" y="7" width="2" height="2" fill="#5b3a1e" />
    <rect x="4" y="4" width="8" height="8" fill="#8b5a2b" />
    <rect x="6" y="6" width="4" height="4" fill="#fff4d6" />
    <rect x="7" y="7" width="2" height="2" fill="#5b3a1e" />
  </svg>
);

// Rank Badge (Solo Leveling inspired Rank Crest)
export const PixelRankBadge: React.FC<{ rank: HunterRank; size?: number }> = ({ rank, size = 32 }) => {
  const rankColors: Record<HunterRank, { bg: string; border: string; text: string }> = {
    E: { bg: '#8b5a2b', border: '#4a2e18', text: '#fff4d6' },
    D: { bg: '#4f8a3c', border: '#2d5320', text: '#fff4d6' },
    C: { bg: '#2980b9', border: '#1a5276', text: '#fff4d6' },
    B: { bg: '#8e44ad', border: '#5b2c6f', text: '#fff4d6' },
    A: { bg: '#d35400', border: '#873600', text: '#fff4d6' },
    S: { bg: '#f1c40f', border: '#b7950b', text: '#3b2412' },
  };

  const c = rankColors[rank] || rankColors.E;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className="pixel-art inline-block"
      style={{ shapeRendering: 'crispEdges' }}
    >
      <rect x="4" y="2" width="12" height="2" fill={c.border} />
      <rect x="2" y="4" width="16" height="12" fill={c.border} />
      <rect x="4" y="16" width="12" height="2" fill={c.border} />
      <rect x="4" y="4" width="12" height="12" fill={c.bg} />
      {/* Corner cutouts */}
      <rect x="4" y="4" width="1" height="1" fill={c.border} />
      <rect x="15" y="4" width="1" height="1" fill={c.border} />
      <rect x="4" y="15" width="1" height="1" fill={c.border} />
      <rect x="15" y="15" width="1" height="1" fill={c.border} />
      {/* Text representation */}
      <text
        x="10"
        y="13"
        fill={c.text}
        fontSize="10"
        fontFamily="'Silkscreen', 'Pixelify Sans', monospace"
        fontWeight="bold"
        textAnchor="middle"
      >
        {rank}
      </text>
    </svg>
  );
};

// Animated Chicken Component (Bobbing & Pecking)
export const PixelChicken: React.FC<{ isNight?: boolean }> = ({ isNight = false }) => (
  <div className={`pixel-chicken ${isNight ? 'chicken-sleeping' : 'chicken-walking'}`}>
    <svg
      width="32"
      height="32"
      viewBox="0 0 16 16"
      className="pixel-art"
      style={{ shapeRendering: 'crispEdges' }}
    >
      {/* Body White */}
      <rect x="4" y="6" width="7" height="6" fill="#fdfefe" />
      <rect x="3" y="7" width="8" height="4" fill="#fdfefe" />
      {/* Head */}
      <rect x="9" y="4" width="4" height="4" fill="#fdfefe" />
      {/* Comb Red */}
      <rect x="10" y="2" width="3" height="2" fill="#c0392b" />
      {/* Beak Orange */}
      <rect x="13" y="6" width="2" height="2" fill="#e67e22" />
      {/* Eye Black */}
      <rect x="11" y="5" width="1" height="1" fill="#1b2631" />
      {/* Wing shading */}
      <rect x="5" y="8" width="4" height="3" fill="#e2e4e6" />
      {/* Tail Feathers */}
      <rect x="2" y="6" width="2" height="2" fill="#e2e4e6" />
      {/* Legs Orange */}
      <rect x="6" y="12" width="1" height="3" fill="#d35400" />
      <rect x="8" y="12" width="1" height="3" fill="#d35400" />
      <rect x="5" y="14" width="2" height="1" fill="#d35400" />
      <rect x="7" y="14" width="2" height="1" fill="#d35400" />
    </svg>
  </div>
);

// Cozy Farmhouse Sprite
export const PixelFarmHouse: React.FC<{ isNight?: boolean }> = ({ isNight = false }) => (
  <div className="relative inline-block">
    <svg
      width="84"
      height="72"
      viewBox="0 0 42 36"
      className="pixel-art"
      style={{ shapeRendering: 'crispEdges' }}
    >
      {/* Chimney */}
      <rect x="30" y="4" width="5" height="10" fill="#78281f" />
      <rect x="29" y="3" width="7" height="2" fill="#512e2e" />

      {/* Roof Dark Red / Wood */}
      <rect x="18" y="6" width="6" height="2" fill="#922b21" />
      <rect x="15" y="8" width="12" height="2" fill="#922b21" />
      <rect x="12" y="10" width="18" height="2" fill="#922b21" />
      <rect x="9" y="12" width="24" height="2" fill="#922b21" />
      <rect x="6" y="14" width="30" height="2" fill="#7b241c" />
      <rect x="4" y="16" width="34" height="2" fill="#641e16" />

      {/* House Body Wood */}
      <rect x="8" y="18" width="26" height="16" fill="#8b5a2b" />
      {/* Planks Shading */}
      <rect x="8" y="22" width="26" height="1" fill="#5b3a1e" />
      <rect x="8" y="27" width="26" height="1" fill="#5b3a1e" />
      <rect x="8" y="32" width="26" height="1" fill="#5b3a1e" />

      {/* Door */}
      <rect x="12" y="24" width="6" height="10" fill="#5b3a1e" />
      <rect x="13" y="25" width="4" height="9" fill="#3e230f" />
      <rect x="15" y="29" width="1" height="1" fill="#f1c40f" />

      {/* Window */}
      <rect x="23" y="22" width="7" height="7" fill="#5b3a1e" />
      <rect
        x="24"
        y="23"
        width="5"
        height="5"
        fill={isNight ? '#f39c12' : '#85c1e9'}
      />
      {/* Window Cross */}
      <rect x="26" y="23" width="1" height="5" fill="#5b3a1e" />
      <rect x="24" y="25" width="5" height="1" fill="#5b3a1e" />
      {/* Window Glow at night */}
      {isNight && (
        <rect x="24" y="23" width="2" height="2" fill="#fef9e7" opacity="0.9" />
      )}
    </svg>
    {/* Animated Chimney Smoke */}
    <div className="chimney-smoke" />
  </div>
);

// Crop rendering across 5 growth stages + wilted stage
export const PixelCrop: React.FC<{
  plant: PlantType;
  stage: GrowthStage;
  size?: number;
}> = ({ plant, stage, size = 64 }) => {
  // Common Stage 1: Seed in Soil
  if (stage === 'seed') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="pixel-art"
        style={{ shapeRendering: 'crispEdges' }}
      >
        {/* Tilled soil mound */}
        <rect x="4" y="16" width="16" height="6" fill="#4a2e18" />
        <rect x="2" y="18" width="20" height="4" fill="#3e230f" />
        <rect x="6" y="14" width="12" height="3" fill="#6d4624" />
        {/* Hole */}
        <rect x="10" y="15" width="4" height="2" fill="#2a1708" />
        {/* Tiny seed */}
        <rect
          x="11"
          y="15"
          width="2"
          height="1"
          fill={plant === 'starfruit' ? '#f1c40f' : '#e59866'}
        />
      </svg>
    );
  }

  // Common Stage 2: Tiny Green Sprout
  if (stage === 'sprout') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="pixel-art"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="4" y="16" width="16" height="6" fill="#4a2e18" />
        <rect x="2" y="18" width="20" height="4" fill="#3e230f" />
        <rect x="6" y="14" width="12" height="3" fill="#6d4624" />
        {/* Sprout Stem */}
        <rect x="11" y="10" width="2" height="5" fill="#4f8a3c" />
        {/* Leaves */}
        <rect x="9" y="9" width="2" height="2" fill="#8cc152" />
        <rect x="13" y="9" width="2" height="2" fill="#8cc152" />
      </svg>
    );
  }

  // Wilted state (if fast was broken early)
  if (stage === 'wilted') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="pixel-art"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="4" y="16" width="16" height="6" fill="#4a2e18" />
        <rect x="2" y="18" width="20" height="4" fill="#3e230f" />
        <rect x="6" y="14" width="12" height="3" fill="#6d4624" />
        {/* Wilted brown/olive stem bending down */}
        <rect x="11" y="12" width="2" height="3" fill="#7d6608" />
        <rect x="13" y="14" width="3" height="2" fill="#7d6608" />
        <rect x="15" y="15" width="2" height="3" fill="#5b4807" />
        <rect x="8" y="15" width="3" height="2" fill="#7d6608" />
      </svg>
    );
  }

  // Specific Plants for Stage 3 (Growing), Stage 4 (Mature), Stage 5 (Ready)
  if (plant === 'carrot') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="pixel-art"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="4" y="16" width="16" height="6" fill="#4a2e18" />
        <rect x="2" y="18" width="20" height="4" fill="#3e230f" />
        <rect x="6" y="14" width="12" height="3" fill="#6d4624" />
        {/* Foliage */}
        <rect x="8" y="6" width="3" height="6" fill="#4f8a3c" />
        <rect x="13" y="6" width="3" height="6" fill="#4f8a3c" />
        <rect x="10" y="4" width="4" height="8" fill="#8cc152" />
        {/* Carrot Tip poking out */}
        {(stage === 'mature' || stage === 'ready') && (
          <>
            <rect x="10" y="12" width="4" height="4" fill="#e67e22" />
            <rect x="11" y="16" width="2" height="2" fill="#d35400" />
          </>
        )}
        {/* Golden glow sparkles for Ready */}
        {stage === 'ready' && (
          <>
            <rect x="3" y="5" width="2" height="2" fill="#f1c40f" className="pixel-sparkle" />
            <rect x="19" y="8" width="2" height="2" fill="#f1c40f" className="pixel-sparkle" />
            <rect x="11" y="1" width="2" height="2" fill="#f1c40f" className="pixel-sparkle" />
          </>
        )}
      </svg>
    );
  }

  if (plant === 'potato') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="pixel-art"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="4" y="16" width="16" height="6" fill="#4a2e18" />
        <rect x="2" y="18" width="20" height="4" fill="#3e230f" />
        <rect x="6" y="14" width="12" height="3" fill="#6d4624" />
        {/* Bushy Potato Leaves */}
        <rect x="6" y="8" width="12" height="7" fill="#386b2b" />
        <rect x="8" y="6" width="8" height="3" fill="#4f8a3c" />
        <rect x="7" y="9" width="3" height="3" fill="#8cc152" />
        <rect x="14" y="9" width="3" height="3" fill="#8cc152" />
        {/* Flowers */}
        <rect x="11" y="5" width="2" height="2" fill="#ffffff" />
        <rect x="11" y="6" width="1" height="1" fill="#f1c40f" />
        {/* Potatoes peeking out */}
        {(stage === 'mature' || stage === 'ready') && (
          <>
            <rect x="5" y="15" width="4" height="3" fill="#d4a373" />
            <rect x="15" y="15" width="4" height="3" fill="#c48a52" />
          </>
        )}
        {stage === 'ready' && (
          <>
            <rect x="4" y="4" width="2" height="2" fill="#ffd13b" className="pixel-sparkle" />
            <rect x="18" y="7" width="2" height="2" fill="#ffd13b" className="pixel-sparkle" />
          </>
        )}
      </svg>
    );
  }

  if (plant === 'pumpkin') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="pixel-art"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="4" y="16" width="16" height="6" fill="#4a2e18" />
        <rect x="2" y="18" width="20" height="4" fill="#3e230f" />
        <rect x="6" y="14" width="12" height="3" fill="#6d4624" />
        {/* Vines */}
        <rect x="5" y="11" width="14" height="3" fill="#386b2b" />
        <rect x="8" y="8" width="3" height="4" fill="#4f8a3c" />
        <rect x="13" y="8" width="3" height="4" fill="#4f8a3c" />
        {/* Pumpkin Body */}
        {(stage === 'mature' || stage === 'ready') && (
          <>
            <rect x="7" y="10" width="10" height="7" fill="#d9772b" />
            <rect x="6" y="11" width="12" height="5" fill="#e67e22" />
            {/* Ribs */}
            <rect x="9" y="10" width="2" height="6" fill="#c0392b" opacity="0.3" />
            <rect x="13" y="10" width="2" height="6" fill="#c0392b" opacity="0.3" />
            {/* Stem */}
            <rect x="11" y="8" width="2" height="3" fill="#4f8a3c" />
          </>
        )}
        {stage === 'ready' && (
          <>
            <rect x="3" y="7" width="2" height="2" fill="#f1c40f" className="pixel-sparkle" />
            <rect x="19" y="5" width="2" height="2" fill="#f1c40f" className="pixel-sparkle" />
            <rect x="11" y="2" width="2" height="2" fill="#f1c40f" className="pixel-sparkle" />
          </>
        )}
      </svg>
    );
  }

  // Starfruit (Legendary)
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="pixel-art"
      style={{ shapeRendering: 'crispEdges' }}
    >
      <rect x="4" y="16" width="16" height="6" fill="#4a2e18" />
      <rect x="2" y="18" width="20" height="4" fill="#3e230f" />
      <rect x="6" y="14" width="12" height="3" fill="#6d4624" />
      {/* Mystical Stalk */}
      <rect x="11" y="8" width="2" height="7" fill="#27ae60" />
      <rect x="7" y="10" width="4" height="2" fill="#2ecc71" />
      <rect x="13" y="10" width="4" height="2" fill="#2ecc71" />
      {/* Radiant Starfruit */}
      {(stage === 'mature' || stage === 'ready') && (
        <>
          <rect x="10" y="4" width="4" height="4" fill="#f1c40f" />
          <rect x="8" y="6" width="8" height="4" fill="#f39c12" />
          <rect x="7" y="7" width="10" height="2" fill="#f1c40f" />
          <rect x="10" y="10" width="4" height="2" fill="#e67e22" />
          {/* Inner core glow */}
          <rect x="11" y="6" width="2" height="3" fill="#ffffff" />
        </>
      )}
      {stage === 'ready' && (
        <>
          <rect x="2" y="3" width="3" height="3" fill="#f1c40f" className="pixel-sparkle" />
          <rect x="19" y="2" width="3" height="3" fill="#f1c40f" className="pixel-sparkle" />
          <rect x="5" y="12" width="2" height="2" fill="#ffffff" className="pixel-sparkle" />
          <rect x="17" y="12" width="2" height="2" fill="#ffffff" className="pixel-sparkle" />
        </>
      )}
    </svg>
  );
};
