import { useAuth } from '@/context/auth_context';
import { IconMenuHamburger, IconUser } from '@/components/icon';
import { ButtonOpenThemeSetting } from './theme_menu';
import { AppLogo } from './app_logo';
import { useMenu } from '@/context/menu_context';
import Link from 'next/link';

type Props = {
  isLogin?: boolean;
};

const NavbarLogin = () => {
  return (
    <div className="navbar h-[68px] bg-base-100 px-6 border-base-300 sticky top-0 border-b">
      <div className="navbar-start">
        <ButtonOpenSidebar />
      </div>
      <div className="navbar-end">
        <div className="flex justify-center items-center gap-3">
          <ButtonOpenThemeSetting />
          <UserMenu />
        </div>
      </div>
    </div>
  );
};

const ButtonOpenSidebar = () => {
  const { isIconMenu, setIsIconMenu, currentRole } = useMenu();
  if (isIconMenu) {
    return (
      <>
        <div className="flex-none">
          <label
            className="drawer-button cursor-pointer p-2"
            onClick={() => setIsIconMenu(false)}
          >
            <IconMenuHamburger className="text-[30px]" />
          </label>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="flex-none ">
        <label
          // htmlFor="my-sidebar-drawer"
          className="drawer-button cursor-pointer p-2"
           onClick={() => setIsIconMenu(true)}
        >
          <IconMenuHamburger className="text-[30px]" />
        </label>
      </div>
    </>
  );
};

const UserMenu = () => {
  const { staff, logout } = useAuth();

  const { userMenu } = useMenu();

  return (
    <div className="dropdown dropdown-end">
      <div className="flex justify-center items-center">
        <div>{staff?.username}</div>
        <label tabIndex={0} className="btn btn-ghost btn-circle side-menu">
          <div className="aspect-square rounded-full">
            <IconUser className="text-2xl" />
          </div>
        </label>
      </div>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-[--bg-color] rounded-box w-52"
      >
        {userMenu.map((item, i) => (
          <li key={i}>
            <Link
              href={item.path}
              className="hover:bg-primary hover:text-base-100 focus:!bg-primary focus:!text-base-100"
            >
              {item.title}
            </Link>
          </li>
        ))}
        <li onClick={() => logout()}>
          <div className="hover:bg-primary hover:text-base-100 focus:!bg-primary focus:!text-base-100">
            Logout
          </div>
        </li>
      </ul>
    </div>
  );
};

const Navbar = ({ isLogin }: Props) => {
  // if (isLogin) {
    return <NavbarLogin />;
  // }

  return (
    <div className="navbar h-[68px] bg-base-100 px-6 border-base-300 sticky top-0 border-b z-[7000]">
      <div className="navbar-start">
        <AppLogo title="Jadepay" />
      </div>
    </div>
  );
};

export default Navbar;
