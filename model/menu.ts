export type MenuType = {
    menuName: string;
    path: string;
    title: string;
    isActive: boolean;
    icon?: string;
    disable: boolean;
};

export interface SidebarMenuType extends MenuType {
    sub: MenuType[] | [];
}