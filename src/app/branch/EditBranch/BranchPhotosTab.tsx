import branchHooks from "@/hooks/useBranch";
import SharedPhotosTab from "@/app/shared/upload/SharedPhotosTab";

interface BranchPhotosTabProps {
  cover_image: string | null;
}

const BranchPhotosTab = ({ cover_image }: BranchPhotosTabProps) => {
  const { mutate: updateCover, isPending: isUpdatingCover } =
    branchHooks.useUpdateBranchCoverImage();

  const handleCoverUpload = (file: File, onSuccess: () => void) => {
    updateCover(file, {
      onSuccess,
    });
  };

  return (
    <SharedPhotosTab
      cover={{
        src: cover_image,
        title: "Cover Image",
        name: "Branch cover",
        alt: "Branch Cover",
        isPending: isUpdatingCover,
        onSubmit: handleCoverUpload,
        note: "Recommended: 1200x400px for best appearance across devices.",
      }}
    />
  );
};

export default BranchPhotosTab;
