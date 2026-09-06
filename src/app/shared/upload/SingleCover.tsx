import { useRef, useState, type ChangeEvent } from "react";
import { FaImage, FaSpinner } from "react-icons/fa";
import { IMAGE_ACCEPT, getImageValidationError } from "@/utils/imageUpload";
import { CoverImage } from "@/utils/components/FallbackImage";

interface SingleCoverProps {
  src?: string | null;
  name: string;
  alt?: string;
  title?: string;
  note?: string;
  isPending: boolean;
  onSubmit: (file: File, onSuccess: () => void) => void;
}

const SingleCover = ({
  src,
  name,
  alt = "Cover",
  title = "Cover Image",
  note = "Recommended: 1500x500px for best display",
  isPending,
  onSubmit,
}: SingleCoverProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearSelection = () => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = getImageValidationError(file);
    if (validationError) {
      setError(validationError);
      setPreview(null);
      event.target.value = "";
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      setPreview(readerEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    const validationError = getImageValidationError(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit(file, clearSelection);
  };

  return (
    <div className="space-y-5 rounded-lg bg-white p-5 shadow-md">
      <h2 className="text-lg font-semibold text-gray-900">
        <FaImage className="mr-2 inline text-purple-600" />
        {title}
      </h2>

      <div className="flex flex-col gap-4">
        <div className="relative">
          <div className="h-48 w-full overflow-hidden rounded-lg bg-gray-100">
            <CoverImage
              src={preview || src}
              name={name}
              alt={alt}
              className="h-full w-full object-cover"
            />
          </div>
          {preview && (
            <div className="absolute top-2 right-2 rounded-full bg-green-500 px-3 py-1 text-sm font-medium text-white">
              New Preview
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handleSelect}
          className="hidden"
        />

        {!preview ? (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border-2 border-dashed border-gray-300 px-6 py-4 text-gray-600 transition-colors hover:border-purple-400 hover:bg-purple-50"
            >
              <FaImage className="mx-auto hidden sm:inline mb-2 text-2xl text-gray-400" />
              <span className="block text-center font-medium text-black">
                Choose Cover Image
              </span>
              <span className="text-sm font-medium text-gray-500">
                JPG, JPEG, PNG or WEBP (Max 25MB)
              </span>
            </button>
            <p className="text-center text-sm font-medium text-gray-500">
              {note}
            </p>
          </>
        ) : (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition-all hover:bg-purple-700 hover:shadow-lg hover:shadow-purple-500/30 active:scale-95 disabled:bg-purple-400"
            >
              {isPending ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Uploading...
                </>
              ) : (
                "Save Cover Image"
              )}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              disabled={isPending}
              className="rounded-lg border border-red-100 bg-red-50 px-6 py-2 text-sm font-medium text-red-600 shadow-sm transition-all hover:bg-red-500 hover:text-white hover:shadow-md active:scale-95 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        )}

        {error && (
          <p className="text-center text-sm font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default SingleCover;
