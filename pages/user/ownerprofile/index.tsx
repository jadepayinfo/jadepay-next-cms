import { NextPage } from "next";
import withAuth from "@/hoc/with_auth";
import { useAuth } from "@/context/auth_context";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import StaffChangePassword from "@/components/feature/user/Form/changepassword";
import CountUp from "react-countup";

import { IconCoin, IconLock } from "@/components/icon";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import ButtonFill from "@/components/buttons/button_fill";

import { StaffInfoType } from "@/model/staff_info";

interface Props {
  balance: number;
  user: string;
}
const UserOwnerProfilePage: NextPage<Props> = (props) => {
  const { staff } = useAuth();
  const [balance, setBalance] = useState(0);
  const [changePassword, setChangePassword] = useState<
    StaffInfoType | undefined
  >();

  const initPage = useRef<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

    useEffect(() => {
    //   const getBalance = async () => {
    //     try {
    //       initPage.current = true;
    //       let params: any = {
    //         owner_id: staff?.platform_id
    //       };
    //       const res = await axios.get('/api/wallet/getwallettoken', { params });
    //       const { data } = res;
    //       setBalance(data?.balance ?? 0);
    //       setLoading(false);
    //     } catch (err: any) {
    //       console.log('err', err);
    //       setError(err.response.data.message ?? err.response.statusText);
    //     } finally {
    //       setLoading(false);
    //     }
    //   };

    //   if (loading && staff) {
    //     getBalance();
    //   }
      setLoading(false);
    }, [loading, staff]);

  const onBack = () => {
    setChangePassword(undefined);
  };

  if (changePassword != undefined) {
    return <StaffChangePassword staff={staff} onBack={onBack} />;
  }

  return (
    <>
      <div className="p-4">
        <Breadcrumbs
          title="Owner Profile"
          items={[
            {
              label: "Owner Profile",
            },
          ]}
        />
        {loading ? (
          <LoadingContent />
        ) : (
          <div className="flex flex-col gap-6 justify-center mx-auto max-w-md">
            {/* <div className="p-4 bg-[--bg-panel] border border-[--border-color] rounded-lg mt-5 ">
              <div className="flex flex-wrap justify-center items-center  ">
                <h2 className="card-title">
                  <IconCoin /> Balance
                </h2>
              </div>
              <br />
              <div className="flex flex-wrap justify-center items-center text-center">
                {error ? (
                  <p className=" text-error">{error}</p>
                ) : (
                  <h2 className="card-title text-primary">
                    <CountUp duration={0.5} end={balance} />
                  </h2>
                )}
              </div>
            </div> */}
            <div className="p-4 flex flex-col gap-2 bg-[--bg-panel] border border-[--border-color] rounded-md">
              <div className="flex flex-wrap justify-between items-center">
                <div className="font-semibold">Name :</div>
                <div>{staff?.username}</div>
              </div>
              <div className="flex flex-wrap justify-between items-center ">
                <div className="font-semibold">Role :</div>
                <div>{staff?.role?.role_name}</div>
              </div>
              <div className="flex flex-wrap justify-center items-center">
                <ButtonFill size="md" onClick={() => setChangePassword(staff)}>
                  <IconLock className="text-[16px]" />{" "}
                  <span>Change Password</span>
                </ButtonFill>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const LoadingContent = () => {
  return (
    <div className="flex flex-col gap-6 justify-center mx-auto max-w-md mt-5">
      {/* <div className="shadow rounded-lg p-5 grid gap-2 text-[--input-text] bg-[--bg-panel] border border-[--border-color]">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="flex justify-center">
              <div className="rounded-full h-8 w-8 bg-primary bg-opacity-50"></div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-center gap-4">
                <div className="h-2 w-2/6 rounded bg-primary bg-opacity-50"></div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      <div className="shadow rounded-lg p-5 grid gap-2 text-[--input-text] bg-[--bg-panel] border border-[--border-color]">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-6 py-1">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 rounded col-span-1 bg-primary bg-opacity-50"></div>
                <div className="h-2 rounded col-span-2 bg-primary bg-opacity-50"></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-2 rounded col-span-1 bg-primary bg-opacity-50"></div>
                <div className="h-2 rounded col-span-2 bg-primary bg-opacity-50"></div>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="rounded-lg w-32 h-10 bg-primary bg-opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(UserOwnerProfilePage);
