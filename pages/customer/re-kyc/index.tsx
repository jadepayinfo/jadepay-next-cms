import { NextPage } from "next";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import ReKycPage from "@/components/feature/customer/re-kyc/ReKycPage";
import withAuth from "@/hoc/with_auth";

const CustomerReKycPage: NextPage = () => {
  return (
    <div className="p-4">
      <Breadcrumbs
        title="Re-KYC"
        items={[
          {
            label: "Customer Detail",
            path: "/customer/detail",
          },
          {
            label: "Re-KYC Queue",
          },
        ]}
      />
      <ReKycPage />
    </div>
  );
};

export default withAuth(CustomerReKycPage);
