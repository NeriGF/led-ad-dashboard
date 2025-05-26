import { Img, Sequence, staticFile, useCurrentFrame } from 'remotion';

export const MarketingVideo: React.FC<{
  story: string;
  imageUrl: string;
}> = ({ story, imageUrl }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ flex: 1, backgroundColor: 'white', padding: 80, fontSize: 40 }}>
      <h2>{story}</h2>
      <Img src={imageUrl} style={{ width: '100%', marginTop: 20 }} />
    </div>
  );
};
