import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Oswald";

const { fontFamily: oswald } = loadFont();

const TITLE_TEXT = "100M WORLD CHAMPIONSHIP";
const SUBTITLE_TEXT = "THE ULTIMATE SHOWDOWN";

const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Horizontal line expands from center (frames 0-10) ---
  const lineWidth = interpolate(frame, [0, 10], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const lineOpacity = interpolate(frame, [0, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Subtitle fade in (frames 15-35) ---
  const subtitleOpacity = interpolate(frame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [15, 30], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // --- Glow pulse on text (frames 35-75) ---
  const glowPulse =
    frame >= 35
      ? interpolate(
          Math.sin((frame - 35) * 0.15),
          [-1, 1],
          [10, 30]
        )
      : 10;

  // --- Bottom horizontal line ---
  const bottomLineWidth = interpolate(frame, [5, 15], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const bottomLineOpacity = interpolate(frame, [5, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Letters of the title ---
  const letters = TITLE_TEXT.split("");

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Subtle dark vignette */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.6) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        {/* Top gold horizontal rule */}
        <div
          style={{
            width: `${lineWidth}%`,
            height: 2,
            backgroundColor: "#FFD700",
            opacity: lineOpacity,
            boxShadow: "0 0 10px rgba(255,215,0,0.5)",
          }}
        />

        {/* Title: each letter animated individually */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "nowrap",
            overflow: "visible",
          }}
        >
          {letters.map((letter, i) => {
            const delay = 10 + i; // stagger: each letter delayed by 1 frame
            const letterSpring = spring({
              frame: frame - delay,
              fps,
              config: { damping: 14, stiffness: 180 },
            });
            const letterY = interpolate(letterSpring, [0, 1], [100, 0]);
            const letterOpacity = interpolate(
              frame,
              [delay, delay + 3],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }
            );

            return (
              <span
                key={i}
                style={{
                  fontFamily: oswald,
                  fontSize: 90,
                  fontWeight: 700,
                  color: "white",
                  letterSpacing: 15,
                  lineHeight: 1,
                  transform: `translateY(${letterY}px)`,
                  opacity: letterOpacity,
                  display: "inline-block",
                  textShadow: `0 0 ${glowPulse}px rgba(255,255,255,0.6), 0 0 ${glowPulse * 2}px rgba(255,215,0,0.3)`,
                  whiteSpace: "pre",
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: oswald,
            fontSize: 36,
            color: "#FFD700",
            letterSpacing: 8,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
            textShadow: `0 0 ${glowPulse * 0.8}px rgba(255,215,0,0.5)`,
            fontWeight: 400,
          }}
        >
          {SUBTITLE_TEXT}
        </div>

        {/* Bottom gold horizontal rule */}
        <div
          style={{
            width: `${bottomLineWidth}%`,
            height: 2,
            backgroundColor: "#FFD700",
            opacity: bottomLineOpacity,
            boxShadow: "0 0 10px rgba(255,215,0,0.5)",
            marginTop: 5,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

export default TitleScene;
export { TitleScene };
