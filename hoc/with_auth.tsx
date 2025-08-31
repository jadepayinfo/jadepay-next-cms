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
    const accessToken = useRef<string | undefined>(undefined);
    const initPage = useRef<boolean>(false);
    
    // State management
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { setStaff } = useAuth();
    const { setIsHamburgerMenu, verifyMenuRole, currentMenu } = useMenu();
    const initMenu = useRef<SidebarMenuType | undefined>(undefined);

    // Helper function to handle auth errors
    const handleAuthError = (errorMessage: string, redirect?: string) => {
      console.error('Auth error:', errorMessage);
      setError(errorMessage);
      setIsAuthenticated(false);
      Cookies.remove(TOKEN_APP);
      
      const redirectUrl = redirect ? `&redirect=${redirect}` : '&redirect=/login';
      router.push(`/error?message=${encodeURIComponent(errorMessage)}${redirectUrl}`);
    };

    // Verify permission with API
    const verifyPermission = async (r: NextRouter) => {
      try {
        // const info = await axios.get(`/api/staff/info`, {
        //   timeout: 10000, // 10 second timeout
        // });
        
        // console.log('Staff info:', info.data);
        // setStaff(info.data);
        
        // const hasPermission = verifyMenuRole(router.pathname, info.data);
        // if (!hasPermission) {
        //   throw new Error('Permission denied');
        // }
        
        return true;
        
      } catch (error) {
        console.error('Permission verification failed:', error);
        
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            throw new Error('Authentication error');
          } else if (error.response?.status === 403) {
            throw new Error('Permission denied');
          } else if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout');
          } else if (!error.response) {
            throw new Error('Network error - please check your connection');
          }
        }
        
        throw new Error('Authentication verification failed');
      }
    };

    // Main authentication effect
    useEffect(() => {
      const initAuth = async () => {
        try {
          setIsLoading(true);
          setError(null);
          
          const token = Cookies.get(TOKEN_APP);
          accessToken.current = token;

          if (!token) {
            throw new Error('Authentication error');
          }

          if (!initPage.current) {
            initPage.current = true;
            // Verify permission
            await verifyPermission(router);
          }
          
          setIsAuthenticated(true);
          
        } catch (error: any) {
          const errorMessage = error.message || 'Authentication error';
          
          if (errorMessage === 'Permission denied') {
            handleAuthError('Permission denied');
          } else {
            handleAuthError(errorMessage, '/login');
          }
        } finally {
          setIsLoading(false);
        }
      };

      initAuth();
    }, [router]);

    // Menu scroll effect
    useEffect(() => {
      if (initMenu.current?.menuName !== currentMenu?.menuName && currentMenu?.menuName) {
        initMenu.current = currentMenu;
        const element = document.getElementById(currentMenu.menuName);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    }, [currentMenu?.menuName]);

    // Loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="loading loading-spinner loading-lg"></div>
            <span className="text-lg text-gray-600">Verifying access...</span>
          </div>
        </div>
      );
    }

    // Error state (fallback - shouldn't reach here as we redirect)
    if (error && !isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => router.push('/login')}
                className="btn btn-primary"
              >
                Go to Login
              </button>
              <button 
                onClick={() => router.back()}
                className="btn btn-outline"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Not authenticated (fallback - shouldn't reach here)
    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="loading loading-spinner loading-lg"></div>
            <span className="text-lg text-gray-600">Redirecting...</span>
          </div>
        </div>
      );
    }

    // Authenticated - render the app
    return (
      <>
        <div className="mx-auto min-h-screen min-w-full">
          <div className="flex flex-row items-start z-[3000]">
            <div className="hidden md:flex border-r border-r-base-300">
              <Sidebar />
            </div>
            <div className="w-full flex flex-col">
              <Navbar isLogin={true} />
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
            <div className="drawer-side">
              <label
                htmlFor="my-sidebar-drawer"
                className="drawer-overlay"
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

  // Set display name for debugging
  InApp.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return InApp;
};

export interface WithAuthProps {
  // Props that will be injected by withAuth (if any)
}

export default withAuth;