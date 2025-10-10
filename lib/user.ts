
import { UserInfoType } from "@/model/user_info";
import { COMPANY_ADMIN, COMPANY_PLATFORM_ADMIN, COMPANY_PLATFORM_STAFF, ROOT } from "./constant";

export const codictionActionLevel = (
    item: UserInfoType,
    User: UserInfoType
  ) => {
    
    if (item?.Username === User?.Username) return true;
    if (User?.Username == 'root') return true;

    // if (User?.role?.level === ROOT) {
    //   if (
    //     item?.role?.level === COMPANY_ADMIN ||
    //     item?.role?.level === COMPANY_PLATFORM_ADMIN ||
    //     item?.role?.level === COMPANY_PLATFORM_STAFF
    //   ) {
    //     return true;
    //   }
    // } else if (User?.role?.level === COMPANY_ADMIN) {
    //   if (
    //     item?.role?.level === COMPANY_PLATFORM_ADMIN ||
    //     item?.role?.level === COMPANY_PLATFORM_STAFF
    //   ) {
    //     return true;
    //   }
    // } else if (User?.role?.level === COMPANY_PLATFORM_ADMIN) {
    //   if (item?.role?.level === COMPANY_PLATFORM_STAFF) {
    //     return true;
    //   }
    // }

    return false;
  };