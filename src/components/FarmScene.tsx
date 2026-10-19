import React, { useMemo } from 'react';
import type { ActiveFast, GrowthStage } from '../types';
import { getPlantForHours, PLANT_CONFIGS } from '../types';
import { PixelFarmHouse, PixelChicken, PixelCrop } from '../pixelArt';

interface FarmSceneProps {
  activeFast: ActiveFast | null;
  progressPercent: number;
  themeSetting: 'auto' | 'day' | 'sunset' | 'night';
  onHarvestClick?: () => void;
}

export const FarmScene: React.FC<FarmSceneProps> = ({
  activeFast,
  progressPercent,
  themeSetting,
  onHarvestClick,
}) => {
  // Determine time of day
  const timeOfDay = useMemo(() => {
    if (themeSetting !== 'auto') return themeSetting;
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 7) return 'dawn';
    if (hour >= 7 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19.5) return 'sunset';
    return 'night';
  }, [themeSetting]);

  const isNight = timeOfDay === 'night';

  // Determine crop stage
  const { stage, plantType, plantConfig } = useMemo(() => {
    if (!activeFast) {
      return { stage: null, plantType: null, plantConfig: null };
    }
    const type = getPlantForHours(activeFast.goalHours);
    let s: GrowthStage = 'seed';
    if (progressPercent >= 100) {
      s = 'ready';
    } else if (progressPercent >= 75) {
      s = 'mature';
    } else if (progressPercent >= 45) {
      s = 'growing';
    } else if (progressPercent >= 20) {
      s = 'sprout';
    } else {
      s = 'seed';
    }
    return {
      stage: s,
      plantType: type,
      plantConfig: PLANT_CONFIGS[type],
    };
  }, [activeFast, progressPercent]);

  return (
    <div className={`farm-scene farm-${timeOfDay} relative overflow-hidden select-none`}>
      {/* Dynamic Sky Background */}
      <div className="sky-elements absolute inset-0 pointer-events-none">
        {timeOfDay === 'day' && (
          <>
            <div className="pixel-sun" />
            <div className="pixel-cloud cloud-1" />
            <div className="pixel-cloud cloud-2" />
          </>
        )}
        {timeOfDay === 'sunset' && (
          <>
            <div className="pixel-sun sunset-sun" />
            <div className="pixel-cloud cloud-sunset" />
          </>
        )}
        {timeOfDay === 'dawn' && (
          <>
            <div className="pixel-sun dawn-sun" />
            <div className="pixel-cloud cloud-dawn" />
          </>
        )}
        {isNight && (
          <>
            <div className="pixel-moon" />
            <div className="pixel-star star-1" />
            <div className="pixel-star star-2" />
            <div className="pixel-star star-3" />
            <div className="pixel-star star-4" />
            <div className="pixel-star star-5" />
            {/* Fireflies floating */}
            <div className="firefly firefly-1" />
            <div className="firefly firefly-2" />
            <div className="firefly firefly-3" />
          </>
        )}
      </div>

      {/* Mountain Silhouettes */}
      <div className="farm-mountains absolute bottom-12 w-full" />

      {/* Farm Ground Layer */}
      <div className="farm-ground absolute bottom-0 w-full h-16 flex items-end justify-between px-3 pb-1">
        {/* Farmhouse on the left */}
        <div className="z-10 -mb-1">
          <PixelFarmHouse isNight={isNight} />
        </div>

        {/* Central Crop Patch */}
        <div className="z-20 flex flex-col items-center -mb-2">
          {activeFast && plantType && stage ? (
            <div className="relative group cursor-pointer" onClick={stage === 'ready' ? onHarvestClick : undefined}>
              {/* Ready Glow Ring */}
              {stage === 'ready' && (
                <div className="ready-halo animate-pulse absolute -inset-2 bg-yellow-400/20 border-2 border-yellow-300 border-dashed rounded-none pointer-events-none" />
              )}

              {/* The Crop SVG */}
              <PixelCrop plant={plantType} stage={stage} size={58} />

              {/* Floating Badge on Ready */}
              {stage === 'ready' && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#e8b923] text-[#3b2412] text-[10px] font-bold px-2 py-0.5 border-2 border-[#3b2412] shadow-pixel animate-bounce whitespace-nowrap">
                  PRONTO!
                </div>
              )}
            </div>
          ) : (
            <div className="empty-patch flex flex-col items-center">
              <svg
                width="50"
                height="32"
                viewBox="0 0 24 16"
                className="pixel-art opacity-80"
                style={{ shapeRendering: 'crispEdges' }}
              >
                <rect x="4" y="8" width="16" height="6" fill="#4a2e18" />
                <rect x="2" y="10" width="20" height="4" fill="#3e230f" />
                <rect x="6" y="6" width="12" height="3" fill="#6d4624" />
                {/* Small wooden stake */}
                <rect x="11" y="2" width="2" height="6" fill="#8b5a2b" />
                <rect x="9" y="3" width="6" height="2" fill="#a76d38" />
              </svg>
              <span className="text-[9px] text-[#fff4d6] bg-[#3b2412]/80 px-1 border border-[#8b5a2b] font-pixel">
                Terra arada
              </span>
            </div>
          )}

          {/* Plant Name Label */}
          {activeFast && plantConfig && (
            <div className="mt-0.5 text-[9px] font-pixel text-[#fff4d6] bg-[#3b2412]/90 px-1.5 py-0.2 border border-[#8b5a2b] shadow-pixel">
              {plantConfig.name}
            </div>
          )}
        </div>

        {/* Wandering Chicken on the right */}
        <div className="z-10 -mb-1">
          <PixelChicken isNight={isNight} />
        </div>
      </div>

      {/* Ambient Wooden Fence in front */}
      <div className="farm-fence absolute bottom-0 left-0 right-0 h-3 pointer-events-none" />
    </div>
  );
};
