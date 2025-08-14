import { NextPage } from "next";
import withAuth from "@/hoc/with_auth";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import { CustomerInfo } from "@/model/customer";
import { Backend, initHeaderWithServerSide } from "@/lib/axios";
import CustomerForm from "@/components/feature/customer/customer_form";

interface Props {
  customerInfo: CustomerInfo | null;
}
const CustomerEdit: NextPage<Props> = (props) => {
  const { customerInfo } = props;
  return (
    <>
      <div className="p-4 ">
        <Breadcrumbs
          title="Edit Customer Detail"
          items={[
            {
              label: "Customer Detail",
              path: "/customer",
            },
            {
              label: "Edit Customer Detail",
            },
          ]}
        />
         {customerInfo ? <CustomerForm customerInfo={customerInfo} /> : null}
      </div>
    </>
  );
};
export const getServerSideProps = async (ctx: any) => {
  initHeaderWithServerSide(ctx);
  const { id } = ctx.query;

  const defaultValue: Props = {
    customerInfo: null,
  };
  try {
    const [res_customer] = await Promise.all([
      Backend.get(`/api/v1/customer/getinfo/${id}`),
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
export default withAuth(CustomerEdit);
