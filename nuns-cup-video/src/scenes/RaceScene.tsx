import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
  Sequence,
} from "remotion";
import { Video } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Oswald";

const { fontFamily: oswald } = loadFont();

// --- Slide-in text overlay component ---
interface TextOverlayProps {
  text: string;
  startFrame: number;
  endFrame: number;
  direction: "left" | "right";
  color?: string;
  fontSize?: number;
  pulse?: boolean;
  glow?: boolean;
}

const TextOverlay: React.FC<TextOverlayProps> = ({
  text,
  startFrame,
  endFrame,
  direction,
  color = "white",
  fontSize = 72,
  pulse = false,
  glow = false,
}) => {
  const frame = useCurrentFrame();
  const duration = endFrame - startFrame;
  const holdStart = Math.floor(duration * 0.3);
  const holdEnd = Math.floor(duration * 0.7);

  const localFrame = frame - startFrame;

  if (frame < startFrame || frame > endFrame) return null;

  const offsetSign = direction === "right" ? 1 : -1;

  // Slide in
  const slideIn = interpolate(localFrame, [0, holdStart], [1200 * offsetSign, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Slide out
  const slideOut = interpolate(
    localFrame,
    [holdEnd, duration],
    [0, -1200 * offsetSign],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.cubic),
    }
  );

  const translateX = localFrame < holdEnd ? slideIn : slideOut;

  const opacity = interpolate(
    localFrame,
    [0, holdStart * 0.5, holdEnd, duration],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // Pulse scale for slow-mo text
  const pulseScale = pulse
    ? interpolate(
        Math.sin(localFrame * 0.3),
        [-1, 1],
        [0.95, 1.08],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
      )
    : 1;

  // Glow intensity for slow-mo text
  const glowShadow = glow
    ? `0 0 30px ${color}, 0 0 60px ${color}, 0 0 90px rgba(255,255,255,0.4)`
    : "";

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: oswald,
          fontSize,
          fontWeight: 700,
          color,
          transform: `translateX(${translateX}px) scale(${pulseScale})`,
          opacity,
          textShadow: [
            "-3px -3px 0 #000",
            "3px -3px 0 #000",
            "-3px 3px 0 #000",
            "3px 3px 0 #000",
            "0 0 20px rgba(0,0,0,0.8)",
            glowShadow,
          ]
            .filter(Boolean)
            .join(", "),
          letterSpacing: 4,
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const RaceScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- Timeline constants ---
  const normalEnd = 210; // Frame where normal speed ends
  const slowMoStart = 210; // Frame where slow-mo begins
  const totalFrames = 330;

  // How many seconds of source video the normal-speed segment covers
  const normalSourceSeconds = normalEnd / fps; // 210/30 = 7s of source video

  // --- Is the current frame in the slow-mo zone? ---
  const isSlowMo = frame >= slowMoStart;

  // --- Cinematic letterbox bars ---
  // Bars animate in over first 15 frames, then get thicker during slow-mo
  const barHeightNormal = interpolate(frame, [0, 15], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const barHeightSlowMo = interpolate(
    frame,
    [slowMoStart, slowMoStart + 30],
    [80, 120],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    }
  );

  const barHeight = isSlowMo ? barHeightSlowMo : barHeightNormal;

  // --- Dramatic zoom effect ---
  // Normal portion: gentle zoom from 1.0 to 1.05
  // Slow-mo portion: dramatic ramp from 1.05 to 1.25
  const zoomScale = interpolate(
    frame,
    [0, normalEnd, totalFrames],
    [1.0, 1.05, 1.25],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    }
  );

  // --- Finish line flash/strobe (frame 300-310) ---
  const flashOpacity =
    frame >= 300 && frame <= 310
      ? Math.abs(Math.sin((frame - 300) * Math.PI * 0.5)) * 0.7
      : 0;

  // --- Vignette opacity ---
  const vignetteOpacity = 0.4;

  // --- Slow-mo desaturation overlay ---
  const slowMoOverlayOpacity = interpolate(
    frame,
    [slowMoStart, slowMoStart + 20],
    [0, 0.2],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  // --- Slow-mo light flare / glow overlay ---
  const slowMoGlowOpacity = interpolate(
    frame,
    [slowMoStart, slowMoStart + 40, totalFrames - 30, totalFrames],
    [0, 0.15, 0.25, 0],
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
      {/* Video container with zoom */}
      <AbsoluteFill
        style={{
          transform: `scale(${zoomScale})`,
          transformOrigin: "center center",
        }}
      >
        {/* --- Normal speed segment: frames 0-210, plays source video from 0s --- */}
        <Sequence from={0} durationInFrames={normalEnd}>
          <Video
            src={staticFile("race.mp4")}
            volume={0}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Sequence>

        {/* --- Slow motion segment: frames 210-330, picks up where normal left off --- */}
        <Sequence from={slowMoStart} durationInFrames={totalFrames - slowMoStart}>
          <Video
            src={staticFile("race.mp4")}
            playbackRate={0.3}
            trimBefore={Math.round(normalSourceSeconds * fps)}
            volume={0}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Sequence>
      </AbsoluteFill>

      {/* Vignette overlay */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${vignetteOpacity}) 100%)`,
          pointerEvents: "none",
        }}
      />

      {/* Slow-mo desaturation overlay (semi-transparent dark blue) */}
      {isSlowMo && (
        <AbsoluteFill
          style={{
            backgroundColor: `rgba(10, 15, 40, ${slowMoOverlayOpacity})`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Slow-mo light flare / glow overlay */}
      {isSlowMo && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 60% 40%, rgba(255,255,220,${slowMoGlowOpacity}) 0%, transparent 60%)`,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Text overlays at key moments */}
      <TextOverlay
        text="ON YOUR MARKS..."
        startFrame={5}
        endFrame={35}
        direction="left"
        color="white"
        fontSize={72}
      />

      <TextOverlay
        text="THEY'RE OFF!"
        startFrame={55}
        endFrame={85}
        direction="right"
        color="white"
        fontSize={72}
      />

      <TextOverlay
        text="HERE COMES THE FINISH!"
        startFrame={180}
        endFrame={210}
        direction="right"
        color="#FF0000"
        fontSize={84}
      />

      <TextOverlay
        text="PHOTO FINISH!"
        startFrame={250}
        endFrame={300}
        direction="right"
        color="#FF0000"
        fontSize={96}
        pulse
        glow
      />

      {/* Flash/strobe at finish */}
      <AbsoluteFill
        style={{
          backgroundColor: `rgba(255, 255, 255, ${flashOpacity})`,
          pointerEvents: "none",
        }}
      />

      {/* Cinematic letterbox - top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: "#000",
          zIndex: 10,
        }}
      />

      {/* Cinematic letterbox - bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: barHeight,
          backgroundColor: "#000",
          zIndex: 10,
        }}
      />
    </AbsoluteFill>
  );
};

export default RaceScene;
export { RaceScene };
