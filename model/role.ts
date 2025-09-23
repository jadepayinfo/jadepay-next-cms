import { AccessType } from "./staff_info";

export type RoleListType = {
    id: string;
    role_name: string;
    access: AccessType[];
    company_id: string;
    platform_id: string;
    level: string;
}