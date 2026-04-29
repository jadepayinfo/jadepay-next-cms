import { NextPage } from "next";
import withAuth from "@/hoc/with_auth";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { CustomerInfo } from "@/model/customer";
import { Backend, initHeaderWithServerSide } from "@/lib/axios";
import ReKycCustomerForm from "@/components/feature/customer/re-kyc/ReKycCustomerForm";

interface Props {
  customerInfo: CustomerInfo | null;
}

const ReKycCustomerEdit: NextPage<Props> = (props) => {
  const { customerInfo } = props;
  return (
    <div className="p-4">
      <Breadcrumbs
        title="Re-KYC"
        items={[
          {
            label: "Re-KYC Queue",
            path: "/customer/re-kyc",
          },
          {
            label: "Customer profile",
          },
        ]}
      />
      {customerInfo ? <ReKycCustomerForm customerInfo={customerInfo} /> : null}
    </div>
  );
};

export const getServerSideProps = async (ctx: any) => {
  initHeaderWithServerSide(ctx);
  const { id, kyc_id } = ctx.query;

  const defaultValue: Props = {
    customerInfo: null,
  };
  try {
    const kycIdParam = Array.isArray(kyc_id) ? kyc_id[0] : kyc_id;
    const endpoint = kycIdParam
      ? `/api/v1/customer/getinfo-by-kyc/${id}/${kycIdParam}`
      : `/api/v1/customer/getinfo/${id}`;
    const [res_customer] = await Promise.all([
      Backend.get(endpoint),
    ]);
    const data_customer: CustomerInfo = res_customer.data.data ?? [];
    return {
      props: {
        customerInfo: data_customer,
      },
    };
  } catch (error: any) {
    return {
      props: defaultValue,
    };
  }
};

export default withAuth(ReKycCustomerEdit);
