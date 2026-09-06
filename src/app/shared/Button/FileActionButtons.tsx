import type { IconType } from "react-icons";

interface FileActionButtonProps {
  icon: IconType;
  label: string;
  onClick: () => void;
  className?: string;
}

const FileActionButton = ({
  icon: Icon,
  label,
  onClick,
  className = "",
}: FileActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-blue-100 hover:text-black ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
};

export default FileActionButton;

