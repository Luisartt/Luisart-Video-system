import { SoyLuisArtChannel } from "../channels/soyluisart";
import { TemplateChannel } from "../channels/_template";

// Mounts a <Folder> per channel. Add a channel here (one folder under channels/).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <SoyLuisArtChannel />
      <TemplateChannel />
    </>
  );
};
