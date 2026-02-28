import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Easing,
} from "remotion";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";
import { loadFont } from "@remotion/google-fonts/Oswald";

const { fontFamily: bebasNeue } = loadBebasNeue();
const { fontFamily: oswald } = loadFont();

const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();

  // --- "NUNS CUP" logo text fade in (frame 0-30) ---
  const logoOpacity = interpolate(frame, [0, 30], [0, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // --- "100M WORLD CHAMPIONSHIP 2026" fade in with delay (frame 10-30) ---
  const subtitleOpacity = interpolate(frame, [10, 30], [0, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  // --- Gold line expanding from center (frame 0-30) ---
  const lineWidth = interpolate(frame, [0, 30], [0, 400], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const lineOpacity = interpolate(frame, [0, 15], [0, 0.8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- "nunscup.com" text (appears at frame 15) ---
  const urlOpacity = interpolate(frame, [15, 25], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- Master fade out (frame 40-60) ---
  const fadeOut = interpolate(frame, [40, 60], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.quad),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* Master fade-out wrapper */}
      <AbsoluteFill
        style={{
          opacity: fadeOut,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {/* NUNS CUP logo text */}
        <div
          style={{
            fontFamily: bebasNeue,
            fontSize: 64,
            color: "white",
            opacity: logoOpacity,
            letterSpacing: 10,
            lineHeight: 1,
            marginBottom: 12,
          }}
        >
          NUNS CUP
        </div>

        {/* 100M WORLD CHAMPIONSHIP 2026 subtitle */}
        <div
          style={{
            fontFamily: oswald,
            fontSize: 28,
            color: "#FFD700",
            opacity: subtitleOpacity,
            letterSpacing: 6,
            marginBottom: 16,
          }}
        >
          100M WORLD CHAMPIONSHIP 2026
        </div>

        {/* Thin gold line expanding from center */}
        <div
          style={{
            width: lineWidth,
            height: 2,
            backgroundColor: "#FFD700",
            opacity: lineOpacity,
            borderRadius: 1,
            marginBottom: 40,
          }}
        />

        {/* nunscup.com tiny text */}
        <div
          style={{
            fontFamily: oswald,
            fontSize: 16,
            color: "rgba(255, 255, 255, 0.6)",
            opacity: urlOpacity,
            letterSpacing: 3,
          }}
        >
          nunscup.com
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default OutroScene;
export { OutroScene };
