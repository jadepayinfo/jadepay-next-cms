
export type UserInfoType = {
    // username: string;
    // role: RoleType
    Username: string;
    Name: string;
    Emial: string;
    Role: string;
}

export type UserProfile = {
    Username: string;
    Name: string;
    Emial: string;
    Role: string;
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

