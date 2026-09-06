import { Suspense, lazy } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import BranchHeader from "@/app/branch/BranchHeader";
import Branches from "@/app/branch/Branches";
import PageLoader from "@/app/shared/PageLoader";

// Lazy load pages
const BranchDetails = lazy(() => import("./BranchDetails/index"));
const CreateBranchPage = lazy(() => import("./CreateBranch/index"));
const EditBranchPage = lazy(() => import("./EditBranch/index"));

const BranchLayout = () => {
  return (
    <>
      <BranchHeader />
      <Outlet />
    </>
  );
};

const Branch = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<BranchLayout />}>
          <Route index element={<Branches />} />
        </Route>

        {/* Standalone Routes (No Header/Tabs) */}
        <Route path="createbranch" element={<CreateBranchPage />} />
        <Route path="branches/:branchId/edit" element={<EditBranchPage />} />
        <Route path="branches/:branchId/*" element={<BranchDetails />} />
      </Routes>
    </Suspense>
  );
};

export default Branch;
