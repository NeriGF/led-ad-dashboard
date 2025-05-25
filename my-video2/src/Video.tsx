// src/Video.tsx
import { Composition } from 'remotion';
import { MarketingVideo } from './MarketingVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MarketingVideo"
      component={MarketingVideo}
      durationInFrames={150}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={{
        story: 'Default Story',
        imageUrl: 'https://placehold.co/400',
      }}
    />
  );
};
