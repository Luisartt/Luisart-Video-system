import { SoyLuisArtChannel } from "../channels/soyluisart";

// Mounts a <Folder> per channel. Add a channel here (one folder under channels/).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <SoyLuisArtChannel />
    </>
  );
};
