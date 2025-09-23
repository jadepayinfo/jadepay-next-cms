import { RawDataMenu, RawUserDataMenu } from '@/lib/menu';
import { MenuType, SidebarMenuType } from '@/model/menu';
import { AccessType, StaffInfoType } from '@/model/staff_info';
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState
} from 'react';

type MenuContextInitialState = {
  isIconMenu: boolean;
  setIsIconMenu: Dispatch<SetStateAction<boolean>>;
  isHamburgerMenu: boolean;
  setIsHamburgerMenu: Dispatch<SetStateAction<boolean>>;
  verifyMenuRole: (path: string, data: StaffInfoType) => boolean;
  sidebarMenu: SidebarMenuType[];
  userMenu: SidebarMenuType[];
  currentRole: AccessType | undefined;
  currentMenu: SidebarMenuType | undefined;
  currentPath: string;
  menuKey: any;
};

const MenuContext = createContext<MenuContextInitialState | null>(null);

export default function MenuProvider(props: { children: React.ReactNode }) {
  const { children } = props;

  const devPath = ['/component'];

  const [isIconMenu, setIsIconMenu] = useState<boolean>(false);
  const [isHamburgerMenu, setIsHamburgerMenu] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>('');

  const [sidebarMenu, setSidebarMenu] =
    useState<SidebarMenuType[]>(RawDataMenu);

  const [userMenu, setUserMenu] = useState<SidebarMenuType[]>(RawUserDataMenu);

  const [currentRole, setCurrentRole] = useState<AccessType>();
  const [currentMenu, setCurrentMenu] = useState<SidebarMenuType>();

  const [menuKey, setMenuKey] = useState<object>();

  const verifyMenuRole = (path: string, data: StaffInfoType) => {
    let hasPermission = false;
    try {
      const accessMenu = data.role.access;
      setCurrentPath(path);

      // trim action edit create
      const rolePath = filterMainAccessPlath(path);

      // เมนูที่อยู่ตรง ส่วนของ Sidebar
      const fullDataMenu = menuMappingWithRoleAccess(
        rolePath,
        RawDataMenu,
        accessMenu
      );
      setSidebarMenu(fullDataMenu);

      //  เมนูที่อยู่ตรง ส่วนของ User
      const fullMenuUser = menuUserMappingWithRoleAccess(
        rolePath,
        RawUserDataMenu,
        accessMenu
      );

      setUserMenu(fullMenuUser);

      // mapping menu key
      const menuKeyFull = mapppingMenuTitleWithKey(fullDataMenu, fullMenuUser);
      setMenuKey(menuKeyFull);

      // ค้นหา read, write role ของ เมนูต่างๆ
      if (path.indexOf('/create') !== -1 || path.indexOf('/edit') !== -1|| path.indexOf('/view') !== -1) {
        hasPermission = true;
      } else {
        hasPermission = findRoleWithMenu(accessMenu);
      }

      //is Dev Path
      if (process.env.NODE_ENV === 'development' && devPath.includes(path)) {
        hasPermission = true;
      }
    } catch (error) {
      // throw new Error("This hook must be called within 'AuthContext'");
    }
    return hasPermission;
  };

  const filterMainAccessPlath = (path: string) => {
    if (path.indexOf('/create') !== -1) {
      return path.split('/create')[0];
    }
    if (path.indexOf('/edit') !== -1) {
      return path.split('/edit')[0];
    }
    return path;
  };

  const menuMappingWithRoleAccess = (
    path: string,
    menuData: SidebarMenuType[],
    roleAccess: AccessType[]
  ) => {
    const fullDataMenu = menuData.map((item) => {
      item.isActive = path.indexOf(item.path) === 0 ? true : false;

      if (item.sub.length > 0) {
        item.disable = false;
        let checkAllDisable = true;
        const subMenu = item.sub.map((subItem) => {
          subItem.disable = !findMenuIsAccess(subItem, roleAccess);
          if (!subItem.disable) {
            checkAllDisable = subItem.disable;
          }
          subItem.isActive = path === subItem.path ? true : false;
          return subItem;
        });
        item.sub = subMenu;
        item.disable = checkAllDisable;
      } else {
        item.disable = !findMenuIsAccess(item, roleAccess);
      }
      return item;
    });

    return fullDataMenu;
  };

  const menuUserMappingWithRoleAccess = (
    path: string,
    menuData: SidebarMenuType[],
    roleAccess: AccessType[]
  ) => {
    const fullDataMenu = menuData.map((item) => {
      item.isActive = path.indexOf(item.path) === 0 ? true : false;
      item.disable = !findMenuIsAccess(item, roleAccess);
      return item;
    });

    return fullDataMenu;
  };

  const findMenuIsAccess = (item: MenuType, accessMenu: AccessType[]) => {
    let isAccess = false;
    for (let i = 0; i < accessMenu.length; i++) {
      const access = accessMenu[i];
      if (access.menu_name === item.menuName) {
        isAccess = true;
        break;
      }
    }

    return isAccess;
  };

  const findRoleWithMenu = (access: AccessType[]) => {
    const menuAll = [...sidebarMenu, ...userMenu];
    let flatDataMenu = flatMenu(menuAll);

    const menuActive = flatDataMenu.find((menu) => menu.isActive);
    const role = access.find((role) => role.menu_name === menuActive?.menuName);

    setCurrentMenu(menuActive ?? undefined);
    setCurrentRole(role ?? undefined);

    if (role) {
      return true;
    }
    return false;
  };

  const mapppingMenuTitleWithKey = (
    sidebarMenu: SidebarMenuType[],
    userMenu: any
  ) => {
    const menuAll = [...sidebarMenu, ...userMenu];
    let flatDataMenu = flatMenu(menuAll);
    let newArr: any = [];
    flatDataMenu.forEach((item) => {
      newArr[`${item.menuName}`] = item.title;
    });

    return newArr;
  };

  const flatMenu = (menuAll: SidebarMenuType[]) => {
    let data = [];
    for (let i = 0; i < menuAll.length; i++) {
      const menu = menuAll[i];
      if (menu.sub.length > 0) {
        menu.sub.map((subMenu) => {
          data.push(subMenu);
        });
      } else if (menu.menuName !== '') {
        data.push(menu);
      }
    }
    return data;
  };

  const value: MenuContextInitialState = {
    isIconMenu,
    setIsIconMenu,
    isHamburgerMenu,
    setIsHamburgerMenu,
    verifyMenuRole,
    sidebarMenu,
    userMenu,
    currentRole,
    currentPath,
    currentMenu,
    menuKey
  };

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const menuContext = useContext(MenuContext);

  if (!menuContext)
    throw new Error("This hook must be called within 'MenuContext'");

  return menuContext;
}
