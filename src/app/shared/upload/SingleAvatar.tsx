import { useRef, useState, type ChangeEvent } from "react";
import { FaCamera, FaSpinner } from "react-icons/fa";
import { IMAGE_ACCEPT, getImageValidationError } from "@/utils/imageUpload";
import { AvatarImage } from "@/utils/components/FallbackImage";

interface SingleAvatarProps {
  src?: string | null;
  name: string;
  alt?: string;
  title?: string;
  note?: string;
  isPending: boolean;
  onSubmit: (file: File, onSuccess: () => void) => void;
}

const SingleAvatar = ({
  src,
  name,
  alt = "Avatar",
  title = "Profile Picture",
  note = "Recommended: Square image around 400x400px",
  isPending,
  onSubmit,
}: SingleAvatarProps) => {
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
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        <FaCamera className="mr-2 inline text-blue-600" />
        {title}
      </h2>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="relative">
          <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-gray-200 bg-gray-100">
            <AvatarImage
              src={preview || src}
              name={name}
              alt={alt}
              className="h-full w-full object-cover"
            />
          </div>
          {preview && (
            <div className="absolute -top-2 -right-2 rounded-full bg-green-500 px-2 py-1 text-xs font-medium text-white">
              New
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3">
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={handleSelect}
            className="hidden"
          />

          {!preview ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg border-2 border-dashed border-gray-300 px-6 py-4 text-gray-600 transition-colors hover:border-blue-400 hover:bg-blue-50"
            >
              <FaCamera className="mx-auto mb-2 text-2xl text-gray-400" />
              <span className="block font-medium">Choose New Photo</span>
              <span className="text-sm font-medium text-gray-500">
                JPG, JPEG, PNG or WEBP (Max 25MB)
              </span>
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 disabled:bg-blue-400"
              >
                {isPending ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Save Avatar"
                )}
              </button>
              <button
                type="button"
                onClick={clearSelection}
                disabled={isPending}
                className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-red-600 shadow-sm transition-all hover:bg-red-500 hover:text-white hover:shadow-md active:scale-95 disabled:opacity-50"
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

          <p className="text-center text-sm font-medium text-gray-500">
            {note}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SingleAvatar;
