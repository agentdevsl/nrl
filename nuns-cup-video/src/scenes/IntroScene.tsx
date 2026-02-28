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

const { fontFamily: bebasNeue } = loadBebasNeue();

const PARTICLE_COUNT = 20;

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  opacity: number;
  hue: number;
}

const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  speed: 0.5 + Math.random() * 1.5,
  drift: Math.random() * 2 - 1,
  opacity: 0.3 + Math.random() * 0.7,
  hue: Math.random() > 0.5 ? 0 : 20, // red or orange shift
}));

const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Glow pulse (frames 15-30) ---
  const glowOpacity = interpolate(frame, [15, 22, 30], [0, 0.6, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- NUNS text slam from left (frames 25-50) ---
  const nunsSpring = spring({
    frame: frame - 25,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const nunsX = interpolate(nunsSpring, [0, 1], [-1200, 0]);
  const nunsOpacity = interpolate(frame, [25, 28], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- CUP text slam from right (frames 25-50) ---
  const cupSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const cupX = interpolate(cupSpring, [0, 1], [1200, 0]);
  const cupOpacity = interpolate(frame, [28, 31], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Screen shake (frames 30-45) ---
  const shakeIntensity = interpolate(frame, [30, 45], [8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shakeX =
    frame >= 30 && frame <= 45
      ? Math.sin(frame * 25) * shakeIntensity
      : 0;
  const shakeY =
    frame >= 30 && frame <= 45
      ? Math.cos(frame * 30) * shakeIntensity * 0.6
      : 0;

  // --- White flash (frames 50-60) ---
  const flashOpacity = interpolate(frame, [50, 54, 60], [0, 0.8, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Camera push in (frames 60-90) ---
  const pushScale = interpolate(frame, [60, 90], [1, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // --- Particle visibility (start appearing around frame 25) ---
  const particleGlobalOpacity = interpolate(frame, [20, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* Animated container with shake and push-in */}
      <AbsoluteFill
        style={{
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${pushScale})`,
        }}
      >
        {/* Center glow pulse */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at 50% 50%, rgba(255,69,0,${glowOpacity}) 0%, rgba(255,30,0,${glowOpacity * 0.5}) 30%, transparent 70%)`,
          }}
        />

        {/* Particles */}
        {particles.map((p, i) => {
          const yOffset = ((frame * p.speed * 1.5) % 120) - 10;
          const xDrift = Math.sin(frame * 0.05 * p.drift + i) * 15;
          const py = 100 - yOffset;
          const px = p.x + xDrift;
          const pOpacity =
            particleGlobalOpacity *
            p.opacity *
            interpolate(py, [0, 10, 80, 100], [0, 1, 1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${px}%`,
                top: `${py}%`,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                backgroundColor:
                  p.hue > 10
                    ? `rgba(255, 140, 0, ${pOpacity})`
                    : `rgba(255, 69, 0, ${pOpacity})`,
                boxShadow: `0 0 ${p.size * 2}px rgba(255, 69, 0, ${pOpacity * 0.8})`,
                pointerEvents: "none",
              }}
            />
          );
        })}

        {/* NUNS text */}
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 30,
            }}
          >
            <div
              style={{
                fontFamily: bebasNeue,
                fontSize: 200,
                color: "white",
                transform: `translateX(${nunsX}px)`,
                opacity: nunsOpacity,
                textShadow:
                  "0 0 40px rgba(255,69,0,0.8), 0 0 80px rgba(255,69,0,0.4), 0 0 120px rgba(255,30,0,0.2)",
                letterSpacing: 10,
                lineHeight: 1,
              }}
            >
              NUNS
            </div>
            <div
              style={{
                fontFamily: bebasNeue,
                fontSize: 200,
                color: "white",
                transform: `translateX(${cupX}px)`,
                opacity: cupOpacity,
                textShadow:
                  "0 0 40px rgba(255,69,0,0.8), 0 0 80px rgba(255,69,0,0.4), 0 0 120px rgba(255,30,0,0.2)",
                letterSpacing: 10,
                lineHeight: 1,
              }}
            >
              CUP
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>

      {/* White flash overlay */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 255, 255, ${flashOpacity})`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export default IntroScene;
export { IntroScene };
