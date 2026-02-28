import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { Audio } from "@remotion/media";

import { IntroScene } from "./scenes/IntroScene";
import { TitleScene } from "./scenes/TitleScene";
import { CountdownScene } from "./scenes/CountdownScene";
import { RaceScene } from "./scenes/RaceScene";
import { ChampionScene } from "./scenes/ChampionScene";
import { OutroScene } from "./scenes/OutroScene";

const TRANSITION_DURATION = 30;

export const NunsCup100m: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* ═══════════════════════════════════════════════════════════
          SCENE ORCHESTRATION with transitions & light leak overlays
          ═══════════════════════════════════════════════════════════ */}
      <TransitionSeries>
        {/* Scene 1: IntroScene (0-3s) - Dark cinematic "NUNS CUP" slam */}
        <TransitionSeries.Sequence durationInFrames={90} premountFor={30}>
          <IntroScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: TitleScene (3-5.5s) - "100M WORLD CHAMPIONSHIP" reveal */}
        <TransitionSeries.Sequence durationInFrames={75} premountFor={30}>
          <TitleScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={wipe()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: CountdownScene (5.5-8s) - "3...2...1...GO!" */}
        <TransitionSeries.Sequence durationInFrames={75} premountFor={30}>
          <CountdownScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* Scene 4: RaceScene (8-19s) - Main race footage */}
        <TransitionSeries.Sequence durationInFrames={330} premountFor={30}>
          <RaceScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={linearTiming({ durationInFrames: 20 })}
        />

        {/* Scene 5: ChampionScene (19-23s) - Victory celebration */}
        <TransitionSeries.Sequence durationInFrames={120} premountFor={30}>
          <ChampionScene />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 6: OutroScene (23-25s) - Fade to black */}
        <TransitionSeries.Sequence durationInFrames={60} premountFor={30}>
          <OutroScene />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* ═══════════════════════════════════════════════════════════
          DRAMATIC AUDIO DESIGN - Layered SFX & Race Atmosphere
          ═══════════════════════════════════════════════════════════ */}

      {/* Epic dramatic cinematic background music - full duration */}
      <Audio
        src={staticFile("epic-music.mp3")}
        volume={(f) => {
          const fps = 30;
          // Fade in over 2 seconds at the start
          const fadeIn = interpolate(f, [0, 2 * fps], [0, 0.6], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          // Build intensity: louder during race (frame ~240+), peak during champion
          const build = interpolate(f, [0, 240, 500, 600, 700, 750], [0.6, 0.7, 0.9, 1.0, 0.8, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          // Combine: use the min of fadeIn and build for smooth start
          return Math.min(fadeIn, build);
        }}
      />

      {/* Deep bass drone undertone - builds tension */}
      <Audio
        src={staticFile("dramatic-bass.m4a")}
        volume={(f) => {
          const fps = 30;
          return interpolate(f, [0, 90, 240, 550, 650, 750], [0.2, 0.4, 0.6, 0.7, 0.3, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        }}
      />

      {/* Rising tension sweep - builds throughout */}
      <Audio
        src={staticFile("tension-rise.m4a")}
        volume={(f) => {
          const fps = 30;
          return interpolate(f, [0, 150, 400, 550, 600, 750], [0, 0.15, 0.4, 0.5, 0.2, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
        }}
      />

      {/* --- Race video natural audio: fades in during race, peaks, fades out --- */}
      <Sequence from={240} layout="none">
        <Audio
          src={staticFile("race.mp4")}
          volume={(f) => {
            const fps = 30;
            const fadeIn = interpolate(f, [0, 2 * fps], [0, 0.5], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const fadeOut = interpolate(f, [280, 330], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return fadeIn * fadeOut;
          }}
        />
      </Sequence>

      {/* --- INTRO SFX: Deep rumble whoosh as text slams in --- */}
      <Sequence from={20} layout="none">
        <Audio src="https://remotion.media/whoosh.wav" volume={0.6} />
      </Sequence>

      {/* --- Title scene transition whoosh --- */}
      <Sequence from={80} layout="none">
        <Audio src="https://remotion.media/whoosh.wav" volume={0.7} />
      </Sequence>

      {/* --- Title to Countdown: whip crack --- */}
      <Sequence from={155} layout="none">
        <Audio src="https://remotion.media/whip.wav" volume={0.8} />
      </Sequence>

      {/* --- Countdown "3" beat --- */}
      <Sequence from={165} layout="none">
        <Audio src="https://remotion.media/switch.wav" volume={0.5} />
      </Sequence>

      {/* --- Countdown "2" beat --- */}
      <Sequence from={185} layout="none">
        <Audio src="https://remotion.media/switch.wav" volume={0.6} />
      </Sequence>

      {/* --- Countdown "1" beat --- */}
      <Sequence from={205} layout="none">
        <Audio src="https://remotion.media/switch.wav" volume={0.7} />
      </Sequence>

      {/* --- Countdown "GO!" explosion whoosh --- */}
      <Sequence from={220} layout="none">
        <Audio src="https://remotion.media/whoosh.wav" volume={1.0} />
      </Sequence>

      {/* --- Race scene: "THEY'RE OFF" whip --- */}
      <Sequence from={300} layout="none">
        <Audio src="https://remotion.media/whip.wav" volume={0.6} />
      </Sequence>

      {/* --- Race scene: "NECK AND NECK" whoosh --- */}
      <Sequence from={420} layout="none">
        <Audio src="https://remotion.media/whoosh.wav" volume={0.5} />
      </Sequence>

      {/* --- Race scene: Finish line shutter burst --- */}
      <Sequence from={530} layout="none">
        <Audio src="https://remotion.media/shutter-modern.wav" volume={0.7} />
      </Sequence>
      <Sequence from={535} layout="none">
        <Audio src="https://remotion.media/shutter-modern.wav" volume={0.6} />
      </Sequence>

      {/* --- Champion reveal: massive whip crack --- */}
      <Sequence from={560} layout="none">
        <Audio src="https://remotion.media/whip.wav" volume={1.0} />
      </Sequence>

      {/* --- Champion scene: celebration whoosh --- */}
      <Sequence from={580} layout="none">
        <Audio src="https://remotion.media/whoosh.wav" volume={0.7} />
      </Sequence>

      {/* --- Outro: subtle page turn --- */}
      <Sequence from={680} layout="none">
        <Audio src="https://remotion.media/page-turn.wav" volume={0.4} />
      </Sequence>
    </AbsoluteFill>
  );
};
