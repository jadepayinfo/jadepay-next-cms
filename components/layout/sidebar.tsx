import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/auth_context';
import { AppLogo } from '@/components/layout/app_logo';
import { DynamicIcon } from '@/components/icon/dynamic_icon';
import { cn } from '@/lib/css';
import { useMenu } from '@/context/menu_context';
import { MenuType, SidebarMenuType } from '@/model/menu';
import { useMemo } from 'react';

/** path จริงจาก URL (ไม่รวม query/hash) — ใช้ asPath เพราะ pathname เป็น pattern เช่น /edit/[id] */
function useCurrentPath(): string {
  const router = useRouter();
  return useMemo(
    () => router.asPath.split('?')[0].split('#')[0],
    [router.asPath]
  );
}

function isSubMenuActive(subPath: string, currentPath: string): boolean {
  if (subPath === '/customer/detail') {
    return (
      currentPath === '/customer' ||
      currentPath.startsWith('/customer/detail') ||
      currentPath.startsWith('/customer/edit')
    );
  }
  if (subPath === '/customer/re-kyc') {
    return currentPath.startsWith('/customer/re-kyc');
  }
  return (
    currentPath === subPath || currentPath.startsWith(`${subPath}/`)
  );
}

/** หมวดแม่มี sub: active เมื่อมี sub ที่ตรง route */
function isParentMenuActive(item: SidebarMenuType, currentPath: string): boolean {
  if (item.sub.length > 0) {
    return item.sub.some(
      (sub) => !sub.disable && isSubMenuActive(sub.path, currentPath)
    );
  }
  return (
    currentPath === item.path ||
    (item.path.length > 1 && currentPath.startsWith(`${item.path}/`))
  );
}

function isFlatMenuActive(item: MenuType, currentPath: string): boolean {
  return (
    currentPath === item.path ||
    (item.path.length > 1 && currentPath.startsWith(`${item.path}/`))
  );
}

/** โหมดย่อ: ไอคอนอยู่ในกรอบคงที่ ไม่ล้น — ไม่ใช้ <details>/ข้อความ */
const sidebarIconLinkClass =
  'sidebar-icon-rail-link flex items-center justify-center shrink-0 mx-auto w-11 h-11 min-w-0 max-w-full rounded-md overflow-hidden';

const SidebarIconMenuGroup = ({
  item,
  currentPath,
}: {
  item: SidebarMenuType;
  currentPath: string;
}) => {
  const parentActive = isParentMenuActive(item, currentPath);
  const subs = item.sub.filter((s) => !s.disable);

  return (
    <li className="flex flex-col gap-1 w-full min-w-0 py-0.5">
      <Link
        href={item.path}
        className={cn(
          sidebarIconLinkClass,
          'side-menu',
          parentActive &&
            'bg-primary text-base-100 hover:bg-primary hover:text-base-100 focus:!bg-primary focus:!text-base-100'
        )}
        title={item.title}
      >
        <DynamicIcon className="text-[20px] shrink-0" name={item.icon!} />
        <span className="sr-only">{item.title}</span>
      </Link>
      {subs.map((sub) => (
        <Link
          key={sub.path}
          href={sub.path}
          className={cn(
            sidebarIconLinkClass,
            'side-menu',
            isSubMenuActive(sub.path, currentPath) &&
              'bg-primary text-base-100 hover:bg-primary hover:text-base-100 focus:!bg-primary focus:!text-base-100'
          )}
          title={sub.title}
        >
          <DynamicIcon
            className="text-[18px] shrink-0"
            name={sub.icon || 'cycle'}
          />
          <span className="sr-only">{sub.title}</span>
        </Link>
      ))}
    </li>
  );
};

const SidebarFull = ({ menuList }: { menuList: SidebarMenuType[] }) => {
  const currentPath = useCurrentPath();
  // const handleOnCompleted = useCallback(
  //   (iconName:any) => console.log(`${iconName} successfully loaded`),
  //   []
  // );
  // const handleIconError = useCallback((err:any) => console.error(err.message), []);

  return (
    <>
      <ul className="menu custom-menu bg-base-100 w-full h-[81vh] flex-nowrap overflow-y-auto scroll-ui ">
        
        {menuList
          ?.map((item, keys) => {
            return (
              <li key={keys} className="flex-none mb-2">
                {item.sub.length > 0 ? (
                  <MenuItems item={item}/>
                ) : (
                  <Link
                    id={item.menuName}
                    href={item.path}
                    className={cn(
                      'flex-none py-3 side-menu rounded-md',
                      isFlatMenuActive(item, currentPath) &&
                        'bg-primary text-base-100 hover:bg-primary hover:text-base-100 focus:!bg-primary focus:!text-base-100'
                    )}
                  >
                    <DynamicIcon className="text-[20px]" name={item.icon!} />
                    <span>{item.title}</span>
                  </Link>
                )}
              </li>
            );
          })}
      </ul>
    </>
  );
};

