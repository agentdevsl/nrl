import { Composition } from "remotion";
import { NunsCup100m } from "./NunsCup100m";

export const RemotionRoot = () => {
  return (
    <Composition
      id="NunsCup100m"
      component={NunsCup100m}
      durationInFrames={750}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
