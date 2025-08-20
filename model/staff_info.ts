
export type StaffInfoType = {
    username: string;
    company_id: string;
    platform_id: string;
    referral_code: string;
    role: RoleType
    status?: string;
    profile?: StaffProfile;
}

export type StaffProfile = {
    username: string;
    name: string;
    surname: string;
    dob: number;
    gender: string
}

export type RoleType = {
    id: string;
    role_name: string;
    access: AccessType[]
    level: string;
}

export type AccessType = {
    menu_id: string;
    type: string;
    menu_name: string;
}

