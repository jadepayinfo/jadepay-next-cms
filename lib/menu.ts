import { SidebarMenuType } from "@/model/menu";

export const RawDataMenu: SidebarMenuType[] = [
    {
        menuName: 'dashboard',
        path: '/dashboard',
        title: 'Dashboard',
        isActive: false,
        icon: 'dash_board',
        disable: true,
        sub: [
        ]
    },        
    {
        menuName: 'customer',
        path: '/customer',
        title: 'Customer',
        isActive: false,
        icon: 'user',
        disable: true,
        sub: []
    },
    {
        menuName: '',
        path: '/staff',
        title: 'Staff',
        isActive: false,
        icon: 'team',
        disable: true,
        sub: []
    },    
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
        path: '/staff/ownerprofile',
        title: 'Owner Profile',
        isActive: false,
        icon: '',
        disable: false,
        sub: []
    }
];