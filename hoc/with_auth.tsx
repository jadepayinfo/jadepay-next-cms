import axios from 'axios';

import {
  FunctionComponent,
  useEffect,
  useRef,
  useState
} from 'react';
import { NextRouter, useRouter } from 'next/router';
import Navbar from '@/components/layout/navbar';
import { Sidebar } from '@/components/layout/sidebar';
import Cookies from 'js-cookie';
import { TOKEN_APP } from '@/lib/constant';
import { StaffInfoType } from '@/model/staff_info';
import { useAuth } from '@/context/auth_context';
import ThemeMenu from '@/components/layout/theme_menu';
import { Footer } from '@/components/layout/footer';
import { Container } from '@/components/layout/container';
import { useMenu } from '@/context/menu_context';
import { SidebarMenuType } from '@/model/menu';

const withAuth = (WrappedComponent: FunctionComponent & any) => {
  const InApp = (props: any) => {
    const router = useRouter();
    const accessToken = useRef<string>();
    const [err, setErr] = useState<Error>();
    const initPage = useRef<boolean>(false);
    // const { setStaff } = useAuth();
    const { setIsHamburgerMenu, verifyMenuRole, currentMenu } = useMenu();
    const initMenu = useRef<SidebarMenuType | undefined>();

    useEffect(() => {
       const token = Cookies.get(TOKEN_APP);
       accessToken.current = token;
      
      if (token == null || token == '') {
        router.push('/error?message=Authentication error&redirect=/login');
        return;
      }

      if (!initPage.current) {
        initPage.current = true;
      //   verifyPermission(router);
       }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      
    }, [router]);

   
    useEffect(() => {
      if (err != null) {
        if (err.message == 'Permission denined') {
          router.push('/error?message=Permission denined');
          return;
        }
        router.push('/error?message=Authentication error&redirect=/login');
        Cookies.remove(TOKEN_APP);
      }
    });

    useEffect(() => {
      if (initMenu.current?.menuName !== currentMenu?.menuName) {
        initMenu.current = currentMenu;
        document.getElementById(currentMenu!.menuName)?.scrollIntoView();
      }
    }, [currentMenu?.menuName]);


    // if (accessToken == null || currentUser == null) {
    if (accessToken == null) {
      return <div>Loading</div>;
    }
   
    return (
      <>
        <div className="mx-auto min-h-screen min-w-full">
          <div className="flex flex-row items-start z-[3000]">
            <div className="hidden md:flex  border-r border-r-base-300">
              <Sidebar />
            </div>
            <div className="w-full flex flex-col">
              <Navbar isLogin={accessToken.current ? true : false} />
              <Container>
                <WrappedComponent {...props} />
                <Footer />
              </Container>
            </div>
          </div>
          <div className="drawer">
            <input
              id="my-sidebar-drawer"
              type="checkbox"
              className="drawer-toggle"
            />
            <div className="drawer-content"></div>
            <div className="drawer-side ">
              <label
                // htmlFor="my-sidebar-drawer"
                // className="drawer-overlay"
                onClick={() => setIsHamburgerMenu(false)}
              ></label>
              <Sidebar />
            </div>
          </div>
          <ThemeMenu />
        </div>
      </>
    );
  };

  return InApp;
};

export interface WithAuthProps {
 // staffInfo: StaffInfoType;
  // accessToken: string;
  // userAdapter: string;
  // role: string;
}

// withAuth.getAccessToken = () => {
//   const accessToken = GetAccessToken();
//   return accessToken;
// };

export default withAuth;
