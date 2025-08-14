import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/auth_context';
import { AppLogo } from '@/components/layout/app_logo';
import { DynamicIcon } from '@/components/icon/dynamic_icon';
import { cn } from '@/lib/css';
import { useMenu } from '@/context/menu_context';
import { SidebarMenuType } from '@/model/menu';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

type Props = {};

const SidebarFull = ({ menuList }: { menuList: SidebarMenuType[] }) => {
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
                      item.isActive &&
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
  const [open, setOpen] = useState(true);
  return (
    <details
      open={item.isActive || item.sub.length > 0}
      onClick={() => setOpen(!open)}
    >
      <summary
        className={cn(
          'side-menu rounded-md',
          item.isActive &&
            'bg-primary text-base-100 hover:bg-primary hover:text-base-100 focus:!bg-primary focus:!text-base-100',
          !open && 'menu-sidebar'
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
            .map((itemSub, keys) => (
              <li key={keys} id={itemSub.menuName}>
                <Link
                  href={itemSub.path}
                  className={cn(
                    'py-3 side-menu rounded-md',
                    itemSub.isActive && 'text-primary bg-primary bg-opacity-10'
                  )}
                >
                  <DynamicIcon className="text-[10px]" name="cycle" />
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
                      item.isActive &&
                        'bg-primary text-base-100 hover:bg-primary hover:text-base-100 focus:!bg-primary focus:!text-base-100'
                    )}
                  >
                    <DynamicIcon className="text-[20px]" name={item.icon!} />
                  </Link>
                )}
              </li>
            );
          })}
      </ul>
    </>
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
      <div className="flex flex-col bg-base-100 w-20">
        <AppLogo
          className="sticky top-0  bg-base-100 p-4"
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
