import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";
import { loadFont } from "@remotion/google-fonts/Oswald";

const { fontFamily: bebasNeue } = loadBebasNeue();
const { fontFamily: oswald } = loadFont();

// --- Gold rain particles (background) ---
const RAIN_COUNT = 18;

interface RainParticle {
  x: number;
  startY: number;
  speed: number;
  size: number;
  opacity: number;
  drift: number;
}

const rainParticles: RainParticle[] = Array.from(
  { length: RAIN_COUNT },
  (_, i) => ({
    x: (i / RAIN_COUNT) * 100 + (Math.sin(i * 7.3) * 5),
    startY: -(Math.random() * 30),
    speed: 0.8 + Math.random() * 1.2,
    size: 2 + Math.random() * 3,
    opacity: 0.3 + Math.random() * 0.5,
    drift: Math.random() * 2 - 1,
  })
);

// --- Confetti particles ---
const CONFETTI_COUNT = 30;
const CONFETTI_COLORS = [
  "#FFD700",
  "#FFFFFF",
  "#FF8C00",
  "#FFD700",
  "#FFA500",
  "#FFFFFF",
  "#FFD700",
];

interface ConfettiParticle {
  x: number;
  startY: number;
  speed: number;
  width: number;
  height: number;
  rotationSpeed: number;
  rotationOffset: number;
  color: string;
  driftFreq: number;
  driftAmp: number;
}

const confettiParticles: ConfettiParticle[] = Array.from(
  { length: CONFETTI_COUNT },
  (_, i) => ({
    x: Math.random() * 100,
    startY: -(Math.random() * 40 + 10),
    speed: 1.0 + Math.random() * 2.0,
    width: 6 + Math.random() * 10,
    height: 4 + Math.random() * 6,
    rotationSpeed: 3 + Math.random() * 8,
    rotationOffset: Math.random() * 360,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    driftFreq: 0.02 + Math.random() * 0.04,
    driftAmp: 10 + Math.random() * 20,
  })
);

const ChampionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- White flash from race scene (frame 0-10) ---
  const flashOpacity = interpolate(frame, [0, 10], [0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // --- CHAMPION text spring bounce (frame 10-40) ---
  const championSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 8, stiffness: 150 },
  });
  const championScale = interpolate(championSpring, [0, 1], [0, 1]);
  const championOpacity = interpolate(frame, [10, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- "NUNS CUP 100M" subtitle (frame 20-50) ---
  const subtitleOpacity = interpolate(frame, [20, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- "WORLD RECORD" text reveal (frame 40-70) ---
  const worldRecordProgress = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const worldRecordClip = interpolate(worldRecordProgress, [0, 1], [100, 0]);
  const worldRecordOpacity = interpolate(frame, [40, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Fade out (frame 90-120) ---
  const fadeOut = interpolate(frame, [90, 120], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Gold rain particle visibility ---
  const rainGlobalOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Confetti visibility (frame 50-120) ---
  const confettiOpacity = interpolate(
    frame,
    [50, 55, 100, 120],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* Master fade-out wrapper */}
      <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* Gold rain particles (background) */}
        {rainParticles.map((p, i) => {
          const yPos = p.startY + frame * p.speed * 1.2;
          const xDrift = Math.sin(frame * 0.03 * p.drift + i * 2) * 8;
          const pOpacity =
            rainGlobalOpacity *
            p.opacity *
            interpolate(yPos, [-10, 5, 85, 105], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

          return (
            <div
              key={`rain-${i}`}
              style={{
                position: "absolute",
                left: `${p.x + xDrift}%`,
                top: `${yPos}%`,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                backgroundColor: `rgba(255, 215, 0, ${pOpacity})`,
                boxShadow: `0 0 ${p.size * 3}px rgba(255, 215, 0, ${pOpacity * 0.6})`,
                pointerEvents: "none",
              }}
            />
          );
        })}

        {/* Center content */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {/* CHAMPION text */}
          <div
            style={{
              fontFamily: bebasNeue,
              fontSize: 180,
              color: "#FFD700",
              transform: `scale(${championScale})`,
              opacity: championOpacity,
              textShadow:
                "0 0 40px rgba(255,215,0,0.6), 0 0 80px rgba(255,215,0,0.3), 0 4px 8px rgba(0,0,0,0.8)",
              letterSpacing: 12,
              lineHeight: 1,
              marginBottom: 10,
            }}
          >
            CHAMPION
          </div>

          {/* NUNS CUP 100M subtitle */}
          <div
            style={{
              fontFamily: oswald,
              fontSize: 48,
              color: "white",
              opacity: subtitleOpacity,
              letterSpacing: 6,
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              marginBottom: 20,
            }}
          >
            NUNS CUP 100M
          </div>

          {/* WORLD RECORD text with clip reveal */}
          <div
            style={{
              fontFamily: bebasNeue,
              fontSize: 64,
              fontWeight: 700,
              color: "#FF0000",
              opacity: worldRecordOpacity,
              clipPath: `inset(0 ${worldRecordClip}% 0 0)`,
              textShadow:
                "0 0 20px rgba(255,0,0,0.5), 0 0 40px rgba(255,0,0,0.3)",
              letterSpacing: 8,
            }}
          >
            WORLD RECORD
          </div>
        </AbsoluteFill>

        {/* Confetti particles (frame 50+) */}
        {confettiParticles.map((p, i) => {
          const localFrame = frame - 50;
          if (localFrame < 0) return null;

          const yPos = p.startY + localFrame * p.speed * 1.5;
          const xDrift =
            Math.sin(localFrame * p.driftFreq + i) * p.driftAmp;
          const rotation =
            p.rotationOffset + localFrame * p.rotationSpeed;
          const pOpacity =
            confettiOpacity *
            interpolate(yPos, [-20, 0, 80, 110], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

          return (
            <div
              key={`confetti-${i}`}
              style={{
                position: "absolute",
                left: `${p.x + xDrift * 0.3}%`,
                top: `${yPos}%`,
                width: p.width,
                height: p.height,
                backgroundColor: p.color,
                opacity: pOpacity,
                transform: `rotate(${rotation}deg)`,
                borderRadius: 1,
                pointerEvents: "none",
              }}
            />
          );
        })}
      </AbsoluteFill>

      {/* White flash overlay (transition from race scene) */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 255, 255, ${flashOpacity})`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export default ChampionScene;
export { ChampionScene };
