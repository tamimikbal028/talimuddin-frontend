import { Link } from "react-router-dom";
import type { BranchListItem } from "@/types";
import { CoverImage } from "@/utils/components/FallbackImage";

type Props = {
  branch: BranchListItem;
};

const BranchCard = ({ branch }: Props) => {
  return (
    <div className="group relative h-40 w-full overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-xs transition-all hover:border-blue-300 hover:shadow-md sm:h-36">
      <Link
        to={`/branch/branches/${branch.id}`}
        className="block h-full w-full bg-gray-100"
      >
        <CoverImage
          src={branch.cover_image}
          name={branch.name}
          alt={branch.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="absolute top-0 right-0 left-0 bg-black/80 p-3 text-white">
        <Link to={`/branch/branches/${branch.id}`} className="block">
          <p className="truncate text-2xl font-bold text-white">
            {branch.name}
          </p>
        </Link>
      </div>
    </div>
  );
};

export default BranchCard;
