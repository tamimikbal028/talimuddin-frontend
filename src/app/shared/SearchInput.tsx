import { FaSearch, FaTimes } from "react-icons/fa";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  description?: string;
  autoFocus?: boolean;
}

const SearchInput = ({
  value,
  onChange,
  placeholder = "Type to search...",
  description,
  autoFocus = true,
}: SearchInputProps) => {
  return (
    <>
      {description && (
        <div className="mb-3 flex items-center gap-3">
          <p className="text-sm font-medium text-gray-500">{description}</p>
        </div>
      )}

      <div className="relative">
        <FaSearch className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-11 pl-11 text-sm font-medium text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:outline-none"
          autoFocus={autoFocus}
        />

        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1/2 right-3 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700"
            aria-label="Clear search"
          >
            <FaTimes className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </>
  );
};

export default SearchInput;
