import { NextPage } from "next";
import withAuth from "@/hoc/with_auth";
import { useAuth } from "@/context/auth_context";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import UserChangePassword from "@/components/feature/user/Form/changepassword";
import CountUp from "react-countup";

import { IconCoin, IconLock } from "@/components/icon";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import ButtonFill from "@/components/buttons/button_fill";

import { UserInfoType } from "@/model/user_info";

interface Props {
  user: string;
}
const UserOwnerProfilePage: NextPage<Props> = (props) => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [changePassword, setChangePassword] = useState<
    UserInfoType | undefined
  >();

  const initPage = useRef<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

   

  const onBack = () => {
    setChangePassword(undefined);
  };

  if (changePassword != undefined) {
    return <UserChangePassword user={user} onBack={onBack} />;
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
          <div className="flex flex-col gap-6 justify-center mx-auto max-w-md pt-7">
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
            <div className="p-6 flex flex-col gap-4 bg-[--bg-panel] border border-[--border-color] rounded-md">
              <div className="flex items-center gap-3">
                <div className="font-semibold min-w-[80px]">Name:</div>
                <div className="flex-1">{user?.Name}</div>
              </div>
               <div className="flex items-center gap-3">
                <div className="font-semibold min-w-[80px]">Role:</div>
                <div className="flex-1">{user?.Role}</div>
              </div> 
              <div className="flex justify-center pt-2">
                <ButtonFill size="md" onClick={() => setChangePassword(user)}>
                  <IconLock className="text-[16px]" />
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
