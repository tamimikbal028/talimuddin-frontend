import { FaSearch } from "react-icons/fa";

interface SearchButtonProps {
  isSearchActive: boolean;
  onClick: () => void;
  title: string;
}

const SearchButton = ({ isSearchActive, onClick, title }: SearchButtonProps) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-all md:w-auto md:gap-2 md:px-4 ${
        isSearchActive
          ? "border-2 border-blue-600 bg-blue-50 text-blue-700 shadow-md"
          : "border-2 border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
      }`}
    >
      <FaSearch className="h-4 w-4" />
      <span className="hidden font-semibold md:inline">Search</span>
    </button>
  );
};

export default SearchButton;