const MenuItems = ({
  item,
}: {
  item: SidebarMenuType;
}) => {
  const currentPath = useCurrentPath();
  const parentActive = isParentMenuActive(item, currentPath);

  return (
    <details open={parentActive}>
      <summary
        className={cn(
          'side-menu rounded-md',
          parentActive &&
            'bg-primary text-base-100 hover:bg-primary hover:text-base-100 focus:!bg-primary focus:!text-base-100',
          !parentActive && 'menu-sidebar'
        )}
      >
        <Link href={item.path} className="flex gap-2 items-center py-1">
          <DynamicIcon className="text-[20px]" name={item.icon!} />
          <span>{item.title}</span>
        </Link>
      </summary>
      {item.sub.length > 0 ? (
        <ul className="before:w-0 list-disc ml-0 flex flex-col gap-2 pt-2">
          {item.sub
            .filter((i) => !i.disable)
            .map((itemSub) => (
              <li key={itemSub.path} id={itemSub.menuName}>
                <Link
                  href={itemSub.path}
                  className={cn(
                    'py-3 side-menu rounded-md',
                    isSubMenuActive(itemSub.path, currentPath) &&
                      'text-primary bg-primary bg-opacity-10'
                  )}
                >
                  <DynamicIcon
                    className="text-[18px]"
                    name={itemSub.icon || "cycle"}
                  />
                  <span>{itemSub.title}</span>
                </Link>
              </li>
            ))}
        </ul>
      ) : null}
    </details>
  );
};


const SidebarIconMenu = ({ menuList }: { menuList: SidebarMenuType[] }) => {
  const currentPath = useCurrentPath();

  return (
    <ul className="menu custom-menu sidebar-icon-rail bg-base-100 w-full min-w-0 max-w-full h-[81vh] flex flex-col flex-nowrap items-stretch overflow-y-auto overflow-x-hidden scroll-ui px-1">
      {menuList?.map((item) => (
        <SidebarIconMenuRow
          key={item.menuName}
          item={item}
          currentPath={currentPath}
        />
      ))}
    </ul>
  );
};

const SidebarIconMenuRow = ({
  item,
  currentPath,
}: {
  item: SidebarMenuType;
  currentPath: string;
}) => {
  if (item.sub.length > 0) {
    return <SidebarIconMenuGroup item={item} currentPath={currentPath} />;
  }

  return (
    <li className="flex-none mb-1 w-full min-w-0 overflow-hidden py-0.5">
      <Link
        id={item.menuName}
        href={item.path}
        className={cn(
          sidebarIconLinkClass,
          'side-menu',
          isFlatMenuActive(item, currentPath) &&
            'bg-primary text-base-100 hover:bg-primary hover:text-base-100 focus:!bg-primary focus:!text-base-100'
        )}
        title={item.title}
      >
        <DynamicIcon className="text-[20px] shrink-0" name={item.icon!} />
        <span className="sr-only">{item.title}</span>
      </Link>
    </li>
  );
};

const LogoutButton = ({ title }: { title?: string }) => {
  const { logout } = useAuth();
  return (
    <div className="sticky bottom-0  bg-base-100">
      <ul className="menu">
        <li onClick={() => logout()}>
          <div
            className={cn(
              'flex py-3 mb-2 side-menu rounded-md',
              title ? 'justify-start' : 'justify-center'
            )}
          >
            <DynamicIcon className="text-[20px]" name="logout" />
            {title ? <span>{title}</span> : null}
          </div>
        </li>
      </ul>
    </div>
  );
};

export const Sidebar = () => {
  
  const { isIconMenu, setIsIconMenu, sidebarMenu } = useMenu();
  const onIconMenu = (value: boolean) => {
    setIsIconMenu(value);
  };

  // console.log('sidebarMenu',sidebarMenu)
  if (isIconMenu) {
    return (
      <div className="flex flex-col bg-base-100 w-20 min-w-[5rem] max-w-[5rem] overflow-x-hidden shrink-0">
        <AppLogo
          className="sticky top-0 bg-base-100 p-4 min-w-0 overflow-hidden"
          onIconMenu={onIconMenu}
        />
        <SidebarIconMenu menuList={sidebarMenu} />
        <LogoutButton />
      </div>
    );
  }
  return (
    <div className="flex flex-col bg-base-100 w-52 lg:w-64 ">
      <AppLogo
        className="sticky top-0  bg-base-100 p-4"
        title=""
        onIconMenu={onIconMenu}
      />
      <SidebarFull menuList={sidebarMenu} />
      <LogoutButton title="Logout" />
    </div>
  );
};
