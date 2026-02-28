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

const BURST_LINE_COUNT = 16;

interface CountdownNumberProps {
  frame: number;
  fps: number;
  startFrame: number;
  endFrame: number;
  label: string;
  color: string;
  glowColor: string;
}

const CountdownNumber: React.FC<CountdownNumberProps> = ({
  frame,
  fps,
  startFrame,
  endFrame,
  label,
  color,
  glowColor,
}) => {
  const localFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  if (frame < startFrame || frame >= endFrame) return null;

  // Scale: starts at 2, springs down to 1
  const scaleSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 10, stiffness: 160 },
  });
  const scale = interpolate(scaleSpring, [0, 1], [2, 1]);

  // Fade: visible during most of the segment, fades out at end
  const opacity = interpolate(
    localFrame,
    [0, 3, duration - 5, duration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Impact ring - expands outward and fades
  const ringScale = interpolate(localFrame, [0, duration * 0.7], [0.5, 3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  const ringOpacity = interpolate(localFrame, [0, 3, duration * 0.6], [0, 0.6, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      {/* Impact ring */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: `3px solid ${glowColor}`,
            transform: `scale(${ringScale})`,
            opacity: ringOpacity,
            boxShadow: `0 0 20px ${glowColor}, inset 0 0 20px ${glowColor}`,
          }}
        />
      </AbsoluteFill>

      {/* Number */}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontFamily: bebasNeue,
            fontSize: 300,
            color,
            transform: `scale(${scale})`,
            opacity,
            textShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}, 0 0 120px ${glowColor}`,
            lineHeight: 1,
          }}
        >
          {label}
        </div>
      </AbsoluteFill>
    </>
  );
};

const CountdownScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Vignette intensity increases with each count ---
  const vignetteIntensity = interpolate(frame, [0, 20, 40, 55], [0.4, 0.5, 0.65, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing vignette
  const vignettePulse = Math.sin(frame * 0.3) * 0.05;
  const finalVignette = vignetteIntensity + vignettePulse;

  // --- "GO!" animation (frames 55-65) ---
  const goVisible = frame >= 55 && frame < 75;
  const goLocalFrame = frame - 55;

  const goScaleSpring = spring({
    frame: goLocalFrame,
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const goScale = goVisible
    ? interpolate(goScaleSpring, [0, 1], [0, 1]) * 1.5
    : 0;
  // Settle from 1.5 back toward 1
  const goSettleScale = goVisible
    ? interpolate(goLocalFrame, [0, 5, 10], [0, 1.5, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  const goFinalScale = goLocalFrame < 5 ? goScale : goSettleScale;

  const goOpacity = goVisible
    ? interpolate(goLocalFrame, [0, 3, 15, 20], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // --- Screen flash on GO! (frame 55-60) ---
  const goFlashOpacity = interpolate(frame, [55, 57, 62], [0, 0.7, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Radial burst lines on GO! ---
  const burstProgress = goVisible
    ? interpolate(goLocalFrame, [0, 12], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
      })
    : 0;
  const burstOpacity = goVisible
    ? interpolate(goLocalFrame, [0, 3, 10, 15], [0, 0.8, 0.4, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  // --- Fade out (frames 65-75) ---
  const fadeOut = interpolate(frame, [65, 75], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        overflow: "hidden",
        opacity: fadeOut,
      }}
    >
      {/* Pulsing vignette */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 50%, transparent 20%, rgba(0,0,0,${finalVignette}) 80%)`,
          pointerEvents: "none",
        }}
      />

      {/* Subtle background color shift per count */}
      <AbsoluteFill
        style={{
          background:
            frame < 20
              ? `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)`
              : frame < 40
                ? `radial-gradient(circle at 50% 50%, rgba(255,200,0,0.05) 0%, transparent 50%)`
                : frame < 55
                  ? `radial-gradient(circle at 50% 50%, rgba(255,50,0,0.08) 0%, transparent 50%)`
                  : `radial-gradient(circle at 50% 50%, rgba(0,255,0,0.06) 0%, transparent 50%)`,
          pointerEvents: "none",
        }}
      />

      {/* "3" - white (frames 0-20) */}
      <CountdownNumber
        frame={frame}
        fps={fps}
        startFrame={0}
        endFrame={20}
        label="3"
        color="white"
        glowColor="rgba(255,255,255,0.6)"
      />

      {/* "2" - amber/orange tint (frames 20-40) */}
      <CountdownNumber
        frame={frame}
        fps={fps}
        startFrame={20}
        endFrame={40}
        label="2"
        color="#FFA500"
        glowColor="rgba(255,165,0,0.6)"
      />

      {/* "1" - red tint (frames 40-55) */}
      <CountdownNumber
        frame={frame}
        fps={fps}
        startFrame={40}
        endFrame={55}
        label="1"
        color="#FF2020"
        glowColor="rgba(255,32,32,0.7)"
      />

      {/* Radial burst lines for GO! */}
      {goVisible && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: BURST_LINE_COUNT }, (_, i) => {
            const angle = (360 / BURST_LINE_COUNT) * i;
            const lineLength = interpolate(burstProgress, [0, 1], [0, 500]);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: 3,
                  height: lineLength,
                  background: `linear-gradient(to top, rgba(0,255,0,${burstOpacity}), transparent)`,
                  transform: `rotate(${angle}deg) translateY(-${lineLength / 2 + 30}px)`,
                  transformOrigin: "center bottom",
                }}
              />
            );
          })}
        </AbsoluteFill>
      )}

      {/* GO! impact ring */}
      {goVisible && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: "50%",
              border: "3px solid rgba(0,255,0,0.7)",
              transform: `scale(${interpolate(goLocalFrame, [0, 12], [0.5, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) })})`,
              opacity: interpolate(goLocalFrame, [0, 3, 10], [0, 0.7, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              boxShadow: "0 0 30px rgba(0,255,0,0.5), inset 0 0 30px rgba(0,255,0,0.3)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* GO! text */}
      {goVisible && (
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: bebasNeue,
              fontSize: 300,
              color: "#00FF00",
              transform: `scale(${goFinalScale})`,
              opacity: goOpacity,
              textShadow:
                "0 0 40px rgba(0,255,0,0.9), 0 0 80px rgba(0,255,0,0.6), 0 0 160px rgba(0,255,0,0.3)",
              lineHeight: 1,
            }}
          >
            GO!
          </div>
        </AbsoluteFill>
      )}

      {/* Screen flash on GO! */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 255, 255, ${goFlashOpacity})`,
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};

export default CountdownScene;
export { CountdownScene };
