import { SidebarMenuType } from "@/model/menu";

export const RawDataMenu: SidebarMenuType[] = [
    {
        menuName: 'customer-support',
        path: '/customer-support',
        title: 'ติดตามเอกสาร',
        isActive: false,
        icon: 'phone',
        disable: false,
        sub: []
    },
    {
        menuName: 'dashboard',
        path: '/dashboard',
        title: 'Dashboard',
        isActive: false,
        icon: 'dash_board',
        disable: true,
        sub: [
            {
                menuName: 'register-by-month',
                path: '/dashboard/register-by-month',
                title: 'Register By Mounth',
                isActive: false,
                icon: 'document',
                disable: false,
            },
            {
                menuName: 'approve-by-month',
                path: '/dashboard/approve-by-month',
                title: 'Approve By Mounth',
                isActive: false,
                icon: 'document',
                disable: false,
            },
            {
                menuName: 'kyc-approve-by-month',
                path: '/dashboard/kyc-approve-by-month',
                title: 'KYC Approve By Mounth',
                isActive: false,
                icon: 'document',
                disable: false,
            },
        ]
    },        
    {
        menuName: 'customer',
        path: '/customer',
        title: 'Customer',
        isActive: false,
        icon: 'user',
        disable: true,
        sub: [
            {
                menuName: 'customer_detail',
                path: '/customer/detail',
                title: 'Customer Detail',
                isActive: false,
                icon: 'document',
                disable: false,
            },
            {
                menuName: 'customer_re_kyc',
                path: '/customer/re-kyc',
                title: 'Re-KYC',
                isActive: false,
                icon: 'auth-manage',
                disable: false,
            }
        ]
    },
    // {
    //     menuName: '',
    //     path: '/staff',
    //     title: 'Staff',
    //     isActive: false,
    //     icon: 'team',
    //     disable: true,
    //     sub: []
    // },    
    {
        menuName: 'notification',
        path: '/notification',
        title: 'Notification',
        isActive: false,
        icon: 'notification',
        disable: true,
        sub: []
    },
];

export const RawUserDataMenu: SidebarMenuType[] = [
    {
        menuName: 'owner_profile',
        path: '/user/ownerprofile',
        title: 'Owner Profile',
        isActive: false,
        icon: '',
        disable: false,
        sub: []
    }
];