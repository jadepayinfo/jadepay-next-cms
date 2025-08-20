
import { StaffInfoType } from "@/model/staff_info";
import { COMPANY_ADMIN, COMPANY_PLATFORM_ADMIN, COMPANY_PLATFORM_STAFF, ROOT } from "./constant";

export const codictionActionLevel = (
    item: StaffInfoType,
    staffUser: StaffInfoType
  ) => {
    
    if (item?.username === staffUser?.username) return true;
    if (staffUser?.username == 'root') return true;

    if (staffUser?.role?.level === ROOT) {
      if (
        item?.role?.level === COMPANY_ADMIN ||
        item?.role?.level === COMPANY_PLATFORM_ADMIN ||
        item?.role?.level === COMPANY_PLATFORM_STAFF
      ) {
        return true;
      }
    } else if (staffUser?.role?.level === COMPANY_ADMIN) {
      if (
        item?.role?.level === COMPANY_PLATFORM_ADMIN ||
        item?.role?.level === COMPANY_PLATFORM_STAFF
      ) {
        return true;
      }
    } else if (staffUser?.role?.level === COMPANY_PLATFORM_ADMIN) {
      if (item?.role?.level === COMPANY_PLATFORM_STAFF) {
        return true;
      }
    }

    return false;
  };