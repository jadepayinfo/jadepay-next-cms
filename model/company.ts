import { StaffInfoType } from "./user_info";

export interface Company {
    id: string;
    name: string;
    contact_person: string;
    contact_tel: string;
    email: string;
    address: string;
    tel: string;
    platform?: Platform[];
    image?: string;
    staff?:StaffInfoType[];
    total_staff: number;
    CreatedAt?: string;
    UpdatedAt?: string;
    total_earn: number;
    total_burn: number;
}

export interface Platform {
    id: string;
    company_id: string;
    name: string;
    api_key: string;
}