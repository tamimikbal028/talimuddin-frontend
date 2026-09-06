import SingleAvatar from "./SingleAvatar";
import SingleCover from "./SingleCover";

interface ImageConfig {
  src: string | null;
  title?: string;
  name: string;
  alt?: string;
  isPending: boolean;
  onSubmit: (file: File, onSuccess: () => void) => void;
  note?: string;
}

interface SharedPhotosTabProps {
  avatar?: ImageConfig;
  cover: ImageConfig;
}

const SharedPhotosTab = ({ avatar, cover }: SharedPhotosTabProps) => {
  return (
    <div className="space-y-5">
      {avatar && (
        <SingleAvatar
          title={avatar.title}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          isPending={avatar.isPending}
          onSubmit={avatar.onSubmit}
          note={avatar.note}
        />
      )}

      <SingleCover
        title={cover.title}
        src={cover.src}
        name={cover.name}
        alt={cover.alt}
        isPending={cover.isPending}
        onSubmit={cover.onSubmit}
        note={cover.note}
      />
    </div>
  );
};

export default SharedPhotosTab;
